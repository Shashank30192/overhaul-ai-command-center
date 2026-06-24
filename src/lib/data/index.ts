import {
  generateCarriers,
  generateColdChainIncidents,
  generateFraudCases,
  generateIncidentReport,
  generateLocations,
  generateRiskHotspots,
  generateShipments,
  getMonthlyTrends,
} from "./generator";

const carriers = generateCarriers();
const locations = generateLocations();
const shipments = generateShipments(carriers);
const fraudCases = generateFraudCases(shipments);
const riskHotspots = generateRiskHotspots();
const coldChainIncidents = generateColdChainIncidents(shipments);
const monthlyTrends = getMonthlyTrends();

export const demoData = {
  carriers,
  locations,
  shipments,
  fraudCases,
  riskHotspots,
  coldChainIncidents,
  monthlyTrends,
  executiveStats: {
    cargoProtected: 3_400_000_000,
    activeShipments: 24856,
    risksPrevented: 184,
    fraudCasesStopped: 32,
    insuranceSavings: 12_700_000,
    riskReduction: 34,
  },
  heroStats: {
    cargoProtected: 1_400_000_000_000,
    shipmentProtection: 99.9,
    recoverySuccess: 96,
    analystTimeReduction: 70,
  },
};

export function getShipmentById(id: string) {
  return demoData.shipments.find((s) => s.id === id);
}

export function getTopRiskShipments(limit = 10) {
  return demoData.shipments.slice(0, limit);
}

export function getDelayedShipments() {
  return demoData.shipments.filter((s) => s.status === "delayed" || s.delayHours > 0);
}

export function getFraudCasesThisWeek() {
  const weekAgo = Date.now() - 7 * 86400000;
  return demoData.fraudCases.filter((f) => new Date(f.detectedAt).getTime() > weekAgo);
}

export { generateIncidentReport };
