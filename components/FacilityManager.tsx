"use client";

import { useEffect, useMemo, useState } from "react";
import { BatteryCharging, Pencil, Power, Store, Zap, type LucideIcon } from "lucide-react";
import {
  FACILITY_CATEGORIES,
  FACILITY_COLORS,
  FACILITY_STORAGE_KEY,
  SAMPLE_FACILITIES,
  type Facility,
  type FacilityCategory,
  validateFacility,
} from "@/lib/facilities";

type FormState = Omit<Facility, "id" | "isActive">;
const emptyForm: FormState = { name: "", category: "SPKLU", address: "", latitude: -6.2, longitude: 106.82, operationalHours: "", contact: "" };
const storageKey = FACILITY_STORAGE_KEY;

const CATEGORY_ICONS: Record<FacilityCategory, LucideIcon> = { Showroom: Store, SPKLU: Zap, SPBKLU: BatteryCharging };
const MAP_LABELS = [{ name: "Sudirman", x: 30, y: 28 }, { name: "Kuningan", x: 64, y: 22 }, { name: "Senayan", x: 14, y: 62 }, { name: "Kemang", x: 52, y: 80 }];

const labelClass = "block text-sm font-medium text-slate-700";
const fieldClass = "mt-1.5 w-full rounded-lg border border-line bg-white px-3 text-sm text-foreground focus:border-action focus:outline-none focus:ring-2 focus:ring-blue-100";
const inputClass = `${fieldClass} h-11`;
const textareaClass = `${fieldClass} py-2.5`;

function CategoryBadge({ category }: { category: FacilityCategory }) {
  const Icon = CATEGORY_ICONS[category];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
      <Icon className="h-3.5 w-3.5" style={{ color: FACILITY_COLORS[category] }} aria-hidden />{category}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
      <i className={`h-1.5 w-1.5 rounded-full ${active ? "bg-safe" : "bg-slate-400"}`} />{active ? "Aktif" : "Nonaktif"}
    </span>
  );
}

function MapPanel({ facilities, category }: { facilities: Facility[]; category: string }) {
  const visible = facilities.filter((f) => f.isActive && (!category || f.category === category));
  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-xl border border-line bg-[#eef2f6]" aria-label="Peta lokasi fasilitas">
      <div className="absolute -left-10 bottom-6 h-32 w-56 rotate-6 rounded-[40%] bg-emerald-100/70" />
      <div className="absolute -right-8 top-24 h-12 w-[70%] -rotate-12 rounded-full bg-sky-100" />
      <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(30deg,#fff_1px,transparent_1px),linear-gradient(120deg,#fff_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute inset-x-8 top-1/2 h-2.5 -rotate-12 rounded-full bg-white shadow-sm" />
      <div className="absolute inset-y-8 left-1/2 w-2.5 rotate-12 rounded-full bg-white shadow-sm" />
      {MAP_LABELS.map((label) => (
        <span key={label.name} className="absolute text-[11px] font-medium text-slate-400" style={{ left: `${label.x}%`, top: `${label.y}%` }}>{label.name}</span>
      ))}
      {visible.map((facility, index) => {
        const Icon = CATEGORY_ICONS[facility.category];
        return (
          <div key={facility.id} className="group absolute" style={{ left: `${18 + ((index * 31) % 68)}%`, top: `${22 + ((index * 43) % 57)}%` }}>
            <div className="flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white shadow-md" style={{ backgroundColor: FACILITY_COLORS[facility.category] }}>
              <Icon className="h-4 w-4 text-white" aria-hidden />
            </div>
            <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden w-52 -translate-x-1/2 rounded-xl border border-line bg-white p-3 text-xs text-muted shadow-lg group-hover:block">
              <strong className="text-sm text-foreground">{facility.name}</strong><br />{facility.category}<br />{facility.address}
            </div>
          </div>
        );
      })}
      <div className="absolute bottom-4 left-4 rounded-lg border border-line bg-white px-3 py-2 text-xs text-muted shadow-sm">{visible.length} fasilitas aktif tampil</div>
    </div>
  );
}

export function FacilityManager() {
  const [facilities, setFacilities] = useState<Facility[]>(SAMPLE_FACILITIES);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [category, setCategory] = useState<"" | FacilityCategory>("");
  const [status, setStatus] = useState<"" | "active" | "inactive">("");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      // Local storage loads after hydration to keep server and client markup equal.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFacilities(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(facilities));
  }, [facilities]);

  const filtered = useMemo(() => facilities.filter((f) => (!category || f.category === category) && (!status || (status === "active" ? f.isActive : !f.isActive))), [facilities, category, status]);
  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: ["latitude", "longitude"].includes(key) ? Number(value) : value }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const errors = validateFacility(form);
    if (Object.keys(errors).length) return setMessage({ text: Object.values(errors)[0] ?? "Data tidak valid", ok: false });
    if (editingId) setFacilities((current) => current.map((f) => f.id === editingId ? { ...f, ...form } : f));
    else setFacilities((current) => [...current, { ...form, id: crypto.randomUUID(), isActive: true }]);
    setForm(emptyForm); setEditingId(null); setMessage({ text: "Data fasilitas tersimpan", ok: true });
  };
  const edit = (facility: Facility) => { const { id, ...values } = facility; setEditingId(id); setForm(values); setMessage(null); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const deactivate = (id: string) => { if (window.confirm("Nonaktifkan fasilitas ini? Data tetap disimpan.")) setFacilities((current) => current.map((f) => f.id === id ? { ...f, isActive: false } : f)); };

  const chipClass = (active: boolean) =>
    `inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition ${active ? "border-action bg-action text-white" : "border-line bg-white text-slate-700 hover:border-action"}`;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div><h2 className="text-lg font-bold">{editingId ? "Ubah fasilitas" : "Tambah fasilitas"}</h2><p className="mt-1 text-xs text-muted">Nama, alamat, dan koordinat wajib diisi.</p></div>
          <label className={labelClass}>Nama fasilitas<input required value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} /></label>
          <label className={labelClass}>Kategori<select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputClass}>{FACILITY_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className={labelClass}>Alamat<textarea required value={form.address} onChange={(e) => update("address", e.target.value)} rows={2} className={textareaClass} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>Latitude<input required type="number" step="any" value={form.latitude} onChange={(e) => update("latitude", e.target.value)} className={inputClass} /></label>
            <label className={labelClass}>Longitude<input required type="number" step="any" value={form.longitude} onChange={(e) => update("longitude", e.target.value)} className={inputClass} /></label>
          </div>
          <label className={labelClass}>Jam operasional<input value={form.operationalHours} onChange={(e) => update("operationalHours", e.target.value)} className={inputClass} /></label>
          <label className={labelClass}>Kontak<input value={form.contact} onChange={(e) => update("contact", e.target.value)} className={inputClass} /></label>
          {message && <p role="status" className={`rounded-lg px-3 py-2 text-sm ${message.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{message.text}</p>}
          <div className="flex gap-2">
            <button className="h-11 rounded-lg bg-action px-5 text-sm font-semibold text-white transition hover:bg-blue-700">{editingId ? "Perbarui" : "Simpan"}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="h-11 rounded-lg border border-line bg-white px-5 text-sm font-semibold hover:border-action">Batal</button>}
          </div>
        </form>

        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="text-lg font-bold">Peta fasilitas</h2><p className="text-xs text-muted">Marker hanya menampilkan fasilitas aktif.</p></div>
            <div className="flex flex-wrap gap-3 text-xs text-muted">{FACILITY_CATEGORIES.map((item) => <span key={item} className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: FACILITY_COLORS[item] }} />{item}</span>)}</div>
          </div>
          <MapPanel facilities={facilities} category={category} />
        </section>
      </div>

      <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-lg font-bold">Daftar fasilitas</h2><p className="text-xs text-muted">{filtered.length} data sesuai filter.</p></div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setCategory("")} className={chipClass(category === "")}>Semua</button>
            {FACILITY_CATEGORIES.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={chipClass(category === item)}>{item}</button>)}
            <select value={status} onChange={(e) => setStatus(e.target.value as "" | "active" | "inactive")} aria-label="Filter status" className="h-9 rounded-lg border border-line bg-white px-3 text-sm"><option value="">Semua status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr><th className="px-3 py-3 font-semibold">Nama</th><th className="px-3 py-3 font-semibold">Kategori</th><th className="px-3 py-3 font-semibold">Alamat</th><th className="px-3 py-3 font-semibold">Koordinat</th><th className="px-3 py-3 font-semibold">Status</th><th className="px-3 py-3 font-semibold">Aksi</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} className="px-3 py-10 text-center text-muted">Tidak ada fasilitas yang sesuai filter.</td></tr>}
              {filtered.map((facility) => (
                <tr key={facility.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-3 font-semibold">{facility.name}</td>
                  <td className="px-3 py-3"><CategoryBadge category={facility.category} /></td>
                  <td className="px-3 py-3 text-muted">{facility.address}</td>
                  <td className="px-3 py-3 text-muted">{facility.latitude}, {facility.longitude}</td>
                  <td className="px-3 py-3"><StatusBadge active={facility.isActive} /></td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => edit(facility)} aria-label={`Ubah ${facility.name}`} title="Ubah" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-blue-50 hover:text-action"><Pencil className="h-4 w-4" /></button>
                      {facility.isActive && <button onClick={() => deactivate(facility.id)} aria-label={`Nonaktifkan ${facility.name}`} title="Nonaktifkan" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-danger"><Power className="h-4 w-4" /></button>}
                    </div>
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
