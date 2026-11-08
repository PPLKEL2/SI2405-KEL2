'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { createStore } = require('../src/store');
const { createFacilityService } = require('../src/facilities');
const { createTarifService } = require('../src/tarif');

// Setiap tes memakai store baru, dan sudah berisi satu SPKLU (id 1) dan satu SPBKLU (id 2).
function setup() {
  const store = createStore();
  const facilities = createFacilityService(store);
  const tarif = createTarifService(store);
  const base = { alamat: 'Jl. Contoh 1', latitude: -6.2, longitude: 106.8 };

  facilities.create({ ...base, nama: 'SPKLU A', kategori: 'SPKLU' });
  facilities.create({ ...base, nama: 'SPBKLU B', kategori: 'SPBKLU' });
  return { tarif };
}

const charging = {
  facilityId: 1,
  jenisLayanan: 'CHARGING',
  nilai: 2500,
  berlakuMulai: '2026-01-01',
  berlakuSampai: '2026-12-31',
};

test('AC 1: admin dapat membuat tarif dengan jenis layanan dan satuan', () => {
  const { tarif } = setup();
  const created = tarif.create(charging);

  assert.equal(created.id, 1);
  assert.equal(created.satuan, 'kWh');
  assert.equal(created.nilai, 2500);
});

test('AC 2: satuan mengikuti jenis layanan, swap memakai satuan transaksi', () => {
  const { tarif } = setup();
  const swap = tarif.create({
    facilityId: 2,
    jenisLayanan: 'SWAP',
    nilai: 15000,
    berlakuMulai: '2026-01-01',
  });

  assert.equal(swap.satuan, 'transaksi');
  assert.equal(swap.berlakuSampai, null);
  assert.throws(() => tarif.create({ ...swap, satuan: 'kWh', berlakuMulai: '2027-01-01' }), (err) => err.details.satuan !== undefined);
});

test('AC 2: jenis layanan dan kategori fasilitas harus cocok', () => {
  const { tarif } = setup();
  assert.throws(() => tarif.create({ ...charging, facilityId: 2 }), (err) => err.details.facilityId !== undefined);
});

test('AC 3: admin dapat mengubah tarif', () => {
  const { tarif } = setup();
  const created = tarif.create(charging);

  const updated = tarif.update(created.id, { nilai: 3000 });

  assert.equal(updated.nilai, 3000);
  assert.equal(updated.satuan, 'kWh');
});

test('AC 4: periode berlaku tersimpan dan tanggal akhir tidak boleh sebelum tanggal mulai', () => {
  const { tarif } = setup();
  const created = tarif.create(charging);
  assert.equal(created.berlakuMulai, '2026-01-01');
  assert.equal(created.berlakuSampai, '2026-12-31');

  assert.throws(
    () => tarif.create({ ...charging, berlakuMulai: '2027-06-01', berlakuSampai: '2027-01-01' }),
    (err) => err.details.berlakuSampai !== undefined
  );
  assert.throws(() => tarif.create({ ...charging, nilai: -1 }), (err) => err.details.nilai !== undefined);
  assert.throws(() => tarif.create({ ...charging, berlakuMulai: '2026-02-30' }), (err) => err.details.berlakuMulai !== undefined);
});

test('periode yang bertabrakan untuk jenis layanan yang sama ditolak, jenis berbeda boleh', () => {
  const { tarif } = setup();
  tarif.create(charging);

  assert.throws(
    () => tarif.create({ ...charging, berlakuMulai: '2026-06-01', berlakuSampai: '2027-06-01' }),
    (err) => err.status === 409
  );
  assert.equal(tarif.create({ ...charging, berlakuMulai: '2027-01-01', berlakuSampai: null }).berlakuMulai, '2027-01-01');
});

test('AC 5: getAktif mengembalikan tarif yang berlaku pada tanggal tertentu', () => {
  const { tarif } = setup();
  const created = tarif.create(charging);
  const query = { facilityId: 1, jenisLayanan: 'CHARGING' };

  assert.equal(tarif.getAktif({ ...query, tanggal: '2026-07-01' }).id, created.id);
  assert.equal(tarif.getAktif({ ...query, tanggal: '2026-01-01' }).id, created.id);
  assert.equal(tarif.getAktif({ ...query, tanggal: '2025-12-31' }), null);
  assert.equal(tarif.getAktif({ ...query, tanggal: '2027-01-01' }), null);
});

test('getAktif dengan periode terbuka (berlakuSampai kosong) tetap terbaca', () => {
  const { tarif } = setup();
  tarif.create({ ...charging, berlakuSampai: null });

  const found = tarif.getAktif({ facilityId: 1, jenisLayanan: 'CHARGING', tanggal: '2040-05-05' });
  assert.equal(found.berlakuSampai, null);
});
