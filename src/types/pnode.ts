export interface PNode {
  address: string;
  is_public: boolean;
  last_seen_timestamp: number;
  pubkey: string;
  rpc_port: number;
  storage_committed: number;
  storage_usage_percent: number;
  storage_used: number;
  uptime: number;
  version: string;
  // Credits (optional) populated from external pod credits API
  credits?: number;
}

export interface PodWithStats {
  nodes: PNode[];
  total_nodes: number;
  total_storage_committed: number;
  total_storage_used: number;
  avg_uptime: number;
}

export interface NetworkStats {
  totalNodes: number;
  activeNodes: number;
  totalStorage: number;
  usedStorage: number;
  avgUptime: number;
  avgStorageUsage: number;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface UptimeChartData {
  range: string;
  count: number;
}

export interface VersionDistribution {
  version: string;
  count: number;
  percentage: number;
}
