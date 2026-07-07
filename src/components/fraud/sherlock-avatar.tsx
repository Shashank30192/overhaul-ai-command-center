"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

// Sherlock's on-screen presence — a gold detective emblem that stays visibly
// "alive" rather than a static initial-in-a-circle. Three states map onto the
// existing agentic states already tracked by the onboarding flow (no new
// backend/state concepts — just visual interpretation of `processing` and
// whether Sherlock's line is actively changing):
//   idle      — waiting on the customer, slow breathing + periodic blink
//   thinking  — processing/validating (maps to existing `processing` boolean)
//   speaking  — actively delivering a new line (maps to sherlockLine changing)

export type SherlockState = "idle" | "thinking" | "speaking";

const GOLD = "#D4AF37";

function Blink() {
  const [blinking, setBlinking] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const cycle = () => {
      t = setTimeout(() => {
        setBlinking(true);
        setTimeout(() => setBlinking(false), 140);
        cycle();
      }, 3200 + Math.random() * 2600);
    };
    cycle();
    return () => clearTimeout(t);
  }, []);
  return (
    <motion.div
      className="absolute rounded-full bg-[#0d0f10]"
      style={{ width: 5, height: blinking ? 5 : 1, top: "42%", left: "50%", x: "-50%", y: "-50%" }}
      animate={{ height: blinking ? 5 : 1 }}
      transition={{ duration: 0.08 }}
    />
  );
}

export function SherlockAvatar({ state, size = 44 }: { state: SherlockState; size?: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Ambient glow ring — brightens when thinking/speaking */}
        <motion.div
          className="absolute -inset-1.5 rounded-full"
          style={{ background: `radial-gradient(circle, ${GOLD}33, transparent 70%)` }}
          animate={{
            opacity: state === "idle" ? [0.4, 0.6, 0.4] : [0.55, 0.85, 0.55],
            scale: state === "idle" ? [1, 1.04, 1] : [1, 1.08, 1],
          }}
          transition={{ duration: state === "idle" ? 3.4 : 1.1, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Breathing badge body */}
        <motion.div
          className="relative rounded-full flex items-center justify-center overflow-hidden"
          style={{
            width: size, height: size,
            background: "linear-gradient(155deg, #1a1c1e 0%, #0d0f10 100%)",
            border: `1.5px solid ${GOLD}66`,
            boxShadow: `0 0 0 1px rgba(0,0,0,0.4), 0 4px 14px -4px ${GOLD}40`,
          }}
          animate={{ scale: state === "idle" ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 3.4, repeat: state === "idle" ? Infinity : 0, ease: "easeInOut" }}
        >
          {/* "S" monogram, dims slightly under the magnifier on thinking */}
          <span
            className="font-bold select-none"
            style={{ fontSize: size * 0.34, color: GOLD, fontFamily: "var(--font-geist-sans, sans-serif)" }}
          >
            S
          </span>

          {/* Magnifying glass — sweeps while thinking, otherwise rests bottom-right */}
          <motion.div
            className="absolute"
            style={{ width: size * 0.46, height: size * 0.46 }}
            animate={
              state === "thinking"
                ? { rotate: [-8, 10, -8], x: [size * 0.1, size * 0.16, size * 0.1], y: [size * 0.1, size * 0.14, size * 0.1] }
                : { rotate: 0, x: size * 0.13, y: size * 0.13 }
            }
            transition={{ duration: 1.6, repeat: state === "thinking" ? Infinity : 0, ease: "easeInOut" }}
          >
            <Search className="h-full w-full" style={{ color: GOLD }} strokeWidth={2.5} />
          </motion.div>

          {state === "idle" && <Blink />}
        </motion.div>
      </div>

      {/* Speaking waveform */}
      {state === "speaking" && (
        <div className="flex items-end gap-[2px] h-2.5">
          {[0, 1, 2, 3].map((i) => (
            <motion.span
              key={i}
              className="w-[2.5px] rounded-full"
              style={{ background: GOLD }}
              animate={{ height: [3, 10, 4, 8, 3] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
            />
          ))}
        </div>
      )}
      {state === "thinking" && (
        <div className="flex items-center gap-0.5 h-2.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1 w-1 rounded-full"
              style={{ background: GOLD }}
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function sherlockStateFrom(processing: boolean, justSpoke: boolean): SherlockState {
  if (processing) return "thinking";
  if (justSpoke) return "speaking";
  return "idle";
}
