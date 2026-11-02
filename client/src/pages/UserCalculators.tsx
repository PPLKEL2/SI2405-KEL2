import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookmarkCheck,
  Check,
  FileText,
  MapPin,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  formatIdr,
  formatMillionIdr,
  formatNumber,
  type ChargingHabit,
  type VehicleType,
} from '@mobilitiq/shared';
import { api } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import { CalculatorSplitLayout, UserLayout } from '@/layouts/Layouts';
import { CompareBarChart, LineChart, StackedHorizontalBar } from '@/components/ui/charts';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  FilterChip,
  HomeLoadGauge,
  KeyValueRow,
  MetricCard,
  PageHeader,
  RangeSlider,
  SegmentedTabs,
  SelectInput,
  Skeleton,
  SwitchRow,
  TextInput,
  VehicleThumb,
} from '@/components/ui/primitives';

function GuardCalc({ children }: { children: () => React.ReactNode }) {
  const { calc } = useApp();
  if (!calc) {
    return (
      <UserLayout>
        <div className="grid gap-4 @3xl:grid-cols-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      </UserLayout>
    );
  }
  return <UserLayout>{children()}</UserLayout>;
}

export function UserSummaryDashboard() {
  const {
    calc,
    simInput,
    user,
    openAuthModal,
    saveCurrentSimulation,
    activeReferenceOverride,
    clearReferenceOverride,
  } = useApp();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  return (
    <GuardCalc>
      {() => {
        const c = calc!;
        const monthLabels = Array.from({ length: 61 }, (_, i) =>
          i % 12 === 0 ? `Th ${i / 12}` : '',
        );

        const handleSave = async () => {
          if (!user) {
            openAuthModal('login', '/dashboard');
            return;
          }
          setSaving(true);
          try {
            await saveCurrentSimulation();
            toast.success('Simulasi berhasil disimpan ke riwayat akun Anda.');
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Gagal menyimpan simulasi.');
          } finally {
            setSaving(false);
          }
        };

        return (
          <div className="space-y-6">
            {activeReferenceOverride && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-tint px-4 py-3 text-xs text-brand">
                <span>
                  Anda sedang meninjau <strong>snapshot riwayat simulasi tersimpan</strong> (tarif &
                  harga unit terkunci sesuai tanggal simpan).
                </span>
                <Button size="sm" variant="outline" onClick={clearReferenceOverride}>
                  Gunakan Tarif Terbaru Saat Ini
                </Button>
              </div>
            )}

            <PageHeader
              eyebrow={`Jalur ${simInput.pathway} · ${c.ev.vehicleType}`}
              title={`Dashboard TCO: ${c.ev.brand} ${c.ev.modelName} vs ${simInput.customIceName}`}
              description={`Jarak tempuh ${simInput.dailyDistanceKm} km/hari (${c.monthlyKm} km/bulan) · Daya rumah ${simInput.homePowerVa.toLocaleString('id-ID')} VA (${c.plnTariff.displayName})`}
              actions={
                <>
                  <Button variant="outline" onClick={() => navigate('/katalog')}>
                    Ganti Unit EV
                  </Button>
                  <Button variant="secondary" onClick={() => navigate('/laporan')}>
                    <FileText className="h-4 w-4" />
                    <span>Laporan PDF A4</span>
                  </Button>
                  <Button disabled={saving} onClick={() => void handleSave()}>
                    <BookmarkCheck className="h-4 w-4" />
                    <span>{saving ? 'Menyimpan...' : 'Simpan Simulasi'}</span>
                  </Button>
                </>
              }
            />

            <div className="grid gap-4 sm:grid-cols-2 @3xl:grid-cols-4">
              <MetricCard
                tone={c.comparison.isNegativeSaving ? 'warn' : 'ok'}
                label="Penghematan Operasional"
                value={`${formatIdr(c.comparison.monthlyOperationalSavingIdr)}/bln`}
                subtext={`Hemat ${c.comparison.savingPct}% dari biaya BBM & servis`}
              />
              <MetricCard
                tone={c.tco.isPaybackReached ? 'brand' : 'warn'}
                label="Titik Balik Modal (Payback)"
                value={c.tco.paybackLabel}
                subtext={
                  c.tco.isPaybackReached
                    ? `Tercapai pada bulan ke-${c.tco.paybackMonthIndex}`
                    : 'Belum tercapai dalam 60 bulan'
                }
              />
              <MetricCard
                tone={c.tco.tcoDifferenceIdr >= 0 ? 'ok' : 'warn'}
                label="Selisih TCO 5 Tahun"
                value={formatMillionIdr(c.tco.tcoDifferenceIdr)}
                subtext={`EV ${formatMillionIdr(c.tco.evComponents.total5YearsIdr)} vs BBM ${formatMillionIdr(c.tco.iceComponents.total5YearsIdr)}`}
              />
              <MetricCard
                tone={c.homePower.status === 'aman' ? 'ok' : c.homePower.status === 'ketat' ? 'warn' : 'bad'}
                label="Beban MCB Rumah"
                value={`${c.homePower.totalLoadKw} / ${c.homePower.maxCapacityKw} kW`}
                subtext={`Pengisian penuh ~${c.homePower.fullChargeHours} jam`}
              />
            </div>

            <div className="grid gap-6 @3xl:grid-cols-12">
              <Card className="@3xl:col-span-7">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-ink">
                    Proyeksi Akumulasi Biaya Kepemilikan 60 Bulan
                  </h2>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate('/kalkulator/tco')}
                  >
                    Detail TCO &rarr;
                  </Button>
                </div>
                <LineChart
                  labels={monthLabels}
                  crossoverIndex={c.tco.paybackMonthIndex}
                  formatY={(v) => formatMillionIdr(v)}
                  series={[
                    {
                      name: `BBM (${simInput.customIceName})`,
                      color: '#64748b',
                      values: c.tco.iceCumulative60,
                    },
                    {
                      name: `EV (${c.ev.brand} ${c.ev.modelName})`,
                      color: '#2563eb',
                      values: c.tco.evCumulative60,
                    },
                  ]}
                />
              </Card>

              <Card className="space-y-4 @3xl:col-span-5">
                <h2 className="text-sm font-bold text-ink">
                  Perbandingan Arus Kas Bulanan
                </h2>
                <CompareBarChart
                  items={[
                    {
                      label: 'BBM + Servis Konvensional',
                      value: c.ice.monthlyOperationalIdr,
                      formattedValue: formatIdr(c.ice.monthlyOperationalIdr),
                      color: '#64748b',
                    },
                    {
                      label: 'Listrik + Servis EV',
                      value: c.evEnergy.monthlyOperationalIdr,
                      formattedValue: formatIdr(c.evEnergy.monthlyOperationalIdr),
                      color: '#2563eb',
                    },
                    {
                      label: 'Dana Cadangan Baterai (Sinking Fund)',
                      value: c.sinkingFund.monthlyReserveIdr,
                      formattedValue: formatIdr(c.sinkingFund.monthlyReserveIdr),
                      color: '#10b981',
                    },
                  ]}
                />
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {[
                    { to: '/kalkulator/bbm', label: 'Kalkulator BBM' },
                    { to: '/kalkulator/energi-ev', label: 'Simulator Energi EV' },
                    { to: '/kalkulator/pembelian', label: 'Kredit & Insentif' },
                    { to: '/kalkulator/daya-rumah', label: 'Cek Daya Rumah' },
                  ].map((item) => (
                    <Button
                      key={item.to}
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(item.to)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        );
      }}
    </GuardCalc>
  );
}

export function FuelCalculatorPage() {
  const { bootstrap, calc, simInput, updateSim, selectIcePreset } = useApp();

  return (
    <GuardCalc>
      {() => {
        const c = calc!;
        const fuels = (bootstrap?.energyTariffs ?? []).filter(
          (t) => t.category === 'BBM' && t.isActive,
        );
        const presets = (bootstrap?.icePresets ?? []).filter(
          (p) => p.vehicleType === simInput.vehicleType,
        );

        return (
          <div className="space-y-6">
            <PageHeader
              eyebrow="Modul 01 · KEL2-54 & KEL2-73"
              title="Kalkulator Biaya BBM & Penilai Efisiensi Kendaraan Konvensional"
              description="Hitung konsumsi liter BBM, biaya bahan bakar bulanan/tahunan, serta komponen perawatan oli, servis berkala, ban/rem, dan pajak STNK."
            />

            <CalculatorSplitLayout
              controls={
                <Card className="space-y-4">
                  <Field label="Kategori Kendaraan">
                    <SegmentedTabs<VehicleType>
                      value={simInput.vehicleType}
                      onChange={(vt) => {
                        const p = bootstrap?.icePresets.find((x) => x.vehicleType === vt);
                        if (p) selectIcePreset(p);
                      }}
                      className="w-full"
                      options={[
                        { value: 'Motor', label: 'Motor BBM' },
                        { value: 'Mobil', label: 'Mobil BBM' },
                      ]}
                    />
                  </Field>

                  <Field label="Preset Kendaraan Konvensional">
                    <SelectInput
                      value={simInput.icePresetId ?? ''}
                      onChange={(e) => {
                        const found = presets.find((p) => p.id === e.target.value);
                        if (found) selectIcePreset(found);
                      }}
                    >
                      {presets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.modelName} ({p.defaultKmPerLiter} km/L)
                        </option>
                      ))}
                    </SelectInput>
                  </Field>

                  <Field label="Nama Kendaraan Pembanding">
                    <TextInput
                      value={simInput.customIceName}
                      onChange={(e) => updateSim({ customIceName: e.target.value })}
                    />
                  </Field>

                  <Field label="Jenis BBM (5 Tarif Resmi)">
                    <SelectInput
                      value={simInput.fuelCode}
                      onChange={(e) => updateSim({ fuelCode: e.target.value })}
                    >
                      {fuels.map((f) => (
                        <option key={f.code} value={f.code}>
                          {f.displayName} - {formatIdr(f.pricePerUnitIdr)}/L ({f.subsidyType})
                        </option>
                      ))}
                    </SelectInput>
                  </Field>

                  <RangeSlider
                    label="Efisiensi Konsumsi BBM"
                    min={simInput.vehicleType === 'Motor' ? 18 : 6}
                    max={simInput.vehicleType === 'Motor' ? 75 : 28}
                    step={0.5}
                    value={simInput.iceKmPerLiter}
                    displayValue={`${simInput.iceKmPerLiter} km / liter`}
                    tooltip="Semakin tinggi angka km/liter, semakin irit kendaraan konvensional Anda."
                    onChange={(iceKmPerLiter) => updateSim({ iceKmPerLiter })}
                  />

                  <RangeSlider
                    label="Jarak Tempuh Harian"
                    min={5}
                    max={200}
                    step={1}
                    value={simInput.dailyDistanceKm}
                    displayValue={`${simInput.dailyDistanceKm} km/hari (${c.monthlyKm} km/bln)`}
                    onChange={(dailyDistanceKm) => updateSim({ dailyDistanceKm })}
                  />
                </Card>
              }
              results={
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <MetricCard
                      tone="warn"
                      label="Biaya BBM Bulanan"
                      value={formatIdr(c.ice.monthlyFuelCostIdr)}
                      subtext={`${c.ice.monthlyLiters} liter/bln @ ${formatIdr(c.fuelTariff.pricePerUnitIdr)}`}
                    />
                    <MetricCard
                      tone="default"
                      label="Servis Rutin Bulanan"
                      value={formatIdr(c.ice.monthlyServiceCostIdr)}
                      subtext={`Rp ${formatNumber(c.icePreset.serviceCostPerKmIdr)}/km`}
                    />
                    <MetricCard
                      tone="bad"
                      label="Total Tahunan (+STNK)"
                      value={formatIdr(c.ice.annualTotalIdr)}
                      subtext={`Termasuk STNK ${formatIdr(c.ice.annualStnkTaxIdr)}/th`}
                    />
                  </div>

                  <Card className="space-y-3">
                    <h2 className="text-sm font-bold text-ink">
                      Rincian Biaya Operasional & Perawatan Kendaraan BBM
                    </h2>
                    <KeyValueRow
                      label={`Bahan Bakar (${c.fuelTariff.displayName})`}
                      value={`${formatIdr(c.ice.monthlyFuelCostIdr)} / bln`}
                    />
                    <KeyValueRow
                      label="Penggantian Oli Mesin Rutin"
                      value={`${formatIdr(c.ice.monthlyOilCostIdr)} / bln`}
                    />
                    <KeyValueRow
                      label="Servis Berkala (Filter, Busi, Tune-up)"
                      value={`${formatIdr(c.ice.monthlyPeriodicServiceCostIdr)} / bln`}
                    />
                    <KeyValueRow
                      label="Keausan Ban & Kampas Rem"
                      value={`${formatIdr(c.ice.monthlyTireBrakeCostIdr)} / bln`}
                    />
                    <KeyValueRow
                      label="Pajak Tahunan STNK (Proporsional Bulanan)"
                      value={`${formatIdr(Math.round(c.ice.annualStnkTaxIdr / 12))} / bln`}
                    />
                    <KeyValueRow
                      strong
                      label="Total Pengeluaran Bulanan Kendaraan BBM"
                      value={`${formatIdr(c.ice.monthlyTotalWithTaxIdr)} / bln`}
                    />
                  </Card>
                </>
              }
            />
          </div>
        );
      }}
    </GuardCalc>
  );
}

export function EvEnergyCalculatorPage() {
  const { bootstrap, calc, simInput, updateSim, selectEvModel } = useApp();

  return (
    <GuardCalc>
      {() => {
        const c = calc!;
        const evList = bootstrap?.evModels ?? [];

        return (
          <div className="space-y-6">
            <PageHeader
              eyebrow="Modul 02 · KEL2-67"
              title="Simulator Konsumsi Energi & Biaya Listrik EV"
              description="Simulasikan kebutuhan kWh bulanan berdasarkan efisiensi unit EV, golongan tarif VA rumah tangga PLN, dan porsi pengisian di SPKLU publik."
            />

            <CalculatorSplitLayout
              controls={
                <Card className="space-y-4">
                  <Field label="Unit Kendaraan Listrik">
                    <SelectInput
                      value={c.ev.id}
                      onChange={(e) => {
                        const found = evList.find((m) => m.id === e.target.value);
                        if (found) selectEvModel(found);
                      }}
                    >
                      {evList.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.brand} {m.modelName} ({m.consumptionKwh100km} kWh/100km)
                        </option>
                      ))}
                    </SelectInput>
                  </Field>

                  <Field
                    label="Golongan Daya Rumah PLN"
                    hint={`Tarif aktif: ${c.plnTariff.displayName} (${formatIdr(c.plnTariff.pricePerUnitIdr)}/kWh)`}
                  >
                    <SelectInput
                      value={simInput.homePowerVa}
                      onChange={(e) => updateSim({ homePowerVa: Number(e.target.value) })}
                    >
                      <option value={450}>450 VA (Subsidi - Rp 415/kWh)</option>
                      <option value={900}>900 VA RTM (Non-subsidi - Rp 1.352/kWh)</option>
                      <option value={1300}>1.300 VA (Non-subsidi - Rp 1.444,7/kWh)</option>
                      <option value={2200}>2.200 VA (Non-subsidi - Rp 1.444,7/kWh)</option>
                      <option value={3500}>3.500 - 5.500 VA (Non-subsidi - Rp 1.699,53/kWh)</option>
                    </SelectInput>
                  </Field>

                  <RangeSlider
                    label="Jarak Tempuh Harian"
                    min={5}
                    max={200}
                    step={1}
                    value={simInput.dailyDistanceKm}
                    displayValue={`${simInput.dailyDistanceKm} km/hari (${c.monthlyKm} km/bln)`}
                    onChange={(dailyDistanceKm) => updateSim({ dailyDistanceKm })}
                  />

                  <RangeSlider
                    label="Bauran Pengisian Rumah vs SPKLU Publik"
                    min={0}
                    max={100}
                    step={5}
                    value={simInput.homeChargingSharePct}
                    displayValue={`${simInput.homeChargingSharePct}% Rumah · ${100 - simInput.homeChargingSharePct}% SPKLU`}
                    hint={`Tarif acuan SPKLU publik: ${formatIdr(c.spkluTariff.pricePerUnitIdr)}/kWh`}
                    onChange={(homeChargingSharePct) => updateSim({ homeChargingSharePct })}
                  />
                </Card>
              }
              results={
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <MetricCard
                      tone="brand"
                      label="Biaya Listrik Bulanan"
                      value={formatIdr(c.evEnergy.monthlyElectricityCostIdr)}
                      subtext={`Total ${c.evEnergy.monthlyKwh} kWh/bulan`}
                    />
                    <MetricCard
                      tone="ok"
                      label="Biaya Energi per Km"
                      value={`Rp ${formatNumber(c.evEnergy.costPerKmIdr)} / km`}
                      subtext={`Tarif bauran Rp ${formatNumber(c.evEnergy.blendedTariffPerKwhIdr, 1)}/kWh`}
                    />
                    <MetricCard
                      tone={c.comparison.isNegativeSaving ? 'warn' : 'ok'}
                      label="Selisih vs BBM"
                      value={`${formatIdr(c.comparison.monthlyOperationalSavingIdr)}/bln`}
                      subtext={`Termasuk servis EV ${formatIdr(c.evEnergy.monthlyServiceCostIdr)}/bln`}
                    />
                  </div>

                  <Card className="space-y-4">
                    <h2 className="text-sm font-bold text-ink">
                      Perbandingan Biaya Energi Bulanan (BBM vs Listrik EV)
                    </h2>
                    <CompareBarChart
                      items={[
                        {
                          label: `BBM ${simInput.customIceName}`,
                          sublabel: `${c.ice.monthlyLiters} L`,
                          value: c.ice.monthlyFuelCostIdr,
                          formattedValue: formatIdr(c.ice.monthlyFuelCostIdr),
                          color: '#f59e0b',
                        },
                        {
                          label: `Listrik Rumah (${c.plnTariff.displayName})`,
                          sublabel: `${c.evEnergy.homeKwh} kWh`,
                          value: c.evEnergy.monthlyHomeCostIdr,
                          formattedValue: formatIdr(c.evEnergy.monthlyHomeCostIdr),
                          color: '#2563eb',
                        },
                        {
                          label: 'Pengisian SPKLU Publik',
                          sublabel: `${c.evEnergy.publicKwh} kWh`,
                          value: c.evEnergy.monthlyPublicCostIdr,
                          formattedValue: formatIdr(c.evEnergy.monthlyPublicCostIdr),
                          color: '#10b981',
                        },
                      ]}
                    />
                    <div className="border-t border-line pt-2">
                      <KeyValueRow
                        label="Servis Berkala EV (Filter Kabin, Rem, Fluida)"
                        value={`${formatIdr(c.evEnergy.monthlyServiceCostIdr)} / bln`}
                      />
                      <KeyValueRow
                        strong
                        label="Total Operasional Bulanan EV (Listrik + Servis)"
                        value={`${formatIdr(c.evEnergy.monthlyOperationalIdr)} / bln`}
                      />
                    </div>
                  </Card>
                </>
              }
            />
          </div>
        );
      }}
    </GuardCalc>
  );
}

export function EvCatalogPage() {
  const { bootstrap, calc, selectEvModel, compareIds, toggleCompareId } = useApp();
  const navigate = useNavigate();

  const [typeFilter, setTypeFilter] = useState<'Semua' | VehicleType>('Semua');
  const [query, setQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(850_000_000);
  const [sortBy, setSortBy] = useState<'price_asc' | 'range_desc' | 'eff_asc'>('price_asc');

  const filtered = useMemo(() => {
    const list = (bootstrap?.evModels ?? []).filter((m) => {
      if (typeFilter !== 'Semua' && m.vehicleType !== typeFilter) return false;
      if (m.otrPriceIdr > maxPrice) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (
          !m.brand.toLowerCase().includes(q) &&
          !m.modelName.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'range_desc') return b.wltpRangeKm - a.wltpRangeKm;
      if (sortBy === 'eff_asc') return a.consumptionKwh100km - b.consumptionKwh100km;
      return a.otrPriceIdr - b.otrPriceIdr;
    });
  }, [bootstrap, typeFilter, maxPrice, query, sortBy]);

  return (
    <UserLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Katalog Kendaraan Listrik · KEL2-57"
          title="Eksplorasi Katalog Motor & Mobil Listrik"
          description="Pilih unit untuk langsung disimulasikan pada kalkulator TCO atau tandai hingga 4 unit untuk tabel komparasi berdampingan."
          actions={
            <Button variant="secondary" onClick={() => navigate('/komparasi')}>
              <span>Bandingkan Pilihan ({compareIds.length}/4)</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          }
        />

        <Card className="grid gap-4 @3xl:grid-cols-12">
          <div className="@3xl:col-span-4">
            <Field label="Cari Merek atau Model">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-mute" />
                <TextInput
                  className="pl-10"
                  placeholder="Contoh: Polytron, BYD, Ioniq..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </Field>
          </div>

          <div className="@3xl:col-span-3">
            <Field label="Kategori">
              <SegmentedTabs<'Semua' | VehicleType>
                value={typeFilter}
                onChange={setTypeFilter}
                className="w-full"
                options={[
                  { value: 'Semua', label: 'Semua' },
                  { value: 'Motor', label: 'Motor' },
                  { value: 'Mobil', label: 'Mobil' },
                ]}
              />
            </Field>
          </div>

          <div className="@3xl:col-span-3">
            <RangeSlider
              label="Batas Harga OTR"
              min={25_000_000}
              max={850_000_000}
              step={5_000_000}
              value={maxPrice}
              displayValue={formatMillionIdr(maxPrice)}
              onChange={setMaxPrice}
            />
          </div>

          <div className="@3xl:col-span-2">
            <Field label="Urutkan">
              <SelectInput
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              >
                <option value="price_asc">Harga Terendah</option>
                <option value="range_desc">Jarak Terjauh</option>
                <option value="eff_asc">Paling Efisien</option>
              </SelectInput>
            </Field>
          </div>
        </Card>

        {filtered.length === 0 ? (
          <EmptyState
            title="Tidak Ada Unit EV yang Sesuai Filter"
            description="Longgarkan batas harga OTR atau kata kunci pencarian untuk melihat unit lainnya."
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setTypeFilter('Semua');
                  setQuery('');
                  setMaxPrice(850_000_000);
                }}
              >
                Reset Filter
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 @3xl:grid-cols-3">
            {filtered.map((ev) => {
              const isSelectedSim = calc?.ev.id === ev.id;
              const inCompare = compareIds.includes(ev.id);

              return (
                <Card
                  key={ev.id}
                  className={
                    isSelectedSim
                      ? 'flex flex-col justify-between gap-4 border-electric ring-2 ring-electric/20'
                      : 'flex flex-col justify-between gap-4'
                  }
                >
                  <div className="space-y-3">
                    <VehicleThumb type={ev.vehicleType} brand={ev.brand} />
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <Badge tone="neutral">{ev.vehicleType}</Badge>
                      {ev.promoLabel && <Badge tone="ok">{ev.promoLabel}</Badge>}
                      {isSelectedSim && <Badge tone="brand">Aktif di Simulator</Badge>}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-ink">
                        {ev.brand} {ev.modelName}
                      </h3>
                      <div className="num text-base font-extrabold text-brand">
                        {formatIdr(ev.otrPriceIdr)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                      <div>
                        <span className="text-mute">Baterai</span>
                        <div className="num font-bold text-ink">{ev.batteryKwh} kWh</div>
                      </div>
                      <div>
                        <span className="text-mute">Jarak WLTP</span>
                        <div className="num font-bold text-ink">{ev.wltpRangeKm} km</div>
                      </div>
                      <div>
                        <span className="text-mute">Efisiensi</span>
                        <div className="num font-bold text-ink">
                          {ev.consumptionKwh100km} kWh/100km
                        </div>
                      </div>
                      <div>
                        <span className="text-mute">Charger AC / DC</span>
                        <div className="num font-bold text-ink">
                          {ev.acChargerKw} / {ev.dcChargerKw > 0 ? `${ev.dcChargerKw} kW` : '-'}
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] text-mute">
                      Garansi: <strong className="text-ink">{ev.warrantyLabel}</strong> · Pembanding
                      BBM: {ev.comparableIceName}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      variant={isSelectedSim ? 'secondary' : 'primary'}
                      onClick={() => {
                        selectEvModel(ev);
                        toast.success(`${ev.brand} ${ev.modelName} diterapkan ke simulator.`);
                        navigate('/dashboard');
                      }}
                    >
                      {isSelectedSim ? 'Buka di Simulator' : 'Gunakan di Simulasi'}
                    </Button>
                    <Button
                      size="sm"
                      variant={inCompare ? 'secondary' : 'outline'}
                      onClick={() => toggleCompareId(ev.id)}
                    >
                      {inCompare && <Check className="h-3.5 w-3.5" />}
                      <span>Komparasi</span>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </UserLayout>
  );
}

export function EvComparisonPage() {
  const { bootstrap, calc, simInput, compareIds, toggleCompareId, selectEvModel } = useApp();
  const navigate = useNavigate();

  const comparedModels = useMemo(() => {
    const all = bootstrap?.evModels ?? [];
    const picked = all.filter((m) => compareIds.includes(m.id));
    return picked.length > 0 ? picked : all.slice(0, 3);
  }, [bootstrap, compareIds]);

  const plnRate = calc?.plnTariff.pricePerUnitIdr ?? 1444.7;
  const monthlyKm = simInput.dailyDistanceKm * 30;

  const handleTestDriveLead = async (evId: string, name: string) => {
    try {
      await api.recordEvLead(evId, 'TEST_DRIVE_CLICK');
      toast.success(`Minat test drive ${name} tercatat. Membuka lokasi showroom terdekat.`);
      navigate('/peta?type=Showroom');
    } catch {
      navigate('/peta?type=Showroom');
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Komparasi Spesifikasi & Biaya · KEL2-57"
          title="Perbandingan Unit EV Berdampingan"
          description={`Dihitung pada profil perjalanan Anda: ${simInput.dailyDistanceKm} km/hari (${monthlyKm} km/bulan) dengan tarif PLN Rp ${formatNumber(plnRate, 1)}/kWh.`}
          actions={
            <Button variant="outline" onClick={() => navigate('/katalog')}>
              Tambah / Ubah Unit ({comparedModels.length}/4)
            </Button>
          }
        />

        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-slate-50/80">
                <th className="w-48 p-4 text-xs font-bold uppercase text-mute">Parameter</th>
                {comparedModels.map((ev) => (
                  <th key={ev.id} className="p-4 align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge tone="neutral">{ev.vehicleType}</Badge>
                        <div className="mt-1.5 text-base font-extrabold text-ink">
                          {ev.brand} {ev.modelName}
                        </div>
                        <div className="num text-xs font-bold text-brand">
                          {formatIdr(ev.otrPriceIdr)}
                        </div>
                      </div>
                      {comparedModels.length > 1 && (
                        <button
                          type="button"
                          onClick={() => toggleCompareId(ev.id)}
                          className="cursor-pointer text-xs font-semibold text-mute hover:text-bad"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-xs">
              <tr>
                <td className="p-4 font-semibold text-mute">Kapasitas Baterai</td>
                {comparedModels.map((ev) => (
                  <td key={ev.id} className="num p-4 font-bold text-ink">
                    {ev.batteryKwh} kWh
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-mute">Jarak Tempuh WLTP</td>
                {comparedModels.map((ev) => (
                  <td key={ev.id} className="num p-4 font-bold text-ink">
                    {ev.wltpRangeKm} km
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-mute">Konsumsi Energi</td>
                {comparedModels.map((ev) => (
                  <td key={ev.id} className="num p-4 font-bold text-ink">
                    {ev.consumptionKwh100km} kWh / 100 km
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-mute">Daya Pengisian AC / DC</td>
                {comparedModels.map((ev) => (
                  <td key={ev.id} className="num p-4 font-semibold text-ink">
                    AC {ev.acChargerKw} kW · {ev.dcChargerKw > 0 ? `DC ${ev.dcChargerKw} kW` : 'Tanpa DC'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-mute">Estimasi Listrik Bulanan</td>
                {comparedModels.map((ev) => {
                  const cost = Math.round(((monthlyKm * ev.consumptionKwh100km) / 100) * plnRate);
                  return (
                    <td key={ev.id} className="num p-4 font-bold text-ok-ink">
                      {formatIdr(cost)} / bln
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-mute">Garansi Baterai</td>
                {comparedModels.map((ev) => (
                  <td key={ev.id} className="p-4 font-semibold text-ink">
                    {ev.warrantyLabel}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-mute">Promo Mitra Aktif</td>
                {comparedModels.map((ev) => (
                  <td key={ev.id} className="p-4">
                    {ev.promoLabel ? (
                      <Badge tone="ok">{ev.promoLabel}</Badge>
                    ) : (
                      <span className="text-mute">-</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-mute">Tindakan</td>
                {comparedModels.map((ev) => (
                  <td key={ev.id} className="space-y-2 p-4">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        selectEvModel(ev);
                        navigate('/dashboard');
                      }}
                    >
                      Pilih untuk Simulasi
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => void handleTestDriveLead(ev.id, `${ev.brand} ${ev.modelName}`)}
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Cari Showroom</span>
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </UserLayout>
  );
}

export function InitialPurchaseCalculatorPage() {
  const { calc, simInput, updateSimExtra } = useApp();

  return (
    <GuardCalc>
      {() => {
        const c = calc!;
        const ex = simInput.extra;

        return (
          <div className="space-y-6">
            <PageHeader
              eyebrow="Modul 03 · Akuisisi & Pembiayaan"
              title="Kalkulator Biaya Pembelian Awal, Insentif & Cicilan Kredit"
              description={` Analisis skema pembelian ${c.ev.brand} ${c.ev.modelName} (${formatIdr(c.ev.otrPriceIdr)}) beserta potongan insentif pemerintah aktif.`}
            />

            <CalculatorSplitLayout
              controls={
                <Card className="space-y-4">
                  <RangeSlider
                    label="Uang Muka (Down Payment)"
                    min={10}
                    max={80}
                    step={5}
                    value={ex.dpPct}
                    displayValue={`${ex.dpPct}% (${formatIdr(c.purchase.downPaymentIdr)})`}
                    onChange={(dpPct) => updateSimExtra({ dpPct })}
                  />

                  <Field label="Tenor Kredit">
                    <div className="flex flex-wrap gap-2">
                      {[12, 24, 36, 48, 60].map((m) => (
                        <FilterChip
                          key={m}
                          active={ex.tenorMonths === m}
                          onClick={() => updateSimExtra({ tenorMonths: m })}
                        >
                          {m} Bulan ({m / 12} Th)
                        </FilterChip>
                      ))}
                    </div>
                  </Field>

                  <RangeSlider
                    label="Suku Bunga Kredit Flat Tahunan"
                    min={0}
                    max={14}
                    step={0.5}
                    value={ex.annualInterestPct}
                    displayValue={`${ex.annualInterestPct}% / tahun`}
                    onChange={(annualInterestPct) => updateSimExtra({ annualInterestPct })}
                  />

                  {c.ev.vehicleType === 'Mobil' && (
                    <SwitchRow
                      label="Terapkan Insentif PPN DTP Mobil Listrik"
                      description={
                        c.purchase.ppnDtpAvailable
                          ? 'Kebijakan aktif di database Superadmin'
                          : 'Kebijakan sedang dinonaktifkan oleh Superadmin'
                      }
                      checked={ex.applyPpnDtp && c.purchase.ppnDtpAvailable}
                      disabled={!c.purchase.ppnDtpAvailable}
                      badge={
                        <Badge tone={c.purchase.ppnDtpAvailable ? 'ok' : 'neutral'}>
                          {c.purchase.ppnDtpAvailable ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      }
                      onCheckedChange={(applyPpnDtp) => updateSimExtra({ applyPpnDtp })}
                    />
                  )}

                  {c.ev.vehicleType === 'Motor' && (
                    <SwitchRow
                      label="Terapkan Subsidi Pembelian Motor Listrik"
                      description={
                        c.purchase.motorSubsidyAvailable
                          ? 'Kuota subsidi aktif di database Superadmin'
                          : 'Kuota subsidi sedang nonaktif di database Superadmin'
                      }
                      checked={ex.applyMotorSubsidy && c.purchase.motorSubsidyAvailable}
                      disabled={!c.purchase.motorSubsidyAvailable}
                      badge={
                        <Badge tone={c.purchase.motorSubsidyAvailable ? 'ok' : 'neutral'}>
                          {c.purchase.motorSubsidyAvailable ? 'Aktif' : 'Kuota Habis'}
                        </Badge>
                      }
                      onCheckedChange={(applyMotorSubsidy) =>
                        updateSimExtra({ applyMotorSubsidy })
                      }
                    />
                  )}
                </Card>
              }
              results={
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <MetricCard
                      tone="brand"
                      label="Cicilan Bulanan"
                      value={`${formatIdr(c.purchase.monthlyInstallmentIdr)}/bln`}
                      subtext={`Tenor ${ex.tenorMonths} bulan`}
                    />
                    <MetricCard
                      tone="ok"
                      label="Potongan Insentif"
                      value={formatIdr(c.purchase.incentiveDiscountIdr)}
                      subtext={`Harga bersih ${formatIdr(c.purchase.netEvPriceIdr)}`}
                    />
                    <MetricCard
                      tone="default"
                      label="Tertutup Penghematan BBM"
                      value={`${c.purchase.installmentCoveragePct}%`}
                      subtext="Persentase cicilan tertutup hemat operasional"
                    />
                  </div>

                  <Card className="space-y-2.5">
                    <h2 className="text-sm font-bold text-ink">Rincian Struktur Pembiayaan</h2>
                    <KeyValueRow label="Harga OTR Katalog" value={formatIdr(c.ev.otrPriceIdr)} />
                    <KeyValueRow
                      label="Potongan Insentif Pemerintah"
                      value={`-${formatIdr(c.purchase.incentiveDiscountIdr)}`}
                    />
                    <KeyValueRow
                      label="Harga Akuisisi Bersih"
                      value={formatIdr(c.purchase.netEvPriceIdr)}
                    />
                    <KeyValueRow
                      label={`Uang Muka (${ex.dpPct}%)`}
                      value={formatIdr(c.purchase.downPaymentIdr)}
                    />
                    <KeyValueRow
                      label="Pokok Pinjaman"
                      value={formatIdr(c.purchase.loanPrincipalIdr)}
                    />
                    <KeyValueRow
                      label={`Total Bunga (${ex.annualInterestPct}% x ${ex.tenorMonths} bln)`}
                      value={formatIdr(c.purchase.totalInterestIdr)}
                    />
                    <KeyValueRow
                      strong
                      label="Total Pembayaran Kredit + DP"
                      value={formatIdr(c.purchase.totalPaidWithCreditIdr)}
                    />
                  </Card>
                </>
              }
            />
          </div>
        );
      }}
    </GuardCalc>
  );
}

export function BatteryDegradationPage() {
  const { calc, simInput, updateSimExtra } = useApp();

  return (
    <GuardCalc>
      {() => {
        const c = calc!;
        const ex = simInput.extra;

        return (
          <div className="space-y-6">
            <PageHeader
              eyebrow="Modul 04 · Kesehatan Baterai"
              title="Simulator Degradasi Baterai (State of Health 10 Tahun)"
              description="Proyeksikan penurunan kapasitas SoH dan jarak tempuh efektif berdasarkan pola pengisian AC rumah vs DC fast charging."
            />

            <CalculatorSplitLayout
              controls={
                <Card className="space-y-4">
                  <Field label="Pola Kebiasaan Pengisian Daya">
                    <SegmentedTabs<ChargingHabit>
                      value={ex.chargingHabit}
                      onChange={(chargingHabit) => updateSimExtra({ chargingHabit })}
                      className="w-full"
                      options={[
                        { value: 'ac', label: 'Dominan AC Rumah' },
                        { value: 'mix', label: 'Campuran AC + DC' },
                        { value: 'dc', label: 'Dominan DC Fast' },
                      ]}
                    />
                  </Field>

                  <RangeSlider
                    label="Horizon Evaluasi Kepemilikan"
                    min={1}
                    max={10}
                    step={1}
                    value={ex.ownershipYears}
                    displayValue={`Tahun ke-${ex.ownershipYears}`}
                    onChange={(ownershipYears) => updateSimExtra({ ownershipYears })}
                  />

                  <div className="rounded-xl border border-line bg-slate-50 p-3.5 text-xs text-mute">
                    Garansi baterai pabrikan untuk{' '}
                    <strong className="text-ink">
                      {c.ev.brand} {c.ev.modelName}
                    </strong>
                    : <strong className="text-brand">{c.ev.warrantyLabel}</strong> dengan batas klaim
                    umum SoH 70%.
                  </div>
                </Card>
              }
              results={
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <MetricCard
                      tone={
                        c.degradation.status === 'sehat'
                          ? 'ok'
                          : c.degradation.status === 'menurun'
                            ? 'warn'
                            : 'bad'
                      }
                      label={`Estimasi SoH Tahun ke-${ex.ownershipYears}`}
                      value={`${c.degradation.sohAtOwnershipYear}%`}
                      subtext={
                        c.degradation.status === 'sehat'
                          ? 'Kondisi prima (>= 80%)'
                          : c.degradation.status === 'menurun'
                            ? 'Mulai menurun namun di atas 70%'
                            : 'Di bawah ambang garansi 70%'
                      }
                    />
                    <MetricCard
                      tone="brand"
                      label="Jarak Tempuh WLTP Efektif"
                      value={`${c.degradation.effectiveRangeKm} km`}
                      subtext={`Dari jarak awal ${c.ev.wltpRangeKm} km`}
                    />
                    <MetricCard
                      tone="default"
                      label="Kapasitas Energi Tersisa"
                      value={`${((c.ev.batteryKwh * c.degradation.sohAtOwnershipYear) / 100).toFixed(1)} kWh`}
                      subtext={`Dari kapasitas baru ${c.ev.batteryKwh} kWh`}
                    />
                  </div>

                  <Card>
                    <h2 className="mb-3 text-sm font-bold text-ink">
                      Kurva Proyeksi SoH 10 Tahun Berdasarkan Pola Charging
                    </h2>
                    <LineChart
                      labels={c.degradation.seriesYears}
                      yMin={55}
                      yMax={102}
                      formatY={(v) => `${Math.round(v)}%`}
                      thresholdLine={{
                        value: 70,
                        label: 'Ambang Garansi 70%',
                        color: '#ef4444',
                      }}
                      series={[
                        { name: 'AC Rumah (~2,0%/th)', color: '#10b981', values: c.degradation.seriesAc },
                        { name: 'Campuran (~2,9%/th)', color: '#2563eb', values: c.degradation.seriesMix },
                        { name: 'Dominan DC (~3,9%/th)', color: '#f59e0b', values: c.degradation.seriesDc },
                      ]}
                    />
                  </Card>
                </>
              }
            />
          </div>
        );
      }}
    </GuardCalc>
  );
}

export function BatterySinkingFundPage() {
  const { calc, simInput, updateSimExtra } = useApp();

  return (
    <GuardCalc>
      {() => {
        const c = calc!;
        const ex = simInput.extra;

        return (
          <div className="space-y-6">
            <PageHeader
              eyebrow="Modul 05 · Mitigasi Risiko Baterai"
              title="Kalkulator Dana Cadangan Penggantian Baterai (Sinking Fund)"
              description="Siapkan tabungan bulanan terukur agar biaya ganti pak baterai di masa depan tidak mengganggu arus kas keluarga."
            />

            <CalculatorSplitLayout
              controls={
                <Card className="space-y-4">
                  <RangeSlider
                    label="Target Tahun Penggantian Baterai"
                    min={4}
                    max={12}
                    step={1}
                    value={ex.targetBatteryYear}
                    displayValue={`Tahun ke-${ex.targetBatteryYear} (${ex.targetBatteryYear * 12} bln)`}
                    onChange={(targetBatteryYear) => updateSimExtra({ targetBatteryYear })}
                  />

                  <RangeSlider
                    label="Harga Baterai Saat Ini per kWh"
                    min={1_200_000}
                    max={5_500_000}
                    step={100_000}
                    value={c.sinkingFund.effectiveBatteryPricePerKwhIdr}
                    displayValue={`${formatIdr(c.sinkingFund.effectiveBatteryPricePerKwhIdr)}/kWh`}
                    hint={`Kapasitas baterai ${c.ev.brand} ${c.ev.modelName}: ${c.ev.batteryKwh} kWh`}
                    onChange={(batteryPricePerKwh) => updateSimExtra({ batteryPricePerKwh })}
                  />

                  <RangeSlider
                    label="Tren Penurunan Harga Sel Baterai per Tahun"
                    min={0}
                    max={12}
                    step={1}
                    value={ex.batteryAnnualDropPct}
                    displayValue={`-${ex.batteryAnnualDropPct}% / tahun`}
                    onChange={(batteryAnnualDropPct) =>
                      updateSimExtra({ batteryAnnualDropPct })
                    }
                  />

                  <SwitchRow
                    label="Simpan di Deposito / Reksa Dana Pasar Uang (4% p.a.)"
                    description="Bunga majemuk meringankan setoran rutin bulanan Anda"
                    checked={ex.useDeposit}
                    onCheckedChange={(useDeposit) => updateSimExtra({ useDeposit })}
                  />
                </Card>
              }
              results={
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <MetricCard
                      tone="brand"
                      label="Setoran Cadangan Bulanan"
                      value={`${formatIdr(c.sinkingFund.monthlyReserveIdr)}/bln`}
                      subtext={ex.useDeposit ? 'Dengan imbal hasil 4% p.a.' : 'Tabungan tanpa bunga'}
                    />
                    <MetricCard
                      tone="default"
                      label={`Estimasi Harga Tahun ke-${ex.targetBatteryYear}`}
                      value={formatMillionIdr(c.sinkingFund.futureReplacementCostIdr)}
                      subtext={formatIdr(c.sinkingFund.futureReplacementCostIdr)}
                    />
                    <MetricCard
                      tone="ok"
                      label="Biaya Cadangan per Km"
                      value={`Rp ${formatNumber(c.sinkingFund.costPerKmIdr)} / km`}
                      subtext="Masuk dalam perhitungan TCO 5 tahun"
                    />
                  </div>

                  <Card>
                    <h2 className="mb-3 text-sm font-bold text-ink">
                      Proyeksi Akumulasi Dana Cadangan vs Target Harga Penggantian
                    </h2>
                    <LineChart
                      labels={c.sinkingFund.seriesLabels}
                      formatY={(v) => formatMillionIdr(v)}
                      series={[
                        {
                          name: 'Akumulasi Tabungan Baterai',
                          color: '#2563eb',
                          values: c.sinkingFund.seriesAccumulated,
                        },
                        {
                          name: 'Target Biaya Ganti Baterai',
                          color: '#10b981',
                          values: c.sinkingFund.seriesTargetLine,
                          dashed: true,
                        },
                      ]}
                    />
                  </Card>
                </>
              }
            />
          </div>
        );
      }}
    </GuardCalc>
  );
}

export function HomeChargingPlannerPage() {
  const { calc, simInput, updateSim } = useApp();

  return (
    <GuardCalc>
      {() => {
        const c = calc!;
        const chargerOptions =
          c.ev.vehicleType === 'Motor' ? [0.35, 0.4, 0.6, 0.7, 1.0] : [2.2, 3.5, 6.6, 7.4, 11.0];

        return (
          <div className="space-y-6">
            <PageHeader
              eyebrow="Modul 06 · Kelistrikan Rumah"
              title="Perencana Pengisian Rumah & Kecukupan Daya MCB PLN"
              description="Evaluasi beban puncak rumah tangga dengan faktor daya efektif PLN (cos phi = 0,85) agar MCB tidak anjlok saat mengisi daya EV."
            />

            <CalculatorSplitLayout
              controls={
                <Card className="space-y-4">
                  <Field label="Daya Terpasang PLN Saat Ini">
                    <SelectInput
                      value={simInput.homePowerVa}
                      onChange={(e) => updateSim({ homePowerVa: Number(e.target.value) })}
                    >
                      <option value={450}>450 VA (Maks. efektif 0,38 kW)</option>
                      <option value={900}>900 VA (Maks. efektif 0,77 kW)</option>
                      <option value={1300}>1.300 VA (Maks. efektif 1,11 kW)</option>
                      <option value={2200}>2.200 VA (Maks. efektif 1,87 kW)</option>
                      <option value={3500}>3.500 VA (Maks. efektif 2,98 kW)</option>
                      <option value={5500}>5.500 VA (Maks. efektif 4,68 kW)</option>
                      <option value={7700}>7.700 VA (Maks. efektif 6,55 kW)</option>
                      <option value={11000}>11.000 VA (Maks. efektif 9,35 kW)</option>
                    </SelectInput>
                  </Field>

                  <Field label="Daya Charger EV di Rumah (kW)">
                    <div className="flex flex-wrap gap-2">
                      {chargerOptions.map((kw) => (
                        <FilterChip
                          key={kw}
                          active={Math.abs(simInput.homeChargerKw - kw) < 0.05}
                          onClick={() => updateSim({ homeChargerKw: kw })}
                        >
                          {kw} kW
                        </FilterChip>
                      ))}
                    </div>
                  </Field>

                  <RangeSlider
                    label="Beban Dasar Rumah Tangga (AC, Kulkas, Pompa, Lampu)"
                    min={0.2}
                    max={4.5}
                    step={0.1}
                    value={simInput.baseLoadKw}
                    displayValue={`${simInput.baseLoadKw.toFixed(1)} kW`}
                    onChange={(baseLoadKw) => updateSim({ baseLoadKw })}
                  />

                  <SwitchRow
                    label="Jadwalkan Pengisian Malam Hari (22.00 - 05.00)"
                    description="Beban peralatan rumah tangga turun ~60% saat malam hari"
                    checked={simInput.nightChargingEnabled}
                    onCheckedChange={(nightChargingEnabled) =>
                      updateSim({ nightChargingEnabled })
                    }
                  />
                </Card>
              }
              results={
                <>
                  <HomeLoadGauge
                    totalLoadKw={c.homePower.totalLoadKw}
                    maxCapacityKw={c.homePower.maxCapacityKw}
                    status={c.homePower.status}
                  />

                  <div className="grid gap-4 sm:grid-cols-3">
                    <MetricCard
                      tone="brand"
                      label="Durasi Isi Penuh (0-100%)"
                      value={`${c.homePower.fullChargeHours} jam`}
                      subtext={`Baterai ${c.ev.batteryKwh} kWh (efisiensi 90%)`}
                    />
                    <MetricCard
                      tone={c.homePower.status === 'aman' ? 'ok' : 'warn'}
                      label="Rekomendasi Daya PLN"
                      value={
                        c.homePower.status === 'aman'
                          ? 'Daya Saat Ini Cukup'
                          : c.homePower.recommendedUpgradeVa
                            ? `Naik ke ${c.homePower.recommendedUpgradeVa.toLocaleString('id-ID')} VA`
                            : 'Pasang Meteran Terpisah'
                      }
                      subtext={
                        c.homePower.status !== 'aman' && c.homePower.recommendedUpgradeFeeIdr
                          ? `Estimasi biaya tambah daya ${formatIdr(c.homePower.recommendedUpgradeFeeIdr)}`
                          : 'Beban di bawah 70% kapasitas MCB'
                      }
                    />
                    <MetricCard
                      tone="default"
                      label="Beban Rumah Efektif"
                      value={`${c.homePower.effectiveBaseLoadKw} kW`}
                      subtext={
                        simInput.nightChargingEnabled
                          ? 'Setelah reduksi jadwal malam'
                          : 'Beban puncak siang/sore'
                      }
                    />
                  </div>
                </>
              }
            />
          </div>
        );
      }}
    </GuardCalc>
  );
}

export function RangeSimulatorPage() {
  const { bootstrap, calc, simInput, updateSimExtra } = useApp();
  const navigate = useNavigate();

  return (
    <GuardCalc>
      {() => {
        const c = calc!;
        const ex = simInput.extra;
        const routes = bootstrap?.routePresets ?? [];

        return (
          <div className="space-y-6">
            <PageHeader
              eyebrow="Modul 07 · Kecemasan Jarak Tempuh"
              title="Simulator Jarak Tempuh Riil & Kebutuhan Singgah SPKLU"
              description={`Uji kecukupan baterai ${c.ev.brand} ${c.ev.modelName} (klaim WLTP ${c.ev.wltpRangeKm} km) pada rute nyata dengan koreksi AC, kemacetan/hujan, dan beban penumpang.`}
            />

            <CalculatorSplitLayout
              controls={
                <Card className="space-y-4">
                  <Field label="Preset Rute Perjalanan">
                    <div className="flex flex-wrap gap-2">
                      {routes.map((r) => (
                        <FilterChip
                          key={r.id}
                          active={ex.tripDistanceKm === r.distanceKm}
                          onClick={() => updateSimExtra({ tripDistanceKm: r.distanceKm })}
                        >
                          {r.routeLabel} ({r.distanceKm} km)
                        </FilterChip>
                      ))}
                    </div>
                  </Field>

                  <RangeSlider
                    label="Jarak Perjalanan Sekali Jalan"
                    min={10}
                    max={550}
                    step={5}
                    value={ex.tripDistanceKm}
                    displayValue={`${ex.tripDistanceKm} km`}
                    onChange={(tripDistanceKm) => updateSimExtra({ tripDistanceKm })}
                  />

                  <RangeSlider
                    label="Baterai Saat Berangkat (SoC Awal)"
                    min={40}
                    max={100}
                    step={5}
                    value={ex.departureSocPct}
                    displayValue={`${ex.departureSocPct}%`}
                    onChange={(departureSocPct) => updateSimExtra({ departureSocPct })}
                  />

                  {c.ev.vehicleType === 'Mobil' && (
                    <SwitchRow
                      label="AC Kabin Aktif Sepanjang Perjalanan"
                      description="Koreksi konsumsi daya pendingin kabin (-10%)"
                      checked={ex.acOn}
                      onCheckedChange={(acOn) => updateSimExtra({ acOn })}
                    />
                  )}

                  <SwitchRow
                    label="Hujan Lebat atau Kemacetan Padat"
                    description="Hambatan gulir & stop-and-go (-8%)"
                    checked={ex.rainTraffic}
                    onCheckedChange={(rainTraffic) => updateSimExtra({ rainTraffic })}
                  />

                  <SwitchRow
                    label="Muatan Penuh atau Rute Menanjak"
                    description="Beban bobot maksimum & kontur menanjak (-7%)"
                    checked={ex.fullLoad}
                    onCheckedChange={(fullLoad) => updateSimExtra({ fullLoad })}
                  />
                </Card>
              }
              results={
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <MetricCard
                      tone="brand"
                      label="Jarak Tempuh Riil"
                      value={`${c.rangeSim.realRangeKm} km`}
                      subtext={`Faktor kondisi ${(c.rangeSim.conditionFactor * 100).toFixed(0)}% dari basis riil`}
                    />
                    <MetricCard
                      tone={
                        c.rangeSim.status === 'cukup'
                          ? 'ok'
                          : c.rangeSim.status === 'mepet'
                            ? 'warn'
                            : 'bad'
                      }
                      label="Sisa Jarak di Tujuan"
                      value={`${c.rangeSim.remainingKm >= 0 ? `+${c.rangeSim.remainingKm}` : c.rangeSim.remainingKm} km`}
                      subtext={
                        c.rangeSim.status === 'cukup'
                          ? 'Aman tanpa isi daya di jalan'
                          : c.rangeSim.status === 'mepet'
                            ? 'Cadangan baterai tipis (< 30%)'
                            : 'Wajib singgah isi daya'
                      }
                    />
                    <MetricCard
                      tone={c.rangeSim.requiredChargingStops === 0 ? 'ok' : 'warn'}
                      label="Singgah SPKLU / Tukar Baterai"
                      value={
                        c.rangeSim.requiredChargingStops === 0
                          ? '0 Kali'
                          : `${c.rangeSim.requiredChargingStops} Kali Singgah`
                      }
                      subtext="Rekomendasi pengisian aman s.d. 80%"
                    />
                  </div>

                  <Card className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-ink">
                        Rencanakan Titik Pengisian di Peta Interaktif
                      </h3>
                      <p className="text-xs text-mute">
                        Temukan lokasi SPKLU fast charging, SPBKLU tukar baterai, dan showroom resmi
                        terdekat.
                      </p>
                    </div>
                    <Button variant="secondary" onClick={() => navigate('/peta')}>
                      <MapPin className="h-4 w-4" />
                      <span>Buka Peta SPKLU</span>
                    </Button>
                  </Card>
                </>
              }
            />
          </div>
        );
      }}
    </GuardCalc>
  );
}

export function FiveYearTcoPage() {
  const { calc, simInput, updateSim } = useApp();

  return (
    <GuardCalc>
      {() => {
        const c = calc!;
        const monthLabels = Array.from({ length: 61 }, (_, i) =>
          i % 12 === 0 ? `Bln ${i}` : '',
        );

        return (
          <div className="space-y-6">
            <PageHeader
              eyebrow="Modul 08 · Analisis Finansial Komprehensif"
              title="Total Cost of Ownership (TCO) 5 Tahun & Titik Balik Modal"
              description="Menggabungkan harga akuisisi bersih, energi, perawatan berkala, pajak tahunan, dan dana cadangan baterai selama 60 bulan."
              actions={
                <SegmentedTabs<'A' | 'B'>
                  value={simInput.pathway}
                  onChange={(pathway) => updateSim({ pathway })}
                  options={[
                    { value: 'A', label: 'Jalur A (Beli Baru)' },
                    { value: 'B', label: 'Jalur B (Jual BBM Lama)' },
                  ]}
                />
              }
            />

            <div className="grid gap-4 sm:grid-cols-2 @3xl:grid-cols-4">
              <MetricCard
                tone="default"
                label={`TCO 5 Tahun ${simInput.customIceName}`}
                value={formatMillionIdr(c.tco.iceComponents.total5YearsIdr)}
                subtext={formatIdr(c.tco.iceComponents.total5YearsIdr)}
              />
              <MetricCard
                tone="brand"
                label={`TCO 5 Tahun ${c.ev.brand} ${c.ev.modelName}`}
                value={formatMillionIdr(c.tco.evComponents.total5YearsIdr)}
                subtext={formatIdr(c.tco.evComponents.total5YearsIdr)}
              />
              <MetricCard
                tone={c.tco.tcoDifferenceIdr >= 0 ? 'ok' : 'warn'}
                label={c.tco.tcoDifferenceIdr >= 0 ? 'Penghematan Bersih 5 Th' : 'Selisih TCO 5 Th'}
                value={formatMillionIdr(c.tco.tcoDifferenceIdr)}
                subtext={formatIdr(c.tco.tcoDifferenceIdr)}
              />
              <MetricCard
                tone={c.tco.isPaybackReached ? 'ok' : 'warn'}
                label="Titik Balik Modal (Payback)"
                value={c.tco.paybackLabel}
                tooltip="Bulan ketika garis akumulasi biaya EV memotong di bawah garis kendaraan BBM."
                subtext={
                  c.tco.isPaybackReached
                    ? `Tercapai di bulan ke-${c.tco.paybackMonthIndex}`
                    : 'Tidak memotong kurva BBM dalam 60 bulan'
                }
              />
            </div>

            <div className="grid gap-6 @3xl:grid-cols-12">
              <Card className="@3xl:col-span-7">
                <h2 className="mb-3 text-sm font-bold text-ink">
                  Grafik Titik Potong (Crossover) TCO Bulan 0 s.d. Bulan 60
                </h2>
                <LineChart
                  labels={monthLabels}
                  crossoverIndex={c.tco.paybackMonthIndex}
                  formatY={(v) => formatMillionIdr(v)}
                  series={[
                    {
                      name: `Kendaraan BBM (${simInput.customIceName})`,
                      color: '#64748b',
                      values: c.tco.iceCumulative60,
                    },
                    {
                      name: `Kendaraan Listrik (${c.ev.brand} ${c.ev.modelName})`,
                      color: '#2563eb',
                      values: c.tco.evCumulative60,
                    },
                  ]}
                />
              </Card>

              <Card className="space-y-4 @3xl:col-span-5">
                <h2 className="text-sm font-bold text-ink">Porsi Komponen Biaya 5 Tahun</h2>
                <StackedHorizontalBar
                  title={`BBM · ${simInput.customIceName}`}
                  totalFormatted={formatMillionIdr(c.tco.iceComponents.total5YearsIdr)}
                  segments={[
                    {
                      label: 'Akuisisi',
                      value: c.tco.iceComponents.acquisitionIdr,
                      color: '#475569',
                      formatted: formatMillionIdr(c.tco.iceComponents.acquisitionIdr),
                    },
                    {
                      label: 'BBM 5 Th',
                      value: c.tco.iceComponents.energyIdr,
                      color: '#f59e0b',
                      formatted: formatMillionIdr(c.tco.iceComponents.energyIdr),
                    },
                    {
                      label: 'Servis',
                      value: c.tco.iceComponents.maintenanceIdr,
                      color: '#94a3b8',
                      formatted: formatMillionIdr(c.tco.iceComponents.maintenanceIdr),
                    },
                    {
                      label: 'Pajak STNK',
                      value: c.tco.iceComponents.taxIdr,
                      color: '#ef4444',
                      formatted: formatMillionIdr(c.tco.iceComponents.taxIdr),
                    },
                  ]}
                />

                <StackedHorizontalBar
                  title={`EV · ${c.ev.brand} ${c.ev.modelName}`}
                  totalFormatted={formatMillionIdr(c.tco.evComponents.total5YearsIdr)}
                  segments={[
                    {
                      label: 'Akuisisi Bersih',
                      value: c.tco.evComponents.acquisitionIdr,
                      color: '#1e40af',
                      formatted: formatMillionIdr(c.tco.evComponents.acquisitionIdr),
                    },
                    {
                      label: 'Listrik 5 Th',
                      value: c.tco.evComponents.energyIdr,
                      color: '#2563eb',
                      formatted: formatMillionIdr(c.tco.evComponents.energyIdr),
                    },
                    {
                      label: 'Servis',
                      value: c.tco.evComponents.maintenanceIdr,
                      color: '#38bdf8',
                      formatted: formatMillionIdr(c.tco.evComponents.maintenanceIdr),
                    },
                    {
                      label: 'Dana Baterai',
                      value: c.tco.evComponents.batteryReserveIdr,
                      color: '#10b981',
                      formatted: formatMillionIdr(c.tco.evComponents.batteryReserveIdr),
                    },
                  ]}
                />
              </Card>
            </div>
          </div>
        );
      }}
    </GuardCalc>
  );
}

export function CarbonEmissionPage() {
  const { calc, simInput, updateSim } = useApp();

  return (
    <GuardCalc>
      {() => {
        const c = calc!;

        return (
          <div className="space-y-6">
            <PageHeader
              eyebrow="Modul 09 · Dampak Lingkungan"
              title="Kalkulator Jejak Emisi Karbon (Grid PLN vs BBM vs PLTS Atap)"
              description="Hitung emisi gas rumah kaca tahunan secara jujur dengan memperhitungkan faktor emisi pembangkit jaringan PLN atau panel surya atap."
            />

            <CalculatorSplitLayout
              controls={
                <Card className="space-y-4">
                  <SwitchRow
                    label="Gunakan Panel Surya Atap (PLTS Rooftop) di Rumah"
                    description="Menurunkan faktor emisi listrik dari 0,87 kg CO2/kWh (grid) menjadi 0,05 kg CO2/kWh"
                    checked={simInput.solarRooftopEnabled}
                    badge={
                      <Badge tone={simInput.solarRooftopEnabled ? 'ok' : 'neutral'}>
                        {simInput.solarRooftopEnabled ? 'PLTS Aktif' : 'Grid PLN'}
                      </Badge>
                    }
                    onCheckedChange={(solarRooftopEnabled) =>
                      updateSim({ solarRooftopEnabled })
                    }
                  />

                  <RangeSlider
                    label="Jarak Tempuh Harian"
                    min={5}
                    max={200}
                    step={1}
                    value={simInput.dailyDistanceKm}
                    displayValue={`${simInput.dailyDistanceKm} km/hari (${c.monthlyKm * 12} km/th)`}
                    onChange={(dailyDistanceKm) => updateSim({ dailyDistanceKm })}
                  />

                  <div className="rounded-xl border border-line bg-slate-50 p-3.5 text-xs leading-relaxed text-mute">
                    Faktor emisi aktif: <strong className="text-ink">{c.fuelTariff.displayName}</strong>{' '}
                    ({c.fuelTariff.emissionKgCo2PerUnit} kg CO2/liter) vs{' '}
                    <strong className="text-ink">
                      {simInput.solarRooftopEnabled ? 'PLTS Atap' : 'Jaringan Grid PLN'}
                    </strong>{' '}
                    ({simInput.solarRooftopEnabled ? '0,05' : c.plnTariff.emissionKgCo2PerUnit} kg
                    CO2/kWh).
                  </div>
                </Card>
              }
              results={
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <MetricCard
                      tone="ok"
                      label="Penurunan Emisi Tahunan"
                      value={`${formatNumber(c.emissions.annualReductionCo2Kg)} kg`}
                      subtext={`Turun ${c.emissions.reductionPct}% dibanding BBM`}
                    />
                    <MetricCard
                      tone="brand"
                      label="Reduksi Kumulatif 5 Tahun"
                      value={`${formatNumber(c.emissions.fiveYearReductionCo2Kg)} kg`}
                      subtext="Total CO2 yang berhasil dicegah"
                    />
                    <MetricCard
                      tone="ok"
                      label="Ekuivalen Serapan Pohon"
                      value={`${formatNumber(c.emissions.equivalentTrees)} Pohon`}
                      subtext="Daya serap pohon dewasa (21 kg CO2/th)"
                    />
                  </div>

                  <Card className="space-y-4">
                    <h2 className="text-sm font-bold text-ink">
                      Perbandingan Emisi CO2 Tahunan (kg CO2 / tahun)
                    </h2>
                    <CompareBarChart
                      items={[
                        {
                          label: `Kendaraan BBM (${simInput.customIceName})`,
                          value: c.emissions.annualIceCo2Kg,
                          formattedValue: `${formatNumber(c.emissions.annualIceCo2Kg)} kg CO2/th`,
                          color: '#64748b',
                        },
                        {
                          label: `EV (${c.ev.brand} ${c.ev.modelName})`,
                          sublabel: simInput.solarRooftopEnabled ? 'PLTS Atap' : 'Grid PLN',
                          value: c.emissions.annualEvCo2Kg,
                          formattedValue: `${formatNumber(c.emissions.annualEvCo2Kg)} kg CO2/th`,
                          color: '#10b981',
                        },
                      ]}
                    />
                  </Card>
                </>
              }
            />
          </div>
        );
      }}
    </GuardCalc>
  );
}
