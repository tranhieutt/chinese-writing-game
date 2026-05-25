# Báo cáo Phân tích Rủi ro Hiệu năng (Performance Risk Report)

**Dự án:** Chinese Writing Game (Game Luyện Viết Chữ Hán)  
**Ngày cập nhật:** 24/05/2026  
**Người thực hiện:** Antigravity  

Báo cáo này đã được cập nhật dựa trên phân tích kỹ thuật chuyên sâu về hành vi thực tế của `HanziWriter` và thuộc tính CSS của SVG.

---

## Danh sách Rủi ro Hiệu năng Phát hiện

| ID | Độ nghiêm trọng | Vị trí phát hiện | Tên rủi ro | Trạng thái |
| :--- | :---: | :--- | :--- | :--- |
| **PR-01** | **Thấp (Low)** | `js/app.js`<br>`src/components/HanziCanvas.tsx` | Mã dư thừa và vòng lặp MutationObserver không cần thiết | Chưa khắc phục |
| **PR-02** | **Trung bình (Medium)** | `js/app.js` | Sự kiện resize canvas không được debounce | Chưa khắc phục |
| **PR-03** | **Thấp (Low)** | Hệ thống tải dữ liệu | Phụ thuộc hoàn toàn vào CDN bên ngoài | Chưa khắc phục |

---

## Chi tiết các Rủi ro & Hướng khắc phục

### PR-01: Mã dư thừa và vòng lặp MutationObserver không cần thiết

#### 1. Nguyên nhân kỹ thuật thực tế
Để tô màu cho các nét vẽ đúng, ban đầu ứng dụng sử dụng phương pháp thay đổi thuộc tính SVG `stroke` bằng `path.setAttribute('stroke', color)`. Tuy nhiên, do `HanziWriter` thường xuyên cập nhật lại thuộc tính này khi vẽ hoặc thực hiện hoạt ảnh, thuộc tính cũ sẽ bị ghi đè. Để khắc phục điều đó, `MutationObserver` đã được triển khai nhằm lắng nghe thay đổi và áp dụng lại màu sắc.

Vòng lặp MutationObserver chỉ xuất hiện khi chế độ quiz hoặc hoạt ảnh đang chạy đồng thời với dữ liệu nét vẽ đã được lưu trong `strokeColorMap` (sau nét đầu tiên). Ngoài ra, điều kiện bảo vệ `if (Object.keys(strokeColorMap).length === 0)` đã hạn chế vòng lặp này khi trò chơi ở trạng thái chờ ban đầu.

#### 2. Giải pháp tối ưu (Loại bỏ MutationObserver)
Theo cơ chế ưu tiên (specificity) của CSS, các thuộc tính kiểu dáng khai báo trực tiếp dưới dạng **inline style** (`element.style.stroke`) luôn có độ ưu tiên cao hơn các thuộc tính biểu diễn thuộc về SVG (SVG presentation attributes như `stroke="..."`).

`HanziWriter` chỉ cập nhật các thuộc tính biểu diễn SVG của phần tử `<path>` mà không can thiệp hay xóa bỏ thuộc tính `style.stroke` dạng inline. Do đó, nếu chuyển từ việc gán thuộc tính `setAttribute('stroke', ...)` sang gán inline style:
```javascript
path.style.stroke = color;
```
Trình duyệt sẽ luôn ưu tiên áp dụng màu sắc khai báo trong inline style. Điều này giúp loại bỏ hoàn toàn sự cần thiết của `MutationObserver`, giảm bớt mã nguồn dư thừa và triệt tiêu hoàn toàn mọi nguy cơ rủi ro hiệu năng liên quan đến việc giám sát DOM.

##### Mã nguồn tối ưu trong `js/app.js` (Loại bỏ MutationObserver)
*   **Xóa bỏ hoàn toàn**: Hàm `initStrokeObserver()`, biến `strokeObserver` và việc gọi khởi tạo observer trong `initWriter()`.
*   **Cập nhật hàm áp dụng màu**:
```javascript
function applyAllStrokeColors() {
  const paths = getMainStrokePaths();
  if (!paths || paths.length === 0) return;

  Object.entries(strokeColorMap).forEach(([idx, color]) => {
    const path = paths[parseInt(idx)];
    if (!path) return;
    path.style.stroke = color; // Sử dụng inline style thay vì setAttribute
  });
}
```

##### Mã nguồn tối ưu trong `src/components/HanziCanvas.tsx` (Loại bỏ MutationObserver)
*   **Xóa bỏ hoàn toàn**: Lô-gích liên quan đến `strokeObserverRef` trong hiệu ứng khởi tạo và dọn dẹp.
*   **Cập nhật hàm áp dụng màu**:
```typescript
  const applyAllStrokeColors = () => {
    const paths = getMainStrokePaths();
    if (!paths || paths.length === 0) return;

    Object.entries(strokeColorMapRef.current).forEach(([idx, color]) => {
      const path = paths[parseInt(idx)];
      if (!path) return;
      path.style.stroke = color; // Sử dụng inline style thay vì setAttribute
    });
  };
```

---

### PR-02: Sự kiện resize canvas không được debounce

#### 1. Nguyên nhân kỹ thuật
Khi người dùng thay đổi kích thước cửa sổ trình duyệt hoặc xoay hướng màn hình điện thoại di động, sự kiện `resize` sẽ được bắn ra liên tục. Trong file `js/app.js`, sự kiện này trực tiếp gọi hàm thay đổi kích thước canvas của hiệu ứng hoa giấy:

```javascript
window.addEventListener('resize', () => {
  resizeConfettiCanvas(); // Gọi trực tiếp không qua trì hoãn (debounce)
  resizeHanziWriter();    // Đã được debounce 150ms
});
```

Hàm `resizeConfettiCanvas` thay đổi trực tiếp kích thước vật lý của canvas:
```javascript
function resizeConfettiCanvas() {
  if (confettiCanvas) {
    confettiCanvas.width = confettiCanvas.parentElement.clientWidth;
    confettiCanvas.height = confettiCanvas.parentElement.clientHeight;
  }
}
```
Việc thay đổi `width` và `height` của canvas buộc trình duyệt phải tính toán lại kích thước hiển thị và vẽ lại (reflow/repaint) liên tục khi đang co giãn màn hình, gây hiện tượng giật lag khung hình.

#### 2. Giải pháp khắc phục
Đưa việc thay đổi kích thước canvas confetti vào bên trong hàm `resizeHanziWriter` để cùng hưởng cơ chế debounce 150ms.

Sửa đổi đoạn mã đăng ký sự kiện và cấu trúc hàm resize:
```javascript
window.addEventListener('resize', () => {
  resizeHanziWriter();
});

let resizeWriterTimeout;
function resizeHanziWriter() {
  clearTimeout(resizeWriterTimeout);
  resizeWriterTimeout = setTimeout(() => {
    // Gọi thay đổi kích thước canvas confetti cùng lúc sau khi trì hoãn
    resizeConfettiCanvas(); 

    if (writer && typeof HanziWriter !== 'undefined') {
      const size = getWriterSize();
      writer.updateDimensions({ width: size.width, height: size.height });
      const svg = document.querySelector('#hanzi-container svg');
      if (svg) {
        svg.setAttribute('width', size.width);
        svg.setAttribute('height', size.height);
      }
    }
  }, 150);
}
```

---

### PR-03: Phụ thuộc hoàn toàn vào mạng CDN bên ngoài

#### 1. Nguyên nhân kỹ thuật
Dự án không lưu trữ thư viện `HanziWriter` hoặc dữ liệu nét chữ Hán (.json) ở môi trường máy chủ cục bộ. Toàn bộ các tài nguyên này được tải động từ các địa chỉ CDN như `cdn.jsdelivr.net` hoặc `unpkg.com` ở mỗi lượt chọn từ.

> [!NOTE]  
> Rủi ro xảy ra khi mạng internet của thiết bị đầu cuối bị gián đoạn, kết nối chậm hoặc khi các CDN trên gặp sự cố kỹ thuật. Trò chơi sẽ không tải được dữ liệu nét vẽ và vô hiệu hóa các nút điều khiển chính.

#### 2. Giải pháp khắc phục
*   Tải trực tiếp mã nguồn thư viện `hanzi-writer` và tích hợp vào dự án thay vì tham chiếu qua thẻ `<script>` trỏ tới CDN ngoài.
*   Thiết lập một Service Worker để lưu trữ cục bộ các tệp JSON dữ liệu nét của các từ vựng thuộc danh sách HSK thường gặp, hỗ trợ chế độ chơi ngoại tuyến (offline mode).
