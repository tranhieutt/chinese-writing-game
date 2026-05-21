# Nhật ký thay đổi (Changelog) - Luyện Viết Chữ Hán

Tất cả các thay đổi và tiến độ phát triển của dự án Luyện Viết Chữ Hán sẽ được cập nhật chi tiết tại đây.

---

## [1.1.0] - 2026-05-21

### Thêm mới (Added)
- **Hệ thống Gamification & Chỉ số cá nhân**:
  - Tích hợp thanh cấp độ (Level) và điểm kinh nghiệm (XP) lưu trực tiếp vào `localStorage`.
  - Cơ chế tính chuỗi ngày học tập liên tiếp (Streak 🔥) tự động khi tải trang và gia tăng khi hoàn thành chữ viết đầu tiên trong ngày.
  - Mỗi nét bút viết chính xác cộng `+10 XP`, hoàn thành chữ cộng `+100 XP` kèm theo điểm thưởng hiệu suất (trừ dần theo số lỗi sai).
- **Bộ tổng hợp âm thanh (Web Audio API SFX)**:
  - Tạo âm thanh phản hồi trực quan mà không cần file audio tải ngoài (chạy 100% offline).
  - Các âm thanh bao gồm: Nốt cao vui vẻ khi viết đúng nét, âm trầm rè báo hiệu viết sai, và hợp âm arpeggio thăng hoa khi viết xong chữ hoặc lên cấp.
  - Bổ sung nút bật/tắt âm thanh (Loa) ở header để tôn trọng lựa chọn của người dùng.
- **Linh vật Gấu Trúc tương tác (Mascot 🐼)**:
  - Vẽ linh vật bằng SVG nội tuyến sắc nét, hoạt họa nhấp nhô nhẹ nhàng.
  - Bong bóng hội thoại hiển thị các câu nói ngẫu nhiên chào mừng, hướng dẫn khi xem trước, động viên khi viết sai nét, khen ngợi khi viết đúng nét và chúc mừng khi hoàn thành bài học.
- **Hiệu ứng Pháo hoa giấy (Confetti Canvas 🎉)**:
  - Canvas chồng lấp tự động kích hoạt hiệu ứng bắn pháo hoa giấy rực rỡ khi hoàn thành viết xong một từ vựng.
- **Bảng hướng dẫn cách chơi (Help Modal)**:
  - Nút bấm `❓ Hướng dẫn` mở popup giải thích chi tiết 5 bước học tập kèm mờ nền (backdrop blur).

### Thay đổi (Changed)
- Cập nhật file giao diện chính `chinese-writing-game.html` và file phong cách `css/chinese-writing-game.css` để hỗ trợ hệ thống hiển thị chỉ số, linh vật, nút loa, nút hướng dẫn, canvas confetti và modal.

---

## [1.0.0] - 2026-05-21

### Thêm mới (Added)
- Phân tách file đơn khối cũ (monolith) thành 3 module rõ ràng để dễ bảo trì:
  - `css/chinese-writing-game.css` quản lý toàn bộ giao diện và phong cách thiết kế Duolingo cổ điển.
  - `js/vocab-groups.js` đóng vai trò là cơ sở dữ liệu từ vựng chia theo chủ đề và cấu hình bảng màu nét viết.
  - `js/app.js` điều khiển logic cốt lõi và giao tiếp với thư viện `HanziWriter`.
- Thiết lập trạng thái bảo vệ (Guarding states) cho các nút bấm:
  - Các nút `Xem nét`, `Luyện viết` và các nút chọn từ/chủ đề sẽ tự động bị vô hiệu hóa (disabled) khi đang chạy hoạt họa hoặc đang trong chế độ kiểm tra viết để tránh chồng chéo luồng hoạt động.
- Viết cơ chế phản ứng thời gian thực sử dụng `MutationObserver` để lắng nghe thay đổi các phần tử SVG nét bút của `HanziWriter`, tự động tô màu sắc rực rỡ tương ứng cho từng nét bút sau khi viết đúng. Loại bỏ hoàn toàn vòng lặp thời gian `setInterval` cũ gây hao tổn tài nguyên.
