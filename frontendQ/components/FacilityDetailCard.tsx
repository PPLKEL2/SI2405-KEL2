"use client";

import type { Facility } from "@/lib/data/facilities";
import type { LatLng } from "@/lib/routing";

interface FacilityDetailCardProps {
  facility: Facility;
  origin: LatLng | null;
  onClose: () => void;
  onPlanRoute?: (facility: Facility) => void;
}

export function FacilityDetailCard({
  facility,
  origin,
  onClose,
}: FacilityDetailCardProps) {
  const typeClass =
    facility.category === "SPBKLU"
      ? "spbklu"
      : facility.category === "Showroom"
      ? "showroom"
      : "spklu";

  const googleMapsUrl = origin
    ? `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${facility.latitude},${facility.longitude}&travelmode=driving`
    : `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}&travelmode=driving`;

  return (
    <article id="detailCard" className="detail-card">
      {/* Tombol Tutup */}
      <button
        type="button"
        onClick={onClose}
        id="closeDetail"
        className="close-detail"
        aria-label="Tutup"
      >
        ×
      </button>

      {/* Tag Tipe Fasilitas */}
      <span id="detailType" className={`type-tag ${typeClass}`}>
        {facility.category}
      </span>

      {/* Nama Fasilitas */}
      <h3 id="detailName">{facility.name}</h3>

      {/* Alamat Fasilitas */}
      <p id="detailAddress" className="detail-address">
        📍 {facility.address}
      </p>

      {/* Grid Informasi Fasilitas */}
      <div className="detail-grid">
        <div>
          <small>Tarif / Informasi</small>
          <b id="detailInfo">
            {facility.info || `${facility.tarif} · ${facility.power}`}
          </b>
        </div>
        <div>
          <small>Jenis fasilitas</small>
          <b id="detailKind">{facility.category}</b>
        </div>
        <div>
          <small>Status fasilitas</small>
          <span id="detailStatus" className="status-tag status-active">
            Aktif
          </span>
        </div>
      </div>

      {/* Tombol Petunjuk Arah Google Maps */}
      <a
        id="directionLink"
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="primary-btn"
      >
        ↗ Petunjuk Arah
      </a>
    </article>
  );
}
