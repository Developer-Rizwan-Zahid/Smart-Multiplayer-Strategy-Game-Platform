"use client";

import { useEffect, useState } from "react";
import { Protected } from "../../../components/Protected";
import { apiFetch } from "../../../lib/api";

type Match = {
  id: number;
  status: string;
};

export default function AdminDashboardPage() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    apiFetch<Match[]>("/api/Admin/matches")
      .then(setMatches)
      .catch(() => setMatches([]));
  }, []);

  return (
    <Protected requireRole="Admin">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
        <h1 className="text-2xl font-semibold text-slate-50">
          Admin Dashboard
        </h1>
        <p className="text-sm text-slate-400">
          Platform overview and active matches.
        </p>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">
          <h2 className="text-sm font-semibold text-slate-100">
            All Matches (demo)
          </h2>
          <ul className="mt-3 space-y-1 text-xs text-slate-300">
            {matches.map((m) => (
              <li key={m.id}>
                Game #{m.id} – <span className="text-slate-400">{m.status}</span>
              </li>
            ))}
            {matches.length === 0 && (
              <li className="text-slate-500">No matches found.</li>
            )}
          </ul>
        </div>
      </div>
    </Protected>
  );
}

