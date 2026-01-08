"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import { Protected } from "../../../../components/Protected";
import { motion } from "framer-motion";

export default function GameResultPage() {
  const params = useParams<{ matchId: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const winner = search.get("winner");
  const isWinner = winner === "true";

  return (
    <Protected requireRole="Player">
      <div className="mx-auto max-w-xl px-4 py-10 space-y-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className={`text-6xl mb-4 ${isWinner ? "text-emerald-400" : "text-red-400"}`}>
            {isWinner ? "🏆" : "😔"}
          </div>
          <h1 className={`text-3xl font-bold ${isWinner ? "text-emerald-400" : "text-red-400"}`}>
            {isWinner ? "Victory!" : "Defeat"}
          </h1>
          <p className="text-sm text-slate-300">
            Game #{params.matchId} Finished
          </p>
          {search.get("points") && (
            <div className="py-2">
              <span className="text-sm text-slate-400">Points Earned</span>
              <div className={`text-4xl font-bold ${isWinner ? "text-amber-400" : "text-slate-500"}`}>
                +{search.get("points")}
              </div>
            </div>
          )}
          <p className="text-xs text-slate-400">
            {isWinner
              ? "Congratulations! You eliminated all enemy units or captured their base!"
              : "Better luck next time! Your opponent was victorious."}
          </p>
        </motion.div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => router.push("/matchmaking")}
            className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition-all hover:scale-105 shadow-lg shadow-emerald-500/30"
          >
            Play Again
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-full border border-slate-700 px-5 py-3 text-sm text-slate-200 hover:border-emerald-400 hover:text-emerald-300 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </Protected>
  );
}

