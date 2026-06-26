"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, RotateCcw, CheckCircle, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type NodeStatus = 'idle' | 'running' | 'complete' | 'error';

interface WorkflowNode {
  id: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
  color: string;
  status: NodeStatus;
  runDelay: number;
  runDuration: number;
}

interface Edge { from: string; to: string; color: string }

const INITIAL_NODES: WorkflowNode[] = [
  { id: 'trigger', label: 'Trigger', sublabel: 'SLA Alert', x: 60, y: 180, color: '#6366f1', status: 'idle', runDelay: 0, runDuration: 600 },
  { id: 'supervisor', label: 'Supervisor', sublabel: 'Orchestrates agents', x: 200, y: 180, color: '#00c2b2', status: 'idle', runDelay: 700, runDuration: 4000 },
  { id: 'erp', label: 'ERP Agent', sublabel: 'SAP S/4HANA', x: 360, y: 80, color: '#3b82f6', status: 'idle', runDelay: 900, runDuration: 1500 },
  { id: 'wms', label: 'WMS Agent', sublabel: 'Manhattan WMS', x: 360, y: 180, color: '#f59e0b', status: 'idle', runDelay: 1100, runDuration: 1500 },
  { id: 'tms', label: 'TMS Agent', sublabel: 'Oracle TMS', x: 360, y: 280, color: '#8b5cf6', status: 'idle', runDelay: 1300, runDuration: 1500 },
  { id: 'decision', label: 'Decision', sublabel: 'Root cause + recs', x: 520, y: 180, color: '#10b981', status: 'idle', runDelay: 3000, runDuration: 1200 },
  { id: 'notify', label: 'Notify', sublabel: 'Customer + ERP', x: 660, y: 120, color: '#ec4899', status: 'idle', runDelay: 4300, runDuration: 500 },
  { id: 'update', label: 'Update ETA', sublabel: 'TMS + WMS', x: 660, y: 240, color: '#f97316', status: 'idle', runDelay: 4400, runDuration: 500 },
  { id: 'done', label: 'Complete', sublabel: 'SLA preserved', x: 800, y: 180, color: '#00c2b2', status: 'idle', runDelay: 5000, runDuration: 400 },
];

const EDGES: Edge[] = [
  { from: 'trigger', to: 'supervisor', color: '#6366f1' },
  { from: 'supervisor', to: 'erp', color: '#00c2b2' },
  { from: 'supervisor', to: 'wms', color: '#00c2b2' },
  { from: 'supervisor', to: 'tms', color: '#00c2b2' },
  { from: 'erp', to: 'decision', color: '#3b82f6' },
  { from: 'wms', to: 'decision', color: '#f59e0b' },
  { from: 'tms', to: 'decision', color: '#8b5cf6' },
  { from: 'decision', to: 'notify', color: '#10b981' },
  { from: 'decision', to: 'update', color: '#10b981' },
  { from: 'notify', to: 'done', color: '#ec4899' },
  { from: 'update', to: 'done', color: '#f97316' },
];

const NODE_W = 90;
const NODE_H = 44;

function getNodeCenter(node: WorkflowNode) {
  return { x: node.x + NODE_W / 2, y: node.y + NODE_H / 2 };
}

export function CTWorkflow({ onToast }: { onToast: (m: string) => void }) {
  const [nodes, setNodes] = useState<WorkflowNode[]>(INITIAL_NODES);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const reset = () => {
    setNodes(INITIAL_NODES);
    setRunning(false);
    setElapsed(0);
  };

  const run = () => {
    reset();
    setRunning(true);
    const start = Date.now();
    const iv = setInterval(() => setElapsed(Date.now() - start), 100);

    INITIAL_NODES.forEach(node => {
      setTimeout(() => {
        setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'running' } : n));
        setTimeout(() => {
          setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'complete' } : n));
        }, node.runDuration);
      }, node.runDelay);
    });

    const total = Math.max(...INITIAL_NODES.map(n => n.runDelay + n.runDuration)) + 200;
    setTimeout(() => { clearInterval(iv); setRunning(false); onToast('Workflow executed — all nodes complete'); }, total);
  };

  const nodeById = (id: string) => nodes.find(n => n.id === id)!;

  const SVG_W = 920;
  const SVG_H = 380;

  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Workflow Studio</h2>
          <p className="text-xs text-white/40 mt-0.5">Visual multi-agent orchestration · SHP-1024 resolution flow</p>
        </div>
        <div className="flex items-center gap-2">
          {running && <p className="text-xs font-mono text-white/40">{(elapsed / 1000).toFixed(1)}s</p>}
          <button onClick={reset} className="h-8 px-3 rounded-lg text-xs text-white/50 hover:text-white border border-white/8 hover:bg-white/5 transition-all flex items-center gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <button onClick={run} disabled={running}
            className="h-8 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
            style={{ background: running ? '#00c2b220' : '#00c2b2', color: running ? '#00c2b2' : '#000' }}>
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            {running ? 'Executing...' : 'Execute Flow'}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="rounded-xl border border-white/6 overflow-hidden" style={{ background: '#0a0c0d' }}>
        {/* Grid background */}
        <div className="relative" style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}>
          <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: 'block' }}>
            <defs>
              {EDGES.map((e, i) => (
                <marker key={i} id={`arrow-${i}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L6,3 z" fill={e.color + '60'} />
                </marker>
              ))}
            </defs>

            {/* Edges */}
            {EDGES.map((edge, i) => {
              const from = nodeById(edge.from);
              const to = nodeById(edge.to);
              if (!from || !to) return null;
              const fc = getNodeCenter(from);
              const tc = getNodeCenter(to);
              const fromConnected = nodes.find(n => n.id === edge.from)?.status === 'complete';
              return (
                <g key={i}>
                  <line
                    x1={fc.x + NODE_W / 2 - 4} y1={fc.y}
                    x2={tc.x - NODE_W / 2 + 4} y2={tc.y}
                    stroke={fromConnected ? edge.color : edge.color + '25'}
                    strokeWidth={fromConnected ? 2 : 1}
                    strokeDasharray={fromConnected ? undefined : '4 4'}
                    markerEnd={`url(#arrow-${i})`}
                    style={{ transition: 'stroke 0.5s, stroke-width 0.3s' }}
                  />
                  {fromConnected && (
                    <circle r={4} fill={edge.color}>
                      <animateMotion dur="1s" repeatCount="indefinite"
                        path={`M${fc.x + NODE_W / 2 - 4},${fc.y} L${tc.x - NODE_W / 2 + 4},${tc.y}`} />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const StatusIcon = node.status === 'complete' ? CheckCircle : node.status === 'running' ? Loader2 : Circle;
              const statusColor = node.status === 'complete' ? '#10b981' : node.status === 'running' ? node.color : '#ffffff20';
              return (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                  {node.status === 'running' && (
                    <rect x={-2} y={-2} width={NODE_W + 4} height={NODE_H + 4} rx={10}
                      fill="none" stroke={node.color} strokeWidth={1.5} opacity={0.5}>
                      <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
                    </rect>
                  )}
                  <rect width={NODE_W} height={NODE_H} rx={8}
                    fill={node.status !== 'idle' ? node.color + '18' : '#111416'}
                    stroke={node.status !== 'idle' ? node.color + '50' : '#ffffff0a'}
                    strokeWidth={1}
                    style={{ transition: 'fill 0.3s, stroke 0.3s' }} />
                  <foreignObject x={0} y={0} width={NODE_W} height={NODE_H}>
                    <div className="h-full flex flex-col items-center justify-center px-1" style={{ fontFamily: 'inherit' }}>
                      <p className="text-[10px] font-semibold text-center leading-tight" style={{ color: node.status !== 'idle' ? node.color : 'rgba(255,255,255,0.6)' }}>
                        {node.label}
                      </p>
                      <p className="text-[8px] text-center leading-tight" style={{ color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>
                        {node.sublabel}
                      </p>
                      {node.status !== 'idle' && (
                        <div style={{ marginTop: 2, color: statusColor }}>
                          {node.status === 'complete' ? '✓' : node.status === 'running' ? '⟳' : ''}
                        </div>
                      )}
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {[
          { label: 'Idle', color: '#ffffff20', dot: true },
          { label: 'Running', color: '#00c2b2', dot: true, pulse: true },
          { label: 'Complete', color: '#10b981', dot: true },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={cn("h-2 w-2 rounded-full", l.pulse && "animate-pulse")} style={{ background: l.color }} />
            <span className="text-[10px] text-white/40">{l.label}</span>
          </div>
        ))}
        <div className="ml-auto text-[10px] text-white/25">Click Execute Flow to animate</div>
      </div>

      {/* Node list */}
      <div className="grid grid-cols-3 gap-2">
        {nodes.map(node => (
          <div key={node.id} className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all",
            node.status === 'running' ? 'border-opacity-50' : 'border-white/5'
          )} style={{ background: '#111416', borderColor: node.status !== 'idle' ? node.color + '30' : undefined }}>
            <div className="h-2 w-2 rounded-full shrink-0" style={{
              background: node.status === 'complete' ? '#10b981' : node.status === 'running' ? node.color : '#ffffff15'
            }} />
            <div>
              <p className="text-[11px] font-medium text-white/70">{node.label}</p>
              <p className="text-[9px] text-white/30">{node.sublabel}</p>
            </div>
            {node.status === 'running' && <Loader2 className="h-3 w-3 ml-auto animate-spin" style={{ color: node.color }} />}
            {node.status === 'complete' && <CheckCircle className="h-3 w-3 ml-auto text-emerald-400" />}
          </div>
        ))}
      </div>
    </div>
  );
}
