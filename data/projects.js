/*
 * Danh mục project. Thêm project mới: copy một khối bên dưới, sửa nội dung,
 * đặt ảnh vào assets/<slug>/, rồi chạy `npm run check`.
 *
 * Project đã deploy: thêm `demo: "https://..."` (và `demoNote` nếu cần lưu ý).
 * Site sẽ tự hiện nhãn "Online", nút mở bản chạy thật và đưa project lên mục nổi bật.
 *
 * File này là script thường (không phải ES module) để index.html mở được
 * trực tiếp bằng file:// mà không cần server.
 */
window.CATEGORIES = [
  { id: "tool", label: "Tool", icon: "🛠️", desc: "Công cụ cho lập trình viên, chạy ở máy của bạn" },
  { id: "extension", label: "Extension", icon: "🧩", desc: "Tiện ích cho trình duyệt và VS Code" },
  { id: "app", label: "App", icon: "📱", desc: "Ứng dụng web hoàn chỉnh" },
  { id: "game", label: "Game", icon: "🎮", desc: "Game tương tác" },
];

window.PROJECTS = [
  {
    slug: "agent-office-3d",
    name: "Agent Office 3D",
    tagline: "Xem Claude Code làm việc trực tiếp trong một văn phòng 3D.",
    category: "tool",
    accent: "#f97316",
    status: "Hoạt động",
    updated: "2026-11-04",
    repo: "https://github.com/LeBao2808/agent-office-3d",
    folder: "agent-office-3d",
    stack: ["TypeScript", "Three.js", "Vite", "Node.js", "Vitest", "Playwright"],
    tags: ["Claude Code", "hooks", "3D", "visualization", "CLI"],
    cover: "assets/agent-office-3d/live.png",
    gallery: [
      { src: "assets/agent-office-3d/live.png", caption: "Chế độ Live: Claude ở giữa, sub-agent ngồi ở các bàn" },
      { src: "assets/agent-office-3d/coding.png", caption: "Tab Code hiển thị file vừa được Write / Edit" },
      { src: "assets/agent-office-3d/office-2d.png", caption: "Mặt bằng 2D: mỗi tool có một phòng riêng" },
      { src: "assets/agent-office-3d/2d-follow.png", caption: "Bấm vào một người để camera đi theo" },
    ],
    summary:
      "Mỗi prompt bạn giao cho Claude Code, mỗi lần gọi tool (Read, Grep, Edit, Bash…) và mỗi sub-agent được tạo ra đều hiện lên thành robot ngồi ở bàn, gói giao việc bay qua lại, timeline dạng Gantt, log và code đang được viết. Dữ liệu lấy từ Claude Code hooks và chỉ gửi tới một server nội bộ trên máy bạn.",
    features: [
      "Văn phòng 3D (Three.js): Claude ở giữa, mỗi sub-agent (Explore, Plan, agent tuỳ chỉnh…) có bàn riêng",
      "Mặt bằng 2D: nhân viên đi tới đúng phòng theo tool đang dùng (kho tài liệu, phòng server, phòng QA, thư viện…), tìm đường bằng A*",
      "Timeline Gantt, log sự kiện và tab Code hiển thị file vừa sửa",
      "Theo dõi nhiều phiên Claude Code cùng lúc, có dropdown để ghim một phiên",
      "Chế độ Demo phát lại mô phỏng, không cần Claude Code",
      "Bảo mật: chỉ nghe 127.0.0.1, chặn DNS rebinding, không gửi CORS header, dữ liệu chỉ nằm trong RAM",
    ],
    requirements: ["Node.js 18+", "Claude Code"],
    quickstart: [
      { label: "Cài hooks (chỉ làm một lần)", code: "npx agent-office-3d install" },
      { label: "Mở viewer → http://localhost:4317", code: "npx agent-office-3d" },
    ],
    usage: [
      {
        title: "Bắt đầu",
        steps: [
          "Chạy `npx agent-office-3d install` để thêm hooks vào `~/.claude/settings.json` (có file `.bak` sao lưu).",
          "Chạy `npx agent-office-3d`, trình duyệt sẽ mở http://localhost:4317.",
          "Dùng Claude Code như bình thường ở bất kỳ project nào. Các phiên mới sẽ báo về viewer; phiên đang mở sẵn thì cần khởi động lại.",
        ],
      },
      {
        title: "Điều khiển",
        steps: [
          "3D: kéo chuột để xoay, cuộn để zoom, chuột phải kéo để di chuyển.",
          "Bấm vào robot hoặc tên trong danh sách để camera bay tới; bấm ⌂ để quay về.",
          "Nút 3D / 2D trên thanh trên cùng để đổi chế độ (hoặc thêm `?view=2d` vào URL).",
          "Nút ⛶ ẩn các bảng bên để xem toàn màn hình.",
        ],
      },
      {
        title: "Gỡ cài đặt",
        steps: ["Chạy `npx agent-office-3d uninstall` để gỡ hooks khỏi settings."],
      },
    ],
    commands: [
      { cmd: "npx agent-office-3d install --project", desc: "Chỉ cài hooks cho project hiện tại (.claude/settings.local.json)" },
      { cmd: "npx agent-office-3d --port 5000", desc: "Đổi cổng (truyền cùng giá trị cho cả install và start)" },
      { cmd: "npx agent-office-3d --no-open", desc: "Không tự mở trình duyệt" },
      { cmd: "npm run dev", desc: "Dev: Vite :5173, proxy sang bridge" },
      { cmd: "npm run check", desc: "Build + unit test + e2e" },
    ],
    notes: [
      "Prompt và code bạn viết trong Claude Code sẽ hiển thị cho bất kỳ ai mở được localhost:4317 trên máy bạn.",
      "Tải lại trang sẽ dựng lại văn phòng từ 3000 sự kiện gần nhất mà server còn giữ.",
    ],
  },

  {
    slug: "claude-pixel-bg",
    name: "Claude Pixel BG",
    tagline: "Hình nền pixel-art động cho claude.ai và Claude Code trong VS Code.",
    category: "extension",
    accent: "#a855f7",
    status: "Hoạt động",
    updated: "2026-11-09",
    repo: "https://github.com/LeBao2808/claude-pixel-bg",
    folder: "claude-pixel-bg",
    stack: ["JavaScript", "Canvas", "Manifest V3", "VS Code API"],
    tags: ["Claude", "pixel art", "theme", "browser extension", "VS Code"],
    cover: "assets/claude-pixel-bg/gallery.jpg",
    gallery: [{ src: "assets/claude-pixel-bg/gallery.jpg", caption: "15 cảnh, tất cả vẽ bằng code, không dùng file ảnh" }],
    summary:
      "Một engine pixel-art dùng chung cho hai nơi: extension trình duyệt cho claude.ai (Chrome, Edge, Cốc Cốc, Brave…) và extension VS Code cho Claude Code (cũng chạy trên Cursor, Windsurf). Có 15 cảnh động, từ Night City, Synthwave đến Sakura Hill, Koi Pond.",
    features: [
      "15 cảnh: 8 tối (Night City, Deep Space, Synthwave, Aurora Peaks…) và 7 sáng (Sakura Hill, Tropical Beach, Koi Pond…)",
      "Lớp tĩnh vẽ một lần + lớp động mỗi frame, render trên canvas độ phân giải thấp rồi phóng to kiểu pixel",
      "Hai chế độ: Phía sau (đẹp nhất) và Phủ lên (dự phòng khi claude.ai đổi CSS)",
      "Chỉnh cường độ, cỡ pixel, bật/tắt hoạt ảnh, FPS 8/12/24; tự dừng khi tab bị ẩn",
      "Phím tắt Alt+Shift+B đổi sang cảnh tiếp theo",
      "Bản VS Code tự áp dụng lại khi Claude Code cập nhật, gỡ ra thì file trả về nguyên bản từng byte",
    ],
    requirements: ["Node.js 18+ (để build)", "Chrome / Edge hoặc VS Code có Claude Code"],
    quickstart: [
      { label: "Build extension (.vsix và .zip vào dist/)", code: "node scripts/build.js" },
      { label: "Cài vào VS Code", code: "code --install-extension dist/claude-pixel-bg-1.1.0.vsix" },
    ],
    usage: [
      {
        title: "Trên claude.ai (trình duyệt)",
        steps: [
          "Mở `chrome://extensions` (hoặc `edge://extensions`).",
          "Bật **Developer mode**.",
          "Bấm **Load unpacked** và chọn thư mục `browser-extension/`.",
          "Mở claude.ai, bấm biểu tượng ▣ trên thanh công cụ và chọn cảnh. Thay đổi áp dụng ngay.",
        ],
      },
      {
        title: "Trong VS Code (Claude Code)",
        steps: [
          "Cài file `.vsix` (hoặc Extensions → … → Install from VSIX…).",
          "Bấm **Mở gallery** trong thông báo hiện ra, chọn cảnh rồi **Reload Window**.",
          "Mục **🎨 tên cảnh** trên status bar mở lại gallery.",
          "Command Palette (Ctrl+Shift+P) → `Claude Pixel BG: …` để chọn nền, đổi cảnh, bật, tắt, áp dụng lại.",
        ],
      },
      {
        title: "Dùng CLI, không cần cài extension",
        steps: [
          "`node vscode-extension/cli.js list` xem danh sách cảnh.",
          "`node vscode-extension/cli.js apply --theme synthwave --intensity 0.7` để áp dụng.",
          "`node vscode-extension/cli.js remove` để gỡ.",
        ],
      },
    ],
    commands: [
      { cmd: "node scripts/build.js", desc: "Copy code dùng chung, tạo icon, đóng gói vào dist/" },
      { cmd: "node scripts/test.js", desc: "Test patcher và render thử mọi cảnh" },
      { cmd: "npm run install:vscode", desc: "Build rồi cài thẳng vào VS Code" },
      { cmd: "open preview.html", desc: "Xem tất cả cảnh trong trình duyệt" },
    ],
    notes: [
      "Sửa code trong `shared/` rồi chạy build để copy sang cả hai extension.",
      "Settings VS Code: `claudePixelBg.theme`, `mode`, `intensity`, `pixelSize`, `animate`, `fps`.",
    ],
  },

  {
    slug: "aurora-hotel",
    name: "Aurora Riverside Hotel",
    tagline: "Website khách sạn 5 sao: đặt phòng, room service, thanh toán, kiến trúc microservice.",
    category: "app",
    accent: "#c8a165",
    status: "Online",
    updated: "2026-11-08",
    repo: "https://github.com/LeBao2808/aurora-hotel",
    demo: "https://aurora-hotel-red.vercel.app",
    demoNote:
      "Backend chạy trên gói miễn phí của Render, ngủ sau 15 phút không dùng. Lần đầu mở có thể mất khoảng 1 phút thì đặt phòng / thanh toán mới hoạt động.",
    folder: "aurora-hotel",
    stack: ["Next.js 16", "TypeScript", "Tailwind v4", "Node.js microservices", "Docker", "Vercel + Render"],
    tags: ["microservice", "booking", "payment", "saga", "full-stack"],
    cover: "assets/aurora-hotel/home.jpg",
    gallery: [
      { src: "assets/aurora-hotel/home.jpg", caption: "Landing page với ô tìm phòng" },
      { src: "assets/aurora-hotel/rooms.jpg", caption: "Danh sách phòng & suite" },
      { src: "assets/aurora-hotel/dining.jpg", caption: "Gọi món room service" },
      { src: "assets/aurora-hotel/system.jpg", caption: "Trang trạng thái hệ thống" },
    ],
    summary:
      "Website khách sạn (demo) gồm landing page, tìm và đặt phòng, gọi món room service, thanh toán bằng thẻ hoặc ví điện tử, tra cứu và huỷ đặt phòng, trang trạng thái hệ thống. Frontend Next.js gọi API Gateway, phía sau là 3 service độc lập: phòng, ẩm thực, thanh toán.",
    features: [
      "Tìm phòng theo ngày, báo giá, giữ phòng 15 phút, chống overbooking",
      "Room service: thực đơn, giỏ hàng, giá tính ở server, ETA chuẩn bị",
      "Thanh toán thẻ (kiểm tra Luhn, hạn, CVC) và ví MoMo / ZaloPay / VNPay mô phỏng",
      "Idempotency key, khoá chống trả tiền hai lần, tự hoàn tiền khi xác nhận thất bại (saga)",
      "API Gateway: định tuyến theo prefix, chặn /internal/*, rate-limit, health tổng hợp",
      "Không lưu số thẻ, chỉ lưu brand + 4 số cuối; mỗi service có kho dữ liệu riêng",
    ],
    requirements: ["Node.js ≥ 20.9 (khuyến nghị 22 LTS)", "Docker Desktop (tuỳ chọn)"],
    quickstart: [
      { label: "Cài đặt (root + apps/web)", code: "npm install" },
      { label: "Chạy 4 service + Next → http://localhost:3000", code: "npm run dev" },
    ],
    usage: [
      {
        title: "Chạy trên máy",
        steps: [
          "`npm install` rồi `npm run dev` (bản dev) hoặc `npm run build && npm start` (bản production).",
          "Mở http://localhost:3000. Health của gateway: http://127.0.0.1:4000/api/health.",
          "Hoặc dùng Docker: `docker compose up --build`.",
        ],
      },
      {
        title: "Thử luồng đặt phòng & thanh toán",
        steps: [
          "Chọn ngày nhận / trả phòng ở trang chủ, bấm **Tìm phòng**, chọn một phòng và đặt.",
          "Ở bước thanh toán dùng thẻ thử `4242 4242 4242 4242` (thành công), hạn bất kỳ trong tương lai, CVC 3 số.",
          "`4000 0000 0000 0002` sẽ bị từ chối, `4000 0000 0000 9995` báo không đủ số dư.",
          "Vào **Tra cứu đặt phòng** để xem hoặc huỷ đơn.",
        ],
      },
      {
        title: "Deploy (Vercel + Render)",
        steps: [
          "Render → New → Blueprint → chọn repo; `render.yaml` tạo 4 service và tự sinh `INTERNAL_TOKEN`.",
          "Vercel → Add New Project → Root Directory `apps/web` → thêm biến `GATEWAY_URL` trỏ tới gateway trên Render.",
          "Gói miễn phí của Render ngủ sau 15 phút và reset dữ liệu khi khởi động lại.",
        ],
      },
    ],
    commands: [
      { cmd: "npm test", desc: "Typecheck services + 27 test tích hợp + unit test web" },
      { cmd: "npm run e2e", desc: "Dựng toàn bộ stack thật và kiểm tra mọi trang" },
      { cmd: "npm run test:ui", desc: "Test trình duyệt (puppeteer-core), cần stack đang chạy" },
      { cmd: "npm run test:all", desc: "test + build + e2e" },
    ],
    notes: [
      "Số tiền luôn lấy từ service sở hữu (room/dining), không tin số tiền client gửi.",
      "`services/` là TypeScript chạy thẳng qua tsx, không có bước build.",
    ],
  },

  {
    slug: "learning-english",
    name: "TOEIC Speaking Coach",
    tagline: "Luyện nói và viết TOEIC với giám khảo AI (Google Gemini).",
    category: "app",
    accent: "#4f5bd5",
    status: "Online",
    updated: "2026-11-02",
    repo: "https://github.com/LeBao2808/learning-english",
    demo: "https://learning-english-xi.vercel.app",
    folder: "learning-english",
    stack: ["Next.js 16", "React 19", "Tailwind v4", "Google Gemini", "Web Speech API"],
    tags: ["AI", "TOEIC", "education", "speech recognition"],
    cover: "assets/learning-english/home.jpg",
    gallery: [
      { src: "assets/learning-english/home.jpg", caption: "Trang chủ" },
      { src: "assets/learning-english/speaking.jpg", caption: "Chọn dạng câu hỏi Speaking" },
      { src: "assets/learning-english/writing.jpg", caption: "Luyện Writing 8 câu" },
      { src: "assets/learning-english/tips.jpg", caption: "Mẹo thi" },
    ],
    summary:
      "Website luyện thi TOEIC Speaking & Writing: nói qua micro với đồng hồ đếm giờ như thi thật, AI chấm theo rubric ETS, sửa lỗi và đưa bài mẫu. Có chấm phát âm từ file ghi âm và phần Writing với đề do AI tạo.",
    features: [
      "Speaking 11 câu: 5 dạng câu hỏi ETS + trò chuyện tự do, đếm giờ như thi thật",
      "AI chấm theo rubric, sửa lỗi và đưa bài mẫu",
      "Chấm phát âm: điểm độ chính xác, trôi chảy, ngữ điệu, liệt kê từ đọc sai kèm IPA",
      "Writing 8 câu: xem cấu trúc, mẫu câu, bài mẫu; AI ra đề mới và chấm từng tiêu chí",
      "Mẹo thi: chiến lược từng dạng câu, mẫu câu ghi điểm, lỗi người Việt hay mắc",
      "Tự chuyển sang model dự phòng khi Gemini quá tải (503)",
    ],
    requirements: ["Node.js 20+", "GEMINI_API_KEY", "Chrome hoặc Edge (nhận diện giọng nói)", "Tai nghe (khuyến nghị)"],
    quickstart: [
      { label: "Cài đặt", code: "npm install" },
      { label: "Tạo file môi trường, rồi điền GEMINI_API_KEY", code: "cp .env.example .env" },
      { label: "Chạy → http://localhost:3000", code: "npm run dev" },
    ],
    usage: [
      {
        title: "Luyện Speaking",
        steps: [
          "Mở trang **Speaking**, chọn một dạng câu hỏi.",
          "Cho phép trình duyệt dùng micro. Khi đồng hồ bắt đầu, nói câu trả lời.",
          "Đọc phần chấm điểm, lỗi đã sửa và bài mẫu; có thể làm lại ngay.",
        ],
      },
      {
        title: "Luyện Writing",
        steps: [
          "Mở trang **Writing**, chọn task.",
          "Xem cấu trúc, mẫu câu và bài mẫu trước, sau đó để AI ra đề mới.",
          "Nộp bài để nhận điểm theo tiêu chí, danh sách lỗi và bản viết lại.",
        ],
      },
      {
        title: "Deploy lên Vercel",
        steps: [
          "Import repo trên vercel.com/new (Next.js được nhận diện tự động).",
          "Thêm biến môi trường `GEMINI_API_KEY`.",
          "Deploy; mỗi lần push lên `main` sẽ tự deploy lại.",
        ],
      },
    ],
    commands: [
      { cmd: "npm run dev", desc: "Chạy dev server" },
      { cmd: "npm run build && npm start", desc: "Bản production" },
      { cmd: "npm run lint", desc: "ESLint" },
    ],
    notes: [
      "`GEMINI_MODEL` mặc định `gemini-flash-latest`; `GEMINI_FALLBACK_MODEL` mặc định `gemini-flash-lite-latest`.",
      "Chấm phát âm trong chế độ hội thoại chỉ là ước lượng dựa trên bản chép lời.",
      "Firefox / Safari hỗ trợ nhận diện giọng nói hạn chế; khi đó vẫn có thể gõ câu trả lời.",
    ],
  },

  {
    slug: "finance-tracker",
    name: "Ví Của Tôi",
    tagline: "Quản lý tài sản cá nhân: chứng khoán, vàng, tiền mặt, quy đổi ra VND theo giá hiện tại.",
    category: "app",
    accent: "#8b5cf6",
    status: "Online",
    updated: "2026-11-12",
    repo: "https://github.com/LeBao2808/finance-tracker",
    demo: "https://vi-cua-toi.vercel.app",
    demoNote:
      "Bản online chứa dữ liệu cá nhân nên được khoá bằng mật khẩu. Muốn dùng thử, hãy clone repo và chạy trên máy của bạn.",
    folder: "finance-tracker",
    stack: ["Next.js 15", "React 19", "TypeScript", "Tailwind v4", "MongoDB / Mongoose", "Recharts", "DNSE OpenAPI"],
    tags: ["finance", "chứng khoán", "vàng", "portfolio", "dashboard"],
    cover: "assets/finance-tracker/dashboard.jpg",
    gallery: [
      { src: "assets/finance-tracker/dashboard.jpg", caption: "Tổng quan: tổng tài sản, cơ cấu và từng danh mục" },
      { src: "assets/finance-tracker/stocks.jpg", caption: "Danh mục cổ phiếu với giá trực tuyến từ DNSE" },
      { src: "assets/finance-tracker/gold.jpg", caption: "Vàng đang giữ và bảng giá vàng hôm nay" },
      { src: "assets/finance-tracker/transactions.jpg", caption: "Lịch sử giao dịch và dòng vốn theo tháng" },
    ],
    summary:
      "Ghi lại các lần mua bán cổ phiếu, vàng và nạp rút tiền, app tự tính số đang nắm giữ, giá vốn bình quân, lãi lỗ và tổng tài sản quy ra VND theo giá thị trường. Giá cổ phiếu lấy từ DNSE OpenAPI, giá vàng từ vang.today (SJC, PNJ, DOJI, Bảo Tín…), tỷ giá từ Vietcombank.",
    features: [
      "Tổng tài sản quy đổi VND, lãi/lỗ, thay đổi trong ngày và biểu đồ cơ cấu 3 danh mục",
      "Chứng khoán: từng mã với khối lượng, giá vốn TB, giá hiện tại, giá trị, lãi/lỗ, tỷ trọng; tổng cộng cả danh mục",
      "Vàng: định giá theo giá mua vào của tiệm, nhập theo lượng hoặc chỉ, có bảng giá vàng hôm nay",
      "Tiền mặt & ngoại tệ theo từng tài khoản, quy đổi theo tỷ giá Vietcombank",
      "Giá vốn bình quân gia quyền, ghi nhận lãi/lỗ đã chốt khi bán",
      "Biểu đồ dòng vốn 12 tháng và tăng trưởng tài sản theo ngày",
      "Tự điền giá hiện tại khi nhập lệnh; chặn bán vượt số đang có và mã không tồn tại",
      "Nguồn giá lỗi thì dùng giá gần nhất đã lưu trong MongoDB",
    ],
    requirements: ["Node.js 20+", "MongoDB (Atlas hoặc local)", "DNSE API key + secret"],
    quickstart: [
      { label: "Cài đặt", code: "npm install" },
      { label: "Tạo file môi trường, rồi điền MONGODB_URI và DNSE_API_KEY / DNSE_API_SECRET", code: "cp .env.example .env.local" },
      { label: "Chạy → http://localhost:3000", code: "npm run dev" },
    ],
    usage: [
      {
        title: "Thêm tài sản",
        steps: [
          "Vào **Chứng khoán**, **Vàng** hoặc **Tiền mặt**, bấm **Thêm giao dịch**.",
          "Chọn Mua/Bán (hoặc Nạp/Rút), nhập mã và số lượng; giá hiện tại được điền sẵn, sửa lại nếu giá khớp khác.",
          "Dùng nút `+` / `−` cạnh từng dòng để mua thêm hoặc bán nhanh.",
        ],
      },
      {
        title: "Xem tổng quan",
        steps: [
          "Trang **Tổng quan** cộng giá trị của cả 3 danh mục theo giá hiện tại, tự làm mới mỗi phút.",
          "Trang **Giao dịch** lọc theo danh mục, tìm theo mã hoặc ghi chú, sửa hoặc xoá giao dịch.",
        ],
      },
      {
        title: "Deploy lên Vercel",
        steps: [
          "Chạy `npx vercel link`, rồi thêm các biến trong `.env.example` bằng `npx vercel env add` (nhớ đặt `APP_PASSWORD`).",
          "Trên MongoDB Atlas, vào **Network Access** và cho phép `0.0.0.0/0` (Vercel không có IP cố định).",
          "Chạy `npx vercel deploy --prod`.",
        ],
      },
    ],
    commands: [
      { cmd: "npm run dev", desc: "Chạy dev server" },
      { cmd: "npm run build && npm start", desc: "Bản production" },
      { cmd: "npm run lint", desc: "ESLint" },
    ],
    notes: [
      "Giá DNSE trả về theo nghìn đồng; app đã nhân 1.000 để ra VND.",
      "Đặt `APP_PASSWORD` trên bản deploy để khoá app bằng mật khẩu (HTTP Basic Auth); chạy local không đặt thì không cần đăng nhập.",
      "DNSE có thể chặn request từ server nước ngoài; khi đó app dùng giá cổ phiếu gần nhất đã lưu.",
      "`package.json` có `overrides.magic-string` để Tailwind v4 chạy được trên Node < 20.19.",
    ],
  },

  {
    slug: "village-defense-live",
    name: "Làng Phòng Thủ",
    tagline: "Game tương tác TikTok LIVE: người xem thả tim, bình luận, tặng quà để bảo vệ làng.",
    category: "game",
    accent: "#d6402b",
    status: "Hoạt động",
    updated: "2026-11-02",
    repo: "https://github.com/LeBao2808/village-defense-live",
    folder: "village-defense-live",
    stack: ["Next.js 15", "TypeScript", "Canvas 2D", "WebSocket", "tiktok-live-connector"],
    tags: ["TikTok LIVE", "livestream", "OBS", "interactive", "Đông Hồ"],
    cover: "assets/village-defense-live/battle.jpg",
    portrait: true,
    gallery: [
      { src: "assets/village-defense-live/battle.jpg", caption: "Thánh Gióng xuất trận khi có quà lớn", portrait: true },
      { src: "assets/village-defense-live/lobby.jpg", caption: "Màn hình chờ với hướng dẫn chơi", portrait: true },
      { src: "assets/village-defense-live/admin.jpg", caption: "Trang /admin: kết nối TikTok, giả lập, điều khiển ván" },
    ],
    summary:
      "Game chạy trên máy streamer rồi đưa lên sóng qua OBS hoặc TikTok LIVE Studio, khung dọc 1080×1920. Người xem cùng bảo vệ làng quê Việt Nam khỏi yêu tinh, hồ ly, mãng xà. Đồ hoạ phong cách tranh Đông Hồ, vẽ hoàn toàn bằng Canvas.",
    features: [
      "Vào phòng → tạo dân làng mang nickname; thả tim → ném gậy tre vào quái",
      "Comment có chữ `skill` → Trống đồng sát thương diện rộng (hồi chiêu 30s)",
      "Quà nhỏ hồi máu làng, quà vừa gọi lính đánh thuê, quà lớn (≥100 💎) gọi Thánh Gióng",
      "Chia sẻ → cả làng tăng sức tấn công ×1.5 trong 15 giây",
      "Độ khó tự cân bằng theo tốc độ thả tim của cả phòng",
      "Màn vinh danh cuối ván: sát thương cao nhất, tặng quà nhiều nhất, tham gia bền bỉ nhất",
      "Chế độ giả lập để thử game không cần LIVE, hỗ trợ tải nặng (hàng trăm người xem)",
    ],
    requirements: ["Node.js 20.9+", "OBS Studio hoặc TikTok LIVE Studio", "Tài khoản TikTok đang LIVE (khi phát thật)"],
    quickstart: [
      { label: "Cài đặt", code: "npm install" },
      { label: "Tạo cấu hình, điền TIKTOK_USERNAME", code: "cp .env.example .env" },
      { label: "Bản tối ưu khi đi LIVE", code: "npm run build && npm start" },
    ],
    usage: [
      {
        title: "Chạy thử bằng giả lập (không cần LIVE)",
        steps: [
          "Chạy server, mở http://localhost:3000/admin và http://localhost:3000/game cạnh nhau.",
          "Ở /admin, khung **🧪 Giả lập**, bấm **Bật giả lập**.",
          "Bấm các nút tạo sự kiện: 👋 Người vào, ❤️ Tim, ⚡ skill, 🌹 / 🎩 / 🐉 Quà, 🔁 Chia sẻ.",
          "Bấm **▶ Bắt đầu** ở khung **🎮 Điều khiển ván**. Muốn thử tải nặng thì bấm **Chạy tự động**.",
        ],
      },
      {
        title: "Kết nối TikTok LIVE",
        steps: [
          "Bắt đầu phát LIVE trên TikTok trước.",
          "Ở /admin, khung **📡 TikTok LIVE**, kiểm tra username rồi bấm **Kết nối**.",
          "Nếu mất kết nối, server tự thử lại sau 3s, 6s, 12s… (tối đa 60s).",
        ],
      },
      {
        title: "Đưa lên sóng bằng OBS",
        steps: [
          "Sources → + → Browser, URL `http://localhost:3000/game` (thêm `?transparent=1` để nền trong suốt).",
          "Width 1080, Height 1920, FPS 60; canvas OBS cũng đặt dọc 1080×1920.",
          "Bỏ chọn “Shutdown source when not visible” và “Refresh browser when scene becomes active” để không mất ván.",
        ],
      },
    ],
    commands: [
      { cmd: "npm run dev", desc: "Chạy khi đang sửa code" },
      { cmd: "npm run build && npm start", desc: "Bản production, mượt nhất khi LIVE" },
      { cmd: "npm run typecheck", desc: "Kiểm tra kiểu TypeScript" },
      { cmd: "/game?fps=1", desc: "Hiện FPS trên màn hình game" },
      { cmd: "/game?theme=tet", desc: "Đổi skin (sau khi đăng ký theme mới)" },
    ],
    notes: [
      "Trạng thái ván nằm trong trang /game: tải lại (F5) trang này sẽ bắt đầu lại ván.",
      "Bị giới hạn khi kết nối TikTok thì thêm `SIGN_API_KEY` (Euler Stream) vào `.env`.",
      "Thông số game nằm trong `config/game.config.ts`, phần lớn chỉnh được trực tiếp trên /admin.",
    ],
  },
];
