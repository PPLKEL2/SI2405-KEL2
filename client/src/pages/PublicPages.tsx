import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  MapPin,
  MessageSquare,
  Printer,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  formatIdr,
  formatMillionIdr,
  formatNumber,
  recommendEvModel,
  type SavedSimulationDto,
  type VehicleType,
} from '@mobilitiq/shared';
import { api } from '@/lib/api';
import { formatIndonesianDate } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { PublicLayout } from '@/layouts/Layouts';
import { AuthFormPanel } from '@/components/auth/AuthModal';
import { CompareBarChart, LineChart, StackedHorizontalBar } from '@/components/ui/charts';
import {
  Badge,
  BlurGate,
  Button,
  Card,
  ChatBubble,
  ErrorState,
  Field,
  FilterChip,
  KeyValueRow,
  MetricCard,
  PageHeader,
  RangeSlider,
  SegmentedTabs,
  SelectInput,
  Skeleton,
  StepProgress,
  VehicleThumb,
} from '@/components/ui/primitives';

export function LandingPage() {
  const { bootstrap, loadingBootstrap, bootstrapError, reloadBootstrap, updateSim } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    void api.recordFunnelEvent('LANDING_VISIT');
  }, []);

  if (bootstrapError) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-4xl px-4 py-14">
          <ErrorState message={bootstrapError} onRetry={() => void reloadBootstrap()} />
        </div>
      </PublicLayout>
    );
  }

  const stats = bootstrap?.macroStats;

  return (
    <PublicLayout>
      <section className="border-b border-line bg-gradient-to-b from-tint/80 via-white to-canvas py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 @3xl:grid-cols-12">
          <div className="space-y-5 @3xl:col-span-7">
            <Badge tone="brand">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Data Tarif PLN, BBM & Insentif EV Indonesia Terkini</span>
            </Badge>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
              Hitung Kapan Beralih ke Kendaraan Listrik Benar-Benar{' '}
              <span className="text-electric">Menguntungkan</span>.
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-mute">
              MobilitiQ membandingkan biaya BBM, perawatan berkala, tarif listrik sesuai golongan VA
              rumah, degradasi baterai, hingga titik balik modal (payback) 5 tahun secara objektif.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button size="lg" onClick={() => navigate('/konsultasi')}>
                <MessageSquare className="h-4 w-4" />
                <span>Mulai Konsultasi Chatbot (2 Menit)</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/konsultasi/mulai')}
              >
                <span>Coba Kalkulator Cepat</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="rounded-2xl border border-line bg-white p-3.5">
                <div className="text-[11px] font-semibold text-mute">Rata-rata Penghematan</div>
                <div className="num mt-1 text-lg font-extrabold text-ok-ink">
                  {loadingBootstrap ? '...' : `${formatIdr(stats?.avgMonthlySavingIdr ?? 645_000)}/bln`}
                </div>
              </div>
              <div className="rounded-2xl border border-line bg-white p-3.5">
                <div className="text-[11px] font-semibold text-mute">Simulasi Terselesaikan</div>
                <div className="num mt-1 text-lg font-extrabold text-ink">
                  {loadingBootstrap
                    ? '...'
                    : `${formatNumber(stats?.completedSimulationsCount ?? 0)}+`}
                </div>
              </div>
              <div className="rounded-2xl border border-line bg-white p-3.5">
                <div className="text-[11px] font-semibold text-mute">Peta Kota Aktif</div>
                <div className="num mt-1 text-lg font-extrabold text-brand">
                  {loadingBootstrap ? '...' : `${stats?.activeCitiesCount ?? 3} Kota Besar`}
                </div>
              </div>
            </div>
          </div>

          <div className="@3xl:col-span-5">
            <Card className="space-y-4 border-blue-200 p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-electric">
                  Pilih Jalur Konsultasi Anda
                </span>
                <Badge tone="ok">Gratis Tanpa Kartu</Badge>
              </div>

              <button
                type="button"
                onClick={() => {
                  updateSim({ pathway: 'A' });
                  navigate('/konsultasi?pathway=A');
                }}
                className="group flex w-full cursor-pointer items-start justify-between gap-3 rounded-2xl border border-line bg-slate-50/70 p-4 text-left transition hover:border-electric hover:bg-tint/40"
              >
                <div>
                  <div className="text-sm font-bold text-ink group-hover:text-brand">
                    Jalur A · Pembelian Kendaraan Baru
                  </div>
                  <p className="mt-1 text-xs text-mute">
                    Bandingkan beli motor/mobil listrik baru vs kendaraan BBM baru sekelasnya.
                  </p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-electric" />
              </button>

              <button
                type="button"
                onClick={() => {
                  updateSim({ pathway: 'B' });
                  navigate('/konsultasi?pathway=B');
                }}
                className="group flex w-full cursor-pointer items-start justify-between gap-3 rounded-2xl border border-line bg-slate-50/70 p-4 text-left transition hover:border-electric hover:bg-tint/40"
              >
                <div>
                  <div className="text-sm font-bold text-ink group-hover:text-brand">
                    Jalur B · Sudah Punya Kendaraan BBM
                  </div>
                  <p className="mt-1 text-xs text-mute">
                    Hitung apakah jual kendaraan BBM lama dan ganti EV layak secara finansial.
                  </p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-electric" />
              </button>

              <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2.5 text-xs text-mute">
                <ShieldCheck className="h-4 w-4 shrink-0 text-ok" />
                <span>
                  Mendukung 9 modul kalkulator TCO, kecukupan daya MCB rumah, dan peta SPKLU.
                </span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-electric">
              Katalog Terkurasi
            </div>
            <h2 className="mt-1 text-2xl font-extrabold text-ink">
              Unit Motor & Mobil Listrik Populer di Indonesia
            </h2>
          </div>
          <Link to="/katalog" className="text-xs font-bold text-electric hover:underline">
            Lihat seluruh katalog &rarr;
          </Link>
        </div>

        {loadingBootstrap ? (
          <div className="grid gap-4 sm:grid-cols-2 @3xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 @3xl:grid-cols-4">
            {(bootstrap?.evModels ?? []).slice(0, 4).map((ev) => (
              <Card key={ev.id} className="flex flex-col justify-between gap-3 p-4">
                <div className="space-y-3">
                  <VehicleThumb type={ev.vehicleType} brand={ev.brand} />
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge tone="neutral">{ev.vehicleType}</Badge>
                      {ev.promoLabel && <Badge tone="ok">{ev.promoLabel}</Badge>}
                    </div>
                    <h3 className="mt-2 text-base font-bold text-ink">
                      {ev.brand} {ev.modelName}
                    </h3>
                    <div className="num text-sm font-extrabold text-brand">
                      {formatMillionIdr(ev.otrPriceIdr)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2.5 text-xs">
                    <div>
                      <span className="text-mute">Jarak WLTP</span>
                      <div className="num font-bold text-ink">{ev.wltpRangeKm} km</div>
                    </div>
                    <div>
                      <span className="text-mute">Konsumsi</span>
                      <div className="num font-bold text-ink">
                        {ev.consumptionKwh100km} kWh/100km
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate('/katalog')}
                >
                  Simulasikan Unit Ini
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

export function QuickWidgetPage() {
  const { bootstrap, simInput, calc, updateSim, selectEvModel } = useApp();
  const navigate = useNavigate();

  const fuels = (bootstrap?.energyTariffs ?? []).filter((t) => t.category === 'BBM' && t.isActive);

  const handleVehicleSwitch = (type: VehicleType) => {
    const rec = recommendEvModel(
      bootstrap?.evModels ?? [],
      type,
      type === 'Motor' ? 35_000_000 : 280_000_000,
    );
    updateSim({
      vehicleType: type,
      budgetIdr: type === 'Motor' ? 35_000_000 : 280_000_000,
      iceKmPerLiter: type === 'Motor' ? 45 : 12.5,
      customIceName: type === 'Motor' ? 'Honda Vario 125' : 'Toyota Avanza',
    });
    if (rec) selectEvModel(rec);
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <PageHeader
          eyebrow="Langkah Awal"
          title="Pilih Jalur & Cek Estimasi Penghematan Cepat"
          description="Sesuaikan parameter dasar perjalanan harian Anda atau lanjutkan ke konsultasi terpandu."
        />

        <div className="grid gap-6 @3xl:grid-cols-12">
          <Card className="space-y-4 @3xl:col-span-6">
            <Field label="Jalur Transisi">
              <SegmentedTabs<'A' | 'B'>
                value={simInput.pathway}
                onChange={(pathway) => updateSim({ pathway })}
                className="w-full"
                options={[
                  { value: 'A', label: 'Jalur A · Beli Baru' },
                  { value: 'B', label: 'Jalur B · Ganti Kendaraan BBM' },
                ]}
              />
            </Field>

            <Field label="Kategori Kendaraan">
              <SegmentedTabs<VehicleType>
                value={simInput.vehicleType}
                onChange={handleVehicleSwitch}
                className="w-full"
                options={[
                  { value: 'Motor', label: 'Motor Listrik' },
                  { value: 'Mobil', label: 'Mobil Listrik' },
                ]}
              />
            </Field>

            <RangeSlider
              label="Jarak Tempuh Harian"
              min={5}
              max={150}
              step={1}
              value={simInput.dailyDistanceKm}
              displayValue={`${simInput.dailyDistanceKm} km/hari (${simInput.dailyDistanceKm * 30} km/bln)`}
              onChange={(dailyDistanceKm) => updateSim({ dailyDistanceKm })}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Jenis BBM Saat Ini">
                <SelectInput
                  value={simInput.fuelCode}
                  onChange={(e) => updateSim({ fuelCode: e.target.value })}
                >
                  {fuels.map((f) => (
                    <option key={f.code} value={f.code}>
                      {f.displayName} ({formatIdr(f.pricePerUnitIdr)}/L)
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Daya Listrik Rumah">
                <SelectInput
                  value={simInput.homePowerVa}
                  onChange={(e) => updateSim({ homePowerVa: Number(e.target.value) })}
                >
                  <option value={450}>450 VA</option>
                  <option value={900}>900 VA</option>
                  <option value={1300}>1.300 VA</option>
                  <option value={2200}>2.200 VA</option>
                  <option value={3500}>3.500 VA</option>
                </SelectInput>
              </Field>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                className="flex-1"
                onClick={() => navigate(`/konsultasi?pathway=${simInput.pathway}`)}
              >
                Lanjut Konsultasi Chatbot
              </Button>
              <Button variant="outline" onClick={() => navigate('/hasil/teaser')}>
                Lihat Ringkasan Hasil
              </Button>
            </div>
          </Card>

          <Card className="flex flex-col justify-between space-y-5 bg-gradient-to-br from-white to-tint/50 @3xl:col-span-6">
            {calc ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge tone="brand">Rekomendasi Awal</Badge>
                    <span className="text-xs font-semibold text-mute">
                      {calc.ev.brand} {calc.ev.modelName}
                    </span>
                  </div>
                  <MetricCard
                    tone={calc.comparison.isNegativeSaving ? 'warn' : 'ok'}
                    label={
                      calc.comparison.isNegativeSaving
                        ? 'Selisih Biaya Operasional Bulanan'
                        : 'Estimasi Penghematan Operasional'
                    }
                    value={`${formatIdr(calc.comparison.monthlyOperationalSavingIdr)} / bln`}
                    subtext={`BBM + servis: ${formatIdr(calc.ice.monthlyOperationalIdr)} vs EV: ${formatIdr(calc.evEnergy.monthlyOperationalIdr)}`}
                  />
                  <CompareBarChart
                    items={[
                      {
                        label: `Kendaraan BBM (${simInput.customIceName})`,
                        value: calc.ice.monthlyOperationalIdr,
                        formattedValue: `${formatIdr(calc.ice.monthlyOperationalIdr)}/bln`,
                        color: '#64748b',
                      },
                      {
                        label: `EV (${calc.ev.brand} ${calc.ev.modelName})`,
                        value: calc.ev.otrPriceIdr > 0 ? calc.evEnergy.monthlyOperationalIdr : 0,
                        formattedValue: `${formatIdr(calc.evEnergy.monthlyOperationalIdr)}/bln`,
                        color: '#2563eb',
                      },
                    ]}
                  />
                </div>
                <div className="rounded-xl border border-blue-200 bg-white p-3.5 text-xs text-mute">
                  Estimasi titik balik modal (payback) 5 tahun:{' '}
                  <strong className="num text-ink">{calc.tco.paybackLabel}</strong> dengan tarif PLN{' '}
                  <strong className="num text-ink">
                    {formatIdr(calc.plnTariff.pricePerUnitIdr)}/kWh
                  </strong>
                  .
                </div>
              </>
            ) : (
              <Skeleton className="h-56" />
            )}
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}

export function ChatbotConsultationPage() {
  const {
    bootstrap,
    simInput,
    updateSim,
    selectEvModel,
    selectIcePreset,
    saveCurrentSimulation,
  } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const p = searchParams.get('pathway');
    if (p === 'A' || p === 'B') {
      updateSim({ pathway: p });
    }
    void api.recordFunnelEvent('CHATBOT_START', p === 'B' ? 'B' : 'A');
  }, [searchParams, updateSim]);

  const fuels = (bootstrap?.energyTariffs ?? []).filter((t) => t.category === 'BBM' && t.isActive);
  const presets = (bootstrap?.icePresets ?? []).filter(
    (p) => p.vehicleType === simInput.vehicleType,
  );

  const totalSteps = 5;

  const handleFinish = async () => {
    setSaving(true);
    try {
      const rec = recommendEvModel(
        bootstrap?.evModels ?? [],
        simInput.vehicleType,
        simInput.budgetIdr,
      );
      if (rec) selectEvModel(rec);

      const consult = await api.createConsultation({
        pathway: simInput.pathway,
        vehicleType: simInput.vehicleType,
        budgetIdr: simInput.budgetIdr,
        recommendedEvId: rec?.id ?? simInput.evModelId,
        answersPayload: {
          pathway: simInput.pathway,
          vehicleType: simInput.vehicleType,
          customIceName: simInput.customIceName,
          iceKmPerLiter: simInput.iceKmPerLiter,
          fuelCode: simInput.fuelCode,
          dailyDistanceKm: simInput.dailyDistanceKm,
          budgetIdr: simInput.budgetIdr,
          homePowerVa: simInput.homePowerVa,
        },
      });

      await saveCurrentSimulation(consult.consultationSessionId);
      navigate('/hasil/teaser');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan hasil konsultasi.');
      navigate('/hasil/teaser');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Card className="space-y-5 p-6">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <Badge tone="brand">Asisten Konsultasi EV MobilitiQ</Badge>
              <h1 className="mt-1 text-xl font-extrabold text-ink">
                Konsultasi {simInput.pathway === 'A' ? 'Jalur A (Beli Baru)' : 'Jalur B (Tukar Tambah BBM)'}
              </h1>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setStep(1);
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Ulangi</span>
            </Button>
          </div>

          <StepProgress current={step} total={totalSteps} />

          <div className="space-y-3 py-2">
            <ChatBubble sender="bot">
              Halo! Saya akan membantu menghitung kelayakan transisi kendaraan listrik Anda dalam 5
              pertanyaan singkat berdasarkan profil pemakaian nyata.
            </ChatBubble>

            {step >= 1 && (
              <>
                <ChatBubble sender="bot">
                  <strong>1.</strong> Pilih jalur kepemilikan dan jenis kendaraan yang ingin Anda
                  analisis:
                </ChatBubble>
                <div className="space-y-3 rounded-2xl border border-line bg-slate-50/70 p-4">
                  <div className="flex flex-wrap gap-2">
                    <FilterChip
                      active={simInput.pathway === 'A'}
                      onClick={() => updateSim({ pathway: 'A' })}
                    >
                      Jalur A · Belum Punya / Beli Baru
                    </FilterChip>
                    <FilterChip
                      active={simInput.pathway === 'B'}
                      onClick={() => updateSim({ pathway: 'B' })}
                    >
                      Jalur B · Sudah Punya Kendaraan BBM
                    </FilterChip>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <FilterChip
                      active={simInput.vehicleType === 'Motor'}
                      onClick={() => {
                        const p = bootstrap?.icePresets.find((x) => x.vehicleType === 'Motor');
                        if (p) selectIcePreset(p);
                        updateSim({
                          vehicleType: 'Motor',
                          budgetIdr: 35_000_000,
                          homeChargerKw: 0.4,
                        });
                      }}
                    >
                      Motor Listrik (Roda 2)
                    </FilterChip>
                    <FilterChip
                      active={simInput.vehicleType === 'Mobil'}
                      onClick={() => {
                        const p = bootstrap?.icePresets.find((x) => x.vehicleType === 'Mobil');
                        if (p) selectIcePreset(p);
                        updateSim({
                          vehicleType: 'Mobil',
                          budgetIdr: 250_000_000,
                          homeChargerKw: 2.2,
                        });
                      }}
                    >
                      Mobil Listrik (Roda 4)
                    </FilterChip>
                  </div>
                </div>
                <ChatBubble sender="user">
                  {simInput.pathway === 'A' ? 'Jalur A (Beli Baru)' : 'Jalur B (Ganti BBM)'} ·{' '}
                  {simInput.vehicleType}
                </ChatBubble>
              </>
            )}

            {step >= 2 && (
              <>
                <ChatBubble sender="bot">
                  <strong>2.</strong>{' '}
                  {simInput.pathway === 'B'
                    ? 'Kendaraan BBM apa yang Anda gunakan saat ini, berapa konsumsinya, dan jenis BBM yang dipakai?'
                    : 'Kendaraan BBM apa yang menjadi pembanding utama Anda beserta jenis BBM-nya?'}
                </ChatBubble>
                <div className="grid gap-3 rounded-2xl border border-line bg-slate-50/70 p-4 sm:grid-cols-2">
                  <Field label="Model Kendaraan BBM">
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
                  <Field label="Jenis BBM">
                    <SelectInput
                      value={simInput.fuelCode}
                      onChange={(e) => updateSim({ fuelCode: e.target.value })}
                    >
                      {fuels.map((f) => (
                        <option key={f.code} value={f.code}>
                          {f.displayName} ({formatIdr(f.pricePerUnitIdr)}/L)
                        </option>
                      ))}
                    </SelectInput>
                  </Field>
                  <div className="sm:col-span-2">
                    <RangeSlider
                      label="Efisiensi BBM Rata-rata"
                      min={simInput.vehicleType === 'Motor' ? 20 : 6}
                      max={simInput.vehicleType === 'Motor' ? 75 : 28}
                      step={0.5}
                      value={simInput.iceKmPerLiter}
                      displayValue={`${simInput.iceKmPerLiter} km/liter`}
                      onChange={(iceKmPerLiter) => updateSim({ iceKmPerLiter })}
                    />
                  </div>
                </div>
                <ChatBubble sender="user">
                  {simInput.customIceName} · {simInput.iceKmPerLiter} km/L · {simInput.fuelCode}
                </ChatBubble>
              </>
            )}

            {step >= 3 && (
              <>
                <ChatBubble sender="bot">
                  <strong>3.</strong> Berapa rata-rata jarak tempuh harian Anda (pulang-pergi)?
                </ChatBubble>
                <div className="rounded-2xl border border-line bg-slate-50/70 p-4">
                  <RangeSlider
                    label="Jarak Tempuh Harian"
                    min={5}
                    max={180}
                    step={1}
                    value={simInput.dailyDistanceKm}
                    displayValue={`${simInput.dailyDistanceKm} km/hari (${simInput.dailyDistanceKm * 30} km/bln)`}
                    onChange={(dailyDistanceKm) => updateSim({ dailyDistanceKm })}
                  />
                </div>
                <ChatBubble sender="user">
                  {simInput.dailyDistanceKm} km per hari ({simInput.dailyDistanceKm * 30} km/bulan)
                </ChatBubble>
              </>
            )}

            {step >= 4 && (
              <>
                <ChatBubble sender="bot">
                  <strong>4.</strong> Berapa anggaran maksimal untuk unit kendaraan listrik yang
                  Anda incar?
                </ChatBubble>
                <div className="rounded-2xl border border-line bg-slate-50/70 p-4">
                  <RangeSlider
                    label="Anggaran Pembelian EV"
                    min={simInput.vehicleType === 'Motor' ? 15_000_000 : 140_000_000}
                    max={simInput.vehicleType === 'Motor' ? 60_000_000 : 850_000_000}
                    step={simInput.vehicleType === 'Motor' ? 1_000_000 : 10_000_000}
                    value={simInput.budgetIdr}
                    displayValue={formatIdr(simInput.budgetIdr)}
                    onChange={(budgetIdr) => updateSim({ budgetIdr })}
                  />
                </div>
                <ChatBubble sender="user">Anggaran maks. {formatIdr(simInput.budgetIdr)}</ChatBubble>
              </>
            )}

            {step >= 5 && (
              <>
                <ChatBubble sender="bot">
                  <strong>5.</strong> Terakhir, berapa daya meteran PLN di rumah Anda dan porsi
                  pengisian di rumah?
                </ChatBubble>
                <div className="space-y-3 rounded-2xl border border-line bg-slate-50/70 p-4">
                  <Field label="Daya Listrik Rumah (VA)">
                    <div className="flex flex-wrap gap-2">
                      {[450, 900, 1300, 2200, 3500].map((va) => (
                        <FilterChip
                          key={va}
                          active={simInput.homePowerVa === va}
                          onClick={() => updateSim({ homePowerVa: va })}
                        >
                          {va.toLocaleString('id-ID')} VA
                        </FilterChip>
                      ))}
                    </div>
                  </Field>
                  <RangeSlider
                    label="Porsi Pengisian di Rumah (vs SPKLU Publik)"
                    min={0}
                    max={100}
                    step={5}
                    value={simInput.homeChargingSharePct}
                    displayValue={`${simInput.homeChargingSharePct}% Rumah · ${100 - simInput.homeChargingSharePct}% SPKLU`}
                    onChange={(homeChargingSharePct) => updateSim({ homeChargingSharePct })}
                  />
                </div>
                <ChatBubble sender="user">
                  PLN {simInput.homePowerVa.toLocaleString('id-ID')} VA ·{' '}
                  {simInput.homeChargingSharePct}% isi daya di rumah
                </ChatBubble>
              </>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-line pt-4">
            <Button
              variant="outline"
              disabled={step === 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              Sebelumnya
            </Button>
            {step < totalSteps ? (
              <Button onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}>
                <span>Pertanyaan Berikutnya</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button disabled={saving} onClick={() => void handleFinish()}>
                {saving ? 'Menghitung Simulasi...' : 'Lihat Rekomendasi & Penghematan'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </PublicLayout>
  );
}

export function TeaserResultPage() {
  const { calc, simInput, user } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    void api.recordFunnelEvent('TEASER_VIEW', simInput.pathway);
  }, [simInput.pathway]);

  if (!calc) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-4xl p-8">
          <Skeleton className="h-72" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Card className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Badge tone="ok">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Hasil Analisis Awal Selesai</span>
              </Badge>
              <h1 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
                Rekomendasi Utama: {calc.ev.brand} {calc.ev.modelName}
              </h1>
              <p className="mt-1 text-sm text-mute">
                Dibandingkan dengan {simInput.customIceName} pada jarak tempuh{' '}
                {simInput.dailyDistanceKm} km/hari ({calc.monthlyKm} km/bulan).
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-mute">Harga OTR</div>
              <div className="num text-xl font-extrabold text-brand">
                {formatIdr(calc.ev.otrPriceIdr)}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              tone={calc.comparison.isNegativeSaving ? 'warn' : 'ok'}
              label={
                calc.comparison.isNegativeSaving
                  ? 'Selisih Operasional Bulanan'
                  : 'Penghematan Operasional'
              }
              value={`${formatIdr(calc.comparison.monthlyOperationalSavingIdr)}/bln`}
              subtext={
                calc.comparison.isNegativeSaving
                  ? 'Biaya energi EV sedikit lebih tinggi pada skenario ini'
                  : `Hemat ${calc.comparison.savingPct}% dari biaya BBM & servis`
              }
            />
            <MetricCard
              tone={calc.tco.isPaybackReached ? 'brand' : 'warn'}
              label="Estimasi Titik Balik Modal"
              value={calc.tco.paybackLabel}
              subtext={
                calc.tco.isPaybackReached
                  ? 'Tercapai dalam horizon analisis 5 tahun'
                  : 'Melebihi horizon kepemilikan 5 tahun'
              }
            />
            <MetricCard
              tone="default"
              label="Reduksi Emisi Tahunan"
              value={`${formatNumber(calc.emissions.annualReductionCo2Kg)} kg CO2`}
              subtext={`Setara serapan ${calc.emissions.equivalentTrees} pohon/tahun`}
            />
          </div>

          <Card className="bg-slate-50/70">
            <h2 className="mb-3 text-sm font-bold text-ink">
              Perbandingan Biaya Operasional Bulanan (Energi + Servis Rutin)
            </h2>
            <CompareBarChart
              items={[
                {
                  label: `${simInput.customIceName} (${calc.fuelTariff.displayName})`,
                  value: calc.ice.monthlyOperationalIdr,
                  formattedValue: formatIdr(calc.ice.monthlyOperationalIdr),
                  color: '#64748b',
                },
                {
                  label: `${calc.ev.brand} ${calc.ev.modelName} (${calc.plnTariff.displayName})`,
                  value: calc.evEnergy.monthlyOperationalIdr,
                  formattedValue: formatIdr(calc.evEnergy.monthlyOperationalIdr),
                  color: '#2563eb',
                },
              ]}
            />
          </Card>

          <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => navigate('/konsultasi')}>
              Ubah Jawaban Konsultasi
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => navigate('/peta')}
              >
                <MapPin className="h-4 w-4" />
                <span>Cek SPKLU & Showroom Terdekat</span>
              </Button>
              <Button onClick={() => navigate(user ? '/dashboard' : '/hasil')}>
                <span>
                  {user ? 'Buka Dashboard Simulator Lengkap' : 'Lihat Detail TCO 5 Tahun'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </PublicLayout>
  );
}

export function GuestDashboardPage() {
  const { calc, simInput, user, openAuthModal } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (!calc) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-5xl p-8">
          <Skeleton className="h-80" />
        </div>
      </PublicLayout>
    );
  }

  const monthLabels = Array.from({ length: 61 }, (_, i) => (i % 12 === 0 ? `Th ${i / 12}` : ''));

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
        <PageHeader
          eyebrow="Pratinjau Analisis Tamu"
          title={`Ringkasan Simulasi: ${calc.ev.brand} ${calc.ev.modelName}`}
          description="Ringkasan penghematan operasional terbuka untuk Anda. Masuk atau daftar gratis untuk membuka proyeksi TCO 60 bulan, dana cadangan baterai, dan unduh laporan PDF."
          actions={
            <Button onClick={() => openAuthModal('register_user', '/dashboard')}>
              Masuk / Daftar Gratis
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            tone={calc.comparison.isNegativeSaving ? 'warn' : 'ok'}
            label="Penghematan Operasional Bulanan"
            value={`${formatIdr(calc.comparison.monthlyOperationalSavingIdr)}/bln`}
            subtext={`${simInput.dailyDistanceKm} km/hari · PLN ${simInput.homePowerVa.toLocaleString('id-ID')} VA`}
          />
          <MetricCard
            tone="brand"
            label="Biaya Energi Listrik EV"
            value={`Rp ${formatNumber(calc.evEnergy.costPerKmIdr)} / km`}
            subtext={`${calc.evEnergy.monthlyKwh} kWh/bulan`}
          />
          <MetricCard
            tone={calc.homePower.status === 'aman' ? 'ok' : 'warn'}
            label="Status Daya Rumah"
            value={
              calc.homePower.status === 'aman'
                ? 'Aman'
                : calc.homePower.status === 'ketat'
                  ? 'Ketat'
                  : 'Perlu Tambah Daya'
            }
            subtext={`Beban puncak ${calc.homePower.totalLoadKw} kW dari maks. ${calc.homePower.maxCapacityKw} kW`}
          />
        </div>

        <BlurGate
          locked={!user}
          title="Buka Analisis TCO 5 Tahun, Degradasi Baterai & Laporan PDF A4"
          description="Buat akun gratis dalam 20 detik untuk mengakses seluruh 9 modul kalkulator mendalam, menyimpan riwayat simulasi, dan mengunduh dokumen laporan resmi."
          onUnlock={() => openAuthModal('register_user', '/dashboard')}
        >
          <div className="grid gap-6 p-6 @3xl:grid-cols-2">
            <Card>
              <h3 className="mb-3 text-sm font-bold text-ink">
                Kurva Akumulasi TCO 60 Bulan (ICE vs EV)
              </h3>
              <LineChart
                labels={monthLabels}
                crossoverIndex={calc.tco.paybackMonthIndex}
                formatY={(v) => formatMillionIdr(v)}
                series={[
                  { name: simInput.customIceName, color: '#64748b', values: calc.tco.iceCumulative60 },
                  {
                    name: `${calc.ev.brand} ${calc.ev.modelName}`,
                    color: '#2563eb',
                    values: calc.tco.evCumulative60,
                  },
                ]}
              />
            </Card>
            <Card className="space-y-3">
              <h3 className="text-sm font-bold text-ink">Komposisi Total Biaya 5 Tahun</h3>
              <StackedHorizontalBar
                title={simInput.customIceName}
                totalFormatted={formatMillionIdr(calc.tco.iceComponents.total5YearsIdr)}
                segments={[
                  {
                    label: 'Akuisisi',
                    value: calc.tco.iceComponents.acquisitionIdr,
                    color: '#475569',
                    formatted: formatMillionIdr(calc.tco.iceComponents.acquisitionIdr),
                  },
                  {
                    label: 'BBM',
                    value: calc.tco.iceComponents.energyIdr,
                    color: '#f59e0b',
                    formatted: formatMillionIdr(calc.tco.iceComponents.energyIdr),
                  },
                  {
                    label: 'Servis & Pajak',
                    value: calc.tco.iceComponents.maintenanceIdr + calc.tco.iceComponents.taxIdr,
                    color: '#94a3b8',
                    formatted: formatMillionIdr(
                      calc.tco.iceComponents.maintenanceIdr + calc.tco.iceComponents.taxIdr,
                    ),
                  },
                ]}
              />
              <StackedHorizontalBar
                title={`${calc.ev.brand} ${calc.ev.modelName}`}
                totalFormatted={formatMillionIdr(calc.tco.evComponents.total5YearsIdr)}
                segments={[
                  {
                    label: 'Akuisisi Bersih',
                    value: calc.tco.evComponents.acquisitionIdr,
                    color: '#1e40af',
                    formatted: formatMillionIdr(calc.tco.evComponents.acquisitionIdr),
                  },
                  {
                    label: 'Listrik',
                    value: calc.tco.evComponents.energyIdr,
                    color: '#2563eb',
                    formatted: formatMillionIdr(calc.tco.evComponents.energyIdr),
                  },
                  {
                    label: 'Dana Baterai & Servis',
                    value:
                      calc.tco.evComponents.batteryReserveIdr +
                      calc.tco.evComponents.maintenanceIdr,
                    color: '#10b981',
                    formatted: formatMillionIdr(
                      calc.tco.evComponents.batteryReserveIdr +
                        calc.tco.evComponents.maintenanceIdr,
                    ),
                  },
                ]}
              />
            </Card>
          </div>
        </BlurGate>
      </div>
    </PublicLayout>
  );
}

export function LoginPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <Card className="p-6 shadow-md">
          <div className="mb-4 space-y-1">
            <h1 className="text-xl font-extrabold text-ink">Masuk atau Daftar MobilitiQ</h1>
            <p className="text-xs text-mute">
              Kelola simulasi TCO kendaraan listrik, portal mitra showroom/SPKLU, atau administrasi.
            </p>
          </div>
          <AuthFormPanel />
        </Card>
      </div>
    </PublicLayout>
  );
}

export function SharedReportPage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [data, setData] = useState<{
    simulation: SavedSimulationDto;
    authorName: string;
    cityName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareToken) return;
    setLoading(true);
    api
      .getSharedSimulation(shareToken)
      .then((res) => setData(res))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Laporan bersama tidak ditemukan.'),
      )
      .finally(() => setLoading(false));
  }, [shareToken]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-4xl p-8">
          <Skeleton className="h-96" />
        </div>
      </PublicLayout>
    );
  }

  if (error || !data) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl p-8">
          <ErrorState message={error ?? 'Tautan laporan tidak valid.'} />
        </div>
      </PublicLayout>
    );
  }

  const sim = data.simulation;
  const c = sim.resultSnapshot;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-8 sm:px-6">
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <Badge tone="brand">
            <Compass className="h-3.5 w-3.5" />
            <span>Tautan Laporan TCO Terverifikasi (Snapshot Imutabel)</span>
          </Badge>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            <span>Cetak / Simpan PDF</span>
          </Button>
        </div>

        <Card className="print-a4-sheet space-y-6 p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-electric">
                Laporan Analisis Total Cost of Ownership (5 Tahun)
              </div>
              <h1 className="mt-1 text-2xl font-extrabold text-ink">
                {c.ev.brand} {c.ev.modelName} vs {sim.customIceName}
              </h1>
              <p className="mt-1 text-xs text-mute">
                Disusun untuk <strong>{data.authorName}</strong> · {data.cityName} ·{' '}
                {formatIndonesianDate(sim.createdAt)}
              </p>
            </div>
            <Badge tone={c.tco.isPaybackReached ? 'ok' : 'warn'}>
              Payback: {c.tco.paybackLabel}
            </Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard
              tone={c.comparison.isNegativeSaving ? 'warn' : 'ok'}
              label="Penghematan Operasional"
              value={`${formatIdr(c.comparison.monthlyOperationalSavingIdr)}/bln`}
            />
            <MetricCard
              tone="brand"
              label="Total TCO 5 Tahun EV"
              value={formatMillionIdr(c.tco.evComponents.total5YearsIdr)}
            />
            <MetricCard
              tone="default"
              label="Total TCO 5 Tahun BBM"
              value={formatMillionIdr(c.tco.iceComponents.total5YearsIdr)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-line p-4">
              <div className="mb-2 text-xs font-bold uppercase text-mute">Rincian Bulanan</div>
              <KeyValueRow label="Jarak Tempuh Bulanan" value={`${c.monthlyKm} km`} />
              <KeyValueRow label="BBM + Servis Konvensional" value={formatIdr(c.ice.monthlyOperationalIdr)} />
              <KeyValueRow label="Listrik + Servis EV" value={formatIdr(c.evEnergy.monthlyOperationalIdr)} />
              <KeyValueRow label="Dana Cadangan Baterai" value={formatIdr(c.sinkingFund.monthlyReserveIdr)} />
            </div>
            <div className="rounded-xl border border-line p-4">
              <div className="mb-2 text-xs font-bold uppercase text-mute">Kesiapan Teknis</div>
              <KeyValueRow label="Daya Rumah PLN" value={`${sim.inputSnapshot.homePowerVa.toLocaleString('id-ID')} VA`} />
              <KeyValueRow label="Beban Puncak Pengisian" value={`${c.homePower.totalLoadKw} / ${c.homePower.maxCapacityKw} kW`} />
              <KeyValueRow label="Estimasi SoH Tahun ke-5" value={`${c.degradation.sohAtOwnershipYear}%`} />
              <KeyValueRow label="Reduksi Emisi 5 Tahun" value={`${formatNumber(c.emissions.fiveYearReductionCo2Kg)} kg CO2`} />
            </div>
          </div>

          <p className="border-t border-line pt-4 text-[11px] leading-relaxed text-mute">
            Catatan Asumsi Snapshot ({formatIndonesianDate(sim.createdAt)}): Tarif{' '}
            {c.fuelTariff.displayName} {formatIdr(c.fuelTariff.pricePerUnitIdr)}/L · Tarif PLN{' '}
            {c.plnTariff.displayName} {formatIdr(c.plnTariff.pricePerUnitIdr)}/kWh · Tarif acuan
            SPKLU {formatIdr(c.spkluTariff.pricePerUnitIdr)}/kWh · Faktor daya MCB cos phi 0,85.
          </p>
        </Card>
      </div>
    </PublicLayout>
  );
}
