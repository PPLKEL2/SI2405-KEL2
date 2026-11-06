export default function AssumptionsInfo() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-base font-bold text-slate-900">
        Informasi & Asumsi Perhitungan
      </h3>
      <p className="mt-1 text-xs text-slate-500 sm:text-sm">
        Kalkulator ini menggunakan metodologi standar untuk memberikan perkiraan konsumsi bahan bakar kendaraan konvensional secara objektif dan transparan.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Periode Konsisten */}
        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h4 className="text-sm font-bold text-slate-900">Periode Konsisten</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Estimasi bulanan menggunakan standar <strong>30 hari per bulan</strong> dan estimasi tahunan menggunakan <strong>365 hari per tahun</strong> secara konsisten untuk akurasi proyeksi anggaran.
          </p>
        </div>

        {/* Rumus Dasar */}
        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h4 className="text-sm font-bold text-slate-900">Rumus Perhitungan</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>Liter per hari</strong> = Jarak Tempuh Harian ÷ Efisiensi Kendaraan.
            <br />
            <strong>Biaya BBM</strong> = Kebutuhan Liter × Harga BBM per Liter.
          </p>
        </div>

        {/* Penyesuaian Harga */}
        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-blue-700">
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-sm font-bold text-slate-900">Fleksibilitas Harga</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Harga BBM per liter dapat disesuaikan langsung oleh pengguna mengikuti pembaruan harga resmi SPBU di daerah masing-masing.
          </p>
        </div>
      </div>
    </div>
  );
}
