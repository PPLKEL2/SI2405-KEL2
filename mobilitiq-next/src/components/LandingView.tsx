"use client";

import React from "react";

interface LandingViewProps {
  onNavigateToCalculator: () => void;
}

export default function LandingView({ onNavigateToCalculator }: LandingViewProps) {
  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <section className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:pb-24 lg:pt-16">
        {/* Left Column: Heading, Subtitle, Stats */}
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700">
            <svg className="h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Untuk pengendara Indonesia
          </div>

          {/* Main Title */}
          <h1 className="mt-5 text-[36px] font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-[56px]">
            Pindah ke listrik, dengan hitungan yang{" "}
            <span className="text-blue-600">jelas.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Bandingkan biaya BBM dan listrik, cek kesiapan daya meteran rumah, temukan SPKLU &amp; SPBKLU terdekat. Semua dalam satu konsultasi singkat.
          </p>

          {/* 3 Stats Grid */}
          <dl className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-slate-200 pt-6">
            <div>
              <dt className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                Rp 377 rb
              </dt>
              <dd className="mt-0.5 text-xs leading-snug text-slate-500">
                hemat/bulan*
              </dd>
            </div>
            <div>
              <dt className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                12.480
              </dt>
              <dd className="mt-0.5 text-xs leading-snug text-slate-500">
                simulasi selesai
              </dd>
            </div>
            <div>
              <dt className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                3 kota
              </dt>
              <dd className="mt-0.5 text-xs leading-snug text-slate-500">
                Jakarta · Bandung · Surabaya
              </dd>
            </div>
          </dl>

          <p className="mt-3 text-xs text-slate-400">
            *Contoh: Honda Vario 125, 60 km/hari, Pertalite.
          </p>
        </div>

        {/* Right Column: Quick Consultation Widget (02 Quick Consultation Widget) */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-[460px] rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
              KONSULTASI GRATIS · 2 MENIT
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Apa yang ingin Anda lakukan?
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Tanpa daftar. Jawab beberapa pertanyaan singkat, hasil langsung tampil.
            </p>

            <div className="mt-6 space-y-3">
              {/* Option 1 */}
              <button
                type="button"
                onClick={onNavigateToCalculator}
                className="group flex min-h-[72px] w-full items-center gap-4 rounded-full border border-slate-200 bg-white px-5 py-3 text-left transition-all hover:border-blue-600 hover:bg-blue-50/60 hover:shadow-sm"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600 transition group-hover:bg-white group-hover:shadow-xs">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-slate-900">Cari Kendaraan Baru</span>
                  <span className="block text-xs text-slate-500">Temukan EV sesuai rute &amp; anggaran</span>
                </span>
                <span className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600">
                  →
                </span>
              </button>

              {/* Option 2: Evaluasi Kendaraan Lama */}
              <button
                type="button"
                onClick={onNavigateToCalculator}
                className="group flex min-h-[72px] w-full items-center gap-4 rounded-full border border-slate-200 bg-white px-5 py-3 text-left transition-all hover:border-blue-600 hover:bg-blue-50/60 hover:shadow-sm"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600 transition group-hover:bg-white group-hover:shadow-xs">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-slate-900">Evaluasi Kendaraan Lama</span>
                  <span className="block text-xs text-slate-500">Hitung hemat bila beralih dari BBM</span>
                </span>
                <span className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600">
                  →
                </span>
              </button>
            </div>

            <p className="mt-5 text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>🔒</span> Data Anda tidak dibagikan ke pihak ketiga.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Cara Kerja Section */}
      <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
            Cara kerja
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            Tiga langkah, tanpa formulir panjang
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Ngobrol dengan asisten",
                desc: "Jawab 3–4 pertanyaan lewat pilihan cepat: kendaraan, rute, anggaran.",
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Lihat hasil teaser gratis",
                desc: "Estimasi hemat bulanan dan satu EV rekomendasi, langsung tanpa login.",
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Masuk untuk rincian penuh",
                desc: "Buka kesiapan meteran, peta SPKLU, cicilan, degradasi baterai, dan PDF.",
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-extrabold text-slate-300">
                    {item.step}
                  </span>
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-blue-600 shadow-xs border border-slate-100">
                    {item.icon}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Keunggulan Section */}
      <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
          Keunggulan
        </p>
        <h2 className="mt-2 max-w-xl text-2xl font-bold text-slate-900 sm:text-3xl">
          Dirancang untuk keputusan yang masuk akal
        </h2>

        <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Hemat berdasarkan rute",
              desc: "Hitung dari jarak, rute, dan kebiasaan Anda, bukan angka rata-rata.",
            },
            {
              title: "Konteks listrik & daya baterai",
              desc: "Perhitungan SPKLU/SPBKLU, kapasitas daya rumah hingga hitungan menit.",
            },
            {
              title: "Ekosistem menerus nyata",
              desc: "Cek showroom, 1.300 atau 2.200 VA cocok sebelum beli.",
            },
            {
              title: "Transparansi dan debunking",
              desc: "Proyeksi kesehatan baterai dan dana cadangan penggantian.",
            },
            {
              title: "Chatbot terpandu",
              desc: "Jawab dengan percakapan. Tidak ada formulir yang rumit.",
            },
            {
              title: "Ekspor laporan PDF",
              desc: "Bawa hasil ke showroom atau diskusi keluarga dalam satu berkas.",
            },
          ].map((item, idx) => (
            <div key={idx} className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Preview Hasil Simulasi Section */}
      <section className="border-t border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
              Preview hasil simulasi
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Angka yang mudah dibaca sekilas
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
              Hasil tampil sebagai kartu metrik dan perbandingan berdampingan. Rincian lanjutan terbuka setelah Anda masuk.
            </p>
            <button
              type="button"
              onClick={onNavigateToCalculator}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:bg-blue-800"
            >
              Coba simulasi sekarang →
            </button>
          </div>

          {/* Interactive Metric Preview Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4">
                <span className="text-xs font-medium text-slate-500">Hemat per bulan</span>
                <p className="mt-1 text-2xl font-extrabold text-emerald-600">
                  Rp 376.185
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4">
                <span className="text-xs font-medium text-slate-500">Estimasi balik modal</span>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  3 th 1 bln
                </p>
              </div>
            </div>

            {/* Bar comparison */}
            <div className="mt-5 rounded-xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Biaya per bulan</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                  Hemat 78%
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>BBM - Pertalite</span>
                    <span className="font-bold text-slate-800">Rp 484.600</span>
                  </div>
                  <div className="mt-1 h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-slate-500 w-[100%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Listrik - Charging rumah</span>
                    <span className="font-bold text-blue-600">Rp 108.415</span>
                  </div>
                  <div className="mt-1 h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-blue-600 w-[22%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA Banner */}
      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-[1200px] rounded-3xl bg-blue-800 px-6 py-12 text-center text-white sm:py-16">
          <h2 className="mx-auto max-w-2xl text-2xl font-bold sm:text-3xl">
            Mulai dari satu pertanyaan sederhana
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-xs text-blue-100 sm:text-sm">
            Gratis, tanpa daftar, selesai kurang dari dua menit.
          </p>
          <button
            type="button"
            onClick={onNavigateToCalculator}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-800 shadow-md transition hover:bg-blue-50 active:scale-95"
          >
            Mulai Konsultasi →
          </button>
        </div>
      </section>
    </div>
  );
}

