export function getWarrantyLabel(item) {
  return String(item?.warranty || "").trim() || "Confirm warranty";
}

export function getAccessorySpecifications(item) {
  const keyboard = item?.keyboard || {};

  return [
    ["Works with", item?.compatibility],
    ["Type", item?.productType],
    ["Connection", item?.connection],
    ["Keys", item?.keyType || keyboard.keyType],
    ["Layout", item?.layout || keyboard.layout],
    ["Colour", item?.colour],
    ["Backlight", typeof item?.backlight === "boolean" ? (item.backlight ? "Yes" : "No") : null],
    ["Warranty", item?.warranty]
  ].filter(([, value]) => value !== undefined && value !== null && value !== "");
}

export function validateInventory(items, type) {
  if (!Array.isArray(items)) return [`${type} inventory must contain an array`];

  const errors = [];
  const ids = new Set();
  const configurations = new Map();

  items.forEach((item, index) => {
    const position = index + 1;
    const label = `${type} item ${position}`;

    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push(`${label} must be an object`);
      return;
    }

    const id = String(item.id || "").trim();
    if (!id) errors.push(`${label} must have an id`);
    else if (ids.has(id)) errors.push(`${label} has duplicate id "${id}"`);
    else ids.add(id);

    if (type === "laptop" && (!item.brand || !item.model)) {
      errors.push(`${label} must have a brand and model`);
    }

    if (type === "laptop" && item.brand && item.model) {
      const configuration = [item.brand, item.model, item.processor, item.ram, item.storage, item.graphics]
        .map((value) => String(value || "").trim().toLowerCase())
        .join("|");
      const originalPosition = configurations.get(configuration);
      if (originalPosition) {
        errors.push(`${label} duplicates the configuration from item ${originalPosition}`);
      } else {
        configurations.set(configuration, position);
      }
    }

    if (type === "accessory" && !item.name) errors.push(`${label} must have a name`);
    if (!Number.isFinite(Number(item.price)) || Number(item.price) <= 0) {
      errors.push(`${label} must have a positive price`);
    }
    if (item.addedAt && Number.isNaN(Date.parse(item.addedAt))) {
      errors.push(`${label} has an invalid addedAt date`);
    }
  });

  return errors;
}

async function loadCatalog(loadJson, filename, type) {
  try {
    const items = await loadJson(filename);
    const errors = validateInventory(items, type);
    if (errors.length) throw new Error(`${filename}: ${errors.join("; ")}`);
    return { status: "fulfilled", items };
  } catch (error) {
    return { status: "rejected", error: error instanceof Error ? error : new Error(String(error)) };
  }
}

export async function loadCatalogs(loadJson) {
  const [laptops, accessories] = await Promise.all([
    loadCatalog(loadJson, "laptops.json", "laptop"),
    loadCatalog(loadJson, "accessories.json", "accessory")
  ]);
  return { laptops, accessories };
}
