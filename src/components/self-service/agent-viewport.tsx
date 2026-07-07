"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, MousePointer2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { getScreen, SCREEN_HOTSPOTS, SCREEN_LABELS, type Hotspot } from "./workflow-screens";
import type { ScreenId } from "@/lib/mock/self-service-workflows";

interface ViewportProps {
  currentScreen: ScreenId;
  activeHotspot: Hotspot | null;
  isClicking: boolean;
  thought: string;
  actionLabel: string;
  stepIndex: number;
  totalSteps: number;
  isIdle: boolean;
}

// Words that describe the element kind, not its identity — ignored when
// matching a hotspot label against on-screen text
const LOCATOR_STOPWORDS = new Set([
  "the", "and", "with", "for", "nav", "link", "tab", "button", "field",
  "panel", "box", "pill", "marker", "row", "header",
]);

// Locate the actual rendered element for a hotspot label inside the live
// screen DOM. Returns its center as a % of the viewport, or null if the
// element isn't on screen — the caller falls back to static coordinates.
function locateElement(container: HTMLElement, screenRoot: HTMLElement, label: string): { x: number; y: number } | null {
  const tokens = label.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 3 && !LOCATOR_STOPWORDS.has(w));
  if (tokens.length === 0) return null;
  const cr = container.getBoundingClientRect();
  if (cr.width === 0 || cr.height === 0) return null;

  let best: { el: Element; score: number; len: number } | null = null;
  for (const el of Array.from(screenRoot.querySelectorAll("*"))) {
    if (el.childElementCount > 3) continue;
    const text = (el.textContent ?? "").trim().toLowerCase();
    if (!text || text.length > 90) continue;
    let score = 0;
    for (const tok of tokens) if (text.includes(tok)) score++;
    if (score === 0) continue;
    if (!best || score > best.score || (score === best.score && text.length < best.len)) {
      best = { el, score, len: text.length };
    }
  }
  if (!best) return null;

  const r = best.el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  const x = ((r.left + r.width / 2 - cr.left) / cr.width) * 100;
  const y = ((r.top + r.height / 2 - cr.top) / cr.height) * 100;
  if (y < -5 || y > 110 || x < -5 || x > 110) return null; // clipped off-screen
  return { x: Math.min(Math.max(x, 2), 97), y: Math.min(Math.max(y, 4), 94) };
}

function CursorRipple({ x, y }: { x: number; y: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
      initial={{ scale: 0.5, opacity: 1 }}
      animate={{ scale: 2.5, opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="h-8 w-8 rounded-full border-2 border-blue-400" />
    </motion.div>
  );
}

export function AgentViewport({
  currentScreen,
  activeHotspot,
  isClicking,
  thought,
  actionLabel,
  stepIndex,
  totalSteps,
  isIdle,
}: ViewportProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [clickRipples, setClickRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleId = useRef(0);

  // DOM-resolved target: find the real rendered element for the hotspot label
  // and aim the cursor at its true position. Retries cover the screen
  // crossfade; static hotspot coords remain the fallback.
  const [domTarget, setDomTarget] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    setDomTarget(null);
    if (!activeHotspot) return;
    const timers = [120, 450, 900].map((ms) =>
      setTimeout(() => {
        const vp = viewportRef.current;
        const root = vp?.querySelector("[data-screen-root]") as HTMLElement | null;
        if (!vp || !root) return;
        const pos = locateElement(vp, root, activeHotspot.label);
        if (pos) setDomTarget(pos);
      }, ms)
    );
    return () => timers.forEach(clearTimeout);
  }, [activeHotspot, currentScreen]);

  // Where the cursor actually aims: live DOM position, else static hotspot
  const target = activeHotspot ? (domTarget ?? activeHotspot) : null;

  useEffect(() => {
    if (isClicking && target) {
      const id = rippleId.current++;
      setClickRipples((prev) => [...prev, { id, x: target.x, y: target.y }]);
      setTimeout(() => {
        setClickRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClicking]);

  const hotspots = activeHotspot ? [activeHotspot] : (SCREEN_HOTSPOTS[currentScreen] ?? []);
  const cursorPos = target ?? hotspots[0] ?? { x: 50, y: 50 };

  // Derive the action kind from the label verb so typing/reading get
  // distinct visual treatments at the hotspot
  const actionKind = actionLabel.startsWith("Typing") ? "type"
    : actionLabel.startsWith("Reading") ? "read"
    : actionLabel.startsWith("Navigating") ? "navigate"
    : "click";

  return (
    <div className="flex flex-col h-full">
      {/* Viewport header */}
      <div className="shrink-0 px-4 py-2.5 border-b border-[var(--mil-border)] bg-[var(--mil-panel)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--mil-muted)]">
            Agent Viewport
          </span>
          <span className="text-[10px] text-white/40">—</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentScreen}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="text-[11px] text-white/70 font-medium"
            >
              {SCREEN_LABELS[currentScreen]}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2">
          {!isIdle && (
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-300">Agent Active</span>
            </div>
          )}
          {totalSteps > 0 && (
            <span className="text-[10px] text-[var(--mil-muted)]">
              Step {Math.min(stepIndex + 1, totalSteps)} / {totalSteps}
            </span>
          )}
        </div>
      </div>

      {/* Viewport body */}
      <div className="flex-1 relative overflow-hidden bg-[#0d1210]" ref={viewportRef}>
        {/* Screen content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            data-screen-root
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            {getScreen(currentScreen, actionLabel)}
          </motion.div>
        </AnimatePresence>

        {/* Idle overlay */}
        {isIdle && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0d1210]/60">
            <div className="text-center">
              <Eye className="h-8 w-8 text-emerald-400/40 mx-auto mb-2" />
              <p className="text-xs text-white/20">Waiting for goal…</p>
            </div>
          </div>
        )}

        {/* Targeting dot — shows where cursor is headed */}
        {!isIdle && target && (
          <motion.div
            className="absolute pointer-events-none z-20"
            animate={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              opacity: 1,
            }}
            style={{ transform: "translate(-50%, -50%)" }}
            initial={{ left: `${target.x}%`, top: `${target.y}%`, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
          >
            {actionKind === "read" ? (
              /* Reading — amber scanning box sweeping over the element */
              <>
                <motion.div
                  className="absolute rounded-md border border-amber-400/50 bg-amber-400/5"
                  style={{ width: 120, height: 40, top: -20, left: -60 }}
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute w-[120px] h-0.5 bg-amber-400/70"
                  style={{ top: -20, left: -60 }}
                  animate={{ y: [0, 38, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </>
            ) : actionKind === "type" ? (
              /* Typing — teal input focus ring with blinking caret */
              <>
                <motion.div
                  className="absolute rounded-md border-2 border-[#00c2b2]/60 bg-[#00c2b2]/5"
                  style={{ width: 130, height: 30, top: -15, left: -65 }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <motion.div
                  className="absolute w-0.5 h-4 bg-[#00c2b2]"
                  style={{ top: -8, left: -55 }}
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.7, repeat: Infinity }}
                />
              </>
            ) : (
              /* Click / navigate — blue crosshair rings */
              <>
                <motion.div
                  className="absolute rounded-full border border-blue-400/60"
                  style={{ width: 32, height: 32, top: -16, left: -16 }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.2, 0.6] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="h-1.5 w-1.5 rounded-full bg-blue-400"
                  style={{ position: "absolute", top: -3, left: -3 }}
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </>
            )}
          </motion.div>
        )}

        {/* Cursor */}
        {!isIdle && (
          <motion.div
            className="absolute pointer-events-none z-30"
            initial={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
            animate={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
            transition={{ type: "spring", stiffness: 140, damping: 18, mass: 0.8 }}
            style={{ transform: "translate(-2px, -2px)" }}
          >
            <motion.div
              animate={isClicking ? { scale: 0.75 } : { scale: 1 }}
              transition={{ duration: 0.1 }}
            >
              <MousePointer2
                className={cn(
                  "h-5 w-5",
                  isClicking ? "text-blue-300" : "text-white"
                )}
                style={{ filter: "drop-shadow(0 0 5px #60a5fa) drop-shadow(0 0 2px #fff)" }}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Click pulse rings */}
        {!isIdle && isClicking && target && (
          <>
            <motion.div
              className="absolute pointer-events-none z-20 rounded-full border-2 border-blue-400"
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                width: 20,
                height: 20,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ scale: 0.4, opacity: 1 }}
              animate={{ scale: 2.8, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            <motion.div
              className="absolute pointer-events-none z-20 rounded-full border border-white/60"
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                width: 14,
                height: 14,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ scale: 0.3, opacity: 0.9 }}
              animate={{ scale: 3.5, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
            />
          </>
        )}

        {/* Click ripples */}
        {clickRipples.map((r) => (
          <CursorRipple key={r.id} x={r.x} y={r.y} />
        ))}

        {/* Bottom thought bubble */}
        {!isIdle && thought && (
          <motion.div
            key={thought}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-3 left-3 right-3 z-40"
          >
            <div className="bg-[#0d1210]/90 border border-blue-500/30 rounded-lg px-3 py-2 flex items-start gap-2 backdrop-blur-sm">
              <span className="text-blue-400 text-xs shrink-0 mt-0.5">💭</span>
              <p className="text-[11px] text-white/70 leading-relaxed italic">{thought}</p>
            </div>
          </motion.div>
        )}

        {/* Progress bar */}
        {!isIdle && totalSteps > 0 && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#1c221c] z-40">
            <motion.div
              className="h-full bg-emerald-500"
              animate={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        )}
      </div>

      {/* Action label */}
      {!isIdle && actionLabel && (
        <div className="shrink-0 px-4 py-2 border-t border-[var(--mil-border)] bg-[var(--mil-panel)]">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
            <p className="text-[11px] text-white/60">{actionLabel}</p>
          </div>
        </div>
      )}
    </div>
  );
}
