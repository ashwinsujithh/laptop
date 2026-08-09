# HARDNSOFT Laptop Store

A lightweight single-page storefront for HARDNSOFT's Onam Dhamakka Sale 2026. It presents laptop and accessory inventory from local JSON files and sends customer enquiries to WhatsApp. No application backend or database is required.

## Features

- Responsive laptop and accessory catalogs
- Laptop search, filters, and sorting
- MRP, selling-price, savings, and warranty-status display
- Product-specific WhatsApp enquiry links
- Independent loading and error handling for each catalog
- Inventory validation for required fields, prices, dates, and unique IDs

## Project structure

- `index.html` - page structure and accessible catalog tabs
- `styles.css` - responsive layout and visual design
- `app.js` - rendering, filtering, interactions, and data loading
- `inventory.js` - shared inventory validation and normalization
- `laptops.json` - laptop inventory
- `accessories.json` - accessory inventory
- `server.js` - dependency-free local static server
- `tests/` - Node test suite for inventory behavior

## Requirements

- Node.js 20 or newer

## Run locally

```powershell
npm start
```

Open `http://127.0.0.1:8000`. A local server is required because browsers do not reliably allow pages opened with `file://` to fetch JSON files.

To use another port:

```powershell
$env:PORT=8080; npm start
```

## Test

```powershell
npm test
```

The same suite runs in GitHub Actions before deployment.

## Inventory maintenance

Edit `laptops.json` or `accessories.json` directly. Every item must have:

- A unique, non-empty `id`
- A positive numeric `price`
- A valid `addedAt` date when the field is present
- `brand` and `model` for laptops
- `name` for accessories

Every catalog item currently includes a `1 Year` warranty. Keep the `warranty` field explicit when adding inventory; missing values are displayed as `Confirm warranty` instead of being guessed.

After changing inventory, run `npm test`. Invalid data blocks the GitHub Pages deployment.

## Deployment

Pushes to `main` run the tests and deploy the repository to GitHub Pages after they pass. The catalog has no server-side save feature; inventory changes must be committed to the JSON files.

## Contact

- Company: HARDNSOFT
- WhatsApp: +91 7025402409
