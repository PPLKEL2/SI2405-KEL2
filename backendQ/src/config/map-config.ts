/**
 * Konfigurasi Terpusat Peta dan Layanan Rute MobilitiQ (Backend)
 * 
 * Digunakan untuk prototipe akademik (KEL2-71 dan KEL2-70).
 * Menggunakan layanan publik bebas biaya (OSRM) tanpa API key berbayar.
 * 
 * Keterbatasan:
 * 1. OSRM Public Server (router.project-osrm.org) memiliki batas laju (rate-limiting)
 *    dan tidak memperhitungkan kemacetan lalu lintas waktu-nyata (live traffic).
 * 2. Direkomendasikan timeout 10 detik agar backend tidak menggantung saat OSRM lambat.
 */

export const MAP_CONFIG = {
  routingApiUrl: process.env.ROUTING_API_URL || "https://router.project-osrm.org/route/v1/driving",
  timeoutMs: 10000,
} as const;

