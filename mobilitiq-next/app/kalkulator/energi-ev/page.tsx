import type { Metadata } from "next";
import Link from "next/link";
import { EvCalculatorForm } from "@/components/EvCalculatorForm";

export const metadata: Metadata = {
  title: "Simulator Konsumsi Energi EV — MobilitiQ",
  description:
    "Berapa kWh dan rupiah yang Anda butuhkan tiap bulan, dibandingkan dengan BBM.",
};

export default function EvEnergyCalculatorPage() {
  // Daftar modul produk MobilitiQ persis susunan Figma Prototype (xr & vr)
  const productNavItems = [
    {
      id: "07",
      label: "Ringkasan",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      ),
      active: false,
      href: "#",
    },
    {
      id: "08",
      label: "Biaya BBM",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 22h12" />
          <path d="M4 9h10" />
          <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
          <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
        </svg>
      ),
      active: false,
      href: "#",
    },
    {
      id: "09",
      label: "Energi EV",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
      active: true,
      href: "/kalkulator/energi-ev",
    },
    {
      id: "10",
      label: "Katalog EV",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="17" cy="18" r="2" />
          <path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
        </svg>
      ),
      active: false,
      href: "#",
    },
    {
      id: "11",
      label: "Bandingkan",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <path d="M13 6h3a2 2 0 0 1 2 2v7" />
          <path d="M11 18H8a2 2 0 0 1-2-2V9" />
        </svg>
      ),
      active: false,
      href: "#",
    },
    {
      id: "12",
      label: "Pembelian",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="8" y1="6" x2="16" y2="6" />
          <line x1="16" y1="14" x2="16" y2="18" />
          <path d="M16 10h.01" />
          <path d="M12 10h.01" />
          <path d="M8 10h.01" />
          <path d="M12 14h.01" />
          <path d="M8 14h.01" />
          <path d="M12 18h.01" />
          <path d="M8 18h.01" />
        </svg>
      ),
      active: false,
      href: "#",
    },
    {
      id: "13",
      label: "Degradasi",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
          <line x1="22" y1="11" x2="22" y2="13" />
        </svg>
      ),
      active: false,
      href: "#",
    },
    {
      id: "14",
      label: "Sinking Fund",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="9" y1="15" x2="15" y2="9" />
          <circle cx="9.5" cy="9.5" r=".5" fill="currentColor" />
          <circle cx="14.5" cy="14.5" r=".5" fill="currentColor" />
        </svg>
      ),
      active: false,
      href: "#",
    },
    {
      id: "15",
      label: "Daya Rumah",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      active: false,
      href: "#",
    },
    {
      id: "16",
      label: "Jarak Tempuh",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      active: false,
      href: "#",
    },
    {
      id: "17",
      label: "TCO & Payback",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      active: false,
      href: "#",
    },
    {
      id: "18",
      label: "Emisi",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      ),
      active: false,
      href: "#",
    },
    {
      id: "19",
      label: "Peta",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      active: false,
      href: "#",
    },
    {
      id: "20",
      label: "Laporan PDF",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      ),
      active: false,
      href: "#",
    },
    {
      id: "21",
      label: "Riwayat",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <path d="M12 11h4" />
          <path d="M12 16h4" />
          <path d="M8 11h.01" />
          <path d="M8 16h.01" />
        </svg>
      ),
      active: false,
      href: "#",
    },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      {/* Wrapper Layout Dua Kolom: Sidebar Kiri + Konten Simulator (Persis xr Figma) */}
      <div className="flex">
        {/* ============================================================== */}
        {/* SIDEBAR NAVIGASI PRODUK (Kiri) - Hanya Tampil di Layar Desktop  */}
        {/* ============================================================== */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-line bg-white p-4 @3xl:block">
          <div className="mb-3 px-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-mute">
              Modul Kalkulator
            </span>
          </div>

          <ul className="space-y-1">
            {productNavItems.map((item) => (
              <li key={item.id}>
                {item.active ? (
                  <div
                    aria-current="page"
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl bg-tint px-3 text-left text-sm font-bold text-brand"
                  >
                    <span className="text-electric">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink"
                  >
                    <span className="text-mute">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* ============================================================== */}
        {/* KONTEN UTAMA SIMULATOR ENERGI EV (Kanan)                       */}
        {/* ============================================================== */}
        <main className="min-w-0 flex-1 px-5 pb-28 pt-6 @3xl:px-10 @3xl:pb-16 @3xl:pt-8">
          <div className="mx-auto max-w-[1080px]">
            {/* Header Simulator persis zn() */}
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

      {/* Navigasi Mobile Bawah (Sticky Bottom Bar) */}
      <nav
        aria-label="Navigasi cepat mobile"
        className="sticky bottom-0 z-40 grid grid-cols-4 border-t border-line bg-white px-1 pb-2 pt-1 @3xl:hidden"
      >
        <Link
          href="/"
          className="flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-lg text-[11px] font-semibold text-mute"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          Beranda
        </Link>
        <Link
          href="/kalkulator/energi-ev"
          className="flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-lg text-[11px] font-semibold text-electric"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          Energi EV
        </Link>
        <Link
          href="#"
          className="flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-lg text-[11px] font-semibold text-mute"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 22h12" />
            <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
          </svg>
          BBM
        </Link>
        <Link
          href="#"
          className="flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-lg text-[11px] font-semibold text-mute"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="7" cy="18" r="2" />
            <circle cx="17" cy="18" r="2" />
          </svg>
          Katalog
        </Link>
      </nav>
    </div>
  );
}
