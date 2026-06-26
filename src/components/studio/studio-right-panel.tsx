"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Code, Brain, Settings, CheckCircle, Loader2, AlertCircle,
  ChevronRight, Clock, RotateCcw, Play, Square, X, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type WorkflowNode, type ApiCall, MOCK_API_CALLS
} from "./studio-data";

type RightTab = 'execution' | 'inspector' | 'decision' | 'config';
type InspectorTab = 'response' | 'request' | 'headers' | 'raw';

const STATUS_COLOR: Record<string, string> = {
  idle: '#ffffff30', queued: '#6366f1', authenticating: '#f59e0b',
  running: '#00c2b2', complete: '#10b981', error: '#ef4444', paused: '#f97316',
};
const STATUS_LABEL: Record<string, string> = {
  idle: 'IDLE', queued: 'QUEUED', authenticating: 'AUTHENTICATING',
  running: 'RUNNING', complete: 'COMPLETE', error: 'ERROR', paused: 'PAUSED',
};

function ExecutionPanel({ nodes }: { nodes: WorkflowNode[] }) {
  const active = nodes.filter(n => n.status !== 'idle');
  const completed = nodes.filter(n => n.status === 'complete').length;
  const total = nodes.length;

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
      {/* Overall progress */}
      <div className="px-2 py-2 rounded-lg bg-white/3 border border-white/5">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] text-white/50 font-medium">Workflow Progress</p>
          <p className="text-[10px] font-bold text-[#00c2b2]">{completed}/{total}</p>
        </div>
        <div className="h-1 rounded-full bg-white/5">
          <motion.div className="h-1 rounded-full bg-[#00c2b2]"
            animate={{ width: `${(completed / total) * 100}%` }} transition={{ duration: 0.5 }} />
        </div>
      </div>

      {/* Node execution states */}
      {nodes.map(node => (
        <div key={node.id} className={cn(
          "rounded-lg border px-3 py-2.5 transition-all duration-300",
          node.status === 'complete' ? 'border-emerald-500/15 bg-emerald-500/5' :
          node.status === 'running' || node.status === 'authenticating' ? 'border-white/10 bg-white/4' :
          node.status === 'error' ? 'border-red-500/20 bg-red-500/5' :
          'border-white/4 bg-transparent opacity-50'
        )}>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 w-1.5 rounded-full shrink-0"
              style={{ background: STATUS_COLOR[node.status], animation: (node.status === 'running' || node.status === 'authenticating') ? 'pulse 1.5s infinite' : undefined }} />
            <span className="text-[11px] font-semibold text-white/80 flex-1">{node.label}</span>
            <span className="text-[9px] font-bold" style={{ color: STATUS_COLOR[node.status] }}>
              {STATUS_LABEL[node.status]}
            </span>
          </div>

          {/* Progress bar */}
          {node.status !== 'idle' && (
            <div className="h-0.5 rounded-full bg-white/5 mb-1.5">
              <motion.div className="h-0.5 rounded-full" animate={{ width: `${node.progress}%` }} transition={{ duration: 0.4 }}
                style={{ background: STATUS_COLOR[node.status] }} />
            </div>
          )}

          {/* Step logs */}
          <div className="space-y-0.5">
            {node.logs.slice(-4).map((log, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className={cn("text-[8px] shrink-0 mt-0.5",
                  log.level === 'success' ? 'text-emerald-400' :
                  log.level === 'error' ? 'text-red-400' :
                  log.level === 'warn' ? 'text-amber-400' : 'text-white/25')}>
                  {log.level === 'success' ? '✓' : log.level === 'error' ? '✗' : log.level === 'warn' ? '!' : '·'}
                </span>
                <p className="text-[9px] text-white/40 font-mono leading-tight">{log.msg}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ApiInspector({ nodes, selectedNode }: { nodes: WorkflowNode[]; selectedNode: string | null }) {
  const [selectedCall, setSelectedCall] = useState<string | null>(null);
  const [tab, setTab] = useState<InspectorTab>('response');

  const allCalls = nodes.flatMap(n => n.apiCalls);

  const callKeyMap: Record<string, string> = {
    '/erp/salesOrders/SO-289341': 'erp_orders',
    '/erp/inventory/PHARM-4421': 'erp_inventory',
    '/catalog/sku/PHARM-4421': 'sku_catalog',
    '/wms/warehouse/orders/SO-289341': 'wms_warehouse',
    '/tms/shipments/SHP-1024': 'tms_shipment',
    '/carriers/fedex/track/SHP-1024': 'carrier_track',
  };

  const selected = allCalls.find(c => c.id === selectedCall);
  const mockKey = selected ? (callKeyMap[selected.endpoint] ?? 'erp_orders') : null;
  const mock = mockKey ? MOCK_API_CALLS[mockKey] : null;

  const METHOD_COLORS: Record<string, string> = {
    GET: 'text-blue-400 bg-blue-400/10',
    POST: 'text-emerald-400 bg-emerald-400/10',
    PUT: 'text-amber-400 bg-amber-400/10',
    DELETE: 'text-red-400 bg-red-400/10',
  };

  if (allCalls.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Code className="h-8 w-8 text-white/10 mx-auto mb-2" />
          <p className="text-xs text-white/20">Execute workflow to inspect API calls</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Call list */}
      <div className="border-b border-white/5 max-h-44 overflow-y-auto">
        {allCalls.map(call => (
          <div key={call.id} onClick={() => setSelectedCall(call.id)}
            className={cn("flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-white/3 border-b border-white/4 transition-colors",
              selectedCall === call.id && "bg-[#00c2b2]/5 border-[#00c2b2]/10")}>
            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0", METHOD_COLORS[call.method])}>{call.method}</span>
            <span className="text-[10px] font-mono text-white/50 flex-1 truncate">{call.endpoint}</span>
            <span className={cn("text-[10px] font-bold shrink-0", call.status < 300 ? 'text-emerald-400' : 'text-red-400')}>{call.status}</span>
            <span className="text-[9px] text-white/25 shrink-0">{call.latency}ms</span>
          </div>
        ))}
      </div>

      {/* Detail */}
      {selected && mock ? (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-3 pt-2 pb-1 flex gap-1 border-b border-white/5">
            {(['response', 'request', 'headers', 'raw'] as InspectorTab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={cn("text-[9px] px-2 py-1 rounded capitalize transition-all",
                  tab === t ? "bg-white/8 text-white" : "text-white/30 hover:text-white/60")}>
                {t}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <Clock className="h-3 w-3 text-white/20" />
              <span className="text-[9px] text-white/30">{selected.latency}ms</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-3">
            {tab === 'response' && (
              <pre className="text-[9px] font-mono text-white/50 leading-relaxed whitespace-pre-wrap">
                {JSON.stringify(mock.response, null, 2)}
              </pre>
            )}
            {tab === 'request' && (
              <pre className="text-[9px] font-mono text-white/50 leading-relaxed whitespace-pre-wrap">
                {JSON.stringify(mock.request, null, 2)}
              </pre>
            )}
            {tab === 'headers' && (
              <div className="space-y-2">
                {Object.entries(mock.headers).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-[9px] font-mono text-white/30 w-28 shrink-0">{k}</span>
                    <span className="text-[9px] font-mono text-white/50 break-all">{v}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === 'raw' && (
              <pre className="text-[9px] font-mono text-[#00c2b2]/60 leading-relaxed whitespace-pre-wrap">
                {`HTTP/1.1 200 OK\nContent-Type: application/json\nX-Response-Time: ${selected.latency}ms\n\n`}
                {JSON.stringify(mock.response)}
              </pre>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[10px] text-white/20">Select a request to inspect</p>
        </div>
      )}
    </div>
  );
}

function DecisionPanel({ nodes }: { nodes: WorkflowNode[] }) {
  const decisionNode = nodes.find(n => n.id === 'decision');
  const isDone = decisionNode?.status === 'complete';
  const mock = MOCK_API_CALLS.decision_result.response as {
    rootCause: string;
    businessImpact: { slaRisk: string; financialExposure: number; customerTier: string; downstreamOrders: number };
    recommendations: { rank: number; action: string; detail: string; urgency: string; confidence: number }[];
    confidence: number;
  };

  if (!isDone) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-8 w-8 text-white/10 mx-auto mb-2" />
          <p className="text-xs text-white/20">Decision panel populates after execution</p>
        </div>
      </div>
    );
  }

  const actions = [
    { label: 'Approve & Execute', color: '#00c2b2', primary: true },
    { label: 'Reject', color: '#ef4444', primary: false },
    { label: 'Run Automatically', color: '#8b5cf6', primary: false },
    { label: 'Notify Customer', color: '#3b82f6', primary: false },
    { label: 'Update ERP', color: '#3b82f6', primary: false },
    { label: 'Update WMS', color: '#f59e0b', primary: false },
    { label: 'Update TMS', color: '#10b981', primary: false },
    { label: 'Generate Report', color: '#6366f1', primary: false },
    { label: 'Escalate Incident', color: '#ef4444', primary: false },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
      {/* Confidence */}
      <div className="rounded-lg bg-[#00c2b2]/8 border border-[#00c2b2]/20 px-3 py-2 flex items-center gap-3">
        <div className="relative h-10 w-10 shrink-0">
          <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#ffffff08" strokeWidth="4" />
            <circle cx="20" cy="20" r="16" fill="none" stroke="#00c2b2" strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 16 * mock.confidence} ${2 * Math.PI * 16}`} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] font-bold text-[#00c2b2]">{Math.round(mock.confidence * 100)}%</span>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold text-white">AI Confidence Score</p>
          <p className="text-[9px] text-[#00c2b2]/70">Decision ready for review</p>
        </div>
      </div>

      {/* Root cause */}
      <div className="rounded-lg bg-red-500/5 border border-red-500/15 px-3 py-2">
        <p className="text-[9px] text-red-400/70 uppercase tracking-widest mb-1 font-semibold">Root Cause</p>
        <p className="text-[10px] text-white/60 leading-relaxed">{mock.rootCause}</p>
      </div>

      {/* Business impact */}
      <div className="rounded-lg bg-amber-500/5 border border-amber-500/15 px-3 py-2">
        <p className="text-[9px] text-amber-400/70 uppercase tracking-widest mb-1.5 font-semibold">Business Impact</p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'SLA Risk', value: mock.businessImpact.slaRisk, alert: true },
            { label: 'Financial', value: `$${(mock.businessImpact.financialExposure / 1000).toFixed(0)}K`, alert: true },
            { label: 'Customer', value: mock.businessImpact.customerTier, alert: false },
            { label: 'Downstream', value: `${mock.businessImpact.downstreamOrders} orders`, alert: false },
          ].map(i => (
            <div key={i.label} className="bg-white/3 rounded-md px-2 py-1">
              <p className="text-[8px] text-white/25">{i.label}</p>
              <p className={cn("text-[10px] font-bold", i.alert ? 'text-amber-400' : 'text-white/60')}>{i.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <p className="text-[9px] text-[#00c2b2]/70 uppercase tracking-widest mb-1.5 font-semibold px-1">Recommendations</p>
        <div className="space-y-1.5">
          {mock.recommendations.map(r => (
            <div key={r.rank} className="rounded-lg bg-white/3 border border-white/6 px-2.5 py-2">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[8px] font-bold text-[#00c2b2] w-4">{r.rank}.</span>
                <span className="text-[9px] font-mono font-bold text-white/70">{r.action}</span>
                <span className={cn("ml-auto text-[8px] font-bold px-1.5 rounded",
                  r.urgency === 'IMMEDIATE' ? 'text-red-400 bg-red-400/10' :
                  r.urgency === 'HIGH' ? 'text-amber-400 bg-amber-400/10' :
                  'text-white/30 bg-white/5')}>
                  {r.urgency}
                </span>
              </div>
              <p className="text-[9px] text-white/40 leading-tight pl-6">{r.detail}</p>
              <div className="flex items-center gap-1 mt-1 pl-6">
                <div className="h-0.5 flex-1 rounded-full bg-white/5">
                  <div className="h-0.5 rounded-full bg-[#00c2b2]" style={{ width: `${r.confidence * 100}%` }} />
                </div>
                <span className="text-[8px] text-white/25">{Math.round(r.confidence * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div>
        <p className="text-[9px] text-white/25 uppercase tracking-widest mb-1.5 px-1">Actions</p>
        <div className="grid grid-cols-2 gap-1.5">
          {actions.map(a => (
            <button key={a.label}
              className="text-[9px] px-2 py-1.5 rounded-lg border text-center transition-all hover:opacity-80 font-medium"
              style={a.primary
                ? { background: a.color, color: '#000', borderColor: a.color }
                : { background: a.color + '12', color: a.color, borderColor: a.color + '25' }}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentConfig({ node }: { node: WorkflowNode | null }) {
  if (!node) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-8 w-8 text-white/10 mx-auto mb-2" />
          <p className="text-xs text-white/20">Select a node to configure</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
      {/* Node header */}
      <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-white/3 border border-white/6">
        <div className="h-7 w-7 rounded-lg flex items-center justify-center text-base" style={{ background: node.color + '18', color: node.color }}>{node.icon}</div>
        <div>
          <p className="text-xs font-bold text-white">{node.label}</p>
          <p className="text-[9px] text-white/35">{node.sublabel}</p>
        </div>
      </div>

      {/* Config fields */}
      {[
        { label: 'System Instructions', type: 'textarea', value: `You are the ${node.label} responsible for ${node.sublabel}. Authenticate, retrieve operational data, validate fields and return structured JSON context to the Supervisor Agent.` },
        { label: 'Memory', type: 'select', options: ['Conversation', 'Persistent', 'None'] },
        { label: 'Retry Policy', type: 'select', options: ['3 retries — exponential', '1 retry — linear', 'No retry'] },
        { label: 'Timeout (s)', type: 'input', value: '30' },
        { label: 'Confidence Threshold', type: 'input', value: '0.85' },
      ].map(f => (
        <div key={f.label}>
          <label className="text-[9px] text-white/30 uppercase tracking-wider mb-1 block">{f.label}</label>
          {f.type === 'textarea' ? (
            <textarea defaultValue={f.value} rows={3}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white/4 border border-white/6 text-[10px] text-white/50 outline-none resize-none font-mono leading-relaxed" />
          ) : f.type === 'select' ? (
            <select defaultValue={f.options?.[0]}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white/4 border border-white/6 text-[10px] text-white/50 outline-none">
              {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input defaultValue={f.value}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white/4 border border-white/6 text-[10px] text-white/50 outline-none font-mono" />
          )}
        </div>
      ))}

      {/* Toggles */}
      {[
        { label: 'Parallel Execution', on: node.type !== 'decision' },
        { label: 'Human Approval Required', on: node.type === 'decision' },
      ].map(t => (
        <div key={t.label} className="flex items-center justify-between">
          <span className="text-[10px] text-white/50">{t.label}</span>
          <div className={cn("h-4 w-7 rounded-full relative cursor-pointer", t.on ? "bg-[#00c2b2]" : "bg-white/10")}>
            <div className={cn("absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all", t.on ? "left-3.5" : "left-0.5")} />
          </div>
        </div>
      ))}
    </div>
  );
}

interface StudioRightPanelProps {
  nodes: WorkflowNode[];
  selectedNode: string | null;
}

export function StudioRightPanel({ nodes, selectedNode }: StudioRightPanelProps) {
  const [tab, setTab] = useState<RightTab>('execution');
  const selectedNodeData = nodes.find(n => n.id === selectedNode) ?? null;

  const TABS: { id: RightTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'execution', label: 'Execution', icon: Activity },
    { id: 'inspector', label: 'Inspector', icon: Code },
    { id: 'decision', label: 'Decision', icon: Brain },
    { id: 'config', label: 'Config', icon: Settings },
  ];

  return (
    <aside className="w-72 shrink-0 flex flex-col border-l border-white/6 overflow-hidden" style={{ background: '#090b0c' }}>
      {/* Tabs */}
      <div className="flex border-b border-white/6 shrink-0">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[9px] transition-all",
              tab === t.id ? "text-[#00c2b2] border-b-2 border-[#00c2b2]" : "text-white/25 hover:text-white/50")}>
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {tab === 'execution' && <ExecutionPanel nodes={nodes} />}
        {tab === 'inspector' && <ApiInspector nodes={nodes} selectedNode={selectedNode} />}
        {tab === 'decision' && <DecisionPanel nodes={nodes} />}
        {tab === 'config' && <AgentConfig node={selectedNodeData} />}
      </div>
    </aside>
  );
}
