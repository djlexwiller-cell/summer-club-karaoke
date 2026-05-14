const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwMNRhRnPH7M7ca4_nruQg4pYpekx_j0MlpAKJ-jgjhoOEtxCg8ar4xkLJ4A1c2rB4zaQ/exec";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400"
};

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });
    }

    if (request.method === "GET") {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "GET",
        redirect: "follow"
      });

      return withCors(response);
    }

    if (request.method === "POST") {
      const body = await request.text();

      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        redirect: "follow",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body
      });

      return withCors(response);
    }

    return json(
      {
        success: false,
        error: "Method not allowed"
      },
      405
    );
  }
};

async function withCors(response) {
  const text = await response.text();
  const headers = new Headers(CORS_HEADERS);
  headers.set("Content-Type", "application/json;charset=utf-8");

  return new Response(text, {
    status: response.status,
    headers
  });
}

function json(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json;charset=utf-8"
    }
  });
}
