"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "../../lib/api";
import { useAuthStore } from "../../lib/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<"Player" | "Admin">("Player");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await registerUser(username, email, password, role);
      setAuth(res.token, res.username, res.role as "Player" | "Admin");
      // Redirect based on role
      if (res.role === "Admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError((err as Error).message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50">
          Create your account
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Register as a player and start climbing the leaderboard.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500/60 focus:ring"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500/60 focus:ring"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500/60 focus:ring"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={6}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500/60 focus:ring"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Account Type</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="Player"
                  checked={role === "Player"}
                  onChange={() => setRole("Player")}
                  className="w-4 h-4 text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-300">Player</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="Admin"
                  checked={role === "Admin"}
                  onChange={() => setRole("Admin")}
                  className="w-4 h-4 text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-300">Admin</span>
              </label>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {role === "Admin" ? "Admin accounts can manage games, users, and platform settings." : "Player accounts can play games and compete on leaderboards."}
            </p>
          </div>
          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/70 rounded-md px-2 py-1">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Register & Play"}
          </button>
        </form>
      </div>
    </div>
  );
}

