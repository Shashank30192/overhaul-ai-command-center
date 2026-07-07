"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain, ShieldAlert, Eye, Map, BarChart3, FileWarning,
  Activity, Cpu, ArrowUpRight, Zap, CheckCircle,
  TerminalSquare,
} from "lucide-react";

const APPS = [
  {
    icon: Cpu,
    title: "ACE",
    tagline: "Agentic customer experience",
    desc: "Ask AI, Gen AI assistant, and the autonomous Resolution Agent — investigates alerts, calls drivers, and resolves cases with human approval gates.",
    href: "/self-service",
    color: "#10b981",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    status: "live",
    badge: "Agentic",
  },
  {
    icon: Eye,
    title: "Fraud Watch",
    tagline: "Carrier risk & agentic onboarding",
    desc: "Carrier risk dashboard with Tony, the FraudWatch AI specialist — drag a carrier in and he runs a 6-stage onboarding that deploys fraud rules automatically.",
    href: "/fraud-watch",
    color: "#00c2b2",
    bg: "bg-[#00c2b2]/10",
    border: "border-[#00c2b2]/20",
    status: "alert",
    badge: "Agentic",
  },
  {
    icon: ShieldAlert,
    title: "Risk Monitor",
    tagline: "Predictive theft intelligence + RiskGPT",
    desc: "Real-time risk scoring, compound event correlation, and embedded RiskGPT analysis with one-click GSOC response.",
    href: "/risk",
    color: "#ef4444",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    status: "alert",
    badge: "3 alerts",
  },
  {
    icon: Activity,
    title: "Inventory Federation",
    tagline: "Enterprise AI operations hub",
    desc: "Live shipment grid, SLA tracking, AI command center, API monitor, and the multi-agent Orchestrator — discovery, verification, and analysis agents with human gates between tiers — in one place.",
    href: "/control-tower",
    color: "#3b82f6",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    status: "live",
    badge: "847 active",
  },
  {
    icon: Brain,
    title: "AI Copilot",
    tagline: "Natural language supply chain intelligence",
    desc: "Ask questions about shipments, risk, fraud, and routes. Get instant AI-generated answers backed by live data.",
    href: "/copilot",
    color: "#00c2b2",
    bg: "bg-[#00c2b2]/10",
    border: "border-[#00c2b2]/20",
    status: "live",
    badge: "AI",
  },
  {
    icon: FileWarning,
    title: "Fraud Detection",
    tagline: "Investigation workflows & case AI",
    desc: "Double brokering, fake PODs, invoice and identity fraud — detected, scored, and investigated by automated case workflows.",
    href: "/fraud",
    color: "#f59e0b",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    status: "alert",
    badge: "2 cases",
  },
  {
    icon: TerminalSquare,
    title: "Agent Command Center",
    tagline: "Watch autonomous agents work",
    desc: "Live view of agents executing investigations — screen navigation, tool calls, and decisions streamed in real time.",
    href: "/agent",
    color: "#10b981",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    status: "live",
    badge: "Live",
  },
  {
    icon: Map,
    title: "Digital Twin",
    tagline: "3D logistics network simulation",
    desc: "Visualize your entire supply chain network — warehouses, ports, trucks, and live cargo routes on an animated map.",
    href: "/digital-twin",
    color: "#8b5cf6",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    status: "live",
    badge: "Global",
  },
  {
    icon: BarChart3,
    title: "Executive",
    tagline: "C-suite KPIs and board-ready reports",
    desc: "Portfolio-level risk analytics, cargo protection metrics, and AI-generated executive briefings.",
    href: "/executive",
    color: "#f59e0b",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    status: "live",
    badge: "Q2 2026",
  },
];

const STATS = [
  { value: "9", label: "Active Apps" },
  { value: "9", label: "AI Agents Running" },
  { value: "847", label: "Shipments Live" },
  { value: "99.1%", label: "Platform Uptime" },
];

export default function PlatformPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0d0f10" }}>
      {/* Header bar */}
      <div className="border-b border-white/5 px-10 py-5 flex items-center justify-between" style={{ background: "#0a0c0d" }}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#00c2b2]/15 border border-[#00c2b2]/30 flex items-center justify-center">
            <Zap className="h-4 w-4 text-[#00c2b2]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Overhaul AI Platform</p>
            <p className="text-[10px] text-white/30">Select an application to launch</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-right">
              <p className="text-sm font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-white/30">{s.label}</p>
            </div>
          ))}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00c2b2]/8 border border-[#00c2b2]/20 ml-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#00c2b2] animate-pulse" />
            <span className="text-[10px] text-[#00c2b2] font-medium">All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* App grid */}
      <div className="px-10 py-8">
        <p className="text-[10px] text-white/25 uppercase tracking-widest mb-6">Applications — click to launch</p>
        <div className="grid grid-cols-4 gap-4">
          {APPS.map((app, i) => (
            <motion.div
              key={app.href}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <Link href={app.href} className="group block h-full">
                <div
                  className="relative h-full flex flex-col gap-4 p-5 rounded-xl border transition-all duration-200 cursor-pointer hover:scale-[1.01]"
                  style={{
                    background: "#111416",
                    borderColor: "rgba(255,255,255,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = app.color + "40";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 24px ${app.color}10`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  }}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center ${app.bg} border ${app.border}`}
                    >
                      <app.icon className="h-5 w-5" style={{ color: app.color }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[9px] font-semibold px-2 py-0.5 rounded-full border"
                        style={{ color: app.color, background: app.color + "15", borderColor: app.color + "30" }}
                      >
                        {app.badge}
                      </span>
                      <div className={`h-1.5 w-1.5 rounded-full ${app.status === "alert" ? "bg-red-400 animate-pulse" : "bg-green-400"}`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white group-hover:text-white transition-colors">{app.title}</p>
                    <p className="text-[10px] font-medium mt-0.5 mb-2" style={{ color: app.color }}>{app.tagline}</p>
                    <p className="text-[11px] text-white/40 leading-relaxed">{app.desc}</p>
                  </div>

                  {/* Launch footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      <span className="text-[10px] text-white/30">
                        {app.status === "alert" ? "Needs attention" : "Operational"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-white/25 group-hover:text-white/60 transition-colors">
                      Launch <ArrowUpRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
