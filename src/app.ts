import { createServer, type Server, type ServerResponse } from "node:http";
import { products } from "./catalogue.js";

function json(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "x-content-type-options": "nosniff",
    "cache-control": "no-store"
  });
  response.end(JSON.stringify(body));
}

export function createApp(): Server {
  return createServer((request, response) => {
    let url: URL;
    try {
      url = new URL(request.url ?? "/", "http://localhost");
    } catch {
      json(response, 400, { error: "Invalid request URL" });
      return;
    }

    if (request.method !== "GET") {
      response.setHeader("allow", "GET");
      json(response, 405, { error: "Method not allowed" });
      return;
    }

    if (url.pathname === "/health") {
      json(response, 200, { status: "ok", synthetic: true });
      return;
    }

    if (url.pathname === "/products") {
      json(response, 200, { products });
      return;
    }

    const match = /^\/products\/(MAT-\d{3})$/.exec(url.pathname);
    if (match) {
      const product = products.find((item) => item.id === match[1]);
      if (product) {
        json(response, 200, { product });
        return;
      }
    }

    json(response, 404, { error: "Not found" });
  });
}
