"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  CITIES,
  FACILITY_CATEGORIES,
  type City,
  type Facility,
  type FacilityCategory,
} from "@/lib/data/facilities";
import { fetchFacilities } from "@/lib/api/facilities";
import type { LatLng, RouteResult } from "@/lib/routing";
import { MAP_CONFIG } from "@/lib/map-config";
import { FacilityRoutePlanner } from "./FacilityRoutePlanner";
import { FacilityDetailCard } from "./FacilityDetailCard";

// Dynamic import Leaflet component agar aman saat SSR Next.js
const FacilityMap = dynamic(
  () => import("./FacilityMap").then((mod) => mod.FacilityMap),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full h-[520px] @5xl:h-[640px] flex flex-col items-center justify-center rounded-2xl border border-line bg-slate-100 animate-pulse">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-electric border-t-transparent"></div>
        <p className="mt-3 text-sm font-semibold text-slate-700">Memuat peta fasilitas...</p>
      </div>
    ),
  }
);

export function FacilityMapExplorer() {
  // Data fasilitas aktif dari API backend / data demo fallback
  const [allActiveFacilities, setAllActiveFacilities] = useState<Facility[]>([]);
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(true);

  // Filter State
  const [selectedCity, setSelectedCity] = useState<City>("Jakarta");
  const [selectedCategory, setSelectedCategory] = useState<"Semua" | FacilityCategory>("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Tab State pada kolom kiri: "list" atau "route"
  const [activeTab, setActiveTab] = useState<"list" | "route">("list");

  // Selection & Route State (KEL2-70)
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>("f1");
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [originLabel, setOriginLabel] = useState<string>("");
  const [isPickingOrigin, setIsPickingOrigin] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);

  // Fetch facilities dari backend (dengan fallback otomatis)
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoadingFacilities(true);
      const data = await fetchFacilities({ activeOnly: true });
      if (isMounted) {
        setAllActiveFacilities(data);
        setIsLoadingFacilities(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter fasilitas aktif berdasarkan kota, kategori, dan kata kunci pencarian
  const filteredFacilities = useMemo(() => {
    return allActiveFacilities.filter((f) => {
      const cityMatch = selectedCity === "Semua" || f.city === selectedCity;
      const categoryMatch = selectedCategory === "Semua" || f.category === selectedCategory;
      const searchMatch =
        !searchQuery.trim() ||
        (f.name + " " + f.address + " " + f.category + " " + f.city)
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase());

      return cityMatch && categoryMatch && searchMatch;
    });
  }, [allActiveFacilities, selectedCity, selectedCategory, searchQuery]);

  // Fasilitas yang sedang terpilih
  const selectedFacility = useMemo(() => {
    return (
      allActiveFacilities.find((f) => f.id === selectedFacilityId) ||
      filteredFacilities[0] ||
      null
    );
  }, [allActiveFacilities, selectedFacilityId, filteredFacilities]);

  // Handler pemilihan fasilitas
  const handleSelectFacility = (id: string) => {
    setSelectedFacilityId(id);
  };

  // Handler tombol "Rencanakan Rute ke Sini" dari kartu detail
  const handlePlanRouteToFacility = (facility: Facility) => {
    setSelectedFacilityId(facility.id);
    setActiveTab("route");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* FILTER BAR: Kota + Kategori + Search */}
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 shadow-xs @3xl:flex-row @3xl:items-center @3xl:justify-between">
        {/* Filter Kota */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-mute mr-1">Kota:</span>
          {CITIES.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setSelectedCity(city)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                selectedCity === city
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-canvas text-ink hover:bg-slate-100"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Filter Kategori */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-mute mr-1">Kategori:</span>
          <button
            type="button"
            onClick={() => setSelectedCategory("Semua")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              selectedCategory === "Semua"
                ? "bg-electric text-white shadow-xs"
                : "bg-canvas text-ink hover:bg-slate-100"
            }`}
          >
            Semua
          </button>
          {FACILITY_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const catColor = MAP_CONFIG.colors[cat];
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  backgroundColor: isSelected ? catColor : undefined,
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  isSelected
                    ? "text-white shadow-xs"
                    : "bg-canvas text-ink hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Input Pencarian */}
        <div className="relative min-w-[200px] @3xl:w-64">
          <input
            type="text"
            placeholder="Cari fasilitas, lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-line bg-canvas py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-mute focus:border-electric focus:bg-white focus:outline-none"
          />
          <svg
            className="absolute left-2.5 top-2 h-3.5 w-3.5 text-mute"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* MAIN CONTENT: 2 Kolom (Kiri: Tabs List/Route, Kanan: Peta Interaktif) */}
      <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-12">
        {/* KOLOM KIRI (5/12): Tabs Navigasi Antara Daftar Fasilitas & Kalkulator Rute */}
        <div className="flex flex-col gap-4 @4xl:col-span-5">
          {/* TAB HEADER */}
          <div className="grid grid-cols-2 rounded-xl bg-canvas p-1 border border-line">
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className={`rounded-lg py-2 text-xs font-bold transition ${
                activeTab === "list"
                  ? "bg-white text-ink shadow-xs"
                  : "text-mute hover:text-ink"
              }`}
            >
              Daftar Fasilitas ({filteredFacilities.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("route")}
              className={`rounded-lg py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === "route"
                  ? "bg-white text-ink shadow-xs"
                  : "text-mute hover:text-ink"
              }`}
            >
              <span>Rencana Rute</span>
              {routeResult && (
                <span className="h-2 w-2 rounded-full bg-electric animate-pulse"></span>
              )}
            </button>
          </div>

          {/* TAB CONTENT: TAB DAFTAR FASILITAS */}
          {activeTab === "list" && (
            <div className="flex flex-col gap-3">
              {isLoadingFacilities ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-white p-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-electric border-t-transparent"></div>
                  <p className="mt-2 text-xs text-mute">Memuat fasilitas aktif...</p>
                </div>
              ) : filteredFacilities.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center">
                  <p className="text-sm font-semibold text-ink">Tidak ada fasilitas aktif</p>
                  <p className="mt-1 text-xs text-mute">
                    Tidak ditemukan fasilitas yang cocok dengan filter di kota atau kategori ini.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCity("Semua");
                      setSelectedCategory("Semua");
                      setSearchQuery("");
                    }}
                    className="mt-3 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-slate-200"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-[520px] @5xl:max-h-[640px] overflow-y-auto pr-1">
                  {filteredFacilities.map((f) => {
                    const isSelected = f.id === selectedFacilityId;
                    const catColor = MAP_CONFIG.colors[f.category];
                    return (
                      <div
                        key={f.id}
                        onClick={() => handleSelectFacility(f.id)}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                          isSelected
                            ? "border-electric bg-blue-50/40 shadow-xs"
                            : "border-line bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: catColor }}
                            />
                            <span className="text-[11px] font-bold text-slate-600">
                              {f.category}
                            </span>
                            <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-500 font-medium">
                              {f.city}
                            </span>
                          </div>
                          {f.isDemo && (
                            <span className="rounded bg-amber-50 border border-amber-200 px-1.5 py-0.2 text-[9px] font-bold text-amber-700">
                              Data demo
                            </span>
                          )}
                        </div>

                        <h4 className="mt-1 text-sm font-bold text-ink">{f.name}</h4>
                        <p className="mt-0.5 text-xs text-mute line-clamp-1">{f.address}</p>

                        <div className="mt-2.5 flex items-center justify-between text-[11px] border-t border-line/60 pt-2">
                          <span className="font-semibold text-slate-700">{f.tarif}</span>
                          <span className="text-mute">{f.power}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: TAB PERENCANA RUTE (KEL2-70) */}
          {activeTab === "route" && (
            <FacilityRoutePlanner
              activeFacilities={allActiveFacilities}
              selectedFacility={selectedFacility}
              origin={origin}
              originLabel={originLabel}
              isPickingOrigin={isPickingOrigin}
              routeResult={routeResult}
              onSetOrigin={(point, label) => {
                setOrigin(point);
                setOriginLabel(label);
              }}
              onSelectFacility={handleSelectFacility}
              onTogglePickOrigin={(active) => setIsPickingOrigin(active)}
              onRouteCalculated={(result) => setRouteResult(result)}
            />
          )}
        </div>

        {/* KOLOM KANAN (7/12): Peta Digital Interaktif Leaflet + Card Detail */}
        <div className="flex flex-col gap-4 @4xl:col-span-7">
          <FacilityMap
            facilities={filteredFacilities}
            selectedFacilityId={selectedFacilityId}
            origin={origin}
            route={routeResult}
            isPickingOrigin={isPickingOrigin}
            selectedCity={selectedCity}
            onSelectFacility={handleSelectFacility}
            onPickOrigin={(point) => {
              setOrigin(point);
              setOriginLabel("Titik Dipilih di Peta");
              setIsPickingOrigin(false);
            }}
          />

          {/* Card Detail Fasilitas Terpilih (KEL2-71) */}
          {selectedFacility && (
            <FacilityDetailCard
              facility={selectedFacility}
              onClose={() => setSelectedFacilityId(null)}
              onPlanRoute={handlePlanRouteToFacility}
            />
          )}
        </div>
      </div>
    </div>
  );
}

