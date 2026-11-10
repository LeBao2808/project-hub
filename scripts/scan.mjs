// Quét thư mục cha (D:\Project) để tìm repo git chưa có trong danh mục,
// và kiểm tra link repo trong danh mục có khớp với remote thật không.
// Thoát với mã 1 nếu có project chưa được thêm.
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { loadData, root } from "./load-data.mjs";

const parent = path.resolve(root, "..");
const self = path.basename(root);
const { projects } = loadData();
const byFolder = new Map(projects.map((p) => [p.folder || p.slug, p]));

const git = (cwd, ...args) => {
  try {
    return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
};
const normalize = (u) => u.replace(/\.git$/, "").replace(/^git@github\.com:/, "https://github.com/").toLowerCase();

const missing = [];
const warnings = [];
for (const name of readdirSync(parent, { withFileTypes: true })) {
  if (!name.isDirectory() || name.name === self || name.name.startsWith(".")) continue;
  const dir = path.join(parent, name.name);
  if (!existsSync(path.join(dir, ".git"))) continue;
  const remote = git(dir, "remote", "get-url", "origin");
  const last = git(dir, "log", "-1", "--format=%cs");
  const entry = byFolder.get(name.name);
  if (!entry) {
    let desc = "";
    try {
      desc = JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8")).description || "";
    } catch {}
    missing.push({ folder: name.name, remote, last, desc });
    continue;
  }
  if (remote && normalize(remote) !== normalize(entry.repo)) warnings.push(`${name.name}: repo trong danh mục (${entry.repo}) khác remote (${remote})`);
  if (last && entry.updated < last) warnings.push(`${name.name}: có commit mới ${last}, danh mục ghi ${entry.updated}`);
}
for (const p of projects) {
  if (!existsSync(path.join(parent, p.folder || p.slug))) warnings.push(`${p.slug}: không thấy thư mục ../${p.folder || p.slug} trên máy (vẫn hiển thị bình thường)`);
}

console.log(`Danh mục: ${projects.length} project.`);
for (const w of warnings) console.log(`  ⚠ ${w}`);
if (missing.length) {
  console.log(`\nCó ${missing.length} repo chưa có trong data/projects.js:`);
  for (const m of missing) console.log(`  + ${m.folder}  ${m.remote || "(chưa có remote)"}  ${m.last}${m.desc ? `\n      ${m.desc}` : ""}`);
  process.exit(1);
}
console.log("✓ Mọi repo trong thư mục Project đều đã có trong danh mục.");
