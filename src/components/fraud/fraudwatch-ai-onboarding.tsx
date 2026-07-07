"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";
import {
  X, CheckCircle2, Loader2, Zap, ChevronRight,
  Shield, ShieldCheck, Truck, User, MapPin, AlertTriangle,
  Check, Network, Activity, Lock, TrendingUp, Sparkles, Radar,
  Fingerprint, Phone, IdCard, Gauge, ArrowRight, BadgeAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SherlockAvatar, sherlockStateFrom } from "./sherlock-avatar";

// ── Glassmorphism + "live system" visual primitives ───────────────────────────
// Shared material treatments: frosted backgrounds swap flat fills for
// translucent + backdrop-blur so the ambient node-graph and busy dashboard
// behind this panel bleed through faintly, plus a soft accent-colored glow
// instead of a hard border. Numeric/technical readouts get font-mono
// elsewhere in this file to read as "system data" vs. Sherlock's dialogue.

const GLASS_NEUTRAL = "backdrop-blur-md border border-white/10 shadow-[0_0_22px_-12px_rgba(0,194,178,0.18)]";
const GLASS_TEAL     = "backdrop-blur-md border border-[#00c2b2]/20 shadow-[0_0_26px_-10px_rgba(0,194,178,0.3)]";
const GLASS_VIOLET   = "backdrop-blur-md border border-violet-500/25 shadow-[0_0_30px_-8px_rgba(139,92,246,0.3),0_0_46px_-14px_rgba(0,194,178,0.18)]";
const GLASS_AMBER     = "backdrop-blur-md border border-amber-500/25 shadow-[0_0_24px_-10px_rgba(245,158,11,0.25)]";

// Counts a number up from 0 to its target in sync with the ring/bar draw
// animation rather than snapping in instantly — reinforces "live readout."
function CountUp({ value, duration = 0.8, className, suffix = "" }: { value: number; duration?: number; className?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, duration]);
  return <span className={className}>{display}{suffix}</span>;
}

// One-time top-to-bottom gradient sweep — plays once on mount, ties into
// Sherlock's "before I scan your systems" line on the Predictive Risk card.
function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-16 pointer-events-none z-10"
      style={{ background: "linear-gradient(180deg, transparent, rgba(0,194,178,0.14) 45%, rgba(139,92,246,0.16) 55%, transparent)" }}
      initial={{ top: "-15%" }}
      animate={{ top: "115%" }}
      transition={{ duration: 1.3, ease: "easeInOut", delay: 0.15 }}
    />
  );
}

// Very low-opacity connecting-node graphic behind the discovery panel —
// signals the underlying multi-agent architecture without being loud.
function NodeGraphTexture() {
  const nodes = [
    [8, 12], [22, 28], [14, 46], [30, 58], [6, 68], [24, 82],
    [38, 18], [46, 40], [40, 70], [58, 26], [64, 52], [56, 86],
    [80, 16], [86, 44], [78, 66], [92, 30], [94, 78],
  ];
  const edges = [[0,1],[1,2],[2,3],[1,6],[3,4],[3,5],[6,7],[7,9],[7,8],[9,10],[10,11],[10,12],[12,13],[13,15],[13,14],[15,16]];
  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none"
      style={{ opacity: 0.05 }}
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
          stroke="#00c2b2" strokeWidth="0.15" />
      ))}
      {nodes.map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 0.7 : 0.45}
          fill={i % 4 === 0 ? "#8b5cf6" : "#00c2b2"}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4 + (i % 5), repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
        />
      ))}
    </svg>
  );
}

// Animated left-to-right severity bar for the predicted risk vectors —
// replaces the plain numbered list with a ranked visual read.
const VECTOR_SEVERITY = [92, 74, 58];
const VECTOR_COLOR = ["#f87171", "#fbbf24", "#00c2b2"];
function SeverityBar({ index }: { index: number }) {
  const pct = VECTOR_SEVERITY[index] ?? 50;
  const color = VECTOR_COLOR[index] ?? "#00c2b2";
  return (
    <div className="h-[3px] w-full rounded-full bg-white/8 overflow-hidden mt-1.5">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: "0%" }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 + index * 0.15 }}
      />
    </div>
  );
}

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

interface PredictiveInsight {
  score: number;
  exposure: string;
  percentile: number;
  confidence: number;
  vectors: string[];
  incidentsPreventedPerYear: number;
  roiEstimate: string;
}

interface DriverProfile {
  id: string;
  name: string;
  cdl: string;
  yearsExperience: number;
  safetyScore: number;
  backgroundCheck: "clear" | "pending" | "flagged";
  biometricVerified: boolean;
  phoneVerified: boolean;
  lastActive: string;
  gsocMatch?: string;
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

// What Sherlock is focused on right now, surfaced as a small context chip
// above his line — the lightweight version of a "dynamic workspace" that
// doesn't require inventing a topic-detection layer: the current stage
// already tells us exactly what he's looking at.
const STAGE_FOCUS: Record<number, string> = {
  1: "Business Profile",
  2: "Enterprise Systems — TMS · ERP · EDI",
  3: "System Integrations",
  4: "Fraud Rules & Driver Verification",
  5: "Deployment Readiness",
  6: "Live Monitoring",
};

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
  { key: "cargo",    label: "Cargo Type",          text: "What types of cargo does {{company}} move? This tells me which fraud patterns to weight — high-value freight and cold chain draw very different risks.", freeText: false, options: ["Dry van / general freight","Refrigerated / temp-controlled","Flatbed / oversized","Tanker / liquid bulk","Hazmat / chemicals","High-value / electronics","Pharma / healthcare"] },
  { key: "carriers", label: "Carrier Count",       text: "How many active carriers is {{company}} working with? I'll use this to size the FMCSA and GSOC cross-reference I'm about to run.", freeText: false, options: ["1–25 carriers","26–100 carriers","101–500 carriers","500+ carriers"] },
  { key: "geo",      label: "Geography",           text: "What regions does {{company}} operate in? Cross-border lanes widen the carrier identity fraud surface, so this shapes how strict I set verification.", freeText: false, options: ["US domestic only","US + Canada / Mexico","North America + Europe","Global operations"] },
  { key: "fraud",    label: "Fraud History",       text: "Has {{company}} experienced cargo fraud or theft in the last 12 months? Nothing here disqualifies anything — it just tells me where to focus first.", freeText: false, options: ["Yes — multiple incidents","Yes — one or two","Minor attempts only","No incidents (that we know of)","Not sure"] },
  { key: "verify",   label: "Current Verification",text: "How does {{company}} currently verify carriers before they move freight? This is usually where the gap is, so I want to see exactly what I'm replacing.", freeText: false, options: ["Manual paperwork / email","Carrier portal (self-service)","FMCSA lookup only","Third-party vetting service","No formal process"] },
];

const FRAUD_RULES: FraudRule[] = [
  { id: "r1", name: "New Carrier Verification Hold",  description: "Hold loads for carriers registered < 6 months until identity verified", confidence: 98, severity: "critical" },
  { id: "r2", name: "GSOC Watchlist Match Block",     description: "Auto-block carriers matching active GSOC freight fraud watchlist",      confidence: 99, severity: "critical" },
  { id: "r3", name: "Double-Broker Detection",        description: "Flag re-tendered loads where broker chain > 2 hops",                   confidence: 94, severity: "high"     },
  { id: "r4", name: "Pickup Verification Required",   description: "Driver photo ID + truck plate required before cargo release",          confidence: 96, severity: "high"     },
  { id: "r5", name: "Geofence Deviation Alert",       description: "Alert on route deviation > 15 miles from planned corridor",            confidence: 91, severity: "medium"   },
  { id: "r6", name: "After-Hours Load Alert",         description: "Flag pickups 10 pm–5 am for manual review",                           confidence: 87, severity: "medium"   },
];

const DRIVERS: DriverProfile[] = [
  { id: "d1", name: "Marcus Reyes",   cdl: "TX-88213", yearsExperience: 7,  safetyScore: 96, backgroundCheck: "clear",   biometricVerified: true,  phoneVerified: true,  lastActive: "Dallas, TX" },
  { id: "d2", name: "Angela Kim",     cdl: "CA-44710", yearsExperience: 3,  safetyScore: 88, backgroundCheck: "clear",   biometricVerified: true,  phoneVerified: true,  lastActive: "Fresno, CA" },
  { id: "d3", name: "Devon Walsh",    cdl: "IL-19042", yearsExperience: 11, safetyScore: 99, backgroundCheck: "clear",   biometricVerified: true,  phoneVerified: true,  lastActive: "Joliet, IL" },
  { id: "d4", name: "Priya Nandan",   cdl: "NJ-77321", yearsExperience: 1,  safetyScore: 74, backgroundCheck: "pending", biometricVerified: false, phoneVerified: true,  lastActive: "Newark, NJ" },
  { id: "d5", name: "Ray Contreras",  cdl: "FL-50218", yearsExperience: 5,  safetyScore: 61, backgroundCheck: "flagged", biometricVerified: false, phoneVerified: false, lastActive: "Miami, FL", gsocMatch: "Alias match — GSOC freight fraud watchlist entry #4471" },
];

// Deterministic predictive-risk model — reads the Q&A answers and produces a
// forward-looking exposure estimate, not just a snapshot of current state.
function computePredictiveRisk(ctx: Record<string, string>): PredictiveInsight {
  let score = 38;
  const vectors: string[] = [];
  let confidence = 95;

  const cargo = ctx.cargo ?? "";
  const carriers = ctx.carriers ?? "";
  const geo = ctx.geo ?? "";
  const fraud = ctx.fraud ?? "";
  const verify = ctx.verify ?? "";

  if (/pharma|high-value|electronics/i.test(cargo)) { score += 18; vectors.push("High-value cargo attracts organized theft rings"); }
  else if (/hazmat/i.test(cargo)) { score += 10; vectors.push("Hazmat loads carry regulatory + tampering exposure"); }
  else if (/refrigerated/i.test(cargo)) { score += 6; vectors.push("Cold-chain freight is a target for load-swap fraud"); }

  if (/500\+/.test(carriers)) { score += 15; }
  else if (/101–500/.test(carriers)) { score += 10; }
  else if (/26–100/.test(carriers)) { score += 5; }

  if (/global/i.test(geo)) { score += 12; vectors.push("Cross-border freight increases carrier identity fraud risk"); }
  else if (/europe/i.test(geo)) { score += 8; vectors.push("Multi-region lanes widen your carrier verification surface"); }
  else if (/canada|mexico/i.test(geo)) { score += 4; }

  if (/multiple incidents/i.test(fraud)) { score += 20; vectors.push("Recent fraud history strongly predicts recurrence within 12 months"); }
  else if (/one or two/i.test(fraud)) { score += 12; vectors.push("Prior incidents indicate an existing gap in carrier vetting"); }
  else if (/minor attempts/i.test(fraud)) { score += 5; }
  else if (/not sure/i.test(fraud)) { confidence -= 8; }

  if (/no formal process/i.test(verify)) { score += 15; vectors.push("No formal carrier verification is your single largest exposure"); }
  else if (/manual paperwork/i.test(verify)) { score += 10; vectors.push("Manual paperwork vetting is the #1 entry point for double-brokering"); }
  else if (/fmcsa lookup only/i.test(verify)) { score += 5; vectors.push("FMCSA-only checks miss recently-registered shell carriers"); }

  score = Math.min(Math.max(score, 12), 99);
  if (vectors.length < 3) vectors.push("Weekend and after-hours pickups see 3x the fraud rate of weekday loads");
  if (vectors.length < 3) vectors.push("Carriers under 6 months old account for the majority of identity fraud");

  const carrierCountNum =
    /500\+/.test(carriers) ? 650 :
    /101–500/.test(carriers) ? 300 :
    /26–100/.test(carriers) ? 60 : 15;

  const exposureLow = Math.round(carrierCountNum * (score / 100) * 4_200);
  const exposureHigh = Math.round(exposureLow * 2.4);
  const fmt = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${Math.round(n / 1000)}K`;

  const incidentsPreventedPerYear = Math.max(2, Math.round((score / 100) * carrierCountNum * 0.06));
  const roiEstimate = fmt(incidentsPreventedPerYear * 38_000);

  return {
    score,
    exposure: `${fmt(exposureLow)}–${fmt(exposureHigh)}`,
    percentile: Math.min(96, Math.round(score * 0.9 + 5)),
    confidence,
    vectors: vectors.slice(0, 3),
    incidentsPreventedPerYear,
    roiEstimate,
  };
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function FraudWatchAIOnboarding({ onClose, prefilledCarrier }: { onClose: () => void; prefilledCarrier?: string }) {
  const [stage,           setStage]           = useState(1);
  const [stageQ,          setStageQ]          = useState(0);
  const [ctx,             setCtx]             = useState<Record<string, string>>(
    prefilledCarrier ? { company: prefilledCarrier } : {}
  );
  const [completedQAs,    setCompletedQAs]    = useState<{ label: string; answer: string }[]>([]);
  const [sherlockLine,    setSherlockLine]    = useState(
    prefilledCarrier
      ? `I'll be setting up **${prefilledCarrier}** in FraudWatch. Before we dig in — who am I speaking with there?`
      : "Hi there — I'm Sherlock, your FraudWatch implementation specialist. I've onboarded over 300 freight carriers, so I already know where the risk usually hides. Let's get your carrier network protected."
  );
  const [justSpoke,       setJustSpoke]       = useState(false);
  const speakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Sherlock's on-screen presence briefly enters "speaking" whenever his
  // line changes, then settles back to idle — purely presentational, no
  // effect on the underlying stage/gate state machine below.
  useEffect(() => {
    setJustSpoke(true);
    if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
    speakTimerRef.current = setTimeout(() => setJustSpoke(false), 1800);
    return () => { if (speakTimerRef.current) clearTimeout(speakTimerRef.current); };
  }, [sherlockLine]);
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
  const [inputValue,      setInputValue]      = useState("");
  const [predictiveInsight, setPredictiveInsight] = useState<PredictiveInsight | null>(null);
  const [driverRoster,    setDriverRoster]    = useState<DriverProfile[] | null>(null);
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

  // ── Stage 1 answer handler ─────────────────────────────────────────────────

  const handleAnswer = (answer: string) => {
    if (processing) return;
    setProcessing(true);

    const qm = Q_META[stageQ];
    // When carrier was dragged in, company is already in ctx — Q0 answer is just the contact name
    const company = prefilledCarrier
      ? (ctxRef.current.company || prefilledCarrier)
      : (stageQ === 0 ? answer.split(/[,\/]/)[0].trim() : (ctxRef.current.company || "your company"));
    const newCtx = { ...ctxRef.current, [qm.key]: answer };
    if (stageQ === 0 && !prefilledCarrier) newCtx.company = company;
    setCtx(newCtx);
    const completedLabel = stageQ === 0 && prefilledCarrier ? "Contact Person" : qm.label;
    setCompletedQAs(prev => [...prev, { label: completedLabel, answer }]);

    // Sherlock reacts like a consultant noting something relevant, not a form advancing
    const reaction = (() => {
      if (stageQ === 0 && prefilledCarrier) return `Good to meet you, ${answer}. I'll loop you in on everything as we set up ${company}.`;
      if (stageQ === 0) return `Good to meet you. I'll refer to "${company}" throughout — that keeps the audit trail clean on our side too.`;
      if (stageQ === 1 && (answer.includes("Pharma") || answer.includes("High-value") || answer.includes("electronics")))
        return "Noted — high-value freight like that draws organized theft rings, so I'll weight your fraud rules more aggressively toward identity and pickup verification.";
      if (stageQ === 4 && (answer.includes("multiple") || answer.includes("one or two")))
        return "That history is useful, not alarming — it tells me exactly where your current process has gaps, which is what I'll close first.";
      if (stageQ === 5 && (answer.includes("No formal") || answer.includes("Manual")))
        return "Manual vetting is where most carriers get hit — double-brokering slips straight through email chains. That's the first thing FraudWatch will automate for you.";
      return null;
    })();

    if (reaction) later(() => setSherlockLine(reaction), 300);

    const nextQ = stageQ + 1;
    if (nextQ > 5) {
      later(() => {
        setSherlockLine(`That's everything I need from you on ${company}. Before I go scan your systems, let me show you my predictive risk read — this tells us where to focus first.`);
        setPredictiveInsight(computePredictiveRisk(newCtx));
        setReadiness(14);
        setProcessing(false);
        scrollActive();
      }, reaction ? 700 : 300);
    } else {
      later(() => { setStageQ(nextQ); setProcessing(false); scrollActive(); }, reaction ? 600 : 300);
    }
  };

  const handleContinueFromPredictive = () => {
    if (processing) return;
    setProcessing(true);
    const c = ctxRef.current;
    markDone(1, [c.company, c.cargo, c.carriers, c.geo].filter(Boolean).join(" · "));
    setReadiness(18);
    later(() => startStage2(c), 400);
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
    setSherlockLine(`I'll start by looking at ${company}'s TMS — that's where I can confirm how loads are tendered and who touches them.`);
    scrollActive();

    const results = [
      "SAP TM 9.6 · REST API at /api/v2 · OAuth 2.0 configured",
      "SAP S/4HANA · Carrier master data accessible via OData v4",
      "X12 EDI · Transaction sets 204/210/214 confirmed on AS2",
      "347 carrier endpoints discovered · FMCSA cross-reference complete",
    ];
    const narrations = [
      null,
      `Now checking ${company}'s ERP — this is where carrier master data lives, so it's my source of truth for who's actually in your network.`,
      "Checking your EDI feed next. AS2 handshake in progress — this tells me how status updates actually reach you.",
      "Last one — pulling every carrier endpoint and cross-referencing each against FMCSA's live registry.",
    ];

    items.forEach((item, i) => {
      later(() => {
        if (narrations[i]) setSherlockLine(narrations[i]!);
        setPipeline(prev => prev.map((p, j) => j === i ? { ...p, status: "running" } : p));
        logAgent(item.agent, item.action);
        updateConfig({ carrier_validation: "analysing" });
        setReadiness(r => Math.min(r + 6, 42));

        later(() => {
          setPipeline(prev => prev.map((p, j) => j === i ? { ...p, status: "done", result: results[i] } : p));
          setReadiness(r => Math.min(r + 4, 48));
          if (i === items.length - 1) {
            later(() => {
              setSherlockLine("That's everything I need from your systems — here's what I found.");
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
    setSherlockLine(`Here's the integration map I found for ${c.company || "your company"}. Take a look — I want to confirm this before I generate anything downstream.`);
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
    setPipeline(items); setFraudRules(null); setDriverRoster(null);
    setSherlockLine("Now I'll cross-check every carrier in your network against FMCSA and the GSOC watchlist, then generate fraud rules tailored to what I've learned about your operation.");
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
              setSherlockLine(`I've generated 6 fraud rules for ${company}, and flagged 3 carriers already on the GSOC watchlist — those need your attention first. Approve these and I'll push them straight to config.`);
              setFraudRules(FRAUD_RULES);
              setDriverRoster(DRIVERS);
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
    setSherlockLine("Rules approved. Before anything goes live, I run 5 pre-deploy checks — this is what catches a bad config before it ever touches your carriers.");
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
            setSherlockLine("All 5 checks passed. Your config is clean — nothing left standing between here and a live deployment.");
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
    setSherlockLine("Everything's green. The moment you confirm, I'll activate GSOC monitoring and push these rules to production.");
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
              setSherlockLine(`You're live, ${ctxRef.current.company || "team"}. FraudWatch is watching your full carrier network now. I'll stay close for the first 30 days in case anything needs tuning.`);
              scrollActive();
              // Hold the Go-Live card on screen before collapsing to the
              // one-line summary — marking done immediately would hide the
              // card in the same render it appears.
              later(() => markDone(6, "FraudWatch live · 347 carriers monitored · 6 rules active"), 4000);
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
      <div className="relative flex flex-col flex-1 min-w-0 border-r border-[var(--mil-border)]">
        {/* Ambient multi-agent node graph — signals the architecture beneath the UI */}
        <NodeGraphTexture />

        {/* Header — Sherlock's presence anchors the panel rather than a chat title bar */}
        <div className="relative z-10 shrink-0 px-5 py-3 border-b border-white/10 backdrop-blur-md flex items-center gap-3" style={{ background: "rgba(17,20,22,0.55)" }}>
          <SherlockAvatar state={sherlockStateFrom(processing, justSpoke)} size={40} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Sherlock <span className="text-white/30 font-normal">· FraudWatch Implementation Specialist</span></p>
            <p className="text-[10px] text-[var(--mil-muted)] font-mono">Stage {stage}/6 · {STAGE_FOCUS[stage]}</p>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] flex items-center justify-center text-[var(--mil-muted)] hover:text-white transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Pipeline */}
        <div className="relative z-10 flex-1 overflow-y-auto px-5 py-5">
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
                      : <span className={cn("text-[8px] font-bold font-mono", isActive ? "text-[#00c2b2]" : "text-white/20")}>{s.n}</span>}
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
                      <motion.span
                        animate={{
                          boxShadow: processing
                            ? ["0 0 0px rgba(245,158,11,0)", "0 0 10px rgba(245,158,11,0.55)", "0 0 0px rgba(245,158,11,0)"]
                            : ["0 0 0px rgba(0,194,178,0)", "0 0 9px rgba(0,194,178,0.5)", "0 0 0px rgba(0,194,178,0)"],
                        }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        className={cn(
                          "flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full border backdrop-blur-sm",
                          processing
                            ? "text-amber-300 border-amber-500/40 bg-amber-500/5"
                            : "text-[#00c2b2] border-[#00c2b2]/40 bg-[#00c2b2]/5"
                        )}>
                        {processing && <Loader2 className="h-2 w-2 animate-spin" />}
                        {processing ? "Running" : "Active"}
                      </motion.span>
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

                      {/* Sherlock's conversation card — meeting notes, not a chat bubble */}
                      <div className="flex items-start gap-2.5">
                        <SherlockAvatar state={sherlockStateFrom(processing, justSpoke)} size={28} />
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[8px] uppercase tracking-widest text-[#D4AF37]/70 font-semibold">Sherlock is reviewing</span>
                            <span className="text-[8px] text-white/20">·</span>
                            <span className="text-[8px] uppercase tracking-widest text-white/30">{STAGE_FOCUS[stage]}</span>
                          </div>
                          <AnimatePresence mode="wait">
                            <motion.p
                              key={sherlockLine}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.25 }}
                              className="text-[11px] text-[var(--mil-text)] leading-relaxed"
                            >
                              {sherlockLine}
                            </motion.p>
                          </AnimatePresence>
                        </div>
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

                      {/* Stage 1 — predictive risk read, shown once Q&A completes */}
                      {s.n === 1 && predictiveInsight && (
                        <PredictiveRiskCard insight={predictiveInsight} onContinue={handleContinueFromPredictive} disabled={processing} />
                      )}

                      {/* Agent pipeline (stages 2, 4, 6) */}
                      {(s.n === 2 || s.n === 4 || s.n === 6) && pipeline.length > 0 && (
                        <PipelineView items={pipeline} />
                      )}

                      {/* Stage 3 — integration map */}
                      {s.n === 3 && showMap && <IntegrationMapCard />}

                      {/* Stage 4 — fraud rules */}
                      {s.n === 4 && fraudRules && <FraudRulesCard rules={fraudRules} />}

                      {/* Stage 4 — driver verification roster */}
                      {s.n === 4 && driverRoster && <DriverRosterCard drivers={driverRoster} />}

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
      <RightPanel config={config} agentLog={agentLog} readiness={readiness} predictiveInsight={predictiveInsight} />
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
  const company = ctx.company || prefilledCarrier || "your company";
  const qm = Q_META[stageQ];
  // When carrier is pre-filled, Q0 only needs the contact name
  const questionText = qm
    ? (stageQ === 0 && prefilledCarrier
        ? `Who am I speaking with at **${prefilledCarrier}**?`
        : qm.text.replace("{{company}}", company))
    : "";

  return (
    <div className="space-y-2">
      {/* Company confirmed banner — shown when carrier was dragged in */}
      {prefilledCarrier && (
        <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg", GLASS_TEAL)} style={{ background: "rgba(0,194,178,0.06)" }}>
          <div className="h-5 w-5 rounded-md bg-[#00c2b2]/20 flex items-center justify-center shrink-0">
            <Truck className="h-3 w-3 text-[#00c2b2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase tracking-wider text-[#00c2b2]/60 leading-none mb-0.5">Company being set up</p>
            <p className="text-[12px] text-[#00c2b2] font-semibold truncate">{prefilledCarrier}</p>
          </div>
          <CheckCircle2 className="h-4 w-4 text-[#00c2b2] shrink-0" />
        </div>
      )}

      {/* Completed answers table */}
      {completedQAs.length > 0 && (
        <div className={cn("rounded-lg divide-y divide-white/8 overflow-hidden", GLASS_NEUTRAL)} style={{ background: "rgba(24,28,31,0.45)" }}>
          {completedQAs.map((qa, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-1.5">
              <span className="text-[9px] uppercase tracking-wide text-[var(--mil-muted)] w-28 shrink-0">{qa.label}</span>
              <span className="text-[11px] text-white/75 flex-1 truncate font-mono">{qa.answer}</span>
              <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Active question — soft glow signals this is the currently-focused prompt */}
      {stageQ <= 5 && qm && (
        <motion.div
          className="rounded-lg overflow-hidden border border-[#00c2b2]/25 backdrop-blur-md"
          style={{ background: "rgba(0,194,178,0.04)" }}
          animate={{ boxShadow: ["0 0 0px rgba(0,194,178,0)", "0 0 20px -4px rgba(0,194,178,0.35)", "0 0 0px rgba(0,194,178,0)"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="px-3 py-2 border-b border-[#00c2b2]/10">
            <p className="text-[11px] font-medium text-white">
              {questionText.split("**").map((part, i) =>
                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
              )}
            </p>
          </div>
          <div className="p-2">
            {qm.freeText ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && inputValue.trim()) { onAnswer(inputValue.trim()); setInputValue(""); } }}
                  placeholder={prefilledCarrier && stageQ === 0 ? "Your name…" : "Type company name and your name…"}
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
                  <motion.button key={opt} onClick={() => onAnswer(opt)}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md bg-[var(--mil-elevated)] border border-[var(--mil-border)] text-[11px] text-[var(--mil-text)] hover:text-white hover:border-[#00c2b2]/40 hover:bg-[#00c2b2]/5 transition-colors text-left group">
                    <span className="h-3 w-3 rounded-full border border-[#00c2b2]/30 group-hover:border-[#00c2b2] shrink-0 transition-colors" />
                    {opt}
                    <ChevronRight className="h-3 w-3 text-[#00c2b2]/0 group-hover:text-[#00c2b2]/60 shrink-0 transition-colors ml-auto" />
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Pipeline View ─────────────────────────────────────────────────────────────

function PipelineView({ items }: { items: PipelineItem[] }) {
  const running = items.filter(i => i.status === "running").length;
  const done    = items.filter(i => i.status === "done").length;

  return (
    <div className={cn("rounded-lg overflow-hidden", GLASS_NEUTRAL)} style={{ background: "rgba(10,12,13,0.5)" }}>
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
    <div className={cn("rounded-lg overflow-hidden", GLASS_NEUTRAL)} style={{ background: "rgba(24,28,31,0.45)" }}>
      <div className="px-3 py-2 border-b border-[var(--mil-border)] flex items-center gap-2">
        <Network className="h-3 w-3 text-[#00c2b2]" />
        <span className="text-[10px] font-semibold text-white">Integration Map</span>
        <span className="ml-auto text-[9px] text-[var(--mil-muted)]">6 systems</span>
      </div>
      {systems.map(s => (
        <div key={s.name} className="flex items-center gap-2.5 px-3 py-1.5 border-b border-[var(--mil-border)] last:border-0">
          <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", s.dot)} />
          <span className="text-[10px] text-white/75 flex-1 font-mono">{s.name}</span>
          <span className="text-[9px] text-[var(--mil-muted)] w-20 shrink-0 font-mono">{s.type}</span>
          <span className="text-[9px] text-[#00c2b2] font-mono">{s.status}</span>
        </div>
      ))}
    </div>
  );
}

// ── Predictive Risk Card ──────────────────────────────────────────────────────

function PredictiveRiskCard({ insight, onContinue, disabled }: { insight: PredictiveInsight; onContinue: () => void; disabled: boolean }) {
  const riskColor = insight.score >= 75 ? "text-red-400" : insight.score >= 50 ? "text-amber-400" : "text-emerald-400";
  const riskRing  = insight.score >= 75 ? "#f87171" : insight.score >= 50 ? "#fbbf24" : "#34d399";

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className={cn("relative rounded-lg overflow-hidden", GLASS_VIOLET)}
      style={{ background: "rgba(139,92,246,0.05)" }}>
      {/* One-time scan sweep — "before I scan your systems" */}
      <ScanLine />

      <div className="relative z-20 px-3 py-2 border-b border-violet-500/15 flex items-center gap-2">
        <Sparkles className="h-3 w-3 text-violet-400" />
        <span className="text-[10px] font-semibold text-white">Predictive Risk Intelligence</span>
        <span className="ml-auto text-[9px] text-violet-300/70 font-mono">
          <CountUp value={insight.confidence} suffix="% confidence" />
        </span>
      </div>

      <div className="relative z-20 p-3 flex gap-3">
        {/* Score ring — draws in 0→score over 800ms, number counts up in sync */}
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
            <motion.circle
              cx="18" cy="18" r="15.5" fill="none" stroke={riskRing} strokeWidth="3" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 15.5}
              initial={{ strokeDashoffset: 2 * Math.PI * 15.5 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 15.5 * (1 - insight.score / 100) }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <CountUp value={insight.score} className={cn("text-sm font-bold font-mono", riskColor)} />
            <span className="text-[7px] text-white/30">RISK</span>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3 w-3 text-violet-400 shrink-0" />
            <p className="text-[10px] text-white/70">
              Predicted annual fraud exposure: <span className="font-bold text-white font-mono">{insight.exposure}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="h-3 w-3 text-violet-400 shrink-0" />
            <p className="text-[10px] text-white/70">
              Riskier than <span className="font-bold text-white font-mono"><CountUp value={insight.percentile} suffix="%" /></span> of similar shippers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Radar className="h-3 w-3 text-emerald-400 shrink-0" />
            <p className="text-[10px] text-white/70">
              FraudWatch projected to prevent <span className="font-bold text-emerald-300 font-mono">{insight.incidentsPreventedPerYear} incidents/yr</span> · ROI <span className="font-bold text-emerald-300 font-mono">{insight.roiEstimate}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-20 px-3 pb-2">
        <p className="text-[9px] uppercase tracking-widest text-violet-300/60 mb-1.5">Top predicted risk vectors</p>
        <div className="space-y-1.5">
          {insight.vectors.map((v, i) => (
            <div key={i} className="rounded-md bg-white/4 px-2 py-1.5">
              <p className="text-[10px] text-white/65 leading-relaxed">{v}</p>
              <SeverityBar index={i} />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-20 px-3 pb-3 pt-1">
        <button onClick={onContinue} disabled={disabled}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-500/20 border border-violet-500/40 text-violet-200 text-[11px] font-semibold hover:bg-violet-500/30 transition-colors disabled:opacity-50">
          Begin System Discovery <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Driver Roster Card ────────────────────────────────────────────────────────

const BG_CHECK_STYLES: Record<DriverProfile["backgroundCheck"], string> = {
  clear:   "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
  pending: "text-amber-300 border-amber-500/30 bg-amber-500/10",
  flagged: "text-red-300 border-red-500/30 bg-red-500/10",
};

function DriverRosterCard({ drivers }: { drivers: DriverProfile[] }) {
  const flagged = drivers.filter(d => d.gsocMatch).length;
  return (
    <div className={cn("rounded-lg overflow-hidden", GLASS_NEUTRAL)} style={{ background: "rgba(24,28,31,0.45)" }}>
      <div className="px-3 py-2 border-b border-[var(--mil-border)] flex items-center gap-2">
        <IdCard className="h-3 w-3 text-[#00c2b2]" />
        <span className="text-[10px] font-semibold text-white">Driver Verification</span>
        <span className="ml-auto text-[9px] text-[var(--mil-muted)] font-mono">sample 5 of 347 discovered</span>
      </div>

      {flagged > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/8 border-b border-red-500/15">
          <BadgeAlert className="h-3 w-3 text-red-400 shrink-0" />
          <p className="text-[9px] text-red-300">{flagged} driver{flagged > 1 ? "s" : ""} matched the GSOC watchlist — hold recommended</p>
        </div>
      )}

      {drivers.map(d => (
        <div key={d.id} className="px-3 py-2 border-b border-[var(--mil-border)] last:border-0">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "h-7 w-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0",
              d.gsocMatch ? "bg-red-500/20 text-red-300 border border-red-500/40" : "bg-[#00c2b2]/15 text-[#00c2b2] border border-[#00c2b2]/30"
            )}>
              {d.name.split(" ").map(p => p[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] font-medium text-white truncate">{d.name}</p>
                <span className={cn("text-[7px] font-bold px-1 py-0.5 rounded border uppercase shrink-0", BG_CHECK_STYLES[d.backgroundCheck])}>
                  {d.backgroundCheck}
                </span>
              </div>
              <p className="text-[9px] text-[var(--mil-muted)]"><span className="font-mono">CDL {d.cdl}</span> · <span className="font-mono">{d.yearsExperience}</span> yr{d.yearsExperience !== 1 ? "s" : ""} exp · {d.lastActive}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1" title="Safety score">
                <Gauge className={cn("h-3 w-3", d.safetyScore >= 85 ? "text-emerald-400" : d.safetyScore >= 70 ? "text-amber-400" : "text-red-400")} />
                <span className="text-[9px] font-bold text-white/70 font-mono">{d.safetyScore}</span>
              </div>
              <Fingerprint className={cn("h-3 w-3", d.biometricVerified ? "text-emerald-400" : "text-white/15")} />
              <Phone className={cn("h-3 w-3", d.phoneVerified ? "text-emerald-400" : "text-white/15")} />
            </div>
          </div>
          {d.gsocMatch && (
            <div className="mt-1.5 ml-10 flex items-start gap-1.5 rounded-md bg-red-500/8 px-2 py-1">
              <AlertTriangle className="h-2.5 w-2.5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-[9px] text-red-300 leading-relaxed">{d.gsocMatch}</p>
            </div>
          )}
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
    <div className={cn("rounded-lg overflow-hidden", GLASS_NEUTRAL)} style={{ background: "rgba(24,28,31,0.45)" }}>
      <div className="px-3 py-2 border-b border-[var(--mil-border)] flex items-center gap-2">
        <Shield className="h-3 w-3 text-[#00c2b2]" />
        <span className="text-[10px] font-semibold text-white">Generated Fraud Rules</span>
        <span className="ml-auto text-[9px] text-[var(--mil-muted)] font-mono">{rules.length} rules</span>
      </div>
      {rules.map(rule => (
        <div key={rule.id} className="flex items-start gap-2.5 px-3 py-2 border-b border-[var(--mil-border)] last:border-0">
          <span className={cn("text-[7px] font-bold px-1 py-0.5 rounded border uppercase mt-0.5 shrink-0", sev[rule.severity])}>{rule.severity}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-white/85 leading-snug">{rule.name}</p>
            <p className="text-[9px] text-[var(--mil-muted)] leading-relaxed mt-0.5">{rule.description}</p>
          </div>
          <span className="text-[9px] font-bold text-[#00c2b2] shrink-0 font-mono">{rule.confidence}%</span>
        </div>
      ))}
    </div>
  );
}

// ── Pre-Deploy Card ───────────────────────────────────────────────────────────

function PreDeployCard({ checks }: { checks: PreCheck[] }) {
  const done = checks.filter(c => c.done).length;
  return (
    <div className={cn("rounded-lg overflow-hidden", GLASS_NEUTRAL)} style={{ background: "rgba(24,28,31,0.45)" }}>
      <div className="px-3 py-2 border-b border-[var(--mil-border)] flex items-center gap-2">
        <Activity className="h-3 w-3 text-[#00c2b2]" />
        <span className="text-[10px] font-semibold text-white">Pre-Deploy Validation</span>
        <span className="ml-auto text-[9px] text-[var(--mil-muted)] font-mono">{done}/{checks.length} passed</span>
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
    <div className={cn("rounded-lg overflow-hidden", GLASS_AMBER)} style={{ background: "rgba(245,158,11,0.05)" }}>
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
      className={cn("rounded-lg overflow-hidden", GLASS_TEAL)} style={{ background: "rgba(0,194,178,0.08)" }}>
      <div className="px-4 py-4 text-center">
        <div className="h-10 w-10 rounded-full border-2 border-[#00c2b2] flex items-center justify-center mx-auto mb-2.5">
          <Check className="h-5 w-5 text-[#00c2b2]" />
        </div>
        <p className="text-sm font-bold text-white mb-0.5">FraudWatch is Live</p>
        <p className="text-[10px] text-[var(--mil-muted)] mb-3">GSOC monitoring active · All fraud rules deployed</p>
        <div className="grid grid-cols-3 gap-1.5">
          {[{ label: "Carriers", value: "347" }, { label: "Rules", value: "6" }, { label: "Status", value: "Live" }].map(item => (
            <div key={item.label} className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded px-2 py-2">
              <p className="text-sm font-bold text-[#00c2b2] font-mono">{item.value}</p>
              <p className="text-[8px] text-[var(--mil-muted)] mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Right Panel ───────────────────────────────────────────────────────────────

function RightPanel({ config, agentLog, readiness, predictiveInsight }: {
  config: ConfigCard[];
  agentLog: AgentLogEntry[];
  readiness: number;
  predictiveInsight: PredictiveInsight | null;
}) {
  return (
    <div className="w-64 shrink-0 flex flex-col overflow-hidden border-l border-white/10 backdrop-blur-md" style={{ background: "rgba(17,20,22,0.55)" }}>
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4">

        {predictiveInsight && (
          <div className={cn("rounded-lg px-3 py-2.5", GLASS_VIOLET)} style={{ background: "rgba(139,92,246,0.06)" }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3 w-3 text-violet-400" />
              <p className="text-[8px] uppercase tracking-widest text-violet-300/70">Predictive Insights</p>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-white/4 rounded px-2 py-1.5">
                <CountUp value={predictiveInsight.score} className="text-sm font-bold text-white font-mono" />
                <p className="text-[7px] text-white/40">Risk score</p>
              </div>
              <div className="bg-white/4 rounded px-2 py-1.5">
                <CountUp value={predictiveInsight.incidentsPreventedPerYear} className="text-sm font-bold text-emerald-300 font-mono" />
                <p className="text-[7px] text-white/40">Incidents/yr prevented</p>
              </div>
            </div>
            <p className="text-[9px] text-violet-200/70 mt-1.5">Est. ROI <span className="font-bold text-violet-100 font-mono">{predictiveInsight.roiEstimate}</span>/yr</p>
          </div>
        )}

        <div>
          <p className="text-[8px] uppercase tracking-widest text-[var(--mil-muted)] mb-2">Configuration Modules</p>
          <div className="space-y-1">
            {config.map(card => {
              const s = STATUS_STYLES[card.status];
              return (
                <motion.div key={card.id}
                  animate={card.status === "analysing" ? { borderColor: ["rgba(255,255,255,0.08)", "rgba(0,194,178,0.3)", "rgba(255,255,255,0.08)"] } : {}}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-white/8 backdrop-blur-sm bg-white/[0.02]">
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
          <span className="text-[9px] font-bold text-[#00c2b2] font-mono">{readiness}%</span>
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
