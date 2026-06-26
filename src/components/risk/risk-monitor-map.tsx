"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Shipment } from "@/lib/types";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((m) => m.CircleMarker), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then((m) => m.Circle), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((m) => m.Polyline), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });

interface RiskMonitorMapProps {
  shipment: Shipment;
}

// Generate waypoints between two coords
function interpolate(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  steps: number
): [number, number][] {
  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    return [lat1 + (lat2 - lat1) * t, lng1 + (lng2 - lng1) * t] as [number, number];
  });
}

export function RiskMonitorMap({ shipment }: RiskMonitorMapProps) {
  const [mounted, setMounted] = useState(false);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);

  useEffect(() => {
    setMounted(true);
    Promise.all([
      import("leaflet/dist/leaflet.css"),
      import("leaflet"),
    ]).then(([, leaflet]) => setL(leaflet.default ?? leaflet as unknown as typeof import("leaflet")));
  }, []);

  const centerLat = (shipment.originLat + shipment.destLat) / 2;
  const centerLng = (shipment.originLng + shipment.destLng) / 2;

  // Route waypoints as blue square dots (matching Overhaul product style)
  const routeWaypoints = [
    ...interpolate(shipment.originLat, shipment.originLng, shipment.currentLat, shipment.currentLng, 16),
    ...interpolate(shipment.currentLat, shipment.currentLng, shipment.destLat, shipment.destLng, 10),
  ];

  if (!mounted) {
    return <div className="h-full w-full bg-[#0d1117] animate-pulse" />;
  }

  // Custom DivIcon for the truck marker
  const truckIcon = L ? L.divIcon({
    html: `<div style="
      background:#1d4ed8;border:2px solid #60a5fa;border-radius:4px;
      width:22px;height:22px;display:flex;align-items:center;justify-content:center;
      font-size:12px;box-shadow:0 0 12px rgba(59,130,246,0.6);">🚛</div>`,
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  }) : undefined;

  const pickupIcon = L ? L.divIcon({
    html: `<div style="
      background:#1d4ed8;border:2px solid #93c5fd;border-radius:50%;
      width:24px;height:24px;display:flex;align-items:center;justify-content:center;
      color:white;font-size:10px;font-weight:700;">P</div>`,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  }) : undefined;

  const destIcon = L ? L.divIcon({
    html: `<div style="
      background:#059669;border:2px solid #34d399;border-radius:50%;
      width:24px;height:24px;display:flex;align-items:center;justify-content:center;
      color:white;font-size:10px;font-weight:700;">D</div>`,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  }) : undefined;

  return (
    <div className="h-full w-full" style={{ background: "#0d1117" }}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={5}
        className="h-full w-full"
        zoomControl={false}
      >
        {/* Dark street map tiles matching Overhaul product */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_matter_no_labels/{z}/{x}/{y}{r}.png"
        />
        {/* Country/road labels on top */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_matter_only_labels/{z}/{x}/{y}{r}.png"
          attribution=""
          opacity={0.8}
        />

        {/* Red risk zone around current position */}
        <Circle
          center={[shipment.currentLat, shipment.currentLng]}
          radius={180000}
          pathOptions={{
            color: "#ef444466",
            fillColor: "#ef4444",
            fillOpacity: 0.14,
            weight: 1.5,
            dashArray: "4 4",
          }}
        />

        {/* Route line */}
        <Polyline
          positions={routeWaypoints}
          pathOptions={{ color: "#2563eb", weight: 2.5, opacity: 0.6 }}
        />

        {/* Waypoint dots (blue squares matching product) */}
        {routeWaypoints.filter((_, i) => i % 2 === 0).map((pos, i) => {
          const isPast = i < 8;
          return (
            <CircleMarker
              key={i}
              center={pos}
              radius={3.5}
              pathOptions={{
                color: isPast ? "#93c5fd" : "#475569",
                fillColor: isPast ? "#3b82f6" : "#334155",
                fillOpacity: 1,
                weight: 1.5,
              }}
            />
          );
        })}

        {/* Pickup marker */}
        {pickupIcon && (
          <Marker position={[shipment.originLat, shipment.originLng]} icon={pickupIcon}>
            <Popup>Origin: {shipment.origin}</Popup>
          </Marker>
        )}

        {/* Current truck position */}
        {truckIcon && (
          <Marker position={[shipment.currentLat, shipment.currentLng]} icon={truckIcon}>
            <Popup>
              <strong>{shipment.id}</strong> · Risk {shipment.riskScore}%<br />
              {shipment.cargo}
            </Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {destIcon && (
          <Marker position={[shipment.destLat, shipment.destLng]} icon={destIcon}>
            <Popup>Destination: {shipment.destination}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
