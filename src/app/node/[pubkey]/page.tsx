"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PNode } from "@/types/pnode";
import {
  fetchPNodes,
  formatBytes,
  formatUptime,
  getNodeStatus,
  formatTimeAgo,
} from "@/lib/api";

// Generate mock historical data for the node
function generateHistoricalData() {
  const data = [];
  for (let i = 24; i >= 0; i--) {
    data.push({
      time: `${i}h ago`,
      storage: Math.random() * 30 + 20,
      latency: Math.random() * 50 + 10,
    });
  }
  return data;
}

export default function NodeDetailPage() {
  const params = useParams();
  const pubkey = params.pubkey as string;
  const [node, setNode] = useState<PNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [historicalData] = useState(generateHistoricalData);

  useEffect(() => {
    async function loadNode() {
      const result = await fetchPNodes();
      const nodes = Array.isArray(result.nodes)
        ? (result.nodes as PNode[])
        : Array.isArray(result as unknown as PNode[])
        ? (result as unknown as PNode[])
        : [];
      const found = nodes.find((n: PNode) => {
        const pk = (n.pubkey ?? "") as string;
        return pk === pubkey || pk.startsWith(pubkey);
      });
      setNode(found || null);
      setLoading(false);
    }
    loadNode();
  }, [pubkey]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (!node) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-950">
        <h1 className="text-2xl font-bold text-white">pNode Not Found</h1>
        <p className="text-white/60">The requested pNode could not be found.</p>
        <Link
          href="/"
          className="rounded-lg bg-purple-600 px-6 py-2 text-white hover:bg-purple-700"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const status = getNodeStatus(node.last_seen_timestamp);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-gray-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/60 hover:text-white"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Link>
          <div className="h-6 w-px bg-white/20" />
          <h1 className="text-lg font-bold text-white">pNode Details</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Node Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-xl border border-white/10 bg-linear-to-br from-purple-900/20 to-cyan-900/20 p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div
                  className={`h-4 w-4 rounded-full ${
                    status === "online"
                      ? "bg-green-500"
                      : status === "warning"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                />
                <span className="text-sm font-medium capitalize text-white/60">
                  {status}
                </span>
                {node.is_public && (
                  <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                    Public Node
                  </span>
                )}
              </div>
              <h2 className="mb-1 font-mono text-2xl font-bold text-white">
                {node.pubkey}
              </h2>
              <p className="text-white/60">{node.address}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/40">Version</div>
              <div className="font-mono text-xl font-bold text-purple-400">
                v{node.version}
              </div>
              <div className="mt-2 text-sm text-white/40">Credits</div>
              <div className="font-mono text-lg font-bold text-amber-400">
                {(node.credits ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-white/10 bg-white/5 p-6"
          >
            <div className="mb-2 text-sm text-white/60">Storage Committed</div>
            <div className="text-3xl font-bold text-cyan-400">
              {formatBytes(node.storage_committed ?? 0)}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-white/10 bg-white/5 p-6"
          >
            <div className="mb-2 text-sm text-white/60">Storage Used</div>
            <div className="text-3xl font-bold text-orange-400">
              {formatBytes(node.storage_used ?? 0)}
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${
                  (node.storage_usage_percent ?? 0) > 80
                    ? "bg-red-500"
                    : (node.storage_usage_percent ?? 0) > 50
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{
                  width: `${Math.min(100, node.storage_usage_percent ?? 0)}%`,
                }}
              />
            </div>
            <div className="mt-1 text-right text-sm text-white/40">
              {(node.storage_usage_percent ?? 0).toFixed(2)}%
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-white/10 bg-white/5 p-6"
          >
            <div className="mb-2 text-sm text-white/60">Uptime</div>
            <div className="text-3xl font-bold text-purple-400">
              {formatUptime(node.uptime)}
            </div>
            <div className="mt-1 text-sm text-white/40">
              {Math.floor(node.uptime / 86400)} days
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-white/10 bg-white/5 p-6"
          >
            <div className="mb-2 text-sm text-white/60">Last Seen</div>
            <div className="text-3xl font-bold text-green-400">
              {formatTimeAgo(node.last_seen_timestamp)}
            </div>
            <div className="mt-1 text-sm text-white/40">
              RPC Port: {node.rpc_port}
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border border-white/10 bg-white/5 p-6"
          >
            <h3 className="mb-4 text-lg font-semibold text-white">
              Storage Usage (24h)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="time" stroke="#666" />
                  <YAxis stroke="#666" unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="storage"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border border-white/10 bg-white/5 p-6"
          >
            <h3 className="mb-4 text-lg font-semibold text-white">
              Response Latency (24h)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="time" stroke="#666" />
                  <YAxis stroke="#666" unit="ms" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="latency"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Node Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6"
        >
          <h3 className="mb-4 text-lg font-semibold text-white">
            Node Information
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-black/30 p-4">
              <div className="mb-1 text-sm text-white/40">Public Key</div>
              <div className="break-all font-mono text-sm text-white">
                {node.pubkey}
              </div>
            </div>
            <div className="rounded-lg bg-black/30 p-4">
              <div className="mb-1 text-sm text-white/40">Network Address</div>
              <div className="font-mono text-sm text-white">{node.address}</div>
            </div>
            <div className="rounded-lg bg-black/30 p-4">
              <div className="mb-1 text-sm text-white/40">RPC Endpoint</div>
              <div className="font-mono text-sm text-white">
                http://{node.address.split(":")[0]}:{node.rpc_port}/rpc
              </div>
            </div>
            <div className="rounded-lg bg-black/30 p-4">
              <div className="mb-1 text-sm text-white/40">Visibility</div>
              <div className="text-sm text-white">
                {node.is_public ? "Public" : "Private"}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
