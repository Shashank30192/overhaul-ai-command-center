"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, CheckCircle2, Circle, Loader2, Target, Wrench,
  Play, RotateCcw, ArrowRight, Zap, AlertTriangle,
  PhoneCall, Clock, Hash, MessageSquare, Settings2,
  Network, Bot, Brain, ShieldCheck, ShieldAlert, MousePointer2,
  ChevronRight, ExternalLink,
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

type Phase = "idle" | "planning" | "executing" | "awaiting_approval" | "complete" | "a2a" | "analysis" | "gsoc_result";

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

type A2AStep = "idle" | "gate1" | "spawning_sub" | "sub_running" | "gate2" | "spawning_analysis" | "analysis_running" | "gate3" | "done";
type GSOCVerdict = "action_required" | "false_indicator";

interface A2AState {
  step: A2AStep;
  subAgentLog: string[];
  analysisLog: string[];
  verdict: GSOCVerdict | null;
  confidence: number;
  reasoning: string;
  gsocApproved: boolean | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

const SUB_AGENT_LOGS = [
  "Connecting to Resolution Agent via A2A protocol…",
  "Receiving investigation context and sensor payload…",
  "Parsing alert timeline: door event at 11:42 AM, I-65 corridor…",
  "Cross-referencing FMCSA carrier registry and fraud pattern DB…",
  "Spawning Analysis Agent with enriched context bundle…",
];

const ANALYSIS_LOGS = [
  "Analysis Agent online — received context from Sub-Agent…",
  "Running behavioral baseline comparison for carrier Swift Logistics…",
  "Evaluating 14-day pattern: 0 prior tamper events, 91% on-time rate…",
  "GPS correlation: event location matches Pilot Flying J (0.3 mi)…",
  "Door re-secured within 18 min — consistent with rest stop pattern…",
  "Temperature maintained: 5.2°C throughout event window…",
  "Fraud probability model: 8.3% — below 25% action threshold…",
  "Generating GSOC determination…",
];

// ─── Autonomy badge ───────────────────────────────────────────────────────────

function AutonomyBadge({ tag }: { tag: AutonomyTag }) {
  const s = AUTONOMY_TAG_STYLES[tag];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border", s.badge)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", s.dot)} />
      {s.label}
    </span>
  );
}

// ─── Computer agent cursor animation ─────────────────────────────────────────

function ComputerAgentView({ isRunning }: { isRunning: boolean }) {
  const [cursorPos, setCursorPos] = useState({ x: 30, y: 50 });
  const [clicking, setClicking] = useState(false);
  const [navStep, setNavStep] = useState(0);

  const NAV_STEPS = [
    { x: 72, y: 28, label: "Navigating to FMCSA portal" },
    { x: 45, y: 55, label: "Clicking search field" },
    { x: 60, y: 68, label: "Submitting carrier lookup" },
    { x: 80, y: 42, label: "Reading verification result" },
  ];

  useEffect(() => {
    if (!isRunning) return;
    let step = 0;
    const advance = () => {
      if (step >= NAV_STEPS.length) return;
      const target = NAV_STEPS[step];
      setCursorPos({ x: target.x, y: target.y });
      setTimeout(() => {
        setClicking(true);
        setTimeout(() => setClicking(false), 200);
      }, 400);
      setNavStep(step);
      step++;
    };
    advance();
    const iv = setInterval(() => { if (step < NAV_STEPS.length) advance(); else clearInterval(iv); }, 1200);
    return () => clearInterval(iv);
  }, [isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mt-2 rounded-lg overflow-hidden border border-blue-500/20" style={{ background: "#0a0c0d" }}>
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-white/5" style={{ background: "#111416" }}>
        <div className="h-2 w-2 rounded-full bg-red-500/50" />
        <div className="h-2 w-2 rounded-full bg-amber-500/50" />
        <div className="h-2 w-2 rounded-full bg-emerald-500/50" />
        <div className="flex-1 mx-2 px-2 py-0.5 rounded text-[8px] text-white/20 font-mono" style={{ background: "#0a0c0d" }}>
          fmcsa.dot.gov/registration/carrier-search
        </div>
        <ExternalLink className="h-2.5 w-2.5 text-white/20" />
      </div>
      {/* Viewport */}
      <div className="relative h-20 overflow-hidden select-none">
        {/* Mock page content */}
        <div className="absolute inset-0 p-2 space-y-1.5">
          <div className="h-1.5 w-3/4 rounded-full bg-white/5" />
          <div className="h-1.5 w-1/2 rounded-full bg-white/5" />
          <div className="h-4 w-full rounded bg-white/5 border border-white/5" />
          <div className="flex gap-1">
            <div className="h-3 w-1/3 rounded bg-blue-500/20" />
            <div className="h-3 w-1/4 rounded bg-white/5" />
          </div>
          <div className="h-1.5 w-2/3 rounded-full bg-emerald-500/15" />
        </div>
        {/* Animated cursor */}
        <motion.div
          className="absolute pointer-events-none z-10"
          animate={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
          style={{ transform: "translate(-2px, -2px)" }}
        >
          <motion.div
            animate={clicking ? { scale: 0.7 } : { scale: 1 }}
            transition={{ duration: 0.1 }}
          >
            <MousePointer2 className="h-3.5 w-3.5 text-white drop-shadow-lg" style={{ filter: "drop-shadow(0 0 3px rgba(59,130,246,0.8))" }} />
          </motion.div>
          {clicking && (
            <motion.div
              className="absolute top-0 left-0 h-4 w-4 rounded-full border border-blue-400"
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.div>
        {/* Step label */}
        {isRunning && (
          <div className="absolute bottom-1 left-2 right-2">
            <p className="text-[8px] text-blue-300/70 font-mono">{NAV_STEPS[navStep]?.label}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Individual action card ───────────────────────────────────────────────────

function ActionCard({
  action,
  onApprove,
  onDecline,
  blockingApproval,
}: {
  action: ActionState;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  blockingApproval: boolean;
}) {
  const isRunning = action.execPhase === "running";
  const isDone = action.execPhase === "complete";
  const isQueued = action.execPhase === "queued";
  const isComputerAgent = action.tool === "fmcsa_lookup" || action.tool === "identity_matcher";

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
            <p className={cn("text-xs font-semibold", isQueued ? "text-[var(--mil-muted)]" : "text-white")}>
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

          {isRunning && isComputerAgent && <ComputerAgentView isRunning />}

          {isRunning && (
            <div className="mt-2 h-1 rounded-full bg-[var(--mil-elevated)] overflow-hidden">
              <motion.div className="h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }} animate={{ width: `${action.progress}%` }}
                transition={{ duration: 0.3 }} />
            </div>
          )}
        </div>
      </div>

      {/* Human approval gate — blocks next action */}
      {isDone && action.autonomyTag === "approval" && action.approvalState === "pending" && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className={cn("border-t px-4 py-3", blockingApproval ? "border-amber-500/40 bg-amber-500/8" : "border-amber-500/20 bg-amber-500/5")}>
          {blockingApproval && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <p className="text-[9px] uppercase tracking-widest text-amber-400 font-semibold">Human Approval Required — pipeline paused</p>
            </div>
          )}
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

// ─── A2A Agent chain panel ────────────────────────────────────────────────────

function A2APanel({
  a2a,
  onGate1Approve,
  onGate2Approve,
  onGate3Approve,
  onGate3Dismiss,
}: {
  a2a: A2AState;
  onGate1Approve: () => void;
  onGate2Approve: () => void;
  onGate3Approve: () => void;
  onGate3Dismiss: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <Network className="h-4 w-4 text-violet-400" />
        <p className="text-xs font-semibold text-violet-300 uppercase tracking-widest">A2A Agent Chain</p>
        <div className="flex-1 h-px bg-violet-500/20" />
      </div>

      {/* Gate 1: spawn sub-agent */}
      {a2a.step === "gate1" && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="rounded-xl border border-amber-500/40 bg-amber-500/8 p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-[9px] uppercase tracking-widest text-amber-400 font-semibold">Human Approval Required</p>
          </div>
          <div className="flex items-start gap-2 mb-3">
            <Bot className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-white mb-1">Spawn A2A Sub-Agent?</p>
              <p className="text-[11px] text-white/60 leading-relaxed">
                The Resolution Agent wants to call a secondary A2A sub-agent to perform a deeper cross-system analysis.
                The sub-agent will access carrier intelligence APIs and the fraud pattern database with elevated read permissions.
              </p>
            </div>
          </div>
          <button onClick={onGate1Approve}
            className="w-full py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-500 transition-colors flex items-center justify-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5" /> Approve — Spawn Sub-Agent
          </button>
        </motion.div>
      )}

      {/* Sub-agent running */}
      {(a2a.step === "spawning_sub" || a2a.step === "sub_running" || a2a.step === "gate2" ||
        a2a.step === "spawning_analysis" || a2a.step === "analysis_running" || a2a.step === "gate3" || a2a.step === "done") && (
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
          className="rounded-xl border border-violet-500/30 bg-violet-500/5 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-violet-500/20">
            <Bot className="h-3.5 w-3.5 text-violet-400" />
            <p className="text-xs font-semibold text-violet-300">A2A Sub-Agent · carrier-intel-v2</p>
            {(a2a.step === "spawning_sub" || a2a.step === "sub_running") && (
              <Loader2 className="h-3 w-3 text-violet-400 animate-spin ml-auto" />
            )}
            {(a2a.step === "gate2" || a2a.step === "spawning_analysis" || a2a.step === "analysis_running" || a2a.step === "gate3" || a2a.step === "done") && (
              <CheckCircle2 className="h-3 w-3 text-emerald-400 ml-auto" />
            )}
          </div>
          <div className="p-3 font-mono text-[9px] space-y-0.5 max-h-24 overflow-y-auto">
            {a2a.subAgentLog.map((line, i) => (
              <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={i === a2a.subAgentLog.length - 1 && (a2a.step === "spawning_sub" || a2a.step === "sub_running") ? "text-white/70" : "text-white/35"}>
                <span className="text-violet-500/60 mr-1.5">›</span>{line}
              </motion.p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Gate 2: spawn analysis agent */}
      {a2a.step === "gate2" && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="rounded-xl border border-amber-500/40 bg-amber-500/8 p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-[9px] uppercase tracking-widest text-amber-400 font-semibold">Human Approval Required</p>
          </div>
          <div className="flex items-start gap-2 mb-3">
            <Brain className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-white mb-1">Sub-Agent wants to spawn Analysis Agent</p>
              <p className="text-[11px] text-white/60 leading-relaxed">
                The sub-agent has gathered data and wants to hand off to a specialized Analysis Agent to evaluate
                whether GSOC needs to take action or this is a false indicator. The analysis agent will evaluate
                behavioral patterns, fraud scores, and alert context.
              </p>
            </div>
          </div>
          <button onClick={onGate2Approve}
            className="w-full py-2 rounded-lg bg-cyan-700 text-white text-xs font-semibold hover:bg-cyan-600 transition-colors flex items-center justify-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5" /> Approve — Spawn Analysis Agent
          </button>
        </motion.div>
      )}

      {/* Analysis agent running */}
      {(a2a.step === "spawning_analysis" || a2a.step === "analysis_running" || a2a.step === "gate3" || a2a.step === "done") && (
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
          className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-cyan-500/20">
            <Brain className="h-3.5 w-3.5 text-cyan-400" />
            <p className="text-xs font-semibold text-cyan-300">Analysis Agent · gsoc-eval-v3</p>
            {(a2a.step === "spawning_analysis" || a2a.step === "analysis_running") && (
              <Loader2 className="h-3 w-3 text-cyan-400 animate-spin ml-auto" />
            )}
            {(a2a.step === "gate3" || a2a.step === "done") && (
              <CheckCircle2 className="h-3 w-3 text-emerald-400 ml-auto" />
            )}
          </div>
          <div className="p-3 font-mono text-[9px] space-y-0.5 max-h-28 overflow-y-auto">
            {a2a.analysisLog.map((line, i) => (
              <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={i === a2a.analysisLog.length - 1 && (a2a.step === "spawning_analysis" || a2a.step === "analysis_running") ? "text-white/70" : "text-white/35"}>
                <span className="text-cyan-500/60 mr-1.5">›</span>{line}
              </motion.p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Gate 3: GSOC determination with approval */}
      {a2a.step === "gate3" && a2a.verdict !== null && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className={cn("rounded-xl border p-4", a2a.verdict === "action_required"
            ? "border-red-500/40 bg-red-500/8"
            : "border-emerald-500/30 bg-emerald-500/5")}>
          <div className="flex items-center gap-1.5 mb-3">
            {a2a.verdict === "action_required"
              ? <ShieldAlert className="h-4 w-4 text-red-400" />
              : <ShieldCheck className="h-4 w-4 text-emerald-400" />
            }
            <p className={cn("text-xs font-bold", a2a.verdict === "action_required" ? "text-red-300" : "text-emerald-300")}>
              GSOC Determination: {a2a.verdict === "action_required" ? "Action Required" : "False Indicator"}
            </p>
            <span className={cn("ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full",
              a2a.verdict === "action_required" ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300")}>
              {a2a.confidence}% confidence
            </span>
          </div>
          <p className="text-[11px] text-white/65 leading-relaxed mb-3">{a2a.reasoning}</p>
          <div className="flex items-center gap-1.5 mb-3">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-[9px] uppercase tracking-widest text-amber-400 font-semibold">Human Approval Required</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onGate3Approve}
              className={cn("flex-1 py-2 rounded-lg text-white text-xs font-semibold transition-colors",
                a2a.verdict === "action_required"
                  ? "bg-red-600 hover:bg-red-500"
                  : "bg-emerald-600 hover:bg-emerald-500")}>
              {a2a.verdict === "action_required" ? "Notify GSOC — Action Required" : "Confirm — Mark as False Indicator"}
            </button>
            <button onClick={onGate3Dismiss}
              className="px-4 py-2 rounded-lg bg-[var(--mil-elevated)] border border-[var(--mil-border)] text-white/50 text-xs font-medium hover:text-white transition-colors">
              Override
            </button>
          </div>
        </motion.div>
      )}

      {/* Final outcome */}
      {a2a.step === "done" && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className={cn("rounded-xl border p-3 flex items-center gap-2",
            a2a.gsocApproved && a2a.verdict === "action_required"
              ? "border-red-500/30 bg-red-500/5"
              : "border-emerald-500/25 bg-emerald-500/5")}>
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <p className="text-xs text-white/70">
            {a2a.gsocApproved && a2a.verdict === "action_required"
              ? "GSOC notified via Slack #gsoc-alerts. Incident ticket opened. R. Chen assigned."
              : a2a.gsocApproved
              ? "Alert marked as false indicator. No GSOC action required. Log updated."
              : "Determination overridden by operator. Manual review logged."}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SSResolutionAgentPanel() {
  const [goalInput, setGoalInput] = useState("");
  const [run, setRun] = useState<RunState | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [a2a, setA2a] = useState<A2AState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);
  const pendingContinueRef = useRef<(() => void) | null>(null);

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
    // Resume pipeline after approval
    if (pendingContinueRef.current) {
      const cont = pendingContinueRef.current;
      pendingContinueRef.current = null;
      timerRef.current = setTimeout(cont, 350);
    }
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
    // Also resume — declined is still a decision
    if (pendingContinueRef.current) {
      const cont = pendingContinueRef.current;
      pendingContinueRef.current = null;
      timerRef.current = setTimeout(cont, 350);
    }
  }, []);

  const startA2AChain = useCallback(() => {
    if (abortRef.current) return;
    setPhase("a2a");
    setA2a({ step: "gate1", subAgentLog: [], analysisLog: [], verdict: null, confidence: 0, reasoning: "", gsocApproved: null });
    scrollFeed();
  }, [scrollFeed]);

  const handleGate1Approve = useCallback(() => {
    setA2a((prev) => prev ? { ...prev, step: "spawning_sub" } : null);
    let i = 0;
    const pushLog = () => {
      if (i >= SUB_AGENT_LOGS.length) {
        setA2a((prev) => prev ? { ...prev, step: "gate2" } : null);
        scrollFeed();
        return;
      }
      const line = SUB_AGENT_LOGS[i++];
      setA2a((prev) => prev ? { ...prev, step: "sub_running", subAgentLog: [...prev.subAgentLog, line] } : null);
      scrollFeed();
      timerRef.current = setTimeout(pushLog, 700);
    };
    timerRef.current = setTimeout(pushLog, 400);
  }, [scrollFeed]);

  const handleGate2Approve = useCallback(() => {
    setA2a((prev) => prev ? { ...prev, step: "spawning_analysis" } : null);
    let i = 0;
    const pushLog = () => {
      if (i >= ANALYSIS_LOGS.length) {
        // Produce verdict
        const verdict: GSOCVerdict = "false_indicator";
        const confidence = 91;
        const reasoning = "Behavioral analysis confirms the 11:42 AM door event is consistent with a driver rest stop at a known Pilot Flying J location. Cargo temperature held within threshold throughout. Carrier fraud score 8.3% — well below the 25% action threshold. GPS trail unbroken. No GSOC intervention is warranted; alert should be closed as a false indicator.";
        setA2a((prev) => prev ? { ...prev, step: "gate3", verdict, confidence, reasoning } : null);
        scrollFeed();
        return;
      }
      const line = ANALYSIS_LOGS[i++];
      setA2a((prev) => prev ? { ...prev, step: "analysis_running", analysisLog: [...prev.analysisLog, line] } : null);
      scrollFeed();
      timerRef.current = setTimeout(pushLog, 650);
    };
    timerRef.current = setTimeout(pushLog, 400);
  }, [scrollFeed]);

  const handleGate3Approve = useCallback(() => {
    setA2a((prev) => prev ? { ...prev, step: "done", gsocApproved: true } : null);
    setPhase("gsoc_result");
    scrollFeed();
  }, [scrollFeed]);

  const handleGate3Dismiss = useCallback(() => {
    setA2a((prev) => prev ? { ...prev, step: "done", gsocApproved: false } : null);
    setPhase("gsoc_result");
    scrollFeed();
  }, [scrollFeed]);

  const runActions = useCallback((investigation: ResolutionInvestigation) => {
    let idx = 0;

    const runNext = () => {
      if (abortRef.current || idx >= investigation.actions.length) {
        if (!abortRef.current) {
          setPhase("complete");
          setRun((prev) => prev ? { ...prev, phase: "complete" } : null);
          // After completion, trigger A2A chain
          timerRef.current = setTimeout(() => startA2AChain(), 1200);
        }
        return;
      }

      const snapshotIdx = idx; // capture before state updaters are flushed
      setRun((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentIndex: snapshotIdx,
          actions: prev.actions.map((a, i) =>
            i === snapshotIdx ? { ...a, execPhase: "running", progress: 0 }
              : i < snapshotIdx ? { ...a, execPhase: "complete" }
              : a
          ),
        };
      });
      scrollFeed();

      const duration = investigation.actions[snapshotIdx].durationMs;
      const start = Date.now();
      intervalRef.current = setInterval(() => {
        if (abortRef.current) { clearInterval(intervalRef.current!); return; }
        const pct = Math.min(100, Math.round(((Date.now() - start) / duration) * 100));
        setRun((prev) => {
          if (!prev) return null;
          return { ...prev, actions: prev.actions.map((a, i) => i === snapshotIdx ? { ...a, progress: pct } : a) };
        });
        if (pct >= 100) {
          clearInterval(intervalRef.current!);
          const currentAction = investigation.actions[snapshotIdx];
          setRun((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              actions: prev.actions.map((a, i) =>
                i === snapshotIdx ? { ...a, execPhase: "complete", progress: 100 } : a
              ),
            };
          });
          idx++;
          scrollFeed();

          if (currentAction.autonomyTag === "approval") {
            setPhase("awaiting_approval");
            pendingContinueRef.current = runNext;
          } else {
            timerRef.current = setTimeout(runNext, 320);
          }
        }
      }, 60);
    };

    runNext();
  }, [scrollFeed, startA2AChain]);

  const runInvestigation = useCallback((goal: string) => {
    clearTimers();
    abortRef.current = false;
    pendingContinueRef.current = null;

    const investigation = getResolutionInvestigation(goal);
    const actions: ActionState[] = investigation.actions.map((a) => ({
      ...a,
      execPhase: "queued",
      progress: 0,
      approvalState: a.autonomyTag === "approval" ? "pending" : undefined,
    }));

    setRun({ investigation, phase: "planning", plansRevealed: 0, actions, currentIndex: -1, startedAt: Date.now() });
    setPhase("planning");
    setA2a(null);

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
          runActions(investigation);
        }, 500);
      }
    };
    timerRef.current = setTimeout(revealNext, 400);
  }, [clearTimers, runActions]);

  const start = () => {
    const goal = goalInput.trim();
    if (!goal) return;
    runInvestigation(goal);
  };

  const reset = useCallback(() => {
    abortRef.current = true;
    clearTimers();
    pendingContinueRef.current = null;
    setRun(null);
    setPhase("idle");
    setGoalInput("");
    setA2a(null);
  }, [clearTimers]);

  const isRunning = phase === "executing" || phase === "planning" || phase === "awaiting_approval";
  const autoCount = run?.actions.filter((a) => a.execPhase === "complete" && a.autonomyTag === "auto").length ?? 0;
  const approvalCount = run?.actions.filter((a) => a.execPhase === "complete" && a.autonomyTag === "approval").length ?? 0;
  const escalatedCount = run?.actions.filter((a) => a.execPhase === "complete" && a.autonomyTag === "escalated").length ?? 0;

  // Find which action is currently blocking (awaiting approval)
  const blockingActionId = phase === "awaiting_approval"
    ? run?.actions.find((a) => a.execPhase === "complete" && a.approvalState === "pending")?.id ?? null
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Goal input */}
      <div className="shrink-0 px-6 pt-4 pb-3 border-b border-[var(--mil-border)]">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Resolution Agent</span>
          {phase === "planning" && (
            <span className="ml-2 flex items-center gap-1.5 text-[10px] text-blue-300">
              <Loader2 className="h-3 w-3 animate-spin" /> Planning…
            </span>
          )}
          {phase === "executing" && (
            <span className="ml-2 flex items-center gap-1.5 text-[10px] text-blue-300">
              <Loader2 className="h-3 w-3 animate-spin" /> Working…
            </span>
          )}
          {phase === "awaiting_approval" && (
            <span className="ml-2 flex items-center gap-1.5 text-[10px] text-amber-300">
              <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" /> Awaiting approval…
            </span>
          )}
          {phase === "a2a" && (
            <span className="ml-2 flex items-center gap-1.5 text-[10px] text-violet-300">
              <Network className="h-3 w-3" /> A2A chain active…
            </span>
          )}
          {(phase === "complete" || phase === "gsoc_result") && (
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

      {/* Body */}
      {run ? (
        <div className="flex flex-1 min-h-0">
          {/* Left: Plan + config */}
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

            {/* A2A pipeline legend */}
            {(phase === "a2a" || phase === "gsoc_result") && (
              <div className="p-4 border-b border-[var(--mil-border)]">
                <p className="text-[10px] uppercase tracking-widest text-[var(--mil-muted)] mb-3">A2A Chain</p>
                <div className="space-y-2">
                  {[
                    { icon: Cpu, label: "Resolution Agent", color: "text-emerald-400", active: true },
                    { icon: Bot, label: "Sub-Agent (A2A)", color: "text-violet-400", active: (a2a?.step !== "gate1" && a2a?.step !== "idle") },
                    { icon: Brain, label: "Analysis Agent", color: "text-cyan-400", active: (a2a?.step === "spawning_analysis" || a2a?.step === "analysis_running" || a2a?.step === "gate3" || a2a?.step === "done") },
                  ].map(({ icon: Icon, label, color, active }, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={cn("h-5 w-5 rounded flex items-center justify-center shrink-0",
                        active ? "bg-white/8" : "bg-white/3")}>
                        <Icon className={cn("h-3 w-3", active ? color : "text-white/20")} />
                      </div>
                      <p className={cn("text-[10px]", active ? "text-white/70" : "text-white/25")}>{label}</p>
                      {i < 2 && <div className="absolute ml-2.5 mt-5 h-3 w-px bg-white/10" style={{ position: "relative", left: "-10px", top: "10px" }} />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Autonomy ladder */}
            <div className="p-4 border-b border-[var(--mil-border)]">
              <p className="text-[10px] uppercase tracking-widest text-[var(--mil-muted)] mb-3">Autonomy Ladder</p>
              <div className="space-y-2.5">
                {[
                  { tag: "auto" as const, desc: "Low-risk steps resolved instantly" },
                  { tag: "approval" as const, desc: "Every consequential step needs sign-off" },
                  { tag: "escalated" as const, desc: "Complex issues routed to specialist" },
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

            {/* Slack config */}
            <div className="p-4 flex-1">
              <div className="flex items-center gap-1.5 mb-3">
                <div className="h-3.5 w-3.5 rounded flex items-center justify-center shrink-0" style={{ background: "#4A154B" }}>
                  <span className="text-[7px] font-bold text-white">#</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "#E8D5FF" }}>Slack Alerts</p>
                <Settings2 className="h-3 w-3 text-white/20 ml-auto" />
              </div>
              <div className="space-y-2">
                <p className="text-[9px] text-white/30 uppercase tracking-wider">GSOC Officer</p>
                <div className="rounded-lg px-2.5 py-2 flex items-center gap-2" style={{ background: "#4A154B15", border: "1px solid #4A154B30" }}>
                  <div className="h-5 w-5 rounded-full bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center shrink-0">
                    <span className="text-[7px] font-bold text-white">RC</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-white/70">R. Chen</p>
                    <p className="text-[8px] text-white/30">@ryan.chen · Online</p>
                  </div>
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                </div>
                <p className="text-[9px] text-white/30 uppercase tracking-wider mt-2">Channels</p>
                {[
                  { ch: "#gsoc-alerts", active: true },
                  { ch: "#risk-escalations", active: true },
                  { ch: "#resolution-log", active: false },
                ].map((c) => (
                  <div key={c.ch} className="flex items-center gap-2 px-2 py-1 rounded" style={{ background: "#4A154B08" }}>
                    <Hash className="h-3 w-3 shrink-0" style={{ color: c.active ? "#E8D5FF" : "#ffffff20" }} />
                    <span className="text-[9px] flex-1" style={{ color: c.active ? "#E8D5FF99" : "#ffffff20" }}>{c.ch}</span>
                    <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", c.active ? "bg-emerald-400" : "bg-white/10")} />
                  </div>
                ))}
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
                  onApprove={handleApprove} onDecline={handleDecline}
                  blockingApproval={action.id === blockingActionId}
                />
              ))}

              {/* Complete card */}
              {(phase === "complete" || phase === "a2a" || phase === "analysis" || phase === "gsoc_result") && (
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
                </motion.div>
              )}

              {/* A2A section */}
              {a2a && (
                <A2APanel
                  a2a={a2a}
                  onGate1Approve={handleGate1Approve}
                  onGate2Approve={handleGate2Approve}
                  onGate3Approve={handleGate3Approve}
                  onGate3Dismiss={handleGate3Dismiss}
                />
              )}

              {/* Slack GSOC Alert — shown at end */}
              {phase === "gsoc_result" && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="rounded-xl border overflow-hidden" style={{ borderColor: "#4A154B60", background: "#4A154B10" }}>
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "#4A154B30" }}>
                    <div className="h-4 w-4 rounded flex items-center justify-center shrink-0" style={{ background: "#4A154B" }}>
                      <span className="text-[9px] font-bold text-white">#</span>
                    </div>
                    <span className="text-xs font-semibold text-white">Slack Alert Sent</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 ml-auto" />
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-start gap-2.5">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "#E8D5FF" }} />
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold" style={{ color: "#E8D5FF" }}>DM → GSOC Officer (R. Chen)</p>
                        <div className="mt-1 rounded-lg p-2 font-mono text-[9px] space-y-0.5" style={{ background: "#0a0c0d", borderLeft: "2px solid #4A154B" }}>
                          <p className="text-white/50">🔔 <span className="text-emerald-400">RESOLVED</span> · ACE Resolution Agent + A2A Chain</p>
                          <p className="text-white/35">Goal: {goalInput || "Investigation complete"}</p>
                          <p className="text-white/35">Actions: {run.actions.length} executed · {autoCount} auto · {approvalCount} approved</p>
                          <p className="text-white/35">GSOC Determination: {a2a?.verdict === "false_indicator" ? "False indicator — no action" : "Action required — see incident"}</p>
                          <p style={{ color: "#4A154B80" }}>via Overhaul ACE · Control Tower</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Hash className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "#E8D5FF" }} />
                      <div>
                        <p className="text-[10px] font-semibold" style={{ color: "#E8D5FF" }}>#gsoc-alerts · 4 subscribers notified</p>
                        <p className="text-[9px] text-white/35 mt-0.5">Resolution summary posted to channel</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-8">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Cpu className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Resolution Agent</h2>
            <p className="text-sm text-[var(--mil-muted)] leading-relaxed mb-6">
              Describe what you need resolved. The agent investigates, gets human approval at every consequential step,
              then triggers an A2A agent chain to determine if GSOC action is needed.
            </p>
            <div className="rounded-xl border border-[var(--mil-border)] bg-[var(--mil-surface)] p-4 text-left space-y-2.5">
              <p className="text-[10px] uppercase tracking-widest text-[var(--mil-muted)] mb-1">How it works</p>
              {[
                { icon: Cpu, color: "text-emerald-400", label: "Resolution Agent", desc: "Plans and executes the investigation with human approval gates" },
                { icon: Network, color: "text-violet-400", label: "A2A Sub-Agent", desc: "Called automatically after resolution to perform cross-system analysis" },
                { icon: Brain, color: "text-cyan-400", label: "Analysis Agent", desc: "Evaluates whether GSOC needs to take action or it's a false indicator" },
              ].map(({ icon: Icon, color, label, desc }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <Icon className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", color)} />
                  <div>
                    <p className="text-xs font-semibold text-white/80">{label}</p>
                    <p className="text-[11px] text-white/40 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === "idle" && !run && (
        <div className="shrink-0 mx-6 mb-6 p-2.5 rounded-lg bg-emerald-500/8 border border-emerald-500/20 flex items-start gap-2">
          <Zap className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-emerald-200">
            <span className="font-semibold">Mode 3 — Resolution Agent:</span>{" "}
            Goal-driven investigation with human approval at every step, followed by an A2A agent chain for GSOC determination.
          </p>
        </div>
      )}
    </div>
  );
}
