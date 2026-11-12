/**
 * Format angka ke standar Indonesia (id-ID) dengan jumlah desimal yang dapat disesuaikan.
 */
export function formatNumber(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format mata uang Rupiah standar Indonesia (Rp x.xxx).
 */
export function formatIdr(value: number): string {
  if (!Number.isFinite(value)) return "Rp 0";
  const rounded = Math.round(value);
  return `Rp ${new Intl.NumberFormat("id-ID").format(rounded)}`;
}

