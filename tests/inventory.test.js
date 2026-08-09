"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
  getAccessorySpecifications,
  getWarrantyLabel,
  loadCatalogs,
  validateInventory
} = require("../inventory.js");

const root = path.join(__dirname, "..");
const readJson = (filename) =>
  JSON.parse(fs.readFileSync(path.join(root, filename), "utf8"));

test("repository inventory is valid", () => {
  const laptops = readJson("laptops.json");
  const accessories = readJson("accessories.json");

  assert.deepEqual(validateInventory(laptops, "laptop"), []);
  assert.deepEqual(validateInventory(accessories, "accessory"), []);
  assert.ok(
    [...laptops, ...accessories].every((item) => item.warranty === "1 Year"),
    "every catalog item must have a 1 Year warranty"
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
    brand: "HP",
    model: "Victus",
    processor: "Intel i5",
    ram: "16GB",
    storage: "512GB SSD",
    graphics: "RTX 2050",
    price: 60000
  };

  const errors = validateInventory([
    { ...base, id: "victus-one" },
    { ...base, id: "victus-two", price: 65000 }
  ], "laptop");

  assert.deepEqual(errors, [
    "laptop item 2 duplicates the configuration from item 1"
  ]);
});

test("missing warranty is never presented as a confirmed warranty", () => {
  assert.equal(getWarrantyLabel({}), "Confirm warranty");
  assert.equal(getWarrantyLabel({ warranty: "3 Year" }), "3 Year");
});

test("nested keyboard specifications are rendered", () => {
  const specs = getAccessorySpecifications({
    keyboard: { keyType: "Quiet Chiclet Keys", layout: "Full-size" }
  });

  assert.deepEqual(specs, [
    ["Keys", "Quiet Chiclet Keys"],
    ["Layout", "Full-size"]
  ]);
});

test("catalogs load independently when one request fails", async () => {
  const loadJson = async (filename) => {
    if (filename === "accessories.json") {
      throw new Error("accessories unavailable");
    }

    return [{ id: "one", brand: "HP", model: "Model", price: 100 }];
  };

  const result = await loadCatalogs(loadJson);

  assert.equal(result.laptops.status, "fulfilled");
  assert.equal(result.laptops.items.length, 1);
  assert.equal(result.accessories.status, "rejected");
  assert.match(result.accessories.error.message, /accessories unavailable/);
});
