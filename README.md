# Luyện Viết Chữ Hán 練字

Web game luyện viết chữ Hán theo thứ tự nét bút, thiết kế theo phong cách Duolingo.

**Demo:** https://chinese-writing-game.vercel.app

## Tính năng

- **4 nhóm chủ đề** — Thiên nhiên, Con người & Gia đình, Số đếm, Thời gian
- **48 chữ Hán** với pinyin và nghĩa tiếng Việt
- **Luyện viết** — vẽ nét theo đúng thứ tự trên canvas, nhận phản hồi tức thì
- **Xem nét** — animation thứ tự nét bút từng chữ
- **Tô màu nét** — mỗi nét một màu riêng sau khi vẽ đúng
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

## Chạy local

Mở thẳng file `chinese-writing-game.html` trên trình duyệt — không cần server.

## Lịch sử thay đổi

### v0.2 — Nhóm chủ đề (2026-05-21)
- Mở rộng từ 15 lên 48 chữ Hán
- Thêm 4 nhóm chủ đề: Thiên nhiên, Con người, Số đếm, Thời gian
- UI tab chọn nhóm phía trên selector chữ

### v0.1 — Phiên bản đầu tiên
- 15 chữ Hán cơ bản
- Luyện viết, xem nét, làm lại
- Thiết kế Duolingo-style
