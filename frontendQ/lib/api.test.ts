import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { formatRupiah, formatNumberId } from "./api.ts";

describe("Frontend Formatter & Utility Suite", () => {
  test("formatRupiah: memformat angka ke mata uang Rupiah Indonesia dengan titik ribuan", () => {
    assert.equal(formatRupiah(375000), "Rp 375.000");
    assert.equal(formatRupiah(20500000), "Rp 20.500.000");
    assert.equal(formatRupiah(0), "Rp 0");
  });

  test("formatNumberId: memformat desimal dengan koma sesuai ejaan Indonesia", () => {
    assert.equal(formatNumberId(52.2, 1), "52,2");
    assert.equal(formatNumberId(1800, 0), "1.800");
  });
});

