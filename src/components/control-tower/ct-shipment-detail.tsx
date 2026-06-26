"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Package, MapPin, Clock, Truck, Warehouse, AlertTriangle, CheckCircle, Brain, ArrowRight, DollarSign, Thermometer, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Shipment } from "./mock-data";
import { MOCK_PAYLOADS } from "./mock-data";

const STATUS_LABELS: Record<string, string> = {
  in_transit: 'In Transit', delayed: 'Delayed', at_risk: 'At Risk',
  delivered: 'Delivered', pending: 'Pending', exception: 'Exception', on_hold: 'On Hold',
};
const RISK_COLOR: Record<string, string> = {
  low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444',
};

const TIMELINE_STEPS = [
  { label: 'Order Created', done: true },
  { label: 'Picked & Packed', done: true },
  { label: 'Loading', done: false, active: true },
  { label: 'In Transit', done: false },
  { label: 'Delivery', done: false },
];

export function CTShipmentDetail({ shipment, onClose, onToast }: { shipment: Shipment; onClose: () => void; onToast: (m: string) => void }) {
  const riskColor = RISK_COLOR[shipment.risk];
  const decision = MOCK_PAYLOADS.decision;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-4xl max-h-[90vh] rounded-2xl border border-white/10 overflow-hidden flex flex-col"
          style={{ background: '#111416' }}
          onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/6 flex items-center gap-4 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-[#00c2b2]/10 border border-[#00c2b2]/20 flex items-center justify-center">
              <Package className="h-4.5 w-4.5 text-[#00c2b2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono">{shipment.id}</h2>
                <span className="text-[10px] font-mono text-white/30">{shipment.salesOrder}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase"
                  style={{ background: riskColor + '15', color: riskColor, borderColor: riskColor + '30' }}>
                  {shipment.risk} risk
                </span>
              </div>
              <p className="text-xs text-white/40 mt-0.5">{shipment.customer} · {shipment.priority}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[11px] px-2.5 py-1 rounded-full border font-medium"
                style={{ background: '#ef4444' + '15', color: '#ef4444', borderColor: '#ef4444' + '30' }}>
                {STATUS_LABELS[shipment.status]}
              </span>
              <button onClick={onClose} className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/8 border border-white/8 flex items-center justify-center transition-all">
                <X className="h-3.5 w-3.5 text-white/50" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Quick info grid */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Origin', value: shipment.origin, icon: MapPin, color: '#3b82f6' },
                { label: 'Destination', value: shipment.destination, icon: MapPin, color: '#00c2b2' },
                { label: 'ETA', value: shipment.eta, icon: Clock, color: shipment.delayHours > 0 ? '#ef4444' : '#10b981' },
                { label: 'Carrier', value: shipment.carrier, icon: Truck, color: '#8b5cf6' },
                { label: 'Warehouse', value: shipment.warehouse.split(' ').slice(0, 2).join(' '), icon: Warehouse, color: '#f59e0b' },
                { label: 'Cargo', value: shipment.cargo, icon: Package, color: '#6366f1' },
                { label: 'Value', value: `$${(shipment.value / 1000).toFixed(0)}K`, icon: DollarSign, color: '#10b981' },
                { label: 'Weight', value: shipment.weight, icon: BarChart2, color: '#f97316' },
              ].map(item => (
                <div key={item.label} className="rounded-lg border border-white/5 p-3" style={{ background: '#0d0f10' }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <item.icon className="h-3 w-3" style={{ color: item.color }} />
                    <p className="text-[9px] text-white/30 uppercase tracking-wider">{item.label}</p>
                  </div>
                  <p className="text-xs font-medium text-white/80 truncate">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="rounded-xl border border-white/6 p-4" style={{ background: '#0d0f10' }}>
              <p className="text-xs font-semibold text-white mb-4">Shipment Timeline</p>
              <div className="flex items-center gap-0">
                {TIMELINE_STEPS.map((step, i) => (
                  <div key={i} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center border",
                        step.done ? 'bg-[#00c2b2]/20 border-[#00c2b2]/50' :
                        step.active ? 'bg-amber-400/20 border-amber-400/50 animate-pulse' :
                        'bg-white/5 border-white/10'
                      )}>
                        {step.done ? <CheckCircle className="h-3.5 w-3.5 text-[#00c2b2]" /> :
                         step.active ? <AlertTriangle className="h-3 w-3 text-amber-400" /> :
                         <div className="h-2 w-2 rounded-full bg-white/20" />}
                      </div>
                      <p className={cn("text-[9px] mt-1.5 text-center leading-tight",
                        step.done ? 'text-[#00c2b2]/70' : step.active ? 'text-amber-400' : 'text-white/25')}>
                        {step.label}
                      </p>
                    </div>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div className={cn("flex-1 h-px mx-1 mb-4", step.done ? 'bg-[#00c2b2]/30' : 'bg-white/8')} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Decision Summary */}
            <div className="rounded-xl border border-[#00c2b2]/15 overflow-hidden" style={{ background: '#0d1a18' }}>
              <div className="px-4 py-3 border-b border-[#00c2b2]/10 flex items-center gap-2">
                <Brain className="h-4 w-4 text-[#00c2b2]" />
                <p className="text-sm font-semibold text-white">AI Decision Summary</p>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#00c2b2]/15 text-[#00c2b2] border border-[#00c2b2]/30">96% Confidence</span>
              </div>
              <div className="p-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[9px] text-red-400/70 uppercase tracking-widest mb-1.5 font-semibold">Root Cause</p>
                  <p className="text-xs text-white/60 leading-relaxed">{(decision.response as { rootCause: string }).rootCause}</p>
                </div>
                <div>
                  <p className="text-[9px] text-amber-400/70 uppercase tracking-widest mb-1.5 font-semibold">Recommendations</p>
                  <div className="space-y-1">
                    {((decision.response as { recommendations: {action: string; detail: string; urgency: string}[] }).recommendations).slice(0, 3).map((r, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-[9px] font-bold text-amber-400 shrink-0 mt-0.5">{i + 1}.</span>
                        <p className="text-[10px] text-white/50">{r.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[9px] text-[#00c2b2]/70 uppercase tracking-widest mb-1.5 font-semibold">Actions</p>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Approve & Execute', color: '#00c2b2', primary: true },
                      { label: 'Notify Customer', color: '#3b82f6', primary: false },
                      { label: 'Update ETA in TMS', color: '#8b5cf6', primary: false },
                      { label: 'Escalate to Manager', color: '#ef4444', primary: false },
                    ].map(btn => (
                      <button key={btn.label} onClick={() => onToast(`${btn.label} — executed`)}
                        className="w-full text-left text-[10px] px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
                        style={{ background: btn.primary ? btn.color : btn.color + '15', color: btn.primary ? '#000' : btn.color, borderColor: btn.color + '30', fontWeight: btn.primary ? 600 : 400 }}>
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Digital Twin */}
            <div className="rounded-xl border border-white/6 p-4" style={{ background: '#0d0f10' }}>
              <p className="text-xs font-semibold text-white mb-3">Digital Twin · Route Map</p>
              <div className="h-36 rounded-lg border border-white/5 flex items-center justify-center relative overflow-hidden" style={{ background: '#050708' }}>
                {/* Simple map mockup */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'linear-gradient(rgba(0,194,178,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,194,178,0.5) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }} />
                <div className="relative w-full h-full flex items-center justify-between px-12">
                  {/* Origin dot */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-4 w-4 rounded-full bg-blue-400 border-2 border-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                    <p className="text-[9px] text-blue-400">{shipment.origin.split(',')[0]}</p>
                  </div>
                  {/* Route line with truck */}
                  <div className="flex-1 relative mx-4">
                    <div className="h-0.5 bg-white/10 rounded" />
                    <div className="absolute top-1/2 -translate-y-1/2 text-amber-400 text-sm" style={{ left: '35%' }}>
                      <Truck className="h-4 w-4" />
                    </div>
                  </div>
                  {/* Destination dot */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-4 w-4 rounded-full bg-[#00c2b2] border-2 border-[#00c2b2] shadow-[0_0_10px_rgba(0,194,178,0.6)]" />
                    <p className="text-[9px] text-[#00c2b2]">{shipment.destination.split(',')[0]}</p>
                  </div>
                </div>
                <div className="absolute bottom-2 right-3 text-[9px] text-white/20">Digital Twin · Live Position</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
