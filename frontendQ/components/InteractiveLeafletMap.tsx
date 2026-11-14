"use client";

import React, { useEffect, useRef } from "react";

export interface MapFacilityMarker {
  id: number;
  name: string;
  category: "Showroom" | "SPKLU" | "SPBKLU";
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  operatingHours: string;
  contact: string;
  powerSpec: string;
  operator: string;
  active: boolean;
}

interface InteractiveLeafletMapProps {
  facilities: MapFacilityMarker[];
  selectedFacilityId?: number | null;
  onSelectFacility?: (facility: MapFacilityMarker) => void;
  originCoords?: { lat: number; lon: number; label?: string } | null;
  routeCoordinates?: [number, number][] | null;
  onMapClick?: (lat: number, lon: number) => void;
  heightClassName?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  SPKLU: "#2563EB",
  SPBKLU: "#10B981",
  Showroom: "#D97706",
};

export default function InteractiveLeafletMap({
  facilities,
  selectedFacilityId,
  onSelectFacility,
  originCoords,
  routeCoordinates,
  onMapClick,
  heightClassName = "h-[480px]",
}: InteractiveLeafletMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const onMapClickRef = useRef(onMapClick);
  const onSelectFacilityRef = useRef(onSelectFacility);

  onMapClickRef.current = onMapClick;
  onSelectFacilityRef.current = onSelectFacility;

  useEffect(() => {
    let mounted = true;

    async function initMap() {
      if (!containerRef.current || mapRef.current) return;
      const L = (await import("leaflet")).default;
      if (!mounted || !containerRef.current) return;

      leafletRef.current = L;
      const map = L.map(containerRef.current, {
        center: [-6.2, 106.82],
        zoom: 11,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const group = L.layerGroup().addTo(map);
      mapRef.current = map;
      layerGroupRef.current = group;

      map.on("click", (evt: any) => {
        if (onMapClickRef.current && evt?.latlng) {
          onMapClickRef.current(
            Number(evt.latlng.lat.toFixed(6)),
            Number(evt.latlng.lng.toFixed(6))
          );
        }
      });

      renderOverlays();
    }

    initMap();

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, []);

  function renderOverlays() {
    const L = leafletRef.current;
    const map = mapRef.current;
    const group = layerGroupRef.current;
    if (!L || !map || !group) return;

    group.clearLayers();
    const boundsPoints: [number, number][] = [];

    for (const fac of facilities) {
      if (!Number.isFinite(fac.latitude) || !Number.isFinite(fac.longitude)) {
        continue;
      }
      const isSelected = fac.id === selectedFacilityId;
      const color = CATEGORY_COLORS[fac.category] || "#1E40AF";

      const marker = L.circleMarker([fac.latitude, fac.longitude], {
        radius: isSelected ? 11 : 8,
        fillColor: color,
        color: isSelected ? "#0F172A" : "#FFFFFF",
        weight: isSelected ? 3 : 2,
        opacity: 1,
        fillOpacity: 0.92,
      });

      marker.bindPopup(
        `<div style="font-family: Inter, sans-serif; min-width: 190px;">
          <div style="font-size: 11px; font-weight: 700; color: ${color}; text-transform: uppercase;">${fac.category} • ${fac.city}</div>
          <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-top: 2px;">${fac.name}</div>
          <div style="font-size: 11px; color: #475569; margin-top: 3px;">${fac.address}</div>
          <div style="font-size: 11px; color: #334155; margin-top: 4px;"><strong>Jam:</strong> ${fac.operatingHours}</div>
        </div>`
      );

      marker.on("click", () => {
        if (onSelectFacilityRef.current) {
          onSelectFacilityRef.current(fac);
        }
      });

      marker.addTo(group);
      boundsPoints.push([fac.latitude, fac.longitude]);
    }

    if (
      originCoords &&
      Number.isFinite(originCoords.lat) &&
      Number.isFinite(originCoords.lon)
    ) {
      const originMarker = L.circleMarker([originCoords.lat, originCoords.lon], {
        radius: 9,
        fillColor: "#EF4444",
        color: "#FFFFFF",
        weight: 2.5,
        opacity: 1,
        fillOpacity: 0.95,
      });
      originMarker.bindPopup(
        `<div style="font-family: Inter, sans-serif;">
          <div style="font-size: 11px; font-weight: 700; color: #EF4444;">TITIK ASAL PENGGUNA</div>
          <div style="font-size: 12px; font-weight: 600; color: #0F172A;">${
            originCoords.label ||
            `${originCoords.lat.toFixed(4)}, ${originCoords.lon.toFixed(4)}`
          }</div>
        </div>`
      );
      originMarker.addTo(group);
      boundsPoints.push([originCoords.lat, originCoords.lon]);
    }

    if (routeCoordinates && routeCoordinates.length >= 2) {
      const poly = L.polyline(routeCoordinates, {
        color: "#2563EB",
        weight: 4,
        opacity: 0.88,
        dashArray: "8, 6",
      });
      poly.addTo(group);
      try {
        map.fitBounds(poly.getBounds(), { padding: [36, 36] });
        return;
      } catch {
        // fallback ke boundsPoints
      }
    }

    if (selectedFacilityId) {
      const selected = facilities.find((f) => f.id === selectedFacilityId);
      if (selected) {
        map.setView([selected.latitude, selected.longitude], 14, {
          animate: true,
        });
        return;
      }
    }

    if (boundsPoints.length > 1) {
      try {
        map.fitBounds(boundsPoints, { padding: [36, 36], maxZoom: 13 });
      } catch {
        // abaikan bila ukuran kontainer belum siap
      }
    }
  }

  useEffect(() => {
    renderOverlays();
  }, [facilities, selectedFacilityId, originCoords, routeCoordinates]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div
        ref={containerRef}
        data-testid="interactive-leaflet-map"
        className={`w-full ${heightClassName} z-0`}
      />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            SPKLU (Charging)
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            SPBKLU (Tukar Baterai)
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-600" />
            Showroom EV
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            Titik Asal Anda
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          Klik marker untuk detail fasilitas atau klik peta untuk memilih titik koordinat
        </span>
      </div>
    </div>
  );
}

