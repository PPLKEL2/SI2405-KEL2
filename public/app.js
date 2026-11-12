'use strict';

const KATEGORI_WARNA = { Showroom: '#2563eb', SPKLU: '#16a34a', SPBKLU: '#ea580c' };
const JENIS_LABEL = { CHARGING: 'Charging (per kWh)', SWAP: 'Swap baterai (per transaksi)' };
const SATUAN_LABEL = { CHARGING: 'Nilai (Rp per kWh)', SWAP: 'Nilai (Rp per transaksi)' };

const state = { facilities: [], tarif: [], map: null, markers: null };

const $ = (selector) => document.querySelector(selector);

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

async function api(method, path, body) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || 'Permintaan gagal');
    error.errors = data.errors;
    throw error;
  }
  return data;
}

function formatError(err) {
  const details = err.errors ? Object.values(err.errors) : [];
  return [err.message, ...details].join('\n');
}

function showMessage(el, text, ok) {
  el.textContent = text;
  el.className = `message ${ok ? 'ok' : 'error'}`;
}

function formData(form) {
  return Object.fromEntries(new FormData(form));
}

// ---------- Tab ----------

document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === btn.dataset.tab));
    if (state.map) state.map.invalidateSize();
  });
});

// ---------- PBI 5: Fasilitas ----------

function initMap() {
  state.map = L.map('map').setView([-6.2, 106.82], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
  }).addTo(state.map);
  state.markers = L.layerGroup().addTo(state.map);
}

function renderMap() {
  if (!state.map) return;
  state.markers.clearLayers();
  const kategori = $('#filter-kategori').value;
  const aktif = state.facilities.filter((f) => f.aktif && (!kategori || f.kategori === kategori));

  for (const f of aktif) {
    L.circleMarker([f.latitude, f.longitude], {
      radius: 9,
      color: '#fff',
      weight: 2,
      fillColor: KATEGORI_WARNA[f.kategori] ?? '#64748b',
      fillOpacity: 1,
    })
      .bindPopup(`<strong>${esc(f.nama)}</strong><br>${esc(f.kategori)}<br>${esc(f.alamat)}<br>${esc(f.jamOperasional)}`)
      .addTo(state.markers);
  }

  if (aktif.length > 1) {
    state.map.fitBounds(L.latLngBounds(aktif.map((f) => [f.latitude, f.longitude])).pad(0.2));
  } else if (aktif.length === 1) {
    state.map.setView([aktif[0].latitude, aktif[0].longitude], 14);
  }
}

function renderFacilities() {
  const kategori = $('#filter-kategori').value;
  const rows = state.facilities.filter((f) => !kategori || f.kategori === kategori);

  $('#facility-rows').innerHTML = rows.length
    ? rows.map((f) => `
      <tr class="${f.aktif ? '' : 'nonaktif'}">
        <td>${esc(f.nama)}</td>
        <td>${esc(f.kategori)}</td>
        <td>${esc(f.alamat)}</td>
        <td>${esc(f.latitude)}, ${esc(f.longitude)}</td>
        <td>${f.aktif ? 'Aktif' : 'Nonaktif'}</td>
        <td class="aksi">
          <button class="small secondary" data-edit-facility="${f.id}">Ubah</button>
          ${f.aktif ? `<button class="small danger" data-nonaktifkan="${f.id}">Nonaktifkan</button>` : ''}
        </td>
      </tr>`).join('')
    : '<tr><td colspan="6">Belum ada data fasilitas</td></tr>';
}

function renderFacilityOptions() {
  const options = state.facilities.map((f) =>
    `<option value="${f.id}">${esc(f.nama)} (${esc(f.kategori)})${f.aktif ? '' : ' — nonaktif'}</option>`
  ).join('');
  $('#tarif-facility').innerHTML = options;
  $('#cek-facility').innerHTML = options;
}

async function loadFacilities() {
  state.facilities = await api('GET', '/api/facilities');
  renderFacilities();
  renderFacilityOptions();
  renderMap();
}

function resetFacilityForm() {
  $('#facility-form').reset();
  $('#facility-id').value = '';
  $('#facility-title').textContent = 'Tambah fasilitas';
  $('#facility-submit').textContent = 'Simpan fasilitas';
}

$('#filter-kategori').addEventListener('change', () => {
  renderFacilities();
  renderMap();
});
$('#facility-cancel').addEventListener('click', resetFacilityForm);

$('#facility-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = $('#facility-message');
  const data = formData(e.currentTarget);
  const id = data.id;
  delete data.id;

  try {
    if (id) {
      await api('PUT', `/api/facilities/${id}`, data);
    } else {
      await api('POST', '/api/facilities', data);
    }
    resetFacilityForm();
    showMessage(msg, 'Fasilitas tersimpan', true);
    await loadFacilities();
  } catch (err) {
    showMessage(msg, formatError(err), false);
  }
});

$('#facility-rows').addEventListener('click', async (e) => {
  const edit = e.target.closest('[data-edit-facility]');
  const deactivate = e.target.closest('[data-nonaktifkan]');

  if (edit) {
    const f = state.facilities.find((x) => x.id === Number(edit.dataset.editFacility));
    const form = $('#facility-form');
    for (const [name, value] of Object.entries(f)) {
      if (form.elements[name]) form.elements[name].value = value;
    }
    $('#facility-id').value = f.id;
    $('#facility-title').textContent = `Ubah fasilitas #${f.id}`;
    $('#facility-submit').textContent = 'Perbarui fasilitas';
    form.scrollIntoView({ behavior: 'smooth' });
  }

  if (deactivate) {
    if (!confirm('Nonaktifkan fasilitas ini? Data tetap disimpan.')) return;
    try {
      await api('DELETE', `/api/facilities/${deactivate.dataset.nonaktifkan}`);
      showMessage($('#facility-message'), 'Fasilitas dinonaktifkan', true);
      await loadFacilities();
    } catch (err) {
      showMessage($('#facility-message'), formatError(err), false);
    }
  }
});

// ---------- PBI 6: Tarif ----------

function renderTarif() {
  const namaFasilitas = Object.fromEntries(state.facilities.map((f) => [f.id, f.nama]));

  $('#tarif-rows').innerHTML = state.tarif.length
    ? state.tarif.map((t) => `
      <tr>
        <td>${esc(namaFasilitas[t.facilityId] ?? `#${t.facilityId}`)}</td>
        <td>${esc(JENIS_LABEL[t.jenisLayanan] ?? t.jenisLayanan)}</td>
        <td>Rp ${Number(t.nilai).toLocaleString('id-ID')} / ${esc(t.satuan)}</td>
        <td>${esc(t.berlakuMulai)} s/d ${esc(t.berlakuSampai ?? 'seterusnya')}</td>
        <td class="aksi"><button class="small secondary" data-edit-tarif="${t.id}">Ubah</button></td>
      </tr>`).join('')
    : '<tr><td colspan="5">Belum ada data tarif</td></tr>';
}

async function loadTarif() {
  state.tarif = await api('GET', '/api/tarif');
  renderTarif();
}

function syncNilaiLabel() {
  $('#tarif-nilai-label').textContent = SATUAN_LABEL[$('#tarif-jenis').value];
}

function resetTarifForm() {
  $('#tarif-form').reset();
  $('#tarif-id').value = '';
  $('#tarif-title').textContent = 'Tambah tarif';
  $('#tarif-submit').textContent = 'Simpan tarif';
  syncNilaiLabel();
}

$('#tarif-jenis').addEventListener('change', syncNilaiLabel);
$('#tarif-cancel').addEventListener('click', resetTarifForm);

$('#tarif-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = $('#tarif-message');
  const data = formData(e.currentTarget);
  const id = data.id;
  delete data.id;

  try {
    if (id) {
      await api('PUT', `/api/tarif/${id}`, data);
    } else {
      await api('POST', '/api/tarif', data);
    }
    resetTarifForm();
    showMessage(msg, 'Tarif tersimpan', true);
    await loadTarif();
  } catch (err) {
    showMessage(msg, formatError(err), false);
  }
});

$('#tarif-rows').addEventListener('click', (e) => {
  const edit = e.target.closest('[data-edit-tarif]');
  if (!edit) return;

  const t = state.tarif.find((x) => x.id === Number(edit.dataset.editTarif));
  const form = $('#tarif-form');
  for (const [name, value] of Object.entries(t)) {
    if (form.elements[name]) form.elements[name].value = value ?? '';
  }
  $('#tarif-id').value = t.id;
  $('#tarif-title').textContent = `Ubah tarif #${t.id}`;
  $('#tarif-submit').textContent = 'Perbarui tarif';
  syncNilaiLabel();
  form.scrollIntoView({ behavior: 'smooth' });
});

$('#cek-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const result = $('#cek-result');
  const { facilityId, jenisLayanan, tanggal } = formData(e.currentTarget);
  const query = new URLSearchParams({ facilityId, jenisLayanan, tanggal });

  try {
    const t = await api('GET', `/api/tarif/aktif?${query}`);
    showMessage(result, `Tarif aktif: Rp ${Number(t.nilai).toLocaleString('id-ID')} / ${t.satuan} (berlaku ${t.berlakuMulai} s/d ${t.berlakuSampai ?? 'seterusnya'})`, true);
  } catch (err) {
    showMessage(result, formatError(err), false);
  }
});

// ---------- Start ----------

async function start() {
  $('#cek-tanggal').value = new Date().toISOString().slice(0, 10);
  syncNilaiLabel();

  if (window.L) {
    initMap();
  } else {
    $('#map').textContent = 'Peta tidak bisa dimuat (periksa koneksi internet).';
  }

  try {
    await loadFacilities();
    await loadTarif();
  } catch (err) {
    showMessage($('#facility-message'), formatError(err), false);
  }
}

start();
