"use client";

import Link from "next/link";
import DiagnosticsPanel from "@/components/DiagnosticsPanel";

export default function DiagnosticsPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/80 hover:text-white">
              ← Back
            </Link>
            <h1 className="text-xl font-bold text-white">Diagnostics</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <DiagnosticsPanel />
      </main>
    </div>
  );
}
