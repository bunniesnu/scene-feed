import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseDir = path.resolve(__dirname, "../functions");
const routes = new Map();

for (const entry of fs.readdirSync(baseDir, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !/\.[jt]s$/.test(entry.name)) continue;

  const fullPath = path.join(entry.parentPath ?? entry.path, entry.name);
  const relPath = path.relative(baseDir, fullPath);

  let route = "/" + relPath.replace(/\.[jt]s$/, "").replaceAll(path.sep, "/");
  route = route.replace(/\/index$/, "") || "/";

  const mod = await import(pathToFileURL(fullPath).href);
  if (mod.onRequest) routes.set(route, mod.onRequest);
  console.log(`Registered route: ${route} -> ${fullPath}`);
}

http
  .createServer(async (req, res) => {
    const fullUrl = `http://${req.headers.host}${req.url}`;
    console.log(`Incoming request: ${req.method} ${fullUrl}`);
    const pathname = new URL(fullUrl).pathname;
    const handler = routes.get(pathname);

    if (!handler) {
      res.writeHead(404).end("Not Found");
      return;
    }

    const body = ["GET", "HEAD"].includes(req.method) ? undefined : req;
    const webReq = new Request(fullUrl, {
      method: req.method,
      headers: req.headers,
      body,
      duplex: "half",
    });

    const webRes = await handler({ request: webReq });
    res.writeHead(webRes.status, Object.fromEntries(webRes.headers));
    res.end(await webRes.text());
  })
  .listen(8787);