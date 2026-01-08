"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Platform: [
      { label: "About", href: "/about" },
      { label: "Features", href: "/#features" },
      { label: "Games", href: "/#games" },
      { label: "Leaderboard", href: "/leaderboard" },
    ],
    Community: [
      { label: "Discord", href: "#" },
      { label: "Twitter", href: "#" },
      { label: "GitHub", href: "#" },
      { label: "Blog", href: "#" },
    ],
    Support: [
      { label: "Help Center", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  };

  return (
    <footer className="relative border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500">
                <span className="text-xl font-bold text-slate-950">S</span>
              </div>
              <div>
                <span className="text-lg font-bold text-white">Smart Strategy</span>
                <p className="text-[10px] text-slate-400 -mt-1">Game Platform</p>
              </div>
            </Link>
            <p className="text-sm text-slate-400 mb-4 max-w-md">
              Experience the future of multiplayer strategy gaming with AI-powered insights,
              real-time matchmaking, and competitive leaderboards.
            </p>
            <div className="flex gap-3">
              {["🎮", "🤖", "⚔️", "🏆"].map((emoji, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="h-10 w-10 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-lg cursor-pointer hover:bg-slate-800/80 transition-colors"
                >
                  {emoji}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {currentYear} Smart Multiplayer Strategy Game Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Powered by</span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-slate-800/50 border border-slate-700/50">.NET</span>
              <span className="px-2 py-1 rounded bg-slate-800/50 border border-slate-700/50">Next.js</span>
              <span className="px-2 py-1 rounded bg-slate-800/50 border border-slate-700/50">AI</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
