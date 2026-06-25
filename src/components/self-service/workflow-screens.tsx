"use client";

import { cn } from "@/lib/utils";
import type { ScreenId } from "@/lib/mock/self-service-workflows";
import { demoData } from "@/lib/data";
import { MapPin, Search, AlertTriangle, Truck, MessageSquare, FileText, User, Battery, Clock } from "lucide-react";

// ─── Mini app-screen representations ─────────────────────────────────────────
// Each component is a simplified visual replica of that page section.
// The real agent overlay (cursor + highlight) is rendered on top by the viewport.

function MiniNavbar({ activePage }: { activePage: string }) {
  const links = ["Home", "Platform", "AI Copilot", "Risk Monitor", "Fraud", "Digital Twin", "Executive"];
  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 bg-[#121612] border-b border-white/8">
      <div className="h-4 w-4 rounded bg-emerald-700/60 mr-2 shrink-0" />
      {links.map((l) => (
        <span
          key={l}
          className={cn(
            "px-1.5 py-0.5 text-[7px] rounded transition-colors",
            activePage === l ? "bg-[#2563eb] text-white" : "text-white/40"
          )}
        >
          {l}
        </span>
      ))}
    </div>
  );
}

export function HomeScreen() {
  return (
    <div className="h-full bg-[#161b16] text-white flex flex-col">
      <MiniNavbar activePage="Home" />
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8">
        <div className="h-8 w-32 bg-emerald-700/30 rounded-lg" />
        <div className="h-10 w-48 bg-white/10 rounded" />
        <div className="h-3 w-56 bg-white/5 rounded" />
        <div className="h-3 w-44 bg-white/5 rounded" />
        <div className="flex gap-2 mt-2">
          <div className="h-6 w-20 bg-[#2563eb] rounded-md" />
          <div className="h-6 w-20 bg-white/10 rounded-md" />
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4 w-full max-w-xs">
          {["$2.4B", "97.4%", "94%", "73%"].map((v) => (
            <div key={v} className="bg-white/5 rounded p-1.5 text-center">
              <p className="text-[8px] font-bold text-blue-300">{v}</p>
              <p className="text-[6px] text-white/30">metric</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RiskMonitorScreen({ highlightId }: { highlightId?: string }) {
  const alerts = demoData.shipments.slice(0, 6);
  return (
    <div className="h-full bg-[#161b16] text-white flex flex-col">
      <MiniNavbar activePage="Risk Monitor" />
      {/* Sub-header */}
      <div className="px-2 py-1.5 bg-[#222a22] border-b border-white/8 flex items-center gap-2">
        <span className="text-[7px] font-semibold text-white">Risk Monitor</span>
        <span className="text-[6px] text-white/40">|</span>
        <span className="text-[6px] text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded-full">In transit</span>
        <div className="ml-auto flex gap-1">
          {[Truck].map((Icon, i) => (
            <div key={i} className="h-4 w-4 bg-[#1e3a5f] rounded border border-blue-500/30 flex items-center justify-center">
              <Icon className="h-2.5 w-2.5 text-blue-300" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-1 min-h-0">
        {/* Alert list */}
        <div className="w-28 bg-[#222a22] border-r border-white/8 flex flex-col">
          <div className="p-1.5 border-b border-white/8">
            <div className="relative flex items-center">
              <Search className="absolute left-1 h-2 w-2 text-white/30" />
              <div className="w-full h-4 bg-[#1c221c] rounded border border-white/8 pl-4 text-[6px] text-white/20 flex items-center">Search</div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden p-1 space-y-1">
            {alerts.map((s, i) => {
              const ohId = s.id.replace(/[^0-9]/g, "").slice(0, 7);
              const active = highlightId ? s.id === highlightId : i === 0;
              return (
                <div
                  key={s.id}
                  className={cn(
                    "rounded p-1 border",
                    active ? "bg-[#2563eb] border-blue-400" : "bg-[#1c221c] border-white/8"
                  )}
                >
                  <p className="text-[6px] font-semibold text-white truncate">{s.riskReasons[0]?.slice(0, 18) ?? "Active Alert"}</p>
                  <p className="text-[5px] text-white/40">OH: {ohId}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[5px] text-white/30 flex items-center gap-0.5">
                      <MapPin className="h-1.5 w-1.5" />{s.origin.slice(0, 8)}
                    </span>
                    <span className="text-[5px] text-red-400 font-bold">{s.riskScore}+</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Timeline */}
        <div className="w-28 bg-[#1c221c] border-r border-white/8 flex flex-col">
          <div className="px-2 py-1.5 border-b border-white/8">
            <p className="text-[7px] font-semibold text-white">Timeline</p>
          </div>
          <div className="flex-1 p-1.5 space-y-1.5">
            {["Route Deviation", "Unauthorized Stop", "Geofence Breach", "TTS Expired"].map((evt, i) => (
              <div key={evt} className={cn("rounded border p-1", i === 0 ? "bg-[#1e3a5f]/40 border-blue-500/30" : "bg-[#1c221c] border-white/8")}>
                <p className="text-[6px] font-medium text-white">{evt}</p>
                <p className="text-[5px] text-white/30 flex items-center gap-0.5 mt-0.5">
                  <User className="h-1.5 w-1.5" /> Nick Fury investigating
                </p>
                <p className="text-[5px] text-white/20 flex items-center gap-0.5">
                  <Battery className="h-1.5 w-1.5" /> {92 - i * 8}% battery
                </p>
              </div>
            ))}
          </div>
        </div>
        {/* Map area */}
        <div className="flex-1 bg-[#1a2418] relative">
          <div className="absolute inset-0 opacity-30"
            style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #2563eb22 0%, transparent 70%)" }}
          />
          {/* Fake map grid */}
          <svg className="absolute inset-0 w-full h-full opacity-10">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#4ade80" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          {/* Route line */}
          <svg className="absolute inset-0 w-full h-full">
            <line x1="20%" y1="70%" x2="80%" y2="30%" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.6" />
            <circle cx="20%" cy="70%" r="3" fill="#4ade80" />
            <circle cx="50%" cy="50%" r="3" fill="#f59e0b" />
            <circle cx="80%" cy="30%" r="3" fill="#2563eb" />
          </svg>
          {/* RiskGPT floating panel hint */}
          <div className="absolute bottom-2 left-2 right-2 bg-[#222a22]/90 rounded border border-white/8 p-1.5">
            <div className="flex gap-1 mb-1">
              {["Notes", "Chat with RiskGPT", "Instructions"].map((t, i) => (
                <span key={t} className={cn("text-[5px] px-1 py-0.5 rounded", i === 1 ? "bg-[#2563eb]/60 text-white" : "text-white/30")}>{t}</span>
              ))}
            </div>
            <div className="h-2 bg-white/5 rounded w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShipmentDetailScreen() {
  const s = demoData.shipments[0];
  const ohId = s.id.replace(/[^0-9]/g, "").slice(0, 7);
  return (
    <div className="h-full bg-[#161b16] text-white flex flex-col">
      <MiniNavbar activePage="Risk Monitor" />
      <div className="px-2 py-1.5 bg-[#222a22] border-b border-white/8">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[7px] font-semibold text-white">Shipment OH-{ohId}</span>
          <span className="text-[6px] text-red-400 bg-red-500/20 px-1 rounded-full">In transit</span>
          <span className="text-[6px] text-red-500 font-bold ml-auto">Risk {s.riskScore}+</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: "Shipper", val: "Avengers Logistics", sub: s.origin },
            { label: "Carrier", val: s.carrierName.slice(0, 12), sub: `MC-${s.carrierId.slice(-6)}` },
            { label: "Driver", val: "Assigned", sub: "Last ping 2m ago" },
          ].map((item) => (
            <div key={item.label} className="bg-[#1c221c] border border-white/8 rounded p-1">
              <p className="text-[5px] text-white/30 uppercase">{item.label}</p>
              <p className="text-[6px] font-medium text-white truncate">{item.val}</p>
              <p className="text-[5px] text-white/30 truncate">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-1 min-h-0">
        <div className="w-28 bg-[#222a22] border-r border-white/8 p-1.5 space-y-1">
          <p className="text-[6px] font-semibold text-white mb-1">Active Risk</p>
          {s.riskReasons.slice(0, 4).map((r) => (
            <div key={r} className="flex items-center gap-1 text-[5px] text-red-300 bg-red-500/10 rounded px-1 py-0.5">
              <AlertTriangle className="h-2 w-2 shrink-0" />{r.slice(0, 22)}
            </div>
          ))}
          <div className="mt-2 space-y-1">
            {["Open Incident", "Notify Ops", "Export Report"].map((btn, i) => (
              <div key={btn} className={cn("h-5 rounded text-[6px] flex items-center justify-center", i === 0 ? "bg-red-600" : "bg-[#1c221c] border border-white/8 text-white/40")}>
                {btn}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 bg-[#1a2418] relative">
          <svg className="absolute inset-0 w-full h-full opacity-10">
            <defs><pattern id="grid2" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#4ade80" strokeWidth="0.5" />
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#grid2)" />
          </svg>
          <svg className="absolute inset-0 w-full h-full">
            <line x1="15%" y1="75%" x2="85%" y2="25%" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.5" />
            <line x1="15%" y1="75%" x2="50%" y2="50%" stroke="#f59e0b" strokeWidth="2" opacity="0.8" />
            <circle cx="15%" cy="75%" r="3" fill="#4ade80" />
            <circle cx="50%" cy="50%" r="4" fill="#f59e0b" className="animate-pulse" />
            <circle cx="85%" cy="25%" r="3" fill="#2563eb" />
          </svg>
          <div className="absolute top-2 left-2 bg-[#222a22]/80 rounded border border-white/8 px-2 py-1">
            <p className="text-[6px] text-white/60">ETA: {s.eta}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RiskGptChatScreen() {
  const s = demoData.shipments[0];
  const ohId = s.id.replace(/[^0-9]/g, "").slice(0, 7);
  return (
    <div className="h-full bg-[#161b16] text-white flex flex-col">
      <MiniNavbar activePage="Risk Monitor" />
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 bg-[#1a2418] relative">
          <svg className="absolute inset-0 w-full h-full opacity-10">
            <defs><pattern id="grid3" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#4ade80" strokeWidth="0.5" />
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#grid3)" />
          </svg>
          <svg className="absolute inset-0 w-full h-full">
            <line x1="20%" y1="70%" x2="80%" y2="30%" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.5" />
            <circle cx="20%" cy="70%" r="3" fill="#4ade80" />
            <circle cx="55%" cy="48%" r="4" fill="#f59e0b" />
          </svg>
          {/* Expanded RiskGPT panel */}
          <div className="absolute bottom-2 left-2 right-2 bg-[#222a22]/95 rounded-lg border border-white/10 overflow-hidden">
            <div className="flex border-b border-white/8">
              {["Notes", "Chat with RiskGPT", "Instructions"].map((t, i) => (
                <span key={t} className={cn("text-[5px] px-2 py-1", i === 1 ? "text-white bg-[#2a332a] border-b border-blue-500" : "text-white/30")}>{t}</span>
              ))}
            </div>
            <div className="p-1.5 space-y-1 max-h-24 overflow-hidden">
              <div className="bg-[#1c221c] rounded p-1 text-[5px] text-white/60 mr-4">
                Risk analysis for OH-{ohId}: Score {s.riskScore}%, route deviation detected...
              </div>
              <div className="bg-blue-500/15 border border-blue-500/20 rounded p-1 text-[5px] text-white/80 ml-4">
                Generate comprehensive risk report
              </div>
              <div className="bg-[#1c221c] rounded p-1 text-[5px] text-white/60 mr-4">
                <span className="font-semibold text-white">RiskGPT:</span> Risk score {s.riskScore}% — {s.riskReasons[0]}...
              </div>
            </div>
            <div className="p-1.5 border-t border-white/8 flex gap-1">
              <div className="flex-1 h-4 bg-[#1c221c] rounded border border-white/8 text-[5px] text-white/20 flex items-center px-1">Ask RiskGPT…</div>
              <div className="h-4 px-2 bg-[#2563eb] rounded text-[5px] text-white flex items-center">Send</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IncidentFormScreen() {
  return (
    <div className="h-full bg-[#161b16] text-white flex flex-col">
      <MiniNavbar activePage="Risk Monitor" />
      <div className="flex-1 p-3 space-y-2 overflow-hidden">
        <p className="text-[8px] font-semibold text-white">New Incident Report</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Shipment ID", val: "OH-4834221" },
            { label: "Incident Type", val: "Route Deviation" },
            { label: "Priority", val: "HIGH" },
            { label: "Assigned To", val: "Operations" },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-[5px] text-white/40 mb-0.5">{f.label}</p>
              <div className="h-5 bg-[#1c221c] border border-white/10 rounded px-1 flex items-center text-[6px] text-white/70">{f.val}</div>
            </div>
          ))}
        </div>
        <div>
          <p className="text-[5px] text-white/40 mb-0.5">Description</p>
          <div className="h-12 bg-[#1c221c] border border-white/10 rounded p-1 text-[5px] text-white/50">
            Route deviation detected 47 miles from origin. Carrier not responding to primary contact...
          </div>
        </div>
        <div>
          <p className="text-[5px] text-white/40 mb-0.5">Evidence</p>
          <div className="flex gap-1">
            {["GPS_log.json", "telemetry.csv", "route_map.png"].map((f) => (
              <div key={f} className="text-[5px] bg-[#1c221c] border border-white/10 rounded px-1 py-0.5 flex items-center gap-0.5">
                <FileText className="h-2 w-2" />{f}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <div className="h-6 px-3 bg-red-600 rounded text-[6px] text-white flex items-center">Submit Incident</div>
          <div className="h-6 px-3 bg-[#1c221c] border border-white/10 rounded text-[6px] text-white/40 flex items-center">Cancel</div>
        </div>
      </div>
    </div>
  );
}

export function CarrierProfileScreen() {
  return (
    <div className="h-full bg-[#161b16] text-white flex flex-col">
      <MiniNavbar activePage="Risk Monitor" />
      {/* Header */}
      <div className="px-2 py-1.5 bg-[#222a22] border-b border-white/8 flex items-center justify-between">
        <div>
          <p className="text-[8px] font-semibold text-white">Beacon Logistics LLC</p>
          <p className="text-[6px] text-white/40">MC-294817 · DOT-1847392 · Active since 2009</p>
        </div>
        <div className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 rounded px-1.5 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[6px] text-emerald-300">FMCSA Verified</span>
        </div>
      </div>
      <div className="flex-1 flex min-h-0">
        {/* Left: stats */}
        <div className="w-24 bg-[#1e261e] border-r border-white/8 p-1.5 space-y-1.5 shrink-0">
          {[
            { label: "Safety Rating", val: "4.2/5", color: "text-emerald-300" },
            { label: "Fraud Score", val: "18%", color: "text-emerald-300" },
            { label: "On-Time Rate", val: "94%", color: "text-blue-300" },
            { label: "Fleet Size", val: "142", color: "text-white/70" },
            { label: "Shipments", val: "847", color: "text-white/70" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#1c221c] border border-white/8 rounded p-1">
              <p className={cn("text-[8px] font-bold", stat.color)}>{stat.val}</p>
              <p className="text-[5px] text-white/30">{stat.label}</p>
            </div>
          ))}
        </div>
        {/* Right: checks + certs */}
        <div className="flex-1 p-1.5 space-y-1.5 overflow-hidden">
          <p className="text-[6px] font-semibold text-white/60 uppercase tracking-wide">Credential Checks</p>
          {[
            { label: "USDOT Registration", status: "pass", val: "DOT-1847392 Active" },
            { label: "MC Authority", status: "pass", val: "MC-294817 Common Carrier" },
            { label: "Insurance Coverage", status: "pass", val: "$1M liability · Valid Dec 2025" },
            { label: "Name Cross-Reference", status: "pass", val: "No aliases detected" },
            { label: "First Officer", status: "warn", val: "1 prior incident (2021)" },
            { label: "Address Validation", status: "pass", val: "Dallas, TX — confirmed" },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-1.5 bg-[#1c221c] border border-white/8 rounded px-1.5 py-1">
              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", c.status === "pass" ? "bg-emerald-400" : "bg-amber-400")} />
              <div className="flex-1 min-w-0">
                <p className="text-[5px] text-white/50">{c.label}</p>
                <p className="text-[6px] text-white/80 truncate">{c.val}</p>
              </div>
              <span className={cn("text-[5px] font-bold uppercase", c.status === "pass" ? "text-emerald-400" : "text-amber-400")}>
                {c.status === "pass" ? "✓" : "!"}
              </span>
            </div>
          ))}
          <p className="text-[6px] font-semibold text-white/60 uppercase tracking-wide pt-1">Certifications</p>
          {["TAPA TSR Level 1", "ISO 28000", "C-TPAT Certified"].map((c) => (
            <div key={c} className="flex items-center gap-1 text-[5px] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{c}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FraudCheckScreen() {
  const checks = [
    { label: "Address Verification", status: "pass", detail: "Dallas, TX 75201 — confirmed" },
    { label: "USDOT Lookup", status: "pass", detail: "DOT-1847392 Active carrier" },
    { label: "Name Cross-Reference", status: "pass", detail: "No aliases or DBA matches" },
    { label: "Phone Verification", status: "pass", detail: "+1 (214) 555-0182 — valid" },
    { label: "Insurance Check", status: "pass", detail: "$1M liability, valid" },
    { label: "First Officer Review", status: "warn", detail: "1 prior incident flagged" },
  ];
  return (
    <div className="h-full bg-[#161b16] text-white flex flex-col">
      <MiniNavbar activePage="Fraud" />
      {/* Sub-header */}
      <div className="px-2 py-1.5 bg-[#222a22] border-b border-white/8 flex items-center gap-2">
        <span className="text-[7px] font-semibold text-white">Fraud Watch</span>
        <span className="text-[6px] text-white/40">·</span>
        <span className="text-[6px] text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded-full">Bad Actor Check</span>
        <div className="ml-auto flex items-center gap-1 text-[5px] text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Running checks…
        </div>
      </div>
      <div className="flex flex-1 min-h-0">
        {/* Carrier list sidebar */}
        <div className="w-28 bg-[#1e261e] border-r border-white/8 flex flex-col">
          <div className="p-1.5 border-b border-white/8">
            <div className="h-4 bg-[#1c221c] border border-white/8 rounded flex items-center px-1">
              <Search className="h-2 w-2 text-white/30 mr-1" />
              <span className="text-[5px] text-white/40">Beacon Logistics</span>
            </div>
          </div>
          <div className="flex-1 p-1 space-y-1">
            {[
              { name: "Beacon Logistics", score: 18, active: true },
              { name: "Swift Transport", score: 34, active: false },
              { name: "United Freight", score: 72, active: false },
            ].map((c) => (
              <div key={c.name} className={cn("rounded p-1 border", c.active ? "bg-[#1e3a5f] border-blue-400/40" : "bg-[#1c221c] border-white/8")}>
                <p className="text-[6px] font-medium text-white truncate">{c.name}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[5px] text-white/30">Risk</span>
                  <span className={cn("text-[5px] font-bold", c.score < 30 ? "text-emerald-400" : c.score < 60 ? "text-amber-400" : "text-red-400")}>{c.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Check results */}
        <div className="flex-1 p-2 space-y-1.5 overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[7px] font-semibold text-white">Beacon Logistics LLC</p>
            <span className="text-[5px] text-white/40">MC-294817</span>
          </div>
          {checks.map((c, i) => (
            <div key={c.label} className={cn(
              "flex items-start gap-1.5 rounded border px-1.5 py-1",
              c.status === "pass" ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/8"
            )}>
              <span className={cn("h-1.5 w-1.5 rounded-full mt-0.5 shrink-0", c.status === "pass" ? "bg-emerald-400" : "bg-amber-400 animate-pulse")} />
              <div className="flex-1 min-w-0">
                <p className="text-[5px] text-white/50">{c.label}</p>
                <p className="text-[6px] text-white/80">{c.detail}</p>
              </div>
              <span className={cn("text-[5px] font-bold shrink-0", c.status === "pass" ? "text-emerald-400" : "text-amber-400")}>
                {c.status === "pass" ? "PASS" : "WARN"}
              </span>
            </div>
          ))}
          {/* Overall score */}
          <div className="mt-1.5 bg-[#1c221c] border border-white/10 rounded p-1.5 flex items-center justify-between">
            <div>
              <p className="text-[5px] text-white/40">Composite Fraud Risk</p>
              <p className="text-[8px] font-bold text-emerald-300">18% — LOW RISK</p>
            </div>
            <div className="h-8 w-8 rounded-full border-2 border-emerald-500 bg-emerald-500/10 flex items-center justify-center">
              <span className="text-[7px] font-bold text-emerald-300">18</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DigitalTwinScreen() {
  return (
    <div className="h-full bg-[#161b16] text-white flex flex-col">
      <MiniNavbar activePage="Digital Twin" />
      <div className="flex-1 bg-[#1a2418] relative">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(ellipse at 40% 40%, #2563eb33 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, #4ade8011 0%, transparent 50%)" }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs><pattern id="grid4" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#4ade80" strokeWidth="0.5" />
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid4)" />
        </svg>
        {/* Multiple shipment markers */}
        {[
          { x: "20%", y: "65%", color: "#ef4444" },
          { x: "40%", y: "45%", color: "#f59e0b" },
          { x: "60%", y: "35%", color: "#4ade80" },
          { x: "75%", y: "55%", color: "#2563eb" },
          { x: "35%", y: "70%", color: "#ef4444" },
          { x: "55%", y: "25%", color: "#4ade80" },
        ].map((m, i) => (
          <svg key={i} className="absolute inset-0 w-full h-full">
            <circle cx={m.x} cy={m.y} r="4" fill={m.color} opacity="0.8" />
            <circle cx={m.x} cy={m.y} r="8" fill={m.color} opacity="0.15" />
          </svg>
        ))}
        <div className="absolute bottom-2 left-2 bg-[#222a22]/90 rounded border border-white/8 p-1.5">
          <p className="text-[6px] font-semibold text-white mb-1">Live Shipments</p>
          <div className="flex gap-1">
            {[{ c: "#ef4444", l: "High Risk" }, { c: "#f59e0b", l: "Medium" }, { c: "#4ade80", l: "Normal" }].map((item) => (
              <div key={item.l} className="flex items-center gap-0.5 text-[5px] text-white/40">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.c }} />
                {item.l}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-2 right-2 bg-[#222a22]/90 rounded border border-white/8 p-1.5 text-right">
          <p className="text-[6px] text-white/60">
            <Clock className="h-2 w-2 inline mr-0.5" />Live · {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ExecutiveReportScreen() {
  return (
    <div className="h-full bg-[#161b16] text-white flex flex-col">
      <MiniNavbar activePage="Executive" />
      <div className="flex-1 p-3 space-y-2 overflow-hidden">
        <div className="flex items-start justify-between">
          <p className="text-[8px] font-semibold text-white">Executive Risk Briefing</p>
          <span className="text-[5px] text-white/40">{new Date().toLocaleDateString()}</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { l: "Cargo Protected", v: "$2.4B", c: "text-blue-300" },
            { l: "Active Alerts", v: "87", c: "text-amber-300" },
            { l: "Fraud Cases", v: "8", c: "text-red-300" },
            { l: "SLA Compliance", v: "97.4%", c: "text-emerald-300" },
          ].map((s) => (
            <div key={s.l} className="bg-[#1c221c] border border-white/8 rounded p-1.5">
              <p className={cn("text-[9px] font-bold", s.c)}>{s.v}</p>
              <p className="text-[5px] text-white/30">{s.l}</p>
            </div>
          ))}
        </div>
        <div className="bg-[#1c221c] border border-white/8 rounded p-1.5">
          <p className="text-[6px] font-semibold text-white mb-1">Risk Trend (24h)</p>
          <div className="flex items-end gap-0.5 h-10">
            {[40, 55, 45, 65, 70, 60, 80, 75, 85].map((h, i) => (
              <div key={i} className="flex-1 bg-blue-500/40 rounded-t" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="space-y-1">
          {["Mexico Corridor — elevated risk", "Carrier CAR-0018 non-compliant", "Cold chain excursion risk (Miami)"].map((item, i) => (
            <div key={item} className="flex items-center gap-1.5 text-[5px]">
              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", i === 0 ? "bg-red-400" : i === 1 ? "bg-amber-400" : "bg-blue-400")} />
              <span className="text-white/60">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Screen Registry ──────────────────────────────────────────────────────────

export function getScreen(id: ScreenId): React.ReactNode {
  switch (id) {
    case "home": return <HomeScreen />;
    case "risk-monitor": return <RiskMonitorScreen />;
    case "shipment-detail": return <ShipmentDetailScreen />;
    case "riskgpt-chat": return <RiskGptChatScreen />;
    case "incident-form": return <IncidentFormScreen />;
    case "carrier-profile": return <CarrierProfileScreen />;
    case "fraud-dashboard": return <FraudCheckScreen />;
    case "digital-twin": return <DigitalTwinScreen />;
    case "executive-report": return <ExecutiveReportScreen />;
    default: return <HomeScreen />;
  }
}

export const SCREEN_LABELS: Record<ScreenId, string> = {
  "home": "Home",
  "risk-monitor": "Risk Monitor",
  "shipment-detail": "Shipment Detail",
  "riskgpt-chat": "RiskGPT Chat",
  "incident-form": "Incident Form",
  "carrier-profile": "Carrier Profile",
  "executive-report": "Executive Report",
  "fraud-dashboard": "Fraud Dashboard",
  "digital-twin": "Digital Twin",
  "search-results": "Search Results",
};

// ─── Hotspot positions (x%, y%) for each screen — where the agent cursor goes ─

export type Hotspot = { x: number; y: number; label: string };

export const SCREEN_HOTSPOTS: Partial<Record<ScreenId, Hotspot[]>> = {
  "home": [
    { x: 38, y: 12, label: "Risk Monitor nav link" },
    { x: 50, y: 75, label: "Request Demo" },
  ],
  "risk-monitor": [
    { x: 18, y: 30, label: "Search box" },
    { x: 18, y: 50, label: "Alert card" },
    { x: 18, y: 65, label: "Alert card" },
    { x: 65, y: 70, label: "Map marker" },
  ],
  "shipment-detail": [
    { x: 15, y: 55, label: "Risk factors" },
    { x: 15, y: 72, label: "Open Incident" },
    { x: 65, y: 50, label: "GPS position" },
    { x: 65, y: 20, label: "ETA panel" },
  ],
  "riskgpt-chat": [
    { x: 50, y: 72, label: "RiskGPT tab" },
    { x: 50, y: 82, label: "Chat input" },
    { x: 50, y: 65, label: "AI response" },
  ],
  "incident-form": [
    { x: 50, y: 35, label: "Description field" },
    { x: 50, y: 55, label: "Evidence upload" },
    { x: 30, y: 78, label: "Submit button" },
  ],
  "carrier-profile": [
    { x: 33, y: 32, label: "Safety rating" },
    { x: 50, y: 32, label: "Fraud score" },
    { x: 67, y: 32, label: "On-time rate" },
    { x: 65, y: 52, label: "Credential checks" },
    { x: 65, y: 65, label: "USDOT status" },
    { x: 65, y: 78, label: "Certifications" },
  ],
  "fraud-dashboard": [
    { x: 20, y: 25, label: "Carrier search" },
    { x: 20, y: 45, label: "Beacon Logistics" },
    { x: 65, y: 38, label: "USDOT lookup" },
    { x: 65, y: 48, label: "Name cross-reference" },
    { x: 65, y: 58, label: "Insurance check" },
    { x: 65, y: 68, label: "First officer review" },
    { x: 65, y: 80, label: "Composite risk score" },
  ],
  "digital-twin": [
    { x: 40, y: 45, label: "Shipment marker" },
    { x: 60, y: 35, label: "Shipment marker" },
    { x: 20, y: 65, label: "Shipment marker" },
  ],
};
