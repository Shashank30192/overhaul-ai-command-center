"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/layout/brand-logo";
import {
  ArrowRight, Play, Brain, Eye, Lock, Cpu, Bot, GitBranch,
  Activity, Globe, Crown, ShieldAlert, PhoneCall, UserCheck,
  Radar, ScanSearch, ShieldCheck, Network, Zap, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedKPI } from "@/components/shared/animated-kpi";
import { DashboardPreview } from "@/components/home/dashboard-preview";
import { demoData } from "@/lib/data";

// ─── Live agent activity feed ──────────────────────────────────────────────────

const AGENT_EVENTS = [
  { agent: "Resolution Agent", action: "investigated Light & Stop on OH-84764 — driver reached, stop explained", tone: "text-emerald-300" },
  { agent: "Sherlock · FraudWatch", action: "onboarded Globex Transportation — 6 fraud rules deployed", tone: "text-[#00c2b2]" },
  { agent: "RiskGPT", action: "flagged 97% theft probability — weekend transit + route deviation", tone: "text-red-300" },
  { agent: "GSOC Analysis Agent", action: "determined false indicator — alert closed, zero analyst minutes", tone: "text-blue-300" },
  { agent: "Orchestrator", action: "chained 3 sub-agents to verify carrier MC-294817 in 41s", tone: "text-purple-300" },
  { agent: "Inventory Federation", action: "auto-healed SAP TM integration — 0 shipments dropped", tone: "text-amber-300" },
];

function LiveAgentFeed() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % AGENT_EVENTS.length), 3200);
    return () => clearInterval(t);
  }, []);
  const ev = AGENT_EVENTS[idx];
  return (
    <div className="flex items-center gap-3 rounded-full border border-[var(--mil-border)] bg-[var(--mil-surface)]/80 backdrop-blur px-4 py-2 max-w-xl">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
      </span>
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="text-xs text-[var(--mil-muted)] truncate"
        >
          <span className={`font-semibold ${ev.tone}`}>{ev.agent}</span>{" "}
          {ev.action}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

// ─── The agent workforce ───────────────────────────────────────────────────────

const AGENT_WORKFORCE = [
  {
    icon: Cpu,
    name: "Resolution Agent",
    tag: "Autonomous · Computer Use",
    accent: "emerald",
    desc: "Navigates the platform like a human operator — investigates compound alerts, calls drivers, files incidents. Every high-impact action pauses at a human approval gate.",
    bullets: ["Investigates Light & Stop cases end-to-end", "A2A chain hands off to GSOC analysis agents", "Operator approves before any outward action"],
    href: "/self-service",
    cta: "Watch it work",
  },
  {
    icon: UserCheck,
    name: "Sherlock — FraudWatch Specialist",
    tag: "Agentic Onboarding",
    accent: "teal",
    desc: "Drag a carrier onto Sherlock and he runs a 6-stage onboarding: discovers your TMS/ERP/EDI stack, generates fraud rules, validates, and deploys — conversationally.",
    bullets: ["Drag-and-drop carrier onboarding", "Auto-discovers SAP, EDI & carrier APIs", "Deploys 6 fraud rules with confidence scores"],
    href: "/fraud-watch",
    cta: "Onboard a carrier",
  },
  {
    icon: Brain,
    name: "RiskGPT",
    tag: "Embedded Risk Analyst",
    accent: "blue",
    desc: "Lives inside the Risk Monitor. Reads compound events, scores theft probability, and recommends the next action — before your analyst opens the case.",
    bullets: ["98% composite risk scoring", "Compound event correlation", "One-click GSOC response"],
    href: "/risk",
    cta: "Open Risk Monitor",
  },
  {
    icon: GitBranch,
    name: "Multi-Agent Orchestrator",
    tag: "Agent-to-Agent Chains",
    accent: "purple",
    desc: "Coordinates specialist agents — discovery, verification, analysis — into governed workflows with human gates between every tier. Now part of Inventory Federation.",
    bullets: ["Visual agent chain builder", "Human approval between tiers", "Full audit trail per hand-off"],
    href: "/control-tower",
    cta: "See the chains",
  },
] as const;

const ACCENTS: Record<string, { border: string; iconBg: string; icon: string; tag: string }> = {
  emerald: { border: "hover:border-emerald-500/40", iconBg: "bg-emerald-500/15 border-emerald-500/30", icon: "text-emerald-400", tag: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" },
  teal:    { border: "hover:border-[#00c2b2]/40",   iconBg: "bg-[#00c2b2]/15 border-[#00c2b2]/30",     icon: "text-[#00c2b2]",   tag: "text-[#00c2b2] border-[#00c2b2]/30 bg-[#00c2b2]/10" },
  blue:    { border: "hover:border-blue-500/40",    iconBg: "bg-blue-500/15 border-blue-500/30",       icon: "text-blue-400",    tag: "text-blue-300 border-blue-500/30 bg-blue-500/10" },
  purple:  { border: "hover:border-purple-500/40",  iconBg: "bg-purple-500/15 border-purple-500/30",   icon: "text-purple-400",  tag: "text-purple-300 border-purple-500/30 bg-purple-500/10" },
};

// ─── The agentic loop ──────────────────────────────────────────────────────────

const LOOP_STEPS = [
  { icon: Radar,       title: "Perceive",  desc: "Agents watch every shipment, carrier, and integration in real time." },
  { icon: ScanSearch,  title: "Reason",    desc: "RiskGPT correlates compound events and scores the threat." },
  { icon: ShieldCheck, title: "Gate",      desc: "High-impact actions pause for one-click human approval." },
  { icon: Zap,         title: "Act",       desc: "Agents call drivers, file incidents, deploy rules — autonomously." },
  { icon: CheckCircle2, title: "Verify",   desc: "A2A hand-off to GSOC agents confirms the determination." },
] as const;

// ─── Full platform grid ────────────────────────────────────────────────────────

const PLATFORM_FEATURES = [
  { icon: Cpu,        title: "ACE — Agentic Customer Experience", desc: "Ask AI, Gen AI assistant, and the autonomous Resolution Agent in one command center", href: "/self-service", flagship: true },
  { icon: Lock,       title: "Fraud Watch", desc: "Carrier risk dashboard with drag-and-drop AI onboarding by Sherlock", href: "/fraud-watch", flagship: true },
  { icon: Eye,        title: "Risk Monitor", desc: "Real-time heatmaps, predictive scoring, and embedded RiskGPT", href: "/risk", flagship: true },
  { icon: Activity,   title: "Inventory Federation", desc: "Enterprise AI operations — API health, AI command, auto-healing integrations, and the multi-agent workflow orchestrator", href: "/control-tower", flagship: false },
  { icon: Bot,        title: "AI Copilot", desc: "Natural-language access to your entire supply chain network", href: "/copilot", flagship: false },
  { icon: ShieldAlert,title: "Fraud Detection", desc: "Double brokering, fake PODs, and carrier identity fraud — caught by AI", href: "/fraud", flagship: false },
  { icon: Globe,      title: "Digital Twin", desc: "Living map of every shipment with per-lane risk simulation", href: "/digital-twin", flagship: false },
  { icon: PhoneCall,  title: "Agent Command Center", desc: "Watch autonomous agents execute live investigations", href: "/agent", flagship: false },
  { icon: Crown,      title: "Executive", desc: "AI-generated briefings and portfolio-level risk intelligence", href: "/executive", flagship: false },
  { icon: Network,    title: "Platform Tour", desc: "Guided walkthrough of the full agentic platform", href: "/platform", flagship: false },
] as const;

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[var(--mil-border)] bg-[var(--mil-surface)] mb-4">
              <BrandLogo size="sm" />
            </div>
            <div className="mb-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                <Cpu className="h-3 w-3" />
                The Agentic AI Supply Chain Platform
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              Agents that{" "}
              <span className="text-emerald-400">Predict.</span>{" "}
              <span className="text-blue-400">Prevent.</span>{" "}
              Protect.
            </h1>
            <p className="mt-6 text-lg text-[var(--mil-muted)] max-w-lg leading-relaxed">
              Autonomous AI agents investigate alerts, call drivers, onboard carriers,
              and resolve cases — end to end. Humans approve. Agents execute.
              Your cargo stays protected.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/self-service">
                <Button size="lg">
                  See Agents in Action <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/platform">
                <Button variant="secondary" size="lg">
                  <Play className="h-4 w-4" /> Platform Tour
                </Button>
              </Link>
            </div>
            <div className="mt-8">
              <LiveAgentFeed />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glow-green"
          >
            <DashboardPreview />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative border-y border-[var(--mil-border)] bg-[var(--mil-surface)] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatedKPI value={demoData.heroStats.cargoProtected} label="Cargo Protected" format="currency" />
            <AnimatedKPI value={demoData.heroStats.shipmentProtection} label="Shipment Protection" format="percent" decimals={1} suffix="%" />
            <AnimatedKPI value={demoData.heroStats.recoverySuccess} label="Recovery Success" format="percent" suffix="%" />
            <AnimatedKPI value={demoData.heroStats.analystTimeReduction} label="Analyst Time Reduction" format="percent" suffix="%" />
          </div>
        </div>
      </section>

      {/* Agent workforce */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 mb-4">
              <Bot className="h-3 w-3" /> Meet the Agent Workforce
            </span>
            <h2 className="text-3xl font-bold text-white">Not Copilots. Colleagues.</h2>
            <p className="mt-3 text-[var(--mil-muted)] max-w-2xl mx-auto">
              Every agent works a real job — with real guardrails. Human approval gates on every
              outward action, agent-to-agent verification on every determination.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {AGENT_WORKFORCE.map((agent, i) => {
              const a = ACCENTS[agent.accent];
              return (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link href={agent.href} className={`block h-full glass rounded-xl p-6 transition-all group ${a.border}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`h-11 w-11 rounded-xl border flex items-center justify-center ${a.iconBg}`}>
                        <agent.icon className={`h-5 w-5 ${a.icon}`} />
                      </div>
                      <span className={`text-[10px] font-semibold rounded-full border px-2 py-0.5 ${a.tag}`}>
                        {agent.tag}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                    <p className="mt-2 text-sm text-[var(--mil-muted)] leading-relaxed">{agent.desc}</p>
                    <ul className="mt-4 space-y-1.5">
                      {agent.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2 text-xs text-[var(--mil-muted)]">
                          <CheckCircle2 className={`h-3 w-3 shrink-0 ${a.icon}`} />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <span className={`mt-5 inline-flex items-center gap-1 text-sm font-medium ${a.icon}`}>
                      {agent.cta} <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The agentic loop */}
      <section className="relative border-y border-[var(--mil-border)] bg-[var(--mil-surface)] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white">Autonomy with a Human Handbrake</h2>
            <p className="mt-3 text-[var(--mil-muted)]">
              Every agent runs the same governed loop — so you get speed without surprises.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {LOOP_STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-xl border border-[var(--mil-border)] bg-[var(--mil-panel)] p-5 text-center"
              >
                {i < LOOP_STEPS.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mil-muted)]/40 z-10" />
                )}
                <div className={`mx-auto h-10 w-10 rounded-full flex items-center justify-center mb-3 ${
                  step.title === "Gate" ? "bg-amber-500/15 border border-amber-500/30" : "bg-emerald-500/10 border border-emerald-500/25"
                }`}>
                  <step.icon className={`h-4.5 w-4.5 ${step.title === "Gate" ? "text-amber-400" : "text-emerald-400"}`} />
                </div>
                <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                <p className="mt-1.5 text-[11px] text-[var(--mil-muted)] leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Full platform */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">The Complete Platform</h2>
            <p className="mt-3 text-[var(--mil-muted)]">
              Ten products. One agentic core. Intelligence at every layer.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PLATFORM_FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.08 }}
              >
                <Link
                  href={f.href}
                  className={`block h-full glass rounded-lg p-5 transition-all group ${
                    f.flagship ? "border-emerald-500/25 hover:border-emerald-500/50" : "hover:border-blue-500/30"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <f.icon className={`h-6 w-6 shrink-0 group-hover:scale-110 transition-transform ${f.flagship ? "text-emerald-400" : "text-blue-400"}`} />
                    {f.flagship && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 rounded-full px-2 py-0.5">
                        Agentic
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-white leading-snug">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-[var(--mil-muted)] leading-relaxed">{f.desc}</p>
                  <span className={`mt-3 inline-flex items-center gap-1 text-sm ${f.flagship ? "text-emerald-400" : "text-blue-400"}`}>
                    Explore <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-[var(--mil-border)] py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white">
              Put an agent on your next alert.
            </h2>
            <p className="mt-3 text-[var(--mil-muted)]">
              Watch the Resolution Agent investigate a live compound case — driver call,
              GSOC determination, and all — in under two minutes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/self-service">
                <Button size="lg">
                  Launch the Resolution Agent <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="secondary" size="lg">Request Demo</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
