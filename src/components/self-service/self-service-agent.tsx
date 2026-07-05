"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, RotateCcw, Bot, CheckCircle2, Loader2, Cpu,
  ArrowRight, Zap, ChevronRight, AlertTriangle, Clock,
  Thermometer, ShieldCheck, FileText, Search, Hash, MessageSquare,
  Network, Brain, ShieldAlert, Square, PhoneCall, MapPin,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  resolveWorkflow,
  CUSTOMER_SUGGESTIONS,
  type CustomerWorkflow,
  type WorkflowResult,
  type ScreenId,
} from "@/lib/mock/self-service-workflows";
import { CUSTOMER, CUSTOMER_SHIPMENTS } from "@/lib/mock/self-service-mock";
import { SCREEN_HOTSPOTS, type Hotspot } from "./workflow-screens";
import { AgentViewport } from "./agent-viewport";

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentPhase = "idle" | "running" | "complete";
type A2APhase = "idle" | "gate1" | "sub_running" | "gate2" | "analysis_running" | "gate3" | "done";

interface AgentDecision {
  action: "call-driver" | "contact-carrier" | "waive" | "escalate-police";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  reasoning: string;
  confidence: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
  partial?: boolean;
}

interface RunState {
  workflow: CustomerWorkflow;
  phase: AgentPhase;
  currentScreenId: ScreenId;
  activeHotspot: Hotspot | null;
  isClicking: boolean;
  currentThought: string;
  currentActionLabel: string;
  globalStepIndex: number;
  totalSteps: number;
  completedSteps: string[];
  screenTrail: ScreenId[];
  result?: WorkflowResult;
}

interface PendingApproval {
  label: string;
  description: string;
  resolve: (approved: boolean) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function ResultCard({ result }: { result: WorkflowResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-emerald-500/20 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
        <p className="text-sm font-semibold text-white">{result.headline}</p>
      </div>
      <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
        {Object.entries(result.data).map(([k, v]) => (
          <div key={k} className="flex items-start gap-2">
            <span className="text-[10px] text-[var(--mil-muted)] shrink-0 w-24">{k}</span>
            <span className="text-[10px] text-white font-medium">{String(v)}</span>
          </div>
        ))}
      </div>
      <div className="px-4 pb-3 flex flex-wrap gap-2">
        {result.actions.map((action) => (
          <button
            key={action.label}
            className={cn(
              "text-xs font-medium px-3 py-1.5 rounded-lg transition-colors",
              action.variant === "primary"
                ? "bg-emerald-600 text-white hover:bg-emerald-500"
                : action.variant === "danger"
                ? "bg-red-600 text-white hover:bg-red-500"
                : "bg-[var(--mil-elevated)] border border-[var(--mil-border)] text-white/70 hover:text-white"
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function renderMd(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, j) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>
    ) : <span key={j}>{part}</span>
  );
}

// ─── Approval gate (inline in chat) ──────────────────────────────────────────

function ApprovalGate({ approval, onApprove, onDecline }: {
  approval: PendingApproval;
  onApprove: () => void;
  onDecline: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-amber-500/40 bg-amber-500/8 p-3 mx-1">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        <p className="text-[9px] uppercase tracking-widest text-amber-400 font-semibold">Human Approval Required</p>
      </div>
      <p className="text-xs font-semibold text-white mb-1">{approval.label}</p>
      <p className="text-[11px] text-white/60 leading-relaxed mb-3">{approval.description}</p>
      <div className="flex gap-2">
        <button onClick={onApprove}
          className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors">
          Approve
        </button>
        <button onClick={onDecline}
          className="flex-1 py-1.5 rounded-lg bg-[var(--mil-elevated)] border border-[var(--mil-border)] text-white/60 text-xs font-medium hover:text-white transition-colors">
          Skip
        </button>
      </div>
    </motion.div>
  );
}

// ─── A2A cards (in action feed) ───────────────────────────────────────────────

function A2AFeedCards({
  a2aPhase,
  gsocVerdict,
  onGate1,
  onGate2,
  onGate3Confirm,
  onGate3Dismiss,
}: {
  a2aPhase: A2APhase;
  gsocVerdict: "action_required" | "false_indicator" | null;
  onGate1: () => void;
  onGate2: () => void;
  onGate3Confirm: () => void;
  onGate3Dismiss: () => void;
}) {
  return (
    <>
      {/* A2A gate 1 */}
      {a2aPhase === "gate1" && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="shrink-0 rounded-lg border border-amber-500/40 bg-amber-500/8 px-3 py-2 min-w-[200px]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[9px] text-amber-400 font-semibold uppercase tracking-wide">Approval Required</span>
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <Network className="h-3 w-3 text-violet-400 shrink-0" />
            <p className="text-[10px] text-white font-semibold">Spawn A2A Sub-Agent?</p>
          </div>
          <p className="text-[9px] text-white/50 leading-tight mb-2">
            Deep cross-system analysis with elevated API permissions
          </p>
          <div className="flex gap-1.5">
            <button onClick={onGate1}
              className="flex-1 py-1 rounded bg-violet-600 text-white text-[9px] font-semibold hover:bg-violet-500 transition-colors">
              Approve
            </button>
          </div>
        </motion.div>
      )}

      {/* Sub-agent running */}
      {(a2aPhase === "sub_running" || a2aPhase === "gate2") && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="shrink-0 rounded-lg border border-violet-500/30 bg-violet-500/5 px-3 py-2 min-w-[160px]">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Network className="h-3 w-3 text-violet-400" />
              <span className="text-[9px] font-semibold text-violet-300">A2A Sub-Agent</span>
            </div>
            {a2aPhase === "sub_running"
              ? <Loader2 className="h-3 w-3 text-violet-400 animate-spin" />
              : <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
          </div>
          <p className="text-[9px] text-white/40 leading-tight">carrier-intel-v2 · Scanning APIs…</p>
        </motion.div>
      )}

      {/* A2A gate 2 */}
      {a2aPhase === "gate2" && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="shrink-0 rounded-lg border border-amber-500/40 bg-amber-500/8 px-3 py-2 min-w-[200px]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[9px] text-amber-400 font-semibold uppercase tracking-wide">Approval Required</span>
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <Brain className="h-3 w-3 text-cyan-400 shrink-0" />
            <p className="text-[10px] text-white font-semibold">Spawn Analysis Agent?</p>
          </div>
          <p className="text-[9px] text-white/50 leading-tight mb-2">
            Evaluate GSOC action needed vs false indicator
          </p>
          <button onClick={onGate2}
            className="w-full py-1 rounded bg-cyan-700 text-white text-[9px] font-semibold hover:bg-cyan-600 transition-colors">
            Approve
          </button>
        </motion.div>
      )}

      {/* Analysis agent running */}
      {(a2aPhase === "analysis_running" || a2aPhase === "gate3" || a2aPhase === "done") && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="shrink-0 rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-3 py-2 min-w-[160px]">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Brain className="h-3 w-3 text-cyan-400" />
              <span className="text-[9px] font-semibold text-cyan-300">Analysis Agent</span>
            </div>
            {a2aPhase === "analysis_running"
              ? <Loader2 className="h-3 w-3 text-cyan-400 animate-spin" />
              : <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
          </div>
          <p className="text-[9px] text-white/40 leading-tight">gsoc-eval-v3 · Assessing…</p>
        </motion.div>
      )}

      {/* Gate 3: GSOC verdict */}
      {a2aPhase === "gate3" && gsocVerdict && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className={cn("shrink-0 rounded-lg border px-3 py-2 min-w-[200px]",
            gsocVerdict === "action_required"
              ? "border-red-500/40 bg-red-500/8"
              : "border-emerald-500/30 bg-emerald-500/8")}>
          <div className="flex items-center gap-1.5 mb-1.5">
            {gsocVerdict === "action_required"
              ? <ShieldAlert className="h-3 w-3 text-red-400" />
              : <ShieldCheck className="h-3 w-3 text-emerald-400" />}
            <span className={cn("text-[9px] font-bold uppercase tracking-wide",
              gsocVerdict === "action_required" ? "text-red-300" : "text-emerald-300")}>
              GSOC: {gsocVerdict === "action_required" ? "Action Required" : "False Indicator"}
            </span>
          </div>
          <p className="text-[9px] text-white/50 leading-tight mb-2">
            {gsocVerdict === "action_required"
              ? "Analysis agent flags this for GSOC intervention"
              : "91% confidence — driver rest stop, no threat detected"}
          </p>
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="h-1 w-1 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[8px] text-amber-400 uppercase tracking-wide">Approval needed</span>
          </div>
          <div className="flex gap-1.5">
            <button onClick={onGate3Confirm}
              className={cn("flex-1 py-1 rounded text-white text-[9px] font-semibold transition-colors",
                gsocVerdict === "action_required" ? "bg-red-600 hover:bg-red-500" : "bg-emerald-600 hover:bg-emerald-500")}>
              {gsocVerdict === "action_required" ? "Notify GSOC" : "Confirm"}
            </button>
            <button onClick={onGate3Dismiss}
              className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white/40 text-[9px] hover:text-white transition-colors">
              Override
            </button>
          </div>
        </motion.div>
      )}

      {/* Done */}
      {a2aPhase === "done" && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="shrink-0 rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 min-w-[140px] flex flex-col items-center justify-center gap-1">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span className="text-[9px] font-semibold text-emerald-300 text-center">A2A Chain Complete</span>
          <span className="text-[8px] text-emerald-400/60">GSOC updated</span>
        </motion.div>
      )}
    </>
  );
}

// ─── Hotspot matching ─────────────────────────────────────────────────────────

// Words too generic to disambiguate hotspots on their own
const HOTSPOT_STOPWORDS = new Set([
  "the", "and", "with", "for", "from", "into", "your", "this", "that",
  "all", "full", "open", "view", "panel", "button", "field", "box", "tab",
]);

function tokenize(label: string): string[] {
  return label.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 2);
}

// Find the hotspot whose label best matches the action's targetLabel.
// Exact tokens (incl. shipment IDs like "84764") score highest; generic
// stopwords only count as weak signals. Falls back to index cycling.
function findBestHotspot(screenId: ScreenId, targetLabel: string, fallbackIdx: number): Hotspot | null {
  const hotspots = SCREEN_HOTSPOTS[screenId] ?? [];
  if (hotspots.length === 0) return null;

  const target = targetLabel.toLowerCase();
  const targetWords = tokenize(targetLabel);

  let bestScore = 0;
  let bestHotspot: Hotspot | null = null;

  for (const h of hotspots) {
    const hLabel = h.label.toLowerCase();
    const hWords = tokenize(h.label);
    let score = 0;

    // Whole-label containment is the strongest possible signal
    if (hLabel.includes(target) || target.includes(hLabel)) score += 10;

    for (const tw of targetWords) {
      const weight = HOTSPOT_STOPWORDS.has(tw) ? 0.5 : /^\d+$/.test(tw) ? 5 : 3;
      for (const hw of hWords) {
        if (hw === tw) { score += weight; break; }
        if (tw.length > 3 && (hw.startsWith(tw) || tw.startsWith(hw))) { score += weight * 0.6; break; }
        if (tw.length > 4 && (hw.includes(tw) || tw.includes(hw))) { score += weight * 0.3; break; }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestHotspot = h;
    }
  }

  // Require a meaningful score — a lone stopword match shouldn't steer the cursor
  return bestScore >= 1.5 ? bestHotspot! : (hotspots[fallbackIdx % hotspots.length] ?? null);
}

// ─── Top-nav positions ─────────────────────────────────────────────────────────

// Every screen renders the same TopNav, so navigate actions always click at
// these positions on the CURRENT screen before the new screen loads.
const NAV_POSITIONS: Record<string, Hotspot> = {
  "risk monitor": { x: 44, y: 8, label: "Risk Monitor nav link" },
  "fraud watch":  { x: 53, y: 8, label: "Fraud Watch nav link" },
  "digital twin": { x: 60, y: 8, label: "Digital Twin nav link" },
};

function navHotspotFor(targetLabel: string): Hotspot {
  const key = Object.keys(NAV_POSITIONS).find((k) => targetLabel.toLowerCase().includes(k));
  return key ? NAV_POSITIONS[key] : { x: 50, y: 8, label: `${targetLabel} nav link` };
}

// ─── Evidence artifacts ────────────────────────────────────────────────────────

// Artifacts the agent produces per workflow — shown in the action feed on completion
const WORKFLOW_ARTIFACTS: Record<string, { icon: LucideIcon; label: string; meta: string }[]> = {
  "investigate-case": [
    { icon: PhoneCall, label: "Driver call recording", meta: "4m 32s · Marcus Vinicius" },
    { icon: MapPin,    label: "GPS trace — São Paulo stop", meta: "47 min · geofenced" },
    { icon: FileText,  label: "Case report OH-84764", meta: "PDF · auto-generated" },
  ],
  "track-shipment": [
    { icon: MapPin,   label: "Live GPS snapshot", meta: "lat/long + heading" },
    { icon: FileText, label: "Status summary", meta: "shareable link" },
  ],
  "file-incident": [
    { icon: FileText, label: "Incident report", meta: "filed · GPS attached" },
    { icon: MapPin,   label: "GPS evidence bundle", meta: "route + stop history" },
  ],
  "risk-report": [
    { icon: FileText,    label: "Risk assessment report", meta: "PDF · RiskGPT authored" },
    { icon: ShieldAlert, label: "Compound risk breakdown", meta: "98% composite score" },
  ],
  "carrier-info": [
    { icon: ShieldCheck, label: "Carrier verification cert", meta: "MC-294817 · FMCSA" },
  ],
  "get-eta": [
    { icon: Clock, label: "ETA projection", meta: "recalculated from live GPS" },
  ],
};

// ─── Main Component ───────────────────────────────────────────────────────────

// Actions whose target labels suggest high-impact — require human approval.
// "call driver" is deliberately specific so "End call" doesn't re-gate.
const HIGH_IMPACT_PATTERN = /alert|contact|notify|send|flag|escalate|dispatch|report|call driver/i;

export function SelfServiceAgent({ embedded = false }: { embedded?: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "agent",
      content: "Hi! I'm your **Overhaul Self-Service Agent**. I can autonomously navigate the platform to track your shipments, file claims, generate risk reports, verify carriers, and more.\n\nWhat can I help you with today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [run, setRun] = useState<RunState | null>(null);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [agentDecision, setAgentDecision] = useState<AgentDecision | null>(null);
  const [pendingApproval, setPendingApproval] = useState<PendingApproval | null>(null);
  const [a2aPhase, setA2aPhase] = useState<A2APhase>("idle");
  const [gsocVerdict, setGsocVerdict] = useState<"action_required" | "false_indicator" | null>(null);
  const abortRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const a2aTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startTimeRef = useRef(0);
  const [elapsed, setElapsed] = useState(0);

  const scrollBottom = useCallback((smooth = true) => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" }), 60);
  }, []);

  const addMessage = useCallback((msg: Omit<ChatMessage, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: `msg-${Date.now()}-${Math.random()}` }]);
    if (msg.role === "user" || msg.role === "system") scrollBottom();
  }, [scrollBottom]);

  const updateLastAgent = useCallback((content: string, scrollAfter = false) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "agent" && last.partial) {
        return [...prev.slice(0, -1), { ...last, content, partial: false }];
      }
      return prev;
    });
    if (scrollAfter) scrollBottom();
  }, [scrollBottom]);

  const callAgentDecision = useCallback(async (shipmentContext: string): Promise<AgentDecision | null> => {
    try {
      const res = await fetch("/api/self-service-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: shipmentContext, phase: "decision", workflowTitle: "Risk Assessment" }),
      });
      if (!res.ok) return null;
      const data = await res.json() as { decision?: AgentDecision };
      return data.decision ?? null;
    } catch {
      return null;
    }
  }, []);

  const callAgentLLM = useCallback(async (
    phase: "start" | "complete",
    goal: string,
    workflowTitle: string,
    workflowResult?: Record<string, string>,
    currentMessages?: ChatMessage[],
  ): Promise<string> => {
    try {
      const res = await fetch("/api/self-service-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: goal,
          phase,
          workflowTitle,
          workflowResult,
          history: (currentMessages ?? []).slice(-8),
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json() as { response: string };
      return data.response ?? "";
    } catch {
      if (phase === "start") return `I'll **${workflowTitle}** for you now. Let me navigate the platform…`;
      return workflowResult?.["Resolution"] ?? `**${workflowTitle}** complete.`;
    }
  }, []);

  // Request approval — pauses workflow until user responds
  const requestApproval = useCallback((label: string, description: string): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setPendingApproval({ label, description, resolve });
    });
  }, []);

  const handleApprovalApprove = useCallback(() => {
    setPendingApproval((prev) => { prev?.resolve(true); return null; });
  }, []);

  const handleApprovalDecline = useCallback(() => {
    setPendingApproval((prev) => { prev?.resolve(false); return null; });
  }, []);

  // Start A2A chain after main workflow completes
  const startA2AChain = useCallback(() => {
    a2aTimersRef.current.forEach(clearTimeout);
    a2aTimersRef.current = [];

    setA2aPhase("gate1");

    // Gate 1 → sub_running → gate2 → analysis_running → gate3 (handled by user clicks)
    // The timers here auto-advance between sub-steps once gates are approved
  }, []);

  const handleA2AGate1 = useCallback(() => {
    setA2aPhase("sub_running");
    const t = setTimeout(() => setA2aPhase("gate2"), 2200);
    a2aTimersRef.current.push(t);
  }, []);

  const handleA2AGate2 = useCallback(() => {
    setA2aPhase("analysis_running");
    const t = setTimeout(() => {
      setGsocVerdict("false_indicator");
      setA2aPhase("gate3");
    }, 3000);
    a2aTimersRef.current.push(t);
  }, []);

  const handleA2AGate3Confirm = useCallback(() => {
    setA2aPhase("done");
    addMessage({ role: "system", content: "🛡️ GSOC determination: False indicator — no action required. Alert closed." });
    scrollBottom();
  }, [addMessage, scrollBottom]);

  const handleA2AGate3Dismiss = useCallback(() => {
    setA2aPhase("done");
    addMessage({ role: "system", content: "⚠️ GSOC determination overridden by operator. Manual review logged." });
    scrollBottom();
  }, [addMessage, scrollBottom]);

  // Abort any in-flight run: unblocks a workflow stuck at an approval gate
  // (its promise resolves false) and stops A2A timers.
  const cancelInFlight = useCallback(() => {
    abortRef.current = true;
    setPendingApproval((prev) => { prev?.resolve(false); return null; });
    a2aTimersRef.current.forEach(clearTimeout);
    a2aTimersRef.current = [];
  }, []);

  // Cleanup on unmount — dangling approval promises and timers would
  // otherwise keep the aborted workflow loop alive in the background
  useEffect(() => cancelInFlight, [cancelInFlight]);

  // Elapsed-time ticker while the agent runs
  const running = run?.phase === "running";
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [running]);

  // Operator stop — aborts mid-run, keeps the transcript
  const handleStop = useCallback(() => {
    cancelInFlight();
    setRun((prev) => prev ? {
      ...prev,
      phase: "complete",
      activeHotspot: null,
      currentThought: "Stopped by operator.",
      currentActionLabel: "Stopped",
    } : null);
    addMessage({ role: "system", content: "⏹ Agent stopped by operator — partial progress preserved" });
  }, [cancelInFlight, addMessage]);

  const executeWorkflow = useCallback(async (goal: string) => {
    abortRef.current = false;
    setA2aPhase("idle");
    setGsocVerdict(null);
    a2aTimersRef.current.forEach(clearTimeout);

    const workflow = resolveWorkflow(goal);
    const totalSteps = workflow.steps.reduce((sum, s) => sum + s.actions.length, 0);

    startTimeRef.current = Date.now();
    setRun({
      workflow,
      phase: "running",
      currentScreenId: workflow.steps[0]?.screen ?? "home",
      activeHotspot: null,
      isClicking: false,
      currentThought: "Understanding your request…",
      currentActionLabel: "Initializing investigation…",
      globalStepIndex: 0,
      totalSteps,
      completedSteps: [],
      screenTrail: [workflow.steps[0]?.screen ?? "home"],
      result: undefined,
    });

    addMessage({ role: "agent", content: `Starting **${workflow.title}**…`, partial: true });

    const isInvestigate = /light.?stop|investigate|open case/i.test(goal);
    const decisionPromise = isInvestigate
      ? callAgentDecision("Shipment OH-84764, Risk Score: 98%, Theft Probability: 97%, Weekend transit vulnerability, Unauthorized stop detected, Driver not responding to automated check-in, Battery 92%, Cargo: high-value electronics, Route: São Paulo→Chicago")
      : Promise.resolve(null);

    const [startMsg, decision] = await Promise.all([
      callAgentLLM("start", goal, workflow.title),
      decisionPromise,
    ]);
    await sleep(800);
    updateLastAgent(startMsg);
    if (decision) setAgentDecision(decision);

    let globalStep = 0;

    for (const workflowStep of workflow.steps) {
      if (abortRef.current) break;

      const actions = [...workflowStep.actions];

      // Navigation fix: a leading "navigate" action is performed on the
      // CURRENT screen — cursor travels to the top-nav link, clicks it, and
      // only then does the screen transition. No more teleporting.
      if (actions[0]?.type === "navigate") {
        const nav = actions.shift()!;
        const navSpot = navHotspotFor(nav.targetLabel);

        setRun((prev) => prev ? {
          ...prev,
          activeHotspot: navSpot,
          isClicking: false,
          currentThought: nav.thought,
          currentActionLabel: `Navigating to ${nav.targetLabel}`,
          globalStepIndex: globalStep,
        } : null);

        await sleep(Math.min(nav.durationMs * 0.6, 700));
        setRun((prev) => prev ? { ...prev, isClicking: true } : null);
        await sleep(200);
        setRun((prev) => prev ? { ...prev, isClicking: false } : null);
        await sleep(150);

        setRun((prev) => prev ? {
          ...prev,
          currentScreenId: workflowStep.screen,
          activeHotspot: null,
          screenTrail: prev.screenTrail[prev.screenTrail.length - 1] === workflowStep.screen
            ? prev.screenTrail
            : [...prev.screenTrail, workflowStep.screen],
          completedSteps: [...prev.completedSteps, nav.targetLabel],
          globalStepIndex: globalStep + 1,
        } : null);
        globalStep++;
        await sleep(450);
      } else {
        setRun((prev) => prev ? {
          ...prev,
          currentScreenId: workflowStep.screen,
          currentThought: `Opening ${workflowStep.screen.replace(/-/g, " ")}…`,
          currentActionLabel: `Opening ${workflowStep.screen.replace(/-/g, " ")}`,
          activeHotspot: null,
          screenTrail: prev.screenTrail[prev.screenTrail.length - 1] === workflowStep.screen
            ? prev.screenTrail
            : [...prev.screenTrail, workflowStep.screen],
        } : null);

        await sleep(600);
      }

      for (const action of actions) {
        if (abortRef.current) break;

        const actionIdx = actions.indexOf(action);
        const hotspot = findBestHotspot(workflowStep.screen, action.targetLabel, actionIdx);
        const needsApproval = action.type === "click" && HIGH_IMPACT_PATTERN.test(action.targetLabel);

        // Move the cursor to the target first — for gated actions the agent
        // visibly hovers over the element it wants to click while waiting
        setRun((prev) => prev ? {
          ...prev,
          activeHotspot: hotspot,
          isClicking: false,
          currentThought: needsApproval
            ? `Waiting for operator approval before I ${action.targetLabel.toLowerCase()}…`
            : action.thought,
          currentActionLabel: `${action.type === "navigate" ? "Navigating to" : action.type === "click" ? "Clicking" : action.type === "type" ? "Typing in" : action.type === "read" ? "Reading" : "Hovering over"} ${action.targetLabel}`,
          globalStepIndex: globalStep,
        } : null);

        // Human approval gate for high-impact actions
        if (needsApproval) {
          await sleep(500); // let the cursor arrive at the target
          const approved = await requestApproval(
            `Approve: ${action.targetLabel}`,
            `The agent wants to ${action.targetLabel.toLowerCase()} on your behalf. This will send a notification or take an action that affects external parties.`
          );
          if (abortRef.current) break;
          if (!approved) {
            addMessage({ role: "system", content: `↩ Skipped: ${action.targetLabel} (declined by operator)` });
            globalStep++;
            continue;
          }
          addMessage({ role: "system", content: `✓ Approved: ${action.targetLabel}` });
          setRun((prev) => prev ? { ...prev, currentThought: action.thought } : null);
        }

        await sleep(Math.min(action.durationMs * 0.4, 600));

        if (action.type === "click") {
          setRun((prev) => prev ? { ...prev, isClicking: true } : null);
          await sleep(200);
          setRun((prev) => prev ? { ...prev, isClicking: false } : null);
        }

        await sleep(action.durationMs * 0.6);

        setRun((prev) => prev ? {
          ...prev,
          completedSteps: [...prev.completedSteps, action.targetLabel],
          globalStepIndex: globalStep + 1,
        } : null);

        globalStep++;
      }

      if (workflowStep.resultSnippet) {
        updateLastAgent(`${workflow.title}: working… (${workflowStep.resultSnippet})`);
      }
    }

    if (abortRef.current) return;

    await sleep(500);
    setRun((prev) => prev ? {
      ...prev,
      phase: "complete",
      activeHotspot: null,
      currentThought: "Investigation complete. Preparing results…",
      currentActionLabel: "Completed",
      globalStepIndex: totalSteps,
    } : null);

    setResult(workflow.finalResult);

    const resultData = workflow.finalResult.data as Record<string, string> | undefined;
    let finalMessages: ChatMessage[] = [];
    setMessages(prev => { finalMessages = prev; return prev; });
    const completionMsg = await callAgentLLM("complete", goal, workflow.title, resultData, finalMessages);
    if (abortRef.current) return;
    updateLastAgent(completionMsg, true);

    addMessage({
      role: "system",
      content: `✓ Task complete in ${Math.round(totalSteps * 1.2)}s — ${totalSteps} actions executed across ${workflow.steps.length} pages`,
    });

    await sleep(600);
    if (abortRef.current) return;
    addMessage({
      role: "system",
      content: `📩 Slack alert sent → GSOC Officer (R. Chen) · #gsoc-alerts notified`,
    });

    // Trigger A2A chain after main workflow
    await sleep(800);
    if (abortRef.current) return;
    startA2AChain();
  }, [addMessage, updateLastAgent, callAgentLLM, callAgentDecision, requestApproval, startA2AChain]);

  const handleSend = useCallback((overrideText?: string) => {
    const trimmed = (overrideText ?? input).trim();
    if (!trimmed || (run?.phase === "running")) return;
    setInput("");
    setResult(null);
    setAgentDecision(null);
    cancelInFlight();

    addMessage({ role: "user", content: trimmed });
    setTimeout(() => void executeWorkflow(trimmed), 400);
  }, [input, run, addMessage, executeWorkflow, cancelInFlight]);

  const handleReset = useCallback(() => {
    cancelInFlight();
    setRun(null);
    setResult(null);
    setAgentDecision(null);
    setA2aPhase("idle");
    setGsocVerdict(null);
    setInput("");
    setMessages([{
      id: "welcome",
      role: "agent",
      content: "Hi! I'm your **Overhaul Self-Service Agent**. I can autonomously navigate the platform to track your shipments, file claims, generate risk reports, verify carriers, and more.\n\nWhat can I help you with today?",
    }]);
  }, [cancelInFlight]);

  const isRunning = run?.phase === "running";
  const isIdle = !run;

  // How many actions in this workflow will pause at a human approval gate
  const gatesArmed = run
    ? run.workflow.steps.flatMap((s) => s.actions)
        .filter((a) => a.type === "click" && HIGH_IMPACT_PATTERN.test(a.targetLabel)).length
    : 0;

  return (
    <div className={`flex overflow-hidden ${embedded ? "h-full" : "h-[calc(100vh-4rem)]"}`}>
      {/* ── Left: Customer Chat Panel ── */}
      <div className={`${embedded ? "w-[320px]" : "w-[420px]"} shrink-0 border-r border-[var(--mil-border)] flex flex-col bg-[var(--mil-panel)]`}>
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-[var(--mil-border)]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Cpu className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-white truncate">
                {embedded ? "Resolution Agent" : "Overhaul Self-Service Agent"}
              </h1>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full shrink-0",
                  isRunning ? "bg-blue-400 animate-pulse" : "bg-emerald-400"
                )} />
                <span className="text-[11px] text-[var(--mil-muted)] truncate">
                  {isRunning
                    ? `Navigating platform…${gatesArmed > 0 ? ` · ${gatesArmed} approval gate${gatesArmed > 1 ? "s" : ""} armed` : ""}`
                    : embedded ? `${CUSTOMER.name} · Ready` : "Ready"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "agent" && (
                  <div className="h-7 w-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                )}

                {msg.role === "system" ? (
                  <div className="w-full flex items-center gap-2 py-1">
                    <div className="flex-1 h-px bg-[var(--mil-border)]" />
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {msg.content}
                    </span>
                    <div className="flex-1 h-px bg-[var(--mil-border)]" />
                  </div>
                ) : (
                  <div
                    className={cn(
                      "max-w-[280px] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-[var(--mil-blue)] text-white rounded-tr-sm"
                        : "bg-[var(--mil-surface)] border border-[var(--mil-border)] text-[var(--mil-text)] rounded-tl-sm"
                    )}
                  >
                    {msg.partial && isRunning ? (
                      <span className="flex items-center gap-2 text-white/60 text-xs">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        {msg.content}
                      </span>
                    ) : (
                      <p>{renderMd(msg.content)}</p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Human approval gate — inline in chat */}
          <AnimatePresence>
            {pendingApproval && (
              <ApprovalGate
                approval={pendingApproval}
                onApprove={handleApprovalApprove}
                onDecline={handleApprovalDecline}
              />
            )}
          </AnimatePresence>

          {/* Result card */}
          {result && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <ResultCard result={result} />
            </motion.div>
          )}

          {/* Typing indicator */}
          {isRunning && !pendingApproval && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="h-7 w-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Bot className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="bg-[var(--mil-surface)] border border-[var(--mil-border)] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                {[0, 0.2, 0.4].map((d, i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 bg-emerald-400 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, delay: d, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Workflow panel — idle state */}
        {!isRunning && messages.length <= 2 && (
          <div className="shrink-0 overflow-y-auto">
            {embedded ? (
              <div className="px-4 pb-3 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-[var(--mil-muted)] mb-2 pt-3">Your active issues:</p>

                {CUSTOMER_SHIPMENTS.filter(s => s.hasAlert).map(shp => (
                  <button key={shp.id} onClick={() => handleSend(`Investigate tamper alert on ${shp.id} — ${shp.alertType}`)}
                    className="w-full text-left rounded-xl border border-red-500/30 bg-red-500/5 p-3 hover:bg-red-500/10 transition-colors group">
                    <div className="flex items-start gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-white">{shp.id}</p>
                          <span className="text-[9px] font-bold text-red-400 bg-red-500/15 px-1.5 py-0.5 rounded uppercase tracking-wide">Alert</span>
                        </div>
                        <p className="text-[10px] text-red-300 mt-0.5">{shp.alertType}</p>
                        <p className="text-[10px] text-[var(--mil-muted)] mt-0.5">{shp.cargo} · {shp.origin} → {shp.destination}</p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-red-400/50 group-hover:text-red-400 shrink-0 mt-1.5 transition-colors" />
                    </div>
                    <p className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1">
                      <Cpu className="h-2.5 w-2.5" />
                      Agent will investigate autonomously
                    </p>
                  </button>
                ))}

                {CUSTOMER_SHIPMENTS.filter(s => s.status === "Minor Delay").map(shp => (
                  <button key={shp.id} onClick={() => handleSend(`Check delivery status and delay reason for ${shp.id}`)}
                    className="w-full text-left rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 hover:bg-amber-500/10 transition-colors group">
                    <div className="flex items-start gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Clock className="h-3.5 w-3.5 text-amber-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-white">{shp.id}</p>
                          <span className="text-[9px] font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded uppercase tracking-wide">Delay</span>
                        </div>
                        <p className="text-[10px] text-amber-300 mt-0.5">{shp.status}</p>
                        <p className="text-[10px] text-[var(--mil-muted)] mt-0.5">{shp.cargo} · {shp.origin} → {shp.destination}</p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-amber-400/50 group-hover:text-amber-400 shrink-0 mt-1.5 transition-colors" />
                    </div>
                    <p className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1">
                      <Cpu className="h-2.5 w-2.5" />
                      Agent will check status and ETA
                    </p>
                  </button>
                ))}

                {CUSTOMER_SHIPMENTS.filter(s => s.coldChain && !s.hasAlert && s.status !== "Minor Delay").map(shp => (
                  <button key={shp.id} onClick={() => handleSend(`Verify cold chain integrity for ${shp.id}`)}
                    className="w-full text-left rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 hover:bg-blue-500/10 transition-colors group">
                    <div className="flex items-start gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Thermometer className="h-3.5 w-3.5 text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-white">{shp.id}</p>
                          <span className="text-[9px] font-bold text-blue-400 bg-blue-500/15 px-1.5 py-0.5 rounded uppercase tracking-wide">Cold Chain</span>
                        </div>
                        <p className="text-[10px] text-blue-300 mt-0.5">Temp: {shp.temperature}°C · On track</p>
                        <p className="text-[10px] text-[var(--mil-muted)] mt-0.5">{shp.cargo} · {shp.origin} → {shp.destination}</p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-blue-400/50 group-hover:text-blue-400 shrink-0 mt-1.5 transition-colors" />
                    </div>
                  </button>
                ))}

                <p className="text-[10px] uppercase tracking-widest text-[var(--mil-muted)] mb-1.5 mt-3">Quick actions:</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { icon: ShieldCheck, label: "Verify carrier", query: "Verify my carrier's credentials", color: "text-emerald-400" },
                    { icon: AlertTriangle, label: "Investigate Light & Stop", query: "Investigate Light & Stop case OH-84764", color: "text-red-400" },
                    { icon: FileText, label: "Risk report", query: "Generate a risk report for my cargo", color: "text-purple-400" },
                    { icon: Search, label: "Track shipment", query: "Where is my shipment?", color: "text-blue-400" },
                  ].map(a => (
                    <button key={a.label} onClick={() => handleSend(a.query)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] hover:border-emerald-500/30 hover:text-white transition-colors text-left">
                      <a.icon className={cn("h-3 w-3 shrink-0", a.color)} />
                      <span className="text-[10px] text-[var(--mil-muted)] hover:text-white leading-tight">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-5 pb-3">
                <p className="text-[10px] uppercase tracking-widest text-[var(--mil-muted)] mb-2">Quick requests:</p>
                <div className="space-y-1.5">
                  {CUSTOMER_SUGGESTIONS.map((s) => (
                    <button key={s.text} onClick={() => { setInput(s.text); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] text-[var(--mil-muted)] hover:text-white hover:border-emerald-500/30 transition-colors text-left text-xs">
                      <span className="text-base">{s.icon}</span>
                      {s.text}
                      <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-40" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <div className="shrink-0 px-5 pb-5 pt-3 border-t border-[var(--mil-border)]">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isRunning && handleSend()}
              placeholder="Describe what you need…"
              disabled={isRunning}
              className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-[var(--mil-surface)] border border-[var(--mil-border)] text-white placeholder:text-[var(--mil-muted)] focus:outline-none focus:border-emerald-500/50 disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isRunning}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-40"
            >
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
            {isRunning ? (
              <button
                onClick={handleStop}
                title="Stop agent"
                className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <Square className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleReset}
                title="Reset session"
                className="px-3 py-2.5 rounded-xl bg-[var(--mil-surface)] border border-[var(--mil-border)] text-[var(--mil-muted)] hover:text-white transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-[var(--mil-muted)] mt-2 text-center">
            Agent navigates Overhaul autonomously on your behalf
          </p>
        </div>
      </div>

      {/* ── Right: Agent Viewport + Action Feed ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top: Viewport */}
        <div className="flex-1 min-h-0 relative">
          <AgentViewport
            currentScreen={run?.currentScreenId ?? "home"}
            activeHotspot={run?.activeHotspot ?? null}
            isClicking={run?.isClicking ?? false}
            thought={run?.currentThought ?? ""}
            actionLabel={run?.currentActionLabel ?? ""}
            stepIndex={run?.globalStepIndex ?? 0}
            totalSteps={run?.totalSteps ?? 0}
            isIdle={isIdle}
          />
        </div>

        {/* Bottom: Action Feed */}
        <div className="shrink-0 border-t border-[var(--mil-border)] bg-[var(--mil-panel)]" style={{ height: "180px" }}>
          <div className="px-4 py-2.5 border-b border-[var(--mil-border)] flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-[var(--mil-muted)]" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--mil-muted)]">
              Action Feed
            </span>
            {/* Screen trail breadcrumb */}
            {run && run.screenTrail.length > 1 && (
              <span className="hidden sm:flex items-center gap-1 text-[9px] text-[var(--mil-muted)] truncate max-w-[300px]">
                {run.screenTrail.map((s, i) => (
                  <span key={`${s}-${i}`} className="flex items-center gap-1 shrink-0">
                    {i > 0 && <ChevronRight className="h-2.5 w-2.5 opacity-40" />}
                    <span className={i === run.screenTrail.length - 1 ? "text-white/70" : ""}>
                      {s.replace(/-/g, " ")}
                    </span>
                  </span>
                ))}
              </span>
            )}
            {isRunning && (
              <span className="ml-auto flex items-center gap-1.5 text-[10px] text-blue-300">
                <Loader2 className="h-3 w-3 animate-spin" />
                {pendingApproval ? "Awaiting approval…" : "Executing"}
                <span className="text-[var(--mil-muted)] tabular-nums">{elapsed}s</span>
              </span>
            )}
            {run?.phase === "complete" && a2aPhase !== "idle" && (
              <span className="ml-auto flex items-center gap-1.5 text-[10px] text-violet-300">
                <Network className="h-3 w-3" />
                A2A chain active
              </span>
            )}
            {run?.phase === "complete" && a2aPhase === "idle" && (
              <span className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                Complete
              </span>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto px-4 py-3 h-[calc(180px-40px)]">
            {isIdle && (
              <div className="flex items-center justify-center w-full">
                <p className="text-xs text-[var(--mil-muted)]">
                  Actions will appear here as the agent works…
                </p>
              </div>
            )}

            {/* AI Decision card */}
            {agentDecision && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "shrink-0 rounded-lg border px-3 py-2 min-w-[180px]",
                  agentDecision.severity === "CRITICAL" ? "border-red-500/40 bg-red-500/8" :
                  agentDecision.severity === "HIGH" ? "border-amber-500/40 bg-amber-500/8" :
                  "border-emerald-500/30 bg-emerald-500/8"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wide text-white/60">AI Decision</span>
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded",
                    agentDecision.severity === "CRITICAL" ? "bg-red-500/20 text-red-300" :
                    agentDecision.severity === "HIGH" ? "bg-amber-500/20 text-amber-300" :
                    "bg-emerald-500/20 text-emerald-300"
                  )}>{agentDecision.severity}</span>
                </div>
                <p className="text-[10px] text-white font-semibold mb-1">
                  {agentDecision.action === "call-driver" ? "📞 Call Driver" :
                   agentDecision.action === "contact-carrier" ? "📡 Contact Carrier" :
                   agentDecision.action === "waive" ? "✓ Waive Event" :
                   "🚨 Escalate to Police"}
                </p>
                <p className="text-[9px] text-white/50 leading-tight">{agentDecision.reasoning}</p>
                <div className="mt-1.5 flex items-center gap-1">
                  <div className="flex-1 bg-white/10 rounded-full h-1">
                    <div className="h-1 rounded-full bg-[#00c2b2]" style={{ width: `${agentDecision.confidence}%` }} />
                  </div>
                  <span className="text-[9px] text-[#00c2b2] font-mono">{agentDecision.confidence}%</span>
                </div>
              </motion.div>
            )}

            {run && (
              <div className="flex gap-2 items-start">
                {run.workflow.steps.map((step, stepIdx) => {
                  const stepActionsCompleted = run.completedSteps.length;
                  const stepStartGlobal = run.workflow.steps.slice(0, stepIdx).reduce((s, st) => s + st.actions.length, 0);
                  const stepEndGlobal = stepStartGlobal + step.actions.length;
                  const stepDone = stepActionsCompleted >= stepEndGlobal;
                  const stepActive = !stepDone && stepActionsCompleted >= stepStartGlobal;

                  return (
                    <motion.div
                      key={`${step.screen}-${stepIdx}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: stepIdx * 0.08 }}
                      className={cn(
                        "shrink-0 rounded-lg border px-3 py-2 min-w-[140px]",
                        stepDone
                          ? "border-emerald-500/25 bg-emerald-500/5"
                          : stepActive
                          ? "border-blue-500/40 bg-blue-500/8"
                          : "border-[var(--mil-border)] bg-[var(--mil-surface)]"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={cn(
                          "text-[9px] font-semibold uppercase tracking-wide",
                          stepDone ? "text-emerald-400" : stepActive ? "text-blue-300" : "text-[var(--mil-muted)]"
                        )}>
                          {step.screen.replace(/-/g, " ")}
                        </span>
                        {stepDone ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        ) : stepActive ? (
                          <Loader2 className="h-3 w-3 text-blue-400 animate-spin" />
                        ) : null}
                      </div>
                      <div className="space-y-0.5">
                        {step.actions.map((action, ai) => {
                          const globalIdx = stepStartGlobal + ai;
                          const done = stepActionsCompleted > globalIdx;
                          const active = stepActionsCompleted === globalIdx;
                          return (
                            <div key={ai} className="flex items-center gap-1">
                              <span className={cn(
                                "h-1 w-1 rounded-full shrink-0",
                                done ? "bg-emerald-400" : active ? "bg-blue-400 animate-pulse" : "bg-white/20"
                              )} />
                              <span className={cn(
                                "text-[9px] truncate",
                                done ? "text-white/60" : active ? "text-white/80" : "text-white/20"
                              )}>
                                {action.targetLabel.slice(0, 20)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {step.resultSnippet && stepDone && (
                        <div className="mt-1.5 flex items-center gap-1 text-[9px] text-emerald-300">
                          <ArrowRight className="h-2.5 w-2.5" />
                          {step.resultSnippet}
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {run.phase === "complete" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="shrink-0 rounded-lg border border-emerald-500/40 bg-emerald-600/10 px-3 py-2 min-w-[120px] flex flex-col items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span className="text-[9px] font-semibold text-emerald-300 text-center">Task Complete</span>
                    <span className="text-[8px] text-emerald-400/60">{run.totalSteps} actions</span>
                  </motion.div>
                )}

                {run.phase === "complete" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="shrink-0 rounded-lg border overflow-hidden min-w-[180px]"
                    style={{ borderColor: '#4A154B50', background: '#4A154B12' }}
                  >
                    <div className="flex items-center gap-1.5 px-3 py-1.5 border-b" style={{ borderColor: '#4A154B30' }}>
                      <div className="h-3.5 w-3.5 rounded flex items-center justify-center shrink-0" style={{ background: '#4A154B' }}>
                        <span className="text-[7px] font-bold text-white">#</span>
                      </div>
                      <span className="text-[9px] font-bold text-white/70">Slack Alert Sent</span>
                      <CheckCircle2 className="h-3 w-3 text-emerald-400 ml-auto" />
                    </div>
                    <div className="px-3 py-2 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="h-3 w-3 shrink-0" style={{ color: '#E8D5FF' }} />
                        <span className="text-[9px]" style={{ color: '#E8D5FF99' }}>DM → R. Chen (GSOC Officer)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Hash className="h-3 w-3 shrink-0" style={{ color: '#E8D5FF' }} />
                        <span className="text-[9px]" style={{ color: '#E8D5FF99' }}>#gsoc-alerts · 4 notified</span>
                      </div>
                      <div className="rounded px-2 py-1 font-mono text-[8px] space-y-0.5" style={{ background: '#0a0c0d', borderLeft: '2px solid #4A154B' }}>
                        <p className="text-white/50">🔔 <span className="text-emerald-400">RESOLVED</span></p>
                        <p className="text-white/30">ACE agent · {run.totalSteps} actions</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Evidence artifacts produced during the run */}
                {run.phase === "complete" && (WORKFLOW_ARTIFACTS[run.workflow.id] ?? []).map((art, i) => (
                  <motion.div
                    key={art.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + i * 0.15 }}
                    className="shrink-0 rounded-lg border border-blue-500/25 bg-blue-500/5 px-3 py-2 min-w-[160px] flex flex-col justify-center gap-1"
                  >
                    <div className="flex items-center gap-1.5">
                      <art.icon className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      <span className="text-[9px] font-semibold text-blue-200 leading-tight">{art.label}</span>
                    </div>
                    <span className="text-[8px] text-blue-300/50 pl-5">{art.meta}</span>
                    <span className="text-[8px] text-[var(--mil-muted)] pl-5 flex items-center gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" /> Evidence attached
                    </span>
                  </motion.div>
                ))}

                {/* A2A chain cards — appended after Slack card */}
                {run.phase === "complete" && a2aPhase !== "idle" && (
                  <A2AFeedCards
                    a2aPhase={a2aPhase}
                    gsocVerdict={gsocVerdict}
                    onGate1={handleA2AGate1}
                    onGate2={handleA2AGate2}
                    onGate3Confirm={handleA2AGate3Confirm}
                    onGate3Dismiss={handleA2AGate3Dismiss}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
