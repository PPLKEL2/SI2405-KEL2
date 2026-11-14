import type { VehicleCategory } from "../types/domain.js";

export interface IceVehiclePreset {
  id: string;
  name: string;
  category: VehicleCategory;
  defaultKmPerLiter: number;
  defaultFuelCode: string;
  annualOilAndFilterIdr: number;
  annualSparkPlugIdr: number;
  annualPeriodicServiceIdr: number;
  annualTiresAndBrakesIdr: number;
  annualStnkTaxIdr: number;
}

export const ICE_VEHICLE_PRESETS: IceVehiclePreset[] = [
  {
    id: "ice-vario-125",
    name: "Honda Vario 125",
    category: "Motor",
    defaultKmPerLiter: 48,
    defaultFuelCode: "BBM_PERTALITE_RON90",
    annualOilAndFilterIdr: 420000,
    annualSparkPlugIdr: 120000,
    annualPeriodicServiceIdr: 480000,
    annualTiresAndBrakesIdr: 360000,
    annualStnkTaxIdr: 350000,
  },
  {
    id: "ice-beat-110",
    name: "Honda BeAT 110",
    category: "Motor",
    defaultKmPerLiter: 55,
    defaultFuelCode: "BBM_PERTALITE_RON90",
    annualOilAndFilterIdr: 360000,
    annualSparkPlugIdr: 100000,
    annualPeriodicServiceIdr: 400000,
    annualTiresAndBrakesIdr: 300000,
    annualStnkTaxIdr: 280000,
  },
  {
    id: "ice-nmax-155",
    name: "Yamaha NMAX 155",
    category: "Motor",
    defaultKmPerLiter: 40,
    defaultFuelCode: "BBM_PERTAMAX_RON92",
    annualOilAndFilterIdr: 540000,
    annualSparkPlugIdr: 150000,
    annualPeriodicServiceIdr: 600000,
    annualTiresAndBrakesIdr: 480000,
    annualStnkTaxIdr: 480000,
  },
  {
    id: "ice-avanza-15",
    name: "Toyota Avanza 1.5 G",
    category: "Mobil",
    defaultKmPerLiter: 13.5,
    defaultFuelCode: "BBM_PERTALITE_RON90",
    annualOilAndFilterIdr: 1400000,
    annualSparkPlugIdr: 450000,
    annualPeriodicServiceIdr: 1850000,
    annualTiresAndBrakesIdr: 1300000,
    annualStnkTaxIdr: 3400000,
  },
  {
    id: "ice-brio-12",
    name: "Honda Brio Satya 1.2",
    category: "Mobil",
    defaultKmPerLiter: 16.5,
    defaultFuelCode: "BBM_PERTALITE_RON90",
    annualOilAndFilterIdr: 1200000,
    annualSparkPlugIdr: 400000,
    annualPeriodicServiceIdr: 1500000,
    annualTiresAndBrakesIdr: 1100000,
    annualStnkTaxIdr: 2600000,
  },
  {
    id: "ice-innova-20",
    name: "Toyota Kijang Innova 2.0",
    category: "Mobil",
    defaultKmPerLiter: 10.5,
    defaultFuelCode: "BBM_PERTAMAX_RON92",
    annualOilAndFilterIdr: 1850000,
    annualSparkPlugIdr: 600000,
    annualPeriodicServiceIdr: 2400000,
    annualTiresAndBrakesIdr: 1750000,
    annualStnkTaxIdr: 4800000,
  },
];

export interface OriginLocationPreset {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface EvMaintenancePreset {
  id: string;
  name: string;
  category: VehicleCategory;
  annualPeriodicServiceIdr: number;
  annualTiresAndBrakesIdr: number;
  annualBatteryInspectionIdr: number;
  annualStnkTaxIdr: number;
}

export const EV_MAINTENANCE_PRESETS: EvMaintenancePreset[] = [
  {
    id: "ev-maint-motor-default",
    name: "Motor Listrik (Preset Estimasi: Fox-R / Cervo)",
    category: "Motor",
    annualPeriodicServiceIdr: 150000,
    annualTiresAndBrakesIdr: 200000,
    annualBatteryInspectionIdr: 100000,
    annualStnkTaxIdr: 50000,
  },
  {
    id: "ev-maint-mobil-default",
    name: "Mobil Listrik (Preset Estimasi: Air EV / Ioniq 5)",
    category: "Mobil",
    annualPeriodicServiceIdr: 650000,
    annualTiresAndBrakesIdr: 850000,
    annualBatteryInspectionIdr: 350000,
    annualStnkTaxIdr: 450000,
  },
];

export const ORIGIN_LOCATION_PRESETS: OriginLocationPreset[] = [
  {
    id: "orig-jkt-bundaran-hi",
    name: "Bundaran HI, Jakarta Pusat",
    city: "Jakarta",
    latitude: -6.1944,
    longitude: 106.8229,
  },
  {
    id: "orig-jkt-blok-m",
    name: "Terminal Blok M, Jakarta Selatan",
    city: "Jakarta",
    latitude: -6.2442,
    longitude: 106.8006,
  },
  {
    id: "orig-bdg-gedung-sate",
    name: "Gedung Sate, Bandung",
    city: "Bandung",
    latitude: -6.9025,
    longitude: 107.6188,
  },
  {
    id: "orig-sby-tunjungan",
    name: "Tunjungan Plaza, Surabaya",
    city: "Surabaya",
    latitude: -7.2625,
    longitude: 112.7389,
  },
];

