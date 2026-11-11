/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import type { Facility } from "@/lib/data/facilities";
import type { LatLng, RouteResult } from "@/lib/routing";
import { MAP_CONFIG } from "@/lib/map-config";

interface FacilityMapProps {
  facilities: Facility[];
  selectedFacilityId: string | null;
  origin: LatLng | null;
  route: RouteResult | null;
  isPickingOrigin: boolean;
  selectedCity: string;
  onSelectFacility: (id: string) => void;
  onPickOrigin: (point: LatLng) => void;
}

export function FacilityMap({
  facilities,
  selectedFacilityId,
  origin,
  route,
  isPickingOrigin,
  selectedCity,
  onSelectFacility,
  onPickOrigin,
}: FacilityMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const originMarkerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Inisialisasi peta Leaflet (Client-side)
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const leafletModule = await import("leaflet");
        const L = (leafletModule as any).default || leafletModule;

        if (!containerRef.current || !isMounted) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        if ((containerRef.current as any)._leaflet_id) {
          (containerRef.current as any)._leaflet_id = null;
        }

        const cityConfig =
          MAP_CONFIG.cityCenters[selectedCity as keyof typeof MAP_CONFIG.cityCenters] ||
          MAP_CONFIG.cityCenters.Jakarta;

        const map = L.map(containerRef.current, {
          center: cityConfig.center,
          zoom: cityConfig.zoom,
          minZoom: MAP_CONFIG.minZoom,
          maxZoom: MAP_CONFIG.maxZoom,
          zoomControl: true, // kontrol zoom di kiri atas (+ / -) seperti di screenshot
        });

        // Tile Layer OpenStreetMap persis di screenshot
        const tileLayer = L.tileLayer(MAP_CONFIG.tileLayerUrl, {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
          maxZoom: MAP_CONFIG.maxZoom,
        });

        tileLayer.addTo(map);

        const markersGroup = L.layerGroup().addTo(map);
        markersLayerRef.current = markersGroup;

        const routeGroup = L.layerGroup().addTo(map);
        routeLayerRef.current = routeGroup;

        mapInstanceRef.current = map;
        setIsLoading(false);
      } catch (err: unknown) {
        console.error("Gagal menginisialisasi Leaflet map:", err);
        if (isMounted) {
          setLoadError(
            "Peta gagal dimuat. Periksa koneksi internet Anda atau refresh halaman."
          );
          setIsLoading(false);
        }
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Center saat kota berubah
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const cityConfig =
      MAP_CONFIG.cityCenters[selectedCity as keyof typeof MAP_CONFIG.cityCenters];
    if (cityConfig) {
      map.flyTo(cityConfig.center, cityConfig.zoom, { duration: 0.8 });
    }
  }, [selectedCity]);

  // Klik di peta untuk memilih titik asal saat mode `isPickingOrigin` aktif
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    function handleClick(e: any) {
      if (isPickingOrigin) {
        onPickOrigin({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    }

    map.on("click", handleClick);

    try {
      const container = map.getContainer();
      if (container) {
        container.style.cursor = isPickingOrigin ? "crosshair" : "";
      }
    } catch {
      // Container belum siap
    }

    return () => {
      map.off("click", handleClick);
    };
  }, [isPickingOrigin, onPickOrigin]);

  // Render Marker Fasilitas menggunakan CircleMarker persis di screenshot & peta.js
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    import("leaflet").then((mod) => {
      const L = (mod as any).default || mod;
      markersGroup.clearLayers();

      facilities.forEach((facility) => {
        const isSelected = facility.id === selectedFacilityId;
        const color = MAP_CONFIG.colors[facility.category] || "#294bc3";

        const marker = L.circleMarker([facility.latitude, facility.longitude], {
          radius: isSelected ? 10 : 7,
          color: "#ffffff",
          weight: isSelected ? 3 : 2,
          fillColor: color,
          fillOpacity: 1,
        });

        marker.on("click", () => {
          onSelectFacility(facility.id);
        });

        marker.bindTooltip(
          `<strong>${facility.name}</strong><br/><span style="font-size:10px;color:#64748b">${facility.category} · ${facility.tarif}</span>`,
          { direction: "top", offset: [0, -10] }
        );

        marker.addTo(markersGroup);

        if (isSelected) {
          marker.bringToFront();
        }
      });
    });
  }, [facilities, selectedFacilityId, onSelectFacility]);

  // Render Marker Titik Asal (Origin)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    import("leaflet").then((mod) => {
      const L = (mod as any).default || mod;
      if (originMarkerRef.current) {
        map.removeLayer(originMarkerRef.current);
        originMarkerRef.current = null;
      }

      if (origin) {
        const marker = L.circleMarker([origin.lat, origin.lng], {
          radius: 9,
          color: "#ffffff",
          weight: 3,
          fillColor: MAP_CONFIG.colors.Origin, // #16a36a persis di rute.js
          fillOpacity: 1,
        }).addTo(map);

        marker.bindTooltip("<strong>Lokasi asal Anda</strong>", {
          direction: "top",
          offset: [0, -10],
        });

        originMarkerRef.current = marker;
      }
    });
  }, [origin]);

  // Render Polyline Garis Rute Jalan (KEL2-70)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeGroup = routeLayerRef.current;
    if (!map || !routeGroup) return;

    import("leaflet").then((mod) => {
      const L = (mod as any).default || mod;
      routeGroup.clearLayers();

      if (route && route.coordinates.length > 0) {
        const polyline = L.polyline(route.coordinates, {
          color: MAP_CONFIG.colors.Route,
          weight: 5,
          opacity: 0.85,
          lineJoin: "round",
          lineCap: "round",
        }).addTo(routeGroup);

        const bounds = polyline.getBounds();
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    });
  }, [route]);

  // Zoom to selected facility
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedFacilityId || route) return;

    const facility = facilities.find((f) => f.id === selectedFacilityId);
    if (facility) {
      map.flyTo([facility.latitude, facility.longitude], 15, {
        duration: 0.6,
      });
    }
  }, [selectedFacilityId, facilities, route]);

  return (
    <div className="map-container" style={{ position: "relative", width: "100%", height: "100%", minHeight: "570px" }}>
      {/* Container Peta Leaflet */}
      <div id="map" ref={containerRef} style={{ width: "100%", height: "100%", minHeight: "570px" }} />

      {/* Mode Klik Titik Asal Banner */}
      {isPickingOrigin && (
        <div style={{ position: "absolute", top: "12px", left: "55px", zIndex: 500, display: "flex", alignItems: "center", gap: "8px", borderRadius: "20px", background: "#16a36a", padding: "6px 14px", fontSize: "11px", fontWeight: 600, color: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}>
          <span>● Klik sembarang titik di peta untuk menentukan lokasi asal</span>
        </div>
      )}

      {/* Map Legend (Top Right persis di screenshot) */}
      <div className="map-legend">
        <span><i className="dot spklu" /> SPKLU</span>
        <span><i className="dot spbklu" /> SPBKLU</span>
        <span><i className="dot showroom" /> Showroom</span>
        {origin && (
          <span style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: "8px" }}>
            <i className="dot" style={{ backgroundColor: MAP_CONFIG.colors.Origin }} /> Asal
          </span>
        )}
      </div>

      {/* Note Peta di Sudut Kanan Bawah persis screenshot */}
      <div className="map-note">
        Peta fasilitas EV
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#2851d5] border-t-transparent" />
          <p className="mt-2.5 text-xs text-[#8795ad]">Memuat peta fasilitas...</p>
        </div>
      )}

      {/* Error Message */}
      {loadError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/95 p-6 text-center">
          <p className="text-xs font-semibold text-rose-600">{loadError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 rounded-lg bg-[#2e55d4] px-3 py-1.5 text-xs font-semibold text-white"
          >
            Muat Ulang
          </button>
        </div>
      )}
    </div>
  );
}

export default FacilityMap;
