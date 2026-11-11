import type { Metadata } from "next";
import { ComparisonForm } from "@/components/ComparisonForm";
import { ProductSidebar } from "@/components/ProductSidebar";

export const metadata: Metadata = {
  title: "Komparasi Biaya Energi BBM vs EV — MobilitiQ",
  description:
    "Bandingkan pengeluaran biaya energi bulanan kendaraan BBM dan EV secara adil berbasis pola perjalanan harian yang sama.",
};

export default function KomparasiBiayaPage() {
  return (
    <div className="min-h-screen bg-canvas @container">
      {/* Wrapper Layout Dua Kolom: Sidebar Kiri + Konten Komparasi */}
      <div className="flex @container">
        {/* SIDEBAR NAVIGASI PRODUK (Kiri) - Hanya Tampil di Layar Desktop */}
        <ProductSidebar activeId="11" />

        {/* KONTEN UTAMA: Komparasi Biaya Energi BBM vs EV (Kanan) */}
        <main className="min-w-0 flex-1 px-5 pb-28 pt-6 @3xl:px-10 @3xl:pb-16 @3xl:pt-8 @container">
          <div className="mx-auto max-w-[1080px]">
            {/* Header Judul Halaman */}
            <div className="mb-6 flex flex-col gap-4 @3xl:mb-8 @3xl:flex-row @3xl:items-end @3xl:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-ink @3xl:text-[28px]">
                  Komparasi Biaya Energi BBM vs EV
                </h1>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-mute">
                  Bandingkan konsumsi dan pengeluaran bulanan kendaraan konvensional
                  dengan kendaraan listrik berdasarkan pola perjalanan harian yang sama.
                </p>
              </div>

              {/* Tag Penanda Satuan */}
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-xs">
                  Standar 30 Hari / Bulan
                </span>
              </div>
            </div>

            {/* Form Komparasi Reaktif */}
            <ComparisonForm />
          </div>
        </main>
      </div>
    </div>
  );
}
