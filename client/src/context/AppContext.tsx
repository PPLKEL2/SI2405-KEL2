import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'sonner';
import {
  calculateFullSimulation,
  DEFAULT_FINANCE_BATTERY_PARAMS,
  switchEvModelPreservingIce,
  type BootstrapDataDto,
  type EvModelDto,
  type FinanceAndBatteryParams,
  type FullCalculationResult,
  type IceVehiclePresetDto,
  type ReferenceContext,
  type SavedSimulationDto,
  type SimulationInput,
  type UserDto,
} from '@mobilitiq/shared';
import { api } from '@/lib/api';

export type AuthTab = 'login' | 'register_user' | 'register_mitra';

const INITIAL_SIM_INPUT: SimulationInput = {
  pathway: 'A',
  vehicleType: 'Motor',
  icePresetId: null,
  customIceName: 'Honda Vario 125',
  iceKmPerLiter: 45,
  fuelCode: 'PERTALITE',
  dailyDistanceKm: 38,
  budgetIdr: 35_000_000,
  evModelId: 'fox-r',
  homePowerVa: 1300,
  homeChargerKw: 0.4,
  baseLoadKw: 0.45,
  nightChargingEnabled: true,
  homeChargingSharePct: 85,
  solarRooftopEnabled: false,
  extra: { ...DEFAULT_FINANCE_BATTERY_PARAMS },
};

interface AppContextValue {
  bootstrap: BootstrapDataDto | null;
  loadingBootstrap: boolean;
  bootstrapError: string | null;
  reloadBootstrap: () => Promise<void>;

  user: UserDto | null;
  authModalOpen: boolean;
  authInitialTab: AuthTab;
  authRedirectTo: string | null;
  openAuthModal: (tab?: AuthTab, redirectTo?: string | null) => void;
  closeAuthModal: () => void;
  setUserAfterAuth: (u: UserDto) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: {
    fullName?: string;
    cityId?: string;
    homePowerVa?: number;
    tariffIncentiveAlert?: boolean;
    monthlyReportReminder?: boolean;
  }) => Promise<void>;

  simInput: SimulationInput;
  activeReferenceOverride: ReferenceContext | null;
  clearReferenceOverride: () => void;
  calc: FullCalculationResult | null;
  updateSim: (patch: Partial<SimulationInput>) => void;
  updateSimExtra: (patch: Partial<FinanceAndBatteryParams>) => void;
  selectEvModel: (ev: EvModelDto) => void;
  selectIcePreset: (preset: IceVehiclePresetDto) => void;

  compareIds: string[];
  toggleCompareId: (id: string) => void;

  savedSimulations: SavedSimulationDto[];
  loadingSavedSimulations: boolean;
  activeShareToken: string | null;
  refreshSavedSimulations: () => Promise<void>;
  saveCurrentSimulation: (consultationSessionId?: string | null) => Promise<SavedSimulationDto>;
  restoreSavedSimulation: (sim: SavedSimulationDto) => void;
  deleteSavedSimulation: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [bootstrap, setBootstrap] = useState<BootstrapDataDto | null>(null);
  const [loadingBootstrap, setLoadingBootstrap] = useState(true);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  const [user, setUser] = useState<UserDto | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<AuthTab>('login');
  const [authRedirectTo, setAuthRedirectTo] = useState<string | null>(null);

  const [simInput, setSimInput] = useState<SimulationInput>(INITIAL_SIM_INPUT);
  const [activeReferenceOverride, setActiveReferenceOverride] =
    useState<ReferenceContext | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const [savedSimulations, setSavedSimulations] = useState<SavedSimulationDto[]>([]);
  const [loadingSavedSimulations, setLoadingSavedSimulations] = useState(false);
  const [activeShareToken, setActiveShareToken] = useState<string | null>(null);

  const reloadBootstrap = useCallback(async () => {
    setLoadingBootstrap(true);
    setBootstrapError(null);
    try {
      const [boot, me] = await Promise.all([api.getBootstrap(), api.getMe()]);
      setBootstrap(boot);
      setUser(me.user);

      setSimInput((prev) => {
        const matchedEv =
          boot.evModels.find((m) => m.id === prev.evModelId || m.slug === prev.evModelId) ??
          boot.evModels[0];
        const matchedIce =
          boot.icePresets.find(
            (p) => p.id === prev.icePresetId || p.modelName === prev.customIceName,
          ) ?? boot.icePresets[0];
        return {
          ...prev,
          evModelId: matchedEv?.id ?? prev.evModelId,
          icePresetId: matchedIce?.id ?? prev.icePresetId,
          homePowerVa: me.user?.homePowerVa ?? prev.homePowerVa,
        };
      });

      setCompareIds((prev) =>
        prev.length > 0 ? prev : boot.evModels.slice(0, 3).map((m) => m.id),
      );
    } catch (err) {
      setBootstrapError(
        err instanceof Error ? err.message : 'Tidak dapat terhubung ke server MobilitiQ.',
      );
    } finally {
      setLoadingBootstrap(false);
    }
  }, []);

  useEffect(() => {
    void reloadBootstrap();
  }, [reloadBootstrap]);

  const refreshSavedSimulations = useCallback(async () => {
    if (!user) {
      setSavedSimulations([]);
      return;
    }
    setLoadingSavedSimulations(true);
    try {
      const res = await api.listSimulations();
      setSavedSimulations(res.items);
    } catch {
      // ponytail: non-blocking history fetch
    } finally {
      setLoadingSavedSimulations(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshSavedSimulations();
  }, [refreshSavedSimulations]);

  const openAuthModal = useCallback((tab: AuthTab = 'login', redirectTo: string | null = null) => {
    setAuthInitialTab(tab);
    setAuthRedirectTo(redirectTo);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const setUserAfterAuth = useCallback(async (u: UserDto) => {
    setUser(u);
    setSimInput((prev) => ({ ...prev, homePowerVa: u.homePowerVa || prev.homePowerVa }));
    setAuthModalOpen(false);
    void api.recordFunnelEvent('LOGIN_COMPLETE');
    try {
      const res = await api.listSimulations();
      setSavedSimulations(res.items);
    } catch {
      // ignore
    }
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    setSavedSimulations([]);
    toast.success('Anda telah keluar dari akun.');
  }, []);

  const updateProfile = useCallback(
    async (payload: {
      fullName?: string;
      cityId?: string;
      homePowerVa?: number;
      tariffIncentiveAlert?: boolean;
      monthlyReportReminder?: boolean;
    }) => {
      const res = await api.updateProfile(payload);
      setUser(res.user);
      if (payload.homePowerVa !== undefined) {
        setSimInput((prev) => ({ ...prev, homePowerVa: payload.homePowerVa! }));
      }
    },
    [],
  );

  const updateSim = useCallback((patch: Partial<SimulationInput>) => {
    setActiveReferenceOverride(null);
    setActiveShareToken(null);
    setSimInput((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateSimExtra = useCallback((patch: Partial<FinanceAndBatteryParams>) => {
    setActiveReferenceOverride(null);
    setActiveShareToken(null);
    setSimInput((prev) => ({
      ...prev,
      extra: { ...prev.extra, ...patch },
    }));
  }, []);

  const selectEvModel = useCallback(
    (ev: EvModelDto) => {
      setActiveReferenceOverride(null);
      setActiveShareToken(null);
      setSimInput((prev) =>
        switchEvModelPreservingIce(prev, ev, bootstrap?.icePresets ?? []),
      );
    },
    [bootstrap],
  );

  const selectIcePreset = useCallback((preset: IceVehiclePresetDto) => {
    setActiveReferenceOverride(null);
    setActiveShareToken(null);
    setSimInput((prev) => ({
      ...prev,
      vehicleType: preset.vehicleType,
      icePresetId: preset.id,
      customIceName: preset.modelName,
      iceKmPerLiter: preset.defaultKmPerLiter,
      fuelCode: preset.defaultFuelCode,
    }));
  }, []);

  const toggleCompareId = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.length <= 1 ? prev : prev.filter((x) => x !== id);
      }
      if (prev.length >= 4) {
        toast.info('Maksimal 4 unit kendaraan dapat dibandingkan sekaligus.');
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const saveCurrentSimulation = useCallback(
    async (consultationSessionId?: string | null) => {
      const res = await api.saveSimulation({
        ...simInput,
        consultationSessionId: consultationSessionId ?? null,
      });
      setActiveShareToken(res.simulation.shareToken);
      void api.recordFunnelEvent('SIMULATION_SAVED', simInput.pathway);
      if (user) {
        setSavedSimulations((prev) => [
          res.simulation,
          ...prev.filter((s) => s.id !== res.simulation.id),
        ]);
      }
      return res.simulation;
    },
    [simInput, user],
  );

  const restoreSavedSimulation = useCallback((sim: SavedSimulationDto) => {
    setActiveReferenceOverride(sim.referenceSnapshot);
    setSimInput(sim.inputSnapshot);
    setActiveShareToken(sim.shareToken);
  }, []);

  const clearReferenceOverride = useCallback(() => {
    setActiveReferenceOverride(null);
  }, []);

  const deleteSavedSimulation = useCallback(async (id: string) => {
    await api.deleteSimulation(id);
    setSavedSimulations((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const calc = useMemo<FullCalculationResult | null>(() => {
    const ref: ReferenceContext | null =
      activeReferenceOverride ??
      (bootstrap && bootstrap.evModels.length > 0
        ? {
            evModels: bootstrap.evModels,
            icePresets: bootstrap.icePresets,
            energyTariffs: bootstrap.energyTariffs,
            evIncentives: bootstrap.evIncentives,
            systemParameters: bootstrap.systemParameters,
          }
        : null);
    if (!ref || ref.evModels.length === 0 || ref.icePresets.length === 0) return null;
    return calculateFullSimulation(simInput, ref);
  }, [simInput, bootstrap, activeReferenceOverride]);

  const value = useMemo<AppContextValue>(
    () => ({
      bootstrap,
      loadingBootstrap,
      bootstrapError,
      reloadBootstrap,
      user,
      authModalOpen,
      authInitialTab,
      authRedirectTo,
      openAuthModal,
      closeAuthModal,
      setUserAfterAuth,
      logout,
      updateProfile,
      simInput,
      activeReferenceOverride,
      clearReferenceOverride,
      calc,
      updateSim,
      updateSimExtra,
      selectEvModel,
      selectIcePreset,
      compareIds,
      toggleCompareId,
      savedSimulations,
      loadingSavedSimulations,
      activeShareToken,
      refreshSavedSimulations,
      saveCurrentSimulation,
      restoreSavedSimulation,
      deleteSavedSimulation,
    }),
    [
      bootstrap,
      loadingBootstrap,
      bootstrapError,
      reloadBootstrap,
      user,
      authModalOpen,
      authInitialTab,
      authRedirectTo,
      openAuthModal,
      closeAuthModal,
      setUserAfterAuth,
      logout,
      updateProfile,
      simInput,
      activeReferenceOverride,
      clearReferenceOverride,
      calc,
      updateSim,
      updateSimExtra,
      selectEvModel,
      selectIcePreset,
      compareIds,
      toggleCompareId,
      savedSimulations,
      loadingSavedSimulations,
      activeShareToken,
      refreshSavedSimulations,
      saveCurrentSimulation,
      restoreSavedSimulation,
      deleteSavedSimulation,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp harus digunakan di dalam AppProvider');
  return ctx;
}

