export interface ParseResult {
  valid: boolean;
  value?: number;
  error?: string;
}

/**
 * Parser numerik 2-tahap yang aman dari bug bawaan JavaScript di mana Number("") === 0.
 * Tahap 1: Validasi string kosong / hanya spasi sebelum konversi angka.
 * Tahap 2: Validasi angka berhingga (Number.isFinite) setelah konversi.
 */
export function parseStrictNumber(raw: unknown): ParseResult {
  if (raw === null || raw === undefined) {
    return { valid: false, error: "Nilai tidak boleh kosong" };
  }

  if (typeof raw !== "string" && typeof raw !== "number") {
    return { valid: false, error: "Input harus berupa teks atau angka" };
  }

  const str = String(raw).trim();

  // Tahap 1: Tolak string kosong atau hanya spasi sebelum Number(str)
  if (str === "") {
    return { valid: false, error: "Nilai tidak boleh kosong atau hanya berisi spasi" };
  }

  const num = Number(str);

  // Tahap 2: Tolak NaN, Infinity, dan -Infinity
  if (!Number.isFinite(num)) {
    return {
      valid: false,
      error: "Nilai harus berupa angka berhingga yang valid (bukan NaN atau tak terhingga)",
    };
  }

  return { valid: true, value: num };
}

