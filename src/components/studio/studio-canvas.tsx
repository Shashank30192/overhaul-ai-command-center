"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2, AlertCircle, ChevronDown, ChevronUp, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CANVAS_W, CANVAS_H, NODE_W, NODE_H,
  type WorkflowNode, type Edge, type NodeStatus
} from "./studio-data";

const STATUS_LABEL: Record<NodeStatus, string> = {
  idle: 'IDLE', queued: 'QUEUED', authenticating: 'AUTH', running: 'RUNNING',
  complete: 'DONE', error: 'ERROR', paused: 'PAUSED',
};

function getCenter(node: WorkflowNode) {
  return { x: node.x + NODE_W / 2, y: node.y + NODE_H / 2 };
}

function EdgeLine({ edge, nodes, animated }: { edge: Edge; nodes: WorkflowNode[]; animated: boolean }) {
  const from = nodes.find(n => n.id === edge.from);
  const to = nodes.find(n => n.id === edge.to);
  if (!from || !to) return null;

  const fc = getCenter(from);
  const tc = getCenter(to);

  // Right edge of from node → left edge of to node
  const x1 = from.x + NODE_W;
  const y1 = fc.y;
  const x2 = to.x;
  const y2 = tc.y;

  // Bezier control points
  const cx1 = x1 + Math.abs(x2 - x1) * 0.45;
  const cy1 = y1;
  const cx2 = x2 - Math.abs(x2 - x1) * 0.45;
  const cy2 = y2;

  const d = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  const fromDone = from.status === 'complete';
  const color = fromDone ? from.color : '#ffffff15';

  return (
    <g>
      {/* Base path */}
      <path d={d} fill="none" stroke={fromDone ? from.color + '40' : '#ffffff08'} strokeWidth={2} />
      {/* Animated flow path */}
      {fromDone && (
        <path d={d} fill="none" stroke={from.color} strokeWidth={2}
          strokeDasharray="10 6"
          style={{ animation: 'flowDash 1.2s linear infinite' }}
        />
      )}
      {/* Running particle */}
      {(from.status === 'running' || to.status === 'running' || to.status === 'authenticating') && (
        <circle r={4} fill={from.color}>
          <animateMotion dur="1.4s" repeatCount="indefinite" path={d} />
        </circle>
      )}
      {/* Arrow head */}
      <circle cx={x2} cy={y2} r={3} fill={fromDone ? from.color : '#ffffff15'} />
    </g>
  );
}

function NodeCard({
  node,
  onSelect,
  onToggleExpand,
  selected,
}: {
  node: WorkflowNode;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  selected: boolean;
}) {
  const isActive = node.status === 'running' || node.status === 'authenticating';
  const StatusIcon = node.status === 'complete' ? CheckCircle
    : node.status === 'error' ? AlertCircle
    : isActive ? Loader2
    : null;

  const statusColor = node.status === 'complete' ? '#10b981'
    : node.status === 'error' ? '#ef4444'
    : isActive ? node.color
    : '#ffffff20';

  const steps = node.steps;
  const currentStepLabel = steps[node.currentStep]?.label ?? '';

  return (
    <div
      style={{ position: 'absolute', left: node.x, top: node.y, width: NODE_W }}
      onClick={() => onSelect(node.id)}
    >
      {/* Glow when active */}
      {isActive && (
        <div className="absolute inset-0 rounded-xl blur-xl opacity-30 pointer-events-none"
          style={{ background: node.color, animation: 'pulse 2s ease-in-out infinite' }} />
      )}

      <div className={cn(
        "relative rounded-xl border transition-all duration-300 select-none cursor-pointer overflow-visible",
        selected ? "ring-1" : "",
        isActive ? "" : ""
      )}
        style={{
          background: node.status !== 'idle' ? node.color + '10' : '#111416',
          borderColor: node.status !== 'idle' ? node.color + '50' : (selected ? node.color + '60' : '#ffffff10'),
          boxShadow: selected ? `0 0 0 1px ${node.color}40` : undefined,
          width: NODE_W,
          minHeight: NODE_H,
        }}>
        {/* Progress bar at top */}
        {node.status !== 'idle' && (
          <div className="h-0.5 w-full rounded-t-xl overflow-hidden">
            <motion.div className="h-full" animate={{ width: `${node.progress}%` }} transition={{ duration: 0.4 }}
              style={{ background: node.color }} />
          </div>
        )}

        <div className="px-3 py-2.5">
          {/* Header */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm shrink-0" style={{ color: node.color }}>{node.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-white truncate leading-tight">{node.label}</p>
            </div>
            {StatusIcon && (
              <StatusIcon className={cn("h-3 w-3 shrink-0", isActive && "animate-spin")}
                style={{ color: statusColor }} />
            )}
          </div>
          <p className="text-[9px] text-white/30 truncate mb-1.5">{node.sublabel}</p>

          {/* Status badge */}
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: statusColor + '20', color: statusColor }}>
              {STATUS_LABEL[node.status]}
            </span>
            {node.status !== 'idle' && node.progress > 0 && (
              <span className="text-[8px] text-white/25 font-mono">{node.progress}%</span>
            )}
          </div>

          {/* Current step */}
          {isActive && currentStepLabel && (
            <p className="text-[9px] mt-1.5 leading-tight" style={{ color: node.color + 'cc' }}>{currentStepLabel}</p>
          )}
        </div>

        {/* Expand/collapse for completed nodes with logs */}
        {(node.status === 'complete' || node.status === 'running') && node.logs.length > 0 && (
          <>
            <div className="border-t border-white/5 px-2.5 py-1.5">
              <button onClick={e => { e.stopPropagation(); onToggleExpand(node.id); }}
                className="flex items-center gap-1 text-[9px] text-white/25 hover:text-white/50 transition-colors w-full">
                {node.expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {node.expanded ? 'Hide' : `${node.logs.length} logs`}
              </button>
            </div>
            <AnimatePresence>
              {node.expanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }}
                  className="overflow-hidden border-t border-white/5 px-2.5 pb-2">
                  <div className="mt-1.5 space-y-0.5 max-h-24 overflow-y-auto">
                    {node.logs.map((l, i) => (
                      <p key={i} className={cn("text-[8px] font-mono leading-relaxed",
                        l.level === 'error' ? 'text-red-400' :
                        l.level === 'warn' ? 'text-amber-400' :
                        l.level === 'success' ? 'text-emerald-400' : 'text-white/30')}>
                        {l.msg}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}

interface StudioCanvasProps {
  nodes: WorkflowNode[];
  edges: Edge[];
  selectedNode: string | null;
  onSelectNode: (id: string | null) => void;
  onToggleExpand: (id: string) => void;
  onDrop?: (connector: unknown, x: number, y: number) => void;
}

export function StudioCanvas({ nodes, edges, selectedNode, onSelectNode, onToggleExpand, onDrop }: StudioCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('connector');
    if (!data || !onDrop) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - NODE_W / 2;
    const y = e.clientY - rect.top - NODE_H / 2;
    onDrop(JSON.parse(data), x, y);
  };

  return (
    <div ref={containerRef} className="flex-1 min-w-0 relative overflow-auto"
      style={{ background: '#0a0c0d', cursor: 'default' }}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      onClick={() => onSelectNode(null)}>
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Canvas area */}
      <div style={{ width: CANVAS_W, height: CANVAS_H, position: 'relative' }}>
        {/* SVG connections */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
          <defs>
            <style>{`
              @keyframes flowDash {
                from { stroke-dashoffset: 0; }
                to { stroke-dashoffset: -32; }
              }
            `}</style>
          </defs>
          {edges.map((edge, i) => (
            <EdgeLine key={i} edge={edge} nodes={nodes} animated={edge.animated} />
          ))}
        </svg>

        {/* Nodes */}
        {nodes.map(node => (
          <NodeCard
            key={node.id}
            node={node}
            selected={selectedNode === node.id}
            onSelect={id => { onSelectNode(id); }}
            onToggleExpand={onToggleExpand}
          />
        ))}
      </div>
    </div>
  );
}
