(() => {
  "use strict";

  const PROJECTS = window.PROJECTS || [];
  const CATEGORIES = window.CATEGORIES || [];
  const catById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
  const app = document.getElementById("app");
  const state = { query: "" };

  // ---------- helpers ----------
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // Markdown tối giản cho nội dung trong data: `code`, **đậm**, và link http(s).
  const md = (s) =>
    esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[\s(])(https?:\/\/[^\s)<]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');

  const catVar = (id) => `--cat: var(--c-${id})`;
  const host = (u) => String(u).replace(/^https?:\/\//, "").replace(/\/$/, "");
  const LIVE = PROJECTS.filter((p) => p.demo);
  const extIcon = `<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 3H3.5A1.5 1.5 0 002 4.5v8A1.5 1.5 0 003.5 14h8a1.5 1.5 0 001.5-1.5V10M9 2h5v5M14 2 7.5 8.5"/></svg>`;
  const ghIcon = `<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 014 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`;
  const fmtDate = (iso) => {
    const [y, m, d] = String(iso).split("-");
    return d && m && y ? `${d}/${m}/${y}` : iso;
  };
  const sortByDate = (list) => [...list].sort((a, b) => String(b.updated).localeCompare(String(a.updated)));
  const fold = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
  const haystack = (p) =>
    fold([p.name, p.tagline, p.summary, catById[p.category]?.label, ...(p.tags || []), ...(p.stack || [])].join(" "));

  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove("show"), 1800);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // file:// hoặc trình duyệt cũ: dùng textarea tạm.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {}
      ta.remove();
      return ok;
    }
  }

  // ---------- router ----------
  function parseRoute() {
    const h = location.hash.replace(/^#\/?/, "");
    const [kind, arg] = h.split("/").map(decodeURIComponent);
    if (kind === "p" && arg) return { view: "project", slug: arg };
    if (kind === "c" && arg) return { view: "home", cat: arg };
    if (kind === "tag" && arg) return { view: "home", tag: arg };
    if (kind === "live") return { view: "home", live: true };
    return { view: "home" };
  }

  function render() {
    const r = parseRoute();
    renderNav(r);
    if (r.view === "project") renderProject(r.slug);
    else renderHome(r);
  }

  function renderNav(r) {
    const nav = document.getElementById("topnav");
    const current = r.view === "project" ? PROJECTS.find((p) => p.slug === r.slug)?.category : r.cat;
    const links = [`<a href="#/"${r.view === "home" && !r.cat && !r.tag && !r.live ? ' aria-current="page"' : ""}>Tất cả</a>`]
      .concat(
        CATEGORIES.filter((c) => PROJECTS.some((p) => p.category === c.id)).map(
          (c) => `<a href="#/c/${c.id}"${current === c.id ? ' aria-current="page"' : ""}>${c.label}</a>`,
        ),
      )
      .concat(LIVE.length ? [`<a class="nav-live" href="#/live"${r.live ? ' aria-current="page"' : ""}><i class="pulse"></i>Online</a>`] : []);
    nav.innerHTML = links.join("");
  }

  // ---------- home ----------
  function card(p) {
    const c = catById[p.category] || { label: p.category };
    const shown = p.demo ? 2 : 3; // chừa chỗ cho nút "Mở app"
    // Cả card bấm được nhờ .card-link::after phủ kín; nút "Mở app" nằm trên lớp phủ đó.
    return `
      <article class="card${p.demo ? " is-live" : ""}" style="--accent:${esc(p.accent)}" data-slug="${esc(p.slug)}">
        <div class="card-cover${p.portrait ? " portrait" : ""}">
          <img src="${esc(p.cover)}" alt="Ảnh chụp ${esc(p.name)}" loading="lazy" />
          <span class="cat-badge" style="${catVar(p.category)}">${c.icon || ""} ${esc(c.label)}</span>
          ${p.demo ? `<span class="live-badge"><i class="pulse"></i>Online</span>` : ""}
        </div>
        <div class="card-body">
          <div class="card-title"><span class="dot"></span><h3><a class="card-link" href="#/p/${encodeURIComponent(p.slug)}">${esc(p.name)}</a></h3></div>
          <p>${esc(p.tagline)}</p>
          <div class="card-foot">
            <div class="stack">${(p.stack || []).slice(0, shown).map((s) => `<span>${esc(s)}</span>`).join("")}${
              (p.stack || []).length > shown ? `<span>+${p.stack.length - shown}</span>` : ""
            }</div>
            ${
              p.demo
                ? `<a class="demo-link" href="${esc(p.demo)}" target="_blank" rel="noopener" aria-label="Mở ${esc(p.name)} (tab mới)">Mở app ${extIcon}</a>`
                : `<span class="arrow" aria-hidden="true">→</span>`
            }
          </div>
        </div>
      </article>`;
  }

  function liveStrip() {
    if (!LIVE.length) return "";
    return `
      <section class="live-strip" aria-labelledby="live-h">
        <div class="live-head">
          <h2 id="live-h"><i class="pulse"></i>Đang chạy online</h2>
          <p>Mở là dùng được ngay, không cần cài đặt.</p>
        </div>
        <div class="live-grid">
          ${LIVE.map((p) => {
            const c = catById[p.category] || { label: p.category };
            return `
            <article class="live-card" style="--accent:${esc(p.accent)}" data-live="${esc(p.slug)}">
              <a class="live-thumb" href="${esc(p.demo)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">
                <img src="${esc(p.cover)}" alt="" loading="lazy" />
              </a>
              <div class="live-info">
                <span class="cat-badge" style="${catVar(p.category)}">${c.icon || ""} ${esc(c.label)}</span>
                <h3>${esc(p.name)}</h3>
                <p>${esc(p.tagline)}</p>
                <a class="live-url" href="${esc(p.demo)}" target="_blank" rel="noopener">${esc(host(p.demo))}</a>
                <div class="live-actions">
                  <a class="btn primary sm" href="${esc(p.demo)}" target="_blank" rel="noopener">Mở app ${extIcon}</a>
                  <a class="btn sm" href="#/p/${encodeURIComponent(p.slug)}">Hướng dẫn</a>
                </div>
              </div>
            </article>`;
          }).join("")}
        </div>
      </section>`;
  }

  function renderHome(r) {
    const counts = Object.fromEntries(CATEGORIES.map((c) => [c.id, PROJECTS.filter((p) => p.category === c.id).length]));
    const usedCats = CATEGORIES.filter((c) => counts[c.id]);
    const stackCount = new Set(PROJECTS.flatMap((p) => p.stack || [])).size;
    const latest = sortByDate(PROJECTS)[0];

    const plain = !r.cat && !r.tag && !r.live;

    app.innerHTML = `
      <div class="hero-band fade-in">
        <div class="wrap">
          <section class="hero">
            <span class="eyebrow">Kho project · LeBao2808</span>
            <h1>Mọi thứ tôi đã làm, <em>ở cùng một chỗ.</em></h1>
            <p class="lead">${PROJECTS.length} project đã đưa lên GitHub, chia theo loại: tool, extension, app, game. ${
              LIVE.length ? `${LIVE.length} app đang chạy online, mở là dùng được ngay. ` : ""
            }Bấm vào từng project để xem ảnh chụp, tính năng và cách cài đặt chi tiết.</p>
            <div class="stats">
              <div class="stat"><b>${PROJECTS.length}</b><span>project trên GitHub</span></div>
              ${LIVE.length ? `<a class="stat stat-live" href="#/live"><b>${LIVE.length}</b><span><i class="pulse"></i>đang chạy online</span></a>` : ""}
              <div class="stat"><b>${stackCount}</b><span>công nghệ đã dùng</span></div>
              ${latest ? `<a class="stat" href="#/p/${latest.slug}"><b class="stat-name">${esc(latest.name)}</b><span>mới cập nhật · ${fmtDate(latest.updated)}</span></a>` : ""}
            </div>
          </section>
        </div>
      </div>

      <div class="wrap fade-in">
        ${plain ? liveStrip() : ""}

        <div class="toolbar" id="browse">
          <div class="chips" role="group" aria-label="Lọc theo loại">
            <a class="chip" href="#/" aria-pressed="${plain}">Tất cả <span class="n">${PROJECTS.length}</span></a>
            ${usedCats
              .map((c) => `<a class="chip" href="#/c/${c.id}" style="${catVar(c.id)}" aria-pressed="${r.cat === c.id}">${c.icon} ${esc(c.label)} <span class="n">${counts[c.id]}</span></a>`)
              .join("")}
            ${LIVE.length ? `<a class="chip chip-live" href="#/live" aria-pressed="${!!r.live}"><i class="pulse"></i>Online <span class="n">${LIVE.length}</span></a>` : ""}
          </div>
          <label class="search">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <input id="q" type="search" placeholder="Tìm theo tên, công nghệ, tag…" value="${esc(state.query)}" aria-label="Tìm project" autocomplete="off" />
            <kbd>/</kbd>
          </label>
        </div>
        ${r.tag ? `<p class="muted" style="margin:-4px 0 0">Đang lọc theo tag <code>${esc(r.tag)}</code> · <a href="#/">bỏ lọc</a></p>` : ""}
        <div id="results"></div>
      </div>`;

    const input = document.getElementById("q");
    input.addEventListener("input", () => {
      state.query = input.value;
      renderResults(r);
    });
    renderResults(r);
    document.title = r.cat && catById[r.cat]
      ? `${catById[r.cat].label} · Project Hub`
      : r.live
        ? "Đang online · Project Hub"
        : "Project Hub · LeBao2808";
  }

  function renderResults(r) {
    const out = document.getElementById("results");
    const q = fold(state.query.trim());
    let list = sortByDate(PROJECTS);
    if (r.cat) list = list.filter((p) => p.category === r.cat);
    if (r.tag) list = list.filter((p) => [...(p.tags || []), ...(p.stack || [])].some((t) => fold(t) === fold(r.tag)));
    if (r.live) list = list.filter((p) => p.demo);
    if (q) list = list.filter((p) => q.split(/\s+/).every((w) => haystack(p).includes(w)));

    if (!list.length) {
      out.innerHTML = `<div class="empty">Không có project nào khớp “${esc(state.query)}”.</div>`;
      return;
    }
    // Không lọc: xếp theo thứ tự category rồi theo ngày. Có lọc: kèm mô tả category / số kết quả.
    const order = Object.fromEntries(CATEGORIES.map((c, i) => [c.id, i]));
    if (!r.cat && !r.tag && !r.live && !q) list.sort((a, b) => (order[a.category] ?? 99) - (order[b.category] ?? 99));
    const cat = r.cat && catById[r.cat];
    const head = cat && !q
      ? `<span class="cat-badge" style="${catVar(cat.id)}">${cat.icon} ${esc(cat.label)}</span><p>${esc(cat.desc)}</p>`
      : r.live && !q
        ? `<span class="live-badge static"><i class="pulse"></i>Online</span><p>Project đã deploy, bấm <b>Mở app</b> để dùng thử ngay trên trình duyệt.</p>`
        : `<p>${r.cat || r.tag || r.live || q ? `${list.length} kết quả` : `Tất cả ${list.length} project`}</p>`;
    out.innerHTML = `
      <div class="section-head">${head}</div>
      <div class="grid">${list.map(card).join("")}</div>`;
  }

  // ---------- project detail ----------
  let gallery = [];
  let galleryIndex = 0;

  function renderProject(slug) {
    const idx = PROJECTS.findIndex((p) => p.slug === slug);
    const p = PROJECTS[idx];
    if (!p) {
      app.innerHTML = `<div class="wrap"><div class="empty" style="margin-top:60px">Không tìm thấy project “${esc(slug)}”. <a href="#/">Về trang chủ</a></div></div>`;
      document.title = "Không tìm thấy · Project Hub";
      return;
    }
    const c = catById[p.category] || { label: p.category };
    const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
    const next = PROJECTS[(idx + 1) % PROJECTS.length];
    gallery = p.gallery?.length ? p.gallery : [{ src: p.cover, caption: p.name }];
    galleryIndex = 0;
    const clone = `git clone ${p.repo}.git`;

    const sections = [
      ["overview", "Tổng quan", `<p>${md(p.summary)}</p>`],
      ["features", "Tính năng", `<ul class="features">${(p.features || []).map((f) => `<li>${md(f)}</li>`).join("")}</ul>`],
      [
        "install",
        "Cài đặt nhanh",
        [{ label: "Tải mã nguồn", code: `${clone}\ncd ${p.folder || p.slug}` }, ...(p.quickstart || [])]
          .map(
            (s, i) => `
            <div class="code-step">
              <div class="label"><b>${i + 1}.</b> ${md(s.label)}</div>
              <div class="codebox"><pre><code>${esc(s.code)}</code></pre><button class="copy" type="button" data-copy="${esc(s.code)}">Copy</button></div>
            </div>`,
          )
          .join(""),
      ],
      [
        "usage",
        "Cách sử dụng",
        `<div class="howto">${(p.usage || [])
          .map((u) => `<section><h3>${md(u.title)}</h3><ol>${u.steps.map((s) => `<li>${md(s)}</li>`).join("")}</ol></section>`)
          .join("")}</div>`,
      ],
      p.commands?.length && [
        "commands",
        "Lệnh hữu ích",
        `<div class="table-wrap"><table class="cmd-table"><tbody>${p.commands
          .map((x) => `<tr><td><code>${esc(x.cmd)}</code></td><td>${md(x.desc)}</td></tr>`)
          .join("")}</tbody></table></div>`,
      ],
      p.notes?.length && ["notes", "Lưu ý", `<ul class="notes">${p.notes.map((n) => `<li>${md(n)}</li>`).join("")}</ul>`],
    ].filter(Boolean);

    app.innerHTML = `
      <article class="wrap fade-in" style="--accent:${esc(p.accent)}" data-project="${esc(p.slug)}">
        <nav class="crumbs" aria-label="Breadcrumb">
          <a href="#/">Tất cả</a><span>/</span><a href="#/c/${p.category}">${esc(c.label)}</a><span>/</span><span>${esc(p.name)}</span>
        </nav>
        <header class="detail-head">
          <div class="head-meta">
            <a class="cat-badge" href="#/c/${p.category}" style="${catVar(p.category)}">${c.icon || ""} ${esc(c.label)}</a>
            ${p.demo ? `<span class="live-badge static"><i class="pulse"></i>Online</span>` : p.status ? `<span class="pill">${esc(p.status)}</span>` : ""}
            <span class="pill">Cập nhật ${fmtDate(p.updated)}</span>
          </div>
          <h1><span class="dot"></span>${esc(p.name)}</h1>
          <p class="lead">${md(p.tagline)}</p>
          <div class="actions">
            ${
              p.demo
                ? `<a class="btn primary btn-demo" href="${esc(p.demo)}" target="_blank" rel="noopener"><i class="pulse"></i>Mở bản chạy thật ${extIcon}</a>`
                : ""
            }
            <a class="btn btn-repo${p.demo ? "" : " primary"}" href="${esc(p.repo)}" target="_blank" rel="noopener">${ghIcon} Xem trên GitHub</a>
            <button class="btn" type="button" data-copy="${esc(clone)}">Copy lệnh git clone</button>
          </div>
          ${
            p.demo
              ? `<p class="demo-line">Bản online: <a href="${esc(p.demo)}" target="_blank" rel="noopener">${esc(host(p.demo))}</a>${
                  p.demoNote ? `<span class="demo-note">${md(p.demoNote)}</span>` : ""
                }</p>`
              : ""
          }
        </header>

        <div class="gallery">
          ${
            p.demo
              ? `<a class="gallery-live" href="${esc(p.demo)}" target="_blank" rel="noopener"><i class="pulse"></i>Mở app thật ${extIcon}</a>`
              : ""
          }
          <button class="gallery-main${gallery[0].portrait ? " portrait" : ""}" type="button" id="gmain" aria-label="Phóng to ảnh">
            <img src="${esc(gallery[0].src)}" alt="${esc(gallery[0].caption)}" />
            <figcaption>${esc(gallery[0].caption)}</figcaption>
          </button>
          ${
            gallery.length > 1
              ? `<div class="thumbs" role="group" aria-label="Ảnh khác">${gallery
                  .map(
                    (g, i) =>
                      `<button type="button" data-i="${i}" aria-current="${i === 0}" aria-label="${esc(g.caption)}"><img src="${esc(g.src)}" alt="" loading="lazy" /></button>`,
                  )
                  .join("")}</div>`
              : ""
          }
        </div>

        <div class="detail-grid">
          <div>
            <nav class="toc" aria-label="Mục lục">${sections.map(([id, t]) => `<a href="#/p/${p.slug}" data-jump="${id}">${t}</a>`).join("")}</nav>
            ${sections
              .map(
                ([id, title, body], i) =>
                  `<section class="block" id="s-${id}"><h2><span class="num">${String(i + 1).padStart(2, "0")}</span>${title}</h2>${body}</section>`,
              )
              .join("")}
          </div>
          <aside class="aside">
            <div class="panel">
              <h3>Thông tin</h3>
              <dl class="kv">
                <dt>Loại</dt><dd>${c.icon || ""} ${esc(c.label)}</dd>
                <dt>Trạng thái</dt><dd>${esc(p.status || "—")}</dd>
                ${p.demo ? `<dt>Bản online</dt><dd><a href="${esc(p.demo)}" target="_blank" rel="noopener">${esc(host(p.demo))}</a></dd>` : ""}
                <dt>Cập nhật</dt><dd>${fmtDate(p.updated)}</dd>
                <dt>Thư mục</dt><dd><code>Project/${esc(p.folder || p.slug)}</code></dd>
                <dt>Repo</dt><dd><a href="${esc(p.repo)}" target="_blank" rel="noopener">${esc(p.repo.replace("https://github.com/", ""))}</a></dd>
              </dl>
            </div>
            ${
              p.requirements?.length
                ? `<div class="panel"><h3>Yêu cầu</h3><ul class="req">${p.requirements.map((x) => `<li>${md(x)}</li>`).join("")}</ul></div>`
                : ""
            }
            <div class="panel"><h3>Công nghệ</h3><div class="stack">${(p.stack || []).map((s) => `<span>${esc(s)}</span>`).join("")}</div></div>
            ${
              p.tags?.length
                ? `<div class="panel"><h3>Tags</h3><div class="tags">${p.tags.map((t) => `<a href="#/tag/${encodeURIComponent(t)}">#${esc(t)}</a>`).join("")}</div></div>`
                : ""
            }
          </aside>
        </div>

        ${
          PROJECTS.length > 1
            ? `<nav class="pager" aria-label="Project khác">
                <a class="prev" href="#/p/${prev.slug}"><small>← Project trước</small><b>${esc(prev.name)}</b></a>
                <a class="next" href="#/p/${next.slug}"><small>Project sau →</small><b>${esc(next.name)}</b></a>
              </nav>`
            : ""
        }
      </article>`;

    document.title = `${p.name} · Project Hub`;
    window.scrollTo(0, 0);

    document.getElementById("gmain").addEventListener("click", () => openLightbox(galleryIndex));
    app.querySelectorAll(".thumbs button").forEach((b) => b.addEventListener("click", () => showSlide(Number(b.dataset.i))));
    app.querySelectorAll("[data-jump]").forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("s-" + a.dataset.jump)?.scrollIntoView({ behavior: "smooth" });
      }),
    );
  }

  function showSlide(i) {
    galleryIndex = i;
    const g = gallery[i];
    const main = document.getElementById("gmain");
    if (!main) return;
    main.classList.toggle("portrait", !!g.portrait);
    main.querySelector("img").src = g.src;
    main.querySelector("img").alt = g.caption;
    main.querySelector("figcaption").textContent = g.caption;
    app.querySelectorAll(".thumbs button").forEach((b) => b.setAttribute("aria-current", String(Number(b.dataset.i) === i)));
  }

  // ---------- lightbox ----------
  const lb = document.getElementById("lightbox");
  function openLightbox(i) {
    lbShow(i);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    lb.querySelector(".lb-close").focus();
  }
  function closeLightbox() {
    lb.hidden = true;
    document.body.style.overflow = "";
    document.getElementById("gmain")?.focus();
  }
  function lbShow(i) {
    galleryIndex = (i + gallery.length) % gallery.length;
    const g = gallery[galleryIndex];
    lb.querySelector("img").src = g.src;
    lb.querySelector("img").alt = g.caption;
    lb.querySelector("figcaption").textContent = `${g.caption}  ·  ${galleryIndex + 1}/${gallery.length}`;
    lb.querySelectorAll(".lb-nav").forEach((b) => (b.style.visibility = gallery.length > 1 ? "visible" : "hidden"));
    showSlide(galleryIndex);
  }
  lb.querySelector(".lb-close").addEventListener("click", closeLightbox);
  lb.querySelector(".lb-prev").addEventListener("click", () => lbShow(galleryIndex - 1));
  lb.querySelector(".lb-next").addEventListener("click", () => lbShow(galleryIndex + 1));
  lb.addEventListener("click", (e) => {
    if (e.target === lb || e.target.tagName === "FIGURE") closeLightbox();
  });

  // ---------- global events ----------
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy]");
    if (!btn) return;
    const ok = await copyText(btn.dataset.copy);
    toast(ok ? "Đã copy vào clipboard" : "Không copy được, hãy chọn và copy thủ công");
    if (ok && btn.classList.contains("copy")) {
      btn.textContent = "Đã copy";
      btn.classList.add("done");
      setTimeout(() => {
        btn.textContent = "Copy";
        btn.classList.remove("done");
      }, 1500);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!lb.hidden) {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") lbShow(galleryIndex - 1);
      else if (e.key === "ArrowRight") lbShow(galleryIndex + 1);
      return;
    }
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
    if (e.key === "/" && !typing) {
      const q = document.getElementById("q");
      if (q) {
        e.preventDefault();
        q.focus();
      } else {
        location.hash = "#/";
        setTimeout(() => document.getElementById("q")?.focus(), 0);
      }
    } else if (e.key === "Escape" && typing && document.activeElement.id === "q") {
      document.activeElement.value = "";
      state.query = "";
      renderResults(parseRoute());
    }
  });

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const root = document.documentElement;
    const current = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const nextTheme = current === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    try {
      localStorage.setItem("hub-theme", nextTheme);
    } catch {}
  });

  window.addEventListener("hashchange", () => {
    if (!lb.hidden) closeLightbox();
    render();
  });
  render();
})();
