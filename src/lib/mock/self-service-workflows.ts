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
  | "search-results";

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

const CHECK_CARRIER = (query?: string): CustomerWorkflow => {
  const carrier = demoData.carriers?.[0] ?? { name: "Swift Logistics", mcNumber: "MC-483921", safetyRating: 4.2, fraudScore: 18, onTimeRate: 94, verified: true };
  const s = pickShipment(query);
  return {
    id: "carrier-info",
    intentPatterns: ["carrier", "driver", "trucker", "transport", "company", "verify", "check carrier"],
    title: "Verify Carrier",
    steps: [
      {
        screen: "risk-monitor",
        actions: [
          {
            type: "navigate",
            targetLabel: "Risk Monitor",
            targetHint: "Nav link",
            durationMs: 900,
            thought: "Navigating to Risk Monitor to access carrier information for this shipment.",
          },
          {
            type: "click",
            targetLabel: `Carrier: ${s.carrierName}`,
            targetHint: "Carrier card",
            durationMs: 800,
            thought: `I can see the carrier is ${s.carrierName}. I'll open the carrier profile.`,
          },
        ],
      },
      {
        screen: "carrier-profile",
        actions: [
          {
            type: "read",
            targetLabel: "Carrier safety rating",
            targetHint: "Rating panel",
            durationMs: 1000,
            thought: `Reading carrier profile: safety rating ${carrier.safetyRating}/5, fraud score ${carrier.fraudScore}%.`,
          },
          {
            type: "read",
            targetLabel: "Compliance & certifications",
            targetHint: "Compliance section",
            durationMs: 1100,
            thought: "Checking MC number verification, FMCSA compliance, and certification status.",
          },
          {
            type: "hover",
            targetLabel: "On-time performance graph",
            targetHint: "Performance chart",
            durationMs: 800,
            thought: `On-time rate: ${carrier.onTimeRate}%. Within acceptable thresholds.`,
          },
        ],
        resultSnippet: `${carrier.name} — ${carrier.verified ? "Verified" : "Unverified"}`,
      },
    ],
    finalResult: {
      type: "carrier-info",
      headline: `Carrier Profile — ${s.carrierName}`,
      data: {
        "Carrier Name": s.carrierName,
        "MC Number": carrier.mcNumber,
        "FMCSA Status": carrier.verified ? "✓ Active & Verified" : "⚠ Pending Review",
        "Safety Rating": `${carrier.safetyRating}/5.0`,
        "Fraud Risk Score": `${carrier.fraudScore}%`,
        "On-Time Rate": `${carrier.onTimeRate}%`,
        "Total Shipments": carrier.totalShipments ?? 847,
        "Insurance": "Valid through Dec 2025",
        "Last Audit": "14 days ago",
      },
      actions: [
        { label: "Download Carrier Report", variant: "primary" },
        { label: "Flag for Review", variant: "secondary" },
        { label: carrier.verified ? "Re-verify Carrier" : "Initiate Verification", variant: carrier.fraudScore > 50 ? "danger" : "secondary" },
      ],
      message: `Carrier **${s.carrierName}** is ${carrier.verified ? "verified and active" : "pending verification"} with a safety rating of **${carrier.safetyRating}/5**. On-time performance: **${carrier.onTimeRate}%**. Fraud risk score: **${carrier.fraudScore}%** (${carrier.fraudScore < 30 ? "Low" : carrier.fraudScore < 60 ? "Medium" : "High"}). ${carrier.fraudScore > 50 ? "⚠ Carrier flagged for enhanced monitoring." : "No fraud flags detected."}`,
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

export const WORKFLOWS: CustomerWorkflow[] = [
  TRACK_SHIPMENT(),
  FILE_INCIDENT(),
  GET_RISK_REPORT(),
  CHECK_CARRIER(),
  GET_ETA(),
];

export function resolveWorkflow(input: string): CustomerWorkflow {
  const lower = input.toLowerCase();

  // Check specific intent patterns
  if (/incident|file|claim|issue|problem|damaged|stolen|missing|lost/.test(lower)) return FILE_INCIDENT(input);
  if (/risk|report|analysis|assessment|score|safety|danger|threat/.test(lower)) return GET_RISK_REPORT(input);
  if (/carrier|driver|trucker|transport|verify|check carrier/.test(lower)) return CHECK_CARRIER(input);
  if (/eta|when|arrive|arrival|delivery|how long|expected/.test(lower)) return GET_ETA(input);
  if (/track|where is|locate|status|shipment|cargo|find/.test(lower)) return TRACK_SHIPMENT(input);

  // Default: track shipment
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
