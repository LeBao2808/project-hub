// Đọc data/projects.js (script thường gán vào window) trong một sandbox.
import { readFileSync } from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function loadData() {
  const code = readFileSync(path.join(root, "data", "projects.js"), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox, { filename: "data/projects.js" });
  return { projects: sandbox.window.PROJECTS, categories: sandbox.window.CATEGORIES };
}
