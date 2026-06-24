import type Anthropic from "@anthropic-ai/sdk";
import {
  demoData,
  getDelayedShipments,
  getFraudCasesThisWeek,
  getShipmentById,
  getTopRiskShipments,
} from "@/lib/data";

/**
 * Tool definitions exposed to Claude. These let the model query the live
 * supply-chain dataset instead of us stuffing 500 shipments into every prompt.
 */
export const TOOLS: Anthropic.Tool[] = [
  {
    name: "get_top_risk_shipments",
    description: "Get the shipments with the highest theft/risk scores, sorted descending. Use for theft risk, high-value cargo, or 'which shipment is most at risk' questions.",
    input_schema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "How many shipments to return (default 5, max 20)" },
      },
    },
  },
  {
    name: "get_delayed_shipments",
    description: "Get shipments that are currently delayed or have accumulated delay hours.",
    input_schema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "How many to return (default 5)" },
      },
    },
  },
  {
    name: "get_fraud_cases",
    description: "Get fraud investigation cases (double brokering, carrier identity fraud, fake POD, invoice fraud, insurance fraud). Optionally only those detected this week.",
    input_schema: {
      type: "object",
      properties: {
        thisWeek: { type: "boolean", description: "If true, only cases detected in the last 7 days" },
        limit: { type: "number", description: "How many to return (default 5)" },
      },
    },
  },
  {
    name: "get_shipment_by_id",
    description: "Look up a single shipment's full detail by its ID (e.g. 'TX-45872').",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string", description: "The shipment ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "get_cold_chain_status",
    description: "Get cold-chain (temperature controlled) shipments and predicted temperature excursions.",
    input_schema: {
      type: "object",
      properties: {
        onlyAtRisk: { type: "boolean", description: "If true, only return shipments with a predicted excursion" },
      },
    },
  },
  {
    name: "get_portfolio_summary",
    description: "Get high-level portfolio KPIs: cargo protected, active shipments, risks prevented, fraud stopped, insurance savings, risk reduction, plus monthly trend data.",
    input_schema: { type: "object", properties: {} },
  },
];

type ToolInput = Record<string, unknown>;

export function runTool(name: string, input: ToolInput): unknown {
  switch (name) {
    case "get_top_risk_shipments": {
      const limit = Math.min(Number(input.limit) || 5, 20);
      return getTopRiskShipments(limit).map(slimShipment);
    }
    case "get_delayed_shipments": {
      const limit = Math.min(Number(input.limit) || 5, 20);
      return getDelayedShipments().slice(0, limit).map(slimShipment);
    }
    case "get_fraud_cases": {
      const limit = Math.min(Number(input.limit) || 5, 20);
      const cases = input.thisWeek ? getFraudCasesThisWeek() : demoData.fraudCases;
      return cases.slice(0, limit);
    }
    case "get_shipment_by_id": {
      const s = getShipmentById(String(input.id));
      return s ? slimShipment(s) : { error: `No shipment found with id ${input.id}` };
    }
    case "get_cold_chain_status": {
      const list = input.onlyAtRisk
        ? demoData.coldChainIncidents.filter((c) => c.predictedExcursion)
        : demoData.coldChainIncidents;
      return list.slice(0, 15);
    }
    case "get_portfolio_summary": {
      return { ...demoData.executiveStats, monthlyTrends: demoData.monthlyTrends };
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// Trim shipment payloads so we only send fields the model needs (saves tokens).
function slimShipment(s: (typeof demoData.shipments)[number]) {
  return {
    id: s.id,
    cargo: s.cargo,
    cargoValue: s.cargoValue,
    origin: s.origin,
    destination: s.destination,
    carrierName: s.carrierName,
    status: s.status,
    riskScore: s.riskScore,
    theftProbability: s.theftProbability,
    delayHours: s.delayHours,
    coldChain: s.coldChain,
    temperature: s.temperature,
    riskReasons: s.riskReasons,
    recommendedAction: s.recommendedAction,
  };
}
