import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadData, root } from "../scripts/load-data.mjs";

const { projects, categories } = loadData();
const catIds = new Set(categories.map((c) => c.id));

test("có danh mục và project", () => {
  assert.ok(categories.length >= 1);
  assert.ok(projects.length >= 1);
});

test("slug là duy nhất và hợp lệ cho URL", () => {
  const slugs = projects.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "trùng slug");
  for (const s of slugs) assert.match(s, /^[a-z0-9-]+$/, `slug không hợp lệ: ${s}`);
});

for (const p of projects) {
  test(`${p.slug}: đủ trường bắt buộc`, () => {
    for (const key of ["name", "tagline", "category", "repo", "cover", "summary", "updated", "accent"]) {
      assert.ok(typeof p[key] === "string" && p[key].trim(), `thiếu ${key}`);
    }
    assert.ok(catIds.has(p.category), `category lạ: ${p.category}`);
    assert.match(p.repo, /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/, "repo phải là link GitHub, không có .git");
    assert.match(p.updated, /^\d{4}-\d{2}-\d{2}$/, "updated dạng YYYY-MM-DD");
    assert.match(p.accent, /^#[0-9a-f]{6}$/i, "accent dạng #rrggbb");
    assert.ok(Array.isArray(p.features) && p.features.length >= 3, "cần ít nhất 3 tính năng");
    assert.ok(Array.isArray(p.quickstart) && p.quickstart.length >= 1, "cần quickstart");
    for (const q of p.quickstart) assert.ok(q.label && q.code, "quickstart cần label + code");
    assert.ok(Array.isArray(p.usage) && p.usage.length >= 1, "cần hướng dẫn sử dụng");
    for (const u of p.usage) assert.ok(u.title && u.steps?.length, "mỗi mục usage cần title + steps");
    assert.ok(Array.isArray(p.stack) && p.stack.length, "cần stack");
  });

  test(`${p.slug}: mọi ảnh đều tồn tại`, () => {
    const imgs = [p.cover, ...(p.gallery || []).map((g) => g.src)];
    for (const img of imgs) {
      assert.ok(!img.startsWith("/"), `dùng đường dẫn tương đối: ${img}`);
      assert.ok(existsSync(path.join(root, img)), `thiếu ảnh ${img}`);
    }
    for (const g of p.gallery || []) assert.ok(g.caption, `ảnh ${g.src} thiếu caption`);
  });
}

test("index.html nạp data trước app.js", () => {
  const html = readFileSync(path.join(root, "index.html"), "utf8");
  const a = html.indexOf('src="data/projects.js"');
  const b = html.indexOf('src="app.js"');
  assert.ok(a > 0 && b > a);
});
