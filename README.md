# HARDNSOFT Laptop Store

A static, responsive catalog for laptops and computer accessories. Inventory is loaded directly from JSON files—there is no backend or enquiry form.

## Run locally

Because the site loads JSON using `fetch`, serve the folder through any static web server. For example:

```bash
py -3.14 -m http.server 8000
```

Then open `http://127.0.0.1:8000`.

## Manage stock

- Add or edit laptops in `laptops.json`.
- Add or edit accessories in `accessories.json`.
- Give every item a unique `id`.

Laptops are automatically sorted by `addedAt`, newest first.

## Business contact

- Company: HARDNSOFT
- WhatsApp: +91 7025402409
