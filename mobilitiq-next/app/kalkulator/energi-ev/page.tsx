import type { Metadata } from "next";
import Link from "next/link";
import { EvCalculatorForm } from "@/components/EvCalculatorForm";

export const metadata: Metadata = {
  title: "Simulasi Energi Kendaraan Listrik — MobilitiQ",
  description:
    "Hitung estimasi kebutuhan energi kWh dan biaya operasional pengisian daya kendaraan listrik bulanan secara objektif dan mandiri.",
};

export default function EvEnergyCalculatorPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-600 transition">
          Beranda
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">Simulasi Energi Kendaraan Listrik</span>
      </nav>

      {/* Header Halaman */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
            Kalkulator Energi &amp; Biaya
          </span>
          <span className="text-xs text-slate-500">Estimasi Pengisian Rumah &amp; SPKLU</span>
        </div>
        <h1 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Simulasi Energi Kendaraan Listrik
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
          Simulasikan pemakaian daya listrik bulanan (kWh), rincian pengisian rumah versus SPKLU,
          serta estimasi biaya operasional energi per kilometer berdasarkan spesifikasi konsumsi
          kendaraan dan tarif listrik PLN yang berlaku.
        </p>
      </div>

      {/* Form Interaktif */}
      <EvCalculatorForm />
    </div>
  );
}
