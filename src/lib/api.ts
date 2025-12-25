import axios from 'axios';
import { PNode, NetworkStats, VersionDistribution, UptimeChartData } from "@/types/pnode";

// Generate fresh mock data with current timestamps
// This ensures nodes appear "online" for demo purposes
function generateMockPNodes(): PNode[] {
  const now = Date.now() / 1000;
  return [
    {
      address: "109.199.96.218:9001",
      is_public: true,
      last_seen_timestamp: now - 5, // 5 seconds ago - ONLINE
      pubkey: "2asTHq4vVGazKrmEa3YTXKuYiNZBdv1cQoLc1Tr2kvaw",
      rpc_port: 6000,
      storage_committed: 104857600,
      storage_usage_percent: 24.86,
      storage_used: 26069000,
      uptime: 3271,
      version: "0.7.0"
    },
    {
      address: "45.33.102.147:9001",
      is_public: true,
      last_seen_timestamp: now - 15, // 15 seconds ago - ONLINE
      pubkey: "7BwqNLV42Y8ZJkRtFNqXsYpJ1mQ9Gr2nXvTqLPpM4k3Y",
      rpc_port: 6000,
      storage_committed: 209715200,
      storage_usage_percent: 45.32,
      storage_used: 95025152,
      uptime: 14523,
      version: "0.7.0"
    },
    {
      address: "172.105.234.89:9001",
      is_public: true,
      last_seen_timestamp: now - 25, // 25 seconds ago - ONLINE
      pubkey: "9KpRTqX5ZnHmW3aVFgJx8yNbQc6EuD2MvLPk7sT4f9Gh",
      rpc_port: 6000,
      storage_committed: 524288000,
      storage_usage_percent: 67.89,
      storage_used: 356047872,
      uptime: 28934,
      version: "0.7.0"
    },
    {
      address: "88.198.45.67:9001",
      is_public: true,
      last_seen_timestamp: now - 120, // 2 min ago - WARNING
      pubkey: "4XmPqR8vNsJtY2bKfL6xWcE9uA3HgZdM7nVpQo5rT1Jk",
      rpc_port: 6000,
      storage_committed: 157286400,
      storage_usage_percent: 12.45,
      storage_used: 19582156,
      uptime: 7823,
      version: "0.6.5"
    },
    {
      address: "139.59.12.234:9001",
      is_public: true,
      last_seen_timestamp: now - 10, // 10 seconds ago - ONLINE
      pubkey: "6FnKsT4vMpJxY8bQeL2xWcE9uA3HgZdM7nVpQo5rT1Jk",
      rpc_port: 6000,
      storage_committed: 419430400,
      storage_usage_percent: 89.23,
      storage_used: 374265651,
      uptime: 45632,
      version: "0.7.0"
    },
    {
      address: "165.227.89.156:9001",
      is_public: false,
      last_seen_timestamp: now - 400, // 6+ min ago - OFFLINE
      pubkey: "8HjLmN3xQoP5Y9bRfT2xWcE9uA3HgZdM7nVpQo5rT1Jk",
      rpc_port: 6000,
      storage_committed: 262144000,
      storage_usage_percent: 55.67,
      storage_used: 145961164,
      uptime: 15234,
      version: "0.6.5"
    },
    {
      address: "192.168.1.100:9001",
      is_public: true,
      last_seen_timestamp: now - 30, // 30 seconds ago - ONLINE
      pubkey: "3KpRTqX5ZnHmW3aVFgJx8yNbQc6EuD2MvLPk7sT4f9Aa",
      rpc_port: 6000,
      storage_committed: 838860800,
      storage_usage_percent: 34.56,
      storage_used: 289910169,
      uptime: 67832,
      version: "0.7.0"
    },
    {
      address: "51.158.67.89:9001",
      is_public: true,
      last_seen_timestamp: now - 45, // 45 seconds ago - ONLINE
      pubkey: "5MnPqR8vNsJtY2bKfL6xWcE9uA3HgZdM7nVpQo5rT1Bb",
      rpc_port: 6000,
      storage_committed: 1073741824,
      storage_usage_percent: 78.92,
      storage_used: 847414067,
      uptime: 89234,
      version: "0.7.0"
    },
    {
      address: "185.216.34.123:9001",
      is_public: true,
      last_seen_timestamp: now - 20, // 20 seconds ago - ONLINE
      pubkey: "7XnKsT4vMpJxY8bQeL2xWcE9uA3HgZdM7nVpQo5rCcDd",
      rpc_port: 6000,
      storage_committed: 314572800,
      storage_usage_percent: 23.45,
      storage_used: 73767331,
      uptime: 34521,
      version: "0.7.0"
    },
    {
      address: "134.122.89.45:9001",
      is_public: true,
      last_seen_timestamp: now - 90, // 90 seconds ago - WARNING
      pubkey: "9YjLmN3xQoP5Y9bRfT2xWcE9uA3HgZdM7nVpQo5rEeFf",
      rpc_port: 6000,
      storage_committed: 629145600,
      storage_usage_percent: 91.23,
      storage_used: 573888404,
      uptime: 112345,
      version: "0.7.0"
    },
    {
      address: "95.179.213.67:9001",
      is_public: false,
      last_seen_timestamp: now - 600, // 10 min ago - OFFLINE
      pubkey: "1ZkLmN3xQoP5Y9bRfT2xWcE9uA3HgZdM7nVpQo5rGgHh",
      rpc_port: 6000,
      storage_committed: 157286400,
      storage_usage_percent: 8.34,
      storage_used: 13117587,
      uptime: 2345,
      version: "0.6.0"
    },
    {
      address: "178.128.156.234:9001",
      is_public: true,
      last_seen_timestamp: now - 8, // 8 seconds ago - ONLINE
      pubkey: "2AmPqR8vNsJtY2bKfL6xWcE9uA3HgZdM7nVpQo5rIiJj",
      rpc_port: 6000,
      storage_committed: 471859200,
      storage_usage_percent: 62.78,
      storage_used: 296253117,
      uptime: 56789,
      version: "0.7.0"
    },
  ];
}

// RPC endpoint configuration - include user's public IPs and known endpoints
const PRPC_ENDPOINTS = [
  // User-provided public IPs (try these first)
  "http://173.212.203.145:6000",
  "http://173.212.220.65:6000",
  "http://161.97.97.41:6000",
  "http://192.190.136.36:6000",
  "http://192.190.136.37:6000",
  "http://192.190.136.38:6000",
  "http://192.190.136.28:6000",
  "http://192.190.136.29:6000",
  "http://207.244.255.1:6000",
  // Known endpoints / documented ones
  "http://109.199.96.218:6000",
  "https://apis.devnet.xandeum.com",
];

export interface FetchResult {
  nodes: PNode[];
  isLive: boolean;
  source: string;
}

// Remove duplicate nodes by `pubkey` (or address fallback).
// - If duplicates have identical key metrics (storage_committed, storage_used, uptime)
//   we keep the first occurrence.
// - If they differ, prefer the node with the larger `storage_committed`,
//   otherwise the one with the more recent `last_seen_timestamp`.
export function dedupePNodes(nodes: PNode[]): PNode[] {
  const map = new Map<string, PNode>();
  for (const n of nodes) {
    const key = (n.pubkey ?? n.address ?? "") as string;
    if (!key) continue;
    const prev = map.get(key);
    if (!prev) {
      map.set(key, n);
      continue;
    }

    const prevStorage = prev.storage_committed ?? 0;
    const curStorage = n.storage_committed ?? 0;
    const prevUsed = prev.storage_used ?? 0;
    const curUsed = n.storage_used ?? 0;
    const prevUptime = prev.uptime ?? 0;
    const curUptime = n.uptime ?? 0;

    // exact-ish duplicate — keep existing
    if (prevStorage === curStorage && prevUsed === curUsed && prevUptime === curUptime) {
      continue;
    }

    // prefer larger storage, else more recent last_seen_timestamp
    if (curStorage > prevStorage) {
      map.set(key, n);
    } else {
      const prevSeen = prev.last_seen_timestamp ?? 0;
      const curSeen = n.last_seen_timestamp ?? 0;
      if (curSeen > prevSeen) map.set(key, n);
    }
  }
  return Array.from(map.values());
}

// Fetch pNodes from the actual pRPC endpoint
export async function fetchPNodes(): Promise<FetchResult> {
  console.log("Attempting to fetch live pNode data...");

  // Try server-side proxy first to avoid client CORS problems
  try {
    const proxiedRes = await axios.get('/api/pnodes', { timeout: 5000 });
    const j = proxiedRes.data;
    if (j?.success && Array.isArray(j.data)) {
      const deduped = dedupePNodes(j.data as PNode[]);
      if (deduped.length !== (j.data as PNode[]).length) {
        console.log(`Deduped pNode list: ${(j.data as PNode[]).length} -> ${deduped.length}`);
      }
      console.log(j.data.length, "pNodes fetched via server proxy vsus", deduped.length, "after deduplication");
      return { nodes: deduped, isLive: true, source: j.source || 'server-proxy' };
    }
  } catch (e) {
    console.log('Server proxy /api/pnodes failed, falling back to direct RPC attempts', e);
  }

  // Fallback to mock data for demo purposes
  console.log("Using mock data for demonstration (pRPC endpoints unavailable)");
  return {
    nodes: dedupePNodes(generateMockPNodes()),
    isLive: false,
    source: "Demo Data",
  };
}

// Calculate network statistics from pNode data
export function calculateNetworkStats(nodes: PNode[]): NetworkStats {
  const activeNodes = nodes.filter(
    (n) => Date.now() / 1000 - n.last_seen_timestamp < 300 // Active if seen in last 5 minutes
  ).length;

  const totalStorage = nodes.reduce((sum, n) => sum + n.storage_committed, 0);
  const usedStorage = nodes.reduce((sum, n) => sum + n.storage_used, 0);
  const avgUptime = nodes.reduce((sum, n) => sum + n.uptime, 0) / nodes.length;
  const avgStorageUsage =
    nodes.reduce((sum, n) => sum + n.storage_usage_percent, 0) / nodes.length;

  return {
    totalNodes: nodes.length,
    activeNodes,
    totalStorage,
    usedStorage,
    avgUptime: Math.round(avgUptime),
    avgStorageUsage: Math.round(avgStorageUsage * 100) / 100,
  };
}

// Get version distribution
export function getVersionDistribution(nodes: PNode[]): VersionDistribution[] {
  const versionCounts: Record<string, number> = {};

  nodes.forEach((node) => {
    versionCounts[node.version] = (versionCounts[node.version] || 0) + 1;
  });

  return Object.entries(versionCounts)
    .map(([version, count]) => ({
      version,
      count,
      percentage: Math.round((count / nodes.length) * 100 * 100) / 100,
    }))
    .sort((a, b) => b.count - a.count);
}

// Get uptime distribution for chart
export function getUptimeDistribution(nodes: PNode[]): UptimeChartData[] {
  const ranges = [
    { range: "<1h", min: 0, max: 3600 },
    { range: "1-6h", min: 3600, max: 21600 },
    { range: "6-24h", min: 21600, max: 86400 },
    { range: "1-7d", min: 86400, max: 604800 },
    { range: ">7d", min: 604800, max: Infinity },
  ];

  return ranges.map((r) => ({
    range: r.range,
    count: nodes.filter((n) => n.uptime >= r.min && n.uptime < r.max).length,
  }));
}

// Get storage distribution for chart
export function getStorageDistribution(nodes: PNode[]): { name: string; value: number }[] {
  // Return top 10 providers with raw bytes as `value` so UI can
  // format the units (KB/MB/GB/TB) dynamically using `formatBytes`.
  return nodes
    .slice()
    .sort((a, b) => (b.storage_committed ?? 0) - (a.storage_committed ?? 0))
    .slice(0, 10)
    .map((node) => {
      const pk = (node.pubkey ?? "").toString();
      const name = pk
        ? `${pk.slice(0, 3)}...${pk.slice(-4)}`
        : ((node.address ?? "") as string).toString();
      return {
        name,
        value: node.storage_committed ?? 0,
      };
    });
}

// Format bytes to human readable
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Format uptime to human readable
export function formatUptime(seconds: number): string {
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m`;
  } else if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  } else {
    return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
  }
}

// Get node status based on last seen
export function getNodeStatus(lastSeenTimestamp: number): "online" | "warning" | "offline" {
  const secondsAgo = Date.now() / 1000 - lastSeenTimestamp;
  if (secondsAgo < 60) return "online";
  if (secondsAgo < 300) return "warning";
  return "offline";
}

// Format time ago
export function formatTimeAgo(timestamp: number): string {
  const secondsAgo = Math.floor(Date.now() / 1000 - timestamp);
  if (secondsAgo < 60) return `${secondsAgo}s ago`;
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
  return `${Math.floor(secondsAgo / 86400)}d ago`;
}
