const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwMNRhRnPH7M7ca4_nruQg4pYpekx_j0MlpAKJ-jgjhoOEtxCg8ar4xkLJ4A1c2rB4zaQ/exec";

const ALLOWED_ORIGINS = [
  "https://summer-club-karaoke.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173"
];

export default {
  async fetch(request) {
    const corsHeaders = getCorsHeaders(request);

    try {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: corsHeaders
        });
      }

      if (request.method === "GET") {
        return json(
          {
            success: true,
            message: "Summer Club Karaoke proxy toimii"
          },
          200,
          corsHeaders
        );
      }

      if (request.method !== "POST") {
        return json(
          {
            success: false,
            error: "Method not allowed"
          },
          405,
          corsHeaders
        );
      }

      const body = await request.text();

      const upstreamResponse = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        redirect: "follow",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body
      });

      const text = await upstreamResponse.text();

      return new Response(text, {
        status: upstreamResponse.ok ? 200 : upstreamResponse.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json;charset=utf-8",
          "Cache-Control": "no-store"
        }
      });
    } catch (err) {
      return json(
        {
          success: false,
          error: err && err.message ? err.message : "Proxy error"
        },
        500,
        corsHeaders
      );
    }
  }
};

function getCorsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : "*";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function json(payload, status, corsHeaders) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json;charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
