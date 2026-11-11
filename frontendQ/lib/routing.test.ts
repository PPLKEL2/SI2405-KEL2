import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatDistance,
  formatDuration,
  calculateDrivingRoute,
  RoutingError,
} from "./routing.ts";

test("formatDistance: memformat jarak dalam meter dan kilometer dengan benar", () => {
  assert.equal(formatDistance(500), "500 m");
  assert.equal(formatDistance(950), "950 m");
  assert.equal(formatDistance(1000), "1,0 km");
  assert.equal(formatDistance(4200), "4,2 km");
  assert.equal(formatDistance(15750), "15,8 km");
});

test("formatDuration: memformat durasi dalam menit dan jam dengan benar", () => {
  assert.equal(formatDuration(25), "< 1 menit");
  assert.equal(formatDuration(60), "1 menit");
  assert.equal(formatDuration(18 * 60), "18 menit");
  assert.equal(formatDuration(60 * 60), "1 jam");
  assert.equal(formatDuration(80 * 60), "1 jam 20 menit");
});

test("calculateDrivingRoute: menolak koordinat tidak valid dengan RoutingError", async () => {
  await assert.rejects(
    async () => {
      await calculateDrivingRoute(
        { lat: NaN, lng: 106.8 },
        { lat: -6.2, lng: 106.85 },
        "Fasilitas Test"
      );
    },
    (err: unknown) => {
      assert.ok(err instanceof RoutingError);
      assert.ok(err.message.includes("tidak valid"));
      return true;
    }
  );
});

