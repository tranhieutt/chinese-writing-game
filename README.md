# Luyện Viết Chữ Hán 練字

Web game luyện viết chữ Hán theo thứ tự nét bút, thiết kế theo phong cách Duolingo.

**Demo:** https://chinese-writing-game.vercel.app

## Tính năng

- **10 nhóm chủ đề HSK1** — Số đếm, Đại từ, Con người, Thời gian, Địa điểm, Ăn uống, Đồ vật, Động từ, Tính chất, Thiên nhiên
- **400+ chữ Hán HSK 1, 2, 3** — 22 nhóm chủ đề phong phú mở rộng, bao phủ kho từ vựng HSK đa dạng kèm pinyin và nghĩa tiếng Việt
- **Luyện viết** — vẽ nét theo đúng thứ tự trên canvas, nhận phản hồi tức thì
- **Xem nét** — animation thứ tự nét bút từng chữ
- **Tô màu nét** — mỗi nét một màu riêng sau khi vẽ đúng
- **🎯 Luyện ngẫu nhiên tính giờ** — Chế độ đấu tính giờ (3/5/7 từ ngẫu nhiên Fisher-Yates), đếm giờ khung gỗ, hạt ngọc bích tiến độ emerald/gold, mascost panda và thưởng XP tốc độ
- **Gamification** — XP, cấp độ, streak ngày học, confetti khi hoàn thành
- **Mascot gấu trúc** — phản hồi động lực theo từng tình huống
- **Âm thanh** — SFX bằng Web Audio API (không cần file âm thanh ngoài)
- **Theo dõi tiến độ** — điểm số, thanh tiến độ, chữ đã hoàn thành
- **🍪 Cookie Consent Banner** — Biểu ngữ cookie cổ phong tích hợp Google Analytics Consent Mode bảo mật quyền riêng tư
- **🚀 Tối ưu hóa SEO** — Open Graph images, Robots.txt, Sitemap.xml tự động và canonical URL chuẩn chỉ
- **📱 SPA Landing Page** — Trang landing page SPA mượt mà sử dụng Next.js Link điều hướng siêu tốc

## Công nghệ

- **Next.js 16** + **React 19** + **TypeScript**
- [HanziWriter](https://hanziwriter.org) — stroke animation & quiz engine
- Tailwind CSS — utility-first styling
- Deploy: Vercel

## Cấu trúc dữ liệu

```ts
interface Group {
  id: string;
  label: string;
  icon: string;
  chars: { char: string; pinyin: string; meaning: string; strokes: number }[];
}
```

## Cấu trúc file

```
src/
  app/
    page.tsx                  # Trang game chính
    layout.tsx                # Root layout + fonts
    globals.css               # Global styles & design tokens
    robots.ts                 # Cấu hình robots động cho SEO
    sitemap.ts                # Khởi tạo sitemap XML động
    practice/
      page.tsx                # Trang Luyện tập ngẫu nhiên tính giờ
      practice.css            # Stylesheet cổ phong trang luyện tập
    landing/
      page.tsx                # Landing page giới thiệu game
      landing.css             # Stylesheet cho landing page
    providers/
      ProgressProvider.tsx    # Context XP / streak / progress
  components/
    HanziCanvas.tsx           # Canvas vẽ nét (HanziWriter wrapper)
    MascotPanda.tsx           # Mascot gấu trúc SVG
    StatsPanel.tsx            # Header stats (XP, level, streak)
    ScoreStrip.tsx            # Điểm nét đúng / lần thử
    GroupTabs.tsx             # Tab chọn nhóm chủ đề
    CharacterSelector.tsx     # Selector chữ Hán
    CookieBanner.tsx          # Cookie Consent Banner cổ phong
  hooks/
    useLocalStorage.ts        # Persistent state hook
    useAudio.ts               # Web Audio API SFX hook
tests/
  e2e/
    practice.spec.ts          # E2E test cho chế độ Luyện tập
    hsk.spec.ts               # E2E test cho HSK selector
    mobile.spec.ts            # E2E test cho hiển thị mobile
public/
  data/vocabulary.json        # Data chữ Hán (GROUPS[])
```

## Chạy local

```bash
npm install
npm run dev
# Mở http://localhost:3000
```

## Lịch sử thay đổi

### v1.3 — Chế độ Luyện tập Ngẫu nhiên Tính giờ & Playwright E2E (2026-05-25)
- **Trang Luyện tập mới `/practice`**: Chế độ chơi ngẫu nhiên 3, 5, 7 từ HSK (thuật toán Fisher-Yates) có đồng hồ đếm giờ khung gỗ cổ điển và hạt ngọc tiến trình.
- **Auto-advance & Skip**: Viết đúng chữ tự động phát âm và chuyển chữ sau 800ms, có nút Skip nhảy nhanh và phần thưởng XP tốc độ.
- **Playwright E2E Tests**: Tích hợp kịch bản kiểm thử E2E tự động toàn diện `tests/e2e/practice.spec.ts` (vượt qua thành công 100% trong 2.8 giây sử dụng LocalStorage Script bypass Cookie banner).
- **Cập nhật Landing Page**: Bổ sung thông tin Luyện tập tính giờ, nâng cấp giới thiệu lên 400+ từ HSK 1-3 và chuyển sang Next.js Link điều hướng SPA.

### v1.2 — Từ vựng HSK 2/3 mở rộng, SEO nâng cao & Cookie Banner (2026-05-25)
- **Mở rộng kho từ vựng**: Bổ sung nhóm "Bộ phận cơ thể" (HSK1), "Màu sắc" (HSK2), "Thiên nhiên & Bốn mùa" (HSK3) nâng quy mô lên 400+ chữ Hán.
- **Sửa lỗi ký tự phồn thể**: Thay thế ký tự phồn thể `興` thành giản thể chuẩn `兴` tránh lỗi HanziWriter CDN load nét vẽ.
- **Tối ưu SEO**: Tích hợp metadata Open Graph, Twitter Cards, robots.ts động, sitemap.xml động và canonical URL.
- **Cookie Consent Banner**: Component Cookie Banner mực tàu giấy dó xin phép sử dụng cookie tích hợp Google Analytics Consent Mode.

### v1.1 — Cải thiện analytics & dropdown HSK level (2026-05-24)
- Inline `GA_TRACKING_ID` từ env var `NEXT_PUBLIC_GA_ID` trong layout.tsx — bỏ dependency vào analytics utils
- Thêm dropdown chọn cấp độ HSK (HSK 1/2/3) với localStorage persistence

### v1.0 — Fix nhận nét vẽ trên mobile (2026-05-23)
- Tăng `leniency` HanziWriter từ 1.0 lên 1.8 cho thiết bị touch — nét vẽ đúng nhưng hơi lệch vẫn được ghi nhận
- Tăng `drawingWidth` từ 6 lên 10 cho mobile — cải thiện độ nhận diện ngón tay
- Thêm `highlightOnComplete: false` — giữ màu rainbow mỗi nét sau khi vẽ đúng, không bị reset
- Thêm `touch-action: none` cho SVG và canvas con do HanziWriter tạo — ngăn scroll page khi vẽ

### v0.9 — Bug fixes & type safety (2026-05-23)
- Fix bug `markCharComplete` stale closure: `isNew` luôn trả `false` → XP +100 cho chữ mới không chạy
- Fix SVG `stroke-width` → `strokeWidth` (JSX) trong MascotPanda và feedback modal
- Fix `useEffect` missing deps trong HanziCanvas: wrap callbacks với `useCallback`
- Fix `updateStreak` dangling function: inline logic vào useEffect, xóa khỏi context interface
- Fix `Array<any>` → `Character[]` type trong GroupTabs

### v0.8 — Port sang Next.js + React + TypeScript (2026-05-23)
- Migration từ Vanilla HTML/CSS/JS sang Next.js 16 + React 19 + TypeScript
- Tách thành các component độc lập: HanziCanvas, MascotPanda, StatsPanel, ScoreStrip, GroupTabs, CharacterSelector
- Thêm ProgressProvider (Context API) quản lý XP, level, streak, completedChars
- Hooks tái sử dụng: useLocalStorage, useAudio
- Cập nhật vercel.json: `framework: nextjs`
- Thêm .gitignore entries cho Next.js build artifacts

### v0.7 — Fix scroll chuột trên desktop (2026-05-22)
- Sửa lỗi không scroll được bằng chuột khi con trỏ nằm trên vùng canvas chữ Hán
- Nguyên nhân: `html` element là scrolling container, HanziWriter chặn wheel event trước khi bubble lên
- Fix: tách `html` / `body` — `html` không scroll, `body` scroll tự nhiên

### v0.6 — Vocabulary: Full HSK1 source coverage (2026-05-21)
- Thêm nguồn `docs/vocabulary/hsk1-classic-150.md` cho HSK1 classic 150 words
- Trích 178 chữ Hán unique từ source HSK1 và bổ sung đủ vào `GROUPS[]`
- Tăng từ 87 lên 189 chữ active (178 chữ HSK1 + 11 legacy extras)
- Verify toàn bộ 189 chữ có `hanzi-writer-data@2.0.1` và stroke count khớp CDN

### v0.5 — UX: Bố cục lại button Xem nét & Luyện viết (2026-05-21)
- Di chuyển button "Xem nét" và "Luyện viết" sang 2 bên khung chữ viết
- Button nằm ngang, height 44px, đồng bộ design system watercolor ink-wash
- Không cần cuộn lên/xuống để thao tác các chức năng chính

### v0.4 — Gamification & Bug fixes (2026-05-21)
- Thêm hệ thống XP, cấp độ, streak ngày học
- Mascot gấu trúc SVG với phrases phản hồi động
- SFX bằng Web Audio API (correct/wrong/complete)
- Confetti animation khi hoàn thành chữ
- Fix bug XP cố định → XP thay đổi theo độ chính xác (100 - lỗi × 10)
- Fix confettiCanvas init sau khi DOM sẵn sàng
- Tách code thành file riêng: html / css / js

### v0.3 — Tái cấu trúc HSK1 (2026-05-21)
- Tái cấu trúc toàn bộ từ vựng theo chuẩn HSK1
- Tăng từ 48 lên 87 chữ, 7 nhóm chủ đề
- Tách code thành 3 file riêng (html/css/js)

### v0.2 — Nhóm chủ đề (2026-05-21)
- Mở rộng từ 15 lên 48 chữ Hán
- Thêm 4 nhóm chủ đề: Thiên nhiên, Con người, Số đếm, Thời gian
- UI tab chọn nhóm phía trên selector chữ

### v0.1 — Phiên bản đầu tiên
- 15 chữ Hán cơ bản
- Luyện viết, xem nét, làm lại
- Thiết kế Duolingo-style
