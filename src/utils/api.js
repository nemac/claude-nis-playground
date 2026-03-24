const isDev = import.meta.env.DEV;

// AGOL supports CORS natively — use direct in production, proxy in dev
const AGOL_BASE = isDev
  ? '/agol/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Flood_Hazard_Reduced_Set_gdb/FeatureServer/0/query'
  : 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Flood_Hazard_Reduced_Set_gdb/FeatureServer/0/query';

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

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search';

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
      where: "ZONE_SUBTY LIKE '0.2%'",
      geometry,
      geometryType: 'esriGeometryEnvelope',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: 'FLD_ZONE,ZONE_SUBTY,SFHA_TF,STATIC_BFE,DEPTH',
      returnGeometry: 'true',
      f: 'geojson',
      resultRecordCount: '2000',
      resultOffset: String(offset),
    });

    const resp = await fetch(`${AGOL_BASE}?${params}`);
    if (!resp.ok) throw new Error(`AGOL API error: ${resp.status}`);

    const data = await resp.json();

    if (data.features) {
      allFeatures.push(...data.features);
    }

    hasMore = data.properties?.exceededTransferLimit === true;
    offset += 2000;

    if (offset > 10000) break;
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

export async function geocodeSearch(query) {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    countrycodes: 'us',
    limit: '5',
    addressdetails: '1',
  });

  const resp = await fetch(`${NOMINATIM_BASE}?${params}`, {
    headers: { 'User-Agent': 'FloodPlainExplorer/1.0' },
  });
  if (!resp.ok) throw new Error(`Geocoding error: ${resp.status}`);
  return resp.json();
}
