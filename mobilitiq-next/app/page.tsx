import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1 text-xs font-semibold text-blue-700 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Platform Transisi Mobilitas &amp; Analisis Energi Indonesia</span>
          </div>

          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl sm:leading-tight">
            Kalkulasi Cerdas Penghematan &amp; Konsumsi Energi Kendaraan
          </h1>

          <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
            Simulasikan konsumsi daya listrik (kWh), bandingkan biaya pengisian rumah tangga dan SPKLU
            terhadap bahan bakar konvensional secara objektif, transparan, dan berbasis regulasi resmi.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/kalkulator/energi-ev"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:bg-blue-800"
            >
              <span>Mulai Simulasi Energi EV</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link
              href="/admin/parameter-energi"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
            >
              <span>Kelola Tarif Energi</span>
            </Link>
          </div>
        </div>

        {/* Value Proposition Strip */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 font-bold">
                ⚡
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Hemat Biaya Operasional</h2>
                <p className="text-xs text-slate-500">Estimasi biaya pengisian per km jauh lebih ekonomis.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
                ✓
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Regulasi Tarif Resmi</h2>
                <p className="text-xs text-slate-500">Acuan penetapan tarif ESDM &amp; PLN terkini.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-600 font-bold">
                🔒
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Integritas Data Terjamin</h2>
                <p className="text-xs text-slate-500">Hasil simulasi historis terlindungi dari perubahan tarif.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-b border-slate-200 pb-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-blue-600">
            Layanan &amp; Modul Utama
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-slate-900 sm:text-3xl">
            Solusi Analisis Energi Terpadu
          </h2>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Simulasi Energi Kendaraan Listrik */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800">
                  Kalkulator Utama
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Aktif
                </span>
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold text-slate-900">
                  Simulasi Energi Kendaraan Listrik
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Hitung kebutuhan listrik bulanan (kWh), pembagian pengisian daya di rumah versus SPKLU,
                  serta rincian biaya energi per kilometer berdasarkan spesifikasi konsumsi kendaraan.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 space-y-1.5 border border-slate-100">
                <p className="font-semibold text-slate-800">Keunggulan Fitur:</p>
                <ul className="list-inside list-disc space-y-1 text-slate-600">
                  <li>Input efisiensi konsumsi spesifikasi kendaraan.</li>
                  <li>Atur rasio pengisian rumah &amp; SPKLU (0–100%).</li>
                  <li>Tersinkronisasi otomatis dengan tarif aktif PLN.</li>
                  <li>Rincian biaya bulanan &amp; biaya per kilometer.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/kalkulator/energi-ev"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 shadow-xs"
              >
                <span>Buka Simulasi Energi EV</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Pengelolaan Parameter Tarif Energi */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-800">
                  Tata Kelola Admin
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Aktif
                </span>
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold text-slate-900">
                  Pengelolaan Tarif Energi
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Kelola master tarif listrik PLN, biaya stasiun pengisian SPKLU, serta harga BBM secara
                  terpusat dengan validasi numerik, satuan, dan periode berlaku yang aman.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 space-y-1.5 border border-slate-100">
                <p className="font-semibold text-slate-800">Keunggulan Fitur:</p>
                <ul className="list-inside list-disc space-y-1 text-slate-600">
                  <li>Tambah &amp; ubah tarif dengan validasi ketat.</li>
                  <li>Penetapan periode berlaku (tanggal efektif).</li>
                  <li>Log jejak audit (*audit trail*) setiap perubahan.</li>
                  <li>Simulasi hanya mengambil tarif pada tanggal aktif.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/admin/parameter-energi"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 shadow-xs"
              >
                <span>Kelola Tarif Energi</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Efisiensi BBM Kendaraan */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                  Modul Komparasi
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Tahap Integrasi
                </span>
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold text-slate-900">
                  Efisiensi BBM
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Penilaian tingkat konsumsi bahan bakar (km/L) dan pengeluaran operasional kendaraan
                  konvensional sebagai acuan komparasi transisi menuju kendaraan listrik.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 space-y-1.5 border border-slate-100">
                <p className="font-semibold text-slate-800">Cakupan Evaluasi:</p>
                <ul className="list-inside list-disc space-y-1 text-slate-600">
                  <li>Preset kendaraan konvensional (Motor &amp; Mobil).</li>
                  <li>Estimasi konsumsi liter BBM per bulan.</li>
                  <li>Perbandingan biaya bahan bakar vs biaya listrik.</li>
                  <li>Estimasi penghematan finansial tahunan.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/kalkulator/energi-ev"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <span>Bandingkan dengan EV</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 font-heading text-lg font-extrabold text-slate-900">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-blue-700 text-white text-xs">
                  ⚡
                </span>
                <span>Mobiliti<span className="text-blue-600">Q</span></span>
              </div>
              <p className="text-xs text-slate-500 max-w-md">
                Platform kalkulasi energi dan analisis efisiensi mobilitas ramah lingkungan untuk pengemudi dan masyarakat Indonesia.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
              <Link href="/" className="hover:text-blue-600 transition">Beranda</Link>
              <Link href="/kalkulator/energi-ev" className="hover:text-blue-600 transition">Simulasi Energi EV</Link>
              <Link href="/admin/parameter-energi" className="hover:text-blue-600 transition">Kelola Tarif</Link>
              <a
                href="https://web.pln.co.id/pelanggan/tarif-tenaga-listrik"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition"
              >
                Rujukan Resmi PLN &amp; ESDM
              </a>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
            &copy; 2026 MobilitiQ. Seluruh hak cipta dilindungi.
          </div>
        </div>
      </footer>
    </div>
  );
}
