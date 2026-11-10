// Chụp ảnh màn hình các project để đưa vào trang chi tiết.
// Cần các app đang chạy (xem README, mục "Cập nhật ảnh chụp"):
//   aurora-hotel          → http://localhost:3000   (npm run dev)
//   learning-english      → http://localhost:3101   (npx next dev -p 3101)
//   village-defense-live  → http://localhost:3102   (PORT=3102 npm run dev)
// Dùng: node scripts/screenshots.mjs [slug ...]
import { chromium } from "playwright";
import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projects = path.resolve(root, "..");
const out = (slug, name) => path.join(root, "assets", slug, name);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Ẩn nút "N" của Next.js dev tools để ảnh sạch, lưu JPEG cho nhẹ.
async function shot(page, file, opts = {}) {
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" }).catch(() => {});
  await page.screenshot({ path: file, type: "jpeg", quality: 82, ...opts });
}

async function reachable(url) {
  try {
    const r = await fetch(url);
    return r.status < 500;
  } catch {
    return false;
  }
}

async function pages(browser, slug, base, routes) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  for (const [route, name] of routes) {
    await page.goto(base + route, { waitUntil: "networkidle", timeout: 120_000 });
    await wait(1200);
    await shot(page, out(slug, name));
  }
  await page.close();
}

const jobs = {
  "agent-office-3d": async () => {
    const src = path.join(projects, "agent-office-3d");
    const files = [
      ["docs/live.png", "live.png"],
      ["docs/office-2d.png", "office-2d.png"],
      ["screenshots/03-coding.png", "coding.png"],
      ["screenshots/10-2d-follow.png", "2d-follow.png"],
    ];
    for (const [from, to] of files) await copyFile(path.join(src, from), out("agent-office-3d", to));
  },

  "claude-pixel-bg": async (browser) => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(pathToFileURL(path.join(projects, "claude-pixel-bg", "preview.html")).href);
    await wait(1500);
    await shot(page, out("claude-pixel-bg", "gallery.jpg"));
    await page.close();
  },

  "aurora-hotel": (browser) =>
    pages(browser, "aurora-hotel", "http://localhost:3000", [
      ["/", "home.jpg"],
      ["/rooms", "rooms.jpg"],
      ["/dining", "dining.jpg"],
      ["/system", "system.jpg"],
    ]),

  "learning-english": (browser) =>
    pages(browser, "learning-english", "http://localhost:3101", [
      ["/", "home.jpg"],
      ["/speaking", "speaking.jpg"],
      ["/writing", "writing.jpg"],
      ["/tips", "tips.jpg"],
    ]),

  "village-defense-live": async (browser) => {
    const base = "http://localhost:3102";
    const ctx = await browser.newContext();
    const admin = await ctx.newPage();
    await admin.setViewportSize({ width: 1280, height: 860 });
    await admin.goto(base + "/admin", { waitUntil: "networkidle", timeout: 120_000 });
    await admin.getByRole("button", { name: "⏸ Dừng" }).click().catch(() => {});
    const game = await ctx.newPage();
    await game.setViewportSize({ width: 540, height: 960 });
    await game.goto(base + "/game", { waitUntil: "networkidle", timeout: 120_000 });
    await wait(2500);
    await shot(game, out("village-defense-live", "lobby.jpg"));

    // Bật giả lập (nếu chưa bật), cho người xem tự động tương tác rồi bắt đầu ván.
    const enable = admin.getByRole("button", { name: "Bật giả lập" });
    if (await enable.count()) await enable.click();
    await wait(500);
    const auto = admin.getByRole("button", { name: /Chạy tự động/ });
    if (await auto.count()) await auto.first().click();
    await admin.getByRole("button", { name: "▶ Bắt đầu" }).click();
    await wait(20_000);
    for (const label of [/Quà lớn/, /Quà vừa/]) {
      const b = admin.getByRole("button", { name: label });
      if (await b.count()) await b.first().click();
    }
    await wait(1800);
    await shot(game, out("village-defense-live", "battle.jpg"));
    await shot(admin, out("village-defense-live", "admin.jpg"));
    await admin.getByRole("button", { name: "⏸ Dừng" }).click().catch(() => {});
    await ctx.close();
  },
};

const health = {
  "aurora-hotel": "http://localhost:3000",
  "learning-english": "http://localhost:3101",
  "village-defense-live": "http://localhost:3102",
};

const wanted = process.argv.slice(2);
const browser = await chromium.launch();
let failed = 0;
for (const [slug, job] of Object.entries(jobs)) {
  if (wanted.length && !wanted.includes(slug)) continue;
  await mkdir(path.join(root, "assets", slug), { recursive: true });
  if (health[slug] && !(await reachable(health[slug]))) {
    console.log(`- ${slug}: bỏ qua (server ${health[slug]} chưa chạy)`);
    continue;
  }
  try {
    await job(browser);
    console.log(`✓ ${slug}`);
  } catch (err) {
    failed++;
    console.log(`✗ ${slug}: ${err.message.split("\n")[0]}`);
  }
}
await browser.close();
process.exit(failed ? 1 : 0);
