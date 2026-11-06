import type { Metadata } from "next";
import Link from "next/link";
import { EnergyPricingManagement } from "@/components/admin/EnergyPricingManagement";

export const metadata: Metadata = {
  title: "Pengelolaan Tarif Energi — MobilitiQ",
  description:
    "Portal pengelolaan acuan parameter tarif listrik PLN, SPKLU, dan BBM secara terpusat dengan validasi numerik, periode berlaku, dan jejak audit historis.",
};

export default function AdminEnergyPricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-600 transition">
          Beranda
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">
          Pengelolaan Tarif Energi
        </span>
      </nav>

      {/* Main Management Interface */}
      <EnergyPricingManagement />
    </div>
  );
}
