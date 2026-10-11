# Dương & Ngân · Wedding landing page

Thiệp cưới **Lương Tùng Dương & Võ Thị Thúy Ngân**, ngày **29/11/2026**. Giao diện tiếng Việt, phong thư CSS 3D, ba sắc trời theo giờ thiết bị, bình minh bụi nắng và sao lấp lánh, album chuyển ảnh, lưu RSVP bằng SQLite và duyệt lời chúc. Không có dependency bên ngoài, không gọi dịch vụ trả phí.

## Chạy

Yêu cầu Node.js 24 trở lên.

```bash
cp .env.example .env
# Điền ADMIN_PASSWORD dài, ngẫu nhiên trong .env
node --env-file=.env server.mjs
```

Mở http://127.0.0.1:3000 và http://127.0.0.1:3000/admin. Không có mật khẩu quản trị mặc định. `npm start` dùng biến môi trường đã được thiết lập; lệnh trên đọc `.env` trực tiếp.

```bash
npm test
npm run check
```

## Thay nội dung

- Album: sửa `public/content.json`, thêm ảnh vào `public/`, cập nhật `src`, `alt`, `caption`, đặt `placeholder: false`.
- Tên, ngày, lời mời và thông tin sự kiện: sửa `public/index.html`. Chưa có giờ, địa điểm nên nút chỉ đường/thêm lịch đang tắt.
- Màu và nhịp chuyển động: `public/style.css`; ánh sáng/hạt sao: `public/app.js`.
- Không điền danh sách khách vào `content.json`: tệp này là công khai. Cá nhân hóa bằng mã mời chưa được kích hoạt trong bản đầu.
- Favicon: `public/monogram.svg`. Ảnh album hiện là minh họa vector, không phải ảnh của hai bạn.

## Dữ liệu và triển khai

SQLite lưu trong `DATA_DIR` (mặc định `./data`), phải gắn ổ lưu bền và sao lưu nếu triển khai. Một máy chủ Node đứng sau HTTPS reverse proxy; đặt HOST=0.0.0.0 và SECURE_COOKIE=true khi cần. Không triển khai máy chủ này lên static hosting/GitHub Pages. Giữ repo private. Không commit `.env`, mật khẩu hoặc dữ liệu khách.

Biểu mẫu dùng ID gửi để chống tạo bản ghi trùng khi thử lại; tên trùng vẫn là các khách khác nhau. Quản trị dùng cookie HttpOnly/SameSite, phiên hết hạn sau 8 giờ, giới hạn gửi theo IP kết nối. Khi dùng reverse proxy, cần cấu hình giới hạn tại proxy; không tin tùy ý header IP. CSV có phòng vệ công thức bảng tính. Lời chúc mới chờ duyệt; nội dung được render bằng textContent.

## Phần chưa có / cần bổ sung

- Giờ, địa chỉ, lịch trình, thông tin gia đình và ảnh thật.
- Trình quản trị đã có trình sửa JSON cho tên, ngày, sự kiện, album. Upload ảnh trực tiếp chưa có; đưa ảnh vào repo hoặc dùng URL HTTPS. Nội dung quản trị ghi đè content.json và được lưu trong SQLite.
- Bản thiết kế Figma riêng và video Runway; bản đầu dùng CSS 3D/canvas/native SVG.
- Nhạc (chưa có nguồn được cấp quyền). Link bản đồ/ICS tự bật khi điền dữ liệu sự kiện trong quản trị.
- Ảnh Open Graph và mã QR sau khi có URL chính thức.
- Liên kết mời cá nhân hóa cần API riêng để không công khai danh sách khách.
- Chưa nghiệm thu bằng trình duyệt thật/đo FPS trên điện thoại.

noindex không phải bảo vệ bằng mật khẩu. Repo private cũng không tự bảo vệ một website đã được triển khai. Trước khi phát hành cần quyết định kiểm soát truy cập, cấu hình HTTPS, nơi lưu dữ liệu và thời hạn lưu.
