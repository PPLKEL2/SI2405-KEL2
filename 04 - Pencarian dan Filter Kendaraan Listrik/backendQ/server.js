// Backend API tanpa dependensi (Node >= 18): npm start -> http://localhost:8080
const http = require("http");
const vehicles = require("./data");

const PORT = process.env.PORT || 8080;
const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS || "http://localhost:3001,http://127.0.0.1:3001")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  res.setHeader("Vary", "Origin");
  if (allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
}

const num = (v) => (v === null || v === "" || isNaN(Number(v)) ? null : Number(v));

function searchVehicles(p) {
  const q = (p.get("q") || "").trim().toLowerCase();
  const type = p.get("type");
  const maxPrice = num(p.get("maxPrice"));
  const minBattery = num(p.get("minBattery"));
  const maxBattery = num(p.get("maxBattery"));
  const minRange = num(p.get("minRange"));

  let list = vehicles.filter((v) =>
    (!q || `${v.brand} ${v.model}`.toLowerCase().includes(q)) &&
    (!type || type === "semua" || v.type === type) &&
    (maxPrice === null || v.price <= maxPrice) &&
    (minBattery === null || v.batteryKwh >= minBattery) &&
    (maxBattery === null || v.batteryKwh < maxBattery) &&
    (minRange === null || v.rangeKm >= minRange)
  );

  const sorts = {
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    range_desc: (a, b) => b.rangeKm - a.rangeKm,
  };
  if (sorts[p.get("sort")]) list = list.sort(sorts[p.get("sort")]);
  return list;
}

const server = http.createServer((req, res) => {
  setCorsHeaders(req, res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === "GET" && url.pathname === "/api/vehicles") {
    const data = searchVehicles(url.searchParams);
    return send(res, 200, { total: data.length, data });
  }

  const one = url.pathname.match(/^\/api\/vehicles\/(\d+)$/);
  if (req.method === "GET" && one) {
    const vehicle = vehicles.find((item) => item.id === Number(one[1]));
    return vehicle
      ? send(res, 200, vehicle)
      : send(res, 404, { error: "Kendaraan tidak ditemukan" });
  }

  return send(res, 404, { error: "Endpoint tidak ada" });
});

if (require.main === module) {
  server.listen(PORT, () => console.log(`API PBI4 berjalan di http://localhost:${PORT}`));
}

module.exports = server;
