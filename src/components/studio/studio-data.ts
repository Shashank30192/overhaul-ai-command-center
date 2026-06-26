// ─── Types ────────────────────────────────────────────────────────────────────

export type NodeStatus = 'idle' | 'queued' | 'authenticating' | 'running' | 'complete' | 'error' | 'paused';
export type ConnectorType = 'erp' | 'wms' | 'tms' | 'carrier' | 'edi' | 'api' | 'agent' | 'trigger' | 'decision';

export interface WorkflowNode {
  id: string;
  label: string;
  sublabel: string;
  type: ConnectorType;
  color: string;
  icon: string;
  x: number;
  y: number;
  status: NodeStatus;
  progress: number;
  steps: StepDef[];
  currentStep: number;
  logs: LogEntry[];
  apiCalls: ApiCall[];
  runDelay: number;
  expanded: boolean;
}

export interface StepDef {
  label: string;
  duration: number;
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export interface LogEntry {
  ts: number;
  level: 'info' | 'warn' | 'error' | 'success';
  msg: string;
}

export interface ApiCall {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: number;
  latency: number;
  requestBody: unknown;
  responseBody: unknown;
  headers: Record<string, string>;
  ts: number;
  nodeId: string;
}

export interface Edge {
  from: string;
  to: string;
  animated: boolean;
}

export interface ConnectorDef {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  color: string;
  type: ConnectorType;
  category: string;
}

// ─── Canvas layout ────────────────────────────────────────────────────────────

export const CANVAS_W = 1540;
export const CANVAS_H = 720;
export const NODE_W = 148;
export const NODE_H = 72;

// ─── Node definitions ─────────────────────────────────────────────────────────

export const INITIAL_NODES: WorkflowNode[] = [
  {
    id: 'start',
    label: 'START',
    sublabel: 'Workflow Trigger',
    type: 'trigger',
    color: '#6366f1',
    icon: '▶',
    x: 40, y: 324,
    status: 'idle', progress: 0, currentStep: 0, expanded: false,
    logs: [], apiCalls: [],
    runDelay: 0,
    steps: [{ label: 'Trigger fired', duration: 300 }],
  },
  {
    id: 'supervisor',
    label: 'Supervisor',
    sublabel: 'Orchestration Agent',
    type: 'agent',
    color: '#00c2b2',
    icon: '◈',
    x: 220, y: 324,
    status: 'idle', progress: 0, currentStep: 0, expanded: false,
    logs: [], apiCalls: [],
    runDelay: 400,
    steps: [
      { label: 'Initializing context', duration: 400 },
      { label: 'Dispatching ERP Agent', duration: 300 },
      { label: 'Dispatching SKU Agent', duration: 200 },
    ],
  },
  {
    id: 'erp',
    label: 'ERP Agent',
    sublabel: 'SAP S/4HANA',
    type: 'erp',
    color: '#3b82f6',
    icon: '◆',
    x: 420, y: 160,
    status: 'idle', progress: 0, currentStep: 0, expanded: false,
    logs: [], apiCalls: [],
    runDelay: 1100,
    steps: [
      { label: 'Authenticating OAuth2', duration: 500 },
      { label: 'GET /salesOrders/{id}', duration: 600, endpoint: '/erp/salesOrders/SO-289341', method: 'GET' },
      { label: 'Parsing Sales Order', duration: 300 },
      { label: 'GET /inventory/{sku}', duration: 400, endpoint: '/erp/inventory/PHARM-4421', method: 'GET' },
      { label: 'Validating SLA', duration: 250 },
    ],
  },
  {
    id: 'sku',
    label: 'SKU Intelligence',
    sublabel: 'Product Data Agent',
    type: 'agent',
    color: '#8b5cf6',
    icon: '◉',
    x: 420, y: 480,
    status: 'idle', progress: 0, currentStep: 0, expanded: false,
    logs: [], apiCalls: [],
    runDelay: 1300,
    steps: [
      { label: 'Fetching SKU catalog', duration: 400, endpoint: '/catalog/sku/PHARM-4421', method: 'GET' },
      { label: 'Checking hazmat flags', duration: 300 },
      { label: 'Resolving packaging', duration: 250 },
      { label: 'Temperature requirements', duration: 200 },
    ],
  },
  {
    id: 'wms',
    label: 'WMS Agent',
    sublabel: 'Manhattan Associates',
    type: 'wms',
    color: '#f59e0b',
    icon: '◇',
    x: 640, y: 220,
    status: 'idle', progress: 0, currentStep: 0, expanded: false,
    logs: [], apiCalls: [],
    runDelay: 2800,
    steps: [
      { label: 'Authenticating Bearer', duration: 400 },
      { label: 'GET /warehouse/orders/{id}', duration: 600, endpoint: '/wms/warehouse/orders/SO-289341', method: 'GET' },
      { label: 'Checking dock assignment', duration: 350 },
      { label: 'Fetching exceptions', duration: 300 },
    ],
  },
  {
    id: 'tms',
    label: 'TMS Agent',
    sublabel: 'Oracle Transportation',
    type: 'tms',
    color: '#10b981',
    icon: '◎',
    x: 860, y: 220,
    status: 'idle', progress: 0, currentStep: 0, expanded: false,
    logs: [], apiCalls: [],
    runDelay: 4400,
    steps: [
      { label: 'Authenticating API Key', duration: 350 },
      { label: 'GET /shipments/{id}', duration: 500, endpoint: '/tms/shipments/SHP-1024', method: 'GET' },
      { label: 'Fetching GPS & ETA', duration: 400, endpoint: '/tms/tracking/SHP-1024/live', method: 'GET' },
      { label: 'Traffic analysis', duration: 300 },
    ],
  },
  {
    id: 'carrier',
    label: 'Carrier Agent',
    sublabel: 'Multi-carrier APIs',
    type: 'carrier',
    color: '#ec4899',
    icon: '◑',
    x: 1080, y: 140,
    status: 'idle', progress: 0, currentStep: 0, expanded: false,
    logs: [], apiCalls: [],
    runDelay: 5900,
    steps: [
      { label: 'Calling FedEx API', duration: 400, endpoint: '/carriers/fedex/track/SHP-1024', method: 'GET' },
      { label: 'Proof of Delivery', duration: 300 },
      { label: 'Live ETA update', duration: 250 },
    ],
  },
  {
    id: 'edi',
    label: 'EDI Agent',
    sublabel: 'Transaction Gateway',
    type: 'edi',
    color: '#f97316',
    icon: '◐',
    x: 1080, y: 360,
    status: 'idle', progress: 0, currentStep: 0, expanded: false,
    logs: [], apiCalls: [],
    runDelay: 6100,
    steps: [
      { label: 'Auth AS2 middleware', duration: 400 },
      { label: 'Receiving 214 Status', duration: 500 },
      { label: 'Processing 856 ASN', duration: 400 },
      { label: 'Generating 810 Invoice', duration: 350 },
    ],
  },
  {
    id: 'decision',
    label: 'Decision Agent',
    sublabel: 'AI Reasoning Engine',
    type: 'decision',
    color: '#ef4444',
    icon: '⬡',
    x: 1300, y: 324,
    status: 'idle', progress: 0, currentStep: 0, expanded: false,
    logs: [], apiCalls: [],
    runDelay: 7600,
    steps: [
      { label: 'Merging enterprise context', duration: 500 },
      { label: 'Detecting inconsistencies', duration: 400 },
      { label: 'Validating business rules', duration: 350 },
      { label: 'Predicting downstream impact', duration: 500 },
      { label: 'Generating recommendations', duration: 400 },
    ],
  },
];

export const INITIAL_EDGES: Edge[] = [
  { from: 'start', to: 'supervisor', animated: false },
  { from: 'supervisor', to: 'erp', animated: false },
  { from: 'supervisor', to: 'sku', animated: false },
  { from: 'erp', to: 'wms', animated: false },
  { from: 'sku', to: 'wms', animated: false },
  { from: 'wms', to: 'tms', animated: false },
  { from: 'tms', to: 'carrier', animated: false },
  { from: 'tms', to: 'edi', animated: false },
  { from: 'carrier', to: 'decision', animated: false },
  { from: 'edi', to: 'decision', animated: false },
];

// ─── Left panel connector library ─────────────────────────────────────────────

export const CONNECTOR_LIBRARY: { category: string; color: string; items: ConnectorDef[] }[] = [
  {
    category: 'ERP Systems',
    color: '#3b82f6',
    items: [
      { id: 'sap-erp', label: 'SAP S/4HANA', sublabel: 'ERP · REST', icon: '◆', color: '#3b82f6', type: 'erp', category: 'ERP' },
      { id: 'oracle-erp', label: 'Oracle ERP Cloud', sublabel: 'ERP · REST', icon: '◆', color: '#3b82f6', type: 'erp', category: 'ERP' },
      { id: 'netsuite', label: 'NetSuite', sublabel: 'ERP · SuiteQL', icon: '◆', color: '#3b82f6', type: 'erp', category: 'ERP' },
      { id: 'dynamics', label: 'Microsoft Dynamics', sublabel: 'ERP · OData', icon: '◆', color: '#3b82f6', type: 'erp', category: 'ERP' },
    ],
  },
  {
    category: 'WMS',
    color: '#f59e0b',
    items: [
      { id: 'sap-ewm', label: 'SAP EWM', sublabel: 'WMS · RFC', icon: '◇', color: '#f59e0b', type: 'wms', category: 'WMS' },
      { id: 'blue-yonder', label: 'Blue Yonder', sublabel: 'WMS · REST', icon: '◇', color: '#f59e0b', type: 'wms', category: 'WMS' },
      { id: 'manhattan', label: 'Manhattan WMS', sublabel: 'WMS · REST', icon: '◇', color: '#f59e0b', type: 'wms', category: 'WMS' },
    ],
  },
  {
    category: 'TMS',
    color: '#10b981',
    items: [
      { id: 'oracle-tms', label: 'Oracle TMS', sublabel: 'TMS · REST', icon: '◎', color: '#10b981', type: 'tms', category: 'TMS' },
      { id: 'sap-tm', label: 'SAP TM', sublabel: 'TMS · RFC', icon: '◎', color: '#10b981', type: 'tms', category: 'TMS' },
      { id: 'mercurygate', label: 'MercuryGate', sublabel: 'TMS · REST', icon: '◎', color: '#10b981', type: 'tms', category: 'TMS' },
    ],
  },
  {
    category: 'Carrier APIs',
    color: '#ec4899',
    items: [
      { id: 'fedex', label: 'FedEx', sublabel: 'Carrier · REST', icon: '◑', color: '#ec4899', type: 'carrier', category: 'Carrier' },
      { id: 'dhl', label: 'DHL', sublabel: 'Carrier · REST', icon: '◑', color: '#ec4899', type: 'carrier', category: 'Carrier' },
      { id: 'ups', label: 'UPS', sublabel: 'Carrier · REST', icon: '◑', color: '#ec4899', type: 'carrier', category: 'Carrier' },
      { id: 'maersk', label: 'Maersk', sublabel: 'Ocean · REST', icon: '◑', color: '#ec4899', type: 'carrier', category: 'Carrier' },
    ],
  },
  {
    category: 'EDI & Middleware',
    color: '#f97316',
    items: [
      { id: 'edi-gw', label: 'EDI Gateway', sublabel: 'AS2 · SFTP · X12', icon: '◐', color: '#f97316', type: 'edi', category: 'EDI' },
    ],
  },
  {
    category: 'API & Data',
    color: '#6366f1',
    items: [
      { id: 'rest', label: 'REST API', sublabel: 'HTTP · JSON', icon: '⊕', color: '#6366f1', type: 'api', category: 'API' },
      { id: 'graphql', label: 'GraphQL', sublabel: 'Query · Mutation', icon: '⊕', color: '#6366f1', type: 'api', category: 'API' },
      { id: 'webhook', label: 'Webhook', sublabel: 'Inbound · Outbound', icon: '⊕', color: '#6366f1', type: 'api', category: 'API' },
      { id: 'database', label: 'Database', sublabel: 'SQL · NoSQL', icon: '⊕', color: '#6366f1', type: 'api', category: 'API' },
    ],
  },
];

// ─── Mock API payloads ────────────────────────────────────────────────────────

export const MOCK_API_CALLS: Record<string, { request: unknown; response: unknown; headers: Record<string, string> }> = {
  erp_orders: {
    headers: { 'Authorization': 'Bearer eyJhbGc...', 'Content-Type': 'application/json', 'X-Agent': 'erp-agent-01' },
    request: { orderNumber: 'SO-289341', expand: ['customer', 'lineItems', 'inventory', 'sla'] },
    response: {
      salesOrder: 'SO-289341', customer: { id: 'C001', name: 'Nexus Pharmaceuticals', tier: 'PLATINUM', slaHours: 24 },
      lineItems: [{ sku: 'PHARM-4421', qty: 240, value: 284500, hazmat: true }],
      delivery: { incoterms: 'DAP', dueDate: '2024-01-16T06:00:00Z', priority: 'CRITICAL' },
      warehouse: 'Chicago Central WH', _meta: { latency: 145, source: 'SAP S/4HANA' }
    }
  },
  erp_inventory: {
    headers: { 'Authorization': 'Bearer eyJhbGc...', 'X-Agent': 'erp-agent-01' },
    request: { sku: 'PHARM-4421', warehouse: 'CHI-001' },
    response: {
      sku: 'PHARM-4421', onHand: 240, reserved: 240, available: 0,
      binLocation: 'B7-C12', temperature: '2-8°C', _meta: { latency: 98 }
    }
  },
  sku_catalog: {
    headers: { 'X-Agent': 'sku-agent-01', 'Accept': 'application/json' },
    request: { skuId: 'PHARM-4421' },
    response: {
      sku: 'PHARM-4421', description: 'Recombinant Human Insulin 100IU/mL',
      dimensions: { l: 32, w: 18, h: 14, unit: 'cm' }, weight: { value: 2.4, unit: 'kg' },
      hazmat: { isHazmat: true, class: '6.1', un: 'UN2810' },
      temperature: { min: 2, max: 8, unit: 'C', monitored: true },
      packaging: { type: 'Cold Chain Box', quantity: 12, unit: 'vials' },
      _meta: { latency: 112 }
    }
  },
  wms_warehouse: {
    headers: { 'Authorization': 'Bearer eyJhbGc...', 'X-Warehouse': 'CHI-001', 'X-Agent': 'wms-agent-01' },
    request: { orderNumber: 'SO-289341', warehouse: 'Chicago Central WH' },
    response: {
      picking: { status: 'COMPLETE', completedAt: '2024-01-15T12:15:00Z' },
      packing: { status: 'COMPLETE', completedAt: '2024-01-15T13:05:00Z' },
      loading: { status: 'DELAYED', dock: 'Dock 7-B', delayMinutes: 95, reason: 'Forklift malfunction' },
      exceptions: [{ code: 'DOCK_EQUIP_FAIL', severity: 'HIGH' }],
      inventory: { binLocation: 'B7-C12', lotNumber: 'LOT-2024-001', expiry: '2025-06-30' },
      _meta: { latency: 212, source: 'Manhattan WMS' }
    }
  },
  tms_shipment: {
    headers: { 'X-API-Key': 'otms_prod_...', 'X-Agent': 'tms-agent-01' },
    request: { shipmentId: 'SHP-1024', includeTracking: true, includeTraffic: true },
    response: {
      shipment: { id: 'SHP-1024', status: 'WAITING_DISPATCH', carrier: 'Swift Logistics' },
      driver: { name: 'James Rodriguez', phone: '+1-312-555-0182', status: 'ON_SITE' },
      route: { origin: 'Chicago WH', destination: 'Nashville DC', distance: 477, unit: 'mi' },
      eta: { original: '2024-01-15T18:00:00Z', revised: '2024-01-15T22:00:00Z', delayMinutes: 240 },
      _meta: { latency: 178, source: 'Oracle TMS' }
    }
  },
  carrier_track: {
    headers: { 'Authorization': 'Bearer fedex_...', 'X-Agent': 'carrier-agent-01' },
    request: { trackingNumber: 'FDX-SHP-1024', service: 'FedEx Priority Overnight' },
    response: {
      trackingNumber: 'FDX-SHP-1024', status: 'WAITING_PICKUP',
      estimatedDelivery: '2024-01-16T09:00:00Z', signatureRequired: true,
      exceptions: [{ code: 'PICKUP_DELAY', desc: 'Package not ready for pickup' }],
      pod: null, _meta: { latency: 156 }
    }
  },
  edi_status: {
    headers: { 'AS2-From': 'OVERHAUL', 'AS2-To': 'NEXUS-PHARMA', 'X-Agent': 'edi-agent-01' },
    request: { transaction: '214', partnerISA: '014-NEXUSPHARMA' },
    response: {
      transaction: 'X12-214', shipmentStatus: 'AG', statusDetail: 'Picked up',
      referenceNumber: 'SO-289341', carrierCode: 'SWIFT',
      acknowledgements: [{ type: '997', status: 'ACCEPTED', ts: '2024-01-15T14:30:00Z' }],
      _meta: { latency: 203 }
    }
  },
  decision_result: {
    headers: { 'X-Agent': 'decision-agent-01', 'X-Model': 'supply-chain-v3' },
    request: { context: { erp: 'SO-289341', wms: 'CHI-001', tms: 'SHP-1024' }, priority: 'PLATINUM' },
    response: {
      rootCause: 'Dock equipment failure (Dock 7-B forklift malfunction) caused 95-min loading delay → missed TMS departure window → SLA breach probability 98%',
      businessImpact: { slaRisk: 'BREACH', financialExposure: 28450, customerTier: 'PLATINUM', downstreamOrders: 3 },
      recommendations: [
        { rank: 1, action: 'REASSIGN_DOCK', detail: 'Move load to Dock 9-A (available, forklift operational)', urgency: 'IMMEDIATE', confidence: 0.97 },
        { rank: 2, action: 'NOTIFY_CUSTOMER', detail: 'Alert Nexus Pharmaceuticals — new ETA 22:00 CST', urgency: 'HIGH', confidence: 0.99 },
        { rank: 3, action: 'UPDATE_SYSTEMS', detail: 'Sync revised ETA across Oracle TMS + Manhattan WMS', urgency: 'HIGH', confidence: 0.98 },
        { rank: 4, action: 'ESCALATE', detail: 'Report Dock 7-B failure to facility maintenance + ops manager', urgency: 'MEDIUM', confidence: 0.94 },
      ],
      confidence: 0.96, processingTime: 2840, _meta: { model: 'supply-chain-v3' }
    }
  }
};

// Auth method options
export const AUTH_METHODS = ['OAuth2', 'API Key', 'Bearer Token', 'JWT', 'Basic Auth', 'Client Credentials', 'SFTP', 'AS2', 'Certificates'];
