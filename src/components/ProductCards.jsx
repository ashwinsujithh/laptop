import { useState } from "react";
import { Check, Cpu, HardDrive, MemoryStick, MessageCircle, Monitor, ShieldCheck } from "lucide-react";

import { formatPrice, whatsappUrl } from "../catalog.js";
import { getAccessorySpecifications, getWarrantyLabel } from "../inventory.js";

function Pricing({ item }) {
  const price = Number(item.price);
  const mrp = Number(item.mrp);
  const hasMrp = Number.isFinite(mrp) && mrp > price && price > 0;
  return (
    <div className="pricing">
      <div className="price-line"><strong>{formatPrice(price)}</strong>{hasMrp && <><s>{formatPrice(mrp)}</s><span>{Math.round(((mrp - price) / mrp) * 100)}% off</span></>}</div>
      {hasMrp && <small>You save {formatPrice(mrp - price)}</small>}
    </div>
  );
}

function ProcessorBadge({ item }) {
  const [failed, setFailed] = useState(false);
  const name = item.processorFamily || item.processor || "Processor";
  return (
    <div className="processor-badge">
      {item.processorImage && !failed ? <img src={item.processorImage} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} /> : <Cpu size={24} />}
      <span><small>Processor</small><strong>{name}</strong></span>
    </div>
  );
}

export function LaptopCard({ item }) {
  const features = Array.isArray(item.features) ? item.features.slice(0, 3) : [];
  const enquiryUrl = whatsappUrl([
    "Hello HARDNSOFT,", "", "I saw this laptop in your Onam Dhamakka Sale 2026.", "",
    `Laptop: ${item.brand || ""} ${item.model || ""}`, `Processor: ${item.processor || "Not specified"}`,
    `RAM: ${item.ram || "Not specified"}`, `Storage: ${item.storage || "Not specified"}`,
    `Graphics: ${item.graphics || "Integrated graphics"}`, `Selling price: ${formatPrice(item.price)}`,
    item.mrp ? `MRP: ${formatPrice(item.mrp)}` : "", `Warranty: ${getWarrantyLabel(item)}`, "",
    "Please confirm availability and the final Onam offer."
  ]);
  return (
    <article className="product-card">
      <div className="product-visual">
        <div className="visual-top"><span className="stock-badge">{item.availabilityLabel || "Available"}</span><strong>{item.brand}</strong></div>
        <div className="laptop-device" aria-hidden="true"><div className="device-screen"><span>{item.model}</span></div><div className="device-base" /></div>
      </div>
      <div className="product-content">
        <div className="product-heading"><span>{item.brand}</span><h3>{item.model}</h3></div>
        <ProcessorBadge item={item} />
        <div className="spec-grid">
          <div><MemoryStick /><span><small>Memory</small><strong>{item.ram || "N/A"}</strong></span></div>
          <div><HardDrive /><span><small>Storage</small><strong>{item.storage || "N/A"}</strong></span></div>
          <div><Monitor /><span><small>Display</small><strong>{item.display || "Ask us"}</strong></span></div>
          <div><Cpu /><span><small>Graphics</small><strong>{item.graphics || "Integrated"}</strong></span></div>
        </div>
        {features.length > 0 && <ul className="feature-list">{features.map((feature) => <li key={feature}><Check size={14} />{feature}</li>)}</ul>}
        <div className="warranty-row"><ShieldCheck size={17} /><span>{getWarrantyLabel(item)} warranty included</span></div>
        <div className="product-footer"><Pricing item={item} /><a className="product-cta" href={enquiryUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> Enquire</a></div>
      </div>
    </article>
  );
}

export function AccessoryCard({ item }) {
  const specifications = getAccessorySpecifications(item);
  const specificationMap = new Map(specifications);
  const initials = (item.name || "Accessory").split(" ").filter(Boolean).map((word) => word[0]).slice(0, 2).join("").toUpperCase();
  const enquiryUrl = whatsappUrl([
    "Hello HARDNSOFT,", "", "I saw this accessory in your Onam Dhamakka Sale 2026.", "",
    `Product: ${item.name || "Accessory"}`, item.brand ? `Brand: ${item.brand}` : "",
    item.model ? `Model: ${item.model}` : "", `Selling price: ${formatPrice(item.price)}`,
    item.mrp ? `MRP: ${formatPrice(item.mrp)}` : "", `Warranty: ${getWarrantyLabel(item)}`, "",
    "Please confirm availability and the final Onam offer."
  ]);
  return (
    <article className="product-card accessory-card">
      <div className="accessory-visual"><span>{item.category || "Accessory"}</span><strong>{initials || "AC"}</strong><small>{item.brand}</small></div>
      <div className="product-content">
        <div className="product-heading"><span>{item.productType || "Accessory"}</span><h3>{item.name || "Accessory"}</h3></div>
        <dl className="accessory-specs">{specifications.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        {item.features?.length > 0 && <ul className="feature-list">{item.features.slice(0, 4).map((feature) => <li key={feature}><Check size={14} />{feature}</li>)}</ul>}
        <div className="product-footer"><Pricing item={item} /><a className="product-cta" href={enquiryUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> Enquire</a></div>
      </div>
    </article>
  );
}
