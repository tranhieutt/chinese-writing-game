# Nhật ký thay đổi (Changelog) - Luyện Viết Chữ Hán

Tất cả các thay đổi và tiến độ phát triển của dự án Luyện Viết Chữ Hán sẽ được cập nhật chi tiết tại đây.

---

## [1.4.0] - 2026-05-21

### Thay đổi (Changed)
- **Bố cục lại button Xem nét & Luyện viết**: Di chuyển 2 button chính sang 2 cột bên trái/phải của khung chữ viết — người dùng không cần cuộn màn hình để thao tác.
- **Đồng bộ design**: Button dùng màu watercolor ink-wash (`blueprint-soft` cho Xem nét, `celadon-soft` cho Luyện viết), border `2px solid ink`, box-shadow 3D — nhất quán với toàn bộ design system.
- **Kích thước chuẩn**: height 44px, padding `0 14px`, font 12px/800 weight — touch-friendly, không quá to cũng không quá nhỏ.

---

## [1.3.1] - 2026-05-21

### Sửa lỗi (Fixed)
- **Sửa nút điều hướng bị méo trên Desktop**: Chuyển các thuộc tính ép cứng độ rộng `46px` và triệt tiêu padding của `.btn-nav` xuống phần truy vấn di động `@media (max-width: 480px)`. Trên Desktop, nút tự động co giãn bình thường và hiển thị nhãn chữ đầy đủ.
- **Kích hoạt cuộn dọc thông minh**: Chuyển đổi `.container` từ `overflow: hidden` sang `overflow-y: auto` và nới lỏng `overflow` của `body`. Khi màn hình không đủ độ cao, người dùng có thể cuộn dọc mượt mà để nhấn các nút điều khiển, không lo bị cắt cụt UI.
- **Tự động resize canvas vẽ (HanziWriter)**: Bổ sung trình lắng nghe sự kiện `resize` (có debounce) của cửa sổ trình duyệt. Khi co giãn cửa sổ hoặc xoay ngang/dọc thiết bị di động, tọa độ canvas được tự động cập nhật đồng bộ, tránh hoàn toàn lỗi lệch nét vẽ của chữ.
- **Nghĩa của từ hiển thị đầy đủ trên Mobile**: Nới rộng `max-width` của `.char-meaning` lên `120px` và cho phép tự động xuống dòng trên thiết bị di động thay vì bị cắt cụt bằng dấu ba chấm.

## [1.3.0] - 2026-05-21

### Thêm mới (Added)
- **Đồng bộ trạng thái vào Bong bóng thoại Mascot**:
  - Loại bỏ hoàn toàn hộp trạng thái `#status-box` rời rạc cũ.
  - Đồng bộ mọi chỉ dẫn và trạng thái phản hồi trực tiếp vào bong bóng thoại Mascot `#mascot-bubble` và `#mascot-text`.
  - Bong bóng thoại của Gấu Trúc tự động thay đổi phong cách viền, nền, bóng đổ theo trạng thái trò chơi: Chờ (`status-idle`), Luyện viết (`status-quiz`), Vẽ đúng (`status-correct`), Vẽ sai (`status-wrong`) và Hoàn thành (`status-complete`).

### Thay đổi (Changed)
- **Thiết kế Giao diện Một Màn hình Không Cuộn Dọc (Single-screen Viewport Layout UX)**:
  - Khóa cuộn dọc toàn trang web trên cả di động và máy tính bằng `height: 100dvh; overflow: hidden;` giúp giao diện luôn cố định trong khung hình.
  - Tối giản Header thành một hàng ngang duy nhất (`.header-main-row`), ẩn phụ đề trên thiết bị di động để tối ưu không gian hiển thị.
  - Thay thế bảng điểm số cồng kềnh cũ bằng dải điểm số nằm ngang siêu gọn `.score-strip` nằm ngay dưới thanh chọn từ.
  - Gộp thông tin chữ Hán và khu vực Mascot nằm cạnh nhau trên cùng một hàng ngang `.main-card-top-row`.
  - Tích hợp 5 nút bấm điều khiển và điều hướng (Chữ trước, Xem nét, Luyện viết, Làm lại, Chữ sau) thành một thanh công cụ (Toolbar) duy nhất trong `.controls`.
  - Trên thiết bị di động nhỏ, nhãn chữ nút bấm (`.btn-text`) sẽ tự động ẩn đi thông qua CSS để thanh công cụ hiển thị gọn gàng trên một hàng mà không bị xuống dòng.
  - Canvas vẽ chữ tự động co giãn linh hoạt bằng đơn vị tỉ lệ `vh/vw` (`min(290px, 36vh)` trên máy tính và `min(220px, 35vh)` trên di động) để đảm bảo không bị tràn màn hình trên các thiết bị di động ngắn như iPhone SE.

## [1.2.0] - 2026-05-21

### Thêm mới (Added)
- **Hệ thống điều hướng Từ trước - Từ tiếp theo (Previous/Next Characters)**:
  - Thêm cụm nút `.nav-controls` (`⬅️ Chữ trước` và `Chữ sau ➡️`) ở dưới card chính giúp di chuyển dễ dàng qua lại giữa các chữ trong cùng một nhóm chủ đề.
  - Thêm nút `Chữ tiếp theo ➡️` (`.btn-complete-next`) nổi bật kèm hiệu ứng nhấp nháy động bên trong overlay ăn mừng khi viết xong từ, cho phép chuyển từ nhanh.
  - Tự động cuộn mượt (`activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })`) nút từ tương ứng trên thanh chọn chữ nằm ngang vào giữa màn hình khi chuyển từ.
  - Vô hiệu hóa (disable) các nút điều hướng khi đang trong trạng thái xem nét vẽ (Preview) hoặc đang viết (Quiz) để bảo toàn trạng thái game.

### Thay đổi (Changed)
- **Tối ưu hóa phản hồi & Giao diện trên Di động (Mobile Optimization)**:
  - Cài đặt `overscroll-behavior: none` ngăn trình duyệt giật/bouncing hoặc tự động reload trang khi vuốt quá tay trên màn hình điện thoại di động.
  - Khóa cử chỉ chạm kéo trên canvas bằng `touch-action: none !important` và loại bỏ chọn văn bản (`user-select: none`), giúp nét viết bằng ngón tay không bị trôi lệch khung hình.
  - Chuyển đổi các danh sách chọn chủ đề (`.group-tabs`) và danh sách chữ chọn viết (`.char-selector`) sang thanh cuộn ngang mượt mà (momentum scroll), tiết kiệm tối đa diện tích màn hình di động.
  - Loại bỏ độ trễ phản hồi nút nhấn 300ms bằng `touch-action: manipulation`.

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
