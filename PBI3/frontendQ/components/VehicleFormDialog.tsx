"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ApiError } from "@/lib/api/vehicles";
import {
  VEHICLE_LIMITS,
  VEHICLE_TYPES,
  emptyFormValues,
  toFormValues,
  validateVehicleForm,
  type Vehicle,
  type VehicleFormValues,
  type VehiclePayload,
} from "@/lib/vehicles";

interface VehicleFormDialogProps {
  /** Kosong = mode tambah; terisi = mode ubah. */
  vehicle?: Vehicle;
  onClose: () => void;
  /** Boleh melempar ApiError; pesan per field akan ditampilkan di form. */
  onSubmit: (payload: VehiclePayload) => Promise<void>;
}

function Field({
  label,
  name,
  error,
  hint,
  full,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`mq-field${full ? " full" : ""}${error ? " has-error" : ""}`}>
      <label htmlFor={name}>{label}</label>
      {children}
      {error ? (
        <span className="err" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="hint">{hint}</span>
      ) : null}
    </div>
  );
}

export function VehicleFormDialog({ vehicle, onClose, onSubmit }: VehicleFormDialogProps) {
  const [values, setValues] = useState<VehicleFormValues>(vehicle ? toFormValues(vehicle) : emptyFormValues());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

  const set = (key: keyof VehicleFormValues) => (e: { target: { value: string } }) =>
    setValues((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const result = validateVehicleForm(values);
    setErrors(result.errors);
    if (!result.payload) return;

    setSubmitting(true);
    try {
      await onSubmit(result.payload);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors);
        setFormError(err.message);
      } else {
        setFormError("Terjadi kesalahan tak terduga. Silakan coba lagi.");
      }
      setSubmitting(false);
    }
  }

  const title = vehicle ? "Ubah Unit" : "Tambah Unit";
  const l = VEHICLE_LIMITS;

  return (
    <div
      className="mq-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div className="mq-dialog" role="dialog" aria-modal="true" aria-labelledby="mq-dialog-title">
        <div className="mq-dialog-head">
          <h2 id="mq-dialog-title">{title}</h2>
          <p>Data unit aktif akan menjadi referensi simulasi bagi pengguna.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mq-form">
            <Field label="Model" name="model" error={errors.model} full>
              <input id="model" value={values.model} onChange={set("model")} placeholder="mis. Polytron Fox-R" maxLength={80} autoFocus />
            </Field>

            <Field label="Tipe" name="type" error={errors.type}>
              <select id="type" value={values.type} onChange={set("type")}>
                {VEHICLE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status" name="isActive" error={errors.isActive}>
              <select id="isActive" value={values.isActive} onChange={set("isActive")}>
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </Field>

            <Field label="Baterai (kWh)" name="batteryKwh" error={errors.batteryKwh} hint={`${l.batteryKwh.min}–${l.batteryKwh.max} kWh`}>
              <input id="batteryKwh" type="text" inputMode="decimal" value={values.batteryKwh} onChange={set("batteryKwh")} placeholder="2,4" />
            </Field>

            <Field label="Charger AC (kW)" name="acChargerKw" error={errors.acChargerKw} hint={`${l.acChargerKw.min}–${l.acChargerKw.max} kW`}>
              <input id="acChargerKw" type="text" inputMode="decimal" value={values.acChargerKw} onChange={set("acChargerKw")} placeholder="0,4" />
            </Field>

            <Field label="Harga OTR (Rp)" name="priceOtr" error={errors.priceOtr} hint="Tanpa titik/koma, mis. 23900000" full>
              <input id="priceOtr" type="text" inputMode="numeric" value={values.priceOtr} onChange={set("priceOtr")} placeholder="23900000" />
            </Field>

            <Field label="Promo" name="promo" error={errors.promo} hint="Opsional, kosongkan jika tidak ada promo" full>
              <input id="promo" value={values.promo} onChange={set("promo")} placeholder="mis. Gratis wallbox" maxLength={100} />
            </Field>

            {formError && !Object.keys(errors).length ? <div className="mq-form-error">{formError}</div> : null}
          </div>

          <div className="mq-dialog-foot">
            <button type="button" className="mq-btn ghost" onClick={onClose} disabled={submitting}>
              Batal
            </button>
            <button type="submit" className="mq-btn" disabled={submitting}>
              {submitting ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
