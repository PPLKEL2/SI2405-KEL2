import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import { ProductSidebar } from "@/components/ProductSidebar";
import { FacilityMapExplorer } from "@/components/FacilityMapExplorer";

export const metadata: Metadata = {
  title: "Peta Fasilitas EV & Rute — MobilitiQ",
  description:
    "Cari lokasi SPKLU, SPBKLU (swap baterai), dan showroom aktif terdekat dengan estimasi jarak dan waktu tempuh riil.",
};

export default function FacilityMapPage() {
  return (
    <div className="min-h-screen bg-canvas @container">
      {/* Wrapper Layout Dua Kolom: Sidebar Kiri + Konten Peta */}
      <div className="flex @container">
        {/* SIDEBAR NAVIGASI PRODUK (Kiri) - Tampil di Desktop */}
        <ProductSidebar activeId="19" />

        {/* KONTEN UTAMA: Peta Fasilitas EV & Kalkulator Rute (KEL2-71 & KEL2-70) */}
        <main className="min-w-0 flex-1 px-5 pb-28 pt-6 @3xl:px-10 @3xl:pb-16 @3xl:pt-8 @container">
          <div className="mx-auto max-w-[1140px]">
            {/* Header Halaman */}
            <div className="mb-6 flex flex-col gap-4 @3xl:mb-8 @3xl:flex-row @3xl:items-end @3xl:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-ink @3xl:text-[28px]">
                  Peta Fasilitas EV &amp; Panduan Rute
                </h1>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-mute">
                  Temukan SPKLU, SPBKLU (swap baterai), dan showroom aktif terdekat dari lokasi Anda lengkap dengan estimasi jarak dan waktu tempuh berkendara.
                </p>
              </div>

              {/* Status Ekosistem */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Layanan Rute OSRM Aktif
                </span>
              </div>
            </div>

            {/* Komponen Penjelajah Peta & Rute */}
            <FacilityMapExplorer />
          </div>
        </main>
      </div>
    </div>
  );
}

