"use client";

import { useEffect, useState } from "react";
import { Protected } from "../../../components/Protected";
import { Sidebar } from "../../../components/Sidebar";
import { apiFetch, UserProfile } from "../../../lib/api";
import { useAuthStore } from "../../../lib/auth-store";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    apiFetch<UserProfile>("/api/Users/me")
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []);

  const { role } = useAuthStore();

  return (
    <Protected>
      <div className="flex">
        <Sidebar role={role || "Player"} />
        <div className="flex-1 transition-all duration-300" style={{ marginLeft: "280px" }}>
          <div className="mx-auto max-w-xl px-4 py-8 space-y-4">
        <h1 className="text-2xl font-semibold text-slate-50">Profile</h1>
        {profile && (
          <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/70 p-5">
            <div>
              <p className="text-xs text-slate-400">Username</p>
              <p className="text-sm text-slate-100">{profile.username}</p>
            </div>
            {profile.email && (
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-sm text-slate-100">{profile.email}</p>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3 text-xs text-slate-300">
              <div>
                <p className="text-slate-400">Matches</p>
                <p className="text-slate-50">{profile.matchesPlayed}</p>
              </div>
              <div>
                <p className="text-slate-400">Wins</p>
                <p className="text-emerald-400">{profile.wins}</p>
              </div>
              <div>
                <p className="text-slate-400">Losses</p>
                <p className="text-red-400">{profile.losses}</p>
              </div>
            </div>
          </div>
        )}
        {!profile && (
          <p className="text-sm text-slate-400">
            Unable to load profile. Play a match to generate stats.
          </p>
        )}
          </div>
        </div>
      </div>
    </Protected>
  );
}

