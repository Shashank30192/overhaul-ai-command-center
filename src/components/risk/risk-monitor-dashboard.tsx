"use client";

import { useMemo, useState } from "react";
import {
  Search, Filter, Truck, Ship, Train, Plane, MapPin, ChevronDown,
  Clock, Battery, User,
} from "lucide-react";
import { demoData } from "@/lib/data";
import type { Shipment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RiskMonitorMap } from "./risk-monitor-map";
import { RiskGptPanel } from "./risk-gpt-panel";

type RiskLevel = "high" | "medium" | "low" | "normal";

function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  if (score >= 40) return "low";
  return "normal";
}

const LEVEL_COLORS: Record<RiskLevel, string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-cyan-400",
  normal: "bg-emerald-500",
};

const EVENT_TITLES = [
  "Light & Stop (Compound)",
  "Route Deviation Detected",
  "Unauthorized Stop",
  "Geofence Breach",
  "TTS Countdown Expired",
  "High-Risk Zone Entry",
];

function buildTimeline(shipment: Shipment) {
  const now = Date.now();
  return EVENT_TITLES.slice(0, 4).map((title, i) => ({
    id: `${shipment.id}-evt-${i}`,
    title,
    investigator: i === 0 ? "Nick Fury" : i === 1 ? "Maria Hill" : "Phil Coulson",
    generated: new Date(now - i * 3_600_000).toLocaleString(),
    location: i % 2 === 0 ? shipment.origin : `${shipment.destination} corridor`,
    battery: `${92 - i * 8}%`,
    status: i === 0 ? "investigating" : "logged",
  }));
}

function AlertCard({
  shipment,
  active,
  onClick,
}: {
  shipment: Shipment;
  active: boolean;
  onClick: () => void;
}) {
  const level = getRiskLevel(shipment.riskScore);
  const ohId = shipment.id.replace(/[^0-9]/g, "").slice(0, 7) || shipment.id;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-md transition-colors border",
        active
          ? "risk-card-active border-blue-400 text-white"
          : "risk-card hover:bg-[#252d25] text-[var(--mil-text)]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={cn("text-sm font-semibold truncate", active ? "text-white" : "text-white/90")}>
            {shipment.riskReasons[0] ?? "Active Risk Alert"}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className={cn("risk-pill", active ? "bg-white/20 text-white" : "bg-red-500/20 text-red-400")}>
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              In transit
            </span>
            <span className={cn("risk-pill", active ? "bg-white/15 text-white/80" : "bg-white/5 text-[var(--mil-muted)]")}>
              OH ID: {ohId}
            </span>
          </div>
          <p className={cn("text-xs mt-2 flex items-center gap-1", active ? "text-white/70" : "text-[var(--mil-muted)]")}>
            <MapPin className="h-3 w-3 shrink-0" />
            {shipment.origin} → {shipment.destination}
          </p>
          <p className={cn("text-[10px] mt-1", active ? "text-white/50" : "text-[var(--mil-muted)]/70")}>
            Updated {shipment.eta}
          </p>
        </div>
        <span className={cn(
          "shrink-0 risk-pill font-bold",
          active ? "bg-red-600 text-white" : "bg-red-500/90 text-white"
        )}>
          Risk {shipment.riskScore}+
        </span>
      </div>
      {!active && (
        <span className={cn("inline-block mt-2 h-1.5 w-1.5 rounded-full", LEVEL_COLORS[level])} />
      )}
    </button>
  );
}

export function RiskMonitorDashboard() {
  const alerts = useMemo(
    () => [...demoData.shipments]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 12),
    []
  );

  const counts = useMemo(() => ({
    high: alerts.filter((s) => getRiskLevel(s.riskScore) === "high").length,
    medium: alerts.filter((s) => getRiskLevel(s.riskScore) === "medium").length,
    low: alerts.filter((s) => getRiskLevel(s.riskScore) === "low").length,
    normal: alerts.filter((s) => getRiskLevel(s.riskScore) === "normal").length,
  }), [alerts]);

  const [selectedId, setSelectedId] = useState(alerts[0]?.id ?? "");
  const [filter, setFilter] = useState<RiskLevel | "all">("all");

  const selected = alerts.find((s) => s.id === selectedId) ?? alerts[0];
  const timeline = selected ? buildTimeline(selected) : [];
  const ohId = selected?.id.replace(/[^0-9]/g, "").slice(0, 7) ?? "—";

  const filtered = filter === "all"
    ? alerts
    : alerts.filter((s) => getRiskLevel(s.riskScore) === filter);

  if (!selected) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sub-header */}
      <div className="risk-panel border-b px-4 py-3 shrink-0">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-white">Risk Monitor</h1>
            <span className="text-[var(--mil-muted)]">|</span>
            <span className="text-sm text-white font-mono">OH ID: {ohId}</span>
            <span className="risk-pill bg-red-500/20 text-red-400 border border-red-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
              In transit
            </span>
            <span className="risk-pill bg-white/5 text-[var(--mil-muted)]">TAPA TSR Level 1</span>
          </div>

          <div className="flex items-center gap-1 ml-auto">
            {[Truck, Ship, Train, Plane].map((Icon, i) => (
              <button
                key={i}
                className={cn(
                  "h-8 w-8 flex items-center justify-center rounded border transition-colors",
                  i === 0
                    ? "bg-[var(--mil-blue-dark)] border-blue-500/40 text-blue-300"
                    : "bg-[var(--mil-surface)] border-[var(--mil-border)] text-[var(--mil-muted)] hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-3 max-w-2xl">
          {[
            { label: "Shipper", value: "Avengers Logistics", sub: selected.origin },
            { label: "Carrier", value: selected.carrierName, sub: `MC-${selected.carrierId.replace(/\D/g, "").slice(0, 6)}` },
            { label: "Driver", value: "Assigned", sub: "Last ping 2m ago" },
          ].map((item) => (
            <div key={item.label} className="risk-card px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-[var(--mil-muted)]">{item.label}</p>
              <p className="text-sm font-medium text-white truncate">{item.value}</p>
              <p className="text-[10px] text-[var(--mil-muted)] truncate">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3-pane body */}
      <div className="flex flex-1 min-h-0">
        {/* Left — alert list */}
        <aside className="w-80 shrink-0 risk-panel border-r flex flex-col min-h-0">
          <div className="p-3 border-b border-[var(--mil-border)] space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--mil-muted)]" />
              <input
                placeholder="Search alerts..."
                className="w-full pl-8 pr-8 py-2 text-xs rounded-md bg-[var(--mil-surface)] border border-[var(--mil-border)] text-white placeholder:text-[var(--mil-muted)] focus:outline-none focus:border-blue-500/50"
              />
              <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--mil-muted)]" />
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {(["high", "medium", "low", "normal"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setFilter(filter === level ? "all" : level)}
                  className={cn(
                    "risk-pill capitalize transition-colors",
                    filter === level
                      ? "bg-white/10 text-white border border-white/20"
                      : "bg-[var(--mil-surface)] text-[var(--mil-muted)] border border-[var(--mil-border)]"
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", LEVEL_COLORS[level])} />
                  {level} {counts[level]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filtered.map((s) => (
              <AlertCard
                key={s.id}
                shipment={s}
                active={s.id === selectedId}
                onClick={() => setSelectedId(s.id)}
              />
            ))}
          </div>
        </aside>

        {/* Center — timeline */}
        <section className="w-96 shrink-0 risk-panel border-r flex flex-col min-h-0">
          <div className="px-4 py-3 border-b border-[var(--mil-border)] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Timeline</h2>
            <button className="text-[var(--mil-muted)] hover:text-white">
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {timeline.map((evt, i) => (
              <div
                key={evt.id}
                className={cn(
                  "risk-card p-3",
                  i === 0 && "border-blue-500/30 bg-[var(--mil-blue-dark)]/40"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-white">{evt.title}</p>
                    <p className="text-[10px] text-[var(--mil-muted)] mt-0.5 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {evt.investigator} investigating
                    </p>
                  </div>
                  <span className={cn(
                    "risk-pill shrink-0",
                    i === 0 ? "bg-blue-500/30 text-blue-300" : "bg-white/5 text-[var(--mil-muted)]"
                  )}>
                    {evt.status}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-[10px] text-[var(--mil-muted)]">
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> Generated {evt.generated}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" /> {evt.location}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Battery className="h-3 w-3" /> Device battery {evt.battery}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Active risk badges */}
          <div className="p-3 border-t border-[var(--mil-border)]">
            <p className="text-[10px] uppercase tracking-wider text-[var(--mil-muted)] mb-2">Active Risk</p>
            <div className="flex flex-wrap gap-1.5">
              {selected.riskReasons.slice(0, 4).map((r) => (
                <span key={r} className="risk-pill bg-red-500/20 text-red-300 border border-red-500/20 text-[10px]">
                  {r}
                </span>
              ))}
              <span className="risk-pill bg-blue-500/20 text-blue-300 border border-blue-500/20 text-[10px]">
                Risk {selected.riskScore}+
              </span>
            </div>
          </div>
        </section>

        {/* Right — map + floating panel */}
        <div className="flex-1 relative min-h-0 bg-[#1a2418]">
          <RiskMonitorMap shipment={selected} />
          <RiskGptPanel shipment={selected} />
        </div>
      </div>
    </div>
  );
}
