import { test } from "node:test";
import assert from "node:assert/strict";
import {
  emptyFormValues,
  formatDecimal,
  formatRupiah,
  validateVehicleForm,
  type VehicleFormValues,
} from "./vehicles.ts";

const valid: VehicleFormValues = {
  model: "Polytron Fox-R",
  type: "Motor",
  batteryKwh: "2,4",
  priceOtr: "23900000",
  acChargerKw: "0.4",
  promo: "Gratis wallbox",
  isActive: "true",
};

test("PBI3 form: data valid menghasilkan payload bertipe angka (koma desimal diterima)", () => {
  const { errors, payload } = validateVehicleForm(valid);
  assert.deepEqual(errors, {});
  assert.equal(payload?.batteryKwh, 2.4);
  assert.equal(payload?.priceOtr, 23_900_000);
  assert.equal(payload?.acChargerKw, 0.4);
  assert.equal(payload?.isActive, true);
});

test("PBI3 form: field wajib kosong -> pesan error per field", () => {
  const { errors, payload } = validateVehicleForm(emptyFormValues());
  assert.equal(payload, undefined);
  for (const key of ["model", "batteryKwh", "priceOtr", "acChargerKw"]) {
    assert.ok(errors[key], `errors.${key} harus ada`);
  }
});

test("PBI3 form: model hanya spasi ditolak", () => {
  assert.equal(validateVehicleForm({ ...valid, model: "   " }).errors.model, "Model wajib diisi.");
});

test("PBI3 form: angka nol, negatif, huruf, dan di luar batas ditolak", () => {
  const bad: Array<Partial<VehicleFormValues>> = [
    { batteryKwh: "0" },
    { batteryKwh: "-2" },
    { batteryKwh: "abc" },
    { batteryKwh: "501" },
    { priceOtr: "999999" },
    { priceOtr: "5000000001" },
    { acChargerKw: "0" },
    { acChargerKw: "351" },
  ];
  for (const patch of bad) {
    const { errors, payload } = validateVehicleForm({ ...valid, ...patch });
    assert.equal(payload, undefined, JSON.stringify(patch));
    assert.ok(Object.keys(errors).length > 0, JSON.stringify(patch));
  }
});

test("PBI3 form: status Nonaktif dan promo kosong dipertahankan", () => {
  const { payload } = validateVehicleForm({ ...valid, promo: "  ", isActive: "false" });
  assert.equal(payload?.isActive, false);
  assert.equal(payload?.promo, "");
});

test("PBI3 format: sesuai mockup", () => {
  assert.equal(formatRupiah(23_900_000), "Rp 23.900.000");
  assert.equal(formatDecimal(2.4), "2,4");
  assert.equal(formatDecimal(3), "3,0");
  assert.equal(formatDecimal(38.9), "38,9");
});
