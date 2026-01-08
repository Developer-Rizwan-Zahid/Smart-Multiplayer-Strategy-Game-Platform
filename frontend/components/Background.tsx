"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Background() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden bg-slate-950">
            {/* Deep Space Gradient Base */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opactiy-80" />

            {/* Animated Grid Overlay */}
            <div
                className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
                style={{ maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)" }}
            />

            {/* Primary Glow Orbs (Strategy Focus Points) */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-[10%] left-[20%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[100px]"
            />
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-[20%] right-[10%] h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px]"
            />

            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.1, 0.3, 0.1],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                className="absolute -bottom-[20%] left-[30%] h-[600px] w-[600px] rounded-full bg-purple-500/10 blur-[120px]"
            />

            {/* Floating Particles (Tactical Nodes) */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
                            y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000),
                            opacity: Math.random() * 0.5 + 0.1,
                        }}
                        animate={{
                            y: [null, Math.random() * -100],
                            opacity: [null, Math.random() * 0.5 + 0.1, 0],
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="absolute h-1 w-1 rounded-full bg-slate-500"
                        style={{
                            boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(255,255,255,0.3)`
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
