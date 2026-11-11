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
  defaultCenter: [-6.218, 106.824] as [number, number], // Jakarta
  defaultZoom: 13,
  cityCenters: {
    Semua: { center: [-6.218, 106.824] as [number, number], zoom: 13 },
    Jakarta: { center: [-6.218, 106.824] as [number, number], zoom: 13 },
    Bandung: { center: [-6.885, 107.613] as [number, number], zoom: 13 },
    Surabaya: { center: [-7.27, 112.74] as [number, number], zoom: 13 },
  },
  colors: {
    SPKLU: "#294bc3", // Blue
    SPBKLU: "#2bb5db", // Cyan / Teal
    Showroom: "#7b8ca6", // Slate Gray
    Origin: "#16a36a", // Emerald Green
    Route: "#2851d5", // Electric Blue
  },
} as const;
