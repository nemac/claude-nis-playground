/**
 * Cloudflare Worker: NSI CORS Proxy
 *
 * Deploy this worker to Cloudflare Workers to proxy NSI API requests
 * and add CORS headers for the GitHub Pages frontend.
 *
 * Setup:
 *   1. Create a free Cloudflare account at https://dash.cloudflare.com
 *   2. Go to Workers & Pages > Create Application > Create Worker
 *   3. Paste this code and deploy
 *   4. Set the worker URL in your .env as VITE_NSI_PROXY_URL
 *      e.g., VITE_NSI_PROXY_URL=https://nsi-proxy.your-subdomain.workers.dev
 */

const NSI_BASE = 'https://nsi.sec.usace.army.mil';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Only allow /nsiapi paths
    if (!url.pathname.startsWith('/nsiapi')) {
      return new Response('Not Found', { status: 404 });
    }

    // Build target URL
    const targetUrl = `${NSI_BASE}${url.pathname}${url.search}`;

    // Forward the request
    const resp = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
      },
      body: request.method === 'POST' ? request.body : undefined,
    });

    // Create response with CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const newResp = new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers: {
        ...Object.fromEntries(resp.headers),
        ...corsHeaders,
      },
    });

    return newResp;
  },
};
