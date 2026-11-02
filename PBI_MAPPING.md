# Validasi & Pemetaan *Product Backlog Item* (`PBI_MAPPING.md`) MobilitiQ (Tervalidasi Final)

> **Ketentuan Validasi Final PBI**:
> 1. Analisis tidak dibatasi berdasarkan pemilik (*assignee*); seluruh PBI dalam sprint aktif menjadi tanggung jawab implementasi penuh.
> 2. **Nama *branch* Git bukan bukti tunggal maupun bukti lengkap bahwa suatu PBI masuk ke sprint aktif.** Berkas `.txt` pada cabang anggota (`27-28 Oktober 2026`) merupakan artefak latihan integrasi Git-Jira awal dan hanya merekam sebagian tiket dari keseluruhan papan Jira `KEL2-*`.
> 3. **PBI yang belum diketahui (`Belum diketahui`) TIDAK dianggap sudah tercakup.** Sebelum daftar resmi Sprint Aktif dari papan Jira diekspor/dilampirkan, cakupan sprint belum boleh diklaim 100% tertutup.
> 4. Tidak ada nomor *issue key*, nama PBI, maupun *Acceptance Criteria* resmi Jira yang dikarang. Karena berkas `.txt` di *workspace* tidak memuat teks AC Jira, kolom **AC Resmi Jira** ditulis jujur sebagai `Belum diketahui`, didampingi **Kriteria Penerimaan Fungsional Terukur (*Engineering AC*)** untuk setiap PBI yang teridentifikasi agar setiap PBI memiliki tolok ukur kelulusan yang jelas dan siap diselaraskan dengan Jira.

---

## 1. Audit Bukti PBI di Repositori & Identifikasi Celah PBI (`Belum Diketahui`)

### A. Mengapa Cabang Git Tidak Mencerminkan Seluruh Sprint Aktif
Pemeriksaan menyeluruh terhadap *commit*, isi berkas `.txt`, dan nomor tiket pada repositori `PPLKEL2/SI2405-KEL2` membuktikan adanya celah data yang hanya ada di papan Jira:
1. **Lompatan *Issue Key* Jira (`KEL2-*`)**: Tiket yang muncul di riwayat Git tersebar pada `KEL2-53`, `KEL2-54`, `KEL2-57`, `KEL2-67`, `KEL2-69`, `KEL2-71`, dan `KEL2-73`. Artinya, tiket `KEL2-1` s.d. `KEL2-52`, `KEL2-55`, `KEL2-56`, `KEL2-58` s.d. `KEL2-66`, `KEL2-68`, `KEL2-70`, `KEL2-72`, serta `KEL2-74+` **sama sekali belum diketahui** isinya (apakah berupa *Epic*, *User Story* sprint aktif, *Sub-task*, atau backlog sprint berikutnya).
2. **Lompatan & Tabrakan Nomor Urut Fitur (`01` s.d. `11+`)**:
   - Tersedia di berkas `.txt`: `01`, `03` (tercatat ganda untuk dua fitur berbeda), `07` (juga tertulis `08`), `09`, dan `11`.
   - **Hilang / Belum Diketahui**: Nomor urut fitur **`02`**, **`04`**, **`05`**, **`06`**, **`08`/`07` (salah satunya)**, **`10`**, serta **`12` ke atas**.
3. **Anggota Kelompok Tanpa Artefak Dokumen di Git**: Dari 6 anggota pada `NamaAnggota.txt`, `Arsyad` belum memiliki berkas PBI maupun catatan *commit* di repositori.
4. **Status Keanggotaan Sprint**: Keberadaan berkas `.txt` di Git hanya membuktikan tiket tersebut ada di *Product Backlog* Jira pada tanggal 27-28 Oktober 2026, **belum membuktikan secara definitif** tiket mana yang ditarik ke *Active Sprint* di Jira dan tiket mana yang ditunda ke sprint berikutnya.

### B. Ringkasan Status Identifikasi Seluruh PBI

| Kategori Status | Issue Key | Nama PBI | Bukti Dokumen (Bukan Sekadar Nama Branch) | Status Masuk Sprint Aktif Jira | Status Cakupan Saat Ini |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Teridentifikasi (Eksplisit di Berkas)** | **`KEL2-54`** *(riwayat commit `2604bab` sempat menulis `KEL2-53`)* | `01 - Kalkulator Biaya BBM` | Isi berkas `01 - Kalkulator Biaya BBM.txt` (`origin/main`) & `KEL2-54.txt` (`commit 2dd7d8d`). | *Perlu konfirmasi papan Sprint Jira* | Terpetakan & siap diimplementasikan. |
| **Teridentifikasi (Eksplisit di Commit + Berkas)** | **`KEL2-57`** | `03 - Manajemen Katalog Kendaraan Listrik` | Berkas `03 - Manajemen Katalog Kendaraan Listrik.txt` & pesan *commit* `678e6b3` (`origin/main`). | *Perlu konfirmasi papan Sprint Jira* | Terpetakan & siap diimplementasikan. |
| **Teridentifikasi (Eksplisit di Berkas)** | **`KEL2-67`** | `07 - Simulator Konsumsi Energi EV` *(juga berkas `08 - Simulator Konsumsi Energi EV.txt`)* | Isi berkas `KEL2-67.txt` (`commit 2666be0`) & berkas `08 - Simulator Konsumsi Energi EV.txt` (`commit fa58a04`). | *Perlu konfirmasi papan Sprint Jira* | Terpetakan & siap diimplementasikan. |
| **Teridentifikasi (Eksplisit di Berkas)** | **`KEL2-69`** | `09 - Manajemen Tarif Energi` | Isi berkas `KEL2-69.txt` (`commit 4b26bc2`, `origin/main`). | *Perlu konfirmasi papan Sprint Jira* | Terpetakan & siap diimplementasikan. |
| **Teridentifikasi (Eksplisit di Commit + Berkas)** | **`KEL2-71`** | `11 - Peta Interaktif Fasilitas EV` | Berkas `Peta Interaktif Fasilitas EV.txt` & pesan *commit* `414f524`, `d784d2a` (`origin/main`). | *Perlu konfirmasi papan Sprint Jira* | Terpetakan & siap diimplementasikan. |
| **Teridentifikasi Sebagian (Ambigu)** | **`KEL2-73`** | Terkait berkas `03 - Penilai Efisiensi BBM Kendaraan Konvensional` *(judul resmi Jira belum terkonfirmasi)* | Pesan *commit* `fa58a04` (`"KEL2-67 dan KEL2-73"`) yang menambahkan berkas `03 - Penilai Efisiensi BBM Kendaraan Konvensional.txt`. | *Perlu konfirmasi papan Sprint Jira* | Terpetakan ke modul evaluasi efisiensi BBM, wajib konfirmasi judul & batasannya dengan `KEL2-54`. |
| **BELUM DIKETAHUI** | `KEL2-55, 56, 58..66, 68, 70, 72, 74+` (urutan fitur `02, 04, 05, 06, 08, 10, 12+`, termasuk tugas `Arsyad`) | **`Belum diketahui`** | Tidak ada berkas maupun *commit* di *workspace* / repositori; akses Jira belum terhubung. | **`Belum diketahui`** | **TIDAK DIANGGAP SUDAH TERCAKUP (`Blocker BL-01`)**. |

---

## 2. Daftar Lengkap Issue Key, Nama PBI, Fitur, dan Acceptance Criteria

Bagian ini menjabarkan spesifikasi lengkap untuk seluruh PBI yang telah teridentifikasi dari artefak proyek, lengkap dengan daftar fitur *end-to-end* dan kriteria penerimaan yang harus dipenuhi.

### 2.1. PBI `KEL2-69` - `09 - Manajemen Tarif Energi`
- **Aktor / Role Utama**: `SUPERADMIN` (Pengelola di Layar `27`), menyuplai parameter ke `Guest` & `USER` (Layar `01, 03, 04, 05, 07, 08, 09, 11, 15, 17, 18, 20`).
- **Daftar Fitur Wajib Implementasi**:
  1. Penyimpanan master harga BBM per liter (subsidi & non-subsidi), Tarif Dasar Listrik (TDL) PLN per rentang golongan daya `VA` (beserta biaya resmi tambah daya PLN), tarif acuan SPKLU publik, dan faktor emisi per unit energi pada tabel `energy_tariffs`.
  2. Tabel dan API pengeditan tarif energi di Portal Superadmin (`Layar 27`) dengan pemisahan tab `Harga BBM` dan `Tarif PLN`, indikator perubahan belum disimpan (`dirty badge`), dan validasi numerik ketat.
  3. Pencatatan otomatis setiap perubahan nominal tarif ke tabel riwayat `energy_tariff_histories` (`old_price_idr`, `new_price_idr`, `changed_by`, `changed_at`).
  4. Penyediaan endpoint `GET /api/reference/bootstrap` sehingga setiap perubahan tarif oleh Superadmin langsung berlaku pada seluruh kalkulator baru tanpa mengubah *snapshot* riwayat simulasi masa lalu (`perbaikan BUG-05` & `BUG-10`).
- **Acceptance Criteria Resmi Jira**: `Belum diketahui` (wajib disinkronkan dari Jira).
- **Acceptance Criteria Fungsional & Teknis Terukur**:
  - [ ] **AC-69.1 (Otorisasi)**: Hanya pengguna terautentikasi dengan `role = 'SUPERADMIN'` yang dapat mengakses `/admin/tarif-energi` dan memanggil `PUT /api/admin/energy-tariffs`; akses oleh `Guest`, `USER`, atau `MITRA` ditolak dengan `HTTP 401/403`.
  - [ ] **AC-69.2 (Validasi Input)**: Sistem menolak penyimpanan (`HTTP 422` + pesan galat per baris) apabila harga BBM atau tarif PLN bernilai kosong, non-numerik, `<= 0`, atau melebihi batas kewajaran tipe data.
  - [ ] **AC-69.3 (Persistensi & Audit Historis)**: Saat Superadmin menyimpan perubahan tarif, nilai baru tersimpan di `energy_tariffs`, kolom tanggal pembaruan terisi waktu server terkini, dan baris audit baru tercatat di `energy_tariff_histories`.
  - [ ] **AC-69.4 (Propagasi Lintas Kalkulator & Imutabilitas Riwayat)**: Kalkulator BBM (`08`) dan Simulator Energi EV (`09`) langsung menggunakan tarif baru pada perhitungan berikutnya, sedangkan riwayat simulasi lama yang sudah disimpan di tabel `simulations` tetap mempertahankan *snapshot* tarif saat simulasi tersebut dibuat.

---

### 2.2. PBI `KEL2-57` - `03 - Manajemen Katalog Kendaraan Listrik`
- **Aktor / Role Utama**: `MITRA` terverifikasi (Pengelola CRUD di Layar `23`, ringkasan di `22`) dan `USER` / `Guest` (Penjelajah & Pembanding di Layar `10`, `11`, serta pemilih unit di `03, 04, 05, 07, 09, 12-18, 20`).
- **Daftar Fitur Wajib Implementasi**:
  1. Penyimpanan entitas `ev_models` lengkap (`brand`, `model_name`, `vehicle_type` [`Motor`/`Mobil`], `battery_kwh`, `otr_price_idr`, `wltp_range_km`, `consumption_kwh_100km`, `ac_charger_kw`, `dc_charger_kw`, `service_cost_per_km_idr`, `warranty_label`, `promo_label`, `comparable_ice_name`, `comparable_ice_price_idr`, `image_url`, `is_active`, `partner_id`, `deleted_at`).
  2. Antarmuka CRUD Katalog EV di Portal Mitra (`Layar 23`): tabel daftar unit mitra, `Switch` status `Aktif`/`Nonaktif`, modal `shadcn/ui Dialog` Tambah/Edit dengan **seluruh field spesifikasi lengkap** (`perbaikan BUG-10`), serta `shadcn/ui AlertDialog` konfirmasi hapus (*soft-delete*).
  3. Antarmuka Katalog EV Pengguna (`Layar 10`): pencarian teks `brand + model_name` (*debounced*), filter kategori (`Semua/Motor/Mobil`), batas harga OTR maksimum, kapasitas baterai minimum, *EmptyState* reset filter, dan bilah komparasi melayang.
  4. Antarmuka Detail & Komparasi EV (`Layar 11`): perbandingan berdampingan 2 unit EV pada 8 atribut utama dengan penanda otomatis nilai pemenang dan aksi `Pakai untuk simulasi`.
- **Acceptance Criteria Resmi Jira**: `Belum diketahui` (wajib disinkronkan dari Jira).
- **Acceptance Criteria Fungsional & Teknis Terukur**:
  - [ ] **AC-57.1 (Otorisasi & Kepemilikan Mitra)**: Hanya `MITRA` dengan `verification_status = 'APPROVED'` yang dapat menambah, mengubah, mengaktifkan, atau menghapus unit EV miliknya sendiri; percobaan memodifikasi unit milik mitra lain ditolak dengan `HTTP 403`.
  - [ ] **AC-57.2 (Kelengkapan & Validasi Spesifikasi)**: Form Tambah/Edit menolak penyimpanan apabila atribut wajib kosong atau tidak valid (`battery_kwh <= 0`, `otr_price_idr < 1.000.000`, `wltp_range_km <= 0`, `consumption_kwh_100km <= 0`, `ac_charger_kw <= 0`).
  - [ ] **AC-57.3 (Sinkronisasi ke Katalog Publik & Simulator)**: Unit berstatus `is_active = true` dan `deleted_at IS NULL` langsung tampil pada pencarian/filter Layar `10`, tabel komparasi Layar `11`, algoritma rekomendasi *chatbot* (`03`), dan dropdown seluruh kalkulator (`09, 12-18`).
  - [ ] **AC-57.4 (Keamanan Penghapusan Historis)**: Menghapus unit di Layar `23` melakukan *soft-delete* (`deleted_at = NOW(), is_active = false`) sehingga unit hilang dari katalog aktif tanpa merusak data `simulations` atau `partner_leads` historis yang merujuk unit tersebut.

---

### 2.3. PBI `KEL2-54` (`01 - Kalkulator Biaya BBM`) & PBI `KEL2-73` (`03 - Penilai Efisiensi BBM Kendaraan Konvensional`)
> *Catatan Validasi*: Kedua artefak ini beririsan pada domain evaluasi efisiensi (`km/l`) dan biaya operasional kendaraan konvensional. Pembagian batas tanggung jawab persis antara `KEL2-54` dan `KEL2-73` di papan Jira wajib dikonfirmasi (`Blocker BL-01`), namun seluruh kapabilitas fungsional keduanya dipetakan secara utuh di bawah ini.

- **Aktor / Role Utama**: `USER` & `Guest` (Layar utama `08` Kalkulator BBM & Perawatan, serta `03` Chatbot Konsultasi Jalur B Evaluasi Kendaraan Lama; menyuplai baseline BBM ke `01, 04, 05, 07, 09, 17, 18, 20`).
- **Daftar Fitur Wajib Implementasi**:
  1. Pemilihan preset kendaraan konvensional (`Motor` & `Mobil`) dari tabel `ice_vehicle_presets` yang otomatis mengisi acuan efisiensi `km/l`, biaya servis per km, pajak STNK tahunan, dan taksiran harga jual/beli.
  2. Penilaian efisiensi aktual konsumsi BBM pengguna baik melalui *slider* `5-60 km/l` (langkah `0.5`) pada Layar `08` maupun input desimal manual `3-60 km/l` dengan validasi batas pada Layar `03` (Jalur B).
  3. Perlindungan *state* profil kendaraan BBM pengguna agar **tidak tertimpa ulang ke preset pertama** ketika pengguna mengganti model EV pembanding yang bertipe kendaraan sama (`perbaikan BUG-03`).
  4. Perhitungan *real-time* konsumsi liter bulanan, pengeluaran BBM bulanan & tahunan (berdasarkan tarif `KEL2-69`), rincian biaya perawatan per komponen (oli & filter, servis berkala, ban & rem dari `system_parameters`), pajak STNK, dan visualisasi `DonutChart` komposisi biaya tahunan.
- **Acceptance Criteria Resmi Jira**: `Belum diketahui` (wajib disinkronkan dari Jira).
- **Acceptance Criteria Fungsional & Teknis Terukur**:
  - [ ] **AC-54/73.1 (Preset & Kustomisasi Efisiensi `km/l`)**: Memilih preset kendaraan BBM mengisi nilai `km/l` bawaan, dan pengguna tetap dapat mengubah nilai `km/l` secara manual dalam rentang valid (`3-60 km/l` pada chatbot, `5-60 km/l` pada slider kalkulator) dengan penolakan input di luar batas.
  - [ ] **AC-54/73.2 (Akurasi Perhitungan & Integrasi Tarif)**: Nilai liter bulanan (`(kmHari * 30) / kmL`), biaya BBM (`liter * hargaBbmAktif`), rincian perawatan bulanan, dan total biaya tahunan pada `DonutChart` dihitung akurat menggunakan tarif BBM aktif dari database (`KEL2-69`).
  - [ ] **AC-54/73.3 (Persistensi Lintas Layar)**: Nilai kendaraan BBM, `km/l` kustom, jenis BBM, dan jarak harian yang diatur pengguna di Layar `03` atau `08` tetap utuh saat pengguna berpindah ke Simulator Energi EV (`09`) dan mengganti pilihan model EV bertipe sama (`BUG-03` tertutup).

---

### 2.4. PBI `KEL2-67` - `07 - Simulator Konsumsi Energi EV`
- **Aktor / Role Utama**: `USER` (Layar utama `09` Simulator Energi EV; menyuplai metrik konsumsi listrik & penghematan ke `01, 04, 05, 07, 11, 12, 17, 20`).
- **Daftar Fitur Wajib Implementasi**:
  1. Pemilihan model EV aktif dari katalog (`KEL2-57`) dan pengaturan jarak tempuh harian (`5-150 km/hari`).
  2. Pengaturan proporsi bauran pengisian daya di rumah vs stasiun publik (`homeChargingShare`: `0-100%`, langkah `5%`) yang disimpan ke `SimulationContext` terpadu (`perbaikan BUG-06`).
  3. Perhitungan kebutuhan listrik bulanan (`kWh/bulan`), tarif listrik rata-rata tertimbang menggunakan **tarif PLN yang cocok dengan golongan daya `VA` rumah pengguna** (`perbaikan BUG-05`, terhubung ke `KEL2-69`) dan tarif acuan SPKLU publik, serta biaya energi per kilometer (`Rp/km`).
  4. Perbandingan biaya operasional bulanan total (energi + perawatan rutin EV vs BBM + perawatan rutin konvensional dari `KEL2-54`/`KEL2-73`) beserta visualisasi `CompareBarChart` dan `DonutChart` yang tahan terhadap nilai penghematan negatif (`perbaikan BUG-04`).
- **Acceptance Criteria Resmi Jira**: `Belum diketahui` (wajib disinkronkan dari Jira).
- **Acceptance Criteria Fungsional & Teknis Terukur**:
  - [ ] **AC-67.1 (Perhitungan kWh & Bauran Tarif VA Rumah)**: Konsumsi `kWh/bulan` dihitung tepat sebesar `(kmHari * 30) * (consumption_kwh_100km / 100)`, dan porsi *home charging* dikalikan dengan tarif PLN sesuai `home_power_va` pengguna (`450 VA` s.d. `>=6.600 VA`), bukan konstanta statis tunggal.
  - [ ] **AC-67.2 (Sinkronisasi Bauran Pengisian Lintas Modul)**: Mengubah *slider* porsi *home charging* (misal dari `85%` ke `20%`) di Layar `09` langsung memperbarui angka biaya listrik bulanan dan penghematan pada Dashboard (`07`), TCO 5 Tahun (`17`), serta Laporan PDF (`20`).
  - [ ] **AC-67.3 (Penanganan Selisih Negatif)**: Apabila biaya bulanan EV melebihi biaya BBM (`saving < 0`), grafik `CompareBarChart` merender batang secara proporsional tanpa galat tinggi negatif dan kartu KPI menampilkan status biaya lebih tinggi (`tone="warn"`/`"bad"`), bukan klaim `"Hemat"` berwarna hijau.

---

### 2.5. PBI `KEL2-71` - `11 - Peta Interaktif Fasilitas EV`
- **Aktor / Role Utama**: `USER` & `Guest` (Pencari fasilitas di Layar `19`, tabel terdekat di `20`, pratinjau di `05`) serta `MITRA` terverifikasi (Pengelola titik lokasi di Layar `24` & tarif di `25`, metrik di `22`).
- **Daftar Fitur Wajib Implementasi**:
  1. Komponen peta GIS nyata berbasis **React-Leaflet + OpenStreetMap** yang menggantikan ilustrasi garis SVG statis pada Layar `19` dan `24` (`perbaikan BUG-11`).
  2. Pencarian kata kunci nama/alamat, filter kota dinamis dari tabel `cities`, filter kategori fasilitas (`Semua`, `SPKLU`, `SPBKLU`, `Showroom`), tombol `Lokasi Saya` (`navigator.geolocation`), serta perhitungan jarak Haversine & estimasi waktu tempuh dari posisi pengguna/pusat kota.
  3. Panel detail fasilitas pada *desktop* dan *expandable bottom sheet* pada *mobile* (`Layar 19`) yang memuat alamat, spesifikasi daya/slot, jam operasional, tarif layanan terbaru, dan tombol `Petunjuk Arah` yang mencatat *event* ke `partner_leads` lalu membuka navigasi Google Maps Directions nyata (`perbaikan BUG-12`).
  4. Formulir CRUD lokasi fasilitas di Portal Mitra (`Layar 24`) lengkap dengan input `Kota`, `Jenis`, `Alamat`, `Spesifikasi Daya/Slot`, `Jam Operasional`, `Tarif Awal`, dan penandaan pin koordinat GPS `latitude, longitude` langsung di atas peta React-Leaflet (`perbaikan BUG-10`).
- **Acceptance Criteria Resmi Jira**: `Belum diketahui` (wajib disinkronkan dari Jira).
- **Acceptance Criteria Fungsional & Teknis Terukur**:
  - [ ] **AC-71.1 (Interaktivitas Peta GIS Nyata)**: Peta pada Layar `19` dan `24` menampilkan peta jalan OpenStreetMap dengan kontrol *zoom in/out* dan *pan* berfungsi penuh serta merender pin fasilitas sesuai koordinat `latitude` dan `longitude` asli dari tabel `facilities`.
  - [ ] **AC-71.2 (Filter, Pencarian, & Jarak Dinamis)**: Memilih *chip* kota, jenis fasilitas (`SPKLU`/`SPBKLU`/`Showroom`), atau kata kunci pencarian menyaring daftar kartu dan pin peta secara akurat; jika hasil kosong, `EmptyState` tampil dengan aksi reset filter.
  - [ ] **AC-71.3 (Integrasi Penuh CRUD Mitra ke Peta Pengguna)**: Titik fasilitas baru yang disimpan `MITRA` terverifikasi pada Layar `24` (beserta perubahan tarifnya di Layar `25`) tersimpan di PostgreSQL dan langsung muncul pada Peta Fasilitas (`19`) sesuai kota dan kategorinya.
  - [ ] **AC-71.4 (Navigasi Rute & Pencatatan Lead)**: Mengklik `Petunjuk Arah` pada fasilitas terpilih mengirim pencatatan ke `POST /api/facilities/:id/lead` dan membuka URL Google Maps Directions dengan parameter `destination=latitude,longitude`.

---

## 3. Matriks Pemetaan Dua Arah Seluruh 30 Layar (`00` s.d. `29`)

| Frame | Nama Layar | Aktor / Role | PBI Primer Terverifikasi | Seluruh PBI Pendukung di Layar Ini | Status Pemetaan PBI |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `00` | Design System | Non-Role (Dev) | *Bukan layar produk* | Komponen dasar untuk `KEL2-54, 57, 67, 69, 71, 73` | Artefak UI Kit internal. |
| `01` | Landing | `Guest` | `Belum diketahui` | `KEL2-54, KEL2-67, KEL2-69, KEL2-73` | Konsumen sekunder kalkulasi BBM vs EV; PBI primer `Belum diketahui`. |
| `02` | Quick Consultation Widget | `Guest` | `Belum diketahui` | `KEL2-54/73` (Jalur B), `KEL2-57` (Jalur A) | PBI primer `Belum diketahui`. |
| `03` | Chatbot Konsultasi | `Guest` / `USER` | `KEL2-73` / `KEL2-54` (khusus Jalur B); Jalur A: `Belum diketahui` | `KEL2-57` (rekomendasi unit), `KEL2-69` (pilihan BBM) | Jalur B terkait evaluasi BBM; PBI khusus chatbot `Belum diketahui`. |
| `04` | Hasil Teaser | `Guest` / `USER` | `Belum diketahui` | `KEL2-54, KEL2-57, KEL2-67, KEL2-69, KEL2-73` | Konsumen hasil rekomendasi & hemat bulanan; PBI primer `Belum diketahui`. |
| `05` | Dashboard Hasil Tamu | `Guest` | `Belum diketahui` | `KEL2-54, KEL2-57, KEL2-67, KEL2-69, KEL2-71, KEL2-73` | Konsumen ringkasan & pratinjau peta; PBI primer `Belum diketahui`. |
| `06` | Modal Login | `Guest` | `Belum diketahui` | Prasyarat otorisasi `USER/MITRA/SUPERADMIN` untuk `KEL2-57, 69, 71` | Infrastruktur autentikasi; PBI primer `Belum diketahui`. |
| `07` | Dashboard Ringkasan | `USER` | `Belum diketahui` | `KEL2-54, KEL2-57, KEL2-67, KEL2-69, KEL2-73` | Agregator hasil simulasi; PBI primer `Belum diketahui`. |
| `08` | Kalkulator BBM & Perawatan | `USER` | **`KEL2-54`** & **`KEL2-73`** | `KEL2-69` (tarif BBM per liter) | **Terpetakan langsung**. |
| `09` | Simulator Energi EV | `USER` | **`KEL2-67`** | `KEL2-57` (unit EV), `KEL2-69` (tarif PLN/SPKLU), `KEL2-54/73` (baseline BBM) | **Terpetakan langsung**. |
| `10` | Katalog EV | `USER` / `Guest` | **`KEL2-57`** | `KEL2-67` (`Pakai untuk simulasi`) | **Terpetakan langsung** (sisi pengguna). |
| `11` | Detail & Komparasi EV | `USER` | **`KEL2-57`** | `KEL2-67` & `KEL2-69` (baris biaya listrik/bln) | **Terpetakan langsung** (sisi komparasi katalog). |
| `12` | Kalkulator Pembelian Awal | `USER` | `Belum diketahui` | `KEL2-57` (harga OTR), `KEL2-54/67` (rasio hemat/cicilan) | **PBI primer `Belum diketahui` (tidak dianggap otomatis tercakup)**. |
| `13` | Estimator Degradasi Baterai | `USER` | `Belum diketahui` | `KEL2-57` (`range` WLTP & garansi baterai) | **PBI primer `Belum diketahui`**. |
| `14` | Dana Cadangan Baterai | `USER` | `Belum diketahui` | `KEL2-57` (`battery_kwh` EV) | **PBI primer `Belum diketahui`**. |
| `15` | Home Charging Planner | `USER` | `Belum diketahui` | `KEL2-57` (`kwh` & `ac` charger), `KEL2-69` (golongan VA PLN) | **PBI primer `Belum diketahui`**. |
| `16` | Simulator Jarak Tempuh | `USER` | `Belum diketahui` | `KEL2-57` (`range` & `dc` charger), `KEL2-71` (estimasi stop SPKLU) | **PBI primer `Belum diketahui`**. |
| `17` | TCO 5 Tahun & Payback | `USER` | `Belum diketahui` | `KEL2-54, KEL2-57, KEL2-67, KEL2-69, KEL2-73` | **PBI primer `Belum diketahui`**. |
| `18` | Kalkulator Emisi | `USER` | `Belum diketahui` | `KEL2-54/73, KEL2-57, KEL2-67, KEL2-69` | **PBI primer `Belum diketahui`**. |
| `19` | Peta Fasilitas | `USER` / `Guest` | **`KEL2-71`** | `KEL2-57` (lokasi *Showroom* merek terkait) | **Terpetakan langsung** (sisi peta pengguna). |
| `20` | Preview Laporan PDF | `USER` | `Belum diketahui` | `KEL2-54, KEL2-57, KEL2-67, KEL2-69, KEL2-71, KEL2-73` | **PBI primer `Belum diketahui`**. |
| `21` | Riwayat & Profil | `USER` | `Belum diketahui` | `KEL2-67, KEL2-69` (menyimpan golongan `home_power_va` pengguna) | **PBI primer `Belum diketahui`**. |
| `22` | Dashboard Mitra | `MITRA` | `Belum diketahui` | `KEL2-57` (unit aktif & rekomendasi), `KEL2-71` (titik fasilitas & *lead*) | **PBI primer `Belum diketahui`**. |
| `23` | Manajemen Katalog EV | `MITRA` | **`KEL2-57`** | - | **Terpetakan langsung** (sisi CRUD Mitra). |
| `24` | Showroom & Fasilitas | `MITRA` | **`KEL2-71`** | - | **Terpetakan langsung** (sisi CRUD fasilitas Mitra). |
| `25` | Harga Layanan | `MITRA` | `Belum diketahui` | `KEL2-71` (tarif fasilitas di peta), `KEL2-67` (acuan biaya layanan) | Pendukung langsung `KEL2-71`; PBI primer `Belum diketahui`. |
| `26` | Dashboard Analitik | `SUPERADMIN` | `Belum diketahui` | `KEL2-54/73, KEL2-57` (statistik jalur konsultasi) | **PBI primer `Belum diketahui`**. |
| `27` | Manajemen Tarif Energi | `SUPERADMIN` | **`KEL2-69`** | `KEL2-54, KEL2-67, KEL2-73` (pemasok tarif BBM & PLN) | **Terpetakan langsung**. |
| `28` | Insentif & Pajak EV | `SUPERADMIN` | `Belum diketahui` | `KEL2-57` (potongan harga efektif EV) | **PBI primer `Belum diketahui`**. |
| `29` | Verifikasi Mitra | `SUPERADMIN` | `Belum diketahui` | Prasyarat status `APPROVED` Mitra untuk `KEL2-57` (`23`) & `KEL2-71` (`24`) | **PBI primer `Belum diketahui`**. |

---

## 4. PBI / Kebutuhan Fungsional yang Belum Memiliki Desain UI

1. **PBI Sprint Aktif di Jira yang Belum Diketahui (`KEL2-*` lainnya)**:
   - Status desain UI: **`Belum diketahui`**. Tidak boleh diasumsikan sudah memiliki layar di *prototype* sampai daftar PBI sprint aktif dari Jira diverifikasi (`Blocker BL-01`).
2. **Sub-Alur Wajib pada PBI Teridentifikasi yang Belum Memiliki Desain UI di *Prototype***:
   - **`KEL2-57` (Layar `23`)**: Belum ada field input modal untuk `brand`, `wltp_range_km`, `consumption_kwh_100km`, `dc_charger_kw`, `warranty_label`, `comparable_ice_name`, `comparable_ice_price_idr`, `image_url`, `Switch` pengubah status `Aktif/Nonaktif` pada baris tabel, serta dialog konfirmasi hapus.
   - **`KEL2-71` (Layar `19` & `24`)**: Pada Layar `24` belum ada input `Kota`, `Spesifikasi Daya/Konektor/Slot`, `Jam Operasional`, dan `Tarif Awal`; pada Layar `19` belum ada `SearchInput` kata kunci lokasi dan tombol `Lokasi Saya` (*Geolocation*).
   - **`KEL2-69` (Layar `27`)**: Belum ada input pengelolaan **Tarif Acuan SPKLU Publik** (`Rp 2.466/kWh`), **Faktor Emisi Energi**, dan panel peninjau **Riwayat Perubahan Tarif (`energy_tariff_histories`)**.
   - **Autentikasi & Registrasi Mitra (Prasyarat Akses `MITRA` untuk `KEL2-57` & `KEL2-71`)**: Layar `06` belum memiliki input `Kata Sandi` & mode `Daftar Akun`, belum ada layar **Registrasi Mitra & Unggah 4 Dokumen Legalitas** (`NIB, SIUP, NPWP, Perjanjian`), serta belum ada layar `403 Forbidden` & `404 Not Found`.
