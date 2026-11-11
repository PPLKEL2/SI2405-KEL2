/**
 * Data Fasilitas Ekosistem EV (Showroom, SPKLU, SPBKLU) MobilitiQ
 * 
 * Sesuai KEL2-71: Data di bawah merupakan DATA DEMO untuk prototipe akademik.
 * Setiap fasilitas diberi penanda status aktif/tidak aktif dan label "Data demo".
 */

export const FACILITY_CATEGORIES = ["SPKLU", "SPBKLU", "Showroom"] as const;
export type FacilityCategory = (typeof FACILITY_CATEGORIES)[number];

export const CITIES = ["Semua", "Jakarta", "Bandung", "Surabaya"] as const;
export type City = (typeof CITIES)[number];

export interface Facility {
  id: string;
  name: string;
  category: FacilityCategory;
  city: "Jakarta" | "Bandung" | "Surabaya";
  address: string;
  latitude: number;
  longitude: number;
  operationalHours: string;
  contact: string;
  tarif: string;
  power: string;
  isActive: boolean;
  isDemo: true;
}

/**
 * Data demo fasilitas aktif dan tidak aktif di 3 kota utama (Jakarta, Bandung, Surabaya).
 * Label "Data demo" dicantumkan secara transparan untuk prototipe akademik.
 */
export const DEMO_FACILITIES: Facility[] = [
  // JAKARTA
  {
    id: "f1",
    name: "SPKLU PLN UP3 Menteng",
    category: "SPKLU",
    city: "Jakarta",
    address: "Jl. Diponegoro No. 40, Menteng, Jakarta Pusat",
    latitude: -6.1988,
    longitude: 106.8367,
    operationalHours: "24 jam",
    contact: "PLN 123",
    tarif: "Rp 2.466 / kWh",
    power: "DC 50 kW · CCS2",
    isActive: true,
    isDemo: true,
  },
  {
    id: "f2",
    name: "SPKLU Plaza Senayan",
    category: "SPKLU",
    city: "Jakarta",
    address: "Jl. Asia Afrika No. 8, Senayan, Jakarta Pusat",
    latitude: -6.225,
    longitude: 106.799,
    operationalHours: "10.00–22.00",
    contact: "021-5725555",
    tarif: "Rp 2.466 / kWh",
    power: "AC 22 kW · Type 2",
    isActive: true,
    isDemo: true,
  },
  {
    id: "f3",
    name: "SPBKLU Gesits Kuningan",
    category: "SPBKLU",
    city: "Jakarta",
    address: "Jl. HR Rasuna Said Kav. C-22, Kuningan, Jakarta Selatan",
    latitude: -6.2295,
    longitude: 106.831,
    operationalHours: "06.00–23.00",
    contact: "021-5250000",
    tarif: "Rp 12.000 / tukar",
    power: "Swap baterai · 9 slot",
    isActive: true,
    isDemo: true,
  },
  {
    id: "f4",
    name: "SPBKLU Swap Energi Kemang",
    category: "SPBKLU",
    city: "Jakarta",
    address: "Jl. Kemang Raya No. 12, Bangka, Jakarta Selatan",
    latitude: -6.2612,
    longitude: 106.8155,
    operationalHours: "24 jam",
    contact: "0811-9876-5432",
    tarif: "Rp 10.000 / kuota 20 km",
    power: "Swap baterai pintar · 12 slot",
    isActive: true,
    isDemo: true,
  },
  {
    id: "f5",
    name: "Showroom Hyundai Simprug",
    category: "Showroom",
    city: "Jakarta",
    address: "Jl. Teuku Nyak Arief No. 14, Simprug, Jakarta Selatan",
    latitude: -6.234,
    longitude: 106.7865,
    operationalHours: "08.30–19.00",
    contact: "021-72780000",
    tarif: "Test drive gratis",
    power: "Fast charging 50 kW · Konsultasi",
    isActive: true,
    isDemo: true,
  },
  {
    id: "f-inactive-1",
    name: "SPKLU Gambir Transit (Pemeliharaan)",
    category: "SPKLU",
    city: "Jakarta",
    address: "Jl. Medan Merdeka Timur No. 1, Gambir, Jakarta Pusat",
    latitude: -6.1767,
    longitude: 106.8306,
    operationalHours: "Tutup sementara",
    contact: "PLN 123",
    tarif: "Rp 2.466 / kWh",
    power: "DC 25 kW",
    isActive: false, // Tidak aktif (harus disembunyikan sesuai ketentuan KEL2-71)
    isDemo: true,
  },

  // BANDUNG
  {
    id: "b1",
    name: "SPKLU PLN Braga",
    category: "SPKLU",
    city: "Bandung",
    address: "Jl. Braga No. 15, Sumur Bandung, Kota Bandung",
    latitude: -6.9175,
    longitude: 107.6095,
    operationalHours: "24 jam",
    contact: "022-4230000",
    tarif: "Rp 2.466 / kWh",
    power: "Ultra Fast 150 kW · CCS2",
    isActive: true,
    isDemo: true,
  },
  {
    id: "b2",
    name: "SPBKLU Oyika Dago",
    category: "SPBKLU",
    city: "Bandung",
    address: "Jl. Ir. H. Juanda No. 84, Dago, Bandung",
    latitude: -6.892,
    longitude: 107.6145,
    operationalHours: "07.00–22.00",
    contact: "022-2500000",
    tarif: "Rp 15.000 / tukar",
    power: "Swap baterai · 8 slot",
    isActive: true,
    isDemo: true,
  },
  {
    id: "b3",
    name: "Showroom BYD Pasteur",
    category: "Showroom",
    city: "Bandung",
    address: "Jl. Dr. Djunjunan No. 133, Pasteur, Bandung",
    latitude: -6.896,
    longitude: 107.579,
    operationalHours: "09.00–18.00",
    contact: "022-8600000",
    tarif: "Test drive gratis",
    power: "Konsultasi & fast charging",
    isActive: true,
    isDemo: true,
  },

  // SURABAYA
  {
    id: "s1",
    name: "SPKLU PLN Tunjungan",
    category: "SPKLU",
    city: "Surabaya",
    address: "Jl. Tunjungan No. 1, Genteng, Surabaya",
    latitude: -7.258,
    longitude: 112.739,
    operationalHours: "24 jam",
    contact: "PLN 123",
    tarif: "Rp 2.466 / kWh",
    power: "DC 100 kW · CCS2",
    isActive: true,
    isDemo: true,
  },
  {
    id: "s2",
    name: "SPBKLU United Gubeng",
    category: "SPBKLU",
    city: "Surabaya",
    address: "Jl. Raya Gubeng No. 61, Surabaya",
    latitude: -7.272,
    longitude: 112.752,
    operationalHours: "06.00–22.00",
    contact: "031-5030000",
    tarif: "Rp 12.500 / tukar",
    power: "Swap baterai · 6 slot",
    isActive: true,
    isDemo: true,
  },
  {
    id: "s3",
    name: "Showroom Hyundai Mayjen Sungkono",
    category: "Showroom",
    city: "Surabaya",
    address: "Jl. Mayjen Sungkono No. 89, Surabaya",
    latitude: -7.29,
    longitude: 112.707,
    operationalHours: "09.00–19.00",
    contact: "031-5670000",
    tarif: "Test drive gratis",
    power: "Konsultasi & charging station",
    isActive: true,
    isDemo: true,
  },
  {
    id: "s-inactive-1",
    name: "SPBKLU Kertajaya (Tutup Sementara)",
    category: "SPBKLU",
    city: "Surabaya",
    address: "Jl. Kertajaya Indah No. 5, Surabaya",
    latitude: -7.278,
    longitude: 112.775,
    operationalHours: "Tutup sementara",
    contact: "031-5990000",
    tarif: "Rp 12.000 / tukar",
    power: "Swap baterai",
    isActive: false, // Tidak aktif (harus disembunyikan sesuai ketentuan KEL2-71)
    isDemo: true,
  },
];

/**
 * Filter fasilitas: hanya mengembalikan fasilitas berstatus aktif (KEL2-71).
 */
export function getActiveFacilities(): Facility[] {
  return DEMO_FACILITIES.filter((f) => f.isActive);
}

