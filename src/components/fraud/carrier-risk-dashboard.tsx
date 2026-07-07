"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, ShieldAlert, Shield, ShieldCheck,
  ShieldX, ChevronDown, ChevronUp, MapPin, Hash, User, Phone,
  Mail, Briefcase, AlertTriangle, CheckCircle2, BarChart3,
  Truck, FileText, Activity, Plus, Bell, Bot, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FraudWatchAIOnboarding } from "./fraudwatch-ai-onboarding";

// ─── Mock data ────────────────────────────────────────────────────────────────

type CarrierStatus = "trusted" | "new" | "unauthorized" | "flagged";
type ThreatLevel = "threat" | "no-threat" | "warning";

interface CheckResult {
  id: string;
  label: string;
  description: string;
  icon: typeof MapPin;
  status: ThreatLevel;
  threatCount?: number;
  detail: string;
}

interface Carrier {
  id: string;
  name: string;
  score: number;
  status: CarrierStatus;
  tags: string[];
  usdot: string;
  mc: string;
  legalName: string;
  tradeName: string;
  trucks: number;
  trailers: number;
  drivers: number;
  securityScore: number;
  securityDelta: number;
  badActorThreats: number;
  badActorDelta: number;
  checks: CheckResult[];
}

const CARRIERS: Carrier[] = [
  {
    id: "c1",
    name: "Fast Transport Trucking",
    score: 100,
    status: "flagged",
    tags: ["Limited operational history"],
    usdot: "145458855",
    mc: "45464547",
    legalName: "Fast Transport LLC",
    tradeName: "Fast Transport",
    trucks: 21,
    trailers: 28,
    drivers: 13,
    securityScore: 93,
    securityDelta: 93,
    badActorThreats: 3,
    badActorDelta: 45,
    checks: [
      { id: "addr", label: "Address check", description: "Address matches bad actor's", icon: MapPin, status: "threat", threatCount: 1, detail: "Registered address at 4821 Commerce Blvd, Chicago matches a known shell company linked to cargo theft ring (FBI Case #2023-IL-0847)." },
      { id: "usdot", label: "USDOT matches", description: "No threats found", icon: Hash, status: "no-threat", detail: "USDOT 145458855 is registered and active with no adverse FMCSA records." },
      { id: "name", label: "Name matches", description: "No threats found", icon: User, status: "no-threat", detail: "Legal name 'Fast Transport LLC' does not match any known criminal entity databases." },
      { id: "phone", label: "Phone matches", description: "No threats found", icon: Phone, status: "no-threat", detail: "Contact phone number not associated with any flagged entities." },
      { id: "email", label: "Email matches", description: "Domain registered 12 days ago", icon: Mail, status: "threat", threatCount: 1, detail: "Contact email domain fasttransport-llc.net was registered 12 days ago — consistent with fraud actor domain spoofing patterns." },
      { id: "officer", label: "First Officer check", description: "Officer linked to prior fraud case", icon: Briefcase, status: "threat", threatCount: 1, detail: "First officer James R. Whitfield appears in NICB database linked to a 2021 cargo fraud case in the Illinois district." },
    ],
  },
  {
    id: "c2",
    name: "General Logistics",
    score: 100,
    status: "unauthorized",
    tags: ["No active FMCSA authority"],
    usdot: "302847193",
    mc: "87234910",
    legalName: "General Logistics Inc.",
    tradeName: "GenLog",
    trucks: 44,
    trailers: 51,
    drivers: 29,
    securityScore: 87,
    securityDelta: 87,
    badActorThreats: 2,
    badActorDelta: 38,
    checks: [
      { id: "addr", label: "Address check", description: "No threats found", icon: MapPin, status: "no-threat", detail: "Address verified against USPS database. No adverse matches." },
      { id: "usdot", label: "USDOT matches", description: "Authority revoked Jan 2024", icon: Hash, status: "threat", threatCount: 1, detail: "FMCSA records show authority revoked January 14, 2024 due to compliance failures. Carrier is operating without active authorization." },
      { id: "name", label: "Name matches", description: "No threats found", icon: User, status: "no-threat", detail: "No criminal entity matches found." },
      { id: "phone", label: "Phone matches", description: "No threats found", icon: Phone, status: "no-threat", detail: "Phone number clear." },
      { id: "email", label: "Email matches", description: "No threats found", icon: Mail, status: "no-threat", detail: "Email domain is established and legitimate." },
      { id: "officer", label: "First Officer check", description: "Prior authority revocation", icon: Briefcase, status: "threat", threatCount: 1, detail: "CEO Mark T. Ellison previously served as officer at Ellison Freight LLC, which had its authority revoked in 2022." },
    ],
  },
  {
    id: "c3",
    name: "Globex Transportation",
    score: 100,
    status: "flagged",
    tags: ["Possible criminal organization"],
    usdot: "401928374",
    mc: "91023847",
    legalName: "Globex Trans Corp",
    tradeName: "Globex",
    trucks: 9,
    trailers: 12,
    drivers: 7,
    securityScore: 97,
    securityDelta: 97,
    badActorThreats: 4,
    badActorDelta: 62,
    checks: [
      { id: "addr", label: "Address check", description: "Address matches criminal org", icon: MapPin, status: "threat", threatCount: 2, detail: "Address matches two entities flagged by DOJ as front companies for organized cargo theft." },
      { id: "usdot", label: "USDOT matches", description: "No threats found", icon: Hash, status: "no-threat", detail: "USDOT active and no direct FMCSA flags." },
      { id: "name", label: "Name matches", description: "Name similar to flagged entity", icon: User, status: "warning", detail: "Name 'Globex Trans Corp' is phonetically similar to 'Global Trans Corp' flagged in a 2023 NICB report." },
      { id: "phone", label: "Phone matches", description: "No threats found", icon: Phone, status: "no-threat", detail: "Phone number clear." },
      { id: "email", label: "Email matches", description: "Shared domain with flagged carrier", icon: Mail, status: "threat", threatCount: 1, detail: "Email domain shared with 'Globex Freight LLC' which is on the FMCSA watchlist." },
      { id: "officer", label: "First Officer check", description: "Officer on watchlist", icon: Briefcase, status: "threat", threatCount: 1, detail: "CFO Elena Voss appears on FBI financial crimes watchlist as of Q3 2023." },
    ],
  },
  {
    id: "c4",
    name: "Wheels Inc",
    score: 100,
    status: "unauthorized",
    tags: ["No active FMCSA authority"],
    usdot: "209384710",
    mc: "63748291",
    legalName: "Wheels Inc.",
    tradeName: "Wheels Inc",
    trucks: 17,
    trailers: 22,
    drivers: 11,
    securityScore: 72,
    securityDelta: 72,
    badActorThreats: 1,
    badActorDelta: 28,
    checks: [
      { id: "addr", label: "Address check", description: "No threats found", icon: MapPin, status: "no-threat", detail: "Address verified." },
      { id: "usdot", label: "USDOT matches", description: "Operating beyond authority scope", icon: Hash, status: "warning", detail: "Carrier authorized for intrastate only but FMCSA records show recent interstate activity." },
      { id: "name", label: "Name matches", description: "No threats found", icon: User, status: "no-threat", detail: "No criminal matches." },
      { id: "phone", label: "Phone matches", description: "No threats found", icon: Phone, status: "no-threat", detail: "Phone clear." },
      { id: "email", label: "Email matches", description: "No threats found", icon: Mail, status: "no-threat", detail: "Email domain established." },
      { id: "officer", label: "First Officer check", description: "No threats found", icon: Briefcase, status: "threat", threatCount: 1, detail: "President Tony Samuels linked to dissolved carrier 'Samuels Freight' that had two cargo theft incidents in 2020." },
    ],
  },
  {
    id: "c5",
    name: "Trust Wheels",
    score: 100,
    status: "unauthorized",
    tags: ["No active FMCSA authority"],
    usdot: "318293047",
    mc: "72839102",
    legalName: "Trust Wheels LLC",
    tradeName: "Trust Wheels",
    trucks: 33,
    trailers: 39,
    drivers: 21,
    securityScore: 81,
    securityDelta: 81,
    badActorThreats: 1,
    badActorDelta: 19,
    checks: [
      { id: "addr", label: "Address check", description: "No threats found", icon: MapPin, status: "no-threat", detail: "Address verified." },
      { id: "usdot", label: "USDOT matches", description: "Authority inactive since 2023", icon: Hash, status: "threat", threatCount: 1, detail: "FMCSA authority lapsed March 2023. No renewal on file." },
      { id: "name", label: "Name matches", description: "No threats found", icon: User, status: "no-threat", detail: "No criminal matches." },
      { id: "phone", label: "Phone matches", description: "No threats found", icon: Phone, status: "no-threat", detail: "Phone clear." },
      { id: "email", label: "Email matches", description: "No threats found", icon: Mail, status: "no-threat", detail: "Email clear." },
      { id: "officer", label: "First Officer check", description: "No threats found", icon: Briefcase, status: "no-threat", detail: "All officers clear." },
    ],
  },
  {
    id: "c6",
    name: "Kentucky Roads",
    score: 100,
    status: "new",
    tags: ["No threats identified"],
    usdot: "492837461",
    mc: "83920174",
    legalName: "Kentucky Roads Transport",
    tradeName: "KY Roads",
    trucks: 28,
    trailers: 34,
    drivers: 18,
    securityScore: 12,
    securityDelta: 12,
    badActorThreats: 0,
    badActorDelta: 0,
    checks: [
      { id: "addr", label: "Address check", description: "No threats found", icon: MapPin, status: "no-threat", detail: "Address verified." },
      { id: "usdot", label: "USDOT matches", description: "No threats found", icon: Hash, status: "no-threat", detail: "Active and compliant." },
      { id: "name", label: "Name matches", description: "No threats found", icon: User, status: "no-threat", detail: "No criminal matches." },
      { id: "phone", label: "Phone matches", description: "No threats found", icon: Phone, status: "no-threat", detail: "Phone clear." },
      { id: "email", label: "Email matches", description: "No threats found", icon: Mail, status: "no-threat", detail: "Email clear." },
      { id: "officer", label: "First Officer check", description: "No threats found", icon: Briefcase, status: "no-threat", detail: "All officers clear." },
    ],
  },
  {
    id: "c7",
    name: "Hauling & Sons",
    score: 100,
    status: "trusted",
    tags: ["No threats identified"],
    usdot: "573910284",
    mc: "94821038",
    legalName: "Hauling & Sons LLC",
    tradeName: "Hauling & Sons",
    trucks: 52,
    trailers: 61,
    drivers: 34,
    securityScore: 8,
    securityDelta: 8,
    badActorThreats: 0,
    badActorDelta: 0,
    checks: [
      { id: "addr", label: "Address check", description: "No threats found", icon: MapPin, status: "no-threat", detail: "Address verified." },
      { id: "usdot", label: "USDOT matches", description: "No threats found", icon: Hash, status: "no-threat", detail: "Active and compliant." },
      { id: "name", label: "Name matches", description: "No threats found", icon: User, status: "no-threat", detail: "No criminal matches." },
      { id: "phone", label: "Phone matches", description: "No threats found", icon: Phone, status: "no-threat", detail: "Phone clear." },
      { id: "email", label: "Email matches", description: "No threats found", icon: Mail, status: "no-threat", detail: "Email clear." },
      { id: "officer", label: "First Officer check", description: "No threats found", icon: Briefcase, status: "no-threat", detail: "All officers clear." },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

type FilterTab = "all" | "trusted" | "new" | "unauthorized";

const STATUS_CONFIG: Record<CarrierStatus, { color: string; text: string }> = {
  trusted: { color: "text-emerald-400", text: "Trusted" },
  new: { color: "text-blue-400", text: "New" },
  unauthorized: { color: "text-amber-400", text: "Unauthorized" },
  flagged: { color: "text-red-400", text: "Flagged" },
};

const THREAT_STYLES: Record<ThreatLevel, { border: string; bg: string; badge: string; icon: typeof CheckCircle2; iconColor: string }> = {
  "threat": {
    border: "border-red-500/40",
    bg: "bg-red-500/5",
    badge: "bg-red-500/15 text-red-300 border-red-500/30",
    icon: AlertTriangle,
    iconColor: "text-red-400",
  },
  "warning": {
    border: "border-amber-500/40",
    bg: "bg-amber-500/5",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    icon: AlertTriangle,
    iconColor: "text-amber-400",
  },
  "no-threat": {
    border: "border-[var(--mil-border)]",
    bg: "bg-[var(--mil-surface)]",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
  },
};

function CheckCard({ check }: { check: CheckResult }) {
  const [expanded, setExpanded] = useState(false);
  const s = THREAT_STYLES[check.status];
  const StatusIcon = s.icon;

  return (
    <div className={cn("rounded-xl border p-4 transition-all", s.border, s.bg)}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <check.icon className={cn("h-4 w-4 shrink-0", check.status === "no-threat" ? "text-[var(--mil-muted)]" : s.iconColor)} />
          <span className="text-sm font-semibold text-white">{check.label}</span>
        </div>
        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border shrink-0", s.badge)}>
          <StatusIcon className="h-2.5 w-2.5" />
          {check.status === "no-threat" ? "No threats" : check.status === "warning" ? "Warning" : `+${check.threatCount} threat`}
        </span>
      </div>
      <p className="text-xs text-[var(--mil-muted)] mb-2">{check.description}</p>
      {check.status !== "no-threat" && (
        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[10px] text-[var(--mil-muted)] hover:text-white transition-colors">
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? "Hide detail" : "View detail"}
        </button>
      )}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-xs text-white/70 leading-relaxed">{check.detail}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CarrierDetail({ carrier }: { carrier: Carrier }) {
  const threatChecks = carrier.checks.filter(c => c.status !== "no-threat");

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="shrink-0 px-6 py-5 border-b border-[var(--mil-border)]">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold">
                {carrier.score}
              </div>
              <h2 className="text-lg font-bold text-white">{carrier.name}</h2>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--mil-blue)] text-white text-xs font-medium hover:opacity-90 transition-opacity">
              <Plus className="h-3.5 w-3.5" /> New
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--mil-border)] text-[var(--mil-muted)] text-xs hover:text-white transition-colors">
              <Bell className="h-3.5 w-3.5" /> Activity Feed
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 ml-1" />
            </button>
          </div>
        </div>

        {/* Fleet info row */}
        <div className="flex items-center gap-6 text-sm mb-4">
          {[
            { label: "Trucks", value: carrier.trucks },
            { label: "Trailers", value: carrier.trailers },
            { label: "Drivers", value: carrier.drivers },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-[var(--mil-muted)]" />
              <span className="text-white font-semibold">{item.value}</span>
              <span className="text-[var(--mil-muted)] text-xs">{item.label}</span>
            </div>
          ))}
          <div className="h-4 w-px bg-[var(--mil-border)]" />
          {[
            { label: "USDOT", value: carrier.usdot },
            { label: "MC Number", value: carrier.mc },
            { label: "Legal Name", value: carrier.legalName },
            { label: "Trade Name", value: carrier.tradeName },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[9px] text-[var(--mil-muted)] uppercase tracking-wide">{item.label}</p>
              <p className="text-xs text-white font-medium">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Security section */}
      <div className="px-6 py-5 flex-1">
        <div className="flex items-center gap-3 mb-1">
          <ShieldAlert className="h-5 w-5 text-red-400" />
          <h3 className="text-base font-bold text-white">Security</h3>
          {carrier.securityScore > 0 && (
            <span className="text-sm font-semibold text-red-400">+{carrier.securityScore}</span>
          )}
        </div>
        <p className="text-xs text-[var(--mil-muted)] mb-5">
          Is the carrier who they say they are? Does their FMCSA profile match any known criminal organisations / individuals?
        </p>

        {/* Bad Actor Check */}
        <div className="rounded-xl border border-[var(--mil-border)] bg-[var(--mil-surface)] overflow-hidden mb-5">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--mil-border)]">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-[var(--mil-elevated)] flex items-center justify-center">
                <ShieldX className="h-3.5 w-3.5 text-[var(--mil-muted)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Bad Actor Check</p>
                <p className="text-[11px] text-[var(--mil-muted)]">
                  Carrier&apos;s details match known criminal organisations.
                </p>
              </div>
            </div>
            {carrier.badActorThreats > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 text-red-300 border border-red-500/30 text-xs font-semibold">
                <AlertTriangle className="h-3 w-3" />
                {carrier.badActorThreats} threat{carrier.badActorThreats !== 1 ? "s" : ""} identified
                <span className="text-red-400">+{carrier.badActorDelta}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                <CheckCircle2 className="h-3 w-3" />
                No threats
              </span>
            )}
          </div>

          <div className="p-5 grid grid-cols-3 gap-3">
            {carrier.checks.map((check) => (
              <CheckCard key={check.id} check={check} />
            ))}
          </div>

          <div className="px-5 pb-4 flex items-center gap-2 text-[11px] text-[var(--mil-muted)]">
            <BarChart3 className="h-3.5 w-3.5" />
            304 data points analyzed
          </div>
        </div>

        {/* Summary row if threats exist */}
        {threatChecks.length > 0 && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-xs font-semibold text-red-300 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5" />
              Risk Summary — {threatChecks.length} check{threatChecks.length !== 1 ? "s" : ""} flagged
            </p>
            <ul className="space-y-1">
              {threatChecks.map((c) => (
                <li key={c.id} className="text-xs text-white/70 flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full shrink-0",
                    c.status === "threat" ? "bg-red-400" : "bg-amber-400"
                  )} />
                  {c.label}: {c.description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function CarrierRiskDashboard() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Carrier>(CARRIERS[0]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [droppedCarrier, setDroppedCarrier] = useState<string | undefined>();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCarrierRef = useRef<Carrier | null>(null);

  const filtered = CARRIERS.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "all") return true;
    if (filter === "trusted") return c.status === "trusted";
    if (filter === "new") return c.status === "new";
    if (filter === "unauthorized") return c.status === "unauthorized" || c.status === "flagged";
    return true;
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* ── Left: Carrier List ── */}
      <aside className="w-72 shrink-0 border-r border-[var(--mil-border)] bg-[var(--mil-panel)] flex flex-col">
        <div className="p-4 border-b border-[var(--mil-border)]">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="h-4 w-4 text-red-400" />
            <h1 className="text-sm font-semibold text-white">Carrier Risk Dashboard</h1>
          </div>
          <button
            onClick={() => setShowOnboarding(true)}
            className="w-full flex items-center gap-2 px-3 py-2 mb-2 rounded-lg border border-[#00c2b2]/30 bg-[#00c2b2]/8 text-[#00c2b2] text-xs font-medium hover:bg-[#00c2b2]/15 transition-colors"
          >
            <Bot className="h-3.5 w-3.5 shrink-0" />
            AI Assisted Onboarding
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-[#00c2b2]/20 border border-[#00c2b2]/30 font-bold">NEW</span>
          </button>

          {/* Filter tabs */}
          <div className="flex gap-1 mb-3 bg-[var(--mil-surface)] rounded-lg p-1">
            {(["all", "trusted", "new", "unauthorized"] as FilterTab[]).map((tab) => (
              <button key={tab} onClick={() => setFilter(tab)}
                className={cn(
                  "flex-1 text-[10px] font-medium py-1 rounded-md capitalize transition-colors",
                  filter === tab
                    ? "bg-[var(--mil-elevated)] text-white"
                    : "text-[var(--mil-muted)] hover:text-white"
                )}>
                {tab === "unauthorized" ? (
                  <span className="flex items-center justify-center gap-0.5">
                    <ShieldX className="h-2.5 w-2.5" />
                    Unauth
                  </span>
                ) : tab === "trusted" ? (
                  <span className="flex items-center justify-center gap-0.5">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    Trusted
                  </span>
                ) : tab === "new" ? (
                  <span className="flex items-center justify-center gap-0.5">
                    <Activity className="h-2.5 w-2.5" />
                    New
                  </span>
                ) : "All"}
              </button>
            ))}
          </div>

          {/* Search + filter */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)]">
              <Search className="h-3.5 w-3.5 text-[var(--mil-muted)] shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search" className="flex-1 bg-transparent text-xs text-white placeholder:text-[var(--mil-muted)] outline-none" />
            </div>
            <button className="px-2.5 py-2 rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] text-[var(--mil-muted)] hover:text-white transition-colors">
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {filtered.map((carrier) => {
            const isActive = selected.id === carrier.id;
            const isDragging = draggingId === carrier.id;
            const statusCfg = STATUS_CONFIG[carrier.status];
            return (
              <div
                key={carrier.id}
                draggable
                onDragStart={(e) => {
                  dragCarrierRef.current = carrier;
                  e.dataTransfer.effectAllowed = "copy";
                  e.dataTransfer.setData("text/plain", carrier.name);
                  // delay so React re-render doesn't break the drag
                  setTimeout(() => setDraggingId(carrier.id), 0);
                }}
                onDragEnd={() => setDraggingId(null)}
                className={cn(
                  "group w-full text-left px-4 py-3 border-b border-[var(--mil-border)] transition-all cursor-grab active:cursor-grabbing select-none",
                  isActive ? "bg-[var(--mil-elevated)]" : "hover:bg-[var(--mil-surface)]",
                  isDragging && "opacity-40"
                )}
                onClick={() => setSelected(carrier)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("text-sm font-medium", isActive ? "text-white" : "text-[var(--mil-text)]")}>
                    {carrier.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      {carrier.score}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("text-[10px]", statusCfg.color)}>
                    {carrier.tags[0]}
                  </span>
                  {/* Onboard button — always visible, no drag needed */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDroppedCarrier(carrier.name);
                      setShowOnboarding(true);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-medium text-[#00c2b2] border border-[#00c2b2]/30 bg-[#00c2b2]/8 hover:bg-[#00c2b2]/20 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    Onboard <ArrowRight className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Drag hint at bottom */}
        <div className="shrink-0 px-4 py-2.5 border-t border-[var(--mil-border)] flex items-center gap-2">
          <span className="text-[9px] text-[var(--mil-muted)]">Drag a carrier → right panel to onboard</span>
        </div>
      </aside>

      {/* ── Right: Detail Panel ── */}
      {/* Drag handlers live directly on this always-mounted element — not on a
          conditionally-rendered overlay — so there's no race between
          setDraggingId's setTimeout(0) and the browser's dragover/drop events. */}
      <main
        className="flex-1 min-w-0 bg-[var(--mil-bg)] relative overflow-hidden"
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setIsDragOver(true); }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false); }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          setDraggingId(null);
          const name = e.dataTransfer.getData("text/plain") || dragCarrierRef.current?.name;
          dragCarrierRef.current = null;
          if (name) { setDroppedCarrier(name); setShowOnboarding(true); }
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div key={selected.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="h-full">
            <CarrierDetail carrier={selected} />
          </motion.div>
        </AnimatePresence>

        {/* Drop target overlay — visible while dragging */}
        <AnimatePresence>
          {isDragOver && !showOnboarding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center"
              style={{ background: "rgba(0,194,178,0.06)", border: "2px dashed rgba(0,194,178,0.4)" }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-[#00c2b2]/15 border border-[#00c2b2]/40 flex items-center justify-center">
                  <Bot className="h-7 w-7 text-[#00c2b2]" />
                </div>
                <p className="text-sm font-semibold text-[#00c2b2]">Drop to start AI onboarding</p>
                <p className="text-xs text-[#00c2b2]/60">Tony will onboard this carrier automatically</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Onboarding Panel — overlays the carrier detail.
            Keyed by the dropped carrier so dragging a NEW carrier onto an
            already-open session remounts Tony fresh instead of leaving him
            mid-conversation with the old company. */}
        <AnimatePresence>
          {showOnboarding && (
            <FraudWatchAIOnboarding
              key={droppedCarrier ?? "none"}
              onClose={() => { setShowOnboarding(false); setDroppedCarrier(undefined); }}
              prefilledCarrier={droppedCarrier}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
