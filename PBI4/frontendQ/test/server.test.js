const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const server = require("../server");

let base;
before(() => new Promise((resolve) => server.listen(0, () => {
  base = `http://localhost:${server.address().port}`;
  resolve();
})));
after(() => server.close());

test("menyajikan halaman katalog PBI4 secara terpisah dari API", async () => {
  const response = await fetch(base);
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  assert.match(html, /Katalog & Pencarian EV/);
  assert.match(html, /http:\/\/localhost:8080/);

  assert.equal((await fetch(`${base}/api/vehicles`)).status, 404);
});

test("path selain halaman utama tidak disajikan", async () => {
  assert.equal((await fetch(`${base}/missing`)).status, 404);
});
