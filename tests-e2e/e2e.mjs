// Test trình duyệt: mở site qua server tĩnh và qua file://, đi qua mọi trang.
// Chạy: npm run test:e2e   (ảnh chụp lưu ở tests-e2e/screens/)
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { startServer } from "../scripts/serve.mjs";
import { loadData, root } from "../scripts/load-data.mjs";

const { projects, categories } = loadData();
const screens = path.join(root, "tests-e2e", "screens");
await mkdir(screens, { recursive: true });

let passed = 0;
const failures = [];
async function check(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failures.push(name);
    console.log(`  ✗ ${name}\n      ${String(err.message).split("\n")[0]}`);
  }
}
function expect(cond, msg) {
  if (!cond) throw new Error(msg);
}

const server = await startServer(0);
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch();

async function newPage(viewport = { width: 1280, height: 860 }, colorScheme = "light") {
  const ctx = await browser.newContext({ viewport, colorScheme });
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: base.slice(0, -1) }).catch(() => {});
  const page = await ctx.newPage();
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && page.errors.push(m.text()));
  page.on("requestfailed", (r) => {
    // Google Fonts có thể không tải được khi offline; không tính là lỗi.
    if (!r.url().includes("fonts.g")) page.errors.push(`request failed: ${r.url()}`);
  });
  page.on("response", (r) => r.status() >= 400 && page.errors.push(`${r.status()} ${r.url()}`));
  return page;
}

async function imagesLoaded(page) {
  return page.evaluate(async () => {
    const imgs = [...document.querySelectorAll("main img")];
    await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => ((i.onload = r), (i.onerror = r))))));
    return imgs.filter((i) => !(i.naturalWidth > 0)).map((i) => i.getAttribute("src"));
  });
}

async function noHorizontalScroll(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
}

console.log("Landing page");
{
  const page = await newPage();
  await page.goto(base);
  await page.waitForSelector(".card");
  await check("hiển thị đủ card project", async () => {
    expect((await page.locator(".card").count()) === projects.length, "số card khác số project");
  });
  await check("mỗi card có badge đúng category", async () => {
    for (const p of projects) {
      const badge = await page.locator(`.card[data-slug="${p.slug}"] .cat-badge`).textContent();
      const label = categories.find((c) => c.id === p.category).label;
      expect(badge.includes(label), `${p.slug}: badge "${badge}"`);
    }
  });
  await page.evaluate(() => document.querySelectorAll("main img").forEach((i) => (i.loading = "eager")));
  await check("mọi ảnh cover tải được", async () => {
    const broken = await imagesLoaded(page);
    expect(!broken.length, `ảnh lỗi: ${broken.join(", ")}`);
  });
  await page.screenshot({ path: path.join(screens, "home.png"), fullPage: true, animations: "disabled" });

  for (const c of categories.filter((c) => projects.some((p) => p.category === c.id))) {
    await check(`lọc category "${c.label}"`, async () => {
      await page.locator(`.chips a[href="#/c/${c.id}"]`).click();
      await page.waitForFunction((id) => location.hash === `#/c/${id}`, c.id);
      const n = projects.filter((p) => p.category === c.id).length;
      expect((await page.locator(".card").count()) === n, `mong ${n} card`);
    });
  }
  await page.goto(base + "#/");

  const live = projects.filter((p) => p.demo);
  await check("mục Đang chạy online liệt kê đúng app đã deploy", async () => {
    const slugs = await page.locator(".live-card").evaluateAll((els) => els.map((e) => e.dataset.live));
    expect(slugs.join() === live.map((p) => p.slug).join(), `có: ${slugs.join()}`);
    for (const p of live) {
      const hrefs = await page.locator(`.live-card[data-live="${p.slug}"] a[target="_blank"]`).evaluateAll((els) => els.map((e) => e.href.replace(/\/$/, "")));
      expect(hrefs.length && hrefs.every((h) => h === p.demo), `${p.slug}: link sai ${hrefs.join()}`);
    }
  });
  await check("card app đã deploy có nhãn Online + nút Mở app", async () => {
    for (const p of projects) {
      const btn = page.locator(`.card[data-slug="${p.slug}"] .demo-link`);
      const badge = page.locator(`.card[data-slug="${p.slug}"] .live-badge`);
      expect((await btn.count()) === (p.demo ? 1 : 0), `${p.slug}: số nút Mở app sai`);
      expect((await badge.count()) === (p.demo ? 1 : 0), `${p.slug}: nhãn Online sai`);
      if (p.demo) expect((await btn.getAttribute("href")) === p.demo, `${p.slug}: link Mở app sai`);
    }
  });
  await check("bấm Mở app trên card mở tab mới, không chuyển trang chi tiết", async () => {
    if (!live.length) return;
    const ctx = page.context();
    await ctx.route(/^https:\/\/(?!fonts\.)/, (route) => route.fulfill({ status: 200, body: "ok" }));
    const [popup] = await Promise.all([ctx.waitForEvent("page"), page.locator(`.card[data-slug="${live[0].slug}"] .demo-link`).click()]);
    expect(popup.url().replace(/\/$/, "") === live[0].demo, `tab mới: ${popup.url()}`);
    await popup.close();
    expect(await page.evaluate(() => location.hash === "#/" || location.hash === ""), "card bị chuyển trang");
  });
  await check("lọc Online", async () => {
    await page.locator('.chips a[href="#/live"]').click();
    await page.waitForFunction(() => location.hash === "#/live");
    expect((await page.locator(".card").count()) === live.length, `mong ${live.length} card`);
    expect((await page.locator(".live-strip").count()) === 0, "trang lọc không nên hiện mục nổi bật");
  });
  await page.goto(base + "#/");

  await check("tìm kiếm (không dấu) lọc đúng", async () => {
    await page.keyboard.press("/");
    expect(await page.evaluate(() => document.activeElement?.id === "q"), "phím / không focus ô tìm kiếm");
    await page.keyboard.type("lang phong thu");
    const names = await page.locator(".card h3").allTextContents();
    expect(names.length === 1 && names[0] === "Làng Phòng Thủ", `kết quả: ${names.join(", ")}`);
  });
  await check("tìm theo công nghệ", async () => {
    await page.fill("#q", "next.js");
    const n = await page.locator(".card").count();
    const expected = projects.filter((p) => p.stack.some((s) => s.toLowerCase().includes("next.js"))).length;
    expect(n === expected, `mong ${expected}, có ${n}`);
  });
  await check("không có kết quả thì báo trống", async () => {
    await page.fill("#q", "zzzzkhongco");
    expect(await page.locator(".empty").isVisible(), "không thấy thông báo trống");
    await page.keyboard.press("Escape");
    expect((await page.locator(".card").count()) === projects.length, "Esc không xoá tìm kiếm");
  });
  await check("không lỗi console", async () => expect(!page.errors.length, page.errors.join(" | ")));
  await page.context().close();
}

console.log("Trang chi tiết");
for (const p of projects) {
  const page = await newPage();
  await page.goto(base);
  await page.waitForSelector(".card");
  await check(`${p.slug}: bấm card mở trang chi tiết`, async () => {
    await page.locator(`.card[data-slug="${p.slug}"]`).click();
    await page.waitForSelector(`[data-project="${p.slug}"]`);
    expect((await page.locator("h1").textContent()).includes(p.name), "sai tiêu đề");
    expect((await page.title()).startsWith(p.name), "sai document.title");
  });
  await check(`${p.slug}: đủ các mục nội dung`, async () => {
    for (const id of ["overview", "features", "install", "usage"]) expect(await page.locator(`#s-${id}`).count(), `thiếu mục ${id}`);
    expect((await page.locator(".features li").count()) === p.features.length, "số tính năng sai");
    expect((await page.locator(".code-step").count()) === p.quickstart.length + 1, "số bước cài đặt sai");
    expect((await page.locator(".howto section").count()) === p.usage.length, "số mục hướng dẫn sai");
    const href = await page.locator("a.btn-repo").getAttribute("href");
    expect(href === p.repo, "link GitHub sai");
    const demoBtn = page.locator("a.btn-demo");
    if (p.demo) {
      expect((await demoBtn.getAttribute("href")) === p.demo, "nút bản chạy thật sai link");
      expect((await demoBtn.getAttribute("target")) === "_blank", "nút demo phải mở tab mới");
      expect((await page.locator("a.gallery-live").getAttribute("href")) === p.demo, "nút Mở app trên ảnh sai link");
    } else {
      expect((await demoBtn.count()) === 0, "project chưa deploy mà có nút demo");
    }
  });
  await check(`${p.slug}: ảnh tải được, gallery + lightbox hoạt động`, async () => {
    await page.evaluate(() => document.querySelectorAll("main img").forEach((i) => (i.loading = "eager")));
    const broken = await imagesLoaded(page);
    expect(!broken.length, `ảnh lỗi: ${broken.join(", ")}`);
    if (p.gallery.length > 1) {
      await page.locator(".thumbs button").nth(1).click();
      const src = await page.locator("#gmain img").getAttribute("src");
      expect(src === p.gallery[1].src, "thumbnail không đổi ảnh chính");
    }
    await page.locator("#gmain").click();
    expect(await page.locator("#lightbox").isVisible(), "lightbox không mở");
    if (p.gallery.length > 1) {
      const before = await page.locator("#lightbox img").getAttribute("src");
      await page.keyboard.press("ArrowRight");
      expect(before !== (await page.locator("#lightbox img").getAttribute("src")), "mũi tên không chuyển ảnh");
    }
    await page.keyboard.press("Escape");
    expect(await page.locator("#lightbox").isHidden(), "Esc không đóng lightbox");
  });
  await check(`${p.slug}: nút Copy chép lệnh`, async () => {
    const btn = page.locator(".code-step .copy").nth(1);
    const expected = await btn.getAttribute("data-copy");
    await btn.click();
    await page.waitForSelector(".toast.show");
    const clip = await page.evaluate(() => navigator.clipboard.readText()).catch(() => null);
    if (clip !== null) expect(clip === expected, `clipboard: ${clip}`);
  });
  await check(`${p.slug}: mục lục cuộn tới đúng mục`, async () => {
    await page.locator('[data-jump="usage"]').click();
    await page.waitForFunction(() => {
      const r = document.getElementById("s-usage").getBoundingClientRect();
      return r.top >= 0 && r.top < window.innerHeight;
    }, null, { timeout: 3000 });
  });
  await page.screenshot({ path: path.join(screens, `detail-${p.slug}.png`), fullPage: true, animations: "disabled" });
  await check(`${p.slug}: không lỗi console`, async () => expect(!page.errors.length, page.errors.join(" | ")));
  await page.context().close();
}

console.log("Điều hướng");
{
  const page = await newPage();
  await check("link trực tiếp + nút Project sau / Back", async () => {
    await page.goto(base + `#/p/${projects[0].slug}`);
    await page.waitForSelector(`[data-project="${projects[0].slug}"]`);
    await page.locator(".pager .next").click();
    await page.waitForSelector(`[data-project="${projects[1].slug}"]`);
    await page.goBack();
    await page.waitForSelector(`[data-project="${projects[0].slug}"]`);
  });
  await check("breadcrumb về category", async () => {
    await page.locator(".crumbs a").nth(1).click();
    await page.waitForFunction((c) => location.hash === `#/c/${c}`, projects[0].category);
    expect(await page.locator(".card").count(), "không có card");
  });
  await check("lọc theo tag", async () => {
    const tag = projects[0].tags[0];
    await page.goto(base + `#/p/${projects[0].slug}`);
    await page.locator(".tags a").first().click();
    await page.waitForSelector(".card");
    const n = await page.locator(".card").count();
    const expected = projects.filter((p) => [...p.tags, ...p.stack].some((t) => t.toLowerCase() === tag.toLowerCase())).length;
    expect(n === expected, `mong ${expected}, có ${n}`);
  });
  await check("slug không tồn tại hiện thông báo", async () => {
    await page.goto(base + "#/p/khong-co");
    expect(await page.locator(".empty").isVisible(), "không có thông báo");
  });
  await check("đổi theme sáng/tối và nhớ lựa chọn", async () => {
    await page.goto(base);
    await page.locator("#theme-toggle").click();
    const t1 = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(t1 === "dark", `theme sau khi bấm: ${t1}`);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg === "rgb(19, 18, 16)", `nền tối sai: ${bg}`);
    await page.reload();
    expect((await page.evaluate(() => document.documentElement.dataset.theme)) === "dark", "không nhớ theme");
    await page.screenshot({ path: path.join(screens, "home-dark.png"), animations: "disabled" });
  });
  await page.context().close();
}

console.log("Mobile (390×844)");
{
  const page = await newPage({ width: 390, height: 844 });
  await page.goto(base);
  await page.waitForSelector(".card");
  await check("landing không tràn ngang", async () => expect(await noHorizontalScroll(page), "có cuộn ngang"));
  await page.screenshot({ path: path.join(screens, "mobile-home.png"), fullPage: true, animations: "disabled" });
  for (const p of projects) {
    await check(`${p.slug}: trang chi tiết không tràn ngang`, async () => {
      await page.goto(base + `#/p/${p.slug}`);
      await page.waitForSelector(`[data-project="${p.slug}"]`);
      expect(await noHorizontalScroll(page), "có cuộn ngang");
    });
  }
  await page.screenshot({ path: path.join(screens, "mobile-detail.png"), fullPage: true, animations: "disabled" });
  await page.context().close();
}

console.log("Mở trực tiếp bằng file://");
{
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await check("index.html chạy được không cần server", async () => {
    await page.goto(pathToFileURL(path.join(root, "index.html")).href + `#/p/${projects[0].slug}`);
    await page.waitForSelector(`[data-project="${projects[0].slug}"]`);
    expect(!errors.length, errors.join(" | "));
  });
  await page.close();
}

await browser.close();
server.close();
console.log(`\n${passed} passed, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);
