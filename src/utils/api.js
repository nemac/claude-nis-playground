const isDev = import.meta.env.DEV;

// AGOL supports CORS natively — use direct in production, proxy in dev
const AGOL_FLOOD_BASE = isDev
  ? '/agol/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Flood_Hazard_Reduced_Set_gdb/FeatureServer/0/query'
  : 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Flood_Hazard_Reduced_Set_gdb/FeatureServer/0/query';

const AGOL_COUNTY_BASE = isDev
  ? '/agol/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Counties_Generalized_Boundaries/FeatureServer/0/query'
  : 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Counties_Generalized_Boundaries/FeatureServer/0/query';

// NSI does NOT support CORS — needs proxy in all browser environments
// Set VITE_NSI_PROXY_URL env var to your Cloudflare Worker (see worker/nsi-proxy.js)
// Falls back to corsproxy.io for quick testing
const NSI_PROXY_URL = import.meta.env.VITE_NSI_PROXY_URL;

function buildNsiUrl(path) {
  if (isDev) return `/nsiapi/${path}`;
  if (NSI_PROXY_URL) return `${NSI_PROXY_URL}/nsiapi/${path}`;
  // Fallback CORS proxy for quick testing (rate-limited)
  return `https://corsproxy.io/?url=${encodeURIComponent(`https://nsi.sec.usace.army.mil/nsiapi/${path}`)}`;
}

export async function fetchFloodZones(bounds) {
  const geometry = JSON.stringify({
    xmin: bounds.west,
    ymin: bounds.south,
    xmax: bounds.east,
    ymax: bounds.north,
    spatialReference: { wkid: 4326 },
  });

  const allFeatures = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      where: "SFHA_TF = 'T' OR ZONE_SUBTY LIKE '0.2%'",
      geometry,
      geometryType: 'esriGeometryEnvelope',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: 'FLD_ZONE,ZONE_SUBTY,SFHA_TF,STATIC_BFE,DEPTH',
      returnGeometry: 'true',
      f: 'geojson',
      resultRecordCount: '2000',
      resultOffset: String(offset),
    });

    const resp = await fetch(`${AGOL_FLOOD_BASE}?${params}`);
    if (!resp.ok) throw new Error(`AGOL API error: ${resp.status}`);

    const data = await resp.json();

    if (data.features) {
      allFeatures.push(...data.features);
    }

    hasMore = data.properties?.exceededTransferLimit === true;
    offset += 2000;
  }

  return {
    type: 'FeatureCollection',
    features: allFeatures,
  };
}

export async function fetchStructures(bounds) {
  const bbox = [
    bounds.west, bounds.south,
    bounds.east, bounds.south,
    bounds.east, bounds.north,
    bounds.west, bounds.north,
    bounds.west, bounds.south,
  ].join(',');

  const url = buildNsiUrl(`structures?bbox=${bbox}&fmt=fc`);
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`NSI API error: ${resp.status}`);
  return resp.json();
}

// County data from Esri Living Atlas (same AGOL domain — CORS works)
let countyCache = null;

export async function fetchCountyList() {
  if (countyCache) return countyCache;

  const allCounties = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      where: '1=1',
      outFields: 'FIPS,NAME,STATE_ABBR',
      returnGeometry: 'false',
      returnExtentOnly: 'false',
      f: 'json',
      resultRecordCount: '2000',
      resultOffset: String(offset),
      orderByFields: 'STATE_ABBR,NAME',
    });

    const resp = await fetch(`${AGOL_COUNTY_BASE}?${params}`);
    if (!resp.ok) throw new Error(`County list API error: ${resp.status}`);

    const data = await resp.json();
    if (data.features) {
      for (const f of data.features) {
        allCounties.push({
          fips: f.attributes.FIPS,
          name: f.attributes.NAME,
          state: f.attributes.STATE_ABBR,
        });
      }
    }

    hasMore = data.exceededTransferLimit === true;
    offset += 2000;
  }

  countyCache = allCounties;
  return allCounties;
}

// Split a bounding box into a grid of smaller tiles
export function splitBoundsIntoTiles(bounds) {
  const spanLng = bounds.east - bounds.west;
  const spanLat = bounds.north - bounds.south;
  const maxSpan = Math.max(spanLng, spanLat);

  let cols, rows;
  if (maxSpan < 0.3) {
    cols = 1; rows = 1;
  } else if (maxSpan < 1.0) {
    cols = 2; rows = 2;
  } else if (maxSpan < 2.0) {
    cols = 3; rows = 3;
  } else {
    cols = 4; rows = 4;
  }

  const tileLng = spanLng / cols;
  const tileLat = spanLat / rows;
  const tiles = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      tiles.push({
        west: bounds.west + c * tileLng,
        south: bounds.south + r * tileLat,
        east: bounds.west + (c + 1) * tileLng,
        north: bounds.south + (r + 1) * tileLat,
      });
    }
  }

  return tiles;
}

export async function fetchCountyBoundary(fips) {
  const params = new URLSearchParams({
    where: `FIPS='${fips}'`,
    outFields: 'FIPS,NAME,STATE_ABBR',
    returnGeometry: 'true',
    f: 'geojson',
  });

  const resp = await fetch(`${AGOL_COUNTY_BASE}?${params}`);
  if (!resp.ok) throw new Error(`County boundary API error: ${resp.status}`);
  return resp.json();
}
