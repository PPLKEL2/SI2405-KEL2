import test from "node:test";
import assert from "node:assert/strict";
import { GET as getTariffs, POST as postTariff } from "../../app/api/admin/energy-tariffs/route.ts";
import { GET as getTariffById, PUT as putTariff, PATCH as patchTariff } from "../../app/api/admin/energy-tariffs/[id]/route.ts";
import { GET as getHistories } from "../../app/api/admin/energy-tariffs/histories/route.ts";
import { PUT as putBatchTariffs } from "../../app/api/admin/energy-tariffs/batch/route.ts";
import { GET as getActiveTariffs } from "../../app/api/energy-tariffs/active/route.ts";
import { energyTariffRepository } from "../storage/energy-tariff-repository.ts";

test("API Routes: GET /api/admin/energy-tariffs mengembalikan daftar tarif", async () => {
  energyTariffRepository.resetToDefaultSeed();

  const req = new Request("http://localhost:3000/api/admin/energy-tariffs?category=PLN_HOME");
  const res = await getTariffs(req);
  assert.equal(res.status, 200);

  const json = await res.json();
  assert.equal(json.ok, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data.every((t: { category: string }) => t.category === "PLN_HOME"));
});

test("API Routes: POST & PUT /api/admin/energy-tariffs memvalidasi dan mencatat riwayat", async () => {
  energyTariffRepository.resetToDefaultSeed();

  // 1. POST input invalid (harga 0)
  const invalidReq = new Request("http://localhost:3000/api/admin/energy-tariffs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: "TEST_INVALID",
      name: "Tarif Invalid",
      category: "PLN_HOME",
      pricePerUnit: 0,
      unit: "Rp/kWh",
      validFrom: "2025-01-01",
    }),
  });
  const invalidRes = await postTariff(invalidReq);
  assert.equal(invalidRes.status, 422);
  const invalidJson = await invalidRes.json();
  assert.equal(invalidJson.ok, false);
  assert.ok(invalidJson.errors.pricePerUnit);

  // 2. POST input valid (KEL2-90)
  const validReq = new Request("http://localhost:3000/api/admin/energy-tariffs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: "PLN_EXP_2025",
      name: "Tarif Eksperimen 2025",
      category: "PLN_HOME",
      pricePerUnit: 1650,
      unit: "Rp/kWh",
      validFrom: "2025-01-01",
      validTo: "2025-12-31",
      isActive: true,
      reason: "Penetapan tarif awal tahun",
    }),
  });
  const validRes = await postTariff(validReq);
  assert.equal(validRes.status, 201);
  const validJson = await validRes.json();
  assert.equal(validJson.ok, true);
  const createdId = validJson.data.id;

  // 3. GET by ID
  const getByIdRes = await getTariffById(
    new Request(`http://localhost:3000/api/admin/energy-tariffs/${createdId}`),
    { params: Promise.resolve({ id: createdId }) },
  );
  assert.equal(getByIdRes.status, 200);

  // 4. PUT update (KEL2-90 & KEL2-116)
  const updateReq = new Request(`http://localhost:3000/api/admin/energy-tariffs/${createdId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: "PLN_EXP_2025",
      name: "Tarif Eksperimen 2025 Revisi",
      category: "PLN_HOME",
      pricePerUnit: 1700,
      unit: "Rp/kWh",
      validFrom: "2025-01-01",
      validTo: "2025-12-31",
      isActive: true,
      reason: "Penyesuaian inflasi semester 1",
    }),
  });
  const updateRes = await putTariff(updateReq, { params: Promise.resolve({ id: createdId }) });
  assert.equal(updateRes.status, 200);
  const updateJson = await updateRes.json();
  assert.equal(updateJson.data.pricePerUnit, 1700);

  // 5. PATCH toggle status
  const patchReq = new Request(`http://localhost:3000/api/admin/energy-tariffs/${createdId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      isActive: false,
      reason: "Nonaktifkan sementara",
    }),
  });
  const patchRes = await patchTariff(patchReq, { params: Promise.resolve({ id: createdId }) });
  assert.equal(patchRes.status, 200);
  const patchJson = await patchRes.json();
  assert.equal(patchJson.data.isActive, false);

  // 6. GET histories (KEL2-116)
  const histReq = new Request(`http://localhost:3000/api/admin/energy-tariffs/histories?tariffId=${createdId}`);
  const histRes = await getHistories(histReq);
  assert.equal(histRes.status, 200);
  const histJson = await histRes.json();
  assert.ok(histJson.data.length >= 3); // CREATE, UPDATE_PRICE, STATUS_CHANGE
});

test("API Routes: GET /api/energy-tariffs/active menyaring parameter aktif per tanggal (KEL2-115)", async () => {
  energyTariffRepository.resetToDefaultSeed();

  // Tanggal dalam rentang TW IV 2024
  const reqActive = new Request("http://localhost:3000/api/energy-tariffs/active?date=2024-11-15");
  const resActive = await getActiveTariffs(reqActive);
  assert.equal(resActive.status, 200);
  const jsonActive = await resActive.json();
  assert.equal(jsonActive.ok, true);
  assert.equal(jsonActive.simulationDate, "2024-11-15");
  assert.ok(jsonActive.data.length > 0);

  // Tanggal invalid
  const reqBad = new Request("http://localhost:3000/api/energy-tariffs/active?date=invalid-date");
  const resBad = await getActiveTariffs(reqBad);
  assert.equal(resBad.status, 400);
});

test("API Routes: PUT /api/admin/energy-tariffs/batch memperbarui beberapa tarif sekaligus", async () => {
  energyTariffRepository.resetToDefaultSeed();

  const req = new Request("http://localhost:3000/api/admin/energy-tariffs/batch", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      updates: [
        { id: "bbm-pertalite", pricePerUnit: 10500 },
        { id: "bbm-pertamax", pricePerUnit: 13000 },
      ],
      changedBy: "Superadmin",
    }),
  });

  const res = await putBatchTariffs(req);
  assert.equal(res.status, 200);

  const json = await res.json();
  assert.equal(json.ok, true);
  assert.ok(json.updatedAt);

  // Pastikan nilai baru tersimpan
  const pertalite = json.data.find((t: { id: string }) => t.id === "bbm-pertalite");
  const pertamax = json.data.find((t: { id: string }) => t.id === "bbm-pertamax");
  assert.equal(pertalite.pricePerUnit, 10500);
  assert.equal(pertamax.pricePerUnit, 13000);
});
