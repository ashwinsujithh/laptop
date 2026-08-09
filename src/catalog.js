const WHATSAPP_NUMBER = "917025402409";

export function formatPrice(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "Price on request";
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0
  }).format(number);
}

export function buildSearchText(item) {
  return [
    item.brand, item.model, item.name, item.processor, item.processorFamily,
    item.ram, item.storage, item.graphics, item.display, item.operatingSystem,
    item.availabilityLabel, item.category, item.productType,
    ...(Array.isArray(item.features) ? item.features : [])
  ].filter(Boolean).join(" ").toLowerCase();
}

export function filterAndSortLaptops(laptops, filters) {
  const search = filters.search.trim().toLowerCase();
  const maximumPrice = filters.maximumPrice ? Number(filters.maximumPrice) : Infinity;

  return laptops.filter((item) =>
    (!search || buildSearchText(item).includes(search)) &&
    (!filters.brand || item.brand === filters.brand) &&
    (!filters.processor || item.processorFamily === filters.processor) &&
    (!filters.ram || item.ram === filters.ram) &&
    (!filters.storage || item.storage === filters.storage) &&
    Number(item.price) <= maximumPrice
  ).sort((first, second) => {
    if (filters.sort === "price-asc") return Number(first.price) - Number(second.price);
    if (filters.sort === "price-desc") return Number(second.price) - Number(first.price);
    if (filters.sort === "brand") return `${first.brand} ${first.model}`.localeCompare(`${second.brand} ${second.model}`);
    return new Date(second.addedAt || 0) - new Date(first.addedAt || 0);
  });
}

export function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" })
  );
}

export function whatsappUrl(lines) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.filter(Boolean).join("\n"))}`;
}
