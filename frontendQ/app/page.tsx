"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="bg-[#F8FAFC] text-slate-900">
      {/* 1. HERO SECTION (Figma F01) */}
      <section className="mx-auto max-w-[1280px] px-5 pb-16 pt-12 lg:px-8 lg:pb-24 lg:pt-16">
        <div className="grid items-start gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          {/* Kolom Kiri: Kicker, Heading, Subtitle, 3 Stats */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              UNTUK PENGENDARA INDONESIA
            </span>

            <h1 className="mt-4 font-heading text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[54px]">
              Pindah ke listrik, dengan hitungan yang <span className="text-[#2563EB]">jelas.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Bandingkan biaya BBM dan listrik, cek kesiapan daya meteran rumah, temukan SPKLU &amp; SPBKLU terdekat.
              Semua dalam satu platform terpadu.
            </p>

            {/* 3 Inline Stats */}
            <div className="mt-8 flex flex-wrap items-baseline gap-8 border-t border-slate-200 pt-6">
              <div>
                <p className="num font-heading text-3xl font-extrabold text-slate-900">
                  Rp 377 rb
                </p>
                <p className="mt-0.5 text-xs text-slate-500">hemat/bln*</p>
              </div>

              <div>
                <p className="num font-heading text-3xl font-extrabold text-slate-900">
                  12.480
                </p>
                <p className="mt-0.5 text-xs text-slate-500">analisa selesai</p>
              </div>

              <div>
                <p className="num font-heading text-3xl font-extrabold text-slate-900">
                  3 kota
                </p>
                <p className="mt-0.5 text-xs text-slate-500">Jabodetabek, Bdg, Sby</p>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-400">
              *Contoh: Honda Vario 125, 60 km/hari, Pertalite vs Polytron Fox-R
            </p>
          </div>

          {/* Kolom Kanan: Card "Apa yang ingin Anda lakukan?" (Figma F01) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              SIMULASI MANDIRI · TANPA LOGIN
            </span>

            <h2 className="mt-1.5 font-heading text-2xl font-extrabold text-slate-900">
              Apa yang ingin Anda lakukan?
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Tanpa daftar, jawab pilihan cepat → dapatkan estimasi profil hemat langsung terkait.
            </p>

            <div className="mt-6 space-y-3">
              {/* Opsi 1: Cari Kendaraan Baru */}
              <Link
                href="/katalog"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4 transition hover:border-[#2563EB] hover:bg-white hover:shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EEF5FF] text-[#2563EB]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-slate-900 group-hover:text-[#2563EB]">
                      Cari Kendaraan Baru
                    </h3>
                    <p className="text-xs text-slate-500">
                      Temukan EV sesuai rute dan anggaran saya
                    </p>
                  </div>
                </div>
                <span className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#2563EB]">
                  →
                </span>
              </Link>

              {/* Opsi 2: Evaluasi Kendaraan Lama */}
              <Link
                href="/kalkulator/bbm"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4 transition hover:border-[#2563EB] hover:bg-white hover:shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EEF5FF] text-[#2563EB]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 22V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17" />
                      <path d="M15 11h2a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9l-3-3" />
                      <line x1="7" y1="9" x2="11" y2="9" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-slate-900 group-hover:text-[#2563EB]">
                      Evaluasi Kendaraan Lama
                    </h3>
                    <p className="text-xs text-slate-500">
                      Hitung total biaya sebelum pindah ke EV
                    </p>
                  </div>
                </div>
                <span className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#2563EB]">
                  →
                </span>
              </Link>
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Data Anda tidak dibagikan ke pihak ketiga</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CARA KERJA (Figma F01) */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            CARA KERJA
          </span>
          <h2 className="mt-1 font-heading text-3xl font-extrabold text-slate-900">
            Tiga langkah, tanpa formulir panjang
          </h2>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {/* Step 01 */}
            <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6">
              <div className="flex items-center justify-between">
                <span className="font-heading text-2xl font-extrabold text-slate-900">01</span>
                <span className="text-[#2563EB]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </span>
              </div>
              <h3 className="mt-4 font-heading text-base font-bold text-slate-900">
                Pilih profil &amp; kendaraan
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Tentukan kendaraan harian, konsumsi BBM, jarak tempuh rutin, dan bauran pengisian rumah vs SPKLU.
              </p>
            </div>

            {/* Step 02 */}
            <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6">
              <div className="flex items-center justify-between">
                <span className="font-heading text-2xl font-extrabold text-slate-900">02</span>
                <span className="text-[#2563EB]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </span>
              </div>
              <h3 className="mt-4 font-heading text-base font-bold text-slate-900">
                Lihat hasil komparasi gratis
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Dapatkan estimasi biaya operasional bulanan, potensi penghematan hingga 78%, dan rekomendasi model EV.
              </p>
            </div>

            {/* Step 03 */}
            <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6">
              <div className="flex items-center justify-between">
                <span className="font-heading text-2xl font-extrabold text-slate-900">03</span>
                <span className="text-[#2563EB]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
              </div>
              <h3 className="mt-4 font-heading text-base font-bold text-slate-900">
                Buka rincian &amp; rute fasilitas
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Akses kalkulator komparasi mendalam, rute navigasi SPKLU/SPBKLU, atau masuk sebagai Mitra/Superadmin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FITUR UTAMA (Figma F01) */}
      <section className="py-16">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            FITUR UTAMA
          </span>
          <h2 className="mt-1 font-heading text-3xl font-extrabold text-slate-900">
            Dirancang untuk keputusan yang masuk akal
          </h2>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Link
              href="/kalkulator/bbm"
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#2563EB] hover:shadow-xs"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#EEF5FF] text-[#2563EB]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 22V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17" />
                  <path d="M15 11h2a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9l-3-3" />
                </svg>
              </div>
              <h3 className="mt-3.5 font-heading text-sm font-bold text-slate-900 group-hover:text-[#2563EB]">
                Input mobilitas harian
              </h3>
              <p className="mt-1.5 text-xs text-slate-500">
                Hitung tarif jarak, rute, dan kebiasaan pengisian Anda secara akurat tanpa formulir berbelit.
              </p>
            </Link>

            {/* Feature 2 */}
            <Link
              href="/kalkulator/energi-ev"
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#2563EB] hover:shadow-xs"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#EEF5FF] text-[#2563EB]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3 className="mt-3.5 font-heading text-sm font-bold text-slate-900 group-hover:text-[#2563EB]">
                Motor listrik &amp; swap baterai
              </h3>
              <p className="mt-1.5 text-xs text-slate-500">
                Dukungan simulasi SPBKLU dan sistem battery-swap yang siap pakai dalam hitungan menit.
              </p>
            </Link>

            {/* Feature 3 */}
            <Link
              href="/kalkulator/energi-ev"
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#2563EB] hover:shadow-xs"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#EEF5FF] text-[#2563EB]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h3 className="mt-3.5 font-heading text-sm font-bold text-slate-900 group-hover:text-[#2563EB]">
                Simulasi meteran rumah
              </h3>
              <p className="mt-1.5 text-xs text-slate-500">
                Cek kecukupan daya PLN 900, 1.300, atau 2.200 VA untuk home charging tanpa trip listrik.
              </p>
            </Link>

            {/* Feature 4 */}
            <Link
              href="/kalkulator/perawatan"
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#2563EB] hover:shadow-xs"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#EEF5FF] text-[#2563EB]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <h3 className="mt-3.5 font-heading text-sm font-bold text-slate-900 group-hover:text-[#2563EB]">
                Transparansi biaya perawatan
              </h3>
              <p className="mt-1.5 text-xs text-slate-500">
                Rincian oli, servis, busi, dan kampas rem dibandingkan dengan servis berkala motor/mobil listrik.
              </p>
            </Link>

            {/* Feature 5 */}
            <Link
              href="/fasilitas/peta"
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#2563EB] hover:shadow-xs"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#EEF5FF] text-[#2563EB]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                  <line x1="8" y1="2" x2="8" y2="18" />
                  <line x1="16" y1="6" x2="16" y2="22" />
                </svg>
              </div>
              <h3 className="mt-3.5 font-heading text-sm font-bold text-slate-900 group-hover:text-[#2563EB]">
                Peta fasilitas terintegrasi
              </h3>
              <p className="mt-1.5 text-xs text-slate-500">
                Peta showroom, SPKLU, dan SPBKLU aktif lengkap dengan kalkulator jarak serta estimasi waktu rute.
              </p>
            </Link>

            {/* Feature 6 */}
            <Link
              href="/kalkulator/komparasi-biaya"
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#2563EB] hover:shadow-xs"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#EEF5FF] text-[#2563EB]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="mt-3.5 font-heading text-sm font-bold text-slate-900 group-hover:text-[#2563EB]">
                Komparasi biaya operasional
              </h3>
              <p className="mt-1.5 text-xs text-slate-500">
                Perbandingan instan pengeluaran BBM dan listrik pada rute tempuh harian, bulanan, dan tahunan.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. PRATINJAU HASIL SIMULASI (Figma F01) */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                PRATINJAU HASIL SIMULASI
              </span>
              <h2 className="mt-1 font-heading text-3xl font-extrabold text-slate-900">
                Angka yang mudah dibaca sekilas
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Hasil simulasi tampil sebagai kartu metrik ringkas dan grafik batang berdampingan.
                Evaluasi efisiensi kendaraan konvensional dan potensi penghematan listrik secara transparan.
              </p>

              <div className="mt-8">
                <Link
                  href="/kalkulator/komparasi-biaya"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-xs font-bold text-white transition hover:bg-[#1D4ED8]"
                >
                  Coba simulasi sekarang →
                </Link>
              </div>
            </div>

            {/* Kartu Preview Visual 1:1 Figma F01 */}
            <div className="rounded-3xl border border-slate-200 bg-[#F8FAFC] p-6 shadow-xs sm:p-7">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="text-xs text-slate-500">Hemat per bulan</span>
                  <p className="mt-1.5 num font-heading text-2xl font-extrabold text-[#059669]">
                    Rp 376.185
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="text-xs text-slate-500">Estimasi balik modal</span>
                  <p className="mt-1.5 font-heading text-2xl font-extrabold text-slate-900">
                    3 th 1 bln
                  </p>
                </div>
              </div>

              {/* Bar Comparison Card */}
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Biaya per bulan</span>
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                    Hemat 78%
                  </span>
                </div>

                {/* Vertical Proportion Blocks */}
                <div className="mt-6 flex items-end justify-center gap-8 pb-3">
                  {/* BBM Bar */}
                  <div className="flex w-36 flex-col items-center">
                    <span className="num mb-2 text-xs font-bold text-slate-900">Rp 484.600</span>
                    <div className="h-24 w-full rounded-xl bg-[#94A3B8]" />
                    <span className="mt-2 text-center text-[11px] font-semibold text-slate-500">
                      BBM · Pertalite
                    </span>
                  </div>

                  {/* Listrik Bar */}
                  <div className="flex w-36 flex-col items-center">
                    <span className="num mb-2 text-xs font-bold text-[#2563EB]">Rp 108.415</span>
                    <div className="h-8 w-full rounded-xl bg-[#2563EB]" />
                    <span className="mt-2 text-center text-[11px] font-semibold text-[#2563EB]">
                      Listrik · charging rumah
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA BANNER (Figma F01) */}
      <section className="mx-auto max-w-[1280px] px-5 py-16 lg:px-8">
        <div className="rounded-3xl bg-[#1E3A8A] px-6 py-12 text-center text-white shadow-sm sm:px-12 sm:py-16">
          <h2 className="font-heading text-2xl font-extrabold sm:text-3xl">
            Mulai dari satu pertanyaan sederhana
          </h2>
          <p className="mx-auto mt-2 max-w-md text-xs text-blue-100 sm:text-sm">
            Gratis, tanpa daftar, selesai kurang dari dua menit.
          </p>

          <div className="mt-6">
            <Link
              href="/kalkulator/komparasi-biaya"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 text-xs font-bold text-[#1E3A8A] transition hover:bg-blue-50"
            >
              Mulai Simulasi →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
