import test from "node:test";
import assert from "node:assert/strict";
import {
  validateEvIncentiveInput,
  isPolicyActiveOnDate,
  getPolicyPeriodStatus,
  formatPolicyValue,
  formatPolicyValidity,
} from "./ev-incentives.ts";
import {
  evIncentiveRepository,
} from "../storage/ev-incentive-repository.ts";
import {
  GET as getPolicies,
  POST as postPolicy,
} from "../../app/api/admin/ev-incentives/route.ts";
import {
  GET as getPolicyById,
  PUT as putPolicy,
  PATCH as patchPolicy,
} from "../../app/api/admin/ev-incentives/[id]/route.ts";

test("PBI 10: validateEvIncentiveInput memvalidasi input persentase dan nominal dengan benar", () => {
  // Valid Persentase
  const validPct = validateEvIncentiveInput({
    name: "PPN DTP mobil listrik CKD",
    category: "TAX",
    valueType: "PERCENTAGE",
    value: 10,
    calculationBasis: "dari harga",
    validFrom: "2024-01-01",
    validTo: "2026-12-31",
  });
  assert.equal(validPct.valid, true);
  assert.equal(validPct.sanitized?.value, 10);
  assert.equal(validPct.sanitized?.category, "TAX");

  // Valid Nominal Tetap (Subsidi)
  const validNominal = validateEvIncentiveInput({
    name: "Bantuan pembelian motor listrik",
    category: "SUBSIDY",
    valueType: "FIXED_AMOUNT",
    value: "5000000",
    validFrom: "2024-01-01",
    validTo: "2026-09-30",
  });
  assert.equal(validNominal.valid, true);
  assert.equal(validNominal.sanitized?.value, 5000000);

  // Valid Tanpa Batas Waktu (validTo = null)
  const validIndefinite = validateEvIncentiveInput({
    name: "PKB kendaraan listrik",
    category: "TAX",
    valueType: "PERCENTAGE",
    value: 0,
    validFrom: "2023-05-11",
    validTo: null,
  });
  assert.equal(validIndefinite.valid, true);
  assert.equal(validIndefinite.sanitized?.validTo, null);
});

test("PBI 10: validateEvIncentiveInput menolak input yang tidak valid", () => {
  // Nama kosong
  const resEmptyName = validateEvIncentiveInput({
    name: "",
    category: "TAX",
    valueType: "PERCENTAGE",
    value: 10,
    validFrom: "2024-01-01",
  });
  assert.equal(resEmptyName.valid, false);
  assert.ok(resEmptyName.errors.name);

  // Nilai negatif
  const resNegative = validateEvIncentiveInput({
    name: "Test Negatif",
    category: "TAX",
    valueType: "PERCENTAGE",
    value: -5,
    validFrom: "2024-01-01",
  });
  assert.equal(resNegative.valid, false);
  assert.ok(resNegative.errors.value);

  // Persentase > 100
  const resOverPct = validateEvIncentiveInput({
    name: "Test Over 100",
    category: "TAX",
    valueType: "PERCENTAGE",
    value: 110,
    validFrom: "2024-01-01",
  });
  assert.equal(resOverPct.valid, false);
  assert.ok(resOverPct.errors.value);

  // validTo < validFrom
  const resBadDate = validateEvIncentiveInput({
    name: "Test Tanggal Terbalik",
    category: "TAX",
    valueType: "PERCENTAGE",
    value: 5,
    validFrom: "2026-01-01",
    validTo: "2025-01-01",
  });
  assert.equal(resBadDate.valid, false);
  assert.ok(resBadDate.errors.validTo);
});

test("PBI 10: isPolicyActiveOnDate dan getPolicyPeriodStatus mengevaluasi masa berlaku", () => {
  const policy = {
    id: "test-policy",
    code: "TEST_POL",
    name: "Kebijakan Tes",
    category: "TAX" as const,
    valueType: "PERCENTAGE" as const,
    value: 5,
    calculationBasis: "dari harga",
    validFrom: "2024-01-01",
    validTo: "2026-12-31",
    isActive: true,
    updatedAt: "2024-01-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  };

  // Aktif di 2025
  assert.equal(isPolicyActiveOnDate(policy, "2025-06-01"), true);
  assert.equal(getPolicyPeriodStatus(policy, "2025-06-01"), "ACTIVE");

  // Sebelum mulai
  assert.equal(isPolicyActiveOnDate(policy, "2023-12-31"), false);
  assert.equal(getPolicyPeriodStatus(policy, "2023-12-31"), "SCHEDULED");

  // Setelah berakhir (kedaluwarsa)
  assert.equal(isPolicyActiveOnDate(policy, "2027-01-01"), false);
  assert.equal(getPolicyPeriodStatus(policy, "2027-01-01"), "EXPIRED");

  // Dinonaktifkan manual
  const inactivePolicy = { ...policy, isActive: false };
  assert.equal(isPolicyActiveOnDate(inactivePolicy, "2025-06-01"), false);
  assert.equal(getPolicyPeriodStatus(inactivePolicy, "2025-06-01"), "INACTIVE");
});

test("PBI 10: formatPolicyValue dan formatPolicyValidity memformat tampilan dengan tepat", () => {
  assert.equal(
    formatPolicyValue({ valueType: "PERCENTAGE", value: 10, calculationBasis: "dari harga" }),
    "10% dari harga",
  );
  assert.equal(
    formatPolicyValue({ valueType: "PERCENTAGE", value: 0 }),
    "0%",
  );
  assert.ok(
    formatPolicyValue({ valueType: "FIXED_AMOUNT", value: 5000000 }).includes("5.000.000"),
  );

  assert.equal(formatPolicyValidity(null), "Tanpa batas");
  assert.equal(formatPolicyValidity("2026-12-31"), "31 Des 2026");
});

test("PBI 10: EvIncentiveRepository operasi CRUD dan persistensi", () => {
  evIncentiveRepository.resetToDefaultSeed();

  const all = evIncentiveRepository.getAllPolicies();
  assert.ok(all.length >= 5);

  // Buat baru
  const created = evIncentiveRepository.createPolicy({
    name: "Insentif Tambahan 2026",
    category: "INCENTIVE",
    valueType: "PERCENTAGE",
    value: 5,
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
  });
  assert.equal(created.ok, true);
  if (created.ok) {
    assert.equal(created.data.name, "Insentif Tambahan 2026");

    // Toggle status
    const toggled = evIncentiveRepository.togglePolicyStatus(created.data.id, false);
    assert.equal(toggled.ok, true);
    if (toggled.ok) {
      assert.equal(toggled.data.isActive, false);
    }

    // Update
    const updated = evIncentiveRepository.updatePolicy(created.data.id, {
      name: "Insentif Tambahan Revisi",
      category: "INCENTIVE",
      valueType: "PERCENTAGE",
      value: 8,
      validFrom: "2026-01-01",
      validTo: "2026-12-31",
    });
    assert.equal(updated.ok, true);
    if (updated.ok) {
      assert.equal(updated.data.value, 8);
    }
  }
});

test("PBI 10: API Routes /api/admin/ev-incentives berfungsi lengkap", async () => {
  evIncentiveRepository.resetToDefaultSeed();

  // 1. GET all
  const reqGet = new Request("http://localhost:3000/api/admin/ev-incentives");
  const resGet = await getPolicies(reqGet);
  assert.equal(resGet.status, 200);
  const jsonGet = await resGet.json();
  assert.equal(jsonGet.ok, true);
  assert.ok(jsonGet.data.length >= 5);

  // 2. POST create
  const reqPost = new Request("http://localhost:3000/api/admin/ev-incentives", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Kebijakan Uji Coba API",
      category: "TAX",
      valueType: "PERCENTAGE",
      value: 12,
      validFrom: "2025-01-01",
      validTo: "2025-12-31",
    }),
  });
  const resPost = await postPolicy(reqPost);
  assert.equal(resPost.status, 201);
  const jsonPost = await resPost.json();
  const createdId = jsonPost.data.id;

  // 3. GET by ID
  const resDetail = await getPolicyById(
    new Request(`http://localhost:3000/api/admin/ev-incentives/${createdId}`),
    { params: Promise.resolve({ id: createdId }) },
  );
  assert.equal(resDetail.status, 200);

  // 4. PATCH toggle status
  const reqPatch = new Request(`http://localhost:3000/api/admin/ev-incentives/${createdId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive: false }),
  });
  const resPatch = await patchPolicy(reqPatch, { params: Promise.resolve({ id: createdId }) });
  assert.equal(resPatch.status, 200);
  const jsonPatch = await resPatch.json();
  assert.equal(jsonPatch.data.isActive, false);

  // 5. PUT edit
  const reqPut = new Request(`http://localhost:3000/api/admin/ev-incentives/${createdId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Kebijakan Uji Coba API (Revisi)",
      category: "TAX",
      valueType: "PERCENTAGE",
      value: 15,
      validFrom: "2025-01-01",
      validTo: "2025-12-31",
    }),
  });
  const resPut = await putPolicy(reqPut, { params: Promise.resolve({ id: createdId }) });
  assert.equal(resPut.status, 200);
  const jsonPut = await resPut.json();
  assert.equal(jsonPut.data.value, 15);

  // 6. Reset to default seed
  evIncentiveRepository.resetToDefaultSeed();
});
