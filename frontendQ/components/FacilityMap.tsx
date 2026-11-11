"use client";

import { useEffect, useRef, useState } from "react";
import type { Facility, FacilityCategory } from "@/lib/data/facilities";
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

        // Dynamic import Leaflet di sisi klien
        const L = (await import("leaflet")).default;

        // Pastikan container ada dan belum ada instance peta
        if (!containerRef.current || !isMounted) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const cityConfig =
          MAP_CONFIG.cityCenters[selectedCity as keyof typeof MAP_CONFIG.cityCenters] ||
          MAP_CONFIG.cityCenters.Jakarta;

        const map = L.map(containerRef.current, {
          center: cityConfig.center,
          zoom: cityConfig.zoom,
          minZoom: MAP_CONFIG.minZoom,
          maxZoom: MAP_CONFIG.maxZoom,
          zoomControl: false,
        });

        // Pindahkan kontrol zoom ke kanan atas agar tidak tertutup panel
        L.control.zoom({ position: "topright" }).addTo(map);

        // Pasang Tile Layer OpenStreetMap
        const tileLayer = L.tileLayer(MAP_CONFIG.tileLayerUrl, {
          attribution: MAP_CONFIG.attribution,
          maxZoom: MAP_CONFIG.maxZoom,
        });

        tileLayer.on("tileerror", () => {
          console.warn("Sebagian tile OpenStreetMap gagal dimuat.");
        });

        tileLayer.addTo(map);

        // Layer Group untuk marker fasilitas
        const markersGroup = L.layerGroup().addTo(map);
        markersLayerRef.current = markersGroup;

        // Layer Group untuk polyline rute jalan
        const routeGroup = L.layerGroup().addTo(map);
        routeLayerRef.current = routeGroup;

        mapInstanceRef.current = map;
        setIsLoading(false);
      } catch (err: any) {
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
  }, []);

  // Update Center saat kota berubah
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const cityConfig =
      MAP_CONFIG.cityCenters[selectedCity as keyof typeof MAP_CONFIG.cityCenters];
    if (cityConfig) {
      map.flyTo(cityConfig.center, cityConfig.zoom, { duration: 1 });
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

    if (containerRef.current) {
      containerRef.current.style.cursor = isPickingOrigin ? "crosshair" : "";
    }

    return () => {
      map.off("click", handleClick);
    };
  }, [isPickingOrigin, onPickOrigin]);

  // Helper pembuat icon SVG custom per kategori
  const createCategoryIcon = (category: FacilityCategory, isSelected: boolean) => {
    const color = MAP_CONFIG.colors[category] || "#0284c7";
    const size = isSelected ? 42 : 34;

    const iconSvg =
      category === "SPKLU"
        ? `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/>`
        : category === "SPBKLU"
        ? `<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2V2h8v2zm-2 2H10v2h4V6zm-4 4v8h4v-8h-4z" fill="white"/>`
        : `<path d="M3 13l1-4a2 2 0 012-1h12a2 2 0 012 1l1 4M5 17h14a2 2 0 002-2v-2H3v2a2 2 0 002 2zm2 0v2m10-2v2" stroke="white" stroke-width="2" fill="none"/>`;

    const html = `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 9999px;
        background-color: ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        border: ${isSelected ? "3px solid #ffffff" : "2px solid #ffffff"};
        transform: translate(-50%, -50%);
        transition: transform 0.2s ease, width 0.2s ease, height 0.2s ease;
        ${isSelected ? "transform: translate(-50%, -50%) scale(1.15); ring: 4px solid " + color + "33;" : ""}
      ">
        <svg width="${size * 0.55}" height="${size * 0.55}" viewBox="0 0 24 24" fill="currentColor">
          ${iconSvg}
        </svg>
      </div>
    `;

    return html;
  };

  // Render Marker Fasilitas
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    import("leaflet").then((L) => {
      markersGroup.clearLayers();

      facilities.forEach((facility) => {
        const isSelected = facility.id === selectedFacilityId;

        const customIcon = L.divIcon({
          className: "custom-facility-marker",
          html: createCategoryIcon(facility.category, isSelected),
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        const marker = L.marker([facility.latitude, facility.longitude], {
          icon: customIcon,
          title: facility.name,
        });

        marker.on("click", () => {
          onSelectFacility(facility.id);
        });

        marker.bindTooltip(
          `<strong>${facility.name}</strong><br/><span style="font-size:11px;color:#64748b">${facility.category} · ${facility.tarif}</span>`,
          { direction: "top", offset: [0, -22] }
        );

        marker.addTo(markersGroup);

        if (isSelected) {
          marker.setZIndexOffset(1000);
        }
      });
    });
  }, [facilities, selectedFacilityId, onSelectFacility]);

  // Render Marker Titik Asal (Origin)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    import("leaflet").then((L) => {
      if (originMarkerRef.current) {
        map.removeLayer(originMarkerRef.current);
        originMarkerRef.current = null;
      }

      if (origin) {
        const originHtml = `
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 9999px;
            background-color: ${MAP_CONFIG.colors.Origin};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2px solid white;
            transform: translate(-50%, -50%);
            animation: bounce 1s infinite alternate;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `;

        const originIcon = L.divIcon({
          className: "custom-origin-marker",
          html: originHtml,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        const marker = L.marker([origin.lat, origin.lng], {
          icon: originIcon,
          zIndexOffset: 1200,
        }).addTo(map);

        marker.bindTooltip("<strong>Titik Asal Anda</strong>", {
          direction: "top",
          offset: [0, -18],
          permanent: false,
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

    import("leaflet").then((L) => {
      routeGroup.clearLayers();

      if (route && route.coordinates.length > 0) {
        // Gambar polyline rute jalan nyata dari OSRM
        const polyline = L.polyline(route.coordinates, {
          color: MAP_CONFIG.colors.Route,
          weight: 5,
          opacity: 0.85,
          lineJoin: "round",
          lineCap: "round",
        }).addTo(routeGroup);

        // Zoom otomatis agar seluruh garis rute muat di layar
        const bounds = polyline.getBounds();
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
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
        duration: 0.8,
      });
    }
  }, [selectedFacilityId, facilities, route]);

  return (
    <div className="relative w-full h-[520px] @5xl:h-[640px] rounded-2xl overflow-hidden border border-line bg-slate-100 shadow-sm">
      {/* Container Leaflet */}
      <div ref={containerRef} className="w-full h-full z-0" />

      {/* Mode Memilih Titik Asal Banner */}
      {isPickingOrigin && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg animate-pulse">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Klik sembarang lokasi di peta untuk menentukan titik asal perjalanan
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-electric border-t-transparent"></div>
          <p className="mt-3 text-xs font-medium text-mute">Memuat peta fasilitas EV...</p>
        </div>
      )}

      {/* Error Message */}
      {loadError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/95 p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h4 className="mt-3 text-sm font-semibold text-ink">Gagal Memuat Peta</h4>
          <p className="mt-1 text-xs text-mute max-w-sm">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-electric px-4 py-2 text-xs font-semibold text-white hover:bg-electric/90"
          >
            Coba Muat Ulang
          </button>
        </div>
      )}

      {/* Legenda Marker Peta (Kiri Bawah) */}
      <div className="absolute bottom-3 left-3 z-10 rounded-xl border border-line bg-white/95 p-3 shadow-md backdrop-blur-xs text-xs">
        <p className="font-semibold text-ink mb-1.5 text-[11px] uppercase tracking-wider">Legenda Fasilitas</p>
        <div className="flex flex-col gap-1.5 text-[11px] text-mute">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: MAP_CONFIG.colors.SPKLU }}></span>
            <span>SPKLU (Charging Mobil/Motor)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: MAP_CONFIG.colors.SPBKLU }}></span>
            <span>SPBKLU (Swap Baterai Motor)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: MAP_CONFIG.colors.Showroom }}></span>
            <span>Showroom &amp; Edukasi EV</span>
          </div>
          {origin && (
            <div className="flex items-center gap-2 pt-1 border-t border-line/60">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: MAP_CONFIG.colors.Origin }}></span>
              <span>Titik Asal Anda</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

