"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Square, RotateCcw, Search, CheckCircle, Loader2, AlertTriangle,
  Zap, Shield, Activity, Package, Truck, Warehouse, Globe, Wifi,
  Brain, ArrowRight, TrendingUp, Clock, Database, Radio,
  CloudRain, ChevronRight, RefreshCw, Eye, Lock, Server,
  AlertCircle, BarChart3, Map, FileText, Layers, Target
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

type AgentStatus = "idle" | "queued" | "running" | "complete" | "error";

interface AgentStep { label: string; duration: number; log: string; }

interface Agent {
  id: string; name: string; role: string; color: string;
  Icon: React.ComponentType<{ className?: string }>;
  steps: AgentStep[];
  status: AgentStatus; currentStep: number; progress: number; logs: string[];
  startDelay: number;
}

// ─── Enterprise Systems ─────────────────────────────────────────────────────

const SYSTEMS = [
  { id: "erp", label: "SAP S/4HANA", type: "ERP", color: "#3b82f6", icon: Database, status: "connected", latency: 145, sync: "2s ago", health: 99 },
  { id: "wms", label: "Manhattan WMS", type: "WMS", color: "#f59e0b", icon: Warehouse, status: "connected", latency: 212, sync: "4s ago", health: 97 },
  { id: "tms", label: "Oracle TMS", type: "TMS", color: "#10b981", icon: Truck, status: "connected", latency: 178, sync: "1s ago", health: 98 },
  { id: "edi", label: "EDI Gateway", type: "EDI", color: "#f97316", icon: FileText, status: "connected", latency: 203, sync: "6s ago", health: 96 },
  { id: "iot", label: "IoT Devices", type: "IoT", color: "#8b5cf6", icon: Radio, status: "partial", latency: 88, sync: "12s ago", health: 81 },
  { id: "carrier", label: "FedEx / DHL", type: "Carrier", color: "#ec4899", icon: Globe, status: "connected", latency: 156, sync: "3s ago", health: 99 },
  { id: "weather", label: "Weather Intel", type: "Weather", color: "#06b6d4", icon: CloudRain, status: "connected", latency: 67, sync: "30s ago", health: 100 },
  { id: "risk", label: "Risk Intelligence", type: "Risk", color: "#ef4444", icon: Shield, status: "connected", latency: 112, sync: "8s ago", health: 95 },
  { id: "bi", label: "Power BI / Tableau", type: "BI", color: "#8b5cf6", icon: BarChart3, status: "connected", latency: 134, sync: "15s ago", health: 98 },
  { id: "slack", label: "Slack", type: "Slack", color: "#4A154B", icon: Radio, status: "connected", latency: 42, sync: "1s ago", health: 100 },
];

// ─── KPI Widgets ───────────────────────────────────────────────────────────

const KPI = [
  { label: "Active Shipments", value: "847", sub: "+12 today", color: "#3b82f6", Icon: Package },
  { label: "Visibility Score", value: "94%", sub: "↑2 pts", color: "#00c2b2", Icon: Eye },
  { label: "Security Score", value: "91%", sub: "All secure", color: "#10b981", Icon: Shield },
  { label: "Risk Score", value: "Medium", sub: "3 critical", color: "#f59e0b", Icon: AlertTriangle },
  { label: "Connected Systems", value: "8/8", sub: "1 partial", color: "#8b5cf6", Icon: Wifi },
  { label: "Running Agents", value: "6", sub: "Autonomous", color: "#00c2b2", Icon: Brain },
  { label: "API Health", value: "98.4%", sub: "187ms avg", color: "#6366f1", Icon: Activity },
  { label: "Critical Alerts", value: "3", sub: "↓2 resolved", color: "#ef4444", Icon: AlertCircle },
];

// ─── Agent Definitions ─────────────────────────────────────────────────────

function buildAgents(): Agent[] {
  return [
    {
      id: "erp", name: "ERP Agent", role: "SAP S/4HANA · Order Intelligence",
      color: "#3b82f6", Icon: Database, startDelay: 0,
      status: "idle", currentStep: 0, progress: 0, logs: [],
      steps: [
        { label: "Authenticating OAuth2", duration: 550, log: "[AUTH] Bearer token acquired — SAP S/4HANA" },
        { label: "GET /salesOrders/SO-289341", duration: 620, log: "[200] Order retrieved — PLATINUM · $284,500" },
        { label: "GET /inventory/PHARM-4421", duration: 480, log: "[200] Inventory: 240 units · Bin B7-C12" },
        { label: "Validating SLA contract", duration: 380, log: "[WARN] SLA deadline: 06:00 CST — breach risk 98%" },
        { label: "Context packaged → Supervisor", duration: 300, log: "[✓] ERP context ready — 12 fields" },
      ],
    },
    {
      id: "wms", name: "WMS Agent", role: "Manhattan · Warehouse Ops",
      color: "#f59e0b", Icon: Warehouse, startDelay: 200,
      status: "idle", currentStep: 0, progress: 0, logs: [],
      steps: [
        { label: "Authenticating Bearer", duration: 480, log: "[AUTH] Manhattan WMS — CHI-001 connected" },
        { label: "GET /warehouse/orders/SO-289341", duration: 580, log: "[200] Picking COMPLETE · Packing COMPLETE" },
        { label: "Checking dock assignment", duration: 440, log: "[ALERT] Dock 7-B FAULT — forklift malfunction" },
        { label: "Fetching exceptions", duration: 360, log: "[WARN] Loading delayed 95 min — Dock 9-A available" },
        { label: "Context packaged → Supervisor", duration: 280, log: "[✓] WMS context ready — delay confirmed" },
      ],
    },
    {
      id: "tms", name: "TMS Agent", role: "Oracle TMS · Live Shipment",
      color: "#10b981", Icon: Truck, startDelay: 400,
      status: "idle", currentStep: 0, progress: 0, logs: [],
      steps: [
        { label: "Authenticating API Key", duration: 420, log: "[AUTH] Oracle TMS — production token validated" },
        { label: "GET /shipments/SHP-1024", duration: 560, log: "[200] Swift Logistics · James Rodriguez" },
        { label: "GET /tracking/SHP-1024/live", duration: 480, log: "[200] GPS: Chicago WH · ETA +240 min" },
        { label: "Analysing route & traffic", duration: 380, log: "[INFO] No alternate route — highway clear" },
        { label: "Context packaged → Supervisor", duration: 260, log: "[✓] TMS context ready — ETA revised 22:00 CST" },
      ],
    },
    {
      id: "edi", name: "EDI Agent", role: "Transaction Gateway · X12",
      color: "#f97316", Icon: FileText, startDelay: 600,
      status: "idle", currentStep: 0, progress: 0, logs: [],
      steps: [
        { label: "Auth AS2 middleware", duration: 440, log: "[AS2] Handshake — NEXUS-PHARMA partner connected" },
        { label: "Receiving X12-214 Status", duration: 540, log: "[214] Shipment status AG — Picked up" },
        { label: "Processing X12-856 ASN", duration: 460, log: "[856] ASN parsed — 240 units · LOT-2024-001" },
        { label: "Generating X12-810 Invoice", duration: 380, log: "[810] Invoice $284,500 · 997 ACK sent" },
        { label: "Context packaged → Supervisor", duration: 260, log: "[✓] EDI context ready — 4 transactions" },
      ],
    },
    {
      id: "visibility", name: "Visibility Agent", role: "Unified Shipment Intelligence",
      color: "#00c2b2", Icon: Eye, startDelay: 3100,
      status: "idle", currentStep: 0, progress: 0, logs: [],
      steps: [
        { label: "Aggregating all enterprise context", duration: 700, log: "[MERGE] ERP + WMS + TMS + EDI + Carrier + IoT" },
        { label: "Correlating data inconsistencies", duration: 580, log: "[ALERT] Dock delay → ETA conflict detected" },
        { label: "Building shipment digital twin", duration: 680, log: "[TWIN] 18-field unified context constructed" },
        { label: "Scoring visibility confidence", duration: 380, log: "[✓] Visibility: 94% · Security: 91% · Risk: 87" },
      ],
    },
    {
      id: "decision", name: "Decision Agent", role: "AI Reasoning · Root Cause · Actions",
      color: "#ef4444", Icon: Brain, startDelay: 5600,
      status: "idle", currentStep: 0, progress: 0, logs: [],
      steps: [
        { label: "Merging enterprise intelligence", duration: 640, log: "[REASON] 6-source context loaded" },
        { label: "Root cause analysis", duration: 720, log: "[ROOT] Dock 7-B equipment failure → cascade" },
        { label: "Predicting downstream impact", duration: 580, log: "[IMPACT] $28,450 exposure · 3 orders at risk" },
        { label: "Generating recommendations", duration: 680, log: "[✓] 4 actions · 96% confidence" },
        { label: "Publishing decision → Action Agent", duration: 320, log: "[✓] Decision published — awaiting approval" },
      ],
    },
    {
      id: "action", name: "Resolution Agent", role: "Execution · Notifications · Slack Alerts",
      color: "#4A154B", Icon: Zap, startDelay: 8600,
      status: "idle", currentStep: 0, progress: 0, logs: [],
      steps: [
        { label: "Receiving decision context", duration: 480, log: "[RECV] 4 recommendations · 96% confidence" },
        { label: "Execute: Reassign Dock 9-A", duration: 620, log: "[WMS] PUT /dock/reassign → 200 OK" },
        { label: "Execute: Update ETA across systems", duration: 540, log: "[TMS+WMS] ETA 22:00 CST synced" },
        { label: "Execute: Notify Nexus Pharma", duration: 460, log: "[ERP] Customer notified — revised ETA sent" },
        { label: "Slack DM → Investigation Officer", duration: 520, log: "[SLACK] DM → J.Martinez · SHP-1024 resolved" },
        { label: "Post to #risk-alerts channel", duration: 380, log: "[SLACK] #risk-alerts notified · 3 subscribers" },
      ],
    },
  ];
}

const STEP_MS = 560;

// ─── Unified Shipment Fields ────────────────────────────────────────────────

const UNIFIED_FIELDS = [
  { group: "Order", icon: Package, color: "#3b82f6", rows: [
    { label: "Order", value: "SO-289341", source: "ERP" },
    { label: "Customer", value: "Nexus Pharmaceuticals", source: "ERP", highlight: "PLATINUM" },
    { label: "PO Number", value: "PO-NP-2024-0421", source: "EDI" },
    { label: "Priority", value: "CRITICAL", source: "ERP", alert: true },
    { label: "SLA Deadline", value: "Jan 16, 06:00 CST", source: "ERP", alert: true },
  ]},
  { group: "Product", icon: Layers, color: "#8b5cf6", rows: [
    { label: "SKU", value: "PHARM-4421", source: "ERP" },
    { label: "Description", value: "Recombinant Human Insulin 100IU", source: "ERP" },
    { label: "Quantity", value: "240 vials", source: "WMS" },
    { label: "Hazmat", value: "Class 6.1 · UN2810", source: "ERP", alert: true },
    { label: "Temperature", value: "2–8°C · Cold Chain", source: "IoT" },
  ]},
  { group: "Warehouse", icon: Warehouse, color: "#f59e0b", rows: [
    { label: "Facility", value: "Chicago Central WH", source: "WMS" },
    { label: "Picking", value: "Complete", source: "WMS" },
    { label: "Dock", value: "Dock 7-B — FAULT", source: "WMS", alert: true },
    { label: "Delay", value: "95 min", source: "WMS", alert: true },
    { label: "Alternative", value: "Dock 9-A — Available", source: "WMS" },
  ]},
  { group: "Transport", icon: Truck, color: "#10b981", rows: [
    { label: "Carrier", value: "Swift Logistics", source: "TMS" },
    { label: "Driver", value: "James Rodriguez", source: "TMS" },
    { label: "Route", value: "Chicago → Nashville DC", source: "TMS" },
    { label: "Original ETA", value: "Jan 15, 18:00 CST", source: "TMS" },
    { label: "Revised ETA", value: "Jan 15, 22:00 CST (+4h)", source: "TMS", alert: true },
  ]},
  { group: "Risk & Security", icon: Shield, color: "#ef4444", rows: [
    { label: "Risk Score", value: "87 / 100 — HIGH", source: "Risk Intel", alert: true },
    { label: "Security Events", value: "None detected", source: "IoT" },
    { label: "Financial Exposure", value: "$28,450", source: "ERP", alert: true },
    { label: "Downstream Impact", value: "3 orders at risk", source: "Decision" },
    { label: "SLA Breach Probability", value: "98%", source: "Decision", alert: true },
  ]},
];

// ─── Decision Output ────────────────────────────────────────────────────────

const RECOMMENDATIONS = [
  { rank: 1, action: "Reassign to Dock 9-A", detail: "Move load immediately — forklift operational, no delay", urgency: "IMMEDIATE", confidence: 97, agent: "Action Agent", method: "PUT", system: "WMS" },
  { rank: 2, action: "Notify Nexus Pharma", detail: "Alert PLATINUM customer — ETA revised 22:00 CST", urgency: "HIGH", confidence: 99, agent: "Action Agent", method: "POST", system: "ERP" },
  { rank: 3, action: "Sync ETA across systems", detail: "Update Oracle TMS + Manhattan WMS with revised ETA", urgency: "HIGH", confidence: 98, agent: "Action Agent", method: "PUT", system: "TMS/WMS" },
  { rank: 4, action: "Escalate Dock 7-B failure", detail: "Report equipment fault to facility ops + maintenance", urgency: "MEDIUM", confidence: 94, agent: "Action Agent", method: "POST", system: "WMS" },
];

const CROSS_ACTIONS = [
  { label: "Update ETA", method: "PUT", color: "#10b981", system: "TMS" },
  { label: "Notify Customer", method: "POST", color: "#3b82f6", system: "ERP" },
  { label: "Reassign Dock", method: "PUT", color: "#f59e0b", system: "WMS" },
  { label: "Create Incident", method: "POST", color: "#ef4444", system: "ERP" },
  { label: "Update WMS", method: "PATCH", color: "#f59e0b", system: "WMS" },
  { label: "Send EDI 214", method: "POST", color: "#f97316", system: "EDI" },
  { label: "Generate Report", method: "GET", color: "#8b5cf6", system: "BI" },
  { label: "Slack #risk-alerts", method: "POST", color: "#4A154B", system: "Slack" },
  { label: "Slack DM Officer", method: "POST", color: "#4A154B", system: "Slack" },
  { label: "Auto-Execute All", method: "POST", color: "#00c2b2", system: "ALL", primary: true },
];

// ─── SaaS Evolution Banner ─────────────────────────────────────────────────

const EVOLUTION = [
  { label: "Record Keeping", sub: "1990s ERP", done: true },
  { label: "Reporting", sub: "2000s BI", done: true },
  { label: "Real-Time Alerts", sub: "2010s SCM", done: true },
  { label: "AI Decision OS", sub: "Now — Overhaul", done: false, active: true },
];

// ─── Component ─────────────────────────────────────────────────────────────

export function CTEcosystemStudio({ onToast }: { onToast: (m: string) => void }) {
  const [agents, setAgents] = useState<Agent[]>(buildAgents());
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [shipmentId, setShipmentId] = useState("SHP-1024");
  const [showUnified, setShowUnified] = useState(false);
  const [showDecision, setShowDecision] = useState(false);
  const [executedActions, setExecutedActions] = useState<Set<string>>(new Set());
  const [auditLog, setAuditLog] = useState<{ ts: string; msg: string; color: string }[]>([]);
  const [activeSystem, setActiveSystem] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    if (ivRef.current) clearInterval(ivRef.current);
  }, []);

  const addAudit = (msg: string, color = "#00c2b2") => {
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setAuditLog(prev => [{ ts, msg, color }, ...prev].slice(0, 30));
  };

  const reset = useCallback(() => {
    timers.current.forEach(clearTimeout);
    if (ivRef.current) clearInterval(ivRef.current);
    setAgents(buildAgents());
    setRunning(false);
    setElapsed(0);
    setShowUnified(false);
    setShowDecision(false);
    setExecutedActions(new Set());
    setAuditLog([]);
    setActiveSystem(null);
  }, []);

  const startInvestigation = useCallback(() => {
    reset();
    setTimeout(() => {
      setRunning(true);
      addAudit(`▶ Investigation started — ${shipmentId}`, "#00c2b2");
      const start = Date.now();
      ivRef.current = setInterval(() => setElapsed(Date.now() - start), 100);

      const freshAgents = buildAgents();

      freshAgents.forEach(agent => {
        // Queue
        timers.current.push(setTimeout(() => {
          setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: "queued" } : a));
        }, agent.startDelay));

        // Each step
        agent.steps.forEach((step, i) => {
          const t = agent.startDelay + 120 + i * STEP_MS;
          timers.current.push(setTimeout(() => {
            const progress = Math.round(((i + 1) / agent.steps.length) * 100);
            setAgents(prev => prev.map(a => a.id === agent.id ? {
              ...a,
              status: "running",
              currentStep: i,
              progress,
              logs: [...a.logs, step.log],
            } : a));
            setActiveSystem(agent.id);
          }, t));
        });

        // Complete
        const completeAt = agent.startDelay + 120 + agent.steps.length * STEP_MS;
        timers.current.push(setTimeout(() => {
          setAgents(prev => prev.map(a => a.id === agent.id ? {
            ...a, status: "complete", progress: 100,
            logs: [...a.logs, `[✓] ${agent.name} complete`],
          } : a));
          addAudit(`✓ ${agent.name} complete`, agent.color);
        }, completeAt));
      });

      // Show unified view after visibility agent
      const visTotal = 3100 + 120 + 4 * STEP_MS + 400;
      timers.current.push(setTimeout(() => {
        setShowUnified(true);
        addAudit("◈ Unified Shipment Digital Twin constructed", "#00c2b2");
      }, visTotal));

      // Show decision panel
      const decTotal = 5600 + 120 + 5 * STEP_MS + 400;
      timers.current.push(setTimeout(() => {
        setShowDecision(true);
        addAudit("⬡ Decision Agent — 4 recommendations ready · 96% confidence", "#ef4444");
      }, decTotal));

      // Slack alerts after Resolution Agent completes
      const slackDMAt = 8600 + 120 + 5 * STEP_MS + 200;
      timers.current.push(setTimeout(() => {
        addAudit("📩 Slack DM → J.Martinez (Investigation Officer) · SHP-1024 dock issue resolved", "#4A154B");
      }, slackDMAt));
      const slackChanAt = 8600 + 120 + 6 * STEP_MS + 200;
      timers.current.push(setTimeout(() => {
        addAudit("📢 Slack #risk-alerts → SHP-1024 resolved · Dock 9-A active · ETA 22:00 CST", "#4A154B");
        if (ivRef.current) clearInterval(ivRef.current);
        setRunning(false);
        onToast("Resolution complete — Slack alerts sent to investigation officer");
      }, slackChanAt));
    }, 50);
  }, [reset, shipmentId, onToast]);

  const executeAction = (label: string, color: string) => {
    setExecutedActions(prev => new Set([...prev, label]));
    if (label === "Slack #risk-alerts") {
      addAudit("📢 Slack #risk-alerts → SHP-1024 alert posted · 3 subscribers notified", "#4A154B");
      onToast("Slack alert posted to #risk-alerts");
    } else if (label === "Slack DM Officer") {
      addAudit("📩 Slack DM → J.Martinez (Investigation Officer) · Immediate action required on SHP-1024", "#4A154B");
      onToast("Slack DM sent to Investigation Officer");
    } else {
      addAudit(`⚡ ${label} — executed by Action Agent`, color);
      onToast(`${label} executed successfully`);
    }
  };

  const allDone = agents.every(a => a.status === "complete");
  const completedCount = agents.filter(a => a.status === "complete").length;

  return (
    <div className="p-5 space-y-4 min-h-full">

      {/* ── SaaS Evolution Banner ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-base font-bold text-white">AI Ecosystem Studio</h1>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#00c2b2]/15 text-[#00c2b2] border border-[#00c2b2]/25 font-semibold uppercase tracking-widest">Agentic</span>
          </div>
          <p className="text-[11px] text-white/35">End-to-end supply chain visibility · Autonomous AI agents · Cross-system intelligence</p>
        </div>
        {/* Evolution tracker */}
        <div className="flex items-center gap-0 rounded-xl border border-white/6 overflow-hidden" style={{ background: '#111416' }}>
          {EVOLUTION.map((e, i) => (
            <div key={e.label} className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-center relative",
              e.active ? "bg-[#00c2b2]/10" : ""
            )}>
              {i > 0 && <ChevronRight className="absolute -left-1.5 h-3 w-3 text-white/15 shrink-0" />}
              <div>
                <p className={cn("text-[9px] font-semibold", e.active ? "text-[#00c2b2]" : e.done ? "text-white/40" : "text-white/20")}>{e.label}</p>
                <p className="text-[8px] text-white/20">{e.sub}</p>
              </div>
              {e.active && <Zap className="h-3 w-3 text-[#00c2b2] animate-pulse shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* ── KPI Bar ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-8 gap-2">
        {KPI.map(k => (
          <div key={k.label} className="rounded-xl border border-white/6 px-3 py-2.5 hover:border-white/10 transition-colors" style={{ background: '#111416' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <k.Icon className="h-3 w-3 shrink-0" style={{ color: k.color }} />
              <p className="text-[8px] text-white/30 uppercase tracking-wide truncate">{k.label}</p>
            </div>
            <p className="text-sm font-bold text-white leading-none">{k.value}</p>
            <p className="text-[9px] text-white/25 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Investigation Bar ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#00c2b2]/20 overflow-hidden" style={{ background: '#0d1a18' }}>
        <div className="px-5 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Target className="h-4 w-4 text-[#00c2b2]" />
            <span className="text-sm font-bold text-white">Start Investigation</span>
          </div>
          <div className="flex-1 flex items-center gap-2">
            {["Shipment ID", "Order No", "PO Number", "SKU", "Container"].map((ph, i) => (
              <input key={ph}
                value={i === 0 ? shipmentId : i === 1 ? "SO-289341" : i === 2 ? "PO-NP-2024-0421" : i === 3 ? "PHARM-4421" : "CSNU6204551"}
                onChange={i === 0 ? e => setShipmentId(e.target.value) : undefined}
                readOnly={i !== 0}
                placeholder={ph}
                className="flex-1 px-3 h-8 rounded-lg bg-white/5 border border-white/8 text-xs text-white/70 placeholder-white/25 outline-none focus:border-[#00c2b2]/40 font-mono transition-colors" />
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {running && (
              <button onClick={reset} className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs border border-white/10 text-white/40 hover:text-white transition-all">
                <Square className="h-3 w-3" /> Stop
              </button>
            )}
            <button onClick={reset} disabled={running} className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs border border-white/10 text-white/40 hover:text-white transition-all disabled:opacity-30">
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
            <button onClick={startInvestigation} disabled={running}
              className="flex items-center gap-2 h-8 px-5 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
              style={running ? { background: '#00c2b220', color: '#00c2b2', border: '1px solid #00c2b230' } : { background: '#00c2b2', color: '#000' }}>
              {running ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Investigating...</> : <><Play className="h-3.5 w-3.5" /> Launch All Agents</>}
            </button>
          </div>
          {running && (
            <div className="flex items-center gap-2 shrink-0">
              <Clock className="h-3 w-3 text-white/30" />
              <span className="text-xs font-mono text-white/40">{(elapsed / 1000).toFixed(1)}s</span>
              <span className="text-[10px] text-white/30">{completedCount}/7 agents</span>
            </div>
          )}
          {allDone && !running && (
            <div className="flex items-center gap-1.5 text-emerald-400 shrink-0">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Complete</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Main 3-column ─────────────────────────────────────────────── */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '200px 1fr 288px' }}>

        {/* LEFT: Enterprise Systems */}
        <div className="space-y-2">
          <p className="text-[9px] text-white/25 uppercase tracking-widest px-1 font-semibold">Enterprise Systems</p>
          {SYSTEMS.map(sys => {
            const agentActive = agents.find(a => a.id === sys.id && (a.status === "running" || a.status === "queued"));
            const agentDone = agents.find(a => a.id === sys.id && a.status === "complete");
            return (
              <motion.div key={sys.id}
                animate={agentActive ? { borderColor: sys.color + '50' } : {}}
                className="rounded-xl border border-white/6 px-3 py-2.5 transition-all cursor-pointer hover:border-white/10"
                style={{ background: agentDone ? sys.color + '08' : '#111416', borderColor: agentActive ? sys.color + '40' : undefined }}
                onClick={() => setActiveSystem(activeSystem === sys.id ? null : sys.id)}>
                <div className="flex items-center gap-2 mb-1.5">
                  <sys.icon className="h-3.5 w-3.5 shrink-0" style={{ color: sys.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-white/80 truncate">{sys.label}</p>
                    <p className="text-[8px] text-white/25">{sys.type}</p>
                  </div>
                  <div className={cn("h-2 w-2 rounded-full shrink-0",
                    agentActive ? "animate-pulse" : "",
                    agentDone ? "bg-emerald-400" : sys.status === "connected" ? "bg-emerald-400" : "bg-amber-400"
                  )} />
                </div>
                <div className="space-y-0.5">
                  {[
                    { k: "Latency", v: `${sys.latency}ms`, alert: sys.latency > 200 },
                    { k: "Last sync", v: sys.sync },
                    { k: "Health", v: `${sys.health}%`, alert: sys.health < 90 },
                  ].map(r => (
                    <div key={r.k} className="flex justify-between">
                      <span className="text-[8px] text-white/20">{r.k}</span>
                      <span className={cn("text-[8px] font-mono", r.alert ? "text-amber-400" : "text-white/40")}>{r.v}</span>
                    </div>
                  ))}
                </div>
                {agentActive && (
                  <div className="mt-1.5 text-[9px] font-medium animate-pulse" style={{ color: sys.color }}>
                    Agent active…
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* CENTER: Agent Execution + Unified View */}
        <div className="space-y-4 min-w-0">
          {/* Agent swimlanes */}
          <div className="rounded-xl border border-white/6 overflow-hidden" style={{ background: '#111416' }}>
            <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-[#00c2b2]" />
                <span className="text-xs font-semibold text-white">Live Agent Execution</span>
                {running && <div className="h-1.5 w-1.5 rounded-full bg-[#00c2b2] animate-pulse" />}
              </div>
              <span className="text-[10px] text-white/25">{completedCount}/7 complete</span>
            </div>
            <div className="divide-y divide-white/4">
              {agents.map(agent => {
                const isActive = agent.status === "running" || agent.status === "queued";
                const isDone = agent.status === "complete";
                return (
                  <div key={agent.id} className={cn(
                    "px-4 py-3 transition-all duration-300",
                    isDone ? "bg-white/2" : isActive ? "bg-white/3" : ""
                  )}>
                    <div className="flex items-center gap-3 mb-2">
                      {/* Agent icon + name */}
                      <div className="h-6 w-6 rounded-md flex items-center justify-center shrink-0 border"
                        style={{ background: agent.color + '15', borderColor: agent.color + '30' }}>
                        <agent.Icon className="h-3.5 w-3.5" style={{ color: agent.color }} />
                      </div>
                      <div className="w-36 shrink-0">
                        <p className="text-[11px] font-bold text-white/80">{agent.name}</p>
                        <p className="text-[9px] text-white/25 truncate">{agent.role}</p>
                      </div>

                      {/* Step pipeline */}
                      <div className="flex-1 flex items-center gap-0.5 relative">
                        {agent.steps.map((step, i) => {
                          const done = agent.status === "complete" || i < agent.currentStep;
                          const active = isActive && i === agent.currentStep;
                          const future = !done && !active;
                          return (
                            <div key={i} className="flex items-center gap-0.5 flex-1 min-w-0">
                              <div className={cn(
                                "flex-1 flex items-center justify-center py-1 px-1.5 rounded text-center transition-all duration-300 min-w-0",
                                done ? "border" : active ? "border" : "border border-dashed"
                              )} style={{
                                background: done ? agent.color + '15' : active ? agent.color + '10' : '#ffffff04',
                                borderColor: done ? agent.color + '40' : active ? agent.color + '50' : '#ffffff10',
                              }}>
                                {done ? (
                                  <CheckCircle className="h-2.5 w-2.5 shrink-0" style={{ color: agent.color }} />
                                ) : active ? (
                                  <Loader2 className="h-2.5 w-2.5 animate-spin shrink-0" style={{ color: agent.color }} />
                                ) : (
                                  <div className="h-1.5 w-1.5 rounded-full bg-white/10 shrink-0" />
                                )}
                                <span className="text-[8px] ml-1 truncate hidden lg:block" style={{
                                  color: done ? agent.color : active ? agent.color + 'cc' : '#ffffff20'
                                }}>{step.label}</span>
                              </div>
                              {i < agent.steps.length - 1 && (
                                <div className="h-px w-1.5 shrink-0" style={{ background: done ? agent.color + '40' : '#ffffff08' }} />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Status pill */}
                      <div className="shrink-0 ml-2">
                        {isDone ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">DONE</span>
                        ) : isActive ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border animate-pulse" style={{ background: agent.color + '15', color: agent.color, borderColor: agent.color + '30' }}>
                            {agent.status === "queued" ? "QUEUED" : "ACTIVE"}
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/20 border border-white/8">IDLE</span>
                        )}
                      </div>
                    </div>

                    {/* Latest log */}
                    {agent.logs.length > 0 && (
                      <div className="pl-9">
                        <p className="text-[9px] font-mono text-white/30 truncate">
                          {agent.logs[agent.logs.length - 1]}
                        </p>
                      </div>
                    )}

                    {/* Progress bar */}
                    {agent.status !== "idle" && (
                      <div className="pl-9 mt-1.5">
                        <div className="h-0.5 rounded-full bg-white/5">
                          <motion.div className="h-0.5 rounded-full" animate={{ width: `${agent.progress}%` }}
                            transition={{ duration: 0.35 }} style={{ background: agent.color }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT: Decision + Actions + Audit */}
        <div className="space-y-3">
          {/* Decision panel */}
          <div className="rounded-xl border border-white/6 overflow-hidden" style={{ background: '#111416' }}>
            <div className="px-3 py-2.5 border-b border-white/5 flex items-center gap-2">
              <Brain className="h-3.5 w-3.5 text-[#ef4444]" />
              <span className="text-xs font-bold text-white">Decision Agent</span>
              {showDecision && <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-[#00c2b2]/10 text-[#00c2b2] border border-[#00c2b2]/25">96% confidence</span>}
            </div>

            <AnimatePresence>
              {showDecision ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 space-y-2">
                  {/* Root cause */}
                  <div className="rounded-lg bg-red-500/6 border border-red-500/15 px-3 py-2">
                    <p className="text-[8px] text-red-400/60 uppercase tracking-widest mb-1">Root Cause</p>
                    <p className="text-[10px] text-white/60 leading-relaxed">Dock 7-B forklift malfunction → 95-min loading delay → missed departure window → SLA breach 98%</p>
                  </div>
                  {/* Impact */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { k: "Financial", v: "$28,450", c: "#ef4444" },
                      { k: "SLA Risk", v: "BREACH", c: "#ef4444" },
                      { k: "Customer", v: "PLATINUM", c: "#00c2b2" },
                      { k: "Orders at Risk", v: "3", c: "#f59e0b" },
                    ].map(i => (
                      <div key={i.k} className="bg-white/3 rounded-md px-2 py-1.5">
                        <p className="text-[8px] text-white/25">{i.k}</p>
                        <p className="text-[10px] font-bold" style={{ color: i.c }}>{i.v}</p>
                      </div>
                    ))}
                  </div>
                  {/* Recommendations */}
                  <div className="space-y-1.5">
                    {RECOMMENDATIONS.map(r => (
                      <div key={r.rank} className="rounded-lg bg-white/3 border border-white/6 px-2.5 py-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[8px] font-bold text-[#00c2b2] w-3">{r.rank}.</span>
                          <span className="text-[9px] font-bold text-white/80 flex-1 truncate">{r.action}</span>
                          <span className={cn("text-[7px] font-bold px-1 rounded shrink-0",
                            r.urgency === "IMMEDIATE" ? "text-red-400 bg-red-400/10" :
                            r.urgency === "HIGH" ? "text-amber-400 bg-amber-400/10" :
                            "text-white/30 bg-white/5")}>
                            {r.urgency}
                          </span>
                        </div>
                        <p className="text-[9px] text-white/35 leading-tight pl-4">{r.detail}</p>
                        <div className="flex items-center gap-1.5 mt-1 pl-4">
                          <span className="text-[7px] font-mono text-white/20">{r.method} · {r.system}</span>
                          <div className="flex-1 h-0.5 rounded-full bg-white/5">
                            <div className="h-0.5 rounded-full bg-[#00c2b2]" style={{ width: `${r.confidence}%` }} />
                          </div>
                          <span className="text-[7px] text-white/25">{r.confidence}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="px-3 py-6 text-center">
                  <Brain className="h-7 w-7 text-white/8 mx-auto mb-2" />
                  <p className="text-[10px] text-white/20">Launch investigation to generate AI decision</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Cross-system actions */}
          <AnimatePresence>
            {showDecision && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-xl border border-white/6 overflow-hidden" style={{ background: '#111416' }}>
                <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-[#00c2b2]" />
                  <span className="text-[11px] font-bold text-white">Cross-System Actions</span>
                </div>
                <div className="p-3 grid grid-cols-2 gap-1.5">
                  {CROSS_ACTIONS.map(a => {
                    const done = executedActions.has(a.label);
                    return (
                      <button key={a.label} onClick={() => !done && executeAction(a.label, a.color)}
                        className={cn("text-[9px] px-2 py-1.5 rounded-lg border text-left transition-all font-medium", done ? "opacity-50 cursor-default" : "hover:opacity-80")}
                        style={
                          a.primary
                            ? { background: a.color, color: '#000', borderColor: a.color, gridColumn: '1 / -1' }
                            : done
                              ? { background: '#10b98115', color: '#10b981', borderColor: '#10b98125' }
                              : { background: a.color + '10', color: a.color, borderColor: a.color + '25' }
                        }>
                        <div className="flex items-center gap-1">
                          {done ? <CheckCircle className="h-2.5 w-2.5 shrink-0" /> : <span className="text-[7px] font-mono opacity-60 shrink-0">{a.method}</span>}
                          <span>{done ? `${a.label} ✓` : a.label}</span>
                          {!done && <span className="ml-auto text-[7px] opacity-50">{a.system}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Audit log */}
          <div className="rounded-xl border border-white/6 overflow-hidden" style={{ background: '#111416' }}>
            <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-white/30" />
              <span className="text-[11px] font-bold text-white">Audit Log</span>
              <span className="ml-auto text-[9px] text-white/20">{auditLog.length} events</span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {auditLog.length === 0 ? (
                <div className="px-3 py-4 text-center">
                  <p className="text-[10px] text-white/15">No events yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/4">
                  {auditLog.map((entry, i) => (
                    <div key={i} className="px-3 py-1.5 flex items-start gap-2">
                      <span className="text-[8px] font-mono text-white/20 shrink-0 mt-0.5">{entry.ts}</span>
                      <span className="text-[9px] leading-relaxed" style={{ color: entry.color + 'cc' }}>{entry.msg}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Slack Notifications Panel */}
          <div className="rounded-xl border overflow-hidden" style={{ background: '#111416', borderColor: '#4A154B40' }}>
            <div className="px-3 py-2.5 border-b flex items-center gap-2" style={{ borderColor: '#4A154B30' }}>
              <div className="h-3.5 w-3.5 rounded shrink-0 flex items-center justify-center" style={{ background: '#4A154B' }}>
                <span className="text-[8px] font-bold text-white">#</span>
              </div>
              <span className="text-[11px] font-bold text-white">Slack Alerts</span>
              <div className="ml-auto flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] text-emerald-400">Connected</span>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <p className="text-[8px] text-white/25 uppercase tracking-widest">Channel Subscriptions</p>
              {[
                { ch: "#risk-alerts", desc: "SLA breaches · dock faults · route alerts", active: true },
                { ch: "#fraud-watch", desc: "Fraud signals · carrier anomalies", active: true },
                { ch: "#sla-breach", desc: "Critical SLA notifications only", active: false },
              ].map(c => (
                <div key={c.ch} className="flex items-start gap-2 rounded-lg px-2 py-1.5" style={{ background: '#4A154B12' }}>
                  <div className={cn("h-1.5 w-1.5 rounded-full mt-1.5 shrink-0", c.active ? "bg-emerald-400" : "bg-white/15")} />
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold" style={{ color: '#E8D5FF' }}>{c.ch}</p>
                    <p className="text-[8px] text-white/30 truncate">{c.desc}</p>
                  </div>
                </div>
              ))}
              <div className="border-t pt-2 mt-1" style={{ borderColor: '#4A154B30' }}>
                <p className="text-[8px] text-white/25 uppercase tracking-widest mb-1.5">Direct Message</p>
                <div className="rounded-lg px-2 py-1.5 flex items-center gap-2" style={{ background: '#4A154B12' }}>
                  <div className="h-5 w-5 rounded-full bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center shrink-0">
                    <span className="text-[7px] font-bold text-white">JM</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-white/70">J. Martinez</p>
                    <p className="text-[8px] text-white/30">Investigation Officer</p>
                  </div>
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                </div>
              </div>
              <div className="border-t pt-2" style={{ borderColor: '#4A154B30' }}>
                <p className="text-[8px] text-white/25 uppercase tracking-widest mb-1.5">Alert Format Preview</p>
                <div className="rounded-lg p-2 font-mono text-[8px] space-y-0.5" style={{ background: '#0a0c0d', borderLeft: '3px solid #4A154B' }}>
                  <p className="text-white/50">🚨 <span className="text-red-400">CRITICAL</span> · SHP-1024</p>
                  <p className="text-white/35">Dock 7-B fault → SLA breach 98%</p>
                  <p className="text-white/35">Customer: Nexus Pharma PLATINUM</p>
                  <p className="text-white/35">Action: Dock 9-A reassigned ✓</p>
                  <p style={{ color: '#4A154B80' }}>via Overhaul AI · Control Tower</p>
                </div>
              </div>
            </div>
          </div>

          {/* Integration Intelligence pill */}
          <div className="rounded-xl border border-white/5 px-3 py-3 space-y-2" style={{ background: '#111416' }}>
            <p className="text-[9px] text-white/25 uppercase tracking-widest font-semibold">Integration Intelligence</p>
            {[
              { label: "Auto-detected auth methods", icon: Lock, color: "#00c2b2", done: true },
              { label: "Token refresh automated", icon: RefreshCw, color: "#10b981", done: true },
              { label: "API discovery complete", icon: Search, color: "#3b82f6", done: true },
              { label: "Response validation active", icon: CheckCircle, color: "#8b5cf6", done: true },
              { label: "Retry logic engaged", icon: RotateCcw, color: "#f59e0b", done: true },
              { label: "Cross-system sync active", icon: Wifi, color: "#00c2b2", done: running || allDone },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <item.icon className="h-3 w-3 shrink-0" style={{ color: item.done ? item.color : '#ffffff15' }} />
                <span className="text-[9px] flex-1" style={{ color: item.done ? item.color + 'cc' : '#ffffff20' }}>{item.label}</span>
                {item.done && <CheckCircle className="h-2.5 w-2.5 shrink-0" style={{ color: item.color }} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
