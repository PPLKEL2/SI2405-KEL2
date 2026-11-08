export interface TariffReference {
  id: string;
  category: "PLN_HOME" | "SPKLU_MOCK";
  label: string;
  tariffPerKwh: number;
  period: string;
  sourceLabel: string;
  sourceUrl: string;
  notes: string;
}

export interface EvPreset {
  id: string;
  name: string;
  vehicleType: "Motor" | "Mobil";
  consumptionKwh100km: number;
  batteryCapacityKwh: number;
  description: string;
}

/**
 * Data Rujukan Resmi Penetapan Tarif Tenaga Listrik PLN Triwulan IV 2024
 * Sumber: Siaran Pers Kementerian ESDM No. 544.Pers/04/SIND/2024 & PT PLN (Persero).
 */
export const PLN_TARIFF_REFERENCES: TariffReference[] = [
  {
    id: "pln-900-subsidized",
    category: "PLN_HOME",
    label: "R-1 / 900 VA (Bersubsidi APBN)",
    tariffPerKwh: 605,
    period: "1 Okt – 31 Des 2024 (Triwulan IV)",
    sourceLabel: "Keputusan Menteri ESDM / Siaran Pers ESDM 544/2024",
    sourceUrl:
      "https://www.esdm.go.id/id/media-center/arsip-berita/pemerintah-putuskan-tarif-listrik-triwulan-iv-tetap",
    notes:
      "Dikhususkan bagi rumah tangga terdaftar pada DTKS (Data Terpadu Kesejahteraan Sosial).",
  },
  {
    id: "pln-900-rtm",
    category: "PLN_HOME",
    label: "R-1 / 900 VA RTM (Rumah Tangga Mampu / Non-Subsidi)",
    tariffPerKwh: 1352,
    period: "1 Okt – 31 Des 2024 (Triwulan IV)",
    sourceLabel: "Permen ESDM 28/2016 jo. Tarif PLN TW IV 2024",
    sourceUrl: "https://web.pln.co.id/pelanggan/tarif-tenaga-listrik",
    notes: "Tarif pelanggan Rumah Tangga Mampu 900 VA tanpa subsidi APBN.",
  },
  {
    id: "pln-1300-2200",
    category: "PLN_HOME",
    label: "R-1 / 1.300 VA s.d. 2.200 VA (Non-Subsidi)",
    tariffPerKwh: 1444.7,
    period: "1 Okt – 31 Des 2024 (Triwulan IV)",
    sourceLabel: "Siaran Pers Kementerian ESDM No. 544.Pers/04/SIND/2024",
    sourceUrl:
      "https://www.esdm.go.id/id/media-center/arsip-berita/pemerintah-putuskan-tarif-listrik-triwulan-iv-tetap",
    notes: "Tarif batas daya menengah umum non-subsidi di Indonesia.",
  },
  {
    id: "pln-3500-5500",
    category: "PLN_HOME",
    label: "R-2 / 3.500 VA s.d. 5.500 VA (Non-Subsidi)",
    tariffPerKwh: 1699.53,
    period: "1 Okt – 31 Des 2024 (Triwulan IV)",
    sourceLabel: "Siaran Pers Kementerian ESDM No. 544.Pers/04/SIND/2024",
    sourceUrl:
      "https://www.esdm.go.id/id/media-center/arsip-berita/pemerintah-putuskan-tarif-listrik-triwulan-iv-tetap",
    notes: "Tarif batas daya menengah-tinggi non-subsidi.",
  },
];

/**
 * Nilai Contoh Bawaan Input SPKLU (Mock / Placeholder)
 * PERHATIAN: Nilai ini BUKAN regulasi tarif mutlak pemerintah dan TANPA dasar survei historis.
 * Pengguna dapat menginputkan tarif riil operator SPKLU secara bebas.
 */
export const SPKLU_MOCK_REFERENCE = {
  defaultTariffPerKwh: 2466,
  status: "Murni Nilai Contoh Input Pengguna (Mock / Placeholder)",
  period: "Tanpa Periode Historis",
  notes:
    "Permen ESDM 1/2023 hanya mengatur tarif curah B2B (faktor pengali N maks 1,5), dan Kepmen ESDM 182.K/2023 mengatur batas atas biaya layanan transaksi (maks Rp 25.000 fast, Rp 57.000 ultrafast). Biaya per sesi tidak termasuk dalam kalkulasi biaya energi per kWh bulanan.",
  regulations: [
    {
      label: "Permen ESDM No. 1 Tahun 2023 (Peraturan.go.id)",
      url: "https://peraturan.go.id/id/permen-esdm-no-1-tahun-2023",
    },
    {
      label: "Kepmen ESDM No. 182.K/TL.04/MEM.S/2023 (JDIH ESDM View 2388)",
      url: "https://jdih.esdm.go.id/dokumen/view?id=2388",
    },
  ],
};

/**
 * Contoh Preset Spesifikasi EV untuk Pengujian
 */
export const EV_SAMPLE_PRESETS: EvPreset[] = [
  {
    id: "preset-ev-motor",
    name: "Contoh Motor Listrik Komuter (3,5 kWh/100 km)",
    vehicleType: "Motor",
    consumptionKwh100km: 3.5,
    batteryCapacityKwh: 3.7,
    description: "Estimasi konsumsi motor listrik komuter harian.",
  },
  {
    id: "preset-ev-car-compact",
    name: "Contoh Mobil Listrik Kompak (12,5 kWh/100 km)",
    vehicleType: "Mobil",
    consumptionKwh100km: 12.5,
    batteryCapacityKwh: 26.7,
    description: "Estimasi konsumsi mobil listrik perkotaan segmen A/B.",
  },
  {
    id: "preset-ev-car-medium",
    name: "Contoh Mobil Listrik Menengah (15,0 kWh/100 km)",
    vehicleType: "Mobil",
    consumptionKwh100km: 15.0,
    batteryCapacityKwh: 58.0,
    description: "Estimasi konsumsi crossover / sedan listrik segmen C.",
  },
];

