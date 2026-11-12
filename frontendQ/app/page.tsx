import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* 1. Hero Section persis Figma Tr() */}
      <section className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 pb-16 pt-10 @3xl:px-8 @5xl:grid-cols-[1.2fr_1fr] @5xl:gap-16 @5xl:pb-24 @5xl:pt-20">
        <div>
          {/* Tag Pill Info */}
          <span className="inline-flex items-center gap-2 rounded-full bg-tint px-3 py-1 text-xs font-bold text-electric">
            <svg
              width="13"
              height="13"
              style={{ width: 13, height: 13, maxWidth: 13, maxHeight: 13 }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Untuk pengendara Indonesia
          </span>

          {/* Headline */}
          <h1 className="mt-5 text-[38px] font-extrabold leading-[1.06] text-ink @3xl:text-[60px]">
            Pindah ke listrik, dengan hitungan yang <span className="text-electric">jelas.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 max-w-xl text-base leading-relaxed text-mute @3xl:text-lg">
            Bandingkan biaya BBM dan listrik, cek kesiapan daya meteran rumah, temukan SPKLU &amp; SPBKLU terdekat.
            Semua dalam satu konsultasi singkat.
          </p>

          {/* Stats Bar */}
          <dl className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6">
            <div>
              <dt className="num text-xl font-extrabold text-ink @3xl:text-2xl">Rp 377 rb</dt>
              <dd className="mt-0.5 text-xs text-mute">hemat/bulan*</dd>
            </div>
            <div>
              <dt className="num text-xl font-extrabold text-ink @3xl:text-2xl">12.480</dt>
              <dd className="mt-0.5 text-xs text-mute">simulasi selesai</dd>
            </div>
            <div>
              <dt className="num text-xl font-extrabold text-ink @3xl:text-2xl">3 kota</dt>
              <dd className="mt-0.5 text-xs text-mute">Jakarta &middot; Bandung &middot; Sby</dd>
            </div>
          </dl>

          <p className="mt-3 text-xs text-mute">
            *Contoh: Honda Vario 125, 60 km/hari, Pertalite.
          </p>
        </div>

        {/* Hero Right: Quick Consultation Widget Cr() */}
        <div className="flex justify-center @5xl:justify-end">
          <div className="w-full max-w-[460px] rounded-3xl border border-line bg-white p-6 shadow-sm @3xl:p-8">
            <span className="text-xs font-bold uppercase tracking-wider text-electric">
              Konsultasi gratis &middot; 2 menit
            </span>
            <h2 className="mt-2 text-2xl font-bold text-ink">
              Apa yang ingin Anda lakukan?
            </h2>
            <p className="mt-1.5 text-sm text-mute">
              Tanpa daftar. Jawab beberapa pertanyaan singkat, hasil langsung tampil.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/kalkulator/energi-ev"
                className="group flex min-h-[72px] w-full items-center gap-4 rounded-full border border-line bg-white px-5 py-3 text-left transition-all hover:border-electric hover:bg-tint hover:shadow-sm"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-tint text-electric group-hover:bg-white">
                  <svg
                    width="20"
                    height="20"
                    style={{ width: 20, height: 20, maxWidth: 20, maxHeight: 20 }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <circle cx="7" cy="18" r="2" />
                    <circle cx="17" cy="18" r="2" />
                    <path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold text-ink">
                    Cari Kendaraan Baru
                  </span>
                  <span className="block text-[13px] text-mute">
                    Temukan EV sesuai rute &amp; anggaran
                  </span>
                </span>
                <svg
                  width="18"
                  height="18"
                  style={{ width: 18, height: 18, maxWidth: 18, maxHeight: 18 }}
                  className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-electric"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>

              <Link
                href="/kalkulator/energi-ev"
                className="group flex min-h-[72px] w-full items-center gap-4 rounded-full border border-line bg-white px-5 py-3 text-left transition-all hover:border-electric hover:bg-tint hover:shadow-sm"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-tint text-electric group-hover:bg-white">
                  <svg
                    width="20"
                    height="20"
                    style={{ width: 20, height: 20, maxWidth: 20, maxHeight: 20 }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 22h12" />
                    <path d="M4 9h10" />
                    <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
                    <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold text-ink">
                    Evaluasi Kendaraan Lama
                  </span>
                  <span className="block text-[13px] text-mute">
                    Hitung hemat jika beralih dari BBM
                  </span>
                </span>
                <svg
                  width="18"
                  height="18"
                  style={{ width: 18, height: 18, maxWidth: 18, maxHeight: 18 }}
                  className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-electric"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>

            <p className="mt-5 flex items-center gap-2 text-[13px] text-mute">
              <svg
                width="15"
                height="15"
                style={{ width: 15, height: 15, maxWidth: 15, maxHeight: 15 }}
                className="text-ok shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Data Anda tidak dibagikan ke pihak ketiga.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Cara Kerja Section */}
      <section className="border-y border-line bg-white py-16 @3xl:py-20">
        <div className="mx-auto max-w-[1200px] px-5 @3xl:px-8">
          <span className="text-xs font-bold uppercase tracking-wider text-electric">
            Cara kerja
          </span>
          <h2 className="mt-2 text-3xl font-bold text-ink @3xl:text-4xl">
            Tiga langkah, tanpa formulir panjang
          </h2>

          <div className="mt-10 grid gap-5 @3xl:grid-cols-3">
            {[
              {
                num: "01",
                title: "Ngobrol dengan asisten",
                desc: "Jawab 3–4 pertanyaan lewat pilihan cepat: kendaraan, rute, anggaran.",
                icon: (
                  <svg width="20" height="20" style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                ),
              },
              {
                num: "02",
                title: "Lihat hasil teaser gratis",
                desc: "Estimasi hemat bulanan dan satu EV rekomendasi, langsung tanpa login.",
                icon: (
                  <svg width="20" height="20" style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                ),
              },
              {
                num: "03",
                title: "Masuk untuk rincian penuh",
                desc: "Buka kesiapan meteran, peta SPKLU, cicilan, degradasi baterai, dan PDF.",
                icon: (
                  <svg width="20" height="20" style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                ),
              },
            ].map((step) => (
              <div key={step.num} className="rounded-2xl border border-line bg-canvas p-6">
                <div className="flex items-center justify-between">
                  <span className="num text-4xl font-extrabold text-slate-300">{step.num}</span>
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-electric shadow-sm">
                    {step.icon}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-mute">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Keunggulan Section */}
      <section className="mx-auto max-w-[1200px] px-5 py-16 @3xl:px-8 @3xl:py-24">
        <span className="text-xs font-bold uppercase tracking-wider text-electric">
          Keunggulan
        </span>
        <h2 className="mt-2 max-w-xl text-3xl font-bold text-ink @3xl:text-4xl">
          Dirancang untuk keputusan yang masuk akal
        </h2>

        <div className="mt-10 grid gap-x-10 gap-y-9 @3xl:grid-cols-2 @5xl:grid-cols-3">
          {[
            {
              title: "Input rutinitas harian",
              desc: "Hitung dari jarak, rute, dan kebiasaan Anda, bukan angka rata-rata umum.",
            },
            {
              title: "Motor listrik & swap baterai",
              desc: "Dukungan SPBKLU: tukar baterai motor listrik dalam hitungan menit.",
            },
            {
              title: "Simulator meteran rumah",
              desc: "Cek apakah 900, 1.300, atau 2.200 VA cukup sebelum risiko meteran trip.",
            },
            {
              title: "Transparansi degradasi baterai",
              desc: "Proyeksi kesehatan baterai dan estimasi dana cadangan penggantian.",
            },
            {
              title: "Chatbot terpandu",
              desc: "Jawab dengan sekali ketuk. Tidak ada kuesioner atau formulir berbelit.",
            },
            {
              title: "Ekspor laporan PDF",
              desc: "Bawa hasil analisis ke showroom atau diskusi keluarga dalam satu berkas.",
            },
          ].map((item, idx) => (
            <div key={idx} className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-tint text-electric font-bold">
                {idx + 1}
              </span>
              <div>
                <h3 className="text-base font-bold text-ink">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-mute">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Preview Hasil Simulasi Section */}
      <section className="border-t border-line bg-white py-16 @3xl:py-20">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 @3xl:px-8 @5xl:grid-cols-[1fr_1.1fr] @5xl:gap-16">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-electric">
              Preview hasil simulasi
            </span>
            <h2 className="mt-2 text-3xl font-bold text-ink @3xl:text-4xl">
              Angka yang mudah dibaca sekilas
            </h2>
            <p className="mt-4 text-base leading-relaxed text-mute">
              Hasil tampil sebagai kartu metrik dan perbandingan berdampingan. Rincian lanjutan
              lengkap dapat disimulasikan langsung lewat kalkulator interaktif.
            </p>
            <div className="mt-6">
              <Link
                href="/kalkulator/energi-ev"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-electric px-6 text-sm font-bold text-white transition hover:bg-electric-dark shadow-sm"
              >
                Coba simulasi sekarang
                <svg
                  width="16"
                  height="16"
                  style={{ width: 16, height: 16, maxWidth: 16, maxHeight: 16 }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Metric Comparison Card persis Figma */}
          <div className="rounded-3xl border border-line bg-canvas p-6 shadow-sm @3xl:p-8">
            <div className="grid gap-4 @3xl:grid-cols-2">
              <div className="rounded-2xl border border-line bg-white p-5">
                <span className="text-xs font-semibold text-mute">Hemat per bulan</span>
                <p className="mt-2 num text-2xl font-black text-ok">Rp 377.000</p>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-ok bg-emerald-50 px-2 py-0.5 rounded-md">
                  Hemat 81%
                </span>
              </div>
              <div className="rounded-2xl border border-line bg-white p-5">
                <span className="text-xs font-semibold text-mute">Estimasi balik modal</span>
                <p className="mt-2 num text-2xl font-black text-ink">3 th 2 bln</p>
                <span className="mt-1 block text-xs text-mute">Selisih harga unit EV vs BBM</span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-line bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-bold text-ink">Biaya energi per bulan</span>
                <span className="text-xs font-medium text-mute">60 km/hari</span>
              </div>

              {/* Progress Comparison Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">BBM (Honda Vario 125 &middot; Pertalite)</span>
                    <span className="text-ink font-bold">Rp 468.000</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: "100%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-electric font-bold">Listrik (Polytron Fox-R)</span>
                    <span className="text-electric font-bold">Rp 91.000</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-electric rounded-full" style={{ width: "19.4%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bottom CTA Banner */}
      <section className="px-5 py-16 @3xl:px-8">
        <div className="mx-auto max-w-[1200px] rounded-3xl bg-brand px-6 py-12 text-center @3xl:py-16 shadow-lg">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white @3xl:text-4xl">
            Mulai dari satu pertanyaan sederhana
          </h2>
          <p className="mx-auto mt-3 max-w-md text-blue-100">
            Gratis, tanpa daftar, selesai kurang dari dua menit.
          </p>
          <Link
            href="/kalkulator/energi-ev"
            className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-7 text-[15px] font-bold text-brand transition hover:bg-blue-50 shadow-sm"
          >
            Mulai Konsultasi
            <svg
              width="16"
              height="16"
              style={{ width: 16, height: 16, maxWidth: 16, maxHeight: 16 }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
