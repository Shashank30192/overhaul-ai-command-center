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

interface RiskMonitorMapProps {
  shipment: Shipment;
}

export function RiskMonitorMap({ shipment }: RiskMonitorMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    import("leaflet/dist/leaflet.css");
  }, []);

  const centerLat = (shipment.currentLat + shipment.destLat) / 2;
  const centerLng = (shipment.currentLng + shipment.destLng) / 2;

  if (!mounted) {
    return <div className="h-full w-full bg-[#1a2418] animate-pulse" />;
  }

  return (
    <div className="risk-map-tint h-full w-full">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={6}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; Esri'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />

        <Polyline
          positions={[
            [shipment.originLat, shipment.originLng],
            [shipment.currentLat, shipment.currentLng],
            [shipment.destLat, shipment.destLng],
          ]}
          pathOptions={{ color: "#3b82f6", weight: 3, opacity: 0.9 }}
        />

        <Circle
          center={[shipment.currentLat, shipment.currentLng]}
          radius={45000}
          pathOptions={{
            color: "#ef4444",
            fillColor: "#ef4444",
            fillOpacity: 0.18,
            weight: 1,
          }}
        />

        <CircleMarker
          center={[shipment.originLat, shipment.originLng]}
          radius={6}
          pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 1, weight: 2 }}
        >
          <Popup>Origin: {shipment.origin}</Popup>
        </CircleMarker>

        <CircleMarker
          center={[shipment.currentLat, shipment.currentLng]}
          radius={8}
          pathOptions={{ color: "#f59e0b", fillColor: "#f59e0b", fillOpacity: 1, weight: 2 }}
        >
          <Popup>
            <strong>{shipment.id}</strong>
            <p>{shipment.cargo}</p>
            <p>Risk: {shipment.riskScore}%</p>
          </Popup>
        </CircleMarker>

        <CircleMarker
          center={[shipment.destLat, shipment.destLng]}
          radius={6}
          pathOptions={{ color: "#22c55e", fillColor: "#22c55e", fillOpacity: 1, weight: 2 }}
        >
          <Popup>Destination: {shipment.destination}</Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}
