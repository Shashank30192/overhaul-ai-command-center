"use client";

import { useMemo, useState } from "react";
import {
  Container, Truck, Ship, Plane, ChevronDown, ChevronRight,
  Clock, Battery, User, Filter, RefreshCw, AlertTriangle, Paperclip,
  AlignJustify, Shield, Bell, Info, MapPin, Phone, Radio, FileWarning,
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

// ─── Timeline events ──────────────────────────────────────────────────────────
const TIMELINE_DATA = [
  { time: "11:29", title: "Light & Stop (Compound)", investigator: "Leobardo Cruz", icon: "compound", severity: "high" },
  { time: "11:29", title: "Hotzone stop 5 Auto", investigator: null, icon: "stop", severity: "medium" },
  { time: "11:17", title: "Light & Stop (Compound)", investigator: "Daniela Perez", icon: "compound", severity: "high" },
  { time: "11:17", title: "Light alert", investigator: null, icon: "light", severity: "low" },
  { time: "10:57", title: "Hotzone stop start 4 Auto", investigator: null, icon: "stop", severity: "medium" },
  { time: "10:04", title: "Light & Stop (Compound)", investigator: "Leobardo Cruz", icon: "compound", severity: "high" },
  { time: "10:04", title: "Light alert", investigator: null, icon: "light", severity: "low" },
  { time: "09:27", title: "Light alert", investigator: null, icon: "light", severity: "low" },
  { time: "09:27", title: "Light & Stop (Compound)", investigator: "Leobardo Cruz", icon: "compound", severity: "high" },
  { time: "09:26", title: "Current status update", investigator: null, icon: "status", severity: "normal" },
  { time: "09:23", title: "Light alert", investigator: null, icon: "light", severity: "low" },
];

// ─── Accordion section ────────────────────────────────────────────────────────
function Section({ label, children, defaultOpen = false, badge }: {
  label: string; children: React.ReactNode; defaultOpen?: boolean; badge?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/3 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-200 font-medium">{label}</span>
          {badge}
        </div>
        <ChevronDown className={cn("h-3.5 w-3.5 text-gray-500 transition-transform shrink-0", open && "rotate-180")} />
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

// ─── Active risk pill ─────────────────────────────────────────────────────────
function RiskPill({ label, count, dot }: { label: string; count: number; dot: string }) {
  return (
    <button className="flex items-center gap-1.5 text-[11px] text-gray-300 border border-white/8 rounded-full px-2.5 py-1 hover:bg-white/5 transition-colors">
      <span className={cn("h-2 w-2 rounded-full shrink-0", dot)} />
      {label}
      {count > 0 && (
        <span className="bg-white/10 rounded-full px-1.5 text-[10px] font-medium">{count}</span>
      )}
    </button>
  );
}

// ─── Timeline event row ───────────────────────────────────────────────────────
function TimelineEvent({ evt, active, onClick }: {
  evt: typeof TIMELINE_DATA[0]; active?: boolean; onClick?: () => void;
}) {
  const dotColor = evt.severity === "high" ? "bg-red-500" : evt.severity === "medium" ? "bg-amber-400" : evt.severity === "low" ? "bg-cyan-400" : "bg-gray-500";
  const textColor = active ? "text-white" : "text-gray-300";

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors group border-l-2",
        active ? "bg-[#1e3a5f]/30 border-blue-500" : "border-transparent hover:bg-white/3"
      )}
    >
      <span className="text-[10px] text-gray-600 w-9 shrink-0 pt-0.5 font-mono">{evt.time}</span>
      <span className={cn("h-2 w-2 rounded-full mt-1 shrink-0", dotColor)} />
      <div className="min-w-0 flex-1">
        <p className={cn("text-xs font-medium truncate", textColor)}>{evt.title}</p>
        {evt.investigator && (
          <p className="text-[10px] text-gray-600 flex items-center gap-1 mt-0.5">
            <User className="h-2.5 w-2.5" />{evt.investigator} investigating
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button className="p-0.5 rounded hover:bg-white/10"><MapPin className="h-3 w-3 text-gray-400" /></button>
        <button className="p-0.5 rounded hover:bg-white/10"><AlignJustify className="h-3 w-3 text-gray-400" /></button>
        <ChevronDown className="h-3 w-3 text-gray-600" />
      </div>
    </div>
  );
}

// ─── GSOC Action Panel ────────────────────────────────────────────────────────
function GsocActionPanel({ shipment, onClose }: { shipment: Shipment; onClose: () => void }) {
  const [step, setStep] = useState<"contact" | "waive" | "escalate">("contact");
  const [waiveReason, setWaiveReason] = useState("");

  const WAIVE_REASONS = [
    "Translucent Roof", "Mechanical Issues",
    "At Delivery", "Customs Inspection",
    "Lux Level / Transit", "Repeated event",
  ];

  return (
    <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111416] border border-white/10 rounded-xl w-[380px] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8">
          <div className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-white">
              {step === "contact" ? "GSOC Response — " + shipment.id :
               step === "waive" ? "Waive event" :
               "Escalate — Local Authorities"}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg leading-none">×</button>
        </div>

        {step === "contact" && (
          <div className="p-5 space-y-3">
            <p className="text-xs text-gray-400 mb-4">
              Light & Stop compound detected. Select response action for OH-{shipment.id.replace(/\D/g,'').slice(0,7)}.
            </p>
            {[
              { icon: Phone, label: "Call Driver", sub: "Vicente Rivera · +1 (555) 0192", color: "text-emerald-400", border: "border-emerald-500/30", action: () => setStep("waive") },
              { icon: Radio, label: "Contact Carrier Dispatch", sub: "Imperial Trucking · MC-029481", color: "text-blue-400", border: "border-blue-500/30", action: () => setStep("waive") },
              { icon: FileWarning, label: "Waive Event", sub: "Document reason and close alert", color: "text-amber-400", border: "border-amber-500/30", action: () => setStep("waive") },
              { icon: Shield, label: "Escalate to Local Authorities", sub: "Police / Security — requires approval", color: "text-red-400", border: "border-red-500/30", action: () => setStep("escalate") },
            ].map((a) => (
              <button
                key={a.label}
                onClick={a.action}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg border bg-white/3 hover:bg-white/6 transition-colors text-left", a.border)}
              >
                <a.icon className={cn("h-4 w-4 shrink-0", a.color)} />
                <div>
                  <p className="text-sm text-white font-medium">{a.label}</p>
                  <p className="text-[11px] text-gray-500">{a.sub}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === "waive" && (
          <div className="p-5">
            <p className="text-xs text-gray-400 mb-4">Select a reason:</p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {WAIVE_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setWaiveReason(r)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs text-left transition-colors",
                    waiveReason === r ? "border-blue-500 bg-blue-500/15 text-white" : "border-white/8 bg-white/3 text-gray-300 hover:bg-white/6"
                  )}
                >
                  <span className={cn("h-3 w-3 rounded-full border-2 shrink-0 flex items-center justify-center",
                    waiveReason === r ? "border-blue-400 bg-blue-400" : "border-gray-600"
                  )}>
                    {waiveReason === r && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                  {r}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep("contact")} className="flex-1 py-2 rounded-lg border border-white/8 text-xs text-gray-300 hover:bg-white/5">Cancel</button>
              <button
                onClick={onClose}
                disabled={!waiveReason}
                className="flex-1 py-2 rounded-lg bg-[#2563eb] hover:bg-blue-600 text-xs text-white font-medium flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <Shield className="h-3.5 w-3.5" /> Waive
              </button>
            </div>
          </div>
        )}

        {step === "escalate" && (
          <div className="p-5 space-y-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-xs text-red-300 font-medium">⚠ Escalation requires supervisor approval</p>
              <p className="text-[11px] text-gray-400 mt-1">This will alert local law enforcement and Overhaul Security Operations.</p>
            </div>
            <div className="space-y-2 text-xs text-gray-300">
              {["Notify local police — geo-fenced zone", "Alert Overhaul Ops Manager on duty", "Lock shipment status — no waive permitted"].map(a => (
                <div key={a} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                  {a}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep("contact")} className="flex-1 py-2 rounded-lg border border-white/8 text-xs text-gray-300 hover:bg-white/5">Cancel</button>
              <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-xs text-white font-medium flex items-center justify-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Confirm Escalation
              </button>
            </div>
          </div>
        )}
      </div>
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
  const [activeEvtIdx, setActiveEvtIdx] = useState(0);
  const [showGsoc, setShowGsoc] = useState(false);

  const selected = alerts.find((s) => s.id === selectedId) ?? alerts[0];
  const ohId = selected?.id.replace(/[^0-9]/g, "").slice(0, 7) ?? "—";

  if (!selected) return null;

  return (
    <div
      className="flex h-[calc(100vh-4rem-33px)] overflow-hidden relative"
      style={{ background: "#0d0f10", color: "#e5e7eb" }}
    >
      {/* ── Left sidebar ── */}
      <aside
        className="w-[340px] shrink-0 flex flex-col border-r overflow-y-auto"
        style={{ background: "#111416", borderColor: "rgba(255,255,255,0.07)" }}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-white/6 shrink-0">
          <h1 className="text-xl font-bold text-white mb-2">Risk Monitor</h1>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm text-gray-300 font-mono">OH ID: {ohId}</span>
            <span className="flex items-center gap-1.5 text-xs text-red-400 border border-red-500/40 rounded px-2 py-0.5 bg-red-500/10">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> In transit
            </span>
          </div>

          {/* Transport icons */}
          <div className="flex gap-2 mb-3">
            {[Container, Truck, Ship, Plane].map((Icon, i) => (
              <button key={i} className={cn(
                "h-9 w-9 rounded border flex items-center justify-center transition-colors",
                i === 1 ? "border-[#00c2b2]/50 bg-[#00c2b2]/10 text-[#00c2b2]" : "border-white/8 bg-white/3 text-gray-500 hover:text-gray-300"
              )}>
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          {/* Shipper / Carrier chips */}
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <span className="bg-white/5 border border-white/8 rounded px-2 py-1 text-gray-400">
              Shipper: <span className="text-white">Avengers Logistics</span>
            </span>
            <span className="bg-white/5 border border-white/8 rounded px-2 py-1 text-gray-400">
              Carrier: <span className="text-white">{selected.carrierName.slice(0, 14)}</span>
            </span>
            <span className="bg-white/5 border border-white/8 rounded px-2 py-1 text-gray-400">
              Driver: <span className="text-white">Assigned</span>
            </span>
          </div>
        </div>

        {/* Risk section */}
        <Section label="Risk" defaultOpen badge={
          <span className="text-xs font-bold text-red-400 bg-red-500/15 border border-red-500/30 rounded-full px-2 py-0.5">100+</span>
        }>
          <div className="px-4 pb-3 space-y-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Active Risk</span>
                <Info className="h-3 w-3 text-gray-600" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <RiskPill label="Light & Stop (Compound)" count={6} dot="bg-red-500" />
                <RiskPill label="Light alert" count={5} dot="bg-red-400" />
                <RiskPill label="Stop" count={0} dot="bg-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Risk factors</span>
                <Info className="h-3 w-3 text-gray-600" />
              </div>
              <span className="text-[11px] text-gray-300 bg-white/5 border border-white/8 rounded-full px-2.5 py-1">
                Commodity: {selected.cargo.split(" ").slice(0, 2).join(" ")}
              </span>
            </div>
          </div>
        </Section>

        {/* Locations */}
        <Section label="Locations">
          <div className="px-4 pb-3 space-y-2">
            {[
              { label: "Origin", val: selected.origin },
              { label: "Current", val: selected.currentLat.toFixed(4) + ", " + selected.currentLng.toFixed(4) },
              { label: "Destination", val: selected.destination },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-xs">
                <span className="text-gray-500">{r.label}</span>
                <span className="text-gray-200 truncate max-w-[180px] text-right">{r.val}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Tracking devices */}
        <Section label="Tracking devices">
          <div className="px-4 pb-3 space-y-1.5">
            {[
              { k: "Cargo IMEI", v: "72308…1088" },
              { k: "Container IMEI", v: "72308…1408" },
              { k: "Battery", v: "92%" },
              { k: "Last ping", v: "2m ago" },
            ].map(r => (
              <div key={r.k} className="flex justify-between text-xs">
                <span className="text-gray-500">{r.k}</span>
                <span className={r.k === "Battery" ? "text-emerald-400" : "text-gray-300 font-mono text-[11px]"}>{r.v}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Timeline */}
        <Section label="Timeline" defaultOpen>
          {/* Action buttons */}
          <div className="px-4 pt-1 pb-2 flex flex-wrap gap-1.5">
            <button className="flex items-center gap-1 text-[11px] text-gray-400 border border-white/8 rounded px-2 py-1 hover:text-white hover:bg-white/5">
              <Filter className="h-3 w-3" /> Filter
            </button>
            <button className="flex items-center gap-1 text-[11px] text-gray-400 border border-white/8 rounded px-2 py-1 hover:text-white hover:bg-white/5">
              <RefreshCw className="h-3 w-3" /> New status update
            </button>
            <button className="flex items-center gap-1 text-[11px] text-red-400 border border-red-500/30 rounded px-2 py-1 hover:bg-red-500/10">
              <AlertTriangle className="h-3 w-3" /> Report incident
            </button>
          </div>

          {/* Counts */}
          <div className="px-4 pb-2 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1 text-red-400"><span className="h-2 w-2 rounded-full bg-red-500" /> High <span className="text-gray-600 ml-0.5">{counts.high}</span></span>
            <span className="flex items-center gap-1 text-amber-400"><span className="h-2 w-2 rounded-full bg-amber-400" /> Medium <span className="text-gray-600 ml-0.5">0</span></span>
            <span className="flex items-center gap-1 text-cyan-400"><span className="h-2 w-2 rounded-full bg-cyan-400" /> Low <span className="text-gray-600 ml-0.5">{counts.low}</span></span>
            <span className="text-gray-600 border border-white/6 rounded px-1.5 py-0.5">1 event with notes</span>
            <span className="text-gray-600 border border-white/6 rounded px-1.5 py-0.5">0 with attachments</span>
          </div>

          {/* Event list */}
          <div className="divide-y divide-white/4">
            {TIMELINE_DATA.map((evt, i) => (
              <TimelineEvent
                key={i}
                evt={evt}
                active={i === activeEvtIdx}
                onClick={() => setActiveEvtIdx(i)}
              />
            ))}
          </div>
        </Section>

        {/* Alert switcher */}
        <div className="mt-auto border-t border-white/6 px-4 py-3">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Switch Shipment</p>
          <div className="space-y-0.5">
            {alerts.slice(0, 6).map((s) => {
              const active = s.id === selectedId;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors",
                    active ? "bg-[#1e3a5f] text-white" : "text-gray-500 hover:bg-white/4"
                  )}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", getRiskLevel(s.riskScore) === "high" ? "bg-red-500" : "bg-amber-400")} />
                    <span className="truncate">{s.riskReasons[0]?.slice(0, 20)}</span>
                  </span>
                  <span className="text-red-400 font-mono text-[10px] shrink-0 ml-1">{s.riskScore}+</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ── Map + floating panels ── */}
      <div className="flex-1 relative min-w-0">
        <RiskMonitorMap shipment={selected} />

        {/* GSOC action button */}
        <div className="absolute top-3 right-3 z-[999] flex gap-2">
          <button
            onClick={() => setShowGsoc(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-lg transition-colors"
          >
            <Shield className="h-3.5 w-3.5" /> GSOC Response
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111416]/90 border border-white/10 text-gray-300 hover:text-white text-xs transition-colors">
            <Bell className="h-3.5 w-3.5" /> Subscribe
          </button>
        </div>

        {/* RiskGPT + Notes panel */}
        <RiskGptPanel shipment={selected} />
      </div>

      {/* GSOC modal */}
      {showGsoc && <GsocActionPanel shipment={selected} onClose={() => setShowGsoc(false)} />}
    </div>
  );
}
