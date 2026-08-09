"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT) || 8000;
const host = process.env.HOST || "127.0.0.1";
const publicFiles = new Set([
  "accessories.json",
  "app.js",
  "index.html",
  "inventory.js",
  "laptops.json",
  "styles.css"
]);
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function resolveRequestPath(url) {
  let pathname;

  try {
    pathname = decodeURIComponent(new URL(url, "http://localhost").pathname);
  } catch {
    return null;
  }

  const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
  if (!publicFiles.has(relativePath)) {
    return null;
  }

  const resolvedPath = path.resolve(root, relativePath);
  return resolvedPath.startsWith(`${root}${path.sep}`) ? resolvedPath : null;
}

const server = http.createServer((request, response) => {
  const filePath = resolveRequestPath(request.url);

  if (!filePath) {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Bad request");
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": filePath.endsWith(".json") ? "no-store" : "no-cache",
      "X-Content-Type-Options": "nosniff"
    });
    fs.createReadStream(filePath).pipe(response);
  });
});

server.listen(port, host, () => {
  console.log(`HARDNSOFT store running at http://${host}:${port}`);
});
