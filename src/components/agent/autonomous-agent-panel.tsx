"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, CheckCircle2, Circle, Loader2, Target, Wrench, Users2,
  Clock, ChevronDown, ChevronUp, AlertTriangle, FileText,
  Bell, Download, Shield, Zap, Play, RotateCcw, ArrowRight,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAgentInvestigation, AGENT_PRESET_GOALS, type AgentInvestigation, type AgentTool } from "@/lib/mock/agent-mock";

type Phase = "idle" | "planning" | "executing" | "complete";

interface ToolState extends AgentTool {
  phase: "queued" | "running" | "complete";
  progress: number;
}

interface AgentState {
  name: string;
  role: string;
  status: "idle" | "running" | "complete";
  startedAt?: number;
  completedAt?: number;
}

interface InvestigationState {
  investigation: AgentInvestigation;
  phase: Phase;
  plansRevealed: number;
  tools: ToolState[];
  agents: AgentState[];
  timelineSteps: { label: string; done: boolean }[];
  currentToolIndex: number;
  startedAt: number;
  completedAt?: number;
}

const TIMELINE_LABELS = [
  "Investigation Started",
  "Alert Analysis",
  "Data Retrieval",
  "Carrier Review",
  "Risk Assessment",
  "Recommendation Generation",
  "Completed",
];

function getSeverityColor(severity: string) {
  if (severity === "critical") return "text-red-400 bg-red-500/10 border-red-500/30";
  if (severity === "high") return "text-amber-400 bg-amber-500/10 border-amber-500/30";
  if (severity === "medium") return "text-blue-400 bg-blue-500/10 border-blue-500/30";
  return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
}

function formatElapsed(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${s}s`;
}

function ToolCard({ tool, index }: { tool: ToolState; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "rounded-lg border overflow-hidden transition-colors",
        tool.phase === "complete"
          ? "border-emerald-500/25 bg-emerald-500/5"
          : tool.phase === "running"
          ? "border-blue-500/40 bg-blue-500/8"
          : "border-[var(--mil-border)] bg-[var(--mil-surface)]"
      )}
    >
      <div
        className="flex items-start gap-3 p-3 cursor-pointer"
        onClick={() => tool.phase === "complete" && setExpanded((v) => !v)}
      >
        <div className={cn(
          "h-7 w-7 rounded-md flex items-center justify-center shrink-0 mt-0.5",
          tool.phase === "complete" ? "bg-emerald-500/20" : tool.phase === "running" ? "bg-blue-500/20" : "bg-[var(--mil-elevated)]"
        )}>
          <Wrench className={cn(
            "h-3.5 w-3.5",
            tool.phase === "complete" ? "text-emerald-400" : tool.phase === "running" ? "text-blue-400" : "text-[var(--mil-muted)]"
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={cn(
              "text-xs font-semibold",
              tool.phase === "complete" ? "text-white" : tool.phase === "running" ? "text-blue-200" : "text-[var(--mil-muted)]"
            )}>
              {tool.label}
            </p>
            {tool.phase === "running" && (
              <Loader2 className="h-3.5 w-3.5 text-blue-400 animate-spin shrink-0" />
            )}
            {tool.phase === "complete" && (
              <div className="flex items-center gap-1.5 shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                {expanded ? (
                  <ChevronUp className="h-3 w-3 text-[var(--mil-muted)]" />
                ) : (
                  <ChevronDown className="h-3 w-3 text-[var(--mil-muted)]" />
                )}
              </div>
            )}
            {tool.phase === "queued" && (
              <Circle className="h-3.5 w-3.5 text-[var(--mil-muted)] shrink-0" />
            )}
          </div>

          <p className={cn(
            "text-[11px] mt-0.5",
            tool.phase === "complete" ? "text-emerald-300" : tool.phase === "running" ? "text-blue-300/70" : "text-[var(--mil-muted)]"
          )}>
            {tool.phase === "complete" ? `✓ ${tool.result}` : tool.phase === "running" ? tool.description : "Queued"}
          </p>

          {tool.phase === "running" && (
            <div className="mt-2 h-1 rounded-full bg-[var(--mil-elevated)] overflow-hidden">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${tool.progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Expanded result details */}
      <AnimatePresence>
        {expanded && tool.phase === "complete" && tool.resultDetail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-emerald-500/20"
          >
            <div className="px-4 py-2.5 space-y-1">
              {tool.resultDetail.map((detail, i) => (
                <p key={i} className="text-[11px] text-white/60 flex items-start gap-1.5">
                  <ArrowRight className="h-3 w-3 text-emerald-500/60 shrink-0 mt-0.5" />
                  {detail}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PlanStep({ step, revealed, index }: { step: { id: string; step: string; description: string }; revealed: boolean; index: number }) {
  return (
    <AnimatePresence>
      {revealed && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.12 }}
          className="flex items-start gap-2"
        >
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

function AgentCard({ agent }: { agent: AgentState }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "rounded-lg border p-3 transition-colors",
        agent.status === "complete"
          ? "border-emerald-500/25 bg-emerald-500/5"
          : agent.status === "running"
          ? "border-blue-500/40 bg-blue-500/8"
          : "border-[var(--mil-border)] bg-[var(--mil-surface)]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-6 w-6 rounded-full flex items-center justify-center shrink-0",
            agent.status === "complete" ? "bg-emerald-500/20" : agent.status === "running" ? "bg-blue-500/20 animate-pulse" : "bg-[var(--mil-elevated)]"
          )}>
            <Users2 className={cn(
              "h-3 w-3",
              agent.status === "complete" ? "text-emerald-400" : agent.status === "running" ? "text-blue-400" : "text-[var(--mil-muted)]"
            )} />
          </div>
          <div>
            <p className={cn("text-xs font-semibold", agent.status !== "idle" ? "text-white" : "text-[var(--mil-muted)]")}>
              {agent.name}
            </p>
            <p className="text-[10px] text-[var(--mil-muted)]">{agent.role}</p>
          </div>
        </div>
        {agent.status === "complete" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
        {agent.status === "running" && <Loader2 className="h-3.5 w-3.5 text-blue-400 animate-spin shrink-0" />}
        {agent.status === "idle" && <Circle className="h-3.5 w-3.5 text-[var(--mil-muted)]/40 shrink-0" />}
      </div>
      {agent.status === "complete" && (
        <p className="text-[10px] text-emerald-400 mt-1.5">✓ Complete</p>
      )}
      {agent.status === "running" && (
        <p className="text-[10px] text-blue-300 mt-1.5 animate-pulse">Running analysis…</p>
      )}
    </motion.div>
  );
}

function TimelineView({ steps }: { steps: { label: string; done: boolean }[] }) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-start gap-2">
          <div className="flex flex-col items-center">
            <div className={cn(
              "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0",
              step.done
                ? "border-emerald-500 bg-emerald-500/20"
                : "border-[var(--mil-border)] bg-transparent"
            )}>
              {step.done && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
            </div>
            {i < steps.length - 1 && (
              <div className={cn("w-0.5 h-5", step.done ? "bg-emerald-500/40" : "bg-[var(--mil-border)]")} />
            )}
          </div>
          <p className={cn(
            "text-[11px] pt-0.5",
            step.done ? "text-white/80" : "text-[var(--mil-muted)]"
          )}>
            {step.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function ResultsPanel({ investigation }: { investigation: AgentInvestigation }) {
  const { findings } = investigation;
  const sevColor = getSeverityColor(findings.severity);

  function renderFindingsMd(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, j) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>
      ) : (
        <span key={j}>{part}</span>
      )
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      {/* Risk Score */}
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
            <motion.circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke={findings.riskScore >= 80 ? "#ef4444" : findings.riskScore >= 60 ? "#f59e0b" : "#3b82f6"}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${findings.riskScore} 100`}
              initial={{ strokeDasharray: "0 100" }}
              animate={{ strokeDasharray: `${findings.riskScore} 100` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-white">{findings.riskScore}</span>
            <span className="text-[9px] text-[var(--mil-muted)]">RISK</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("px-2 py-0.5 rounded text-xs font-bold border uppercase", sevColor)}>
              {findings.severity}
            </span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed max-w-md">
            {renderFindingsMd(findings.summary)}
          </p>
        </div>
      </div>

      {/* Issues */}
      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
        <p className="text-xs font-semibold text-red-300 mb-2 flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" />
          Issues Found
        </p>
        <div className="space-y-1.5">
          {findings.issues.map((issue, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
              <p className="text-xs text-white/70">{issue}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
        <p className="text-xs font-semibold text-emerald-300 mb-2 flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5" />
          Recommended Actions
        </p>
        <div className="space-y-1.5">
          {findings.recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-start gap-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
              <p className="text-xs text-white/70">{rec}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Center */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[var(--mil-muted)] mb-2">Action Center</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: FileText, label: "Open Incident", color: "bg-red-600 hover:bg-red-500" },
            { icon: Bell, label: "Notify Operations", color: "bg-amber-600 hover:bg-amber-500" },
            { icon: Activity, label: "Generate Executive Summary", color: "bg-blue-600 hover:bg-blue-500" },
            { icon: Download, label: "Export Report", color: "bg-[var(--mil-elevated)] hover:bg-[var(--mil-panel)] border border-[var(--mil-border)]" },
          ].map((action) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => {}}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-white transition-colors",
                action.color
              )}
            >
              <action.icon className="h-3.5 w-3.5 shrink-0" />
              {action.label}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function AutonomousAgentPanel() {
  const [goalInput, setGoalInput] = useState("");
  const [state, setState] = useState<InvestigationState | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  const clearTimers = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const runInvestigation = useCallback((goal: string) => {
    clearTimers();
    const investigation = getAgentInvestigation(goal);
    const tools: ToolState[] = investigation.tools.map((t) => ({
      ...t,
      phase: "queued" as const,
      progress: 0,
    }));
    const agents: AgentState[] = investigation.agents.map((a) => ({ ...a, status: "idle" as const }));
    const timelineSteps = TIMELINE_LABELS.map((label) => ({ label, done: false }));

    const now = Date.now();
    setState({
      investigation,
      phase: "planning",
      plansRevealed: 0,
      tools,
      agents,
      timelineSteps,
      currentToolIndex: -1,
      startedAt: now,
    });
    setPhase("planning");

    // Reveal plan steps one by one
    const planCount = investigation.plans.length;
    let revealedCount = 0;

    const revealNextPlan = () => {
      revealedCount++;
      setState((prev) => prev ? { ...prev, plansRevealed: revealedCount } : null);
      if (revealedCount < planCount) {
        setTimeout(revealNextPlan, 280);
      } else {
        // Done planning — start executing after a brief pause
        setTimeout(() => {
          setState((prev) => prev ? {
            ...prev,
            phase: "executing",
            timelineSteps: prev.timelineSteps.map((s, i) => ({ ...s, done: i === 0 })),
            agents: prev.agents.map((a, i) => ({ ...a, status: i === 0 ? "running" as const : "idle" as const })),
          } : null);
          setPhase("executing");
          runTools(investigation, tools, agents);
        }, 600);
      }
    };

    // Mark timeline started
    setTimeout(() => {
      setState((prev) => prev ? {
        ...prev,
        timelineSteps: prev.timelineSteps.map((s, i) => ({ ...s, done: i === 0 })),
      } : null);
    }, 300);

    setTimeout(revealNextPlan, 400);
  }, [clearTimers]);

  const runTools = useCallback((
    investigation: AgentInvestigation,
    _tools: ToolState[],
    _agents: AgentState[],
  ) => {
    let toolIndex = 0;
    const totalTools = investigation.tools.length;
    const agentCount = investigation.agents.length;

    const runNextTool = () => {
      if (toolIndex >= totalTools) {
        // All done
        setState((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            phase: "complete",
            timelineSteps: prev.timelineSteps.map((s) => ({ ...s, done: true })),
            agents: prev.agents.map((a) => ({ ...a, status: "complete" as const })),
            currentToolIndex: totalTools,
            completedAt: Date.now(),
          };
        });
        setPhase("complete");
        return;
      }

      // Update agent status
      const agentIndex = Math.min(Math.floor(toolIndex / Math.ceil(totalTools / agentCount)), agentCount - 1);
      const timelineIndex = Math.min(1 + Math.floor(toolIndex / Math.ceil(totalTools / (TIMELINE_LABELS.length - 2))), TIMELINE_LABELS.length - 2);

      setState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentToolIndex: toolIndex,
          tools: prev.tools.map((t, i) =>
            i === toolIndex ? { ...t, phase: "running" as const, progress: 0 }
            : i < toolIndex ? { ...t, phase: "complete" as const, progress: 100 }
            : t
          ),
          agents: prev.agents.map((a, i) => ({
            ...a,
            status: i < agentIndex ? "complete" as const : i === agentIndex ? "running" as const : "idle" as const,
          })),
          timelineSteps: prev.timelineSteps.map((s, i) => ({ ...s, done: i <= timelineIndex })),
        };
      });

      // Animate progress for this tool
      const duration = investigation.tools[toolIndex].duration;
      const startTime = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, Math.round((elapsed / duration) * 100));
        setState((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            tools: prev.tools.map((t, i) =>
              i === toolIndex ? { ...t, progress: pct } : t
            ),
          };
        });
        if (pct >= 100) {
          clearTimers();
          toolIndex++;
          setTimeout(runNextTool, 250);
        }
      }, 50);

      // Scroll feed
      setTimeout(() => feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" }), 100);
    };

    runNextTool();
  }, [clearTimers]);

  const startInvestigation = () => {
    const goal = goalInput.trim();
    if (!goal) return;
    runInvestigation(goal);
  };

  const reset = () => {
    clearTimers();
    setState(null);
    setPhase("idle");
    setGoalInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Goal Input */}
      <div className="shrink-0 px-6 pt-4 pb-3 border-b border-[var(--mil-border)]">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            Overhaul Risk Operations Agent
          </span>
          {phase === "executing" && (
            <span className="flex items-center gap-1.5 text-[10px] text-blue-300 ml-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Investigating…
            </span>
          )}
          {phase === "complete" && state && (
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-300 ml-2">
              <CheckCircle2 className="h-3 w-3" />
              Completed in {formatElapsed(Date.now() - state.startedAt)}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500/60" />
            <input
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && phase === "idle" && startInvestigation()}
              placeholder="Enter a goal — e.g. Investigate shipment 4299599, Generate executive report…"
              disabled={phase !== "idle"}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] text-white placeholder:text-[var(--mil-muted)] focus:outline-none focus:border-emerald-500/50 disabled:opacity-60"
            />
          </div>
          {phase === "idle" ? (
            <button
              onClick={startInvestigation}
              disabled={!goalInput.trim()}
              className="px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Run Agent
            </button>
          ) : (
            <button
              onClick={reset}
              className="px-4 py-2.5 rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] text-[var(--mil-muted)] hover:text-white transition-colors flex items-center gap-2 text-sm"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          )}
        </div>

        {/* Preset goals */}
        {phase === "idle" && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[10px] text-[var(--mil-muted)] self-center">Try:</span>
            {AGENT_PRESET_GOALS.map((p) => (
              <button
                key={p.goal}
                onClick={() => { setGoalInput(p.label); }}
                className="text-[10px] px-2.5 py-1 rounded-full bg-[var(--mil-surface)] border border-[var(--mil-border)] text-[var(--mil-muted)] hover:text-white hover:border-emerald-500/30 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Mode 3 capability banner */}
        {phase === "idle" && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/8 border border-emerald-500/20 flex items-start gap-2">
            <Zap className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-200">
              <span className="font-semibold">Mode 3 — Autonomous Agent:</span>{" "}
              Accepts goals, creates investigation plans, executes tools, coordinates specialist agents, and delivers actionable results.
            </p>
          </div>
        )}
      </div>

      {/* Planning phase header */}
      {phase === "planning" && state && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="shrink-0 mx-6 mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/25"
        >
          <div className="flex items-center gap-2 mb-1">
            <Loader2 className="h-3.5 w-3.5 text-blue-400 animate-spin" />
            <span className="text-xs font-semibold text-blue-300">Goal Accepted — Creating Investigation Plan…</span>
          </div>
          <p className="text-[11px] text-blue-300/60">{state.investigation.goalLabel}</p>
        </motion.div>
      )}

      {/* Main 3-pane body */}
      {state && (
        <div className="flex flex-1 min-h-0">
          {/* Left — Planning + Timeline */}
          <div className="w-56 shrink-0 border-r border-[var(--mil-border)] flex flex-col">
            {/* Planning */}
            <div className="p-4 border-b border-[var(--mil-border)]">
              <div className="flex items-center gap-1.5 mb-3">
                <Target className="h-3.5 w-3.5 text-emerald-400" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
                  {phase === "planning" ? "Planning…" : "Plan"}
                </p>
              </div>
              <div className="space-y-2">
                {state.investigation.plans.map((step, i) => (
                  <PlanStep
                    key={step.id}
                    step={step}
                    revealed={i < state.plansRevealed}
                    index={i}
                  />
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="p-4 flex-1">
              <div className="flex items-center gap-1.5 mb-3">
                <Clock className="h-3.5 w-3.5 text-[var(--mil-muted)]" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--mil-muted)]">Timeline</p>
              </div>
              <TimelineView steps={state.timelineSteps} />
            </div>
          </div>

          {/* Center — Tool Execution Feed */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="shrink-0 px-4 py-2.5 border-b border-[var(--mil-border)] flex items-center gap-2">
              <Wrench className="h-3.5 w-3.5 text-[var(--mil-muted)]" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--mil-muted)]">
                Tool Execution Feed
              </p>
            </div>

            <div ref={feedRef} className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {/* Phase banner */}
              {phase === "planning" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center py-8 text-center"
                >
                  <div>
                    <Loader2 className="h-6 w-6 text-blue-400 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-white/60">Building investigation plan…</p>
                    <p className="text-xs text-[var(--mil-muted)] mt-1">Tool execution will begin shortly</p>
                  </div>
                </motion.div>
              )}

              {phase !== "planning" && state.tools.map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} index={i} />
              ))}

              {phase === "complete" && state && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-2 pb-4"
                >
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-300">Investigation Complete</span>
                    <span className="text-[11px] text-[var(--mil-muted)] ml-auto">
                      {formatElapsed(Date.now() - state.startedAt)} elapsed
                    </span>
                  </div>
                  <ResultsPanel investigation={state.investigation} />
                </motion.div>
              )}
            </div>
          </div>

          {/* Right — Multi-Agent Status */}
          <div className="w-52 shrink-0 border-l border-[var(--mil-border)] flex flex-col">
            <div className="shrink-0 px-3 py-2.5 border-b border-[var(--mil-border)]">
              <div className="flex items-center gap-1.5">
                <Users2 className="h-3.5 w-3.5 text-[var(--mil-muted)]" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--mil-muted)]">
                  Agent Network
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {state.agents.map((agent) => (
                <AgentCard key={agent.name} agent={agent} />
              ))}
            </div>

            {/* Elapsed + stats */}
            {phase !== "idle" && (
              <div className="shrink-0 border-t border-[var(--mil-border)] p-3 space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[var(--mil-muted)]">Tools used</span>
                  <span className="text-white font-medium">
                    {state.tools.filter((t) => t.phase === "complete").length} / {state.tools.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[var(--mil-muted)]">Agents</span>
                  <span className="text-white font-medium">
                    {state.agents.filter((a) => a.status === "complete").length} / {state.agents.length}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-[var(--mil-elevated)] overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500 rounded-full"
                    animate={{
                      width: `${Math.round(
                        (state.tools.filter((t) => t.phase === "complete").length / state.tools.length) * 100
                      )}%`,
                    }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Idle state */}
      {phase === "idle" && !state && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-8">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Cpu className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Overhaul Risk Operations Agent</h2>
            <p className="text-sm text-[var(--mil-muted)] leading-relaxed mb-6">
              Enter a goal above to start an autonomous investigation. The agent will plan, execute tools, coordinate specialist sub-agents, and deliver actionable recommendations.
            </p>
            <div className="grid grid-cols-2 gap-2 text-left">
              {[
                { icon: Target, label: "Goal-driven", desc: "Accepts high-level goals, not just questions" },
                { icon: Activity, label: "Multi-step planning", desc: "Breaks goals into structured investigation plans" },
                { icon: Wrench, label: "Tool execution", desc: "Calls risk analysis tools autonomously" },
                { icon: Users2, label: "Multi-agent", desc: "Coordinates 4 specialist AI agents" },
              ].map((cap) => (
                <div key={cap.label} className="rounded-lg border border-[var(--mil-border)] bg-[var(--mil-surface)] p-3">
                  <cap.icon className="h-4 w-4 text-emerald-400 mb-1.5" />
                  <p className="text-xs font-semibold text-white">{cap.label}</p>
                  <p className="text-[10px] text-[var(--mil-muted)] mt-0.5">{cap.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
