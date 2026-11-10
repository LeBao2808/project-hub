// Server tĩnh không phụ thuộc thư viện: node scripts/serve.mjs [port]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { root } from "./load-data.mjs";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

export function startServer(port = 5050, host = "127.0.0.1") {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://x");
      let rel = decodeURIComponent(url.pathname);
      if (rel.endsWith("/")) rel += "index.html";
      const file = path.join(root, path.normalize(rel));
      // Không cho đi ra ngoài thư mục project hay đọc node_modules / .git.
      if (!file.startsWith(root + path.sep) || /[\\/](node_modules|\.git)([\\/]|$)/.test(file)) {
        res.writeHead(403).end("Forbidden");
        return;
      }
      if (!(await stat(file)).isFile()) throw new Error("not a file");
      const body = await readFile(file);
      res.writeHead(200, { "content-type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Not found");
    }
  });
  return new Promise((resolve) => server.listen(port, host, () => resolve(server)));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const port = Number(process.argv[2] || process.env.PORT || 5050);
  await startServer(port);
  console.log(`Project Hub → http://localhost:${port}`);
}
