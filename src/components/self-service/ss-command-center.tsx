"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle, Compass, Cpu, ChevronRight,
  Package, AlertTriangle, CheckCircle2, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CUSTOMER, CUSTOMER_STATS } from "@/lib/mock/self-service-mock";
import { SSHelpBotPanel } from "./ss-helpbot-panel";
import { SSNavigatorPanel } from "./ss-navigator-panel";
import { SelfServiceAgent } from "./self-service-agent";

export type SSMode = "helpbot" | "navigator" | "agent";

const MODES = [
  {
    id: "helpbot" as SSMode,
    label: "Help Bot",
    sublabel: "Mode 1 — Chatbot",
    badge: "Basic",
    badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    icon: HelpCircle,
    activeClass: "bg-slate-500/10 border-slate-400/50",
    accentColor: "text-slate-300",
    dotColor: "bg-slate-400",
    description: "Predefined Q&A — no account data, no actions",
    maturity: 1,
  },
  {
    id: "navigator" as SSMode,
    label: "Navigator",
    sublabel: "Mode 2 — Generative AI",
    badge: "Gen AI",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    icon: Compass,
    activeClass: "bg-blue-500/10 border-blue-400/50",
    accentColor: "text-blue-300",
    dotColor: "bg-blue-400",
    description: "Context-aware guidance from your account data",
    maturity: 2,
  },
  {
    id: "agent" as SSMode,
    label: "Resolution Agent",
    sublabel: "Mode 3 — Autonomous Agent",
    badge: "Agent",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    icon: Cpu,
    activeClass: "bg-emerald-500/10 border-emerald-400/50",
    accentColor: "text-emerald-300",
    dotColor: "bg-emerald-400",
    description: "Goals → Plan → Graduated autonomy → Resolution",
    maturity: 3,
  },
] as const;

function CustomerStats() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {[
        { label: "Active Shipments", value: CUSTOMER_STATS.activeShipments, icon: Package, color: "text-blue-400" },
        { label: "Open Alerts", value: CUSTOMER_STATS.openAlerts, icon: AlertTriangle, color: "text-amber-400" },
        { label: "Resolved This Week", value: CUSTOMER_STATS.resolvedThisWeek, icon: CheckCircle2, color: "text-emerald-400" },
        { label: "Pending Verify", value: CUSTOMER_STATS.pendingVerify, icon: Clock, color: "text-purple-400" },
      ].map((stat) => (
        <div key={stat.label} className="bg-[var(--mil-surface)] border border-[var(--mil-border)] rounded-md p-2.5">
          <stat.icon className={cn("h-3.5 w-3.5 mb-1", stat.color)} />
          <p className="text-base font-bold text-white">{stat.value}</p>
          <p className="text-[10px] text-[var(--mil-muted)]">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

export function SSCommandCenter() {
  const [mode, setMode] = useState<SSMode>("helpbot");
  const activeMode = MODES.find((m) => m.id === mode)!;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* ── Left Sidebar ── (exact mirror of AgentCommandCenter) */}
      <aside className="w-72 shrink-0 border-r border-[var(--mil-border)] bg-[var(--mil-panel)] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[var(--mil-border)]">
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
              AI Maturity Explorer
            </span>
          </div>
          <p className="text-[11px] text-[var(--mil-muted)] leading-relaxed">
            Three stages of AI — from Help Bot to autonomous Resolution Agent
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="p-3 space-y-2 border-b border-[var(--mil-border)]">
          <p className="text-[10px] uppercase tracking-widest text-[var(--mil-muted)] px-1 mb-2">Select AI Mode</p>
          {MODES.map((m) => {
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  "w-full text-left rounded-lg border p-3 transition-all",
                  isActive ? m.activeClass : "border-[var(--mil-border)] hover:bg-[var(--mil-elevated)] bg-transparent"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-7 w-7 rounded-md flex items-center justify-center shrink-0",
                      isActive ? "bg-white/10" : "bg-[var(--mil-surface)]"
                    )}>
                      <m.icon className={cn("h-3.5 w-3.5", isActive ? "text-white" : "text-[var(--mil-muted)]")} />
                    </div>
                    <div>
                      <p className={cn("text-xs font-semibold", isActive ? "text-white" : "text-[var(--mil-text)]")}>
                        {m.label}
                      </p>
                      <p className={cn("text-[10px]", isActive ? "text-white/60" : "text-[var(--mil-muted)]")}>
                        {m.sublabel}
                      </p>
                    </div>
                  </div>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 text-white/40 shrink-0 mt-0.5" />}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={cn(
                    "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border",
                    m.badgeColor
                  )}>
                    {m.badge}
                  </span>
                  <p className={cn("text-[10px]", isActive ? "text-white/50" : "text-[var(--mil-muted)]")}>
                    {m.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Maturity Progression */}
        <div className="p-3 border-b border-[var(--mil-border)]">
          <p className="text-[10px] uppercase tracking-widest text-[var(--mil-muted)] px-1 mb-3">AI Maturity Spectrum</p>
          <div className="space-y-1.5">
            {[
              { level: 1, label: "Chatbot", desc: "Q&A only", active: activeMode.maturity >= 1, current: activeMode.maturity === 1 },
              { level: 2, label: "Gen AI Assistant", desc: "Context + Guidance", active: activeMode.maturity >= 2, current: activeMode.maturity === 2 },
              { level: 3, label: "Autonomous Agent", desc: "Goals + Graduated actions", active: activeMode.maturity >= 3, current: activeMode.maturity === 3 },
            ].map((level) => (
              <div key={level.level} className="flex items-center gap-2">
                <div className={cn(
                  "h-6 w-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shrink-0",
                  level.current
                    ? "border-white bg-white text-black"
                    : level.active
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                    : "border-[var(--mil-border)] text-[var(--mil-muted)]"
                )}>
                  {level.level}
                </div>
                <div>
                  <p className={cn("text-xs font-medium", level.current ? "text-white" : level.active ? "text-white/70" : "text-[var(--mil-muted)]")}>
                    {level.label}
                  </p>
                  <p className="text-[10px] text-[var(--mil-muted)]">{level.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer account stats */}
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[10px] uppercase tracking-widest text-[var(--mil-muted)]">Your Account</p>
          </div>
          <p className="text-[10px] text-[var(--mil-muted)] mb-2 font-medium truncate">{CUSTOMER.name}</p>
          <CustomerStats />
        </div>

        <div className="mt-auto p-3 border-t border-[var(--mil-border)]">
          <p className="text-[10px] text-[var(--mil-muted)] text-center">
            Master&apos;s Project Prototype · Overhaul AI Research
          </p>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mode Header Bar */}
        <div className="shrink-0 px-6 py-3 border-b border-[var(--mil-border)] bg-[var(--mil-panel)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center",
              mode === "helpbot" ? "bg-slate-500/20" : mode === "navigator" ? "bg-blue-500/20" : "bg-emerald-500/20"
            )}>
              <activeMode.icon className={cn("h-4 w-4", activeMode.accentColor)} />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">{activeMode.label}</h1>
              <p className="text-[11px] text-[var(--mil-muted)]">{activeMode.sublabel}</p>
            </div>
          </div>
          <span className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
            activeMode.badgeColor
          )}>
            <span className={cn("h-1.5 w-1.5 rounded-full", activeMode.dotColor,
              mode === "agent" ? "animate-pulse" : ""
            )} />
            {activeMode.badge}
          </span>
        </div>

        {/* Panel */}
        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {mode === "helpbot" && <SSHelpBotPanel />}
              {mode === "navigator" && <SSNavigatorPanel />}
              {mode === "agent" && <SelfServiceAgent embedded />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
