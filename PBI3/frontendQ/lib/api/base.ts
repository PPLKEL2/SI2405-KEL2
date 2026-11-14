/**
 * Menentukan URL dasar API secara dinamis:
 * 1. NEXT_PUBLIC_API_URL jika dikonfigurasi.
 * 2. Jika diakses lewat IP jaringan (mis. http://192.168.3.97:3000), arahkan ke backend di IP yang sama, port 4000.
 * 3. Default: http://localhost:4000/api/v1
 *
 * (Sama dengan getApiBaseUrl di lib/api/calculator.ts pada frontendQ utama.)
 */
export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined" && window.location) {
    const { hostname } = window.location;
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      return `http://${hostname}:4000/api/v1`;
    }
  }
  return "http://localhost:4000/api/v1";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
  timestamp?: string;
}
