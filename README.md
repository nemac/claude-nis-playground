# Flood Plain Explorer

**[Live Demo](https://nemac.github.io/claude-nis-playground/)**

An interactive map application that visualizes the 0.2% annual chance (500-year) flood plain across the United States and shows what buildings are located within those flood zones.

## Features

- **Interactive Map** — Pan, zoom, and search any US location using MapLibre GL JS with a dark basemap
- **Flood Zone Visualization** — 0.2% annual chance flood zones displayed with FEMA-style orange overlay
- **Building Inventory** — Color-coded markers for structures in the flood zone, clustered at lower zoom levels
- **Risk Summary** — Total structures, structural/content value at risk, population exposure
- **Foundation Analysis** — Breakdown by foundation type (slab, crawlspace, basement, elevated) with vulnerability context
- **Filtering** — Filter buildings by type, structural value range, and number of stories
- **Building Details** — Click any building for curated info: value, sqft, stories, year built, foundation, elevation
- **Educational Content** — Explains what 0.2% probability means and common misconceptions about 500-year floods
- **Shareable URLs** — Map state encoded in the URL hash for easy sharing
- **Print/Screenshot** — Download map images or print the page

## Data Sources

| Source | Description |
|--------|-------------|
| [FEMA NFHL](https://www.arcgis.com/home/item.html?id=2b245b7f816044d7a779a61a5844be23) | Flood zone boundaries (0.2% annual chance) via ArcGIS Online |
| [USACE NSI](https://www.hec.usace.army.mil/confluence/nsi/technicalreferences/latest/api-reference-guide) | National Structure Inventory — building-level data |
| [CARTO](https://carto.com/) | Dark Matter basemap tiles |
| [Nominatim](https://nominatim.openstreetmap.org/) | Geocoding search (OpenStreetMap) |

## Getting Started

### Local Development

```bash
npm install
npm run dev
```

The dev server uses Vite's proxy to handle CORS for the NSI API. No additional setup needed.

### Production Build

```bash
npm run build
```

Output goes to `dist/`.

## Deployment

### GitHub Pages

The repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys on push to `master`.

In your repo settings, set **Pages > Source** to **GitHub Actions**.

### NSI API CORS Proxy

The NSI API (`nsi.sec.usace.army.mil`) does not include CORS headers. In development, Vite's proxy handles this. In production:

- **Default**: Falls back to `corsproxy.io` (rate-limited, fine for testing)
- **Recommended**: Deploy the included Cloudflare Worker for a dedicated proxy:

  1. Create a free [Cloudflare Workers](https://workers.cloudflare.com/) account
  2. Create a new Worker and paste the contents of `worker/nsi-proxy.js`
  3. Deploy and copy the worker URL
  4. Create a `.env` file (see `.env.example`):
     ```
     VITE_NSI_PROXY_URL=https://nsi-proxy.your-subdomain.workers.dev
     ```
  5. Rebuild and redeploy

## Tech Stack

- **React 19** + **Vite**
- **MapLibre GL JS** — Map rendering
- **Turf.js** — Point-in-polygon spatial filtering
- **CARTO Dark Matter** — Basemap tiles

## License

This project uses open government data from FEMA and USACE.
