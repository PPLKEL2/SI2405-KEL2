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

export interface IcePreset {
  id: string;
  name: string;
  brand: string;
  vehicleType: "Motor" | "Mobil";
  kmPerLiter: number;
  defaultFuelId: string;
  description: string;
}

export interface FuelPriceReference {
  id: string;
  name: string;
  category: "Bensin" | "Diesel";
  pricePerLiter: number;
  ronOrCetane: string;
}

export const FUEL_METADATA = {
  source: "Keputusan Menteri ESDM / Pengumuman Resmi Penyesuaian Harga Pertamina",
  lastUpdated: "1 November 2026",
  isStaticReference: true,
  note: "Data harga bahan bakar bersifat acuan standar regulasi terbaru per 1 November 2026 (bukan scraping real-time).",
};

export const FUEL_PRICE_REFERENCES: FuelPriceReference[] = [
  {
    id: "pertalite",
    name: "Pertalite (RON 90)",
    category: "Bensin",
    pricePerLiter: 10000,
    ronOrCetane: "RON 90",
  },
  {
    id: "pertamax",
    name: "Pertamax (RON 92)",
    category: "Bensin",
    pricePerLiter: 12100,
    ronOrCetane: "RON 92",
  },
  {
    id: "pertamax-turbo",
    name: "Pertamax Turbo (RON 98)",
    category: "Bensin",
    pricePerLiter: 13250,
    ronOrCetane: "RON 98",
  },
  {
    id: "biosolar",
    name: "Biosolar (Subsidi)",
    category: "Diesel",
    pricePerLiter: 6800,
    ronOrCetane: "CN 48",
  },
  {
    id: "dexlite",
    name: "Dexlite (CN 51)",
    category: "Diesel",
    pricePerLiter: 13050,
    ronOrCetane: "CN 51",
  },
  {
    id: "pertamina-dex",
    name: "Pertamina Dex (CN 53)",
    category: "Diesel",
    pricePerLiter: 13400,
    ronOrCetane: "CN 53",
  },
];

export const ICE_SAMPLE_PRESETS: IcePreset[] = [
  {
    id: "vario-125",
    name: "Honda Vario 125",
    brand: "Honda",
    vehicleType: "Motor",
    kmPerLiter: 48,
    defaultFuelId: "pertalite",
    description: "Skuter matik harian populer, 48 km/liter",
  },
  {
    id: "nmax-155",
    name: "Yamaha NMAX 155",
    brand: "Yamaha",
    vehicleType: "Motor",
    kmPerLiter: 40,
    defaultFuelId: "pertamax",
    description: "Maxi skuter komuter, 40 km/liter",
  },
  {
    id: "beat",
    name: "Honda Beat",
    brand: "Honda",
    vehicleType: "Motor",
    kmPerLiter: 60,
    defaultFuelId: "pertalite",
    description: "Skuter matik kompak super hemat, 60 km/liter",
  },
  {
    id: "avanza",
    name: "Toyota Avanza 1.5",
    brand: "Toyota",
    vehicleType: "Mobil",
    kmPerLiter: 13,
    defaultFuelId: "pertalite",
    description: "MPV keluarga 7-seater, 13 km/liter",
  },
  {
    id: "brio",
    name: "Honda Brio",
    brand: "Honda",
    vehicleType: "Mobil",
    kmPerLiter: 15,
    defaultFuelId: "pertalite",
    description: "City car hatchback hemat, 15 km/liter",
  },
  {
    id: "xpander",
    name: "Mitsubishi Xpander",
    brand: "Mitsubishi",
    vehicleType: "Mobil",
    kmPerLiter: 12,
    defaultFuelId: "pertamax",
    description: "Crossover MPV modern, 12 km/liter",
  },
];
