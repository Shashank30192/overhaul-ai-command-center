"use client";

import { cn } from "@/lib/utils";
import type { ScreenId } from "@/lib/mock/self-service-workflows";
import { demoData } from "@/lib/data";
import { MapPin, Search, AlertTriangle, Truck, MessageSquare, FileText, User, Battery, Clock } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScreenProps {
  interaction?: string; // current action label — drives internal element highlighting
}

// ─── Mini Navbar ──────────────────────────────────────────────────────────────

const NAV_ITEMS = ["Home", "Platform", "AI Copilot", "Risk Monitor", "Fraud", "Digital Twin", "Executive"];

function MiniNavbar({ activePage, interaction }: { activePage: string; interaction?: string }) {
  // Find which nav link is being navigated to
  const clicking = NAV_ITEMS.find(
    (l) => interaction?.toLowerCase().includes(l.toLowerCase()) ||
      (l === "Fraud" && interaction?.toLowerCase().includes("fraud watch"))
  );

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 bg-[#121612] border-b border-white/8 shrink-0">
      <div className="h-4 w-4 rounded bg-emerald-700/60 mr-2 shrink-0" />
      {NAV_ITEMS.map((l) => (
        <span
          key={l}
          className={cn(
            "px-1.5 py-0.5 text-[7px] rounded transition-all duration-200",
            activePage === l
              ? "bg-[#2563eb] text-white"
              : clicking === l
              ? "bg-[#2563eb]/70 text-white animate-pulse"
              : "text-white/40"
          )}
        >
          {l}
        </span>
      ))}
    </div>
  );
}

// ─── Screen Components ────────────────────────────────────────────────────────

export function HomeScreen({ interaction }: ScreenProps) {
  return (
    <div className="h-full bg-[#161b16] text-white flex flex-col">
      <MiniNavbar activePage="Home" interaction={interaction} />
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

export function RiskMonitorScreen({ highlightId, interaction }: { highlightId?: string; interaction?: string }) {
  const alerts = demoData.shipments.slice(0, 6);
  const searchActive = !!interaction?.match(/search|typing|oh id/i);
  const typingText = interaction?.match(/oh id:\s*(\S+)/i)?.[1] ?? "";
  // Which alert card is selected (clicked)
  const selectedIdx = interaction?.match(/alert card|active risk alert|weekend transit|unverified carrier|gps signal|high crime/i)
    ? 0
    : interaction?.match(/oh id/i)
    ? 0
    : interaction?.match(/carrier.*beacon/i)
    ? alerts.findIndex((s) => s.carrierName.toLowerCase().includes("beacon"))
    : -1;

  return (
    <div className="h-full bg-[#161b16] text-white flex flex-col">
      <MiniNavbar activePage="Risk Monitor" interaction={interaction} />
      {/* Sub-header */}
      <div className="px-2 py-1.5 bg-[#222a22] border-b border-white/8 flex items-center gap-2 shrink-0">
        <span className="text-[7px] font-semibold text-white">Risk Monitor</span>
        <span className="text-[6px] text-white/40">|</span>
        <span className="text-[6px] text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded-full">In transit</span>
        <div className="ml-auto flex gap-1">
          <div className="h-4 w-4 bg-[#1e3a5f] rounded border border-blue-500/30 flex items-center justify-center">
            <Truck className="h-2.5 w-2.5 text-blue-300" />
          </div>
        </div>
      </div>
      <div className="flex flex-1 min-h-0">
        {/* Alert list */}
        <div className="w-28 bg-[#222a22] border-r border-white/8 flex flex-col">
          <div className="p-1.5 border-b border-white/8 shrink-0">
            <div className={cn(
              "relative flex items-center rounded border",
              searchActive ? "border-blue-400 bg-[#1e3a5f]/40" : "border-white/8 bg-[#1c221c]"
            )}>
              <Search className="absolute left-1 h-2 w-2 text-white/30" />
              <div className="w-full h-4 pl-4 text-[6px] flex items-center text-white/60">
                {typingText || (searchActive ? <span className="animate-pulse text-blue-300">|</span> : <span className="text-white/20">Search</span>)}
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden p-1 space-y-1">
            {alerts.map((s, i) => {
              const ohId = s.id.replace(/[^0-9]/g, "").slice(0, 7);
              const selected = i === selectedIdx;
              return (
                <div
                  key={s.id}
                  className={cn(
                    "rounded p-1 border transition-colors",
                    selected ? "bg-[#2563eb] border-blue-400" : "bg-[#1c221c] border-white/8"
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
          <div className="px-2 py-1.5 border-b border-white/8 shrink-0">
            <p className="text-[7px] font-semibold text-white">Timeline</p>
          </div>
          <div className="flex-1 p-1.5 space-y-1.5 overflow-hidden">
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
          <svg className="absolute inset-0 w-full h-full opacity-10">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#4ade80" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <svg className="absolute inset-0 w-full h-full">
            <line x1="20%" y1="70%" x2="80%" y2="30%" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.6" />
            <circle cx="20%" cy="70%" r="3" fill="#4ade80" />
            <circle cx="50%" cy="50%" r="3" fill="#f59e0b" />
            <circle cx="80%" cy="30%" r="3" fill="#2563eb" />
          </svg>
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

export function ShipmentDetailScreen({ interaction }: ScreenProps) {
  const s = demoData.shipments[0];
  const ohId = s.id.replace(/[^0-9]/g, "").slice(0, 7);
  const readingRisk = !!interaction?.match(/risk|alert/i);
  const readingMap = !!interaction?.match(/map|gps|position/i);
  const readingEta = !!interaction?.match(/eta|panel/i);

  return (
    <div className="h-full bg-[#161b16] text-white flex flex-col">
      <MiniNavbar activePage="Risk Monitor" interaction={interaction} />
      <div className="px-2 py-1.5 bg-[#222a22] border-b border-white/8 shrink-0">
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
        <div className={cn("w-28 bg-[#222a22] border-r border-white/8 p-1.5 space-y-1 shrink-0", readingRisk && "bg-[#1e3a5f]/20")}>
          <p className="text-[6px] font-semibold text-white mb-1">Active Risk</p>
          {s.riskReasons.slice(0, 4).map((r) => (
            <div key={r} className={cn("flex items-center gap-1 text-[5px] rounded px-1 py-0.5", readingRisk ? "text-red-200 bg-red-500/20 border border-red-500/30" : "text-red-300 bg-red-500/10")}>
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
            <circle cx="50%" cy="50%" r={readingMap ? "6" : "4"} fill="#f59e0b" className={readingMap ? "animate-pulse" : ""} />
            <circle cx="85%" cy="25%" r="3" fill="#2563eb" />
          </svg>
          <div className={cn(
            "absolute top-2 left-2 bg-[#222a22]/80 rounded border px-2 py-1",
            readingEta ? "border-blue-400/50 bg-[#1e3a5f]/60" : "border-white/8"
          )}>
            <p className="text-[6px] text-white/60">ETA: {s.eta}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RiskGptChatScreen({ interaction }: ScreenProps) {
  const s = demoData.shipments[0];
  const ohId = s.id.replace(/[^0-9]/g, "").slice(0, 7);
  const typing = !!interaction?.match(/type|generate|risk report/i);

  return (
    <div className="h-full bg-[#161b16] text-white flex flex-col">
      <MiniNavbar activePage="Risk Monitor" interaction={interaction} />
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
              <div className={cn("border rounded p-1 text-[5px] ml-4", typing ? "bg-blue-600/25 border-blue-400/50 text-white" : "bg-blue-500/15 border-blue-500/20 text-white/80")}>
                {typing ? <span>Generate comprehensive risk report<span className="animate-pulse">|</span></span> : "Generate comprehensive risk report"}
              </div>
              <div className="bg-[#1c221c] rounded p-1 text-[5px] text-white/60 mr-4">
                <span className="font-semibold text-white">RiskGPT:</span> Risk score {s.riskScore}% — {s.riskReasons[0]}...
              </div>
            </div>
            <div className={cn("p-1.5 border-t border-white/8 flex gap-1", typing && "bg-[#1e3a5f]/20")}>
              <div className="flex-1 h-4 bg-[#1c221c] rounded border border-white/8 text-[5px] text-white/20 flex items-center px-1">Ask RiskGPT…</div>
              <div className="h-4 px-2 bg-[#2563eb] rounded text-[5px] text-white flex items-center">Send</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IncidentFormScreen({ interaction }: ScreenProps) {
  const typing = !!interaction?.match(/description|type|form/i);
  const submitting = !!interaction?.match(/submit/i);
  const evidence = !!interaction?.match(/evidence|attach|gps/i);

  return (
    <div className="h-full bg-[#161b16] text-white flex flex-col">
      <MiniNavbar activePage="Risk Monitor" interaction={interaction} />
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
          <div className={cn("h-12 rounded p-1 text-[5px]", typing ? "bg-[#1e3a5f]/30 border border-blue-400/40 text-white/80" : "bg-[#1c221c] border border-white/10 text-white/50")}>
            Route deviation detected 47 miles from origin. Carrier not responding to primary contact{typing ? <span className="animate-pulse">|</span> : "..."}
          </div>
        </div>
        <div className={cn("rounded p-1", evidence && "bg-[#1e3a5f]/20 border border-blue-400/30")}>
          <p className="text-[5px] text-white/40 mb-0.5">Evidence</p>
          <div className="flex gap-1">
            {["GPS_log.json", "telemetry.csv", "route_map.png"].map((f) => (
              <div key={f} className={cn("text-[5px] rounded px-1 py-0.5 flex items-center gap-0.5", evidence ? "bg-blue-600/30 border border-blue-400/40 text-white" : "bg-[#1c221c] border border-white/10")}>
                <FileText className="h-2 w-2" />{f}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <div className={cn("h-6 px-3 rounded text-[6px] text-white flex items-center transition-all", submitting ? "bg-red-500 scale-95 opacity-90" : "bg-red-600")}>Submit Incident</div>
          <div className="h-6 px-3 bg-[#1c221c] border border-white/10 rounded text-[6px] text-white/40 flex items-center">Cancel</div>
        </div>
      </div>
    </div>
  );
}

export function CarrierProfileScreen({ interaction }: ScreenProps) {
  const readingStats = !!interaction?.match(/safety|performance|rating|on-time/i);
  const readingCreds = !!interaction?.match(/fmcsa|credential|mc authority|address/i);
  const readingCerts = !!interaction?.match(/certif|tapa|iso|c-tpat/i);

  const checks = [
    { label: "USDOT Registration", status: "pass", val: "DOT-1847392 Active" },
    { label: "MC Authority", status: "pass", val: "MC-294817 Common Carrier" },
    { label: "Insurance Coverage", status: "pass", val: "$1M liability · Valid Dec 2025" },
    { label: "Name Cross-Reference", status: "pass", val: "No aliases detected" },
    { label: "First Officer", status: "warn", val: "1 prior incident (2021)" },
    { label: "Address Validation", status: "pass", val: "Dallas, TX — confirmed" },
  ];

  return (
    <div className="h-full bg-[#161b16] text-white flex flex-col">
      <MiniNavbar activePage="Risk Monitor" interaction={interaction} />
      <div className="px-2 py-1.5 bg-[#222a22] border-b border-white/8 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[8px] font-semibold text-white">Beacon Logistics LLC</p>
          <p className="text-[6px] text-white/40">MC-294817 · DOT-1847392 · Active since 2009</p>
        </div>
        <div className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 rounded px-1.5 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[6px] text-emerald-300">FMCSA Verified</span>
        </div>
      </div>
      <div className="flex flex-1 min-h-0">
        {/* Left: stats */}
        <div className="w-24 bg-[#1e261e] border-r border-white/8 p-1.5 space-y-1.5 shrink-0">
          {[
            { label: "Safety Rating", val: "4.2/5", color: "text-emerald-300" },
            { label: "Fraud Score", val: "18%", color: "text-emerald-300" },
            { label: "On-Time Rate", val: "94%", color: "text-blue-300" },
            { label: "Fleet Size", val: "142", color: "text-white/70" },
            { label: "Shipments", val: "847", color: "text-white/70" },
          ].map((stat) => (
            <div key={stat.label} className={cn(
              "border rounded p-1 transition-colors",
              readingStats ? "bg-[#1e3a5f]/30 border-blue-400/30" : "bg-[#1c221c] border-white/8"
            )}>
              <p className={cn("text-[8px] font-bold", stat.color)}>{stat.val}</p>
              <p className="text-[5px] text-white/30">{stat.label}</p>
            </div>
          ))}
        </div>
        {/* Right: checks + certs */}
        <div className="flex-1 p-1.5 space-y-1 overflow-hidden">
          <p className="text-[6px] font-semibold text-white/60 uppercase tracking-wide">Credential Checks</p>
          {checks.map((c) => (
            <div key={c.label} className={cn(
              "flex items-center gap-1.5 border rounded px-1.5 py-0.5 transition-colors",
              readingCreds
                ? "bg-[#1e3a5f]/30 border-blue-400/30"
                : c.status === "pass" ? "bg-[#1c221c] border-white/8" : "bg-amber-500/5 border-amber-500/20"
            )}>
              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", c.status === "pass" ? "bg-emerald-400" : "bg-amber-400")} />
              <div className="flex-1 min-w-0">
                <p className="text-[5px] text-white/50">{c.label}</p>
                <p className="text-[6px] text-white/80 truncate">{c.val}</p>
              </div>
              <span className={cn("text-[5px] font-bold shrink-0", c.status === "pass" ? "text-emerald-400" : "text-amber-400")}>
                {c.status === "pass" ? "✓" : "!"}
              </span>
            </div>
          ))}
          <p className="text-[6px] font-semibold text-white/60 uppercase tracking-wide pt-0.5">Certifications</p>
          {["TAPA TSR Level 1", "ISO 28000", "C-TPAT Certified"].map((c) => (
            <div key={c} className={cn(
              "flex items-center gap-1 text-[5px] rounded px-1 py-0.5 transition-colors",
              readingCerts ? "text-emerald-200 bg-emerald-500/10" : "text-emerald-300"
            )}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />{c}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DigitalTwinScreen({ interaction }: ScreenProps) {
  const shipmentClick = !!interaction?.match(/shipment|marker/i);

  return (
    <div className="h-full bg-[#161b16] text-white flex flex-col">
      <MiniNavbar activePage="Digital Twin" interaction={interaction} />
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
        {[
          { x: "20%", y: "65%", color: "#ef4444", active: shipmentClick },
          { x: "40%", y: "45%", color: "#f59e0b", active: false },
          { x: "60%", y: "35%", color: "#4ade80", active: false },
          { x: "75%", y: "55%", color: "#2563eb", active: false },
          { x: "35%", y: "70%", color: "#ef4444", active: false },
          { x: "55%", y: "25%", color: "#4ade80", active: false },
        ].map((m, i) => (
          <svg key={i} className="absolute inset-0 w-full h-full">
            <circle cx={m.x} cy={m.y} r={m.active ? "6" : "4"} fill={m.color} opacity="0.8" />
            <circle cx={m.x} cy={m.y} r={m.active ? "14" : "8"} fill={m.color} opacity={m.active ? "0.25" : "0.15"} />
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

export function ExecutiveReportScreen({ interaction }: ScreenProps) {
  return (
    <div className="h-full bg-[#161b16] text-white flex flex-col">
      <MiniNavbar activePage="Executive" interaction={interaction} />
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

export function FraudCheckScreen({ interaction }: ScreenProps) {
  const searchActive = !!interaction?.match(/search|carrier search/i);
  const typingCarrier = !!interaction?.match(/beacon logistics|typing/i);
  const carrierSelected = !!interaction?.match(/beacon logistics.*mc|clicking beacon/i);

  const checks = [
    { id: "usdot", label: "Address Verification", status: "pass", detail: "Dallas, TX 75201 — confirmed" },
    { id: "mc", label: "USDOT Lookup", status: "pass", detail: "DOT-1847392 Active carrier" },
    { id: "name", label: "Name Cross-Reference", status: "pass", detail: "No aliases or DBA matches" },
    { id: "phone", label: "Phone Verification", status: "pass", detail: "+1 (214) 555-0182 — valid" },
    { id: "insurance", label: "Insurance Check", status: "pass", detail: "$1M liability, valid" },
    { id: "officer", label: "First Officer Review", status: "warn", detail: "1 prior incident flagged" },
  ];

  // Which check rows are highlighted
  const highlightedChecks = new Set<string>();
  if (interaction?.match(/usdot|address/i)) highlightedChecks.add("usdot");
  if (interaction?.match(/name cross/i)) { highlightedChecks.add("usdot"); highlightedChecks.add("mc"); highlightedChecks.add("name"); }
  if (interaction?.match(/insurance/i)) { ["usdot","mc","name","phone","insurance"].forEach(id => highlightedChecks.add(id)); }
  if (interaction?.match(/first officer/i)) checks.forEach(c => highlightedChecks.add(c.id));
  if (interaction?.match(/composite|score/i)) checks.forEach(c => highlightedChecks.add(c.id));

  return (
    <div className="h-full bg-[#161b16] text-white flex flex-col">
      <MiniNavbar activePage="Fraud" interaction={interaction} />
      <div className="px-2 py-1.5 bg-[#222a22] border-b border-white/8 flex items-center gap-2 shrink-0">
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
        <div className="w-28 bg-[#1e261e] border-r border-white/8 flex flex-col shrink-0">
          <div className="p-1.5 border-b border-white/8 shrink-0">
            <div className={cn(
              "h-4 border rounded flex items-center px-1 transition-colors",
              searchActive || typingCarrier ? "bg-[#1e3a5f]/40 border-blue-400" : "bg-[#1c221c] border-white/8"
            )}>
              <Search className="h-2 w-2 text-white/30 mr-1 shrink-0" />
              <span className="text-[5px] text-white/60 truncate">
                {typingCarrier ? <span>Beacon Logistics<span className="animate-pulse">|</span></span> : searchActive ? <span className="text-blue-300 animate-pulse">|</span> : "Search carrier…"}
              </span>
            </div>
          </div>
          <div className="flex-1 p-1 space-y-1 overflow-hidden">
            {[
              { name: "Beacon Logistics", score: 18, active: carrierSelected || highlightedChecks.size > 0 },
              { name: "Swift Transport", score: 34, active: false },
              { name: "United Freight", score: 72, active: false },
            ].map((c) => (
              <div key={c.name} className={cn("rounded p-1 border transition-colors", c.active ? "bg-[#1e3a5f] border-blue-400/40" : "bg-[#1c221c] border-white/8")}>
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
        <div className="flex-1 p-1.5 space-y-1 overflow-hidden">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-[7px] font-semibold text-white">Beacon Logistics LLC</p>
            <span className="text-[5px] text-white/40">MC-294817</span>
          </div>
          {checks.map((c) => {
            const active = highlightedChecks.has(c.id);
            return (
              <div key={c.id} className={cn(
                "flex items-start gap-1.5 rounded border px-1.5 py-0.5 transition-all duration-300",
                active
                  ? c.status === "pass" ? "border-emerald-400/50 bg-emerald-500/10" : "border-amber-400/50 bg-amber-500/10"
                  : "border-white/8 bg-[#1c221c]"
              )}>
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full mt-0.5 shrink-0 transition-colors",
                  active ? (c.status === "pass" ? "bg-emerald-400" : "bg-amber-400 animate-pulse") : "bg-white/20"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-[5px] text-white/50">{c.label}</p>
                  <p className={cn("text-[6px]", active ? "text-white/90" : "text-white/40")}>{c.detail}</p>
                </div>
                {active && (
                  <span className={cn("text-[5px] font-bold shrink-0", c.status === "pass" ? "text-emerald-400" : "text-amber-400")}>
                    {c.status === "pass" ? "PASS" : "WARN"}
                  </span>
                )}
              </div>
            );
          })}
          {/* Overall score — show when composite step */}
          {interaction?.match(/composite|score/i) && (
            <div className="mt-1 bg-[#1c221c] border border-emerald-500/30 rounded p-1.5 flex items-center justify-between">
              <div>
                <p className="text-[5px] text-white/40">Composite Fraud Risk</p>
                <p className="text-[8px] font-bold text-emerald-300">18% — LOW RISK</p>
              </div>
              <div className="h-8 w-8 rounded-full border-2 border-emerald-500 bg-emerald-500/10 flex items-center justify-center">
                <span className="text-[7px] font-bold text-emerald-300">18</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Case Detail Screen ───────────────────────────────────────────────────────

export function CaseDetailScreen({ interaction }: ScreenProps) {
  const callingDriver = !!interaction?.match(/call driver/i);
  const readingTimeline = !!interaction?.match(/timeline|stopped|47 min|case/i);

  return (
    <div className="h-full bg-[#161b16] text-white flex flex-col">
      <MiniNavbar activePage="Risk Monitor" interaction={interaction} />
      {/* Case header */}
      <div className="px-2 py-1.5 bg-[#222a22] border-b border-white/8 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-[8px] font-semibold text-white">Light &amp; Stop (Compound)</p>
            <p className="text-[6px] text-white/40">OH-84764 · São Paulo, Brazil → Chicago, USA</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[6px] font-bold text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded-full">Risk 98+</span>
            <span className="text-[6px] text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded-full">Investigating</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[
            { l: "Driver", v: "Marcus Vinicius", sub: "+55 11 9xxxx-xxxx" },
            { l: "Stopped At", v: "01:00 AM", sub: "47 min elapsed" },
            { l: "Battery", v: "92%", sub: "Device online" },
          ].map(item => (
            <div key={item.l} className="bg-[#1c221c] border border-white/8 rounded p-1">
              <p className="text-[5px] text-white/30 uppercase">{item.l}</p>
              <p className="text-[6px] font-medium text-white">{item.v}</p>
              <p className="text-[5px] text-white/30">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left: timeline + actions */}
        <div className="w-28 shrink-0 bg-[#222a22] border-r border-white/8 p-1.5 space-y-1.5 overflow-hidden">
          <p className="text-[6px] font-semibold text-white/50 uppercase">Event Timeline</p>
          {[
            { evt: "Vehicle stopped", t: "01:00 AM", col: "text-red-400" },
            { evt: "No check-in ping", t: "01:22 AM", col: "text-amber-400" },
            { evt: "Alert triggered", t: "01:47 AM", col: "text-red-400" },
            { evt: "Investigator assigned", t: "01:50 AM", col: "text-blue-400" },
          ].map((e, i) => (
            <div key={i} className={cn("flex items-start gap-1 rounded px-1 py-0.5 border transition-colors", readingTimeline ? "border-blue-400/30 bg-[#1e3a5f]/20" : "border-white/8 bg-[#1c221c]")}>
              <span className={cn("h-1.5 w-1.5 rounded-full mt-0.5 shrink-0", e.col)} />
              <div>
                <p className="text-[6px] text-white/70">{e.evt}</p>
                <p className="text-[5px] text-white/30">{e.t}</p>
              </div>
            </div>
          ))}
          <div className="pt-1 space-y-1">
            <div className={cn(
              "h-6 rounded text-[6px] flex items-center justify-center gap-1 font-semibold transition-all cursor-pointer",
              callingDriver ? "bg-emerald-500 text-white scale-95 animate-pulse" : "bg-[#2563eb] text-white"
            )}>
              📞 Call Driver
            </div>
            <div className="h-5 rounded text-[6px] flex items-center justify-center bg-[#1c221c] border border-white/8 text-white/40">Notify Ops Team</div>
            <div className="h-5 rounded text-[6px] flex items-center justify-center bg-[#1c221c] border border-white/8 text-white/40">Add to Incident</div>
          </div>
        </div>

        {/* Right: map + RiskGPT summary */}
        <div className="flex-1 bg-[#1a2418] relative flex flex-col">
          {/* Map */}
          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 opacity-25" style={{ background: "radial-gradient(ellipse at 40% 55%, #1a4d2e 0%, #0d1a0d 60%)" }} />
            {/* Satellite-style coast shapes */}
            <svg className="absolute inset-0 w-full h-full opacity-30">
              <path d="M 0 70% Q 30% 55%, 50% 60% Q 70% 65%, 100% 50%" stroke="#4ade80" strokeWidth="0.5" fill="none" opacity="0.4" />
              <path d="M 20% 100% Q 35% 75%, 55% 65% Q 70% 58%, 80% 40%" stroke="#4ade80" strokeWidth="0.5" fill="none" opacity="0.3" />
            </svg>
            <svg className="absolute inset-0 w-full h-full">
              {/* Route line */}
              <line x1="15%" y1="75%" x2="80%" y2="20%" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.7" />
              {/* Stop marker - pulsing red */}
              <circle cx="15%" cy="75%" r="5" fill="#ef4444" opacity="0.9" />
              <circle cx="15%" cy="75%" r="10" fill="#ef4444" opacity="0.2" />
              {/* Destination */}
              <circle cx="80%" cy="20%" r="3" fill="#2563eb" opacity="0.8" />
            </svg>
            {/* Stopped label */}
            <div className="absolute left-2 bottom-6 bg-[#222a22]/90 border border-red-500/30 rounded px-1.5 py-1">
              <p className="text-[5px] text-red-300 font-semibold">⛽ Vehicle stopped · 47 min</p>
              <p className="text-[5px] text-white/40">São Paulo outskirts</p>
            </div>
          </div>
          {/* RiskGPT panel */}
          <div className="bg-[#222a22]/95 border-t border-white/8 p-1.5">
            <div className="flex gap-1 mb-1">
              {["Notes", "Chat with RiskGPT", "Instructions"].map((t, i) => (
                <span key={t} className={cn("text-[5px] px-1.5 py-0.5 rounded cursor-pointer", i === 1 ? "bg-[#2563eb]/60 text-white border-b border-blue-400" : "text-white/30")}>{t}</span>
              ))}
            </div>
            <div className="space-y-0.5 text-[5px] text-white/60 leading-relaxed">
              <p className="font-semibold text-white text-[6px]">High-Risk Alert: OH-84764</p>
              <p>Risk 98% · Theft probability 97%. Weekend + driver deviation + unauthorized stop pattern.</p>
              <p className="text-amber-300">Recommend: immediate driver contact + ops notification.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Driver Call Screen ───────────────────────────────────────────────────────

export function DriverCallScreen({ interaction }: ScreenProps) {
  const connected = !!interaction?.match(/confirm|driver confirm|fuel stop|response/i);
  const ending = !!interaction?.match(/end call|mark.*resolved|resolved/i);

  return (
    <div className="h-full bg-[#0d1210] text-white flex flex-col items-center justify-center relative">
      {/* Blurred background */}
      <div className="absolute inset-0 bg-[#161b16] opacity-80" />
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #1e3a2e44 0%, transparent 70%)" }} />

      {/* Call card */}
      <div className="relative z-10 flex flex-col items-center gap-3 bg-[#1e261e] border border-emerald-500/20 rounded-2xl px-6 py-5 w-48 shadow-2xl">
        {/* Avatar */}
        <div className={cn(
          "h-12 w-12 rounded-full border-2 flex items-center justify-center text-lg transition-colors",
          connected ? "border-emerald-400 bg-emerald-500/20" : "border-blue-400 bg-blue-500/20 animate-pulse"
        )}>
          👤
        </div>

        <div className="text-center">
          <p className="text-[9px] font-semibold text-white">Marcus Vinicius</p>
          <p className="text-[7px] text-white/50">Driver · OH-84764</p>
          <p className={cn("text-[7px] mt-0.5", connected ? "text-emerald-400" : "text-blue-300")}>
            {ending ? "Call ended" : connected ? "Connected · 4:32" : "Calling…"}
          </p>
        </div>

        {/* Live transcript */}
        {connected && (
          <div className="w-full bg-[#131a13] rounded-lg p-1.5 border border-white/8 space-y-1">
            <p className="text-[5px] text-emerald-300">Agent: Driver, please confirm your current status.</p>
            <p className="text-[5px] text-blue-300">Marcus: Routine fuel stop. Back in ~10 min. All good.</p>
            <p className="text-[5px] text-emerald-300">Agent: Understood, logging as explained stop.</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <div className={cn(
            "h-7 w-7 rounded-full flex items-center justify-center text-[10px] border transition-all",
            ending ? "border-white/20 bg-white/5 text-white/30" : "border-red-500 bg-red-600 text-white cursor-pointer"
          )}>
            ✕
          </div>
          {connected && !ending && (
            <div className="h-7 w-7 rounded-full border border-emerald-500 bg-emerald-600 flex items-center justify-center text-[8px] text-white">✓</div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="relative z-10 mt-3 flex items-center gap-1.5 text-[6px] text-white/40">
        <span className={cn("h-1.5 w-1.5 rounded-full", connected ? "bg-emerald-400" : "bg-blue-400 animate-pulse")} />
        {connected ? "Call in progress · Recording" : "Connecting via Overhaul dispatch…"}
      </div>
    </div>
  );
}

// ─── Case Notes Screen ────────────────────────────────────────────────────────

export function CaseNotesScreen({ interaction }: ScreenProps) {
  const typing = !!interaction?.match(/notes|typing|driver confirmed|routine/i);
  const saving = !!interaction?.match(/save|close alert/i);
  // Default to saved state when workflow is complete or no specific action is active
  const isSaved = saving || (!typing && !interaction?.match(/add case/i));

  const noteText = "Driver Marcus Vinicius (OH-84764) confirmed routine fuel stop near São Paulo outskirts at 01:00 AM. No security threat detected. Stop duration: ~47 min. Vehicle resuming route ETA +10 min. Risk score updated: 98% → Explained.";

  return (
    <div className="h-full bg-[#161b16] text-white flex flex-col">
      <MiniNavbar activePage="Risk Monitor" interaction={interaction} />
      {/* Header */}
      <div className="px-2 py-1.5 bg-[#222a22] border-b border-white/8 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[8px] font-semibold text-white">Case Notes — OH-84764</p>
          <p className="text-[6px] text-white/40">Light &amp; Stop (Compound) · Investigation outcome</p>
        </div>
        <span className="text-[6px] text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded-full border border-emerald-500/30">Explained</span>
      </div>

      <div className="flex flex-1 min-h-0 gap-0">
        {/* Left: meta */}
        <div className="w-24 shrink-0 bg-[#1e261e] border-r border-white/8 p-1.5 space-y-1.5">
          <p className="text-[6px] text-white/50 uppercase font-semibold">Resolution</p>
          {[
            { l: "Driver", v: "Reached ✓" },
            { l: "Stop Reason", v: "Fuel stop" },
            { l: "Threat", v: "None detected" },
            { l: "Call", v: "4m 32s" },
          ].map(r => (
            <div key={r.l} className="bg-[#1c221c] border border-white/8 rounded p-1">
              <p className="text-[5px] text-white/30">{r.l}</p>
              <p className="text-[6px] font-medium text-emerald-300">{r.v}</p>
            </div>
          ))}
        </div>

        {/* Right: notes editor */}
        <div className="flex-1 p-1.5 flex flex-col gap-1.5">
          <p className="text-[6px] text-white/50 uppercase font-semibold">Investigation Notes</p>
          <div className={cn(
            "flex-1 rounded border p-1.5 text-[5.5px] leading-relaxed transition-colors",
            isSaved ? "border-emerald-400/40 bg-emerald-500/5 text-white/80" :
            typing ? "border-blue-400/40 bg-[#1e3a5f]/20 text-white/70" :
            "border-white/8 bg-[#1c221c] text-white/40"
          )}>
            {typing || isSaved ? noteText : "Click to add notes…"}
            {typing && !isSaved && <span className="animate-pulse text-blue-300">|</span>}
          </div>
          <div className="flex gap-1">
            <div className={cn(
              "flex-1 h-6 rounded text-[6px] flex items-center justify-center font-medium transition-all",
              isSaved ? "bg-emerald-500 text-white" : "bg-[#2563eb] text-white"
            )}>
              {isSaved ? "✓ Saved" : "Save Notes"}
            </div>
            <div className="h-6 px-2 rounded text-[6px] flex items-center bg-[#1c221c] border border-white/8 text-white/40">
              Close Alert
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen Registry ──────────────────────────────────────────────────────────

export function getScreen(id: ScreenId, interaction?: string): React.ReactNode {
  switch (id) {
    case "home": return <HomeScreen interaction={interaction} />;
    case "risk-monitor": return <RiskMonitorScreen interaction={interaction} />;
    case "shipment-detail": return <ShipmentDetailScreen interaction={interaction} />;
    case "riskgpt-chat": return <RiskGptChatScreen interaction={interaction} />;
    case "incident-form": return <IncidentFormScreen interaction={interaction} />;
    case "carrier-profile": return <CarrierProfileScreen interaction={interaction} />;
    case "fraud-dashboard": return <FraudCheckScreen interaction={interaction} />;
    case "digital-twin": return <DigitalTwinScreen interaction={interaction} />;
    case "executive-report": return <ExecutiveReportScreen interaction={interaction} />;
    case "case-detail": return <CaseDetailScreen interaction={interaction} />;
    case "driver-call": return <DriverCallScreen interaction={interaction} />;
    case "case-notes": return <CaseNotesScreen interaction={interaction} />;
    default: return <HomeScreen interaction={interaction} />;
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
  "fraud-dashboard": "Fraud Watch — Bad Actor Check",
  "digital-twin": "Digital Twin",
  "search-results": "Search Results",
  "case-detail": "Case Detail — OH-84764",
  "driver-call": "Driver Call — Marcus Vinicius",
  "case-notes": "Case Notes",
};

// ─── Hotspot positions ────────────────────────────────────────────────────────
// x%, y% — precisely over real UI elements in each screen

export type Hotspot = { x: number; y: number; label: string };

// Coordinates are % of the viewport div (after navbar+ticker offset).
// Mini screens pack content into the top ~50% — elements are NOT spread to the bottom.
// Navbar in each mini screen ≈ 25px, sub-header ≈ 22px → content starts at ~10% of a 450px viewport.
export const SCREEN_HOTSPOTS: Partial<Record<ScreenId, Hotspot[]>> = {
  "home": [
    { x: 44, y: 4, label: "Fraud Watch nav link" },
    { x: 36, y: 4, label: "Risk Monitor nav link" },
  ],
  "risk-monitor": [
    { x: 8,  y: 14, label: "Search alerts box" },
    { x: 8,  y: 21, label: "Alert card — first result" },
    { x: 8,  y: 26, label: "Alert card — carrier entry" },
    { x: 65, y: 50, label: "Map marker — shipment position" },
  ],
  "shipment-detail": [
    { x: 12, y: 38, label: "Active risk factors" },
    { x: 12, y: 55, label: "Open Incident button" },
    { x: 62, y: 52, label: "Live GPS position" },
    { x: 62, y: 15, label: "ETA delivery panel" },
  ],
  "riskgpt-chat": [
    { x: 32, y: 64, label: "Chat with RiskGPT tab" },
    { x: 50, y: 78, label: "Chat input field" },
    { x: 50, y: 58, label: "AI risk analysis response" },
  ],
  "incident-form": [
    { x: 50, y: 38, label: "Incident description field" },
    { x: 35, y: 54, label: "Attach GPS evidence" },
    { x: 22, y: 65, label: "Submit Incident Report" },
  ],
  "carrier-profile": [
    { x: 10, y: 36, label: "Safety & performance ratings" },
    { x: 57, y: 36, label: "FMCSA credential checks" },
    { x: 57, y: 46, label: "FMCSA credential checks row" },
    { x: 57, y: 60, label: "Certifications — TAPA, ISO, C-TPAT" },
  ],
  "fraud-dashboard": [
    { x: 8,  y: 14, label: "Carrier search box" },
    { x: 8,  y: 21, label: `"Beacon Logistics LLC"` },
    { x: 8,  y: 21, label: "Beacon Logistics — MC-294817" },
    { x: 57, y: 18, label: "USDOT lookup result" },
    { x: 57, y: 23, label: "Name cross-reference result" },
    { x: 57, y: 28, label: "Insurance check result" },
    { x: 57, y: 33, label: "First officer review" },
    { x: 57, y: 44, label: "Composite risk score" },
  ],
  "digital-twin": [
    { x: 20, y: 45, label: "Shipment marker — high risk" },
    { x: 60, y: 35, label: "Shipment marker — normal" },
    { x: 35, y: 55, label: "Shipment marker" },
  ],
  "case-detail": [
    { x: 10, y: 35, label: "Open full case — Light & Stop" },
    { x: 10, y: 42, label: "Case timeline — stopped 47 min at São Paulo" },
    { x: 10, y: 60, label: "Call Driver button" },
  ],
  "driver-call": [
    { x: 50, y: 30, label: "Calling Marcus Vinicius — ringing" },
    { x: 50, y: 55, label: "Driver confirms routine fuel stop" },
    { x: 50, y: 75, label: "End call — mark stop as explained" },
  ],
  "case-notes": [
    { x: 60, y: 25, label: "Add Case Notes" },
    { x: 60, y: 55, label: "Notes: driver confirmed routine fuel stop — no security incident" },
    { x: 60, y: 80, label: "Save Notes & close alert" },
  ],
};
