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
  onSetOrigin: (point: LatLng | null, label: string) => void;
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
        "Browser Anda tidak mendukung deteksi lokasi perangkat. Silakan gunakan tombol 'Pilih di peta'."
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
        onSetOrigin(point, "Lokasi saya (GPS)");
        setIsLocating(false);
        onTogglePickOrigin(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage(
              "Izin akses lokasi ditolak oleh browser. Anda dapat mengizinkannya di pengaturan peramban atau gunakan tombol 'Pilih di peta'."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage(
              "Sinyal lokasi perangkat tidak berhasil ditemukan. Silakan gunakan opsi 'Pilih di peta'."
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
        "Silakan tentukan lokasi asal terlebih dahulu menggunakan GPS atau klik di peta."
      );
      return;
    }

    if (!selectedFacility) {
      setErrorMessage(
        "Silakan pilih satu fasilitas tujuan aktif dari daftar atau peta."
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
    } catch (err: unknown) {
      console.error("Routing error:", err);
      const msg =
        err instanceof RoutingError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Terjadi gangguan saat menghubungi layanan rute. Silakan coba kembali.";
      setErrorMessage(msg);
      onRouteCalculated(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    onSetOrigin(null, "");
    onRouteCalculated(null);
    setErrorMessage(null);
    onTogglePickOrigin(false);
  };

  return (
    <section className="route-panel" aria-labelledby="routeHeading">
      {/* Panel Heading */}
      <div className="route-panel-heading">
        <div>
          <h2 id="routeHeading">
            Hitung Jarak dan Waktu Perjalanan
          </h2>
          <p>
            Tentukan lokasi asal dan pilih fasilitas EV yang ingin dituju.
          </p>
        </div>
        <span className="route-badge">
          Rute perjalanan
        </span>
      </div>

      {/* Form Fields: Lokasi Asal + Fasilitas Tujuan + Action Buttons */}
      <div className="route-form">
        {/* Kolom 1: Lokasi Asal */}
        <div className="route-field">
          <label htmlFor="originInput">
            Lokasi asal
          </label>
          <input
            id="originInput"
            type="text"
            readOnly
            value={originLabel}
            placeholder="Tentukan lokasi asal terlebih dahulu"
          />
          <div className="route-field-actions">
            <button
              type="button"
              id="useMyLocation"
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className="secondary-btn"
            >
              {isLocating ? "Mengambil lokasi..." : "Gunakan lokasi saya"}
            </button>
            <button
              type="button"
              id="pickOriginOnMap"
              onClick={handleToggleMapPick}
              className={`secondary-btn ${isPickingOrigin ? "is-picking" : ""}`}
            >
              {isPickingOrigin ? "Klik titik di peta..." : "Pilih di peta"}
            </button>
          </div>
          <small id="originHelp" className="field-help">
            {isPickingOrigin
              ? "Mode pilih lokasi aktif. Klik satu titik pada peta sebagai lokasi asal."
              : origin
              ? `Koordinat: ${origin.lat.toFixed(5)}, ${origin.lng.toFixed(5)}`
              : "Pilih lokasi melalui GPS atau klik titik asal di peta."}
          </small>
        </div>

        {/* Kolom 2: Fasilitas Tujuan */}
        <div className="route-field">
          <label htmlFor="destinationFacility">
            Fasilitas tujuan
          </label>
          <select
            id="destinationFacility"
            value={selectedFacility?.id || ""}
            onChange={(e) => {
              onSelectFacility(e.target.value);
              onRouteCalculated(null);
            }}
          >
            <option value="">Pilih fasilitas tujuan</option>
            {activeFacilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} — {f.category} (Aktif)
              </option>
            ))}
          </select>
          <small className="field-help">
            Pilih satu showroom, SPKLU, atau SPBKLU dari daftar.
          </small>
        </div>

        {/* Kolom 3: Tombol Hitung & Reset */}
        <div className="route-actions">
          <button
            type="button"
            id="calculateRoute"
            onClick={handleCalculateRoute}
            disabled={isCalculating || !origin || !selectedFacility}
            className="primary-btn"
          >
            {isCalculating ? "Menghitung..." : "Hitung Rute"}
          </button>
          <button
            type="button"
            id="clearRoute"
            onClick={handleReset}
            className="secondary-btn"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div id="routeMessage" className="route-message error" role="status" aria-live="polite">
          {errorMessage}
        </div>
      )}

      {/* Results Row persis screenshot */}
      {routeResult && (
        <div id="routeResult" className="route-result" aria-live="polite">
          <div className="route-result-item">
            <span className="route-result-icon">↗</span>
            <div>
              <small>Jarak perjalanan</small>
              <strong id="routeDistance">{routeResult.distanceFormatted}</strong>
            </div>
          </div>

          <div className="route-result-item">
            <span className="route-result-icon">◷</span>
            <div>
              <small>Estimasi waktu</small>
              <strong id="routeDuration">{routeResult.durationFormatted}</strong>
            </div>
          </div>

          <p id="routeDestinationName" className="route-destination-name">
            Tujuan: {routeResult.destinationName}
          </p>
        </div>
      )}
    </section>
  );
}
