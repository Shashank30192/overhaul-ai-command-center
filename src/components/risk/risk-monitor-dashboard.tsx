"use client";

import { useMemo, useState } from "react";
import {
  Container, Truck, Ship, Plane, MapPin, ChevronDown, ChevronRight,
  Clock, Battery, User, Filter, RefreshCw, AlertTriangle, Paperclip,
  AlignJustify, Thermometer, Lightbulb, X,
} from "lucide-react";
import { demoData } from "@/lib/data";
import type { Shipment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RiskMonitorMap } from "./risk-monitor-map";
import { RiskGptPanel } from "./risk-gpt-panel";

// ─── Overhaul brand colors ────────────────────────────────────────────────────
// Matches the actual Overhaul GSOC dark theme from the product screenshot
const OH = {
  bg: "#0d0f10",
  panel: "#111416",
  surface: "#181c1f",
  border: "#252a2e",
  muted: "#6b7280",
  text: "#e5e7eb",
  teal: "#00c2b2",
  blue: "#3b82f6",
};

type RiskLevel = "high" | "medium" | "low" | "normal";

function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  if (score >= 40) return "low";
  return "normal";
}

const LEVEL_DOT: Record<RiskLevel, string> = {
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

const TIMELINE_TIMES = ["10:15", "09:57", "08:07", "05:40"];
const TIMELINE_EVENTS = [
  "Safezone stop start",
  "Safezone stop start",
  "Departure from pickup",
  "Segment created",
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

// ─── Temperature chart (SVG sparkline mimicking the product screenshot) ───────
function TemperatureChart() {
  const bluePoints = [16.6, 16.5, 16.1, 15.5, 15.2, 15.0, 14.9, 14.8, 14.8, 14.7, 14.6, 14.5, 14.4, 14.4, 14.3];
  const yellowPoints = [15.1, 15.2, 14.9, 14.5, 14.2, 13.9, 13.7, 13.6, 13.6, 13.5, 13.6, 13.5, 13.5, 13.6, 14.0];
  const min = 13, max = 17, w = 680, h = 120;

  const toX = (i: number) => (i / (bluePoints.length - 1)) * w;
  const toY = (v: number) => h - ((v - min) / (max - min)) * h;

  const pathFor = (pts: number[]) =>
    pts.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(" ");

  const times = ["09:17 CST", "10:06 CST", "10:55 CST", "11:44 CST", "12:33 CST", "13:23 CST"];

  return (
    <div className="flex flex-col h-full px-4 pt-3 pb-2">
      {/* Chart header */}
      <div className="flex items-center gap-6 mb-2">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="font-medium text-white">°C</span>
          <span>°F</span>
          <span>Highest: <span className="text-white font-medium">19.7 °C</span></span>
          <span>Lowest: <span className="text-white font-medium">13.5 °C</span></span>
        </div>
        <span className="ml-auto text-xs text-gray-500">Shipment statuses</span>
      </div>

      {/* SVG chart */}
      <div className="flex-1 relative overflow-hidden">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
          {/* Grid lines */}
          {[13.5, 14.3, 15.1, 15.9, 16.6].map((v) => (
            <line key={v} x1={0} y1={toY(v)} x2={w} y2={toY(v)} stroke="#252a2e" strokeWidth="1" />
          ))}
          {/* "In transit" status line */}
          <line x1={w * 0.55} y1={0} x2={w * 0.55} y2={h} stroke="#ef444466" strokeWidth="1" strokeDasharray="4,3" />
          <text x={w * 0.57} y={10} fill="#ef4444" fontSize="9" opacity="0.8">● In transit</text>

          {/* Blue line (cargo IMEI) */}
          <path d={pathFor(bluePoints)} fill="none" stroke="#3b82f6" strokeWidth="2" />
          {bluePoints.map((v, i) => (
            <circle key={i} cx={toX(i)} cy={toY(v)} r="3.5" fill="#3b82f6" />
          ))}

          {/* Yellow line (shipping container IMEI) */}
          <path d={pathFor(yellowPoints)} fill="none" stroke="#eab308" strokeWidth="2" />
          {yellowPoints.map((v, i) => (
            <circle key={i} cx={toX(i)} cy={toY(v)} r="3.5" fill="#eab308" />
          ))}

          {/* Y-axis labels */}
          {[16.6, 15.9, 15.1, 14.3, 13.5].map((v) => (
            <text key={v} x={-4} y={toY(v) + 3} fill="#6b7280" fontSize="9" textAnchor="end">{v}</text>
          ))}
        </svg>

        {/* X-axis time labels */}
        <div className="flex justify-between mt-1">
          {times.map((t) => (
            <div key={t} className="text-[9px] text-gray-600 text-center">
              <div className="text-[9px]">Jan 16, 2026 at</div>
              <div className="text-[9px]">{t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* IMEI legend */}
      <div className="flex items-center gap-6 mt-1 text-[10px] text-gray-400">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" />Cargo: IMEI: 72308628873851088</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-yellow-400" />Shipping container: IMEI: 72308628873851408</span>
      </div>
    </div>
  );
}

// ─── Left sidebar accordion section ──────────────────────────────────────────
function AccordionSection({ label, count, children, defaultOpen = false }: {
  label: string; count?: number; children?: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b" style={{ borderColor: OH.border }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-200">{label}</span>
          {count !== undefined && (
            <span className="text-xs font-bold rounded px-1.5 py-0.5 bg-[#1e3a5f] text-blue-300 min-w-[20px] text-center">{count}</span>
          )}
        </div>
        <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-transform", open && "rotate-180")} />
      </button>
      {open && children && <div className="pb-1">{children}</div>}
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export function RiskMonitorDashboard() {
  const alerts = useMemo(
    () => [...demoData.shipments].sort((a, b) => b.riskScore - a.riskScore).slice(0, 12),
    []
  );

  const counts = useMemo(() => ({
    high: alerts.filter((s) => getRiskLevel(s.riskScore) === "high").length,
    medium: alerts.filter((s) => getRiskLevel(s.riskScore) === "medium").length,
    low: alerts.filter((s) => getRiskLevel(s.riskScore) === "low").length,
    normal: alerts.filter((s) => getRiskLevel(s.riskScore) === "normal").length,
  }), [alerts]);

  const [selectedId, setSelectedId] = useState(alerts[0]?.id ?? "");
  const [sensorTab, setSensorTab] = useState<"light" | "temperature">("temperature");
  const [sensorOpen, setSensorOpen] = useState(true);

  const selected = alerts.find((s) => s.id === selectedId) ?? alerts[0];
  const timeline = selected ? buildTimeline(selected) : [];
  const ohId = selected?.id.replace(/[^0-9]/g, "").slice(0, 7) ?? "—";

  if (!selected) return null;

  return (
    <div
      className="flex h-[calc(100vh-4rem-33px)] overflow-hidden"
      style={{ background: OH.bg, color: OH.text }}
    >
      {/* ── Left sidebar ── */}
      <aside className="w-72 shrink-0 flex flex-col border-r overflow-y-auto" style={{ background: OH.panel, borderColor: OH.border }}>

        {/* Shipment header */}
        <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: OH.border }}>
          <h1 className="text-xl font-bold text-white mb-1">Risk Monitor</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-gray-300 font-mono">OH ID: {ohId}</span>
            <span className="flex items-center gap-1.5 text-xs text-red-400 border border-red-500/40 rounded px-2 py-0.5 bg-red-500/10">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              In transit
            </span>
          </div>

          {/* Transport mode icons */}
          <div className="flex gap-2 mt-3">
            {[
              { Icon: Container, active: false },
              { Icon: Truck, active: true },
              { Icon: Ship, active: false },
              { Icon: Plane, active: false },
            ].map(({ Icon, active }, i) => (
              <button
                key={i}
                className={cn(
                  "h-9 w-9 rounded flex items-center justify-center border transition-colors",
                  active
                    ? "border-[#00c2b2]/50 bg-[#00c2b2]/10 text-[#00c2b2]"
                    : "border-[#252a2e] bg-[#181c1f] text-gray-500 hover:text-gray-300"
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Risk accordion */}
        <AccordionSection label="Risk" count={counts.high + counts.medium} defaultOpen>
          <div className="px-4 pt-1 pb-2 space-y-1.5">
            {[
              { label: "High", count: counts.high, dot: "bg-red-500" },
              { label: "Medium", count: counts.medium, dot: "bg-amber-400" },
              { label: "Low", count: counts.low, dot: "bg-cyan-400" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-300">
                  <span className={cn("h-2 w-2 rounded-full", r.dot)} />
                  {r.label}
                </span>
                <span className="text-gray-500 text-xs">{r.count}</span>
              </div>
            ))}
          </div>
        </AccordionSection>

        {/* Locations accordion */}
        <AccordionSection label="Locations" defaultOpen>
          <div className="px-4 pt-1 pb-2 space-y-2">
            <div className="text-xs text-gray-400">
              <p className="text-gray-300 font-medium truncate">{selected.origin}</p>
              <p className="text-gray-600 text-[10px]">Origin</p>
            </div>
            <div className="text-xs text-gray-400">
              <p className="text-gray-300 font-medium truncate">{selected.destination}</p>
              <p className="text-gray-600 text-[10px]">Destination</p>
            </div>
          </div>
        </AccordionSection>

        {/* Tracking devices */}
        <AccordionSection label="Tracking devices">
          <div className="px-4 py-2 space-y-1.5 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>Cargo IMEI</span><span className="text-gray-500 font-mono text-[10px]">72308…1088</span>
            </div>
            <div className="flex justify-between">
              <span>Container IMEI</span><span className="text-gray-500 font-mono text-[10px]">72308…1408</span>
            </div>
            <div className="flex justify-between">
              <span>Battery</span><span className="text-emerald-400">92%</span>
            </div>
          </div>
        </AccordionSection>

        {/* Timeline accordion */}
        <AccordionSection label="Timeline" defaultOpen>
          <div className="px-4 pt-1 pb-2">
            {/* Filter / action bar */}
            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
              <button className="flex items-center gap-1 text-[11px] text-gray-400 border border-[#252a2e] rounded px-2 py-1 hover:text-white">
                <Filter className="h-3 w-3" /> Filter
              </button>
              <button className="flex items-center gap-1 text-[11px] text-gray-400 border border-[#252a2e] rounded px-2 py-1 hover:text-white">
                <RefreshCw className="h-3 w-3" /> New status update
              </button>
              <button className="flex items-center gap-1 text-[11px] text-red-400 border border-red-500/30 rounded px-2 py-1 hover:bg-red-500/10">
                <AlertTriangle className="h-3 w-3" /> Report incident
              </button>
            </div>

            {/* Risk level pills */}
            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
              <span className="flex items-center gap-1 text-[11px] text-red-400"><span className="h-2 w-2 rounded-full bg-red-500" /> High <span className="text-gray-600 ml-0.5">0</span></span>
              <span className="flex items-center gap-1 text-[11px] text-amber-400"><span className="h-2 w-2 rounded-full bg-amber-400" /> Medium <span className="text-gray-600 ml-0.5">1</span></span>
              <span className="flex items-center gap-1 text-[11px] text-cyan-400"><span className="h-2 w-2 rounded-full bg-cyan-400" /> Low <span className="text-gray-600 ml-0.5">0</span></span>
              <span className="text-[11px] text-gray-500 border border-[#252a2e] rounded px-1.5 py-0.5">1 event with notes</span>
            </div>

            {/* Timeline events */}
            <div className="space-y-0">
              {TIMELINE_TIMES.map((time, i) => (
                <div key={i} className="flex gap-3 pb-4 relative">
                  {/* Vertical line */}
                  {i < TIMELINE_TIMES.length - 1 && (
                    <div className="absolute left-[17px] top-5 bottom-0 w-px bg-[#252a2e]" />
                  )}
                  <div className="shrink-0 text-[11px] text-gray-500 w-8 text-right pt-0.5">{time}</div>
                  <div className="shrink-0 h-2 w-2 rounded-full bg-gray-600 mt-1.5 relative z-10" />
                  <div>
                    <p className="text-xs text-gray-300">{TIMELINE_EVENTS[i]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AccordionSection>

        {/* Alert list at bottom */}
        <div className="flex-1 border-t" style={{ borderColor: OH.border }}>
          <div className="px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Active Alerts</span>
          </div>
          <div className="space-y-0.5 px-2 pb-2">
            {alerts.slice(0, 8).map((s) => {
              const active = s.id === selectedId;
              const ohNum = s.id.replace(/[^0-9]/g, "").slice(0, 5);
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded text-xs transition-colors",
                    active ? "bg-[#1e3a5f] text-white" : "text-gray-400 hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", LEVEL_DOT[getRiskLevel(s.riskScore)])} />
                      <span className="truncate">{s.riskReasons[0]?.slice(0, 22) ?? "Alert"}</span>
                    </span>
                    <span className="text-red-400 font-mono text-[10px] shrink-0 ml-1">{s.riskScore}+</span>
                  </div>
                  <div className="text-[10px] text-gray-600 mt-0.5 pl-3">OH ID: {ohNum}</div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ── Main area: map + bottom sensor panel ── */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* Map takes all available space above sensor panel */}
        <div className={cn("relative", sensorOpen ? "flex-1" : "flex-1")}>
          <RiskMonitorMap shipment={selected} />
          <RiskGptPanel shipment={selected} />
        </div>

        {/* ── Bottom sensor panel ── */}
        {sensorOpen && (
          <div className="shrink-0 border-t" style={{ background: OH.panel, borderColor: OH.border, height: "220px" }}>
            {/* Tabs header */}
            <div className="flex items-center border-b px-4" style={{ borderColor: OH.border }}>
              {[
                { id: "light", icon: Lightbulb, label: "Light" },
                { id: "temperature", icon: Thermometer, label: "Temperature" },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setSensorTab(id as "light" | "temperature")}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors",
                    sensorTab === id
                      ? "border-[#00c2b2] text-[#00c2b2]"
                      : "border-transparent text-gray-500 hover:text-gray-300"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-3 text-xs text-gray-500 pr-1">
                <span>Segment: Road</span>
                <span className="text-gray-600">_</span>
                <button onClick={() => setSensorOpen(false)}>
                  <X className="h-4 w-4 hover:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Chart area */}
            <div className="h-[calc(220px-40px)] overflow-hidden">
              {sensorTab === "temperature" ? (
                <TemperatureChart />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                  Light sensor data — no events in range
                </div>
              )}
            </div>
          </div>
        )}

        {/* Re-open sensor panel if closed */}
        {!sensorOpen && (
          <button
            onClick={() => setSensorOpen(true)}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-gray-400 border border-[#252a2e] bg-[#111416] rounded px-3 py-1.5 hover:text-white"
          >
            <Thermometer className="h-3.5 w-3.5" /> Sensor data
          </button>
        )}
      </div>
    </div>
  );
}
