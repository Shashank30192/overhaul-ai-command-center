"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, RotateCcw, Bot, CheckCircle2, Loader2, Cpu,
  ArrowRight, Zap, MessageSquare, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  resolveWorkflow,
  CUSTOMER_SUGGESTIONS,
  type CustomerWorkflow,
  type WorkflowResult,
  type ScreenId,
} from "@/lib/mock/self-service-workflows";
import { SCREEN_HOTSPOTS, type Hotspot } from "./workflow-screens";
import { AgentViewport } from "./agent-viewport";

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentPhase = "idle" | "running" | "complete";

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
  result?: WorkflowResult;
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

// ─── Main Component ───────────────────────────────────────────────────────────

export function SelfServiceAgent() {
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
  const abortRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
  }, []);

  const addMessage = useCallback((msg: Omit<ChatMessage, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: `msg-${Date.now()}-${Math.random()}` }]);
    scrollBottom();
  }, [scrollBottom]);

  const updateLastAgent = useCallback((content: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "agent" && last.partial) {
        return [...prev.slice(0, -1), { ...last, content, partial: false }];
      }
      return prev;
    });
    scrollBottom();
  }, [scrollBottom]);

  const executeWorkflow = useCallback(async (goal: string) => {
    abortRef.current = false;
    const workflow = resolveWorkflow(goal);

    // Count total actions across all steps
    const totalSteps = workflow.steps.reduce((sum, s) => sum + s.actions.length, 0);

    // Initial run state
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
      result: undefined,
    });

    addMessage({ role: "agent", content: `I'll **${workflow.title}** for you now. Let me navigate the platform…`, partial: true });
    await sleep(800);

    // Update with "Accessing platform" message
    updateLastAgent(`Starting **${workflow.title}**. I'm accessing the Overhaul platform now…`);

    let globalStep = 0;

    for (const workflowStep of workflow.steps) {
      if (abortRef.current) break;

      // Navigate to screen
      setRun((prev) => prev ? {
        ...prev,
        currentScreenId: workflowStep.screen,
        currentThought: `Navigating to ${workflowStep.screen.replace(/-/g, " ")}…`,
        currentActionLabel: `Opening ${workflowStep.screen.replace(/-/g, " ")}`,
        activeHotspot: null,
      } : null);

      await sleep(600);

      for (const action of workflowStep.actions) {
        if (abortRef.current) break;

        // Pick hotspot for this action
        const screenHotspots = SCREEN_HOTSPOTS[workflowStep.screen] ?? [];
        const hotspot = screenHotspots[workflowStep.actions.indexOf(action) % screenHotspots.length] ?? null;

        // Move cursor to hotspot
        setRun((prev) => prev ? {
          ...prev,
          activeHotspot: hotspot,
          isClicking: false,
          currentThought: action.thought,
          currentActionLabel: `${action.type === "navigate" ? "Navigating to" : action.type === "click" ? "Clicking" : action.type === "type" ? "Typing in" : action.type === "read" ? "Reading" : "Hovering over"} ${action.targetLabel}`,
          globalStepIndex: globalStep,
        } : null);

        await sleep(Math.min(action.durationMs * 0.4, 600));

        // Click animation
        if (action.type === "click") {
          setRun((prev) => prev ? { ...prev, isClicking: true } : null);
          await sleep(200);
          setRun((prev) => prev ? { ...prev, isClicking: false } : null);
        }

        await sleep(action.durationMs * 0.6);

        // Add completed step
        setRun((prev) => prev ? {
          ...prev,
          completedSteps: [...prev.completedSteps, action.targetLabel],
          globalStepIndex: globalStep + 1,
        } : null);

        globalStep++;
      }

      // Show result snippet mid-workflow
      if (workflowStep.resultSnippet) {
        updateLastAgent(
          `${workflow.title}: working… (${workflowStep.resultSnippet})`
        );
      }
    }

    if (abortRef.current) return;

    // Complete
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
    updateLastAgent(workflow.finalResult.message);

    addMessage({
      role: "system",
      content: `✓ Task complete in ${Math.round(totalSteps * 1.2)}s — ${totalSteps} actions executed across ${workflow.steps.length} pages`,
    });

    scrollBottom();
  }, [addMessage, updateLastAgent, scrollBottom]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || (run?.phase === "running")) return;
    setInput("");
    setResult(null);
    abortRef.current = true; // cancel any existing run

    addMessage({ role: "user", content: trimmed });
    setTimeout(() => void executeWorkflow(trimmed), 400);
  }, [input, run, addMessage, executeWorkflow]);

  const handleReset = useCallback(() => {
    abortRef.current = true;
    setRun(null);
    setResult(null);
    setInput("");
    setMessages([{
      id: "welcome",
      role: "agent",
      content: "Hi! I'm your **Overhaul Self-Service Agent**. I can autonomously navigate the platform to track your shipments, file claims, generate risk reports, verify carriers, and more.\n\nWhat can I help you with today?",
    }]);
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollBottom();
  }, [messages, scrollBottom]);

  const isRunning = run?.phase === "running";
  const isIdle = !run;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* ── Left: Customer Chat Panel ── */}
      <div className="w-[420px] shrink-0 border-r border-[var(--mil-border)] flex flex-col bg-[var(--mil-panel)]">
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-[var(--mil-border)]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Cpu className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Overhaul Self-Service Agent</h1>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isRunning ? "bg-blue-400 animate-pulse" : "bg-emerald-400"
                )} />
                <span className="text-[11px] text-[var(--mil-muted)]">
                  {isRunning ? "Agent working…" : "Ready"}
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

          {/* Result card */}
          {result && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <ResultCard result={result} />
            </motion.div>
          )}

          {/* Typing indicator */}
          {isRunning && (
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

        {/* Suggestions */}
        {!isRunning && messages.length <= 2 && (
          <div className="shrink-0 px-5 pb-3">
            <p className="text-[10px] uppercase tracking-widest text-[var(--mil-muted)] mb-2">Quick requests:</p>
            <div className="space-y-1.5">
              {CUSTOMER_SUGGESTIONS.map((s) => (
                <button
                  key={s.text}
                  onClick={() => { setInput(s.text); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] text-[var(--mil-muted)] hover:text-white hover:border-emerald-500/30 transition-colors text-left text-xs"
                >
                  <span className="text-base">{s.icon}</span>
                  {s.text}
                  <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-40" />
                </button>
              ))}
            </div>
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
              onClick={handleSend}
              disabled={!input.trim() || isRunning}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-40"
            >
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2.5 rounded-xl bg-[var(--mil-surface)] border border-[var(--mil-border)] text-[var(--mil-muted)] hover:text-white transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
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
            {isRunning && (
              <span className="ml-auto flex items-center gap-1.5 text-[10px] text-blue-300">
                <Loader2 className="h-3 w-3 animate-spin" />
                Executing
              </span>
            )}
            {run?.phase === "complete" && (
              <span className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                Complete
              </span>
            )}
          </div>

          <div className="flex gap-0 overflow-x-auto px-4 py-3 h-[calc(180px-40px)]">
            {isIdle && (
              <div className="flex items-center justify-center w-full">
                <p className="text-xs text-[var(--mil-muted)]">
                  Actions will appear here as the agent works…
                </p>
              </div>
            )}

            {run && (
              <div className="flex gap-2 items-start">
                {/* Workflow steps as cards */}
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

                {/* Final complete card */}
                {run.phase === "complete" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="shrink-0 rounded-lg border border-emerald-500/40 bg-emerald-600/10 px-3 py-2 min-w-[120px] flex flex-col items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span className="text-[9px] font-semibold text-emerald-300 text-center">
                      Task Complete
                    </span>
                    <span className="text-[8px] text-emerald-400/60">
                      {run.totalSteps} actions
                    </span>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
