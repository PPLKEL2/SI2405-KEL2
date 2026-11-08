'use strict';

// PBI 6: Manajemen Harga Layanan Fasilitas EV (tarif charging per kWh dan swap per transaksi)

const { AppError } = require('./errors');

// Satuan mengikuti jenis layanan. Kategori fasilitas juga dibatasi: SPKLU untuk charging, SPBKLU untuk swap.
const JENIS_LAYANAN = {
  CHARGING: { satuan: 'kWh', kategoriFasilitas: 'SPKLU' },
  SWAP: { satuan: 'transaksi', kategoriFasilitas: 'SPBKLU' },
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const OPEN_ENDED = '9999-12-31';

function isValidDate(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function toNumber(value) {
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return value;
}

// Memvalidasi tarif (AC 2, AC 4) dan mengembalikan nilai yang sudah dibersihkan.
function validateTarif(input, facility) {
  const errors = {};
  const jenis = JENIS_LAYANAN[input.jenisLayanan];
  const nilai = toNumber(input.nilai);
  const satuan = input.satuan ?? jenis?.satuan;
  const berlakuSampai = input.berlakuSampai || null;

  if (!facility) {
    errors.facilityId = 'Fasilitas tidak ditemukan';
  }

  if (!jenis) {
    errors.jenisLayanan = `Jenis layanan harus salah satu dari: ${Object.keys(JENIS_LAYANAN).join(', ')}`;
  } else {
    if (satuan !== jenis.satuan) {
      errors.satuan = `Satuan untuk ${input.jenisLayanan} harus '${jenis.satuan}'`;
    }
    if (facility && facility.kategori !== jenis.kategoriFasilitas) {
      errors.facilityId = `Layanan ${input.jenisLayanan} hanya untuk fasilitas kategori ${jenis.kategoriFasilitas}`;
    }
  }

  if (typeof nilai !== 'number' || !Number.isFinite(nilai) || nilai < 0) {
    errors.nilai = 'Nilai tarif harus angka >= 0';
  }

  if (!isValidDate(input.berlakuMulai)) {
    errors.berlakuMulai = 'Tanggal mulai berlaku harus format YYYY-MM-DD';
  }

  if (berlakuSampai !== null) {
    if (!isValidDate(berlakuSampai)) {
      errors.berlakuSampai = 'Tanggal akhir berlaku harus format YYYY-MM-DD atau dikosongkan';
    } else if (isValidDate(input.berlakuMulai) && berlakuSampai < input.berlakuMulai) {
      errors.berlakuSampai = 'Tanggal akhir berlaku tidak boleh sebelum tanggal mulai';
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError(400, 'Data tarif tidak valid', errors);
  }

  return {
    facilityId: facility.id,
    jenisLayanan: input.jenisLayanan,
    nilai,
    satuan,
    berlakuMulai: input.berlakuMulai,
    berlakuSampai,
  };
}

function periodeOverlap(a, b) {
  const aSampai = a.berlakuSampai ?? OPEN_ENDED;
  const bSampai = b.berlakuSampai ?? OPEN_ENDED;
  return a.berlakuMulai <= bSampai && b.berlakuMulai <= aSampai;
}

function createTarifService(store) {
  function findOrFail(id) {
    const tarif = store.data.tarif.find((t) => t.id === Number(id));
    if (!tarif) throw new AppError(404, `Tarif dengan id ${id} tidak ditemukan`);
    return tarif;
  }

  function facilityOrNull(facilityId) {
    return store.data.facilities.find((f) => f.id === Number(facilityId)) ?? null;
  }

  // Satu fasilitas tidak boleh punya dua tarif aktif untuk jenis layanan yang sama di periode yang bertabrakan.
  function assertNoOverlap(candidate, excludeId) {
    const conflict = store.data.tarif.find(
      (t) =>
        t.id !== excludeId &&
        t.facilityId === candidate.facilityId &&
        t.jenisLayanan === candidate.jenisLayanan &&
        periodeOverlap(t, candidate)
    );
    if (conflict) {
      throw new AppError(409, `Periode berlaku bertabrakan dengan tarif id ${conflict.id}`);
    }
  }

  const service = {
    list({ facilityId } = {}) {
      return store.data.tarif.filter((t) => !facilityId || t.facilityId === Number(facilityId));
    },

    get: findOrFail,

    create(input) {
      const value = validateTarif(input, facilityOrNull(input.facilityId));
      assertNoOverlap(value, null);

      const now = new Date().toISOString();
      const tarif = { id: store.nextId('tarif'), ...value, createdAt: now, updatedAt: now };
      store.data.tarif.push(tarif);
      store.save();
      return tarif;
    },

    update(id, patch) {
      const current = findOrFail(id);
      // Satuan ikut jenis layanan, kecuali satuan diisi ulang di patch.
      const merged = { ...current, satuan: undefined, ...patch };
      const value = validateTarif(merged, facilityOrNull(merged.facilityId));
      assertNoOverlap(value, current.id);

      Object.assign(current, value, { updatedAt: new Date().toISOString() });
      store.save();
      return current;
    },

    // Tarif yang berlaku pada tanggal tertentu, dipakai modul simulasi (AC 5 PBI 6).
    getAktif({ facilityId, jenisLayanan, tanggal = today() }) {
      if (!isValidDate(tanggal)) {
        throw new AppError(400, 'Parameter tanggal harus format YYYY-MM-DD');
      }
      return (
        store.data.tarif.find(
          (t) =>
            t.facilityId === Number(facilityId) &&
            t.jenisLayanan === jenisLayanan &&
            t.berlakuMulai <= tanggal &&
            (t.berlakuSampai === null || tanggal <= t.berlakuSampai)
        ) ?? null
      );
    },
  };

  return service;
}

module.exports = { JENIS_LAYANAN, validateTarif, createTarifService };
