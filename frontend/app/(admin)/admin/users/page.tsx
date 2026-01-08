"use client";

import { useEffect, useState } from "react";
import { Protected } from "../../../../components/Protected";
import { apiFetch, UserProfile } from "../../../../lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    apiFetch<UserProfile[]>("/api/Users")
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  return (
    <Protected requireRole="Admin">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
        <h1 className="text-2xl font-semibold text-slate-50">
          User Management
        </h1>
        <p className="text-sm text-slate-400">
          View players and basic stats. Extend with ban/unban actions.
        </p>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <ul className="space-y-1 text-xs text-slate-300">
            {users.map((u) => (
              <li key={u.id}>
                {u.username} – {u.matchesPlayed} matches, {u.wins}W/{u.losses}L
              </li>
            ))}
            {users.length === 0 && (
              <li className="text-slate-500">No users loaded.</li>
            )}
          </ul>
        </div>
      </div>
    </Protected>
  );
}

