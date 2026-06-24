"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { RiskHotspot, RiskCategory } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((m) => m.CircleMarker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

const CATEGORY_COLORS: Record<RiskCategory, string> = {
  theft: "#ef4444",
  fraud: "#f59e0b",
  weather: "#3b82f6",
  political: "#a855f7",
  disruption: "#ec4899",
};

const CATEGORY_LABELS: Record<RiskCategory, string> = {
  theft: "Theft Hotspots",
  fraud: "Fraud Hotspots",
  weather: "Weather Risks",
  political: "Political Risks",
  disruption: "Supply Chain Disruptions",
};

interface RiskHeatmapProps {
  hotspots: RiskHotspot[];
  activeCategories: RiskCategory[];
}

export function RiskHeatmap({ hotspots, activeCategories }: RiskHeatmapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    import("leaflet/dist/leaflet.css");
  }, []);

  const filtered = hotspots.filter((h) => activeCategories.includes(h.category));

  if (!mounted) {
    return <div className="h-[500px] rounded-lg bg-[var(--mil-surface)] animate-pulse" />;
  }

  return (
    <div className="relative h-[500px] rounded-lg overflow-hidden border border-[var(--mil-border)] risk-map-tint">
      <MapContainer center={[39.8283, -98.5795]} zoom={4} className="h-full w-full" style={{ background: "#0a0a0a" }}>
        <TileLayer
          attribution='&copy; Esri'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        {filtered.map((h) => (
          <CircleMarker
            key={h.id}
            center={[h.lat, h.lng]}
            radius={h.intensity / 8}
            pathOptions={{
              color: CATEGORY_COLORS[h.category],
              fillColor: CATEGORY_COLORS[h.category],
              fillOpacity: 0.5,
              weight: 1,
            }}
          >
            <Popup>
              <div className="text-sm">
                <strong>{h.label}</strong>
                <p>{h.region}</p>
                <p>Intensity: {h.intensity}%</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      <div className="absolute bottom-4 left-4 z-[1000] flex flex-wrap gap-2">
        {activeCategories.map((cat) => (
          <Badge key={cat} className={cn("text-xs")} style={{ borderColor: CATEGORY_COLORS[cat], color: CATEGORY_COLORS[cat] }}>
            {CATEGORY_LABELS[cat]}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export { CATEGORY_LABELS, CATEGORY_COLORS };
