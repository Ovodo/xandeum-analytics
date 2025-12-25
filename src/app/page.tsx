"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  PNode,
  NetworkStats,
  VersionDistribution,
  UptimeChartData,
} from "@/types/pnode";
import {
  fetchPNodes,
  calculateNetworkStats,
  getVersionDistribution,
  getUptimeDistribution,
  getStorageDistribution,
  formatBytes,
  formatUptime,
  getNodeStatus,
  formatTimeAgo,
} from "@/lib/api";

// Live pNode was moved to diagnostics page — no client-side dynamic import here anymore

const COLORS = [
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
];

export default function Home() {
  const [nodes, setNodes] = useState<PNode[]>([]);
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [versionDist, setVersionDist] = useState<VersionDistribution[]>([]);
  const versionPieData = versionDist.map((v) => ({
    name: `v${v.version}`,
    value: v.count,
    percentage: v.percentage,
  }));
  const [uptimeDist, setUptimeDist] = useState<UptimeChartData[]>([]);
  const [storageDist, setStorageDist] = useState<
    { name: string; value: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"uptime" | "storage" | "usage">(
    "storage"
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "online" | "warning" | "offline"
  >("all");
  const [tableLoading, setTableLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [debouncedSortBy, setDebouncedSortBy] = useState(sortBy);
  const [debouncedFilterStatus, setDebouncedFilterStatus] =
    useState(filterStatus);
  const [isLiveData, setIsLiveData] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const result = await fetchPNodes();
      setNodes(result.nodes);
      setIsLiveData(result.isLive);

      setStats(calculateNetworkStats(result.nodes));
      setVersionDist(getVersionDistribution(result.nodes));
      setUptimeDist(getUptimeDistribution(result.nodes));
      setStorageDist(getStorageDistribution(result.nodes));
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to fetch pNode data");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadData();
    })();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Debounce filter/search/sort to show a loading indicator while filtering
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setDebouncedFilterStatus(filterStatus);
      setDebouncedSortBy(sortBy);
      setTableLoading(false);
    }, 220);
    return () => clearTimeout(t);
  }, [searchQuery, filterStatus, sortBy]);

  // Filter and sort nodes
  const filteredNodes = nodes
    .filter((node) => {
      const pub = (node.pubkey ?? "").toLowerCase();
      const addr = (node.address ?? "").toLowerCase();
      const q = debouncedSearch.toLowerCase();
      const matchesSearch = pub.includes(q) || addr.includes(q);
      const status = getNodeStatus(node.last_seen_timestamp);
      const matchesStatus =
        debouncedFilterStatus === "all" || status === debouncedFilterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (debouncedSortBy) {
        case "uptime":
          return b.uptime - a.uptime;
        case "usage":
          return (
            (b.storage_usage_percent ?? 0) - (a.storage_usage_percent ?? 0)
          );
        default:
          return (b.storage_committed ?? 0) - (a.storage_committed ?? 0);
      }
    });

  const refreshData = () => {
    setLoading(true);
    loadData();
    toast.success("Data refreshed!");
  };

  if (loading && nodes.length === 0) {
    return <LoadingIndicator />;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Demo Mode Banner */}
      {!isLiveData && nodes.length > 0 && (
        <div className="bg-linear-to-r from-orange-600 to-amber-600 px-4 py-2 text-center text-sm font-medium text-white">
          🔧 Demo Mode: Showing simulated pNode data. Connect to a live Xandeum
          pRPC endpoint for real data.
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-purple-600 to-cyan-500">
              <span className="text-xl font-bold">X</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Xandeum Analytics
              </h1>
              <p className="text-xs text-white/40">pNode Network Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Live/Demo indicator */}
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                isLiveData
                  ? "bg-green-500/20 text-green-400"
                  : "bg-orange-500/20 text-orange-400"
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  isLiveData ? "bg-green-500 animate-pulse" : "bg-orange-500"
                }`}
              />
              {isLiveData ? "Live" : "Demo"}
            </div>
            {lastUpdated && (
              <span className="text-sm text-white/40">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Link
              href="/diagnostics"
              className="rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/5"
            >
              Diagnostics
            </Link>
            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats Cards */}
        <section className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6"
          >
            <StatCard
              label="Total pNodes"
              value={stats?.totalNodes || 0}
              icon="🖥️"
              color="purple"
            />
            <StatCard
              label="Active Nodes"
              value={stats?.activeNodes || 0}
              icon="✅"
              color="green"
              subtext={`${
                stats
                  ? Math.round((stats.activeNodes / stats.totalNodes) * 100)
                  : 0
              }% online`}
            />
            <StatCard
              label="Total Storage"
              value={formatBytes(stats?.totalStorage || 0)}
              icon="💾"
              color="cyan"
            />
            <StatCard
              label="Used Storage"
              value={formatBytes(stats?.usedStorage || 0)}
              icon="📊"
              color="orange"
              subtext={`${stats?.avgStorageUsage || 0}% avg usage`}
            />
            <StatCard
              label="Avg Uptime"
              value={formatUptime(stats?.avgUptime || 0)}
              icon="⏱️"
              color="pink"
            />
            <StatCard
              label="Network Health"
              value={
                stats && stats.activeNodes / stats.totalNodes > 0.8
                  ? "Good"
                  : "Warning"
              }
              icon="💚"
              color={
                stats && stats.activeNodes / stats.totalNodes > 0.8
                  ? "green"
                  : "yellow"
              }
            />
          </motion.div>
        </section>

        {/* Charts Section */}
        <section className="mb-8 grid gap-6 lg:grid-cols-3">
          {/* Storage Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-white/10 bg-white/5 p-6"
          >
            <h3 className="mb-4 text-lg font-semibold text-white">
              Top Storage Providers
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={storageDist} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    type="number"
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(v) => formatBytes(Number(v))}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#666"
                    fontSize={12}
                    width={80}
                    interval={0}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                    }}
                    formatter={(value: number) => [
                      formatBytes(Number(value)),
                      "Storage",
                    ]}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Version Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-white/10 bg-white/5 p-6"
          >
            <h3 className="mb-4 text-lg font-semibold text-white">
              Version Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer
                width="100%"
                height="100%"
                style={{ overflow: "visible" }}
              >
                <PieChart>
                  <Pie
                    data={versionPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    fontSize={12}
                    label={({
                      payload,
                    }: {
                      payload?: { name?: string; percentage?: number };
                    }) =>
                      payload ? `${payload.name} (${payload.percentage}%)` : ""
                    }
                  >
                    {versionPieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    itemStyle={{ color: "whitesmoke" }}
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "2px solid #374151",
                      borderRadius: "10px",
                      fontSize: 12,
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Uptime Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-white/10 bg-white/5 p-6"
          >
            <h3 className="mb-4 text-lg font-semibold text-white">
              Uptime Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={uptimeDist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="range" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "2px solid #374151",
                      borderRadius: "10px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </section>

        {/* Nodes Table */}
        <section>
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold text-white">pNode List</h2>
            <div className="flex flex-wrap gap-3">
              {/* Search */}
              <input
                type="text"
                placeholder="Search by pubkey or address..."
                value={searchQuery}
                onChange={(e) => {
                  setTableLoading(true);
                  setSearchQuery(e.target.value);
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-purple-500 focus:outline-none"
              />
              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => {
                  setTableLoading(true);
                  setFilterStatus(e.target.value as typeof filterStatus);
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="warning">Warning</option>
                <option value="offline">Offline</option>
              </select>
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => {
                  setTableLoading(true);
                  setSortBy(e.target.value as typeof sortBy);
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="storage">Sort by Storage</option>
                <option value="uptime">Sort by Uptime</option>
                <option value="usage">Sort by Usage</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
            >
              {/* Table Header */}
              <div className="grid grid-cols-8 gap-4 border-b border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white/60">
                <div>Status</div>
                <div>Pubkey</div>
                <div>Address</div>
                <div className="text-right">Storage</div>
                <div className="text-right">Usage</div>
                <div className="text-right">Credits</div>
                <div className="text-right">Uptime</div>
                <div className="text-right">Last Seen</div>
              </div>

              {/* Table Rows */}
              <AnimatePresence>
                {filteredNodes.map((node, i) => {
                  const status = getNodeStatus(node.last_seen_timestamp);
                  const hasPubkey = !!node.pubkey;
                  const rowKey = `${
                    node.pubkey ?? node.address ?? `node`
                  }-${i}`;
                  const href = hasPubkey
                    ? `/node/${encodeURIComponent(node.pubkey as string)}`
                    : undefined;
                  const RowWrapper: React.ElementType = hasPubkey
                    ? Link
                    : "div";
                  const rowProps = hasPubkey ? { href } : {};
                  return (
                    <RowWrapper key={rowKey} {...rowProps}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: i * 0.02 }}
                        className={`grid ${
                          hasPubkey ? "cursor-pointer" : ""
                        } grid-cols-8 gap-4 px-6 py-4 ${
                          i < filteredNodes.length - 1
                            ? "border-b border-white/5"
                            : ""
                        } hover:bg-white/5`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-3 w-3 rounded-full ${
                              status === "online"
                                ? "bg-green-500"
                                : status === "warning"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span className="text-xs capitalize text-white/60">
                            {status}
                          </span>
                        </div>
                        <div className="font-mono text-sm text-white">
                          {node.pubkey
                            ? `${(node.pubkey as string).slice(0, 4)}...${(
                                node.pubkey as string
                              ).slice(-4)}`
                            : "—"}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-white/70">
                            {node.address.split(":")[0]}
                          </span>
                          {node.is_public && (
                            <span className="rounded bg-green-500/20 px-1.5 py-0.5 text-xs text-green-400">
                              Public
                            </span>
                          )}
                        </div>
                        <div className="text-right font-mono text-sm text-cyan-400">
                          {formatBytes(node.storage_committed ?? 0)}
                        </div>
                        <div className="text-right">
                          <div className="mb-1 font-mono text-sm text-white">
                            {formatBytes(node.storage_used ?? 0)}
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full ${
                                (node.storage_usage_percent ?? 0) > 80
                                  ? "bg-red-500"
                                  : (node.storage_usage_percent ?? 0) > 50
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  node.storage_usage_percent ?? 0
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-right font-mono text-sm text-amber-400">
                          {(node.credits ?? 0).toLocaleString()}
                        </div>
                        <div className="text-right font-mono text-sm text-purple-400">
                          {formatUptime(node.uptime ?? 0)}
                        </div>
                        <div className="text-right text-sm text-white/60">
                          {formatTimeAgo(node.last_seen_timestamp ?? 0)}
                        </div>
                      </motion.div>
                    </RowWrapper>
                  );
                })}
              </AnimatePresence>

              {filteredNodes.length === 0 && (
                <div className="py-12 text-center text-white/40">
                  No pNodes found matching your criteria
                </div>
              )}
            </motion.div>

            {tableLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <div className="text-sm text-white/80">Filtering...</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/40">
          <p>
            Built for the Xandeum Hackathon •{" "}
            <a
              href="https://docs.xandeum.network"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              Documentation
            </a>{" "}
            •{" "}
            <a
              href="https://discord.gg/uqRSmmM5m"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              Discord
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}

// Modern animated loading indicator used on initial load
function LoadingIndicator({
  message = "Loading pNode data...",
}: {
  message?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <motion.svg
          width={96}
          height={96}
          viewBox="0 0 100 100"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
        >
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="url(#grad)"
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray="170"
            strokeDashoffset="40"
            opacity={0.95}
          />

          <motion.circle
            cx="50"
            cy="50"
            r="6"
            fill="#8b5cf6"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          />
        </motion.svg>

        <div className="text-center">
          <div className="text-lg font-medium text-white">
            Xandeum Analytics
          </div>
          <div className="text-sm text-white/60">{message}</div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon,
  color,
  subtext,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  subtext?: string;
}) {
  const colorClasses: Record<string, string> = {
    purple: "from-purple-600/20 to-purple-900/10 border-purple-500/20",
    green: "from-green-600/20 to-green-900/10 border-green-500/20",
    cyan: "from-cyan-600/20 to-cyan-900/10 border-cyan-500/20",
    orange: "from-orange-600/20 to-orange-900/10 border-orange-500/20",
    pink: "from-pink-600/20 to-pink-900/10 border-pink-500/20",
    yellow: "from-yellow-600/20 to-yellow-900/10 border-yellow-500/20",
  };

  const textColors: Record<string, string> = {
    purple: "text-purple-400",
    green: "text-green-400",
    cyan: "text-cyan-400",
    orange: "text-orange-400",
    pink: "text-pink-400",
    yellow: "text-yellow-400",
  };

  return (
    <div
      className={`rounded-xl border bg-linear-to-br p-4 h-48 flex flex-col justify-between overflow-hidden ${
        colorClasses[color] || colorClasses.purple
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {subtext && <span className="text-xs text-white/40">{subtext}</span>}
      </div>
      <div
        className={`text-2xl font-bold ${
          textColors[color] || textColors.purple
        }`}
      >
        {value}
      </div>
      <div className="text-sm text-white/60">{label}</div>
    </div>
  );
}
