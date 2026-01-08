"use client";

import { useEffect, useState } from "react";
import { Protected } from "../../../components/Protected";
import { Sidebar } from "../../../components/Sidebar";
import { apiFetch, UserProfile } from "../../../lib/api";
import { useAuthStore } from "../../../lib/auth-store";

export default function LeaderboardPage() {
  const [rows, setRows] = useState<UserProfile[]>([]);

  useEffect(() => {
    apiFetch<UserProfile[]>("/api/Stats/leaderboard")
      .then(setRows)
      .catch(() => {
        setRows([]);
      });
  }, []);

  const { role } = useAuthStore();

  return (
    <Protected>
      <div className="flex">
        <Sidebar role={role || "Player"} />
        <div className="flex-1 transition-all duration-300" style={{ marginLeft: "280px" }}>
          <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
        <h1 className="text-2xl font-semibold text-slate-50">Leaderboard</h1>
        <p className="text-sm text-slate-400">
          Global top players by total wins.
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70">
          <table className="min-w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Player</th>
                <th className="px-3 py-2">Matches</th>
                <th className="px-3 py-2">Wins</th>
                <th className="px-3 py-2">Losses</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr
                  key={r.id}
                  className={idx % 2 === 0 ? "bg-slate-950/60" : "bg-slate-900/40"}
                >
                  <td className="px-3 py-2 text-slate-500">{idx + 1}</td>
                  <td className="px-3 py-2 font-medium text-slate-100">
                    {r.username}
                  </td>
                  <td className="px-3 py-2">{r.matchesPlayed}</td>
                  <td className="px-3 py-2 text-emerald-400">{r.wins}</td>
                  <td className="px-3 py-2 text-red-400">{r.losses}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-slate-500"
                  >
                    No leaderboard data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
          </div>
        </div>
      </div>
    </Protected>
  );
}

