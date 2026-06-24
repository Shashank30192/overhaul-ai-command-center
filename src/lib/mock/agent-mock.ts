import { demoData } from "@/lib/data";

// ─── Mode 1: Chatbot responses ───────────────────────────────────────────────

const CHATBOT_QA: Array<{ patterns: string[]; response: string }> = [
  {
    patterns: ["route deviation", "route dev"],
    response:
      "A **route deviation** occurs when a shipment leaves its planned GPS route. This can indicate theft, unauthorized stops, or driver error. The Overhaul platform flags deviations in real time and triggers an alert for investigation.",
  },
  {
    patterns: ["risk score", "what is risk"],
    response:
      "The **risk score** is a 0–100 composite metric calculated from route behavior, carrier history, cargo value, theft hotspot proximity, and device telemetry. Scores above 80 are considered High Risk and require immediate action.",
  },
  {
    patterns: ["tts", "time to stop", "countdown"],
    response:
      "**TTS (Time to Stop)** is Overhaul's countdown mechanism that triggers when a shipment makes an unplanned stop. If the stop is not verified by the carrier within the configured window, an escalation alert is generated.",
  },
  {
    patterns: ["cold chain", "temperature"],
    response:
      "**Cold chain monitoring** tracks cargo temperature in real time against predefined thresholds. If temperature exceeds the acceptable range, Overhaul sends an immediate alert to prevent spoilage of pharmaceuticals, food, or vaccines.",
  },
  {
    patterns: ["double broker", "double brok"],
    response:
      "**Double brokering** is a fraud scheme where a carrier re-brokers a load to an unauthorized third party without the shipper's knowledge. Overhaul's fraud detection identifies this through carrier profile mismatches and document analysis.",
  },
  {
    patterns: ["carrier", "who is"],
    response:
      "A **carrier** is the trucking company responsible for transporting the shipment. Overhaul monitors carrier safety ratings, MC numbers, fraud history, and on-time performance to generate a carrier risk profile for every shipment.",
  },
  {
    patterns: ["geofence", "geo fence"],
    response:
      "A **geofence** is a virtual boundary around a geographic area. Overhaul triggers alerts when a shipment enters or exits defined geofenced zones — such as high-theft corridors or unauthorized territories.",
  },
  {
    patterns: ["unauthorized stop", "unauth"],
    response:
      "An **unauthorized stop** is when a vehicle stops for longer than the permitted dwell time at a non-designated location. This may indicate a handoff, theft, or driver incident. Overhaul flags and investigates all unauthorized stops.",
  },
  {
    patterns: ["incident", "report"],
    response:
      "An **incident report** documents a security or operational event affecting a shipment. Overhaul auto-populates incident reports with GPS analysis, driver behavior data, and carrier intelligence to reduce analyst workload.",
  },
  {
    patterns: ["hello", "hi", "hey", "help"],
    response:
      "Hello! I'm **RiskBot**, your basic risk information assistant. I can answer questions about route deviations, risk scores, TTS events, cold chain monitoring, carrier fraud, and more. What would you like to know?",
  },
];

export function getChatbotResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const qa of CHATBOT_QA) {
    if (qa.patterns.some((p) => lower.includes(p))) {
      return qa.response;
    }
  }
  return "I can answer questions about **route deviations**, **risk scores**, **TTS events**, **cold chain**, **carrier fraud**, **geofences**, and **incident reports**. Try asking about any of these topics!";
}

// ─── Mode 2: Assistant responses ─────────────────────────────────────────────

function getTopHighRisk() {
  return [...demoData.shipments]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);
}

const ASSISTANT_QA: Array<{ patterns: string[]; response: (ctx: AssistantContext) => string }> = [
  {
    patterns: ["summarize", "today", "summary", "overview"],
    response: (ctx) => `## Risk Summary — ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}

**${ctx.alertCount} active alerts** across ${ctx.shipmentCount} monitored shipments.

### Key Findings
- 🔴 **${ctx.highCount} High Risk** shipments (score ≥ 80)
- 🟡 **${ctx.medCount} Medium Risk** shipments (score 60–79)
- 🟢 **${ctx.lowCount} Low Risk** shipments (score < 60)

### Top Risk Factors Detected
- Route deviations on **${ctx.deviations} shipments**
- Unauthorized stops on **${ctx.unauth} shipments**
- Cold-chain integrity concerns on **${ctx.coldChain} shipments**

### Priority Corridor
**${ctx.topShipment.origin} → ${ctx.topShipment.destination}** (Risk ${ctx.topShipment.riskScore}%) — ${ctx.topShipment.riskReasons[0]}

**Recommended Focus:** Prioritize the Mexico corridor and ${ctx.topShipment.cargo} shipments. Immediate review of carriers with fraud scores above 70.`,
  },
  {
    patterns: ["high risk", "highest", "worst", "critical"],
    response: (ctx) => `## High-Risk Shipments — Immediate Attention Required

${ctx.top5.map((s, i) => `**${i + 1}. ${s.id}** — Risk ${s.riskScore}%
   - Route: ${s.origin} → ${s.destination}
   - Cargo: ${s.cargo}
   - Issues: ${s.riskReasons.slice(0, 2).join(", ")}
   - Action: ${s.recommendedAction}`).join("\n\n")}

**Analysis:** ${ctx.highCount} shipments exceed the 80% risk threshold. Carrier compliance issues and route deviations are the dominant patterns.

**Recommended Actions:**
1. Initiate contact with carriers on top 3 shipments
2. Consider security escorts for cargo valued above $500K
3. Escalate to operations team if no contact in 30 minutes`,
  },
  {
    patterns: ["trend", "pattern", "rising", "increasing", "analytics"],
    response: (_ctx) => `## Risk Trend Analysis — Last 24 Hours

### Incident Rate by Category
| Category | Count | Trend |
|---|---|---|
| Route Deviations | 7 | ↑ +28% |
| Carrier Compliance | 5 | → Stable |
| Device Outages | 3 | ↓ -12% |
| Unauthorized Stops | 4 | ↑ +15% |

### Geographic Hotspots
- **Mexico Corridor** — highest concentration of route deviations (3 incidents)
- **I-10 Texas Stretch** — 2 unauthorized stops flagged in last 4 hours
- **Florida to Georgia Lane** — cold chain excursion risk elevated

### Pattern Insight
Route deviations spiked overnight, correlating with a regional weather event and a known high-theft zone activation near Dallas. Carrier compliance issues are tied to 2 unverified MC numbers.

**Forecast:** If current trends persist, risk score across Mexico corridor shipments may increase by 15% within 6 hours.

**Recommendation:** Activate enhanced monitoring protocol for Mexico-bound shipments and verify carrier credentials on non-compliant loads.`,
  },
  {
    patterns: ["executive", "brief", "report", "ceo", "leadership"],
    response: (ctx) => `## Executive Risk Briefing
*Generated ${new Date().toLocaleTimeString()} — Overhaul AI Assistant*

### Operational Status
**${ctx.shipmentCount} shipments** under active monitoring. Overall risk posture: **${ctx.highCount > 5 ? "Elevated" : "Moderate"}**.

### Financial Exposure
- High-risk cargo value at risk: **~$4.2M**
- Fraud exposure (suspected): **~$890K**
- Potential recovery with current interventions: **~$3.1M**

### Key Performance Indicators
- Shipment protection rate: **97.4%** (above SLA)
- Average response time to alert: **4.2 minutes** (target: <5 min)
- Fraud cases detected this week: **${ctx.fraudCount}**

### Top 3 Risks for Leadership Attention
1. **Mexico corridor** — sustained theft cluster, 3 active investigations
2. **Unverified carrier** on pharmaceutical load — compliance escalation needed
3. **Cold chain excursion risk** on vaccine shipment departing Miami

### Recommendation
Authorize enhanced monitoring for Mexico corridor for next 48 hours. Review carrier vetting process for pharmaceutical loads.`,
  },
  {
    patterns: ["carrier", "fraud", "fake", "broker"],
    response: (_ctx) => `## Carrier Intelligence & Fraud Analysis

### Active Fraud Flags — This Session
| Case | Type | Score | Exposure |
|---|---|---|---|
| FRD-0091 | Double Brokering | 92% | $340K |
| FRD-0087 | Carrier Identity Fraud | 85% | $210K |
| FRD-0083 | Fake POD | 78% | $95K |

### Risk Signals Detected
- **2 carriers** with mismatched MC numbers vs. registered profiles
- **1 carrier** showing unusual route patterns consistent with load hand-off
- **3 shipments** with document anomalies (signature mismatch on BOL)

### Fraud Methodology Breakdown
- **Double Brokering (43%)** — most common; often detected via GPS carrier identity mismatch
- **Fake PODs (31%)** — forged delivery confirmations
- **Identity Fraud (26%)** — stolen MC numbers or cloned carrier profiles

**Recommendation:** Halt tender for \`CAR-0003\` pending MC number re-verification. Initiate document review on 3 flagged PODs.`,
  },
  {
    patterns: ["cold chain", "temperature", "pharma", "vaccine"],
    response: (_ctx) => `## Cold Chain Integrity Report

### Active Cold Chain Shipments: 12
- ✅ **8 shipments** — within temperature threshold
- ⚠️ **3 shipments** — approaching threshold boundary
- 🔴 **1 shipment** — excursion risk HIGH (>85% probability)

### Critical Alert — SHP-00847
**Cargo:** Vaccine — Miami → Chicago
**Current Temp:** 6.8°C (threshold: 2–8°C)
**Predicted Excursion:** 73% probability within next 2 hours
**Recommendation:** Contact carrier immediately. Consider re-ice at next depot.

### Trends
Temperature excursion risk increased 18% over last 6 hours, correlated with a 3°C ambient temperature rise in the Florida corridor.

**Action Required:** Proactive intervention on SHP-00847 could prevent ~$180K in product loss.`,
  },
  {
    patterns: ["help", "what can", "capabilities", "what do you"],
    response: (_ctx) => `## RiskGPT Assistant — Capabilities

I analyze your live Overhaul platform data to provide contextual intelligence:

### What I Can Do
- 📊 **Summarize today's risks** — alerts, deviations, fraud signals
- 🔍 **Identify high-risk shipments** — with full context and actions
- 📈 **Explain risk trends** — patterns, hotspots, forecasts
- 📋 **Generate executive briefings** — leadership-ready summaries
- 🚚 **Carrier intelligence** — fraud flags, compliance issues
- ❄️ **Cold chain analysis** — temperature excursion risk

### Try Asking
- *"Summarize today's risks"*
- *"Show me the highest risk shipments"*
- *"Explain rising risk trends"*
- *"Generate an executive report"*
- *"What fraud cases are active?"*
- *"Cold chain status?"*`,
  },
];

interface AssistantContext {
  alertCount: number;
  shipmentCount: number;
  highCount: number;
  medCount: number;
  lowCount: number;
  deviations: number;
  unauth: number;
  coldChain: number;
  fraudCount: number;
  topShipment: ReturnType<typeof getTopHighRisk>[0];
  top5: ReturnType<typeof getTopHighRisk>;
}

function buildAssistantContext(): AssistantContext {
  const shipments = demoData.shipments;
  const top5 = getTopHighRisk();
  return {
    alertCount: shipments.filter((s) => s.riskScore >= 60).length,
    shipmentCount: shipments.length,
    highCount: shipments.filter((s) => s.riskScore >= 80).length,
    medCount: shipments.filter((s) => s.riskScore >= 60 && s.riskScore < 80).length,
    lowCount: shipments.filter((s) => s.riskScore < 60).length,
    deviations: shipments.filter((s) => s.routeDeviation).length,
    unauth: shipments.filter((s) => s.unauthorizedStop).length,
    coldChain: shipments.filter((s) => s.coldChain && s.riskScore >= 60).length,
    fraudCount: demoData.fraudCases?.length ?? 6,
    topShipment: top5[0],
    top5,
  };
}

export function getAssistantResponse(input: string): string {
  const lower = input.toLowerCase();
  const ctx = buildAssistantContext();
  for (const qa of ASSISTANT_QA) {
    if (qa.patterns.some((p) => lower.includes(p))) {
      return qa.response(ctx);
    }
  }
  return getAssistantResponse("help");
}

export const ASSISTANT_SUGGESTIONS = [
  "Summarize today's risks",
  "Show highest risk shipments",
  "Explain rising risk trends",
  "Generate executive report",
  "Carrier fraud analysis",
  "Cold chain status",
];

// ─── Mode 3: Autonomous Agent ─────────────────────────────────────────────────

export interface AgentTool {
  id: string;
  name: string;
  label: string;
  description: string;
  duration: number; // ms
  result: string;
  resultDetail?: string[];
}

export interface AgentPlan {
  id: string;
  step: string;
  description: string;
}

export interface AgentInvestigation {
  id: string;
  goalLabel: string;
  plans: AgentPlan[];
  tools: AgentTool[];
  agents: { name: string; role: string; status: "idle" | "running" | "complete" }[];
  findings: {
    riskScore: number;
    severity: "critical" | "high" | "medium" | "low";
    issues: string[];
    recommendations: string[];
    summary: string;
  };
}

const INVESTIGATION_SHIPMENT = (id?: string): AgentInvestigation => {
  const target = id
    ? demoData.shipments.find((s) => s.id === id) ?? demoData.shipments[0]
    : demoData.shipments.sort((a, b) => b.riskScore - a.riskScore)[0];

  return {
    id: "inv-001",
    goalLabel: `Investigate shipment ${target.id}`,
    plans: [
      { id: "p1", step: "Retrieve Shipment Data", description: "Pull current shipment record and GPS telemetry" },
      { id: "p2", step: "Analyze Route History", description: "Compare actual vs planned route for deviations" },
      { id: "p3", step: "Review Carrier Profile", description: "Check carrier safety rating, MC number, and fraud history" },
      { id: "p4", step: "Check Active Alerts", description: "Retrieve all open alerts linked to this shipment" },
      { id: "p5", step: "Calculate Risk Score", description: "Run composite risk model across all data sources" },
      { id: "p6", step: "Generate Recommendations", description: "Produce actionable response plan" },
    ],
    tools: [
      {
        id: "t1",
        name: "shipment_service",
        label: "Shipment Service",
        description: `Fetching record for ${target.id}…`,
        duration: 1400,
        result: "Shipment data retrieved",
        resultDetail: [
          `ID: ${target.id}`,
          `Route: ${target.origin} → ${target.destination}`,
          `Cargo: ${target.cargo}`,
          `Status: ${target.status.replace(/_/g, " ")}`,
        ],
      },
      {
        id: "t2",
        name: "route_analyzer",
        label: "Route Analyzer",
        description: "Comparing GPS breadcrumbs against planned route…",
        duration: 1800,
        result: target.routeDeviation ? "Route deviation confirmed" : "Route within parameters",
        resultDetail: target.routeDeviation
          ? ["Deviation detected 47 miles from origin", "Deviated 12.3 miles from planned corridor", "Last known deviation: 1h 22m ago"]
          : ["GPS breadcrumbs match planned route", "No deviation detected", "On-time arrival probability: 91%"],
      },
      {
        id: "t3",
        name: "carrier_intelligence",
        label: "Carrier Intelligence",
        description: `Running carrier profile check on ${target.carrierName}…`,
        duration: 2200,
        result: `Carrier fraud score: ${demoData.carriers?.find(c => c.id === target.carrierId)?.fraudScore ?? 62}%`,
        resultDetail: [
          `Carrier: ${target.carrierName}`,
          `Safety rating: ${(demoData.carriers?.find(c => c.id === target.carrierId)?.safetyRating ?? 3.8).toFixed(1)}/5`,
          `On-time rate: ${demoData.carriers?.find(c => c.id === target.carrierId)?.onTimeRate ?? 89}%`,
          `MC number: verified`,
        ],
      },
      {
        id: "t4",
        name: "alert_service",
        label: "Alert Service",
        description: "Fetching active alerts for this shipment…",
        duration: 1100,
        result: `${target.riskReasons.length} active alerts found`,
        resultDetail: target.riskReasons,
      },
      {
        id: "t5",
        name: "risk_calculator",
        label: "Risk Calculator",
        description: "Running composite risk model…",
        duration: 1600,
        result: `Composite risk score: ${target.riskScore}%`,
        resultDetail: [
          `Route risk: ${Math.round(target.riskScore * 0.4)}%`,
          `Carrier risk: ${Math.round(target.riskScore * 0.3)}%`,
          `Cargo value risk: ${Math.round(target.riskScore * 0.2)}%`,
          `Historical pattern: ${Math.round(target.riskScore * 0.1)}%`,
        ],
      },
      {
        id: "t6",
        name: "recommendation_engine",
        label: "Recommendation Engine",
        description: "Generating response plan…",
        duration: 1300,
        result: "Recommendations generated",
        resultDetail: [target.recommendedAction, "Notify operations team", "Consider security escort"],
      },
    ],
    agents: [
      { name: "Planner Agent", role: "Builds investigation strategy", status: "idle" },
      { name: "Risk Analyst Agent", role: "Route & telemetry analysis", status: "idle" },
      { name: "Carrier Intelligence Agent", role: "Carrier profile verification", status: "idle" },
      { name: "Incident Manager Agent", role: "Alert correlation & reporting", status: "idle" },
    ],
    findings: {
      riskScore: target.riskScore,
      severity: target.riskScore >= 80 ? "critical" : target.riskScore >= 60 ? "high" : "medium",
      issues: [
        ...(target.routeDeviation ? ["Route deviation detected — 12.3 miles off planned corridor"] : []),
        ...(target.unauthorizedStop ? ["Unauthorized stop — 47 minute dwell at non-designated location"] : []),
        ...target.riskReasons.slice(0, 3),
      ].slice(0, 4),
      recommendations: [
        target.recommendedAction,
        "Initiate carrier contact via secondary channel",
        "Consider security escort for remainder of journey",
        "Generate incident report for shipper notification",
      ],
      summary: `Shipment ${target.id} carrying ${target.cargo} on the ${target.origin} → ${target.destination} corridor shows a composite risk score of **${target.riskScore}%**. ${target.routeDeviation ? "A confirmed route deviation and " : ""}${target.riskReasons[0]?.toLowerCase() ?? "multiple risk factors"} require immediate intervention.`,
    },
  };
};

const INVESTIGATION_HIGH_RISK = (): AgentInvestigation => {
  const highRisk = demoData.shipments.filter((s) => s.riskScore >= 80).slice(0, 5);
  return {
    id: "inv-002",
    goalLabel: "Investigate high-risk alerts",
    plans: [
      { id: "p1", step: "Fetch All Active Alerts", description: "Pull all alerts with risk score ≥ 80" },
      { id: "p2", step: "Cluster by Risk Category", description: "Group alerts by type: route, carrier, fraud, cold-chain" },
      { id: "p3", step: "Geographic Hotspot Analysis", description: "Identify geographic clusters and high-risk corridors" },
      { id: "p4", step: "Carrier Compliance Sweep", description: "Run batch carrier verification across flagged loads" },
      { id: "p5", step: "Prioritize by Financial Exposure", description: "Rank by cargo value and theft probability" },
      { id: "p6", step: "Generate Action Plan", description: "Produce prioritized response recommendations" },
    ],
    tools: [
      {
        id: "t1",
        name: "alert_service",
        label: "Alert Service",
        description: "Fetching all high-risk alerts…",
        duration: 1500,
        result: `${highRisk.length} critical alerts retrieved`,
        resultDetail: highRisk.map((s) => `${s.id}: ${s.riskReasons[0]} (${s.riskScore}%)`),
      },
      {
        id: "t2",
        name: "cluster_engine",
        label: "Cluster Engine",
        description: "Grouping alerts by risk category…",
        duration: 1700,
        result: "4 distinct risk clusters identified",
        resultDetail: [
          "Route deviations: 7 shipments",
          "Carrier compliance: 5 shipments",
          "Device outages: 3 shipments",
          "Unauthorized stops: 4 shipments",
        ],
      },
      {
        id: "t3",
        name: "geo_hotspot_analyzer",
        label: "Geo Hotspot Analyzer",
        description: "Mapping geographic risk distribution…",
        duration: 2000,
        result: "3 active hotspot zones identified",
        resultDetail: [
          "Mexico Corridor — Risk Index 91",
          "I-10 Texas Stretch — Risk Index 78",
          "Florida-Georgia Lane — Risk Index 65",
        ],
      },
      {
        id: "t4",
        name: "carrier_batch_checker",
        label: "Carrier Batch Checker",
        description: "Batch-verifying carrier compliance…",
        duration: 2400,
        result: "2 non-compliant carriers flagged",
        resultDetail: [
          "CAR-0018: MC number mismatch",
          "CAR-0031: Safety rating below threshold",
          "Remaining 48 carriers: verified",
        ],
      },
      {
        id: "t5",
        name: "financial_exposure_calc",
        label: "Financial Exposure Calculator",
        description: "Computing total financial exposure…",
        duration: 1200,
        result: "Total exposure: $4.2M across 5 shipments",
        resultDetail: highRisk.map((s) => `${s.id}: $${(s.cargoValue / 1000).toFixed(0)}K`),
      },
      {
        id: "t6",
        name: "recommendation_engine",
        label: "Recommendation Engine",
        description: "Generating prioritized action plan…",
        duration: 1800,
        result: "Priority action plan generated",
        resultDetail: [
          "IMMEDIATE: Escort for top 2 shipments",
          "URGENT: Carrier verification for CAR-0018",
          "MONITOR: Enhanced tracking for Mexico corridor",
        ],
      },
    ],
    agents: [
      { name: "Planner Agent", role: "Investigation strategy", status: "idle" },
      { name: "Risk Analyst Agent", role: "Alert clustering & hotspot mapping", status: "idle" },
      { name: "Fraud Investigation Agent", role: "Carrier compliance sweep", status: "idle" },
      { name: "Incident Manager Agent", role: "Financial exposure & reporting", status: "idle" },
    ],
    findings: {
      riskScore: 91,
      severity: "critical",
      issues: [
        `${highRisk.length} shipments exceed 80% risk threshold`,
        "Mexico Corridor is highest-risk active zone (Risk Index 91)",
        "2 non-compliant carriers identified — CAR-0018 and CAR-0031",
        "Total financial exposure: $4.2M across 5 critical shipments",
      ],
      recommendations: [
        "Deploy security escorts for top 2 highest-value shipments",
        "Halt carrier CAR-0018 pending MC number re-verification",
        "Activate enhanced monitoring protocol for Mexico corridor",
        "Notify shippers for all 5 critical shipments immediately",
      ],
      summary: `**${highRisk.length} critical alerts** detected across the monitored fleet. The Mexico Corridor is the highest-risk active zone with a risk index of 91. Total financial exposure is **$4.2M**, concentrated in semiconductor and pharmaceutical loads. Two carriers have failed compliance checks and require immediate action.`,
    },
  };
};

const INVESTIGATION_EXECUTIVE = (): AgentInvestigation => ({
  id: "inv-003",
  goalLabel: "Generate executive report",
  plans: [
    { id: "p1", step: "Aggregate KPI Metrics", description: "Pull shipment count, alert rates, SLA compliance" },
    { id: "p2", step: "Financial Impact Analysis", description: "Calculate value at risk and recovery projections" },
    { id: "p3", step: "Trend Extraction", description: "Identify 24-hour risk trends and pattern changes" },
    { id: "p4", step: "Fraud Case Summary", description: "Summarize active and resolved fraud investigations" },
    { id: "p5", step: "Operational KPIs", description: "Response time, detection rate, analyst efficiency" },
    { id: "p6", step: "Format Executive Brief", description: "Generate leadership-ready summary with recommendations" },
  ],
  tools: [
    {
      id: "t1",
      name: "kpi_aggregator",
      label: "KPI Aggregator",
      description: "Pulling platform-wide KPI metrics…",
      duration: 1600,
      result: "KPIs aggregated across 500 shipments",
      resultDetail: [
        "Total shipments monitored: 500",
        "Active alerts: 87",
        "SLA compliance: 97.4%",
        "Avg. response time: 4.2 minutes",
      ],
    },
    {
      id: "t2",
      name: "financial_analyzer",
      label: "Financial Analyzer",
      description: "Calculating value at risk and exposure…",
      duration: 1900,
      result: "Financial exposure: $4.2M value at risk",
      resultDetail: [
        "High-risk cargo value at risk: $4.2M",
        "Fraud exposure (suspected): $890K",
        "Projected recovery rate: 73%",
        "Recoverable value: ~$3.1M",
      ],
    },
    {
      id: "t3",
      name: "trend_extractor",
      label: "Trend Extractor",
      description: "Analyzing 24-hour risk trend data…",
      duration: 2100,
      result: "3 significant trend patterns identified",
      resultDetail: [
        "Route deviations: ↑ 28% vs yesterday",
        "Device connectivity: ↓ 12% (improving)",
        "Mexico corridor risk: ↑ 15% sustained",
      ],
    },
    {
      id: "t4",
      name: "fraud_case_collector",
      label: "Fraud Case Collector",
      description: "Aggregating open fraud investigations…",
      duration: 1300,
      result: "8 active fraud cases summarized",
      resultDetail: [
        "3 double-brokering cases (high priority)",
        "2 carrier identity fraud investigations",
        "3 fake POD disputes in review",
        "Total exposure: $1.64M",
      ],
    },
    {
      id: "t5",
      name: "ops_metrics_engine",
      label: "Ops Metrics Engine",
      description: "Computing operational performance metrics…",
      duration: 1400,
      result: "Analyst efficiency +34% vs baseline",
      resultDetail: [
        "Alerts auto-triaged: 62%",
        "False positive rate: 8.2%",
        "Mean time to resolve: 22 minutes",
        "AI-assisted investigations: 91%",
      ],
    },
    {
      id: "t6",
      name: "report_generator",
      label: "Report Generator",
      description: "Composing executive brief…",
      duration: 2200,
      result: "Executive report ready for delivery",
      resultDetail: [
        "3-page summary generated",
        "Charts and KPI tables included",
        "PDF ready for export",
        "Board-ready format applied",
      ],
    },
  ],
  agents: [
    { name: "Planner Agent", role: "Report structure and scope", status: "idle" },
    { name: "Risk Analyst Agent", role: "Trend and pattern analysis", status: "idle" },
    { name: "Fraud Investigation Agent", role: "Fraud case aggregation", status: "idle" },
    { name: "Incident Manager Agent", role: "KPI and operational metrics", status: "idle" },
  ],
  findings: {
    riskScore: 74,
    severity: "high",
    issues: [
      "Route deviations increased 28% in last 24 hours",
      "Mexico corridor sustained high-risk index (91) for 6+ hours",
      "8 active fraud investigations totaling $1.64M exposure",
      "2 carrier compliance failures pending re-verification",
    ],
    recommendations: [
      "Brief operations leadership on Mexico corridor escalation",
      "Approve enhanced monitoring budget for next 48 hours",
      "Initiate carrier audit for CAR-0018 and CAR-0031",
      "Review SLA terms with 2 high-exposure shipper accounts",
    ],
    summary: `Platform-wide risk posture is **Elevated**. 87 active alerts with $4.2M in high-risk cargo value. The Mexico Corridor remains the primary concern, with sustained risk index of 91 over the last 6 hours. Analyst efficiency improved 34% year-over-year, with AI-assisted investigations now covering **91% of all cases**.`,
  },
});

const INVESTIGATION_TREND = (): AgentInvestigation => ({
  id: "inv-004",
  goalLabel: "Explain rising risk trends",
  plans: [
    { id: "p1", step: "Pull Historical Alert Data", description: "Retrieve 24-hour alert history for comparison" },
    { id: "p2", step: "Identify Pattern Changes", description: "Detect statistically significant shifts in risk categories" },
    { id: "p3", step: "Correlate External Factors", description: "Check weather, road events, and regional threat data" },
    { id: "p4", step: "Map Geographic Shifts", description: "Identify where risk concentration is moving" },
    { id: "p5", step: "Carrier Behavior Analysis", description: "Detect behavioral anomalies across the carrier fleet" },
    { id: "p6", step: "Generate Trend Report", description: "Produce insight narrative with forward-looking forecast" },
  ],
  tools: [
    {
      id: "t1",
      name: "historical_data_service",
      label: "Historical Data Service",
      description: "Fetching 24-hour alert history…",
      duration: 1500,
      result: "18 risk events over 24-hour window",
      resultDetail: [
        "0–6h: 3 alerts (baseline)",
        "6–12h: 4 alerts (slight increase)",
        "12–18h: 7 alerts (spike)",
        "18–24h: 4 alerts (stabilizing)",
      ],
    },
    {
      id: "t2",
      name: "pattern_detector",
      label: "Pattern Detector",
      description: "Running statistical pattern analysis…",
      duration: 2200,
      result: "Route deviation rate ↑ 28% — statistically significant",
      resultDetail: [
        "Route deviations: p-value 0.02 (significant)",
        "Unauthorized stops: p-value 0.08 (moderate)",
        "Device outages: p-value 0.41 (not significant)",
        "Carrier anomalies: p-value 0.03 (significant)",
      ],
    },
    {
      id: "t3",
      name: "external_factor_api",
      label: "External Factor API",
      description: "Correlating weather and regional threat data…",
      duration: 1800,
      result: "3 external factors identified as correlates",
      resultDetail: [
        "Severe weather in Texas corridor (+22% risk)",
        "Regional cargo theft advisory active (Mexico)",
        "Fuel strike disruption near Monterrey",
      ],
    },
    {
      id: "t4",
      name: "geo_shift_analyzer",
      label: "Geo Shift Analyzer",
      description: "Mapping geographic risk movement…",
      duration: 1600,
      result: "Risk concentration shifting north toward US border",
      resultDetail: [
        "Mexico interior: risk declining",
        "US-Mexico border zone: risk ↑ 34%",
        "Texas I-10 corridor: new hotspot forming",
      ],
    },
    {
      id: "t5",
      name: "carrier_behavior_engine",
      label: "Carrier Behavior Engine",
      description: "Scanning carrier fleet for behavioral anomalies…",
      duration: 2000,
      result: "4 carriers showing anomalous patterns",
      resultDetail: [
        "CAR-0018: Unusual stop frequency",
        "CAR-0031: Route deviation pattern",
        "CAR-0044: Communication gaps >30min",
        "CAR-0007: New driver assignment (unverified)",
      ],
    },
    {
      id: "t6",
      name: "forecast_engine",
      label: "Forecast Engine",
      description: "Generating 6-hour risk forecast…",
      duration: 1700,
      result: "Risk forecast: elevated for next 6 hours",
      resultDetail: [
        "Mexico corridor: sustained high (index 88–94)",
        "Texas I-10: risk likely to peak in 2–4 hours",
        "Florida lane: risk declining (weather clearing)",
        "Recommended alert: enhanced monitoring NOW",
      ],
    },
  ],
  agents: [
    { name: "Planner Agent", role: "Trend analysis framework", status: "idle" },
    { name: "Risk Analyst Agent", role: "Pattern detection & geographic analysis", status: "idle" },
    { name: "Fraud Investigation Agent", role: "Carrier behavioral anomalies", status: "idle" },
    { name: "Incident Manager Agent", role: "External correlation & forecasting", status: "idle" },
  ],
  findings: {
    riskScore: 82,
    severity: "high",
    issues: [
      "Route deviation rate increased 28% — statistically significant spike",
      "Mexico border zone risk elevated 34% due to regional cargo theft advisory",
      "Texas I-10 corridor emerging as new hotspot — forming within last 4 hours",
      "4 carriers showing anomalous behavioral patterns correlated with threat increase",
    ],
    recommendations: [
      "Activate enhanced monitoring for all US-Mexico border crossings immediately",
      "Re-route non-urgent Mexico loads via alternate corridor for next 24 hours",
      "Issue behavioral investigation for CAR-0018 and CAR-0031",
      "Pre-position security response assets near Texas I-10 hotspot",
    ],
    summary: `Risk is rising due to a **converging threat environment** in the US-Mexico border zone. A regional cargo theft advisory, severe weather disruption near Monterrey, and a fuel strike are amplifying route deviation rates by **28%**. The Texas I-10 corridor is forming as a secondary hotspot. **Immediate action on rerouting and carrier verification** can reduce exposure by an estimated 40%.`,
  },
});

export const AGENT_PRESET_GOALS = [
  { label: "Investigate high-risk alerts", goal: "investigate high-risk alerts" },
  { label: "Investigate shipment", goal: "investigate shipment" },
  { label: "Generate executive report", goal: "generate executive report" },
  { label: "Explain rising risk trends", goal: "explain rising risk trends" },
];

export function getAgentInvestigation(goal: string): AgentInvestigation {
  const lower = goal.toLowerCase();
  if (lower.includes("shipment") || lower.includes("shp") || /\d{4,}/.test(lower)) {
    const match = goal.match(/[A-Z0-9-]{6,}/i);
    return INVESTIGATION_SHIPMENT(match?.[0]);
  }
  if (lower.includes("executive") || lower.includes("report") || lower.includes("brief")) {
    return INVESTIGATION_EXECUTIVE();
  }
  if (lower.includes("trend") || lower.includes("rising") || lower.includes("pattern")) {
    return INVESTIGATION_TREND();
  }
  // Default: high-risk investigation
  return INVESTIGATION_HIGH_RISK();
}
