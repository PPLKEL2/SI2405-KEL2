# EnergyShift — PBI 5 & PBI 6

- **PBI 5** — Manajemen Data Lokasi Fasilitas EV (Showroom, SPKLU, SPBKLU)
- **PBI 6** — Manajemen Harga Layanan Fasilitas EV (tarif charging per kWh dan swap per transaksi)

Project ini tanpa dependensi eksternal, cukup Node.js 22 atau lebih baru.

## Cara menjalankan di VS Code

1. Buka folder `ev-energyshift-pbi5-6` (File → Open Folder).
2. Buka terminal (Terminal → New Terminal).
3. Jalankan tes:
   ```bash
   npm test
   ```
4. Jalankan server:
   ```bash
   npm start
   ```
   Server berjalan di `http://localhost:3000`. Data disimpan ke `data/db.json` (folder `data/` dibuat otomatis dan tidak ikut di Git).

Buka `http://localhost:3000` di browser untuk memakai UI web:
- **Fasilitas EV**: form tambah/ubah fasilitas, peta dengan marker per kategori (hanya fasilitas aktif), daftar dengan filter kategori, dan tombol nonaktifkan.
- **Tarif Layanan**: form tambah/ubah tarif, daftar tarif, dan kotak "Cek tarif aktif".

Peta memakai Leaflet dan tile OpenStreetMap, jadi perlu koneksi internet. Tanpa internet, bagian lain tetap berjalan.

## Struktur

```
src/
  errors.js      error dengan HTTP status
  store.js       penyimpanan (memori / file JSON)
  facilities.js  PBI 5: validasi dan CRUD fasilitas
  tarif.js       PBI 6: validasi dan CRUD tarif, serta pembacaan tarif aktif
  server.js      HTTP server dan routing
test/
  facilities.test.js  tes PBI 5
  tarif.test.js       tes PBI 6
  api.test.js         tes endpoint
```

## Endpoint

### PBI 5 — Fasilitas

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/facilities?kategori=SPKLU&aktif=true` | Daftar fasilitas (filter opsional) |
| POST | `/api/facilities` | Tambah fasilitas |
| GET | `/api/facilities/:id` | Detail fasilitas |
| PUT | `/api/facilities/:id` | Ubah fasilitas |
| DELETE | `/api/facilities/:id` | Nonaktifkan fasilitas (`aktif: false`) |

Body POST contoh:

```json
{
  "nama": "SPKLU Sudirman",
  "kategori": "SPKLU",
  "alamat": "Jl. Jenderal Sudirman No. 1, Jakarta",
  "latitude": -6.2088,
  "longitude": 106.8456,
  "jamOperasional": "24 jam",
  "kontak": "021-000000"
}
```

### PBI 6 — Tarif

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/tarif?facilityId=1` | Daftar tarif (filter fasilitas opsional) |
| POST | `/api/tarif` | Tambah tarif |
| GET | `/api/tarif/:id` | Detail tarif |
| PUT | `/api/tarif/:id` | Ubah tarif |
| GET | `/api/tarif/aktif?facilityId=1&jenisLayanan=CHARGING&tanggal=2026-06-01` | Tarif yang berlaku pada tanggal tertentu (dipakai modul simulasi) |

Body POST contoh:

```json
{
  "facilityId": 1,
  "jenisLayanan": "CHARGING",
  "nilai": 2500,
  "berlakuMulai": "2026-01-01",
  "berlakuSampai": "2026-12-31"
}
```

## Aturan yang dipilih (asumsi)

Aturan berikut tidak ditulis eksplisit di spreadsheet, jadi ditentukan sendiri. Sesuaikan jika tim punya keputusan lain.

- `CHARGING` hanya untuk fasilitas kategori `SPKLU`, dan satuannya `kWh`.
- `SWAP` hanya untuk fasilitas kategori `SPBKLU`, dan satuannya `transaksi`.
- Satu fasilitas tidak boleh punya dua tarif untuk jenis layanan yang sama dengan periode yang bertabrakan (respons 409).
- `berlakuSampai` boleh dikosongkan, artinya berlaku terus.
- Fasilitas yang dinonaktifkan tetap bisa dibaca tarifnya. Ini sengaja tidak diatur di PBI 5 maupun PBI 6.

## Pemetaan ke Acceptance Criteria

| PBI | AC | Tempat implementasi | Tes |
|---|---|---|---|
| 5 | 1 Tambah lokasi | `facilities.js` `create` | `facilities.test.js` |
| 5 | 2 Validasi input | `validateFacility` | `facilities.test.js` |
| 5 | 3 Lihat & ubah data | `list`, `get`, `update` | `facilities.test.js` |
| 5 | 4 Nonaktifkan | `deactivate` | `facilities.test.js` |
| 5 | 5 Kategori jelas | `KATEGORI`, filter `kategori` | `facilities.test.js` |
| 6 | 1 Buat tarif | `tarif.js` `create` | `tarif.test.js` |
| 6 | 2 Jenis & satuan | `JENIS_LAYANAN`, `validateTarif` | `tarif.test.js` |
| 6 | 3 Ubah tarif | `update` | `tarif.test.js` |
| 6 | 4 Periode berlaku | `berlakuMulai`, `berlakuSampai`, `periodeOverlap` | `tarif.test.js` |
| 6 | 5 Tarif aktif dapat dibaca | `getAktif`, `GET /api/tarif/aktif` | `tarif.test.js`, `api.test.js` |
