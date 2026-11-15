# PBI4 — Pencarian dan Filter Kendaraan Listrik

Aplikasi PBI4 tetap menyediakan pencarian katalog EV, filter tipe/harga/baterai/jarak, detail kendaraan, dan perbandingan hingga tiga unit. Struktur aplikasi dipisah menjadi frontend dan backend.

```text
04 - Pencarian dan Filter Kendaraan Listrik/
├── backendQ/   REST API dan data katalog (Node.js, port 8080)
└── frontendQ/  Halaman web statis (Node.js, port 3001)
```

## Prasyarat

- Node.js versi 18 atau lebih baru
- npm

## Menjalankan aplikasi

Jalankan backend dan frontend di terminal terpisah:

```powershell
cd backendQ
npm start
```

```powershell
cd frontendQ
npm start
```

Buka `http://localhost:3001`. Frontend mengambil data dari API di `http://localhost:8080`.

Untuk mengubah origin frontend yang diizinkan backend, atur `CORS_ORIGINS` sebagai daftar origin dipisahkan koma, misalnya:

```powershell
$env:CORS_ORIGINS="http://localhost:3001,http://127.0.0.1:3001"
npm start
```

## Pengujian

```powershell
cd backendQ
npm test
```

```powershell
cd frontendQ
npm test
```

Endpoint PBI4:

- `GET /api/vehicles` — daftar katalog; menerima `q`, `type`, `maxPrice`, `minBattery`, `maxBattery`, `minRange`, dan `sort`.
- `GET /api/vehicles/:id` — detail kendaraan.
