"use client";

import React, { useState, useEffect, useId } from "react";
import type {
  EnergyCategory,
  EnergyTariff,
  EnergyTariffHistory,
  EnergyTariffInput,
} from "@/lib/types/energy-pricing";
import { formatIdr } from "@/lib/format";
import {
  getTariffPeriodStatus,
  ALLOWED_UNITS,
  validateEnergyTariffInput,
} from "@/lib/calculations/energy-pricing";
import { calculateEvEnergy } from "@/lib/calculations/ev";

export function EnergyPricingManagement() {
  const categorySelectId = useId();
  const unitSelectId = useId();

  // State Data
  const [tariffs, setTariffs] = useState<EnergyTariff[]>([]);
  const [histories, setHistories] = useState<EnergyTariffHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"tariffs" | "histories" | "simulation-test">("tariffs");

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTariff, setEditingTariff] = useState<EnergyTariff | null>(null);
  const [formData, setFormData] = useState<EnergyTariffInput>({
    code: "",
    name: "",
    category: "PLN_HOME",
    pricePerUnit: "",
    unit: "Rp/kWh",
    validFrom: "",
    validTo: "",
    isActive: true,
    notes: "",
    sourceLabel: "",
    sourceUrl: "",
    reason: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Interactive Simulation / Date Test State (KEL2-115 & KEL2-116)
  const [simTestDate, setSimTestDate] = useState<string>("2024-11-01");
  const [simDailyKm, setSimDailyKm] = useState<number>(30);
  const [simConsumption, setSimConsumption] = useState<number>(15);

  // Fetch data for manual refresh
  const fetchData = async () => {
    try {
      const [tariffsRes, historiesRes] = await Promise.all([
        fetch("/api/admin/energy-tariffs"),
        fetch("/api/admin/energy-tariffs/histories"),
      ]);

      const tariffsJson = await tariffsRes.json();
      const historiesJson = await historiesRes.json();

      if (tariffsJson.ok) {
        setTariffs(tariffsJson.data);
      }
      if (historiesJson.ok) {
        setHistories(historiesJson.data);
      }
    } catch {
      setFeedbackMessage({
        type: "error",
        text: "Gagal memuat data parameter tarif dari server.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    Promise.all([
      fetch("/api/admin/energy-tariffs").then((res) => res.json()),
      fetch("/api/admin/energy-tariffs/histories").then((res) => res.json()),
    ])
      .then(([tariffsJson, historiesJson]) => {
        if (!ignore) {
          if (tariffsJson.ok) setTariffs(tariffsJson.data);
          if (historiesJson.ok) setHistories(historiesJson.data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setFeedbackMessage({
            type: "error",
            text: "Gagal memuat data parameter tarif dari server.",
          });
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Filtered Tariffs
  const filteredTariffs = tariffs.filter((t) => {
    if (selectedCategory !== "ALL" && t.category !== selectedCategory) return false;
    if (statusFilter === "ACTIVE" && !t.isActive) return false;
    if (statusFilter === "INACTIVE" && t.isActive) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingTariff(null);
    setFormData({
      code: "",
      name: "",
      category: "PLN_HOME",
      pricePerUnit: "",
      unit: "Rp/kWh",
      validFrom: new Date().toISOString().slice(0, 10),
      validTo: "",
      isActive: true,
      notes: "",
      sourceLabel: "",
      sourceUrl: "",
      reason: "Penambahan parameter harga energi baru",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (tariff: EnergyTariff) => {
    setEditingTariff(tariff);
    setFormData({
      id: tariff.id,
      code: tariff.code,
      name: tariff.name,
      category: tariff.category,
      pricePerUnit: tariff.pricePerUnit.toString(),
      unit: tariff.unit,
      validFrom: tariff.validFrom,
      validTo: tariff.validTo || "",
      isActive: tariff.isActive,
      notes: tariff.notes || "",
      sourceLabel: tariff.sourceLabel || "",
      sourceUrl: tariff.sourceUrl || "",
      reason: "", // Require input on edit
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Submit Modal Form (Add or Edit)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Client-side validation using domain function
    const isEdit = Boolean(editingTariff);
    const validation = validateEnergyTariffInput(formData, isEdit);

    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      setIsSubmitting(true);
      const url = isEdit
        ? `/api/admin/energy-tariffs/${editingTariff!.id}`
        : "/api/admin/energy-tariffs";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        if (json.errors) {
          setFormErrors(json.errors);
        } else {
          setFeedbackMessage({
            type: "error",
            text: json.error || "Gagal menyimpan parameter tarif.",
          });
        }
        return;
      }

      setFeedbackMessage({
        type: "success",
        text: json.message || "Parameter tarif berhasil disimpan.",
      });
      setIsModalOpen(false);
      await fetchData();
    } catch {
      setFeedbackMessage({
        type: "error",
        text: "Terjadi kesalahan koneksi saat menyimpan.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Tariff Status
  const handleToggleStatus = async (tariff: EnergyTariff) => {
    const nextStatus = !tariff.isActive;
    const actionLabel = nextStatus ? "mengaktifkan" : "menonaktifkan";
    const confirmPrompt = window.confirm(
      `Apakah Anda yakin ingin ${actionLabel} parameter '${tariff.name}'?`,
    );
    if (!confirmPrompt) return;

    try {
      const res = await fetch(`/api/admin/energy-tariffs/${tariff.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: nextStatus,
          reason: `Perubahan status menjadi ${nextStatus ? "Aktif" : "Nonaktif"} oleh Superadmin`,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        setFeedbackMessage({
          type: "error",
          text: json.error || "Gagal mengubah status parameter.",
        });
        return;
      }

      setFeedbackMessage({
        type: "success",
        text: json.message,
      });
      await fetchData();
    } catch {
      setFeedbackMessage({
        type: "error",
        text: "Gagal mengirim permintaan status.",
      });
    }
  };

  // Active Tariffs for Simulation Test Date (KEL2-115)
  const activeTariffsForTestDate = tariffs.filter((t) => {
    if (!t.isActive) return false;
    if (simTestDate < t.validFrom) return false;
    if (t.validTo && simTestDate > t.validTo) return false;
    return true;
  });

  const activePlnForTest = activeTariffsForTestDate.find(
    (t) => t.category === "PLN_HOME",
  );
  const activeSpkluForTest = activeTariffsForTestDate.find(
    (t) => t.category === "SPKLU",
  );

  // Quick simulation computation
  const testSimResult =
    activePlnForTest && activeSpkluForTest
      ? calculateEvEnergy({
          consumptionKwh100km: simConsumption,
          dailyDistanceKm: simDailyKm,
          homeChargingPercentage: 80,
          homeTariffPerKwh: activePlnForTest.pricePerUnit,
          spkluTariffPerKwh: activeSpkluForTest.pricePerUnit,
        })
      : null;

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                Pengelolaan Tarif
              </span>
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                PLN, SPKLU, &amp; BBM
              </span>
              <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-800">
                Validasi Periode &amp; Audit
              </span>
            </div>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Pengelolaan Tarif Energi
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
              Kelola acuan tarif listrik PLN, tarif pengisian SPKLU, serta harga BBM secara terpusat.
              Sistem memvalidasi nilai numerik, satuan, dan periode berlaku, serta menjamin simulasi
              hanya memakai tarif aktif tanpa merusak riwayat historis.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
            >
              <span>+ Tambah Parameter Baru</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div
            className={`mt-4 flex items-center justify-between rounded-xl p-3 text-xs font-medium ${
              feedbackMessage.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <span>{feedbackMessage.text}</span>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="font-bold underline"
            >
              Tutup
            </button>
          </div>
        )}
      </div>

      {/* KPI Stats Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Parameter Energi</span>
          <div className="mt-1 text-2xl font-extrabold text-slate-900">{tariffs.length}</div>
          <span className="text-[11px] text-slate-400">PLN, SPKLU, &amp; BBM</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Parameter Aktif Saat Ini</span>
          <div className="mt-1 text-2xl font-extrabold text-emerald-600">
            {tariffs.filter((t) => t.isActive).length}
          </div>
          <span className="text-[11px] text-slate-400">Siap digunakan pada simulasi</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Riwayat Perubahan</span>
          <div className="mt-1 text-2xl font-extrabold text-blue-600">{histories.length}</div>
          <span className="text-[11px] text-slate-400">Jejak perubahan tercatat otomatis</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Periode Regulasi</span>
          <div className="mt-1 text-base font-bold text-slate-800">TW IV 2024 / Terbuka</div>
          <span className="text-[11px] text-slate-400">Permen &amp; Kepmen ESDM RI</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-2xl">
        <button
          type="button"
          onClick={() => setActiveTab("tariffs")}
          className={`px-4 py-3 text-xs font-bold transition border-b-2 ${
            activeTab === "tariffs"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Daftar Parameter Tarif ({filteredTariffs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("histories")}
          className={`px-4 py-3 text-xs font-bold transition border-b-2 ${
            activeTab === "histories"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Riwayat Perubahan &amp; Audit
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("simulation-test")}
          className={`px-4 py-3 text-xs font-bold transition border-b-2 ${
            activeTab === "simulation-test"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Uji Simulasi Tanggal Aktif
        </button>
      </div>

      {/* TAB 1: Daftar Parameter */}
      {activeTab === "tariffs" && (
        <div className="space-y-4 rounded-b-2xl border border-t-0 border-slate-200 bg-white p-6 shadow-sm">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Kategori:</span>
              {(["ALL", "PLN_HOME", "SPKLU", "BBM"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    selectedCategory === cat
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cat === "ALL"
                    ? "Semua"
                    : cat === "PLN_HOME"
                      ? "Listrik PLN"
                      : cat === "SPKLU"
                        ? "SPKLU"
                        : "BBM"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Cari kode atau nama parameter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 rounded-xl border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="ACTIVE">Hanya Aktif</option>
                <option value="INACTIVE">Hanya Nonaktif</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-12 text-center text-xs font-medium text-slate-500">
              Memuat daftar parameter tarif...
            </div>
          ) : filteredTariffs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-xs text-slate-500">
              Tidak ada parameter tarif yang cocok dengan filter.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Kode &amp; Nama Parameter</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3 text-right">Nilai Tarif</th>
                    <th className="px-4 py-3">Periode Berlaku</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Pembaruan Terakhir</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTariffs.map((t) => {
                    const periodStatus = getTariffPeriodStatus(t);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{t.name}</div>
                          <div className="font-mono text-[11px] text-slate-400">{t.code}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              t.category === "PLN_HOME"
                                ? "bg-blue-100 text-blue-800"
                                : t.category === "SPKLU"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {t.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                          {formatIdr(t.pricePerUnit)}
                          <span className="ml-1 text-[10px] font-normal text-slate-500">
                            / {t.unit.replace("Rp/", "")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[11px] font-medium text-slate-800">
                            {t.validFrom} s.d. {t.validTo || "Seterusnya"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              periodStatus === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : periodStatus === "SCHEDULED"
                                  ? "bg-blue-100 text-blue-800"
                                  : periodStatus === "EXPIRED"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                periodStatus === "ACTIVE"
                                  ? "bg-emerald-500"
                                  : periodStatus === "SCHEDULED"
                                    ? "bg-blue-500"
                                    : periodStatus === "EXPIRED"
                                      ? "bg-amber-500"
                                      : "bg-red-500"
                              }`}
                            />
                            {periodStatus === "ACTIVE"
                              ? "Aktif"
                              : periodStatus === "SCHEDULED"
                                ? "Terjadwal"
                                : periodStatus === "EXPIRED"
                                  ? "Kedaluwarsa"
                                  : "Nonaktif"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-500">
                          <div>{new Date(t.updatedAt).toLocaleDateString("id-ID")}</div>
                          <div className="text-[10px] text-slate-400">Oleh: {t.updatedBy}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(t)}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 transition"
                            >
                              Ubah
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(t)}
                              className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition ${
                                t.isActive
                                  ? "border-red-200 text-red-600 hover:bg-red-50"
                                  : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                              }`}
                            >
                              {t.isActive ? "Nonaktifkan" : "Aktifkan"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Riwayat Perubahan (Audit Trail - KEL2-116) */}
      {activeTab === "histories" && (
        <div className="space-y-4 rounded-b-2xl border border-t-0 border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-heading text-base font-bold text-slate-900">
                Log Jejak Perubahan Tarif
              </h2>
              <p className="text-xs text-slate-500">
                Setiap pembaruan parameter harga energi dicatat secara otomatis untuk melindungi
                integritas data dan kalkulasi historis.
              </p>
            </div>
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
              {histories.length} Entri Audit
            </span>
          </div>

          {histories.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              Belum ada riwayat perubahan tarif.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Waktu &amp; Tanggal</th>
                    <th className="px-4 py-3">Parameter Terkait</th>
                    <th className="px-4 py-3">Jenis Perubahan</th>
                    <th className="px-4 py-3">Perubahan Nilai</th>
                    <th className="px-4 py-3">Periode Berlaku</th>
                    <th className="px-4 py-3">Diubah Oleh</th>
                    <th className="px-4 py-3">Alasan / Catatan Perubahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {histories.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {new Date(h.changedAt).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{h.tariffName}</div>
                        <div className="font-mono text-[10px] text-slate-400">{h.tariffCode}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            h.action === "CREATE"
                              ? "bg-emerald-100 text-emerald-800"
                              : h.action === "UPDATE_PRICE"
                                ? "bg-blue-100 text-blue-800"
                                : h.action === "UPDATE_PERIOD"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {h.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px]">
                        {h.oldPrice !== null ? (
                          <div className="flex items-center gap-1">
                            <span className="line-through text-slate-400">
                              {formatIdr(h.oldPrice)}
                            </span>
                            <span className="font-bold text-slate-900">
                              &rarr; {formatIdr(h.newPrice)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-emerald-700">
                            {formatIdr(h.newPrice)}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 block">
                          / {h.newUnit.replace("Rp/", "")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-600">
                        {h.newValidFrom} s.d. {h.newValidTo || "Seterusnya"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">
                        {h.changedBy}
                      </td>
                      <td className="px-4 py-3 text-slate-600 italic">
                        &ldquo;{h.reason}&rdquo;
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Uji Simulasi & Integritas Periode (KEL2-115 & KEL2-116) */}
      {activeTab === "simulation-test" && (
        <div className="space-y-6 rounded-b-2xl border border-t-0 border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-heading text-base font-bold text-slate-900">
              Validasi Periode Berlaku &amp; Resolusi Tarif Simulasi
            </h2>
            <p className="text-xs text-slate-500">
              Simulasi hanya memakai parameter yang sedang aktif pada tanggal simulasi terkait.
              Uji coba pemilihan tanggal di bawah ini untuk melihat resolusi parameter aktif dan
              perhitungan kalkulator EV.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left: Input Tanggal & Parameter Uji */}
            <div className="space-y-4 lg:col-span-5 rounded-xl border border-slate-200 bg-slate-50/70 p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Pilih Tanggal Simulasi yang Diuji:
              </span>

              <div className="space-y-2">
                <input
                  type="date"
                  value={simTestDate}
                  onChange={(e) => setSimTestDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="text-slate-400">Preset Uji:</span>
                  <button
                    type="button"
                    onClick={() => setSimTestDate("2024-10-15")}
                    className="rounded bg-white border border-slate-200 px-2 py-0.5 font-medium hover:border-blue-400"
                  >
                    TW IV 2024 (15 Okt 2024)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimTestDate("2025-01-15")}
                    className="rounded bg-white border border-slate-200 px-2 py-0.5 font-medium hover:border-blue-400"
                  >
                    Awal 2025 (15 Jan 2025)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimTestDate(new Date().toISOString().slice(0, 10))}
                    className="rounded bg-white border border-slate-200 px-2 py-0.5 font-medium hover:border-blue-400"
                  >
                    Hari Ini
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. Parameter Pengujian Konsumsi EV:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block">
                      Jarak Harian (km)
                    </label>
                    <input
                      type="number"
                      value={simDailyKm}
                      onChange={(e) => setSimDailyKm(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block">
                      Konsumsi (kWh/100km)
                    </label>
                    <input
                      type="number"
                      value={simConsumption}
                      onChange={(e) => setSimConsumption(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Hasil Resolusi Parameter & Simulasi */}
            <div className="space-y-4 lg:col-span-7">
              <div className="rounded-xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase">
                    Parameter Aktif pada Tanggal:{" "}
                    <span className="text-blue-600 font-mono">{simTestDate}</span>
                  </span>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                    {activeTariffsForTestDate.length} Parameter Aktif
                  </span>
                </div>

                <div className="space-y-2">
                  {activeTariffsForTestDate.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{t.name}</span>
                        <div className="text-[10px] text-slate-500">
                          Berlaku: {t.validFrom} s.d. {t.validTo || "Seterusnya"}
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-blue-700">
                        {formatIdr(t.pricePerUnit)} / {t.unit.replace("Rp/", "")}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulasi Otomatis Menggunakan Tarif Tersebut */}
                {testSimResult && testSimResult.ok ? (
                  <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-2">
                    <span className="text-xs font-bold text-blue-900 uppercase">
                      Hasil Simulasi EV (Memakai Tarif Aktif {simTestDate}):
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block">Total Biaya Listrik:</span>
                        <span className="text-base font-extrabold text-blue-800 font-mono">
                          {formatIdr(testSimResult.data.totalCostMonthly)} / bln
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Biaya per Km:</span>
                        <span className="text-base font-extrabold text-emerald-800 font-mono">
                          {formatIdr(testSimResult.data.costPerKm)} / km
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 border-t border-blue-200/60 pt-2">
                      &check; Tarif diselesaikan secara otomatis berdasarkan tanggal simulasi yang dipilih. Perubahan tarif masa depan tidak akan mengubah nilai simulasi tanggal ini karena snapshot tarif historis tersimpan secara aman.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    Tidak ditemukan tarif PLN &amp; SPKLU aktif pada tanggal {simTestDate}.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM TAMBAH / UBAH PARAMETER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">
                  {editingTariff ? "Ubah Parameter Harga Energi" : "Tambah Parameter Harga Energi Baru"}
                </h3>
                <span className="text-xs text-slate-500">
                  Lengkapi seluruh rincian parameter tarif dan periode berlaku.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Kategori & Kode */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor={categorySelectId} className="block text-xs font-bold text-slate-700">Kategori Energi *</label>
                  <select
                    id={categorySelectId}
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value as EnergyCategory;
                      const allowed = ALLOWED_UNITS[newCat];
                      setFormData({
                        ...formData,
                        category: newCat,
                        unit: allowed[0],
                      });
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="PLN_HOME">Listrik Rumah (PLN_HOME)</option>
                    <option value="SPKLU">Stasiun Pengisian EV (SPKLU)</option>
                    <option value="BBM">Bahan Bakar Minyak (BBM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Kode Unik Parameter *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Contoh: PLN_R1_1300"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                  {formErrors.code && (
                    <p className="mt-1 text-[11px] font-semibold text-red-600">{formErrors.code}</p>
                  )}
                </div>
              </div>

              {/* Nama Parameter */}
              <div>
                <label className="block text-xs font-bold text-slate-700">Nama Parameter Tarif *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: R-1 / 1.300 VA s.d. 2.200 VA (Non-Subsidi)"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
                {formErrors.name && (
                  <p className="mt-1 text-[11px] font-semibold text-red-600">{formErrors.name}</p>
                )}
              </div>

              {/* Nilai Harga & Satuan (KEL2-90) */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Nilai Tarif per Satuan (Nominal Rp) *
                  </label>
                  <input
                    type="text"
                    value={formData.pricePerUnit}
                    onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                    placeholder="Contoh: 1444.70"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                  {formErrors.pricePerUnit && (
                    <p className="mt-1 text-[11px] font-semibold text-red-600">
                      {formErrors.pricePerUnit}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor={unitSelectId} className="block text-xs font-bold text-slate-700">Satuan *</label>
                  <select
                    id={unitSelectId}
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                  >
                    {ALLOWED_UNITS[formData.category].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  {formErrors.unit && (
                    <p className="mt-1 text-[11px] font-semibold text-red-600">{formErrors.unit}</p>
                  )}
                </div>
              </div>

              {/* Periode Berlaku (validFrom & validTo) (KEL2-90 & KEL2-115) */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Mulai Berlaku (validFrom) *
                  </label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                  {formErrors.validFrom && (
                    <p className="mt-1 text-[11px] font-semibold text-red-600">
                      {formErrors.validFrom}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Berakhir Berlaku (validTo - Opsional)
                  </label>
                  <input
                    type="date"
                    value={formData.validTo || ""}
                    onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">
                    Kosongkan jika berlaku tanpa batas waktu (seterusnya).
                  </span>
                  {formErrors.validTo && (
                    <p className="mt-1 text-[11px] font-semibold text-red-600">{formErrors.validTo}</p>
                  )}
                </div>
              </div>

              {/* Status Aktif */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveCheckbox"
                  checked={formData.isActive ?? true}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActiveCheckbox" className="text-xs font-semibold text-slate-800">
                  Parameter Aktif (Dapat dipilih oleh simulator)
                </label>
              </div>

              {/* Sumber Regulasi */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Label Dasar Regulasi (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.sourceLabel || ""}
                    onChange={(e) => setFormData({ ...formData, sourceLabel: e.target.value })}
                    placeholder="Contoh: Siaran Pers ESDM 544/2024"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    URL Sumber Regulasi (Opsional)
                  </label>
                  <input
                    type="url"
                    value={formData.sourceUrl || ""}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    placeholder="https://..."
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Catatan / Keterangan */}
              <div>
                <label className="block text-xs font-bold text-slate-700">Catatan / Keterangan</label>
                <textarea
                  rows={2}
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Catatan tambahan mengenai batasan daya atau ketentuan subsidi..."
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Alasan Perubahan (Wajib saat Edit) */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                <label className="block text-xs font-bold text-blue-900">
                  Alasan / Catatan Perubahan {editingTariff ? "*" : ""}
                </label>
                <input
                  type="text"
                  value={formData.reason || ""}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Contoh: Penyesuaian tarif listrik triwulan I 2025 sesuai Permen ESDM"
                  className="mt-1 w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
                {formErrors.reason && (
                  <p className="mt-1 text-[11px] font-semibold text-red-600">{formErrors.reason}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {isSubmitting
                    ? "Menyimpan..."
                    : editingTariff
                      ? "Simpan Perubahan (Audit)"
                      : "Tambah Parameter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
