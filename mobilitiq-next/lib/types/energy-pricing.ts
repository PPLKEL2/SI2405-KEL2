export type EnergyCategory = "PLN_HOME" | "SPKLU" | "BBM";

export type EnergyUnit = "Rp/kWh" | "Rp/liter" | "Rp/kVA";

export interface EnergyTariff {
  id: string;
  code: string;
  name: string;
  category: EnergyCategory;
  pricePerUnit: number;
  unit: EnergyUnit;
  validFrom: string; // ISO date format YYYY-MM-DD
  validTo: string | null; // ISO date format YYYY-MM-DD or null if currently active indefinitely
  isActive: boolean;
  notes?: string;
  sourceLabel?: string;
  sourceUrl?: string;
  updatedAt: string; // ISO timestamp
  updatedBy: string;
}

export type TariffActionType =
  | "CREATE"
  | "UPDATE_PRICE"
  | "UPDATE_PERIOD"
  | "UPDATE_ALL"
  | "STATUS_CHANGE";

export interface EnergyTariffHistory {
  id: string;
  tariffId: string;
  tariffCode: string;
  tariffName: string;
  category: EnergyCategory;
  action: TariffActionType;
  oldPrice: number | null;
  newPrice: number;
  oldUnit: EnergyUnit | null;
  newUnit: EnergyUnit;
  oldValidFrom: string | null;
  newValidFrom: string;
  oldValidTo: string | null;
  newValidTo: string | null;
  oldIsActive: boolean | null;
  newIsActive: boolean;
  changedBy: string;
  reason: string;
  changedAt: string; // ISO timestamp
}

export interface EnergyTariffInput {
  id?: string;
  code: string;
  name: string;
  category: EnergyCategory;
  pricePerUnit: number | string;
  unit: EnergyUnit | string;
  validFrom: string;
  validTo?: string | null;
  isActive?: boolean;
  notes?: string;
  sourceLabel?: string;
  sourceUrl?: string;
  reason?: string; // Required for edit/audit tracking
  changedBy?: string;
}

export interface TariffValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitized?: {
    code: string;
    name: string;
    category: EnergyCategory;
    pricePerUnit: number;
    unit: EnergyUnit;
    validFrom: string;
    validTo: string | null;
    isActive: boolean;
    notes?: string;
    sourceLabel?: string;
    sourceUrl?: string;
    reason?: string;
  };
}

export interface TariffSnapshotItem {
  tariffId: string;
  tariffCode: string;
  tariffName: string;
  category: EnergyCategory;
  pricePerUnit: number;
  unit: EnergyUnit;
  effectiveDate: string;
}

export interface SimulationTariffSnapshot {
  snapshotId: string;
  simulationDate: string;
  capturedAt: string;
  items: TariffSnapshotItem[];
}

