"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import InteractiveLeafletMap, {
  type MapFacilityMarker,
} from "@/components/InteractiveLeafletMap";
import { apiFetch, formatRupiah } from "@/lib/api";

interface OriginPreset {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
}

interface ActiveServiceTariff {
  id: number;
  facilityId: number;
  serviceType: "CHARGING" | "SWAP";
  unit: "kWh" | "transaksi";
  priceIdr: number;
  validFrom: string;
  validUntil: string | null;
}

interface RouteResult {
  originLat: number;
  originLon: number;
  destinationLat: number;
  destinationLon: number;
  destinationName: string;
  facilityId?: number;
  distanceMeters: number;
  distanceKm: number;
  durationSeconds: number;
  durationMinutes: number;
  distanceFormatted: string;
  durationFormatted: string;
  coordinates: [number, number][];
  calculationMethod: string;
}

export default function PetaFasilitasEvPage() {
  const [facilities, setFacilities] = useState<MapFacilityMarker[]>([]);
  const [originPresets, setOriginPresets] = useState<OriginPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter PBI 11
  const [categoryFilter, setCategoryFilter] = useState<string>("Semua");
  const [cityFilter, setCityFilter] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pilihan Fasilitas & Tarif Aktif (PBI 06 + PBI 11)
  const [selectedFacility, setSelectedFacility] =
    useState<MapFacilityMarker | null>(null);
  const [activeTariff, setActiveTariff] = useState<ActiveServiceTariff | null>(
    null
  );
  const [tariffLoading, setTariffLoading] = useState(false);

  // Kalkulator Rute PBI 12
  const [selectedOriginPresetId, setSelectedOriginPresetId] =
    useState<string>("");
  const [originLat, setOriginLat] = useState<string>("-6.1944");
  const [originLon, setOriginLon] = useState<string>("106.8229");
  const [originLabel, setOriginLabel] = useState<string>(
    "Bundaran HI, Jakarta Pusat"
  );
  const [travelMode, setTravelMode] = useState<"Mobil" | "Motor">("Mobil");
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);

  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const [bootRes, facRes] = await Promise.all([
          apiFetch("/reference/bootstrap"),
          apiFetch("/facilities?activeOnly=true"),
        ]);

        const presets: OriginPreset[] = bootRes?.data?.originPresets ?? [];
        setOriginPresets(presets);
        if (presets.length > 0) {
          setSelectedOriginPresetId(presets[0].id);
          setOriginLat(String(presets[0].latitude));
          setOriginLon(String(presets[0].longitude));
          setOriginLabel(presets[0].name);
        }

        const list: MapFacilityMarker[] = facRes?.data ?? [];
        setFacilities(list);
        if (list.length > 0) {
          setSelectedFacility(list[0]);
        }
      } catch (err: any) {
        setErrorMsg(err?.message || "Gagal memuat data fasilitas EV.");
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  // Ambil daftar fasilitas terfilter dari backend ketika filter berubah
  async function applyFilters(
    nextCategory = categoryFilter,
    nextCity = cityFilter,
    nextQuery = searchQuery
  ) {
    setLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams();
      params.set("activeOnly", "true");
      if (nextCategory && nextCategory !== "Semua") {
        params.set("category", nextCategory);
      }
      if (nextCity && nextCity !== "Semua") {
        params.set("city", nextCity);
      }
      if (nextQuery.trim()) {
        params.set("q", nextQuery.trim());
      }

      const res = await apiFetch(`/facilities?${params.toString()}`);
      const list: MapFacilityMarker[] = res?.data ?? [];
      setFacilities(list);
      if (list.length > 0) {
        const stillExists = list.find((f) => f.id === selectedFacility?.id);
        setSelectedFacility(stillExists || list[0]);
      } else {
        setSelectedFacility(null);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memfilter fasilitas EV.");
    } finally {
      setLoading(false);
    }
  }

  // Muat tarif aktif fasilitas saat fasilitas terpilih berubah
  useEffect(() => {
    async function loadFacilityTariff(fac: MapFacilityMarker) {
      if (fac.category === "Showroom") {
        setActiveTariff(null);
        return;
      }
      setTariffLoading(true);
      try {
        const serviceType = fac.category === "SPBKLU" ? "SWAP" : "CHARGING";
        const res = await apiFetch(
          `/service-tariffs/active?facilityId=${fac.id}&serviceType=${serviceType}`
        );
        setActiveTariff(res?.data ?? null);
      } catch {
        setActiveTariff(null);
      } finally {
        setTariffLoading(false);
      }
    }

    if (selectedFacility) {
      loadFacilityTariff(selectedFacility);
    } else {
      setActiveTariff(null);
    }
  }, [selectedFacility]);

  function handleSelectOriginPreset(presetId: string) {
    setSelectedOriginPresetId(presetId);
    const found = originPresets.find((p) => p.id === presetId);
    if (found) {
      setOriginLat(String(found.latitude));
      setOriginLon(String(found.longitude));
      setOriginLabel(found.name);
      setRouteError(null);
    }
  }

  function handleMapClickSetOrigin(lat: number, lon: number) {
    setSelectedOriginPresetId("custom");
    setOriginLat(String(lat));
    setOriginLon(String(lon));
    setOriginLabel(`Titik Peta (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
    setRouteError(null);
  }

  async function handleCalculateRoute(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setRouteError(null);

    if (!selectedFacility) {
      setRouteError("Pilih fasilitas EV tujuan terlebih dahulu.");
      return;
    }

    const latNum = Number(originLat);
    const lonNum = Number(originLon);
    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
      setRouteError("Koordinat titik asal wajib berupa angka yang valid.");
      return;
    }

    setRouteLoading(true);
    try {
      const res = await apiFetch("/facilities/route", {
        method: "POST",
        body: JSON.stringify({
          originLat: latNum,
          originLon: lonNum,
          facilityId: selectedFacility.id,
          travelMode,
        }),
      });
      setRouteResult(res.data);
    } catch (err: any) {
      setRouteResult(null);
      setRouteError(
        err?.message || "Gagal menghitung estimasi jarak dan waktu rute."
      );
    } finally {
      setRouteLoading(false);
    }
  }

  const parsedOriginCoords =
    Number.isFinite(Number(originLat)) && Number.isFinite(Number(originLon))
      ? {
          lat: Number(originLat),
          lon: Number(originLon),
          label: originLabel,
        }
      : null;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl">
          <div className="mb-6">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#1E40AF] border border-blue-200">
              Infrastruktur & Navigasi EV
            </span>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Peta Interaktif & Kalkulator Rute Fasilitas EV
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Temukan lokasi SPKLU, SPBKLU, dan Showroom kendaraan listrik serta
              hitung estimasi jarak dan waktu tempuh dari titik keberangkatan Anda.
            </p>
          </div>

          {/* Bar Filter PBI 11 */}
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Fasilitas
                </label>
                <select
                  data-testid="map-category-filter"
                  value={categoryFilter}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCategoryFilter(v);
                    applyFilters(v, cityFilter, searchQuery);
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#2563EB] focus:outline-none"
                >
                  <option value="Semua">Semua Kategori</option>
                  <option value="SPKLU">SPKLU (Charging Station)</option>
                  <option value="SPBKLU">SPBKLU (Battery Swap)</option>
                  <option value="Showroom">Showroom Resmi EV</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kota / Wilayah
                </label>
                <select
                  data-testid="map-city-filter"
                  value={cityFilter}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCityFilter(v);
                    applyFilters(categoryFilter, v, searchQuery);
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#2563EB] focus:outline-none"
                >
                  <option value="Semua">Semua Kota</option>
                  <option value="Jakarta">Jakarta</option>
                  <option value="Bandung">Bandung</option>
                  <option value="Surabaya">Surabaya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Kunci Nama / Alamat
                </label>
                <input
                  type="text"
                  data-testid="map-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Contoh: Gambir, Sudirman, Dago..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  data-testid="map-filter-submit"
                  onClick={() =>
                    applyFilters(categoryFilter, cityFilter, searchQuery)
                  }
                  className="flex-1 rounded-xl bg-[#1E40AF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1E3A8A] transition"
                >
                  Terapkan Filter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter("Semua");
                    setCityFilter("Semua");
                    setSearchQuery("");
                    setRouteResult(null);
                    applyFilters("Semua", "Semua", "");
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Reset
                </button>
              </div>
            </div>
          </section>

          {errorMsg && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Kolom Kiri: Peta Interaktif + Daftar Fasilitas */}
            <div className="lg:col-span-7 space-y-6">
              <InteractiveLeafletMap
                facilities={facilities}
                selectedFacilityId={selectedFacility?.id ?? null}
                onSelectFacility={(fac) => {
                  setSelectedFacility(fac);
                  setRouteError(null);
                }}
                originCoords={parsedOriginCoords}
                routeCoordinates={routeResult?.coordinates ?? null}
                onMapClick={handleMapClickSetOrigin}
              />

              {/* Daftar Kartu Fasilitas */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-900">
                    Daftar Lokasi Fasilitas ({facilities.length} titik aktif)
                  </h2>
                  {loading && (
                    <span className="text-xs font-medium text-blue-600">
                      Memuat data...
                    </span>
                  )}
                </div>

                {facilities.length === 0 ? (
                  <div
                    data-testid="map-empty-state"
                    className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500"
                  >
                    Tidak ada fasilitas EV aktif yang sesuai dengan filter pencarian.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {facilities.map((fac) => {
                      const isSelected = selectedFacility?.id === fac.id;
                      const badgeStyle =
                        fac.category === "SPKLU"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : fac.category === "SPBKLU"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200";
                      return (
                        <button
                          key={fac.id}
                          type="button"
                          data-testid={`facility-card-${fac.id}`}
                          onClick={() => {
                            setSelectedFacility(fac);
                            setRouteError(null);
                          }}
                          className={`text-left rounded-xl border p-3.5 transition ${
                            isSelected
                              ? "border-[#2563EB] bg-blue-50/50 ring-2 ring-blue-500/20"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badgeStyle}`}
                            >
                              {fac.category}
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                              {fac.city}
                            </span>
                          </div>
                          <div className="mt-2 font-bold text-sm text-slate-900">
                            {fac.name}
                          </div>
                          <div className="mt-1 text-xs text-slate-600 line-clamp-2">
                            {fac.address}
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                            <span>Jam: {fac.operatingHours}</span>
                            <span className="font-semibold text-[#1E40AF]">
                              {fac.powerSpec}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Kolom Kanan: Detail Fasilitas Terpilih + Kalkulator Rute PBI 12 */}
            <div className="lg:col-span-5 space-y-6">
              {/* Kartu Detail Fasilitas Terpilih */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 mb-3">
                  Detail Lokasi & Tarif Layanan
                </h2>

                {!selectedFacility ? (
                  <p className="text-sm text-slate-500">
                    Pilih salah satu titik fasilitas pada peta atau daftar di
                    samping untuk melihat informasi lengkap.
                  </p>
                ) : (
                  <div data-testid="selected-facility-detail" className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-[#1E40AF]">
                          {selectedFacility.category} • {selectedFacility.city}
                        </span>
                        <h3 className="mt-1 text-lg font-bold text-slate-900">
                          {selectedFacility.name}
                        </h3>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1.5 text-slate-700 border border-slate-200/80">
                      <div>
                        <span className="font-semibold text-slate-900">
                          Alamat:
                        </span>{" "}
                        {selectedFacility.address}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">
                          Koordinat:
                        </span>{" "}
                        {selectedFacility.latitude}, {selectedFacility.longitude}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">
                          Jam Operasional:
                        </span>{" "}
                        {selectedFacility.operatingHours}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">
                          Spesifikasi & Operator:
                        </span>{" "}
                        {selectedFacility.powerSpec} ({selectedFacility.operator})
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">
                          Kontak:
                        </span>{" "}
                        {selectedFacility.contact}
                      </div>
                    </div>

                    {/* Info Tarif Layanan Aktif (Integrasi PBI 06) */}
                    {selectedFacility.category !== "Showroom" && (
                      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5">
                        <div className="text-xs font-semibold text-[#1E40AF]">
                          Tarif Layanan Aktif Saat Ini
                        </div>
                        {tariffLoading ? (
                          <div className="mt-1 text-xs text-slate-600">
                            Memeriksa tarif layanan aktif...
                          </div>
                        ) : activeTariff ? (
                          <div className="mt-1 flex items-baseline justify-between">
                            <span
                              data-testid="facility-active-tariff-price"
                              className="text-lg font-extrabold text-slate-900"
                            >
                              {formatRupiah(activeTariff.priceIdr)}{" "}
                              <span className="text-xs font-normal text-slate-600">
                                / {activeTariff.unit}
                              </span>
                            </span>
                            <span className="text-[11px] font-medium text-slate-600">
                              Layanan:{" "}
                              {activeTariff.serviceType === "CHARGING"
                                ? "Pengisian Daya"
                                : "Tukar Baterai"}
                            </span>
                          </div>
                        ) : (
                          <div className="mt-1 text-xs text-slate-600">
                            Tarif layanan spesifik belum ditetapkan untuk periode hari ini.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Panel Kalkulator Jarak & Waktu Tempuh (PBI 12) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">
                  Kalkulator Jarak & Waktu ke Fasilitas EV
                </h2>
                <p className="mt-0.5 text-xs text-slate-600">
                  Pilih titik keberangkatan atau klik langsung pada peta untuk
                  menghitung jarak rute dan durasi perjalanan.
                </p>

                <form onSubmit={handleCalculateRoute} className="mt-4 space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preset Titik Keberangkatan (Asal)
                    </label>
                    <select
                      data-testid="route-origin-preset"
                      value={selectedOriginPresetId}
                      onChange={(e) => handleSelectOriginPreset(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#2563EB] focus:outline-none"
                    >
                      {originPresets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.city})
                        </option>
                      ))}
                      <option value="custom">
                        Titik Koordinat Kustom / Klik Peta
                      </option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Latitude Asal
                      </label>
                      <input
                        type="number"
                        step="any"
                        data-testid="route-origin-lat"
                        value={originLat}
                        onChange={(e) => {
                          setOriginLat(e.target.value);
                          setSelectedOriginPresetId("custom");
                        }}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Longitude Asal
                      </label>
                      <input
                        type="number"
                        step="any"
                        data-testid="route-origin-lon"
                        value={originLon}
                        onChange={(e) => {
                          setOriginLon(e.target.value);
                          setSelectedOriginPresetId("custom");
                        }}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fasilitas Tujuan Terpilih
                    </label>
                    <select
                      data-testid="route-destination-facility"
                      value={selectedFacility?.id ?? ""}
                      onChange={(e) => {
                        const idNum = Number(e.target.value);
                        const found = facilities.find((f) => f.id === idNum);
                        if (found) setSelectedFacility(found);
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#2563EB] focus:outline-none"
                    >
                      {facilities.map((f) => (
                        <option key={f.id} value={f.id}>
                          [{f.category}] {f.name} — {f.city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Moda Kendaraan EV
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["Mobil", "Motor"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setTravelMode(m)}
                          className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                            travelMode === m
                              ? "border-[#1E40AF] bg-[#1E40AF] text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          EV {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {routeError && (
                    <div
                      data-testid="route-error-alert"
                      className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
                    >
                      {routeError}
                    </div>
                  )}

                  <button
                    type="submit"
                    data-testid="calculate-route-btn"
                    disabled={routeLoading || !selectedFacility}
                    className="w-full rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1E40AF] disabled:opacity-50 transition"
                  >
                    {routeLoading
                      ? "Menghitung Rute Perjalanan..."
                      : "Hitung Jarak & Waktu Tempuh"}
                  </button>
                </form>

                {routeResult && (
                  <div
                    data-testid="route-result-panel"
                    className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2"
                  >
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Hasil Estimasi Rute Perjalanan
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="rounded-lg bg-white p-3 border border-emerald-200/80">
                        <div className="text-[11px] text-slate-500">
                          Jarak Tempuh Rute
                        </div>
                        <div
                          data-testid="route-distance-value"
                          className="text-lg font-extrabold text-slate-900"
                        >
                          {routeResult.distanceFormatted}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-3 border border-emerald-200/80">
                        <div className="text-[11px] text-slate-500">
                          Estimasi Waktu Tempuh
                        </div>
                        <div
                          data-testid="route-duration-value"
                          className="text-lg font-extrabold text-[#1E40AF]"
                        >
                          {routeResult.durationFormatted}
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600 pt-1">
                      Tujuan: <strong>{routeResult.destinationName}</strong> •
                      Moda: <strong>EV {travelMode}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
  );
}
