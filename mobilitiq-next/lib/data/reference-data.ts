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
  brand: string;
  vehicleType: "Motor" | "Mobil";
  consumptionKwh100km: number;
  batteryCapacityKwh: number;
  priceIdr: number;
  rangeKm: number;
  iceName: string;
  iceKmL: number;
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
 * Nilai ini diambil dari nilai percontohan antarmuka MobilitiQ.
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
 * Katalog Preset Kendaraan Listrik (Persis Data Figma Prototype)
 */
export const EV_SAMPLE_PRESETS: EvPreset[] = [
  {
    id: "fox-r",
    brand: "Polytron",
    name: "Polytron Fox-R",
    vehicleType: "Motor",
    consumptionKwh100km: 3.2,
    batteryCapacityKwh: 2.4,
    priceIdr: 23900000,
    rangeKm: 85,
    iceName: "Honda Vario 125",
    iceKmL: 48,
    description: "Motor listrik komuter perkotaan, 3,2 kWh/100 km.",
  },
  {
    id: "g1",
    brand: "Gesits",
    name: "Gesits G1",
    vehicleType: "Motor",
    consumptionKwh100km: 3.4,
    batteryCapacityKwh: 1.8,
    priceIdr: 29900000,
    rangeKm: 70,
    iceName: "Honda Vario 125",
    iceKmL: 48,
    description: "Motor listrik lokal dengan swap baterai, 3,4 kWh/100 km.",
  },
  {
    id: "t1800",
    brand: "United",
    name: "United T1800",
    vehicleType: "Motor",
    consumptionKwh100km: 3.5,
    batteryCapacityKwh: 3.0,
    priceIdr: 33500000,
    rangeKm: 100,
    iceName: "Yamaha NMAX 155",
    iceKmL: 40,
    description: "Maxi scooter listrik, 3,5 kWh/100 km.",
  },
  {
    id: "em1",
    brand: "Honda",
    name: "Honda EM1 e:",
    vehicleType: "Motor",
    consumptionKwh100km: 3.1,
    batteryCapacityKwh: 1.5,
    priceIdr: 40000000,
    rangeKm: 48,
    iceName: "Honda Vario 160",
    iceKmL: 45,
    description: "Motor listrik ringkas dengan Honda Mobile Power Pack.",
  },
  {
    id: "alva",
    brand: "Alva",
    name: "Alva One",
    vehicleType: "Motor",
    consumptionKwh100km: 2.9,
    batteryCapacityKwh: 3.4,
    priceIdr: 36800000,
    rangeKm: 120,
    iceName: "Yamaha NMAX 155",
    iceKmL: 40,
    description: "Skuter listrik performa tinggi dengan fitur IoT.",
  },
  {
    id: "seagull",
    brand: "BYD",
    name: "BYD Seagull",
    vehicleType: "Mobil",
    consumptionKwh100km: 11.5,
    batteryCapacityKwh: 38.9,
    priceIdr: 150000000,
    rangeKm: 305,
    iceName: "Toyota Avanza",
    iceKmL: 13,
    description: "Hatchback listrik efisien, 11,5 kWh/100 km.",
  },
  {
    id: "air-ev",
    brand: "Wuling",
    name: "Wuling Air ev Long Range",
    vehicleType: "Mobil",
    consumptionKwh100km: 10.5,
    batteryCapacityKwh: 26.7,
    priceIdr: 275000000,
    rangeKm: 300,
    iceName: "Honda Brio",
    iceKmL: 15,
    description: "City car listrik kompak populer, 10,5 kWh/100 km.",
  },
  {
    id: "e-c3",
    brand: "Citroën",
    name: "Citroën ë-C3",
    vehicleType: "Mobil",
    consumptionKwh100km: 12.0,
    batteryCapacityKwh: 29.2,
    priceIdr: 377000000,
    rangeKm: 320,
    iceName: "Toyota Avanza",
    iceKmL: 13,
    description: "Crossover listrik nyaman, 12,0 kWh/100 km.",
  },
  {
    id: "ioniq-5",
    brand: "Hyundai",
    name: "Hyundai Ioniq 5 Signature",
    vehicleType: "Mobil",
    consumptionKwh100km: 14.5,
    batteryCapacityKwh: 72.6,
    priceIdr: 782000000,
    rangeKm: 451,
    iceName: "Mitsubishi Xpander",
    iceKmL: 12,
    description: "Crossover listrik premium jarak jauh, 14,5 kWh/100 km.",
  },
];
