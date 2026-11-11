/**
 * Konfigurasi Terpusat Peta dan Layanan Rute MobilitiQ (Frontend)
 * 
 * Digunakan untuk prototipe akademik (KEL2-71 dan KEL2-70).
 * Menggunakan layanan publik bebas biaya (OpenStreetMap + OSRM) tanpa API key berbayar.
 * 
 * Keterbatasan:
 * 1. OSRM Public Server (router.project-osrm.org) memiliki batas laju (rate-limiting)
 *    dan tidak memperhitungkan kemacetan lalu lintas waktu-nyata (real-time traffic).
 * 2. Tile OpenStreetMap publik ditujukan untuk beban prototipe dan edukasi.
 */

export const MAP_CONFIG = {
  tileLayerUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> kontributor | Rute oleh <a href="https://project-osrm.org/" target="_blank" rel="noopener">OSRM</a>',
  routingApiUrl: "https://router.project-osrm.org/route/v1/driving",
  maxZoom: 19,
  minZoom: 4,
  defaultCenter: [-6.2088, 106.8456] as [number, number], // Jakarta Pusat
  defaultZoom: 13,
  cityCenters: {
    Semua: { center: [-6.8, 108.5] as [number, number], zoom: 7 },
    Jakarta: { center: [-6.218, 106.824] as [number, number], zoom: 13 },
    Bandung: { center: [-6.9175, 107.6191] as [number, number], zoom: 13 },
    Surabaya: { center: [-7.2575, 112.7521] as [number, number], zoom: 13 },
  },
  colors: {
    SPKLU: "#0284c7", // Sky blue / Cyan
    SPBKLU: "#1e40af", // Electric Navy
    Showroom: "#475569", // Slate
    Origin: "#16a34a", // Emerald / Green
    Route: "#2563eb", // Electric Blue
  },
} as const;

