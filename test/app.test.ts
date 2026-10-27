import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { AddressInfo } from "node:net";
import { createApp } from "../src/app.js";
import { products } from "../src/catalogue.js";

const server = createApp();
let origin: string;

before(async () => {
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

test("health explicitly labels the service synthetic", async () => {
  const response = await fetch(`${origin}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok", synthetic: true });
});

test("catalogue returns the complete synthetic dataset and JSON headers", async () => {
  const response = await fetch(`${origin}/products`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^application\/json/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { products });
  assert.ok(products.every((product) => Number.isInteger(product.priceCents) && product.priceCents > 0));
});

test("a known product is returned by exact identifier", async () => {
  const response = await fetch(`${origin}/products/MAT-001`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { product: products[0] });
});

test("unknown products and paths return an explicit 404", async () => {
  for (const path of ["/products/MAT-999", "/products/invalid", "/missing", "/products/MAT-001/extra"]) {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, 404, path);
    assert.deepEqual(await response.json(), { error: "Not found" });
  }
});

test("unsupported methods are rejected without mutating catalogue data", async () => {
  for (const method of ["POST", "PUT", "DELETE"]) {
    const response = await fetch(`${origin}/products`, { method });
    assert.equal(response.status, 405);
    assert.equal(response.headers.get("allow"), "GET");
    assert.deepEqual(await response.json(), { error: "Method not allowed" });
  }
  assert.equal(products.length, 4);
});
