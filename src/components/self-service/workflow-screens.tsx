"use client";

import { cn } from "@/lib/utils";
import type { ScreenId } from "@/lib/mock/self-service-workflows";
import { demoData } from "@/lib/data";
import { Search, FileText, Battery, Clock, Phone, PhoneOff, CheckCircle2, AlertTriangle, ChevronDown, Bell } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScreenProps {
  interaction?: string;
}

// ─── Shared Top Nav (full-size) ───────────────────────────────────────────────

const NAV_ITEMS = ["Home", "Platform", "AI Copilot", "Risk Monitor", "Fraud Watch", "Digital Twin", "Executive"];

function TopNav({ activePage, interaction }: { activePage: string; interaction?: string }) {
  const clicking = NAV_ITEMS.find(l =>
    interaction?.toLowerCase().includes(l.toLowerCase())
  );
  return (
    <div className="h-10 shrink-0 flex items-center gap-1 px-4 border-b" style={{ background: "#111416", borderColor: "rgba(255,255,255,0.07)" }}>
      <div className="h-6 w-6 rounded bg-[#00c2b2]/30 mr-3 shrink-0 flex items-center justify-center">
        <span className="text-[#00c2b2] text-[8px] font-bold">O</span>
      </div>
      {NAV_ITEMS.map(l => (
        <button key={l} className={cn(
          "px-3 py-1 text-xs rounded-md transition-all duration-150 font-medium",
          activePage === l ? "bg-[#1e3a5f] text-white border border-blue-500/30" :
          clicking === l ? "bg-[#1e3a5f]/50 text-blue-300 animate-pulse" :
          "text-gray-500 hover:text-gray-300"
        )}>{l}</button>
      ))}
    </div>
  );
}

// ─── Home Screen ─────────────────────────────────────────────────────────────

export function HomeScreen({ interaction }: ScreenProps) {
  const navigating = !!interaction?.match(/risk monitor|fraud|digital twin|copilot/i);
  return (
    <div className="h-full flex flex-col" style={{ background: "#0d0f10" }}>
      <TopNav activePage="Home" interaction={interaction} />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-lg px-8">
          <div className="h-12 w-12 rounded-xl bg-[#00c2b2]/20 border border-[#00c2b2]/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-[#00c2b2] text-xl font-bold">O</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Overhaul GSOC Platform</h1>
          <p className="text-sm text-gray-500 mb-6">Global Supply Chain Operations Center — real-time cargo security intelligence</p>
          <div className="grid grid-cols-4 gap-3">
            {[
              { v: "$2.4B", l: "Cargo Protected", c: "text-blue-300" },
              { v: "97.4%", l: "SLA Compliance", c: "text-emerald-300" },
              { v: "87", l: "Active Alerts", c: "text-amber-300" },
              { v: "94%", l: "Risk Prevented", c: "text-[#00c2b2]" },
            ].map(s => (
              <div key={s.l} className="rounded-lg p-3 border" style={{ background: "#181c1f", borderColor: "rgba(255,255,255,0.07)" }}>
                <p className={cn("text-xl font-bold", s.c)}>{s.v}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
          {navigating && (
            <div className="mt-4 text-xs text-blue-300 flex items-center justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              Navigating…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Risk Monitor Screen ──────────────────────────────────────────────────────

export function RiskMonitorScreen({ interaction }: ScreenProps) {
  const riskPillActive = !!interaction?.match(/weekend transit|light.*stop|alert card|oh-84764|clicking.*alert/i);
  const riskgptOpen = !!interaction?.match(/riskgpt|chat.*riskgpt|analyze|chat tab/i);
  const searchTyping = !!interaction?.match(/search|typing.*oh|oh id/i);
  const timelineActive = !!interaction?.match(/timeline|11:29|stopped/i);

  const RISK_PILLS = [
    { dot: "bg-red-500", label: "Light & Stop (Compound)", count: "6", active: riskPillActive },
    { dot: "bg-red-400", label: "Light alert", count: "5", active: false },
    { dot: "bg-cyan-400", label: "Stop", count: "", active: false },
  ];

  const TIMELINE = [
    { t: "11:29", label: "Light & Stop (Compound)", sev: "high", inv: "Nick Fury" },
    { t: "11:17", label: "Light alert", sev: "low", inv: "Nick Fury" },
    { t: "10:57", label: "Hotzone stop Auto", sev: "medium", inv: "Nick Fury" },
    { t: "10:04", label: "Light & Stop (Compound)", sev: "high", inv: "Nick Fury" },
    { t: "09:27", label: "Light alert", sev: "low", inv: "Nick Fury" },
  ];

  // Route waypoints: pickup(Brazil) → current(SP) → dest(Chicago)
  // Using SVG % coords within the map area
  const waypoints = [
    [12, 72], [17, 66], [22, 60], [27, 54], [33, 49], [38, 44], [44, 39],
    [50, 34], [56, 29], [62, 24],
  ];
  const currentIdx = 4; // stopped here

  return (
    <div className="h-full flex flex-col" style={{ background: "#0d0f10" }}>
      <TopNav activePage="Risk Monitor" interaction={interaction} />

      {/* Sub-header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2 border-b" style={{ background: "#111416", borderColor: "rgba(255,255,255,0.07)" }}>
        <span className="text-sm font-bold text-white">Risk Monitor</span>
        <span className="text-xs font-mono text-gray-400">OH-84764</span>
        <span className="flex items-center gap-1.5 text-[11px] text-red-400 border border-red-500/40 rounded-full px-2 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          In transit
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-red-400 bg-red-500/15 border border-red-500/30 rounded-full px-2 py-0.5 font-bold">100+</span>
          <button className="text-xs text-white bg-blue-600 px-3 py-1 rounded-md border border-blue-500/50">GSOC Response</button>
          <button className="text-xs text-gray-400 border border-white/10 px-3 py-1 rounded-md flex items-center gap-1">
            <Bell className="h-3 w-3" />Subscribe
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* ── Left sidebar ── */}
        <div className="w-[280px] shrink-0 border-r flex flex-col" style={{ background: "#111416", borderColor: "rgba(255,255,255,0.07)" }}>

          {/* Search */}
          <div className="p-2 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 border",
              searchTyping ? "border-blue-400/50 bg-[#1e3a5f]/30" : "border-white/8 bg-white/4"
            )}>
              <Search className="h-3.5 w-3.5 text-gray-600 shrink-0" />
              <span className="text-xs text-gray-500">
                {searchTyping ? <span className="text-blue-300">OH-84764<span className="animate-pulse">|</span></span> : "Search alerts…"}
              </span>
            </div>
          </div>

          {/* Risk section */}
          <div className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-semibold text-white flex items-center gap-1">Risk <ChevronDown className="h-3 w-3 text-gray-600" /></span>
              <span className="text-[10px] text-red-400 bg-red-500/15 border border-red-500/30 rounded-full px-1.5 py-0.5 font-bold">100+</span>
            </div>

            {/* Active risk pills */}
            <div className="px-3 pb-2 space-y-1">
              <p className="text-[10px] uppercase text-gray-700 mb-1.5">Active Risk</p>
              {RISK_PILLS.map(r => (
                <div key={r.label} className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-all",
                  r.active ? "bg-[#1e3a5f] border border-blue-500/30" : "hover:bg-white/4"
                )}>
                  <span className={cn("h-2 w-2 rounded-full shrink-0", r.dot)} />
                  <span className="text-xs text-gray-300 flex-1 truncate">{r.label}</span>
                  {r.count && <span className="text-[10px] bg-white/10 rounded-full px-1.5 py-0.5 text-gray-500">{r.count}</span>}
                </div>
              ))}
            </div>

            {/* Risk factors */}
            <div className="px-3 pb-3 space-y-1">
              <p className="text-[10px] uppercase text-gray-700 mb-1.5">Risk Factors</p>
              {["Weekend transit vulnerability", "Driver deviation detected", "Unauthorized stop pattern"].map((f, i) => (
                <div key={f} className="flex items-center gap-2 text-[11px] text-gray-500">
                  <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", i === 0 ? "bg-red-500" : i === 1 ? "bg-amber-400" : "bg-gray-600")} />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline section */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 shrink-0">
              <span className="text-xs font-semibold text-white flex items-center gap-1">Timeline <ChevronDown className="h-3 w-3 text-gray-600" /></span>
              <div className="flex gap-1">
                <span className="text-[10px] bg-red-500/20 text-red-400 rounded-full px-1.5 py-0.5">6</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-400 rounded-full px-1.5 py-0.5">2</span>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              {TIMELINE.map((e, i) => (
                <div key={i} className={cn(
                  "flex items-start gap-2 px-3 py-2 border-l-2 cursor-pointer hover:bg-white/3 transition-colors",
                  (i === 0 && (riskPillActive || timelineActive)) ? "border-blue-500 bg-[#1e3a5f]/20" : "border-transparent"
                )}>
                  <span className="text-[10px] text-gray-600 font-mono w-9 shrink-0 mt-0.5">{e.t}</span>
                  <span className={cn("h-2 w-2 rounded-full shrink-0 mt-1",
                    e.sev === "high" ? "bg-red-500" : e.sev === "medium" ? "bg-amber-400" : "bg-cyan-400"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-300 truncate">{e.label}</p>
                    <p className="text-[10px] text-gray-600">{e.inv}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Map area ── */}
        <div className="flex-1 relative overflow-hidden" style={{ background: "#0d1117" }}>

          {/* SVG map */}
          <svg className="absolute inset-0 w-full h-full">
            {/* Grid */}
            <defs>
              <pattern id="rmgrid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#1a2535" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#rmgrid)" opacity="0.5" />

            {/* Land masses — simplified */}
            <ellipse cx="20%" cy="68%" rx="16%" ry="20%" fill="#161c28" />
            <ellipse cx="72%" cy="38%" rx="22%" ry="16%" fill="#161c28" />

            {/* Risk zone (red dashed circle) */}
            <ellipse cx="38%" cy="55%" rx="18%" ry="14%"
              fill="rgba(239,68,68,0.07)"
              stroke="rgba(239,68,68,0.4)"
              strokeWidth="1.5"
              strokeDasharray="6 4" />

            {/* Route line */}
            <polyline
              points={waypoints.map(([x, y]) => `${x}%,${y}%`).join(" ")}
              stroke="#3b82f6" strokeWidth="2.5" fill="none" opacity="0.65" strokeDasharray="5 3"
            />

            {/* Waypoint dots */}
            {waypoints.map(([x, y], i) => (
              <rect
                key={i}
                x={`calc(${x}% - 4px)`} y={`calc(${y}% - 4px)`}
                width="8" height="8"
                fill={i <= currentIdx ? "#3b82f6" : "#334155"}
                rx="1.5"
                opacity={i <= currentIdx ? 0.9 : 0.35}
              />
            ))}

            {/* Pickup (P) */}
            <circle cx="12%" cy="72%" r="10" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="2" />
            <text x="12%" y="72%" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="bold">P</text>

            {/* Truck (current) — pulsing */}
            <circle cx="38%" cy="55%" r="14" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="2.5" opacity="0.9" />
            <text x="38%" y="55%" textAnchor="middle" dominantBaseline="middle" fontSize="11">🚛</text>

            {/* Destination (D) */}
            <circle cx="72%" cy="24%" r="10" fill="#059669" stroke="#34d399" strokeWidth="2" />
            <text x="72%" y="24%" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="bold">D</text>
          </svg>

          {/* Risk zone label */}
          <div className="absolute" style={{ left: "41%", top: "38%" }}>
            <div className="bg-red-500/20 border border-red-500/40 rounded-md px-2 py-1">
              <p className="text-[10px] text-red-300 font-semibold">⚠ Risk Zone</p>
            </div>
          </div>

          {/* RiskGPT floating panel */}
          <div className="absolute bottom-4 left-4 w-[360px] rounded-xl border shadow-2xl overflow-hidden"
            style={{ background: "#111416", borderColor: "rgba(255,255,255,0.12)" }}>
            {/* Title bar */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ background: "#181c1f", borderColor: "rgba(255,255,255,0.07)" }}>
              <span className="text-xs text-gray-200 font-medium truncate flex-1">Notes — Light & Stop (Compo... OH-84764</span>
              <button className="p-1 rounded text-gray-600 hover:text-gray-300">✕</button>
            </div>
            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {["Notes", "Chat with RiskGPT"].map((t, i) => (
                <button key={t} className={cn(
                  "px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                  (riskgptOpen ? i === 1 : i === 0)
                    ? "border-[#00c2b2] text-[#00c2b2]"
                    : "border-transparent text-gray-500"
                )}>{t}</button>
              ))}
            </div>
            {/* Content */}
            <div className="p-3 space-y-2.5">
              {riskgptOpen ? (
                <div className="flex gap-2 items-start">
                  <div className="h-6 w-6 rounded-full bg-[#00c2b2]/20 border border-[#00c2b2]/40 flex items-center justify-center text-[10px] text-[#00c2b2] font-bold shrink-0">AI</div>
                  <div className="flex-1 bg-white/4 rounded-lg p-2.5 text-[11px] text-gray-300 leading-relaxed">
                    Risk 98% · Theft probability 97%. Weekend transit + driver deviation + unauthorized stop detected. <span className="text-amber-300">Recommend immediate driver contact and ops notification.</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="h-5 w-5 rounded-full bg-gray-800 flex items-center justify-center text-[10px] shrink-0">🕐</div>
                    Investigation started
                    <span className="ml-auto text-gray-700 text-[10px]">15:02 CST</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold shrink-0">NF</div>
                    <div className="flex-1">
                      <p className="text-xs text-white font-medium">Nick Fury <span className="text-gray-600 font-normal text-[10px]">15:06</span></p>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">Called the driver — no answer. Contacting carrier dispatch.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* Action row */}
            <div className="flex gap-2 px-3 pb-3 pt-1">
              {[
                { l: "Subscribe", cls: "border-white/8 text-gray-500" },
                { l: "Waive", cls: "border-blue-500/30 text-blue-400" },
                { l: "Escalate", cls: "border-red-500/30 text-red-400" },
              ].map(a => (
                <button key={a.l} className={cn("text-xs px-3 py-1.5 rounded-lg border", a.cls)}>{a.l}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shipment Detail Screen ───────────────────────────────────────────────────

export function ShipmentDetailScreen({ interaction }: ScreenProps) {
  const s = demoData.shipments[0];
  const readingRisk = !!interaction?.match(/active.*alert|risk factor|status panel/i);
  const readingMap = !!interaction?.match(/live.*map|gps.*position/i);
  const readingEta = !!interaction?.match(/eta|delivery estimate/i);

  return (
    <div className="h-full flex flex-col" style={{ background: "#0d0f10" }}>
      <TopNav activePage="Risk Monitor" interaction={interaction} />
      <div className="flex flex-1 min-h-0">
        {/* Left panel */}
        <div className="w-[320px] shrink-0 border-r p-4 space-y-3 overflow-hidden" style={{ background: "#111416", borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Shipment</p>
            <p className="text-base font-bold text-white">{s.id}</p>
            <p className="text-xs text-gray-500">{s.cargo}</p>
          </div>
          <div className={cn("rounded-lg p-3 border space-y-1.5 transition-colors",
            readingRisk ? "border-blue-500/30 bg-[#1e3a5f]/15" : "border-white/8 bg-white/4"
          )}>
            <p className="text-[10px] uppercase text-gray-600">Risk Factors</p>
            {s.riskReasons.slice(0, 3).map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                <span className={cn("h-2 w-2 rounded-full shrink-0", i === 0 ? "bg-red-500" : i === 1 ? "bg-amber-400" : "bg-gray-600")} />
                {r}
              </div>
            ))}
          </div>
          <div className={cn("rounded-lg p-3 border transition-colors",
            readingEta ? "border-blue-500/30 bg-[#1e3a5f]/15" : "border-white/8 bg-white/4"
          )}>
            <p className="text-[10px] uppercase text-gray-600 mb-1.5">Delivery ETA</p>
            <p className="text-sm font-bold text-white">{s.eta}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{s.origin} → {s.destination}</p>
          </div>
          <div className="rounded-lg p-3 border border-white/8 bg-white/4 grid grid-cols-2 gap-2">
            {[
              { l: "Risk Score", v: `${s.riskScore}%`, c: "text-red-400" },
              { l: "Status", v: s.status.replace(/_/g, " "), c: "text-amber-400" },
              { l: "Carrier", v: s.carrierName.slice(0, 14), c: "text-white" },
              { l: "Driver", v: "Marcus V.", c: "text-white" },
            ].map(f => (
              <div key={f.l}>
                <p className="text-[10px] text-gray-600">{f.l}</p>
                <p className={cn("text-xs font-semibold truncate", f.c)}>{f.v}</p>
              </div>
            ))}
          </div>
          <button className="w-full py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg border border-red-500">
            Open Incident Report
          </button>
        </div>
        {/* Map */}
        <div className={cn("flex-1 relative overflow-hidden transition-all", readingMap ? "ring-2 ring-blue-500/30" : "")} style={{ background: "#0d1117" }}>
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <pattern id="sdgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a2535" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sdgrid)" opacity="0.5" />
            <ellipse cx="25%" cy="65%" rx="18%" ry="20%" fill="#161c28" />
            <ellipse cx="70%" cy="35%" rx="22%" ry="15%" fill="#161c28" />
            <circle cx="38%" cy="52%" r="60" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.35)" strokeWidth="1.5" strokeDasharray="5 3" />
            <polyline points="18%,72% 25%,63% 33%,55% 40%,47% 50%,38% 60%,30% 68%,22%" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.65" strokeDasharray="4 3" />
            <circle cx="18%" cy="72%" r="10" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="2" />
            <text x="18%" y="72%" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="bold">P</text>
            <circle cx="38%" cy="52%" r="13" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="2.5" />
            <text x="38%" y="52%" textAnchor="middle" dominantBaseline="middle" fontSize="11">🚛</text>
            <circle cx="68%" cy="22%" r="10" fill="#059669" stroke="#34d399" strokeWidth="2" />
            <text x="68%" y="22%" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="bold">D</text>
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── RiskGPT Chat Screen ──────────────────────────────────────────────────────

export function RiskGptChatScreen({ interaction }: ScreenProps) {
  const s = demoData.shipments[0];
  const typing = !!interaction?.match(/type|generate|comprehensive|chat input/i);
  const hasResponse = !!interaction?.match(/read|analysis|response|riskgpt analysis/i);

  return (
    <div className="h-full flex flex-col" style={{ background: "#0d0f10" }}>
      <TopNav activePage="Risk Monitor" interaction={interaction} />
      <div className="flex flex-1 min-h-0">
        {/* Chat panel */}
        <div className="flex-1 flex flex-col" style={{ background: "#0d0f10" }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)", background: "#111416" }}>
            <div className="flex gap-4">
              {["Notes", "Chat with RiskGPT", "Instructions"].map((t, i) => (
                <button key={t} className={cn("text-sm py-1 border-b-2 font-medium transition-colors",
                  i === 1 ? "border-[#00c2b2] text-[#00c2b2]" : "border-transparent text-gray-500"
                )}>{t}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 p-4 space-y-4 overflow-hidden">
            {/* System message */}
            <div className="flex gap-3 items-center text-sm text-gray-500">
              <div className="h-6 w-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] shrink-0">🕐</div>
              Investigation started <span className="ml-auto text-gray-700 text-xs">15:02</span>
            </div>
            {/* User typing */}
            {(typing || hasResponse) && (
              <div className="flex gap-3 items-start flex-row-reverse">
                <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-bold shrink-0">NF</div>
                <div className="bg-blue-600/20 border border-blue-500/20 rounded-xl rounded-tr-sm px-4 py-2.5 text-sm text-blue-100 max-w-[75%]">
                  Generate comprehensive risk report for OH-{s.id.replace(/\D/g, "").slice(0, 5)}
                  {typing && !hasResponse && <span className="animate-pulse text-blue-300 ml-1">|</span>}
                </div>
              </div>
            )}
            {/* AI response */}
            {hasResponse && (
              <div className="flex gap-3 items-start">
                <div className="h-7 w-7 rounded-full bg-[#00c2b2]/20 border border-[#00c2b2]/40 flex items-center justify-center text-[10px] text-[#00c2b2] font-bold shrink-0">AI</div>
                <div className="bg-white/5 border border-white/6 rounded-xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-300 max-w-[75%]">
                  <p className="font-semibold text-white mb-2">Risk Report — {s.id}</p>
                  <p className="mb-1">• <strong>Risk Score:</strong> <span className="text-red-400">{s.riskScore}%</span> — CRITICAL</p>
                  <p className="mb-1">• <strong>Theft Probability:</strong> {s.theftProbability}%</p>
                  <p className="mb-1">• <strong>Primary Risk:</strong> {s.riskReasons[0]}</p>
                  <p className="text-amber-300 mt-2">→ Recommend security escort and immediate driver contact.</p>
                </div>
              </div>
            )}
          </div>
          {/* Input */}
          <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="flex gap-2">
              <div className={cn(
                "flex-1 rounded-lg px-3 py-2 text-sm border",
                typing ? "border-[#00c2b2]/40 bg-white/5 text-white" : "border-white/8 bg-white/4 text-gray-600"
              )}>
                {typing ? <span>Analyze Light & Stop compound case OH-84764<span className="animate-pulse text-[#00c2b2] ml-1">|</span></span> : "Ask RiskGPT about this alert…"}
              </div>
              <button className="px-4 py-2 rounded-lg bg-[#00c2b2] text-white text-sm font-medium">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Incident Form Screen ─────────────────────────────────────────────────────

export function IncidentFormScreen({ interaction }: ScreenProps) {
  const typing = !!interaction?.match(/description|type|form/i);
  const submitting = !!interaction?.match(/submit/i);
  const evidence = !!interaction?.match(/evidence|attach|gps/i);

  return (
    <div className="h-full flex flex-col" style={{ background: "#0d0f10" }}>
      <TopNav activePage="Risk Monitor" interaction={interaction} />
      <div className="flex-1 p-6 max-w-2xl">
        <h2 className="text-base font-bold text-white mb-4">New Incident Report</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {[
            { label: "Shipment ID", val: "OH-4834221" },
            { label: "Incident Type", val: "Route Deviation" },
            { label: "Priority", val: "HIGH" },
            { label: "Assigned To", val: "Operations" },
          ].map(f => (
            <div key={f.label}>
              <p className="text-[10px] text-gray-500 mb-1">{f.label}</p>
              <div className="h-8 rounded-lg border px-3 flex items-center text-xs text-gray-300" style={{ background: "#181c1f", borderColor: "rgba(255,255,255,0.1)" }}>{f.val}</div>
            </div>
          ))}
        </div>
        <div className="mb-3">
          <p className="text-[10px] text-gray-500 mb-1">Description</p>
          <div className={cn("h-20 rounded-lg border p-3 text-xs leading-relaxed transition-colors",
            typing ? "border-blue-400/50 bg-[#1e3a5f]/20 text-white/80" : "border-white/8 text-gray-500"
          )} style={{ background: typing ? undefined : "#181c1f" }}>
            Route deviation detected 47 miles from origin. Carrier not responding to primary contact{typing ? <span className="animate-pulse text-blue-300">|</span> : "..."}
          </div>
        </div>
        <div className={cn("rounded-lg border p-3 mb-4 transition-colors", evidence ? "border-blue-400/40 bg-[#1e3a5f]/15" : "border-white/8")} style={{ background: evidence ? undefined : "#181c1f" }}>
          <p className="text-[10px] text-gray-500 mb-2">Evidence Files</p>
          <div className="flex gap-2">
            {["GPS_log.json", "telemetry.csv", "route_map.png"].map(f => (
              <div key={f} className={cn("flex items-center gap-1.5 text-xs rounded-md px-2 py-1 border", evidence ? "border-blue-500/40 text-blue-300 bg-blue-500/10" : "border-white/10 text-gray-500")}>
                <FileText className="h-3 w-3" />{f}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button className={cn("px-6 py-2 text-sm font-semibold text-white rounded-lg transition-all", submitting ? "bg-red-400 scale-95" : "bg-red-600 hover:bg-red-500")}>
            Submit Incident
          </button>
          <button className="px-4 py-2 text-sm text-gray-500 border border-white/8 rounded-lg" style={{ background: "#181c1f" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Carrier Profile Screen ───────────────────────────────────────────────────

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
    <div className="h-full flex flex-col" style={{ background: "#0d0f10" }}>
      <TopNav activePage="Fraud Watch" interaction={interaction} />
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ background: "#111416", borderColor: "rgba(255,255,255,0.07)" }}>
        <div>
          <p className="text-sm font-bold text-white">Beacon Logistics LLC</p>
          <p className="text-xs text-gray-500">MC-294817 · DOT-1847392 · Active since 2009</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs text-emerald-300">FMCSA Verified</span>
        </div>
      </div>
      <div className="flex flex-1 min-h-0">
        <div className={cn("w-[200px] shrink-0 border-r p-3 space-y-2 transition-colors", readingStats ? "border-blue-500/20" : "")} style={{ background: "#111416", borderColor: "rgba(255,255,255,0.07)" }}>
          {[
            { l: "Safety Rating", v: "4.2/5", c: "text-emerald-300" },
            { l: "Fraud Score", v: "18%", c: "text-emerald-300" },
            { l: "On-Time Rate", v: "94%", c: "text-blue-300" },
            { l: "Fleet Size", v: "142", c: "text-white" },
            { l: "Total Shipments", v: "847", c: "text-white" },
          ].map(stat => (
            <div key={stat.l} className={cn("rounded-lg border p-2.5 transition-colors", readingStats ? "border-blue-400/30 bg-[#1e3a5f]/15" : "border-white/8 bg-white/4")}>
              <p className={cn("text-lg font-bold", stat.c)}>{stat.v}</p>
              <p className="text-[10px] text-gray-600">{stat.l}</p>
            </div>
          ))}
        </div>
        <div className="flex-1 p-4 space-y-2 overflow-hidden">
          <p className="text-[11px] uppercase text-gray-600 font-semibold mb-2">Credential Checks</p>
          {checks.map(c => (
            <div key={c.label} className={cn("flex items-center gap-3 rounded-lg border px-3 py-2 transition-all",
              readingCreds ? (c.status === "pass" ? "border-emerald-400/40 bg-emerald-500/8" : "border-amber-400/40 bg-amber-500/8") : "border-white/8 bg-white/4"
            )}>
              <span className={cn("h-2 w-2 rounded-full shrink-0", c.status === "pass" ? "bg-emerald-400" : "bg-amber-400")} />
              <div className="flex-1">
                <p className="text-[10px] text-gray-500">{c.label}</p>
                <p className="text-xs text-gray-300">{c.val}</p>
              </div>
              <span className={cn("text-[10px] font-bold", c.status === "pass" ? "text-emerald-400" : "text-amber-400")}>
                {c.status === "pass" ? "PASS" : "WARN"}
              </span>
            </div>
          ))}
          <p className="text-[11px] uppercase text-gray-600 font-semibold mt-3 mb-2">Certifications</p>
          {["TAPA TSR Level 1", "ISO 28000", "C-TPAT Certified"].map(c => (
            <div key={c} className={cn("flex items-center gap-2 text-xs rounded-lg px-3 py-2 transition-colors",
              readingCerts ? "text-emerald-200 bg-emerald-500/10 border border-emerald-500/25" : "text-emerald-400"
            )}>
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />{c}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Digital Twin Screen ──────────────────────────────────────────────────────

export function DigitalTwinScreen({ interaction }: ScreenProps) {
  const shipmentClick = !!interaction?.match(/shipment|marker/i);

  return (
    <div className="h-full flex flex-col" style={{ background: "#0d0f10" }}>
      <TopNav activePage="Digital Twin" interaction={interaction} />
      <div className="flex-1 relative overflow-hidden" style={{ background: "#0d1117" }}>
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <pattern id="dtgrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a2535" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dtgrid)" opacity="0.5" />
          <ellipse cx="30%" cy="62%" rx="22%" ry="24%" fill="#161c28" />
          <ellipse cx="68%" cy="38%" rx="24%" ry="18%" fill="#161c28" />
          {[
            { cx: "22%", cy: "48%", color: "#ef4444", label: "OH-84764 · 98%" },
            { cx: "45%", cy: "35%", color: "#f59e0b", label: "OH-22813 · 74%" },
            { cx: "62%", cy: "55%", color: "#10b981", label: "OH-91034 · 22%" },
          ].map((m, i) => (
            <g key={i}>
              <circle cx={m.cx} cy={m.cy} r={i === 0 && shipmentClick ? "16" : "10"} fill={m.color} opacity="0.8" />
              <circle cx={m.cx} cy={m.cy} r="20" fill={m.color} opacity={i === 0 && shipmentClick ? "0.2" : "0.05"} />
              <text x={m.cx} y={`calc(${m.cy} + 22px)`} textAnchor="middle" fill="white" fontSize="9" opacity="0.8">{m.label}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─── Executive Report Screen ──────────────────────────────────────────────────

export function ExecutiveReportScreen({ interaction }: ScreenProps) {
  return (
    <div className="h-full flex flex-col" style={{ background: "#0d0f10" }}>
      <TopNav activePage="Executive" interaction={interaction} />
      <div className="flex-1 p-4 grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <p className="text-sm font-bold text-white mb-1">Executive Risk Briefing</p>
          <p className="text-[11px] text-gray-500">{new Date().toLocaleDateString()}</p>
        </div>
        {[
          { l: "Cargo Protected", v: "$2.4B", c: "text-blue-300" },
          { l: "Active Alerts", v: "87", c: "text-amber-300" },
          { l: "Fraud Cases", v: "8", c: "text-red-300" },
          { l: "SLA Compliance", v: "97.4%", c: "text-emerald-300" },
        ].map(s => (
          <div key={s.l} className="rounded-lg p-3 border" style={{ background: "#181c1f", borderColor: "rgba(255,255,255,0.07)" }}>
            <p className={cn("text-2xl font-bold", s.c)}>{s.v}</p>
            <p className="text-xs text-gray-600">{s.l}</p>
          </div>
        ))}
        <div className="col-span-2 rounded-lg p-3 border" style={{ background: "#181c1f", borderColor: "rgba(255,255,255,0.07)" }}>
          <p className="text-xs font-semibold text-white mb-2">Risk Trend (24h)</p>
          <div className="flex items-end gap-1 h-16">
            {[40, 55, 45, 65, 70, 60, 80, 75, 85].map((h, i) => (
              <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: "#3b82f6", opacity: 0.5 + i * 0.05 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Fraud Check Screen ───────────────────────────────────────────────────────

export function FraudCheckScreen({ interaction }: ScreenProps) {
  const searchActive = !!interaction?.match(/search|carrier search/i);
  const typingCarrier = !!interaction?.match(/beacon logistics|typing/i);
  const highlightChecks = interaction?.match(/usdot|name cross|insurance|first officer|composite/i);

  const checks = [
    { id: "usdot", label: "Address Verification", status: "pass", detail: "Dallas, TX 75201 — confirmed" },
    { id: "mc", label: "USDOT Lookup", status: "pass", detail: "DOT-1847392 Active carrier" },
    { id: "name", label: "Name Cross-Reference", status: "pass", detail: "No aliases or DBA matches" },
    { id: "insurance", label: "Insurance Check", status: "pass", detail: "$1M liability, valid" },
    { id: "officer", label: "First Officer Review", status: "warn", detail: "1 prior incident flagged" },
    { id: "composite", label: "Composite Risk Score", status: "pass", detail: "18% — LOW RISK" },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: "#0d0f10" }}>
      <TopNav activePage="Fraud Watch" interaction={interaction} />
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-[220px] shrink-0 border-r flex flex-col" style={{ background: "#111416", borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="p-2 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className={cn("flex items-center gap-2 rounded-lg px-3 py-1.5 border", searchActive || typingCarrier ? "border-blue-400/50 bg-[#1e3a5f]/30" : "border-white/8 bg-white/4")}>
              <Search className="h-3.5 w-3.5 text-gray-600 shrink-0" />
              <span className="text-xs text-gray-500 truncate">
                {typingCarrier ? <span className="text-white">Beacon Logistics<span className="animate-pulse text-blue-300">|</span></span> : "Search carrier…"}
              </span>
            </div>
          </div>
          <div className="p-2 space-y-1.5">
            {[
              { name: "Beacon Logistics", score: 18, active: true },
              { name: "Swift Transport", score: 34, active: false },
              { name: "United Freight", score: 72, active: false },
            ].map(c => (
              <div key={c.name} className={cn("rounded-lg border px-3 py-2 transition-colors", c.active ? "border-blue-500/30 bg-[#1e3a5f]" : "border-white/8 bg-white/4")}>
                <p className="text-xs font-medium text-white">{c.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-gray-600">Risk</span>
                  <span className={cn("text-xs font-bold", c.score < 30 ? "text-emerald-400" : c.score < 60 ? "text-amber-400" : "text-red-400")}>{c.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Checks */}
        <div className="flex-1 p-4 space-y-2 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-white">Beacon Logistics LLC</p>
            <span className="text-xs text-gray-500">MC-294817</span>
          </div>
          {checks.map(c => (
            <div key={c.id} className={cn("flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all",
              highlightChecks ? (c.status === "pass" ? "border-emerald-400/40 bg-emerald-500/8" : "border-amber-400/40 bg-amber-500/8") : "border-white/8 bg-white/4"
            )}>
              <span className={cn("h-2 w-2 rounded-full shrink-0", c.status === "pass" ? "bg-emerald-400" : "bg-amber-400 animate-pulse")} />
              <div className="flex-1">
                <p className="text-[10px] text-gray-500">{c.label}</p>
                <p className="text-xs text-gray-300">{c.detail}</p>
              </div>
              <span className={cn("text-xs font-bold", c.status === "pass" ? "text-emerald-400" : "text-amber-400")}>
                {c.status === "pass" ? "PASS" : "WARN"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Case Detail Screen ───────────────────────────────────────────────────────

export function CaseDetailScreen({ interaction }: ScreenProps) {
  const callingDriver = !!interaction?.match(/call driver/i);
  const readingTimeline = !!interaction?.match(/timeline|stopped|47 min|case/i);
  const readingRiskgpt = !!interaction?.match(/riskgpt|analysis|risk score/i);

  return (
    <div className="h-full flex flex-col" style={{ background: "#0d0f10" }}>
      <TopNav activePage="Risk Monitor" interaction={interaction} />

      {/* Case header */}
      <div className="px-4 py-3 border-b shrink-0" style={{ background: "#111416", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-bold text-white">Light &amp; Stop (Compound) — OH-84764</p>
            <p className="text-xs text-gray-500">São Paulo, Brazil → Chicago, USA · Weekend transit</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-red-400 bg-red-500/15 border border-red-500/30 px-2.5 py-1 rounded-full">Risk 98+</span>
            <span className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-full">Investigating</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { l: "Driver", v: "Marcus Vinicius", sub: "+55 11 9xxxx-xxxx" },
            { l: "Stopped At", v: "01:00 AM", sub: "47 min elapsed" },
            { l: "Battery", v: "92%", sub: "Device online" },
          ].map(item => (
            <div key={item.l} className="rounded-lg border px-3 py-2" style={{ background: "#181c1f", borderColor: "rgba(255,255,255,0.07)" }}>
              <p className="text-[10px] uppercase text-gray-600">{item.l}</p>
              <p className="text-xs font-semibold text-white mt-0.5">{item.v}</p>
              <p className="text-[10px] text-gray-500">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left: Timeline + actions */}
        <div className="w-[260px] shrink-0 border-r flex flex-col" style={{ background: "#111416", borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="p-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-xs font-semibold text-white mb-2">Event Timeline</p>
            {[
              { evt: "Vehicle stopped", t: "01:00 AM", col: "text-red-400", dot: "bg-red-500" },
              { evt: "No check-in ping", t: "01:22 AM", col: "text-amber-400", dot: "bg-amber-400" },
              { evt: "Alert triggered", t: "01:47 AM", col: "text-red-400", dot: "bg-red-500" },
              { evt: "Investigator assigned", t: "01:50 AM", col: "text-blue-400", dot: "bg-blue-400" },
            ].map((e, i) => (
              <div key={i} className={cn("flex items-start gap-2 rounded-lg px-2 py-2 mb-1 border transition-colors",
                readingTimeline ? "border-blue-400/25 bg-[#1e3a5f]/15" : "border-transparent"
              )}>
                <span className={cn("h-2 w-2 rounded-full mt-1 shrink-0", e.dot)} />
                <div className="flex-1">
                  <p className={cn("text-[11px] font-medium", e.col)}>{e.evt}</p>
                  <p className="text-[10px] text-gray-600">{e.t}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Actions */}
          <div className="p-3 space-y-2">
            <p className="text-xs font-semibold text-white mb-2">GSOC Actions</p>
            <button className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm font-semibold transition-all",
              callingDriver
                ? "border-emerald-400 bg-emerald-500/15 text-emerald-300 scale-98"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15"
            )}>
              <Phone className={cn("h-4 w-4 shrink-0", callingDriver && "animate-pulse")} />
              {callingDriver ? "Calling Driver…" : "Call Driver"}
            </button>
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-blue-500/30 text-xs text-blue-400 hover:bg-blue-500/10 transition-colors">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Contact Carrier Dispatch
            </button>
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-white/8 text-xs text-gray-500 hover:bg-white/5 transition-colors">
              Waive Event
            </button>
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-red-500/30 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
              Escalate to Police
            </button>
          </div>
        </div>

        {/* Right: Map + RiskGPT */}
        <div className="flex-1 flex flex-col">
          {/* Map */}
          <div className="flex-1 relative overflow-hidden" style={{ background: "#0d1117" }}>
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <pattern id="cdgrid" width="36" height="36" patternUnits="userSpaceOnUse">
                  <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#1a2535" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cdgrid)" opacity="0.5" />
              <ellipse cx="30%" cy="65%" rx="22%" ry="20%" fill="#161c28" />
              <ellipse cx="72%" cy="35%" rx="20%" ry="18%" fill="#161c28" />
              {/* Route */}
              <polyline points="20%,72% 28%,63% 36%,55% 44%,47% 52%,39% 60%,31% 68%,23%"
                stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.6" strokeDasharray="4 3" />
              {/* Pickup */}
              <circle cx="20%" cy="72%" r="10" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="2" />
              <text x="20%" y="72%" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="bold">P</text>
              {/* Stopped truck — red pulse */}
              <circle cx="44%" cy="47%" r="20" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.4)" strokeWidth="1.5" />
              <circle cx="44%" cy="47%" r="13" fill="#dc2626" stroke="#f87171" strokeWidth="2" />
              <text x="44%" y="47%" textAnchor="middle" dominantBaseline="middle" fontSize="11">🚛</text>
              {/* Stop label */}
              <rect x="calc(44% + 16px)" y="calc(47% - 18px)" width="80" height="32" fill="#111416" stroke="rgba(239,68,68,0.5)" strokeWidth="1" rx="4" />
              <text x="calc(44% + 56px)" y="calc(47% - 6px)" textAnchor="middle" fill="#fca5a5" fontSize="8" fontWeight="bold">⛽ STOPPED</text>
              <text x="calc(44% + 56px)" y="calc(47% + 8px)" textAnchor="middle" fill="#6b7280" fontSize="7">47 min elapsed</text>
              {/* Destination */}
              <circle cx="68%" cy="23%" r="10" fill="#059669" stroke="#34d399" strokeWidth="2" />
              <text x="68%" y="23%" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="bold">D</text>
            </svg>
          </div>

          {/* RiskGPT panel at bottom */}
          <div className={cn("border-t p-3 transition-colors", readingRiskgpt ? "bg-[#111416]" : "bg-[#0d1117]")} style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <p className="text-[10px] uppercase text-gray-600 mb-2">RiskGPT Analysis</p>
            <div className="flex gap-2">
              <div className="h-6 w-6 rounded-full bg-[#00c2b2]/20 border border-[#00c2b2]/40 flex items-center justify-center text-[10px] text-[#00c2b2] font-bold shrink-0">AI</div>
              <div className={cn("flex-1 rounded-lg p-2.5 text-[11px] text-gray-300 leading-relaxed transition-colors",
                readingRiskgpt ? "bg-[#00c2b2]/8 border border-[#00c2b2]/20" : "bg-white/4 border border-white/8"
              )}>
                <strong className="text-white">Risk 98% · Theft probability 97%.</strong> Weekend transit + driver deviation + unauthorized stop detected.
                <span className="text-amber-300 ml-1">Recommend immediate driver contact. If no answer, escalate to carrier then police.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Driver Call Screen ───────────────────────────────────────────────────────

export function DriverCallScreen({ interaction }: ScreenProps) {
  const connected = !!interaction?.match(/confirm|driver confirm|fuel stop|response|connected/i);
  const ending = !!interaction?.match(/end call|mark.*resolved|resolved|explained/i);

  return (
    <div className="h-full flex flex-col items-center justify-center relative" style={{ background: "#0d0f10" }}>
      {/* Blurred bg */}
      <div className="absolute inset-0" style={{
        backgroundImage: "radial-gradient(circle at 50% 45%, rgba(30,58,94,0.4) 0%, transparent 60%)",
      }} />

      {/* Call card */}
      <div className="relative z-10 flex flex-col items-center gap-5 rounded-2xl px-10 py-8 border shadow-2xl"
        style={{ background: "#111416", borderColor: connected ? "rgba(52,211,153,0.3)" : "rgba(59,130,246,0.25)", minWidth: 320 }}>

        {/* Avatar ring */}
        <div className={cn(
          "h-20 w-20 rounded-full border-4 flex items-center justify-center text-4xl transition-all",
          ending ? "border-gray-600 opacity-50" :
          connected ? "border-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.4)]" :
          "border-blue-400 animate-pulse shadow-[0_0_24px_rgba(59,130,246,0.5)]"
        )} style={{ background: connected ? "rgba(52,211,153,0.1)" : "rgba(59,130,246,0.1)" }}>
          👤
        </div>

        {/* Info */}
        <div className="text-center">
          <p className="text-base font-bold text-white">Marcus Vinicius</p>
          <p className="text-xs text-gray-500 mt-0.5">Driver · OH-84764 · +55 11 9xxxx-xxxx</p>
          <div className={cn("flex items-center justify-center gap-1.5 mt-2 text-sm font-medium",
            ending ? "text-gray-500" : connected ? "text-emerald-400" : "text-blue-400"
          )}>
            <span className={cn("h-2 w-2 rounded-full", ending ? "bg-gray-600" : connected ? "bg-emerald-400" : "bg-blue-400 animate-pulse")} />
            {ending ? "Call ended · 4:32" : connected ? "Connected · 4:32" : "Calling…"}
          </div>
        </div>

        {/* Transcript */}
        {(connected || ending) && (
          <div className="w-full rounded-xl border p-3 space-y-2" style={{ background: "#0d0f10", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="flex gap-2">
              <span className="text-[10px] text-emerald-400 font-medium w-14 shrink-0">Agent:</span>
              <p className="text-[11px] text-gray-300">Driver, please confirm your current location and status.</p>
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] text-blue-400 font-medium w-14 shrink-0">Marcus:</span>
              <p className="text-[11px] text-gray-300">Routine fuel stop near the highway. Back in about 10 minutes. Everything&apos;s fine.</p>
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] text-emerald-400 font-medium w-14 shrink-0">Agent:</span>
              <p className="text-[11px] text-gray-300">Understood. Logging as explained stop. Safe travels.</p>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4">
          <button className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all",
            ending ? "border-gray-700 opacity-30" : "border-red-500 bg-red-600/20 text-red-400 hover:bg-red-600/30"
          )}>
            <PhoneOff className="h-5 w-5" />
          </button>
          {(connected && !ending) && (
            <button className="h-12 w-12 rounded-full flex items-center justify-center border-2 border-emerald-400 bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Recording notice */}
        <div className="flex items-center gap-2 text-[11px] text-gray-600">
          <Clock className="h-3 w-3" />
          {connected && !ending ? "Recording · Overhaul Dispatch" : ending ? "Call complete — case updated" : "Connecting via Overhaul dispatch…"}
        </div>
      </div>
    </div>
  );
}

// ─── Case Notes Screen ────────────────────────────────────────────────────────

export function CaseNotesScreen({ interaction }: ScreenProps) {
  const typing = !!interaction?.match(/notes|typing|driver confirmed|routine/i);
  const saving = !!interaction?.match(/save|close alert/i);
  const isSaved = saving || (!typing && !interaction?.match(/add case/i));

  const noteText = "Driver Marcus Vinicius (OH-84764) confirmed routine fuel stop near São Paulo outskirts at 01:00 AM. No security threat detected. Stop duration: ~47 min. Vehicle resuming route. Risk score updated: 98% → Explained.";

  return (
    <div className="h-full flex flex-col" style={{ background: "#0d0f10" }}>
      <TopNav activePage="Risk Monitor" interaction={interaction} />
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ background: "#111416", borderColor: "rgba(255,255,255,0.07)" }}>
        <div>
          <p className="text-sm font-bold text-white">Case Notes — OH-84764</p>
          <p className="text-xs text-gray-500">Light &amp; Stop (Compound) · Investigation outcome</p>
        </div>
        <span className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-full">Explained</span>
      </div>
      <div className="flex flex-1 min-h-0">
        <div className="w-[220px] shrink-0 border-r p-4 space-y-3" style={{ background: "#111416", borderColor: "rgba(255,255,255,0.07)" }}>
          <p className="text-xs font-semibold text-white">Resolution Summary</p>
          {[
            { l: "Driver Reached", v: "✓ Marcus Vinicius", c: "text-emerald-400" },
            { l: "Stop Reason", v: "Routine fuel stop", c: "text-white" },
            { l: "Threat Detected", v: "None", c: "text-emerald-400" },
            { l: "Call Duration", v: "4m 32s", c: "text-white" },
          ].map(r => (
            <div key={r.l} className="rounded-lg border p-2.5" style={{ background: "#181c1f", borderColor: "rgba(255,255,255,0.07)" }}>
              <p className="text-[10px] text-gray-600">{r.l}</p>
              <p className={cn("text-xs font-medium mt-0.5", r.c)}>{r.v}</p>
            </div>
          ))}
        </div>
        <div className="flex-1 p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-white">Investigation Notes</p>
          <div className={cn(
            "flex-1 rounded-xl border p-3 text-sm leading-relaxed transition-colors",
            isSaved ? "border-emerald-400/30 bg-emerald-500/5 text-gray-300" :
            typing ? "border-blue-400/40 bg-[#1e3a5f]/15 text-white/80" :
            "border-white/8 text-gray-600"
          )} style={{ background: isSaved || typing ? undefined : "#181c1f" }}>
            {typing || isSaved ? noteText : "Click to add investigation notes…"}
            {typing && !isSaved && <span className="animate-pulse text-blue-300 ml-1">|</span>}
          </div>
          <div className="flex gap-2">
            <button className={cn("flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-colors",
              isSaved ? "bg-emerald-600 border border-emerald-500" : "bg-blue-600 border border-blue-500"
            )}>
              {isSaved ? "✓ Notes Saved" : "Save Notes"}
            </button>
            <button className="px-4 py-2 rounded-lg text-sm text-gray-500 border border-white/8" style={{ background: "#181c1f" }}>
              Close Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Search Results Screen ────────────────────────────────────────────────────

export function SearchResultsScreen({ interaction }: ScreenProps) {
  return (
    <div className="h-full flex flex-col" style={{ background: "#0d0f10" }}>
      <TopNav activePage="Home" interaction={interaction} />
      <div className="flex-1 p-6">
        <p className="text-xs text-gray-500 mb-4">Search results for shipment…</p>
        {demoData.shipments.slice(0, 4).map(s => (
          <div key={s.id} className="flex items-center gap-3 rounded-lg border px-4 py-3 mb-2 cursor-pointer hover:bg-white/4 transition-colors" style={{ background: "#181c1f", borderColor: "rgba(255,255,255,0.07)" }}>
            <span className="text-xs font-mono text-white font-semibold">{s.id}</span>
            <span className="text-xs text-gray-500 flex-1">{s.cargo}</span>
            <span className={cn("text-xs font-bold", s.riskScore > 80 ? "text-red-400" : s.riskScore > 60 ? "text-amber-400" : "text-emerald-400")}>{s.riskScore}%</span>
          </div>
        ))}
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
    case "search-results": return <SearchResultsScreen interaction={interaction} />;
    default: return <HomeScreen interaction={interaction} />;
  }
}

export const SCREEN_LABELS: Record<ScreenId, string> = {
  "home": "Home — Overhaul Platform",
  "risk-monitor": "Risk Monitor — OH-84764",
  "shipment-detail": "Shipment Detail",
  "riskgpt-chat": "RiskGPT Chat",
  "incident-form": "Incident Form",
  "carrier-profile": "Carrier Profile — Beacon Logistics",
  "executive-report": "Executive Briefing",
  "fraud-dashboard": "Fraud Watch — Bad Actor Check",
  "digital-twin": "Digital Twin",
  "search-results": "Search Results",
  "case-detail": "Case Detail — OH-84764",
  "driver-call": "Driver Call — Marcus Vinicius",
  "case-notes": "Case Notes",
};

// ─── Hotspot positions ────────────────────────────────────────────────────────
// x%, y% relative to the viewport body div (after the AgentViewport header bar)
// Viewport body: ~1000px wide × ~460px tall (standalone), ~700px wide × ~400px tall (embedded)
//
// Layout reference:
//   Risk Monitor: 280px sidebar (28%) | flex-1 map
//   Case Detail:  260px sidebar (26%) | flex-1 map + riskgpt panel
//   Driver Call:  centered card

export type Hotspot = { x: number; y: number; label: string };

export const SCREEN_HOTSPOTS: Partial<Record<ScreenId, Hotspot[]>> = {
  "home": [
    { x: 44, y: 8, label: "Risk Monitor nav link" },
    { x: 53, y: 8, label: "Fraud Watch nav link" },
  ],
  "risk-monitor": [
    // Sidebar elements (x < 28%)
    { x: 14, y: 18, label: "Search alerts box" },
    { x: 14, y: 38, label: "Light & Stop (Compound) risk pill" },  // active risk pills ~y:35-45%
    { x: 14, y: 43, label: "Light alert risk pill" },
    { x: 14, y: 62, label: "11:29 timeline event" },               // timeline ~y:58-80%
    { x: 14, y: 68, label: "11:17 timeline event" },
    // Map elements
    { x: 65, y: 55, label: "Truck — current position" },           // truck at ~38%,55% of SVG = map area
    { x: 35, y: 77, label: "RiskGPT Notes tab" },                  // floating panel bottom-left
    { x: 43, y: 77, label: "Chat with RiskGPT tab" },
    { x: 85, y: 16, label: "GSOC Response button" },
  ],
  "shipment-detail": [
    { x: 15, y: 38, label: "Risk factors panel" },
    { x: 15, y: 55, label: "ETA panel" },
    { x: 15, y: 82, label: "Open Incident button" },
    { x: 60, y: 45, label: "Live map — GPS position" },
  ],
  "riskgpt-chat": [
    { x: 30, y: 18, label: "Chat with RiskGPT tab" },
    { x: 60, y: 78, label: "Chat input field" },
    { x: 60, y: 55, label: "AI risk analysis response" },
  ],
  "incident-form": [
    { x: 50, y: 42, label: "Incident description field" },
    { x: 38, y: 60, label: "Attach GPS evidence" },
    { x: 18, y: 74, label: "Submit Incident Report" },
  ],
  "carrier-profile": [
    { x: 10, y: 38, label: "Safety & performance ratings" },
    { x: 55, y: 35, label: "FMCSA credential checks" },
    { x: 55, y: 50, label: "Insurance check result" },
    { x: 55, y: 74, label: "Certifications — TAPA, ISO, C-TPAT" },
  ],
  "fraud-dashboard": [
    { x: 11, y: 16, label: "Carrier search box" },
    { x: 11, y: 32, label: "Beacon Logistics — MC-294817" },
    { x: 60, y: 24, label: "USDOT lookup result" },
    { x: 60, y: 34, label: "Name cross-reference result" },
    { x: 60, y: 44, label: "Insurance check result" },
    { x: 60, y: 54, label: "First officer review" },
    { x: 60, y: 64, label: "Composite risk score" },
  ],
  "digital-twin": [
    { x: 22, y: 48, label: "OH-84764 — high risk marker" },
    { x: 45, y: 35, label: "OH-22813 — medium risk" },
    { x: 62, y: 55, label: "OH-91034 — low risk" },
  ],
  "case-detail": [
    // Sidebar (x < 26%)
    { x: 13, y: 34, label: "Event timeline — stopped 47 min" },
    { x: 13, y: 42, label: "No check-in ping" },
    { x: 13, y: 60, label: "Call Driver button" },
    { x: 13, y: 68, label: "Contact Carrier Dispatch" },
    // Map
    { x: 65, y: 40, label: "Stopped truck marker" },
    // RiskGPT panel
    { x: 65, y: 88, label: "RiskGPT analysis" },
  ],
  "driver-call": [
    { x: 50, y: 25, label: "Calling Marcus Vinicius — ringing" },
    { x: 50, y: 50, label: "Driver confirms routine fuel stop" },
    { x: 42, y: 75, label: "End call — mark stop as explained" },
  ],
  "case-notes": [
    { x: 60, y: 38, label: "Investigation notes field" },
    { x: 60, y: 70, label: "Notes: driver confirmed — no threat" },
    { x: 35, y: 86, label: "Save Notes & close alert" },
  ],
};
