"use strict";

const WHATSAPP_NUMBER = "917025402409";

const state = {
  laptops: [],
  accessories: []
};

const byId = (id) => document.getElementById(id);

const els = {
  grid: byId("laptopGrid"),
  accessoryGrid: byId("accessoryGrid"),
  empty: byId("emptyState"),
  resultCount: byId("resultCount"),
  accessoryCount: byId("accessoryCount"),
  search: byId("searchInput"),
  brand: byId("brandFilter"),
  processor: byId("processorFilter"),
  ram: byId("ramFilter"),
  storage: byId("storageFilter"),
  price: byId("priceFilter"),
  sort: byId("sortFilter"),
  clear: byId("clearFilters"),
  filterToggle: byId("filterToggle"),
  filterPanel: byId("filterPanel"),
  filterBadge: byId("filterBadge"),
  browseLaptops: byId("browseLaptops")
};

const formatPrice = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value));
};

const unique = (values) => {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), undefined, {
      numeric: true,
      sensitivity: "base"
    })
  );
};

const escapeHtml = (value) => {
  return String(value ?? "").replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
      })[character]
  );
};

const safeClassName = (value) => {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "");
};

function populateSelect(select, values) {
  values.forEach((value) => {
    select.add(new Option(value, value));
  });
}

function buildSearchText(item) {
  return [
    item.brand,
    item.model,
    item.processor,
    item.processorFamily,
    item.ram,
    item.storage,
    item.graphics,
    item.display,
    item.operatingSystem,
    item.availabilityLabel,
    ...(item.features || [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function filteredLaptops() {
  const query = els.search.value.trim().toLowerCase();
  const maxPrice = Number(els.price.value || Infinity);

  return state.laptops
    .filter((item) => {
      const matchesSearch =
        !query || buildSearchText(item).includes(query);

      const matchesBrand =
        !els.brand.value || item.brand === els.brand.value;

      const matchesProcessor =
        !els.processor.value ||
        item.processorFamily === els.processor.value;

      const matchesRam =
        !els.ram.value || item.ram === els.ram.value;

      const matchesStorage =
        !els.storage.value || item.storage === els.storage.value;

      const matchesPrice = Number(item.price) <= maxPrice;

      return (
        matchesSearch &&
        matchesBrand &&
        matchesProcessor &&
        matchesRam &&
        matchesStorage &&
        matchesPrice
      );
    })
    .sort((a, b) => {
      switch (els.sort.value) {
        case "price-asc":
          return Number(a.price) - Number(b.price);

        case "price-desc":
          return Number(b.price) - Number(a.price);

        case "brand":
          return `${a.brand} ${a.model}`.localeCompare(
            `${b.brand} ${b.model}`
          );

        case "newest":
        default:
          return new Date(b.addedAt) - new Date(a.addedAt);
      }
    });
}

function createWhatsAppUrl(item) {
  const message = [
    "Hello HARDNSOFT,",
    "",
    `I am interested in the ${item.brand} ${item.model}.`,
    `Processor: ${item.processor}`,
    `RAM: ${item.ram}`,
    `Storage: ${item.storage}`,
    `Graphics: ${item.graphics || "Integrated graphics"}`,
    `Our price: ${formatPrice(item.price)}`,
    "Warranty: 1 year",
    "",
    "Please confirm current availability."
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message
  )}`;
}

function buildPricingHtml(item) {
  const price = Number(item.price);
  const mrp = Number(item.mrp);

  const hasValidMrp =
    Number.isFinite(mrp) &&
    mrp > 0 &&
    mrp > price;

  if (!hasValidMrp) {
    return `
      <div class="price-panel">
        <div class="price-label">
          ${escapeHtml(item.priceLabel || "Our price")}
        </div>

        <div class="price">
          ${formatPrice(price)}
        </div>
      </div>
    `;
  }

  const saving = mrp - price;
  const discount = Math.round((saving / mrp) * 100);

  return `
    <div class="price-panel">
      <div class="price-main-row">
        <div class="price-side">
          <div class="our-price-label">
            ${escapeHtml(item.priceLabel || "Our price")}
          </div>

          <div class="price">
            ${formatPrice(price)}
          </div>
        </div>

        <div class="mrp-side">
          <div class="mrp-label">MRP</div>

          <div class="mrp">
            ${formatPrice(mrp)}
          </div>

          <span class="discount">
            ${discount}% OFF
          </span>
        </div>
      </div>

      <div class="saving">
        You save ${formatPrice(saving)}
      </div>
    </div>
  `;
}

function processorImageHtml(item) {
  const processorName = escapeHtml(
    item.processorFamily || item.processor
  );

  if (!item.processorImage) {
    return `
      <div class="processor-image-wrap">
        <span
          class="processor-fallback"
          style="display:block"
        >
          ${processorName}
        </span>
      </div>
    `;
  }

  return `
    <div class="processor-image-wrap">
      <img
        class="processor-image"
        src="${escapeHtml(item.processorImage)}"
        alt="${processorName} processor badge"
        loading="lazy"
        referrerpolicy="no-referrer"
        onerror="
          this.style.display='none';
          this.nextElementSibling.style.display='block';
        "
      />

      <span class="processor-fallback">
        ${processorName}
      </span>
    </div>
  `;
}

function laptopCard(item) {
  const features = Array.isArray(item.features)
    ? item.features.slice(0, 3)
    : [];

  const featuresHtml = features.length
    ? `
      <ul class="feature-list">
        ${features
          .map((feature) => `<li>${escapeHtml(feature)}</li>`)
          .join("")}
      </ul>
    `
    : "";

  return `
    <article class="product-card">
      <div class="card-visual ${safeClassName(item.brand)}">
        <div class="visual-header">
          <span class="availability-badge">
            ${escapeHtml(item.availabilityLabel || "Available")}
          </span>

          <div class="brand-mark">
            ${escapeHtml(item.brand)}
          </div>
        </div>

        <div class="product-laptop-art" aria-hidden="true">
          <div class="product-laptop-screen">
            <span>${escapeHtml(item.model)}</span>
          </div>

          <div class="product-laptop-base"></div>
        </div>
      </div>

      <div class="card-body">
        <p class="model-label">
          ${escapeHtml(item.brand)}
        </p>

        <h2>${escapeHtml(item.model)}</h2>

        <div class="processor-banner">
          ${processorImageHtml(item)}

          <div>
            <small>Processor</small>
            <strong>${escapeHtml(item.processor)}</strong>
          </div>
        </div>

        <div class="compact-spec-row">
          <div class="compact-spec">
            <span class="compact-icon">RAM</span>

            <small>Memory</small>

            <strong>${escapeHtml(item.ram)}</strong>
          </div>

          <div class="compact-spec">
            <span class="compact-icon">SSD</span>

            <small>Storage</small>

            <strong>${escapeHtml(item.storage)}</strong>
          </div>

          <div class="compact-spec">
            <span class="compact-icon">GPU</span>

            <small>Graphics</small>

            <strong>
              ${escapeHtml(item.graphics || "Integrated")}
            </strong>
          </div>
        </div>

        <dl class="extra-specs">
          <div>
            <dt>Display</dt>

            <dd>
              ${escapeHtml(item.display || "Not specified")}
            </dd>
          </div>

          <div>
            <dt>Warranty</dt>

            <dd class="warranty-value">
              1 year warranty
            </dd>
          </div>
        </dl>

        ${featuresHtml}

        <div class="card-footer">
          ${buildPricingHtml(item)}

          <a
            class="whatsapp-button"
            href="${createWhatsAppUrl(item)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Enquire on WhatsApp
          </a>
        </div>
      </div>
    </article>
  `;
}

function accessoryCard(item) {
  const initials = item.name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const featureList = Array.isArray(item.features)
    ? `
      <ul class="accessory-feature-list">
        ${item.features
          .map(
            (feature) => `
              <li>${escapeHtml(feature)}</li>
            `
          )
          .join("")}
      </ul>
    `
    : "";

  const whatsappMessage = encodeURIComponent(
    [
      "Hello HARDNSOFT,",
      "",
      `I am interested in the ${item.name}.`,
      item.brand ? `Brand: ${item.brand}` : "",
      item.model ? `Model: ${item.model}` : "",
      item.connection ? `Connection: ${item.connection}` : "",
      item.layout ? `Layout: ${item.layout}` : "",
      `Price: ${formatPrice(item.price)}`,
      item.warranty ? `Warranty: ${item.warranty}` : "",
      "",
      "Please confirm current availability."
    ]
      .filter(Boolean)
      .join("\n")
  );

  const mrp = Number(item.mrp);
  const price = Number(item.price);

  const hasValidMrp =
    Number.isFinite(mrp) &&
    mrp > 0 &&
    mrp > price;

  const priceHtml = hasValidMrp
    ? `
      <div class="accessory-price-box">
        <div class="accessory-mrp-row">
          <div class="price-side">
            <small>Our price</small>

            <div class="price">
              ${formatPrice(price)}
            </div>
          </div>

          <div class="mrp-side">
            <small>MRP</small>
            <div class="accessory-mrp">
              ${formatPrice(mrp)}
            </div>

            <span class="discount">
              ${Math.round(((mrp - price) / mrp) * 100)}% OFF
            </span>
          </div>
        </div>

        <div class="saving">
          You save ${formatPrice(mrp - price)}
        </div>
      </div>
    `
    : `
      <div class="accessory-price-box">
        <small>Selling price</small>

        <div class="price">
          ${formatPrice(price)}
        </div>
      </div>
    `;

  return `
    <article class="product-card accessory-card">
      <div class="accessory-visual">
        <div>
          <span>${escapeHtml(item.category)}</span>

          ${
            item.brand
              ? `
                <div class="accessory-brand">
                  ${escapeHtml(item.brand)}
                </div>
              `
              : ""
          }
        </div>

        <strong>${escapeHtml(initials)}</strong>
      </div>

      <div class="card-body">
        <div class="stock-label">
          ${escapeHtml(item.stock)}
        </div>

        <p class="model-label">
          ${escapeHtml(item.model || item.productType || "Accessory")}
        </p>

        <h2>${escapeHtml(item.name)}</h2>

        <dl class="accessory-spec-list">
          ${
            item.compatibility
              ? `
                <div>
                  <dt>Works with</dt>
                  <dd>${escapeHtml(item.compatibility)}</dd>
                </div>
              `
              : ""
          }

          ${
            item.productType
              ? `
                <div>
                  <dt>Type</dt>
                  <dd>${escapeHtml(item.productType)}</dd>
                </div>
              `
              : ""
          }

          ${
            item.connection
              ? `
                <div>
                  <dt>Connection</dt>
                  <dd>${escapeHtml(item.connection)}</dd>
                </div>
              `
              : ""
          }

          ${
            item.keyType
              ? `
                <div>
                  <dt>Keys</dt>
                  <dd>${escapeHtml(item.keyType)}</dd>
                </div>
              `
              : ""
          }

          ${
            item.layout
              ? `
                <div>
                  <dt>Layout</dt>
                  <dd>${escapeHtml(item.layout)}</dd>
                </div>
              `
              : ""
          }

          ${
            item.colour
              ? `
                <div>
                  <dt>Colour</dt>
                  <dd>${escapeHtml(item.colour)}</dd>
                </div>
              `
              : ""
          }

          ${
            typeof item.backlight === "boolean"
              ? `
                <div>
                  <dt>Backlight</dt>
                  <dd>${item.backlight ? "Yes" : "No"}</dd>
                </div>
              `
              : ""
          }

          ${
            item.warranty
              ? `
                <div>
                  <dt>Warranty</dt>
                  <dd class="warranty-value">
                    ${escapeHtml(item.warranty)}
                  </dd>
                </div>
              `
              : ""
          }
        </dl>

        ${featureList}

        <div class="card-footer">
          ${priceHtml}

          <a
            class="whatsapp-button"
            href="https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Enquire on WhatsApp
          </a>
        </div>
      </div>
    </article>
  `;
}

function renderLaptops() {
  const items = filteredLaptops();

  els.grid.innerHTML = items.map(laptopCard).join("");
  els.empty.hidden = items.length !== 0;

  els.resultCount.textContent = `${items.length} laptop${
    items.length === 1 ? "" : "s"
  } available`;

  const activeCount = [
    els.search,
    els.brand,
    els.processor,
    els.ram,
    els.storage,
    els.price
  ].filter((input) => input.value).length;

  els.filterBadge.hidden = activeCount === 0;
  els.filterBadge.textContent = String(activeCount);
}

function renderAccessories() {
  els.accessoryGrid.innerHTML = state.accessories
    .map(accessoryCard)
    .join("");

  els.accessoryCount.textContent = `${
    state.accessories.length
  } accessor${state.accessories.length === 1 ? "y" : "ies"} available`;
}

function showTab(name, updateHash = true) {
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    const active = panel.dataset.panel === name;

    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });

  document.querySelectorAll("[data-tab]").forEach((tab) => {
    const active = tab.dataset.tab === name;

    tab.classList.toggle("active", active);

    tab.setAttribute(
      "aria-current",
      active ? "page" : "false"
    );
  });

  if (updateHash) {
    history.replaceState(null, "", `#${name}`);
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function closeFilterPanel() {
  els.filterPanel.hidden = true;

  els.filterToggle.setAttribute(
    "aria-expanded",
    "false"
  );
}

function attachEvents() {
  document.querySelectorAll("[data-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      showTab(tab.dataset.tab);
    });
  });

  document.querySelectorAll("[data-tab-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showTab(link.dataset.tabLink);
    });
  });

  [
    els.search,
    els.brand,
    els.processor,
    els.ram,
    els.storage,
    els.price,
    els.sort
  ].forEach((input) => {
    const eventName =
      input.tagName === "INPUT"
        ? "input"
        : "change";

    input.addEventListener(
      eventName,
      renderLaptops
    );
  });

  els.filterToggle.addEventListener("click", () => {
    const willOpen = els.filterPanel.hidden;

    els.filterPanel.hidden = !willOpen;

    els.filterToggle.setAttribute(
      "aria-expanded",
      String(willOpen)
    );
  });

  els.clear.addEventListener("click", () => {
    [
      els.search,
      els.brand,
      els.processor,
      els.ram,
      els.storage,
      els.price
    ].forEach((input) => {
      input.value = "";
    });

    els.sort.value = "newest";

    renderLaptops();
  });

  els.browseLaptops.addEventListener("click", () => {
    byId("catalog").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  document.addEventListener("click", (event) => {
    if (
      !els.filterPanel.hidden &&
      !els.filterPanel.contains(event.target) &&
      !els.filterToggle.contains(event.target)
    ) {
      closeFilterPanel();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeFilterPanel();
    }
  });
}

async function loadJson(url) {
  const response = await fetch(url, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(
      `${url} could not be loaded. HTTP ${response.status}`
    );
  }

  return response.json();
}

async function init() {
  attachEvents();

  const requestedTab = location.hash.slice(1);

  const initialTab = [
    "laptops",
    "accessories"
  ].includes(requestedTab)
    ? requestedTab
    : "laptops";

  showTab(initialTab, false);

  try {
    const [laptops, accessories] =
      await Promise.all([
        loadJson("laptops.json"),
        loadJson("accessories.json")
      ]);

    if (
      !Array.isArray(laptops) ||
      !Array.isArray(accessories)
    ) {
      throw new Error(
        "Inventory JSON must contain an array."
      );
    }

    state.laptops = laptops;
    state.accessories = accessories;

    populateSelect(
      els.brand,
      unique(
        state.laptops.map((item) => item.brand)
      )
    );

    populateSelect(
      els.processor,
      unique(
        state.laptops.map(
          (item) => item.processorFamily
        )
      )
    );

    populateSelect(
      els.ram,
      unique(
        state.laptops.map((item) => item.ram)
      )
    );

    populateSelect(
      els.storage,
      unique(
        state.laptops.map((item) => item.storage)
      )
    );

    renderLaptops();
    renderAccessories();
  } catch (error) {
    console.error(error);

    const message =
      error instanceof Error
        ? error.message
        : "Inventory could not be loaded.";

    els.resultCount.textContent = message;
    els.accessoryCount.textContent = message;

    els.grid.innerHTML = `
      <div class="empty-state">
        <h2>Unable to load inventory</h2>

        <p>
          Check that laptops.json and accessories.json
          are in the same folder as index.html.
        </p>
      </div>
    `;
  }
}

byId("year").textContent =
  new Date().getFullYear();

init();