import type { Metadata } from "next";
import Link from "next/link";
import { FacilityManager } from "@/components/FacilityManager";

export const metadata: Metadata = { title: "Manajemen Fasilitas — MobilitiQ" };

export default function FacilitiesPage() {
  return (
    <div className="space-y-6">
      <nav className="text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/admin/fasilitas" className="hover:text-action">Fasilitas</Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-foreground">Manajemen Fasilitas</span>
      </nav>
      <div className="border-b border-line pb-5">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-brand">PBI Manajemen Lokasi</span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">Kelola lokasi fasilitas ekosistem EV</h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">Kelola showroom, SPKLU, dan SPBKLU agar pengguna dapat mengetahui keberadaan fasilitas melalui peta.</p>
      </div>
      <FacilityManager />
    </div>
  );
}
