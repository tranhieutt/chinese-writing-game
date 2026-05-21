# Spec: Từ vựng theo nhóm chủ đề

## Overview
Mở rộng game luyện viết chữ Hán từ 15 chữ phẳng lên ~48 chữ được tổ chức thành 4 nhóm chủ đề. Người dùng chọn nhóm qua tab UI, selector chữ cập nhật theo nhóm đang chọn.

## Data Model

```js
GROUPS = [
  {
    id: string,          // "nature" | "people" | "numbers" | "time"
    label: string,       // tên hiển thị tiếng Việt
    icon: string,        // emoji icon
    chars: CharEntry[]
  }
]

CharEntry = {
  char: string,    // ký tự Hán (1 chữ)
  pinyin: string,  // phiên âm có dấu
  meaning: string, // "emoji Nghĩa tiếng Việt"
  strokes: number  // số nét
}
```

## 4 nhóm và từ vựng

| Nhóm | id | ~12 chữ |
|---|---|---|
| 🌿 Thiên nhiên | nature | 日月山水火木土石天地風雲 |
| 👨‍👩‍👧 Con người & Gia đình | people | 人口手目耳心父母子女兄妹 |
| 🔢 Số đếm | numbers | 一二三四五六七八九十百千 |
| 🕐 Thời gian | time | 年月日時分秒週今昨明早晚 |

## Business Rules

- Khi load trang: nhóm đầu tiên (nature) được active mặc định
- Khi click tab nhóm:
  - Tab đó trở thành active (xóa active khỏi tab cũ)
  - Selector chữ re-render chỉ với chars[] của nhóm mới
  - Reset về chữ đầu tiên của nhóm mới (selectChar(0))
  - Reset writer, mode, overlay — giống như đổi chữ bình thường
- Score (nét đúng, lần thử, chữ học) **không** reset khi đổi nhóm — tích lũy toàn session
- `completedChars` Set vẫn track theo từng chữ riêng lẻ, không phân biệt nhóm

## Acceptance Criteria

- [ ] 4 tab nhóm hiển thị phía trên selector chữ, mỗi tab có icon + tên + số chữ
- [ ] Click tab → selector chữ cập nhật đúng chữ của nhóm đó
- [ ] Chữ đầu tiên của nhóm được chọn tự động sau khi đổi nhóm
- [ ] Tab active highlight bằng màu sky-blue (nhất quán với design system)
- [ ] Luyện viết, xem nét, làm lại hoạt động bình thường sau khi đổi nhóm
- [ ] Score không bị reset khi đổi nhóm

## Out-of-Scope

- Không lưu nhóm đang chọn vào localStorage (session only)
- Không có animation chuyển nhóm
- Không thêm chức năng quiz toàn nhóm / mode ôn tập
- Không thay đổi logic luyện viết, scoring, SVG coloring
