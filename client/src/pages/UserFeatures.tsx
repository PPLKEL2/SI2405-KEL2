import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Clock,
  ExternalLink,
  FolderOpen,
  LocateFixed,
  Printer,
  Save,
  Search,
  Share2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  formatIdr,
  formatMillionIdr,
  formatNumber,
  type FacilityDto,
} from '@mobilitiq/shared';
import { api } from '@/lib/api';
import { formatIndonesianDate } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { PublicLayout, UserLayout } from '@/layouts/Layouts';
import { FacilityMap } from '@/components/map/FacilityMap';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/overlays';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  FilterChip,
  KeyValueRow,
  MetricCard,
  PageHeader,
  SelectInput,
  Skeleton,
  SwitchRow,
  TextInput,
} from '@/components/ui/primitives';

export function InteractiveFacilityMapPage() {
  const { bootstrap, user } = useApp();
  const [searchParams] = useSearchParams();

  const [citySlug, setCitySlug] = useState('jakarta');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'Semua');
  const [query, setQuery] = useState('');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [facilities, setFacilities] = useState<FacilityDto[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-6.2088, 106.8456]);
  const [selected, setSelected] = useState<FacilityDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.cityName && bootstrap?.cities) {
      const matched = bootstrap.cities.find(
        (c) => c.name.toLowerCase() === user.cityName.toLowerCase(),
      );
      if (matched) setCitySlug(matched.slug);
    }
  }, [user?.cityName, bootstrap?.cities]);

  const fetchFacilities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getFacilities({
        city: citySlug,
        type: typeFilter,
        q: query,
        lat: gpsCoords?.lat,
        lng: gpsCoords?.lng,
      });
      setFacilities(res.items);
      setMapCenter([res.origin.lat, res.origin.lng]);
      setSelected((prev) => res.items.find((x) => x.id === prev?.id) ?? res.items[0] ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat peta fasilitas.');
    } finally {
      setLoading(false);
    }
  }, [citySlug, typeFilter, query, gpsCoords]);

  useEffect(() => {
    void fetchFacilities();
  }, [fetchFacilities]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Peramban Anda tidak mendukung fitur geolokasi.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success('Koordinat GPS Anda diterapkan untuk pengurutan jarak terdekat.');
      },
      () => {
        toast.info('Izin lokasi ditolak. Menggunakan titik pusat kota aktif.');
      },
    );
  };

  const handleOpenDirections = (fac: FacilityDto) => {
    const eventType =
      fac.facilityType === 'Showroom' ? 'TEST_DRIVE_CLICK' : 'DIRECTIONS_CLICK';
    void api.recordFacilityLead(fac.id, eventType);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${fac.latitude},${fac.longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const Shell = user ? UserLayout : PublicLayout;

  const content = (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Peta Interaktif GIS · KEL2-71"
        title="Peta Lokasi SPKLU, SPBKLU Tukar Baterai & Showroom EV"
        description="Jelajahi titik pengisian daya publik dan dealer resmi menggunakan peta OpenStreetMap dengan perhitungan jarak Haversine nyata."
        actions={
          <Button size="sm" variant="outline" onClick={handleUseMyLocation}>
            <LocateFixed className="h-4 w-4" />
            <span>Gunakan Lokasi GPS Saya</span>
          </Button>
        }
      />

      <Card className="space-y-4">
        <div className="grid gap-3 @3xl:grid-cols-12">
          <div className="@3xl:col-span-3">
            <Field label="Kota Operasional">
              <SelectInput
                value={citySlug}
                onChange={(e) => {
                  setGpsCoords(null);
                  setCitySlug(e.target.value);
                }}
              >
                {(bootstrap?.cities ?? []).map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </div>

          <div className="@3xl:col-span-5">
            <Field label="Kategori Fasilitas">
              <div className="flex flex-wrap gap-2">
                {['Semua', 'SPKLU', 'SPBKLU', 'Showroom'].map((tp) => (
                  <FilterChip
                    key={tp}
                    active={typeFilter === tp}
                    onClick={() => setTypeFilter(tp)}
                  >
                    {tp}
                  </FilterChip>
                ))}
              </div>
            </Field>
          </div>

          <div className="@3xl:col-span-4">
            <Field label="Cari Nama Lokasi atau Konektor">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-mute" />
                <TextInput
                  className="pl-10"
                  placeholder="Menteng, CCS2, Swap, Wuling..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </Field>
          </div>
        </div>
      </Card>

      {error ? (
        <ErrorState message={error} onRetry={() => void fetchFacilities()} />
      ) : (
        <div className="grid gap-6 @3xl:grid-cols-12">
          <div className="space-y-4 @3xl:col-span-7">
            <FacilityMap
              center={selected ? [selected.latitude, selected.longitude] : mapCenter}
              zoom={selected ? 13 : 12}
              facilities={facilities}
              selectedId={selected?.id}
              onSelectFacility={setSelected}
              heightClassName="h-[460px]"
            />

            {selected && (
              <Card className="flex flex-col justify-between gap-4 border-blue-200 bg-tint/40 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      tone={
                        selected.facilityType === 'SPKLU'
                          ? 'brand'
                          : selected.facilityType === 'SPBKLU'
                            ? 'ok'
                            : 'warn'
                      }
                    >
                      {selected.facilityType}
                    </Badge>
                    <span className="text-xs font-semibold text-mute">
                      {selected.distanceKm} km · ~{selected.travelMinutes} menit berkendara
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-ink">{selected.facilityName}</h3>
                  <p className="text-xs text-mute">{selected.fullAddress}</p>
                  <div className="text-xs font-semibold text-brand">
                    {selected.powerOrSlotSpec} · {selected.tariffDisplay} · Jam operasional{' '}
                    {selected.operatingHours}
                  </div>
                </div>
                <Button onClick={() => handleOpenDirections(selected)}>
                  <ExternalLink className="h-4 w-4" />
                  <span>
                    {selected.facilityType === 'Showroom'
                      ? 'Rute & Test Drive'
                      : 'Petunjuk Arah Maps'}
                  </span>
                </Button>
              </Card>
            )}
          </div>

          <div className="space-y-3 @3xl:col-span-5">
            <div className="flex items-center justify-between text-xs font-bold text-mute">
              <span>Daftar Titik Terdekat ({facilities.length})</span>
              <span>Diurutkan berdasarkan jarak</span>
            </div>

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : facilities.length === 0 ? (
              <EmptyState
                title="Fasilitas Tidak Ditemukan"
                description="Ubah filter kategori atau kata kunci pencarian untuk menampilkan titik fasilitas."
              />
            ) : (
              <div className="max-h-[540px] space-y-2.5 overflow-y-auto pr-1">
                {facilities.map((fac) => {
                  const isSel = selected?.id === fac.id;
                  return (
                    <div
                      key={fac.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelected(fac)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setSelected(fac);
                      }}
                      className={`cursor-pointer rounded-2xl border p-4 transition ${
                        isSel
                          ? 'border-electric bg-tint/50 ring-2 ring-electric/20'
                          : 'border-line bg-white hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge
                              tone={
                                fac.facilityType === 'SPKLU'
                                  ? 'brand'
                                  : fac.facilityType === 'SPBKLU'
                                    ? 'ok'
                                    : 'warn'
                              }
                            >
                              {fac.facilityType}
                            </Badge>
                            <span className="text-xs font-semibold text-brand">
                              {fac.tariffDisplay}
                            </span>
                          </div>
                          <h3 className="mt-1.5 text-sm font-bold text-ink">{fac.facilityName}</h3>
                          <p className="mt-0.5 text-xs text-mute">{fac.fullAddress}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="num text-sm font-extrabold text-ink">
                            {fac.distanceKm} km
                          </div>
                          <div className="text-[11px] text-mute">~{fac.travelMinutes} mnt</div>
                        </div>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2 text-[11px] text-mute">
                        <span>{fac.powerOrSlotSpec}</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {fac.operatingHours}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return user ? (
    <Shell>{content}</Shell>
  ) : (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{content}</div>
    </Shell>
  );
}

export function PdfReportPreviewPage() {
  const { calc, simInput, user, activeShareToken, saveCurrentSimulation } = useApp();
  const [sharing, setSharing] = useState(false);

  if (!calc) {
    return (
      <UserLayout>
        <Skeleton className="h-96" />
      </UserLayout>
    );
  }

  const handlePrint = () => {
    void api.recordFunnelEvent('PDF_EXPORTED', simInput.pathway);
    window.print();
  };

  const handleShareLink = async () => {
    setSharing(true);
    try {
      const token =
        activeShareToken ?? (await saveCurrentSimulation()).shareToken;
      const shareUrl = `${window.location.origin}/laporan/share/${token}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Tautan laporan berhasil disalin ke papan klip.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal membuat tautan berbagi.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="no-print">
          <PageHeader
            eyebrow="Ekspor Dokumen Eksekutif"
            title="Pratinjau Laporan TCO 5 Tahun (Siap Cetak PDF A4)"
            description="Dokumen memuat identitas akun aktif, rincian arus kas 60 bulan, kesiapan kelistrikan rumah, serta catatan kaki tarif resmi yang berlaku."
            actions={
              <>
                <Button variant="outline" disabled={sharing} onClick={() => void handleShareLink()}>
                  <Share2 className="h-4 w-4" />
                  <span>{sharing ? 'Menyiapkan Tautan...' : 'Salin Tautan Laporan'}</span>
                </Button>
                <Button onClick={handlePrint}>
                  <Printer className="h-4 w-4" />
                  <span>Cetak / Unduh PDF A4</span>
                </Button>
              </>
            }
          />
        </div>

        <Card className="print-a4-sheet mx-auto max-w-4xl space-y-6 p-8 shadow-md">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-electric">
                MobilitiQ · Laporan Evaluasi Transisi Kendaraan Listrik
              </div>
              <h1 className="mt-1 text-2xl font-extrabold text-ink">
                {calc.ev.brand} {calc.ev.modelName} vs {simInput.customIceName}
              </h1>
              <p className="mt-1 text-xs text-mute">
                Disusun untuk <strong>{user?.fullName ?? 'Pengguna MobilitiQ'}</strong> ·{' '}
                {user?.cityName ?? 'Jakarta'} · Tanggal cetak {formatIndonesianDate()} · Jalur{' '}
                {simInput.pathway}
              </p>
            </div>
            <div className="text-right">
              <Badge tone={calc.tco.isPaybackReached ? 'ok' : 'warn'}>
                Titik Balik Modal: {calc.tco.paybackLabel}
              </Badge>
              <div className="num mt-1 text-xs font-semibold text-mute">
                OTR EV: {formatIdr(calc.ev.otrPriceIdr)}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <MetricCard
              tone={calc.comparison.isNegativeSaving ? 'warn' : 'ok'}
              label="Hemat Operasional"
              value={`${formatIdr(calc.comparison.monthlyOperationalSavingIdr)}/bln`}
            />
            <MetricCard
              tone="brand"
              label="TCO 5 Tahun EV"
              value={formatMillionIdr(calc.tco.evComponents.total5YearsIdr)}
            />
            <MetricCard
              tone="default"
              label="TCO 5 Tahun BBM"
              value={formatMillionIdr(calc.tco.iceComponents.total5YearsIdr)}
            />
            <MetricCard
              tone="ok"
              label="Reduksi CO2 5 Th"
              value={`${formatNumber(calc.emissions.fiveYearReductionCo2Kg)} kg`}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-line p-4">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-mute">
                1. Perbandingan Biaya Operasional Bulanan ({calc.monthlyKm} km/bln)
              </h2>
              <KeyValueRow
                label={`BBM ${simInput.customIceName} (${calc.ice.monthlyLiters} L)`}
                value={formatIdr(calc.ice.monthlyFuelCostIdr)}
              />
              <KeyValueRow
                label="Servis Rutin Kendaraan BBM"
                value={formatIdr(calc.ice.monthlyServiceCostIdr)}
              />
              <KeyValueRow
                label={`Listrik EV (${calc.evEnergy.monthlyKwh} kWh)`}
                value={formatIdr(calc.evEnergy.monthlyElectricityCostIdr)}
              />
              <KeyValueRow
                label="Servis Berkala EV"
                value={formatIdr(calc.evEnergy.monthlyServiceCostIdr)}
              />
              <KeyValueRow
                strong
                label="Selisih Penghematan Bulanan"
                value={formatIdr(calc.comparison.monthlyOperationalSavingIdr)}
              />
            </div>

            <div className="rounded-xl border border-line p-4">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-mute">
                2. Kelistrikan Rumah, Baterai & Kredit
              </h2>
              <KeyValueRow
                label="Golongan Daya Rumah"
                value={`${simInput.homePowerVa.toLocaleString('id-ID')} VA (${calc.plnTariff.displayName})`}
              />
              <KeyValueRow
                label="Beban Puncak Pengisian Rumah"
                value={`${calc.homePower.totalLoadKw} / ${calc.homePower.maxCapacityKw} kW (${calc.homePower.status.toUpperCase()})`}
              />
              <KeyValueRow
                label={`Estimasi SoH Baterai Tahun ke-${simInput.extra.ownershipYears}`}
                value={`${calc.degradation.sohAtOwnershipYear}% (${calc.degradation.effectiveRangeKm} km)`}
              />
              <KeyValueRow
                label="Dana Cadangan Baterai (Sinking Fund)"
                value={`${formatIdr(calc.sinkingFund.monthlyReserveIdr)} / bln`}
              />
              <KeyValueRow
                strong
                label={`Estimasi Cicilan (${simInput.extra.tenorMonths} bln, DP ${simInput.extra.dpPct}%)`}
                value={`${formatIdr(calc.purchase.monthlyInstallmentIdr)} / bln`}
              />
            </div>
          </div>

          <div className="rounded-xl border border-line p-4">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-mute">
              3. Komponen Akumulasi Total Cost of Ownership 60 Bulan
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-line text-mute">
                    <th className="py-2">Komponen Biaya 5 Tahun</th>
                    <th className="py-2 text-right">{simInput.customIceName} (BBM)</th>
                    <th className="py-2 text-right">
                      {calc.ev.brand} {calc.ev.modelName} (EV)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  <tr>
                    <td className="py-2">Akuisisi Bersih (setelah insentif / nilai jual lama)</td>
                    <td className="num py-2 text-right">
                      {formatIdr(calc.tco.iceComponents.acquisitionIdr)}
                    </td>
                    <td className="num py-2 text-right">
                      {formatIdr(calc.tco.evComponents.acquisitionIdr)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">Total Energi 60 Bulan</td>
                    <td className="num py-2 text-right">
                      {formatIdr(calc.tco.iceComponents.energyIdr)}
                    </td>
                    <td className="num py-2 text-right">
                      {formatIdr(calc.tco.evComponents.energyIdr)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">Perawatan & Servis 60 Bulan</td>
                    <td className="num py-2 text-right">
                      {formatIdr(calc.tco.iceComponents.maintenanceIdr)}
                    </td>
                    <td className="num py-2 text-right">
                      {formatIdr(calc.tco.evComponents.maintenanceIdr)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">Pajak Kendaraan 5 Tahun</td>
                    <td className="num py-2 text-right">
                      {formatIdr(calc.tco.iceComponents.taxIdr)}
                    </td>
                    <td className="num py-2 text-right">
                      {formatIdr(calc.tco.evComponents.taxIdr)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">Akumulasi Dana Cadangan Baterai</td>
                    <td className="num py-2 text-right">Rp 0</td>
                    <td className="num py-2 text-right">
                      {formatIdr(calc.tco.evComponents.batteryReserveIdr)}
                    </td>
                  </tr>
                  <tr className="font-extrabold text-ink">
                    <td className="py-2.5">Total TCO 5 Tahun</td>
                    <td className="num py-2.5 text-right">
                      {formatIdr(calc.tco.iceComponents.total5YearsIdr)}
                    </td>
                    <td className="num py-2.5 text-right text-brand">
                      {formatIdr(calc.tco.evComponents.total5YearsIdr)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 text-[11px] leading-relaxed text-mute">
            <strong>Catatan Metodologi & Parameter Tarif Resmi ({formatIndonesianDate()}):</strong>{' '}
            Perhitungan menggunakan tarif {calc.fuelTariff.displayName}{' '}
            {formatIdr(calc.fuelTariff.pricePerUnitIdr)}/liter, tarif listrik rumah tangga PLN{' '}
            {calc.plnTariff.displayName} Rp {formatNumber(calc.plnTariff.pricePerUnitIdr, 2)}/kWh,
            tarif acuan pengisian SPKLU publik {formatIdr(calc.spkluTariff.pricePerUnitIdr)}/kWh
            (porsi pengisian rumah {simInput.homeChargingSharePct}%), faktor daya efektif MCB cos
            phi = 0,85, efisiensi charger AC 90%, serta garansi baterai pabrikan{' '}
            {calc.ev.warrantyLabel}.
          </div>
        </Card>
      </div>
    </UserLayout>
  );
}

export function HistoryAndProfilePage() {
  const {
    bootstrap,
    user,
    savedSimulations,
    loadingSavedSimulations,
    restoreSavedSimulation,
    deleteSavedSimulation,
    updateProfile,
  } = useApp();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [cityId, setCityId] = useState(user?.cityId ?? '');
  const [homePowerVa, setHomePowerVa] = useState(user?.homePowerVa ?? 1300);
  const [tariffAlert, setTariffAlert] = useState(user?.tariffIncentiveAlert ?? true);
  const [monthlyReminder, setMonthlyReminder] = useState(user?.monthlyReportReminder ?? false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setCityId(user.cityId ?? bootstrap?.cities[0]?.id ?? '');
      setHomePowerVa(user.homePowerVa);
      setTariffAlert(user.tariffIncentiveAlert);
      setMonthlyReminder(user.monthlyReportReminder);
    }
  }, [user, bootstrap?.cities]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        fullName,
        cityId: cityId || undefined,
        homePowerVa,
        tariffIncentiveAlert: tariffAlert,
        monthlyReportReminder: monthlyReminder,
      });
      toast.success('Profil dan preferensi akun berhasil diperbarui.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui profil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteSavedSimulation(deleteTargetId);
      toast.success('Riwayat simulasi berhasil dihapus.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus riwayat.');
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Akun Pengguna"
          title="Riwayat Simulasi Tersimpan & Pengaturan Profil"
          description="Pulihkan snapshot perhitungan TCO masa lalu secara utuh atau sesuaikan profil kelistrikan rumah default Anda."
        />

        <div className="grid gap-6 @3xl:grid-cols-12">
          <div className="space-y-4 @3xl:col-span-7">
            <h2 className="text-base font-extrabold text-ink">
              Riwayat Simulasi Tersimpan ({savedSimulations.length})
            </h2>

            {loadingSavedSimulations ? (
              <div className="space-y-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
              </div>
            ) : savedSimulations.length === 0 ? (
              <EmptyState
                title="Belum Ada Simulasi Tersimpan"
                description="Jalankan konsultasi atau klik tombol Simpan Simulasi di dashboard TCO untuk menyimpan skenario perbandingan Anda."
                action={
                  <Button size="sm" onClick={() => navigate('/dashboard')}>
                    Buka Simulator TCO
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {savedSimulations.map((sim) => (
                  <Card key={sim.id} className="space-y-3 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone="brand">Jalur {sim.pathway}</Badge>
                          <Badge tone="neutral">{sim.vehicleType}</Badge>
                          <span className="text-xs text-mute">
                            {formatIndonesianDate(sim.createdAt)}
                          </span>
                        </div>
                        <h3 className="mt-1.5 text-base font-extrabold text-ink">
                          {sim.evBrandModel} vs {sim.customIceName}
                        </h3>
                        <p className="text-xs text-mute">
                          {sim.dailyDistanceKm} km/hari · Hemat{' '}
                          <strong className="num text-ok-ink">
                            {formatIdr(sim.monthlySavingIdr)}/bln
                          </strong>{' '}
                          · Payback <strong className="num text-ink">{sim.paybackLabel}</strong>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] font-semibold text-mute">TCO 5 Tahun EV</div>
                        <div className="num text-sm font-extrabold text-brand">
                          {formatMillionIdr(sim.tco5YearEvIdr)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          restoreSavedSimulation(sim);
                          toast.success('Snapshot simulasi dipulihkan ke simulator.');
                          navigate('/dashboard');
                        }}
                      >
                        <FolderOpen className="h-3.5 w-3.5" />
                        <span>Buka di Simulator</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/laporan/share/${sim.shareToken}`)}
                      >
                        Lihat Laporan
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTargetId(sim.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-bad" />
                        <span className="text-bad">Hapus</span>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="@3xl:col-span-5">
            <Card>
              <h2 className="mb-4 text-base font-extrabold text-ink">Profil & Preferensi</h2>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <Field label="Nama Lengkap">
                  <TextInput
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </Field>

                <Field label="Email Terdaftar">
                  <TextInput value={user?.email ?? ''} disabled className="bg-slate-50 text-mute" />
                </Field>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Kota Domisili">
                    <SelectInput value={cityId} onChange={(e) => setCityId(e.target.value)}>
                      {(bootstrap?.cities ?? []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </SelectInput>
                  </Field>

                  <Field label="Daya Rumah Default">
                    <SelectInput
                      value={homePowerVa}
                      onChange={(e) => setHomePowerVa(Number(e.target.value))}
                    >
                      <option value={450}>450 VA</option>
                      <option value={900}>900 VA</option>
                      <option value={1300}>1.300 VA</option>
                      <option value={2200}>2.200 VA</option>
                      <option value={3500}>3.500 VA</option>
                      <option value={5500}>5.500 VA</option>
                    </SelectInput>
                  </Field>
                </div>

                <SwitchRow
                  label="Notifikasi Perubahan Tarif & Insentif EV"
                  description="Kabari saat tarif BBM, PLN, atau kuota subsidi diperbarui"
                  checked={tariffAlert}
                  onCheckedChange={setTariffAlert}
                />

                <SwitchRow
                  label="Pengingat Evaluasi TCO Bulanan"
                  description="Ringkasan pembaruan penghematan berkala"
                  checked={monthlyReminder}
                  onCheckedChange={setMonthlyReminder}
                />

                <Button type="submit" className="w-full" disabled={savingProfile}>
                  <Save className="h-4 w-4" />
                  <span>{savingProfile ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
                </Button>
              </form>
            </Card>
          </div>
        </div>

        <AlertDialog
          open={Boolean(deleteTargetId)}
          onOpenChange={(open) => !open && setDeleteTargetId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Riwayat Simulasi?</AlertDialogTitle>
              <AlertDialogDescription>
                Simulasi yang dihapus tidak dapat dikembalikan dan tautan berbagi publiknya akan
                dinonaktifkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={() => void confirmDelete()}>
                Ya, Hapus Permanen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </UserLayout>
  );
}
