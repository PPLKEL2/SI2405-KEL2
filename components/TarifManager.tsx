"use client";

import { useEffect, useMemo, useState } from "react";
import { BatteryCharging, Pencil, Zap, type LucideIcon } from "lucide-react";
import { FACILITY_STORAGE_KEY, SAMPLE_FACILITIES, type Facility } from "@/lib/facilities";
import { formatNumber } from "@/lib/format";
import {
  SAMPLE_TARIFFS,
  SERVICE_META,
  SERVICE_TYPES,
  tariffStatus,
  todayIso,
  validateTariff,
  type ServiceType,
  type Tariff,
  type TariffStatus,
} from "@/lib/tarif";

type FormState = { serviceType: ServiceType; facilityId: string; price: string; validFrom: string; validUntil: string };
const emptyForm: FormState = { serviceType: "CHARGING", facilityId: "", price: "", validFrom: "", validUntil: "" };
const storageKey = "mobilitiq-tariffs";

const SERVICE_ICONS: Record<ServiceType, LucideIcon> = { CHARGING: Zap, SWAP: BatteryCharging };
const STATUS_STYLES: Record<TariffStatus, { label: string; className: string; dot: string }> = {
  active: { label: "Berlaku", className: "bg-emerald-50 text-emerald-700", dot: "bg-safe" },
  upcoming: { label: "Akan datang", className: "bg-blue-50 text-brand", dot: "bg-action" },
  expired: { label: "Berakhir", className: "bg-slate-100 text-slate-500", dot: "bg-slate-400" },
};

const labelClass = "block text-sm font-medium text-slate-700";
const inputClass = "mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm text-foreground focus:border-action focus:outline-none focus:ring-2 focus:ring-blue-100";
const errorClass = "mt-1 text-xs font-medium text-danger";

function ServiceBadge({ type }: { type: ServiceType }) {
  const Icon = SERVICE_ICONS[type];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
      <Icon className="h-3.5 w-3.5 text-action" aria-hidden />{SERVICE_META[type].label}
    </span>
  );
}

function StatusBadge({ status }: { status: TariffStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.className}`}>
      <i className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />{style.label}
    </span>
  );
}

export function TarifManager() {
  const [facilities, setFacilities] = useState<Facility[]>(SAMPLE_FACILITIES);
  const [tariffs, setTariffs] = useState<Tariff[]>(SAMPLE_TARIFFS);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [serviceFilter, setServiceFilter] = useState<"" | ServiceType>("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [loaded, setLoaded] = useState(false);
  // Tanggal hari ini dibaca setelah mount agar hasil render server dan klien sama.
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    const savedFacilities = window.localStorage.getItem(FACILITY_STORAGE_KEY);
    const savedTariffs = window.localStorage.getItem(storageKey);
    // Local storage loads after hydration to keep server and client markup equal.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (savedFacilities) setFacilities(JSON.parse(savedFacilities));
    if (savedTariffs) setTariffs(JSON.parse(savedTariffs));
    setToday(todayIso());
    setLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(storageKey, JSON.stringify(tariffs));
  }, [tariffs, loaded]);

  const facilityById = useMemo(() => new Map(facilities.map((f) => [f.id, f])), [facilities]);
  const facilityOptions = facilities.filter((f) => f.category === SERVICE_META[form.serviceType].facilityCategory && (f.isActive || f.id === form.facilityId));
  const filtered = tariffs.filter((t) => !serviceFilter || t.serviceType === serviceFilter);

  const setField = (key: keyof FormState, value: string) =>
    setForm((current) => ({ ...current, [key]: value, ...(key === "serviceType" ? { facilityId: "" } : {}) }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const input = {
      facilityId: form.facilityId,
      serviceType: form.serviceType,
      price: form.price.trim() === "" ? Number.NaN : Number(form.price),
      validFrom: form.validFrom,
      validUntil: form.validUntil || null,
    };
    const found = validateTariff(input, facilityById.get(form.facilityId), tariffs, editingId ?? undefined);
    if (Object.keys(found).length) {
      setErrors(found);
      return setMessage({ text: "Periksa kembali isian yang ditandai.", ok: false });
    }
    if (editingId) setTariffs((current) => current.map((t) => (t.id === editingId ? { ...t, ...input } : t)));
    else setTariffs((current) => [...current, { ...input, id: crypto.randomUUID() }]);
    setForm(emptyForm); setEditingId(null); setErrors({}); setMessage({ text: "Tarif tersimpan", ok: true });
  };

  const edit = (tariff: Tariff) => {
    setEditingId(tariff.id);
    setForm({ serviceType: tariff.serviceType, facilityId: tariff.facilityId, price: String(tariff.price), validFrom: tariff.validFrom, validUntil: tariff.validUntil ?? "" });
    setErrors({}); setMessage(null); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chipClass = (active: boolean) =>
    `inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition ${active ? "border-action bg-action text-white" : "border-line bg-white text-slate-700 hover:border-action"}`;

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form onSubmit={submit} className="space-y-4 self-start rounded-2xl border border-line bg-white p-6 shadow-sm">
        <div><h2 className="text-lg font-bold">{editingId ? "Ubah tarif" : "Tambah tarif"}</h2><p className="mt-1 text-xs text-muted">Satuan mengikuti jenis layanan yang dipilih.</p></div>

        <label className={labelClass}>Jenis layanan
          <select value={form.serviceType} onChange={(e) => setField("serviceType", e.target.value)} className={inputClass}>
            {SERVICE_TYPES.map((type) => <option key={type} value={type}>{SERVICE_META[type].label} (per {SERVICE_META[type].unit})</option>)}
          </select>
        </label>

        <div>
          <label className={labelClass}>Fasilitas
            <select value={form.facilityId} onChange={(e) => setField("facilityId", e.target.value)} className={inputClass}>
              <option value="">Pilih {SERVICE_META[form.serviceType].facilityCategory}</option>
              {facilityOptions.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </label>
          {errors.facilityId && <p className={errorClass}>{errors.facilityId}</p>}
          {facilityOptions.length === 0 && <p className="mt-1 text-xs text-muted">Belum ada {SERVICE_META[form.serviceType].facilityCategory} aktif. Tambahkan dulu di Showroom &amp; Fasilitas.</p>}
        </div>

        <div>
          <label className={labelClass}>Nilai tarif (Rp per {SERVICE_META[form.serviceType].unit})
            <input type="number" min="0" step="any" value={form.price} onChange={(e) => setField("price", e.target.value)} placeholder="Contoh: 2466" className={inputClass} />
          </label>
          {errors.price && <p className={errorClass}>{errors.price}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Berlaku mulai<input type="date" value={form.validFrom} onChange={(e) => setField("validFrom", e.target.value)} className={inputClass} /></label>
            {errors.validFrom && <p className={errorClass}>{errors.validFrom}</p>}
          </div>
          <div>
            <label className={labelClass}>Berlaku sampai<input type="date" value={form.validUntil} onChange={(e) => setField("validUntil", e.target.value)} className={inputClass} /></label>
            {errors.validUntil && <p className={errorClass}>{errors.validUntil}</p>}
          </div>
        </div>
        <p className="text-xs text-muted">Kosongkan &quot;berlaku sampai&quot; jika tarif berlaku terus.</p>

        {message && <p role="status" className={`rounded-lg px-3 py-2 text-sm ${message.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{message.text}</p>}
        <div className="flex gap-2">
          <button className="h-11 rounded-lg bg-action px-5 text-sm font-semibold text-white transition hover:bg-blue-700">{editingId ? "Perbarui" : "Simpan"}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); setErrors({}); }} className="h-11 rounded-lg border border-line bg-white px-5 text-sm font-semibold hover:border-action">Batal</button>}
        </div>
      </form>

      <section className="min-w-0 rounded-2xl border border-line bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-lg font-bold">Daftar tarif</h2><p className="text-xs text-muted">{filtered.length} tarif sesuai filter.</p></div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setServiceFilter("")} className={chipClass(serviceFilter === "")}>Semua</button>
            {SERVICE_TYPES.map((type) => <button key={type} type="button" onClick={() => setServiceFilter(type)} className={chipClass(serviceFilter === type)}>{SERVICE_META[type].label}</button>)}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr><th className="px-3 py-3 font-semibold">Fasilitas</th><th className="px-3 py-3 font-semibold">Layanan</th><th className="px-3 py-3 font-semibold">Tarif</th><th className="px-3 py-3 font-semibold">Periode berlaku</th><th className="px-3 py-3 font-semibold">Status</th><th className="px-3 py-3 font-semibold">Aksi</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} className="px-3 py-10 text-center text-muted">Belum ada tarif yang sesuai filter.</td></tr>}
              {filtered.map((tariff) => (
                <tr key={tariff.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-3 font-semibold">{facilityById.get(tariff.facilityId)?.name ?? "Fasilitas tidak ditemukan"}</td>
                  <td className="px-3 py-3"><ServiceBadge type={tariff.serviceType} /></td>
                  <td className="px-3 py-3 font-heading font-bold">Rp {formatNumber(tariff.price, Number.isInteger(tariff.price) ? 0 : 2)}<span className="ml-1 text-xs font-medium text-muted">/ {SERVICE_META[tariff.serviceType].unit}</span></td>
                  <td className="px-3 py-3 text-muted">{tariff.validFrom} s/d {tariff.validUntil ?? "seterusnya"}</td>
                  <td className="px-3 py-3">{today && <StatusBadge status={tariffStatus(tariff, today)} />}</td>
                  <td className="px-3 py-3">
                    <button onClick={() => edit(tariff)} aria-label="Ubah tarif" title="Ubah" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-blue-50 hover:text-action"><Pencil className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
