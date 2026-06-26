"use client";

import { Leaf, Wind, Users, BarChart3, TrendingDown, Zap, Globe, ShieldCheck, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

const AGENTS = [
  {
    icon: Leaf,
    name: "Sustainability Agent",
    status: "L2 · Propose",
    statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    pulse: "bg-emerald-400",
    description: "Evaluates active shipment routes for carbon efficiency and proposes greener alternatives.",
    metric: "12 proposals today",
    metricSub: "8 accepted by dispatch",
  },
  {
    icon: Users,
    name: "Driver Wellness Agent",
    status: "L2 · Propose",
    statusColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    pulse: "bg-blue-400",
    description: "Monitors fatigue indicators and HOS compliance signals in real time.",
    metric: "94% compliance",
    metricSub: "3 rest-stop alerts sent",
  },
  {
    icon: Wind,
    name: "Carbon Intelligence Agent",
    status: "L1 · Assist",
    statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    pulse: "bg-amber-400",
    description: "Measures and forecasts CO₂e emissions at shipment, lane, and portfolio level.",
    metric: "4,280 kg CO₂e today",
    metricSub: "↓ 11% vs. last week",
  },
  {
    icon: BarChart3,
    name: "Executive ESG Agent",
    status: "L2 · Propose",
    statusColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    pulse: "bg-purple-400",
    description: "Synthesises agent outputs into ESG narratives, board metrics, and CSRD disclosure drafts.",
    metric: "Monthly report ready",
    metricSub: "Pending legal review",
  },
];

const KPI_CARDS = [
  { label: "CO₂e Saved This Month", value: "18.4 tCO₂e", delta: "-14%", up: false, icon: TrendingDown, color: "text-emerald-400" },
  { label: "Green Routes Accepted", value: "68 / 81", delta: "+23%", up: true, icon: Leaf, color: "text-emerald-400" },
  { label: "Driver Wellness Score", value: "91 / 100", delta: "+4 pts", up: true, icon: Users, color: "text-blue-400" },
  { label: "Scope 3 Cat.4 (MTD)", value: "127.3 tCO₂e", delta: "-8%", up: false, icon: Globe, color: "text-amber-400" },
  { label: "Carbon Cost Avoidance", value: "$2,940", delta: "vs. baseline", up: true, icon: Zap, color: "text-purple-400" },
  { label: "CSRD Disclosure Status", value: "On track", delta: "Next: Jul 31", up: true, icon: ShieldCheck, color: "text-emerald-400" },
];

const LANE_ROWS = [
  { lane: "São Paulo → Chicago", co2: "340 kg", delta: "-18%", carrier: "Meridian Carriers", score: 91 },
  { lane: "Shanghai → Los Angeles", co2: "1,240 kg", delta: "+6%", carrier: "Pacific Rim Freight", score: 63 },
  { lane: "Rotterdam → New York", co2: "890 kg", delta: "-3%", carrier: "Atlas Transport", score: 78 },
  { lane: "Dubai → Houston", co2: "670 kg", delta: "-22%", carrier: "Summit Logistics", score: 88 },
  { lane: "Chicago → Atlanta", co2: "120 kg", delta: "+11%", carrier: "Swift Logistics", score: 55 },
];

const PROPOSALS = [
  { shipment: "OH-84764", action: "Reroute via I-80 corridor", saving: "60 kg CO₂e", eta: "+22 min", status: "Pending" },
  { shipment: "OH-12893", action: "Switch to CNG carrier — Horizon Transport", saving: "210 kg CO₂e", eta: "+0 min", status: "Accepted" },
  { shipment: "OH-96397", action: "Consolidate with OH-17983 on same lane", saving: "95 kg CO₂e", eta: "–", status: "Pending" },
];

export default function SustainabilityPage() {
  return (
    <div className="min-h-[calc(100vh-4rem-33px)] bg-[var(--mil-bg)] text-white">
      {/* Page header */}
      <div className="border-b border-[var(--mil-border)] bg-[var(--mil-panel)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Leaf className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white">Sustainability Intelligence</h1>
              <p className="text-xs text-[var(--mil-muted)]">Multi-agent ESG · Carbon · Driver Wellness · CSRD-ready</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-300">4 agents active</span>
            <span className="ml-4 text-[10px] text-[var(--mil-muted)] border border-[var(--mil-border)] rounded px-2 py-1">Research Prototype</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {KPI_CARDS.map((k) => (
            <div key={k.label} className="bg-[var(--mil-panel)] border border-[var(--mil-border)] rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <k.icon className={cn("h-3.5 w-3.5", k.color)} />
                <span className={cn("text-[10px] flex items-center gap-0.5", k.up ? "text-emerald-400" : "text-red-400")}>
                  {k.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {k.delta}
                </span>
              </div>
              <p className="text-sm font-semibold text-white">{k.value}</p>
              <p className="text-[10px] text-[var(--mil-muted)] mt-0.5 leading-tight">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Agent swarm status */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--mil-muted)] mb-3">Agent Swarm</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {AGENTS.map((a) => (
              <div key={a.name} className="bg-[var(--mil-panel)] border border-[var(--mil-border)] rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="h-8 w-8 rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] flex items-center justify-center">
                    <a.icon className="h-4 w-4 text-[var(--mil-muted)]" />
                  </div>
                  <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border", a.statusColor)}>
                    {a.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{a.name}</p>
                  <p className="text-[11px] text-[var(--mil-muted)] mt-1 leading-relaxed">{a.description}</p>
                </div>
                <div className="pt-1 border-t border-[var(--mil-border)]">
                  <p className="text-xs font-medium text-white">{a.metric}</p>
                  <p className="text-[10px] text-[var(--mil-muted)]">{a.metricSub}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", a.pulse)} />
                  <span className="text-[10px] text-[var(--mil-muted)]">Live</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row: lane emissions + proposals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Lane emissions table */}
          <div className="bg-[var(--mil-panel)] border border-[var(--mil-border)] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--mil-border)] flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white">Lane Emissions Ranking</h3>
              <span className="text-[10px] text-[var(--mil-muted)]">kg CO₂e per shipment</span>
            </div>
            <div className="divide-y divide-[var(--mil-border)]">
              {LANE_ROWS.map((r) => (
                <div key={r.lane} className="px-4 py-2.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{r.lane}</p>
                    <p className="text-[10px] text-[var(--mil-muted)] truncate">{r.carrier}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-white font-mono">{r.co2}</p>
                    <p className={cn("text-[10px]", r.delta.startsWith("-") ? "text-emerald-400" : "text-red-400")}>{r.delta}</p>
                  </div>
                  <div className="w-12 shrink-0">
                    <div className="h-1.5 bg-[var(--mil-surface)] rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", r.score >= 80 ? "bg-emerald-500" : r.score >= 65 ? "bg-amber-400" : "bg-red-500")}
                        style={{ width: `${r.score}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-[var(--mil-muted)] text-right mt-0.5">{r.score}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active proposals */}
          <div className="bg-[var(--mil-panel)] border border-[var(--mil-border)] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--mil-border)] flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white">Sustainability Agent — Active Proposals</h3>
              <span className="text-[10px] text-[var(--mil-muted)]">L2 · Awaiting approval</span>
            </div>
            <div className="divide-y divide-[var(--mil-border)]">
              {PROPOSALS.map((p) => (
                <div key={p.shipment} className="px-4 py-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-blue-300">{p.shipment}</span>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full border",
                      p.status === "Accepted"
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    )}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-white">{p.action}</p>
                  <div className="flex items-center gap-3 text-[10px] text-[var(--mil-muted)]">
                    <span className="text-emerald-400">↓ {p.saving}</span>
                    <span>ETA impact: {p.eta}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-[var(--mil-border)] bg-[var(--mil-surface)]">
              <p className="text-[10px] text-[var(--mil-muted)]">Executive ESG Agent · Monthly report pending legal review — <span className="text-white">127.3 tCO₂e Scope 3 Cat.4 draft ready</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
