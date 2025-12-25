// Lightweight pRPC helper for querying pNode JSON-RPC endpoints
// Uses the pNode RPC method names from the docs: get-version, get-stats, get-pods
import axios from 'axios';

const PNODE_IPS = [
    "173.212.203.145",
    "173.212.220.65",
    "161.97.97.41",
    "192.190.136.36",
    "192.190.136.37",
    "192.190.136.38",
    "192.190.136.28",
    "192.190.136.29",
    "207.244.255.1",
];

async function callPRPC(ip: string, method: string, params?: unknown, timeout = 3000) {
    const url = `http://${ip}:6000/rpc`;
    const payload: Record<string, unknown> = { jsonrpc: '2.0', method, id: 1 };
    if (params) payload['params'] = params as unknown;

    try {
        const res = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout,
        });

        const json = res.data;
        if (json && json.error) throw new Error(json.error?.message || 'pRPC error');
        return json;
    } catch (err) {
        // Normalize axios error messages
        if (axios.isAxiosError(err)) {
            const msg = err.response ? `HTTP ${err.response.status} from ${url}` : err.message;
            throw new Error(msg);
        }
        throw err;
    }
}

export async function probe(ip: string, timeout = 2000) {
    try {
        // Try a simple method; get-version is quick
        const r = await callPRPC(ip, "get-version", undefined, timeout);
        return !!(r && r.result);
    } catch {
        return false;
    }
}

// pick a working ip from provided preferredIp or the known list
export async function findWorkingIp(preferredIp?: string) {
    if (preferredIp) {
        const ok = await probe(preferredIp).catch(() => false);
        if (ok) return preferredIp;
    }

    for (const ip of PNODE_IPS) {
        try {
            const ok = await probe(ip);
            if (ok) return ip;
        } catch {
            // continue
        }
    }
    throw new Error("No working pNode found");
}

// Returns result object for get-version
export async function getVersion(ip: string) {
    const r = await callPRPC(ip, "get-version");
    return r.result;
}

// Returns a normalized stats object expected by the frontend
export async function getStats(ip: string) {
    const r = await callPRPC(ip, "get-stats");
    const data = r.result || {};
    // Flatten so the frontend can access cpu_percent, ram_used etc at top level
    const stats = Object.assign({}, data.stats || {}, {
        file_size: data.file_size ?? data.fileSize ?? 0,
        metadata: data.metadata ?? data.Metadata,
        total_bytes: data.metadata?.total_bytes ?? data.total_bytes ?? data.totalBytes ?? 0,
        last_updated: data.metadata?.last_updated ?? data.last_updated,
    });
    return stats;
}

// Returns pods payload as-is (object with pods array and total_count)
export async function getPods(ip: string) {
    const r = await callPRPC(ip, "get-pods");
    return r.result;
}

export const KNOWN_PNODE_IPS = PNODE_IPS;
