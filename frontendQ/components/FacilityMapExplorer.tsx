"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  CITIES,
  FACILITY_CATEGORIES,
  getActiveFacilities,
  type City,
  type Facility,
  type FacilityCategory,
} from "@/lib/data/facilities";
import { fetchFacilities } from "@/lib/api/facilities";
import type { LatLng, RouteResult } from "@/lib/routing";
import { FacilityRoutePlanner } from "./FacilityRoutePlanner";
import { FacilityDetailCard } from "./FacilityDetailCard";

// Dynamic import Leaflet component agar aman saat SSR Next.js
const FacilityMap = dynamic(
  () => import("./FacilityMap"),
  {
    ssr: false,
    loading: () => (
      <div className="map-container" style={{ display: "grid", placeItems: "center", background: "#eaf0f3" }}>
        <p style={{ fontSize: "11px", color: "#8795ad" }}>Memuat peta fasilitas...</p>
      </div>
    ),
  }
);

export function FacilityMapExplorer() {
  // Data fasilitas aktif: inisialisasi awal langsung dari data lokal agar peta dan daftar selalu siap
  const [allActiveFacilities, setAllActiveFacilities] = useState<Facility[]>(() => getActiveFacilities());
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(false);

  // Filter State (KEL2-71)
  const [selectedCity, setSelectedCity] = useState<City>("Semua");
  const [selectedCategory, setSelectedCategory] = useState<"Semua" | FacilityCategory>("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Selection & Route State (KEL2-70 & KEL2-71)
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>("f1");
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [originLabel, setOriginLabel] = useState<string>("");
  const [isPickingOrigin, setIsPickingOrigin] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);

  // Sinkronisasi data dari backend (jika backend aktif)
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await fetchFacilities({ activeOnly: true });
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setAllActiveFacilities(data);
        }
      } catch {
        // Tetap menggunakan data lokal yang sudah diinisialisasi
      } finally {
        if (isMounted) setIsLoadingFacilities(false);
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
    if (!selectedFacilityId) return null;
    return allActiveFacilities.find((f) => f.id === selectedFacilityId) || null;
  }, [allActiveFacilities, selectedFacilityId]);

  // Handler pergantian kota: sinkronkan fasilitas default pada kota tersebut
  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    if (city !== "Semua") {
      const firstInCity = allActiveFacilities.find((f) => f.city === city);
      if (firstInCity) {
        setSelectedFacilityId(firstInCity.id);
        setRouteResult(null);
      }
    }
  };

  // Handler pemilihan fasilitas dari daftar atau marker
  const handleSelectFacility = (id: string) => {
    setSelectedFacilityId(id);
    setRouteResult(null);
  };

  const getTagClass = (category: FacilityCategory) => {
    if (category === "SPBKLU") return "spbklu";
    if (category === "Showroom") return "showroom";
    return "spklu";
  };

  return (
    <div>
      {/* 1. FILTER BAR (Kota di kiri, Kategori di kanan persis di screenshot) */}
      <section className="filters" aria-label="Filter fasilitas">
        {/* Filter Kota */}
        <div className="city-filters" id="cityFilters">
          {CITIES.map((city) => {
            const isSelected = selectedCity === city;
            return (
              <button
                key={city}
                type="button"
                onClick={() => handleSelectCity(city)}
                className={`chip ${isSelected ? "selected" : ""}`}
              >
                {city === "Semua" ? "● Semua Kota" : city}
              </button>
            );
          })}
        </div>

        {/* Filter Kategori */}
        <div className="type-filters" id="typeFilters">
          <button
            type="button"
            onClick={() => setSelectedCategory("Semua")}
            className={`chip ${selectedCategory === "Semua" ? "selected" : ""}`}
          >
            Semua
          </button>
          {FACILITY_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`chip ${isSelected ? "selected" : ""}`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. PANEL RENCANA PERJALANAN (Full-Width Card di atas Peta & List) */}
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

      {/* 3. LOWER SECTION (2 Kolom: Kiri Daftar Fasilitas 290px, Kanan Peta Interaktif & Detail Card) */}
      <section className="map-layout">
        {/* Kolom Kiri: Daftar Fasilitas */}
        <div className="facility-panel">
          {/* Header Panel Daftar */}
          <div className="panel-top">
            <b>Daftar Fasilitas</b>
            <span id="resultCount">{filteredFacilities.length} lokasi</span>
          </div>

          {/* Kolom Pencarian */}
          <input
            id="searchInput"
            type="search"
            placeholder="Cari nama atau alamat fasilitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />

          {/* List Card Fasilitas */}
          {isLoadingFacilities && allActiveFacilities.length === 0 ? (
            <div className="empty-state">
              Memuat data fasilitas...
            </div>
          ) : filteredFacilities.length === 0 ? (
            <div className="empty-state" id="emptyState">
              Fasilitas tidak ditemukan.
              <button
                type="button"
                onClick={() => {
                  setSelectedCity("Semua");
                  setSelectedCategory("Semua");
                  setSearchQuery("");
                }}
                style={{
                  display: "block",
                  margin: "8px auto 0",
                  color: "#2851d5",
                  background: "transparent",
                  border: "none",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontSize: "11px",
                }}
              >
                Reset filter
              </button>
            </div>
          ) : (
            <div className="facility-list" id="facilityList">
              {filteredFacilities.map((f) => {
                const isSelected = f.id === selectedFacilityId;
                return (
                  <article
                    key={f.id}
                    onClick={() => handleSelectFacility(f.id)}
                    className={`facility-card ${isSelected ? "active" : ""}`}
                  >
                    <div className="facility-card-top">
                      <span className={`type-tag ${getTagClass(f.category)}`}>
                        {f.category}
                      </span>
                      <span className="status-tag status-active">
                        Aktif
                      </span>
                      <span className="distance">
                        {f.distance || "Lokasi tersedia"}
                      </span>
                    </div>

                    <h3>{f.name}</h3>
                    <p>{f.address}</p>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Peta Interaktif Leaflet + Floating Detail Card */}
        <div className="map-wrap">
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
              setOriginLabel("Lokasi dipilih di peta");
              setIsPickingOrigin(false);
            }}
          />

          {/* Floating Detail Card di pojok kanan bawah peta persis di screenshot */}
          {selectedFacility && (
            <FacilityDetailCard
              facility={selectedFacility}
              origin={origin}
              onClose={() => setSelectedFacilityId(null)}
            />
          )}
        </div>
      </section>
    </div>
  );
}
