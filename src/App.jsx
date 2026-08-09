import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Headphones, MessageCircle, ShieldCheck, Sparkles, Truck } from "lucide-react";

import { filterAndSortLaptops, unique } from "./catalog.js";
import { loadCatalogs } from "./inventory.js";
import { Filters } from "./components/Filters.jsx";
import { AccessoryCard, LaptopCard } from "./components/ProductCards.jsx";

const EMPTY_FILTERS = { search: "", brand: "", processor: "", ram: "", storage: "", maximumPrice: "", sort: "newest" };
const WHATSAPP_URL = "https://wa.me/917025402409";

function initialTab() {
  return window.location.hash === "#accessories" ? "accessories" : "laptops";
}

function scrollToCatalog() {
  document.getElementById("catalog")?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start"
  });
}

export default function App() {
  const [tab, setTab] = useState(initialTab);
  const [catalogs, setCatalogs] = useState({
    laptops: { status: "pending", items: [] },
    accessories: { status: "pending", items: [] }
  });
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const loadJson = async (filename) => {
      const response = await fetch(`${import.meta.env.BASE_URL}${filename}`, { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error(`${filename} could not be loaded. HTTP ${response.status}`);
      return response.json();
    };
    loadCatalogs(loadJson).then((result) => !controller.signal.aborted && setCatalogs(result));
    return () => controller.abort();
  }, []);

  const selectTab = useCallback((nextTab) => {
    setTab(nextTab);
    setFiltersOpen(false);
    window.history.replaceState(null, "", `#${nextTab}`);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);
  const updateFilter = useCallback((name, value) => setFilters((current) => ({ ...current, [name]: value })), []);

  const laptops = catalogs.laptops.items || [];
  const filteredLaptops = useMemo(() => filterAndSortLaptops(laptops, filters), [laptops, filters]);
  const options = useMemo(() => ({
    brands: unique(laptops.map((item) => item.brand)),
    processors: unique(laptops.map((item) => item.processorFamily)),
    ram: unique(laptops.map((item) => item.ram)),
    storage: unique(laptops.map((item) => item.storage))
  }), [laptops]);

  return (
    <>
      <div className="announcement"><div className="container announcement-inner"><span><Sparkles size={15} /> Onam Dhamakka 2026</span><strong>Festive pricing on every listed laptop</strong><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Talk to sales <ArrowRight size={14} /></a></div></div>
      <Header tab={tab} onSelectTab={selectTab} />
      <main>
        <section className={`tab-panel ${tab === "laptops" ? "active" : ""}`} id="laptops" role="tabpanel" aria-labelledby="laptopsTab" hidden={tab !== "laptops"}>
          <Hero />
          <TrustStrip />
          <section className="catalog-section" id="catalog">
            <div className="container">
              <div className="catalog-heading">
                <div><p className="section-kicker">Curated festive stock</p><h2>Find your next laptop</h2><CatalogCount catalog={catalogs.laptops} count={filteredLaptops.length} singular="laptop" suffix=" ready to enquire" /></div>
                <p className="catalog-note">Compare the essentials, then message us for live availability and the final offer.</p>
              </div>
              <Filters filters={filters} options={options} open={filtersOpen} onOpenChange={setFiltersOpen} onChange={updateFilter} onClear={() => setFilters(EMPTY_FILTERS)} />
              <CatalogContent catalog={catalogs.laptops} empty={filteredLaptops.length === 0} emptyTitle="No exact matches" emptyText="Clear a filter or try a broader search.">
                <div className="product-grid">{filteredLaptops.map((item) => <LaptopCard item={item} key={item.id} />)}</div>
              </CatalogContent>
            </div>
          </section>
        </section>

        <section className={`tab-panel ${tab === "accessories" ? "active" : ""}`} id="accessories" role="tabpanel" aria-labelledby="accessoriesTab" hidden={tab !== "accessories"}>
          <section className="accessory-hero"><div className="container"><p className="section-kicker">Workstation essentials</p><h1>Accessories that complete your setup.</h1><p>Reliable peripherals, clear specifications, and direct support before you buy.</p></div></section>
          <section className="catalog-section"><div className="container">
            <div className="catalog-heading"><div><p className="section-kicker">Available now</p><h2>Computer accessories</h2><CatalogCount catalog={catalogs.accessories} count={catalogs.accessories.items?.length || 0} singular="accessory" /></div></div>
            <CatalogContent catalog={catalogs.accessories} empty={catalogs.accessories.items?.length === 0} emptyTitle="No accessories available" emptyText="Please check again soon.">
              <div className="product-grid accessory-grid">{catalogs.accessories.items?.map((item) => <AccessoryCard item={item} key={item.id} />)}</div>
            </CatalogContent>
          </div></section>
        </section>
      </main>
      <Footer onHome={() => selectTab("laptops")} />
      <a className="mobile-whatsapp" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><MessageCircle size={19} /> Chat with sales</a>
    </>
  );
}

function Header({ tab, onSelectTab }) {
  const tabs = ["laptops", "accessories"];
  function handleTabKeyDown(event, index) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    onSelectTab(tabs[nextIndex]);
    requestAnimationFrame(() => document.getElementById(`${tabs[nextIndex]}Tab`)?.focus());
  }
  return (
    <header className="site-header"><div className="container nav-wrap">
      <button className="brand brand-button" type="button" aria-label="HARDNSOFT home" onClick={() => onSelectTab("laptops")}><span className="brand-mark-icon">H</span><span className="brand-word">HARDN<b>SOFT</b></span></button>
      <nav aria-label="Primary navigation"><div className="catalog-tabs" role="tablist" aria-label="Product catalogs">
        {tabs.map((name, index) => <button id={`${name}Tab`} className={`nav-tab ${tab === name ? "active" : ""}`} type="button" role="tab" aria-controls={name} aria-selected={tab === name} tabIndex={tab === name ? 0 : -1} onClick={() => onSelectTab(name)} onKeyDown={(event) => handleTabKeyDown(event, index)} key={name}>{name[0].toUpperCase() + name.slice(1)}</button>)}
      </div></nav>
      <div className="header-actions"><a className="quiet-link" href="https://hardnsoft.in/" target="_blank" rel="noopener noreferrer">Services</a><a className="whatsapp-link" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> WhatsApp</a></div>
    </div></header>
  );
}

function Hero() {
  return (
    <section className="hero" aria-labelledby="sale-heading">
      <img className="hero-image" src={`${import.meta.env.BASE_URL}assets/onam-laptop-hero.jpg`} alt="" aria-hidden="true" fetchPriority="high" />
      <div className="container hero-inner"><div className="hero-copy">
        <div className="hero-badge"><span /> Limited Onam stock</div>
        <h1 id="sale-heading">Better laptops.<br /><em>Festive prices.</em></h1>
        <p>Handpicked systems for work, study, and gaming, with transparent specifications and a one-year warranty.</p>
        <div className="hero-actions"><button className="primary-btn" type="button" onClick={scrollToCatalog}>Shop laptops <ArrowRight size={18} /></button><a className="secondary-btn" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> Ask an expert</a></div>
        <div className="hero-proof"><span><strong>13</strong> curated laptops</span><span><strong>1 year</strong> warranty</span><span><strong>Direct</strong> sales support</span></div>
      </div></div>
    </section>
  );
}

function TrustStrip() {
  return <section className="trust-strip" aria-label="Store benefits"><div className="container trust-grid">
    <div><ShieldCheck /><span><strong>1-year warranty</strong><small>Included on every product</small></span></div>
    <div><Headphones /><span><strong>Expert guidance</strong><small>Talk to a real sales advisor</small></span></div>
    <div><Truck /><span><strong>Local availability</strong><small>Confirm stock before purchase</small></span></div>
  </div></section>;
}

function CatalogCount({ catalog, count, singular, suffix = " available" }) {
  if (catalog.status === "pending") return <p className="result-count" aria-live="polite">Loading inventory…</p>;
  if (catalog.status === "rejected") return <p className="result-count error-text" aria-live="polite">Catalog could not be loaded.</p>;
  const noun = count === 1 ? singular : singular === "accessory" ? "accessories" : `${singular}s`;
  return <p className="result-count" aria-live="polite">{count} {noun}{suffix}</p>;
}

function CatalogContent({ catalog, empty, emptyTitle, emptyText, children }) {
  if (catalog.status === "pending") return <div className="empty-state" role="status"><span className="loading-bar" /><h2>Loading inventory</h2><p>Please wait a moment.</p></div>;
  if (catalog.status === "rejected") return <div className="empty-state" role="alert"><h2>Unable to load inventory</h2><p>Please refresh the page or contact HARDNSOFT on WhatsApp.</p></div>;
  if (empty) return <div className="empty-state"><h2>{emptyTitle}</h2><p>{emptyText}</p></div>;
  return children;
}

function Footer({ onHome }) {
  return <footer><div className="container footer-main"><button className="brand brand-button footer-brand" type="button" onClick={onHome}><span className="brand-mark-icon">H</span><span className="brand-word">HARDN<b>SOFT</b></span></button><p>Thoughtful hardware for work, study, and play.</p><div><a href="https://hardnsoft.in/" target="_blank" rel="noopener noreferrer">Software services</a><a href="https://hardnsoft.co.in/" target="_blank" rel="noopener noreferrer">Courses</a></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} HARDNSOFT</span><span>Onam Dhamakka Sale 2026</span></div></footer>;
}
