# PBI3 — Manajemen Katalog Kendaraan Listrik (Portal Mitra)

User story: *Sebagai admin mitra/dealer, saya ingin mengelola informasi kendaraan listrik yang tersedia agar data kendaraan dapat digunakan sebagai referensi oleh pengguna dalam simulasi.*

```
PBI3/
├── backendQ/    Express + TypeScript + zod   (port 4000)
└── frontendQ/   Next.js (App Router)         (port 3000)
```

## Menjalankan

Backend:
```bash
cd backendQ
copy .env.example .env      # PowerShell/CMD (macOS/Linux: cp)
npm install
npm run dev                 # http://localhost:4000/api/v1/health
```

Frontend (terminal lain):
```bash
cd frontendQ
npm install
npm run dev                 # http://localhost:3000  -> otomatis ke /mitra/katalog
```

## Pengujian
```bash
cd backendQ  && npm test    # build lalu menjalankan 11 tes API (validasi, CRUD, status)
cd frontendQ && npm test    # 6 tes validasi form & format tampilan
```

## Endpoint (`/api/v1`)
| Method | Path | Keterangan |
|---|---|---|
| GET | `/mitra/vehicles` | Daftar seluruh unit katalog (admin) |
| GET | `/mitra/vehicles/:id` | Detail unit |
| POST | `/mitra/vehicles` | Tambah unit |
| PUT | `/mitra/vehicles/:id` | Ubah unit (boleh sebagian field) |
| PATCH | `/mitra/vehicles/:id/status` | Aktif/nonaktifkan `{ "isActive": boolean }` |
| DELETE | `/mitra/vehicles/:id` | Hapus unit |
| GET | `/vehicles?type=Motor\|Mobil` | **Referensi simulasi pengguna** — hanya unit aktif |

Body unit: `{ model, type: "Motor"|"Mobil", batteryKwh, priceOtr, acChargerKw, promo?, isActive? }`

Format respons mengikuti backendQ utama: `{ success, data, meta?, timestamp }`; error validasi: `{ success:false, error, errors: { field: pesan } }`.

Validasi: model wajib & unik (tanpa peduli huruf besar/kecil, maks. 80 karakter), tipe Motor/Mobil, baterai 0,1–500 kWh, harga OTR Rp 1 juta–5 miliar, charger AC 0,1–350 kW, promo maks. 100 karakter.

## Catatan
- Data disimpan di `backendQ/data/vehicles.json` (dibuat otomatis, di-ignore Git); berisi 7 unit awal sesuai mockup.
- Belum ada autentikasi mitra; endpoint `/mitra/*` perlu dilindungi (mis. JWT) sebelum produksi.
- Menu sidebar selain **Katalog EV** hanya tampilan (di luar cakupan PBI3).

## Menggabungkan ke repo utama (frontendQ / backendQ)
Semua berkas PBI3 bersifat tambahan (tidak mengubah berkas yang sudah ada), kecuali satu baris di `index.ts`.

**backendQ** — salin `src/data/vehicles.ts`, `src/routes/vehicles.ts`, `src/vehicles.test.ts`. Di `src/index.ts` tambahkan:
```ts
import { vehiclesRouter } from "./routes/vehicles.js";
app.use("/api/v1", vehiclesRouter);
```
**frontendQ** — salin `app/mitra/`, `components/MitraSidebar.tsx`, `VehicleCatalogManager.tsx`, `VehicleFormDialog.tsx`, `lib/vehicles.ts`, `lib/vehicles.test.ts`, `lib/api/vehicles.ts`.
- Di `lib/api/vehicles.ts` ganti `import ... from "./base.ts"` menjadi `"./calculator.ts"` (fungsi `getApiBaseUrl` & `ApiResponse` sudah ada di sana), lalu `lib/api/base.ts` tidak perlu disalin.
- Gaya halaman ada di `app/mitra/mitra.css` (CSS biasa memakai variabel warna yang sudah ada di `globals.css` utama), jadi tidak bergantung pada utilitas Tailwind.
- `layout.tsx` utama menampilkan Navbar & Footer situs publik di semua halaman. Jika portal mitra tidak ingin memakainya, pindahkan halaman publik ke route group `app/(site)/` dengan layout Navbar/Footer sendiri.
