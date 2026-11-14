# MobilitiQ — Platform Analisis & Transisi Kendaraan Listrik (Sprint 1 Local)

Aplikasi web **MobilitiQ** dibangun dari awal untuk mencakup seluruh **12 Product Backlog Item (PBI) Sprint 1** beserta alur **Login & Role-Based Access Control (RBAC)** tiga peran (`USER`, `MITRA`, dan `SUPERADMIN`). Aplikasi dijalankan sepenuhnya secara lokal dengan arsitektur terpisah antara **Frontend (`frontendQ/`)** dan **Backend REST API (`backendQ/`)** menggunakan penyimpanan JSON lokal.

---

## 1. Struktur Folder Proyek

```text
MobilitiQ-Sprint1-Local/
├── .env.example                 # Contoh konfigurasi environment variabel proyek
├── .gitignore                   # Aturan pengabaian file build, node_modules, dan .env
├── package.json                 # Skrip root untuk instalasi, tes, build, dan menjalankan serentak
├── README.md                    # Dokumentasi instalasi, akun demo, fitur, dan pengujian
├── scripts/
│   └── dev-all.mjs              # Runner paralel untuk menjalankan backendQ (4000) & frontendQ (3000)
├── tests/
│   └── e2e_selenium.py          # Pengujian E2E browser otomatis menggunakan Selenium Python
├── backendQ/                    # REST API Node.js + Express + TypeScript (Port 4000)
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── data/                    # Penyimpanan persisten JSON lokal
│   │   ├── users.json           # Akun demo lokal dengan password hash scrypt (tanpa plaintext)
│   │   ├── ev-models.json       # Data katalog unit kendaraan listrik (PBI 03 & PBI 04)
│   │   ├── facilities.json      # Data lokasi Showroom, SPKLU & SPBKLU (PBI 05 & PBI 11)
│   │   ├── service-tariffs.json # Data tarif layanan fasilitas EV (PBI 06)
│   │   ├── energy-tariffs.json  # Parameter tarif energi PLN, SPKLU & BBM (PBI 09)
│   │   ├── energy-tariff-histories.json # Riwayat audit perubahan tarif energi (PBI 09)
│   │   └── ev-incentives.json   # Data regulasi insentif & pajak EV (PBI 10)
│   └── src/
│       ├── index.ts             # Entry point Express server
│       ├── auth/security.ts     # Hashing scrypt, signed HTTP-only cookie, TTL, Secure flag, middleware RBAC
│       ├── calculations/        # Mesin kalkulasi bisnis PBI 01, 02, 07, 08, dan 12
│       ├── data/                # Preset kendaraan konvensional & titik keberangkatan
│       ├── routes/              # Endpoint REST API terproteksi RBAC
│       ├── scripts/seed-users.ts# Generator akun demo lokal berbasis scrypt tanpa plaintext di kode
│       ├── storage/             # Repositori baca/tulis JSON lokal
│       └── tests/               # Suite pengujian integrasi API & RBAC
└── frontendQ/                   # Aplikasi Web Next.js App Router + TypeScript + Tailwind CSS (Port 3000)
    ├── .env.example
    ├── package.json
    ├── tsconfig.json
    ├── app/
    │   ├── page.tsx                         # Beranda & pengantar ekosistem MobilitiQ
    │   ├── login/page.tsx                   # Halaman Login & pemilih email akun demo
    │   ├── kalkulator/bbm/page.tsx          # PBI 01: Kalkulator Biaya BBM Konvensional
    │   ├── kalkulator/perawatan/page.tsx    # PBI 02: Kalkulator Biaya Perawatan ICE
    │   ├── katalog/page.tsx                 # PBI 04: Pencarian & Filter Katalog EV
    │   ├── kalkulator/energi-ev/page.tsx    # PBI 07: Simulator Konsumsi Energi EV
    │   ├── kalkulator/komparasi-biaya/page.tsx # PBI 08: Komparasi Biaya Operasional BBM vs Listrik
    │   ├── fasilitas/peta/page.tsx          # PBI 11 & PBI 12: Peta Interaktif & Kalkulator Rute EV
    │   ├── mitra/                           # Portal Admin Mitra (Role: MITRA)
    │   │   ├── katalog/page.tsx             # PBI 03: Manajemen Katalog Kendaraan Listrik
    │   │   ├── fasilitas/page.tsx           # PBI 05: Manajemen Lokasi Fasilitas EV
    │   │   └── harga-layanan/page.tsx       # PBI 06: Manajemen Harga Layanan Fasilitas EV
    │   └── admin/                           # Konsol Regulasi Superadmin (Role: SUPERADMIN)
    │       ├── tarif-energi/page.tsx        # PBI 09: Manajemen Tarif Energi & Log Audit
    │       └── insentif-pajak/page.tsx      # PBI 10: Manajemen Insentif & Pajak EV
    ├── components/
    │   ├── Navbar.tsx                       # Navigasi adaptif sesuai role & tombol keluar
    │   ├── Footer.tsx                       # Footer aplikasi
    │   └── InteractiveLeafletMap.tsx        # Komponen peta interaktif Leaflet (marker & rute)
    └── lib/
        ├── api.ts                           # Klien HTTP fetch (`credentials: "include"`) & formatter
        └── auth-context.tsx                 # Provider sesi autentikasi & komponen proteksi RoleGuard
```

---

## 2. Prasyarat & Instalasi

Pastikan perangkat Anda memiliki:
- **Node.js** versi `>= 20.x` dan **npm**
- **Python 3** + paket `selenium` (opsional, untuk menjalankan pengujian browser otomatis `tests/e2e_selenium.py`)

### Langkah Instalasi Dependensi

Jalankan perintah berikut dari direktori root `MobilitiQ-Sprint1-Local`:

```bash
npm run install:all
```

Atau pasang secara terpisah pada masing-masing folder:

```bash
npm --prefix backendQ install
npm --prefix frontendQ install
```

---

## 3. Cara Menjalankan Backend & Frontend Secara Bersamaan

Untuk menjalankan **Backend API (`http://localhost:4000`)** dan **Frontend Next.js (`http://localhost:3000`)** secara bersamaan dalam satu terminal:

```bash
npm run dev
```

Jika ingin menjalankan di dua terminal terpisah:

- **Terminal 1 (Backend REST API):**
  ```bash
  npm run dev:backend
  ```
- **Terminal 2 (Frontend Next.js):**
  ```bash
  npm run dev:frontend
  ```

Setelah aktif:
- **Frontend UI**: `http://localhost:3000`
- **Halaman Login**: `http://localhost:3000/login`
- **Healthcheck Backend API**: `http://localhost:4000/api/v1/health`

---

## 4. Spesifikasi API Autentikasi, Masa Berlaku Sesi & Pengaturan Cookie (`HTTPS` vs `localhost HTTP`)

### Endpoint Autentikasi (`backendQ/src/routes/auth.ts`)

1. **`POST /api/v1/auth/login`**
   - Memeriksa email & password terhadap hash `scrypt` di `backendQ/data/users.json` menggunakan perbandingan waktu-konstan (`crypto.timingSafeEqual`).
   - Membuat sesi server dengan masa berlaku terukur (`SESSION_TTL_SECONDS`, default `86400` detik = 24 jam) dan menyetel cookie HTTP-only bertanda tangan HMAC-SHA256 (`mobilitiq_sid`).
   - Mengembalikan objek `user` (tanpa `passwordHash`), metadata `session` (`createdAt`, `expiresAt`, `maxAgeSeconds`), serta `redirectTo` sesuai role.
2. **`POST /api/v1/auth/logout`**
   - Menghapus sesi aktif dari memori server (`destroySessionByToken`) dan menghapus cookie di browser dengan `Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`.
3. **`GET /api/v1/auth/me`**
   - Memvalidasi tanda tangan HMAC cookie `mobilitiq_sid`, memeriksa apakah sesi belum kedaluwarsa (`expiresAt`), dan mengembalikan identitas serta role pengguna yang sedang login (`id`, `email`, `name`, `role`, `organizationName`, `city`, `homePowerVa`) **tanpa menyertakan `passwordHash`**.

### Pengaturan Masa Berlaku Sesi & Cookie `Secure` (`HTTPS` vs `localhost HTTP`)

Diatur melalui `backendQ/src/auth/security.ts`:
- **Masa Berlaku Sesi (`SESSION_TTL_SECONDS`)**: Secara default bernilai `86400` detik (24 jam). Diterapkan pada penyimpanan sesi server (`expiresAt`) sekaligus atribut cookie `Max-Age=86400; Expires=<UTC>`.
- **Saat Menggunakan HTTPS / Produksi**: Atribut `; Secure` **otomatis ditambahkan** pada header `Set-Cookie` apabila:
  - Request diterima melalui koneksi TLS/HTTPS (`req.secure === true` atau header proxy `X-Forwarded-Proto: https`), atau
  - Variabel environment `COOKIE_SECURE=true`, atau
  - `NODE_ENV=production`.
- **Saat Development Lokal di `http://localhost`**:
  - Browser modern menolak menyimpan cookie dengan atribut `Secure` apabila halaman diakses melalui `http://localhost:3000` atau `http://localhost:4000` (tanpa TLS).
  - Oleh karena itu, pada mode development lokal (`COOKIE_SECURE=false` pada `.env.example`), atribut `Secure` tidak disematkan secara paksa untuk trafik HTTP lokal, sementara atribut keamanan **`HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`** tetap aktif sepenuhnya.

---

## 5. Akun Demo Lokal & Proses Seed Tanpa Password Teks Biasa

Kode sumber aplikasi (`backendQ/` dan `frontendQ/`) maupun file data `backendQ/data/users.json` **tidak menyimpan password teks biasa**. File `backendQ/data/users.json` dan `backendQ/src/scripts/seed-users.ts` hanya menyimpan nilai hash kriptografis berformat `scrypt$<salt_hex>$<derived_key_hex>`.

Untuk keperluan pengujian lokal di browser, berikut adalah kredensial yang cocok dengan hash `scrypt` bawaan:

| Peran (Role) | Email Demo | Kata Sandi Uji Lokal | Halaman Tujuan Setelah Login | Hak Akses Utama |
| :--- | :--- | :--- | :--- | :--- |
| **Pengguna (`USER`)** | `pengguna@mobilitiq.id` | `Pengguna123!` | `/kalkulator/bbm` | Mengakses seluruh kalkulator (PBI 01, 02, 07, 08), katalog EV (PBI 04), serta peta & kalkulator rute fasilitas EV (PBI 11 & 12). |
| **Admin Mitra (`MITRA`)** | `mitra@mobilitiq.id` | `Mitra123!` | `/mitra/katalog` | Mengelola katalog unit EV (PBI 03), lokasi fasilitas Showroom/SPKLU/SPBKLU (PBI 05), dan tarif layanan fasilitas (PBI 06). |
| **Superadmin (`SUPERADMIN`)** | `superadmin@mobilitiq.id` | `Superadmin123!` | `/admin/tarif-energi` | Mengelola parameter tarif energi & riwayat audit (PBI 09) serta regulasi insentif dan pajak kendaraan listrik (PBI 10). |

### Cara Menjalankan Seed Akun Demo Lokal

Untuk memulihkan `backendQ/data/users.json` ke hash bawaan:

```bash
npm --prefix backendQ run seed:users
```

Jika Anda ingin mengganti kata sandi akun demo lokal dengan kata sandi baru pilihan Anda sendiri tanpa menulisnya di dalam kode, berikan variabel environment saat menjalankan skrip seed (skrip akan menghasilkan salt acak baru dan menyimpan hanya hash `scrypt`-nya ke `users.json`):

```bash
# Contoh di PowerShell:
$env:SEED_USER_PASSWORD="KataSandiBaruUser!"; npm --prefix backendQ run seed:users
```

---

## 6. Kebijakan Akses Pengunjung (Guest) & Matriks Fitur Sprint 1

Aplikasi MobilitiQ menerapkan pemisahan akses yang jelas antara pengunjung umum dan akun terautentikasi:
- **Modul Terbuka / Pengunjung (Guest - Tanpa Login)**: Pengunjung dapat langsung membuka beranda, mencoba seluruh kalkulator dan simulator (`/kalkulator/bbm`, `/kalkulator/perawatan`, `/kalkulator/energi-ev`, `/kalkulator/komparasi-biaya`), mencari katalog EV (`/katalog`), serta melihat peta fasilitas dan menghitung rute rute EV (`/fasilitas/peta`) tanpa diarahkan ke `/login`.
- **Modul Terproteksi Akun (Wajib Login)**:
  - **Portal Admin Mitra (`/mitra/*`)**: Memerlukan akun peran `MITRA` untuk menambah/mengedit unit katalog EV, lokasi fasilitas, dan tarif layanan.
  - **Konsol Regulasi Superadmin (`/admin/*`)**: Memerlukan akun peran `SUPERADMIN` untuk mengelola parameter tarif energi nasional dan kebijakan insentif fiskal EV.
  - Percobaan membuka modul terproteksi tanpa login akan secara otomatis mengarahkan pengunjung ke `/login`.
  - Percobaan akses lintas peran (misalnya Pengguna membuka konsol Superadmin) ditolak dengan status dan tampilan peringatan `403 Akses Tidak Diizinkan`.

| Kode | Nama Fitur Sprint 1 | Akses Halaman | Halaman Frontend | Endpoint REST API Backend |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | Login, Logout, Identitas Sesi & Proteksi RBAC | Publik | `/login` | `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me` |
| **PBI 01** | Kalkulator Biaya BBM Kendaraan Konvensional | **Publik / Guest** | `/kalkulator/bbm` | `POST /api/v1/calculations/fuel-cost` (Publik) |
| **PBI 02** | Kalkulator Biaya Perawatan Kendaraan Konvensional | **Publik / Guest** | `/kalkulator/perawatan` | `POST /api/v1/calculations/ice-maintenance` (Publik) |
| **PBI 03** | Manajemen Katalog Kendaraan Listrik (Admin Mitra) | **Wajib MITRA** | `/mitra/katalog` | `GET/POST /api/v1/ev-models`, `PUT/DELETE /api/v1/ev-models/:id`, `PATCH /api/v1/ev-models/:id/status` |
| **PBI 04** | Pencarian dan Filter Kendaraan Listrik (End-User) | **Publik / Guest** | `/katalog` | `GET /api/v1/ev-models` (Publik, aktif) |
| **PBI 05** | Manajemen Data Lokasi Fasilitas EV (Admin Mitra) | **Wajib MITRA** | `/mitra/fasilitas` | `GET/POST /api/v1/facilities`, `PUT/DELETE /api/v1/facilities/:id`, `PATCH /api/v1/facilities/:id/status` |
| **PBI 06** | Manajemen Harga Layanan Fasilitas EV (Admin Mitra) | **Wajib MITRA** | `/mitra/harga-layanan` | `GET/POST /api/v1/service-tariffs`, `PUT /api/v1/service-tariffs/:id`, `GET /api/v1/service-tariffs/active` (Publik) |
| **PBI 07** | Simulator Konsumsi Energi EV | **Publik / Guest** | `/kalkulator/energi-ev` | `POST /api/v1/calculations/ev-energy` (Publik) |
| **PBI 08** | Kalkulator Biaya Operasional BBM vs Listrik | **Publik / Guest** | `/kalkulator/komparasi-biaya` | `POST /api/v1/calculations/comparison` (Publik) |
| **PBI 09** | Manajemen Tarif Energi (Superadmin) | **Wajib SUPERADMIN**| `/admin/tarif-energi` | `GET/POST /api/v1/admin/energy-tariffs`, `PUT /api/v1/admin/energy-tariffs/:id`, `GET /api/v1/energy-tariffs/active` (Publik) |
| **PBI 10** | Manajemen Insentif & Pajak EV (Superadmin) | **Wajib SUPERADMIN**| `/admin/insentif-pajak` | `GET/POST /api/v1/admin/ev-incentives`, `PUT/DELETE /api/v1/admin/ev-incentives/:id`, `GET /api/v1/ev-incentives/active` (Publik) |
| **PBI 11** | Peta Interaktif Fasilitas EV | **Publik / Guest** | `/fasilitas/peta` | `GET /api/v1/facilities?activeOnly=true` (Publik) |
| **PBI 12** | Kalkulator Jarak dan Waktu ke Fasilitas EV | **Publik / Guest** | `/fasilitas/peta` | `POST /api/v1/facilities/route` (Publik) |

---

## 7. Menjalankan Pemeriksaan Tipe, Build, dan Pengujian

### Pemeriksaan TypeScript (`typecheck`)
```bash
npm run typecheck
```

### Pengujian Unit & Integrasi API/RBAC
```bash
npm test
```

### Build Produksi (`backendQ` & `frontendQ`)
```bash
npm run build
```

### Pengujian Browser E2E (Selenium Python)
Pastikan server backend (`4000`) dan frontend (`3000`) sedang berjalan, lalu jalankan:
```bash
python tests/e2e_selenium.py
```
