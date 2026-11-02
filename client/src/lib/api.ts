import type {
  AdminAnalyticsDto,
  AdminPartnerVerificationDto,
  BootstrapDataDto,
  EnergyTariffDto,
  EnergyTariffHistoryDto,
  EvIncentiveDto,
  EvModelDto,
  FacilityDto,
  PartnerDashboardDto,
  PartnerDocumentDto,
  SavedSimulationDto,
  SimulationInput,
  UserDto,
  VehicleType,
} from '@mobilitiq/shared';

const GUEST_TOKEN_KEY = 'mobilitiq_guest_token';

export function getGuestSessionToken(): string {
  let token = localStorage.getItem(GUEST_TOKEN_KEY);
  if (!token) {
    token =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? `guest-${crypto.randomUUID()}`
        : `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(GUEST_TOKEN_KEY, token);
  }
  return token;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('x-guest-session', getGuestSessionToken());
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(path, {
    ...init,
    headers,
    credentials: 'include',
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const errMsg =
      (data && typeof data.error === 'string' && data.error) ||
      `Permintaan gagal (${res.status})`;
    throw new Error(errMsg);
  }
  return data as T;
}

export const api = {
  getBootstrap: () => request<BootstrapDataDto>('/api/v1/reference/bootstrap'),

  getMe: () => request<{ user: UserDto | null }>('/api/v1/auth/me'),
  login: (payload: { email: string; password: string }) =>
    request<{ user: UserDto }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  register: (payload: {
    fullName: string;
    email: string;
    password: string;
    accountType: 'USER' | 'MITRA';
    cityId?: string | null;
    homePowerVa?: number;
    companyName?: string;
    partnerCategory?: string;
    completedDocTypes?: string[];
  }) =>
    request<{ user: UserDto }>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  googleSimLogin: (payload?: { email?: string; fullName?: string }) =>
    request<{ user: UserDto }>('/api/v1/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload ?? {}),
    }),
  logout: () => request<{ ok: boolean }>('/api/v1/auth/logout', { method: 'POST' }),
  updateProfile: (payload: {
    fullName?: string;
    cityId?: string;
    homePowerVa?: number;
    tariffIncentiveAlert?: boolean;
    monthlyReportReminder?: boolean;
  }) =>
    request<{ user: UserDto }>('/api/v1/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getFacilities: (params: {
    city?: string;
    type?: string;
    q?: string;
    lat?: number;
    lng?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params.city) qs.set('city', params.city);
    if (params.type && params.type !== 'Semua') qs.set('type', params.type);
    if (params.q) qs.set('q', params.q);
    if (params.lat !== undefined) qs.set('lat', String(params.lat));
    if (params.lng !== undefined) qs.set('lng', String(params.lng));
    return request<{
      origin: { lat: number; lng: number; cityName: string };
      items: FacilityDto[];
    }>(`/api/v1/facilities?${qs.toString()}`);
  },

  recordFacilityLead: (facilityId: string, eventType = 'DIRECTIONS_CLICK') =>
    request<{ ok: boolean }>(`/api/v1/facilities/${facilityId}/lead`, {
      method: 'POST',
      body: JSON.stringify({ eventType }),
    }),

  recordEvLead: (evModelId: string, eventType = 'TEST_DRIVE_CLICK') =>
    request<{ ok: boolean }>(`/api/v1/ev-models/${evModelId}/lead`, {
      method: 'POST',
      body: JSON.stringify({ eventType }),
    }),

  recordFunnelEvent: (
    stageName:
      | 'LANDING_VISIT'
      | 'CHATBOT_START'
      | 'TEASER_VIEW'
      | 'LOGIN_COMPLETE'
      | 'SIMULATION_SAVED'
      | 'PDF_EXPORTED',
    pathway?: 'A' | 'B' | null,
  ) =>
    request<{ ok: boolean }>('/api/v1/events/funnel', {
      method: 'POST',
      body: JSON.stringify({ stageName, pathway }),
    }).catch(() => ({ ok: false })),

  createConsultation: (payload: {
    pathway: 'A' | 'B';
    vehicleType: VehicleType;
    budgetIdr: number;
    answersPayload: Record<string, unknown>;
    recommendedEvId?: string | null;
  }) =>
    request<{ consultationSessionId: string; recommendedEv: EvModelDto | null }>(
      '/api/v1/consultations',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    ),

  listSimulations: () => request<{ items: SavedSimulationDto[] }>('/api/v1/simulations'),
  saveSimulation: (
    input: SimulationInput & { consultationSessionId?: string | null },
  ) =>
    request<{ simulation: SavedSimulationDto }>('/api/v1/simulations', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  getSharedSimulation: (shareToken: string) =>
    request<{
      simulation: SavedSimulationDto;
      authorName: string;
      cityName: string;
    }>(`/api/v1/simulations/share/${encodeURIComponent(shareToken)}`),
  deleteSimulation: (id: string) =>
    request<{ ok: boolean }>(`/api/v1/simulations/${id}`, { method: 'DELETE' }),

  getPartnerDashboard: () => request<PartnerDashboardDto>('/api/v1/partner/dashboard'),
  updatePartnerDocuments: (payload: {
    documents: { docType: string; fileUrl: string | null; isComplete: boolean }[];
    resubmit?: boolean;
  }) =>
    request<{ documents: PartnerDocumentDto[] }>('/api/v1/partner/documents', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  listPartnerEvModels: () => request<{ items: EvModelDto[] }>('/api/v1/partner/ev-models'),
  createPartnerEvModel: (payload: Omit<EvModelDto, 'id' | 'partnerId' | 'partnerName' | 'slug' | 'annualPkbTaxIdr' | 'replacementBatteryPriceIdr'>) =>
    request<{ item: EvModelDto }>('/api/v1/partner/ev-models', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updatePartnerEvModel: (
    id: string,
    payload: Omit<EvModelDto, 'id' | 'partnerId' | 'partnerName' | 'slug' | 'annualPkbTaxIdr' | 'replacementBatteryPriceIdr'>,
  ) =>
    request<{ item: EvModelDto }>(`/api/v1/partner/ev-models/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  togglePartnerEvModelActive: (id: string, isActive: boolean) =>
    request<{ item: EvModelDto }>(`/api/v1/partner/ev-models/${id}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),
  deletePartnerEvModel: (id: string) =>
    request<{ ok: boolean }>(`/api/v1/partner/ev-models/${id}`, { method: 'DELETE' }),

  listPartnerFacilities: () =>
    request<{ items: FacilityDto[] }>('/api/v1/partner/facilities'),
  createPartnerFacility: (payload: {
    cityId: string;
    facilityName: string;
    facilityType: 'SPKLU' | 'SPBKLU' | 'Showroom';
    fullAddress: string;
    latitude: number;
    longitude: number;
    powerOrSlotSpec: string;
    operatingHours: string;
    serviceTariffIdr: number;
    tariffUnitLabel: string;
    isActive: boolean;
  }) =>
    request<{ item: FacilityDto }>('/api/v1/partner/facilities', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updatePartnerFacility: (
    id: string,
    payload: {
      cityId: string;
      facilityName: string;
      facilityType: 'SPKLU' | 'SPBKLU' | 'Showroom';
      fullAddress: string;
      latitude: number;
      longitude: number;
      powerOrSlotSpec: string;
      operatingHours: string;
      serviceTariffIdr: number;
      tariffUnitLabel: string;
      isActive: boolean;
    },
  ) =>
    request<{ item: FacilityDto }>(`/api/v1/partner/facilities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deletePartnerFacility: (id: string) =>
    request<{ ok: boolean }>(`/api/v1/partner/facilities/${id}`, { method: 'DELETE' }),

  savePartnerServicePricing: (payload: {
    facilityRates?: { facilityId: string; serviceTariffIdr: number }[];
    batteryPrices?: { evModelId: string; replacementPriceIdr: number; warrantyNote: string }[];
  }) =>
    request<{ ok: boolean; updatedAt: string }>('/api/v1/partner/service-pricing', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getAdminAnalytics: () => request<AdminAnalyticsDto>('/api/v1/admin/analytics'),
  listAdminEnergyTariffs: () =>
    request<{ items: EnergyTariffDto[] }>('/api/v1/admin/energy-tariffs'),
  listAdminTariffHistories: () =>
    request<{ items: EnergyTariffHistoryDto[] }>('/api/v1/admin/energy-tariffs/histories'),
  updateAdminEnergyTariff: (
    id: string,
    payload: {
      pricePerUnitIdr: number;
      upgradeFeeIdr?: number | null;
      subsidyType?: string;
      isActive?: boolean;
    },
  ) =>
    request<{ item: EnergyTariffDto }>(`/api/v1/admin/energy-tariffs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  listAdminIncentives: () =>
    request<{ items: EvIncentiveDto[] }>('/api/v1/admin/incentives'),
  createAdminIncentive: (payload: {
    code: string;
    policyName: string;
    applicableVehicleType: 'Mobil' | 'Motor' | 'Semua EV';
    calculationType: 'percentage' | 'fixed_idr' | 'tax_exemption';
    benefitValue: number;
    benefitDisplayText: string;
    legalBasis: string;
    isActive: boolean;
  }) =>
    request<{ item: EvIncentiveDto }>('/api/v1/admin/incentives', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  patchAdminIncentive: (
    id: string,
    payload: Partial<{
      policyName: string;
      benefitValue: number;
      benefitDisplayText: string;
      legalBasis: string;
      isActive: boolean;
    }>,
  ) =>
    request<{ item: EvIncentiveDto }>(`/api/v1/admin/incentives/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  listAdminPartners: (status?: string) => {
    const qs = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
    return request<{ items: AdminPartnerVerificationDto[] }>(`/api/v1/admin/partners${qs}`);
  },
  verifyAdminPartner: (
    id: string,
    payload: { decision: 'APPROVED' | 'REJECTED'; rejectionNote?: string | null },
  ) =>
    request<{ item: AdminPartnerVerificationDto }>(`/api/v1/admin/partners/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

