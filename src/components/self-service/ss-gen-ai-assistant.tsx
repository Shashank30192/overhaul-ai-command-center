"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Send, RotateCcw, Copy, Download, ThumbsUp, ThumbsDown,
  BookOpen, Code2, Shield, FileText, HelpCircle, Zap, Star,
  AlertTriangle, Map, GraduationCap, ClipboardList, ChevronRight,
  CheckCircle2, ExternalLink, Search, Clock, Sparkles,
  Book, Scale, BarChart3, Package, ArrowRight, Check,
  TrendingUp, Database, MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Knowledge Sources ────────────────────────────────────────────────────────

const KNOWLEDGE_SOURCES = [
  { id: "product-docs",    label: "Product Docs",     count: 142, icon: BookOpen,     color: "#3b82f6" },
  { id: "user-guides",     label: "User Guides",      count: 38,  icon: Book,         color: "#10b981" },
  { id: "sops",            label: "SOPs",             count: 67,  icon: ClipboardList, color: "#f59e0b" },
  { id: "api-docs",        label: "API Docs",         count: 89,  icon: Code2,        color: "#8b5cf6" },
  { id: "help-center",     label: "Help Centre",      count: 213, icon: HelpCircle,   color: "#06b6d4" },
  { id: "training",        label: "Training",         count: 54,  icon: GraduationCap, color: "#ec4899" },
  { id: "security",        label: "Security",         count: 31,  icon: Shield,       color: "#ef4444" },
  { id: "compliance",      label: "Compliance",       count: 28,  icon: Scale,        color: "#f97316" },
  { id: "playbooks",       label: "Playbooks",        count: 45,  icon: Map,          color: "#00c2b2" },
  { id: "risk-mgmt",       label: "Risk Mgmt",        count: 73,  icon: AlertTriangle, color: "#ef4444" },
  { id: "best-practices",  label: "Best Practices",   count: 96,  icon: Star,         color: "#f59e0b" },
  { id: "release-notes",   label: "Release Notes",    count: 52,  icon: Zap,          color: "#00c2b2" },
];

const TOTAL_DOCS = KNOWLEDGE_SOURCES.reduce((a, s) => a + s.count, 0);

// ─── Types ────────────────────────────────────────────────────────────────────

interface DocSource {
  title: string;
  section: string;
  type: string;
  lastUpdated: string;
  relevance: number;
  preview: string;
  color: string;
  icon: LucideIcon;
}

interface RAGResponse {
  answer: string;
  confidence: number;
  sources: DocSource[];
  related: { title: string; section: string; icon: LucideIcon }[];
  followups: string[];
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  rag?: RAGResponse;
}

const RECENT_CONVS = [
  { label: "How does RiskGPT work?", time: "2h ago" },
  { label: "Explain EDI 214 transaction", time: "Yesterday" },
  { label: "SAP S/4HANA integration guide", time: "2d ago" },
  { label: "Cold chain SLA requirements", time: "3d ago" },
  { label: "Generate weekly risk report", time: "4d ago" },
];

// ─── Mock RAG Engine ──────────────────────────────────────────────────────────

function getRagResponse(q: string): RAGResponse {
  const lower = q.toLowerCase();

  if (/geofence|geo.fence|geofencing/.test(lower)) {
    return {
      confidence: 97,
      answer: `## What is a Geofence?\n\nA **geofence** is a virtual geographic boundary defined around a real-world area. In the Overhaul platform, geofences are used to monitor shipment activity and trigger automated alerts when cargo enters or exits a defined zone.\n\n### How Overhaul Uses Geofences\n\n- **Pickup/Delivery Zones** — Confirm carrier arrival and departure at origin/destination\n- **Restricted Area Alerts** — Flag cargo entering high-risk or unauthorized regions\n- **Route Compliance** — Detect route deviation when a vehicle exits the planned corridor\n- **Stop Detection** — Identify unauthorized stops outside of approved rest areas\n\n### Setting Up a Geofence\n\n1. Navigate to **Shipment Configuration → Geofences**\n2. Select the shipment or lane\n3. Draw a polygon or use a radius around a point of interest\n4. Set trigger conditions (entry, exit, or dwell time)\n5. Configure notification recipients and Slack channels\n\n**Tip:** Overhaul pre-loads geofences for known carriers, depots, and border crossings automatically.`,
      sources: [
        { title: "Geofence Configuration Guide", section: "Platform Setup › Monitoring", type: "user-guides", lastUpdated: "Mar 2026", relevance: 98, preview: "Step-by-step instructions for creating, editing, and managing geofence zones for shipment monitoring.", color: "#10b981", icon: Book },
        { title: "Route Deviation — Alert Reference", section: "Risk Management › Alerts", type: "risk-mgmt", lastUpdated: "Feb 2026", relevance: 94, preview: "Explains how route deviation alerts are triggered when cargo exits defined geofence corridors.", color: "#ef4444", icon: AlertTriangle },
        { title: "Geofence API Reference", section: "API Docs › Zones", type: "api-docs", lastUpdated: "Jan 2026", relevance: 89, preview: "REST endpoints for programmatic geofence creation and management: POST /zones, GET /zones/{id}, DELETE /zones/{id}.", color: "#8b5cf6", icon: Code2 },
      ],
      related: [
        { title: "Route Compliance Monitoring", section: "Playbooks", icon: Map },
        { title: "Configuring Shipment Alerts", section: "User Guides", icon: Book },
        { title: "Stop Event Detection", section: "Risk Mgmt", icon: AlertTriangle },
      ],
      followups: [
        "How do I set up a geofence for an international route?",
        "What triggers a route deviation alert?",
        "Can I apply geofences to multiple shipments at once?",
      ],
    };
  }

  if (/edi.?214|x12.?214|shipment status/.test(lower)) {
    return {
      confidence: 99,
      answer: `## EDI 214 — Transportation Carrier Shipment Status Message\n\nThe **EDI X12 214** is a standardized electronic data interchange transaction used by transportation carriers to communicate shipment status updates to shippers and logistics providers.\n\n### What EDI 214 Contains\n\n- **Shipment Reference Numbers** — Pro, BOL, PO numbers\n- **Status Codes** — Pickup (AG), In-Transit (I), Delivered (D), Exception (X4)\n- **Location Data** — GPS coordinates or city/state of last status\n- **Timestamp** — Date and time of the reported status event\n- **Exception Reasons** — Delay codes, damage codes, delivery failure reasons\n\n### Common Status Codes\n\n| Code | Meaning |\n|---|---|\n| AG | Shipment picked up from shipper |\n| I | In transit |\n| X1 | Attempted delivery |\n| X4 | Delay — weather |\n| D | Delivered |\n\n### How Overhaul Processes EDI 214\n\nThe **EDI Agent** in the AI Ecosystem Studio receives and parses all inbound 214 transactions from carrier partners via the EDI Gateway (AS2). Status updates automatically sync to the Unified Shipment Digital Twin and trigger ETA recalculations.`,
      sources: [
        { title: "EDI Transaction Reference Guide", section: "EDI Gateway › X12 Transactions", type: "api-docs", lastUpdated: "Apr 2026", relevance: 99, preview: "Complete reference for all EDI X12 transaction sets supported by the Overhaul EDI Gateway including 204, 210, 214, 856, 997.", color: "#8b5cf6", icon: Code2 },
        { title: "Carrier EDI Onboarding SOP", section: "SOPs › Carrier Setup", type: "sops", lastUpdated: "Mar 2026", relevance: 93, preview: "Standard operating procedure for onboarding new carrier partners to the Overhaul EDI Gateway via AS2 or SFTP.", color: "#f59e0b", icon: ClipboardList },
        { title: "EDI 214 Status Code Dictionary", section: "Help Centre › EDI", type: "help-center", lastUpdated: "Feb 2026", relevance: 91, preview: "Full list of ANSI X12 214 status codes, reason codes, and exception codes used in carrier status messages.", color: "#06b6d4", icon: HelpCircle },
      ],
      related: [
        { title: "EDI 856 ASN Overview", section: "API Docs", icon: Code2 },
        { title: "Carrier Integration Guide", section: "SOPs", icon: ClipboardList },
        { title: "EDI Gateway Architecture", section: "Product Docs", icon: BookOpen },
      ],
      followups: [
        "What is the difference between EDI 204 and EDI 214?",
        "How do I onboard a new carrier to the EDI Gateway?",
        "What happens when an EDI 214 contains an X4 exception code?",
      ],
    };
  }

  if (/riskgpt|risk.?gpt|risk ai|riskengine/.test(lower)) {
    return {
      confidence: 96,
      answer: `## How RiskGPT Works\n\n**RiskGPT** is Overhaul's proprietary large language model fine-tuned on 10+ years of global supply chain risk data. It powers real-time risk scoring, predictive threat detection, and natural language risk analysis across the platform.\n\n### Core Capabilities\n\n- **Predictive Risk Scoring** — Calculates a 0–100 risk score for every active shipment using 200+ signals\n- **Threat Classification** — Identifies theft, fraud, route deviation, equipment failure, and regulatory risk\n- **Natural Language Explanations** — Converts raw risk signals into plain-English reasoning (e.g., *"High weekend transit risk due to driver history and cargo value"*)\n- **Carrier Behaviour Profiling** — Scores carrier risk based on historical incident data, HOS violations, and insurance claims\n- **Real-Time Anomaly Detection** — Continuously monitors telemetry streams for behavioural anomalies\n\n### Risk Score Breakdown\n\n| Score | Risk Level | Recommended Action |\n|---|---|---|\n| 0–30 | Low | Monitor normally |\n| 31–60 | Medium | Increase check-in frequency |\n| 61–80 | High | Notify operations + carrier |\n| 81–100 | Critical | Escalate to GSOC immediately |\n\n### Data Inputs\n\nRiskGPT ingests GPS telemetry, IoT sensor streams, EDI transactions, carrier compliance records, weather data, crime indices, historical incident databases, and news feeds — updated every 30 seconds.`,
      sources: [
        { title: "RiskGPT Technical Architecture", section: "Product Docs › AI Engine", type: "product-docs", lastUpdated: "May 2026", relevance: 99, preview: "Deep-dive into RiskGPT's model architecture, training data, inference pipeline and real-time scoring system.", color: "#3b82f6", icon: BookOpen },
        { title: "Risk Score Interpretation Guide", section: "User Guides › Risk Monitor", type: "user-guides", lastUpdated: "Apr 2026", relevance: 96, preview: "How to read and act on Overhaul risk scores. Includes threshold recommendations by cargo category and SLA tier.", color: "#10b981", icon: Book },
        { title: "Carrier Risk Profiling — Best Practices", section: "Best Practices › Carrier Selection", type: "best-practices", lastUpdated: "Mar 2026", relevance: 88, preview: "How to use RiskGPT carrier scores to optimise carrier selection and reduce incident rates.", color: "#f59e0b", icon: Star },
      ],
      related: [
        { title: "Configuring Risk Thresholds", section: "User Guides", icon: Book },
        { title: "GSOC Escalation Playbook", section: "Playbooks", icon: Map },
        { title: "Risk Monitor Dashboard Guide", section: "Product Docs", icon: BookOpen },
      ],
      followups: [
        "What signals contribute most to a high risk score?",
        "How do I adjust risk score thresholds for my account?",
        "How does RiskGPT handle cold chain shipments differently?",
      ],
    };
  }

  if (/shipment.?watch|watch.?list|configure.*watch/.test(lower)) {
    return {
      confidence: 95,
      answer: `## Configuring a Shipment Watch\n\nA **Shipment Watch** is a real-time monitoring profile that lets you define custom alert rules, notification channels, and escalation workflows for specific shipments or lanes.\n\n### Steps to Configure\n\n1. Open **Inventory Federation → Shipments** and select a shipment\n2. Click **Configure Watch** in the shipment details panel\n3. Choose a **Watch Template** or build a custom profile:\n   - *Standard* — Location + ETA alerts\n   - *High Value* — Adds tamper, door, and temperature monitoring\n   - *Pharmaceutical* — Full cold chain + compliance logging\n   - *Critical* — All sensors + 15-min check-in intervals + GSOC escalation\n4. Set **notification recipients** (email, Slack, SMS)\n5. Define **escalation rules** — who gets notified and when\n6. Click **Activate Watch**\n\n### Available Triggers\n\n- Route deviation > X km\n- Unauthorized stop > Y minutes\n- Temperature excursion\n- Door open event\n- Driver non-response to check-in\n- Battery below threshold\n- ETA slip > Z hours\n\n**Watch profiles can be applied to entire lanes** — any future shipment on that lane inherits the watch configuration automatically.`,
      sources: [
        { title: "Shipment Watch Configuration", section: "User Guides › Monitoring", type: "user-guides", lastUpdated: "Apr 2026", relevance: 98, preview: "Complete guide to setting up, editing, and managing shipment watch profiles including templates, triggers, and notification routing.", color: "#10b981", icon: Book },
        { title: "Alert Configuration Reference", section: "Product Docs › Alerts", type: "product-docs", lastUpdated: "Mar 2026", relevance: 92, preview: "Full reference for all configurable alert triggers available in Overhaul, with threshold ranges and recommended settings by cargo type.", color: "#3b82f6", icon: BookOpen },
        { title: "Notification Routing SOP", section: "SOPs › Alerts & Escalation", type: "sops", lastUpdated: "Feb 2026", relevance: 87, preview: "Standard operating procedure for routing shipment alerts to the right team via email, Slack, SMS, or webhook.", color: "#f59e0b", icon: ClipboardList },
      ],
      related: [
        { title: "Watch Templates by Cargo Type", section: "Best Practices", icon: Star },
        { title: "Escalation Workflow Setup", section: "SOPs", icon: ClipboardList },
        { title: "Configuring Slack Notifications", section: "User Guides", icon: Book },
      ],
      followups: [
        "Can I apply a watch to multiple shipments at once?",
        "What is the difference between a watch and an alert rule?",
        "How do I set up a GSOC escalation for critical shipments?",
      ],
    };
  }

  if (/sap|erp.*integrat|integrat.*sap/.test(lower)) {
    return {
      confidence: 93,
      answer: `## SAP S/4HANA Integration\n\nOverhaul integrates natively with **SAP S/4HANA** via REST API and certified SAP Middleware connectors. The integration syncs order data, inventory, shipment records, and SLA contracts in real-time.\n\n### Integration Methods\n\n**Option A — REST API (Recommended)**\n- Overhaul pulls data via authenticated API calls to SAP OData services\n- Supports SAP S/4HANA Cloud and On-Premise (EHP8+)\n- Auth: OAuth2 with client credentials flow\n- Latency: ~150ms average\n\n**Option B — SAP Integration Suite / BTP**\n- Deploy the Overhaul connector via SAP Business Technology Platform\n- Pre-built iFlow templates available in the Overhaul Partner Hub\n\n**Option C — EDI**\n- For legacy SAP R/3 environments\n- Send order confirmations, ASNs, and invoices via EDI X12 or EDIFACT\n\n### Data Synced\n\n- Sales Orders & Purchase Orders\n- SLA contract terms and delivery windows\n- Inventory levels by SKU/bin\n- Customer master data\n- Invoice and payment status\n\n### Setup Time\n\nTypical SAP integration completes in **2–5 business days** for cloud deployments and 1–2 weeks for on-premise with IT coordination.`,
      sources: [
        { title: "SAP S/4HANA Integration Guide", section: "Product Docs › Integrations", type: "product-docs", lastUpdated: "May 2026", relevance: 97, preview: "Full technical guide for connecting Overhaul to SAP S/4HANA Cloud and on-premise deployments via REST API and SAP BTP.", color: "#3b82f6", icon: BookOpen },
        { title: "ERP Integration API Reference", section: "API Docs › Integrations", type: "api-docs", lastUpdated: "Apr 2026", relevance: 94, preview: "API endpoints for configuring ERP connections, testing connectivity, and managing data sync schedules.", color: "#8b5cf6", icon: Code2 },
        { title: "Enterprise Integration SOP", section: "SOPs › Onboarding", type: "sops", lastUpdated: "Mar 2026", relevance: 88, preview: "Step-by-step SOP for implementation teams configuring enterprise ERP integrations, including security requirements and sign-off procedures.", color: "#f59e0b", icon: ClipboardList },
      ],
      related: [
        { title: "Oracle TMS Integration Guide", section: "Product Docs", icon: BookOpen },
        { title: "API Authentication Methods", section: "API Docs", icon: Code2 },
        { title: "Manhattan WMS Connector", section: "Product Docs", icon: BookOpen },
      ],
      followups: [
        "What SAP versions does Overhaul support?",
        "How do I test the SAP connection before going live?",
        "What data does Overhaul pull from SAP automatically?",
      ],
    };
  }

  if (/eta.*sla|sla.*eta|difference.*eta|eta vs sla/.test(lower)) {
    return {
      confidence: 98,
      answer: `## ETA vs SLA — Key Differences\n\n**ETA (Estimated Time of Arrival)** and **SLA (Service Level Agreement)** are both time-based metrics in logistics, but they measure different things:\n\n### ETA — Estimated Time of Arrival\n\n- A **dynamic, real-time prediction** of when a shipment will arrive at its destination\n- Calculated continuously using GPS position, traffic, weather, and historical carrier performance\n- Updates every 30 seconds in Overhaul\n- **Can be revised** as conditions change (driver delay, route change, weather events)\n- Format: *"ETA: Jan 16, 22:00 CST (+4h from original)"*\n\n### SLA — Service Level Agreement\n\n- A **contractual commitment** — the latest acceptable delivery time agreed with the customer\n- Fixed at order creation, based on the commercial agreement\n- **Cannot change** without customer consent and contract amendment\n- Breach of SLA triggers financial penalties and customer notifications\n- Format: *"SLA Deadline: Jan 16, 06:00 CST"*\n\n### The Critical Relationship\n\nWhen **ETA > SLA deadline**, Overhaul raises a **SLA Breach Risk** alert. RiskGPT calculates the probability of breach in real time and suggests corrective actions (route change, dock reassignment, priority carrier switch) to close the gap before the deadline.`,
      sources: [
        { title: "SLA Management — Overhaul Platform", section: "Product Docs › SLAs", type: "product-docs", lastUpdated: "Apr 2026", relevance: 99, preview: "Explains how SLA contracts are configured, monitored, and enforced across shipment types and customer tiers.", color: "#3b82f6", icon: BookOpen },
        { title: "ETA Calculation Engine", section: "Product Docs › Predictions", type: "product-docs", lastUpdated: "Mar 2026", relevance: 96, preview: "Technical overview of Overhaul's ETA prediction engine, data inputs, confidence intervals, and refresh cadence.", color: "#3b82f6", icon: BookOpen },
        { title: "SLA Breach Response Playbook", section: "Playbooks › SLA Management", type: "playbooks", lastUpdated: "Feb 2026", relevance: 91, preview: "Step-by-step playbook for responding to SLA breach risk alerts, including escalation paths and customer notification templates.", color: "#00c2b2", icon: Map },
      ],
      related: [
        { title: "Configuring SLA Thresholds", section: "User Guides", icon: Book },
        { title: "SLA Breach Escalation SOP", section: "SOPs", icon: ClipboardList },
        { title: "Customer Notification Templates", section: "Best Practices", icon: Star },
      ],
      followups: [
        "How does Overhaul calculate ETA for international shipments?",
        "What happens when an SLA breach is confirmed?",
        "Can I set different SLA tiers for different customer types?",
      ],
    };
  }

  if (/risk.?report|weekly.*report|generate.*report|report.*generat/.test(lower)) {
    return {
      confidence: 91,
      answer: `## Generating Risk Reports\n\nOverhaul supports automated and on-demand risk report generation across multiple formats and scopes.\n\n### Report Types Available\n\n- **Daily Risk Summary** — Top threats, incidents, and resolved alerts from the last 24h\n- **Weekly Executive Report** — KPIs, SLA performance, incident trends, carrier scorecards\n- **Lane Risk Analysis** — Risk profile for a specific origin-destination lane over a date range\n- **Carrier Performance Report** — Incident rates, response times, SLA adherence by carrier\n- **Cargo Loss & Recovery Report** — Theft incidents, recovery rates, financial exposure\n- **Compliance Audit Report** — Cold chain excursions, documentation gaps, regulatory violations\n\n### How to Generate\n\n1. Go to **Inventory Federation → Analytics → Reports**\n2. Select report type and date range\n3. Apply filters (lane, carrier, cargo category, customer)\n4. Click **Generate Report**\n5. Export as **PDF**, **Excel**, or **PowerPoint**\n\n### Scheduled Reports\n\nSet automated delivery to email or Slack channels:\n- Weekly reports every Monday at 07:00\n- Daily summaries at 08:00 for GSOC teams\n- Real-time incident reports triggered by critical alerts\n\n**Pro Tip:** Use the **AI Ecosystem Studio → BI Connector** to push report data directly to Power BI or Tableau dashboards.`,
      sources: [
        { title: "Report Generation Guide", section: "User Guides › Analytics", type: "user-guides", lastUpdated: "Apr 2026", relevance: 96, preview: "Step-by-step guide for generating, scheduling, and distributing risk and operational reports from Overhaul Inventory Federation.", color: "#10b981", icon: Book },
        { title: "Analytics & Reporting API", section: "API Docs › Reports", type: "api-docs", lastUpdated: "Mar 2026", relevance: 90, preview: "API endpoints for programmatic report generation, data export, and dashboard data feeds.", color: "#8b5cf6", icon: Code2 },
        { title: "Executive Reporting Best Practices", section: "Best Practices › Reporting", type: "best-practices", lastUpdated: "Feb 2026", relevance: 85, preview: "Guidance on structuring weekly executive reports, selecting the right KPIs, and presenting risk data to leadership.", color: "#f59e0b", icon: Star },
      ],
      related: [
        { title: "Power BI / Tableau Integration", section: "Product Docs", icon: BookOpen },
        { title: "KPI Configuration Guide", section: "User Guides", icon: Book },
        { title: "Carrier Scorecard Setup", section: "Best Practices", icon: Star },
      ],
      followups: [
        "How do I schedule a weekly report to my email?",
        "Can I customise which KPIs appear in the executive report?",
        "How do I connect report data to Power BI?",
      ],
    };
  }

  // Default intelligent fallback
  return {
    confidence: 82,
    answer: `## Overhaul Platform — Knowledge Assistant\n\nI've searched the enterprise knowledge base for **"${q}"**.\n\nBased on the available documentation, here is what I found:\n\nThe Overhaul platform provides end-to-end supply chain visibility through a combination of **real-time telemetry**, **AI-powered risk intelligence**, and **autonomous agent workflows**. The platform integrates with major enterprise systems including SAP S/4HANA, Oracle TMS, Manhattan WMS, and carrier networks via EDI.\n\n### Key Capabilities Relevant to Your Query\n\n- **AI Risk Scoring** — RiskGPT scores every shipment in real time using 200+ signals\n- **Autonomous Agents** — AI agents across ERP, WMS, TMS, and EDI systems take coordinated action\n- **Cross-System Intelligence** — Unified shipment digital twin aggregates data from all connected systems\n- **GSOC Support** — 24/7 Global Security Operations Centre with real-time incident response\n\n### Suggested Next Steps\n\n1. Try a more specific query — e.g., *"How does [feature] work?"*\n2. Browse the knowledge sources in the left panel\n3. Use the suggested prompts below to explore related topics\n\nFor complex operational questions, the **Resolution Agent** (Mode 3) can investigate your specific shipments and take action on your behalf.`,
    sources: [
      { title: "Overhaul Platform Overview", section: "Product Docs › Getting Started", type: "product-docs", lastUpdated: "May 2026", relevance: 78, preview: "High-level overview of the Overhaul AI supply chain intelligence platform, core capabilities, and integration architecture.", color: "#3b82f6", icon: BookOpen },
      { title: "Quick Start Guide", section: "User Guides › Onboarding", type: "user-guides", lastUpdated: "Apr 2026", relevance: 72, preview: "Step-by-step onboarding guide for new Overhaul users including account setup, first shipment watch, and alert configuration.", color: "#10b981", icon: Book },
    ],
    related: [
      { title: "Platform Architecture Overview", section: "Product Docs", icon: BookOpen },
      { title: "Getting Started Checklist", section: "User Guides", icon: Book },
      { title: "Help Centre Home", section: "Help Centre", icon: HelpCircle },
    ],
    followups: [
      "How does the AI Ecosystem Studio work?",
      "What integrations does Overhaul support?",
      "How do I get started with Inventory Federation?",
    ],
  };
}

// ─── Suggested Prompts ────────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  { icon: "🗺️", text: "What is a geofence?", tag: "Concepts" },
  { icon: "⚠️", text: "How does RiskGPT work?", tag: "AI" },
  { icon: "📋", text: "What is EDI 214?", tag: "EDI" },
  { icon: "🔗", text: "How do I integrate SAP?", tag: "Integration" },
  { icon: "⏱️", text: "Explain the difference between ETA and SLA", tag: "Concepts" },
  { icon: "👁️", text: "How do I configure a shipment watch?", tag: "How-to" },
  { icon: "📊", text: "Generate a weekly risk report", tag: "Reports" },
  { icon: "🔒", text: "Explain compliance requirements for cold chain", tag: "Compliance" },
];

// ─── Inline markdown renderer ─────────────────────────────────────────────────

function renderInline(text: string) {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((p, j) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={j} className="text-white font-semibold">{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`")) return <code key={j} className="font-mono text-[11px] bg-white/8 text-[#00c2b2] px-1.5 py-0.5 rounded">{p.slice(1, -1)}</code>;
    return <span key={j}>{p}</span>;
  });
}

function renderMd(text: string) {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-1.5" />;
    if (line.startsWith("## ")) return <h2 key={i} className="text-sm font-bold text-white mt-3 mb-1.5 flex items-center gap-2"><span className="h-0.5 w-3 bg-[#00c2b2] shrink-0 rounded" />{line.slice(3)}</h2>;
    if (line.startsWith("### ")) return <h3 key={i} className="text-[11px] font-semibold text-white/70 mt-2 mb-1 uppercase tracking-widest">{line.slice(4)}</h3>;
    if (line.startsWith("- ") || line.startsWith("• ")) return (
      <div key={i} className="flex items-start gap-2 ml-1 mb-0.5">
        <span className="text-[#00c2b2] mt-1.5 shrink-0 text-[8px]">▸</span>
        <span className="text-[13px] text-white/75 leading-relaxed">{renderInline(line.slice(2))}</span>
      </div>
    );
    if (line.startsWith("|") && line.includes("|")) {
      const cells = line.split("|").filter(Boolean).map(c => c.trim());
      if (cells.every(c => /^[-:]+$/.test(c))) return null;
      const isHeader = i > 0 && text.split("\n")[i - 1]?.startsWith("|");
      return (
        <div key={i} className={cn("grid gap-px mb-px", !isHeader && "bg-white/3 rounded")} style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
          {cells.map((cell, j) => (
            <span key={j} className={cn("text-[11px] px-2 py-1", j === 0 ? "text-white/80 font-medium" : "text-white/50")}>{renderInline(cell)}</span>
          ))}
        </div>
      );
    }
    const numMatch = line.match(/^(\d+)\. (.+)/);
    if (numMatch) return (
      <div key={i} className="flex items-start gap-2 ml-1 mb-0.5">
        <span className="text-[#00c2b2] font-bold shrink-0 text-xs mt-0.5">{numMatch[1]}.</span>
        <span className="text-[13px] text-white/75 leading-relaxed">{renderInline(numMatch[2])}</span>
      </div>
    );
    return <p key={i} className="text-[13px] text-white/75 mb-1 leading-relaxed">{renderInline(line)}</p>;
  });
}

// ─── Confidence Badge ─────────────────────────────────────────────────────────

function ConfidenceBadge({ score }: { score: number }) {
  const color = score >= 90 ? "#10b981" : score >= 75 ? "#f59e0b" : "#ef4444";
  const label = score >= 90 ? "High Confidence" : score >= 75 ? "Medium Confidence" : "Low Confidence";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-widest text-white/30">Confidence</span>
        <span className="text-[10px] font-bold" style={{ color }}>{score}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ background: color }} />
      </div>
      <p className="text-[9px]" style={{ color: color + "99" }}>{label}</p>
    </div>
  );
}

// ─── Source Card ──────────────────────────────────────────────────────────────

function SourceCard({ source, index }: { source: DocSource; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
      className="rounded-lg border border-white/6 overflow-hidden cursor-pointer hover:border-white/12 transition-colors"
      style={{ background: '#0d0f10' }} onClick={() => setExpanded(e => !e)}>
      <div className="flex items-start gap-2.5 p-2.5">
        <div className="h-6 w-6 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ background: source.color + '20' }}>
          <source.icon className="h-3 w-3" style={{ color: source.color }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <p className="text-[10px] font-semibold text-white/80 leading-snug">{source.title}</p>
            <div className="shrink-0 flex items-center gap-1 ml-1">
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: source.color + '20', color: source.color }}>
                {source.relevance}%
              </span>
            </div>
          </div>
          <p className="text-[8px] text-white/30 mt-0.5">{source.section} · {source.lastUpdated}</p>
          {expanded && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-white/45 mt-1.5 leading-relaxed">{source.preview}</motion.p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 px-2.5 pb-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <span className="text-[8px] text-white/20 flex-1">{expanded ? "Hide preview" : "Show preview"}</span>
        <button className="flex items-center gap-1 text-[8px] text-[#00c2b2]/70 hover:text-[#00c2b2]">
          <ExternalLink className="h-2.5 w-2.5" /> Open
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SSGenAIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({});
  const [searchQuery, setSearchQuery] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const lastRag = messages.filter(m => m.role === "assistant" && m.rag).slice(-1)[0]?.rag;
  const lastAnswer = messages.filter(m => m.role === "assistant").slice(-1)[0];

  const scrollBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
  }, []);

  const send = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;
    setInput("");
    const userId = `u-${Date.now()}`;
    setMessages(prev => [...prev, { id: userId, role: "user", content: trimmed }]);
    setIsTyping(true);
    scrollBottom();

    const delay = 900 + Math.random() * 600;
    setTimeout(() => {
      const rag = getRagResponse(trimmed);
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: rag.answer, rag }]);
      setIsTyping(false);
      scrollBottom();
    }, delay);
  }, [isTyping, scrollBottom]);

  const reset = useCallback(() => {
    setMessages([]);
    setInput("");
    setCopied(false);
    setFeedback({});
  }, []);

  const copyAnswer = () => {
    if (lastAnswer) {
      navigator.clipboard.writeText(lastAnswer.content.replace(/##\s+|###\s+|\*\*/g, "")).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredSources = KNOWLEDGE_SOURCES.filter(s =>
    !searchQuery || s.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left Sidebar ── */}
      <div className="w-48 shrink-0 border-r border-white/5 flex flex-col overflow-hidden" style={{ background: '#0a0c0d' }}>
        {/* Header */}
        <div className="px-3 py-3 border-b border-white/5">
          <p className="text-[9px] uppercase tracking-widest text-white/25 font-semibold">Knowledge Base</p>
          <p className="text-[10px] text-white/40 mt-0.5">{TOTAL_DOCS.toLocaleString()} indexed docs</p>
        </div>

        {/* Search */}
        <div className="px-2.5 py-2 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-white/20" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter sources..."
              className="w-full pl-7 pr-2 py-1.5 text-[10px] rounded bg-white/4 border border-white/6 text-white/60 placeholder-white/20 outline-none" />
          </div>
        </div>

        {/* Sources */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {filteredSources.map(s => (
            <button key={s.id} onClick={() => setActiveSource(activeSource === s.id ? null : s.id)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5 text-left transition-all",
                activeSource === s.id ? "bg-white/8 border border-white/8" : "hover:bg-white/4 border border-transparent"
              )}>
              <s.icon className="h-3 w-3 shrink-0" style={{ color: s.color }} />
              <span className="flex-1 text-[10px] text-white/50 truncate">{s.label}</span>
              <span className="text-[8px] text-white/20 shrink-0">{s.count}</span>
            </button>
          ))}
        </div>

        {/* Recent */}
        <div className="border-t border-white/5 px-2 py-2">
          <p className="text-[9px] uppercase tracking-widest text-white/20 px-1 mb-1.5">Recent</p>
          <div className="space-y-0.5">
            {RECENT_CONVS.map((c, i) => (
              <button key={i} onClick={() => send(c.label)}
                className="w-full flex items-start gap-1.5 px-1.5 py-1 rounded hover:bg-white/4 text-left transition-colors">
                <MessageSquare className="h-2.5 w-2.5 text-white/20 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] text-white/35 truncate leading-tight">{c.label}</p>
                  <p className="text-[8px] text-white/15">{c.time}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Chat ── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Topbar */}
        <div className="shrink-0 px-4 py-2.5 border-b border-white/5 flex items-center gap-3" style={{ background: '#0d0f10' }}>
          <div className="h-6 w-6 rounded-md bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
            <Brain className="h-3 w-3 text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white">Enterprise Knowledge Assistant</p>
            <p className="text-[9px] text-white/30">RAG · {TOTAL_DOCS.toLocaleString()} documents indexed · Overhaul AI</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] text-emerald-400 font-medium">Live RAG</span>
            </div>
            <button onClick={reset} className="h-6 w-6 rounded flex items-center justify-center text-white/25 hover:text-white hover:bg-white/5 transition-colors">
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isEmpty ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center px-6">
              <div className="h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                <Sparkles className="h-7 w-7 text-blue-400" />
              </div>
              <h2 className="text-base font-semibold text-white mb-1.5">Enterprise Knowledge Assistant</h2>
              <p className="text-sm text-white/40 leading-relaxed mb-6 max-w-md">
                Ask anything about the Overhaul platform, supply chain operations, API integrations, or logistics concepts. I search {TOTAL_DOCS.toLocaleString()} indexed documents to give you accurate, cited answers.
              </p>
              {/* Suggested prompts grid */}
              <div className="grid grid-cols-2 gap-2 w-full max-w-xl">
                {SUGGESTED_PROMPTS.map(p => (
                  <button key={p.text} onClick={() => send(p.text)}
                    className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-white/3 border border-white/6 hover:bg-white/6 hover:border-blue-500/25 text-left transition-all group">
                    <span className="text-base shrink-0">{p.icon}</span>
                    <div className="min-w-0">
                      <span className="text-[10px] text-white/60 group-hover:text-white/80 transition-colors leading-snug block">{p.text}</span>
                      <span className="text-[8px] text-white/25 mt-0.5 block">{p.tag}</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-white/15 group-hover:text-blue-400 shrink-0 mt-0.5 ml-auto transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-5">
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>

                    {msg.role === "assistant" && (
                      <div className="h-7 w-7 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0 mt-0.5">
                        <Brain className="h-3.5 w-3.5 text-blue-400" />
                      </div>
                    )}

                    <div className={cn(
                      "rounded-2xl px-4 py-3",
                      msg.role === "user"
                        ? "bg-[#1a2a3a] border border-blue-500/20 text-white max-w-md rounded-tr-sm text-sm"
                        : "bg-[var(--mil-surface)] border border-white/6 text-[var(--mil-text)] flex-1 rounded-tl-sm"
                    )}>
                      {msg.role === "user"
                        ? msg.content
                        : <div className="space-y-0.5">{renderMd(msg.content)}</div>
                      }

                      {/* Inline citations */}
                      {msg.rag && (
                        <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap gap-1.5">
                          {msg.rag.sources.map((src, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full border border-white/8 text-white/35 hover:text-white/60 cursor-pointer transition-colors"
                              style={{ background: src.color + '10' }}>
                              <span className="font-bold" style={{ color: src.color }}>[{i + 1}]</span>
                              {src.title.split(" ").slice(0, 4).join(" ")}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="h-7 w-7 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0">
                    <Brain className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                  <div className="bg-[var(--mil-surface)] border border-white/6 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                    <Search className="h-3 w-3 text-blue-400/60 animate-pulse" />
                    <span className="text-[11px] text-white/30">Searching knowledge base…</span>
                    {[0, 0.2, 0.4].map((d, i) => (
                      <motion.span key={i} className="h-1.5 w-1.5 bg-blue-400 rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, delay: d, repeat: Infinity }} />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 px-5 pb-4 pt-3 border-t border-white/5" style={{ background: '#0d0f10' }}>
          {/* Follow-up chips — show from last response */}
          {lastRag && !isTyping && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {lastRag.followups.map(f => (
                <button key={f} onClick={() => send(f)}
                  className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-white/4 border border-white/8 text-white/40 hover:text-white hover:border-blue-500/30 transition-all">
                  <ArrowRight className="h-2.5 w-2.5 shrink-0" />
                  {f}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send(input)}
                disabled={isTyping}
                placeholder="Ask about the platform, APIs, SOPs, EDI, risk concepts, integrations…"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white/4 border border-white/8 text-white placeholder-white/25 outline-none focus:border-blue-500/40 disabled:opacity-50 transition-colors" />
            </div>
            <button onClick={() => send(input)} disabled={!input.trim() || isTyping}
              className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[9px] text-white/20 mt-1.5 text-center">RAG-powered · Searches {TOTAL_DOCS.toLocaleString()} docs · Overhaul Enterprise Knowledge Base</p>
        </div>
      </div>

      {/* ── Right Context Panel ── */}
      <div className="w-72 shrink-0 border-l border-white/5 flex flex-col overflow-hidden" style={{ background: '#0a0c0d' }}>
        {lastRag ? (
          <div className="flex-1 overflow-y-auto">
            {/* Confidence */}
            <div className="px-4 py-3 border-b border-white/5">
              <ConfidenceBadge score={lastRag.confidence} />
            </div>

            {/* Actions */}
            <div className="px-3 py-2.5 border-b border-white/5 flex items-center gap-1.5">
              <button onClick={copyAnswer}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/4 border border-white/8 text-[10px] text-white/50 hover:text-white hover:border-white/15 transition-all">
                {copied ? <><Check className="h-3 w-3 text-emerald-400" /><span className="text-emerald-400">Copied</span></> : <><Copy className="h-3 w-3" />Copy</>}
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/4 border border-white/8 text-[10px] text-white/50 hover:text-white hover:border-white/15 transition-all">
                <Download className="h-3 w-3" /> Export
              </button>
              <button onClick={() => setFeedback(p => ({ ...p, [lastAnswer?.id ?? ""]: "up" }))}
                className={cn("p-1.5 rounded-lg border text-[10px] transition-all", feedback[lastAnswer?.id ?? ""] === "up" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-white/4 border-white/8 text-white/40 hover:text-emerald-400")}>
                <ThumbsUp className="h-3 w-3" />
              </button>
              <button onClick={() => setFeedback(p => ({ ...p, [lastAnswer?.id ?? ""]: "down" }))}
                className={cn("p-1.5 rounded-lg border text-[10px] transition-all", feedback[lastAnswer?.id ?? ""] === "down" ? "bg-red-500/15 border-red-500/30 text-red-400" : "bg-white/4 border-white/8 text-white/40 hover:text-red-400")}>
                <ThumbsDown className="h-3 w-3" />
              </button>
            </div>

            {/* Sources */}
            <div className="px-3 py-3 border-b border-white/5">
              <p className="text-[9px] uppercase tracking-widest text-white/25 mb-2 font-semibold">Sources · {lastRag.sources.length} documents</p>
              <div className="space-y-1.5">
                {lastRag.sources.map((src, i) => <SourceCard key={i} source={src} index={i} />)}
              </div>
            </div>

            {/* Related Articles */}
            <div className="px-3 py-3 border-b border-white/5">
              <p className="text-[9px] uppercase tracking-widest text-white/25 mb-2 font-semibold">Related Articles</p>
              <div className="space-y-1">
                {lastRag.related.map((r, i) => (
                  <button key={i} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/4 text-left transition-colors group">
                    <r.icon className="h-3 w-3 text-white/25 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-white/50 group-hover:text-white/70 truncate">{r.title}</p>
                      <p className="text-[8px] text-white/20">{r.section}</p>
                    </div>
                    <ExternalLink className="h-2.5 w-2.5 text-white/15 group-hover:text-blue-400 shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Follow-up Suggestions */}
            <div className="px-3 py-3">
              <p className="text-[9px] uppercase tracking-widest text-white/25 mb-2 font-semibold">Suggested Follow-ups</p>
              <div className="space-y-1.5">
                {lastRag.followups.map((f, i) => (
                  <button key={i} onClick={() => send(f)}
                    className="w-full flex items-start gap-2 px-2.5 py-2 rounded-lg bg-white/3 border border-white/5 hover:bg-white/6 hover:border-blue-500/20 text-left transition-all group">
                    <TrendingUp className="h-3 w-3 text-blue-400/50 shrink-0 mt-0.5" />
                    <span className="text-[10px] text-white/45 group-hover:text-white/65 leading-snug">{f}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Empty right panel */
          <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
            <div className="h-10 w-10 rounded-xl bg-white/4 border border-white/6 flex items-center justify-center mb-3">
              <Database className="h-5 w-5 text-white/20" />
            </div>
            <p className="text-[11px] font-semibold text-white/30 mb-1">Context Panel</p>
            <p className="text-[10px] text-white/15 leading-relaxed">Ask a question to see sources, confidence score, related articles and follow-up suggestions.</p>

            <div className="mt-6 w-full space-y-1.5">
              <p className="text-[9px] uppercase tracking-widest text-white/15 mb-2">Generative AI Features</p>
              {[
                { icon: FileText, label: "Summarize documents" },
                { icon: Code2, label: "Explain API endpoints" },
                { icon: BarChart3, label: "Generate risk reports" },
                { icon: BookOpen, label: "Translate to business language" },
                { icon: ClipboardList, label: "Generate SOP drafts" },
                { icon: TrendingUp, label: "Compare carriers" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 px-2 py-1">
                  <item.icon className="h-3 w-3 text-white/15 shrink-0" />
                  <span className="text-[9px] text-white/20">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats footer */}
        <div className="shrink-0 border-t border-white/5 px-3 py-2.5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Docs", value: TOTAL_DOCS.toLocaleString() },
              { label: "Sources", value: "12" },
              { label: "Updated", value: "Today" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-[10px] font-bold text-white/50">{s.value}</p>
                <p className="text-[8px] text-white/20 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
