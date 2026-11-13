# MobilitiQ – Katalog EV Mitra

## Menjalankan
    npm install
    npm start        # http://localhost:3000

## Endpoint
| Method | Path | Keterangan |
|---|---|---|
| GET | /api/vehicles | Daftar unit katalog (admin mitra) |
| GET | /api/vehicles/:id | Detail unit |
| POST | /api/vehicles | Tambah unit |
| PUT | /api/vehicles/:id | Ubah unit |
| DELETE | /api/vehicles/:id | Hapus unit |
| GET | /api/public/vehicles | Referensi simulasi pengguna (hanya unit aktif) |

Body: `{ model, tipe: "Motor"|"Mobil", baterai_kwh, harga_otr, charger_ac_kw, promo?, aktif? }`
