import type { Metadata } from "next";
import { EvCalculatorForm } from "@/components/EvCalculatorForm";
import { ProductSidebar } from "@/components/ProductSidebar";

export const metadata: Metadata = {
  title: "Simulator Konsumsi Energi EV — MobilitiQ",
  description:
    "Berapa kWh dan rupiah yang Anda butuhkan tiap bulan, dibandingkan dengan BBM.",
};

export default function EvEnergyCalculatorPage() {
  return (
    <div className="min-h-screen bg-canvas @container">
      {/* Wrapper Layout Dua Kolom: Sidebar Kiri + Konten Simulator */}
      <div className="flex @container">
        {/* SIDEBAR NAVIGASI PRODUK (Kiri) - Hanya Tampil di Layar Desktop */}
        <ProductSidebar activeId="09" />

        {/* KONTEN UTAMA: Simulator Energi EV (Kanan) */}
        <main className="min-w-0 flex-1 px-5 pb-28 pt-6 @3xl:px-10 @3xl:pb-16 @3xl:pt-8 @container">
          <div className="mx-auto max-w-[1080px]">
            {/* Header Simulator */}
            <div className="mb-6 flex flex-col gap-4 @3xl:mb-8 @3xl:flex-row @3xl:items-end @3xl:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-ink @3xl:text-[28px]">
                  Simulator Konsumsi Energi EV
                </h1>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-mute">
                  Berapa kWh dan rupiah yang Anda butuhkan tiap bulan, dibandingkan dengan BBM.
                </p>
              </div>

              {/* Tag Penanda Satuan */}
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-xs">
                  Standar 30 Hari / Bulan
                </span>
              </div>
            </div>

            {/* Form & Hasil Kalkulator Reaktif KEL2-67 */}
            <EvCalculatorForm />
          </div>
        </main>
      </div>
    </div>
  );
}
