"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Database, Package, Truck, BarChart3,
  CheckCircle2, Loader2, AlertTriangle, Zap,
  Send, RotateCcw, Activity, Plug, Settings,
  LayoutDashboard, GitBranch, ShieldCheck,
  Users, ChevronRight, TrendingDown, Clock,
  ArrowRight, Sparkles, Server, Network,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentStatus = "idle" | "queued" | "running" | "complete" | "error";
type RunPhase = "idle" | "supervisor" | "parallel" | "decision" | "complete";

interface TimelineEvent {
  id: string;
  time: string;
  agent: string;
  agentColor: string;
  message: string;
  status: "info" | "success" | "running";
}

// ─── Mock Scenarios ───────────────────────────────────────────────────────────

const SCENARIOS = [
  { id: "shp-1024", label: "SHP-1024 delay", query: "Why is Shipment SHP-1024 delayed?" },
  { id: "sla-risk", label: "Nexus SLA risk", query: "What is the SLA risk for Nexus Pharmaceuticals?" },
  { id: "wh-delays", label: "Warehouse delays", query: "Which warehouse is causing the most shipment delays?" },
];

const MOCK_ERP = {
  salesOrder: "SO-289341",
  customer: "Nexus Pharmaceuticals",
  customerPriority: "PLATINUM",
  shipmentValue: "$284,500",
  inventoryStatus: "Available",
  deliverySLA: "Jan 15 — 18:00 CST",
  purchaseOrder: "PO-118842",
  orderStatus: "Delayed",
};

const MOCK_WMS = {
  pickingStatus: "Complete",
  packingStatus: "Complete",
  loadingStatus: "Delayed — 95 min",
  dockAssignment: "Dock 7-B",
  warehouseDelay: "95 minutes",
  inventoryQty: 240,
  exceptions: ["Equipment failure at Dock 7-B", "Loading crew shortage"],
};

const MOCK_TMS = {
  carrier: "Swift Logistics",
  driver: "James Rodriguez",
  plannedRoute: "Chicago WH → Nashville DC",
  currentRoute: "Awaiting dispatch",
  eta: "Jan 15 — 22:00 CST",
  delayEvents: ["Missed 14:00 departure window"],
  vehicleStatus: "Staged — awaiting load",
  transportCost: "$3,840",
};

const MOCK_DECISION = {
  rootCause:
    "Dock equipment failure at Dock 7-B caused a 95-minute loading delay, resulting in the carrier missing the allocated 14:00 departure window.",
  businessImpact:
    "4-hour delivery delay affecting a PLATINUM SLA customer ($284,500 shipment). Risk of SLA breach and potential penalty of up to $28,000.",
  recommendations: [
    "Notify Nexus Pharmaceuticals customer success team immediately",
    "Reassign load to Dock 9-A (currently available)",
    "Request Swift Logistics to hold next available departure slot",
    "Update ETA to 22:00 CST across ERP, TMS and customer portal",
    "Escalate Dock 7-B equipment failure to Facility Management",
  ],
  confidence: 96,
  timeline: [
    { time: "12:15", event: "Picking completed", severity: "ok" },
    { time: "13:05", event: "Packing completed", severity: "ok" },
    { time: "13:20", event: "Dock 7-B equipment failure detected", severity: "error" },
    { time: "14:00", event: "Planned departure window missed", severity: "error" },
    { time: "14:55", event: "Delay escalation triggered", severity: "warn" },
    { time: "15:30", event: "Investigation initiated", severity: "info" },
  ],
};

// ─── Animation timing (ms) ────────────────────────────────────────────────────

const T = {
  supervisorStart: 300,
  agentsStart: 1000,
  erpComplete: 2800,
  wmsComplete: 3600,
  tmsComplete: 4300,
  decisionStart: 4800,
  decisionComplete: 7200,
  finalResponse: 7800,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AgentStatus }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide",
      status === "idle" && "border-white/10 text-white/30 bg-transparent",
      status === "queued" && "border-white/20 text-white/50 bg-white/5",
      status === "running" && "border-blue-400/50 text-blue-300 bg-blue-500/10",
      status === "complete" && "border-emerald-400/40 text-emerald-300 bg-emerald-500/8",
      status === "error" && "border-red-400/40 text-red-300 bg-red-500/8",
    )}>
      {status === "running" && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
      {status === "complete" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
      {status === "idle" && <span className="h-1.5 w-1.5 rounded-full bg-white/20" />}
      {status === "queued" && <span className="h-1.5 w-1.5 rounded-full bg-white/40" />}
      {status}
    </span>
  );
}

function AgentCard({
  name, icon: Icon, color, borderColor, bgColor, status, system, fields, delay = 0,
}: {
  name: string; icon: React.ElementType; color: string; borderColor: string;
  bgColor: string; status: AgentStatus; system: string;
  fields: { label: string; value: string; highlight?: boolean }[];
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.4 }}
      className={cn(
        "flex flex-col rounded-xl border overflow-hidden transition-all duration-500",
        status === "running" && `${borderColor} shadow-[0_0_20px_rgba(59,130,246,0.1)]`,
        status === "complete" && "border-emerald-500/25",
        (status === "idle" || status === "queued") && "border-white/8",
      )}
      style={{ background: "#111416" }}
    >
      {/* Card header */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 border-b border-white/5",
        status === "running" && bgColor,
        status === "complete" && "bg-emerald-500/5",
      )}>
        <div className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
          status === "idle" || status === "queued" ? "bg-white/5" : bgColor,
        )}>
          <Icon className={cn("h-4 w-4", status === "idle" || status === "queued" ? "text-white/30" : color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-xs font-bold uppercase tracking-widest",
            status === "idle" || status === "queued" ? "text-white/30" : "text-white"
          )}>{name}</p>
          <p className="text-[10px] text-white/30 truncate">{system}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Card body */}
      <div className="flex-1 px-4 py-3 space-y-1.5">
        {status === "idle" || status === "queued" ? (
          <div className="flex items-center gap-2 text-xs text-white/20 py-2">
            <Clock className="h-3.5 w-3.5" />
            Waiting for dispatch…
          </div>
        ) : status === "running" ? (
          <div className="space-y-1.5">
            {fields.slice(0, 2).map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex items-center gap-2"
              >
                <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
                <span className="text-[11px] text-white/50">Retrieving {f.label}…</span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {fields.map((f) => (
              <div key={f.label} className={cn(
                "flex items-start justify-between gap-2 rounded-md px-2 py-1 transition-colors",
                f.highlight && "bg-amber-500/8 border border-amber-500/15"
              )}>
                <span className="text-[10px] text-white/40 shrink-0 w-28">{f.label}</span>
                <span className={cn(
                  "text-[11px] font-medium text-right leading-tight",
                  f.highlight ? "text-amber-300" : "text-white/80"
                )}>{f.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── SVG Topology Diagram ─────────────────────────────────────────────────────

function AgentTopology({ phase }: { phase: RunPhase }) {
  const supervisorActive = phase !== "idle";
  const agentsActive = phase === "parallel" || phase === "decision" || phase === "complete";
  const decisionActive = phase === "decision" || phase === "complete";

  return (
    <div className="relative w-full" style={{ height: 200 }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="arrow-teal" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#00c2b2" opacity="0.6" />
          </marker>
          <marker id="arrow-blue" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#3b82f6" opacity="0.6" />
          </marker>
          <marker id="arrow-emerald" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#10b981" opacity="0.6" />
          </marker>

          {/* Animated dash for running connections */}
          <style>{`
            @keyframes flowDown { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
            @keyframes flowUp { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 20; } }
            .flow-down { animation: flowDown 0.8s linear infinite; }
            .flow-up { animation: flowUp 0.8s linear infinite; }
          `}</style>
        </defs>

        {/* ── Supervisor → Agents (downward lines) ── */}
        {/* Supervisor → ERP */}
        <line x1="350" y1="62" x2="140" y2="128"
          stroke={agentsActive ? "#3b82f6" : "#1e293b"}
          strokeWidth={agentsActive ? "1.5" : "1"}
          strokeDasharray={agentsActive ? "5 3" : "3 4"}
          className={agentsActive && phase === "parallel" ? "flow-down" : ""}
          markerEnd={agentsActive ? "url(#arrow-blue)" : ""}
          opacity={agentsActive ? 0.7 : 0.2}
        />
        {/* Supervisor → WMS */}
        <line x1="350" y1="62" x2="350" y2="128"
          stroke={agentsActive ? "#f59e0b" : "#1e293b"}
          strokeWidth={agentsActive ? "1.5" : "1"}
          strokeDasharray={agentsActive ? "5 3" : "3 4"}
          className={agentsActive && phase === "parallel" ? "flow-down" : ""}
          markerEnd={agentsActive ? "url(#arrow-blue)" : ""}
          opacity={agentsActive ? 0.7 : 0.2}
        />
        {/* Supervisor → TMS */}
        <line x1="350" y1="62" x2="560" y2="128"
          stroke={agentsActive ? "#8b5cf6" : "#1e293b"}
          strokeWidth={agentsActive ? "1.5" : "1"}
          strokeDasharray={agentsActive ? "5 3" : "3 4"}
          className={agentsActive && phase === "parallel" ? "flow-down" : ""}
          markerEnd={agentsActive ? "url(#arrow-blue)" : ""}
          opacity={agentsActive ? 0.7 : 0.2}
        />

        {/* ── Agents → Decision (upward into bottom) ── */}
        {/* ERP → Decision */}
        <line x1="140" y1="168" x2="350" y2="192"
          stroke={decisionActive ? "#10b981" : "#1e293b"}
          strokeWidth={decisionActive ? "1.5" : "1"}
          strokeDasharray={decisionActive ? "5 3" : "3 4"}
          className={decisionActive && phase === "decision" ? "flow-up" : ""}
          markerEnd={decisionActive ? "url(#arrow-emerald)" : ""}
          opacity={decisionActive ? 0.7 : 0.2}
        />
        {/* WMS → Decision */}
        <line x1="350" y1="168" x2="350" y2="192"
          stroke={decisionActive ? "#10b981" : "#1e293b"}
          strokeWidth={decisionActive ? "1.5" : "1"}
          strokeDasharray={decisionActive ? "5 3" : "3 4"}
          className={decisionActive && phase === "decision" ? "flow-up" : ""}
          markerEnd={decisionActive ? "url(#arrow-emerald)" : ""}
          opacity={decisionActive ? 0.7 : 0.2}
        />
        {/* TMS → Decision */}
        <line x1="560" y1="168" x2="350" y2="192"
          stroke={decisionActive ? "#10b981" : "#1e293b"}
          strokeWidth={decisionActive ? "1.5" : "1"}
          strokeDasharray={decisionActive ? "5 3" : "3 4"}
          className={decisionActive && phase === "decision" ? "flow-up" : ""}
          markerEnd={decisionActive ? "url(#arrow-emerald)" : ""}
          opacity={decisionActive ? 0.7 : 0.2}
        />

        {/* ── SUPERVISOR NODE ── */}
        <rect x="282" y="14" width="136" height="48" rx="10"
          fill={supervisorActive ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.03)"}
          stroke={supervisorActive ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.08)"}
          strokeWidth="1.5"
        />
        {supervisorActive && (
          <rect x="282" y="14" width="136" height="48" rx="10"
            fill="none"
            stroke="rgba(16,185,129,0.3)"
            strokeWidth="2"
            className="flow-down"
            strokeDasharray="8 4"
          />
        )}
        <text x="350" y="34" textAnchor="middle" fill={supervisorActive ? "#10b981" : "#374151"} fontSize="8" fontWeight="700" letterSpacing="1.5">SUPERVISOR</text>
        <text x="350" y="50" textAnchor="middle" fill={supervisorActive ? "rgba(255,255,255,0.5)" : "#374151"} fontSize="7">Orchestration Engine</text>

        {/* ── ERP NODE ── */}
        <rect x="72" y="128" width="136" height="40" rx="8"
          fill={agentsActive ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)"}
          stroke={agentsActive ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)"}
          strokeWidth="1.5"
        />
        <text x="140" y="145" textAnchor="middle" fill={agentsActive ? "#60a5fa" : "#374151"} fontSize="8" fontWeight="700" letterSpacing="1">ERP AGENT</text>
        <text x="140" y="159" textAnchor="middle" fill={agentsActive ? "rgba(255,255,255,0.4)" : "#374151"} fontSize="7">SAP / Oracle ERP</text>

        {/* ── WMS NODE ── */}
        <rect x="282" y="128" width="136" height="40" rx="8"
          fill={agentsActive ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.03)"}
          stroke={agentsActive ? "rgba(245,158,11,0.5)" : "rgba(255,255,255,0.08)"}
          strokeWidth="1.5"
        />
        <text x="350" y="145" textAnchor="middle" fill={agentsActive ? "#fbbf24" : "#374151"} fontSize="8" fontWeight="700" letterSpacing="1">WMS AGENT</text>
        <text x="350" y="159" textAnchor="middle" fill={agentsActive ? "rgba(255,255,255,0.4)" : "#374151"} fontSize="7">Manhattan / Blue Yonder</text>

        {/* ── TMS NODE ── */}
        <rect x="492" y="128" width="136" height="40" rx="8"
          fill={agentsActive ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)"}
          stroke={agentsActive ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}
          strokeWidth="1.5"
        />
        <text x="560" y="145" textAnchor="middle" fill={agentsActive ? "#a78bfa" : "#374151"} fontSize="8" fontWeight="700" letterSpacing="1">TMS AGENT</text>
        <text x="560" y="159" textAnchor="middle" fill={agentsActive ? "rgba(255,255,255,0.4)" : "#374151"} fontSize="7">Oracle / MercuryGate</text>

        {/* ── DECISION NODE ── (bottom center, partially hidden — acts as footer indicator) */}
        <rect x="282" y="186" width="136" height="8" rx="4"
          fill={decisionActive ? "rgba(0,194,178,0.2)" : "rgba(255,255,255,0.04)"}
          stroke={decisionActive ? "rgba(0,194,178,0.6)" : "rgba(255,255,255,0.08)"}
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

// ─── Left Sidebar ─────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Network, label: "AI Orchestrator", href: "/orchestrator", active: true },
  { icon: Package, label: "Shipments", href: "/risk" },
  { icon: ShieldCheck, label: "Risk Monitor", href: "/risk" },
  { icon: Brain, label: "Agents", href: "#" },
  { icon: Plug, label: "Integrations", href: "#" },
  { icon: Settings, label: "Settings", href: "#" },
];

const INTEGRATIONS = [
  { label: "SAP ERP", color: "bg-blue-400", status: "Connected" },
  { label: "Manhattan WMS", color: "bg-amber-400", status: "Connected" },
  { label: "Oracle TMS", color: "bg-purple-400", status: "Connected" },
];

function Sidebar() {
  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-white/6" style={{ background: "#0d0f10" }}>
      {/* Brand */}
      <div className="px-4 pt-5 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2.5 mb-0.5">
          <div className="h-7 w-7 rounded-lg bg-[#00c2b2]/20 border border-[#00c2b2]/30 flex items-center justify-center shrink-0">
            <Network className="h-3.5 w-3.5 text-[#00c2b2]" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">Multi-Agent</p>
            <p className="text-[10px] text-[#00c2b2]/70 leading-tight">Orchestrator</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        <p className="text-[9px] uppercase tracking-widest text-white/20 px-2 mb-2">Platform</p>
        {NAV_ITEMS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors",
              item.active
                ? "bg-[#00c2b2]/10 text-[#00c2b2] border border-[#00c2b2]/20"
                : "text-white/40 hover:text-white/70 hover:bg-white/4"
            )}
          >
            <item.icon className="h-3.5 w-3.5 shrink-0" />
            {item.label}
            {item.active && <ChevronRight className="h-3 w-3 ml-auto" />}
          </a>
        ))}
      </nav>

      {/* Integrations status */}
      <div className="px-3 pb-4 border-t border-white/5 pt-3">
        <p className="text-[9px] uppercase tracking-widest text-white/20 mb-2">System Connections</p>
        <div className="space-y-1.5">
          {INTEGRATIONS.map((i) => (
            <div key={i.label} className="flex items-center gap-2">
              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", i.color)} />
              <span className="text-[10px] text-white/40 flex-1 truncate">{i.label}</span>
              <span className="text-[9px] text-emerald-400">{i.status}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function OrchestratorView() {
  const [query, setQuery] = useState(SCENARIOS[0].query);
  const [phase, setPhase] = useState<RunPhase>("idle");
  const [erpStatus, setErpStatus] = useState<AgentStatus>("idle");
  const [wmsStatus, setWmsStatus] = useState<AgentStatus>("idle");
  const [tmsStatus, setTmsStatus] = useState<AgentStatus>("idle");
  const [decisionStatus, setDecisionStatus] = useState<AgentStatus>("idle");
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [showDecision, setShowDecision] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startRef = useRef<number>(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  const addEvent = useCallback((event: Omit<TimelineEvent, "id" | "time">) => {
    const elapsed = Date.now() - startRef.current;
    const secs = (elapsed / 1000).toFixed(1);
    setTimeline((prev) => [
      ...prev,
      { ...event, id: `evt-${Date.now()}-${Math.random()}`, time: `+${secs}s` },
    ]);
    setTimeout(() => feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" }), 60);
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  const runOrchestration = useCallback(() => {
    clearTimers();
    setPhase("idle");
    setErpStatus("idle");
    setWmsStatus("idle");
    setTmsStatus("idle");
    setDecisionStatus("idle");
    setTimeline([]);
    setShowDecision(false);
    setElapsedMs(0);
    startRef.current = Date.now();

    // Elapsed counter
    timerIntervalRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startRef.current);
    }, 100);

    const t = (ms: number, fn: () => void) => {
      const id = setTimeout(fn, ms);
      timersRef.current.push(id);
    };

    // Supervisor activates
    t(T.supervisorStart, () => {
      setPhase("supervisor");
      addEvent({ agent: "Supervisor", agentColor: "text-emerald-400", message: "Received query — analysing intent and dispatching agents", status: "info" });
    });

    // Agents dispatched in parallel
    t(T.agentsStart, () => {
      setPhase("parallel");
      setErpStatus("running");
      setWmsStatus("running");
      setTmsStatus("running");
      addEvent({ agent: "Supervisor", agentColor: "text-emerald-400", message: "Dispatching ERP Agent → SAP ERP system", status: "running" });
      addEvent({ agent: "Supervisor", agentColor: "text-emerald-400", message: "Dispatching WMS Agent → Manhattan WMS", status: "running" });
      addEvent({ agent: "Supervisor", agentColor: "text-emerald-400", message: "Dispatching TMS Agent → Oracle TMS", status: "running" });
    });

    t(T.erpComplete, () => {
      setErpStatus("complete");
      addEvent({ agent: "ERP Agent", agentColor: "text-blue-400", message: "Returned: SO-289341 · PLATINUM · SLA Jan 15 18:00 CST", status: "success" });
    });

    t(T.wmsComplete, () => {
      setWmsStatus("complete");
      addEvent({ agent: "WMS Agent", agentColor: "text-amber-400", message: "Returned: Loading delayed 95 min · Dock 7-B equipment failure", status: "success" });
    });

    t(T.tmsComplete, () => {
      setTmsStatus("complete");
      addEvent({ agent: "TMS Agent", agentColor: "text-purple-400", message: "Returned: Departure window missed · ETA updated to 22:00 CST", status: "success" });
    });

    t(T.decisionStart, () => {
      setDecisionStatus("running");
      addEvent({ agent: "Supervisor", agentColor: "text-emerald-400", message: "All agents responded — forwarding to Decision Agent", status: "info" });
      addEvent({ agent: "Decision Agent", agentColor: "text-[#00c2b2]", message: "Merging 3 data streams · Detecting root cause…", status: "running" });
    });

    t(T.decisionComplete, () => {
      setDecisionStatus("complete");
      setPhase("decision");
      addEvent({ agent: "Decision Agent", agentColor: "text-[#00c2b2]", message: "Root cause identified · Confidence 96% · 5 recommendations generated", status: "success" });
    });

    t(T.finalResponse, () => {
      setPhase("complete");
      setShowDecision(true);
      addEvent({ agent: "Supervisor", agentColor: "text-emerald-400", message: "Response compiled — displaying unified analysis", status: "success" });
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    });
  }, [addEvent]);

  // Auto-run on mount
  useEffect(() => {
    const id = setTimeout(() => runOrchestration(), 600);
    return () => {
      clearTimeout(id);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRun = () => {
    runOrchestration();
  };

  const handleReset = () => {
    clearTimers();
    setPhase("idle");
    setErpStatus("idle");
    setWmsStatus("idle");
    setTmsStatus("idle");
    setDecisionStatus("idle");
    setTimeline([]);
    setShowDecision(false);
    setElapsedMs(0);
  };

  const isRunning = phase !== "idle" && phase !== "complete";

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "#0d0f10" }}>
      <Sidebar />

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">

        {/* Top bar */}
        <div className="shrink-0 px-6 py-3 border-b border-white/6 flex items-center gap-4" style={{ background: "#0d0f10" }}>
          <div className="flex items-center gap-2 mr-2">
            <div className={cn(
              "h-2 w-2 rounded-full",
              phase === "idle" ? "bg-white/20" :
              phase === "complete" ? "bg-emerald-400" : "bg-blue-400 animate-pulse"
            )} />
            <span className="text-xs text-white/40 font-medium uppercase tracking-widest">
              {phase === "idle" ? "Idle" : phase === "complete" ? "Complete" : "Orchestrating"}
            </span>
          </div>
          {phase !== "idle" && (
            <span className="text-[10px] font-mono text-white/20">
              {(elapsedMs / 1000).toFixed(1)}s
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => { setQuery(s.query); }}
                className={cn(
                  "text-[10px] px-2.5 py-1 rounded-full border transition-colors",
                  query === s.query
                    ? "border-[#00c2b2]/40 text-[#00c2b2] bg-[#00c2b2]/8"
                    : "border-white/10 text-white/30 hover:border-white/20 hover:text-white/50"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content grid */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">

          {/* ── Query Bar ── */}
          <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: "#111416" }}>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
              <span className="text-[9px] uppercase tracking-widest text-white/25">User Query</span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] text-emerald-400/70">Supervisor Agent active</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-emerald-400" />
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRun()}
                placeholder="Ask a business question…"
                disabled={isRunning}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none disabled:opacity-60"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="h-8 w-8 rounded-lg border border-white/8 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleRun}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00c2b2] text-white text-xs font-semibold hover:bg-[#00a89a] transition-colors disabled:opacity-40"
                >
                  {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  {isRunning ? "Running…" : "Run"}
                </button>
              </div>
            </div>
          </div>

          {/* ── Topology + Activity Feed ── */}
          <div className="grid grid-cols-[1fr_300px] gap-4">
            {/* Topology diagram */}
            <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: "#111416" }}>
              <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
                <GitBranch className="h-3.5 w-3.5 text-white/30" />
                <span className="text-[10px] uppercase tracking-widest text-white/30">Agent Workflow</span>
                {isRunning && (
                  <span className="ml-auto text-[10px] text-blue-300 flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Agents working in parallel
                  </span>
                )}
                {phase === "complete" && (
                  <span className="ml-auto text-[10px] text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3" />
                    Workflow complete
                  </span>
                )}
              </div>
              <div className="px-4">
                <AgentTopology phase={phase} />
              </div>
              {/* Parallel indicator */}
              {(phase === "parallel") && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mx-4 mb-3 px-3 py-2 rounded-lg bg-blue-500/8 border border-blue-500/20 flex items-center gap-2"
                >
                  <Activity className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span className="text-xs text-blue-300">ERP · WMS · TMS agents executing simultaneously</span>
                </motion.div>
              )}
              {phase === "decision" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mx-4 mb-3 px-3 py-2 rounded-lg bg-[#00c2b2]/8 border border-[#00c2b2]/20 flex items-center gap-2"
                >
                  <Brain className="h-3.5 w-3.5 text-[#00c2b2] shrink-0 animate-pulse" />
                  <span className="text-xs text-[#00c2b2]">Decision Agent reasoning over merged data streams…</span>
                </motion.div>
              )}
            </div>

            {/* Live activity feed */}
            <div className="rounded-xl border border-white/8 flex flex-col overflow-hidden" style={{ background: "#111416" }}>
              <div className="px-3 py-2.5 border-b border-white/5 flex items-center gap-2 shrink-0">
                <Activity className="h-3.5 w-3.5 text-white/30" />
                <span className="text-[10px] uppercase tracking-widest text-white/30">Live Activity</span>
                {isRunning && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />}
              </div>
              <div
                ref={feedRef}
                className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 min-h-0"
                style={{ maxHeight: 220 }}
              >
                <AnimatePresence initial={false}>
                  {timeline.length === 0 && (
                    <p className="text-[11px] text-white/20 py-4 text-center">Waiting for query…</p>
                  )}
                  {timeline.map((evt) => (
                    <motion.div
                      key={evt.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2"
                    >
                      <span className={cn(
                        "mt-0.5 h-1.5 w-1.5 rounded-full shrink-0",
                        evt.status === "success" ? "bg-emerald-400" :
                        evt.status === "running" ? "bg-blue-400 animate-pulse" :
                        "bg-white/30"
                      )} />
                      <div className="flex-1 min-w-0">
                        <span className={cn("text-[10px] font-semibold mr-1", evt.agentColor)}>{evt.agent}</span>
                        <span className="text-[10px] text-white/50 leading-relaxed">{evt.message}</span>
                      </div>
                      <span className="text-[9px] text-white/20 shrink-0 mt-0.5 font-mono">{evt.time}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── Agent Data Cards ── */}
          <div className="grid grid-cols-3 gap-4">
            <AgentCard
              name="ERP Agent"
              icon={Database}
              color="text-blue-400"
              borderColor="border-blue-500/40"
              bgColor="bg-blue-500/8"
              status={erpStatus}
              system="SAP ERP · Oracle ERP"
              delay={T.agentsStart}
              fields={[
                { label: "Sales Order", value: MOCK_ERP.salesOrder },
                { label: "Customer", value: MOCK_ERP.customer },
                { label: "Priority", value: MOCK_ERP.customerPriority, highlight: true },
                { label: "Shipment Value", value: MOCK_ERP.shipmentValue },
                { label: "Delivery SLA", value: MOCK_ERP.deliverySLA, highlight: true },
                { label: "Order Status", value: MOCK_ERP.orderStatus },
              ]}
            />
            <AgentCard
              name="WMS Agent"
              icon={Package}
              color="text-amber-400"
              borderColor="border-amber-500/40"
              bgColor="bg-amber-500/8"
              status={wmsStatus}
              system="Manhattan WMS · Blue Yonder"
              delay={T.agentsStart}
              fields={[
                { label: "Picking", value: MOCK_WMS.pickingStatus },
                { label: "Packing", value: MOCK_WMS.packingStatus },
                { label: "Loading", value: MOCK_WMS.loadingStatus, highlight: true },
                { label: "Dock", value: MOCK_WMS.dockAssignment },
                { label: "Delay", value: MOCK_WMS.warehouseDelay, highlight: true },
                { label: "Exception", value: MOCK_WMS.exceptions[0] },
              ]}
            />
            <AgentCard
              name="TMS Agent"
              icon={Truck}
              color="text-purple-400"
              borderColor="border-purple-500/40"
              bgColor="bg-purple-500/8"
              status={tmsStatus}
              system="Oracle TMS · MercuryGate"
              delay={T.agentsStart}
              fields={[
                { label: "Carrier", value: MOCK_TMS.carrier },
                { label: "Driver", value: MOCK_TMS.driver },
                { label: "Route", value: MOCK_TMS.plannedRoute },
                { label: "Vehicle Status", value: MOCK_TMS.vehicleStatus, highlight: true },
                { label: "New ETA", value: MOCK_TMS.eta, highlight: true },
                { label: "Delay Event", value: MOCK_TMS.delayEvents[0] },
              ]}
            />
          </div>

          {/* ── Decision Agent ── */}
          <div className={cn(
            "rounded-xl border overflow-hidden transition-all duration-500",
            decisionStatus === "running" && "border-[#00c2b2]/30 shadow-[0_0_30px_rgba(0,194,178,0.08)]",
            decisionStatus === "complete" && "border-[#00c2b2]/25",
            decisionStatus === "idle" || decisionStatus === "queued" ? "border-white/8" : ""
          )} style={{ background: "#111416" }}>
            {/* Header */}
            <div className={cn(
              "flex items-center gap-3 px-4 py-3 border-b border-white/5",
              decisionStatus === "running" && "bg-[#00c2b2]/8",
              decisionStatus === "complete" && "bg-[#00c2b2]/5",
            )}>
              <div className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                decisionStatus === "idle" ? "bg-white/5" : "bg-[#00c2b2]/15 border border-[#00c2b2]/25"
              )}>
                <Brain className={cn("h-4.5 w-4.5",
                  decisionStatus === "idle" ? "h-4 w-4 text-white/20" : "h-4 w-4 text-[#00c2b2]",
                  decisionStatus === "running" && "animate-pulse"
                )} />
              </div>
              <div>
                <p className={cn("text-xs font-bold uppercase tracking-widest",
                  decisionStatus === "idle" ? "text-white/25" : "text-white"
                )}>Decision Agent</p>
                <p className="text-[10px] text-white/30">Reasoning · Root Cause · Recommendations</p>
              </div>
              <div className="ml-auto flex items-center gap-3">
                {decisionStatus === "complete" && (
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-[10px] text-white/40">Confidence</p>
                      <p className="text-sm font-bold text-[#00c2b2]">{MOCK_DECISION.confidence}%</p>
                    </div>
                    <div className="w-12 h-12 relative flex items-center justify-center">
                      <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="15" fill="none"
                          stroke="#00c2b2" strokeWidth="3"
                          strokeDasharray={`${MOCK_DECISION.confidence * 0.942} 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                )}
                <StatusBadge status={decisionStatus} />
              </div>
            </div>

            {/* Body */}
            <AnimatePresence>
              {decisionStatus === "idle" && (
                <div className="px-4 py-5 flex items-center gap-2 text-white/20">
                  <Clock className="h-4 w-4" />
                  <p className="text-xs">Waiting for ERP · WMS · TMS agents to complete…</p>
                </div>
              )}
              {decisionStatus === "running" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 py-4 space-y-2"
                >
                  {[
                    "Merging ERP + WMS + TMS data streams…",
                    "Identifying root cause pattern…",
                    "Calculating downstream business impact…",
                    "Prioritising by customer SLA tier…",
                    "Generating recommended actions…",
                  ].map((step, i) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.4 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="h-3 w-3 text-[#00c2b2] animate-spin shrink-0" />
                      <span className="text-xs text-white/50">{step}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
              {showDecision && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="p-4"
                >
                  <div className="grid grid-cols-[1fr_1fr_1.4fr] gap-4 mb-4">
                    {/* Root Cause */}
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-red-400">Root Cause</p>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed">{MOCK_DECISION.rootCause}</p>
                    </div>
                    {/* Business Impact */}
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="h-4 w-4 text-amber-400 shrink-0" />
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">Business Impact</p>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed">{MOCK_DECISION.businessImpact}</p>
                    </div>
                    {/* Recommendations */}
                    <div className="rounded-xl border border-[#00c2b2]/20 bg-[#00c2b2]/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-[#00c2b2] shrink-0" />
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#00c2b2]">Recommended Actions</p>
                      </div>
                      <div className="space-y-1.5">
                        {MOCK_DECISION.recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-[#00c2b2] shrink-0 text-xs mt-px">{i + 1}.</span>
                            <p className="text-xs text-white/70 leading-snug">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Incident Timeline */}
                  <div className="rounded-xl border border-white/8 bg-white/2 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-3.5 w-3.5 text-white/30" />
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Incident Timeline — SHP-1024</p>
                    </div>
                    <div className="flex items-center gap-3 overflow-x-auto pb-1">
                      {MOCK_DECISION.timeline.map((evt, i) => (
                        <div key={i} className="flex items-center gap-3 shrink-0">
                          <div className="flex flex-col items-center gap-1">
                            <div className={cn(
                              "h-2.5 w-2.5 rounded-full border-2",
                              evt.severity === "ok" && "bg-emerald-400 border-emerald-400",
                              evt.severity === "error" && "bg-red-400 border-red-400",
                              evt.severity === "warn" && "bg-amber-400 border-amber-400",
                              evt.severity === "info" && "bg-blue-400 border-blue-400",
                            )} />
                            <div className="text-center">
                              <p className="text-[9px] font-mono text-white/40">{evt.time}</p>
                              <p className="text-[10px] text-white/60 w-24 text-center leading-tight">{evt.event}</p>
                            </div>
                          </div>
                          {i < MOCK_DECISION.timeline.length - 1 && (
                            <div className={cn(
                              "h-px w-8 shrink-0 -mt-6",
                              evt.severity === "error" ? "bg-red-400/40" : "bg-white/10"
                            )} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 mt-3">
                    <p className="text-[10px] text-white/25 mr-1">Execute actions:</p>
                    {[
                      { label: "Notify Customer", color: "bg-blue-600 hover:bg-blue-500" },
                      { label: "Reassign Dock", color: "bg-amber-600 hover:bg-amber-500" },
                      { label: "Update ETA", color: "bg-[#00c2b2] hover:bg-[#00a89a]" },
                      { label: "Escalate Issue", color: "bg-red-600 hover:bg-red-500" },
                    ].map((a) => (
                      <button key={a.label} className={cn(
                        "text-xs px-3 py-1.5 rounded-lg text-white font-medium transition-colors", a.color
                      )}>
                        {a.label}
                      </button>
                    ))}
                    <span className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Analysis complete · {(T.finalResponse / 1000).toFixed(1)}s end-to-end
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* bottom padding */}
          <div className="h-2" />
        </div>
      </div>
    </div>
  );
}
