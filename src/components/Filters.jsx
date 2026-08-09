import { useEffect, useRef } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

const priceOptions = [25000, 40000, 60000, 80000, 110000, 130000];
const FILTER_LABELS = { brand: "Brand", processor: "Processor", ram: "RAM", storage: "Storage", maximumPrice: "Price" };

export function Filters({ filters, options, open, onOpenChange, onChange, onClear }) {
  const panelRef = useRef(null);
  const toggleRef = useRef(null);
  const activeFilters = Object.entries(FILTER_LABELS).filter(([name]) => filters[name]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (open && !panelRef.current?.contains(event.target) && !toggleRef.current?.contains(event.target)) onOpenChange(false);
    }
    function handleKeyDown(event) {
      if (open && event.key === "Escape") {
        onOpenChange(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  const field = (name) => ({ value: filters[name], onChange: (event) => onChange(name, event.target.value) });

  return (
    <div className="catalog-controls">
      <div className="control-row">
        <label className="search-control"><Search size={19} aria-hidden="true" /><span className="sr-only">Search laptops</span><input type="search" placeholder="Search brand, model, or specification" autoComplete="off" {...field("search")} />{filters.search && <button type="button" aria-label="Clear search" onClick={() => onChange("search", "")}><X size={17} /></button>}</label>
        <div className="filter-wrap">
          <button ref={toggleRef} className={`filter-toggle ${activeFilters.length ? "has-filters" : ""}`} type="button" aria-expanded={open} aria-controls="filterPanel" onClick={() => onOpenChange(!open)}><SlidersHorizontal size={18} /> Filters {activeFilters.length > 0 && <span>{activeFilters.length}</span>}</button>
          {open && (
            <div ref={panelRef} id="filterPanel" className="filter-panel" role="dialog" aria-modal="false" aria-label="Laptop filters">
              <div className="filter-panel-head"><div><strong>Refine results</strong><span>Choose any combination</span></div><button type="button" aria-label="Close filters" onClick={() => onOpenChange(false)}><X size={19} /></button></div>
              <div className="filter-grid">
                <Select label="Brand" empty="All brands" values={options.brands} {...field("brand")} />
                <Select label="Processor" empty="All processors" values={options.processors} {...field("processor")} />
                <Select label="RAM" empty="All memory" values={options.ram} {...field("ram")} />
                <Select label="Storage" empty="All storage" values={options.storage} {...field("storage")} />
                <label><span>Maximum price</span><select {...field("maximumPrice")}><option value="">Any price</option>{priceOptions.map((price) => <option value={price} key={price}>Up to ₹{price.toLocaleString("en-IN")}</option>)}</select></label>
              </div>
              <div className="filter-panel-actions"><button className="clear-btn" type="button" onClick={onClear}>Clear all</button><button className="apply-btn" type="button" onClick={() => onOpenChange(false)}>Show results</button></div>
            </div>
          )}
        </div>
        <label className="sort-control"><span className="sr-only">Sort laptops</span><select aria-label="Sort laptops" {...field("sort")}><option value="newest">Newest first</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="brand">Brand A-Z</option></select></label>
      </div>
      {activeFilters.length > 0 && <div className="active-filters" aria-label="Active filters">{activeFilters.map(([name, label]) => <button type="button" onClick={() => onChange(name, "")} key={name}>{label}: {name === "maximumPrice" ? `₹${Number(filters[name]).toLocaleString("en-IN")}` : filters[name]} <X size={14} /></button>)}<button className="clear-link" type="button" onClick={onClear}>Clear all</button></div>}
    </div>
  );
}

function Select({ label, empty, values, value, onChange }) {
  return <label><span>{label}</span><select value={value} onChange={onChange}><option value="">{empty}</option>{values.map((option) => <option key={option}>{option}</option>)}</select></label>;
}
