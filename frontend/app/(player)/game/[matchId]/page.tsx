"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import * as signalR from "@microsoft/signalr";
import { Protected } from "../../../../components/Protected";
import { apiFetch } from "../../../../lib/api";
import { useAuthStore } from "../../../../lib/auth-store";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, DragEndEvent, useDraggable, useDroppable, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

type Position = { x: number; y: number };

type GameUnit = {
  id: string;
  type: string;
  ownerId: string;
  position: Position;
  health?: number;
  maxHealth?: number;
};

type GameState = {
  units: GameUnit[];
  currentTurn: number;
  activePlayerId: string;
  resources?: { gold: number; mana: number };
  turnTimeRemaining?: number;
  turnStartTime?: string; // ISO Date string
  gameType?: string;
};

type ChatMessage = {
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
};

function DraggableUnit({ unit, isMyUnit, isOnBoard = false, children }: { unit: GameUnit; isMyUnit: boolean; isOnBoard?: boolean; children?: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: unit.id,
    disabled: !isMyUnit,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  if (isOnBoard) {
    // Compact version for board
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing ${isMyUnit ? "" : "pointer-events-none"
          }`}
      >
        {children || (
          <div className={`h-8 w-8 rounded-full ${isMyUnit ? "bg-emerald-500" : "bg-red-500"} flex items-center justify-center text-xs font-bold text-white`}>
            {unit.type[0].toUpperCase()}
          </div>
        )}
      </div>
    );
  }

  // Full version for sidebar
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing rounded-lg border-2 p-2 text-xs font-medium ${isMyUnit
        ? "border-emerald-500/70 bg-emerald-500/20 text-emerald-200"
        : "border-slate-600 bg-slate-800/50 text-slate-400 cursor-not-allowed"
        }`}
      whileHover={isMyUnit ? { scale: 1.05 } : {}}
    >
      <div className="font-semibold">{unit.type}</div>
      {unit.health !== undefined && (
        <div className="mt-1 h-1 w-full overflow-hidden rounded bg-slate-700">
          <div
            className="h-full bg-emerald-400 transition-all"
            style={{ width: `${((unit.health || 0) / (unit.maxHealth || 100)) * 100}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}

function BoardCell({ x, y, unit, onDrop, myConnectionId, children }: { x: number; y: number; unit?: GameUnit; onDrop: (unitId: string, x: number, y: number) => void; myConnectionId?: string | null; children?: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${x}-${y}`,
  });

  const isMyUnit = unit && unit.ownerId === myConnectionId;

  return (
    <div
      ref={setNodeRef}
      onClick={() => onDrop(unit?.id || "", x, y)}
      className={`relative h-12 w-12 rounded border-2 transition-all ${isOver
        ? "border-emerald-400 bg-emerald-500/20 scale-110"
        : unit
          ? isMyUnit
            ? "border-emerald-500/50 bg-emerald-500/10"
            : "border-red-500/50 bg-red-500/10"
          : "border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/70"
        }`}
    >
      {children || (unit && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`h-8 w-8 rounded-full ${isMyUnit ? "bg-emerald-500" : "bg-red-500"}`} />
        </div>
      ))}
    </div>
  );
}

export default function GameRoomPage() {
  const params = useParams<{ matchId: string }>();
  const router = useRouter();
  const gameId = params.matchId;
  const { username } = useAuthStore();
  const [state, setState] = useState<GameState | null>(null);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [chatConnection, setChatConnection] = useState<signalR.HubConnection | null>(null);
  const [myConnectionId, setMyConnectionId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [turnTimer, setTurnTimer] = useState(60);
  const [resources, setResources] = useState({ gold: 100, mana: 50 });
  const [aiSuggestion, setAiSuggestion] = useState<{ recommendation: string; winProbability: number; nextMove?: string } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  async function endTurn() {
    if (!state || !isMyTurn) return;
    try {
      const gameIdStr = String(gameId);
      await connection?.invoke("EndTurn", gameIdStr);
      setTurnTimer(60); // Reset local immediately for feedback, server sync will follow
    } catch (err) {
      console.error("Failed to end turn:", err);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const [gameType, setGameType] = useState<string>("Strategy");
  const [loadingGame, setLoadingGame] = useState(true);

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
    const token = typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;
    if (!token || !gameId) return;

    // Ensure gameId is a string
    const gameIdStr = String(gameId);
    let conn: signalR.HubConnection | null = null;
    let isMounted = true;

    async function init() {
      try {
        // 1. Fetch Game Details first to get GameType
        let fetchedType = "Strategy";
        try {
          const gameDetails = await apiFetch<{ gameType: string }>(`/api/Games/${gameIdStr}`);
          if (gameDetails && gameDetails.gameType) {
            fetchedType = gameDetails.gameType;
            if (isMounted) setGameType(fetchedType);
          }
        } catch (e) {
          console.warn("Failed to fetch game details, defaulting to Strategy", e);
        } finally {
          if (isMounted) setLoadingGame(false);
        }

        // 2. Connect to SignalR
        conn = new signalR.HubConnectionBuilder()
          .withUrl("http://localhost:5000/hubs/game", {
            accessTokenFactory: () => token!,
            skipNegotiation: false,
          })
          .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: (retryContext) => {
              if (retryContext.previousRetryCount >= 3) {
                return null;
              }
              return 2000;
            },
          })
          .build();

        conn.on("GameStateUpdated", (s: GameState) => {
          if (isMounted) {
            setState(s);
            if (s.resources) setResources(s.resources);

            // Sync timer based on server start time
            if (s.turnStartTime) {
              const startTime = new Date(s.turnStartTime).getTime();
              const now = new Date().getTime();
              // Adjust for client-server time drift if needed, but simplistic approach first:
              // Assume simplified 60s turn duration
              const elapsedSeconds = Math.floor((now - startTime) / 1000);
              const remaining = Math.max(0, 60 - elapsedSeconds);
              setTurnTimer(remaining);
            }
          }
        });

        conn.on("GameEnded", (payload: any) => {
          if (isMounted) {
            // Payload: { winnerUsername: string, points: number } or legacy winnerConnectionId (string)
            console.log("Game Ended Payload:", payload);

            let isWinner = false;
            let points = 0;

            if (typeof payload === 'object') {
              // New rich payload
              const winnerName = payload.winnerUsername;
              points = payload.points || 0;
              // Compare with our username
              const myUsername = useAuthStore.getState().username;
              isWinner = winnerName === myUsername;

              if (!isWinner) points = 20; // Consolation points
            } else {
              // Legacy fallback (shouldn't happen with new controller code but safety first)
              isWinner = payload === myConnectionId || payload === conn?.connectionId;
            }

            router.push(`/game-result/${gameIdStr}?winner=${isWinner ? "true" : "false"}&points=${points}`);
          }
        });

        conn.onclose((error) => {
          if (error && isMounted) {
            console.log("GameHub connection closed", error);
          }
        });

        await conn.start();

        if (conn && isMounted) {
          console.log("GameHub connected successfully");
          // Store connection ID for unit filtering
          setMyConnectionId(conn.connectionId || null);

          // Join Game with fetched GameType
          console.log(`Joining game ${gameIdStr} as ${fetchedType}`);
          conn.invoke("JoinGame", gameIdStr, fetchedType).catch((err) => {
            console.error("Failed to join game:", err);
          });
          setConnection(conn);
        }

      } catch (err) {
        console.log("GameHub initialization failed", err);
      }
    }

    init();

    return () => {
      isMounted = false;
      if (conn) {
        // Only stop if connection is in a state that allows stopping
        if (conn.state === signalR.HubConnectionState.Connected) {
          conn.invoke("LeaveGame", gameIdStr).catch(() => { }).finally(() => {
            conn?.stop().catch(() => { });
          });
        } else if (conn.state === signalR.HubConnectionState.Connecting) {
          // If still connecting, wait a bit then stop
          setTimeout(() => {
            if (conn && conn.state !== signalR.HubConnectionState.Disconnected) {
              conn.stop().catch(() => { });
            }
          }, 100);
        } else if (conn.state !== signalR.HubConnectionState.Disconnected) {
          conn.stop().catch(() => { });
        }
      }
    };
  }, [gameId, router]);

  // Setup ChatHub connection
  useEffect(() => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;
    if (!token || !gameId) return;

    const gameIdStr = String(gameId);
    let chatConn: signalR.HubConnection | null = null;
    let isMounted = true;

    try {
      chatConn = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5000/hubs/chat", {
          accessTokenFactory: () => token!,
          skipNegotiation: false,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount >= 3) {
              return null;
            }
            return 2000;
          },
        })
        .build();

      // Listen for chat messages - ChatHub sends "ReceiveMessage" event
      chatConn.on("ReceiveMessage", (user: string, message: string) => {
        if (isMounted) {
          const chatMsg: ChatMessage = {
            senderId: user,
            senderName: user,
            message: message,
            timestamp: new Date(),
          };
          setChatMessages((prev) => [...prev, chatMsg]);
        }
      });

      chatConn.onclose((error) => {
        if (error && isMounted) {
          console.log("ChatHub connection closed", error);
        }
      });

      chatConn
        .start()
        .then(() => {
          if (chatConn && isMounted) {
            console.log("ChatHub connected successfully");
            chatConn.invoke("JoinChat", gameIdStr).catch((err) => {
              console.error("Failed to join chat:", err);
            });
            setChatConnection(chatConn);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.error("ChatHub connection failed:", err);
            // Don't set chatConn to null immediately, let automatic reconnect handle it
          }
        });
    } catch (err) {
      console.log("ChatHub initialization failed", err);
    }

    return () => {
      isMounted = false;
      if (chatConn) {
        // Only stop if connection is in a state that allows stopping
        if (chatConn.state === signalR.HubConnectionState.Connected) {
          chatConn.invoke("LeaveChat", gameIdStr).catch(() => { }).finally(() => {
            chatConn?.stop().catch(() => { });
          });
        } else if (chatConn.state === signalR.HubConnectionState.Connecting) {
          // If still connecting, wait a bit then stop
          setTimeout(() => {
            if (chatConn && chatConn.state !== signalR.HubConnectionState.Disconnected) {
              chatConn.stop().catch(() => { });
            }
          }, 100);
        } else if (chatConn.state !== signalR.HubConnectionState.Disconnected) {
          chatConn.stop().catch(() => { });
        }
      }
    };
  }, [gameId]);

  useEffect(() => {
    // Only run timer if we have a valid state
    if (state) {
      timerIntervalRef.current = setInterval(() => {
        setTurnTimer((prev) => {
          if (prev <= 0) return 0;
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [state]); // Depend on state to restart interval on updates if needed, though simpler is just one interval.

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || !state) return;

    const unitId = active.id as string;
    const cellId = over.id as string;
    const match = cellId.match(/cell-(\d+)-(\d+)/);
    if (!match) return;

    const x = parseInt(match[1]);
    const y = parseInt(match[2]);

    try {
      const gameIdStr = String(gameId);
      await apiFetch(`/api/Games/${gameIdStr}/move`, {
        method: "POST",
        body: JSON.stringify({ unitId, targetX: x, targetY: y, actionType: "Move" }),
      });
      if (connection) {
        await connection.invoke("SendMove", gameIdStr, {
          unitId,
          targetPosition: { x, y },
        });
      }
    } catch { }
  }

  async function fetchAiSuggestion(gameState: GameState) {
    if (!isMyTurn) return; // Only get AI suggestions on your turn

    setLoadingAi(true);
    try {
      const gameIdStr = String(gameId);
      const aiRes = await apiFetch<string>("/api/Ai/analyze-match", {
        method: "POST",
        body: JSON.stringify({
          gameId: gameIdStr,
          gameState: {
            units: gameState.units,
            currentTurn: gameState.currentTurn,
            resources: resources,
          },
        }),
      });
      const parsed = JSON.parse(aiRes) as { recommendation: string; winProbability: number; nextMove?: string };
      setAiSuggestion(parsed);
    } catch {
      // Silently fail - AI is optional
    } finally {
      setLoadingAi(false);
    }
  }

  async function sendChatMessage() {
    if (!chatInput.trim()) return;

    const messageToSend = chatInput;
    const senderName = username || "You";
    setChatInput("");

    // Send via SignalR ChatHub if available
    if (chatConnection) {
      try {
        const gameIdStr = String(gameId);
        await chatConnection.invoke("SendMessage", gameIdStr, senderName, messageToSend);
      } catch (err) {
        console.error("Failed to send chat message:", err);
        // Add message locally as fallback
        const localMessage: ChatMessage = {
          senderId: "me",
          senderName: senderName,
          message: messageToSend,
          timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, localMessage]);
      }
    } else {
      // Fallback: add message locally if chat connection not available
      const localMessage: ChatMessage = {
        senderId: "me",
        senderName: senderName,
        message: messageToSend,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, localMessage]);
    }
  }

  async function endGame() {
    try {
      const gameIdStr = String(gameId);
      await apiFetch(`/api/Games/${gameIdStr}/end?winnerId=1`, { method: "POST" });
    } catch { }
  }

  // Filter units by connectionId - backend uses connectionId as OwnerId
  // Use Set to ensure unique units by ID to prevent duplicate keys
  const allUnits = state?.units || [];
  const uniqueUnits = Array.from(new Map(allUnits.map(u => [u.id, u])).values());

  const myUnits = uniqueUnits.filter((u) => u.ownerId === myConnectionId || u.ownerId === connection?.connectionId);
  const enemyUnits = uniqueUnits.filter((u) => u.ownerId !== myConnectionId && u.ownerId !== connection?.connectionId);
  const isMyTurn = state?.activePlayerId === myConnectionId || state?.activePlayerId === connection?.connectionId;

  // Fetch AI suggestion when it's your turn
  useEffect(() => {
    if (isMyTurn && state) {
      fetchAiSuggestion(state);
    }
  }, [isMyTurn, state?.currentTurn]);


  const getTheme = (type: string) => {
    switch (type.toLowerCase()) {
      case "conquest":
        return {
          bg: "bg-[url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center",
          boardBg: "bg-slate-950/80 backdrop-blur-sm border-emerald-500/30",
          cell: "border-emerald-500/20 hover:border-emerald-400/50 hover:bg-emerald-500/10",
          accent: "text-emerald-400",
          name: "Galactic Conquest"
        };
      case "clans":
        return {
          bg: "bg-[url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1968&auto=format&fit=crop')] bg-cover bg-center",
          boardBg: "bg-stone-900/80 backdrop-blur-sm border-orange-500/30",
          cell: "border-stone-600/40 hover:border-orange-400/50 hover:bg-orange-500/10",
          accent: "text-orange-400",
          name: "Clans & Kingdoms"
        };
      case "grid":
        return {
          bg: "bg-slate-950", // Fallback or distinct gradient
          boardBg: "bg-black/90 border-fuchsia-500/50 shadow-[0_0_50px_rgba(217,70,239,0.2)]",
          cell: "border-fuchsia-500/30 hover:border-fuchsia-400 hover:shadow-[0_0_15px_rgba(217,70,239,0.4)] transition-all duration-300",
          accent: "text-fuchsia-400",
          name: "Neon Grid"
        };
      case "arena":
        return {
          bg: "bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center",
          boardBg: "bg-slate-900/90 border-blue-500/30",
          cell: "border-blue-500/20 hover:border-blue-400/50 hover:bg-blue-500/10",
          accent: "text-blue-400",
          name: "Tactical Arena"
        };
      case "racing":
        return {
          bg: "bg-[url('https://images.unsplash.com/photo-1535131749006-b7f58c990d4b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center",
          boardBg: "bg-slate-900/80 skew-x-[-12deg] border-yellow-500/30 origin-center scale-95", // Racing style skew
          cell: "border-slate-700 hover:border-yellow-400 hover:bg-yellow-500/10",
          accent: "text-yellow-400",
          name: "Nebula Racing"
        };
      case "chess":
        return {
          bg: "bg-[url('https://images.unsplash.com/photo-1586165368502-1bad197a6461?q=80&w=2158&auto=format&fit=crop')] bg-cover bg-center",
          boardBg: "bg-slate-900/95 border-indigo-500/30",
          cell: "border-indigo-500/10 odd:bg-indigo-500/5 hover:bg-indigo-500/20", // Checkerboard hint
          accent: "text-indigo-400",
          name: "Void Chess"
        };
      case "cards":
        return {
          bg: "bg-[url('https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2064&auto=format&fit=crop')] bg-cover bg-center",
          boardBg: "bg-slate-900/90 border-purple-500/30",
          cell: "border-purple-500/20 hover:border-purple-400 hover:bg-purple-500/10",
          accent: "text-purple-400",
          name: "Dynasty Cards"
        };

      case "arena":
        return {
          bg: "bg-[url('https://images.unsplash.com/photo-1518546305927-5a397d1b3472?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center", // Stone ruins
          boardBg: "bg-stone-900/90 border-stone-600 shadow-[0_0_30px_rgba(0,0,0,0.8)]",
          cell: "border-stone-700 bg-stone-800/60 hover:bg-stone-700/80",
          accent: "text-amber-500",
          name: "Tactical Arena"
        };

      case "tictactoe":
        return {
          bg: "bg-[url('https://images.unsplash.com/photo-1541140911139-49dd1502479e?q=80&w=2692&auto=format&fit=crop')] bg-cover bg-center", // Wooden texture
          boardBg: "bg-[#5D4037]/90 border-[#8D6E63] shadow-[0_0_20px_rgba(62,39,35,0.8)]",
          cell: "border-[#A1887F] bg-[#4E342E] hover:bg-[#6D4C41]",
          accent: "text-[#D7CCC8]",
          name: "Tic Tac Toe"
        };

      // Default / Strategy
      default:
        return {
          bg: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black",
          boardBg: "glass-panel",
          cell: "border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/70",
          accent: "text-emerald-400",
          name: "Strategy Game"
        };
    }
  };

  const theme = getTheme(state?.gameType || gameType);
  const isTicTacToe = (state?.gameType || gameType).toLowerCase() === "tictactoe";
  const isArena = (state?.gameType || gameType).toLowerCase() === "arena";

  return (
    <Protected requireRole="Player">
      <div className={`relative min-h-screen ${theme.bg}`}>
        {/* Overlay for better text readability on image backgrounds */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 py-6 space-y-4">
          {/* Header */}
          <div className={`flex items-center justify-between rounded-xl p-4 backdrop-blur-md border ${theme.boardBg}`}>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {theme.name} <span className={theme.accent}>#{gameId}</span>
              </h1>
              <p className="text-xs text-slate-300 mt-1">Match in progress</p>
            </div>
            {/* ... controls ... */}
            <div className="flex items-center gap-4">
              {isMyTurn ? (
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 rounded-full ${theme.accent.replace('text-', 'bg-')}/20 border ${theme.accent.replace('text-', 'border-')}/50 px-4 py-2`}>
                    <div className={`h-2 w-2 rounded-full ${theme.accent.replace('text-', 'bg-')} animate-pulse`} />
                    <span className={`text-xs font-medium ${theme.accent}`}>Your Turn</span>
                    <span className={`text-xs ${theme.accent.replace('400', '200')} font-mono`}>{turnTimer}s</span>
                  </div>
                  {/* End Turn Button - Hide for TTT as moves end turn automatically */}
                  {!isTicTacToe &&
                    <button
                      onClick={endTurn}
                      className={`flex items-center gap-2 rounded-full bg-gradient-to-r from-${theme.accent.split('-')[1]}-500 to-${theme.accent.split('-')[1]}-600 px-6 py-2 text-sm font-bold text-white shadow-lg hover:scale-105 transition-all active:scale-95`}
                    >
                      <span>End Turn</span>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  }
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-full bg-slate-800/50 border border-slate-700 px-4 py-2">
                  <span className="text-xs text-slate-400">Enemy Turn</span>
                  <span className="text-xs text-slate-500 font-mono">{turnTimer}s</span>
                </div>
              )}
              <button
                onClick={endGame}
                className="rounded-full border border-red-500/70 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-300 hover:bg-red-500/20 transition-colors"
              >
                End Game
              </button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr,300px]">
            {/* Main Game Board */}
            <div className="space-y-4">
              <div className={`rounded-xl p-6 backdrop-blur-md border ${theme.boardBg}`}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Game Board</h2>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${theme.accent.replace('text-', 'bg-')}`} />
                      <span>Your Units</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <span>Enemy Units</span>
                    </div>
                  </div>
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <div className={`grid gap-2 p-4 rounded-lg relative ${isTicTacToe ? 'grid-cols-3 max-w-md mx-auto aspect-square' : `grid-cols-12 ${theme.bg === 'bg-slate-950' ? '' : 'bg-slate-950/50'}`}`}>
                    {Array.from({ length: isTicTacToe ? 9 : 8 * 12 }).map((_, i) => {
                      const x = isTicTacToe ? i % 3 : i % 12;
                      const y = isTicTacToe ? Math.floor(i / 3) : Math.floor(i / 12);
                      const unit = state?.units.find((u) => u.position.x === x && u.position.y === y);
                      const isMyUnit = unit && (unit.ownerId === myConnectionId || unit.ownerId === connection?.connectionId);

                      return (
                        <BoardCell
                          key={`${x}-${y}`}
                          x={x}
                          y={y}
                          unit={unit}
                          myConnectionId={myConnectionId}
                          onDrop={(unitId, tx, ty) => {
                            if (isTicTacToe) {
                              // For TTT, we just click to place, but reusing drop handler for now.
                              // Actually better to have explicit click if it's TTT.
                              // But BoardCell calls onDrop on click.
                              // We need to send a "Move" action but with a dummy unit ID since TTT places NEW units.
                              const dummyUnitId = "marker";
                              connection?.invoke("SendMove", String(gameId), { UnitId: dummyUnitId, TargetPosition: { X: tx, Y: ty } });
                            } else {
                              handleDragEnd({ active: { id: unitId }, over: { id: `cell-${tx}-${ty}` } } as DragEndEvent);
                            }
                          }}
                        >
                          {/* Pass theme-specific classes to cell */}
                          <div className={`absolute inset-0 rounded transition-all ${theme.cell}`} />

                          {unit ? (
                            isTicTacToe ? (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className={`text-6xl font-bold font-serif ${unit.type === 'X' ? 'text-red-800' : 'text-amber-100'} drop-shadow-lg`}>
                                  {unit.type}
                                </span>
                              </div>
                            ) :
                              (/* Arena OR Standard Strategy */
                                isMyUnit ? (
                                  <DraggableUnit unit={unit} isMyUnit={true} isOnBoard={true}>
                                    {isArena ? (
                                      <>
                                        {unit.type.includes('hero') && <span className="text-2xl drop-shadow-md">🛡️</span>}
                                        {unit.type.includes('sniper') && <span className="text-2xl drop-shadow-md">🎯</span>}
                                        {unit.type.includes('medic') && <span className="text-2xl drop-shadow-md">🩹</span>}
                                        {!['hero', 'sniper', 'medic'].some(t => unit.type.includes(t)) && (
                                          <div className={`h-8 w-8 rounded-full ${isMyUnit ? "bg-amber-600" : "bg-red-600"} border-2 border-stone-400 flex items-center justify-center shadow-lg`}>
                                            <span className="text-xs font-bold text-white">{unit.type[0].toUpperCase()}</span>
                                          </div>
                                        )}
                                      </>
                                    ) : null /* Default renders fallback in component */}
                                  </DraggableUnit>
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    {isArena ? (
                                      <>
                                        {unit.type.includes('hero') && <span className="text-2xl drop-shadow-md">🛡️</span>}
                                        {unit.type.includes('sniper') && <span className="text-2xl drop-shadow-md">🎯</span>}
                                        {unit.type.includes('medic') && <span className="text-2xl drop-shadow-md">🩹</span>}
                                        {!['hero', 'sniper', 'medic'].some(t => unit.type.includes(t)) && (
                                          <div className={`h-8 w-8 rounded-full ${isMyUnit ? "bg-amber-600" : "bg-red-600"} border-2 border-stone-400 flex items-center justify-center shadow-lg`}>
                                            <span className="text-xs font-bold text-white">{unit.type[0].toUpperCase()}</span>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold text-white relative z-10">
                                        {unit.type[0].toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                )
                              )
                          ) : isTicTacToe && isMyTurn ? (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                              <div className="text-4xl text-white/20">?</div>
                            </div>
                          ) : null}
                        </BoardCell>
                      );
                    })}
                  </div>
                </DndContext>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>Turn: {state?.currentTurn ?? 1}</span>
                  <span>Units on board: {state?.units.length ?? 0}</span>
                </div>
              </div>

              {/* Resources */}
              <div className="glass-panel rounded-xl p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Resources</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
                    <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">💰</div>
                    <div>
                      <p className="text-xs text-slate-400">Gold</p>
                      <p className="text-lg font-bold text-amber-400">{resources.gold}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-blue-500/10 border border-blue-500/30 p-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">✨</div>
                    <div>
                      <p className="text-xs text-slate-400">Mana</p>
                      <p className="text-lg font-bold text-blue-400">{resources.mana}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Units Panel */}
              <div className="glass-panel rounded-xl p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Your Units</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    {myUnits.length > 0 ? (
                      myUnits.map((unit) => (
                        <DraggableUnit key={unit.id} unit={unit} isMyUnit={true} />
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-4">No units available</p>
                    )}
                  </DndContext>
                </div>
              </div>

              {/* Enemy Units */}
              <div className="glass-panel rounded-xl p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Enemy Units</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {enemyUnits.length > 0 ? (
                    enemyUnits.map((unit) => (
                      <div
                        key={unit.id}
                        className="rounded-lg border-2 border-slate-600 bg-slate-800/50 p-2 text-xs text-slate-400"
                      >
                        <div className="font-semibold">{unit.type}</div>
                        {unit.health !== undefined && (
                          <div className="mt-1 h-1 w-full overflow-hidden rounded bg-slate-700">
                            <div
                              className="h-full bg-red-400 transition-all"
                              style={{ width: `${((unit.health || 0) / (unit.maxHealth || 100)) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-2">No enemy units visible</p>
                  )}
                </div>
              </div>

              {/* AI Move Suggestions */}
              {isMyTurn && (
                <div className="glass-panel rounded-xl p-4 border-2 border-emerald-500/30 bg-emerald-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-emerald-400 text-lg">🤖</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white">AI Coach</h3>
                    {loadingAi && (
                      <div className="ml-auto h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-r-transparent"></div>
                    )}
                  </div>
                  {aiSuggestion ? (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-300 leading-relaxed">{aiSuggestion.recommendation}</p>
                      {aiSuggestion.nextMove && (
                        <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-2">
                          <p className="text-[10px] text-slate-400 mb-1">Suggested Move:</p>
                          <p className="text-xs font-medium text-emerald-400">{aiSuggestion.nextMove}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20">
                        <span className="text-[10px] text-slate-400">Win Probability</span>
                        <span className="text-xs font-bold text-emerald-400">
                          {(aiSuggestion.winProbability * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      {loadingAi ? "Analyzing game state..." : "AI suggestions will appear here during your turn."}
                    </p>
                  )}
                </div>
              )}

              {/* Chat */}
              <div className="glass-panel rounded-xl p-4 flex flex-col h-64">
                <h3 className="text-sm font-semibold text-white mb-3">In-Game Chat</h3>
                <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                  <AnimatePresence>
                    {chatMessages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs"
                      >
                        <span className="font-medium text-emerald-400">{msg.senderName}:</span>
                        <span className="text-slate-300 ml-2">{msg.message}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={chatEndRef} />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-50 outline-none ring-emerald-500/60 focus:ring"
                  />
                  <button
                    onClick={sendChatMessage}
                    className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-emerald-400 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Protected>
  );
}
