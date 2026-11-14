import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 text-slate-600">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Kolom 1: Brand & Keterangan */}
          <div>
            <div className="inline-flex items-center gap-2 font-heading text-lg font-extrabold text-slate-900">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#2563EB] text-white">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </span>
              <span>
                Mobiliti<span className="text-[#2563EB]">Q</span>
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Kalkulator &amp; platform simulasi transisi kendaraan listrik untuk pengendara Indonesia.
            </p>
          </div>

          {/* Kolom 2: Produk */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Produk
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/kalkulator/bbm" className="hover:text-[#2563EB]">
                  Kalkulator Biaya BBM
                </Link>
              </li>
              <li>
                <Link href="/kalkulator/perawatan" className="hover:text-[#2563EB]">
                  Perawatan BBM vs EV
                </Link>
              </li>
              <li>
                <Link href="/kalkulator/energi-ev" className="hover:text-[#2563EB]">
                  Simulator Energi EV
                </Link>
              </li>
              <li>
                <Link href="/kalkulator/komparasi-biaya" className="hover:text-[#2563EB]">
                  Komparasi Biaya Operasional
                </Link>
              </li>
              <li>
                <Link href="/katalog" className="hover:text-[#2563EB]">
                  Katalog Kendaraan Listrik
                </Link>
              </li>
              <li>
                <Link href="/fasilitas/peta" className="hover:text-[#2563EB]">
                  Peta Fasilitas &amp; Rute
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Portal & Manajemen */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Portal
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/mitra/katalog" className="hover:text-[#2563EB]">
                  Dashboard Mitra EV
                </Link>
              </li>
              <li>
                <Link href="/admin/tarif-energi" className="hover:text-[#2563EB]">
                  Regulasi &amp; Superadmin
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#2563EB]">
                  Akses Masuk
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Bantuan & Regulasi */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Bantuan
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/kalkulator/bbm" className="hover:text-[#2563EB]">
                  Panduan Simulasi
                </Link>
              </li>
              <li>
                <Link href="/katalog" className="hover:text-[#2563EB]">
                  Spesifikasi Model
                </Link>
              </li>
              <li>
                <Link href="/fasilitas/peta" className="hover:text-[#2563EB]">
                  Jaringan SPKLU &amp; SPBKLU
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-100 pt-6 text-center text-[11px] text-slate-400">
          <p>© 2026 MobilitiQ. Estimasi bersifat indikatif dan bukan penawaran resmi.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
