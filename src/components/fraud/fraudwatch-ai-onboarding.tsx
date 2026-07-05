"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, CheckCircle2, Loader2, Zap, ChevronRight,
  Shield, ShieldCheck, Truck, User, MapPin, AlertTriangle,
  Check, Network, Activity, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

interface PipelineItem {
  id: string;
  agent: string;
  action: string;
  status: "queued" | "running" | "done";
  result?: string;
}

interface FraudRule {
  id: string;
  name: string;
  description: string;
  confidence: number;
  severity: "critical" | "high" | "medium";
}

interface PreCheck {
  label: string;
  done: boolean;
}

interface ConfigCard {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "pending" | "enabled" | "configured" | "recommended" | "analysing";
}

interface AgentLogEntry {
  agent: string;
  action: string;
  ts: string;
}

// ── Static data ────────────────────────────────────────────────────────────────

const STAGES_META = [
  { n: 1, label: "Business Discovery" },
  { n: 2, label: "Enterprise Discovery" },
  { n: 3, label: "Integration Validation" },
  { n: 4, label: "Configuration Generation" },
  { n: 5, label: "Pre-Deploy Validation" },
  { n: 6, label: "Deployment" },
];

const INITIAL_CONFIG: ConfigCard[] = [
  { id: "carrier_validation",    label: "Carrier Validation",      icon: ShieldCheck,   status: "pending" },
  { id: "driver_verification",   label: "Driver Verification",     icon: User,          status: "pending" },
  { id: "identity_verification", label: "Identity Verification",   icon: Shield,        status: "pending" },
  { id: "geofence_protection",   label: "Geofence Protection",     icon: MapPin,        status: "pending" },
  { id: "high_risk_rules",       label: "High Risk Carrier Rules", icon: AlertTriangle, status: "pending" },
  { id: "pickup_verification",   label: "Pickup Verification",     icon: Truck,         status: "pending" },
  { id: "fraud_alerts",          label: "Fraud Alerts",            icon: Zap,           status: "pending" },
];

const STATUS_STYLES: Record<string, { label: string; badge: string }> = {
  pending:     { label: "Pending",     badge: "text-white/30 border-white/10 bg-white/4"          },
  analysing:   { label: "Analysing",  badge: "text-amber-300 border-amber-500/30 bg-amber-500/10" },
  enabled:     { label: "Enabled",    badge: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" },
  configured:  { label: "Configured", badge: "text-[#00c2b2] border-[#00c2b2]/30 bg-[#00c2b2]/10"  },
  recommended: { label: "Recommended",badge: "text-blue-300 border-blue-500/30 bg-blue-500/10"    },
};

const Q_META = [
  { key: "contact",  label: "Company & Contact",   text: "What company are we onboarding today, and who am I speaking with?",              freeText: true,  options: undefined },
  { key: "cargo",    label: "Cargo Type",          text: "What types of cargo does {{company}} move?",                                     freeText: false, options: ["Dry van / general freight","Refrigerated / temp-controlled","Flatbed / oversized","Tanker / liquid bulk","Hazmat / chemicals","High-value / electronics","Pharma / healthcare"] },
  { key: "carriers", label: "Carrier Count",       text: "How many active carriers is {{company}} working with?",                          freeText: false, options: ["1–25 carriers","26–100 carriers","101–500 carriers","500+ carriers"] },
  { key: "geo",      label: "Geography",           text: "What regions does {{company}} operate in?",                                      freeText: false, options: ["US domestic only","US + Canada / Mexico","North America + Europe","Global operations"] },
  { key: "fraud",    label: "Fraud History",       text: "Has {{company}} experienced cargo fraud or theft in the last 12 months?",        freeText: false, options: ["Yes — multiple incidents","Yes — one or two","Minor attempts only","No incidents (that we know of)","Not sure"] },
  { key: "verify",   label: "Current Verification",text: "How does {{company}} currently verify carriers before they move freight?",        freeText: false, options: ["Manual paperwork / email","Carrier portal (self-service)","FMCSA lookup only","Third-party vetting service","No formal process"] },
];

const FRAUD_RULES: FraudRule[] = [
  { id: "r1", name: "New Carrier Verification Hold",  description: "Hold loads for carriers registered < 6 months until identity verified", confidence: 98, severity: "critical" },
  { id: "r2", name: "GSOC Watchlist Match Block",     description: "Auto-block carriers matching active GSOC freight fraud watchlist",      confidence: 99, severity: "critical" },
  { id: "r3", name: "Double-Broker Detection",        description: "Flag re-tendered loads where broker chain > 2 hops",                   confidence: 94, severity: "high"     },
  { id: "r4", name: "Pickup Verification Required",   description: "Driver photo ID + truck plate required before cargo release",          confidence: 96, severity: "high"     },
  { id: "r5", name: "Geofence Deviation Alert",       description: "Alert on route deviation > 15 miles from planned corridor",            confidence: 91, severity: "medium"   },
  { id: "r6", name: "After-Hours Load Alert",         description: "Flag pickups 10 pm–5 am for manual review",                           confidence: 87, severity: "medium"   },
];

// ── Main Component ─────────────────────────────────────────────────────────────

export function FraudWatchAIOnboarding({ onClose, prefilledCarrier }: { onClose: () => void; prefilledCarrier?: string }) {
  const [stage,           setStage]           = useState(1);
  const [stageQ,          setStageQ]          = useState(0);
  const [ctx,             setCtx]             = useState<Record<string, string>>({});
  const [completedQAs,    setCompletedQAs]    = useState<{ label: string; answer: string }[]>([]);
  const [tonyLine,        setTonyLine]        = useState(
    prefilledCarrier
      ? `Hey there! I can see you've dragged in **${prefilledCarrier}** — I'll get them onboarded right away. Who am I speaking with?`
      : "Hey there. I'm Tony, your FraudWatch Implementation Specialist. I've onboarded over 300 freight carriers on this platform. Let's get you set up."
  );
  const [pipeline,        setPipeline]        = useState<PipelineItem[]>([]);
  const [gate,            setGate]            = useState<{ id: string; question: string; approved: boolean } | null>(null);
  const [showMap,         setShowMap]         = useState(false);
  const [fraudRules,      setFraudRules]      = useState<FraudRule[] | null>(null);
  const [preChecks,       setPreChecks]       = useState<PreCheck[] | null>(null);
  const [isLive,          setIsLive]          = useState(false);
  const [doneStages,      setDoneStages]      = useState<{ n: number; summary: string }[]>([]);
  const [config,          setConfig]          = useState<ConfigCard[]>(INITIAL_CONFIG);
  const [agentLog,        setAgentLog]        = useState<AgentLogEntry[]>([]);
  const [readiness,       setReadiness]       = useState(0);
  const [processing,      setProcessing]      = useState(false);
  const [inputValue,      setInputValue]      = useState(prefilledCarrier ?? "");
  const ctxRef        = useRef(ctx);
  const activeRef     = useRef<HTMLDivElement>(null);
  const timers        = useRef<ReturnType<typeof setTimeout>[]>([]);
  ctxRef.current      = ctx;

  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms); timers.current.push(t);
  };
  const scrollActive = () => setTimeout(() => activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);

  const updateConfig = (updates: Partial<Record<string, ConfigCard["status"]>>) =>
    setConfig(prev => prev.map(c => updates[c.id] ? { ...c, status: updates[c.id]! } : c));

  const logAgent = (agent: string, action: string) =>
    setAgentLog(prev => [{
      agent, action,
      ts: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    }, ...prev].slice(0, 5));

  const markDone = (n: number, summary: string) =>
    setDoneStages(prev => prev.some(d => d.n === n) ? prev : [...prev, { n, summary }]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Auto-submit the carrier name when dragged in
  useEffect(() => {
    if (prefilledCarrier && stageQ === 0) {
      later(() => handleAnswer(prefilledCarrier), 900);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Stage 1 answer handler ─────────────────────────────────────────────────

  const handleAnswer = (answer: string) => {
    if (processing) return;
    setProcessing(true);

    const qm = Q_META[stageQ];
    const company = stageQ === 0 ? answer.split(/[,\/]/)[0].trim() : (ctxRef.current.company || "your company");
    const newCtx = { ...ctxRef.current, [qm.key]: answer };
    if (stageQ === 0) newCtx.company = company;
    setCtx(newCtx);
    setCompletedQAs(prev => [...prev, { label: qm.label, answer }]);

    // Tony reaction
    const reaction = (() => {
      if (stageQ === 0) return `Good to meet you. I'll use "${company}" throughout.`;
      if (stageQ === 1 && (answer.includes("Pharma") || answer.includes("High-value") || answer.includes("electronics")))
        return "High-value freight — we'll tighten your fraud rules accordingly.";
      if (stageQ === 4 && (answer.includes("multiple") || answer.includes("one or two")))
        return "Fraud history tells me exactly where your gaps are.";
      if (stageQ === 5 && (answer.includes("No formal") || answer.includes("Manual")))
        return "Manual vetting is where most carriers get hit. We'll fix that.";
      return null;
    })();

    if (reaction) later(() => setTonyLine(reaction), 300);

    const nextQ = stageQ + 1;
    if (nextQ > 5) {
      later(() => {
        setTonyLine(`That's everything I need from you, ${company}. Running discovery agents now.`);
        markDone(1, [company, newCtx.cargo, newCtx.carriers, newCtx.geo].filter(Boolean).join(" · "));
        setReadiness(18);
        later(() => startStage2(newCtx), 1000);
      }, reaction ? 700 : 300);
    } else {
      later(() => { setStageQ(nextQ); setProcessing(false); scrollActive(); }, reaction ? 600 : 300);
    }
  };

  // ── Stage 2: Enterprise Discovery ─────────────────────────────────────────

  const startStage2 = (c: Record<string, string>) => {
    setStage(2); setProcessing(true);
    const company = c.company || "your company";
    const items: PipelineItem[] = [
      { id: "p2-0", agent: "discovery_agent",            action: "scan_tms",             status: "queued" },
      { id: "p2-1", agent: "integration_discovery_agent",action: "scan_erp",             status: "queued" },
      { id: "p2-2", agent: "integration_discovery_agent",action: "scan_edi",             status: "queued" },
      { id: "p2-3", agent: "carrier_intelligence_agent", action: "discover_carrier_apis",status: "queued" },
    ];
    setPipeline(items);
    setTonyLine(`Scanning ${company}'s systems. Starting with TMS.`);
    scrollActive();

    const results = [
      "SAP TM 9.6 · REST API at /api/v2 · OAuth 2.0 configured",
      "SAP S/4HANA · Carrier master data accessible via OData v4",
      "X12 EDI · Transaction sets 204/210/214 confirmed on AS2",
      "347 carrier endpoints discovered · FMCSA cross-reference complete",
    ];
    const narrations = [
      null,
      `Now hitting ${company}'s ERP — this is where carrier master data lives.`,
      "Checking EDI. AS2 handshake in progress.",
      "Last one — pulling carrier endpoints and running FMCSA cross-reference.",
    ];

    items.forEach((item, i) => {
      later(() => {
        if (narrations[i]) setTonyLine(narrations[i]!);
        setPipeline(prev => prev.map((p, j) => j === i ? { ...p, status: "running" } : p));
        logAgent(item.agent, item.action);
        updateConfig({ carrier_validation: "analysing" });
        setReadiness(r => Math.min(r + 6, 42));

        later(() => {
          setPipeline(prev => prev.map((p, j) => j === i ? { ...p, status: "done", result: results[i] } : p));
          setReadiness(r => Math.min(r + 4, 48));
          if (i === items.length - 1) {
            later(() => {
              setTonyLine("Got everything I need. Here's what I found in your systems.");
              markDone(2, "4 systems discovered · SAP TM, S/4HANA, X12 EDI, 347 carriers");
              later(() => startStage3(c), 700);
            }, 500);
          }
        }, 1800);
      }, i * 3000 + 500);
    });
  };

  // ── Stage 3: Integration Validation (Gate 2) ──────────────────────────────

  const startStage3 = (c: Record<string, string>) => {
    setStage(3); setPipeline([]); setShowMap(true);
    setTonyLine(`Before I generate your config, confirm this integration map for ${c.company || "your company"} is correct.`);
    setGate({ id: "gate-2", question: "Is this integration map correct?", approved: false });
    setProcessing(false); setReadiness(52); scrollActive();
  };

  // ── Stage 4: Configuration Generation (Gate 3) ────────────────────────────

  const startStage4 = (c: Record<string, string>) => {
    setStage(4); setShowMap(false); setGate(null); setProcessing(true);
    const items: PipelineItem[] = [
      { id: "p4-0", agent: "validation_agent",        action: "validate_carriers", status: "queued" },
      { id: "p4-1", agent: "fraud_intelligence_agent",action: "check_gsoc_feed",  status: "queued" },
      { id: "p4-2", agent: "configuration_agent",     action: "generate_rules",   status: "queued" },
      { id: "p4-3", agent: "configuration_agent",     action: "package_config",   status: "queued" },
    ];
    setPipeline(items); setFraudRules(null);
    setTonyLine("Validating your carrier network and generating fraud rules.");
    scrollActive();

    const results = [
      "347 carriers validated · 12 flagged for FMCSA discrepancies",
      "GSOC watchlist loaded · 3 carriers on active fraud alerts",
      "6 fraud rules generated based on cargo profile and carrier network",
      "Configuration packaged · Awaiting deployment approval",
    ];

    items.forEach((item, i) => {
      later(() => {
        setPipeline(prev => prev.map((p, j) => j === i ? { ...p, status: "running" } : p));
        logAgent(item.agent, item.action);
        setReadiness(r => Math.min(r + 5, 70));
        updateConfig({
          carrier_validation:    i >= 0 ? "configured"  : undefined,
          high_risk_rules:       i >= 1 ? "configured"  : undefined,
          fraud_alerts:          i >= 2 ? "configured"  : undefined,
          identity_verification: i >= 2 ? "recommended" : undefined,
          pickup_verification:   i >= 2 ? "configured"  : undefined,
          driver_verification:   i >= 3 ? "enabled"     : undefined,
          geofence_protection:   i >= 3 ? "enabled"     : undefined,
        });

        later(() => {
          setPipeline(prev => prev.map((p, j) => j === i ? { ...p, status: "done", result: results[i] } : p));
          setReadiness(r => Math.min(r + 3, 74));
          if (i === items.length - 1) {
            later(() => {
              const company = c.company || "your company";
              setTonyLine(`6 fraud rules generated for ${company}. 3 GSOC-flagged carriers in your network need immediate attention. You approve, I push to config.`);
              setFraudRules(FRAUD_RULES);
              setGate({ id: "gate-3", question: "Approve these fraud rules?", approved: false });
              setProcessing(false); scrollActive();
            }, 600);
          }
        }, 2000);
      }, i * 3000);
    });
  };

  // ── Stage 5: Pre-Deploy Validation ────────────────────────────────────────

  const startStage5 = () => {
    setStage(5); setFraudRules(null); setGate(null); setPipeline([]); setProcessing(true);
    setTonyLine("Rules approved. Running 5 pre-deploy validation checks.");
    const checks: PreCheck[] = [
      { label: "API connectivity — TMS, ERP, EDI", done: false },
      { label: "Carrier database integrity check",  done: false },
      { label: "GSOC feed authentication",          done: false },
      { label: "Fraud rule conflict detection",     done: false },
      { label: "Alert routing — Slack + GSOC",      done: false },
    ];
    setPreChecks(checks); scrollActive();

    checks.forEach((_, i) => {
      later(() => {
        setPreChecks(prev => prev?.map((c, j) => j === i ? { ...c, done: true } : c) ?? null);
        setReadiness(r => Math.min(r + 4, 93));
        if (i === checks.length - 1) {
          later(() => {
            setTonyLine("All 5 checks passed. Config is clean and ready.");
            markDone(5, "All 5 validation checks passed");
            setReadiness(95);
            later(() => startStage6(), 800);
          }, 500);
        }
      }, (i + 1) * 1800);
    });
  };

  // ── Stage 6: Deployment Gate ──────────────────────────────────────────────

  const startStage6 = () => {
    setStage(6); setPreChecks(null); setProcessing(false);
    setTonyLine("Everything's green. The moment you confirm, I'll activate GSOC monitoring and push rules live.");
    setGate({ id: "gate-4", question: "Confirm deployment and activate FraudWatch?", approved: false });
    scrollActive();
  };

  // ── Deploy ────────────────────────────────────────────────────────────────

  const runDeployment = () => {
    setGate(null); setProcessing(true);
    const items: PipelineItem[] = [
      { id: "d-0", agent: "deployment_agent", action: "deploy_config",            status: "queued" },
      { id: "d-1", agent: "deployment_agent", action: "activate_gsoc_monitoring", status: "queued" },
      { id: "d-2", agent: "deployment_agent", action: "notify_team",              status: "queued" },
    ];
    setPipeline(items);

    const results = [
      "FraudWatch configuration deployed to production",
      "GSOC monitoring active · Watchlist sync every 15 min",
      "Slack alert sent to #fraud-ops · Stakeholders notified",
    ];

    items.forEach((item, i) => {
      later(() => {
        setPipeline(prev => prev.map((p, j) => j === i ? { ...p, status: "running" } : p));
        logAgent(item.agent, item.action);
        updateConfig({ carrier_validation: "enabled", driver_verification: "enabled", identity_verification: "enabled", geofence_protection: "enabled", high_risk_rules: "enabled", pickup_verification: "enabled", fraud_alerts: "enabled" });

        later(() => {
          setPipeline(prev => prev.map((p, j) => j === i ? { ...p, status: "done", result: results[i] } : p));
          setReadiness(r => Math.min(r + 2, 100));
          if (i === items.length - 1) {
            later(() => {
              setIsLive(true); setReadiness(100); setProcessing(false);
              setTonyLine(`You're live, ${ctxRef.current.company || "team"}. FraudWatch is monitoring your full carrier network. I'll be here if anything needs tuning in the first 30 days.`);
              markDone(6, "FraudWatch live · 347 carriers monitored · 6 rules active");
              scrollActive();
            }, 600);
          }
        }, 2000);
      }, i * 2800);
    });
  };

  // ── Gate handler ──────────────────────────────────────────────────────────

  const handleGate = (gateId: string) => {
    setGate(prev => prev ? { ...prev, approved: true } : null);
    if (gateId === "gate-2") {
      markDone(3, "Integration map confirmed · 6 systems");
      later(() => startStage4(ctxRef.current), 500);
    } else if (gateId === "gate-3") {
      markDone(4, "6 fraud rules approved");
      later(() => startStage5(), 500);
    } else if (gateId === "gate-4") {
      runDeployment();
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: "spring", damping: 28, stiffness: 260 }}
      className="absolute inset-0 z-20 flex overflow-hidden"
      style={{ background: "var(--mil-bg)" }}
    >
      {/* ── Left: Workflow Pipeline ────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 border-r border-[var(--mil-border)]">

        {/* Header */}
        <div className="shrink-0 px-5 py-3 border-b border-[var(--mil-border)] flex items-center gap-3" style={{ background: "var(--mil-panel)" }}>
          <div className="h-8 w-8 rounded-full bg-[#00c2b2] flex items-center justify-center shrink-0">
            <span className="text-[13px] font-bold text-black">T</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Tony · FraudWatch Implementation</p>
            <p className="text-[10px] text-[var(--mil-muted)]">Agentic onboarding · Stage {stage}/6</p>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] flex items-center justify-center text-[var(--mil-muted)] hover:text-white transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Pipeline */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {STAGES_META.map((s, idx) => {
            const isActive = s.n === stage;
            const isDone   = doneStages.some(d => d.n === s.n);
            const isPending = !isActive && !isDone;
            const summary  = doneStages.find(d => d.n === s.n)?.summary;
            const isLast   = idx === STAGES_META.length - 1;

            return (
              <div key={s.n} className="flex gap-4">
                {/* Connector */}
                <div className="flex flex-col items-center w-5 shrink-0">
                  <div className={cn(
                    "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300",
                    isDone   ? "border-emerald-400 bg-emerald-400/15" :
                    isActive ? "border-[#00c2b2] bg-[#00c2b2]/15" :
                               "border-white/12 bg-transparent"
                  )}>
                    {isDone
                      ? <Check className="h-2.5 w-2.5 text-emerald-400" />
                      : <span className={cn("text-[8px] font-bold", isActive ? "text-[#00c2b2]" : "text-white/20")}>{s.n}</span>}
                  </div>
                  {!isLast && (
                    <div className={cn(
                      "w-px flex-1 mt-1.5 min-h-[20px] transition-colors duration-500",
                      isDone   ? "bg-emerald-400/25" :
                      isActive ? "bg-[#00c2b2]/20" :
                                 "bg-white/6"
                    )} />
                  )}
                </div>

                {/* Stage body */}
                <div className={cn("flex-1 pb-5", isLast && "pb-2")}>
                  {/* Stage label row */}
                  <div className="flex items-center gap-2 h-6 mb-1">
                    <span className={cn("text-[11px] font-semibold tracking-wide transition-colors",
                      isDone   ? "text-white/40" :
                      isActive ? "text-white" :
                                 "text-white/18"
                    )}>{s.label}</span>

                    {isActive && (
                      <span className={cn(
                        "flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full border",
                        processing
                          ? "text-amber-300 border-amber-500/30 bg-amber-500/8"
                          : "text-[#00c2b2] border-[#00c2b2]/30 bg-[#00c2b2]/8"
                      )}>
                        {processing && <Loader2 className="h-2 w-2 animate-spin" />}
                        {processing ? "Running" : "Active"}
                      </span>
                    )}
                    {isDone && (
                      <span className="text-[8px] font-bold text-emerald-400 border border-emerald-400/25 bg-emerald-400/5 px-1.5 py-0.5 rounded-full">
                        Done
                      </span>
                    )}
                  </div>

                  {/* Completed summary */}
                  {isDone && summary && (
                    <p className="text-[10px] text-[var(--mil-muted)] leading-relaxed">{summary}</p>
                  )}

                  {/* Active stage content */}
                  {isActive && !isDone && (
                    <div ref={activeRef} className="mt-2 space-y-3">

                      {/* Tony directive */}
                      <div className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-[#00c2b2]/15 border border-[#00c2b2]/30 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[7px] font-bold text-[#00c2b2]">T</span>
                        </div>
                        <p className="text-[11px] text-[var(--mil-muted)] leading-relaxed">{tonyLine}</p>
                      </div>

                      {/* Stage 1 — Q&A form */}
                      {s.n === 1 && (
                        <Stage1Form
                          stageQ={stageQ}
                          completedQAs={completedQAs}
                          ctx={ctx}
                          inputValue={inputValue}
                          setInputValue={setInputValue}
                          onAnswer={handleAnswer}
                          prefilledCarrier={prefilledCarrier}
                        />
                      )}

                      {/* Agent pipeline (stages 2, 4, 6) */}
                      {(s.n === 2 || s.n === 4 || s.n === 6) && pipeline.length > 0 && (
                        <PipelineView items={pipeline} />
                      )}

                      {/* Stage 3 — integration map */}
                      {s.n === 3 && showMap && <IntegrationMapCard />}

                      {/* Stage 4 — fraud rules */}
                      {s.n === 4 && fraudRules && <FraudRulesCard rules={fraudRules} />}

                      {/* Stage 5 — pre-deploy checks */}
                      {s.n === 5 && preChecks && <PreDeployCard checks={preChecks} />}

                      {/* Stage 6 — go-live card */}
                      {s.n === 6 && isLive && <GoLiveCard />}

                      {/* Gate (any active stage) */}
                      {gate && !gate.approved && (
                        <GateBlock gate={gate} onApprove={handleGate} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right: Config Panel ─────────────────────────────────────────── */}
      <RightPanel config={config} agentLog={agentLog} readiness={readiness} />
    </motion.div>
  );
}

// ── Stage 1 Form ──────────────────────────────────────────────────────────────

function Stage1Form({ stageQ, completedQAs, ctx, inputValue, setInputValue, onAnswer, prefilledCarrier }: {
  stageQ: number;
  completedQAs: { label: string; answer: string }[];
  ctx: Record<string, string>;
  inputValue: string;
  setInputValue: (v: string) => void;
  onAnswer: (a: string) => void;
  prefilledCarrier?: string;
}) {
  const company = ctx.company || "your company";
  const qm = Q_META[stageQ];
  const questionText = qm?.text.replace("{{company}}", company) ?? "";

  return (
    <div className="space-y-2">
      {/* Dropped carrier badge */}
      {prefilledCarrier && stageQ === 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#00c2b2]/30 bg-[#00c2b2]/8">
          <div className="h-5 w-5 rounded-md bg-[#00c2b2]/20 flex items-center justify-center shrink-0">
            <Truck className="h-3 w-3 text-[#00c2b2]" />
          </div>
          <span className="text-[11px] text-[#00c2b2] font-medium flex-1 truncate">Carrier dragged in: <strong>{prefilledCarrier}</strong></span>
          <span className="text-[9px] text-[#00c2b2]/60 border border-[#00c2b2]/20 rounded px-1.5 py-0.5">Pre-filled</span>
        </div>
      )}

      {/* Completed answers table */}
      {completedQAs.length > 0 && (
        <div className="rounded-lg border border-[var(--mil-border)] bg-[var(--mil-surface)] divide-y divide-[var(--mil-border)] overflow-hidden">
          {completedQAs.map((qa, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-1.5">
              <span className="text-[9px] uppercase tracking-wide text-[var(--mil-muted)] w-28 shrink-0">{qa.label}</span>
              <span className="text-[11px] text-white/75 flex-1 truncate">{qa.answer}</span>
              <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Active question */}
      {stageQ <= 5 && qm && (
        <div className="rounded-lg border border-[#00c2b2]/20 bg-[#00c2b2]/4 overflow-hidden">
          <div className="px-3 py-2 border-b border-[#00c2b2]/10">
            <p className="text-[11px] font-medium text-white">{questionText}</p>
          </div>
          <div className="p-2">
            {qm.freeText ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && inputValue.trim()) { onAnswer(inputValue.trim()); setInputValue(""); } }}
                  placeholder={prefilledCarrier && stageQ === 0 ? `${prefilledCarrier}, your name…` : "Type company name and your name…"}
                  className="flex-1 px-3 py-1.5 rounded-md text-[11px] bg-[var(--mil-elevated)] border border-[var(--mil-border)] text-white placeholder:text-white/25 focus:outline-none focus:border-[#00c2b2]/50"
                />
                <button
                  onClick={() => { if (inputValue.trim()) { onAnswer(inputValue.trim()); setInputValue(""); } }}
                  className="px-3 py-1.5 rounded-md bg-[#00c2b2] text-black text-[11px] font-bold hover:bg-[#00d9c7] transition-colors shrink-0"
                >→</button>
              </div>
            ) : (
              <div className="space-y-1">
                {qm.options?.map(opt => (
                  <button key={opt} onClick={() => onAnswer(opt)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--mil-elevated)] border border-[var(--mil-border)] text-[11px] text-[var(--mil-text)] hover:text-white hover:border-[#00c2b2]/40 hover:bg-[#00c2b2]/5 transition-all text-left group">
                    <ChevronRight className="h-3 w-3 text-[#00c2b2]/40 group-hover:text-[#00c2b2] shrink-0 transition-colors" />
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pipeline View ─────────────────────────────────────────────────────────────

function PipelineView({ items }: { items: PipelineItem[] }) {
  const running = items.filter(i => i.status === "running").length;
  const done    = items.filter(i => i.status === "done").length;

  return (
    <div className="rounded-lg border border-white/8 bg-[#0a0c0d] overflow-hidden">
      <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2">
        {running > 0
          ? <div className="h-1.5 w-1.5 rounded-full bg-[#00c2b2] animate-pulse shrink-0" />
          : <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />}
        <span className="text-[9px] font-mono uppercase tracking-widest text-white/35">Agent Pipeline</span>
        <span className="ml-auto text-[8px] font-mono text-white/25">{done}/{items.length} complete</span>
      </div>
      <div className="divide-y divide-white/4">
        {items.map(item => (
          <div key={item.id} className={cn(
            "flex items-start gap-3 px-3 py-2.5 transition-colors",
            item.status === "running" ? "bg-[#00c2b2]/4" : ""
          )}>
            <div className="mt-0.5 shrink-0">
              {item.status === "done"    && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
              {item.status === "running" && <Loader2 className="h-3.5 w-3.5 text-[#00c2b2] animate-spin" />}
              {item.status === "queued"  && <div className="h-3.5 w-3.5 rounded-full border border-white/12" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={cn("text-[10px] font-mono",
                  item.status === "queued" ? "text-white/20" : "text-[#00c2b2]/80"
                )}>{item.agent}</span>
                <span className="text-white/15 text-[9px]">›</span>
                <span className={cn("text-[10px] font-mono",
                  item.status === "queued" ? "text-white/15" : "text-white/55"
                )}>{item.action}</span>
                {item.status === "running" && (
                  <span className="ml-auto text-[8px] text-[#00c2b2]/50 font-mono">executing…</span>
                )}
              </div>
              {item.status === "done" && item.result && (
                <p className="text-[9px] text-white/30 mt-0.5 leading-relaxed">{item.result}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Integration Map Card ──────────────────────────────────────────────────────

function IntegrationMapCard() {
  const systems = [
    { name: "SAP TM 9.6",    type: "TMS",         status: "Connected",    dot: "bg-emerald-400" },
    { name: "SAP S/4HANA",   type: "ERP",         status: "Connected",    dot: "bg-emerald-400" },
    { name: "X12 EDI / AS2", type: "EDI",         status: "Connected",    dot: "bg-emerald-400" },
    { name: "Carrier API Hub",type: "APIs",        status: "347 endpoints",dot: "bg-[#00c2b2]"   },
    { name: "FMCSA SAFER",   type: "Regulatory",  status: "Live feed",    dot: "bg-[#00c2b2]"   },
    { name: "GSOC Watchlist", type: "Intelligence",status: "Syncing",      dot: "bg-amber-400"   },
  ];
  return (
    <div className="rounded-lg border border-[var(--mil-border)] bg-[var(--mil-surface)] overflow-hidden">
      <div className="px-3 py-2 border-b border-[var(--mil-border)] flex items-center gap-2">
        <Network className="h-3 w-3 text-[#00c2b2]" />
        <span className="text-[10px] font-semibold text-white">Integration Map</span>
        <span className="ml-auto text-[9px] text-[var(--mil-muted)]">6 systems</span>
      </div>
      {systems.map(s => (
        <div key={s.name} className="flex items-center gap-2.5 px-3 py-1.5 border-b border-[var(--mil-border)] last:border-0">
          <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", s.dot)} />
          <span className="text-[10px] text-white/75 flex-1">{s.name}</span>
          <span className="text-[9px] text-[var(--mil-muted)] w-20 shrink-0">{s.type}</span>
          <span className="text-[9px] text-[#00c2b2]">{s.status}</span>
        </div>
      ))}
    </div>
  );
}

// ── Fraud Rules Card ──────────────────────────────────────────────────────────

function FraudRulesCard({ rules }: { rules: FraudRule[] }) {
  const sev: Record<string, string> = {
    critical: "text-red-400 border-red-500/20 bg-red-500/5",
    high:     "text-amber-400 border-amber-500/20 bg-amber-500/5",
    medium:   "text-sky-400 border-sky-500/20 bg-sky-500/5",
  };
  return (
    <div className="rounded-lg border border-[var(--mil-border)] bg-[var(--mil-surface)] overflow-hidden">
      <div className="px-3 py-2 border-b border-[var(--mil-border)] flex items-center gap-2">
        <Shield className="h-3 w-3 text-[#00c2b2]" />
        <span className="text-[10px] font-semibold text-white">Generated Fraud Rules</span>
        <span className="ml-auto text-[9px] text-[var(--mil-muted)]">{rules.length} rules</span>
      </div>
      {rules.map(rule => (
        <div key={rule.id} className="flex items-start gap-2.5 px-3 py-2 border-b border-[var(--mil-border)] last:border-0">
          <span className={cn("text-[7px] font-bold px-1 py-0.5 rounded border uppercase mt-0.5 shrink-0", sev[rule.severity])}>{rule.severity}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-white/85 leading-snug">{rule.name}</p>
            <p className="text-[9px] text-[var(--mil-muted)] leading-relaxed mt-0.5">{rule.description}</p>
          </div>
          <span className="text-[9px] font-bold text-[#00c2b2] shrink-0">{rule.confidence}%</span>
        </div>
      ))}
    </div>
  );
}

// ── Pre-Deploy Card ───────────────────────────────────────────────────────────

function PreDeployCard({ checks }: { checks: PreCheck[] }) {
  const done = checks.filter(c => c.done).length;
  return (
    <div className="rounded-lg border border-[var(--mil-border)] bg-[var(--mil-surface)] overflow-hidden">
      <div className="px-3 py-2 border-b border-[var(--mil-border)] flex items-center gap-2">
        <Activity className="h-3 w-3 text-[#00c2b2]" />
        <span className="text-[10px] font-semibold text-white">Pre-Deploy Validation</span>
        <span className="ml-auto text-[9px] text-[var(--mil-muted)]">{done}/{checks.length} passed</span>
      </div>
      {checks.map((check, i) => (
        <div key={i} className="flex items-center gap-2.5 px-3 py-2 border-b border-[var(--mil-border)] last:border-0">
          {check.done
            ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            : <div className="h-3.5 w-3.5 rounded-full border border-white/12 shrink-0" />}
          <span className={cn("text-[10px]", check.done ? "text-white/65" : "text-white/20")}>{check.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Gate Block ────────────────────────────────────────────────────────────────

function GateBlock({ gate, onApprove }: { gate: { id: string; question: string; approved: boolean }; onApprove: (id: string) => void }) {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-amber-500/15">
        <Lock className="h-3 w-3 text-amber-400 shrink-0" />
        <span className="text-[9px] font-bold text-amber-300 uppercase tracking-widest">Human Approval Required</span>
      </div>
      <div className="px-3 py-3">
        <p className="text-[12px] font-medium text-white mb-3">{gate.question}</p>
        <div className="flex gap-2">
          <button onClick={() => onApprove(gate.id)}
            className="flex-1 py-2 rounded-lg bg-[#00c2b2] text-black text-[11px] font-bold hover:bg-[#00d9c7] transition-colors">
            Confirm & Continue
          </button>
          <button className="px-3 py-2 rounded-lg border border-white/10 text-[11px] text-white/35 hover:text-white hover:border-white/25 transition-colors">
            Request Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Go-Live Card ──────────────────────────────────────────────────────────────

function GoLiveCard() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      className="rounded-lg border border-[#00c2b2]/40 bg-[#00c2b2]/8 overflow-hidden">
      <div className="px-4 py-4 text-center">
        <div className="h-10 w-10 rounded-full border-2 border-[#00c2b2] flex items-center justify-center mx-auto mb-2.5">
          <Check className="h-5 w-5 text-[#00c2b2]" />
        </div>
        <p className="text-sm font-bold text-white mb-0.5">FraudWatch is Live</p>
        <p className="text-[10px] text-[var(--mil-muted)] mb-3">GSOC monitoring active · All fraud rules deployed</p>
        <div className="grid grid-cols-3 gap-1.5">
          {[{ label: "Carriers", value: "347" }, { label: "Rules", value: "6" }, { label: "Status", value: "Live" }].map(item => (
            <div key={item.label} className="bg-[var(--mil-surface)] border border-[var(--mil-border)] rounded px-2 py-2">
              <p className="text-sm font-bold text-[#00c2b2]">{item.value}</p>
              <p className="text-[8px] text-[var(--mil-muted)] mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Right Panel ───────────────────────────────────────────────────────────────

function RightPanel({ config, agentLog, readiness }: {
  config: ConfigCard[];
  agentLog: AgentLogEntry[];
  readiness: number;
}) {
  return (
    <div className="w-64 shrink-0 flex flex-col overflow-hidden" style={{ background: "var(--mil-panel)" }}>
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4">

        <div>
          <p className="text-[8px] uppercase tracking-widest text-[var(--mil-muted)] mb-2">Configuration Modules</p>
          <div className="space-y-1">
            {config.map(card => {
              const s = STATUS_STYLES[card.status];
              return (
                <motion.div key={card.id}
                  animate={card.status === "analysing" ? { borderColor: ["rgba(255,255,255,0.08)", "rgba(0,194,178,0.3)", "rgba(255,255,255,0.08)"] } : {}}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-[var(--mil-border)] bg-[var(--mil-surface)]">
                  <card.icon className={cn("h-3 w-3 shrink-0",
                    card.status === "pending"     ? "text-white/20" :
                    card.status === "enabled"     ? "text-emerald-400" :
                    card.status === "configured"  ? "text-[#00c2b2]" :
                    card.status === "recommended" ? "text-blue-400" : "text-amber-400"
                  )} />
                  <span className={cn("flex-1 text-[10px]", card.status === "pending" ? "text-white/20" : "text-white/70")}>{card.label}</span>
                  <span className={cn("text-[7px] font-bold px-1 py-0.5 rounded border", s.badge)}>
                    {card.status === "analysing" ? <Loader2 className="h-2 w-2 animate-spin inline" /> : s.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {agentLog.length > 0 && (
          <>
            <div className="border-t border-[var(--mil-border)]" />
            <div>
              <p className="text-[8px] uppercase tracking-widest text-[var(--mil-muted)] mb-2">Agent Activity</p>
              <div className="space-y-1.5">
                <AnimatePresence initial={false}>
                  {agentLog.map((log, i) => (
                    <motion.div key={`${log.agent}-${log.ts}`}
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1.5 text-[9px]">
                      <div className="h-1 w-1 rounded-full bg-[#00c2b2] shrink-0" />
                      <span className="text-[#00c2b2]/60 font-mono truncate flex-1">{log.action}</span>
                      <span className="text-white/20 font-mono shrink-0">{log.ts}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-[var(--mil-border)] px-3.5 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[8px] uppercase tracking-widest text-[var(--mil-muted)]">Implementation Readiness</span>
          <span className="text-[9px] font-bold text-[#00c2b2]">{readiness}%</span>
        </div>
        <div className="h-1 rounded-full bg-white/8 overflow-hidden">
          <motion.div className="h-full rounded-full bg-[#00c2b2]" animate={{ width: `${readiness}%` }} transition={{ duration: 0.5 }} />
        </div>
        <p className="text-[8px] text-[var(--mil-muted)] mt-1.5">
          {readiness === 0    ? "Awaiting first response…"
          : readiness < 20   ? "Gathering requirements…"
          : readiness < 50   ? "Discovering integrations…"
          : readiness < 75   ? "Generating configuration…"
          : readiness < 95   ? "Validating deployment…"
          : readiness === 100 ? "Live — GSOC monitoring active"
          : "Ready for deployment"}
        </p>
      </div>
    </div>
  );
}
