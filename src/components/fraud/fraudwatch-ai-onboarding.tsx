"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Bot, CheckCircle2, Loader2, ChevronRight, Zap,
  Shield, ShieldCheck, Truck, User, MapPin, AlertTriangle,
  BarChart3, FileText, Wifi, Clock, Star, Check,
  ArrowRight, Download, Eye, Play, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConvMessage {
  id: string;
  role: "agent" | "user" | "discovery";
  content: string;
  options?: string[];
  discoveries?: string[];
  discoveryDone?: boolean;
}

interface ConfigCard {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "pending" | "enabled" | "configured" | "recommended" | "analysing";
}

interface Recommendation {
  title: string;
  reason: string;
  confidence: number;
}

// ─── Flow Engine ──────────────────────────────────────────────────────────────

const TMS_OPTIONS = ["SAP TM", "Oracle TMS", "MercuryGate", "Blue Yonder", "Manhattan", "Descartes", "Custom / In-house"];

interface FlowStep {
  id: string;
  agentMessage: (ctx: Record<string, string>) => string;
  options?: string[];
  discoveries: string[];
  freeText?: boolean;
  configUpdates: (answer: string) => Partial<Record<string, "pending" | "enabled" | "configured" | "recommended" | "analysing">>;
  recommendationUpdates?: (answer: string) => Partial<Record<string, { reason: string; confidence: number } | null>>;
  nextStep: (answer: string) => string;
}

const FLOW: Record<string, FlowStep> = {
  tms: {
    id: "tms",
    agentMessage: () => "What Transportation Management System does your organisation currently use?",
    options: TMS_OPTIONS,
    discoveries: ["Checking API availability...", "Validating TMS registry...", "Detecting endpoint schema..."],
    configUpdates: () => ({ carrier_validation: "analysing" }),
    nextStep: (a) => ["SAP TM", "Oracle TMS", "Blue Yonder", "Manhattan"].includes(a) ? "deployment" : "apis",
  },
  deployment: {
    id: "deployment",
    agentMessage: (ctx) => `You selected ${ctx.tms}. Is your environment Cloud or On-Premise?`,
    options: ["Cloud (SaaS)", "On-Premise", "Hybrid"],
    discoveries: ["Validating OAuth 2.0...", "Discovering REST endpoints...", "Checking authentication methods..."],
    configUpdates: (a) => ({ carrier_validation: a.includes("Cloud") ? "configured" : "recommended" }),
    nextStep: () => "apis",
  },
  apis: {
    id: "apis",
    agentMessage: () => "Do you currently expose REST APIs from your TMS for third-party integrations?",
    options: ["Yes — REST APIs available", "Yes — but limited endpoints", "No — we use batch exports", "Not sure"],
    discoveries: ["Reading shipment schema...", "Detecting authentication...", "Mapping shipment fields...", "Scanning rate limits..."],
    configUpdates: (a) => ({ carrier_validation: a.startsWith("Yes") ? "configured" : "recommended" }),
    recommendationUpdates: (a) => a.startsWith("Yes") ? {} : { continuous_monitoring: { reason: "REST API access limited — batch monitoring recommended.", confidence: 91 } },
    nextStep: () => "edi",
  },
  edi: {
    id: "edi",
    agentMessage: () => "Do you currently exchange EDI transactions with your carrier network?",
    options: ["Yes — X12 EDI", "Yes — EDIFACT", "Both X12 and EDIFACT", "No — we don't use EDI"],
    discoveries: ["Scanning EDI transaction support...", "Checking AS2 middleware...", "Validating X12 transaction sets..."],
    configUpdates: (a) => ({ pickup_verification: a.startsWith("Yes") || a.startsWith("Both") ? "configured" : "pending" }),
    nextStep: () => "carriers",
  },
  carriers: {
    id: "carriers",
    agentMessage: () => "Which carrier systems are currently connected to your TMS? Select all that apply.",
    options: ["FedEx API", "UPS Freight", "XPO Logistics", "J.B. Hunt", "Werner Enterprises", "Broker Network / 3PL", "Multiple smaller carriers"],
    discoveries: ["Discovering carrier endpoints...", "Validating carrier credentials...", "Mapping carrier identifiers..."],
    configUpdates: (a) => ({
      carrier_validation: "configured",
      high_risk_rules: a.includes("Broker") || a.includes("Multiple") ? "configured" : "recommended",
    }),
    recommendationUpdates: (a) => a.includes("Multiple") || a.includes("Broker")
      ? { continuous_monitoring: { reason: "Multiple third-party carriers detected.", confidence: 99 } }
      : {},
    nextStep: () => "onboarding_method",
  },
  onboarding_method: {
    id: "onboarding_method",
    agentMessage: () => "How are carriers onboarded into your organisation today?",
    options: ["Manual paperwork / email", "Carrier portal (self-service)", "TMS onboarding module", "Third-party vetting service", "No formal process"],
    discoveries: ["Analysing onboarding workflow...", "Detecting vetting gaps...", "Assessing compliance coverage..."],
    configUpdates: (a) => ({
      identity_verification: a.includes("No formal") || a.includes("Manual") ? "recommended" : "configured",
    }),
    recommendationUpdates: (a) => a.includes("No formal") || a.includes("Manual")
      ? { identity_verification: { reason: "No formal carrier vetting detected — identity verification critical.", confidence: 98 } }
      : {},
    nextStep: () => "validation_timing",
  },
  validation_timing: {
    id: "validation_timing",
    agentMessage: () => "When do you normally validate carriers in your workflow?",
    options: ["Before any first load", "At contract signing only", "Periodically (monthly/quarterly)", "Only after an incident", "No regular validation"],
    discoveries: ["Checking validation cadence...", "Assessing risk exposure window...", "Mapping validation touchpoints..."],
    configUpdates: (a) => ({
      high_risk_rules: a.includes("Only after") || a.includes("No regular") ? "configured" : "recommended",
      carrier_validation: "configured",
    }),
    recommendationUpdates: (a) => a.includes("Only after") || a.includes("No regular")
      ? { continuous_monitoring: { reason: "Reactive-only validation detected — continuous monitoring essential.", confidence: 99 } }
      : {},
    nextStep: () => "driver_verify",
  },
  driver_verify: {
    id: "driver_verify",
    agentMessage: () => "Do you currently verify drivers before pickup?",
    options: ["Yes — full identity check", "Yes — USDOT / licence check only", "No — we rely on the carrier", "No formal process"],
    discoveries: ["Scanning driver verification gaps...", "Cross-referencing FMCSA driver data...", "Detecting verification touchpoints..."],
    configUpdates: (a) => ({
      driver_verification: a.startsWith("Yes") ? "enabled" : "recommended",
    }),
    recommendationUpdates: (a) => !a.startsWith("Yes")
      ? { driver_identity: { reason: "No driver identity verification detected at pickup.", confidence: 98 } }
      : {},
    nextStep: () => "geofence",
  },
  geofence: {
    id: "geofence",
    agentMessage: () => "Do you use geofencing to monitor cargo in transit?",
    options: ["Yes — active geofencing", "Yes — at origin/destination only", "No — we plan to", "No — not currently"],
    discoveries: ["Checking GPS telemetry...", "Validating geofence zones...", "Detecting IoT device coverage..."],
    configUpdates: (a) => ({
      geofence_protection: a.startsWith("Yes") ? "enabled" : "recommended",
    }),
    nextStep: () => "cargo_theft",
  },
  cargo_theft: {
    id: "cargo_theft",
    agentMessage: () => "Do you currently monitor for cargo theft patterns or incidents?",
    options: ["Yes — active monitoring", "Yes — post-incident reporting only", "No — but it's a priority", "No — not currently"],
    discoveries: ["Loading cargo theft intelligence...", "Cross-referencing NICB database...", "Checking incident pattern history..."],
    configUpdates: (a) => ({
      fraud_alerts: a.startsWith("Yes") ? "enabled" : "configured",
      pickup_verification: "configured",
    }),
    recommendationUpdates: (a) => !a.startsWith("Yes — active")
      ? { cargo_theft: { reason: "Proactive cargo theft monitoring not detected.", confidence: 96 } }
      : {},
    nextStep: () => "cargo_type",
  },
  cargo_type: {
    id: "cargo_type",
    agentMessage: () => "What types of cargo do you primarily move? This helps us calibrate risk rules.",
    options: ["Pharmaceuticals / Healthcare", "Electronics / High-value", "Food & Beverage", "Automotive / Industrial", "General freight", "Hazmat / Chemicals"],
    discoveries: ["Loading cargo risk profiles...", "Calibrating risk thresholds...", "Applying industry benchmarks..."],
    configUpdates: (a) => ({
      high_risk_rules: "configured",
      fraud_alerts: "enabled",
      pickup_verification: a.includes("Pharma") || a.includes("Electronics") ? "configured" : "recommended",
    }),
    recommendationUpdates: (a) => a.includes("Pharma") || a.includes("Electronics")
      ? { pickup_verification: { reason: `${a.split("/")[0].trim()} deliveries require mandatory pickup verification.`, confidence: 96 } }
      : {},
    nextStep: () => "summary",
  },
  summary: {
    id: "summary",
    agentMessage: () => "Perfect — I've gathered everything I need. Generating your FraudWatch implementation configuration now...",
    options: [],
    discoveries: ["Compiling implementation profile...", "Generating fraud policy rules...", "Building carrier risk matrix...", "Calculating implementation readiness...", "Configuration complete ✓"],
    configUpdates: () => ({
      carrier_validation: "configured",
      driver_verification: "enabled",
      identity_verification: "recommended",
      geofence_protection: "enabled",
      high_risk_rules: "configured",
      pickup_verification: "configured",
      fraud_alerts: "enabled",
    }),
    nextStep: () => "done",
  },
};

// ─── Initial config cards ─────────────────────────────────────────────────────

const INITIAL_CONFIG: ConfigCard[] = [
  { id: "carrier_validation", label: "Carrier Validation", icon: ShieldCheck, status: "pending" },
  { id: "driver_verification", label: "Driver Verification", icon: User, status: "pending" },
  { id: "identity_verification", label: "Identity Verification", icon: Shield, status: "pending" },
  { id: "geofence_protection", label: "Geofence Protection", icon: MapPin, status: "pending" },
  { id: "high_risk_rules", label: "High Risk Carrier Rules", icon: AlertTriangle, status: "pending" },
  { id: "pickup_verification", label: "Pickup Verification", icon: Truck, status: "pending" },
  { id: "fraud_alerts", label: "Fraud Alerts", icon: Zap, status: "pending" },
];

const INITIAL_RECS: Record<string, { title: string; reason: string; confidence: number }> = {
  driver_identity: { title: "Enable Driver Identity Verification", reason: "No driver identity verification at pickup detected.", confidence: 98 },
  continuous_monitoring: { title: "Enable Carrier Continuous Monitoring", reason: "Multiple third-party carriers detected.", confidence: 99 },
  pickup_verification: { title: "Enable Pickup Verification", reason: "High-value cargo detected in network.", confidence: 96 },
};

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { label: string; dot: string; badge: string }> = {
  pending:     { label: "Pending",     dot: "bg-white/20",        badge: "text-white/30 border-white/10 bg-white/4" },
  analysing:   { label: "Analysing",  dot: "bg-amber-400 animate-pulse", badge: "text-amber-300 border-amber-500/30 bg-amber-500/10" },
  enabled:     { label: "Enabled",    dot: "bg-emerald-400",      badge: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" },
  configured:  { label: "Configured", dot: "bg-[#00c2b2]",       badge: "text-[#00c2b2] border-[#00c2b2]/30 bg-[#00c2b2]/10" },
  recommended: { label: "Recommended",dot: "bg-blue-400",         badge: "text-blue-300 border-blue-500/30 bg-blue-500/10" },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function FraudWatchAIOnboarding({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ConvMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<string>("tms");
  const [ctx, setCtx] = useState<Record<string, string>>({});
  const [config, setConfig] = useState<ConfigCard[]>(INITIAL_CONFIG);
  const [recs, setRecs] = useState<typeof INITIAL_RECS>(INITIAL_RECS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [readiness, setReadiness] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const scroll = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, []);

  const updateConfig = useCallback((updates: Partial<Record<string, "pending" | "enabled" | "configured" | "recommended" | "analysing">>) => {
    setConfig(prev => prev.map(c => updates[c.id] ? { ...c, status: updates[c.id]! } : c));
  }, []);

  // Initial welcome
  useEffect(() => {
    const t = setTimeout(() => {
      setMessages([{
        id: "welcome",
        role: "agent",
        content: "Welcome to FraudWatch.\n\nI'll help configure FraudWatch for your organisation. I'll ask a few questions about your transportation network, carrier operations and TMS.\n\nBased on your answers, I'll configure FraudWatch recommendations automatically.",
      }, {
        id: "time",
        role: "agent",
        content: "⏱ Estimated completion time: 10–15 minutes. Let's get started.",
      }]);

      setTimeout(() => {
        const step = FLOW[currentStep];
        setMessages(prev => [...prev, {
          id: `q-${currentStep}`,
          role: "agent",
          content: step.agentMessage({}),
          options: step.options,
        }]);
        scroll();
      }, 1200);
    }, 400);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = useCallback((answer: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const step = FLOW[currentStep];

    // Remove options from last agent message
    setMessages(prev => prev.map(m => m.id === `q-${currentStep}` ? { ...m, options: [] } : m));

    // Add user message
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: "user", content: answer }]);
    scroll();

    // Update context
    const newCtx = { ...ctx, [currentStep]: answer };
    setCtx(newCtx);

    // Update config immediately (set to analysing)
    updateConfig({ [Object.keys(step.configUpdates(answer))[0]]: "analysing" });

    // Show discovery messages
    const discoveries = step.discoveries;
    const discovId = `disc-${Date.now()}`;

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: discovId,
        role: "discovery",
        content: "",
        discoveries: discoveries,
        discoveryDone: false,
      }]);
      scroll();
    }, 300);

    // Mark discovery done, update config
    const totalDisc = discoveries.length * 350 + 300;
    timerRef.current.push(setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === discovId ? { ...m, discoveryDone: true } : m));
      updateConfig(step.configUpdates(answer));

      // Update recommendations
      if (step.recommendationUpdates) {
        const recUpdates = step.recommendationUpdates(answer);
        setRecs(prev => {
          const next = { ...prev };
          Object.entries(recUpdates).forEach(([key, val]) => {
            if (val && !next[key]) next[key] = { title: `Enable ${key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}`, ...val };
            else if (val) next[key] = { ...next[key], ...val };
          });
          return next;
        });
      }

      // Bump readiness
      setReadiness(r => Math.min(r + Math.floor(Math.random() * 12) + 8, 92));

      const nextId = step.nextStep(answer);

      if (nextId === "done") {
        // Final summary
        setTimeout(() => {
          setReadiness(97);
          setIsDone(true);
          setMessages(prev => [...prev, {
            id: "done-msg",
            role: "agent",
            content: "Your FraudWatch implementation has been prepared. Review your configuration below and choose how to proceed.",
          }]);
          scroll();
          setIsProcessing(false);
        }, 600);
        return;
      }

      // Next question
      timerRef.current.push(setTimeout(() => {
        const nextStep = FLOW[nextId];
        if (!nextStep) { setIsProcessing(false); return; }
        setCurrentStep(nextId);
        setMessages(prev => [...prev, {
          id: `q-${nextId}`,
          role: "agent",
          content: nextStep.agentMessage(newCtx),
          options: nextStep.options,
        }]);
        scroll();
        setIsProcessing(false);
      }, 400));
    }, totalDisc));
  }, [isProcessing, currentStep, ctx, updateConfig, scroll]);

  useEffect(() => () => { timerRef.current.forEach(clearTimeout); }, []);

  const configuredCount = config.filter(c => c.status !== "pending").length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: "spring", damping: 28, stiffness: 260 }}
      className="absolute inset-0 z-20 flex overflow-hidden"
      style={{ background: 'var(--mil-bg)' }}
    >
      {/* ── Left: Conversation ─────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 border-r border-[var(--mil-border)]">
        {/* Header */}
        <div className="shrink-0 px-5 py-3.5 border-b border-[var(--mil-border)] flex items-center gap-3" style={{ background: 'var(--mil-panel)' }}>
          <div className="h-8 w-8 rounded-xl bg-[#00c2b2]/15 border border-[#00c2b2]/30 flex items-center justify-center">
            <Bot className="h-4 w-4 text-[#00c2b2]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">AI Assisted Onboarding</p>
            <p className="text-[10px] text-[var(--mil-muted)]">FraudWatch Implementation Assistant · Agentic AI</p>
          </div>
          <div className="flex items-center gap-3">
            {readiness > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-1 w-20 rounded-full bg-white/10 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-[#00c2b2]" animate={{ width: `${readiness}%` }} transition={{ duration: 0.5 }} />
                </div>
                <span className="text-[10px] text-[#00c2b2] font-mono">{readiness}%</span>
              </div>
            )}
            <button onClick={onClose} className="h-7 w-7 rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] flex items-center justify-center text-[var(--mil-muted)] hover:text-white transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>

                {msg.role === "agent" && (
                  <div className="h-6 w-6 rounded-full bg-[#00c2b2]/15 border border-[#00c2b2]/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3 w-3 text-[#00c2b2]" />
                  </div>
                )}

                {msg.role === "discovery" ? (
                  <DiscoveryBlock discoveries={msg.discoveries ?? []} done={msg.discoveryDone ?? false} />
                ) : (
                  <div className={cn(
                    "max-w-sm rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-[var(--mil-blue)] text-white rounded-tr-sm"
                      : "bg-[var(--mil-surface)] border border-[var(--mil-border)] text-[var(--mil-text)] rounded-tl-sm"
                  )}>
                    {msg.content.split("\n").map((line, i) => (
                      line ? <p key={i} className={i > 0 ? "mt-1" : ""}>{line}</p> : <div key={i} className="h-1" />
                    ))}

                    {msg.options && msg.options.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {msg.options.map(opt => (
                          <button key={opt} onClick={() => handleAnswer(opt)} disabled={isProcessing}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--mil-elevated)] border border-[var(--mil-border)] text-xs text-[var(--mil-text)] hover:text-white hover:border-[#00c2b2]/40 hover:bg-[#00c2b2]/5 transition-all disabled:opacity-40 text-left group">
                            <ChevronRight className="h-3 w-3 text-[#00c2b2]/50 group-hover:text-[#00c2b2] shrink-0 transition-colors" />
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Done state */}
          {isDone && <SummaryBlock ctx={ctx} config={config} recs={recs} readiness={readiness} />}
          <div ref={bottomRef} />
        </div>

        {/* Processing indicator */}
        {isProcessing && !isDone && (
          <div className="shrink-0 px-5 pb-3 flex items-center gap-2 text-[11px] text-[var(--mil-muted)]">
            <Loader2 className="h-3 w-3 animate-spin" />
            Analysing your response…
          </div>
        )}
      </div>

      {/* ── Right: Live Config Panel ───────────────────────────────── */}
      <div className="w-72 shrink-0 flex flex-col overflow-hidden" style={{ background: 'var(--mil-panel)' }}>
        {/* Config cards */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Implementation Agent */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2.5">
              <Zap className="h-3.5 w-3.5 text-[#00c2b2]" />
              <p className="text-[10px] font-semibold text-white uppercase tracking-widest">Implementation Agent</p>
              <span className="ml-auto text-[9px] text-[var(--mil-muted)]">{configuredCount}/{config.length}</span>
            </div>
            <div className="space-y-1.5">
              {config.map((card, i) => {
                const s = STATUS_STYLES[card.status];
                return (
                  <motion.div key={card.id}
                    animate={card.status === "analysing" ? { borderColor: ["rgba(255,255,255,0.08)", "rgba(0,194,178,0.3)", "rgba(255,255,255,0.08)"] } : {}}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-[var(--mil-border)] bg-[var(--mil-surface)]">
                    <card.icon className={cn("h-3.5 w-3.5 shrink-0",
                      card.status === "pending" ? "text-white/20" :
                      card.status === "enabled" ? "text-emerald-400" :
                      card.status === "configured" ? "text-[#00c2b2]" :
                      card.status === "recommended" ? "text-blue-400" :
                      "text-amber-400"
                    )} />
                    <span className={cn("flex-1 text-[11px] font-medium",
                      card.status === "pending" ? "text-white/30" : "text-white/80"
                    )}>{card.label}</span>
                    <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded-full border", s.badge)}>
                      {card.status === "analysing" ? <Loader2 className="h-2.5 w-2.5 animate-spin inline" /> : s.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--mil-border)] my-3" />

          {/* AI Recommendations */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              <p className="text-[10px] font-semibold text-white uppercase tracking-widest">AI Recommendations</p>
            </div>
            <div className="space-y-2">
              {Object.entries(recs).map(([key, rec]) => (
                <motion.div key={key} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-[var(--mil-border)] bg-[var(--mil-surface)] p-3">
                  <p className="text-[10px] font-semibold text-white mb-1 leading-snug">{rec.title}</p>
                  <p className="text-[9px] text-[var(--mil-muted)] mb-2 leading-relaxed">{rec.reason}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
                      <motion.div className="h-full rounded-full bg-[#00c2b2]"
                        initial={{ width: 0 }} animate={{ width: `${rec.confidence}%` }} transition={{ duration: 0.8 }} />
                    </div>
                    <span className="text-[9px] font-bold text-[#00c2b2]">{rec.confidence}%</span>
                  </div>
                </motion.div>
              ))}
              {Object.keys(recs).length === 0 && (
                <p className="text-[10px] text-[var(--mil-muted)] text-center py-3">Recommendations appear as I learn about your organisation…</p>
              )}
            </div>
          </div>
        </div>

        {/* Readiness footer */}
        <div className="shrink-0 border-t border-[var(--mil-border)] px-4 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] uppercase tracking-widest text-[var(--mil-muted)]">Implementation Readiness</span>
            <span className="text-[10px] font-bold text-[#00c2b2]">{readiness}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
            <motion.div className="h-full rounded-full bg-[#00c2b2]" animate={{ width: `${readiness}%` }} transition={{ duration: 0.5 }} />
          </div>
          <p className="text-[9px] text-[var(--mil-muted)] mt-1.5">
            {readiness === 0 ? "Awaiting first response…"
              : readiness < 50 ? "Gathering requirements…"
              : readiness < 80 ? "Building configuration…"
              : readiness < 95 ? "Finalising implementation…"
              : "Ready for deployment"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Discovery Block ──────────────────────────────────────────────────────────

function DiscoveryBlock({ discoveries, done }: { discoveries: string[]; done: boolean }) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible >= discoveries.length) return;
    const t = setTimeout(() => setVisible(v => v + 1), 350);
    return () => clearTimeout(t);
  }, [visible, discoveries.length]);

  return (
    <div className="ml-9 bg-[var(--mil-surface)] border border-[var(--mil-border)] rounded-xl px-4 py-3 space-y-1.5 min-w-0 max-w-xs">
      {discoveries.slice(0, visible).map((d, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-[11px]">
          {done || i < visible - 1
            ? <CheckCircle2 className="h-3 w-3 text-[#00c2b2] shrink-0" />
            : <Loader2 className="h-3 w-3 text-[#00c2b2] animate-spin shrink-0" />}
          <span className={cn(done || i < visible - 1 ? "text-[#00c2b2]/70" : "text-white/60")}>{d}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Implementation Summary ───────────────────────────────────────────────────

function SummaryBlock({ ctx, config, recs, readiness }: {
  ctx: Record<string, string>;
  config: ConfigCard[];
  recs: typeof INITIAL_RECS;
  readiness: number;
}) {
  const configuredCount = config.filter(c => c.status !== "pending").length;
  const enabledCount = config.filter(c => c.status === "enabled" || c.status === "configured").length;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="rounded-xl border border-[#00c2b2]/25 bg-[#00c2b2]/5 overflow-hidden">
      {/* Score header */}
      <div className="px-5 py-4 border-b border-[#00c2b2]/15">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full border-2 border-[#00c2b2] flex items-center justify-center">
            <span className="text-sm font-bold text-[#00c2b2]">{readiness}%</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white">Implementation Ready</p>
            <p className="text-[11px] text-[var(--mil-muted)]">{configuredCount}/{config.length} modules configured</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[9px] text-[var(--mil-muted)]">Est. Go-Live</p>
            <p className="text-xs font-semibold text-white">2–3 business days</p>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full bg-[#00c2b2]" style={{ width: `${readiness}%` }} />
        </div>
      </div>

      {/* Summary grid */}
      <div className="px-5 py-4 grid grid-cols-2 gap-3 text-[11px]">
        {[
          { label: "TMS", value: ctx.tms || "Not specified" },
          { label: "Deployment", value: ctx.deployment || "Cloud" },
          { label: "Modules Enabled", value: `${enabledCount} of ${config.length}` },
          { label: "Recommendations", value: `${Object.keys(recs).length} active` },
          { label: "Carrier Validation", value: "Pre-load + Continuous" },
          { label: "Fraud Policies", value: `${enabledCount * 3} rules configured` },
          { label: "Risk Rules", value: "High Risk + Cargo Theft" },
          { label: "Alert Rules", value: "Real-time + Slack" },
        ].map(row => (
          <div key={row.label} className="bg-[var(--mil-surface)] border border-[var(--mil-border)] rounded-lg px-3 py-2">
            <p className="text-[9px] text-[var(--mil-muted)] uppercase tracking-wide mb-0.5">{row.label}</p>
            <p className="text-white font-medium">{row.value}</p>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="px-5 pb-5 grid grid-cols-2 gap-2">
        <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] text-xs text-[var(--mil-muted)] hover:text-white transition-colors">
          <Eye className="h-3.5 w-3.5" /> Review Config
        </button>
        <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] text-xs text-[var(--mil-muted)] hover:text-white transition-colors">
          <Download className="h-3.5 w-3.5" /> Export Report
        </button>
        <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] text-xs text-[var(--mil-muted)] hover:text-white transition-colors">
          <RefreshCw className="h-3.5 w-3.5" /> Request Review
        </button>
        <button className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#00c2b2] text-black text-xs font-bold hover:bg-[#00d9c7] transition-colors">
          <Play className="h-3.5 w-3.5" /> Deploy Configuration
        </button>
      </div>
    </motion.div>
  );
}
