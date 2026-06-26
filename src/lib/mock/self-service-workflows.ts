import { demoData } from "@/lib/data";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ScreenId =
  | "home"
  | "risk-monitor"
  | "shipment-detail"
  | "riskgpt-chat"
  | "incident-form"
  | "carrier-profile"
  | "executive-report"
  | "fraud-dashboard"
  | "digital-twin"
  | "search-results"
  | "case-detail"
  | "driver-call"
  | "case-notes";

export interface ScreenAction {
  type: "navigate" | "click" | "type" | "hover" | "scroll" | "read";
  targetLabel: string;
  targetHint?: string; // element description shown in highlight
  durationMs: number;
  thought: string; // agent inner monologue
}

export interface WorkflowStep {
  screen: ScreenId;
  actions: ScreenAction[];
  resultSnippet?: string; // partial result revealed after this step
}

export interface CustomerWorkflow {
  id: string;
  intentPatterns: string[];
  title: string;
  steps: WorkflowStep[];
  finalResult: WorkflowResult;
}

export interface WorkflowResult {
  type: "shipment-status" | "incident-filed" | "risk-report" | "carrier-info" | "eta" | "claim" | "general";
  headline: string;
  data: Record<string, string | number | boolean>;
  actions: { label: string; variant: "primary" | "secondary" | "danger" }[];
  message: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function pickShipment(query?: string) {
  if (query) {
    const found = demoData.shipments.find(
      (s) => s.id.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes(s.id.slice(-4).toLowerCase())
    );
    if (found) return found;
  }
  return demoData.shipments.sort((a, b) => b.riskScore - a.riskScore)[0];
}

// ─── Workflow Definitions ────────────────────────────────────────────────────

const TRACK_SHIPMENT = (query?: string): CustomerWorkflow => {
  const s = pickShipment(query);
  const ohId = s.id.replace(/[^0-9]/g, "").slice(0, 7);
  return {
    id: "track-shipment",
    intentPatterns: ["track", "where is", "locate", "status", "shipment", "cargo", "find my"],
    title: "Track Shipment",
    steps: [
      {
        screen: "home",
        actions: [
          {
            type: "navigate",
            targetLabel: "Risk Monitor",
            targetHint: "Nav link",
            durationMs: 900,
            thought: "I need to navigate to the Risk Monitor to find shipment details.",
          },
        ],
      },
      {
        screen: "risk-monitor",
        actions: [
          {
            type: "click",
            targetLabel: "Search alerts box",
            targetHint: "Search bar",
            durationMs: 700,
            thought: `I can see the alert list. I'll search for shipment ${ohId}.`,
          },
          {
            type: "type",
            targetLabel: `OH ID: ${ohId}`,
            targetHint: "Typing shipment ID",
            durationMs: 1100,
            thought: `Typing the shipment ID to filter the list.`,
          },
          {
            type: "click",
            targetLabel: s.riskReasons[0] ?? "Active Risk Alert",
            targetHint: "Alert card",
            durationMs: 800,
            thought: "Found the shipment. Clicking to open detailed view.",
          },
        ],
        resultSnippet: `Located shipment OH-${ohId}`,
      },
      {
        screen: "shipment-detail",
        actions: [
          {
            type: "read",
            targetLabel: "Shipment status panel",
            targetHint: "Status + location",
            durationMs: 1400,
            thought: `Reading current location, status, and ETA. Risk score is ${s.riskScore}%.`,
          },
          {
            type: "hover",
            targetLabel: "Live map position",
            targetHint: "GPS marker",
            durationMs: 900,
            thought: "Checking real-time GPS position on the map.",
          },
        ],
        resultSnippet: `Status: ${s.status.replace(/_/g, " ")} — ETA ${s.eta}`,
      },
    ],
    finalResult: {
      type: "shipment-status",
      headline: `Shipment OH-${ohId} — ${s.status.replace(/_/g, " ").toUpperCase()}`,
      data: {
        "Shipment ID": `OH-${ohId}`,
        Route: `${s.origin} → ${s.destination}`,
        Cargo: s.cargo,
        Status: s.status.replace(/_/g, " "),
        "Current Location": `${s.origin} corridor`,
        ETA: s.eta,
        Carrier: s.carrierName,
        "Risk Level": `${s.riskScore}%`,
        "Route Deviation": s.routeDeviation ? "⚠ Yes" : "✓ No",
      },
      actions: [
        { label: "View Live Map", variant: "primary" },
        { label: "Request Update from Carrier", variant: "secondary" },
        { label: "Set ETA Alert", variant: "secondary" },
      ],
      message: `Your ${s.cargo} shipment is currently **${s.status.replace(/_/g, " ")}** on the ${s.origin} → ${s.destination} route. ${s.routeDeviation ? "⚠ A route deviation has been detected and is under investigation." : "The shipment is on its planned route."} Estimated arrival: **${s.eta}**.`,
    },
  };
};

const FILE_INCIDENT = (query?: string): CustomerWorkflow => {
  const s = pickShipment(query);
  const ohId = s.id.replace(/[^0-9]/g, "").slice(0, 7);
  const caseId = `INC-${Math.floor(Math.random() * 90000 + 10000)}`;
  return {
    id: "file-incident",
    intentPatterns: ["incident", "report", "file", "claim", "issue", "problem", "damaged", "stolen", "missing", "lost"],
    title: "File an Incident Report",
    steps: [
      {
        screen: "home",
        actions: [
          {
            type: "navigate",
            targetLabel: "Risk Monitor",
            targetHint: "Nav link",
            durationMs: 900,
            thought: "I'll navigate to Risk Monitor to find the shipment and file an incident.",
          },
        ],
      },
      {
        screen: "risk-monitor",
        actions: [
          {
            type: "click",
            targetLabel: `OH ID: ${ohId}`,
            targetHint: "Alert card",
            durationMs: 1000,
            thought: `Locating shipment OH-${ohId} in the active alerts list.`,
          },
        ],
        resultSnippet: `Found shipment OH-${ohId}`,
      },
      {
        screen: "shipment-detail",
        actions: [
          {
            type: "read",
            targetLabel: "Active alerts panel",
            targetHint: "Risk factors",
            durationMs: 900,
            thought: "Reading the existing risk flags before filing the incident report.",
          },
        ],
      },
      {
        screen: "incident-form",
        actions: [
          {
            type: "click",
            targetLabel: "Open Incident button",
            targetHint: "Action button",
            durationMs: 700,
            thought: "Opening the incident filing form for this shipment.",
          },
          {
            type: "type",
            targetLabel: "Incident description",
            targetHint: "Form field",
            durationMs: 1400,
            thought: `Populating the incident form with shipment details: ${s.riskReasons[0]}.`,
          },
          {
            type: "click",
            targetLabel: "Attach GPS evidence",
            targetHint: "Evidence upload",
            durationMs: 900,
            thought: "Attaching GPS route deviation data and telemetry as supporting evidence.",
          },
          {
            type: "click",
            targetLabel: "Submit Incident Report",
            targetHint: "Submit button",
            durationMs: 700,
            thought: "Submitting the completed incident report to the operations team.",
          },
        ],
        resultSnippet: `Incident ${caseId} created`,
      },
    ],
    finalResult: {
      type: "incident-filed",
      headline: `Incident ${caseId} — Filed Successfully`,
      data: {
        "Case Number": caseId,
        "Shipment ID": `OH-${ohId}`,
        "Cargo": s.cargo,
        "Carrier": s.carrierName,
        "Route": `${s.origin} → ${s.destination}`,
        "Filed At": new Date().toLocaleTimeString(),
        "Status": "Under Review",
        "Priority": s.riskScore >= 80 ? "HIGH" : "MEDIUM",
        "Assigned To": "Overhaul Operations",
      },
      actions: [
        { label: "View Incident", variant: "primary" },
        { label: "Download Case Summary", variant: "secondary" },
        { label: "Contact Operations Team", variant: "secondary" },
      ],
      message: `Your incident report **${caseId}** has been filed successfully. The Overhaul operations team has been notified and will begin investigation within 30 minutes. You will receive status updates via email. Case priority: **${s.riskScore >= 80 ? "HIGH" : "MEDIUM"}**.`,
    },
  };
};

const GET_RISK_REPORT = (query?: string): CustomerWorkflow => {
  const s = pickShipment(query);
  const ohId = s.id.replace(/[^0-9]/g, "").slice(0, 7);
  return {
    id: "risk-report",
    intentPatterns: ["risk", "report", "analysis", "assessment", "score", "safety", "danger", "threat"],
    title: "Generate Risk Report",
    steps: [
      {
        screen: "risk-monitor",
        actions: [
          {
            type: "navigate",
            targetLabel: "Risk Monitor",
            targetHint: "Nav link",
            durationMs: 800,
            thought: "Navigating to Risk Monitor to pull the risk data for this shipment.",
          },
          {
            type: "click",
            targetLabel: `OH-${ohId}`,
            targetHint: "Alert card",
            durationMs: 900,
            thought: `Found the shipment in the active alerts. Risk score is ${s.riskScore}%.`,
          },
        ],
        resultSnippet: `Risk Score: ${s.riskScore}%`,
      },
      {
        screen: "riskgpt-chat",
        actions: [
          {
            type: "click",
            targetLabel: "Chat with RiskGPT",
            targetHint: "Chat tab",
            durationMs: 600,
            thought: "Opening RiskGPT to run a full AI-powered risk analysis.",
          },
          {
            type: "type",
            targetLabel: "Generate comprehensive risk report",
            targetHint: "Chat input",
            durationMs: 1200,
            thought: "Requesting a detailed risk assessment from the AI analyst.",
          },
          {
            type: "read",
            targetLabel: "RiskGPT analysis",
            targetHint: "AI response",
            durationMs: 2000,
            thought: `Reviewing RiskGPT analysis: ${s.riskReasons[0]}. Compiling into report format.`,
          },
        ],
        resultSnippet: "AI analysis complete",
      },
      {
        screen: "shipment-detail",
        actions: [
          {
            type: "click",
            targetLabel: "Export Report",
            targetHint: "Action button",
            durationMs: 800,
            thought: "Generating the formatted PDF risk report for delivery to customer.",
          },
        ],
        resultSnippet: "Report generated",
      },
    ],
    finalResult: {
      type: "risk-report",
      headline: `Risk Report — OH-${ohId}`,
      data: {
        "Shipment": `OH-${ohId}`,
        "Risk Score": `${s.riskScore}%`,
        "Theft Probability": `${s.theftProbability}%`,
        "Route Risk": `${Math.round(s.riskScore * 0.4)}%`,
        "Carrier Risk": `${Math.round(s.riskScore * 0.3)}%`,
        "Cargo Value Risk": `${Math.round(s.riskScore * 0.2)}%`,
        "Route Deviation": s.routeDeviation ? "Detected" : "None",
        "Unauthorized Stop": s.unauthorizedStop ? "Detected" : "None",
        "Assessment": s.riskScore >= 80 ? "CRITICAL" : s.riskScore >= 60 ? "HIGH" : "MEDIUM",
      },
      actions: [
        { label: "Download PDF Report", variant: "primary" },
        { label: "Share with Insurer", variant: "secondary" },
        { label: "Request Security Escort", variant: s.riskScore >= 80 ? "danger" : "secondary" },
      ],
      message: `Risk assessment complete for OH-${ohId}. **Composite risk score: ${s.riskScore}%** (${s.riskScore >= 80 ? "CRITICAL" : s.riskScore >= 60 ? "HIGH" : "MEDIUM"}). Key concerns: ${s.riskReasons.slice(0, 2).join("; ")}. **Recommended action:** ${s.recommendedAction}`,
    },
  };
};

const CHECK_CARRIER = (_query?: string): CustomerWorkflow => {
  const carrierName = "Beacon Logistics LLC";
  const mcNumber = "MC-294817";
  const dotNumber = "DOT-1847392";
  return {
    id: "carrier-info",
    intentPatterns: ["carrier", "driver", "trucker", "transport", "company", "verify", "check carrier", "credentials"],
    title: "Verify Carrier",
    steps: [
      {
        screen: "home",
        actions: [
          {
            type: "navigate",
            targetLabel: "Fraud Watch",
            targetHint: "Nav link",
            durationMs: 900,
            thought: "I need to run a full Bad Actor Check on this carrier. Navigating to the Fraud Watch dashboard.",
          },
        ],
      },
      {
        screen: "fraud-dashboard",
        actions: [
          {
            type: "click",
            targetLabel: "Carrier search box",
            targetHint: "Search input",
            durationMs: 700,
            thought: "I'll search for the carrier by name to pull up their profile.",
          },
          {
            type: "type",
            targetLabel: `"${carrierName}"`,
            targetHint: "Typing carrier name",
            durationMs: 1100,
            thought: `Typing "${carrierName}" to locate the carrier record.`,
          },
          {
            type: "click",
            targetLabel: "Beacon Logistics — MC-294817",
            targetHint: "Carrier result",
            durationMs: 800,
            thought: "Found the carrier. Clicking to open and run Bad Actor Check.",
          },
          {
            type: "read",
            targetLabel: "USDOT lookup result",
            targetHint: "Check row",
            durationMs: 1200,
            thought: `USDOT lookup returned: ${dotNumber} — Active carrier status. ✓`,
          },
          {
            type: "read",
            targetLabel: "Name cross-reference result",
            targetHint: "Check row",
            durationMs: 1000,
            thought: "Cross-referencing carrier name against known fraud aliases. No matches found. ✓",
          },
          {
            type: "read",
            targetLabel: "Insurance check result",
            targetHint: "Check row",
            durationMs: 900,
            thought: "Insurance coverage verified: $1M liability policy active through December 2025. ✓",
          },
          {
            type: "read",
            targetLabel: "First officer review",
            targetHint: "Check row",
            durationMs: 1100,
            thought: "First officer review flagged a prior incident from 2021 — minor, no pattern of misconduct. Noted.",
          },
          {
            type: "read",
            targetLabel: "Composite risk score",
            targetHint: "Score card",
            durationMs: 900,
            thought: "Composite fraud risk score: 18% — LOW RISK. 5 of 6 checks passed, 1 advisory warning.",
          },
        ],
        resultSnippet: "Fraud checks: 5 pass, 1 warning",
      },
      {
        screen: "carrier-profile",
        actions: [
          {
            type: "click",
            targetLabel: "Open full carrier profile",
            targetHint: "View profile link",
            durationMs: 700,
            thought: "Opening the full carrier profile to review safety ratings and certifications.",
          },
          {
            type: "read",
            targetLabel: "Safety & performance ratings",
            targetHint: "Stats row",
            durationMs: 1100,
            thought: "Safety rating 4.2/5, on-time rate 94%, 847 completed shipments. Solid track record.",
          },
          {
            type: "read",
            targetLabel: "FMCSA credential checks",
            targetHint: "Credential list",
            durationMs: 1200,
            thought: `MC authority (${mcNumber}) active, address confirmed in Dallas TX, phone verified.`,
          },
          {
            type: "read",
            targetLabel: "Certifications — TAPA, ISO, C-TPAT",
            targetHint: "Certs list",
            durationMs: 900,
            thought: "TAPA TSR Level 1, ISO 28000, and C-TPAT certified. All current and valid.",
          },
        ],
        resultSnippet: "Safety 4.2/5 · On-time 94%",
      },
    ],
    finalResult: {
      type: "carrier-info",
      headline: `Carrier Verified — ${carrierName}`,
      data: {
        "Carrier Name": carrierName,
        "MC Number": mcNumber,
        "DOT Number": dotNumber,
        "FMCSA Status": "✓ Active & Verified",
        "Safety Rating": "4.2 / 5.0",
        "Fraud Risk Score": "18% — LOW",
        "On-Time Rate": "94%",
        "Insurance": "✓ Valid through Dec 2025",
        "Certifications": "TAPA · ISO 28000 · C-TPAT",
        "Bad Actor Check": "5 pass · 1 advisory",
      },
      actions: [
        { label: "Download Carrier Report", variant: "primary" },
        { label: "Approve for Shipment", variant: "primary" },
        { label: "Flag for Review", variant: "secondary" },
      ],
      message: `Carrier **${carrierName}** passed the Bad Actor Check with a fraud risk score of **18% (LOW)**. FMCSA status is **active and verified** (${mcNumber} · ${dotNumber}). Safety rating: **4.2/5** · On-time rate: **94%** across 847 shipments. One advisory: a minor first officer incident from 2021 with no subsequent violations. **Carrier is approved for use.**`,
    },
  };
};

const GET_ETA = (query?: string): CustomerWorkflow => {
  const s = pickShipment(query);
  const ohId = s.id.replace(/[^0-9]/g, "").slice(0, 7);
  return {
    id: "get-eta",
    intentPatterns: ["eta", "when", "arrive", "arrival", "delivery", "how long", "time", "expected"],
    title: "Get Delivery ETA",
    steps: [
      {
        screen: "digital-twin",
        actions: [
          {
            type: "navigate",
            targetLabel: "Digital Twin",
            targetHint: "Nav link",
            durationMs: 900,
            thought: "Opening the Digital Twin map to get real-time position of the shipment.",
          },
          {
            type: "click",
            targetLabel: `Shipment OH-${ohId}`,
            targetHint: "Map marker",
            durationMs: 1000,
            thought: `Located shipment on the map. Calculating remaining distance to ${s.destination}.`,
          },
        ],
        resultSnippet: "Live position acquired",
      },
      {
        screen: "shipment-detail",
        actions: [
          {
            type: "read",
            targetLabel: "ETA panel",
            targetHint: "Delivery estimate",
            durationMs: 1100,
            thought: `Current ETA: ${s.eta}. Checking for delays due to risk factors.`,
          },
          {
            type: "hover",
            targetLabel: "Route timeline",
            targetHint: "Progress tracker",
            durationMs: 800,
            thought: `${s.delayHours > 0 ? `There is a ${s.delayHours}h delay. Updating ETA accordingly.` : "No significant delays detected."}`,
          },
        ],
        resultSnippet: `ETA: ${s.eta}`,
      },
    ],
    finalResult: {
      type: "eta",
      headline: `Delivery ETA — OH-${ohId}`,
      data: {
        "Shipment ID": `OH-${ohId}`,
        "Origin": s.origin,
        "Destination": s.destination,
        "Estimated Arrival": s.eta,
        "Delay": s.delayHours > 0 ? `+${s.delayHours}h` : "None",
        "Last GPS Update": "2 minutes ago",
        "Current Speed": "62 mph",
        "Remaining Distance": `${Math.round(Math.random() * 400 + 100)} miles`,
        "Status": s.delayHours > 0 ? "Delayed" : "On Schedule",
      },
      actions: [
        { label: "Track in Real Time", variant: "primary" },
        { label: "Notify Recipient", variant: "secondary" },
        { label: "Request Updated ETA", variant: "secondary" },
      ],
      message: `Your shipment **OH-${ohId}** carrying ${s.cargo} is estimated to arrive at **${s.destination}** on **${s.eta}**. ${s.delayHours > 0 ? `⚠ Current delay: **${s.delayHours} hours** due to ${s.riskReasons[0]?.toLowerCase() ?? "route conditions"}.` : "✓ The shipment is currently **on schedule** with no significant delays."}`,
    },
  };
};

const INVESTIGATE_CASE = (): CustomerWorkflow => ({
  id: "investigate-case",
  intentPatterns: ["light stop", "investigate", "incident", "call driver", "check risk", "open case"],
  title: "Investigate Light & Stop Alert",
  steps: [
    {
      screen: "home",
      actions: [
        { type: "navigate", targetLabel: "Risk Monitor", durationMs: 800, thought: "Navigating to Risk Monitor to access the active compound case." },
      ],
    },
    {
      screen: "risk-monitor",
      actions: [
        { type: "click", targetLabel: "Weekend transit vulnerability — OH-84764", durationMs: 900, thought: "Selecting the Light & Stop compound alert on shipment OH-84764. Risk score 98+." },
        { type: "click", targetLabel: "Chat with RiskGPT tab", durationMs: 700, thought: "Opening RiskGPT to run an AI risk assessment on this compound event." },
        { type: "type", targetLabel: "Analyze Light & Stop compound case OH-84764", durationMs: 1200, thought: "Asking RiskGPT to assess the combined risk factors for this shipment." },
        { type: "read", targetLabel: "RiskGPT analysis — 98% risk score, 97% theft probability", durationMs: 1600, thought: "Reading assessment: 98% composite risk, 97% theft probability. Weekend transit + route deviation + unauthorized stop potential detected." },
      ],
      resultSnippet: "Risk Score 98% · Theft 97%",
    },
    {
      screen: "case-detail",
      actions: [
        { type: "click", targetLabel: "Open full case — Light & Stop", durationMs: 700, thought: "Opening the detailed investigation panel for the Light & Stop event." },
        { type: "read", targetLabel: "Case timeline — stopped 47 min at São Paulo", durationMs: 1100, thought: "Vehicle stopped at 01:00 AM, 47 minutes with no check-in. Nick Fury assigned. Battery 92%." },
        { type: "click", targetLabel: "Call Driver button", durationMs: 800, thought: "Driver hasn't responded to automated check-in. I'll initiate a direct call now." },
      ],
      resultSnippet: "Initiating driver call…",
    },
    {
      screen: "driver-call",
      actions: [
        { type: "read", targetLabel: "Calling Marcus Vinicius — ringing", durationMs: 2200, thought: "Call connecting… driver picked up after 8 seconds." },
        { type: "read", targetLabel: "Driver confirms routine fuel stop", durationMs: 1800, thought: "Driver confirms: routine fuel stop, no security threat. Will resume in approximately 10 minutes." },
        { type: "click", targetLabel: "End call — mark stop as explained", durationMs: 800, thought: "Call complete. Logging: routine fuel stop confirmed. Updating case status to Explained." },
      ],
      resultSnippet: "Driver reached · Stop explained",
    },
  ],
  finalResult: {
    type: "general",
    headline: "Light & Stop Case Resolved — OH-84764",
    data: {
      "Case Type": "Light & Stop (Compound)",
      "Shipment": "OH-84764",
      "Route": "São Paulo → Chicago, USA",
      "Risk Score": "98% → Explained",
      "Theft Probability": "97%",
      "Driver Reached": "✓ Marcus Vinicius",
      "Call Duration": "4m 32s",
      "Stop Reason": "Routine fuel stop",
      "Resolution": "Explained — no threat",
    },
    actions: [
      { label: "View Case Report", variant: "primary" },
      { label: "Close Alert", variant: "secondary" },
      { label: "Escalate to Ops", variant: "secondary" },
    ],
    message: `Light & Stop compound case for **OH-84764** has been investigated and resolved. Driver **Marcus Vinicius** confirmed a routine fuel stop near São Paulo — **no security threat detected**. Risk score updated: **98% → Explained**.`,
  },
});

export const WORKFLOWS: CustomerWorkflow[] = [
  TRACK_SHIPMENT(),
  FILE_INCIDENT(),
  GET_RISK_REPORT(),
  CHECK_CARRIER(),
  GET_ETA(),
];

export function resolveWorkflow(input: string): CustomerWorkflow {
  const lower = input.toLowerCase();

  if (/light.?stop|investigate|call driver|open case|check risk.*score|incident.*alert/.test(lower)) return INVESTIGATE_CASE();
  if (/incident|file|claim|damaged|stolen|missing|lost/.test(lower)) return FILE_INCIDENT(input);
  if (/risk|report|analysis|assessment|score|safety|danger|threat/.test(lower)) return GET_RISK_REPORT(input);
  if (/carrier|trucker|transport|verify|check carrier|credentials/.test(lower)) return CHECK_CARRIER(input);
  if (/eta|when|arrive|arrival|delivery|how long|expected/.test(lower)) return GET_ETA(input);
  if (/track|where is|locate|status|shipment|cargo|find/.test(lower)) return TRACK_SHIPMENT(input);

  return TRACK_SHIPMENT(input);
}

export const CUSTOMER_SUGGESTIONS = [
  { text: "Where is my shipment?", icon: "📦" },
  { text: "I need to file a damage claim", icon: "📋" },
  { text: "Generate a risk report for my cargo", icon: "📊" },
  { text: "Verify my carrier's credentials", icon: "🔍" },
  { text: "What is the expected delivery time?", icon: "🕐" },
  { text: "My cargo was reported stolen", icon: "🚨" },
];
