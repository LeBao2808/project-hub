# Project Hub

Danh mục tất cả project của tôi ([LeBao2808](https://github.com/LeBao2808)) ở một chỗ. Project được chia theo loại **Tool / Extension / App / Game**. Mỗi project có trang chi tiết gồm ảnh chụp, tính năng, cách cài đặt, cách sử dụng, các lệnh hay dùng và lưu ý.

| Project | Loại | Mô tả | Dùng online |
|---|---|---|---|
| [Agent Office 3D](https://github.com/LeBao2808/agent-office-3d) | Tool | Xem Claude Code làm việc trực tiếp trong văn phòng 3D | — |
| [Claude Pixel BG](https://github.com/LeBao2808/claude-pixel-bg) | Extension | Hình nền pixel-art động cho claude.ai và VS Code | — |
| [Aurora Riverside Hotel](https://github.com/LeBao2808/aurora-hotel) | App | Website khách sạn, kiến trúc microservice | [aurora-hotel-red.vercel.app](https://aurora-hotel-red.vercel.app) |
| [TOEIC Speaking Coach](https://github.com/LeBao2808/learning-english) | App | Luyện nói/viết TOEIC với AI Gemini | [learning-english-xi.vercel.app](https://learning-english-xi.vercel.app) |
| [Ví Của Tôi](https://github.com/LeBao2808/finance-tracker) | App | Quản lý tài sản: chứng khoán, vàng, tiền mặt quy đổi VND | [vi-cua-toi.vercel.app](https://vi-cua-toi.vercel.app) |
| [Làng Phòng Thủ](https://github.com/LeBao2808/village-defense-live) | Game | Game tương tác TikTok LIVE | — |

## Xem

Site là HTML/CSS/JS thuần, không cần build:

- **Mở trực tiếp:** nhấp đúp `index.html`.
- **Qua server:** `npm start` rồi mở http://localhost:5050.
- **GitHub Pages:** push lên GitHub, vào *Settings → Pages → Source: GitHub Actions*. Workflow [.github/workflows/pages.yml](.github/workflows/pages.yml) sẽ deploy mỗi lần push lên `main`.

Phím tắt: `/` để tìm kiếm (gõ không dấu cũng được), `Esc` để xoá tìm kiếm. Trong ảnh phóng to dùng `←` `→` để chuyển ảnh, `Esc` để đóng.

## Thêm project mới

**Cách nhanh (nhờ Claude Code):** mở Claude Code và nói *"ship project &lt;tên thư mục&gt;"*. Skill `ship-project` sẽ làm hết các bước dưới đây: push GitHub, deploy Vercel, chụp ảnh, thêm vào danh mục, chạy kiểm thử và push project-hub.

**Deploy project lên GitHub + Vercel:**

```bash
npm run ship -- <thư-mục>            # vd: npm run ship -- finance-tracker
npm run ship -- <thư-mục> --no-env   # không đẩy .env.local lên Vercel
npm run ship -- <thư-mục> --no-vercel  # chỉ push GitHub (tool / extension / game chạy local)
```

Script [scripts/ship.mjs](scripts/ship.mjs) yêu cầu repo đã commit hết. Nếu repo chưa có remote, script tạo repo GitHub bằng `gh` (cần `winget install GitHub.cli` và `gh auth login` một lần). Sau đó script link project Vercel, đẩy biến trong `.env.local` lên môi trường production, deploy rồi in ra link `repo` và `demo`.

**Thêm vào danh mục (làm tay):**

1. Chạy `npm run scan`. Script quét thư mục cha (`D:\Project`) và liệt kê các repo git chưa có trong danh mục, kèm link remote và ngày commit gần nhất. Script cũng cảnh báo khi một repo có commit mới hơn ngày ghi trong danh mục.
2. Mở [data/projects.js](data/projects.js), copy một khối project có sẵn rồi sửa lại. Các trường:

   | Trường | Ý nghĩa |
   |---|---|
   | `demo`, `demoNote` | Link bản đã deploy (https) và lưu ý khi mở. Có `demo` thì hiện nhãn Online, nút Mở app và mục nổi bật |
   | `slug` | ID trong URL (`#/p/<slug>`), chỉ gồm `a-z 0-9 -` |
   | `category` | `tool`, `extension`, `app` hoặc `game` (thêm loại mới trong `window.CATEGORIES`) |
   | `folder` | Tên thư mục trong `D:\Project` |
   | `accent` | Màu nhấn của project, dạng `#rrggbb` |
   | `cover`, `gallery` | Ảnh trong `assets/<slug>/`. Thêm `portrait: true` cho ảnh dọc |
   | `features`, `quickstart`, `usage`, `commands`, `notes`, `requirements` | Nội dung trang chi tiết. Hỗ trợ `` `code` `` và `**đậm**` |

3. Đặt ảnh vào `assets/<slug>/`. Có thể dùng `npm run shots` để chụp tự động (xem bên dưới).
4. Chạy `npm run check`.
5. Commit và push lên `main`. GitHub Pages tự deploy sau khi test pass.

## Cập nhật ảnh chụp

[scripts/screenshots.mjs](scripts/screenshots.mjs) dùng Playwright để chụp từng app. Ảnh của agent-office-3d được copy từ repo gốc, còn claude-pixel-bg được chụp từ `preview.html`. Ba app còn lại cần chạy server trước:

```bash
cd ../aurora-hotel && npm run dev                      # :3000
cd ../learning-english && npx next dev -p 3101         # :3101
cd ../village-defense-live && PORT=3102 npm run dev    # :3102
npm run shots                                          # hoặc: npm run shots -- aurora-hotel
```

App nào có server chưa chạy thì script sẽ bỏ qua app đó.

## Kiểm thử

| Lệnh | Nội dung |
|---|---|
| `npm test` | Kiểm tra dữ liệu: đủ trường bắt buộc, slug không trùng, link GitHub hợp lệ, mọi ảnh tồn tại |
| `npm run scan` | Báo lỗi nếu trong `D:\Project` có repo chưa được đưa vào danh mục |
| `npm run test:e2e` | Kiểm tra trên trình duyệt (Playwright/Chromium): landing, lọc, tìm kiếm, mọi trang chi tiết, gallery, lightbox, nút copy, mục lục, tag, theme sáng/tối, không tràn ngang trên mobile, chạy được qua `file://`. Ảnh chụp lưu ở `tests-e2e/screens/` |
| `npm run check` | Chạy cả ba lệnh trên |

Lần đầu chạy cần `npm install`. Nếu chưa có Chromium thì chạy thêm `npx playwright install chromium`.

## Cấu trúc

```
index.html            khung trang
styles.css            giao diện (sáng/tối, responsive)
app.js                router (#/, #/c/<loại>, #/tag/<tag>, #/p/<slug>), render, tìm kiếm, lightbox
data/projects.js      toàn bộ nội dung danh mục
assets/<slug>/        ảnh chụp từng project
scripts/              serve, scan, screenshots
tests/                test dữ liệu (node:test)
tests-e2e/            test trình duyệt (Playwright)
```
