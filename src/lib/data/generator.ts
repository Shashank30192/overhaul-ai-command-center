import type {
  Carrier,
  ColdChainIncident,
  FraudCase,
  FraudType,
  IncidentReport,
  Location,
  LocationType,
  RiskHotspot,
  RiskCategory,
  Shipment,
  ShipmentStatus,
} from "@/lib/types";
import {
  CARGO_TYPES,
  CARRIER_NAMES,
  CITIES,
  FRAUD_EVIDENCE,
  RISK_REASONS,
} from "./constants";
import { seededRandom } from "@/lib/utils";

const rand = seededRandom(42);

function randomInt(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number) {
  return rand() * (max - min) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rand() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

const LOCATION_TYPES: LocationType[] = [
  "warehouse", "port", "distribution_center", "truck", "container", "ship", "air_cargo",
];

const FRAUD_TYPES: FraudType[] = [
  "double_brokering", "carrier_identity_fraud", "fake_pod", "invoice_fraud", "insurance_fraud",
];

const RISK_CATEGORIES: RiskCategory[] = ["theft", "fraud", "weather", "political", "disruption"];

const STATUSES: ShipmentStatus[] = ["in_transit", "delivered", "delayed", "at_risk", "intercepted"];

export function generateCarriers(): Carrier[] {
  return CARRIER_NAMES.map((name, i) => ({
    id: `CAR-${String(i + 1).padStart(4, "0")}`,
    name,
    mcNumber: `MC-${randomInt(100000, 999999)}`,
    safetyRating: Math.round(randomFloat(2.5, 5) * 10) / 10,
    fraudScore: Math.round(randomFloat(5, 95)),
    onTimeRate: Math.round(randomFloat(78, 99)),
    totalShipments: randomInt(50, 2500),
    verified: rand() > 0.15,
  }));
}

export function generateLocations(): Location[] {
  const locations: Location[] = [];
  for (let i = 0; i < 100; i++) {
    const city = CITIES[i % CITIES.length];
    const offset = randomFloat(-0.5, 0.5);
    locations.push({
      id: `LOC-${String(i + 1).padStart(4, "0")}`,
      name: `${city.city} ${pick(LOCATION_TYPES).replace("_", " ")}`,
      type: pick(LOCATION_TYPES),
      lat: city.lat + offset,
      lng: city.lng + offset,
      city: city.city,
      country: city.country,
      riskScore: Math.round(randomFloat(10, 95)),
    });
  }
  return locations;
}

export function generateShipments(carriers: Carrier[]): Shipment[] {
  const shipments: Shipment[] = [];
  for (let i = 0; i < 500; i++) {
    const origin = pick(CITIES);
    let dest = pick(CITIES);
    while (dest.city === origin.city) dest = pick(CITIES);
    const carrier = pick(carriers);
    const riskScore = Math.round(randomFloat(8, 98));
    const theftProbability = Math.min(99, Math.round(riskScore * randomFloat(0.7, 1.1)));
    const coldChain = rand() > 0.7;
    const routeDeviation = rand() > 0.85;
    const unauthorizedStop = rand() > 0.88;
    const delayHours = rand() > 0.7 ? randomInt(1, 48) : 0;
    let status: ShipmentStatus = pick(STATUSES);
    if (riskScore > 80) status = rand() > 0.5 ? "at_risk" : "in_transit";
    if (delayHours > 12) status = "delayed";

    const reasons = pickN(RISK_REASONS, randomInt(2, 4));
    if (routeDeviation && !reasons.includes("Driver route deviation")) reasons.push("Driver route deviation");
    if (unauthorizedStop && !reasons.includes("Unauthorized stop")) reasons.push("Unauthorized stop");

    const progress = randomFloat(0.1, 0.9);
    shipments.push({
      id: `${origin.city.slice(0, 2).toUpperCase()}-${randomInt(10000, 99999)}`,
      origin: `${origin.city}, ${origin.country}`,
      destination: `${dest.city}, ${dest.country}`,
      originLat: origin.lat,
      originLng: origin.lng,
      destLat: dest.lat,
      destLng: dest.lng,
      cargo: pick(CARGO_TYPES),
      cargoValue: Math.round(randomFloat(50000, 2500000)),
      carrierId: carrier.id,
      carrierName: carrier.name,
      status,
      riskScore,
      theftProbability,
      eta: new Date(Date.now() + randomInt(1, 14) * 86400000).toISOString(),
      currentLat: origin.lat + (dest.lat - origin.lat) * progress,
      currentLng: origin.lng + (dest.lng - origin.lng) * progress,
      routeDeviation,
      unauthorizedStop,
      temperature: coldChain ? randomFloat(-2, 8) : undefined,
      coldChain,
      delayHours,
      riskReasons: reasons,
      recommendedAction:
        riskScore > 85
          ? "Dispatch security intervention"
          : riskScore > 60
            ? "Increase monitoring frequency"
            : "Continue standard monitoring",
    });
  }
  return shipments.sort((a, b) => b.riskScore - a.riskScore);
}

export function generateFraudCases(shipments: Shipment[]): FraudCase[] {
  const cases: FraudCase[] = [];
  const highRisk = shipments.filter((s) => s.riskScore > 50);
  for (let i = 0; i < 32; i++) {
    const shipment = pick(highRisk);
    const type = pick(FRAUD_TYPES);
    cases.push({
      id: `FRD-${String(i + 1).padStart(4, "0")}`,
      type,
      shipmentId: shipment.id,
      carrierName: shipment.carrierName,
      fraudScore: Math.round(randomFloat(55, 99)),
      detectedAt: new Date(Date.now() - randomInt(1, 14) * 86400000).toISOString(),
      status: pick(["investigating", "confirmed", "resolved", "dismissed"] as const),
      evidence: pickN(FRAUD_EVIDENCE, randomInt(3, 5)),
      riskFactors: pickN(RISK_REASONS, randomInt(2, 4)),
      recommendedActions: [
        "Suspend carrier pending investigation",
        "Verify MC/DOT credentials with FMCSA",
        "Request original POD and compare signatures",
        "Place shipment on fraud watch list",
      ].slice(0, randomInt(2, 4)),
      financialExposure: Math.round(randomFloat(10000, 500000)),
    });
  }
  return cases.sort((a, b) => b.fraudScore - a.fraudScore);
}

export function generateRiskHotspots(): RiskHotspot[] {
  const hotspots: RiskHotspot[] = [];
  const labels: Record<RiskCategory, string[]> = {
    theft: ["Cargo Theft Corridor", "Truck Stop Hotspot", "Parking Lot Target Zone"],
    fraud: ["Double Brokering Hub", "Fake Carrier Cluster", "Document Fraud Zone"],
    weather: ["Hurricane Path", "Flood Risk Area", "Winter Storm Corridor"],
    political: ["Border Protest Zone", "Trade Sanction Region", "Customs Delay Area"],
    disruption: ["Port Congestion", "Rail Bottleneck", "Labor Strike Zone"],
  };
  for (let i = 0; i < 80; i++) {
    const city = pick(CITIES);
    const category = pick(RISK_CATEGORIES);
    hotspots.push({
      id: `HS-${String(i + 1).padStart(4, "0")}`,
      lat: city.lat + randomFloat(-1, 1),
      lng: city.lng + randomFloat(-1, 1),
      category,
      intensity: Math.round(randomFloat(30, 100)),
      label: pick(labels[category]),
      region: `${city.city}, ${city.country}`,
    });
  }
  return hotspots;
}

export function generateColdChainIncidents(shipments: Shipment[]): ColdChainIncident[] {
  return shipments
    .filter((s) => s.coldChain)
    .slice(0, 25)
    .map((s, i) => ({
      id: `CC-${String(i + 1).padStart(4, "0")}`,
      shipmentId: s.id,
      cargo: s.cargo,
      predictedExcursion: rand() > 0.6,
      currentTemp: s.temperature ?? randomFloat(-2, 8),
      threshold: 4,
      probability: Math.round(randomFloat(20, 95)),
      eta: s.eta,
    }));
}

export function generateIncidentReport(shipment: Shipment): IncidentReport {
  return {
    id: `INC-${randomInt(1000, 9999)}`,
    shipmentId: shipment.id,
    alertType: shipment.riskScore > 80 ? "High Theft Risk Alert" : "Route Deviation Alert",
    triggeredAt: new Date().toISOString(),
    rootCause:
      shipment.routeDeviation
        ? "Unauthorized route deviation detected — driver exited designated corridor near known theft hotspot"
        : "Extended unauthorized stop in high-crime zone without dispatch notification",
    gpsAnalysis: `GPS telemetry shows ${shipment.routeDeviation ? "14.2 mile deviation" : "47-minute stop"} at coordinates (${shipment.currentLat.toFixed(4)}, ${shipment.currentLng.toFixed(4)}). Pattern matches 3 prior incidents in this corridor over past 90 days.`,
    driverAnalysis: `Driver behavior score dropped 34% in past 2 hours. Unusual stop frequency (+180%) compared to baseline. HOS compliance: nominal. Communication response time: delayed 23 minutes.`,
    documentAnalysis: `BOL verified authentic. Carrier MC# cross-referenced — ${shipment.carrierName} authority active. Insurance certificate valid through Q4. No document anomalies detected.`,
    summary: `Shipment ${shipment.id} (${shipment.cargo}, ${shipment.origin} → ${shipment.destination}) flagged for ${shipment.riskReasons.join(", ").toLowerCase()}. AI confidence: ${shipment.theftProbability}%. Immediate intervention recommended.`,
    recommendations: [
      "Dispatch security escort to intercept at next checkpoint",
      "Contact driver via automated voice alert",
      "Notify shipper and adjust insurance claim probability",
      "Reroute remaining transit through lower-risk corridor",
    ],
  };
}

export function getMonthlyTrends() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map((month, i) => ({
    month,
    riskScore: Math.round(45 + Math.sin(i * 0.5) * 15 + rand() * 10),
    fraudCases: Math.round(8 + Math.sin(i * 0.7) * 5 + rand() * 4),
    shipmentHealth: Math.round(82 + Math.cos(i * 0.4) * 8 + rand() * 5),
    carrierPerformance: Math.round(75 + Math.sin(i * 0.3) * 12 + rand() * 6),
  }));
}
