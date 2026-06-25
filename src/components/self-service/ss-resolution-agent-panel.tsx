"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, CheckCircle2, Circle, Loader2, Target, Wrench,
  Play, RotateCcw, ArrowRight, Zap, AlertTriangle,
  PhoneCall, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getResolutionInvestigation,
  RESOLUTION_PRESET_GOALS,
  type ResolutionInvestigation,
  type AgentAction,
  type AutonomyTag,
} from "@/lib/mock/self-service-mock";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "idle" | "planning" | "executing" | "complete";

interface ActionState extends AgentAction {
  execPhase: "queued" | "running" | "complete";
  progress: number;
  approvalState?: "pending" | "approved" | "declined";
}

interface RunState {
  investigation: ResolutionInvestigation;
  phase: Phase;
  plansRevealed: number;
  actions: ActionState[];
  currentIndex: number;
  startedAt: number;
}

// ─── Autonomy tag badge ───────────────────────────────────────────────────────

const AUTONOMY_TAG_STYLES: Record<AutonomyTag, { label: string; dot: string; badge: string }> = {
  auto: {
    label: "Auto-resolved",
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  approval: {
    label: "Needs your approval",
    dot: "bg-amber-400",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  escalated: {
    label: "Escalated to specialist",
    dot: "bg-red-400",
    badge: "bg-red-500/15 text-red-300 border-red-500/30",
  },
};

function AutonomyBadge({ tag }: { tag: AutonomyTag }) {
  const s = AUTONOMY_TAG_STYLES[tag];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border", s.badge)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", s.dot)} />
      {s.label}
    </span>
  );
}

// ─── Individual action card ───────────────────────────────────────────────────

function ActionCard({
  action,
  onApprove,
  onDecline,
}: {
  action: ActionState;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
}) {
  const isRunning = action.execPhase === "running";
  const isDone = action.execPhase === "complete";
  const isQueued = action.execPhase === "queued";

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "rounded-xl border overflow-hidden transition-colors",
        isDone && action.autonomyTag === "auto"
          ? "border-emerald-500/25 bg-emerald-500/5"
          : isDone && action.autonomyTag === "approval" && action.approvalState === "approved"
          ? "border-emerald-500/25 bg-emerald-500/5"
          : isDone && action.autonomyTag === "approval" && action.approvalState === "declined"
          ? "border-[var(--mil-border)] bg-[var(--mil-surface)]"
          : isDone && action.autonomyTag === "escalated"
          ? "border-red-500/25 bg-red-500/5"
          : isRunning
          ? "border-blue-500/35 bg-blue-500/5"
          : "border-[var(--mil-border)] bg-[var(--mil-surface)]"
      )}
    >
      {/* Header row */}
      <div className="flex items-start gap-3 p-3">
        <div className={cn(
          "h-7 w-7 rounded-md flex items-center justify-center shrink-0 mt-0.5",
          isDone && action.autonomyTag === "auto" ? "bg-emerald-500/20"
            : isDone && action.autonomyTag === "escalated" ? "bg-red-500/20"
            : isRunning ? "bg-blue-500/20"
            : "bg-[var(--mil-elevated)]"
        )}>
          <Wrench className={cn(
            "h-3.5 w-3.5",
            isDone && action.autonomyTag === "auto" ? "text-emerald-400"
              : isDone && action.autonomyTag === "escalated" ? "text-red-400"
              : isRunning ? "text-blue-400"
              : "text-[var(--mil-muted)]"
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className={cn(
              "text-xs font-semibold",
              isQueued ? "text-[var(--mil-muted)]" : "text-white"
            )}>
              {action.toolLabel}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              {isDone && <AutonomyBadge tag={action.autonomyTag} />}
              {isRunning && <Loader2 className="h-3.5 w-3.5 text-blue-400 animate-spin" />}
              {isQueued && <Circle className="h-3.5 w-3.5 text-[var(--mil-muted)]/40" />}
            </div>
          </div>

          <p className={cn("text-[11px]", isQueued ? "text-[var(--mil-muted)]" : "text-white/60")}>
            {isQueued ? "Queued" : isRunning ? action.thought : action.resultText}
          </p>

          {isRunning && (
            <div className="mt-2 h-1 rounded-full bg-[var(--mil-elevated)] overflow-hidden">
              <motion.div className="h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }} animate={{ width: `${action.progress}%` }}
                transition={{ duration: 0.3 }} />
            </div>
          )}
        </div>
      </div>

      {/* Approval needed — pending */}
      {isDone && action.autonomyTag === "approval" && action.approvalState === "pending" && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="border-t border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <p className="text-xs font-semibold text-amber-300 mb-1.5">Proposed action</p>
          <p className="text-xs text-white/70 mb-3 leading-relaxed">{action.proposedAction}</p>
          <div className="flex gap-2">
            <button onClick={() => onApprove(action.id)}
              className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors">
              {action.approveLabel ?? "Approve"}
            </button>
            <button onClick={() => onDecline(action.id)}
              className="flex-1 py-2 rounded-lg bg-[var(--mil-elevated)] border border-[var(--mil-border)] text-white/60 text-xs font-medium hover:text-white transition-colors">
              {action.declineLabel ?? "Decline"}
            </button>
          </div>
        </motion.div>
      )}

      {/* Approval — resolved */}
      {isDone && action.autonomyTag === "approval" && action.approvalState === "approved" && (
        <div className="border-t border-emerald-500/20 px-4 py-2.5">
          <p className="text-[11px] text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            {action.approvedOutcome}
          </p>
        </div>
      )}

      {isDone && action.autonomyTag === "approval" && action.approvalState === "declined" && (
        <div className="border-t border-[var(--mil-border)] px-4 py-2.5">
          <p className="text-[11px] text-[var(--mil-muted)]">{action.declinedOutcome}</p>
        </div>
      )}

      {/* Escalated */}
      {isDone && action.autonomyTag === "escalated" && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="border-t border-red-500/20 bg-red-500/5 px-4 py-3 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-300 mb-1">This needs a specialist</p>
              <p className="text-[11px] text-white/60 leading-relaxed">{action.escalationReason}</p>
            </div>
          </div>
          {action.escalationNextSteps && (
            <div className="space-y-1 pl-5">
              <p className="text-[10px] uppercase tracking-widest text-red-400/60 mb-1">What happens next</p>
              {action.escalationNextSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-white/50">
                  <ArrowRight className="h-3 w-3 text-red-400/50 shrink-0 mt-0.5" />
                  {step}
                </div>
              ))}
            </div>
          )}
          {action.escalationEta && (
            <p className="text-[11px] text-red-300/70 pl-5 flex items-center gap-1.5">
              <Clock className="h-3 w-3 shrink-0" />
              {action.escalationEta}
            </p>
          )}
          <div className="flex gap-2 pl-5 pt-1">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/30 border border-red-500/30 text-red-200 text-[11px] font-medium hover:bg-red-600/50 transition-colors">
              <PhoneCall className="h-3 w-3" /> Contact Specialist
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Plan step ────────────────────────────────────────────────────────────────

function PlanStep({ step, revealed, index }: { step: ResolutionInvestigation["plans"][0]; revealed: boolean; index: number }) {
  return (
    <AnimatePresence>
      {revealed && (
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }} className="flex items-start gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-white">{step.step}</p>
            <p className="text-[10px] text-[var(--mil-muted)]">{step.description}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SSResolutionAgentPanel() {
  const [goalInput, setGoalInput] = useState("");
  const [run, setRun] = useState<RunState | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const scrollFeed = useCallback(() => {
    setTimeout(() => feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" }), 80);
  }, []);

  const handleApprove = useCallback((actionId: string) => {
    setRun((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        actions: prev.actions.map((a) =>
          a.id === actionId ? { ...a, approvalState: "approved" } : a
        ),
      };
    });
  }, []);

  const handleDecline = useCallback((actionId: string) => {
    setRun((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        actions: prev.actions.map((a) =>
          a.id === actionId ? { ...a, approvalState: "declined" } : a
        ),
      };
    });
  }, []);

  const runInvestigation = useCallback((goal: string) => {
    clearTimers();
    abortRef.current = false;

    const investigation = getResolutionInvestigation(goal);
    const actions: ActionState[] = investigation.actions.map((a) => ({
      ...a,
      execPhase: "queued",
      progress: 0,
      approvalState: a.autonomyTag === "approval" ? "pending" : undefined,
    }));

    setRun({ investigation, phase: "planning", plansRevealed: 0, actions, currentIndex: -1, startedAt: Date.now() });
    setPhase("planning");

    // Reveal plan steps
    let revealed = 0;
    const revealNext = () => {
      if (abortRef.current) return;
      revealed++;
      setRun((prev) => prev ? { ...prev, plansRevealed: revealed } : null);
      if (revealed < investigation.plans.length) {
        timerRef.current = setTimeout(revealNext, 260);
      } else {
        timerRef.current = setTimeout(() => {
          if (abortRef.current) return;
          setPhase("executing");
          setRun((prev) => prev ? { ...prev, phase: "executing" } : null);
          runActions(investigation, actions);
        }, 500);
      }
    };
    timerRef.current = setTimeout(revealNext, 400);
  }, [clearTimers]); // eslint-disable-line react-hooks/exhaustive-deps

  const runActions = useCallback((
    investigation: ResolutionInvestigation,
    _initial: ActionState[],
  ) => {
    let idx = 0;

    const runNext = () => {
      if (abortRef.current || idx >= investigation.actions.length) {
        if (!abortRef.current) {
          setPhase("complete");
          setRun((prev) => prev ? { ...prev, phase: "complete" } : null);
        }
        return;
      }

      // Mark current as running
      setRun((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentIndex: idx,
          actions: prev.actions.map((a, i) =>
            i === idx ? { ...a, execPhase: "running", progress: 0 }
              : i < idx ? { ...a, execPhase: "complete" }
              : a
          ),
        };
      });
      scrollFeed();

      const duration = investigation.actions[idx].durationMs;
      const start = Date.now();
      intervalRef.current = setInterval(() => {
        if (abortRef.current) { clearInterval(intervalRef.current!); return; }
        const pct = Math.min(100, Math.round(((Date.now() - start) / duration) * 100));
        setRun((prev) => {
          if (!prev) return null;
          return { ...prev, actions: prev.actions.map((a, i) => i === idx ? { ...a, progress: pct } : a) };
        });
        if (pct >= 100) {
          clearInterval(intervalRef.current!);
          setRun((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              actions: prev.actions.map((a, i) =>
                i === idx ? { ...a, execPhase: "complete", progress: 100 } : a
              ),
            };
          });
          idx++;
          scrollFeed();
          timerRef.current = setTimeout(runNext, 300);
        }
      }, 60);
    };

    runNext();
  }, [scrollFeed]);

  const start = () => {
    const goal = goalInput.trim();
    if (!goal) return;
    runInvestigation(goal);
  };

  const reset = useCallback(() => {
    abortRef.current = true;
    clearTimers();
    setRun(null);
    setPhase("idle");
    setGoalInput("");
  }, [clearTimers]);

  const isRunning = phase === "executing" || phase === "planning";
  const autoCount = run?.actions.filter((a) => a.execPhase === "complete" && a.autonomyTag === "auto").length ?? 0;
  const approvalCount = run?.actions.filter((a) => a.execPhase === "complete" && a.autonomyTag === "approval").length ?? 0;
  const escalatedCount = run?.actions.filter((a) => a.execPhase === "complete" && a.autonomyTag === "escalated").length ?? 0;

  return (
    <div className="flex flex-col h-full">
      {/* Goal input */}
      <div className="shrink-0 px-6 pt-4 pb-3 border-b border-[var(--mil-border)]">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Resolution Agent</span>
          {isRunning && (
            <span className="ml-2 flex items-center gap-1.5 text-[10px] text-blue-300">
              <Loader2 className="h-3 w-3 animate-spin" /> Working…
            </span>
          )}
          {phase === "complete" && (
            <span className="ml-2 flex items-center gap-1.5 text-[10px] text-emerald-300">
              <CheckCircle2 className="h-3 w-3" /> Complete
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500/60" />
            <input value={goalInput} onChange={(e) => setGoalInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && phase === "idle" && start()}
              placeholder="Describe what you need resolved — e.g. Why was my shipment flagged?"
              disabled={phase !== "idle"}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] text-white placeholder:text-[var(--mil-muted)] focus:outline-none focus:border-emerald-500/50 disabled:opacity-60" />
          </div>
          {phase === "idle" ? (
            <button onClick={start} disabled={!goalInput.trim()}
              className="px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors disabled:opacity-40 flex items-center gap-2">
              <Play className="h-4 w-4" /> Resolve
            </button>
          ) : (
            <button onClick={reset}
              className="px-4 py-2.5 rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] text-[var(--mil-muted)] hover:text-white transition-colors flex items-center gap-2 text-sm">
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          )}
        </div>

        {/* Preset goals */}
        {phase === "idle" && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            <span className="text-[10px] text-[var(--mil-muted)] self-center">Try:</span>
            {RESOLUTION_PRESET_GOALS.map((p) => (
              <button key={p.investigationId} onClick={() => setGoalInput(p.label)}
                className="text-[10px] px-2.5 py-1 rounded-full bg-[var(--mil-surface)] border border-[var(--mil-border)] text-[var(--mil-muted)] hover:text-white hover:border-emerald-500/30 transition-colors">
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Autonomy legend — show once executing */}
        {run && (
          <div className="flex items-center gap-3 mt-2.5">
            <span className="text-[10px] text-[var(--mil-muted)]">Actions:</span>
            {[
              { tag: "auto" as const, count: autoCount },
              { tag: "approval" as const, count: approvalCount },
              { tag: "escalated" as const, count: escalatedCount },
            ].map(({ tag, count }) => {
              const s = AUTONOMY_TAG_STYLES[tag];
              return (
                <span key={tag} className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border", s.badge)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                  {s.label} {count > 0 && <span className="font-bold">{count}</span>}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Body: plan + feed */}
      {run ? (
        <div className="flex flex-1 min-h-0">
          {/* Left: Plan */}
          <div className="w-60 shrink-0 border-r border-[var(--mil-border)] flex flex-col">
            <div className="p-4 border-b border-[var(--mil-border)]">
              <div className="flex items-center gap-1.5 mb-3">
                <Target className="h-3.5 w-3.5 text-emerald-400" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
                  {phase === "planning" ? "Planning…" : "Plan"}
                </p>
              </div>
              <div className="space-y-2">
                {run.investigation.plans.map((step, i) => (
                  <PlanStep key={step.step} step={step} revealed={i < run.plansRevealed} index={i} />
                ))}
              </div>
            </div>

            {/* Autonomy ladder explainer */}
            <div className="p-4 flex-1">
              <p className="text-[10px] uppercase tracking-widest text-[var(--mil-muted)] mb-3">Autonomy Ladder</p>
              <div className="space-y-2.5">
                {[
                  { tag: "auto" as const, desc: "Low-risk actions resolved instantly" },
                  { tag: "approval" as const, desc: "Higher-impact steps need your sign-off" },
                  { tag: "escalated" as const, desc: "Complex issues routed to a specialist" },
                ].map(({ tag, desc }) => {
                  const s = AUTONOMY_TAG_STYLES[tag];
                  return (
                    <div key={tag} className="flex items-start gap-2">
                      <span className={cn("h-4 w-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5", s.badge)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold text-white/80">{s.label}</p>
                        <p className="text-[10px] text-[var(--mil-muted)]">{desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Execution feed */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="shrink-0 px-4 py-2.5 border-b border-[var(--mil-border)] flex items-center gap-2">
              <Wrench className="h-3.5 w-3.5 text-[var(--mil-muted)]" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--mil-muted)]">Execution Feed</p>
              {run.actions.length > 0 && (
                <span className="ml-auto text-[10px] text-[var(--mil-muted)]">
                  {run.actions.filter((a) => a.execPhase === "complete").length} / {run.actions.length} complete
                </span>
              )}
            </div>

            <div ref={feedRef} className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {phase === "planning" && (
                <div className="flex items-center justify-center py-8 text-center">
                  <div>
                    <Loader2 className="h-6 w-6 text-blue-400 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-white/60">Building resolution plan…</p>
                    <p className="text-xs text-[var(--mil-muted)] mt-1">Tool execution begins shortly</p>
                  </div>
                </div>
              )}

              {phase !== "planning" && run.actions.map((action) => (
                <ActionCard key={action.id} action={action}
                  onApprove={handleApprove} onDecline={handleDecline} />
              ))}

              {phase === "complete" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <p className="text-sm font-semibold text-white">Investigation Complete</p>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {run.investigation.summary.split(/(\*\*[^*]+\*\*)/).map((p, j) =>
                      p.startsWith("**") && p.endsWith("**")
                        ? <strong key={j} className="text-white font-semibold">{p.slice(2, -2)}</strong>
                        : <span key={j}>{p}</span>
                    )}
                  </p>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {[
                      { label: "View Shipment Details", color: "bg-emerald-600 hover:bg-emerald-500 text-white" },
                      { label: "Download Summary", color: "bg-[var(--mil-elevated)] border border-[var(--mil-border)] text-white/70 hover:text-white" },
                    ].map((btn) => (
                      <button key={btn.label} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", btn.color)}>
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Idle state */
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-8">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Cpu className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Resolution Agent</h2>
            <p className="text-sm text-[var(--mil-muted)] leading-relaxed mb-6">
              Describe what you need resolved. The agent investigates, auto-resolves low-risk steps, asks for your approval on higher-impact actions, and escalates anything that needs a specialist.
            </p>
            <div className="rounded-xl border border-[var(--mil-border)] bg-[var(--mil-surface)] p-4 text-left space-y-2.5">
              <p className="text-[10px] uppercase tracking-widest text-[var(--mil-muted)] mb-1">How it works</p>
              {[
                { tag: "auto" as const, desc: "Low-blast-radius steps (device pings, status checks) resolve automatically" },
                { tag: "approval" as const, desc: "Higher-impact actions (carrier flags, notifications) need your approval first" },
                { tag: "escalated" as const, desc: "Legally consequential or complex issues are escalated to a specialist with clear next steps" },
              ].map(({ tag, desc }) => {
                const s = AUTONOMY_TAG_STYLES[tag];
                return (
                  <div key={tag} className="flex items-start gap-2.5">
                    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border shrink-0", s.badge)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                    </span>
                    <p className="text-xs text-white/60 leading-relaxed">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mode 3 capability banner — only shown when idle */}
      {phase === "idle" && !run && (
        <div className="shrink-0 mx-6 mb-6 p-2.5 rounded-lg bg-emerald-500/8 border border-emerald-500/20 flex items-start gap-2">
          <Zap className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-emerald-200">
            <span className="font-semibold">Mode 3 — Resolution Agent:</span>{" "}
            Goal-driven investigation with graduated autonomy. Auto-resolves what it can, asks before anything consequential, escalates what needs a human.
          </p>
        </div>
      )}
    </div>
  );
}
