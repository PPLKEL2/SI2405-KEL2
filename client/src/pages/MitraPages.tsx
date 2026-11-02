import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  FileCheck2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  formatIdr,
  formatNumber,
  type EvModelDto,
  type FacilityDto,
  type FacilityType,
  type PartnerBatteryPriceDto,
  type PartnerDashboardDto,
  type PartnerDocumentDto,
  type VehicleType,
} from '@mobilitiq/shared';
import { api } from '@/lib/api';
import { formatIndonesianDate } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { PortalLayout } from '@/layouts/Layouts';
import { FacilityMap } from '@/components/map/FacilityMap';
import { MiniVerticalBarChart } from '@/components/ui/charts';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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
  SelectInput,
  Skeleton,
  StatusBadge,
  TextInput,
} from '@/components/ui/primitives';

export function MitraDashboardPage() {
  const { reloadBootstrap } = useApp();
  const [data, setData] = useState<PartnerDashboardDto | null>(null);
  const [docsDraft, setDocsDraft] = useState<PartnerDocumentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingDocs, setSavingDocs] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPartnerDashboard();
      setData(res);
      setDocsDraft(res.documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat ringkasan Mitra.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleSaveDocs = async (resubmit: boolean) => {
    setSavingDocs(true);
    try {
      await api.updatePartnerDocuments({
        documents: docsDraft.map((d) => ({
          docType: d.docType,
          isComplete: d.isComplete,
          fileUrl: d.isComplete
            ? d.fileUrl || `https://docs.mobilitiq.id/upload/${d.docType.toLowerCase()}.pdf`
            : null,
        })),
        resubmit,
      });
      toast.success(
        resubmit
          ? 'Dokumen legal diperbarui dan diajukan ulang ke Superadmin.'
          : 'Kelengkapan dokumen legal disimpan.',
      );
      await Promise.all([loadDashboard(), reloadBootstrap()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan dokumen.');
    } finally {
      setSavingDocs(false);
    }
  };

  return (
    <PortalLayout portal="mitra">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-64" />
        </div>
      ) : error || !data ? (
        <ErrorState message={error ?? 'Data Mitra kosong'} onRetry={() => void loadDashboard()} />
      ) : (
        <div className="space-y-6">
          <PageHeader
            eyebrow={`${data.partner.partnerCategory} · ${data.partner.cityName}`}
            title={data.partner.companyName}
            description={`Terdaftar sejak ${formatIndonesianDate(data.partner.submittedAt)} · PIC ${data.partner.picEmail}`}
            actions={<StatusBadge status={data.partner.verificationStatus} />}
          />

          {data.partner.verificationStatus !== 'APPROVED' && (
            <Card className="space-y-4 border-amber-200 bg-amber-50/60">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warn-ink" />
                <div>
                  <h2 className="text-sm font-bold text-warn-ink">
                    {data.partner.verificationStatus === 'REJECTED'
                      ? 'Pengajuan Mitra Perlu Diperbaiki'
                      : 'Akun Mitra Menunggu Verifikasi Superadmin'}
                  </h2>
                  <p className="mt-0.5 text-xs text-warn-ink/90">
                    {data.partner.rejectionNote ||
                      'Lengkapi ke-4 dokumen legal berikut agar Superadmin dapat menyetujui akses publikasi katalog unit EV dan titik fasilitas peta.'}
                  </p>
                </div>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {docsDraft.map((doc) => (
                  <label
                    key={doc.docType}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white px-3.5 py-2.5 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-ink">{doc.docLabel}</div>
                      <div className="text-[11px] text-mute">
                        {doc.isComplete ? 'Dokumen terunggah' : 'Belum diunggah'}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={doc.isComplete}
                      onChange={(e) =>
                        setDocsDraft((prev) =>
                          prev.map((x) =>
                            x.docType === doc.docType
                              ? { ...x, isComplete: e.target.checked }
                              : x,
                          ),
                        )
                      }
                      className="h-4 w-4 rounded border-line text-electric"
                    />
                  </label>
                ))}
              </div>

              <div className="flex justify-end">
                <Button
                  size="sm"
                  disabled={savingDocs}
                  onClick={() => void handleSaveDocs(true)}
                >
                  <FileCheck2 className="h-4 w-4" />
                  <span>
                    {savingDocs ? 'Mengirim...' : 'Simpan Dokumen & Ajukan Verifikasi'}
                  </span>
                </Button>
              </div>
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-2 @3xl:grid-cols-4">
            <MetricCard
              tone="brand"
              label="Unit Katalog Aktif"
              value={`${data.activeEvCount} / ${data.totalEvCount}`}
              subtext="Tampil di katalog & chatbot"
            />
            <MetricCard
              tone="ok"
              label="Titik Fasilitas Peta"
              value={`${data.activeFacilityCount} Lokasi`}
              subtext="SPKLU, SPBKLU & Showroom"
            />
            <MetricCard
              tone="default"
              label="Rekomendasi Chatbot (30 Hr)"
              value={formatNumber(data.monthlyRecommendationCount)}
              subtext="Kemunculan unit pada hasil simulasi"
            />
            <MetricCard
              tone="ok"
              label="Klik Rute & Test Drive (7 Hr)"
              value={formatNumber(data.weeklyTestDriveClicks)}
              subtext="Prospek pengguna terukur"
            />
          </div>

          <div className="grid gap-6 @3xl:grid-cols-12">
            <Card className="@3xl:col-span-6">
              <h2 className="text-sm font-bold text-ink">
                Tren Interaksi Test Drive & Petunjuk Arah (7 Hari Terakhir)
              </h2>
              <MiniVerticalBarChart items={data.leads7Days} />
            </Card>

            <Card className="space-y-3 @3xl:col-span-6">
              <h2 className="text-sm font-bold text-ink">Unit EV Paling Sering Direkomendasikan</h2>
              {data.topRecommendedUnits.length === 0 ? (
                <p className="text-xs text-mute">Belum ada unit EV terdaftar pada akun Mitra ini.</p>
              ) : (
                <div className="divide-y divide-line text-xs">
                  {data.topRecommendedUnits.map((u) => (
                    <div key={u.id} className="flex items-center justify-between py-2.5">
                      <div>
                        <div className="font-bold text-ink">{u.name}</div>
                        <div className="text-mute">{u.vehicleType}</div>
                      </div>
                      <div className="text-right">
                        <div className="num font-bold text-brand">
                          {u.recommendationCount} rekomendasi
                        </div>
                        <div className="num text-mute">{u.leadCount} klik prospek</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

interface EvFormState {
  brand: string;
  modelName: string;
  vehicleType: VehicleType;
  batteryKwh: number;
  otrPriceIdr: number;
  wltpRangeKm: number;
  consumptionKwh100km: number;
  acChargerKw: number;
  dcChargerKw: number;
  serviceCostPerKmIdr: number;
  warrantyLabel: string;
  promoLabel: string;
  comparableIceName: string;
  comparableIcePriceIdr: number;
  imageUrl: string;
  isActive: boolean;
}

const EMPTY_EV_FORM: EvFormState = {
  brand: '',
  modelName: '',
  vehicleType: 'Motor',
  batteryKwh: 2.5,
  otrPriceIdr: 28_000_000,
  wltpRangeKm: 90,
  consumptionKwh100km: 3.2,
  acChargerKw: 0.5,
  dcChargerKw: 0,
  serviceCostPerKmIdr: 14,
  warrantyLabel: '3 th / 30.000 km',
  promoLabel: '',
  comparableIceName: 'Honda Vario 125',
  comparableIcePriceIdr: 24_500_000,
  imageUrl: '',
  isActive: true,
};

export function MitraCatalogManagementPage() {
  const { user, reloadBootstrap } = useApp();
  const isApproved = user?.partner?.verificationStatus === 'APPROVED';

  const [items, setItems] = useState<EvModelDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EvFormState>(EMPTY_EV_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EvModelDto | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listPartnerEvModels();
      setItems(res.items);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memuat katalog Mitra.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_EV_FORM);
    setModalOpen(true);
  };

  const openEdit = (ev: EvModelDto) => {
    setEditingId(ev.id);
    setForm({
      brand: ev.brand,
      modelName: ev.modelName,
      vehicleType: ev.vehicleType,
      batteryKwh: ev.batteryKwh,
      otrPriceIdr: ev.otrPriceIdr,
      wltpRangeKm: ev.wltpRangeKm,
      consumptionKwh100km: ev.consumptionKwh100km,
      acChargerKw: ev.acChargerKw,
      dcChargerKw: ev.dcChargerKw,
      serviceCostPerKmIdr: ev.serviceCostPerKmIdr,
      warrantyLabel: ev.warrantyLabel,
      promoLabel: ev.promoLabel ?? '',
      comparableIceName: ev.comparableIceName,
      comparableIcePriceIdr: ev.comparableIcePriceIdr,
      imageUrl: ev.imageUrl ?? '',
      isActive: ev.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        promoLabel: form.promoLabel.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
      };
      if (editingId) {
        await api.updatePartnerEvModel(editingId, payload);
        toast.success('Spesifikasi unit EV berhasil diperbarui.');
      } else {
        await api.createPartnerEvModel(payload);
        toast.success('Unit EV baru berhasil ditambahkan ke katalog publik.');
      }
      setModalOpen(false);
      await Promise.all([loadItems(), reloadBootstrap()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan unit EV.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (ev: EvModelDto, next: boolean) => {
    try {
      await api.togglePartnerEvModelActive(ev.id, next);
      setItems((prev) => prev.map((x) => (x.id === ev.id ? { ...x, isActive: next } : x)));
      await reloadBootstrap();
      toast.success(`Status unit ${ev.brand} ${ev.modelName} diubah.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengubah status aktif.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deletePartnerEvModel(deleteTarget.id);
      toast.success(`Unit ${deleteTarget.brand} ${deleteTarget.modelName} diarsipkan.`);
      setDeleteTarget(null);
      await Promise.all([loadItems(), reloadBootstrap()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus unit.');
    }
  };

  return (
    <PortalLayout portal="mitra">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Manajemen Katalog · KEL2-57"
          title="Katalog Unit Kendaraan Listrik Mitra"
          description="Kelola spesifikasi lengkap baterai, konsumsi kWh/100km, daya charger AC/DC, harga OTR, dan garansi unit Anda."
          actions={
            <Button disabled={!isApproved} onClick={openCreate}>
              <Plus className="h-4 w-4" />
              <span>Tambah Unit EV</span>
            </Button>
          }
        />

        {!isApproved && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-warn-ink">
            Penambahan dan perubahan unit katalog baru aktif setelah akun Mitra Anda disetujui oleh
            Superadmin.
          </div>
        )}

        {loading ? (
          <Skeleton className="h-64" />
        ) : items.length === 0 ? (
          <EmptyState
            title="Belum Ada Unit EV"
            description="Tambahkan unit motor atau mobil listrik pertama showroom Anda agar muncul di katalog dan rekomendasi chatbot."
            action={
              isApproved ? (
                <Button size="sm" onClick={openCreate}>
                  Tambah Unit EV Pertama
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-[740px] text-left text-xs">
              <thead>
                <tr className="border-b border-line bg-slate-50 text-mute">
                  <th className="p-4">Unit EV</th>
                  <th className="p-4">Harga OTR</th>
                  <th className="p-4">Baterai & WLTP</th>
                  <th className="p-4">Konsumsi & Charger</th>
                  <th className="p-4">Tayang</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((ev) => (
                  <tr key={ev.id}>
                    <td className="p-4">
                      <div className="font-bold text-ink">
                        {ev.brand} {ev.modelName}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-mute">
                        <Badge tone="neutral">{ev.vehicleType}</Badge>
                        {ev.promoLabel && <Badge tone="ok">{ev.promoLabel}</Badge>}
                      </div>
                    </td>
                    <td className="num p-4 font-bold text-brand">{formatIdr(ev.otrPriceIdr)}</td>
                    <td className="num p-4">
                      {ev.batteryKwh} kWh · {ev.wltpRangeKm} km
                    </td>
                    <td className="num p-4">
                      {ev.consumptionKwh100km} kWh/100km · AC {ev.acChargerKw} kW
                    </td>
                    <td className="p-4">
                      <Switch
                        checked={ev.isActive}
                        disabled={!isApproved}
                        onCheckedChange={(chk) => void handleToggleActive(ev, chk)}
                      />
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={!isApproved}
                          onClick={() => openEdit(ev)}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Ubah</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={!isApproved}
                          onClick={() => setDeleteTarget(ev)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-bad" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Ubah Spesifikasi Unit EV' : 'Tambah Unit EV Baru'}
              </DialogTitle>
              <DialogDescription>
                Seluruh parameter teknis di bawah digunakan langsung oleh mesin kalkulasi TCO dan
                simulator energi pengguna.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Merek">
                  <TextInput
                    required
                    placeholder="Polytron / BYD"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  />
                </Field>
                <Field label="Nama Model">
                  <TextInput
                    required
                    placeholder="Fox-R / Atto 3"
                    value={form.modelName}
                    onChange={(e) => setForm({ ...form, modelName: e.target.value })}
                  />
                </Field>
                <Field label="Kategori">
                  <SelectInput
                    value={form.vehicleType}
                    onChange={(e) => {
                      const vt = e.target.value as VehicleType;
                      setForm({
                        ...form,
                        vehicleType: vt,
                        serviceCostPerKmIdr: vt === 'Motor' ? 14 : 89,
                      });
                    }}
                  >
                    <option value="Motor">Motor Listrik</option>
                    <option value="Mobil">Mobil Listrik</option>
                  </SelectInput>
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Harga OTR (Rp)">
                  <TextInput
                    type="number"
                    required
                    min={5_000_000}
                    value={form.otrPriceIdr}
                    onChange={(e) => setForm({ ...form, otrPriceIdr: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Kapasitas Baterai (kWh)">
                  <TextInput
                    type="number"
                    step="0.1"
                    required
                    min={0.5}
                    value={form.batteryKwh}
                    onChange={(e) => setForm({ ...form, batteryKwh: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Jarak Tempuh WLTP (km)">
                  <TextInput
                    type="number"
                    required
                    min={15}
                    value={form.wltpRangeKm}
                    onChange={(e) => setForm({ ...form, wltpRangeKm: Number(e.target.value) })}
                  />
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <Field label="Konsumsi (kWh/100km)">
                  <TextInput
                    type="number"
                    step="0.1"
                    required
                    min={1}
                    value={form.consumptionKwh100km}
                    onChange={(e) =>
                      setForm({ ...form, consumptionKwh100km: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Charger AC (kW)">
                  <TextInput
                    type="number"
                    step="0.05"
                    required
                    min={0.1}
                    value={form.acChargerKw}
                    onChange={(e) => setForm({ ...form, acChargerKw: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Charger DC (kW)">
                  <TextInput
                    type="number"
                    step="0.5"
                    required
                    min={0}
                    value={form.dcChargerKw}
                    onChange={(e) => setForm({ ...form, dcChargerKw: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Biaya Servis (Rp/km)">
                  <TextInput
                    type="number"
                    required
                    min={0}
                    value={form.serviceCostPerKmIdr}
                    onChange={(e) =>
                      setForm({ ...form, serviceCostPerKmIdr: Number(e.target.value) })
                    }
                  />
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Garansi Baterai">
                  <TextInput
                    required
                    placeholder="8 th / 160.000 km"
                    value={form.warrantyLabel}
                    onChange={(e) => setForm({ ...form, warrantyLabel: e.target.value })}
                  />
                </Field>
                <Field label="Label Promo (Opsional)">
                  <TextInput
                    placeholder="Gratis wallbox 7 kW"
                    value={form.promoLabel}
                    onChange={(e) => setForm({ ...form, promoLabel: e.target.value })}
                  />
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Kendaraan BBM Pembanding Setara">
                  <TextInput
                    required
                    placeholder="Honda Vario 125 / Toyota Avanza"
                    value={form.comparableIceName}
                    onChange={(e) => setForm({ ...form, comparableIceName: e.target.value })}
                  />
                </Field>
                <Field label="Harga OTR BBM Pembanding (Rp)">
                  <TextInput
                    type="number"
                    required
                    min={5_000_000}
                    value={form.comparableIcePriceIdr}
                    onChange={(e) =>
                      setForm({ ...form, comparableIcePriceIdr: Number(e.target.value) })
                    }
                  />
                </Field>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan Unit EV'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Arsipkan Unit dari Katalog?</AlertDialogTitle>
              <AlertDialogDescription>
                Unit {deleteTarget?.brand} {deleteTarget?.modelName} akan disembunyikan dari katalog
                baru, namun tetap terjaga pada snapshot riwayat simulasi pengguna lama.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={() => void handleDelete()}>
                Arsipkan Unit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PortalLayout>
  );
}

interface FacilityFormState {
  cityId: string;
  facilityName: string;
  facilityType: FacilityType;
  fullAddress: string;
  latitude: number;
  longitude: number;
  powerOrSlotSpec: string;
  operatingHours: string;
  serviceTariffIdr: number;
  tariffUnitLabel: string;
  isActive: boolean;
}

export function MitraFacilitiesManagementPage() {
  const { bootstrap, user } = useApp();
  const isApproved = user?.partner?.verificationStatus === 'APPROVED';

  const cities = bootstrap?.cities ?? [];
  const defaultCity = cities[0];

  const [items, setItems] = useState<FacilityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FacilityDto | null>(null);

  const [form, setForm] = useState<FacilityFormState>({
    cityId: defaultCity?.id ?? '',
    facilityName: '',
    facilityType: 'SPKLU',
    fullAddress: '',
    latitude: defaultCity?.centerLat ?? -6.2088,
    longitude: defaultCity?.centerLng ?? 106.8456,
    powerOrSlotSpec: 'DC 50 kW · CCS2',
    operatingHours: '24 jam',
    serviceTariffIdr: 2466,
    tariffUnitLabel: 'kWh',
    isActive: true,
  });

  const loadFacilities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listPartnerFacilities();
      setItems(res.items);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memuat fasilitas Mitra.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFacilities();
  }, [loadFacilities]);

  const openCreate = () => {
    const c = cities[0];
    setEditingId(null);
    setForm({
      cityId: c?.id ?? '',
      facilityName: '',
      facilityType: 'SPKLU',
      fullAddress: '',
      latitude: c?.centerLat ?? -6.2088,
      longitude: c?.centerLng ?? 106.8456,
      powerOrSlotSpec: 'DC 50 kW · CCS2',
      operatingHours: '24 jam',
      serviceTariffIdr: 2466,
      tariffUnitLabel: 'kWh',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (fac: FacilityDto) => {
    setEditingId(fac.id);
    setForm({
      cityId: fac.cityId,
      facilityName: fac.facilityName,
      facilityType: fac.facilityType,
      fullAddress: fac.fullAddress,
      latitude: fac.latitude,
      longitude: fac.longitude,
      powerOrSlotSpec: fac.powerOrSlotSpec,
      operatingHours: fac.operatingHours,
      serviceTariffIdr: fac.serviceTariffIdr,
      tariffUnitLabel: fac.tariffUnitLabel,
      isActive: fac.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.updatePartnerFacility(editingId, form);
        toast.success('Lokasi fasilitas berhasil diperbarui.');
      } else {
        await api.createPartnerFacility(form);
        toast.success('Titik fasilitas baru ditambahkan ke peta publik.');
      }
      setModalOpen(false);
      await loadFacilities();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan fasilitas.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deletePartnerFacility(deleteTarget.id);
      toast.success(`Titik ${deleteTarget.facilityName} dihapus dari peta.`);
      setDeleteTarget(null);
      await loadFacilities();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus fasilitas.');
    }
  };

  return (
    <PortalLayout portal="mitra">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Lokasi Peta · KEL2-71"
          title="Manajemen Titik Showroom, SPKLU & SPBKLU"
          description="Kelola alamat, spesifikasi konektor/slot, jam operasional, dan klik langsung di peta Leaflet untuk menetapkan koordinat GPS akurat."
          actions={
            <Button disabled={!isApproved} onClick={openCreate}>
              <Plus className="h-4 w-4" />
              <span>Tambah Lokasi Peta</span>
            </Button>
          }
        />

        {loading ? (
          <Skeleton className="h-64" />
        ) : items.length === 0 ? (
          <EmptyState
            title="Belum Ada Titik Lokasi"
            description="Daftarkan titik showroom, SPKLU, atau stasiun tukar baterai SPBKLU perusahaan Anda."
            action={
              isApproved ? (
                <Button size="sm" onClick={openCreate}>
                  Tambah Titik Lokasi
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead>
                <tr className="border-b border-line bg-slate-50 text-mute">
                  <th className="p-4">Nama & Alamat Fasilitas</th>
                  <th className="p-4">Tipe & Kota</th>
                  <th className="p-4">Spesifikasi & Jam</th>
                  <th className="p-4">Tarif Layanan</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((fac) => (
                  <tr key={fac.id}>
                    <td className="p-4">
                      <div className="font-bold text-ink">{fac.facilityName}</div>
                      <div className="mt-0.5 text-mute">{fac.fullAddress}</div>
                      <div className="num mt-0.5 text-[11px] text-slate-400">
                        GPS: {fac.latitude}, {fac.longitude}
                      </div>
                    </td>
                    <td className="p-4">
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
                      <div className="mt-1 font-semibold text-ink">{fac.cityName}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-ink">{fac.powerOrSlotSpec}</div>
                      <div className="text-mute">{fac.operatingHours}</div>
                    </td>
                    <td className="num p-4 font-bold text-brand">{fac.tariffDisplay}</td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={!isApproved}
                          onClick={() => openEdit(fac)}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Ubah</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={!isApproved}
                          onClick={() => setDeleteTarget(fac)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-bad" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Ubah Titik Lokasi Fasilitas' : 'Tambah Titik Fasilitas Peta'}
              </DialogTitle>
              <DialogDescription>
                Klik langsung pada peta di bawah untuk memindahkan pin koordinat latitude dan
                longitude secara presisi.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Kota">
                  <SelectInput
                    value={form.cityId}
                    onChange={(e) => {
                      const pickedCity = cities.find((c) => c.id === e.target.value);
                      setForm({
                        ...form,
                        cityId: e.target.value,
                        latitude: pickedCity?.centerLat ?? form.latitude,
                        longitude: pickedCity?.centerLng ?? form.longitude,
                      });
                    }}
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
                <Field label="Tipe Fasilitas">
                  <SelectInput
                    value={form.facilityType}
                    onChange={(e) => {
                      const ft = e.target.value as FacilityType;
                      setForm({
                        ...form,
                        facilityType: ft,
                        tariffUnitLabel:
                          ft === 'SPKLU'
                            ? 'kWh'
                            : ft === 'SPBKLU'
                              ? 'tukar'
                              : 'Test drive gratis',
                        serviceTariffIdr: ft === 'Showroom' ? 0 : form.serviceTariffIdr || 2466,
                      });
                    }}
                  >
                    <option value="SPKLU">SPKLU (Charging Station)</option>
                    <option value="SPBKLU">SPBKLU (Tukar Baterai)</option>
                    <option value="Showroom">Showroom Resmi EV</option>
                  </SelectInput>
                </Field>
                <Field label="Jam Operasional">
                  <TextInput
                    required
                    placeholder="24 jam / 09.00-19.00"
                    value={form.operatingHours}
                    onChange={(e) => setForm({ ...form, operatingHours: e.target.value })}
                  />
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nama Titik Lokasi">
                  <TextInput
                    required
                    placeholder="SPKLU Pondok Indah"
                    value={form.facilityName}
                    onChange={(e) => setForm({ ...form, facilityName: e.target.value })}
                  />
                </Field>
                <Field label="Spesifikasi Daya / Slot">
                  <TextInput
                    required
                    placeholder="DC 50 kW · CCS2 / Swap 8 slot"
                    value={form.powerOrSlotSpec}
                    onChange={(e) => setForm({ ...form, powerOrSlotSpec: e.target.value })}
                  />
                </Field>
              </div>

              <Field label="Alamat Lengkap">
                <TextInput
                  required
                  placeholder="Jl. Metro Pondok Indah Kav. IV, Jakarta Selatan"
                  value={form.fullAddress}
                  onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-4">
                <Field label="Tarif Layanan (Rp)">
                  <TextInput
                    type="number"
                    required
                    min={0}
                    value={form.serviceTariffIdr}
                    onChange={(e) =>
                      setForm({ ...form, serviceTariffIdr: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Satuan Tarif">
                  <TextInput
                    required
                    placeholder="kWh / tukar"
                    value={form.tariffUnitLabel}
                    onChange={(e) => setForm({ ...form, tariffUnitLabel: e.target.value })}
                  />
                </Field>
                <Field label="Latitude">
                  <TextInput
                    type="number"
                    step="0.000001"
                    required
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Longitude">
                  <TextInput
                    type="number"
                    step="0.000001"
                    required
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) })}
                  />
                </Field>
              </div>

              <FacilityMap
                center={[form.latitude, form.longitude]}
                zoom={13}
                facilities={[]}
                pickedLatLng={[form.latitude, form.longitude]}
                onPickLatLng={(latitude, longitude) =>
                  setForm((prev) => ({ ...prev, latitude, longitude }))
                }
                heightClassName="h-56"
              />

              <DialogFooter>
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan Lokasi'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Titik Fasilitas?</AlertDialogTitle>
              <AlertDialogDescription>
                Lokasi {deleteTarget?.facilityName} tidak lagi ditampilkan pada peta publik
                MobilitiQ.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={() => void handleDelete()}>
                Hapus Lokasi
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PortalLayout>
  );
}

export function MitraServicePricingPage() {
  const { user, reloadBootstrap } = useApp();
  const isApproved = user?.partner?.verificationStatus === 'APPROVED';

  const [facilities, setFacilities] = useState<FacilityDto[]>([]);
  const [batteryPrices, setBatteryPrices] = useState<PartnerBatteryPriceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [facRes, dashRes] = await Promise.all([
        api.listPartnerFacilities(),
        api.getPartnerDashboard(),
      ]);
      setFacilities(facRes.items);
      setBatteryPrices(dashRes.batteryPrices);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memuat daftar harga layanan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await api.savePartnerServicePricing({
        facilityRates: facilities.map((f) => ({
          facilityId: f.id,
          serviceTariffIdr: f.serviceTariffIdr,
        })),
        batteryPrices: batteryPrices.map((b) => ({
          evModelId: b.evModelId,
          replacementPriceIdr: b.replacementPriceIdr,
          warrantyNote: b.warrantyNote,
        })),
      });
      await Promise.all([loadData(), reloadBootstrap()]);
      toast.success('Tarif pengisian dan harga penggantian baterai berhasil diperbarui.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan pembaruan harga.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalLayout portal="mitra">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Pembaruan Harga Operasional"
          title="Tarif Layanan SPKLU/SPBKLU & Harga Penggantian Pak Baterai"
          description="Harga penggantian baterai di bawah menjadi acuan kalkulator Dana Cadangan Baterai (Sinking Fund) pengguna."
          actions={
            <Button disabled={!isApproved || saving} onClick={() => void handleSaveAll()}>
              <Save className="h-4 w-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Seluruh Harga'}</span>
            </Button>
          }
        />

        {loading ? (
          <Skeleton className="h-72" />
        ) : (
          <>
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-ink">
                  Tarif Pengisian SPKLU & Tukar Baterai SPBKLU Mitra
                </h2>
                <Badge tone="ok">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Sinkron Peta Publik</span>
                </Badge>
              </div>
              {facilities.length === 0 ? (
                <p className="text-xs text-mute">Belum ada titik fasilitas milik Mitra ini.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {facilities.map((fac) => (
                    <div
                      key={fac.id}
                      className="space-y-2 rounded-xl border border-line bg-slate-50/70 p-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-ink">{fac.facilityName}</span>
                        <Badge tone="neutral">{fac.facilityType}</Badge>
                      </div>
                      <Field label={`Tarif Layanan (Rp per ${fac.tariffUnitLabel})`}>
                        <TextInput
                          type="number"
                          min={0}
                          disabled={!isApproved}
                          value={fac.serviceTariffIdr}
                          onChange={(e) =>
                            setFacilities((prev) =>
                              prev.map((x) =>
                                x.id === fac.id
                                  ? { ...x, serviceTariffIdr: Number(e.target.value) }
                                  : x,
                              ),
                            )
                          }
                        />
                      </Field>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="overflow-x-auto p-0">
              <div className="border-b border-line p-4">
                <h2 className="text-sm font-bold text-ink">
                  Daftar Harga Penggantian Pak Baterai Resmi per Unit EV
                </h2>
              </div>
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead>
                  <tr className="border-b border-line bg-slate-50 text-mute">
                    <th className="p-4">Model EV</th>
                    <th className="p-4">Kapasitas</th>
                    <th className="p-4">Harga Ganti Baterai (Rp)</th>
                    <th className="p-4">Catatan Garansi Resmi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {batteryPrices.map((bp) => (
                    <tr key={bp.evModelId}>
                      <td className="p-4 font-bold text-ink">{bp.evName}</td>
                      <td className="num p-4">{bp.batteryKwh} kWh</td>
                      <td className="p-4">
                        <TextInput
                          type="number"
                          min={1_000_000}
                          disabled={!isApproved}
                          value={bp.replacementPriceIdr}
                          onChange={(e) =>
                            setBatteryPrices((prev) =>
                              prev.map((x) =>
                                x.evModelId === bp.evModelId
                                  ? { ...x, replacementPriceIdr: Number(e.target.value) }
                                  : x,
                              ),
                            )
                          }
                        />
                      </td>
                      <td className="p-4">
                        <TextInput
                          disabled={!isApproved}
                          value={bp.warrantyNote}
                          onChange={(e) =>
                            setBatteryPrices((prev) =>
                              prev.map((x) =>
                                x.evModelId === bp.evModelId
                                  ? { ...x, warrantyNote: e.target.value }
                                  : x,
                              ),
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </>
        )}
      </div>
    </PortalLayout>
  );
}

