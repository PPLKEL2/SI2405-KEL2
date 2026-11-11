"use client";

import { useState } from "react";
import type { Facility } from "@/lib/data/facilities";
import { fetchDrivingRoute } from "@/lib/api/facilities";
import {
  RoutingError,
  type LatLng,
  type RouteResult,
} from "@/lib/routing";

interface FacilityRoutePlannerProps {
  activeFacilities: Facility[];
  selectedFacility: Facility | null;
  origin: LatLng | null;
  originLabel: string;
  isPickingOrigin: boolean;
  routeResult: RouteResult | null;
  onSetOrigin: (point: LatLng, label: string) => void;
  onSelectFacility: (id: string) => void;
  onTogglePickOrigin: (active: boolean) => void;
  onRouteCalculated: (result: RouteResult | null) => void;
}

export function FacilityRoutePlanner({
  activeFacilities,
  selectedFacility,
  origin,
  originLabel,
  isPickingOrigin,
  routeResult,
  onSetOrigin,
  onSelectFacility,
  onTogglePickOrigin,
  onRouteCalculated,
}: FacilityRoutePlannerProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Deteksi Geolocation Perangkat (KEL2-70)
  const handleUseMyLocation = () => {
    setErrorMessage(null);

    if (typeof window === "undefined" || !navigator.geolocation) {
      setErrorMessage(
        "Browser Anda tidak mendukung deteksi lokasi perangkat. Silakan gunakan tombol 'Pilih di Peta'."
      );
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point: LatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onSetOrigin(point, "Lokasi Saya (GPS Perangkat)");
        setIsLocating(false);
        // Matikan mode klik peta jika aktif
        onTogglePickOrigin(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage(
              "Izin akses lokasi ditolak oleh browser. Anda dapat mengizinkannya di pengaturan peramban atau gunakan tombol 'Pilih di Peta'."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage(
              "Sinyal lokasi perangkat tidak berhasil ditemukan. Silakan gunakan opsi 'Pilih di Peta'."
            );
            break;
          case error.TIMEOUT:
            setErrorMessage(
              "Waktu pencarian lokasi habis. Silakan coba lagi atau pilih titik di peta."
            );
            break;
          default:
            setErrorMessage(
              "Gagal mendeteksi lokasi perangkat. Silakan pilih titik asal langsung dari peta."
            );
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  };

  // Toggle mode klik di peta
  const handleToggleMapPick = () => {
    setErrorMessage(null);
    onTogglePickOrigin(!isPickingOrigin);
  };

  // Hitung rute jalan nyata via backend / OSRM
  const handleCalculateRoute = async () => {
    setErrorMessage(null);

    if (!origin) {
      setErrorMessage(
        "Silakan tentukan titik asal perjalanan terlebih dahulu menggunakan GPS atau klik di peta."
      );
      return;
    }

    if (!selectedFacility) {
      setErrorMessage(
        "Silakan pilih satu fasilitas tujuan aktif dari daftar atau marker di peta."
      );
      return;
    }

    if (!selectedFacility.isActive) {
      setErrorMessage(
        "Fasilitas yang dipilih sedang tidak aktif. Hanya fasilitas aktif yang dapat dijadikan tujuan."
      );
      return;
    }

    setIsCalculating(true);

    try {
      const destinationCoords: LatLng = {
        lat: selectedFacility.latitude,
        lng: selectedFacility.longitude,
      };

      const result = await fetchDrivingRoute(
        origin,
        destinationCoords,
        selectedFacility.name
      );

      onRouteCalculated(result);
    } catch (err: any) {
      console.error("Routing error:", err);
      const msg =
        err instanceof RoutingError
          ? err.message
          : err?.message || "Terjadi gangguan saat menghubungi layanan rute. Silakan coba kembali.";
      setErrorMessage(msg);
      onRouteCalculated(null);
    } finally {
      setIsCalculating(false);
    }
  };

  // Buka rute navigasi di Google Maps eksternal
  const getGoogleMapsUrl = () => {
    if (!origin || !selectedFacility) return "#";
    return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${selectedFacility.latitude},${selectedFacility.longitude}&travelmode=driving`;
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-xs">
      <div>
        <h3 className="text-base font-bold text-ink">Perencana Rute &amp; Estimasi Waktu</h3>
        <p className="mt-1 text-xs text-mute leading-relaxed">
          Hitung rute mengemudi jalan raya riil (bukan jarak garis lurus) dari lokasi Anda menuju fasilitas EV aktif.
        </p>
      </div>

      {/* Bagian Titik Asal */}
      <div className="rounded-xl border border-line bg-canvas p-3.5">
        <label className="text-xs font-semibold text-ink flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            Titik Asal Perjalanan
          </span>
          {origin && (
            <span className="text-[10px] text-emerald-700 font-mono">
              {origin.lat.toFixed(4)}, {origin.lng.toFixed(4)}
            </span>
          )}
        </label>

        <div className="mt-2 flex flex-col gap-2">
          {origin ? (
            <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-900 font-medium">
              <span className="truncate">{originLabel || "Titik Asal Terpasang"}</span>
              <button
                type="button"
                onClick={() => onSetOrigin({ lat: 0, lng: 0 } as any, "")}
                className="text-[11px] text-emerald-700 underline hover:text-emerald-900 ml-2"
              >
                Ganti
              </button>
            </div>
          ) : (
            <p className="text-xs text-mute italic">Belum ada titik asal yang ditentukan.</p>
          )}

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-ink hover:bg-slate-50 transition active:scale-[0.98] disabled:opacity-50"
            >
              {isLocating ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-electric border-t-transparent" />
              ) : (
                <svg className="h-3.5 w-3.5 text-electric" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
                </svg>
              )}
              Lokasi Saya (GPS)
            </button>

            <button
              type="button"
              onClick={handleToggleMapPick}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition active:scale-[0.98] ${
                isPickingOrigin
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                  : "border-line bg-white text-ink hover:bg-slate-50"
              }`}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {isPickingOrigin ? "Klik Peta Sekarang..." : "Pilih di Peta"}
            </button>
          </div>
        </div>
      </div>

      {/* Bagian Titik Tujuan */}
      <div className="rounded-xl border border-line bg-canvas p-3.5">
        <label htmlFor="destination-select" className="text-xs font-semibold text-ink flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-electric"></span>
          Fasilitas Tujuan (Hanya Fasilitas Aktif)
        </label>

        <div className="mt-2">
          <select
            id="destination-select"
            value={selectedFacility?.id || ""}
            onChange={(e) => onSelectFacility(e.target.value)}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-xs font-medium text-ink focus:border-electric focus:outline-none"
          >
            <option value="" disabled>
              -- Pilih salah satu fasilitas aktif --
            </option>
            {activeFacilities.map((f) => (
              <option key={f.id} value={f.id}>
                [{f.category}] {f.name} — {f.city}
              </option>
            ))}
          </select>
        </div>

        {selectedFacility && (
          <div className="mt-2 text-xs text-mute flex items-center justify-between border-t border-line/60 pt-2">
            <span className="truncate">{selectedFacility.address}</span>
            <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-800 ml-2">
              {selectedFacility.category}
            </span>
          </div>
        )}
      </div>

      {/* Error Banner jika rute gagal / input belum lengkap */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <div className="flex items-start gap-2">
            <svg className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold">Perhatian</p>
              <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
              <button
                type="button"
                onClick={handleCalculateRoute}
                className="mt-2 inline-flex items-center text-[11px] font-bold text-rose-700 underline hover:text-rose-900"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tombol Eksekusi Hitung Rute */}
      <button
        type="button"
        onClick={handleCalculateRoute}
        disabled={isCalculating || !origin || !selectedFacility}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-electric px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-electric/90 transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCalculating ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Menghitung Rute Jalan...</span>
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span>Hitung Jarak &amp; Estimasi Waktu</span>
          </>
        )}
      </button>

      {/* Hasil Perhitungan Rute (KEL2-70) */}
      {routeResult && (
        <div className="rounded-2xl border-2 border-electric/30 bg-blue-50/50 p-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-blue-200 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-electric">Hasil Rute Mengemudi</span>
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5">
              Rute Jalan Riil
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white p-3 border border-line shadow-2xs">
              <span className="text-[11px] font-medium text-mute block">Jarak Perjalanan</span>
              <span className="text-xl font-extrabold text-ink mt-0.5 block">
                {routeResult.distanceFormatted}
              </span>
              <span className="text-[10px] text-mute">Jaringan jalan raya</span>
            </div>

            <div className="rounded-xl bg-white p-3 border border-line shadow-2xs">
              <span className="text-[11px] font-medium text-mute block">Estimasi Waktu</span>
              <span className="text-xl font-extrabold text-electric mt-0.5 block">
                {routeResult.durationFormatted}
              </span>
              <span className="text-[10px] text-mute">Kecepatan berkendara</span>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-slate-600 leading-relaxed">
            Menuju: <strong>{routeResult.destinationName}</strong>. Garis rute berwarna biru telah ditampilkan di peta.
          </p>

          {/* Tombol Eksternal Google Maps */}
          <a
            href={getGoogleMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-ink shadow-2xs hover:bg-slate-50 transition"
          >
            <svg className="h-3.5 w-3.5 text-rose-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Buka Petunjuk Arah di Google Maps
          </a>
        </div>
      )}
    </div>
  );
}

