import React, { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  History,
  Plus,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  formatIdr,
  formatNumber,
  type AdminAnalyticsDto,
  type AdminPartnerVerificationDto,
  type EnergyTariffDto,
  type EnergyTariffHistoryDto,
  type EvIncentiveDto,
} from '@mobilitiq/shared';
import { api } from '@/lib/api';
import { formatIndonesianDate, formatIndonesianDateTime } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { PortalLayout } from '@/layouts/Layouts';
import { DonutChart, LineChart } from '@/components/ui/charts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Switch,
} from '@/components/ui/overlays';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  MetricCard,
  PageHeader,
  SegmentedTabs,
  SelectInput,
  Skeleton,
  StatusBadge,
  TextInput,
} from '@/components/ui/primitives';

export function SuperadminAnalyticsPage() {
  const [data, setData] = useState<AdminAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAdminAnalytics();
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat analitik platform.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  return (
    <PortalLayout portal="admin">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-64" />
        </div>
      ) : error || !data ? (
        <ErrorState message={error ?? 'Data analitik kosong'} onRetry={() => void loadAnalytics()} />
      ) : (
        <div className="space-y-6">
          <PageHeader
            eyebrow="Analitik Eksekutif Platform"
            title="Ringkasan Penggunaan & Konversi Transisi EV"
            description="Agregasi langsung dari sesi konsultasi chatbot, penyimpanan simulasi TCO, peristiwa funnel, dan mitra terverifikasi."
          />

          <div className="grid gap-4 sm:grid-cols-2 @3xl:grid-cols-4">
            <MetricCard
              tone="brand"
              label="Konsultasi (30 Hari)"
              value={formatNumber(data.totalConsultations30d)}
              subtext="Sesi chatbot terselesaikan"
            />
            <MetricCard
              tone="ok"
              label="Konversi Simpan Simulasi"
              value={`${data.savedToReportRatePct}%`}
              subtext="Konsultasi berlanjut ke laporan"
            />
            <MetricCard
              tone="default"
              label="Proporsi Jalur A vs B"
              value={`${data.pathwayAPct}% / ${data.pathwayBPct}%`}
              subtext="Beli baru vs ganti kendaraan BBM"
            />
            <MetricCard
              tone={data.pendingPartnersCount > 0 ? 'warn' : 'ok'}
              label="Mitra Terverifikasi"
              value={`${data.verifiedPartnersCount} Aktif`}
              subtext={`${data.pendingPartnersCount} pengajuan menunggu review`}
            />
          </div>

          <div className="grid gap-6 @3xl:grid-cols-12">
            <Card className="@3xl:col-span-7">
              <h2 className="mb-3 text-sm font-bold text-ink">
                Tren Mingguan Konsultasi & Penyimpanan Simulasi (12 Minggu)
              </h2>
              <LineChart
                labels={data.weeklyTrend12w.map((w) => w.label)}
                series={[
                  {
                    name: 'Sesi Konsultasi',
                    color: '#2563eb',
                    values: data.weeklyTrend12w.map((w) => w.consultations),
                  },
                  {
                    name: 'Simulasi Disimpan',
                    color: '#10b981',
                    values: data.weeklyTrend12w.map((w) => w.savedSimulations),
                  },
                ]}
              />
            </Card>

            <Card className="space-y-4 @3xl:col-span-5">
              <h2 className="text-sm font-bold text-ink">Distribusi Kategori Simulasi EV</h2>
              <DonutChart
                centerLabel="Total Simulasi"
                centerValue={formatNumber(
                  data.vehicleSplit.motorCount + data.vehicleSplit.mobilCount,
                )}
                segments={[
                  {
                    label: `Motor Listrik (${data.vehicleSplit.motorCount})`,
                    value: data.vehicleSplit.motorCount || 62,
                    color: '#2563eb',
                  },
                  {
                    label: `Mobil Listrik (${data.vehicleSplit.mobilCount})`,
                    value: data.vehicleSplit.mobilCount || 38,
                    color: '#10b981',
                  },
                ]}
              />

              <div className="border-t border-line pt-3">
                <div className="mb-2 text-xs font-bold text-ink">Sebaran Kota Operasional</div>
                <div className="space-y-1.5 text-xs">
                  {data.topCities.map((c) => (
                    <div key={c.cityName} className="flex items-center justify-between">
                      <span className="font-semibold text-ink">{c.cityName}</span>
                      <span className="num text-mute">
                        {c.facilitiesCount} fasilitas · {c.simulationsCount} simulasi akun
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <Card className="space-y-3">
            <h2 className="text-sm font-bold text-ink">Corong Konversi Pengguna (6 Tahap)</h2>
            <div className="space-y-2.5">
              {data.funnelStages.map((st) => (
                <div key={st.stageName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink">{st.label}</span>
                    <span className="num font-bold text-brand">
                      {formatNumber(st.count)} ({st.pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-electric"
                      style={{ width: `${Math.max(3, st.pct)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </PortalLayout>
  );
}

export function SuperadminEnergyTariffPage() {
  const { reloadBootstrap } = useApp();

  const [tariffs, setTariffs] = useState<EnergyTariffDto[]>([]);
  const [histories, setHistories] = useState<EnergyTariffHistoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EnergyTariffDto | null>(null);
  const [priceInput, setPriceInput] = useState(0);
  const [upgradeFeeInput, setUpgradeFeeInput] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, hRes] = await Promise.all([
        api.listAdminEnergyTariffs(),
        api.listAdminTariffHistories(),
      ]);
      setTariffs(tRes.items);
      setHistories(hRes.items);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memuat tarif energi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const openEdit = (t: EnergyTariffDto) => {
    setEditing(t);
    setPriceInput(t.pricePerUnitIdr);
    setUpgradeFeeInput(t.upgradeFeeIdr ?? '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await api.updateAdminEnergyTariff(editing.id, {
        pricePerUnitIdr: priceInput,
        upgradeFeeIdr:
          editing.category === 'PLN' && upgradeFeeInput !== ''
            ? Number(upgradeFeeInput)
            : editing.upgradeFeeIdr,
      });
      toast.success(`Tarif ${editing.displayName} diperbarui dan tercatat ke log audit.`);
      setEditing(null);
      await Promise.all([loadAll(), reloadBootstrap()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui tarif energi.');
    } finally {
      setSaving(false);
    }
  };

  const bbmList = tariffs.filter((t) => t.category === 'BBM');
  const plnList = tariffs.filter((t) => t.category === 'PLN');
  const spkluList = tariffs.filter((t) => t.category === 'SPKLU_REF');

  return (
    <PortalLayout portal="admin">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Parameter Sistem · KEL2-69"
          title="Manajemen Tarif Energi Nasional (BBM, PLN & SPKLU)"
          description="Perubahan tarif langsung berlaku pada seluruh simulasi baru serta tercatat otomatis ke tabel audit riwayat tarif, tanpa merusak snapshot laporan lama."
        />

        {loading ? (
          <Skeleton className="h-80" />
        ) : (
          <>
            <Card className="overflow-x-auto p-0">
              <div className="border-b border-line p-4">
                <h2 className="text-sm font-bold text-ink">1. Tarif Bahan Bakar Minyak (BBM)</h2>
              </div>
              <table className="w-full min-w-[600px] text-left text-xs">
                <thead>
                  <tr className="border-b border-line bg-slate-50 text-mute">
                    <th className="p-4">Jenis BBM</th>
                    <th className="p-4">Kategori Subsidi</th>
                    <th className="p-4">Harga per Liter</th>
                    <th className="p-4">Faktor Emisi</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {bbmList.map((t) => (
                    <tr key={t.id}>
                      <td className="p-4 font-bold text-ink">{t.displayName}</td>
                      <td className="p-4">
                        <Badge tone={t.subsidyType === 'Subsidi' ? 'warn' : 'neutral'}>
                          {t.subsidyType}
                        </Badge>
                      </td>
                      <td className="num p-4 font-bold text-brand">
                        {formatIdr(t.pricePerUnitIdr)} / {t.unitLabel}
                      </td>
                      <td className="num p-4 text-mute">{t.emissionKgCo2PerUnit} kg CO2/L</td>
                      <td className="p-4 text-right">
                        <Button size="sm" variant="outline" onClick={() => openEdit(t)}>
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Ubah Tarif</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <Card className="overflow-x-auto p-0">
              <div className="border-b border-line p-4">
                <h2 className="text-sm font-bold text-ink">
                  2. Tarif Dasar Listrik Rumah Tangga PLN & Acuan SPKLU Publik
                </h2>
              </div>
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead>
                  <tr className="border-b border-line bg-slate-50 text-mute">
                    <th className="p-4">Golongan Daya</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Tarif per kWh</th>
                    <th className="p-4">Biaya Tambah Daya Acuan</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {[...plnList, ...spkluList].map((t) => (
                    <tr key={t.id}>
                      <td className="p-4 font-bold text-ink">{t.displayName}</td>
                      <td className="p-4">
                        <Badge
                          tone={
                            t.category === 'SPKLU_REF'
                              ? 'brand'
                              : t.subsidyType === 'Subsidi'
                                ? 'warn'
                                : 'neutral'
                          }
                        >
                          {t.category === 'SPKLU_REF' ? 'SPKLU Publik' : t.subsidyType}
                        </Badge>
                      </td>
                      <td className="num p-4 font-bold text-brand">
                        Rp {formatNumber(t.pricePerUnitIdr, 2)} / kWh
                      </td>
                      <td className="num p-4 text-mute">
                        {t.upgradeFeeIdr !== null && t.upgradeFeeIdr > 0
                          ? formatIdr(t.upgradeFeeIdr)
                          : '-'}
                      </td>
                      <td className="p-4 text-right">
                        <Button size="sm" variant="outline" onClick={() => openEdit(t)}>
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Ubah Tarif</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <Card className="overflow-x-auto p-0">
              <div className="flex items-center gap-2 border-b border-line p-4">
                <History className="h-4 w-4 text-electric" />
                <h2 className="text-sm font-bold text-ink">
                  3. Log Audit Riwayat Perubahan Tarif Energi
                </h2>
              </div>
              {histories.length === 0 ? (
                <div className="p-6 text-xs text-mute">Belum ada log perubahan tarif.</div>
              ) : (
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-line bg-slate-50 text-mute">
                      <th className="p-4">Waktu Berlaku</th>
                      <th className="p-4">Komoditas Tarif</th>
                      <th className="p-4">Harga Sebelumnya</th>
                      <th className="p-4">Harga Baru</th>
                      <th className="p-4">Diubah Oleh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {histories.map((h) => (
                      <tr key={h.id}>
                        <td className="p-4 text-mute">
                          {formatIndonesianDateTime(h.effectiveFrom)}
                        </td>
                        <td className="p-4 font-bold text-ink">{h.tariffName}</td>
                        <td className="num p-4 text-mute">
                          Rp {formatNumber(h.oldPriceIdr, 2)}
                        </td>
                        <td className="num p-4 font-bold text-brand">
                          Rp {formatNumber(h.newPriceIdr, 2)}
                        </td>
                        <td className="p-4">{h.changedByName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </>
        )}

        <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Perbarui Tarif: {editing?.displayName}</DialogTitle>
              <DialogDescription>
                Perubahan harga satuan akan dicatat ke riwayat audit tarif energi secara permanen.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <Field label={`Harga Satuan Baru (Rp per ${editing?.unitLabel ?? 'unit'})`}>
                <TextInput
                  type="number"
                  step="0.01"
                  required
                  min={100}
                  value={priceInput}
                  onChange={(e) => setPriceInput(Number(e.target.value))}
                />
              </Field>
              {editing?.category === 'PLN' && (
                <Field label="Biaya Acuan Tambah Daya ke Golongan Ini (Rp)">
                  <TextInput
                    type="number"
                    min={0}
                    value={upgradeFeeInput}
                    onChange={(e) =>
                      setUpgradeFeeInput(e.target.value === '' ? '' : Number(e.target.value))
                    }
                  />
                </Field>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditing(null)}>
                  Batal
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan & Catat Audit'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
}

export function SuperadminIncentivePage() {
  const { reloadBootstrap } = useApp();

  const [items, setItems] = useState<EvIncentiveDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: '',
    policyName: '',
    applicableVehicleType: 'Mobil' as 'Mobil' | 'Motor' | 'Semua EV',
    calculationType: 'percentage' as 'percentage' | 'fixed_idr' | 'tax_exemption',
    benefitValue: 10,
    benefitDisplayText: '10% dari harga',
    legalBasis: 'PMK Terbaru · Berlaku s.d. 31 Des 2026',
    isActive: true,
  });

  const loadIncentives = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listAdminIncentives();
      setItems(res.items);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memuat kebijakan insentif.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadIncentives();
  }, [loadIncentives]);

  const handleToggle = async (item: EvIncentiveDto, isActive: boolean) => {
    try {
      await api.patchAdminIncentive(item.id, { isActive });
      setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, isActive } : x)));
      await reloadBootstrap();
      toast.success(
        `Kebijakan ${item.policyName} ${isActive ? 'diaktifkan' : 'dinonaktifkan'}.`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui status insentif.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createAdminIncentive(form);
      toast.success('Kebijakan insentif baru berhasil ditambahkan.');
      setCreateOpen(false);
      await Promise.all([loadIncentives(), reloadBootstrap()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menambah insentif.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalLayout portal="admin">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Regulasi Fiskal EV"
          title="Manajemen Kebijakan Pajak & Insentif Pemerintah"
          description="Aktifkan atau nonaktifkan PPN DTP, subsidi pembelian motor listrik, serta pembebasan PKB/BBN-KB yang mempengaruhi kalkulator pembelian pengguna."
          actions={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              <span>Tambah Kebijakan</span>
            </Button>
          }
        />

        {loading ? (
          <Skeleton className="h-64" />
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead>
                <tr className="border-b border-line bg-slate-50 text-mute">
                  <th className="p-4">Nama Kebijakan & Dasar Hukum</th>
                  <th className="p-4">Cakupan</th>
                  <th className="p-4">Besaran Manfaat</th>
                  <th className="p-4">Status Berlaku</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((inc) => (
                  <tr key={inc.id}>
                    <td className="p-4">
                      <div className="font-bold text-ink">{inc.policyName}</div>
                      <div className="mt-0.5 text-mute">{inc.legalBasis}</div>
                    </td>
                    <td className="p-4">
                      <Badge tone="neutral">{inc.applicableVehicleType}</Badge>
                    </td>
                    <td className="num p-4 font-bold text-brand">{inc.benefitDisplayText}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={inc.isActive}
                          onCheckedChange={(chk) => void handleToggle(inc, chk)}
                        />
                        <Badge tone={inc.isActive ? 'ok' : 'neutral'}>
                          {inc.isActive ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Tambah Kebijakan Insentif EV</DialogTitle>
              <DialogDescription>
                Daftarkan skema insentif fiskal atau keringanan pajak daerah baru.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Kode Kebijakan">
                  <TextInput
                    required
                    placeholder="INSENTIF_DAERAH_2026"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                  />
                </Field>
                <Field label="Cakupan Kendaraan">
                  <SelectInput
                    value={form.applicableVehicleType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        applicableVehicleType: e.target.value as typeof form.applicableVehicleType,
                      })
                    }
                  >
                    <option value="Mobil">Mobil</option>
                    <option value="Motor">Motor</option>
                    <option value="Semua EV">Semua EV</option>
                  </SelectInput>
                </Field>
              </div>

              <Field label="Nama Kebijakan">
                <TextInput
                  required
                  placeholder="Diskon Bea Balik Nama Daerah Khusus"
                  value={form.policyName}
                  onChange={(e) => setForm({ ...form, policyName: e.target.value })}
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Tipe Hitung">
                  <SelectInput
                    value={form.calculationType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        calculationType: e.target.value as typeof form.calculationType,
                      })
                    }
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed_idr">Nominal Tetap (Rp)</option>
                    <option value="tax_exemption">Pembebasan Pajak</option>
                  </SelectInput>
                </Field>
                <Field label="Nilai Angka">
                  <TextInput
                    type="number"
                    required
                    min={0}
                    value={form.benefitValue}
                    onChange={(e) => setForm({ ...form, benefitValue: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Label Tampilan">
                  <TextInput
                    required
                    placeholder="Rp 3.000.000 / 10%"
                    value={form.benefitDisplayText}
                    onChange={(e) => setForm({ ...form, benefitDisplayText: e.target.value })}
                  />
                </Field>
              </div>

              <Field label="Dasar Hukum & Masa Berlaku">
                <TextInput
                  required
                  value={form.legalBasis}
                  onChange={(e) => setForm({ ...form, legalBasis: e.target.value })}
                />
              </Field>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Kebijakan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
}

export function SuperadminPartnerVerificationPage() {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>(
    'ALL',
  );
  const [items, setItems] = useState<AdminPartnerVerificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<AdminPartnerVerificationDto | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadPartners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listAdminPartners(statusFilter);
      setItems(res.items);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memuat daftar Mitra.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadPartners();
  }, [loadPartners]);

  const handleApprove = async (p: AdminPartnerVerificationDto) => {
    setProcessingId(p.id);
    try {
      await api.verifyAdminPartner(p.id, { decision: 'APPROVED' });
      toast.success(`Mitra ${p.companyName} telah disetujui.`);
      await loadPartners();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Persetujuan gagal.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget) return;
    setProcessingId(rejectTarget.id);
    try {
      await api.verifyAdminPartner(rejectTarget.id, {
        decision: 'REJECTED',
        rejectionNote,
      });
      toast.success(`Pengajuan ${rejectTarget.companyName} ditolak beserta catatan perbaikan.`);
      setRejectTarget(null);
      setRejectionNote('');
      await loadPartners();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menolak pengajuan.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <PortalLayout portal="admin">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Tata Kelola Ekosistem"
          title="Verifikasi Pendaftaran Mitra Showroom, SPKLU & SPBKLU"
          description="Periksa kelengkapan 4 dokumen legal wajib sebelum memberikan izin publikasi katalog unit EV dan lokasi fasilitas peta."
          actions={
            <SegmentedTabs<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'ALL', label: 'Semua' },
                { value: 'PENDING', label: 'Menunggu' },
                { value: 'APPROVED', label: 'Disetujui' },
                { value: 'REJECTED', label: 'Ditolak' },
              ]}
            />
          }
        />

        {loading ? (
          <Skeleton className="h-72" />
        ) : items.length === 0 ? (
          <EmptyState
            title="Tidak Ada Pengajuan Mitra pada Filter Ini"
            description="Ubah tab filter status di kanan atas untuk meninjau daftar Mitra lainnya."
          />
        ) : (
          <div className="space-y-4">
            {items.map((p) => {
              const completedCount = p.documents.filter((d) => d.isComplete).length;
              const allDocsComplete = completedCount === p.documents.length && p.documents.length > 0;

              return (
                <Card key={p.id} className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={p.verificationStatus} />
                        <Badge tone="neutral">{p.partnerCategory}</Badge>
                        <span className="text-xs font-semibold text-mute">{p.cityName}</span>
                      </div>
                      <h2 className="mt-1.5 text-lg font-extrabold text-ink">{p.companyName}</h2>
                      <p className="text-xs text-mute">
                        PIC: <strong className="text-ink">{p.picName}</strong> ({p.picEmail}) ·
                        Diajukan {formatIndonesianDate(p.submittedAt)}
                      </p>
                    </div>
                    <Badge tone={allDocsComplete ? 'ok' : 'warn'}>
                      Dokumen Lengkap: {completedCount}/{p.documents.length}
                    </Badge>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {p.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-xl border border-line bg-slate-50/70 px-3 py-2 text-xs"
                      >
                        <span className="font-medium text-ink">{doc.docLabel}</span>
                        {doc.isComplete ? (
                          <span className="inline-flex items-center gap-1 font-bold text-ok-ink">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Lengkap
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-bad-ink">
                            <XCircle className="h-3.5 w-3.5" />
                            Belum Ada
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {p.rejectionNote && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-bad-ink">
                      <strong>Catatan Penolakan:</strong> {p.rejectionNote}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                    <span className="text-xs text-mute">
                      {!allDocsComplete
                        ? 'Persetujuan terkunci hingga ke-4 dokumen legal lengkap.'
                        : 'Seluruh dokumen legal siap disetujui.'}
                    </span>
                    <div className="flex items-center gap-2">
                      {p.verificationStatus !== 'REJECTED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={processingId === p.id}
                          onClick={() => {
                            setRejectTarget(p);
                            setRejectionNote(
                              p.rejectionNote ||
                                'Mohon lengkapi dokumen legal yang masih kosong.',
                            );
                          }}
                        >
                          Tolak Pengajuan
                        </Button>
                      )}
                      {p.verificationStatus !== 'APPROVED' && (
                        <Button
                          size="sm"
                          variant="ok"
                          disabled={!allDocsComplete || processingId === p.id}
                          onClick={() => void handleApprove(p)}
                        >
                          Setujui Mitra
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog
          open={Boolean(rejectTarget)}
          onOpenChange={(open) => !open && setRejectTarget(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tolak Pengajuan: {rejectTarget?.companyName}</DialogTitle>
              <DialogDescription>
                Catatan di bawah akan ditampilkan pada dashboard Mitra agar mereka dapat memperbaiki
                dokumen dan mengajukan ulang.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleConfirmReject} className="space-y-4">
              <Field label="Alasan Penolakan / Permintaan Perbaikan">
                <TextInput
                  required
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                />
              </Field>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRejectTarget(null)}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  disabled={processingId === rejectTarget?.id}
                >
                  Konfirmasi Penolakan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
}

