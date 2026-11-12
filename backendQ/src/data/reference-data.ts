export interface EvPreset {
  id: string;
  name: string;
  brand: string;
  vehicleType: "Motor" | "Mobil";
  batteryKwh: number;
  consumptionKwh100km: number;
  description: string;
}

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
  source: string;
  lastUpdated: string;
}

export const FUEL_METADATA = {
  source: "Keputusan Menteri ESDM / Pengumuman Resmi Penyesuaian Harga Pertamina",
  lastUpdated: "1 November 2026",
  isStaticReference: true,
  note: "Data harga bahan bakar bersifat acuan standar regulasi terbaru per November 2026 (bukan scraping real-time).",
};

export const FUEL_PRICE_REFERENCES: FuelPriceReference[] = [
  {
    id: "pertalite",
    name: "Pertalite (RON 90)",
    category: "Bensin",
    pricePerLiter: 10000,
    ronOrCetane: "RON 90",
    source: FUEL_METADATA.source,
    lastUpdated: FUEL_METADATA.lastUpdated,
  },
  {
    id: "pertamax",
    name: "Pertamax (RON 92)",
    category: "Bensin",
    pricePerLiter: 12100,
    ronOrCetane: "RON 92",
    source: FUEL_METADATA.source,
    lastUpdated: FUEL_METADATA.lastUpdated,
  },
  {
    id: "pertamax-turbo",
    name: "Pertamax Turbo (RON 98)",
    category: "Bensin",
    pricePerLiter: 13250,
    ronOrCetane: "RON 98",
    source: FUEL_METADATA.source,
    lastUpdated: FUEL_METADATA.lastUpdated,
  },
  {
    id: "biosolar",
    name: "Biosolar (Subsidi)",
    category: "Diesel",
    pricePerLiter: 6800,
    ronOrCetane: "CN 48",
    source: FUEL_METADATA.source,
    lastUpdated: FUEL_METADATA.lastUpdated,
  },
  {
    id: "dexlite",
    name: "Dexlite (CN 51)",
    category: "Diesel",
    pricePerLiter: 13050,
    ronOrCetane: "CN 51",
    source: FUEL_METADATA.source,
    lastUpdated: FUEL_METADATA.lastUpdated,
  },
  {
    id: "pertamina-dex",
    name: "Pertamina Dex (CN 53)",
    category: "Diesel",
    pricePerLiter: 13400,
    ronOrCetane: "CN 53",
    source: FUEL_METADATA.source,
    lastUpdated: FUEL_METADATA.lastUpdated,
  },
];

export const EV_SAMPLE_PRESETS: EvPreset[] = [
  {
    id: "alva-one",
    name: "Alva One (2,9 kWh/100 km)",
    brand: "Alva",
    vehicleType: "Motor",
    batteryKwh: 2.7,
    consumptionKwh100km: 2.9,
    description: "Skuter listrik perkotaan modern, efisien untuk komuter harian.",
  },
  {
    id: "polytron-fox-r",
    name: "Polytron Fox-R (3,2 kWh/100 km)",
    brand: "Polytron",
    vehicleType: "Motor",
    batteryKwh: 3.75,
    consumptionKwh100km: 3.2,
    description: "Motor listrik bertenaga dengan paket sewa/beli baterai fleksibel.",
  },
  {
    id: "gesits-g1",
    name: "Gesits G1 (3,0 kWh/100 km)",
    brand: "Gesits",
    vehicleType: "Motor",
    batteryKwh: 2.88,
    consumptionKwh100km: 3.0,
    description: "Motor listrik buatan lokal berdaya tahan tinggi.",
  },
  {
    id: "wuling-air-ev",
    name: "Wuling Air EV Lite (11,0 kWh/100 km)",
    brand: "Wuling",
    vehicleType: "Mobil",
    batteryKwh: 17.3,
    consumptionKwh100km: 11.0,
    description: "City car listrik kompak populer, sangat irit dan lincah.",
  },
  {
    id: "hyundai-ioniq-5",
    name: "Hyundai Ioniq 5 Standard (14,5 kWh/100 km)",
    brand: "Hyundai",
    vehicleType: "Mobil",
    batteryKwh: 58.0,
    consumptionKwh100km: 14.5,
    description: "Crossover listrik premium jarak jauh, 14,5 kWh/100 km.",
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

