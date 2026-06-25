// ─── Seeded customer account ─────────────────────────────────────────────────
// A single fictitious customer used consistently across all three modes.

export const CUSTOMER = {
  name: "Nexus Pharma Inc.",
  accountId: "ACC-00423",
  tier: "Enterprise",
  contactEmail: "ops@nexuspharma.com",
};

export const CUSTOMER_SHIPMENTS = [
  {
    id: "SHP-83921",
    ohId: "4839210",
    cargo: "Pharmaceuticals",
    origin: "Chicago, IL",
    destination: "Miami, FL",
    carrier: "Swift Logistics",
    carrierId: "CAR-0012",
    mcNumber: "MC-483921",
    riskScore: 74,
    status: "In Transit",
    eta: "Jun 26, 14:30",
    lastUpdate: "11 min ago",
    coldChain: true,
    temperature: 5.2,
    tempThreshold: "2–8°C",
    hasAlert: true,
    alertType: "Tamper sensor — door event detected",
    routeDeviation: false,
    value: 340000,
  },
  {
    id: "SHP-83944",
    ohId: "4839440",
    cargo: "Medical Devices",
    origin: "Dallas, TX",
    destination: "New York, NY",
    carrier: "Atlas Transport",
    carrierId: "CAR-0031",
    mcNumber: "MC-219047",
    riskScore: 31,
    status: "On Schedule",
    eta: "Jun 26, 09:15",
    lastUpdate: "4 min ago",
    coldChain: false,
    temperature: null,
    tempThreshold: null,
    hasAlert: false,
    alertType: null,
    routeDeviation: false,
    value: 180000,
  },
  {
    id: "SHP-83967",
    ohId: "4839670",
    cargo: "Vaccines",
    origin: "Los Angeles, CA",
    destination: "Seattle, WA",
    carrier: "Pacific Rim Freight",
    carrierId: "CAR-0007",
    mcNumber: "MC-771203",
    riskScore: 52,
    status: "Minor Delay",
    eta: "Jun 27, 08:00",
    lastUpdate: "2 hrs ago",
    coldChain: true,
    temperature: 3.1,
    tempThreshold: "2–8°C",
    hasAlert: false,
    alertType: null,
    routeDeviation: false,
    value: 510000,
  },
];

export const CUSTOMER_STATS = {
  activeShipments: 3,
  openAlerts: 1,
  resolvedThisWeek: 4,
  pendingVerify: 1,
};

// ─── Mode 1 — Help Bot Q&A ───────────────────────────────────────────────────

const HELPBOT_QA: Array<{ patterns: string[]; response: string }> = [
  // Cargo theft & tampering
  {
    patterns: ["flagged", "why flag", "alert", "tamper", "suspicious"],
    response:
      "A shipment is **flagged** when Overhaul's sensors detect activity that falls outside its expected behaviour — for example, a door-open event at an unscheduled stop, a route deviation, or a device going silent.\n\nFlags don't always mean theft has occurred. They mean the system wants a human to verify what happened.\n\nI can't see your live shipment data, but once you're logged in, each flag includes an alert type and a recommended next step.",
  },
  {
    patterns: ["tamper", "tamper alert", "door sensor", "seal"],
    response:
      "A **tamper alert** is triggered when a door, seal, or compartment sensor on the trailer reports an unexpected state change — typically a door opening at a location that isn't a scheduled stop or delivery point.\n\nThis can be caused by a legitimate reason (driver re-securing cargo, a fuel stop) or a genuine threat (cargo theft attempt). Overhaul flags it and asks a human to verify before deciding what to do next.",
  },
  {
    patterns: ["theft", "stolen", "cargo theft", "robbery"],
    response:
      "Cargo theft can happen in several ways: **organised theft** at rest stops, **double-brokering** (load handed to an unknown third party), or **pilferage** during legitimate stops.\n\nOverhaul detects theft-risk signals in real time — route deviations, unauthorised stops, tamper events — and alerts your operations team. If you believe theft has occurred, the right step is to file an incident and contact your carrier immediately.",
  },
  // Fraud & double-brokering
  {
    patterns: ["carrier verification", "verify carrier", "verification flag", "carrier flag"],
    response:
      "A **carrier verification flag** appears when the carrier assigned to your load cannot be fully confirmed against the FMCSA database, or when the carrier's profile data (MC number, insurance, safety rating) doesn't match what was submitted at booking.\n\nThis doesn't always mean fraud — sometimes it's a data entry error. But it warrants checking before the load moves further.",
  },
  {
    patterns: ["unverified", "unverified broker", "broker unverified", "why unverified"],
    response:
      "A broker shows as **unverified** when one or more of these checks hasn't passed:\n\n• MC number not active in FMCSA records\n• Insurance certificate expired or missing\n• Safety rating below acceptable threshold\n• New entity with less than 6 months operating history\n\nAn unverified status means Overhaul can't independently confirm this entity is who they say they are.",
  },
  {
    patterns: ["double broker", "double-broker", "re-broker", "rebroke"],
    response:
      "**Double-brokering** is when the carrier you hired passes your load to a second, unknown carrier without your knowledge or consent. The second carrier may have no insurance, no safety record, or may not exist at all.\n\nOverhaul detects double-brokering by comparing the truck and driver identity at pickup against the carrier's registered profile. A mismatch triggers a fraud flag.",
  },
  // End-to-end visibility
  {
    patterns: ["where is", "location", "where my shipment", "track", "current location"],
    response:
      "Shipment locations are updated approximately every **15 minutes** via GPS pings from the Overhaul device fitted to the trailer.\n\nI don't have access to your live shipment data in this mode, so I can't show you the current position right now. Once you're in your account, the Risk Monitor map shows a live dot for each shipment and its last confirmed coordinates.",
  },
  {
    patterns: ["hasn't updated", "no update", "not updating", "stopped updating", "2 hours", "hours ago"],
    response:
      "If a shipment hasn't updated in a while, there are a few common reasons:\n\n• **Low GPS coverage** — tunnels, remote areas, or dense urban zones can block pings for 1–2 cycles\n• **Device power issue** — trailer battery dipped below threshold\n• **Carrier connectivity** — the device temporarily lost its cellular link\n\nThe system automatically retries every 15 minutes. If a shipment misses three consecutive pings (~45 minutes), Overhaul escalates it to an alert. That doesn't mean something is wrong — it means a human should check.",
  },
  {
    patterns: ["eta", "when", "arrive", "delivery time", "expected"],
    response:
      "ETA estimates are recalculated based on current GPS position, speed, and route conditions. They update with each ping (roughly every 15 minutes).\n\nDelays happen when a shipment slows significantly, makes an unscheduled stop, or deviates from the planned route. In those cases, the ETA stretches automatically and an alert is generated if the delay exceeds your configured threshold.",
  },
  {
    patterns: ["hello", "hi", "hey", "help", "what can you"],
    response:
      "Hi! I'm **Help Bot** — I can answer general questions about how Overhaul works and what common alerts mean.\n\nI'm limited to predefined answers and **don't have access to your shipment data**. For account-specific help, switch to **Navigator** (Mode 2) or **Resolution Agent** (Mode 3).\n\nAsk me about tamper alerts, carrier verification flags, double-brokering, shipment updates, or ETA calculations.",
  },
];

export function getHelpBotResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const qa of HELPBOT_QA) {
    if (qa.patterns.some((p) => lower.includes(p))) return qa.response;
  }
  return "I can answer questions about **tamper alerts**, **cargo theft**, **carrier verification flags**, **double-brokering**, **shipment tracking**, and **ETA updates**.\n\nFor questions about your specific shipments, switch to **Navigator** (Mode 2) or **Resolution Agent** (Mode 3).";
}

export const HELPBOT_SUGGESTIONS = [
  { text: "What does a tamper alert mean?", category: "Cargo Security" },
  { text: "Why was my shipment flagged?", category: "Cargo Security" },
  { text: "What is double-brokering?", category: "Fraud" },
  { text: "What is a carrier verification flag?", category: "Fraud" },
  { text: "Where is my shipment right now?", category: "Visibility" },
  { text: "Why hasn't my shipment updated?", category: "Visibility" },
];

// ─── Mode 2 — Navigator responses ────────────────────────────────────────────

const NAVIGATOR_QA: Array<{ patterns: string[]; response: (s: typeof CUSTOMER_SHIPMENTS[0]) => string }> = [
  {
    patterns: ["flagged", "why flag", "alert", "tamper", "suspicious", "shp-83921", "4839210"],
    response: (s) => `## Alert Explanation — ${s.id}

Your **${s.cargo}** shipment from ${s.origin} to ${s.destination} was flagged at **${new Date().toLocaleTimeString()}** with a **${s.alertType}**.

### What happened
The Overhaul device on the trailer detected a door sensor activation at a location that wasn't a scheduled stop. This is classified as a **Level 2 Tamper Event** — it warrants investigation but doesn't automatically indicate cargo loss.

### Context from your shipment
- Carrier: **${s.carrier}** (${s.mcNumber})
- Last confirmed location: I-65 corridor, near Indianapolis, IN
- Cold chain status: Temperature **${s.temperature}°C** — within threshold (${s.tempThreshold}) ✓
- Route: **On planned route** — no deviation detected alongside the tamper event

### What this likely means
A door event without a route deviation most commonly means the driver made an unscheduled rest stop and opened the trailer to inspect cargo, or there was a minor sensor misfire. The temperature being within range is a positive signal.

### What you can do
1. **Contact ${s.carrier} dispatch** and ask the driver to confirm the stop reason
2. If no response within 30 minutes, **escalate to Overhaul operations**
3. Switch to **Resolution Agent** (Mode 3) — it can run this investigation and send the carrier alert automatically`,
  },
  {
    patterns: ["carrier", "verify", "verification", "swift logistics", "mc-483921", "car-0012"],
    response: (s) => `## Carrier Profile — ${s.carrier}

Your shipment ${s.id} is being carried by **${s.carrier}** (${s.mcNumber}).

### Verification Status
- ✅ **FMCSA Active** — MC number confirmed, authority active
- ✅ **Insurance current** — valid through December 2026
- ✅ **Safety rating: 4.2 / 5** — above Overhaul's 3.5 minimum threshold
- ✅ **On-time rate: 91%** — based on last 200 shipments

### Fraud Signals
No active fraud flags on this carrier. Last Overhaul audit: **14 days ago**.

### One note
The tamper event on your current shipment is logged against this carrier's record. If the driver confirms it was a legitimate stop, it stays informational. If unresolved, it will lower their trust score by approximately 2 points.

**Recommendation:** Contact carrier dispatch to get a driver explanation. If confirmed legitimate, no further action needed on the carrier side.`,
  },
  {
    patterns: ["all shipments", "status", "overview", "summary", "my shipments", "what's happening"],
    response: (_s) => `## Your Shipments — Live Overview
*Account: ${CUSTOMER.name} · ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}*

${CUSTOMER_SHIPMENTS.map((ship, i) => `### ${i + 1}. ${ship.id} — ${ship.cargo}
- **Route:** ${ship.origin} → ${ship.destination}
- **Status:** ${ship.status} · ETA ${ship.eta}
- **Risk:** ${ship.riskScore}% · Last update: ${ship.lastUpdate}${ship.hasAlert ? `\n- ⚠️ **Alert:** ${ship.alertType}` : "\n- ✅ No active alerts"}${ship.coldChain ? `\n- ❄️ Temperature: ${ship.temperature}°C (threshold ${ship.tempThreshold})` : ""}`).join("\n\n")}

### Summary
- **1 shipment needs attention** — SHP-83921 has an unresolved tamper event
- **2 shipments on track** — SHP-83944 and SHP-83967 are operating normally
- **Total cargo value monitored:** $${((CUSTOMER_SHIPMENTS.reduce((sum, s) => sum + s.value, 0)) / 1000000).toFixed(1)}M

**Recommendation:** Resolve the tamper alert on SHP-83921 first. Switch to **Resolution Agent** to handle it autonomously.`,
  },
  {
    patterns: ["temperature", "cold chain", "temp", "vaccine", "pharma"],
    response: (_s) => `## Cold Chain Status — Your Shipments

${CUSTOMER_SHIPMENTS.filter((s) => s.coldChain).map((s) => `### ${s.id} — ${s.cargo}
- **Current temperature:** ${s.temperature}°C
- **Threshold:** ${s.tempThreshold}
- **Status:** ${(s.temperature ?? 0) <= 8 && (s.temperature ?? 0) >= 2 ? "✅ Within range" : "🔴 EXCURSION — action required"}
- **Value at risk if excursion:** $${(s.value / 1000).toFixed(0)}K`).join("\n\n")}

### What to watch
Both cold-chain shipments are currently within threshold. The SHP-83967 (Vaccines) temperature of **3.1°C** is closer to the lower bound — worth monitoring over the next few hours as it enters the Pacific Northwest corridor.

**Tip:** Overhaul sends an automatic alert if temperature drifts outside threshold for more than 15 consecutive minutes. You don't need to monitor manually.`,
  },
  {
    patterns: ["double broker", "fraud", "fake", "suspicious carrier"],
    response: (_s) => `## Fraud Risk Assessment — Your Account

### Current Fraud Signals
No active fraud flags on any of your ${CUSTOMER_SHIPMENTS.length} shipments.

### How Overhaul checks for double-brokering
At pickup, the driver's identity and truck plate are compared against the carrier's registered profile. A mismatch triggers a **Level 3 Fraud Alert** — the load is held until a human confirms the identity.

### Your carrier risk summary
| Carrier | Shipment | Fraud Score | Status |
|---|---|---|---|
| ${CUSTOMER_SHIPMENTS[0].carrier} | SHP-83921 | 18% (Low) | ✅ Verified |
| ${CUSTOMER_SHIPMENTS[1].carrier} | SHP-83944 | 12% (Low) | ✅ Verified |
| ${CUSTOMER_SHIPMENTS[2].carrier} | SHP-83967 | 24% (Low) | ✅ Verified |

All three carriers have passed current verification checks. No double-brokering signals detected.

**Recommendation:** If you ever receive a call from an unknown party claiming to be your carrier, verify them by calling the MC number on file — not the number they give you.`,
  },
  {
    patterns: ["eta", "when", "arrive", "delivery", "delayed", "delay"],
    response: (_s) => `## Delivery ETA — All Shipments

${CUSTOMER_SHIPMENTS.map((s) => `**${s.id}** (${s.cargo})
→ ${s.destination} · ETA **${s.eta}** · ${s.status}${s.status === "Minor Delay" ? " — approximately 1 hour behind original schedule" : ""}`).join("\n\n")}

### SHP-83967 Delay Note
The Los Angeles → Seattle shipment is running about **1 hour late** due to slower-than-expected progress through the Central Valley. No safety concerns — this is a pace issue, not a risk event. ETA has been recalculated to Jun 27, 08:00.

**Automatic notification:** Your configured ETA alert threshold is ±2 hours. The current delay is within threshold and won't trigger an automatic notification to your recipient.`,
  },
  {
    patterns: ["help", "what can you", "capabilities"],
    response: (_s) => `## Navigator — What I Can Do

I have access to your **${CUSTOMER.name}** account data and can explain anything happening across your shipments.

### Try asking me:
- *"Why was SHP-83921 flagged?"* — I'll explain the tamper alert in detail
- *"Give me a status overview"* — All 3 shipments at a glance
- *"Is my carrier verified?"* — I'll pull the carrier profile
- *"Cold chain status?"* — Temperature readings for cold-chain loads
- *"Am I at risk of double-brokering?"* — Fraud risk summary
- *"When will my shipments arrive?"* — ETA breakdown

### What I can't do
I generate explanations and recommendations — I don't take actions on your behalf. To resolve alerts, send carrier notifications, or escalate issues automatically, switch to **Resolution Agent** (Mode 3).`,
  },
];

export function getNavigatorResponse(input: string): string {
  const lower = input.toLowerCase();
  const primaryShipment = CUSTOMER_SHIPMENTS[0]; // the flagged one, most relevant
  for (const qa of NAVIGATOR_QA) {
    if (qa.patterns.some((p) => lower.includes(p))) {
      return qa.response(primaryShipment);
    }
  }
  return getNavigatorResponse("what can you");
}

export const NAVIGATOR_SUGGESTIONS = [
  { text: "Why was SHP-83921 flagged?", icon: "⚠️" },
  { text: "Give me a status overview", icon: "📦" },
  { text: "Is my carrier verified?", icon: "🔍" },
  { text: "Cold chain status?", icon: "❄️" },
  { text: "Am I at risk of fraud?", icon: "🛡️" },
  { text: "When will my shipments arrive?", icon: "🕐" },
];

// ─── Mode 3 — Resolution Agent investigations ─────────────────────────────────

export type AutonomyTag = "auto" | "approval" | "escalated";

export interface AgentAction {
  id: string;
  tool: string;
  toolLabel: string;
  thought: string;
  durationMs: number;
  resultText: string;
  autonomyTag: AutonomyTag;
  // For "approval" actions
  proposedAction?: string;
  approveLabel?: string;
  declineLabel?: string;
  approvedOutcome?: string;
  declinedOutcome?: string;
  // For "escalated" actions
  escalationReason?: string;
  escalationNextSteps?: string[];
  escalationEta?: string;
}

export interface ResolutionPlan {
  step: string;
  description: string;
}

export interface ResolutionInvestigation {
  id: string;
  goalLabel: string;
  plans: ResolutionPlan[];
  actions: AgentAction[];
  summary: string;
}

// ── Investigation 1: Tamper alert on SHP-83921 ───────────────────────────────
const INVESTIGATION_TAMPER: ResolutionInvestigation = {
  id: "inv-tamper",
  goalLabel: "Investigate the tamper alert on my shipment",
  plans: [
    { step: "Retrieve Shipment Data", description: "Pull current status, location, and sensor logs for SHP-83921" },
    { step: "Analyse Sensor Event", description: "Examine the door-sensor event timeline and GPS context" },
    { step: "Re-ping Device", description: "Send a fresh ping to confirm device and sensor state" },
    { step: "Check Carrier Profile", description: "Review Swift Logistics trust score and contact details" },
    { step: "Send Carrier Alert", description: "Notify carrier dispatch to obtain driver explanation" },
    { step: "Assess Resolution", description: "Determine if auto-close or human review is required" },
  ],
  actions: [
    {
      id: "a1",
      tool: "shipment_service",
      toolLabel: "Shipment Service",
      thought: "Pulling the full record for SHP-83921 including sensor event log.",
      durationMs: 1200,
      resultText: "SHP-83921 retrieved. Door sensor event logged at 11:42 AM at coordinates 39.7°N, 86.1°W (I-65 near Indianapolis). Route deviation: none. Temperature: 5.2°C — within threshold.",
      autonomyTag: "auto",
    },
    {
      id: "a2",
      tool: "sensor_analyser",
      toolLabel: "Sensor Analyser",
      thought: "Checking whether the sensor event correlates with a known rest stop or fuel station at that location.",
      durationMs: 1600,
      resultText: "Event location cross-referenced with known truck stops. A Pilot Flying J is located 0.3 miles from the event coordinates. Event duration: 18 minutes. Pattern is consistent with a driver rest stop.",
      autonomyTag: "auto",
    },
    {
      id: "a3",
      tool: "device_ping",
      toolLabel: "Device Ping",
      thought: "Re-pinging the device to confirm sensor is functioning correctly and cargo compartment is secured.",
      durationMs: 1400,
      resultText: "Device responded in 4.2 seconds. Door sensor now reads CLOSED and secured. Backup sensor confirms same state. No ongoing anomaly.",
      autonomyTag: "auto",
    },
    {
      id: "a4",
      tool: "carrier_intelligence",
      toolLabel: "Carrier Intelligence",
      thought: "Reviewing Swift Logistics trust score before deciding whether to escalate to dispatch.",
      durationMs: 1100,
      resultText: "Swift Logistics: Safety 4.2/5, Fraud score 18% (Low), On-time 91%. No prior tamper incidents. Dispatch contact: verified.",
      autonomyTag: "auto",
    },
    {
      id: "a5",
      tool: "notification_service",
      toolLabel: "Notification Service",
      thought: "I should send a carrier alert so there's a documented record — even though the sensor data looks benign, protocol requires carrier confirmation.",
      durationMs: 900,
      resultText: "Automated alert ready to send to Swift Logistics dispatch requesting driver confirmation of the 11:42 AM stop.",
      autonomyTag: "approval",
      proposedAction: "Send an automated alert to Swift Logistics dispatch requesting written confirmation of the rest stop at 11:42 AM. This creates a documented record for your records.",
      approveLabel: "Send Alert",
      declineLabel: "Skip — I'll call them",
      approvedOutcome: "Alert sent to Swift Logistics dispatch. Confirmation request logged. You'll receive a notification when they respond (typically within 30 minutes).",
      declinedOutcome: "Alert skipped. Please contact Swift Logistics at MC-483921 directly. Remember to request written confirmation for your records.",
    },
    {
      id: "a6",
      tool: "alert_manager",
      toolLabel: "Alert Manager",
      thought: "Based on all evidence — known rest stop location, sensor re-secured, device responsive, low-fraud carrier — this tamper event is classifiable as a benign driver stop. Recommending auto-close.",
      durationMs: 800,
      resultText: "Alert SHP-83921-T1 assessed as LOW risk. Recommended disposition: close with note pending carrier confirmation.",
      autonomyTag: "auto",
    },
  ],
  summary: "The tamper event on **SHP-83921** is consistent with a routine driver rest stop at a known truck stop on I-65 near Indianapolis. The door sensor has re-secured, the device is responsive, and cargo temperature remains within threshold. A carrier alert has been sent for documentation.",
};

// ── Investigation 2: Carrier seems suspicious ────────────────────────────────
const INVESTIGATION_FRAUD: ResolutionInvestigation = {
  id: "inv-fraud",
  goalLabel: "I think my carrier might be fraudulent",
  plans: [
    { step: "Identify Shipment & Carrier", description: "Locate the shipment and carrier in question" },
    { step: "FMCSA Verification", description: "Cross-reference MC number against live FMCSA records" },
    { step: "Identity Match Check", description: "Compare pickup driver and truck against registered profile" },
    { step: "Fraud Pattern Analysis", description: "Scan for known double-brokering patterns" },
    { step: "Submit Fraud Flag", description: "Decide whether to formally flag this carrier" },
    { step: "Notify Insurer", description: "Assess whether insurance notification is warranted" },
  ],
  actions: [
    {
      id: "f1",
      tool: "shipment_service",
      toolLabel: "Shipment Service",
      thought: "Pulling all three of the customer's shipments to identify which carrier they're concerned about.",
      durationMs: 1100,
      resultText: `Found 3 active shipments. Carriers: Swift Logistics (SHP-83921), Atlas Transport (SHP-83944), Pacific Rim Freight (SHP-83967).`,
      autonomyTag: "auto",
    },
    {
      id: "f2",
      tool: "fmcsa_lookup",
      toolLabel: "FMCSA Verification",
      thought: "Running MC numbers for all three carriers against the FMCSA active authority database.",
      durationMs: 2000,
      resultText: "Swift Logistics MC-483921: ✅ Active authority. Atlas Transport MC-219047: ✅ Active authority. Pacific Rim Freight MC-771203: ⚠️ Authority shows INACTIVE as of 14 days ago — may be a database lag or lapse.",
      autonomyTag: "auto",
    },
    {
      id: "f3",
      tool: "identity_matcher",
      toolLabel: "Identity Matcher",
      thought: "Pacific Rim Freight has a flag — let me check whether the driver and truck at pickup matched their registered profile for SHP-83967.",
      durationMs: 1800,
      resultText: "SHP-83967 pickup: Driver ID matched. Truck plate CA-4839X matched to Pacific Rim Freight's registered fleet. No identity mismatch. FMCSA lag is likely a renewal in progress.",
      autonomyTag: "auto",
    },
    {
      id: "f4",
      tool: "fraud_pattern_engine",
      toolLabel: "Fraud Pattern Engine",
      thought: "Running the route history and communication patterns against known double-brokering signatures.",
      durationMs: 2200,
      resultText: "No double-brokering patterns detected. All three carriers have maintained consistent GPS trail, driver communication, and identity across their current loads. Fraud probability: 9% (Low).",
      autonomyTag: "auto",
    },
    {
      id: "f5",
      tool: "carrier_flag_service",
      toolLabel: "Carrier Flag Service",
      thought: "The FMCSA inactive status on Pacific Rim Freight is a data discrepancy that should be logged — even though the identity match was clean. This is a medium-risk flag that requires customer sign-off before submission.",
      durationMs: 900,
      resultText: "Flag ready: Pacific Rim Freight (MC-771203) — authority status discrepancy. Submitting this flag notifies Overhaul fraud operations and is logged against the carrier's profile.",
      autonomyTag: "approval",
      proposedAction: "Submit a low-priority carrier flag for Pacific Rim Freight noting the FMCSA authority status discrepancy. This does NOT stop your shipment — it opens a 48-hour verification window. Overhaul operations will contact the carrier directly.",
      approveLabel: "Submit Flag",
      declineLabel: "Don't flag — I trust them",
      approvedOutcome: "Flag submitted. Pacific Rim Freight has been placed on a 48-hour verification watch. Your SHP-83967 will continue uninterrupted. Overhaul operations will update you within 24 hours.",
      declinedOutcome: "No flag submitted. Pacific Rim Freight will continue as verified. You can re-submit a flag at any time from your account if concerns arise.",
    },
    {
      id: "f6",
      tool: "insurance_notifier",
      toolLabel: "Insurance Notifier",
      thought: "SHP-83967 carries $510K in vaccine cargo. If fraud were confirmed, insurance notification would be required within 24 hours. This is a financial and legal step — I cannot auto-send this, it must be initiated by the customer or their broker.",
      durationMs: 1000,
      resultText: "Insurance notification assessment: Not required at this stage — no confirmed fraud. If fraud is confirmed following carrier flag investigation, a formal notification to your policy holder must be initiated by your team within 24 hours per policy terms.",
      autonomyTag: "escalated",
      escalationReason: "Initiating an insurance notification is a legally consequential action that requires your direct authorisation and cannot be automated — even in Resolution Agent mode.",
      escalationNextSteps: [
        "If the carrier flag investigation confirms fraud, your team must notify your insurer within 24 hours",
        "Your Overhaul account manager can provide a pre-filled incident letter",
        "Contact your broker at the number on file — they have a direct Overhaul liaison",
      ],
      escalationEta: "A specialist from Overhaul Fraud Operations will contact you within 2 hours if the flag escalates.",
    },
  ],
  summary: "No active fraud confirmed across your shipments. A minor **FMCSA status discrepancy** was found for Pacific Rim Freight on SHP-83967 — a carrier flag has been submitted for verification. All drivers and trucks matched at pickup. Fraud probability remains low.",
};

// ── Investigation 3: Shipment hasn't updated ─────────────────────────────────
const INVESTIGATION_OFFLINE: ResolutionInvestigation = {
  id: "inv-offline",
  goalLabel: "My shipment hasn't updated in 2 hours",
  plans: [
    { step: "Identify Affected Shipment", description: "Find which shipment has the longest gap since last ping" },
    { step: "Device Ping Retry", description: "Send immediate ping via primary and backup channels" },
    { step: "Check Coverage Area", description: "Verify whether the current location has GPS/cellular coverage" },
    { step: "Carrier Communication", description: "Attempt contact via carrier dispatch" },
    { step: "Assess Escalation", description: "Determine if this needs specialist intervention" },
  ],
  actions: [
    {
      id: "o1",
      tool: "shipment_service",
      toolLabel: "Shipment Service",
      thought: "Checking all three shipments to find which one hasn't updated recently.",
      durationMs: 1000,
      resultText: "SHP-83921: last update 11 min ago ✓. SHP-83944: last update 4 min ago ✓. SHP-83967: last update 2 hrs 14 min ago — this is the delayed shipment.",
      autonomyTag: "auto",
    },
    {
      id: "o2",
      tool: "device_ping",
      toolLabel: "Device Ping (Primary)",
      thought: "Sending a forced ping to SHP-83967's device via primary cellular channel.",
      durationMs: 1600,
      resultText: "Primary channel: No response after 3 attempts (60 second timeout). Device may be in a low-coverage zone or powered down.",
      autonomyTag: "auto",
    },
    {
      id: "o3",
      tool: "device_ping_backup",
      toolLabel: "Device Ping (Backup Channel)",
      thought: "Trying the satellite backup channel — this works in areas where cellular is unavailable.",
      durationMs: 2000,
      resultText: "Backup satellite ping: Device responded. Last confirmed coordinates: 37.4°N, 120.8°W — CA State Route 99, Merced County. Timestamp: 14 minutes ago. Device battery: 84%. Cargo temperature: 3.1°C — within threshold.",
      autonomyTag: "auto",
    },
    {
      id: "o4",
      tool: "coverage_check",
      toolLabel: "Coverage Analyser",
      thought: "Merced County on CA-99 has known cellular dead zones. Let me confirm the device is just in a coverage gap.",
      durationMs: 1200,
      resultText: "CA Route 99 between Merced and Fresno has documented cellular dead zones spanning 40–60 miles. SHP-83967's position falls within this zone. Expected reconnection: 45–90 minutes as the truck continues south.",
      autonomyTag: "auto",
    },
    {
      id: "o5",
      tool: "notification_service",
      toolLabel: "Notification Service",
      thought: "I can automatically send a status update to the consignee so they aren't worried about the silence. This is a low-risk action but still sends a message on the customer's behalf.",
      durationMs: 800,
      resultText: "Draft notification ready: 'SHP-83967 is progressing normally through a known low-coverage zone on CA-99. Last confirmed at 37.4°N, 120.8°W. ETA remains Jun 27, 08:00.' Send to consignee?",
      autonomyTag: "approval",
      proposedAction: "Send a proactive status update to your consignee in Seattle letting them know the shipment is in a coverage gap and ETA is unchanged. This prevents a 'where is our delivery?' call.",
      approveLabel: "Send Update",
      declineLabel: "No thanks",
      approvedOutcome: "Update sent to consignee. They've been notified that SHP-83967 is in a coverage zone and ETA remains Jun 27, 08:00. You'll receive a delivery confirmation when the device reconnects.",
      declinedOutcome: "No notification sent. The consignee may reach out to you directly. The shipment is on track — ETA Jun 27, 08:00.",
    },
  ],
  summary: "**SHP-83967** (Vaccines, LA → Seattle) is in a **known cellular dead zone** on CA Route 99 in Merced County. The satellite backup channel confirmed the device is active, cargo temperature is within range at 3.1°C, and ETA is unchanged at Jun 27, 08:00. Expected reconnection in 45–90 minutes.",
};

// ── Investigation 4: General risk check ──────────────────────────────────────
const INVESTIGATION_RISK_CHECK: ResolutionInvestigation = {
  id: "inv-risk",
  goalLabel: "Check the risk status of all my shipments",
  plans: [
    { step: "Retrieve All Shipments", description: "Pull current status for all 3 active shipments" },
    { step: "Risk Score Assessment", description: "Evaluate composite risk for each shipment" },
    { step: "Alert Triage", description: "Prioritise any open alerts by urgency" },
    { step: "Auto-resolve Low-Risk Items", description: "Close items that don't need human attention" },
    { step: "Flag Items Needing Review", description: "Surface anything that needs customer decision" },
  ],
  actions: [
    {
      id: "r1",
      tool: "shipment_service",
      toolLabel: "Shipment Service",
      thought: "Pulling all three shipments for Nexus Pharma Inc.",
      durationMs: 1100,
      resultText: `All 3 shipments retrieved. SHP-83921: Risk 74% (1 open alert). SHP-83944: Risk 31% (clear). SHP-83967: Risk 52% (minor delay, coverage gap).`,
      autonomyTag: "auto",
    },
    {
      id: "r2",
      tool: "risk_calculator",
      toolLabel: "Risk Calculator",
      thought: "Running composite risk scores and comparing against Nexus Pharma's configured thresholds.",
      durationMs: 1500,
      resultText: "SHP-83921 (74%): Above 70% alert threshold — tamper event unresolved. SHP-83944 (31%): Below threshold — clear. SHP-83967 (52%): Below 70% threshold — coverage gap noted but within acceptable range.",
      autonomyTag: "auto",
    },
    {
      id: "r3",
      tool: "alert_manager",
      toolLabel: "Alert Manager",
      thought: "SHP-83944 and SHP-83967 have no open alerts requiring human intervention. I can acknowledge these automatically.",
      durationMs: 900,
      resultText: "SHP-83944: auto-acknowledged (risk clear, no alerts). SHP-83967: coverage gap logged as informational (not an alert-level event).",
      autonomyTag: "auto",
    },
    {
      id: "r4",
      tool: "escalation_service",
      toolLabel: "Enhanced Monitoring",
      thought: "SHP-83921 at 74% with an unresolved tamper event is above threshold. I can enable enhanced 5-minute pings on this shipment, but that increases data costs slightly — the customer should decide.",
      durationMs: 1000,
      resultText: "Enhanced monitoring available for SHP-83921: ping frequency increases from 15 min to 5 min for the next 4 hours. Estimated additional cost: $4. Recommended given open tamper event.",
      autonomyTag: "approval",
      proposedAction: "Enable enhanced 5-minute GPS pings on SHP-83921 for the next 4 hours. This gives you faster situational awareness while the tamper event is being resolved. Standard pings resume automatically after 4 hours.",
      approveLabel: "Enable Enhanced Pings",
      declineLabel: "Keep Standard Pings",
      approvedOutcome: "Enhanced pings enabled on SHP-83921. You'll now see a location update every 5 minutes until 6:30 PM. Pings revert to 15 minutes automatically after that.",
      declinedOutcome: "Standard 15-minute pings continue. You'll receive an alert if any new events are detected on SHP-83921.",
    },
    {
      id: "r5",
      tool: "cold_chain_monitor",
      toolLabel: "Cold Chain Monitor",
      thought: "Both cold-chain shipments are within temperature range. Logging this as a routine check — no action required.",
      durationMs: 800,
      resultText: "SHP-83921 temperature: 5.2°C (threshold 2–8°C) ✅. SHP-83967 temperature: 3.1°C (threshold 2–8°C) ✅. No cold-chain intervention required.",
      autonomyTag: "auto",
    },
  ],
  summary: "**2 of 3 shipments are clear.** SHP-83921 is at elevated risk (74%) due to the unresolved tamper event — enhanced monitoring has been enabled if you approved it. Cold-chain readings are within threshold on both temperature-sensitive loads.",
};

export const RESOLUTION_INVESTIGATIONS: ResolutionInvestigation[] = [
  INVESTIGATION_TAMPER,
  INVESTIGATION_FRAUD,
  INVESTIGATION_OFFLINE,
  INVESTIGATION_RISK_CHECK,
];

export const RESOLUTION_PRESET_GOALS = [
  { label: "Investigate the tamper alert on my shipment", investigationId: "inv-tamper" },
  { label: "I think my carrier might be fraudulent", investigationId: "inv-fraud" },
  { label: "My shipment hasn't updated in 2 hours", investigationId: "inv-offline" },
  { label: "Check the risk status of all my shipments", investigationId: "inv-risk" },
];

export function getResolutionInvestigation(goal: string): ResolutionInvestigation {
  const lower = goal.toLowerCase();
  if (/tamper|flagged|flag|door|sensor|alert/.test(lower)) return INVESTIGATION_TAMPER;
  if (/fraud|fake|suspicious|carrier|double.?broker|broker/.test(lower)) return INVESTIGATION_FRAUD;
  if (/update|updated|offline|no ping|hasn't|2 hour|coverage/.test(lower)) return INVESTIGATION_OFFLINE;
  return INVESTIGATION_RISK_CHECK;
}
