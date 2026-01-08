"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "../lib/auth-store";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { token, username, role, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering auth-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Only compute navLinks after mount to prevent hydration mismatch
  // During SSR, show default links (not logged in state)
  const navLinks = mounted && token
    ? role === "Admin"
      ? [
          { href: "/admin", label: "Admin Dashboard", icon: "⚙️" },
          { href: "/admin/games", label: "Manage Games", icon: "🎮" },
          { href: "/admin/users", label: "Users", icon: "👥" },
          { href: "/admin/reports", label: "Reports", icon: "📊" },
        ]
      : [
          { href: "/dashboard", label: "Dashboard", icon: "📊" },
          { href: "/matchmaking", label: "Matchmaking", icon: "⚔️" },
          { href: "/leaderboard", label: "Leaderboard", icon: "🏆" },
          { href: "/profile", label: "Profile", icon: "👤" },
        ]
    : [
        { href: "/", label: "Home", icon: "🏠" },
        { href: "/leaderboard", label: "Leaderboard", icon: "🏆" },
      ];

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/50 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-emerald-500/20 blur-md group-hover:bg-emerald-500/30 transition-colors" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500">
                <span className="text-xl font-bold text-slate-950">S</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-white">Smart Strategy</span>
              <p className="text-[10px] text-slate-400 -mt-1">Game Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.href)
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
                {isActive(link.href) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg border border-emerald-500/30"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center gap-3">
            {mounted && token ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-xs font-bold text-slate-950">
                    {username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-xs font-medium text-white">{username}</p>
                    <p className="text-[10px] text-slate-400">{role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all border border-slate-700/50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30"
                >
                  Play Now
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-slate-800/50"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.href)
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
