# Inventarisasi Layar (*Screen Inventory*) MobilitiQ (Tervalidasi Final)

> **Status Implementasi Saat Ini**: Seluruh 30 layar pada *prototype* Figma Make (`https://spoon-fever-26714564.figma.site`) masih berupa simulasi antarmuka sisi klien (*client-side SPA*) berbasis Vite + React 19 + TypeScript + Tailwind CSS v4 dengan data statis di memori. **Belum ada satu pun fitur produksi (0%) yang terhubung ke PostgreSQL, Prisma ORM, Express API, maupun autentikasi nyata.**

---

## 1. Validasi Aktor & *Role* Pengguna Berdasarkan Desain dan PBI

Pada audit tahap awal, tabel inventarisasi layar mencantumkan 5 baris kelompok tampilan (mengikuti properti `group` pada array `fe` di `src/data.ts`: `ds`, `public`, `user`, `mitra`, `super`), sedangkan rancangan RBAC mencatat 3 *role* basis data (`USER`, `MITRA`, `SUPERADMIN`).

Hasil **Validasi Role Final** menyelaraskan keduanya tanpa menambah *role* baru di luar desain dan kebutuhan PBI:

1. **Artefak Non-Role (Bukan Aktor Pengguna)**:
   - Kelompok kode `ds` (**Frame `00` - Design System**) beserta bilah `PreviewShell` (`App.tsx`) adalah **dokumentasi katalog komponen internal (*UI Kit*)**, bukan *role* pengguna di dalam bisnis MobilitiQ. Pada produksi (Vite + React Router), katalog ini tidak dipublikasikan ke pengguna akhir.
2. **4 Aktor Sistem Sebenarnya = 1 Aktor Sesi Anonim + 3 *Role* Akun Terautentikasi (`users.role`)**:
   - **`Guest` / Tamu (Aktor Publik Tanpa Akun - Status Sesi: *Unauthenticated*)**: Pengunjung yang mengakses halaman publik, menjalankan konsultasi awal, dan melihat pratinjau hasil yang sebagian dikunci `BlurGate` (`01` s.d. `06`). Tidak disimpan sebagai nilai pada kolom `users.role`, melainkan dilacak menggunakan `guest_session_token` hingga pengguna mendaftar/masuk (sesuai metrik layar `26`: *"Konversi tamu -> login"*).
   - **`USER` / Pengguna Terdaftar (`users.role = 'USER'`)**: Pengguna yang telah masuk untuk mengakses dashboard penuh, seluruh kalkulator BBM & EV (`KEL2-54`, `KEL2-67`, `KEL2-73`), penjelajahan & komparasi katalog EV (`KEL2-57` sisi pembaca), peta fasilitas (`KEL2-71` sisi pencari), laporan PDF, serta riwayat & profil (`07` s.d. `21`).
   - **`MITRA` (`users.role = 'MITRA'`, dengan atribut status verifikasi bisnis `PENDING | APPROVED | REJECTED` pada tabel `partners`)**: Entitas bisnis mitra (*Dealer motor*, *Showroom mobil*, *Operator SPKLU*, *Operator SPBKLU* adalah kategori bisnis mitra `partner_category`, **bukan** *role* terpisah) yang mengelola katalog unit EV (`KEL2-57` di `23`), titik lokasi fasilitas (`KEL2-71` di `24`), harga layanan (`25`), dan pemantauan *lead* (`22`).
   - **`SUPERADMIN` (`users.role = 'SUPERADMIN'`)**: Pengelola platform yang mengatur tarif energi nasional BBM & PLN (`KEL2-69` di `27`), kebijakan insentif & pajak EV (`28`), verifikasi dokumen legalitas mitra (`29`), serta analitik makro (`26`).

| Klasifikasi Sistem | Nilai `users.role` di DB | Kelompok *Prototype* | *Layout Shell* | Daftar *Frame* | Jumlah Layar | Aturan Akses React Router & Express Middleware |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **Non-Role (Dokumentasi UI Kit)** | *Tidak ada* | `ds` | Tanpa *shell* | `00` | 1 | Hanya aktif pada mode pengembangan lokal (`import.meta.env.DEV`), tidak masuk rute produksi. |
| **Aktor Tamu (*Guest*)** | *Belum login* (`guest_session_token`) | `public` | `PublicLayout` | `01, 02, 03, 04, 05, 06` | 6 | Rute publik terbuka. Rincian mendalam pada `05` dikunci `BlurGate` dan memicu dialog autentikasi (`06`). |
| **Role Pengguna Terdaftar** | `USER` | `user` | `UserLayout` | `07` s.d. `21` | 15 | Wajib autentikasi JWT/sesi valid (`USER`; halaman katalog `10` & peta `19` juga dapat dibuka baca-saja dari navbar publik sesuai kebijakan rute). |
| **Role Mitra Bisnis** | `MITRA` | `mitra` | `MitraLayout` | `22, 23, 24, 25` | 4 | Wajib autentikasi `role = 'MITRA'`. Mutasi publikasi unit/fasilitas mensyaratkan `partners.verification_status = 'APPROVED'`. |
| **Role Superadmin** | `SUPERADMIN` | `super` | `SuperLayout` | `26, 27, 28, 29` | 4 | Wajib autentikasi `role = 'SUPERADMIN'`. |

---

## 2. Daftar Lengkap 30 Layar (*Frame* `00` s.d. `29`)

### A. Artefak Dokumentasi Internal (`ds` - Non-Role)

#### Frame `00` - Design System
- **Komponen Sumber**: `_i` (`src/screens/system.tsx`)
- **Aktor / Role**: Non-Role (Artefak referensi komponen internal pengembang)
- **Rute React Router**: `/__dev/design-system` (hanya `DEV`)
- **Fungsi Utama**: Pameran visual dan uji interaktif seluruh token warna, tipografi, komponen form, kartu, modal, tabel, dan grafik MobilitiQ.
- **Komponen UI**: 12 token warna (`Brand #1E40AF`, `Electric #2563EB`, `Electric Dark #1D4ED8`, `Tint #EFF6FF`, `Ink #0F172A`, `Mute #64748B`, `Line #E2E8F0`, `Canvas #F8FAFC`, `White #FFFFFF`, `Success #10B981`, `Warning #F59E0B`, `Danger #EF4444`), tipografi `Plus Jakarta Sans` + `Inter` (`.num`), `Button`, `FilterChip`, `TextInput`, `SelectInput`, `SearchInput`, `RangeSlider`, `Switch`, `SegmentedTabs`, `Badge`, `MetricCard`, `StepProgress`, `ChatBubble`, `BlurGate`, `HomeLoadGauge`, `ProgressBar`, `CompareBarChart`, `DonutChart`, `LineChart`, `StackedHorizontalBar`, `DataTable`, `Modal`, `Toast`, `Skeleton`, `EmptyState`.
- **Interaksi**: Uji klik tombol, *chip*, *slider*, *switch*, *tabs*, pembukaan modal, dan pemanggilan *toast*.

---

### B. Halaman Publik / Aktor Tamu (`Guest` - `public`)

#### Frame `01` - Landing
- **Komponen Sumber**: `Tr` (`src/screens/public.tsx`) dalam `PublicLayout` (`footer=true`)
- **Aktor / Role**: `Guest` (juga dapat diakses oleh pengguna yang sudah login)
- **Rute React Router**: `/`
- **Fungsi Utama**: Halaman depan aplikasi yang memperkenalkan proposisi nilai MobilitiQ, menampilkan ringkasan simulasi penghematan BBM vs EV, dan mengarahkan pengunjung memulai konsultasi.
- **Komponen UI**: `PublicNavbar`, *Hero* + `QuickWidget` (`Jalur A` vs `Jalur B`), pita 3 statistik makro, seksi 3 langkah `Cara kerja`, seksi 6 kartu `Keunggulan`, kartu pratinjau simulasi (`MetricCard` x2 + `CompareBarChart`), pita *CTA* bawah, `PublicFooter`.
- **Interaksi**: Pilih `Jalur A`/`Jalur B` (`-> /konsultasi`), klik `Sesuaikan dengan kondisi saya` / `Mulai Konsultasi` (`-> /konsultasi`), navigasi navbar ke Katalog EV, Peta SPKLU, Kalkulator, atau tombol `Masuk`.

#### Frame `02` - Quick Consultation Widget
- **Komponen Sumber**: `wr` + `Cr` (`src/screens/public.tsx`) dalam `PublicLayout` (`footer=false`)
- **Aktor / Role**: `Guest`
- **Rute React Router**: `/mulai-konsultasi`
- **Fungsi Utama**: Halaman fokus pemilih skenario konsultasi awal (`Jalur A: Cari Kendaraan Baru` atau `Jalur B: Evaluasi Kendaraan Lama`).
- **Komponen UI**: `PublicNavbar`, kartu tunggal `QuickWidget` dua opsi berikon.
- **Interaksi**: Klik salah satu jalur menyimpan pilihan `pathway` (`A` atau `B`) dan menavigasi ke `/konsultasi` (`03`).

#### Frame `03` - Chatbot Konsultasi
- **Komponen Sumber**: `Dr` (`src/screens/public.tsx`) dalam `PublicLayout` (`footer=false`)
- **Aktor / Role**: `Guest` / `USER`
- **Rute React Router**: `/konsultasi`
- **Fungsi Utama**: Pohon keputusan percakapan terpandu (*guided chatbot*) untuk mengumpulkan data mobilitas pengguna dan merekomendasikan model EV paling sesuai.
- **Komponen UI**: Tombol kembali (`-> /`), `SegmentedTabs` (`Jalur A`, `Jalur B`), `StepProgress` (3 langkah Jalur A, 4 langkah Jalur B), riwayat `ChatBubble` (`bot` & `user`), animasi mengetik 3 titik, tombol pilihan cepat, dan input desimal kustom `km/l` (khusus Jalur B langkah 2).
- **Interaksi**:
  - **Jalur A (3 Langkah)**: Pilih `Motor`/`Mobil` -> Pilih jarak harian (`15, 30, 50, 80, 120 km`) -> Pilih plafon anggaran (`Motor: 25/35/50/80 jt`; `Mobil: 200/350/600/900 jt`).
  - **Jalur B (4 Langkah)**: Pilih kendaraan BBM saat ini -> Pilih *chip* `km/l` atau isi angka manual (`validasi 3-60 km/l`) -> Pilih jenis BBM (`Pertalite`, `Pertamax`, `Solar`) -> Pilih jarak harian.
  - Selesai langkah akhir: memilih rekomendasi EV, mengirim sesi konsultasi, dan berpindah otomatis ke `/hasil-teaser` (`04`).

#### Frame `04` - Hasil Teaser
- **Komponen Sumber**: `Or` (`src/screens/public.tsx`) dalam `PublicLayout` (`footer=false`)
- **Aktor / Role**: `Guest` / `USER`
- **Rute React Router**: `/hasil-teaser`
- **Fungsi Utama**: Menampilkan angka penghematan utama per bulan dan 1 kartu rekomendasi EV pasca-konsultasi.
- **Komponen UI**: `Badge` jalur & jarak bulanan, kartu *Hero* penghematan (`Rp/bulan` & `%`), kartu unit EV rekomendasi (merek, model, tipe, OTR, jarak WLTP, kWh, efisiensi kWh/100km, promo), batang horizontal biaya BBM vs listrik rumah, tombol `Lihat Hasil Lengkap` & `Ulangi Konsultasi`.
- **Interaksi**: Klik `Lihat Hasil Lengkap` (`-> /hasil-tamu` `05` bila `Guest`, atau `-> /dashboard` `07` bila sudah `USER`), klik `Ulangi Konsultasi` (`-> /konsultasi` `03`).

#### Frame `05` - Dashboard Hasil Tamu
- **Komponen Sumber**: `Ar` + `kr` (`src/screens/public.tsx`) dalam `PublicLayout` (`footer=true`)
- **Aktor / Role**: `Guest`
- **Rute React Router**: `/hasil-tamu`
- **Fungsi Utama**: Menampilkan 3 metrik dasar dan grafik biaya bulanan secara terbuka, serta mengunci 5 analisis lanjutan di balik `BlurGate` untuk mendorong konversi login/registrasi.
- **Komponen UI**: `Badge` status tamu, *(tab demo `Terkunci/Terbuka` dihapus di produksi)*, 3 `MetricCard` terbuka (Hemat/bln, Balik modal, Status VA rumah), `CompareBarChart` terbuka, dan `BlurGate` yang membungkus 5 kartu pratinjau (beban meteran rumah, peta mini radius 3 km, kredit DP 20% 36 bln, kurva SoH 10 th, unduh PDF).
- **Interaksi**: Klik `Masuk untuk Membuka` memunculkan dialog `Modal Login` (`06`) dengan target klaim ke `/dashboard` (`07`).

#### Frame `06` - Modal Login
- **Komponen Sumber**: `Mr` + `jr` (`src/screens/public.tsx`) menggunakan `shadcn/ui Dialog` di produksi
- **Aktor / Role**: `Guest` (transisi autentikasi menjadi `USER`, `MITRA`, atau `SUPERADMIN`)
- **Rute React Router**: Dialog *overlay* global atau `/masuk`
- **Fungsi Utama**: Autentikasi pengguna melalui Google OAuth atau kredensial Email + Kata Sandi, sekaligus mengklaim draf simulasi tamu ke akun pengguna.
- **Komponen UI**: Dialog modal aksesibel (*focus-trapped*), tombol `Lanjutkan dengan Google`, input `Email` (validasi format) + `Kata Sandi` *(ditambahkan di produksi menggantikan login tanpa sandi BUG-09)*, tombol submit, dan tautan pendaftaran akun/mitra.
- **Interaksi**: Autentikasi valid menerbitkan sesi HTTP-only cookie/JWT, mengklaim `guest_session_token`, menutup modal, dan mengarahkan pengguna sesuai `role` (`USER -> /dashboard`, `MITRA -> /mitra/dashboard`, `SUPERADMIN -> /admin/analitik`).

---

### C. Halaman Pengguna Terdaftar (`USER` - `user`)

#### Frame `07` - Dashboard Ringkasan
- **Komponen Sumber**: `Lr` (`src/screens/user1.tsx`) dalam `UserLayout`
- **Aktor / Role**: `USER`
- **Rute React Router**: `/dashboard`
- **Fungsi Utama**: Ringkasan eksekutif kelayakan EV pengguna yang menyatukan 4 KPI utama, status daya listrik rumah, grafik biaya bulanan, 6 pintasan kalkulator, dan kartu unit EV aktif.
- **Komponen UI**: `Skeleton` saat *fetch* API, `PageHeader` + tombol `Unduh PDF`, 4 `MetricCard` (Hemat/bulan, Payback, TCO 5 th, Reduksi CO2/th), kartu `HomeLoadGauge`, kartu `CompareBarChart`, kisi 6 kartu pintasan (`15, 12, 14, 09, 11, 18`), kartu EV aktif.
- **Interaksi**: Navigasi ke pratinjau PDF (`20`), pengatur daya rumah (`15`), katalog EV (`10`), dan 6 alat bantu keputusan.

#### Frame `08` - Kalkulator BBM & Perawatan
- **Komponen Sumber**: `Rr` (`src/screens/user1.tsx`) dalam `UserLayout` + `CalculatorSplitLayout`
- **Aktor / Role**: `USER`
- **Rute React Router**: `/kalkulator/bbm`
- **Fungsi Utama**: Menghitung pengeluaran bulanan dan komposisi biaya tahunan kendaraan konvensional (BBM, perawatan oli/servis/ban-rem, dan pajak STNK).
- **Komponen UI**: `SelectInput` preset kendaraan BBM, `RangeSlider` efisiensi `km/l` (`5-60`, langkah `0.5`), `SelectInput` jenis BBM, `RangeSlider` jarak harian (`5-150 km`), 3 `MetricCard`, `DonutChart` + `ChartLegend` biaya tahunan, daftar `KeyValueRow` rincian perawatan bulanan.
- **Interaksi**: Pilih preset mengisi acuan `km/l`; perubahan *slider*/BBM memperbarui *store* simulasi dan grafik secara *real-time*.

#### Frame `09` - Simulator Energi EV
- **Komponen Sumber**: `zr` (`src/screens/user1.tsx`) dalam `UserLayout` + `CalculatorSplitLayout`
- **Aktor / Role**: `USER`
- **Rute React Router**: `/kalkulator/energi-ev`
- **Fungsi Utama**: Mensimulasikan konsumsi `kWh/bulan`, biaya pengisian berdasarkan bauran *home charging* (tarif PLN sesuai golongan VA pengguna) vs SPKLU publik, dan penghematan terhadap BBM.
- **Komponen UI**: `SelectInput` unit EV, `RangeSlider` jarak harian (`5-150 km`), `RangeSlider` porsi *home charging* (`0-100%`), info tarif PLN & SPKLU aktif, 3 `MetricCard` (`kWh/bln`, `Biaya listrik + Rp/km`, `Hemat vs BBM`), `CompareBarChart`, `DonutChart` sumber pengisian.
- **Interaksi**: Pilih unit EV (mempertahankan `km/l` BBM pengguna bila kategori kendaraan sama), geser jarak harian dan bauran *home charging* yang tersinkron ke *store* simulasi.

#### Frame `10` - Katalog EV
- **Komponen Sumber**: `Br` (`src/screens/user1.tsx`) dalam `UserLayout`
- **Aktor / Role**: `USER` (dan mode baca publik bila dibuka dari `PublicNavbar`)
- **Rute React Router**: `/katalog`
- **Fungsi Utama**: Menjelajahi, mencari, dan memfilter katalog motor serta mobil listrik aktif, memilih unit simulasi, dan memilih 2 unit untuk dikomparasi.
- **Komponen UI**: `SearchInput` merek/model, `RangeSlider` harga maks (`20-800 jt`), `SelectInput` baterai min (`0, >=2, >=30, >=50 kWh`), `FilterChip` tipe (`Semua, Motor, Mobil`), `EmptyState` reset filter, kisi 3 kolom kartu EV, bilah bawah melayang (*sticky compare bar*).
- **Interaksi**: Filter terikat ke *query params* URL; pilih maksimal 2 unit untuk `Bandingkan` (`-> /komparasi` `11`), klik `Detail` (`-> 11`), klik `Pakai untuk simulasi`.

#### Frame `11` - Detail & Komparasi EV
- **Komponen Sumber**: `Vr` (`src/screens/user1.tsx`) dalam `UserLayout`
- **Aktor / Role**: `USER`
- **Rute React Router**: `/komparasi`
- **Fungsi Utama**: Membandingkan 8 parameter spesifikasi, harga OTR, biaya listrik bulanan, dan garansi baterai antara 2 model EV secara berdampingan.
- **Komponen UI**: 2 kartu pemilih `Unit A` & `Unit B` (`SelectInput` + tombol `Pakai untuk simulasi`), `DataTable` 8 baris dengan sorotan hijau `text-ok-ink` pada nilai pemenang.
- **Interaksi**: Ganti `Unit A` atau `Unit B`, atau tetapkan salah satu unit sebagai kendaraan aktif simulasi.

#### Frame `12` - Kalkulator Pembelian Awal
- **Komponen Sumber**: `Hr` (`src/screens/user1.tsx`) dalam `UserLayout` + `CalculatorSplitLayout`
- **Aktor / Role**: `USER`
- **Rute React Router**: `/kalkulator/pembelian`
- **Fungsi Utama**: Menghitung DP, pokok pinjaman, total bunga *flat*, cicilan bulanan, potongan insentif pemerintah aktif, dan persentase cicilan yang tertutup oleh penghematan BBM.
- **Komponen UI**: `SelectInput` unit EV, `RangeSlider` DP (`10-50%`), `SelectInput` tenor (`12-60 bln`), `RangeSlider` bunga *flat* (`0-10%/th`), `Switch` insentif aktif (`PPN DTP` / subsidi motor), 3 `MetricCard`, `KeyValueRow` rincian biaya awal, `ProgressBar` rasio penghematan terhadap cicilan.
- **Interaksi**: Ubah parameter pembiayaan & sakelar insentif dengan sinkronisasi langsung ke *store* simulasi.

#### Frame `13` - Estimator Degradasi Baterai
- **Komponen Sumber**: `Ur` (`src/screens/user2.tsx`) dalam `UserLayout` + `CalculatorSplitLayout`
- **Aktor / Role**: `USER`
- **Rute React Router**: `/kalkulator/degradasi`
- **Fungsi Utama**: Memproyeksikan kurva *State of Health* (SoH) baterai dan jarak tempuh efektif selama 1 s.d. 10 tahun menurut kebiasaan pengisian daya (dominan AC, campuran, sering DC).
- **Komponen UI**: `SelectInput` unit EV, `SelectInput` kebiasaan *charging*, `RangeSlider` durasi (`1-10 th`), 3 `MetricCard` (SoH, Jarak efektif, Garansi pabrik), `LineChart` 3 seri + garis ambang garansi `70%` + `ChartLegend`.
- **Interaksi**: Pilih pola pengisian dan tahun kepemilikan untuk memperbarui proyeksi SoH.

#### Frame `14` - Dana Cadangan Baterai
- **Komponen Sumber**: `Wr` (`src/screens/user2.tsx`) dalam `UserLayout` + `CalculatorSplitLayout`
- **Aktor / Role**: `USER`
- **Rute React Router**: `/kalkulator/dana-baterai`
- **Fungsi Utama**: Menghitung tabungan *sinking fund* bulanan untuk penggantian baterai dengan memperhitungkan tren penurunan harga sel baterai tahunan dan bunga deposito.
- **Komponen UI**: `SelectInput` unit EV, `RangeSlider` target tahun ganti (`5-12 th`), `RangeSlider` harga baterai/kWh, `RangeSlider` penurunan harga/tahun (`0-10%`), `Switch` deposito, 3 `MetricCard`, `LineChart` akumulasi dana vs target.
- **Interaksi**: Sesuaikan horizon dan asumsi harga baterai; nilai setoran bulanan tersinkron ke perhitungan TCO (`17`).

#### Frame `15` - Home Charging Planner
- **Komponen Sumber**: `Jr` (`src/screens/user2.tsx`) dalam `UserLayout` + `CalculatorSplitLayout`
- **Aktor / Role**: `USER`
- **Rute React Router**: `/kalkulator/daya-rumah`
- **Fungsi Utama**: Menganalisis kecukupan daya meteran PLN rumah (`VA`) terhadap beban dasar rumah tangga dan daya *charger* EV ($\cos\varphi = 0.85$), durasi isi penuh, serta rekomendasi tambah daya atau *charging* malam.
- **Komponen UI**: Tombol *chip* golongan `VA`, kartu radio pemilihan daya *charger* (`0.3-3.5 kW`), `RangeSlider` beban rumah tangga (`0.1-2.5 kW`), `Switch` mode *charging* malam, kartu `HomeLoadGauge` + durasi pengisian penuh, kartu rekomendasi dinamis dengan tombol `Terapkan`/`Aktifkan`.
- **Interaksi**: Ubah golongan VA/*charger*/beban rumah atau klik tombol `Terapkan` pada saran tambah daya PLN.

#### Frame `16` - Simulator Jarak Tempuh
- **Komponen Sumber**: `Yr` (`src/screens/user2.tsx`) dalam `UserLayout` + `CalculatorSplitLayout`
- **Aktor / Role**: `USER`
- **Rute React Router**: `/kalkulator/jarak-tempuh`
- **Fungsi Utama**: Menguji kecukupan jarak tempuh riil EV terhadap jarak rute perjalanan berdasarkan SoC keberangkatan dan kondisi berkendara (AC, hujan/macet, muatan penuh).
- **Komponen UI**: `SelectInput` unit EV, `FilterChip` preset rute dari DB, `RangeSlider` jarak perjalanan (`5-500 km`), `RangeSlider` SoC berangkat (`20-100%`), 3 `Switch` kondisi berkendara, kartu *Hero* jarak riil + `Badge` status + `ProgressBar`, kartu saran jumlah pengisian SPKLU.
- **Interaksi**: Klik preset rute atau atur *slider* jarak, SoC, dan sakelar penalti kondisi.

#### Frame `17` - TCO 5 Tahun & Payback
- **Komponen Sumber**: `Xr` (`src/screens/user2.tsx`) dalam `UserLayout` + `CalculatorSplitLayout`
- **Aktor / Role**: `USER`
- **Rute React Router**: `/kalkulator/tco`
- **Fungsi Utama**: Membandingkan *Total Cost of Ownership* (TCO) 5 tahun (60 bulan) antara kendaraan BBM dan EV pada 5 komponen biaya serta menentukan titik bulan balik modal (*break-even*).
- **Komponen UI**: `SelectInput` unit EV, `RangeSlider` jarak harian, `SelectInput` skenario (`Jalur B` vs `Jalur A`), kotak catatan asumsi, 3 `MetricCard` (TCO BBM, TCO EV, Titik balik modal), `StackedHorizontalBar` 5 komponen biaya, `LineChart` biaya kumulatif 60 bulan.
- **Interaksi**: Ubah unit EV, jarak harian, atau skenario pembelian untuk melihat pergeseran titik potong kurva TCO.

#### Frame `18` - Kalkulator Emisi
- **Komponen Sumber**: `Zr` (`src/screens/user2.tsx`) dalam `UserLayout` + `CalculatorSplitLayout`
- **Aktor / Role**: `USER`
- **Rute React Router**: `/kalkulator/emisi`
- **Fungsi Utama**: Menghitung pengurangan emisi karbon tahunan (`kg CO2/tahun`) dari peralihan BBM ke EV (listrik grid PLN maupun PLTS atap) serta ekuivalensi serapan pohon dewasa.
- **Komponen UI**: `SelectInput` unit EV, `SelectInput` jenis BBM, `RangeSlider` jarak harian, `Switch` PLTS atap, kartu *Hero* reduksi CO2 & pohon, 3 `MetricCard`, `CompareBarChart` emisi tahunan.
- **Interaksi**: Ubah jenis BBM, jarak, atau aktifkan sumber PLTS atap.

#### Frame `19` - Peta Fasilitas
- **Komponen Sumber**: `$r` + `Qr` (`src/screens/user2.tsx`) dalam `UserLayout` (`fullBleed=true`)
- **Aktor / Role**: `USER` (dan mode baca publik bila dibuka dari `PublicNavbar`)
- **Rute React Router**: `/peta`
- **Fungsi Utama**: Peta GIS interaktif berbasis React-Leaflet untuk mencari lokasi `SPKLU`, `SPBKLU`, dan `Showroom` berdasarkan kota, jenis fasilitas, kata kunci, dan jarak dari lokasi pengguna.
- **Komponen UI**: `FilterChip` kota (dinamis dari tabel `cities`), `FilterChip` jenis fasilitas, `SearchInput` lokasi, tombol `Lokasi Saya`, daftar kartu kiri (*desktop*), kanvas peta **React-Leaflet** + `MapLegend`, `FacilityDetailPanel` (*desktop*) / *bottom sheet* (*mobile*) dengan tombol `Petunjuk Arah`.
- **Interaksi**: Filter kota/tipe, cari nama/alamat, geser/perbesar peta, pilih pin fasilitas, klik `Petunjuk Arah` (mencatat *lead* mitra dan membuka Google Maps Directions).

#### Frame `20` - Preview Laporan PDF
- **Komponen Sumber**: `ei` (`src/screens/user2.tsx`) dalam `UserLayout`
- **Aktor / Role**: `USER` (serta akses publik baca-saja via `/laporan/share/:shareToken`)
- **Rute React Router**: `/laporan`
- **Fungsi Utama**: Pratinjau lembar laporan kelayakan EV ukuran A4 (`794 x 1123 px`), unduhan berkas PDF nyata, dan pembagian tautan laporan simulasi.
- **Komponen UI**: `PageHeader` dengan tombol `Bagikan` & `Unduh PDF`, lembar A4 responsif berisi kop & tanggal aktual, *headline* penghematan, 4 kotak KPI, grafik biaya bulanan & TCO 5 th, kartu EV, `HomeLoadGauge`, tabel 3 fasilitas terdekat sesuai kota pengguna, dan catatan kaki metodologi tarif dinamis.
- **Interaksi**: Klik `Unduh PDF` menghasilkan berkas `.pdf` A4; klik `Bagikan` menyalin URL publik bertoken ke *clipboard*.

#### Frame `21` - Riwayat & Profil
- **Komponen Sumber**: `ni` (`src/screens/user2.tsx`) dalam `UserLayout`
- **Aktor / Role**: `USER`
- **Rute React Router**: `/riwayat`
- **Fungsi Utama**: Mengelola daftar simulasi tersimpan milik pengguna serta memperbarui informasi profil, kota domisili, golongan daya `VA`, dan preferensi notifikasi email.
- **Komponen UI**: `SegmentedTabs` (`Riwayat Simulasi` / `Profil & Preferensi`), `DataTable` riwayat (aksi `Buka` & `Hapus` dengan dialog konfirmasi) + `EmptyState`, form profil (`Nama`, `Email`, `Kota`, `Daya VA`, tombol `Simpan Perubahan`), 2 `Switch` preferensi notifikasi.
- **Interaksi**: Klik `Buka` memulihkan *snapshot* parameter simulasi terpilih ke `/dashboard`; klik `Hapus` menghapus entri dari DB setelah konfirmasi; simpan profil memperbarui akun dan `home_power_va` pengguna.

---

### D. Halaman Portal Mitra (`MITRA` - `mitra`)

#### Frame `22` - Dashboard Mitra
- **Komponen Sumber**: `ai` (`src/screens/admin.tsx`) dalam `MitraLayout`
- **Aktor / Role**: `MITRA`
- **Rute React Router**: `/mitra/dashboard`
- **Fungsi Utama**: Menampilkan ringkasan kinerja kemitraan berupa jumlah unit EV aktif, *lead* 7 hari terakhir, frekuensi unit direkomendasikan di hasil konsultasi, dan jumlah titik fasilitas aktif.
- **Komponen UI**: `PageHeader` + `Badge` status verifikasi mitra (`Terverifikasi` / `Menunggu Verifikasi` / `Ditolak`), 4 `MetricCard`, `MiniVerticalBarChart` tren *lead* 7 hari, kartu Top 3 unit direkomendasikan dengan `ProgressBar`.
- **Interaksi**: Pemantauan metrik dari tabel `partner_leads` dan navigasi modul mitra.

#### Frame `23` - Manajemen Katalog EV
- **Komponen Sumber**: `si` (`src/screens/admin.tsx`) dalam `MitraLayout`
- **Aktor / Role**: `MITRA`
- **Rute React Router**: `/mitra/katalog`
- **Fungsi Utama**: CRUD katalog unit kendaraan listrik milik mitra yang sedang login (**PBI `KEL2-57`**).
- **Komponen UI**: `PageHeader` + tombol `Tambah Unit`, `SearchInput`, `DataTable` katalog mitra (dengan `Switch` status `Aktif`/`Nonaktif`, tombol `Edit`, dan tombol `Hapus` berkonfirmasi `shadcn/ui AlertDialog`), `EmptyState`, serta `shadcn/ui Dialog` form Tambah/Edit Unit EV spesifikasi lengkap.
- **Interaksi**: Tambah, ubah spesifikasi/harga/promo, aktifkan/nonaktifkan, dan hapus (*soft-delete*) unit EV milik mitra.

#### Frame `24` - Showroom & Fasilitas
- **Komponen Sumber**: `ci` (`src/screens/admin.tsx`) dalam `MitraLayout`
- **Aktor / Role**: `MITRA`
- **Rute React Router**: `/mitra/fasilitas`
- **Fungsi Utama**: Mendaftarkan dan mengelola lokasi fisik `Showroom`, `SPKLU`, dan `SPBKLU` milik mitra menggunakan pemilih titik koordinat GPS di atas peta **React-Leaflet** (**PBI `KEL2-71`**).
- **Komponen UI**: `DataTable` fasilitas terdaftar (aksi `Edit` & `Hapus` berkonfirmasi), kartu form `Tambah/Edit Titik Fasilitas` (`Nama`, `Jenis`, `Kota`, `Alamat`, `Spesifikasi Daya/Slot`, `Jam Operasional`, `Tarif Awal`, peta **React-Leaflet** mode klik koordinat `lat/lng`).
- **Interaksi**: Klik peta menetapkan `latitude` & `longitude` asli; simpan lokasi menulis ke tabel `facilities` dan langsung memperbarui peta pengguna (`19`).

#### Frame `25` - Harga Layanan
- **Komponen Sumber**: `li` (`src/screens/admin.tsx`) dalam `MitraLayout`
- **Aktor / Role**: `MITRA`
- **Rute React Router**: `/mitra/harga-layanan`
- **Fungsi Utama**: Memperbarui tarif pengisian SPKLU (`Rp/kWh`), tarif tukar baterai SPBKLU (`Rp/tukar`), dan harga paket penggantian baterai purnajual per model EV milik mitra.
- **Komponen UI**: `PageHeader` + `Badge` perubahan belum disimpan + tombol `Simpan Perubahan`, kartu daftar input tarif fasilitas, kartu daftar input biaya ganti baterai.
- **Interaksi**: Edit nominal tarif secara massal dan simpan ke `facilities` serta `battery_replacement_prices`.

---

### E. Halaman Portal Superadmin (`SUPERADMIN` - `super`)

#### Frame `26` - Dashboard Analitik
- **Komponen Sumber**: `ui` (`src/screens/admin.tsx`) dalam `SuperLayout`
- **Aktor / Role**: `SUPERADMIN`
- **Rute React Router**: `/admin/analitik`
- **Fungsi Utama**: Memantau metrik adopsi platform, tren mingguan konsultasi `Jalur A` vs `Jalur B`, distribusi jalur, dan corong konversi 5 tahap selama 30 hari terakhir.
- **Komponen UI**: 4 `MetricCard` makro, `LineChart` tren 12 minggu, `DonutChart` proporsi jalur, kartu `Funnel konversi (30 hari)` 5 batang progres horizontal.
- **Interaksi**: Pemantauan agregasi data `funnel_events`, `consultation_sessions`, `simulations`, dan `partners`.

#### Frame `27` - Manajemen Tarif Energi
- **Komponen Sumber**: `di` (`src/screens/admin.tsx`) dalam `SuperLayout`
- **Aktor / Role**: `SUPERADMIN`
- **Rute React Router**: `/admin/tarif-energi`
- **Fungsi Utama**: Mengelola harga BBM nasional per liter, Tarif Dasar Listrik (TDL) PLN per golongan daya `VA`, dan tarif acuan SPKLU publik beserta pencatatan riwayat perubahan tarif (**PBI `KEL2-69`**).
- **Komponen UI**: `PageHeader` + `Badge` `Belum disimpan` + tombol `Simpan Perubahan`, `SegmentedTabs` (`Harga BBM` / `Tarif PLN & Acuan SPKLU`), `DataTable` input numerik harga/tarif dengan tanggal pembaruan terakhir, serta laci/tabel ringkas riwayat perubahan tarif.
- **Interaksi**: Edit harga BBM atau tarif PLN -> validasi angka positif -> simpan ke `energy_tariffs` sekaligus mencatat log ke `energy_tariff_histories`.

#### Frame `28` - Insentif & Pajak EV
- **Komponen Sumber**: `fi` (`src/screens/admin.tsx`) dalam `SuperLayout`
- **Aktor / Role**: `SUPERADMIN`
- **Rute React Router**: `/admin/insentif`
- **Fungsi Utama**: Mengelola kebijakan insentif pajak dan subsidi pemerintah (`PPN DTP`, `BBN-KB`, `PKB`, subsidi motor listrik) beserta status aktif/nonaktifnya pada kalkulator pengguna.
- **Komponen UI**: `PageHeader` + tombol `Tambah Insentif`, `DataTable` 4 kolom dengan `Switch` status `Aktif`/`Mati`, `shadcn/ui Dialog` tambah/edit kebijakan insentif.
- **Interaksi**: Ubah sakelar aktif/nonaktif atau tambah kebijakan baru ke tabel `ev_incentives`.

#### Frame `29` - Verifikasi Mitra
- **Komponen Sumber**: `mi` (`src/screens/admin.tsx`) dalam `SuperLayout`
- **Aktor / Role**: `SUPERADMIN`
- **Rute React Router**: `/admin/verifikasi-mitra`
- **Fungsi Utama**: Meninjau kelengkapan 4 dokumen legalitas pemohon mitra (`NIB`, `SIUP`, `NPWP badan`, `Perjanjian kemitraan`) dan menetapkan keputusan `Setujui Mitra` atau `Tolak`.
- **Komponen UI**: `SegmentedTabs` status (`Menunggu`, `Disetujui`, `Ditolak`, `Semua`), daftar kartu pemohon mitra + `EmptyState`, panel kanan *sticky* daftar periksa 4 dokumen (tautan lihat berkas + status `Lengkap`/`Belum ada`), input catatan penolakan, tombol `Tolak` dan `Setujui Mitra` (otomatis `disabled` bila belum 4 dokumen lengkap).
- **Interaksi**: Filter daftar pemohon, periksa dokumen, setujui atau tolak permohonan dengan validasi server.
