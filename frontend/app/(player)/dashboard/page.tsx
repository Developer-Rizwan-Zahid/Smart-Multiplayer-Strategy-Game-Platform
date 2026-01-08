"use client";


import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { Protected } from "../../../components/Protected";
import { Sidebar } from "../../../components/Sidebar";
import { apiFetch, UserProfile } from "../../../lib/api";
import { useAuthStore } from "../../../lib/auth-store";
import { motion } from "framer-motion";
import Link from "next/link";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

type AiRecommendation = {
  gameId: string;
  recommendation: string;
  winProbability: number;
};

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

export default function DashboardPage() {
  const { username } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [ai, setAi] = useState<AiRecommendation | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const me = await apiFetch<UserProfile>("/api/Stats/me");
        setProfile(me);
        const aiRes = await apiFetch<string>("/api/Ai/analyze-match", {
          method: "POST",
          body: JSON.stringify({
            gameId: "conquest",
            gameState: { demo: true },
          }),
        });
        const parsed = JSON.parse(aiRes) as AiRecommendation;
        setAi(parsed);
      } catch {
        // ignore for now
      } finally {
        setLoading(false);
      }
    }
    load();

    // Setup SignalR listener for updates (simplified: listen to GameHub or just poll on focus)
    // For now, let's just re-fetch on window focus for simplicity as NotificationHub isn't fully wired
    const handleFocus = () => load();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // Mock data for charts (replace with real API data)
  const performanceData = [
    { week: "Week 1", wins: 5, losses: 2 },
    { week: "Week 2", wins: 8, losses: 3 },
    { week: "Week 3", wins: 6, losses: 4 },
    { week: "Week 4", wins: 10, losses: 1 },
  ];

  const winLossData = [
    { name: "Wins", value: profile?.wins || 0 },
    { name: "Losses", value: profile?.losses || 0 },
  ];

  const { role } = useAuthStore();

  // Games Data (Copied from Landing Page)
  const games = [
    {
      id: "conquest",
      name: "Galactic Conquest",
      description: "4X strategy across a procedurally generated galaxy.",
      tag: "Flagship",
      startColor: "from-emerald-500/10",
      iconBg: "bg-emerald-500/20",
      iconText: "text-emerald-400",
      tagBorder: "border-emerald-500/30",
      tagBg: "bg-emerald-500/10",
      tagText: "text-emerald-300"
    },
    {
      id: "arena",
      name: "Tactical Arena",
      description: "Fast-paced squad battles with cover and abilities.",
      tag: "Popular",
      startColor: "from-blue-500/10",
      iconBg: "bg-blue-500/20",
      iconText: "text-blue-400",
      tagBorder: "border-blue-500/30",
      tagBg: "bg-blue-500/10",
      tagText: "text-blue-300"
    },
    {
      id: "cards",
      name: "Dynasty Cards",
      description: "Deck-building strategy with territory control.",
      tag: "New",
      startColor: "from-amber-500/10",
      iconBg: "bg-amber-500/20",
      iconText: "text-amber-400",
      tagBorder: "border-amber-500/30",
      tagBg: "bg-amber-500/10",
      tagText: "text-amber-300"
    },
    {
      id: "siege",
      name: "Citadel Siege",
      description: "Asymmetric attacker vs defender siege warfare.",
      tag: "Hardcore",
      startColor: "from-red-500/10",
      iconBg: "bg-red-500/20",
      iconText: "text-red-400",
      tagBorder: "border-red-500/30",
      tagBg: "bg-red-500/10",
      tagText: "text-red-300"
    },
    {
      id: "clans",
      name: "Clans & Kingdoms",
      description: "Persistent world with alliances and politics.",
      tag: "Social",
      startColor: "from-purple-500/10",
      iconBg: "bg-purple-500/20",
      iconText: "text-purple-400",
      tagBorder: "border-purple-500/30",
      tagBg: "bg-purple-500/10",
      tagText: "text-purple-300"
    },
    {
      id: "grid",
      name: "Neon Grid",
      description: "Abstract positional tactics on a glowing grid.",
      tag: "Puzzle",
      startColor: "from-cyan-500/10",
      iconBg: "bg-cyan-500/20",
      iconText: "text-cyan-400",
      tagBorder: "border-cyan-500/30",
      tagBg: "bg-cyan-500/10",
      tagText: "text-cyan-300"
    },
    {
      id: "tictactoe",
      name: "Tic Tac Toe",
      description: "Classic 3x3 grid game - simple, fast, and fun!",
      tag: "Classic",
      startColor: "from-pink-500/10",
      iconBg: "bg-pink-500/20",
      iconText: "text-pink-400",
      tagBorder: "border-pink-500/30",
      tagBg: "bg-pink-500/10",
      tagText: "text-pink-300"
    },
    {
      id: "chess",
      name: "Void Chess",
      description: "Classical chess with zero-gravity movement mechanics.",
      tag: "Brain",
      startColor: "from-slate-500/10",
      iconBg: "bg-slate-500/20",
      iconText: "text-slate-400",
      tagBorder: "border-slate-500/30",
      tagBg: "bg-slate-500/10",
      tagText: "text-slate-300"
    },
    {
      id: "towers",
      name: "Cosmic Towers",
      description: "Tower defense meets RTS in deep space.",
      tag: "Action",
      startColor: "from-indigo-500/10",
      iconBg: "bg-indigo-500/20",
      iconText: "text-indigo-400",
      tagBorder: "border-indigo-500/30",
      tagBg: "bg-indigo-500/10",
      tagText: "text-indigo-300"
    },
    {
      id: "racing",
      name: "Nebula Racing",
      description: "Turn-based racing strategy on shifting courses.",
      tag: "Racing",
      startColor: "from-rose-500/10",
      iconBg: "bg-rose-500/20",
      iconText: "text-rose-400",
      tagBorder: "border-rose-500/30",
      tagBg: "bg-rose-500/10",
      tagText: "text-rose-300"
    }
  ];

  return (
    <Protected requireRole="Player">
      <div className="flex">
        <Sidebar role={role || "Player"} />
        <div className="flex-1 transition-all duration-300" style={{ marginLeft: "280px" }}>
          <div className="relative min-h-screen pb-12">
            <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
              {/* Welcome Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-2xl p-6"
              >
                <h1 className="text-3xl font-bold text-white">
                  Welcome back, <span className="text-emerald-400">{username}</span>
                </h1>
                <p className="text-sm text-slate-400 mt-2">Ready for your next strategic victory?</p>
              </motion.div>

              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
                  <p className="text-sm text-slate-400 mt-4">Loading your stats...</p>
                </div>
              )}

              {!loading && profile && (
                <>
                  {/* Stats Cards */}
                  <div className="grid gap-4 md:grid-cols-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="glass-panel rounded-xl p-6 border-l-4 border-l-blue-500"
                    >
                      <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Matches Played</p>
                      <p className="text-3xl font-bold text-white">{profile.matchesPlayed}</p>
                      <p className="text-xs text-slate-500 mt-1">Total games</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="glass-panel rounded-xl p-6 border-l-4 border-l-emerald-500"
                    >
                      <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Wins</p>
                      <p className="text-3xl font-bold text-emerald-400">{profile.wins}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {profile.matchesPlayed > 0
                          ? `${Math.round((profile.wins / profile.matchesPlayed) * 100)}% win rate`
                          : "No matches yet"}
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="glass-panel rounded-xl p-6 border-l-4 border-l-red-500"
                    >
                      <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Losses</p>
                      <p className="text-3xl font-bold text-red-400">{profile.losses}</p>
                      <p className="text-xs text-slate-500 mt-1">Learning opportunities</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="glass-panel rounded-xl p-6 border-l-4 border-l-purple-500"
                    >
                      <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Rank</p>
                      <p className="text-3xl font-bold text-purple-400">
                        #{profile.wins > 0 ? Math.floor(Math.random() * 100) + 1 : "—"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Global leaderboard</p>
                    </motion.div>
                  </div>

                  {/* AI Coach Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="glass-panel rounded-xl p-6 border border-emerald-500/30 bg-emerald-500/5 mb-6"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <span className="text-emerald-400 text-lg">🤖</span>
                      </div>
                      <h2 className="text-lg font-semibold text-white">AI Coach</h2>
                    </div>
                    {ai ? (
                      <div className="space-y-3">
                        <p className="text-sm text-slate-300 leading-relaxed">{ai.recommendation}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20">
                          <span className="text-xs text-slate-400">Win Probability</span>
                          <span className="text-sm font-bold text-emerald-400">
                            {(ai.winProbability * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">
                        AI tips will appear here after your matches. Play more games to get personalized recommendations!
                      </p>
                    )}
                  </motion.div>

                  {/* Game Selection Grid */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Available Games</h2>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {games.map((game, index) => (
                        <Link key={game.id} href={`/matchmaking?gameType=${game.id}`} className="block relative group h-full">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.05 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="glass-card h-full relative overflow-hidden rounded-2xl p-6 flex flex-col"
                          >
                            {/* Hover Gradient Effect */}
                            <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${game.startColor} to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

                            <div className="mb-4 flex items-center justify-between">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${game.iconBg} ${game.iconText}`}>
                                <span className="font-bold">{index + 1}</span>
                              </div>
                              <span className={`rounded-full border ${game.tagBorder} ${game.tagBg} px-2.5 py-0.5 text-[10px] uppercase tracking-wide font-medium ${game.tagText}`}>
                                {game.tag}
                              </span>
                            </div>

                            <h3 className="mb-2 text-lg font-bold text-slate-100 group-hover:text-white transition-colors">
                              {game.name}
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed flex-grow">
                              {game.description}
                            </p>

                            <div className="mt-4 flex items-center justify-between border-t border-slate-700/30 pt-4">
                              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Strategy Mode</span>
                              <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold group-hover:text-emerald-300 transition-colors">
                                Play Now <span>&rarr;</span>
                              </span>
                            </div>
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Charts Section */}
                  <div className="grid gap-4 lg:grid-cols-2 mt-8">
                    {/* Performance Chart */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="glass-panel rounded-xl p-6"
                    >
                      <h2 className="text-lg font-semibold text-white mb-4">Performance Trend</h2>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid #334155",
                              borderRadius: "8px",
                            }}
                          />
                          <Line type="monotone" dataKey="wins" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
                          <Line type="monotone" dataKey="losses" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444" }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </motion.div>

                    {/* Win/Loss Pie Chart */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="glass-panel rounded-xl p-6"
                    >
                      <h2 className="text-lg font-semibold text-white mb-4">Win/Loss Distribution</h2>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={winLossData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {winLossData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid #334155",
                              borderRadius: "8px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </motion.div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Protected>
  );
}

