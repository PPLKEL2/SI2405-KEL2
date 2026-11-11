"use client";

import type { Facility } from "@/lib/data/facilities";
import { MAP_CONFIG } from "@/lib/map-config";

interface FacilityDetailCardProps {
  facility: Facility;
  onClose: () => void;
  onPlanRoute: (facility: Facility) => void;
}

export function FacilityDetailCard({
  facility,
  onClose,
  onPlanRoute,
}: FacilityDetailCardProps) {
  const categoryColor = MAP_CONFIG.colors[facility.category] || "#0284c7";

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Header Card */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white shadow-2xs"
            style={{ backgroundColor: categoryColor }}
          >
            {facility.category}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            {facility.city}
          </span>
          {facility.isDemo && (
            <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              Data demo
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          aria-label="Tutup detail fasilitas"
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Nama & Alamat */}
      <h3 className="mt-2.5 text-lg font-bold text-ink leading-snug">
        {facility.name}
      </h3>
      <p className="mt-1 text-xs text-mute leading-relaxed">
        {facility.address}
      </p>

      {/* Grid Informasi Spesifikasi */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 rounded-xl bg-canvas p-3 border border-line/60 text-xs">
        <div>
          <span className="text-[11px] font-medium text-mute block">Tarif Layanan</span>
          <span className="font-semibold text-ink mt-0.5 block">{facility.tarif}</span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-mute block">Kapasitas / Fitur</span>
          <span className="font-semibold text-ink mt-0.5 block">{facility.power}</span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-mute block">Jam Operasional</span>
          <span className="font-semibold text-emerald-600 mt-0.5 block">{facility.operationalHours}</span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-mute block">Kontak Layanan</span>
          <span className="font-semibold text-ink mt-0.5 block">{facility.contact}</span>
        </div>
      </div>

      {/* Tombol Aksi */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onPlanRoute(facility)}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-electric px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-electric/90 transition active:scale-[0.98]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Rencanakan Rute ke Sini
        </button>
      </div>
    </div>
  );
}

