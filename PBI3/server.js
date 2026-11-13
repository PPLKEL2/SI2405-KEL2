const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const DB_FILE = process.env.DB_FILE || path.join(__dirname, "data.json");
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Penyimpanan sederhana (JSON file). Ganti ke database sungguhan untuk produksi.
const load = () => JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
const save = (d) => fs.writeFileSync(DB_FILE, JSON.stringify(d, null, 2));

if (!fs.existsSync(DB_FILE)) {
  const now = new Date().toISOString();
  const s = (model, tipe, baterai_kwh, harga_otr, charger_ac_kw, promo) => ({
    id: crypto.randomUUID(), model, tipe, baterai_kwh, harga_otr, charger_ac_kw,
    promo, aktif: true, created_at: now, updated_at: now,
  });
  save([
    s("Polytron Fox-R", "Motor", 2.4, 23900000, 0.4, "Gratis wallbox"),
    s("Gesits G1", "Motor", 1.8, 29900000, 0.4, ""),
    s("United T1800", "Motor", 3.0, 33500000, 0.6, "Cashback Rp 2 jt"),
    s("Honda EM1e:", "Motor", 1.5, 40000000, 0.3, ""),
    s("Alva One", "Motor", 3.4, 36800000, 0.7, "Bunga 0% 12 bln"),
    s("BYD Seagull", "Mobil", 38.9, 150000000, 7.0, "DP mulai 10%"),
    s("Wuling Air ev Long Range", "Mobil", 41.3, 238000000, 6.6, ""),
  ]);
}

// Validasi spesifikasi
const LIMITS = {
  baterai_kwh: [0.1, 500, "Baterai", "kWh"],
  harga_otr: [1000000, 5000000000, "Harga OTR", "Rp"],
  charger_ac_kw: [0.1, 350, "Charger AC", "kW"],
};
const isBool = (v) => [true, false, "true", "false"].includes(v);

function validate(body, partial = false) {
  const errors = [], c = {};
  if (body.model !== undefined || !partial) {
    const m = String(body.model || "").trim();
    if (!m) errors.push("Model wajib diisi");
    else if (m.length > 80) errors.push("Model maksimal 80 karakter");
    else c.model = m;
  }
  if (body.tipe !== undefined || !partial) {
    ["Motor", "Mobil"].includes(body.tipe) ? (c.tipe = body.tipe) : errors.push("Tipe harus Motor atau Mobil");
  }
  for (const [k, [min, max, label, unit]] of Object.entries(LIMITS)) {
    const raw = body[k];
    if (raw === undefined || raw === null || raw === "") { if (!partial) errors.push(`${label} wajib diisi`); continue; }
    const v = Number(raw);
    if (Number.isNaN(v)) errors.push(`${label} harus berupa angka`);
    else if (v < min || v > max) errors.push(`${label} harus antara ${min} dan ${max} ${unit}`);
    else c[k] = v;
  }
  if (body.promo !== undefined) {
    const p = String(body.promo).trim();
    p.length > 100 ? errors.push("Promo maksimal 100 karakter") : (c.promo = p);
  }
  if (body.aktif !== undefined) isBool(body.aktif) ? (c.aktif = body.aktif === true || body.aktif === "true") : errors.push("Status tidak valid");
  return { errors, clean: c };
}
const dupe = (list, model, exceptId) =>
  list.some((x) => x.id !== exceptId && x.model.toLowerCase() === model.toLowerCase());

// API admin mitra
app.get("/api/vehicles", (req, res) => {
  res.json(load().sort((a, b) => a.created_at.localeCompare(b.created_at)));
});

app.get("/api/vehicles/:id", (req, res) => {
  const v = load().find((x) => x.id === req.params.id);
  v ? res.json(v) : res.status(404).json({ error: "Unit tidak ditemukan" });
});

app.post("/api/vehicles", (req, res) => {
  const { errors, clean } = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });
  const list = load();
  if (dupe(list, clean.model)) return res.status(409).json({ errors: ["Model sudah ada di katalog"] });
  const now = new Date().toISOString();
  const v = { promo: "", aktif: true, ...clean, id: crypto.randomUUID(), created_at: now, updated_at: now };
  list.push(v); save(list);
  res.status(201).json(v);
});

app.put("/api/vehicles/:id", (req, res) => {
  const list = load();
  const i = list.findIndex((x) => x.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: "Unit tidak ditemukan" });
  const { errors, clean } = validate(req.body, true);
  if (errors.length) return res.status(400).json({ errors });
  if (clean.model && dupe(list, clean.model, req.params.id)) return res.status(409).json({ errors: ["Model sudah ada di katalog"] });
  list[i] = { ...list[i], ...clean, updated_at: new Date().toISOString() };
  save(list);
  res.json(list[i]);
});

app.patch("/api/vehicles/:id/status", (req, res) => {
  const list = load();
  const v = list.find((x) => x.id === req.params.id);
  if (!v) return res.status(404).json({ error: "Unit tidak ditemukan" });
  if (!isBool(req.body.aktif)) return res.status(400).json({ errors: ["Status tidak valid"] });
  v.aktif = req.body.aktif === true || req.body.aktif === "true";
  v.updated_at = new Date().toISOString();
  save(list);
  res.json(v);
});

app.delete("/api/vehicles/:id", (req, res) => {
  const list = load();
  const next = list.filter((x) => x.id !== req.params.id);
  if (next.length === list.length) return res.status(404).json({ error: "Unit tidak ditemukan" });
  save(next);
  res.status(204).end();
});

// API publik: referensi simulasi pengguna (hanya unit aktif)
app.get("/api/public/vehicles", (req, res) => {
  res.json(load().filter((v) => v.aktif).map(({ created_at, updated_at, ...pub }) => pub));
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
}
module.exports = app;
