# Luyện Viết Chữ Hán 練字

Web game luyện viết chữ Hán theo thứ tự nét bút, thiết kế theo phong cách Duolingo.

**Demo:** https://chinese-writing-game.vercel.app

## Tính năng

- **7 nhóm HSK1** — Số đếm, Con người, Thời gian, Thiên nhiên, Cuộc sống, Động từ, Tính từ & Đại từ
- **87 chữ Hán** theo chuẩn HSK1, kèm pinyin và nghĩa tiếng Việt
- **Luyện viết** — vẽ nét theo đúng thứ tự trên canvas, nhận phản hồi tức thì
- **Xem nét** — animation thứ tự nét bút từng chữ
- **Tô màu nét** — mỗi nét một màu riêng sau khi vẽ đúng
- **Gamification** — XP, cấp độ, streak ngày học, confetti khi hoàn thành
- **Mascot gấu trúc** — phản hồi động lực theo từng tình huống
- **Âm thanh** — SFX bằng Web Audio API (không cần file âm thanh ngoài)
- **Theo dõi tiến độ** — điểm số, thanh tiến độ, chữ đã hoàn thành

## Công nghệ

- Vanilla HTML/CSS/JavaScript — không cần build tool
- [HanziWriter](https://hanziwriter.org) (CDN) — stroke animation & quiz engine
- Deploy: Vercel

## Cấu trúc dữ liệu

```js
GROUPS = [
  { id, label, icon, chars: [{ char, pinyin, meaning, strokes }] }
]
```

## Cấu trúc file

```
chinese-writing-game.html   # HTML chính
css/chinese-writing-game.css  # Toàn bộ styles
js/vocab-groups.js          # Data từ vựng (GROUPS[])
js/app.js                   # Logic game
```

## Chạy local

Mở thẳng file `chinese-writing-game.html` trên trình duyệt — không cần server.

## Lịch sử thay đổi

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
