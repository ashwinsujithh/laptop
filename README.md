# HARDNSOFT Laptop Store

A static single-page storefront for HARDNSOFT's Onam Dhamakka Sale 2026. The site shows festival laptop deals and accessories directly from local JSON inventory files, with no backend required.

## Purpose

- Present laptops and accessories in a responsive catalog.
- Let customers browse product details, compare pricing, and contact sales over WhatsApp.
- Keep the site lightweight, mobile-friendly, and easy to maintain as a static deployment.

## Architecture

- `index.html` — site shell, header, hero section, tabs for laptops/accessories, and footer.
- `styles.css` — responsive styling, layout, card design, and Onam-themed visual touches.
- `app.js` — client-side UI logic, filter handling, tab switching, data loading, and WhatsApp link generation.
- `laptops.json` — laptop inventory data for the catalog.
- `accessories.json` — accessory inventory data for the catalog.

## How it works

- The page loads in the browser and fetches inventory JSON using `fetch`.
- `app.js` stores loaded data in memory and renders product cards dynamically.
- Users can filter laptops by brand, processor, RAM, storage, price, and search text.
- Each product card includes a WhatsApp CTA that pre-fills a message for quick enquiries.

## Running locally

Start the local Node server so the upload page can save inventory directly to the JSON files.

```powershell
npm install
npm start
```

Then open:

```text
http://127.0.0.1:8000
```

If you prefer a static-only preview without save functionality, open `index.html` directly or use any static file server.

## Inventory management

- Add or update laptops in `laptops.json`.
- Add or update accessories in `accessories.json`.
- Use unique `id` values for every item.
- Laptops are sorted by `addedAt` automatically, with newest items shown first.

## Customization

- Edit text and branding in `index.html`.
- Update layout and theme in `styles.css`.
- Change filtering and rendering rules in `app.js`.

## Bulk inventory upload

- Open `upload.html` in your browser.
- Select either `laptops.json` or `accessories.json` as the target file.
- Upload the current inventory file and paste new rows in the text box.
- Click `Parse rows` to convert the pasted data into JSON items.
- Click `Merge and download` to save the updated inventory file locally.

The page helps organize tab-separated or comma-separated rows into the correct JSON structure for the selected inventory file.

## Contact

- Company: HARDNSOFT
- WhatsApp: +91 7025402409
