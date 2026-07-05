"use client";

import { PageWrapper } from "@/components/layout/page-wrapper";
import { DigitalTwinMap } from "@/components/digital-twin/digital-twin-map";
import { demoData } from "@/lib/data";
import { StatCard } from "@/components/shared/stat-card";
import { Warehouse, Anchor, Building2, Truck, Container, Ship, Plane } from "lucide-react";

const NODE_STATS = [
  { type: "warehouse", icon: Warehouse, label: "Warehouses" },
  { type: "port", icon: Anchor, label: "Ports" },
  { type: "distribution_center", icon: Building2, label: "Distribution Centers" },
  { type: "truck", icon: Truck, label: "Trucks" },
  { type: "container", icon: Container, label: "Containers" },
  { type: "ship", icon: Ship, label: "Ships" },
  { type: "air_cargo", icon: Plane, label: "Air Cargo" },
];

export default function DigitalTwinPage() {
  const activeShipments = demoData.shipments.filter(
    (s) => s.status === "in_transit" || s.status === "at_risk"
  );

  return (
    <PageWrapper
      title="Digital Twin Command Center"
      subtitle="Living map of your logistics network — real-time cargo movement, per-lane risk simulation, and the same shipment data your AI agents act on."
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {NODE_STATS.map((node, i) => {
          const count = demoData.locations.filter((l) => l.type === node.type).length;
          return (
            <StatCard
              key={node.type}
              title={node.label}
              value={String(count)}
              icon={node.icon}
              delay={i * 0.05}
            />
          );
        })}
      </div>

      <DigitalTwinMap locations={demoData.locations} shipments={demoData.shipments} />

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{demoData.locations.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Network Nodes</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{activeShipments.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Active Routes</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{demoData.carriers.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Carriers Connected</p>
        </div>
      </div>
    </PageWrapper>
  );
}
