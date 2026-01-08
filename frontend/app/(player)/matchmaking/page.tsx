"use client";

import { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { Protected } from "../../../components/Protected";
import { Sidebar } from "../../../components/Sidebar";
import { apiFetch } from "../../../lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "../../../lib/auth-store";
import { motion } from "framer-motion";

type QueueStatus = {
  isInQueue: boolean;
  playersInQueue: number;
};

type MatchFoundPayload = {
  gameId: number;
  player1: number;
  player2: number;
};

export default function MatchmakingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameType = searchParams.get("gameType") || "Strategy";
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [searching, setSearching] = useState(false);
  const [matchFound, setMatchFound] = useState<MatchFoundPayload | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const gameTypeNames: Record<string, string> = {
    "conquest": "Galactic Conquest",
    "arena": "Tactical Arena",
    "cards": "Dynasty Cards",
    "siege": "Citadel Siege",
    "clans": "Clans & Kingdoms",
    "grid": "Neon Grid",
    "Strategy": "Strategy Game",
    "TicTacToe": "Tic Tac Toe",
    "chess": "Void Chess",
    "towers": "Cosmic Towers",
    "racing": "Nebula Racing"
  };

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("auth_token")
        : null;
    if (!token) return;

    let connection: signalR.HubConnection | null = null;

    // Try to connect to SignalR, but don't fail if backend is not available
    try {
      connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5000/hubs/matchmaking", {
          accessTokenFactory: () => token!,
          skipNegotiation: false,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Stop retrying after 3 attempts
            if (retryContext.previousRetryCount >= 3) {
              return null;
            }
            return 2000;
          },
        })
        .build();

      connection.on("MatchFound", (payload: MatchFoundPayload) => {
        setMatchFound(payload);
        setSearching(false);
        // Redirect to game after a short delay
        setTimeout(() => {
          router.push(`/game/${payload.gameId}`);
        }, 1500);
      });

      connection.onclose((error) => {
        // Silently handle connection close - backend might not be running
        if (error) {
          console.log("SignalR connection closed (backend may not be running)");
        }
      });

      connection
        .start()
        .then(() => {
          console.log("MatchmakingHub connected successfully");
          connectionRef.current = connection;
        })
        .catch((err) => {
          // Silently fail - backend might not be running, API calls will still work
          console.error("SignalR not available (backend may not be running)", err);
          connection = null;
        });
    } catch (err) {
      // Silently handle - SignalR is optional for basic functionality
      console.log("SignalR initialization failed", err);
    }

    return () => {
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
      if (connection) {
        // Only stop if connection is in a state that allows stopping
        if (connection.state === signalR.HubConnectionState.Connected) {
          connection.stop().catch(() => { });
        } else if (connection.state === signalR.HubConnectionState.Connecting) {
          // If still connecting, wait a bit then stop
          setTimeout(() => {
            if (connection && connection.state !== signalR.HubConnectionState.Disconnected) {
              connection.stop().catch(() => { });
            }
          }, 100);
        } else if (connection.state !== signalR.HubConnectionState.Disconnected) {
          connection.stop().catch(() => { });
        }
      }
    };
  }, [router]);

  // Poll for queue status while searching
  useEffect(() => {
    if (searching) {
      const backendGameType = gameType; // Use the actual game type
      statusIntervalRef.current = setInterval(async () => {
        try {
          const s = await apiFetch<QueueStatus>(`/api/Matchmaking/status?gameType=${backendGameType}`);
          setStatus(s);
        } catch {
          // Ignore errors
        }
      }, 2000); // Poll every 2 seconds
    } else {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
        statusIntervalRef.current = null;
      }
    }
    return () => {
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    };
  }, [searching, gameType]);

  async function joinQueue() {
    setSearching(true);
    setMatchFound(null);
    try {
      // Pass the specific game type to the backend so we have separate queues
      // Exception: "grid" is Neon Grid, which plays like TicTacToe for now
      let backendGameType = gameType;

      const response = await apiFetch<{ Message: string; GameId?: number; IsInQueue?: boolean; GameType?: string }>("/api/Matchmaking/join-queue", {
        method: "POST",
        body: JSON.stringify({ gameMode: "Ranked", GameType: backendGameType }),
      });

      if (response.GameId) {
        // Match found immediately!
        setMatchFound({ gameId: response.GameId, player1: 0, player2: 0 });
        setTimeout(() => {
          // Route to appropriate game page based on game type
          const actualGameType = response.GameType || backendGameType;

          if (actualGameType === "tictactoe" || actualGameType === "grid" || actualGameType === "TicTacToe") {
            router.push(`/tictactoe/${response.GameId}`);
          } else {
            // All other strategy games go to the main game engine
            router.push(`/game/${response.GameId}`);
          }
        }, 1500);
      } else {
        // In queue, start polling
        const s = await apiFetch<QueueStatus>(`/api/Matchmaking/status?gameType=${backendGameType}`);
        setStatus(s);
      }
    } catch (err) {
      console.error("Join queue error:", err);
      setSearching(false);
    }
  }

  async function leaveQueue() {
    try {
      await apiFetch("/api/Matchmaking/leave-queue", {
        method: "POST",
      });
      setSearching(false);
      setStatus(null);
    } catch {
      // Ignore
    }
  }

  const { role } = useAuthStore();

  return (
    <Protected requireRole="Player">
      <div className="flex">
        <Sidebar role={role || "Player"} />
        <div className="flex-1 transition-all duration-300" style={{ marginLeft: "280px" }}>
          <div className="relative min-h-screen">
            <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-2xl p-8"
              >
                <h1 className="text-3xl font-bold text-white mb-2">Matchmaking</h1>
                <p className="text-sm text-slate-400 mb-2">
                  Search for a ranked or casual opponent. You'll be automatically redirected to the game once a match is found.
                </p>
                {gameType && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-4 py-2">
                    <span className="text-xs font-medium text-emerald-300">Game Type:</span>
                    <span className="text-sm font-bold text-emerald-400">{gameTypeNames[gameType] || gameType}</span>
                  </div>
                )}
              </motion.div>

              {matchFound ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel rounded-2xl p-8 text-center border-2 border-emerald-500/50 bg-emerald-500/10"
                >
                  <div className="mb-4">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 mb-4">
                      <span className="text-3xl">🎮</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-400 mb-2">Match Found!</h2>
                  <p className="text-sm text-slate-300 mb-4">
                    Starting game #{matchFound.gameId}...
                  </p>
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
                </motion.div>
              ) : (
                <div className="glass-panel rounded-2xl p-8 space-y-6">
                  {!searching ? (
                    <>
                      <div className="text-center space-y-4">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-800/50">
                          <span className="text-4xl">⚔️</span>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-white mb-2">Ready to Play?</h2>
                          <p className="text-sm text-slate-400">
                            Click below to start searching for an opponent
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={joinQueue}
                        className="w-full rounded-full bg-emerald-500 px-6 py-4 text-base font-bold text-slate-950 hover:bg-emerald-400 hover:scale-105 transition-all shadow-lg shadow-emerald-500/30"
                      >
                        Start Ranked Search
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-center space-y-4">
                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
                        <div>
                          <h2 className="text-xl font-semibold text-white mb-2">Searching for opponent...</h2>
                          <p className="text-sm text-slate-400">
                            Please wait while we find you a match
                          </p>
                        </div>
                      </div>
                      {status && (
                        <div className="rounded-lg bg-slate-800/50 p-4 text-center">
                          <p className="text-xs text-slate-400 mb-1">Players in queue</p>
                          <p className="text-2xl font-bold text-emerald-400">{status.playersInQueue}</p>
                        </div>
                      )}
                      <button
                        onClick={leaveQueue}
                        className="w-full rounded-full border border-slate-700 bg-slate-900/50 px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800/80 hover:border-red-500/50 hover:text-red-300 transition-all"
                      >
                        Cancel Search
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Protected>
  );
}

