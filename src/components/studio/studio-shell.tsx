"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Square, Save, GitBranch, RotateCcw, Plus, Copy, Trash2,
  Zap, Clock, CheckCircle, AlertCircle, ChevronDown, History, Upload, FlaskConical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StudioLeftPanel } from "./studio-left-panel";
import { StudioCanvas } from "./studio-canvas";
import { StudioRightPanel } from "./studio-right-panel";
import {
  INITIAL_NODES, INITIAL_EDGES,
  type WorkflowNode, type Edge, type LogEntry, type ApiCall,
  MOCK_API_CALLS, NODE_W, NODE_H,
  type ConnectorDef
} from "./studio-data";

// ─── Execution engine ──────────────────────────────────────────────────────────

function makeLog(level: LogEntry['level'], msg: string): LogEntry {
  return { ts: Date.now(), level, msg };
}

function makeApiCall(nodeId: string, endpoint: string, method: ApiCall['method'], status: number, latency: number): ApiCall {
  return {
    id: `${nodeId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    endpoint, method, status, latency,
    requestBody: {}, responseBody: {},
    headers: { 'Authorization': 'Bearer ...', 'X-Agent': nodeId },
    ts: Date.now(),
    nodeId,
  };
}

const NODE_SEQUENCES: Record<string, { steps: string[]; logs: LogEntry[][]; apiTrigger?: { endpoint: string; method: ApiCall['method']; stepIdx: number; status: number; latency: number } }> = {
  start: {
    steps: ['Trigger fired'],
    logs: [[makeLog('info', '[TRIGGER] Workflow initiated'), makeLog('success', '[OK] Supervisor dispatched')]],
  },
  supervisor: {
    steps: ['Initializing context', 'Dispatching ERP Agent', 'Dispatching SKU Agent'],
    logs: [
      [makeLog('info', '[INIT] Loading enterprise context')],
      [makeLog('info', '[DISPATCH] ERP Agent queued'), makeLog('info', '[DISPATCH] SKU Agent queued')],
      [makeLog('success', '[OK] All sub-agents dispatched')],
    ],
  },
  erp: {
    steps: ['Authenticating OAuth2', 'GET /salesOrders/{id}', 'Parsing Sales Order', 'GET /inventory/{sku}', 'Validating SLA'],
    logs: [
      [makeLog('info', '[AUTH] OAuth2 token request'), makeLog('success', '[OK] Token acquired — expires 3h')],
      [makeLog('info', '[API] GET /erp/salesOrders/SO-289341'), makeLog('success', '[200] 145ms — Sales order retrieved')],
      [makeLog('info', '[PARSE] Extracting customer, SKU, SLA fields'), makeLog('success', '[OK] 8 fields validated')],
      [makeLog('info', '[API] GET /erp/inventory/PHARM-4421'), makeLog('success', '[200] 98ms — Inventory loaded')],
      [makeLog('info', '[VALIDATE] SLA deadline: 2024-01-16T06:00Z'), makeLog('warn', '[WARN] SLA breach risk detected')],
    ],
    apiTrigger: { endpoint: '/erp/salesOrders/SO-289341', method: 'GET', stepIdx: 1, status: 200, latency: 145 },
  },
  sku: {
    steps: ['Fetching SKU catalog', 'Checking hazmat flags', 'Resolving packaging', 'Temperature requirements'],
    logs: [
      [makeLog('info', '[API] GET /catalog/sku/PHARM-4421'), makeLog('success', '[200] 112ms')],
      [makeLog('warn', '[HAZMAT] Class 6.1 — UN2810 detected'), makeLog('info', '[INFO] Cold chain required')],
      [makeLog('info', '[PKG] Cold Chain Box × 12 vials')],
      [makeLog('success', '[OK] Temp: 2–8°C — monitored')],
    ],
    apiTrigger: { endpoint: '/catalog/sku/PHARM-4421', method: 'GET', stepIdx: 0, status: 200, latency: 112 },
  },
  wms: {
    steps: ['Authenticating Bearer', 'GET /warehouse/orders/{id}', 'Checking dock assignment', 'Fetching exceptions'],
    logs: [
      [makeLog('info', '[AUTH] Bearer token validated')],
      [makeLog('info', '[API] GET /wms/warehouse/orders/SO-289341'), makeLog('success', '[200] 212ms')],
      [makeLog('error', '[EXCEPTION] Dock 7-B — forklift malfunction'), makeLog('info', '[INFO] Dock 9-A available')],
      [makeLog('warn', '[WARN] Loading delayed 95 min'), makeLog('success', '[OK] WMS context ready')],
    ],
    apiTrigger: { endpoint: '/wms/warehouse/orders/SO-289341', method: 'GET', stepIdx: 1, status: 200, latency: 212 },
  },
  tms: {
    steps: ['Authenticating API Key', 'GET /shipments/{id}', 'Fetching GPS & ETA', 'Traffic analysis'],
    logs: [
      [makeLog('info', '[AUTH] API key validated — Oracle TMS')],
      [makeLog('info', '[API] GET /tms/shipments/SHP-1024'), makeLog('success', '[200] 178ms')],
      [makeLog('info', '[GPS] Carrier at Chicago WH waiting'), makeLog('warn', '[ETA] Delayed +240 min')],
      [makeLog('success', '[OK] TMS context ready')],
    ],
    apiTrigger: { endpoint: '/tms/shipments/SHP-1024', method: 'GET', stepIdx: 1, status: 200, latency: 178 },
  },
  carrier: {
    steps: ['Calling FedEx API', 'Proof of Delivery', 'Live ETA update'],
    logs: [
      [makeLog('info', '[API] GET /carriers/fedex/track/SHP-1024'), makeLog('warn', '[EXCEPTION] Pickup delay')],
      [makeLog('info', '[POD] Signature required — pending')],
      [makeLog('success', '[OK] New ETA: 2024-01-16T09:00Z')],
    ],
    apiTrigger: { endpoint: '/carriers/fedex/track/SHP-1024', method: 'GET', stepIdx: 0, status: 200, latency: 156 },
  },
  edi: {
    steps: ['Auth AS2 middleware', 'Receiving 214 Status', 'Processing 856 ASN', 'Generating 810 Invoice'],
    logs: [
      [makeLog('info', '[AS2] Handshake complete — NEXUS-PHARMA')],
      [makeLog('info', '[EDI] X12-214 received — status AG'), makeLog('success', '[997] Acknowledged')],
      [makeLog('info', '[EDI] 856 ASN parsed — 240 units')],
      [makeLog('success', '[EDI] 810 Invoice generated — $284,500')],
    ],
  },
  decision: {
    steps: ['Merging enterprise context', 'Detecting inconsistencies', 'Validating business rules', 'Predicting downstream impact', 'Generating recommendations'],
    logs: [
      [makeLog('info', '[MERGE] Aggregating ERP+WMS+TMS+Carrier+EDI')],
      [makeLog('warn', '[DETECT] Loading delay vs SLA deadline conflict')],
      [makeLog('info', '[VALIDATE] PLATINUM SLA — 24h window')],
      [makeLog('warn', '[IMPACT] 3 downstream orders at risk — $28,450 exposure')],
      [makeLog('success', '[DECISION] 4 recommendations generated — 96% confidence')],
    ],
  },
};

const STEP_DURATION = 550;

export function StudioShell() {
  const [nodes, setNodes] = useState<WorkflowNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<Edge[]>(INITIAL_EDGES);
  const [running, setRunning] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [workflowName] = useState('SHP-1024 Resolution Flow');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const pushToast = (msg: string) => setToast(msg);

  const resetAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (ivRef.current) clearInterval(ivRef.current);
    setNodes(INITIAL_NODES.map(n => ({ ...n })));
    setEdges(INITIAL_EDGES.map(e => ({ ...e, animated: false })));
    setRunning(false);
    setElapsed(0);
  }, []);

  const runWorkflow = useCallback(() => {
    resetAll();
    setRunning(true);
    const start = Date.now();
    ivRef.current = setInterval(() => setElapsed(Date.now() - start), 100);

    INITIAL_NODES.forEach(node => {
      const seq = NODE_SEQUENCES[node.id];
      if (!seq) return;
      const baseDelay = node.runDelay;

      // Queued
      timers.current.push(setTimeout(() => {
        setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'queued', progress: 0 } : n));
      }, baseDelay));

      // Authenticating (first step)
      timers.current.push(setTimeout(() => {
        setNodes(prev => prev.map(n => n.id === node.id ? {
          ...n, status: 'authenticating', progress: 5, currentStep: 0,
          logs: [...n.logs, ...seq.logs[0]],
        } : n));
      }, baseDelay + 100));

      // Each subsequent step
      seq.steps.forEach((step, i) => {
        const stepDelay = baseDelay + 200 + i * STEP_DURATION;
        timers.current.push(setTimeout(() => {
          const logs = seq.logs[i] ?? [];
          const progress = Math.round(((i + 1) / seq.steps.length) * 100);
          const apiCall = seq.apiTrigger && seq.apiTrigger.stepIdx === i
            ? makeApiCall(node.id, seq.apiTrigger.endpoint, seq.apiTrigger.method, seq.apiTrigger.status, seq.apiTrigger.latency)
            : null;

          setNodes(prev => prev.map(n => n.id === node.id ? {
            ...n,
            status: i === seq.steps.length - 1 ? 'running' : 'running',
            progress,
            currentStep: i,
            logs: [...n.logs, ...logs],
            apiCalls: apiCall ? [...n.apiCalls, apiCall] : n.apiCalls,
          } : n));

          // Animate edge from previous node
          if (i === seq.steps.length - 2) {
            setEdges(prev => prev.map(e => e.from === node.id ? { ...e, animated: true } : e));
          }
        }, stepDelay));
      });

      // Complete
      const completedAt = baseDelay + 200 + seq.steps.length * STEP_DURATION;
      timers.current.push(setTimeout(() => {
        setNodes(prev => prev.map(n => n.id === node.id ? {
          ...n, status: 'complete', progress: 100, currentStep: seq.steps.length - 1,
          logs: [...n.logs, makeLog('success', `[✓] ${node.label} complete`)],
        } : n));
        setEdges(prev => prev.map(e => e.from === node.id ? { ...e, animated: true } : e));
      }, completedAt));
    });

    // All done
    const totalMs = Math.max(...INITIAL_NODES.map(n => n.runDelay + 200 + (NODE_SEQUENCES[n.id]?.steps.length ?? 1) * STEP_DURATION)) + 500;
    timers.current.push(setTimeout(() => {
      setRunning(false);
      if (ivRef.current) clearInterval(ivRef.current);
      pushToast('✓ Workflow complete — Decision ready');
    }, totalMs));
  }, [resetAll]);

  const toggleExpand = (id: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, expanded: !n.expanded } : n));
  };

  const handleDrop = (connector: unknown, x: number, y: number) => {
    const c = connector as ConnectorDef;
    const newNode: WorkflowNode = {
      id: `custom-${Date.now()}`,
      label: c.label,
      sublabel: c.sublabel,
      type: c.type,
      color: c.color,
      icon: c.icon,
      x: Math.max(0, x),
      y: Math.max(0, y),
      status: 'idle', progress: 0, currentStep: 0, expanded: false,
      logs: [], apiCalls: [],
      runDelay: 99999,
      steps: [{ label: 'Configure agent', duration: 500 }],
    };
    setNodes(prev => [...prev, newNode]);
    pushToast(`Added ${c.label} to canvas`);
  };

  const completedCount = nodes.filter(n => n.status === 'complete').length;
  const errorCount = nodes.filter(n => n.status === 'error').length;
  const allDone = !running && completedCount > 0;

  return (
    <div className="flex flex-col h-full" style={{ background: '#0a0c0d' }}>
      {/* Top Toolbar */}
      <div className="h-12 shrink-0 flex items-center gap-3 px-4 border-b border-white/6" style={{ background: '#090b0c' }}>
        {/* Workflow name + status */}
        <div className="flex items-center gap-2">
          <GitBranch className="h-3.5 w-3.5 text-[#00c2b2]/60" />
          <span className="text-sm font-semibold text-white/80">{workflowName}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00c2b2]/10 text-[#00c2b2] border border-[#00c2b2]/20">v1.4.2</span>
        </div>

        <div className="h-4 w-px bg-white/8 mx-1" />

        {/* Run controls */}
        <button onClick={runWorkflow} disabled={running}
          className="flex items-center gap-1.5 h-7 px-4 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
          style={running
            ? { background: '#00c2b220', color: '#00c2b2', border: '1px solid #00c2b230' }
            : { background: '#00c2b2', color: '#000' }}>
          {running
            ? <><div className="h-2.5 w-2.5 rounded-full bg-[#00c2b2] animate-pulse" /> Executing...</>
            : <><Play className="h-3 w-3" /> Execute Workflow</>}
        </button>

        {running && (
          <button onClick={resetAll} className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs text-white/50 hover:text-white border border-white/8 hover:bg-white/5 transition-all">
            <Square className="h-3 w-3" /> Stop
          </button>
        )}

        <button onClick={resetAll} className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs text-white/40 hover:text-white border border-white/6 hover:bg-white/4 transition-all">
          <RotateCcw className="h-3 w-3" /> Reset
        </button>

        <div className="h-4 w-px bg-white/8 mx-1" />

        {/* Workflow actions */}
        {[
          { icon: Plus, label: 'Add Agent' },
          { icon: Copy, label: 'Clone' },
          { icon: Save, label: 'Save' },
          { icon: History, label: 'History' },
          { icon: Upload, label: 'Publish' },
          { icon: FlaskConical, label: 'Test' },
        ].map(({ icon: Icon, label }) => (
          <button key={label} onClick={() => pushToast(`${label} — action triggered`)}
            className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-[10px] text-white/35 hover:text-white/70 border border-transparent hover:border-white/8 hover:bg-white/4 transition-all">
            <Icon className="h-3 w-3" />
            <span className="hidden lg:block">{label}</span>
          </button>
        ))}

        <div className="flex-1" />

        {/* Stats */}
        {running && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] text-[#00c2b2]">
              <Clock className="h-3 w-3" />
              <span className="font-mono">{(elapsed / 1000).toFixed(1)}s</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-white/40">
              <span>{completedCount}/{nodes.length} done</span>
            </div>
          </div>
        )}
        {allDone && !running && (
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
            <CheckCircle className="h-3 w-3" />
            <span>Complete</span>
          </div>
        )}
        {errorCount > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-red-400">
            <AlertCircle className="h-3 w-3" />
            <span>{errorCount} errors</span>
          </div>
        )}

        {/* Environment */}
        <div className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] text-amber-400 font-medium">STAGING</span>
          <ChevronDown className="h-3 w-3 text-amber-400/50" />
        </div>
      </div>

      {/* Main layout: Left | Canvas | Right */}
      <div className="flex flex-1 min-h-0">
        <StudioLeftPanel onAddConnector={() => {}} />
        <StudioCanvas
          nodes={nodes}
          edges={edges}
          selectedNode={selectedNode}
          onSelectNode={setSelectedNode}
          onToggleExpand={toggleExpand}
          onDrop={handleDrop}
        />
        <StudioRightPanel nodes={nodes} selectedNode={selectedNode} />
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#00c2b2]/30 shadow-2xl text-sm text-white"
            style={{ background: '#111416' }}>
            <Zap className="h-3.5 w-3.5 text-[#00c2b2] shrink-0" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
