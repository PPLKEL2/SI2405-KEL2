'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { createStore } = require('../src/store');
const { createFacilityService } = require('../src/facilities');

const dataValid = {
  nama: 'SPKLU Sudirman',
  kategori: 'SPKLU',
  alamat: 'Jl. Jenderal Sudirman No. 1, Jakarta',
  latitude: -6.2088,
  longitude: 106.8456,
  jamOperasional: '24 jam',
  kontak: '021-000000',
};

function setup() {
  return createFacilityService(createStore());
}

test('AC 1: admin dapat menambah fasilitas dan mendapat id', () => {
  const service = setup();
  const facility = service.create(dataValid);

  assert.equal(facility.id, 1);
  assert.equal(facility.nama, 'SPKLU Sudirman');
  assert.equal(facility.aktif, true);
});

test('AC 2: input kosong atau tidak valid ditolak', () => {
  const service = setup();

  assert.throws(() => service.create({ ...dataValid, nama: '   ' }), (err) => {
    assert.equal(err.status, 400);
    assert.ok(err.details.nama);
    return true;
  });
  assert.throws(() => service.create({ ...dataValid, kategori: 'Bengkel' }), (err) => err.details.kategori !== undefined);
  assert.throws(() => service.create({ ...dataValid, latitude: 95 }), (err) => err.details.latitude !== undefined);
  assert.throws(() => service.create({ ...dataValid, longitude: 'abc' }), (err) => err.details.longitude !== undefined);
});

test('AC 3: admin dapat melihat daftar dan detail, serta mengubah data', () => {
  const service = setup();
  const created = service.create(dataValid);

  assert.equal(service.list().length, 1);
  assert.equal(service.get(created.id).nama, 'SPKLU Sudirman');

  const updated = service.update(created.id, { nama: 'SPKLU Sudirman Baru', latitude: '-6.21' });
  assert.equal(updated.nama, 'SPKLU Sudirman Baru');
  assert.equal(updated.latitude, -6.21);
  assert.equal(updated.kategori, 'SPKLU');
});

test('AC 4: fasilitas dapat dinonaktifkan dan tidak muncul di daftar aktif', () => {
  const service = setup();
  const facility = service.create(dataValid);

  service.deactivate(facility.id);

  assert.equal(service.get(facility.id).aktif, false);
  assert.equal(service.list({ aktif: true }).length, 0);
  assert.equal(service.list({ aktif: false }).length, 1);
});

test('AC 5: daftar dapat difilter berdasarkan kategori', () => {
  const service = setup();
  service.create(dataValid);
  service.create({ ...dataValid, nama: 'Showroom Kemang', kategori: 'Showroom' });

  assert.equal(service.list({ kategori: 'SPKLU' }).length, 1);
  assert.equal(service.list({ kategori: 'Showroom' })[0].nama, 'Showroom Kemang');
});

test('fasilitas tidak ditemukan menghasilkan 404', () => {
  const service = setup();
  assert.throws(() => service.get(999), (err) => err.status === 404);
});
