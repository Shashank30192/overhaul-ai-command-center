"use client";

import Image from "next/image";
import { motion } from "framer-motion";

// Sherlock's on-screen presence — his real portrait, kept visibly "alive"
// with motion layered on top rather than a static headshot. Three states
// map onto agentic states the onboarding flow already tracks (no new
// backend/state concepts — just a visual read of `processing` and whether
// Sherlock's line just changed):
//   idle      — waiting on the customer, slow breathing + soft glow
//   thinking  — processing/validating (maps to existing `processing` boolean)
//   speaking  — actively delivering a new line (maps to sherlockLine changing)

export type SherlockState = "idle" | "thinking" | "speaking";

const GOLD = "#D4AF37";

export function SherlockAvatar({ state, size = 44 }: { state: SherlockState; size?: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Ambient glow ring — brightens when thinking/speaking */}
        <motion.div
          className="absolute -inset-1.5 rounded-full"
          style={{ background: `radial-gradient(circle, ${GOLD}40, transparent 70%)` }}
          animate={{
            opacity: state === "idle" ? [0.4, 0.6, 0.4] : [0.6, 0.9, 0.6],
            scale: state === "idle" ? [1, 1.04, 1] : [1, 1.08, 1],
          }}
          transition={{ duration: state === "idle" ? 3.4 : 1.1, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Breathing portrait */}
        <motion.div
          className="relative rounded-full overflow-hidden"
          style={{
            width: size, height: size,
            border: `1.5px solid ${GOLD}88`,
            boxShadow: `0 0 0 1px rgba(0,0,0,0.4), 0 4px 14px -4px ${GOLD}50`,
          }}
          animate={{ scale: state === "idle" ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 3.4, repeat: state === "idle" ? Infinity : 0, ease: "easeInOut" }}
        >
          <Image
            src="/avatars/sherlock-square.png"
            alt="Sherlock"
            width={size}
            height={size}
            className="h-full w-full object-cover"
            priority
          />

          {/* Thinking — a soft scanning sweep across the portrait */}
          {state === "thinking" && (
            <motion.div
              className="absolute inset-x-0 h-1/3 pointer-events-none"
              style={{ background: `linear-gradient(180deg, transparent, ${GOLD}30, transparent)` }}
              initial={{ top: "-33%" }}
              animate={{ top: "100%" }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* Speaking — a subtle warm rim-light */}
          {state === "speaking" && (
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-full"
              style={{ boxShadow: `inset 0 0 10px 1px ${GOLD}70` }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
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
