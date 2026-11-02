import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppProvider } from '@/context/AppContext';
import { TooltipProvider } from '@/components/ui/overlays';
import { AuthModal } from '@/components/auth/AuthModal';
import { ProtectedRoute } from '@/layouts/Layouts';
import {
  ChatbotConsultationPage,
  GuestDashboardPage,
  LandingPage,
  LoginPage,
  QuickWidgetPage,
  SharedReportPage,
  TeaserResultPage,
} from '@/pages/PublicPages';
import {
  BatteryDegradationPage,
  BatterySinkingFundPage,
  CarbonEmissionPage,
  EvCatalogPage,
  EvComparisonPage,
  EvEnergyCalculatorPage,
  FiveYearTcoPage,
  FuelCalculatorPage,
  HomeChargingPlannerPage,
  InitialPurchaseCalculatorPage,
  RangeSimulatorPage,
  UserSummaryDashboard,
} from '@/pages/UserCalculators';
import {
  HistoryAndProfilePage,
  InteractiveFacilityMapPage,
  PdfReportPreviewPage,
} from '@/pages/UserFeatures';
import {
  MitraCatalogManagementPage,
  MitraDashboardPage,
  MitraFacilitiesManagementPage,
  MitraServicePricingPage,
} from '@/pages/MitraPages';
import {
  SuperadminAnalyticsPage,
  SuperadminEnergyTariffPage,
  SuperadminIncentivePage,
  SuperadminPartnerVerificationPage,
} from '@/pages/AdminPages';
import { DesignSystemPage, NotFoundPage } from '@/pages/SystemPages';

const ALL_AUTH_ROLES: ('USER' | 'MITRA' | 'SUPERADMIN')[] = ['USER', 'MITRA', 'SUPERADMIN'];

export function App() {
  return (
    <TooltipProvider>
      <AppProvider>
        <BrowserRouter>
          <div className="@container min-h-screen bg-canvas text-ink">
            <Routes>
              {/* Frame 01 - 06: Public & Guest Flow */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/konsultasi/mulai" element={<QuickWidgetPage />} />
              <Route path="/konsultasi" element={<ChatbotConsultationPage />} />
              <Route path="/hasil/teaser" element={<TeaserResultPage />} />
              <Route path="/hasil" element={<GuestDashboardPage />} />
              <Route path="/masuk" element={<LoginPage />} />
              <Route path="/laporan/share/:shareToken" element={<SharedReportPage />} />

              {/* Publicly Browsable Catalog, Comparison & GIS Map (Frame 10, 11, 19) */}
              <Route path="/katalog" element={<EvCatalogPage />} />
              <Route path="/komparasi" element={<EvComparisonPage />} />
              <Route path="/peta" element={<InteractiveFacilityMapPage />} />

              {/* Frame 07 - 09, 12 - 18, 20 - 21: Authenticated User Simulator & Profile */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={ALL_AUTH_ROLES}>
                    <UserSummaryDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kalkulator/bbm"
                element={
                  <ProtectedRoute allowedRoles={ALL_AUTH_ROLES}>
                    <FuelCalculatorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kalkulator/energi-ev"
                element={
                  <ProtectedRoute allowedRoles={ALL_AUTH_ROLES}>
                    <EvEnergyCalculatorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kalkulator/pembelian"
                element={
                  <ProtectedRoute allowedRoles={ALL_AUTH_ROLES}>
                    <InitialPurchaseCalculatorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kalkulator/degradasi"
                element={
                  <ProtectedRoute allowedRoles={ALL_AUTH_ROLES}>
                    <BatteryDegradationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kalkulator/dana-baterai"
                element={
                  <ProtectedRoute allowedRoles={ALL_AUTH_ROLES}>
                    <BatterySinkingFundPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kalkulator/daya-rumah"
                element={
                  <ProtectedRoute allowedRoles={ALL_AUTH_ROLES}>
                    <HomeChargingPlannerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kalkulator/jarak-tempuh"
                element={
                  <ProtectedRoute allowedRoles={ALL_AUTH_ROLES}>
                    <RangeSimulatorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kalkulator/tco"
                element={
                  <ProtectedRoute allowedRoles={ALL_AUTH_ROLES}>
                    <FiveYearTcoPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kalkulator/emisi"
                element={
                  <ProtectedRoute allowedRoles={ALL_AUTH_ROLES}>
                    <CarbonEmissionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/laporan"
                element={
                  <ProtectedRoute allowedRoles={ALL_AUTH_ROLES}>
                    <PdfReportPreviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profil"
                element={
                  <ProtectedRoute allowedRoles={ALL_AUTH_ROLES}>
                    <HistoryAndProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Frame 22 - 25: Mitra Portal (RBAC: MITRA) */}
              <Route
                path="/mitra"
                element={
                  <ProtectedRoute allowedRoles={['MITRA']}>
                    <MitraDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mitra/katalog"
                element={
                  <ProtectedRoute allowedRoles={['MITRA']}>
                    <MitraCatalogManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mitra/fasilitas"
                element={
                  <ProtectedRoute allowedRoles={['MITRA']}>
                    <MitraFacilitiesManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mitra/harga-layanan"
                element={
                  <ProtectedRoute allowedRoles={['MITRA']}>
                    <MitraServicePricingPage />
                  </ProtectedRoute>
                }
              />

              {/* Frame 26 - 29: Superadmin Portal (RBAC: SUPERADMIN) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                    <SuperadminAnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tarif-energi"
                element={
                  <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                    <SuperadminEnergyTariffPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/insentif"
                element={
                  <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                    <SuperadminIncentivePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/verifikasi-mitra"
                element={
                  <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                    <SuperadminPartnerVerificationPage />
                  </ProtectedRoute>
                }
              />

              {/* Frame 00: Dev-Only Design System */}
              {import.meta.env.DEV && (
                <Route path="/__dev/design-system" element={<DesignSystemPage />} />
              )}

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <AuthModal />
            <Toaster position="top-right" richColors closeButton />
          </div>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  );
}

