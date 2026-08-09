import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  getAccessorySpecifications,
  getWarrantyLabel,
  loadCatalogs,
  validateInventory
} from "../src/inventory.js";
import { filterAndSortLaptops } from "../src/catalog.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (filename) =>
  JSON.parse(fs.readFileSync(path.join(root, "public", filename), "utf8"));

test("repository inventory is valid", () => {
  const laptops = readJson("laptops.json");
  const accessories = readJson("accessories.json");

  assert.deepEqual(validateInventory(laptops, "laptop"), []);
  assert.deepEqual(validateInventory(accessories, "accessory"), []);
  assert.ok(
    [...laptops, ...accessories].every((item) => item.warranty === "1 Year")
  );
});

test("validation reports duplicate IDs and invalid commercial data", () => {
  const items = [
    { id: "same", brand: "A", model: "One", price: 100, addedAt: "bad" },
    { id: "same", brand: "B", model: "Two", price: 0, addedAt: "2026-01-01" }
  ];

  assert.deepEqual(validateInventory(items, "laptop"), [
    "laptop item 1 has an invalid addedAt date",
    'laptop item 2 has duplicate id "same"',
    "laptop item 2 must have a positive price"
  ]);
});

test("validation reports duplicate laptop configurations", () => {
  const base = {
    brand: "HP", model: "Victus", processor: "Intel i5", ram: "16GB",
    storage: "512GB SSD", graphics: "RTX 2050", price: 60000
  };

  assert.deepEqual(validateInventory([
    { ...base, id: "victus-one" },
    { ...base, id: "victus-two", price: 65000 }
  ], "laptop"), ["laptop item 2 duplicates the configuration from item 1"]);
});

test("missing warranty is never presented as confirmed", () => {
  assert.equal(getWarrantyLabel({}), "Confirm warranty");
  assert.equal(getWarrantyLabel({ warranty: "1 Year" }), "1 Year");
});

test("nested keyboard specifications are available", () => {
  assert.deepEqual(getAccessorySpecifications({
    keyboard: { keyType: "Quiet Chiclet Keys", layout: "Full-size" }
  }), [["Keys", "Quiet Chiclet Keys"], ["Layout", "Full-size"]]);
});

test("catalogs load independently when one request fails", async () => {
  const result = await loadCatalogs(async (filename) => {
    if (filename === "accessories.json") throw new Error("unavailable");
    return [{ id: "one", brand: "HP", model: "Model", price: 100 }];
  });

  assert.equal(result.laptops.status, "fulfilled");
  assert.equal(result.accessories.status, "rejected");
});

test("laptops can be searched, filtered, and sorted without mutation", () => {
  const laptops = [
    { id: "one", brand: "HP", model: "Omen", processorFamily: "Intel", ram: "16GB", storage: "1TB", price: 90000, addedAt: "2026-01-01" },
    { id: "two", brand: "ASUS", model: "VivoBook", processorFamily: "AMD", ram: "8GB", storage: "512GB", price: 45000, addedAt: "2026-02-01" }
  ];

  const result = filterAndSortLaptops(laptops, {
    search: "asus", brand: "ASUS", processor: "AMD", ram: "8GB",
    storage: "512GB", maximumPrice: "50000", sort: "price-asc"
  });

  assert.deepEqual(result.map((item) => item.id), ["two"]);
  assert.deepEqual(laptops.map((item) => item.id), ["one", "two"]);
});
