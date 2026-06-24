"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Location, Shipment } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Warehouse, Anchor, Building2, Truck, Container, Ship, Plane,
} from "lucide-react";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((m) => m.CircleMarker), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((m) => m.Polyline), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

const TYPE_ICONS = {
  warehouse: Warehouse,
  port: Anchor,
  distribution_center: Building2,
  truck: Truck,
  container: Container,
  ship: Ship,
  air_cargo: Plane,
};

const TYPE_COLORS: Record<string, string> = {
  warehouse: "#10b981",
  port: "#3b82f6",
  distribution_center: "#8b5cf6",
  truck: "#f59e0b",
  container: "#ec4899",
  ship: "#06b6d4",
  air_cargo: "#ef4444",
};

interface DigitalTwinMapProps {
  locations: Location[];
  shipments: Shipment[];
}

export function DigitalTwinMap({ locations, shipments }: DigitalTwinMapProps) {
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setMounted(true);
    import("leaflet/dist/leaflet.css");
    const interval = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  const activeShipments = shipments.filter((s) => s.status === "in_transit" || s.status === "at_risk").slice(0, 15);
  const displayLocations = locations.slice(0, 40);

  if (!mounted) {
    return <div className="h-[600px] rounded-lg bg-[var(--mil-surface)] animate-pulse" />;
  }

  return (
    <div className="relative risk-map-tint">
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        {Object.entries(TYPE_COLORS).map(([type, color]) => {
          const Icon = TYPE_ICONS[type as keyof typeof TYPE_ICONS];
          return (
            <div key={type} className="flex items-center gap-2 text-xs text-[var(--mil-muted)] bg-[var(--mil-panel)]/90 px-2 py-1 rounded border border-[var(--mil-border)]">
              <Icon className="h-3 w-3" style={{ color }} />
              {type.replace("_", " ")}
            </div>
          );
        })}
      </div>

      <div className="h-[600px] rounded-lg overflow-hidden border border-[var(--mil-border)]">
        <MapContainer center={[39.8283, -98.5795]} zoom={4} className="h-full w-full" style={{ background: "#1a2418" }}>
          <TileLayer
            attribution='&copy; Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />

          {displayLocations.map((loc) => (
            <CircleMarker
              key={loc.id}
              center={[loc.lat, loc.lng]}
              radius={6}
              pathOptions={{
                color: TYPE_COLORS[loc.type],
                fillColor: TYPE_COLORS[loc.type],
                fillOpacity: 0.7,
                weight: 2,
              }}
            >
              <Popup>
                <strong>{loc.name}</strong>
                <p>{loc.city}, {loc.country}</p>
                <p>Risk: {loc.riskScore}%</p>
              </Popup>
            </CircleMarker>
          ))}

          {activeShipments.map((s, i) => {
            const offset = Math.sin((tick + i) * 0.3) * 0.1;
            return (
              <Polyline
                key={s.id}
                positions={[
                  [s.originLat, s.originLng],
                  [s.currentLat + offset, s.currentLng + offset],
                  [s.destLat, s.destLng],
                ]}
                pathOptions={{
                  color: s.riskScore > 70 ? "#ef4444" : "#10b981",
                  weight: 2,
                  opacity: 0.6,
                  dashArray: "8 4",
                }}
              />
            );
          })}

          {activeShipments.map((s, i) => (
            <CircleMarker
              key={`truck-${s.id}`}
              center={[s.currentLat + Math.sin((tick + i) * 0.3) * 0.1, s.currentLng]}
              radius={4}
              pathOptions={{
                color: "#f59e0b",
                fillColor: "#f59e0b",
                fillOpacity: 1,
                weight: 2,
              }}
            >
              <Popup>
                <strong>{s.id}</strong>
                <p>{s.cargo} — {s.status}</p>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <motion.div
        className="absolute bottom-4 left-4 z-[1000] flex gap-2"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Badge variant="success">● Live Cargo Tracking</Badge>
        <Badge variant="info">{activeShipments.length} Active Routes</Badge>
        <Badge variant="warning">{displayLocations.length} Network Nodes</Badge>
      </motion.div>
    </div>
  );
}
