"use client";

import { Protected } from "../../../../components/Protected";

export default function AdminReportsPage() {
  return (
    <Protected requireRole="Admin">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Reports & System Logs</h1>
        <div className="flex gap-2">
          <button className="rounded-lg bg-red-500/10 border border-red-500/50 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors">
            Clear All Logs
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Reports */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/30 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="font-semibold text-slate-200">Pending User Reports</h2>
            <span className="bg-red-500 rounded-full px-2 py-0.5 text-xs font-bold text-white">3 New</span>
          </div>
          <div className="divide-y divide-slate-700">
            {[
              { reporter: "PlayerOne", suspect: "TrollMaster", reason: "Verbal Abuse", time: "2m ago" },
              { reporter: "Winner123", suspect: "NoobSlayer", reason: "Cheating/Hacking", time: "15m ago" },
              { reporter: "FairPlay", suspect: "AfkBot", reason: "AFK Farming", time: "1h ago" },
            ].map((report, i) => (
              <div key={i} className="p-4 hover:bg-slate-700/30 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm font-bold text-red-400">{report.reason}</h3>
                  <span className="text-xs text-slate-500">{report.time}</span>
                </div>
                <p className="text-xs text-slate-300">
                  <span className="text-emerald-400">{report.reporter}</span> reported <span className="text-amber-400">{report.suspect}</span>
                </p>
                <div className="mt-2 flex gap-2">
                  <button className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-white">View Chat</button>
                  <button className="text-xs bg-red-500/20 text-red-300 hover:bg-red-500/40 px-2 py-1 rounded">Ban User</button>
                  <button className="text-xs bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40 px-2 py-1 rounded">Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Logs */}
        <div className="rounded-xl border border-slate-700 bg-black/60 overflow-hidden flex flex-col h-[400px]">
          <div className="p-4 border-b border-slate-700 bg-slate-900/50">
            <h2 className="font-semibold text-slate-200 font-mono text-sm">System Logs (Live)</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
            {[
              { time: "16:45:12", level: "INFO", msg: "Match #1024 started (Arena)", color: "text-blue-400" },
              { time: "16:45:15", level: "INFO", msg: "User 'PlayerOne' connected", color: "text-slate-400" },
              { time: "16:45:42", level: "WARN", msg: "High latency detected for user 'Guest99'", color: "text-amber-400" },
              { time: "16:46:01", level: "INFO", msg: "Match #1023 ended. Winner: 'StarLord'", color: "text-emerald-400" },
              { time: "16:46:05", level: "ERROR", msg: "Failed sync for game state #1025 (Recovered)", color: "text-red-400" },
              { time: "16:46:10", level: "INFO", msg: "New lobby created by 'AdminUser'", color: "text-blue-400" },
              { time: "16:46:11", level: "INFO", msg: "Database backup completed successfully", color: "text-slate-500" },
              { time: "16:46:22", level: "WARN", msg: "Rate limit exceeded for API /get-stats", color: "text-amber-400" },
            ].map((log, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-slate-600 select-none">{log.time}</span>
                <span className={log.color}>{log.msg}</span>
              </div>
            ))}
            <div className="animate-pulse flex gap-3 opacity-50">
              <span className="text-slate-600">Now...</span>
              <span className="text-slate-500">Listening for events</span>
            </div>
          </div>
        </div>
      </div>
    </Protected>
  );
}

