# Product Requirements Document — Luyện Viết Chữ Hán

**Version:** 0.2  
**Cập nhật:** 2026-05-21  
**Deploy:** https://gametiengtrung-cyan.vercel.app  
**Repo:** https://github.com/tranhieutt/chinese-writing-game

---

## 1. Overview

Web game luyện viết chữ Hán theo đúng thứ tự nét bút, hướng đến người Việt học tiếng Trung. Giao diện thiết kế theo phong cách Duolingo, chạy hoàn toàn trên trình duyệt không cần cài đặt.

**Stack:** Vanilla HTML/CSS/JS · HanziWriter (CDN) · Vercel

---

## 2. Người dùng mục tiêu

Người Việt đang học tiếng Trung, muốn luyện viết chữ Hán đúng thứ tự nét — từ người mới bắt đầu đến HSK2.

---

## 3. Tính năng hiện có (v0.2)

### 3.1 Nhóm chủ đề từ vựng

- **4 nhóm:** 🌿 Thiên nhiên · 👨‍👩‍👧 Con người · 🔢 Số đếm · 🕐 Thời gian
- **48 chữ Hán tổng cộng** (~12 chữ/nhóm)
- Tab chọn nhóm hiển thị icon + tên + số chữ
- Đổi nhóm → selector chữ cập nhật, tự chọn chữ đầu nhóm mới

### 3.2 Luyện viết (Quiz mode)

- Vẽ từng nét trên canvas 280×280px có lưới 田字格
- Phản hồi tức thì: đúng (✅) / sai (❌) kèm số nét hiện tại
- Mỗi nét đúng tô một màu riêng (10 màu luân phiên theo phong cách Trung Hoa cổ điển)
- Dot indicator hiển thị nét nào đang cần vẽ (pulse animation)

### 3.3 Xem nét (Preview mode)

- Animation thứ tự nét bút từng chữ qua HanziWriter
- Chạy tuần tự, có delay 200ms giữa các nét

### 3.4 Thông tin chữ

- Chữ Hán lớn (76px), pinyin có dấu, nghĩa tiếng Việt kèm emoji
- Badge số nét của chữ đang chọn
- Selector chữ dạng grid button, mỗi button hiện chữ Hán + nghĩa ngắn

### 3.5 Theo dõi điểm số (session)

- **Nét đúng** — tổng số nét vẽ đúng trong session
- **Lần thử** — tổng số lần vẽ (kể cả sai)
- **Chữ học** — số chữ đã hoàn thành (không trùng lặp)
- Score không reset khi đổi nhóm, chỉ reset khi tải lại trang

### 3.6 Giao diện

- Thiết kế Duolingo-style phủ lên design system "phác thảo Trung Hoa" (ink sketch)
- Background gradient + grid pattern, header có dashed border
- Responsive: mobile tối thiểu 320px, canvas co theo viewport
- Font: Noto Serif SC (chữ Hán) + Nunito Sans (UI)

---

## 4. Cấu trúc dữ liệu

```js
GROUPS = [
  {
    id: string,       // "nature" | "people" | "numbers" | "time"
    label: string,    // tên tiếng Việt
    icon: string,     // emoji
    chars: [
      { char, pinyin, meaning, strokes }
    ]
  }
]
```

---

## 5. Acceptance Criteria hiện tại

- [x] 4 tab nhóm hiển thị đúng, click chuyển nhóm mượt
- [x] 48 chữ load được stroke data từ CDN (có fallback)
- [x] Luyện viết nhận diện đúng/sai theo từng nét
- [x] Mỗi nét đúng tô màu riêng trên SVG
- [x] Score tích lũy xuyên suốt session
- [x] Hoạt động trên mobile (min 320px)
- [x] Deploy Vercel, route `/` → `chinese-writing-game.html`

---

## 6. Backlog — Tính năng dự kiến mở rộng

| Ưu tiên | Tính năng | Mô tả |
|---|---|---|
| P1 | Lưu tiến độ (localStorage) | Ghi nhớ chữ đã thuộc, streak ngày |
| P1 | Mở rộng từ vựng HSK1 | Tăng lên ~150 chữ, thêm nhóm |
| P2 | Chế độ ôn tập nhóm | Quiz toàn bộ chữ trong một nhóm liên tiếp |
| P2 | Flashcard / nhận dạng nghĩa | Đoán nghĩa hoặc pinyin không cần vẽ |
| P3 | Âm thanh phát âm | Text-to-speech pinyin khi chọn chữ |
| P3 | Bảng xếp hạng / gamification | Streak, XP, level theo HSK |

---

## 7. Out-of-Scope (hiện tại)

- Tài khoản người dùng / đăng nhập
- Backend / database
- App mobile native
- Nội dung tiếng Anh
