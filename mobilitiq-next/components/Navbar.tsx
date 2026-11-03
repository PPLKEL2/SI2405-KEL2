import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2" aria-label="Beranda MobilitiQ">
          <div className="leading-tight">
            <span className="text-xl font-black tracking-tight text-slate-900">
              Mobiliti<span className="text-blue-600">Q</span>
            </span>
            <span className="hidden text-xs text-slate-500 sm:inline sm:ml-2">
              Simulator Energi & Konsumsi Kendaraan
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4" aria-label="Navigasi Utama">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Beranda
          </Link>
          <Link
            href="/kalkulator/energi-ev"
            className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            Energi EV (KEL2-67)
          </Link>
        </nav>
      </div>
    </header>
  );
}

