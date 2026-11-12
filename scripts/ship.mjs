// Đưa một project trong D:\Project lên GitHub + Vercel, rồi in link để thêm vào danh mục.
//
// Dùng: node scripts/ship.mjs <thư-mục> [--no-env] [--no-vercel] [--private]
//   1. Kiểm tra repo không còn thay đổi chưa commit.
//   2. Chưa có remote origin → tạo repo GitHub bằng `gh` (cần `gh auth login` một lần) rồi push.
//      Có rồi → push nhánh hiện tại.
//   3. Link project Vercel (tên = tên thư mục), đẩy biến từ .env.local / .env lên môi trường
//      production (bỏ qua VERCEL_* và dòng comment), deploy --prod.
//   4. In link production + mã HTTP khi mở thử.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { root } from "./load-data.mjs";

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const folder = args.find((a) => !a.startsWith("--"));
if (!folder) {
  console.error("Dùng: node scripts/ship.mjs <thư-mục> [--no-env] [--no-vercel] [--private]");
  process.exit(2);
}
const dir = path.resolve(root, "..", folder);
if (!existsSync(path.join(dir, ".git"))) {
  console.error(`✗ ${dir} không phải repo git`);
  process.exit(1);
}

const run = (cmd, cmdArgs, opts = {}) => {
  const r = spawnSync(cmd, cmdArgs, { cwd: dir, encoding: "utf8", shell: process.platform === "win32", ...opts });
  return { ok: r.status === 0, out: `${r.stdout ?? ""}${r.stderr ?? ""}`.trim() };
};
const step = (msg) => console.log(`\n▸ ${msg}`);
const fail = (msg, out = "") => {
  console.error(`✗ ${msg}${out ? `\n${out.split("\n").slice(-15).join("\n")}` : ""}`);
  process.exit(1);
};

// 1. Repo sạch
step("Kiểm tra git");
const dirty = run("git", ["status", "--porcelain"]).out;
if (dirty) fail("Còn thay đổi chưa commit — commit trước rồi chạy lại:", dirty);
const branch = run("git", ["branch", "--show-current"]).out || "main";
console.log(`  nhánh ${branch}, đã commit hết`);

// 2. GitHub
step("GitHub");
let remote = run("git", ["remote", "get-url", "origin"]).out;
if (!run("git", ["remote", "get-url", "origin"]).ok) {
  if (!run("gh", ["--version"]).ok)
    fail("Chưa có remote origin và máy chưa cài GitHub CLI. Cài: `winget install GitHub.cli` rồi `gh auth login`.");
  const visibility = flags.has("--private") ? "--private" : "--public";
  const r = run("gh", ["repo", "create", folder, visibility, "--source", ".", "--remote", "origin", "--push"]);
  if (!r.ok) fail("Không tạo được repo GitHub:", r.out);
  remote = run("git", ["remote", "get-url", "origin"]).out;
  console.log(`  đã tạo ${remote}`);
} else {
  const r = run("git", ["push", "-u", "origin", branch]);
  if (!r.ok) fail("Push thất bại:", r.out);
  console.log(`  đã push ${remote}`);
}
const repoUrl = remote.replace(/\.git$/, "").replace(/^git@github\.com:/, "https://github.com/");

if (flags.has("--no-vercel")) {
  console.log(`\n✓ Xong. repo: ${repoUrl}`);
  process.exit(0);
}

// 3. Vercel
step("Vercel: link project");
if (!existsSync(path.join(dir, ".vercel", "project.json"))) {
  const r = run("npx", ["vercel", "link", "--yes", "--project", folder]);
  if (!r.ok) fail("vercel link thất bại (đã `npx vercel login` chưa?):", r.out);
}
// vercel link có thể sửa .gitignore — giữ repo sạch
if (run("git", ["status", "--porcelain"]).out) {
  console.log("  ⚠ vercel link vừa sửa file trong repo (thường là .gitignore). Kiểm tra `git diff` rồi commit nếu cần.");
}

if (!flags.has("--no-env")) {
  step("Vercel: đẩy biến môi trường");
  const envFile = [".env.local", ".env"].map((f) => path.join(dir, f)).find(existsSync);
  if (!envFile) console.log("  (không có .env.local / .env — bỏ qua)");
  else {
    for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m || m[1].startsWith("VERCEL_")) continue;
      const value = m[2].replace(/^(['"])(.*)\1$/, "$2");
      if (!value) continue;
      const r = run("npx", ["vercel", "env", "add", m[1], "production", "--force"], { input: value });
      console.log(`  ${r.ok ? "✓" : "✗"} ${m[1]}`);
    }
  }
}

step("Vercel: deploy production");
const dep = run("npx", ["vercel", "deploy", "--prod", "--yes"]);
if (!dep.ok) fail("Deploy thất bại:", dep.out);
const url =
  dep.out.match(/"productionUrl":\s*"([^"]+)"/)?.[1] ??
  dep.out.match(/Aliased\s+(https:\/\/\S+)/)?.[1] ??
  dep.out.match(/Production\s+(https:\/\/\S+)/)?.[1];
if (!url) fail("Deploy xong nhưng không đọc được link:", dep.out);

let status = "?";
try {
  status = String((await fetch(url, { redirect: "manual" })).status);
} catch (e) {
  status = `lỗi (${e.message})`;
}

console.log(`
✓ Xong
  repo : ${repoUrl}
  demo : ${url}   (HTTP ${status})

Tiếp theo: thêm khối project vào data/projects.js (repo + demo ở trên), chụp ảnh vào
assets/<slug>/, chạy \`npm run check\`, rồi commit + push project-hub để GitHub Pages tự deploy.`);
