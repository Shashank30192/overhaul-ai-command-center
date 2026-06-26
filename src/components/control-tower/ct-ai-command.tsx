"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, CheckCircle, Loader2, AlertCircle, RotateCcw, ChevronDown, ChevronUp, Terminal, Code, List, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_PAYLOADS } from "./mock-data";

type AgentStatus = 'idle' | 'queued' | 'running' | 'complete' | 'error';

interface Agent {
  id: string;
  name: string;
  role: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  status: AgentStatus;
  progress: number;
  confidence: number;
  executionTime: number;
  currentTask: string;
  dataRetrieved: string[];
  logs: string[];
  payloadKey: keyof typeof MOCK_PAYLOADS;
}

const INITIAL_AGENTS: Agent[] = [
  {
    id: 'supervisor',
    name: 'Supervisor Agent',
    role: 'Orchestration & Coordination',
    color: '#00c2b2', bgColor: '#00c2b2/10', borderColor: '#00c2b2/20',
    icon: '◈',
    status: 'idle', progress: 0, confidence: 0, executionTime: 0,
    currentTask: 'Awaiting trigger...',
    dataRetrieved: [],
    logs: [],
    payloadKey: 'decision',
  },
  {
    id: 'erp',
    name: 'ERP Agent',
    role: 'SAP S/4HANA · Oracle ERP · NetSuite',
    color: '#3b82f6', bgColor: '#3b82f6/10', borderColor: '#3b82f6/20',
    icon: '◆',
    status: 'idle', progress: 0, confidence: 0, executionTime: 0,
    currentTask: 'Awaiting trigger...',
    dataRetrieved: [],
    logs: [],
    payloadKey: 'erp',
  },
  {
    id: 'wms',
    name: 'WMS Agent',
    role: 'Blue Yonder · Manhattan · SAP EWM',
    color: '#f59e0b', bgColor: '#f59e0b/10', borderColor: '#f59e0b/20',
    icon: '◇',
    status: 'idle', progress: 0, confidence: 0, executionTime: 0,
    currentTask: 'Awaiting trigger...',
    dataRetrieved: [],
    logs: [],
    payloadKey: 'wms',
  },
  {
    id: 'tms',
    name: 'TMS Agent',
    role: 'Oracle TMS · MercuryGate · SAP TM',
    color: '#8b5cf6', bgColor: '#8b5cf6/10', borderColor: '#8b5cf6/20',
    icon: '◉',
    status: 'idle', progress: 0, confidence: 0, executionTime: 0,
    currentTask: 'Awaiting trigger...',
    dataRetrieved: [],
    logs: [],
    payloadKey: 'tms',
  },
  {
    id: 'decision',
    name: 'Decision Agent',
    role: 'Root Cause · Impact · Resolution',
    color: '#10b981', bgColor: '#10b981/10', borderColor: '#10b981/20',
    icon: '◎',
    status: 'idle', progress: 0, confidence: 0, executionTime: 0,
    currentTask: 'Awaiting all data sources...',
    dataRetrieved: [],
    logs: [],
    payloadKey: 'decision',
  },
];

const AGENT_SEQUENCES: Record<string, { task: string; logs: string[]; data: string[]; progress: number; confidence: number }[]> = {
  supervisor: [
    { task: 'Analyzing SHP-1024 priority escalation...', logs: ['[INFO] Received escalation: SHP-1024 PLATINUM'], data: [], progress: 20, confidence: 0 },
    { task: 'Dispatching ERP, WMS, TMS agents...', logs: ['[INFO] Agent ERP queued', '[INFO] Agent WMS queued', '[INFO] Agent TMS queued'], data: [], progress: 50, confidence: 0 },
    { task: 'Awaiting sub-agent responses...', logs: ['[INFO] Monitoring agent completion'], data: [], progress: 75, confidence: 0 },
    { task: 'Aggregating responses → Decision Agent', logs: ['[OK] All sub-agents complete', '[INFO] Forwarding to Decision Agent'], data: ['ERP response: 145ms', 'WMS response: 212ms', 'TMS response: 178ms'], progress: 90, confidence: 0 },
    { task: 'Orchestration complete', logs: ['[OK] Decision published', '[OK] Systems notified'], data: ['ERP response: 145ms', 'WMS response: 212ms', 'TMS response: 178ms'], progress: 100, confidence: 99 },
  ],
  erp: [
    { task: 'Connecting to SAP S/4HANA...', logs: ['[INFO] GET /erp/auth'], data: [], progress: 15, confidence: 0 },
    { task: 'Fetching order SO-289341...', logs: ['[INFO] GET /erp/orders/SO-289341', '[OK] 200 — 145ms'], data: ['SO-289341 — PLATINUM'], progress: 40, confidence: 0 },
    { task: 'Resolving customer SLA contract...', logs: ['[INFO] GET /erp/customer/C001/sla'], data: ['SO-289341 — PLATINUM', 'SLA: 24h guaranteed'], progress: 65, confidence: 0 },
    { task: 'Fetching inventory status...', logs: ['[INFO] GET /erp/inventory/PHARM-4421'], data: ['SO-289341 — PLATINUM', 'SLA: 24h guaranteed', 'Inventory: 240/240 reserved'], progress: 85, confidence: 0 },
    { task: 'ERP data compiled', logs: ['[OK] All ERP fields resolved', '[INFO] Sending to Supervisor'], data: ['SO-289341 — PLATINUM', 'SLA: 24h guaranteed', 'Inventory: 240/240 reserved', 'Value: $284,500'], progress: 100, confidence: 97 },
  ],
  wms: [
    { task: 'Connecting to Manhattan WMS...', logs: ['[INFO] GET /wms/auth → Chicago WH'], data: [], progress: 10, confidence: 0 },
    { task: 'Querying Dock 7-B status...', logs: ['[INFO] GET /wms/dock/7B/status', '[WARN] Equipment failure detected'], data: ['Dock 7-B: FAULT'], progress: 35, confidence: 0 },
    { task: 'Checking load progress...', logs: ['[INFO] GET /wms/picking/SHP-1024', '[OK] Picking: COMPLETE'], data: ['Dock 7-B: FAULT', 'Picking: COMPLETE'], progress: 60, confidence: 0 },
    { task: 'Filing exception report...', logs: ['[INFO] POST /wms/exception/report', '[OK] 201 — Exception logged'], data: ['Dock 7-B: FAULT', 'Picking: COMPLETE', 'Delay: 95 min'], progress: 85, confidence: 0 },
    { task: 'WMS data compiled', logs: ['[OK] Exception E-4421 created', '[INFO] Dock 9-A available'], data: ['Dock 7-B: FAULT', 'Picking: COMPLETE', 'Delay: 95 min', 'Alt: Dock 9-A available'], progress: 100, confidence: 94 },
  ],
  tms: [
    { task: 'Connecting to Oracle TMS...', logs: ['[INFO] GET /tms/auth'], data: [], progress: 12, confidence: 0 },
    { task: 'Fetching carrier SHP-1024...', logs: ['[INFO] GET /tms/carrier/SHP-1024', '[OK] Swift Logistics / James Rodriguez'], data: ['Driver: James Rodriguez'], progress: 38, confidence: 0 },
    { task: 'Checking dispatch window...', logs: ['[WARN] Departure window missed: 14:00 CST'], data: ['Driver: James Rodriguez', 'Missed window: 14:00 CST'], progress: 62, confidence: 0 },
    { task: 'Recalculating ETA...', logs: ['[INFO] POST /tms/routes/recalculate', '[OK] New ETA: 22:00 CST (+4h)'], data: ['Driver: James Rodriguez', 'Missed window: 14:00 CST', 'New ETA: 22:00 CST'], progress: 88, confidence: 0 },
    { task: 'TMS data compiled', logs: ['[OK] ETA updated in Oracle TMS', '[INFO] Driver alerted'], data: ['Driver: James Rodriguez', 'Missed window: 14:00 CST', 'New ETA: 22:00 CST', 'Delay: 240 min'], progress: 100, confidence: 91 },
  ],
  decision: [
    { task: 'Receiving data from all agents...', logs: ['[INFO] Waiting on ERP, WMS, TMS'], data: [], progress: 10, confidence: 0 },
    { task: 'Running root cause analysis...', logs: ['[INFO] Model: supply-chain-v3', '[INFO] Analyzing 3 data streams'], data: ['Root cause identified'], progress: 35, confidence: 0 },
    { task: 'Calculating business impact...', logs: ['[INFO] SLA breach probability: 98%', '[INFO] Financial exposure: $28,450'], data: ['Root cause identified', 'Impact: SLA breach'], progress: 60, confidence: 0 },
    { task: 'Generating recommendations...', logs: ['[INFO] 4 actions generated', '[INFO] Priority sorted by urgency'], data: ['Root cause identified', 'Impact: SLA breach', '4 recommendations ready'], progress: 85, confidence: 0 },
    { task: 'Decision published', logs: ['[OK] Confidence: 96%', '[OK] Sent to Supervisor Agent', '[OK] All systems notified'], data: ['Root cause identified', 'Impact: SLA breach', '4 recommendations ready', 'Confidence: 96%'], progress: 100, confidence: 96 },
  ],
};

type LogTab = 'logs' | 'inspect' | 'json' | 'retry';

function AgentCard({ agent, onRetry }: { agent: Agent; onRetry: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<LogTab>('logs');

  const statusColor = agent.status === 'complete' ? '#10b981' : agent.status === 'running' ? agent.color : agent.status === 'error' ? '#ef4444' : '#ffffff30';
  const StatusIcon = agent.status === 'complete' ? CheckCircle : agent.status === 'running' ? Loader2 : agent.status === 'error' ? AlertCircle : Bot;

  return (
    <div className={cn(
      "rounded-xl border transition-all duration-300",
      agent.status === 'running' ? `border-[${agent.color}]/30` : 'border-white/6',
    )} style={{ background: '#111416', borderColor: agent.status === 'running' ? agent.color + '30' : undefined }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center text-base shrink-0"
          style={{ background: agent.color + '18', color: agent.color }}>
          {agent.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white">{agent.name}</p>
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded" style={{ background: statusColor + '20', color: statusColor }}>
              {agent.status}
            </span>
            {agent.status === 'running' && <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: agent.color }} />}
          </div>
          <p className="text-[10px] text-white/35 truncate">{agent.role}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-mono text-white/50">{agent.executionTime > 0 ? `${(agent.executionTime / 1000).toFixed(1)}s` : '—'}</p>
          {agent.confidence > 0 && <p className="text-[10px] font-bold" style={{ color: agent.color }}>{agent.confidence}% conf</p>}
        </div>
        <button onClick={() => setExpanded(v => !v)} className="text-white/20 hover:text-white/60 transition-colors ml-1">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Progress bar */}
      {agent.status !== 'idle' && (
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] text-white/40 truncate">{agent.currentTask}</p>
            <p className="text-[10px] text-white/30 ml-2 shrink-0">{agent.progress}%</p>
          </div>
          <div className="h-1 rounded-full bg-white/5">
            <motion.div className="h-1 rounded-full" animate={{ width: `${agent.progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }} style={{ background: agent.color }} />
          </div>
        </div>
      )}

      {/* Data retrieved chips */}
      {agent.dataRetrieved.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {agent.dataRetrieved.map(d => (
            <span key={d} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-white/40">{d}</span>
          ))}
        </div>
      )}

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="border-t border-white/5">
              {/* Tabs */}
              <div className="px-4 pt-2 pb-1 flex gap-2">
                {(['logs', 'inspect', 'json', 'retry'] as LogTab[]).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={cn("text-[10px] px-2.5 py-1 rounded-md capitalize transition-all",
                      tab === t ? "bg-white/8 text-white font-medium" : "text-white/30 hover:text-white/60")}>
                    {t === 'logs' && <Terminal className="h-3 w-3 inline mr-1 -mt-0.5" />}
                    {t === 'inspect' && <List className="h-3 w-3 inline mr-1 -mt-0.5" />}
                    {t === 'json' && <Code className="h-3 w-3 inline mr-1 -mt-0.5" />}
                    {t === 'retry' && <RotateCcw className="h-3 w-3 inline mr-1 -mt-0.5" />}
                    {t}
                  </button>
                ))}
              </div>

              <div className="px-4 pb-4">
                {tab === 'logs' && (
                  <div className="bg-black/30 rounded-lg p-3 font-mono text-[10px] text-green-400/80 space-y-1 max-h-32 overflow-y-auto">
                    {agent.logs.length === 0
                      ? <p className="text-white/20">No logs yet.</p>
                      : agent.logs.map((l, i) => <p key={i}>{l}</p>)}
                  </div>
                )}
                {tab === 'inspect' && (
                  <div className="space-y-1.5">
                    {[
                      { k: 'Agent ID', v: agent.id },
                      { k: 'Status', v: agent.status },
                      { k: 'Progress', v: `${agent.progress}%` },
                      { k: 'Confidence', v: agent.confidence > 0 ? `${agent.confidence}%` : 'N/A' },
                      { k: 'Exec Time', v: agent.executionTime > 0 ? `${agent.executionTime}ms` : 'N/A' },
                      { k: 'Current Task', v: agent.currentTask },
                    ].map(row => (
                      <div key={row.k} className="flex gap-3 text-[10px]">
                        <span className="text-white/30 w-24 shrink-0">{row.k}</span>
                        <span className="text-white/70 font-mono">{row.v}</span>
                      </div>
                    ))}
                  </div>
                )}
                {tab === 'json' && (
                  <pre className="bg-black/30 rounded-lg p-3 text-[9px] text-white/50 max-h-48 overflow-auto leading-relaxed">
                    {JSON.stringify(MOCK_PAYLOADS[agent.payloadKey]?.response ?? {}, null, 2)}
                  </pre>
                )}
                {tab === 'retry' && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-white/40">Retry this agent with the current shipment context.</p>
                    <button onClick={() => onRetry(agent.id)}
                      className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium transition-all"
                      style={{ background: agent.color + '20', color: agent.color, border: `1px solid ${agent.color}30` }}>
                      <RotateCcw className="h-3 w-3" /> Retry Agent
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CTAICommand({ onToast }: { onToast: (msg: string) => void }) {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (intervalRef.current) clearInterval(intervalRef.current);
    setAgents(INITIAL_AGENTS);
    setRunning(false);
    setElapsed(0);
  };

  const run = () => {
    reset();
    setRunning(true);
    const start = Date.now();
    intervalRef.current = setInterval(() => setElapsed(Date.now() - start), 200);

    const agentDelays: Record<string, number> = { supervisor: 0, erp: 400, wms: 600, tms: 800, decision: 3200 };
    const stepMs = 700;

    Object.entries(AGENT_SEQUENCES).forEach(([agentId, steps]) => {
      const baseDelay = agentDelays[agentId] ?? 0;

      // Queue the agent
      timers.current.push(setTimeout(() => {
        setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'queued', currentTask: 'Queued for execution...' } : a));
      }, baseDelay));

      // Run through steps
      steps.forEach((step, i) => {
        timers.current.push(setTimeout(() => {
          setAgents(prev => prev.map(a => a.id === agentId ? {
            ...a,
            status: i < steps.length - 1 ? 'running' : 'complete',
            progress: step.progress,
            confidence: step.confidence,
            currentTask: step.task,
            logs: [...a.logs, ...step.logs],
            dataRetrieved: step.data.length ? step.data : a.dataRetrieved,
            executionTime: Date.now() - start - baseDelay,
          } : a));
        }, baseDelay + (i + 1) * stepMs));
      });
    });

    // Done
    const totalMs = Math.max(...Object.values(agentDelays)) + (5 + 1) * stepMs + 400;
    timers.current.push(setTimeout(() => {
      setRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      onToast('All agents completed — decision published');
    }, totalMs));
  };

  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">AI Command Center</h2>
          <p className="text-xs text-white/40 mt-0.5">5 autonomous agents — SHP-1024 · Nexus Pharmaceuticals PLATINUM</p>
        </div>
        <div className="flex items-center gap-2">
          {running && <p className="text-xs text-white/40 font-mono">{(elapsed / 1000).toFixed(1)}s</p>}
          <button onClick={reset} className="h-8 px-3 rounded-lg text-xs text-white/50 hover:text-white border border-white/8 hover:bg-white/5 transition-all flex items-center gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <button onClick={run} disabled={running}
            className="h-8 px-4 rounded-lg text-xs font-semibold text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
            style={{ background: running ? '#00c2b220' : '#00c2b2', color: running ? '#00c2b2' : '#000' }}>
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            {running ? 'Running...' : 'Run Agents'}
          </button>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="space-y-3">
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} onRetry={id => { reset(); onToast(`Retrying ${id} agent...`); }} />
        ))}
      </div>

      {/* Decision Output */}
      <AnimatePresence>
        {agents.every(a => a.status === 'complete') && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-[#00c2b2]/20 overflow-hidden" style={{ background: '#0d1a18' }}>
            <div className="px-5 py-4 border-b border-[#00c2b2]/10">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#00c2b2]" />
                <h3 className="text-sm font-bold text-white">Decision Output</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00c2b2]/15 text-[#00c2b2] border border-[#00c2b2]/30">96% Confidence</span>
              </div>
            </div>
            <div className="p-5 grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] text-red-400/70 uppercase tracking-widest mb-2 font-semibold">Root Cause</p>
                <p className="text-xs text-white/70 leading-relaxed">Dock equipment failure at Dock 7-B caused 95-min loading delay, resulting in missed departure window for SHP-1024.</p>
              </div>
              <div>
                <p className="text-[10px] text-amber-400/70 uppercase tracking-widest mb-2 font-semibold">Business Impact</p>
                <div className="space-y-1 text-xs text-white/60">
                  <p>SLA breach risk: <span className="text-red-400 font-medium">98% probability</span></p>
                  <p>Financial exposure: <span className="text-amber-400 font-medium">$28,450</span></p>
                  <p>Customer tier: <span className="text-[#00c2b2] font-medium">PLATINUM</span></p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-[#00c2b2]/70 uppercase tracking-widest mb-2 font-semibold">Top Action</p>
                <div className="text-xs text-white/70 leading-relaxed">
                  <span className="text-[#00c2b2] font-medium">IMMEDIATE:</span> Reassign load to Dock 9-A and notify Nexus Pharmaceuticals of updated ETA 22:00 CST.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
