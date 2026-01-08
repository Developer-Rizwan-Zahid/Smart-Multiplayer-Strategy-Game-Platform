"use client";

import { Protected } from "../../../../components/Protected";

export default function AdminGamesPage() {
  return (
    <Protected requireRole="Admin">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Manage Games & Maps</h1>
        <button className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors">
          + New Map Config
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Matches", value: "1,248", color: "text-blue-400" },
          { label: "Active Players", value: "86", color: "text-green-400" },
          { label: "Server Load", value: "12%", color: "text-amber-400" },
          { label: "Avg Match Time", value: "14m", color: "text-purple-400" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 backdrop-blur-sm">
            <p className="text-xs text-slate-400">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Games List */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/30 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="font-semibold text-slate-200">Game Modes Configuration</h2>
        </div>
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-900/50 text-slate-200 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Game Mode</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Active Sessions</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {[
              { name: "Tactical Arena", status: "Active", sessions: 12, color: "text-amber-400" },
              { name: "Tic Tac Toe", status: "Active", sessions: 5, color: "text-emerald-400" },
              { name: "Galactic Conquest", status: "Maintenance", sessions: 0, color: "text-red-400" },
              { name: "Neon Grid", status: "Active", sessions: 24, color: "text-purple-400" },
              { name: "Tower Defense", status: "Beta", sessions: 3, color: "text-blue-400" },
            ].map((game) => (
              <tr key={game.name} className="hover:bg-slate-700/30">
                <td className={`px-4 py-3 font-medium ${game.color}`}>{game.name}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${game.status === "Active" ? "bg-emerald-500/10 text-emerald-400" :
                      game.status === "Maintenance" ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"
                    }`}>
                    {game.status}
                  </span>
                </td>
                <td className="px-4 py-3">{game.sessions}</td>
                <td className="px-4 py-3">
                  <button className="text-slate-400 hover:text-white transition-colors">Configure</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Protected>
  );
}

