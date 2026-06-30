"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Square, Plus, ChevronRight, CheckCircle, Clock, AlertTriangle,
  Zap, Shield, Package, Truck, Bot, Database, FileText, Bell,
  ArrowRight, MoreHorizontal, RefreshCw, Filter, Search, GitBranch,
  Circle, Activity, Layers, Lock, Mail, Globe, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CTWorkflowOrchestratorProps { onToast: (msg: string) => void; }

type RunStatus = "idle" | "running" | "success" | "failed";
type StepStatus = "idle" | "running" | "done" | "error" | "skipped";

interface WorkflowStep {
  id: string;
  label: string;
  type: "trigger" | "condition" | "action" | "agent" | "notify";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  detail: string;
  status: StepStatus;
}

interface Workflow {
  id: string;
  name: string;
  trigger: string;
  description: string;
  steps: number;
  lastRun: string;
  runs: number;
  status: "active" | "paused" | "draft";
  category: string;
}

const WORKFLOWS: Workflow[] = [
  { id: "wf1", name: "SLA Breach Prevention", trigger: "Risk Score > 85", description: "Auto-escalate and reroute shipments approaching SLA breach", steps: 7, lastRun: "2m ago", runs: 142, status: "active", category: "Risk" },
  { id: "wf2", name: "Fraud Alert Response", trigger: "Fraud Detected", description: "Quarantine shipment, notify GSOC, and open investigation", steps: 6, lastRun: "18m ago", runs: 34, status: "active", category: "Fraud" },
  { id: "wf3", name: "Carrier Verification", trigger: "New Carrier Assigned", description: "Verify MC number, insurance, and safety rating before dispatch", steps: 5, lastRun: "1h ago", runs: 287, status: "active", category: "Compliance" },
  { id: "wf4", name: "Cold Chain Breach", trigger: "Temp Excursion Detected", description: "Alert shipper, divert to nearest cold storage, file incident", steps: 8, lastRun: "3h ago", runs: 19, status: "active", category: "Cold Chain" },
  { id: "wf5", name: "EDI 214 Auto-Response", trigger: "EDI 214 Received", description: "Parse status update, sync TMS, notify customer portal", steps: 4, lastRun: "5m ago", runs: 1204, status: "active", category: "EDI" },
  { id: "wf6", name: "Executive Daily Briefing", trigger: "Schedule: 06:00 CST", description: "Aggregate KPIs, generate AI summary, email to C-suite", steps: 5, lastRun: "6h ago", runs: 91, status: "active", category: "Reporting" },
  { id: "wf7", name: "Dock Reassignment", trigger: "Dock Equipment Fault", description: "Detect fault, find available dock, update WMS and driver", steps: 6, lastRun: "Never", runs: 0, status: "draft", category: "Operations" },
  { id: "wf8", name: "Insurance Claim Auto-File", trigger: "Cargo Loss Confirmed", description: "Collect evidence, compile report, submit to insurer via API", steps: 9, lastRun: "2d ago", runs: 7, status: "paused", category: "Insurance" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Risk: "#ef4444", Fraud: "#f59e0b", Compliance: "#3b82f6",
  "Cold Chain": "#06b6d4", EDI: "#f97316", Reporting: "#8b5cf6",
  Operations: "#10b981", Insurance: "#ec4899",
};

const RUN_HISTORY = [
  { id: "run-881", wf: "SLA Breach Prevention", status: "success", duration: "4.2s", time: "2m ago", shipment: "SHP-1024" },
  { id: "run-880", wf: "EDI 214 Auto-Response", status: "success", duration: "1.1s", time: "5m ago", shipment: "SHP-0997" },
  { id: "run-879", wf: "Fraud Alert Response", status: "success", duration: "6.8s", time: "18m ago", shipment: "SHP-8821" },
  { id: "run-878", wf: "Carrier Verification", status: "failed", duration: "2.4s", time: "1h ago", shipment: "SHP-1031" },
  { id: "run-877", wf: "EDI 214 Auto-Response", status: "success", duration: "0.9s", time: "1h ago", shipment: "SHP-0991" },
  { id: "run-876", wf: "SLA Breach Prevention", status: "success", duration: "3.7s", time: "2h ago", shipment: "SHP-1019" },
];

function buildSteps(wfId: string): WorkflowStep[] {
  const maps: Record<string, WorkflowStep[]> = {
    wf1: [
      { id: "s1", label: "Risk Score Trigger", type: "trigger", icon: Zap, color: "#ef4444", detail: "Risk score ≥ 85 on any active shipment", status: "idle" },
      { id: "s2", label: "Fetch Shipment Context", type: "agent", icon: Bot, color: "#3b82f6", detail: "ERP Agent pulls order + SLA details", status: "idle" },
      { id: "s3", label: "Check SLA Deadline", type: "condition", icon: Clock, color: "#f59e0b", detail: "If breach window < 2h → escalate", status: "idle" },
      { id: "s4", label: "Find Alternate Carrier", type: "agent", icon: Truck, color: "#10b981", detail: "TMS Agent queries available carriers on lane", status: "idle" },
      { id: "s5", label: "Reassign Shipment", type: "action", icon: RefreshCw, color: "#00c2b2", detail: "PUT /tms/shipments/{id}/carrier", status: "idle" },
      { id: "s6", label: "Notify Customer", type: "notify", icon: Mail, color: "#8b5cf6", detail: "Send ETA update via customer portal API", status: "idle" },
      { id: "s7", label: "Log to BI Connector", type: "action", icon: BarChart3, color: "#8b5cf6", detail: "Push resolution event to Power BI dashboard", status: "idle" },
    ],
    wf2: [
      { id: "s1", label: "Fraud Detected Trigger", type: "trigger", icon: Shield, color: "#f59e0b", detail: "Fraud score > 90 or manual GSOC flag", status: "idle" },
      { id: "s2", label: "Quarantine Shipment", type: "action", icon: Lock, color: "#ef4444", detail: "PUT /tms/shipments/{id}/status → HOLD", status: "idle" },
      { id: "s3", label: "Alert GSOC Team", type: "notify", icon: Bell, color: "#f97316", detail: "Push alert to GSOC dashboard + SMS", status: "idle" },
      { id: "s4", label: "Collect Evidence", type: "agent", icon: Bot, color: "#3b82f6", detail: "Fraud Agent gathers POD, MC records, history", status: "idle" },
      { id: "s5", label: "Open Investigation", type: "action", icon: FileText, color: "#8b5cf6", detail: "POST /investigations with evidence bundle", status: "idle" },
      { id: "s6", label: "Log to Audit Trail", type: "action", icon: Database, color: "#6366f1", detail: "Append timestamped record to compliance log", status: "idle" },
    ],
    wf3: [
      { id: "s1", label: "Carrier Assigned Trigger", type: "trigger", icon: Truck, color: "#10b981", detail: "New carrier MC assigned to load", status: "idle" },
      { id: "s2", label: "FMCSA Lookup", type: "action", icon: Globe, color: "#3b82f6", detail: "GET /fmcsa/carriers/{mc} — verify authority", status: "idle" },
      { id: "s3", label: "Insurance Check", type: "condition", icon: Shield, color: "#f59e0b", detail: "If coverage < $100K → reject + re-broker", status: "idle" },
      { id: "s4", label: "Safety Rating Check", type: "condition", icon: Activity, color: "#ef4444", detail: "If rating = Unsatisfactory → block dispatch", status: "idle" },
      { id: "s5", label: "Approve & Dispatch", type: "action", icon: CheckCircle, color: "#00c2b2", detail: "POST /dispatch/approve with carrier token", status: "idle" },
    ],
  };
  return maps[wfId] ?? maps["wf1"];
}

const STEP_DURATION = 700;

export function CTWorkflowOrchestrator({ onToast }: CTWorkflowOrchestratorProps) {
  const [selected, setSelected] = useState<Workflow>(WORKFLOWS[0]);
  const [steps, setSteps] = useState<WorkflowStep[]>(buildSteps(WORKFLOWS[0].id));
  const [runStatus, setRunStatus] = useState<RunStatus>("idle");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const selectWorkflow = (wf: Workflow) => {
    timers.current.forEach(clearTimeout);
    setSelected(wf);
    setSteps(buildSteps(wf.id));
    setRunStatus("idle");
  };

  const runWorkflow = () => {
    if (runStatus === "running") return;
    timers.current.forEach(clearTimeout);
    const fresh = buildSteps(selected.id).map(s => ({ ...s, status: "idle" as StepStatus }));
    setSteps(fresh);
    setRunStatus("running");

    fresh.forEach((_, i) => {
      const t1 = setTimeout(() => {
        setSteps(prev => prev.map((s, j) => j === i ? { ...s, status: "running" } : s));
      }, i * STEP_DURATION);
      const t2 = setTimeout(() => {
        setSteps(prev => prev.map((s, j) => j === i ? { ...s, status: "done" } : s));
        if (i === fresh.length - 1) {
          setRunStatus("success");
          onToast(`✓ ${selected.name} completed successfully`);
        }
      }, i * STEP_DURATION + STEP_DURATION - 80);
      timers.current.push(t1, t2);
    });
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    setSteps(buildSteps(selected.id).map(s => ({ ...s, status: "idle" })));
    setRunStatus("idle");
  };

  const categories = ["All", ...Array.from(new Set(WORKFLOWS.map(w => w.category)))];
  const filtered = WORKFLOWS.filter(w =>
    (filter === "All" || w.category === filter) &&
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  const stepColor = (s: StepStatus) => ({
    idle: "border-white/10 bg-white/3",
    running: "border-[#00c2b2]/40 bg-[#00c2b2]/6",
    done: "border-green-500/30 bg-green-500/5",
    error: "border-red-500/30 bg-red-500/5",
    skipped: "border-white/5 bg-white/2 opacity-40",
  }[s]);

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "#0d0f10" }}>

      {/* LEFT — workflow list */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-white/5" style={{ background: "#0a0c0d" }}>
        <div className="px-3 py-3 border-b border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Workflows</p>
            <button className="flex items-center gap-1 text-[10px] text-[#00c2b2] hover:text-[#00c2b2]/80">
              <Plus className="h-3 w-3" /> New
            </button>
          </div>
          <div className="flex items-center gap-1.5 px-2 h-7 rounded-lg bg-white/5 border border-white/8">
            <Search className="h-3 w-3 text-white/30 shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search..." className="flex-1 bg-transparent text-[11px] text-white placeholder-white/25 outline-none" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)}
                className={cn("text-[9px] px-2 py-0.5 rounded-full border transition-all",
                  filter === c ? "bg-[#00c2b2]/15 border-[#00c2b2]/30 text-[#00c2b2]" : "border-white/10 text-white/30 hover:text-white/60")}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {filtered.map(wf => (
            <button key={wf.id} onClick={() => selectWorkflow(wf)}
              className={cn("w-full text-left px-3 py-2.5 border-b border-white/4 hover:bg-white/3 transition-colors",
                selected.id === wf.id && "bg-[#00c2b2]/5 border-l-2 border-l-[#00c2b2]")}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-medium text-white leading-tight">{wf.name}</p>
                <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full shrink-0 mt-0.5 font-medium",
                  wf.status === "active" ? "bg-green-500/15 text-green-400" :
                  wf.status === "paused" ? "bg-amber-500/15 text-amber-400" :
                  "bg-white/8 text-white/30")}>
                  {wf.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: `${CATEGORY_COLORS[wf.category]}18`, color: CATEGORY_COLORS[wf.category] }}>
                  {wf.category}
                </span>
                <span className="text-[9px] text-white/25">{wf.steps} steps · {wf.runs} runs</span>
              </div>
            </button>
          ))}
        </div>

        {/* Run history */}
        <div className="border-t border-white/5 px-3 py-2">
          <p className="text-[9px] text-white/20 uppercase tracking-widest mb-2">Recent Runs</p>
          <div className="space-y-1.5">
            {RUN_HISTORY.slice(0, 4).map(r => (
              <div key={r.id} className="flex items-center gap-2">
                <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", r.status === "success" ? "bg-green-400" : "bg-red-400")} />
                <p className="text-[9px] text-white/40 truncate flex-1">{r.wf}</p>
                <span className="text-[9px] text-white/20 shrink-0">{r.time}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* CENTER — canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-11 shrink-0 flex items-center gap-3 px-4 border-b border-white/5" style={{ background: "#111416" }}>
          <div className="flex items-center gap-2">
            <GitBranch className="h-3.5 w-3.5 text-[#00c2b2]" />
            <span className="text-sm font-semibold text-white">{selected.name}</span>
            <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-medium",
              selected.status === "active" ? "bg-green-500/15 text-green-400" :
              selected.status === "paused" ? "bg-amber-500/15 text-amber-400" :
              "bg-white/8 text-white/30")}>
              {selected.status}
            </span>
          </div>
          <div className="text-[10px] text-white/30 border-l border-white/10 pl-3">
            {selected.trigger}
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {runStatus === "success" && (
              <div className="flex items-center gap-1.5 text-[10px] text-green-400">
                <CheckCircle className="h-3 w-3" /> Completed
              </div>
            )}
            <button onClick={reset}
              className="h-7 px-3 rounded-lg text-[11px] text-white/40 hover:text-white border border-white/8 hover:border-white/20 flex items-center gap-1.5 transition-all">
              <RefreshCw className="h-3 w-3" /> Reset
            </button>
            <button onClick={runWorkflow} disabled={runStatus === "running"}
              className={cn("h-7 px-4 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all",
                runStatus === "running"
                  ? "bg-[#00c2b2]/20 text-[#00c2b2]/60 cursor-not-allowed border border-[#00c2b2]/20"
                  : "bg-[#00c2b2] text-black hover:bg-[#00c2b2]/90")}>
              {runStatus === "running"
                ? <><span className="h-2.5 w-2.5 border border-[#00c2b2]/60 border-t-transparent rounded-full animate-spin" /> Running...</>
                : <><Play className="h-3 w-3" /> Run Workflow</>}
            </button>
          </div>
        </div>

        {/* Workflow canvas */}
        <div className="flex-1 overflow-auto p-6">
          <p className="text-[10px] text-white/20 uppercase tracking-widest mb-4">
            {selected.description}
          </p>

          {/* Step nodes */}
          <div className="flex flex-col items-center gap-0">
            {steps.map((step, i) => (
              <div key={step.id} className="flex flex-col items-center w-full max-w-lg">
                {/* Node */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn("w-full rounded-xl border p-4 transition-all duration-300", stepColor(step.status))}
                >
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${step.color}18`, border: `1px solid ${step.color}30` }}>
                      <step.icon className="h-4 w-4" style={{ color: step.color }} />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                          style={{ background: `${step.color}15`, color: step.color }}>
                          {step.type}
                        </span>
                        <p className="text-xs font-semibold text-white">{step.label}</p>
                      </div>
                      <p className="text-[10px] text-white/40 mt-0.5">{step.detail}</p>
                    </div>
                    {/* Status icon */}
                    <div className="shrink-0">
                      {step.status === "running" && (
                        <span className="h-5 w-5 border-2 border-[#00c2b2]/40 border-t-[#00c2b2] rounded-full animate-spin block" />
                      )}
                      {step.status === "done" && <CheckCircle className="h-5 w-5 text-green-400" />}
                      {step.status === "error" && <AlertTriangle className="h-5 w-5 text-red-400" />}
                      {step.status === "idle" && <Circle className="h-5 w-5 text-white/15" />}
                    </div>
                  </div>
                </motion.div>

                {/* Connector arrow */}
                {i < steps.length - 1 && (
                  <div className="flex flex-col items-center py-1">
                    <div className={cn("w-px h-4 transition-colors duration-300",
                      steps[i + 1]?.status !== "idle" ? "bg-[#00c2b2]/40" : "bg-white/10")} />
                    <ChevronRight className={cn("h-3 w-3 rotate-90 transition-colors duration-300",
                      steps[i + 1]?.status !== "idle" ? "text-[#00c2b2]/60" : "text-white/15")} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — stats + history */}
      <aside className="w-56 shrink-0 flex flex-col border-l border-white/5 p-4 gap-4" style={{ background: "#0a0c0d" }}>
        {/* Workflow stats */}
        <div>
          <p className="text-[9px] text-white/20 uppercase tracking-widest mb-3">Workflow Stats</p>
          <div className="space-y-2">
            {[
              { label: "Total Runs", value: String(selected.runs) },
              { label: "Success Rate", value: selected.runs > 0 ? "97.2%" : "—" },
              { label: "Avg Duration", value: selected.runs > 0 ? "3.4s" : "—" },
              { label: "Last Run", value: selected.lastRun },
              { label: "Steps", value: String(selected.steps) },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-[10px] text-white/30">{s.label}</span>
                <span className="text-[10px] font-medium text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step legend */}
        <div>
          <p className="text-[9px] text-white/20 uppercase tracking-widest mb-3">Step Types</p>
          <div className="space-y-1.5">
            {[
              { type: "trigger", color: "#ef4444", label: "Trigger" },
              { type: "condition", color: "#f59e0b", label: "Condition" },
              { type: "agent", color: "#3b82f6", label: "AI Agent" },
              { type: "action", color: "#00c2b2", label: "Action" },
              { type: "notify", color: "#8b5cf6", label: "Notify" },
            ].map(t => (
              <div key={t.type} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full shrink-0" style={{ background: t.color }} />
                <span className="text-[10px] text-white/40">{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Run log */}
        <div className="flex-1 min-h-0">
          <p className="text-[9px] text-white/20 uppercase tracking-widest mb-3">All Runs</p>
          <div className="space-y-2 overflow-y-auto max-h-48">
            {RUN_HISTORY.map(r => (
              <div key={r.id} className="rounded-lg border border-white/6 px-2.5 py-2" style={{ background: "#111416" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={cn("h-1.5 w-1.5 rounded-full", r.status === "success" ? "bg-green-400" : "bg-red-400")} />
                  <span className="text-[9px] text-white/50 truncate">{r.shipment}</span>
                  <span className="text-[9px] text-white/25 ml-auto">{r.duration}</span>
                </div>
                <p className="text-[9px] text-white/25">{r.time}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
