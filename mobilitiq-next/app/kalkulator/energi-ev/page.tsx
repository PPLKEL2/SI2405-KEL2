import type { Metadata } from "next";
import Link from "next/link";
import { EvCalculatorForm } from "@/components/EvCalculatorForm";

export const metadata: Metadata = {
  title: "Simulator Konsumsi Energi EV (KEL2-67) — MobilitiQ",
  description:
    "Hitung estimasi kebutuhan energi kWh dan biaya operasional pengisian daya kendaraan listrik bulanan secara objektif dan mandiri.",
};

export default function EvEnergyCalculatorPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Breadcrumb & Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-600 transition">
          Beranda
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">Simulator Energi EV (KEL2-67)</span>
      </nav>

      {/* Header Halaman */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
            PBI: KEL2-67
          </span>
          <span className="text-xs text-slate-500">Ahmad Raihan Arifianza (PM)</span>
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Simulator Konsumsi Energi &amp; Biaya Listrik EV
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
          Simulasikan pemakaian daya listrik bulanan (kWh), rincian pengisian rumah versus SPKLU,
          serta estimasi biaya operasional energi per kilometer berdasarkan spesifikasi konsumsi
          kendaraan dan tarif listrik PLN yang berlaku.
        </p>
      </div>

      {/* Form Interaktif KEL2-67 */}
      <EvCalculatorForm />
    </div>
  );
}

