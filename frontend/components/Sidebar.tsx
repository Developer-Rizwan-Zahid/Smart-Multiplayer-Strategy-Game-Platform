"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";

type SidebarProps = {
  role?: "Player" | "Admin";
};

export function Sidebar({ role = "Player" }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => pathname?.startsWith(path);

  const playerLinks = [
    { href: "/dashboard", label: "Dashboard", icon: "📊", badge: null },
    { href: "/matchmaking", label: "Matchmaking", icon: "⚔️", badge: "Live" },
    { href: "/leaderboard", label: "Leaderboard", icon: "🏆", badge: null },
    { href: "/profile", label: "Profile", icon: "👤", badge: null },
  ];

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: "📊", badge: null },
    { href: "/admin/games", label: "Manage Games", icon: "🎮", badge: null },
    { href: "/admin/users", label: "User Management", icon: "👥", badge: null },
    { href: "/admin/reports", label: "Reports & Logs", icon: "📊", badge: null },
  ];

  const links = role === "Admin" ? adminLinks : playerLinks;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? "80px" : "280px" }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] glass-panel border-r border-slate-800/50 z-40 transition-all duration-300"
    >
      <div className="flex h-full flex-col">
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-4 h-6 w-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-50"
        >
          <svg
            className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={link.href}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.href)
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <span className="text-xl flex-shrink-0">{link.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1">{link.label}</span>
                    {link.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {link.badge}
                      </span>
                    )}
                  </>
                )}
                {isActive(link.href) && !collapsed && (
                  <motion.div
                    layoutId="activeSidebar"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full"
                    initial={false}
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Bottom Section */}
        {!collapsed && (
          <div className="p-4 border-t border-slate-800/50">
            <div className="rounded-lg bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🤖</span>
                <span className="text-xs font-semibold text-emerald-400">AI Assistant</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Get real-time game analysis and strategic recommendations powered by AI.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
