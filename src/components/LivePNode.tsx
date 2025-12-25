"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";

type StatsFlat = {
  cpu_percent: number;
  ram_used: number;
  ram_total: number;
  uptime: number;
  packets_received: number;
  packets_sent: number;
  active_streams: number;
  file_size: number;
  total_bytes: number;
  total_pages: number;
  last_updated: number;
} | null;

export default function LivePNode({
  pollInterval = 60000,
}: {
  pollInterval?: number;
}) {
  const [stats, setStats] = useState<StatsFlat>(null);
  const [version, setVersion] = useState<string>("");
  const [ip, setIp] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const fetchLive = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/pnode", { timeout: 5000 });
      const j = res.data;
      if (!j?.ok) throw new Error(j?.error || "No live pNode available");
      setVersion(j.version?.version ?? j.version ?? "");
      setIp(j.ip ?? "");
      const s = j.stats;
      const flat = s
        ? {
            cpu_percent: s.cpu_percent,
            ram_used: s.ram_used,
            ram_total: s.ram_total,
            uptime: s.uptime,
            packets_received: s.packets_received,
            packets_sent: s.packets_sent,
            active_streams: s.active_streams,
            file_size: s.file_size,
            total_bytes: s.metadata?.total_bytes ?? s.total_bytes ?? 0,
            total_pages: s.metadata?.total_pages ?? s.total_pages ?? 0,
            last_updated: s.metadata?.last_updated ?? s.last_updated,
          }
        : null;
      setStats(flat);
      setLastFetched(Date.now());
    } catch (err: unknown) {
      const msg = (err as Error)?.message ?? String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLive();
    const id = setInterval(fetchLive, pollInterval);
    return () => clearInterval(id);
  }, [fetchLive, pollInterval]);

  function formatBytes(bytes: number) {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  function formatUptime(seconds: number) {
    if (!seconds) return "0m";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400)
      return `${Math.floor(seconds / 3600)}h ${Math.floor(
        (seconds % 3600) / 60
      )}m`;
    return `${Math.floor(seconds / 86400)}d ${Math.floor(
      (seconds % 86400) / 3600
    )}h`;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 w-full max-w-xl h-48 overflow-auto">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Live pNode</h3>
          <div className="mt-1 text-sm text-white/40">
            {ip ? `IP: ${ip}` : "No working pNode detected"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/40">Version</div>
          <div className="font-mono text-lg font-bold text-purple-400">
            {version ? `v${version}` : "—"}
          </div>
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="text-sm text-white/40">Loading live stats...</div>
        ) : error ? (
          <div className="text-sm text-red-400">{error}</div>
        ) : stats ? (
          <div className="grid gap-3">
            <div className="flex justify-between text-sm text-white/60">
              <span>CPU</span>
              <span>{stats.cpu_percent}%</span>
            </div>
            <div className="flex justify-between text-sm text-white/60">
              <span>RAM Used</span>
              <span>{formatBytes(stats.ram_used)}</span>
            </div>
            <div className="flex justify-between text-sm text-white/60">
              <span>RAM Total</span>
              <span>{formatBytes(stats.ram_total)}</span>
            </div>
            <div className="flex justify-between text-sm text-white/60">
              <span>Uptime</span>
              <span>{formatUptime(stats.uptime)}</span>
            </div>
            <div className="flex justify-between text-sm text-white/60">
              <span>Active Streams</span>
              <span>{stats.active_streams}</span>
            </div>
            <div className="flex justify-between text-sm text-white/60">
              <span>Storage File</span>
              <span>{formatBytes(stats.file_size)}</span>
            </div>
            <div className="flex justify-between text-sm text-white/60">
              <span>Total Bytes</span>
              <span>{formatBytes(stats.total_bytes)}</span>
            </div>
            <div className="flex justify-between text-sm text-white/60">
              <span>Last Updated</span>
              <span>
                {stats.last_updated
                  ? new Date(stats.last_updated * 1000).toLocaleString()
                  : "—"}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-white/40">No stats available</div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <button
          onClick={() => fetchLive()}
          className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700"
        >
          Refresh
        </button>
        <div className="text-xs text-white/40">
          Last: {lastFetched ? new Date(lastFetched).toLocaleTimeString() : "—"}
        </div>
      </div>
    </div>
  );
}
