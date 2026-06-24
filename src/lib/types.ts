export type ShipmentStatus = "in_transit" | "delivered" | "delayed" | "at_risk" | "intercepted";
export type LocationType = "warehouse" | "port" | "distribution_center" | "truck" | "container" | "ship" | "air_cargo";
export type FraudType =
  | "double_brokering"
  | "carrier_identity_fraud"
  | "fake_pod"
  | "invoice_fraud"
  | "insurance_fraud";
export type RiskCategory = "theft" | "fraud" | "weather" | "political" | "disruption";

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  lat: number;
  lng: number;
  city: string;
  country: string;
  riskScore: number;
}

export interface Carrier {
  id: string;
  name: string;
  mcNumber: string;
  safetyRating: number;
  fraudScore: number;
  onTimeRate: number;
  totalShipments: number;
  verified: boolean;
}

export interface Shipment {
  id: string;
  origin: string;
  destination: string;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  cargo: string;
  cargoValue: number;
  carrierId: string;
  carrierName: string;
  status: ShipmentStatus;
  riskScore: number;
  theftProbability: number;
  eta: string;
  currentLat: number;
  currentLng: number;
  routeDeviation: boolean;
  unauthorizedStop: boolean;
  temperature?: number;
  coldChain: boolean;
  delayHours: number;
  riskReasons: string[];
  recommendedAction: string;
}

export interface FraudCase {
  id: string;
  type: FraudType;
  shipmentId: string;
  carrierName: string;
  fraudScore: number;
  detectedAt: string;
  status: "investigating" | "confirmed" | "resolved" | "dismissed";
  evidence: string[];
  riskFactors: string[];
  recommendedActions: string[];
  financialExposure: number;
}

export interface RiskHotspot {
  id: string;
  lat: number;
  lng: number;
  category: RiskCategory;
  intensity: number;
  label: string;
  region: string;
}

export interface ColdChainIncident {
  id: string;
  shipmentId: string;
  cargo: string;
  predictedExcursion: boolean;
  currentTemp: number;
  threshold: number;
  probability: number;
  eta: string;
}

export interface IncidentReport {
  id: string;
  shipmentId: string;
  alertType: string;
  triggeredAt: string;
  rootCause: string;
  gpsAnalysis: string;
  driverAnalysis: string;
  documentAnalysis: string;
  summary: string;
  recommendations: string[];
}

export interface ExecutiveBriefing {
  generatedAt: string;
  topRisks: { title: string; severity: string; impact: string }[];
  majorIncidents: { id: string; description: string; status: string }[];
  recommendations: string[];
  financialImpact: { category: string; amount: number }[];
}

export interface RouteOption {
  id: string;
  name: string;
  type: "safer" | "cheaper" | "faster";
  distance: number;
  duration: string;
  cost: number;
  riskScore: number;
  savings?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
