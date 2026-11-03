import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          <span>Sprint Scope: Ahmad Raihan Arifianza (PM)</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Portal Simulasi Konsumsi Energi &amp; Efisiensi Kendaraan
        </h1>
        <p className="text-base leading-relaxed text-slate-600">
          Aplikasi kalkulator mandiri tanpa ketergantungan silang, tanpa database, dan tanpa API
          backend. Dibuat khusus untuk pengujian teknis kalkulasi konsumsi energi kendaraan listrik
          dan estimasi bahan bakar konvensional.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {/* Card KEL2-67 */}
        <div className="flex flex-col justify-between rounded-2xl border-2 border-blue-600 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800">
                PBI: KEL2-67
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Siap Digunakan
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Simulator Konsumsi Energi EV
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Hitung estimasi kebutuhan energi listrik bulanan (kWh), pembagian pengisian rumah vs
              SPKLU, total biaya listrik bulanan, dan estimasi biaya operasional energi per
              kilometer berdasarkan konsumsi spesifikasi EV dan tarif listrik.
            </p>
            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
              <p className="font-semibold text-slate-700">Fitur Utama:</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                <li>Input konsumsi (kWh/100 km) &amp; jarak harian (km).</li>
                <li>Pemisahan porsi pengisian rumah vs SPKLU (0–100%).</li>
                <li>Rujukan tarif resmi PLN Triwulan IV 2024.</li>
                <li>100% mandiri tanpa ketergantungan pada data BBM.</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href="/kalkulator/energi-ev"
              className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Buka Simulator Energi EV &rarr;
            </Link>
          </div>
        </div>

        {/* Card KEL2-73 */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm opacity-90">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                PBI: KEL2-73
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Menunggu Konfirmasi AC Jira
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Penilai Efisiensi BBM Konvensional
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Alur estimasi kebutuhan liter dan biaya bulanan berbasis km/L berstatus sebagai{" "}
              <strong>desain fallback</strong> yang dikarantina sementara hingga Acceptance
              Criteria resmi Jira dikonfirmasi atau disetujui secara eksplisit oleh PM/pengguna.
            </p>
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
              <p className="font-bold">Status Gerbang Persetujuan (Approval Gate):</p>
              <p className="mt-1 leading-relaxed">
                Fitur ini tidak mengikutsertakan biaya servis, oli mesin, atau pajak STNK (milik
                KEL2-54 Salsa). Kode modul kalkulasi dan UI KEL2-73 belum diaktifkan demi kepatuhan
                spesifikasi resmi.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              disabled
              className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400"
            >
              Terkunci (Menunggu AC Jira)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
