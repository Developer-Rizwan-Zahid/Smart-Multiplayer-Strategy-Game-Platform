"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Background from "@/components/Background";

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

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden selection:bg-emerald-500/30">
      <Background />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-16 px-6 py-12 lg:flex-row lg:items-center lg:py-20">

        {/* Left Content Section */}
        <motion.section
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 space-y-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-4 py-1.5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-300">
              Next-Gen Strategy Platform
            </span>
          </div>

          <h1 className="text-balance text-5xl font-bold tracking-tight text-white sm:text-7xl lg:leading-[1.1]">
            Master the Art of <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Digital Warfare
            </span>
          </h1>

          <p className="max-w-xl text-lg text-slate-400 leading-relaxed">
            Experience deeply strategic multiplayer games with real-time matchmaking,
            cinematic visuals, and an <span className="text-slate-200 font-medium">AI Coach</span> that learns from every match to help you dominate the leaderboard.
          </p>

          <div className="flex flex-wrap items-center gap-5 pt-4">
            <Link
              href="/register"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-emerald-500 px-8 py-4 text-sm font-bold text-slate-950 transition-all hover:bg-emerald-400 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(52,211,153,0.6)]"
            >
              <span className="relative z-10">Start Playing Now</span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out" />
            </Link>
            <Link
              href="/login"
              className="group inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/50 px-8 py-4 text-sm font-bold text-slate-200 backdrop-blur-sm transition-all hover:border-emerald-500/50 hover:bg-slate-800/80 hover:text-emerald-300"
            >
              Login to Account
            </Link>
          </div>

          <div className="flex flex-wrap gap-8 pt-8 border-t border-slate-800/50">
            {[
              { label: "Active Players", value: "10k+" },
              { label: "Matches Played", value: "2.5M+" },
              { label: "Community Rating", value: "4.9/5" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <span className="text-xs uppercase tracking-wider text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Right Content Section - Game Cards */}
        <motion.section
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex-1 lg:pl-12"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {games.map((game, index) => (
              <Link key={game.id} href={`/matchmaking?gameType=${game.id}`} className="block relative group">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="glass-card h-full relative overflow-hidden rounded-2xl p-6"
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
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {game.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-700/30 pt-4">
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Strategy Mode</span>
                    <span className="text-xs text-white opacity-0 transform translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                      Play Now &rarr;
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Footer / Admin Link */}
          <div className="mt-12 flex justify-center lg:justify-end">
            <Link
              href="/admin"
              className="text-xs text-slate-600 hover:text-emerald-500 transition-colors uppercase tracking-widest font-semibold"
            >
              Admin Access
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
