# Analisis Komponen & Analisis Fungsional (`COMPONENT_INVENTORY.md`) MobilitiQ (Tervalidasi Final)

> **Kesesuaian *Tech Stack***: Seluruh strategi komponen disesuaikan dengan arsitektur **Vite + React 19 + TypeScript + React Router + Tailwind CSS v4 + shadcn/ui + React-Leaflet** di sisi klien dan **Node.js + Express + Prisma ORM + PostgreSQL** di sisi peladen (**tanpa migrasi ke Next.js**). Struktur modul dan komponen domain dari *prototype* (`src/ui.tsx`, `src/layouts.tsx`, `src/screens/*.tsx`) dipertahankan semaksimal mungkin dan diperkuat dengan primitif aksesibel `shadcn/ui`.

---

## Bagian I. Komponen *Prototype* yang Dipertahankan & Dapat Digunakan Kembali

### 1. Komponen *Layout* (`client/src/layouts/`)
| Nama Komponen (Simbol *Prototype*) | Fungsi & Karakteristik *Props* | Digunakan pada Layar | Strategi Integrasi Vite + React Router |
| :--- | :--- | :--- | :--- |
| `PublicLayout` (`_r`) | Kerangka halaman publik dengan `PublicNavbar`, `<Outlet />` React Router, dan `PublicFooter` opsional. | `01` s.d. `06` | Pertahankan struktur asli; ganti fungsi `go()` dengan `<Link>` / `useNavigate()` React Router. |
| `UserLayout` (`xr`) | Kerangka pengguna terdaftar: bilah atas `h-16` (nama, kota, golongan VA dari sesi `/api/me`), *sidebar* `w-64` (15 menu), area konten, dan 5 tab bawah *mobile*. | `07` s.d. `21` | Pertahankan struktur asli; bungkus di balik `<ProtectedRoute allowedRoles={['USER']} />`. |
| `MitraLayout` (`ri`) | Kerangka portal mitra bisnis: *sidebar* `w-64` (identitas perusahaan mitra + status verifikasi) dan 4 menu manajemen. | `22` s.d. `25` | Pertahankan struktur asli; bungkus di balik `<ProtectedRoute allowedRoles={['MITRA']} />`. |
| `SuperLayout` (`ii`) | Kerangka portal Superadmin: *sidebar* gelap (`bg-ink text-white`) `w-64` dengan 4 menu tata kelola. | `26` s.d. `29` | Pertahankan struktur asli; bungkus di balik `<ProtectedRoute allowedRoles={['SUPERADMIN']} />`. |
| `CalculatorSplitLayout` (`Nr`) | Tata letak standar 2 kolom (`360px` panel parameter kiri + panel KPI/grafik kanan) lengkap dengan `PageHeader`. | `08, 09, 12-18` | Pertahankan utuh dari *prototype* untuk seluruh 9 kalkulator. |
| `PageHeader` (`vr`) & `KeyValueRow` (`Pr`) | Tajuk halaman (`eyebrow`, `h1`, `sub`, `actions`) dan baris ringkasan label-nilai (`.num`). | `07` s.d. `29` | Pertahankan utuh dari *prototype*. |

### 2. Komponen *Form* (`client/src/components/ui/`)
| Nama Komponen (Simbol *Prototype*) | Fungsi & Karakteristik *Props* | Digunakan pada Layar | Strategi Integrasi `shadcn/ui` + *Prototype* |
| :--- | :--- | :--- | :--- |
| `Button` (`k`) | Tombol 6 varian (`primary`, `secondary`, `outline`, `ghost`, `danger`, `dark`), 3 ukuran (`sm`, `md`, `lg`), ikon, dan *loading spinner*. | `00` s.d. `29` | Pertahankan gaya visual *prototype* di atas pola `cva` / `Slot` `shadcn/ui`. |
| `FieldWrapper` (`Fn`) & `TextInput` (`N`) | Pembungkus label/pesan galat dan input teks/angka dengan `prefix`/`suffix`. | `00, 03, 06, 21, 23-25, 27-28` | Pertahankan tampilan *prototype* + dukung `forwardRef` untuk validasi `zod`. |
| `SelectInput` (`M`) | Pemilih opsi tunggal (`options: {value, label}[]`). | `00, 08-13, 17, 18, 21, 23, 24, 28` | Pertahankan komponen ringan *prototype* (atau `shadcn/ui Select` bila butuh pencarian). |
| `SearchInput` (`In`) | Input pencarian berikon kaca pembesar + tombol hapus (`X`). | `00, 10, 19, 23, 24` | Pertahankan dari *prototype* + tambahkan hook `useDebouncedValue(300)`. |
| `RangeSlider` (`I`) | Penggeser numerik dengan label nilai `.num`, progres warna `--p`, dan batas `min`/`max`. | `00, 08-10, 12-18` | Pertahankan utuh dari *prototype* beserta CSS `input[type=range]` di `app.css`. |
| `Switch` (`Rn`) & `FilterChip` (`zn`) | Sakelar boolean (`role="switch"`) dan pil filter (`aria-pressed`). | `00, 03, 10, 12, 14-16, 18, 19, 21, 23, 28` | Pertahankan tampilan *prototype* (kompatibel penuh dengan `shadcn/ui Switch`). |

### 3. Komponen *Tabel*
| Nama Komponen (Simbol *Prototype*) | Fungsi & Karakteristik *Props* | Digunakan pada Layar | Strategi Integrasi `shadcn/ui` |
| :--- | :--- | :--- | :--- |
| `DataTable` (`nr`) | Tabel generik berbasis konfigurasi kolom `cols` dan baris `rows`. | `00, 11, 21, 23, 24, 27, 28` | Pertahankan API `cols`/`rows` *prototype* di atas primitif `shadcn/ui Table` + tambah paginasi, sortir, dan *skeleton rows*. |

### 4. Komponen *Modal* & Umpan Balik Overlay
| Nama Komponen (Simbol *Prototype*) | Fungsi & Karakteristik *Props* | Digunakan pada Layar | Strategi Integrasi `shadcn/ui` |
| :--- | :--- | :--- | :--- |
| `Modal` (`Yn`) | Dialog *overlay* form/login dengan header, konten, dan footer. | `00, 06, 23, 28` | **Ganti mesin internalnya dengan `shadcn/ui Dialog`** (menyelesaikan `BUG-14` *focus trap* & posisi `fixed inset-0` secara instan). |
| `ConfirmDeleteDialog` *(Baru)* | Dialog konfirmasi penghapusan destruktif sebelum memanggil `DELETE`. | `21, 23, 24` | Gunakan **`shadcn/ui AlertDialog`**. |
| `Toast` (`Xn`) | Notifikasi sukses (`ok`) dan galat (`bad`). | Global | Gunakan **`shadcn/ui Sonner`** (atau pertahankan gaya *prototype*) agar mendukung antrean multi-notifikasi. |
| `BlurGate` (`tr`) | Pengabur konten terkunci (`blur-[7px]`) dengan kartu ajakan login. | `00, 05` | Pertahankan komponen UI tanpa tab demo `Terkunci/Terbuka` (`BUG-13`). |

### 5. Komponen *Kartu* & Status Konten
| Nama Komponen (Simbol *Prototype*) | Fungsi & Karakteristik *Props* | Digunakan pada Layar | Strategi Integrasi |
| :--- | :--- | :--- | :--- |
| `Card` (`j`), `MetricCard` (`P`), `Badge` (`F`) | Kartu permukaan, kartu KPI angka `.num` (5+1 varian `tone`), dan lencana status. | `00` s.d. `29` | Pertahankan utuh dari *prototype* + tambah varian `tone="brand"` pada `MetricCard` (`BUG-06`). |
| `ChatBubble` (`er`) & `QuickWidget` (`Cr`) | Gelembung percakapan bot/pengguna (`.rise`) dan pemilih `Jalur A`/`Jalur B`. | `00, 01, 02, 03` | Pertahankan utuh dari *prototype*. |
| `FacilityDetailPanel` (`Qr`) | Panel rincian lokasi SPKLU/SPBKLU/*Showroom* beserta CTA `Petunjuk Arah`. | `19` | Pertahankan struktur *prototype* + hubungkan ke koordinat GPS & Google Maps Directions. |
| `VehicleIllustration` (`yr`) | Ilustrasi SVG skematik `Motor` dan `Mobil`. | `10` | Pertahankan sebagai gambar *fallback* apabila `ev_models.image_url` kosong. |
| `Skeleton` (`Zn`) & `EmptyState` (`Qn`) | Kerangka pemuatan dan tampilan data kosong beserta tombol aksi pemulihan. | `00, 07, 10, 19, 21, 23, 29` | Pertahankan utuh dari *prototype*. |

### 6. Komponen *Navigasi*
| Nama Komponen (Simbol *Prototype*) | Fungsi & Karakteristik *Props* | Digunakan pada Layar | Strategi Integrasi |
| :--- | :--- | :--- | :--- |
| `BrandLogo` (`mr`), `PublicNavbar` (`hr`), `PublicFooter` (`gr`) | Identitas merek, bilah navigasi publik (*drawer* di *mobile*), dan footer 4 kolom. | `01-06`, seluruh *layout* | Pertahankan desain *prototype*; hapus tautan langsung ke `Design System`, `Mitra`, dan `Superadmin` di `PublicFooter` (`BUG-09`). |
| `SegmentedTabs` (`Ln`) & `StepProgress` (`qn`) | Tab segmen (`role="tablist"`) dan batang progres langkah konsultasi. | `00, 03, 21, 27, 29` | Pertahankan dari *prototype* (atau padukan dengan `shadcn/ui Tabs`). |

### 7. Komponen *Visualisasi* Data & Peta
| Nama Komponen (Simbol *Prototype*) | Fungsi & Karakteristik *Props* | Digunakan pada Layar | Strategi Integrasi |
| :--- | :--- | :--- | :--- |
| `ProgressBar` (`Wn`) & `HomeLoadGauge` (`Jn`) | Batang progres umum dan pengukur beban meteran rumah (penanda `70%` & `95%`). | `00, 04, 05, 07, 12, 15, 16, 20, 22, 26` | Pertahankan utuh dari *prototype*. |
| `CompareBarChart` (`ar`), `DonutChart` (`or`), `LineChart` (`sr`), `StackedHorizontalBar` (`lr`), `MiniVerticalBarChart` (`ur`), `ChartLegend` (`cr`) | Rangkaian grafik SVG ringan tanpa beban bundel pustaka grafik besar. | `00, 01, 05, 07-09, 13, 14, 17, 18, 22, 26` | Pertahankan komponen SVG *prototype*, perbaiki penanganan nilai `saving <= 0` (`BUG-04`), dan tambahkan **`shadcn/ui Tooltip`** saat kursor menyentuh batang/titik data. |
| `InteractiveVectorMap` (`fr`) & `MapLegend` (`pr`) | Peta SVG dekoratif pada *prototype*. | `05, 19, 24` | **Wajib dibuat ulang** dengan **`React-Leaflet`** (`MapContainer`, `TileLayer`, `Marker`, `useMapEvents`). |

---

## Bagian II. Ringkasan 6 Komponen yang Wajib Dibuat Ulang / Diganti Internalnya

1. **`FacilityMap` (`React-Leaflet` menggantikan `InteractiveVectorMap` `fr`)**: Menggunakan ubin OpenStreetMap, pin berkategori (`SPKLU`, `SPBKLU`, `Showroom`), kontrol zoom aktif, Geolocation pengguna, klik pemilih koordinat `latitude/longitude` pada layar `24`, serta tautan rute Google Maps nyata (`BUG-11`, `BUG-12`).
2. **`AppRouter` & `ProtectedRoute` (`React Router` menggantikan `PreviewShell` `bi`)**: Menghapus bilah pemilih *frame* `00-29`, mengonversi `@container` *simulator* menjadi rute peramban standar dengan proteksi akses `Guest` vs `USER` vs `MITRA` vs `SUPERADMIN` (`BUG-09`).
3. **`Modal` & `ConfirmDeleteDialog` (`shadcn/ui Dialog` & `AlertDialog` menggantikan `Yn` mentah)**: Memberikan *keyboard focus trap* standar WAI-ARIA, `fixed inset-0` bersih tanpa offset `top-14`, dan pengaman aksi hapus (`BUG-14`).
4. **`PdfReportExporter` (menggantikan tombol *toast* `ei` di layar `20`)**: Mencetak laporan kelayakan ukuran A4 nyata (`@media print` terisolasi atau `@react-pdf/renderer` / endpoint PDF) dengan catatan kaki dinamis terlihat serta pembagian URL publik `/laporan/share/:shareToken` (`BUG-02`, `BUG-12`).
5. **`CompareBarChart` & Grafik SVG Tahan Nilai Ekstrem**: Menangani kasus biaya EV > BBM (`saving < 0`) tanpa tinggi SVG negatif dan memperkaya titik data dengan `shadcn/ui Tooltip` (`BUG-04`).
6. **`BlurGate` Terikat Sesi Autentikasi (`05`)**: Menghapus tab bypass demo `Terkunci`/`Terbuka` sehingga pembukaan hasil penuh hanya terjadi melalui sesi login valid (`BUG-13`).

---

## Bagian III. Analisis Fungsional Lengkap & Sumber Data Tervalidasi

### 1. Inventarisasi Kalkulator, Rumus, dan Sumber Data Basis Data (0% *Hardcoded*)

| Modul Kalkulator & Layar | Input Pengguna | Rumus Inti (Diimplementasikan di `shared/calculations.ts`) | Sumber Data Eksplisit di PostgreSQL (18 Entitas) |
| :--- | :--- | :--- | :--- |
| **Kalkulator BBM & Perawatan** (`08` - **`KEL2-54`, `KEL2-73`**) | Preset BBM, `kmL` (`5-60`), kode `bbm`, `kmHari` (`5-150`). | $\text{kmBln} = 30 \cdot \text{kmHari}$, $\text{literBln} = \text{kmBln}/\text{kmL}$, $\text{biayaBbm} = \text{literBln} \cdot P_{\text{bbm}}$, $\text{servisBbm} = C_{\text{svc,ice}} \cdot \text{kmBln}$. | `ice_vehicle_presets` (`default_km_per_liter`, `service_cost_per_km_idr`, `annual_stnk_tax_idr`), `energy_tariffs` (`category='BBM'`), `system_parameters` (proporsi oli/servis/ban `35/40/25%`). |
| **Simulator Konsumsi Energi EV** (`09` - **`KEL2-67`**) | Unit `evId`, `kmHari`, porsi rumah `homeShare` (`0-100%`). | $\text{kwhBln} = \text{kmBln} \cdot \frac{\text{kwh100}}{100}$, $P_{\text{mix}} = h \cdot P_{\text{pln}}(\text{VA}) + (1-h) \cdot P_{\text{spklu}}$, $\text{biayaEv} = \text{kwhBln} \cdot P_{\text{mix}}$, $\text{servisEv} = C_{\text{svc,ev}} \cdot \text{kmBln}$. | `ev_models` (`consumption_kwh_100km`, `service_cost_per_km_idr`), `energy_tariffs` (`category='PLN'` sesuai `home_power_va` & `category='SPKLU_REF'`). |
| **Kalkulator Pembelian Awal** (`12`) | Unit `evId`, `dpPct`, `tenor`, `bungaTh`, sakelar insentif. | $\text{hargaBersih} = \max(0, \text{OTR} - \sum \text{insentifAktif})$, bunga *flat* $\text{pokok} \cdot r \cdot (\text{tenor}/12)$. | `ev_models` (`otr_price_idr`, `annual_pkb_tax_idr`), `ev_incentives` (`is_active = true`). |
| **Estimator Degradasi Baterai** (`13`) | Unit `evId`, pola `habit` (`ac/mix/dc`), `tahun` (`1-10`). | $SoH(t) = 100 \cdot (1 - r_{\text{habit}})^t$, $\text{rangeEfektif} = \text{rangeWltp} \cdot SoH(t)/100$. | `ev_models` (`wltp_range_km`, `warranty_label`), `system_parameters` (`degradation_rate_ac/mix/dc`, `warranty_soh_threshold`). |
| **Dana Cadangan Baterai** (`14`) | Unit `evId`, `targetTh`, `hargaPerKwh`, `turunTh`, `deposito`. | $\text{targetBiaya} = \text{kwh} \cdot P_{\text{kwh}} \cdot (1 - d)^T$, anuitas *sinking fund* bulanan dengan bunga $i/12$. | `ev_models` (`battery_kwh`), `battery_replacement_prices` (acuan harga mitra), `system_parameters` (`default_batt_price_motor/mobil`, `deposit_rate_annual`). |
| **Home Charging Planner** (`15`) | Golongan `va`, `chargerKw`, `baseLoadKw`, `nightMode`. | $\text{kapasitasKw} = \frac{\text{va} \cdot \cos\varphi}{1000}$, $\text{rasio} = \frac{\text{bebanAktif} + \text{chargerKw}}{\text{kapasitasKw}}$, $\text{jamPenuh} = \frac{\text{kwh}}{\text{chargerKw} \cdot \eta}$. | `energy_tariffs` (`category='PLN'`, termasuk `upgrade_fee_idr` biaya tambah daya PLN), `ev_models` (`battery_kwh`, `ac_charger_kw`), `system_parameters` (`pln_power_factor=0.85`, `charger_efficiency=0.90`, `night_load_factor=0.40`, daftar opsi daya charger). |
| **Simulator Jarak Tempuh** (`16`) | Unit `evId`, preset/slider `jarak`, `soc`, 3 sakelar kondisi. | $\text{jarakRiil} = \text{rangeWltp} \cdot f_{\text{wltp}} \cdot f_{\text{kondisi}} \cdot \frac{\text{soc}}{100}$, $\text{stopSpklu} = \max(1, \lceil \text{jarak} / (0.8 \cdot \text{jarakRiil}) \rceil - 1)$. | `ev_models` (`wltp_range_km`, `dc_charger_kw`), `route_presets` (daftar rute perjalanan), `system_parameters` (`wltp_real_factor=0.82`, penalti `ac/rain/load`). |
| **TCO 5 Tahun & Payback** (`17`) | Unit `evId`, `kmHari`, skenario `jalur` (`A`/`B`). | Akumulasi 60 bulan 5 komponen biaya (`Pembelian, Energi, Perawatan, Pajak, Dana baterai`); perbaikan `BUG-01` untuk `findIndex === -1` -> `> 5 th`. | Seluruh tabel acuan di atas + *state* simulasi terpadu pengguna. |
| **Kalkulator Emisi** (`18`) | Unit `evId`, kode `bbm`, `kmHari`, sakelar `plts`. | $\Delta CO_2 = (\text{literTh} \cdot e_{\text{bbm}}) - (\text{kwhTh} \cdot e_{\text{listrik}})$, $\text{pohon} = \text{round}(\Delta CO_2 / e_{\text{pohon}})$. | `energy_tariffs` (`emission_kg_co2_per_unit` untuk tiap BBM & grid PLN), `system_parameters` (`rooftop_solar_emission_kg_kwh=0.05`, `tree_absorption_kg_year=21`). |

### 2. Pemetaan Transisi *State* Lokal *Prototype* ke Arsitektur Vite + Express + PostgreSQL

| Area Fitur | Kondisi *Prototype* Saat Ini | Target Arsitektur Vite + React 19 + Express |
| :--- | :--- | :--- |
| **Navigasi & Role** | `useState("01")` + boolean tunggal `loggedIn`. | `React Router` (`BrowserRouter`) + `AuthContext` (`GET /api/me` dengan `role: 'USER' \| 'MITRA' \| 'SUPERADMIN'`) + `<ProtectedRoute />`. |
| **Parameter Kalkulator (`08-18`)** | Tersebar antara Context `sim` dan `useState` lokal per layar (`BUG-06`), serta `he()` menghapus `km/l` (`BUG-03`). | Satu `SimulationContext` / store terpusat di klien (disinkronkan ke `sessionStorage` untuk `Guest` via `guest_session_token` dan ke tabel `simulations` untuk `USER`). |
| **Master Tarif, Preset, & Insentif (`08-18, 27, 28`)** | Konstanta statis di `src/data.ts` yang terputus dari form Superadmin. | Diambil dari `GET /api/reference/bootstrap` dan di-*invalidate* otomatis saat Superadmin menyimpan perubahan pada layar `27` (`KEL2-69`) atau `28`. |
| **Katalog EV & Peta Fasilitas (`10, 11, 19, 23-25`)** | Array statis `w` (9 unit) dan `de` (11 lokasi SVG). | Diambil dari `GET /api/ev-models` (`KEL2-57`) dan `GET /api/facilities` (`KEL2-71`) yang langsung mencerminkan CRUD Mitra terverifikasi. |
| **Analitik & Lead (`01, 22, 26`)** | Angka dan deret grafik *hardcoded*. | Direkam melalui `POST /api/events/funnel` & `POST /api/facilities/:id/lead`, lalu diagregasi dari `funnel_events`, `consultation_sessions`, dan `partner_leads`. |
