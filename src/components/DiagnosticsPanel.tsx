"use client";

import { useEffect, useState } from "react";
import axios from "axios";

function getNumberFromUnknown(x: unknown): number {
  if (typeof x === "number") return x;
  if (typeof x === "string" && !isNaN(Number(x))) return Number(x);
  if (typeof x === "object" && x !== null) {
    const y = x as Record<string, unknown>;
    if ("credits" in y) {
      const v = y.credits;
      if (typeof v === "number") return v;
      if (typeof v === "string" && !isNaN(Number(v))) return Number(v);
    }
    if ("value" in y) {
      const v = y.value;
      if (typeof v === "number") return v;
      if (typeof v === "string" && !isNaN(Number(v))) return Number(v);
    }
  }
  return 0;
}

type DiagEntry = {
  endpoint?: string;
  method?: string;
  ok?: boolean;
  latency?: number;
  error?: string;
};

type CreditsFetchInfo = {
  fetched?: boolean;
  count?: number;
  rawSample?: unknown[];
  sample?: unknown[];
};

type CreditsSummary = {
  fetched: boolean;
  count: number;
  sample?: Array<[string, number]>;
} | null;

export default function DiagnosticsPanel({
  pollInterval = 60000,
}: {
  pollInterval?: number;
}) {
  const [diag, setDiag] = useState<DiagEntry[]>([]);
  const [creditsSummary, setCreditsSummary] = useState<CreditsSummary>(null);
  const [loading, setLoading] = useState(true);
  const [last, setLast] = useState<string>("-");

  async function fetchDiag() {
    setLoading(true);
    try {
      const res = await axios.get("/api/pnodes?diagnostics=1", {
        timeout: 5000,
      });
      const j = res.data;
      const diagnostics = (j.diagnostics ?? []) as unknown[];
      setDiag(
        diagnostics
          .filter((d) => {
            if (!d || typeof d !== "object") return false;
            const rec = d as Record<string, unknown>;
            // skip credits payloads or entries without endpoint/method
            if ("credits" in rec) return false;
            if ("creditsFetchInfo" in rec) return false;
            const ep = String(rec.endpoint ?? "").trim();
            const m = String(rec.method ?? "").trim();
            return ep !== "" || m !== "";
          })
          .map((d) => {
            const r = d as Record<string, unknown>;
            return {
              endpoint: String(r.endpoint ?? ""),
              method: String(r.method ?? ""),
              ok: Boolean(r.ok ?? false),
              latency: Number(r.latency ?? 0),
              error: String(r.error ?? ""),
            } as DiagEntry;
          })
      );

      // extract creditsFetchInfo or credits summary from diagnostics
      const credEntry = diagnostics.find(
        (d) =>
          d &&
          typeof d === "object" &&
          ("credits" in (d as Record<string, unknown>) ||
            "creditsFetchInfo" in (d as Record<string, unknown>))
      );
      if (credEntry && typeof credEntry === "object") {
        const rec = credEntry as Record<string, unknown>;
        const cf =
          (rec.creditsFetchInfo as CreditsFetchInfo | undefined) ??
          (rec.credits as CreditsFetchInfo | undefined) ??
          null;
        if (cf) {
          const sampleRaw = cf.rawSample ?? cf.sample ?? undefined;
          const s = Array.isArray(sampleRaw)
            ? sampleRaw.slice(0, 5)
            : undefined;

          const samplePairs: Array<[string, number]> | undefined = s
            ? s.map((item) => {
                if (Array.isArray(item) && item.length >= 2)
                  return [String(item[0]), Number(item[1] ?? 0)];
                if (item && typeof item === "object") {
                  const r = item as Record<string, unknown>;
                  const k = String(
                    r.pod_id ?? r.pubkey ?? r.pod ?? r.pod_pubkey ?? r.id ?? ""
                  );
                  const v = getNumberFromUnknown(
                    r.credits ?? r.value ?? r.amount ?? 0
                  );
                  return [k, v];
                }
                const s = String(item).split(":");
                return [s[0] ?? "", Number(s[1] ?? 0)];
              })
            : undefined;

          setCreditsSummary({
            fetched: Boolean(cf.fetched ?? false),
            count: Number(cf.count ?? 0),
            sample: samplePairs,
          });
        }
      } else {
        setCreditsSummary(null);
      }

      setLast(new Date().toLocaleTimeString());
    } catch {
      setDiag([]);
      setCreditsSummary(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDiag();
    const id = setInterval(fetchDiag, pollInterval);
    return () => clearInterval(id);
  }, [pollInterval]);
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 w-full max-w-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Diagnostics</h3>
        <div className="text-sm text-white/40">Last: {last}</div>
      </div>

      {loading ? (
        <div className="text-sm text-white/40">Loading diagnostics...</div>
      ) : (
        <div className="space-y-2">
          {creditsSummary && (
            <div className="mb-2 rounded border border-white/5 p-2 text-sm text-white/60">
              <div>
                Credits fetched: {creditsSummary.fetched ? "yes" : "no"}
              </div>
              <div>Credits count: {creditsSummary.count}</div>
              {creditsSummary.sample && (
                <div className="mt-1 text-xs text-white/40">
                  Sample:{" "}
                  {creditsSummary.sample
                    .slice(0, 5)
                    .map(([k, v]) => `${k}:${v}`)
                    .join(", ")}
                </div>
              )}
            </div>
          )}

          {diag.length === 0 && (
            <div className="text-sm text-white/40">
              No diagnostics available
            </div>
          )}
          {diag.map((d, i) => (
            <div
              key={`${d.endpoint ?? "ep"}-${d.method ?? "m"}-${i}`}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${
                    d.ok ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <div className="text-sm text-white/60">
                  {d.method} @ {d.endpoint}
                </div>
              </div>
              <div className="text-sm text-white/40">
                {d.ok ? `${d.latency} ms` : d.error}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
