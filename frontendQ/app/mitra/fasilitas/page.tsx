"use client";

import React, { useEffect, useState } from "react";
import InteractiveLeafletMap, {
  type MapFacilityMarker,
} from "@/components/InteractiveLeafletMap";
import { apiFetch } from "@/lib/api";

const INITIAL_FACILITY_FORM = {
  name: "",
  category: "SPKLU" as "Showroom" | "SPKLU" | "SPBKLU",
  city: "Jakarta",
  address: "",
  latitude: "-6.2088",
  longitude: "106.8456",
  operatingHours: "24 Jam",
  contact: "021-1234567",
  powerSpec: "DC Ultra Fast 100 kW (CCS2)",
  operator: "Mitra EV Nusantara",
  active: true,
};

export default function MitraFasilitasPage() {
  const [facilities, setFacilities] = useState<MapFacilityMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(INITIAL_FACILITY_FORM);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function fetchFacilities() {
    setLoading(true);
    try {
      const res = await apiFetch("/facilities?activeOnly=false");
      setFacilities(res?.data ?? []);
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memuat daftar fasilitas EV.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFacilities();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(INITIAL_FACILITY_FORM);
    setErrorMsg(null);
    setFieldErrors({});
  }

  function handleEdit(fac: MapFacilityMarker) {
    setEditingId(fac.id);
    setErrorMsg(null);
    setSuccessMsg(null);
    setFieldErrors({});
    setForm({
      name: fac.name,
      category: fac.category,
      city: fac.city,
      address: fac.address,
      latitude: String(fac.latitude),
      longitude: String(fac.longitude),
      operatingHours: fac.operatingHours,
      contact: fac.contact,
      powerSpec: fac.powerSpec || "",
      operator: fac.operator || "",
      active: fac.active,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      };

      if (editingId !== null) {
        const res = await apiFetch(`/facilities/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSuccessMsg(res?.message || "Data fasilitas berhasil diperbarui.");
      } else {
        const res = await apiFetch("/facilities", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSuccessMsg(
          res?.message || "Lokasi fasilitas EV berhasil ditambahkan."
        );
      }

      resetForm();
      await fetchFacilities();
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal menyimpan lokasi fasilitas EV.");
      if (err?.errors) {
        setFieldErrors(err.errors);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(fac: MapFacilityMarker) {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await apiFetch(`/facilities/${fac.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ active: !fac.active }),
      });
      setSuccessMsg(res?.message || "Status lokasi fasilitas diperbarui.");
      await fetchFacilities();
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memperbarui status fasilitas.");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Kolom Form Tambah / Ubah Lokasi Fasilitas */}
      <div className="lg:col-span-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingId !== null
                ? "Ubah Lokasi Fasilitas EV"
                : "Tambah Lokasi Fasilitas EV Baru"}
            </h2>
            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Batal Ubah
              </button>
            )}
          </div>

          {errorMsg && (
            <div
              data-testid="mitra-facility-error"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
            >
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div
              data-testid="mitra-facility-success"
              className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800"
            >
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Fasilitas *
              </label>
              <input
                type="text"
                data-testid="facility-form-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: SPKLU Nusantara Rasuna Said"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-[11px] text-red-600">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Fasilitas *
                </label>
                <select
                  data-testid="facility-form-category"
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value as
                        | "Showroom"
                        | "SPKLU"
                        | "SPBKLU",
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="SPKLU">SPKLU (Charging)</option>
                  <option value="SPBKLU">SPBKLU (Tukar Baterai)</option>
                  <option value="Showroom">Showroom EV</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kota *
                </label>
                <select
                  data-testid="facility-form-city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="Jakarta">Jakarta</option>
                  <option value="Bandung">Bandung</option>
                  <option value="Surabaya">Surabaya</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Lengkap *
              </label>
              <input
                type="text"
                data-testid="facility-form-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Jl. HR Rasuna Said Kav. C-22, Jakarta Selatan"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
              {fieldErrors.address && (
                <p className="mt-1 text-[11px] text-red-600">
                  {fieldErrors.address}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Latitude (-90 s.d. 90) *
                </label>
                <input
                  type="number"
                  step="any"
                  data-testid="facility-form-lat"
                  value={form.latitude}
                  onChange={(e) =>
                    setForm({ ...form, latitude: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
                {fieldErrors.latitude && (
                  <p className="mt-1 text-[11px] text-red-600">
                    {fieldErrors.latitude}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Longitude (-180 s.d. 180) *
                </label>
                <input
                  type="number"
                  step="any"
                  data-testid="facility-form-lon"
                  value={form.longitude}
                  onChange={(e) =>
                    setForm({ ...form, longitude: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
                {fieldErrors.longitude && (
                  <p className="mt-1 text-[11px] text-red-600">
                    {fieldErrors.longitude}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jam Operasional *
                </label>
                <input
                  type="text"
                  data-testid="facility-form-hours"
                  value={form.operatingHours}
                  onChange={(e) =>
                    setForm({ ...form, operatingHours: e.target.value })
                  }
                  placeholder="24 Jam / 08:00 - 21:00 WIB"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kontak Layanan *
                </label>
                <input
                  type="text"
                  data-testid="facility-form-contact"
                  value={form.contact}
                  onChange={(e) =>
                    setForm({ ...form, contact: e.target.value })
                  }
                  placeholder="021-5551234 / 123"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Spesifikasi Daya / Layanan
                </label>
                <input
                  type="text"
                  value={form.powerSpec}
                  onChange={(e) =>
                    setForm({ ...form, powerSpec: e.target.value })
                  }
                  placeholder="DC Fast 60 kW (CCS2)"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operator
                </label>
                <input
                  type="text"
                  value={form.operator}
                  onChange={(e) =>
                    setForm({ ...form, operator: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              data-testid="facility-form-submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#1E40AF] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1E3A8A] disabled:opacity-50 transition"
            >
              {submitting
                ? "Menyimpan..."
                : editingId !== null
                ? "Simpan Perubahan Lokasi"
                : "Tambahkan Lokasi Fasilitas"}
            </button>
          </form>
        </div>
      </div>

      {/* Kolom Peta Pemilih Koordinat + Daftar Tabel Fasilitas */}
      <div className="lg:col-span-7 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Peta Pemilih Koordinat (Klik peta untuk mengisi Latitude & Longitude)
            </span>
          </div>
          <InteractiveLeafletMap
            facilities={facilities.filter((f) => f.active)}
            selectedFacilityId={editingId}
            onSelectFacility={(fac) => handleEdit(fac)}
            onMapClick={(lat, lon) =>
              setForm((prev) => ({
                ...prev,
                latitude: String(lat),
                longitude: String(lon),
              }))
            }
            heightClassName="h-[260px]"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Daftar Lokasi Fasilitas EV ({facilities.length})
            </h2>
            {loading && (
              <span className="text-xs font-medium text-blue-600">
                Memuat...
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 pr-3 font-semibold">Nama & Alamat</th>
                  <th className="py-2.5 px-2 font-semibold">Kategori</th>
                  <th className="py-2.5 px-2 font-semibold">Koordinat</th>
                  <th className="py-2.5 px-2 font-semibold">Status</th>
                  <th className="py-2.5 pl-2 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {facilities.map((fac) => (
                  <tr
                    key={fac.id}
                    data-testid={`mitra-facility-row-${fac.id}`}
                    className="hover:bg-slate-50/80"
                  >
                    <td className="py-3 pr-3">
                      <div className="font-bold text-slate-900">{fac.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {fac.city} • {fac.address}
                      </div>
                    </td>
                    <td className="py-3 px-2 font-medium">{fac.category}</td>
                    <td className="py-3 px-2 text-xs text-slate-600">
                      {fac.latitude}, {fac.longitude}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          fac.active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-300"
                        }`}
                      >
                        {fac.active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="py-3 pl-2 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        data-testid={`edit-facility-${fac.id}`}
                        onClick={() => handleEdit(fac)}
                        className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        data-testid={`toggle-facility-${fac.id}`}
                        onClick={() => handleToggleActive(fac)}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1E40AF] hover:bg-blue-100"
                      >
                        {fac.active ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

