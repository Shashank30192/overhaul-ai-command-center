// ─── Types ────────────────────────────────────────────────────────────────────

export type ShipmentStatus = 'in_transit' | 'delayed' | 'at_risk' | 'delivered' | 'pending' | 'exception' | 'on_hold';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type Priority = 'STANDARD' | 'HIGH' | 'PLATINUM' | 'CRITICAL';
export type AgentStatus = 'idle' | 'queued' | 'running' | 'complete' | 'error';
export type SystemStatus = 'connected' | 'degraded' | 'disconnected';

export interface Shipment {
  id: string;
  salesOrder: string;
  customer: string;
  customerId: string;
  priority: Priority;
  origin: string;
  destination: string;
  carrier: string;
  warehouse: string;
  eta: string;
  risk: RiskLevel;
  riskScore: number;
  status: ShipmentStatus;
  aiRecommendation: string;
  value: number;
  cargo: string;
  weight: string;
  daysInTransit: number;
  delayHours: number;
  createdAt: string;
  tracking: string;
  routeDeviation: boolean;
  temperature?: string;
}

export interface ApiLog {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  status: number;
  latency: number;
  agent: string;
  timestamp: number;
  size: string;
  shipmentId?: string;
}

export interface EnterpriseSystem {
  id: string;
  name: string;
  type: 'ERP' | 'WMS' | 'TMS';
  vendor: string;
  status: SystemStatus;
  latency: number;
  lastSync: string;
  apiHealth: number;
  requestsPerMin: number;
  uptime: string;
  version: string;
  endpoints: number;
  errorRate: number;
}

// ─── Seeded random ────────────────────────────────────────────────────────────

class SR {
  private s: number;
  constructor(seed = 42) { this.s = seed; }
  next() { this.s = (this.s * 1664525 + 1013904223) & 0xffffffff; return (this.s >>> 0) / 4294967296; }
  int(a: number, b: number) { return Math.floor(this.next() * (b - a + 1)) + a; }
  pick<T>(arr: T[]): T { return arr[this.int(0, arr.length - 1)]; }
  bool(p = 0.5) { return this.next() < p; }
}

// ─── Reference data ───────────────────────────────────────────────────────────

const CUSTOMERS = [
  { name: 'Nexus Pharmaceuticals', id: 'C001', priority: 'PLATINUM' as Priority },
  { name: 'GlobalTech Industries', id: 'C002', priority: 'HIGH' as Priority },
  { name: 'Apex Medical Devices', id: 'C003', priority: 'CRITICAL' as Priority },
  { name: 'Solaris Energy Corp', id: 'C004', priority: 'PLATINUM' as Priority },
  { name: 'Meridian Aerospace', id: 'C005', priority: 'HIGH' as Priority },
  { name: 'Vantage Retail Group', id: 'C006', priority: 'STANDARD' as Priority },
  { name: 'Pacific Coast Imports', id: 'C007', priority: 'HIGH' as Priority },
  { name: 'Atlas Manufacturing', id: 'C008', priority: 'STANDARD' as Priority },
  { name: 'Titan Automotive', id: 'C009', priority: 'PLATINUM' as Priority },
  { name: 'ClearPath Logistics', id: 'C010', priority: 'HIGH' as Priority },
  { name: 'Orion Food & Beverage', id: 'C011', priority: 'STANDARD' as Priority },
  { name: 'Vertex Semiconductors', id: 'C012', priority: 'CRITICAL' as Priority },
  { name: 'Cascade Chemicals', id: 'C013', priority: 'HIGH' as Priority },
  { name: 'Nordic Cold Chain', id: 'C014', priority: 'PLATINUM' as Priority },
  { name: 'Ironclad Defense', id: 'C015', priority: 'CRITICAL' as Priority },
  { name: 'Luminary Cosmetics', id: 'C016', priority: 'STANDARD' as Priority },
  { name: 'SteelBridge Construction', id: 'C017', priority: 'HIGH' as Priority },
  { name: 'Quantum Biotech', id: 'C018', priority: 'PLATINUM' as Priority },
  { name: 'Terra Agrifoods', id: 'C019', priority: 'STANDARD' as Priority },
  { name: 'Centaur Financial', id: 'C020', priority: 'HIGH' as Priority },
];

const CARRIERS = [
  'Swift Logistics', 'Apex Freight', 'GlobalCargo Express',
  'Meridian Transport', 'NorthStar Shipping', 'Titan Freight Solutions',
  'BluePath Carriers', 'ClearRoute Logistics', 'Vantage Carriers', 'Atlas Freight',
];

const WAREHOUSES = [
  'Chicago Central WH', 'Los Angeles Port WH', 'Dallas Distribution',
  'New York Gateway', 'Atlanta Hub', 'Seattle Logistics Ctr',
  'Denver Cross-Dock', 'Miami Port Facility', 'Phoenix East WH', 'Detroit Auto WH',
];

const ORIGINS = [
  'São Paulo, BR', 'Shanghai, CN', 'Rotterdam, NL', 'Hamburg, DE',
  'Singapore, SG', 'Mumbai, IN', 'Mexico City, MX', 'Toronto, CA',
  'Los Angeles, US', 'Chicago, US', 'Seoul, KR', 'Taipei, TW',
];

const DESTINATIONS = [
  'Chicago, US', 'Dallas, US', 'New York, US', 'Los Angeles, US',
  'Atlanta, US', 'Seattle, US', 'Houston, US', 'Philadelphia, US',
  'Phoenix, US', 'Miami, US', 'Denver, US', 'Detroit, US',
];

const CARGO_TYPES = [
  'Pharmaceutical Supplies', 'Electronic Components', 'Automotive Parts',
  'Medical Devices', 'Consumer Electronics', 'Chemical Products',
  'Semiconductor Wafers', 'Aerospace Components', 'Food Products',
  'Industrial Machinery', 'Defense Equipment', 'Cold Chain Biologics',
];

const AI_RECS = [
  'Expedite loading — SLA breach in 2h',
  'Notify customer — delay confirmed',
  'Reroute via Dock 9-A immediately',
  'Escalate to carrier dispatch',
  'Request alternative transport slot',
  'On track — no action required',
  'Weather delay — update ETA +4h',
  'Customs hold — file documentation',
  'Driver not responding — escalate',
  'Carrier reassignment recommended',
];

const STATUSES: ShipmentStatus[] = ['in_transit', 'delayed', 'at_risk', 'delivered', 'pending', 'exception', 'on_hold'];
const STATUS_WEIGHTS = [35, 20, 15, 15, 8, 5, 2];
const RISKS: RiskLevel[] = ['low', 'medium', 'high', 'critical'];

function weightedPick<T>(items: T[], weights: number[], rng: SR): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng.next() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function fmtDate(offsetHours: number): string {
  const d = new Date(Date.now() + offsetHours * 3600000);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Generate 100 shipments ───────────────────────────────────────────────────

function generate(): Shipment[] {
  const rng = new SR(2024);
  const ships: Shipment[] = [];

  for (let i = 0; i < 100; i++) {
    const num = 1000 + i;
    const cust = rng.pick(CUSTOMERS);
    const status = weightedPick(STATUSES, STATUS_WEIGHTS, rng);
    const isDelayed = status === 'delayed' || status === 'at_risk' || status === 'exception';
    const delayH = isDelayed ? rng.int(1, 18) : 0;
    const riskScore = status === 'critical' ? rng.int(80, 99)
      : status === 'at_risk' ? rng.int(60, 79)
      : status === 'delayed' ? rng.int(40, 65)
      : rng.int(5, 35);
    const risk: RiskLevel = riskScore >= 80 ? 'critical' : riskScore >= 60 ? 'high' : riskScore >= 30 ? 'medium' : 'low';

    ships.push({
      id: `SHP-${num}`,
      salesOrder: `SO-${200000 + i * 137}`,
      customer: cust.name,
      customerId: cust.id,
      priority: cust.priority,
      origin: rng.pick(ORIGINS),
      destination: rng.pick(DESTINATIONS),
      carrier: rng.pick(CARRIERS),
      warehouse: rng.pick(WAREHOUSES),
      eta: fmtDate(rng.int(-12, 72)),
      risk,
      riskScore,
      status,
      aiRecommendation: rng.pick(AI_RECS),
      value: rng.int(25, 850) * 1000,
      cargo: rng.pick(CARGO_TYPES),
      weight: `${rng.int(200, 18000)} kg`,
      daysInTransit: rng.int(1, 21),
      delayHours: delayH,
      createdAt: fmtDate(-rng.int(24, 240)),
      tracking: `TRK${Math.random().toString(36).slice(2, 12).toUpperCase()}`,
      routeDeviation: rng.bool(0.15),
      temperature: rng.bool(0.2) ? `${rng.int(2, 8)}°C` : undefined,
    });
  }

  return ships;
}

export const MOCK_SHIPMENTS = generate();

// ─── Enterprise Systems ───────────────────────────────────────────────────────

export const MOCK_SYSTEMS: EnterpriseSystem[] = [
  { id: 'sap-erp', name: 'SAP S/4HANA', type: 'ERP', vendor: 'SAP', status: 'connected', latency: 145, lastSync: '12s ago', apiHealth: 99.8, requestsPerMin: 84, uptime: '99.97%', version: 'S/4HANA 2023', endpoints: 42, errorRate: 0.02 },
  { id: 'oracle-erp', name: 'Oracle ERP Cloud', type: 'ERP', vendor: 'Oracle', status: 'connected', latency: 189, lastSync: '45s ago', apiHealth: 98.4, requestsPerMin: 31, uptime: '99.91%', version: 'Oracle 23.4', endpoints: 38, errorRate: 0.08 },
  { id: 'netsuite', name: 'NetSuite ERP', type: 'ERP', vendor: 'Oracle NetSuite', status: 'degraded', latency: 412, lastSync: '3m ago', apiHealth: 87.2, requestsPerMin: 12, uptime: '98.44%', version: 'NS 2023.2', endpoints: 24, errorRate: 1.2 },
  { id: 'dynamics', name: 'Microsoft Dynamics', type: 'ERP', vendor: 'Microsoft', status: 'connected', latency: 201, lastSync: '28s ago', apiHealth: 99.1, requestsPerMin: 19, uptime: '99.85%', version: 'D365 FO', endpoints: 33, errorRate: 0.05 },
  { id: 'blue-yonder', name: 'Blue Yonder WMS', type: 'WMS', vendor: 'Blue Yonder', status: 'connected', latency: 212, lastSync: '8s ago', apiHealth: 99.5, requestsPerMin: 67, uptime: '99.93%', version: 'BY 2023.3', endpoints: 29, errorRate: 0.03 },
  { id: 'manhattan', name: 'Manhattan WMS', type: 'WMS', vendor: 'Manhattan', status: 'connected', latency: 178, lastSync: '15s ago', apiHealth: 99.7, requestsPerMin: 54, uptime: '99.98%', version: 'SCALE 22.1', endpoints: 31, errorRate: 0.01 },
  { id: 'sap-ewm', name: 'SAP EWM', type: 'WMS', vendor: 'SAP', status: 'degraded', latency: 387, lastSync: '7m ago', apiHealth: 82.1, requestsPerMin: 8, uptime: '97.82%', version: 'EWM 9.5', endpoints: 19, errorRate: 2.4 },
  { id: 'oracle-tms', name: 'Oracle TMS', type: 'TMS', vendor: 'Oracle', status: 'connected', latency: 167, lastSync: '22s ago', apiHealth: 99.3, requestsPerMin: 45, uptime: '99.89%', version: 'OTMS 6.4', endpoints: 27, errorRate: 0.04 },
  { id: 'mercurygate', name: 'MercuryGate TMS', type: 'TMS', vendor: 'MercuryGate', status: 'connected', latency: 198, lastSync: '34s ago', apiHealth: 98.9, requestsPerMin: 38, uptime: '99.76%', version: 'MG 2023', endpoints: 22, errorRate: 0.07 },
  { id: 'sap-tm', name: 'SAP TM', type: 'TMS', vendor: 'SAP', status: 'disconnected', latency: 0, lastSync: '2h ago', apiHealth: 0, requestsPerMin: 0, uptime: '94.12%', version: 'TM 9.6', endpoints: 18, errorRate: 0 },
];

// ─── KPI sparkline data ───────────────────────────────────────────────────────

export function genSparkline(length = 12, min = 0, max = 100, trend: 'up' | 'down' | 'flat' | 'volatile' = 'flat'): number[] {
  const rng = new SR(Math.floor(Math.random() * 9999));
  const base = rng.int(min + 10, max - 10);
  return Array.from({ length }, (_, i) => {
    const trendFactor = trend === 'up' ? i * 2 : trend === 'down' ? -i * 2 : 0;
    const noise = trend === 'volatile' ? rng.int(-20, 20) : rng.int(-8, 8);
    return Math.max(min, Math.min(max, base + trendFactor + noise));
  });
}

// ─── Mock API logs (for monitor) ─────────────────────────────────────────────

export const API_TEMPLATES: Omit<ApiLog, 'id' | 'timestamp'>[] = [
  { method: 'GET', endpoint: '/erp/orders/{id}', status: 200, latency: 145, agent: 'ERP Agent', size: '2.4 KB', shipmentId: 'SHP-1024' },
  { method: 'GET', endpoint: '/wms/picking/{id}', status: 200, latency: 212, agent: 'WMS Agent', size: '1.8 KB', shipmentId: 'SHP-1024' },
  { method: 'GET', endpoint: '/tms/routes/{id}', status: 200, latency: 178, agent: 'TMS Agent', size: '3.1 KB', shipmentId: 'SHP-1024' },
  { method: 'POST', endpoint: '/decision/recommend', status: 200, latency: 340, agent: 'Decision Agent', size: '4.2 KB' },
  { method: 'GET', endpoint: '/erp/inventory/{sku}', status: 200, latency: 98, agent: 'ERP Agent', size: '1.2 KB' },
  { method: 'GET', endpoint: '/wms/dock/status', status: 200, latency: 165, agent: 'WMS Agent', size: '0.9 KB' },
  { method: 'GET', endpoint: '/tms/carrier/{id}/eta', status: 200, latency: 201, agent: 'TMS Agent', size: '1.1 KB' },
  { method: 'GET', endpoint: '/erp/customer/{id}/sla', status: 200, latency: 134, agent: 'ERP Agent', size: '0.7 KB' },
  { method: 'POST', endpoint: '/wms/exception/report', status: 201, latency: 289, agent: 'WMS Agent', size: '2.0 KB' },
  { method: 'GET', endpoint: '/tms/traffic/alerts', status: 200, latency: 156, agent: 'TMS Agent', size: '5.2 KB' },
  { method: 'GET', endpoint: '/erp/orders/{id}', status: 404, latency: 89, agent: 'ERP Agent', size: '0.2 KB' },
  { method: 'GET', endpoint: '/tms/routes/{id}', status: 503, latency: 2100, agent: 'TMS Agent', size: '0.4 KB' },
];

// ─── Mock payload JSONs ───────────────────────────────────────────────────────

export const MOCK_PAYLOADS: Record<string, { request: unknown; response: unknown; headers: Record<string, string> }> = {
  erp: {
    headers: { 'Authorization': 'Bearer eyJhbGc...', 'Content-Type': 'application/json', 'X-Agent-ID': 'erp-agent-01', 'X-Request-ID': 'req_8f2a9b' },
    request: { shipmentId: 'SHP-1024', fields: ['salesOrder', 'customer', 'priority', 'inventory', 'sla'] },
    response: {
      shipmentId: 'SHP-1024', salesOrder: 'SO-289341',
      customer: { id: 'C001', name: 'Nexus Pharmaceuticals', priority: 'PLATINUM', slaHours: 24 },
      inventory: { sku: 'PHARM-4421', qty: 240, reserved: 240, location: 'Chicago Central WH' },
      value: 284500, deliverySLA: '2024-01-15T18:00:00Z', orderStatus: 'DELAYED',
      _meta: { latency: 145, source: 'SAP S/4HANA', timestamp: new Date().toISOString() }
    }
  },
  wms: {
    headers: { 'Authorization': 'Bearer eyJhbGc...', 'X-Agent-ID': 'wms-agent-01', 'X-Warehouse-ID': 'CHI-001' },
    request: { shipmentId: 'SHP-1024', warehouse: 'Chicago Central WH' },
    response: {
      shipmentId: 'SHP-1024', warehouse: 'Chicago Central WH',
      picking: { status: 'COMPLETE', completedAt: '2024-01-15T12:15:00Z', worker: 'W-4421' },
      packing: { status: 'COMPLETE', completedAt: '2024-01-15T13:05:00Z', dock: null },
      loading: { status: 'DELAYED', dockAssignment: 'Dock 7-B', delay: 95, reason: 'Equipment failure' },
      exceptions: [{ code: 'DOCK_EQUIP_FAIL', severity: 'HIGH', description: 'Forklift #3 malfunction at Dock 7-B' }],
      _meta: { latency: 212, source: 'Manhattan WMS', timestamp: new Date().toISOString() }
    }
  },
  tms: {
    headers: { 'Authorization': 'Bearer eyJhbGc...', 'X-Agent-ID': 'tms-agent-01' },
    request: { shipmentId: 'SHP-1024', includeTraffic: true, includeETA: true },
    response: {
      shipmentId: 'SHP-1024',
      carrier: { id: 'CAR-001', name: 'Swift Logistics', mcNumber: 'MC-294817', rating: 4.2 },
      driver: { id: 'DRV-2241', name: 'James Rodriguez', phone: '+1-312-555-0182', status: 'WAITING' },
      route: { planned: 'Chicago WH → Nashville DC', current: 'AWAITING_DISPATCH', distance: 477, unit: 'miles' },
      eta: { original: '2024-01-15T18:00:00Z', updated: '2024-01-15T22:00:00Z', delayMinutes: 240 },
      delayEvents: [{ type: 'MISSED_DEPARTURE', time: '2024-01-15T14:00:00Z', reason: 'Warehouse loading not complete' }],
      _meta: { latency: 178, source: 'Oracle TMS', timestamp: new Date().toISOString() }
    }
  },
  decision: {
    headers: { 'Content-Type': 'application/json', 'X-Agent-ID': 'decision-agent-01', 'X-Model': 'supply-chain-v3' },
    request: { erpData: '...', wmsData: '...', tmsData: '...', context: { shipmentId: 'SHP-1024', priority: 'PLATINUM' } },
    response: {
      rootCause: 'Dock equipment failure at Dock 7-B caused 95-min loading delay, resulting in missed departure window',
      businessImpact: { delay: '4 hours', slaRisk: 'BREACH', financialExposure: 28450, customer: 'PLATINUM' },
      recommendations: [
        { priority: 1, action: 'REASSIGN_DOCK', detail: 'Move load to Dock 9-A (available)', urgency: 'IMMEDIATE' },
        { priority: 2, action: 'NOTIFY_CUSTOMER', detail: 'Inform Nexus Pharmaceuticals of delay', urgency: 'HIGH' },
        { priority: 3, action: 'UPDATE_ETA', detail: 'Push ETA to 22:00 CST in all systems', urgency: 'HIGH' },
        { priority: 4, action: 'ESCALATE_FACILITY', detail: 'Report Dock 7-B failure to maintenance', urgency: 'MEDIUM' },
      ],
      confidence: 0.96,
      _meta: { latency: 340, model: 'supply-chain-v3', timestamp: new Date().toISOString() }
    }
  }
};
