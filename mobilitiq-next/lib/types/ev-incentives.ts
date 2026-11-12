export type IncentiveCategory = "TAX" | "CUSTOMS" | "INCENTIVE" | "SUBSIDY";

export type IncentiveValueType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface EvIncentivePolicy {
  id: string;
  code: string;
  name: string;
  category: IncentiveCategory;
  valueType: IncentiveValueType;
  value: number;
  calculationBasis: string; // e.g. "dari harga", "pengenaan 0%", "nominal tetap"
  validFrom: string; // ISO date format YYYY-MM-DD
  validTo: string | null; // ISO date format YYYY-MM-DD or null if indefinite
  isActive: boolean;
  description?: string;
  updatedAt: string; // ISO timestamp
  updatedBy: string;
}

export interface EvIncentiveInput {
  id?: string;
  code?: string;
  name: string;
  category: IncentiveCategory;
  valueType: IncentiveValueType;
  value: number | string;
  calculationBasis?: string;
  validFrom: string;
  validTo?: string | null;
  isActive?: boolean;
  description?: string;
  changedBy?: string;
}

export interface IncentiveValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitized?: {
    code: string;
    name: string;
    category: IncentiveCategory;
    valueType: IncentiveValueType;
    value: number;
    calculationBasis: string;
    validFrom: string;
    validTo: string | null;
    isActive: boolean;
    description?: string;
  };
}

