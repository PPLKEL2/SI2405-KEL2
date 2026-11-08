'use strict';

// PBI 5: Manajemen Data Lokasi Fasilitas EV (Showroom, SPKLU, SPBKLU)

const { AppError } = require('./errors');

const KATEGORI = ['Showroom', 'SPKLU', 'SPBKLU'];

function toNumber(value) {
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return value;
}

function isNumberInRange(value, min, max) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function isFilledString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

// Memvalidasi data fasilitas lengkap (AC 2 dan AC 5) dan mengembalikan nilai yang sudah dibersihkan.
function validateFacility(input) {
  const errors = {};
  const latitude = toNumber(input.latitude);
  const longitude = toNumber(input.longitude);
  const aktif = input.aktif ?? true;

  if (!isFilledString(input.nama)) errors.nama = 'Nama wajib diisi';
  if (!KATEGORI.includes(input.kategori)) errors.kategori = `Kategori harus salah satu dari: ${KATEGORI.join(', ')}`;
  if (!isFilledString(input.alamat)) errors.alamat = 'Alamat wajib diisi';
  if (!isNumberInRange(latitude, -90, 90)) errors.latitude = 'Latitude harus angka antara -90 dan 90';
  if (!isNumberInRange(longitude, -180, 180)) errors.longitude = 'Longitude harus angka antara -180 dan 180';
  if (typeof aktif !== 'boolean') errors.aktif = 'Aktif harus true atau false';

  if (Object.keys(errors).length > 0) {
    throw new AppError(400, 'Data fasilitas tidak valid', errors);
  }

  return {
    nama: input.nama.trim(),
    kategori: input.kategori,
    alamat: input.alamat.trim(),
    latitude,
    longitude,
    jamOperasional: typeof input.jamOperasional === 'string' ? input.jamOperasional.trim() : '',
    kontak: typeof input.kontak === 'string' ? input.kontak.trim() : '',
    aktif,
  };
}

function createFacilityService(store) {
  function findOrFail(id) {
    const facility = store.data.facilities.find((f) => f.id === Number(id));
    if (!facility) throw new AppError(404, `Fasilitas dengan id ${id} tidak ditemukan`);
    return facility;
  }

  const service = {
    // Daftar fasilitas, bisa difilter kategori dan status aktif (AC 4 di sisi data untuk peta).
    list({ kategori, aktif } = {}) {
      return store.data.facilities.filter(
        (f) => (!kategori || f.kategori === kategori) && (aktif === undefined || f.aktif === aktif)
      );
    },

    get: findOrFail,

    create(input) {
      const now = new Date().toISOString();
      const facility = {
        id: store.nextId('facilities'),
        ...validateFacility({ aktif: true, ...input }),
        createdAt: now,
        updatedAt: now,
      };
      store.data.facilities.push(facility);
      store.save();
      return facility;
    },

    update(id, patch) {
      const facility = findOrFail(id);
      Object.assign(facility, validateFacility({ ...facility, ...patch }), {
        updatedAt: new Date().toISOString(),
      });
      store.save();
      return facility;
    },

    // Menonaktifkan, bukan menghapus permanen (AC 4).
    deactivate(id) {
      return service.update(id, { aktif: false });
    },
  };

  return service;
}

module.exports = { KATEGORI, validateFacility, createFacilityService };
