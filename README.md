# HARDNSOFT Laptop Store

A React single-page storefront for HARDNSOFT's Onam Dhamakka Sale 2026. It presents laptop and accessory inventory from local JSON files and sends customer enquiries to WhatsApp. Vite handles local development and production builds; no application backend or database is required.

## Features

- Responsive laptop and accessory catalogs
- Laptop search, filters, and sorting
- MRP, selling-price, savings, and warranty-status display
- Product-specific WhatsApp enquiry links
- Independent loading and error handling for each catalog
- Inventory validation for required fields, prices, dates, and unique IDs

## Project structure

- `index.html` - Vite entry document and React mount point
- `src/App.jsx` - application shell, catalog state, and page sections
- `src/components/` - filters and product-card components
- `src/catalog.js` - filtering, sorting, pricing, and WhatsApp helpers
- `src/inventory.js` - shared inventory validation and loading
- `styles.css` - responsive layout and visual design
- `public/laptops.json` - laptop inventory
- `public/accessories.json` - accessory inventory
- `tests/` - Node test suite for inventory behavior

## Requirements

- Node.js 20 or newer

## Run locally

```powershell
npm install
npm start
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

To expose the development server on your network:

```powershell
npm start -- --host
```

## Test

```powershell
npm test
```

The same suite runs in GitHub Actions before deployment.

## Inventory maintenance

Edit `public/laptops.json` or `public/accessories.json` directly. Every item must have:

- A unique, non-empty `id`
- A positive numeric `price`
- A valid `addedAt` date when the field is present
- `brand` and `model` for laptops
- `name` for accessories

Every catalog item currently includes a `1 Year` warranty. Keep the `warranty` field explicit when adding inventory; missing values are displayed as `Confirm warranty` instead of being guessed.

After changing inventory, run `npm test`. Invalid data blocks the GitHub Pages deployment.

## Deployment

Pushes to `main` install locked dependencies, run tests, build the React application, and deploy `dist/` to GitHub Pages after all checks pass. The catalog has no server-side save feature; inventory changes must be committed to the JSON files.

## Contact

- Company: HARDNSOFT
- WhatsApp: +91 7025402409
