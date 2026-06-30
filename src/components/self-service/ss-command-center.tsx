"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Compass, Cpu, ArrowLeft, Zap, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SSHelpBotPanel } from "./ss-helpbot-panel";
import { SSGenAIAssistant } from "./ss-gen-ai-assistant";
import { SelfServiceAgent } from "./self-service-agent";

export type SSMode = "helpbot" | "navigator" | "agent";

const MODES = [
  {
    id: "helpbot" as SSMode,
    label: "Help Bot",
    sublabel: "Q&A Chatbot",
    badge: "Basic",
    icon: HelpCircle,
    color: "from-slate-600/30 to-slate-700/20",
    border: "border-slate-500/30 hover:border-slate-400/60",
    activeBorder: "border-slate-400/60",
    dot: "bg-slate-400",
    badgeClass: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    accentText: "text-slate-300",
    description: "Instant answers to common supply chain questions. No account data, no actions.",
    capabilities: ["Route deviation definitions", "Risk score explanations", "Policy & compliance Q&A"],
    gradient: "from-slate-500/10",
  },
  {
    id: "navigator" as SSMode,
    label: "Gen AI",
    sublabel: "Generative AI Assistant",
    badge: "AI",
    icon: Compass,
    color: "from-blue-600/30 to-blue-700/20",
    border: "border-blue-500/30 hover:border-blue-400/60",
    activeBorder: "border-blue-400/60",
    dot: "bg-blue-400",
    badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    accentText: "text-blue-300",
    description: "Context-aware intelligence powered by your live shipment data and risk profile.",
    capabilities: ["Live portfolio analysis", "Carrier risk briefings", "Incident trend reports"],
    gradient: "from-blue-500/10",
  },
  {
    id: "agent" as SSMode,
    label: "Resolution Agent",
    sublabel: "Autonomous Agent",
    badge: "Agent",
    icon: Cpu,
    color: "from-emerald-600/30 to-emerald-700/20",
    border: "border-emerald-500/30 hover:border-emerald-400/60",
    activeBorder: "border-emerald-400/60",
    dot: "bg-emerald-400",
    badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    accentText: "text-emerald-300",
    description: "Fully autonomous agent that navigates Overhaul, investigates alerts, and takes action.",
    capabilities: ["Investigate compound risks", "Call drivers autonomously", "Escalate to police if critical"],
    gradient: "from-emerald-500/10",
  },
] as const;

function AceBot({ speaking }: { speaking: boolean }) {
  return (
    <div className="relative">
      {/* Outer pulse ring */}
      {speaking && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#00c2b2]/40"
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      {/* Bot body */}
      <motion.div
        className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-[#0d1f1e] to-[#0a1a19] border-2 border-[#00c2b2]/40 flex items-center justify-center shadow-[0_0_30px_rgba(0,194,178,0.2)]"
        animate={speaking ? { y: [0, -3, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Face screen */}
        <div className="h-12 w-12 rounded-lg bg-[#001a18] border border-[#00c2b2]/30 flex flex-col items-center justify-center gap-1 overflow-hidden relative">
          {/* Scanlines effect */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,194,178,0.3) 2px, rgba(0,194,178,0.3) 3px)"
          }} />
          {/* Eyes */}
          <div className="flex gap-2 relative z-10">
            <motion.div
              className="h-2.5 w-2.5 rounded-sm bg-[#00c2b2]"
              animate={{ opacity: speaking ? [1, 0.3, 1] : 1 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="h-2.5 w-2.5 rounded-sm bg-[#00c2b2]"
              animate={{ opacity: speaking ? [1, 0.3, 1] : 1 }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            />
          </div>
          {/* Mouth */}
          <motion.div
            className="h-1 rounded-full bg-[#00c2b2]/60 relative z-10"
            animate={{ width: speaking ? ["8px", "16px", "8px"] : "8px" }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </div>
        {/* Antenna */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <motion.div
            className="h-2 w-2 rounded-full bg-[#00c2b2]"
            animate={{ boxShadow: ["0 0 4px #00c2b2", "0 0 12px #00c2b2", "0 0 4px #00c2b2"] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <div className="h-2 w-0.5 bg-[#00c2b2]/40" />
        </div>
        {/* Side bolts */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 h-3 w-1 rounded-l bg-[#00c2b2]/30" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 h-3 w-1 rounded-r bg-[#00c2b2]/30" />
      </motion.div>
    </div>
  );
}

export function SSCommandCenter() {
  const [mode, setMode] = useState<SSMode | null>(null);

  if (mode !== null) {
    const activeMode = MODES.find((m) => m.id === mode)!;
    // Use explicit viewport height so child flex chains work regardless of parent display type
    const PANEL_HEIGHT = "calc(100svh - 7rem)";
    return (
      <div className="flex flex-col" style={{ height: PANEL_HEIGHT }}>
        {/* Back bar */}
        <div className="shrink-0 px-4 py-2.5 border-b border-[var(--mil-border)] bg-[var(--mil-panel)] flex items-center gap-3">
          <button
            onClick={() => setMode(null)}
            className="flex items-center gap-2 text-xs text-[var(--mil-muted)] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to ACE
          </button>
          <span className="text-[var(--mil-border)]">·</span>
          <div className="flex items-center gap-2">
            <span className={cn("h-1.5 w-1.5 rounded-full", activeMode.dot,
              mode === "agent" ? "animate-pulse" : ""
            )} />
            <span className="text-xs font-medium text-white">{activeMode.label}</span>
            <span className="text-[10px] text-[var(--mil-muted)]">— {activeMode.sublabel}</span>
          </div>
          <div className="ml-auto">
            <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border", activeMode.badgeClass)}>
              {activeMode.badge}
            </span>
          </div>
        </div>

        {/* Mode panel — explicit flex-1 with overflow hidden so inner h-full chains resolve */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <AnimatePresence>
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {mode === "helpbot" && <SSHelpBotPanel />}
              {mode === "navigator" && <SSGenAIAssistant />}
              {mode === "agent" && <SelfServiceAgent embedded />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden py-8" style={{ minHeight: "calc(100svh - 7rem)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(rgba(0,194,178,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,194,178,1) 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#00c2b2]/3 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-3xl mx-auto px-6"
      >
        {/* Chat bubble popup */}
        <div className="bg-[#111416] border border-[#00c2b2]/20 rounded-2xl shadow-[0_0_60px_rgba(0,194,178,0.08)] overflow-hidden">

          {/* Header */}
          <div className="px-6 pt-6 pb-5 border-b border-white/5 flex items-center gap-4">
            <AceBot speaking={true} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-lg font-bold text-white tracking-tight">ACE</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00c2b2]/15 text-[#00c2b2] border border-[#00c2b2]/30 font-medium">ONLINE</span>
              </div>
              <p className="text-[11px] text-[#00c2b2]/70 font-medium uppercase tracking-widest">Autonomous Cognitive Engine</p>
            </div>
            <Zap className="h-4 w-4 text-[#00c2b2]/40" />
          </div>

          {/* Chat message */}
          <div className="px-6 pt-5 pb-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-start gap-3 mb-2"
            >
              <div className="h-6 w-6 rounded-full bg-[#00c2b2]/10 border border-[#00c2b2]/30 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="h-3 w-3 text-[#00c2b2]" />
              </div>
              <div className="bg-[#181c1f] border border-white/5 rounded-xl rounded-tl-sm px-4 py-3 max-w-md">
                <p className="text-sm text-white/90 leading-relaxed">
                  Hi! I&apos;m <strong className="text-white">ACE</strong> — your Autonomous Cognitive Engine.
                </p>
                <p className="text-sm text-white/70 mt-1 leading-relaxed">
                  What do you need help with today?
                </p>
              </div>
            </motion.div>
          </div>

          {/* 3 Mode Cards */}
          <div className="px-6 pb-6 grid grid-cols-3 gap-4">
            {MODES.map((m, i) => (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
                onClick={() => setMode(m.id)}
                className={cn(
                  "relative group flex flex-col p-5 rounded-xl border text-left transition-all duration-200",
                  "bg-[#0d0f10] hover:bg-[#141819]",
                  m.border
                )}
              >
                {/* Number badge */}
                <div className="absolute top-3 right-3 text-[10px] font-bold text-white/20">{i + 1}</div>

                {/* Icon */}
                <div className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center mb-3 border transition-colors",
                  `bg-gradient-to-br ${m.color} border-white/5 group-hover:border-white/10`
                )}>
                  <m.icon className={cn("h-4 w-4", m.accentText)} />
                </div>

                {/* Label */}
                <p className="text-sm font-semibold text-white mb-0.5">{m.label}</p>
                <p className={cn("text-[10px] font-medium mb-2", m.accentText)}>{m.sublabel}</p>

                {/* Description */}
                <p className="text-[11px] text-white/50 leading-relaxed mb-3">{m.description}</p>

                {/* Capabilities */}
                <div className="space-y-1 mt-auto">
                  {m.capabilities.map((cap) => (
                    <div key={cap} className="flex items-center gap-1.5">
                      <div className={cn("h-1 w-1 rounded-full shrink-0", m.dot)} />
                      <span className="text-[10px] text-white/40">{cap}</span>
                    </div>
                  ))}
                </div>

                {/* Arrow on hover */}
                <div className={cn(
                  "mt-3 flex items-center gap-1 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity",
                  m.accentText
                )}>
                  Launch <ChevronRight className="h-3 w-3" />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
            <p className="text-[10px] text-white/20">ACE · Autonomous Cognitive Engine Playground</p>
            <p className="text-[10px] text-[#00c2b2]/40">Powered by Groq · Llama 3.3-70B</p>
          </div>
        </div>

        {/* Floating label below */}
        <p className="text-center text-[10px] text-white/15 mt-4 uppercase tracking-widest">
          Overhaul AI Research Prototype
        </p>
      </motion.div>
    </div>
  );
}
