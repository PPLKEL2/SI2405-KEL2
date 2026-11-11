import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./peta.css";
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
        <section aria-label="Konten Peta Fasilitas dan Rute" className="min-w-0 flex-1 px-5 pb-28 pt-6 @3xl:px-10 @3xl:pb-16 @3xl:pt-8 @container">
          <div className="mx-auto max-w-[1140px]">
            {/* Header Halaman persis screenshot Figma/HTML */}
            <div className="mb-4">
              <h1 className="text-[22px] font-bold text-[#1d2943]">
                Peta Fasilitas
              </h1>
              <p className="mt-1 text-xs text-[#8795ad]">
                SPKLU, SPBKLU, dan showroom terdekat dari lokasi Anda.
              </p>
            </div>

            {/* Komponen Penjelajah Peta & Rute */}
            <FacilityMapExplorer />
          </div>
        </section>
      </div>
    </div>
  );
}

