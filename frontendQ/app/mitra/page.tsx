"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const SUMMARY_ITEMS = [
  {
    label: "Unit aktif di katalog",
    value: "Katalog EV",
    href: "/mitra/katalog",
    description: "Kelola kendaraan listrik",
  },
  {
    label: "Lokasi fasilitas",
    value: "Showroom & Fasilitas",
    href: "/mitra/fasilitas",
    description: "Kelola titik layanan EV",
  },
  {
    label: "Tarif layanan",
    value: "Harga Layanan",
    href: "/mitra/harga-layanan",
    description: "Kelola harga charging & swap",
  },
];

export default function MitraDashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-slate-400">
            {user?.organizationName || "Portal Mitra"}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Dashboard Mitra
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Kelola katalog dan infrastruktur kendaraan listrik Anda.
          </p>
        </div>
        <span className="text-xs font-semibold text-emerald-600">● Terverifikasi</span>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        {SUMMARY_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <p className="text-[11px] font-medium text-slate-400">{item.label}</p>
            <p className="mt-3 text-base font-bold text-slate-900">{item.value}</p>
            <p className="mt-1 text-[11px] text-slate-500">{item.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">Akses cepat</h2>
        <p className="mt-1 text-xs text-slate-500">
          Pilih menu di sidebar untuk mulai mengelola portal mitra.
        </p>
      </div>
    </div>
  );
}
