"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import * as signalR from "@microsoft/signalr";
import { Protected } from "../../../../components/Protected";
import { apiFetch } from "../../../../lib/api";
import { useAuthStore } from "../../../../lib/auth-store";
import { motion } from "framer-motion";

type TicTacToeState = {
  board: (string | null)[][];
  currentPlayer: string;
  winner: string | null;
  gameOver: boolean;
};

export default function TicTacToePage() {
  const params = useParams<{ matchId: string }>();
  const router = useRouter();
  const gameId = params.matchId;
  const { username } = useAuthStore();
  const [state, setState] = useState<TicTacToeState | null>(null);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [mySymbol, setMySymbol] = useState<string | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;
    if (!token || !gameId) return;

    const gameIdStr = String(gameId);
    let conn: signalR.HubConnection | null = null;
    let isMounted = true;

    try {
      conn = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5000/hubs/tictactoe", {
          accessTokenFactory: () => token!,
          skipNegotiation: false,
        })
        .withAutomaticReconnect()
        .build();

      conn.on("GameStateUpdated", (s: { Board: string[][]; CurrentPlayer: string; Winner?: string; GameOver?: boolean; PlayerXConnectionId?: string; PlayerOConnectionId?: string }) => {
        if (isMounted) {
          // Convert board from nested array format
          const board: (string | null)[][] = [];
          for (let i = 0; i < 3; i++) {
            board[i] = [];
            for (let j = 0; j < 3; j++) {
              const cellValue = s.Board?.[i]?.[j];
              board[i][j] = !cellValue || cellValue.trim() === "" ? null : cellValue;
            }
          }

          setState({
            board,
            currentPlayer: s.CurrentPlayer,
            winner: s.Winner || null,
            gameOver: s.GameOver || false,
          });

          // Determine my symbol
          if (conn && !mySymbol) {
            const connId = conn.connectionId;
            if (connId === s.PlayerXConnectionId) {
              setMySymbol("X");
            } else if (connId === s.PlayerOConnectionId) {
              setMySymbol("O");
            }
          }

          // Update turn status
          const currentSymbol = conn && conn.connectionId === s.PlayerXConnectionId ? "X" : 
                               conn && conn.connectionId === s.PlayerOConnectionId ? "O" : null;
          setIsMyTurn(s.CurrentPlayer === currentSymbol);
        }
      });

      conn.on("GameEnded", (winnerConnectionId: string) => {
        if (isMounted) {
          const isWinner = winnerConnectionId === conn?.connectionId || winnerConnectionId === mySymbol;
          router.push(`/game-result/${gameIdStr}?winner=${isWinner ? "true" : "false"}`);
        }
      });

      conn.on("Error", (error: string) => {
        console.error("TicTacToeHub error:", error);
      });

      conn
        .start()
        .then(() => {
          if (conn && isMounted) {
            console.log("TicTacToeHub connected successfully");
            conn.invoke("JoinGame", gameIdStr).catch((err) => {
              console.error("Failed to join Tic Tac Toe game:", err);
            });
            setConnection(conn);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.error("TicTacToeHub connection failed:", err);
          }
        });
    } catch (err) {
      console.log("TicTacToeHub initialization failed", err);
    }

    return () => {
      isMounted = false;
      if (conn) {
        if (conn.state === signalR.HubConnectionState.Connected) {
          conn.invoke("LeaveGame", gameIdStr).catch(() => {}).finally(() => {
            conn?.stop().catch(() => {});
          });
        } else {
          conn.stop().catch(() => {});
        }
      }
    };
  }, [gameId, router, mySymbol]);

  async function handleCellClick(row: number, col: number) {
    if (!state || !isMyTurn || state.gameOver || state.board[row][col] !== null) return;

    if (connection) {
      try {
        const gameIdStr = String(gameId);
        await connection.invoke("MakeMove", gameIdStr, row, col);
      } catch (err) {
        console.error("Failed to make move:", err);
      }
    }
  }

  return (
    <Protected requireRole="Player">
      <div className="relative min-h-screen">
        <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
          {/* Header */}
          <div className="glass-panel rounded-xl p-4">
            <h1 className="text-2xl font-bold text-white">Tic Tac Toe - Game #{gameId}</h1>
            <p className="text-xs text-slate-400 mt-1">
              {state?.gameOver 
                ? state.winner === "Draw" 
                  ? "Game ended in a draw!" 
                  : `Winner: ${state.winner}!`
                : isMyTurn 
                  ? `Your turn (${mySymbol})` 
                  : `Waiting for opponent...`}
            </p>
          </div>

          {/* Game Board */}
          <div className="glass-panel rounded-xl p-6 flex justify-center">
            <div className="grid grid-cols-3 gap-2">
              {state?.board.map((row, i) =>
                row.map((cell, j) => (
                  <motion.button
                    key={`${i}-${j}`}
                    onClick={() => handleCellClick(i, j)}
                    disabled={!isMyTurn || cell !== null || state.gameOver}
                    className={`h-20 w-20 rounded-lg border-2 text-3xl font-bold transition-all ${
                      cell === null
                        ? isMyTurn && !state.gameOver
                          ? "border-emerald-500/50 bg-slate-800/50 hover:bg-emerald-500/20 cursor-pointer"
                          : "border-slate-700 bg-slate-900/50 cursor-not-allowed"
                        : cell === "X"
                        ? "border-emerald-500/70 bg-emerald-500/20 text-emerald-400"
                        : "border-blue-500/70 bg-blue-500/20 text-blue-400"
                    }`}
                    whileHover={cell === null && isMyTurn && !state.gameOver ? { scale: 1.05 } : {}}
                    whileTap={cell === null && isMyTurn && !state.gameOver ? { scale: 0.95 } : {}}
                  >
                    {cell || ""}
                  </motion.button>
                ))
              )}
            </div>
          </div>

          {/* Game Info */}
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">You are playing as</p>
                <p className="text-2xl font-bold text-emerald-400">{mySymbol || "..."}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Current Turn</p>
                <p className="text-xl font-bold text-white">{state?.currentPlayer || "..."}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Protected>
  );
}
