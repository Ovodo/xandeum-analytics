import { NextRequest, NextResponse } from "next/server";
import axios from 'axios';
import { PNode } from '@/types/pnode';

// pRPC endpoints to try (user-provided public IPs + known endpoints)
const PRPC_ENDPOINTS = [
  // user-provided IPs
  "http://173.212.203.145:6000",
  "http://173.212.220.65:6000",
  "http://161.97.97.41:6000",
  "http://192.190.136.36:6000",
  "http://192.190.136.37:6000",
  "http://192.190.136.38:6000",
  "http://192.190.136.28:6000",
  "http://192.190.136.29:6000",
  "http://207.244.255.1:6000",
  // fallback known endpoints
  "http://109.199.96.218:6000",
];
type creditsDataType = {
  pod_id: string;
  credits: number;
}
// Simple in-memory cache (server runtime)
const NODE_CACHE_TTL = 60 * 1000; // 60 seconds
const CREDITS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let nodeCache: { nodes: unknown[]; source: string; ts: number } | null = null;
let creditsCache: { map: Record<string, number>; ts: number } | null = null;


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const diagnosticsRequested = searchParams.get('diagnostics') === '1' || searchParams.get('diagnostics') === 'true';

  const diagnostics: Array<Record<string, unknown>> = [];
  const errors: string[] = [];
  // helper to only add meaningful diagnostic entries
  const pushDiag = (d: Record<string, unknown> | null | undefined) => {
    if (!d) return;
    try {
      if (Object.keys(d).length === 0) return;
    } catch {
      return;
    }
    diagnostics.push(d);
  };
  const methodsToTry = ["get-pods-with-stats"]; // prefer full stats
  // const methodsToTry = ["get-pods"]; // prefer full stats

  // Return cached nodes if available and fresh (unless diagnostics explicitly requested)
  const now = Date.now();
  if (nodeCache && (now - nodeCache.ts) < NODE_CACHE_TTL && !diagnosticsRequested) {
    return NextResponse.json({ success: true, data: nodeCache.nodes, source: nodeCache.source, cached: true });
  }

  // Try each endpoint and method, collecting diagnostics
  for (const endpoint of PRPC_ENDPOINTS) {
    // skip empty endpoints
    if (!endpoint || String(endpoint).trim() === "") continue;
    const rpcUrl = endpoint.includes('/rpc') ? endpoint : `${endpoint}/rpc`;

    for (const method of methodsToTry) {
      const start = Date.now();
      try {
        const axiosRes = await axios.post(rpcUrl, {
          jsonrpc: '2.0',
          method,
          id: 1,
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000,
        });

        const latency = Date.now() - start;
        pushDiag({ endpoint, method, ok: true, latency });

        const data = axiosRes.data as { result?: { pods: PNode[], total_count: number } };
        const rr = data?.result;
        const nodes = rr?.pods

        if (nodes && nodes.length > 0) {
          let finalNodes = nodes;


          // Fetch pod credits (cached), with robust parsing and diagnostics
          let creditsMap: Record<string, number> = {};
          let creditsFetchInfo: { fetched: boolean; count: number; rawSample?: creditsDataType[] } = { fetched: false, count: 0 };
          if (creditsCache && (now - creditsCache.ts) < CREDITS_CACHE_TTL) {
            creditsMap = creditsCache.map;
            creditsFetchInfo = { fetched: true, count: Object.keys(creditsMap).length };
          } else {
            try {
              const credRes = await axios.get('https://podcredits.xandeum.network/api/pods-credits', { timeout: 5000 });
              let credData: unknown = credRes.data;

              let rawSample: creditsDataType[] = [];
              const cd = credData as Record<string, unknown>;
              credData = (cd.pods_credits as creditsDataType[] | undefined)

              if (Array.isArray(credData)) {
                rawSample = (credData).slice(0, 10);
                for (const it of credData) {
                  if (it && typeof it === 'object') {
                    const pub = it.pod_id
                    const val = it.credits
                    if (pub) creditsMap[pub] = val;
                  }
                }
              }

              creditsCache = { map: creditsMap, ts: Date.now() };
              creditsFetchInfo = { fetched: true, count: Object.keys(creditsMap).length, rawSample };
            } catch {
              // don't break — keep creditsMap empty
              creditsFetchInfo = { fetched: false, count: 0 };
            }
          }

          // Merge credits into nodes
          finalNodes = finalNodes.map(n => ({ ...n, credits: creditsMap[String(n.pubkey ?? '')] ?? 0 }));

          // Add credits fetch diagnostics and sample if requested
          if (diagnosticsRequested) {
            const sample = Object.entries(creditsMap).slice(0, 10);
            pushDiag({ creditsFetchInfo: { ...creditsFetchInfo, sample } });
          }

          // Cache the result and return (filter out any empty diagnostic entries)
          nodeCache = { nodes: finalNodes, source: endpoint, ts: Date.now() };
          const filteredDiagnostics = diagnostics.filter(d => {
            if (!d || Object.keys(d).length === 0) return false;
            // remove entries where every value is empty/falsy (empty strings, 0, false, null/undefined)
            const vals = Object.values(d);
            const anyMeaningful = vals.some(v => {
              if (v === null || v === undefined) return false;
              if (typeof v === 'string') return v.trim() !== '';
              if (typeof v === 'boolean') return v === true;
              if (typeof v === 'number') return v !== 0;
              // objects/arrays considered meaningful
              return true;
            });
            return anyMeaningful;
          });

          return NextResponse.json({ success: true, data: finalNodes, source: endpoint, diagnostics: filteredDiagnostics, cached: false });
        }

      } catch (err: unknown) {
        console.log(err, "err")
        const latency = Date.now() - start;
        pushDiag({ endpoint, method, ok: false, latency, error: (err as Error)?.message ?? String(err) });
        const msg = (err as Error)?.message ?? String(err);
        errors.push(`${endpoint} (${method}): ${msg}`);
        continue;
      }
    }
  }

  // If all endpoints fail, return mock data indicator and diagnostics
  const filteredDiagnostics = diagnostics.filter(d => {
    if (!d || Object.keys(d).length === 0) return false;
    const vals = Object.values(d);
    const anyMeaningful = vals.some(v => {
      if (v === null || v === undefined) return false;
      if (typeof v === 'string') return v.trim() !== '';
      if (typeof v === 'boolean') return v === true;
      if (typeof v === 'number') return v !== 0;
      return true;
    });
    return anyMeaningful;
  });

  return NextResponse.json({
    success: false,
    useMockData: true,
    errors,
    diagnostics: filteredDiagnostics,
    message: "All pRPC endpoints unavailable, using mock data",
  });
}