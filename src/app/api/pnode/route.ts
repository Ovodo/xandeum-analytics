import { NextResponse } from 'next/server';
import { findWorkingIp, getVersion, getStats, getPods } from '@/lib/rpc';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const ipParam = searchParams.get('ip') || undefined;

        const ip = await findWorkingIp(ipParam);

        const [version, stats, pods] = await Promise.all([
            getVersion(ip),
            getStats(ip),
            getPods(ip),
        ]);

        return NextResponse.json({ ok: true, ip, version, stats, pods });
    } catch (e: unknown) {
        const msg = (e as Error)?.message ?? String(e);
        return NextResponse.json({ ok: false, error: msg || 'Failed to fetch pnode data' }, { status: 500 });
    }
}
