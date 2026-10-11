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

## GitHub Pages — demo giao diện

Chạy `npm run build:pages` để tạo `docs/`. Trong Settings → Pages, chọn Deploy from a branch → main → /docs → Save. Repo private cần gói GitHub hỗ trợ Pages cho private repos. Không đổi repo thành public chỉ để bật Pages.

Bản Pages chỉ chứa giao diện, minh họa và nội dung công khai. Không chứa trang admin, database hoặc cấu hình bí mật. Các nút gửi RSVP/lời chúc được tắt và ghi rõ không lưu dữ liệu. Máy chủ Node vẫn dùng cho bản có chức năng đầy đủ.

## Typography & scene animation

Tiêu đề dùng Cormorant Garamond, nội dung/biểu mẫu dùng Be Vietnam Pro, tải Google Fonts với display=swap và font dự phòng. CSP cho phép đúng hai miền font. Chuyển động dùng một tiến độ camera liên tục trong `public/camera.mjs`, với tích phân giảm chấn giữ vận tốc khi đổi hướng. Nhân vật giữ rõ nét và chân làm tâm zoom; chữ và vườn có độ sâu riêng. Khung hình giữ nguyên; dùng nút lên/xuống hoặc vuốt dọc vùng trống để đi qua các chương. Giảm chuyển động bỏ các hiệu ứng này. Thanh điều hướng có nét 1 px, chấm nhỏ và vùng chạm rộng.

## Hình minh họa & mỹ thuật

Bản mới dùng tranh màu nước tạo bằng Imagegen: khung cửa bình minh/đôi uyên ương, nhẫn cưới bên hoa và khu vườn đêm. Đây là hình minh họa, không phải ngoại hình thật của Dương & Ngân. Prompt mỹ thuật: editorial watercolor + fine graphite, cotton paper, muted ivory/champagne/sage, delicate botanical details, no text or clipart.

Các asset trong `public/assets/`: `hero-dawn.webp`, `memory-rings.webp`, `memory-night.webp`; nhánh hoa `botanical.svg` và con dấu `wax-seal.svg` được vẽ bằng vector. Phong thư và thẻ giấy dùng nếp gấp, đường viền mảnh, bóng sáng mềm. WebP chỉ chuyển định dạng ảnh gốc, không thay nội dung hình. Bản Pages sao chép các asset này vào `docs/assets/`.

## Cảnh theo chiều sâu và búp bê

Khung nhìn giữ nguyên trong một cú máy mô phỏng liên tục: tiến độ từ 0 đến 5 điều khiển zoom nhân vật, chiều sâu vườn và hòa nội dung. Các dáng búp bê chuyển sau chữ một nhịp; không vẽ lại vòm giữa các chặng. Nút **Xem như phim** tự trôi qua các chặng trong khoảng 50 giây. Chạm, cuộn hoặc lấy focus trong biểu mẫu sẽ dừng phim; rời tab cũng dừng. Có thể xem tiếp, kéo tiến độ hoặc chuyển từng chặng bằng nút. Điều khiển bằng nút lên/xuống, wheel, phím lên/xuống hoặc vuốt dọc vùng trống. Các cảnh không hoạt động dùng inert và aria-hidden. Nội dung dài vẫn cuộn bên trong cảnh để không mất thông tin; nhập biểu mẫu không kích hoạt chuyển cảnh.

Cặp búp bê xuất hiện liên tục ở một vùng riêng, dùng atlas 3 cột × 2 hàng (`public/assets/couple-poses.webp`), sáu dáng thống nhất trang phục/ngoại hình: nắm tay, tựa vai, cùng cầm hoa, vẫy chào, tạo tim, cúi cảm ơn. Đây là nhân vật minh họa, không phải ngoại hình thật. Tạo bằng Imagegen với nền trong suốt; các dáng hòa chuyển khi đổi cảnh. Giảm chuyển động tắt zoom và hòa chuyển.

## Phối cảnh

Các cảnh dùng cùng vùng chữ và vùng nội dung chính, đồng nhất điểm nhìn theo tâm vùng nội dung. Desktop phóng lớn cặp búp bê trong khu vườn, nhấn sáng nhân vật và giữ tâm zoom ở chân. Điện thoại đặt cặp búp bê ở giữa dải riêng phía dưới; vùng chữ và biểu mẫu nằm phía trên, không che nhân vật. Tranh minh họa nằm trong album. Màn hình thấp cho phép cuộn nội bộ cảnh để tránh cắt nội dung. Album/thẻ thông tin dùng cùng trục căn và bỏ góc nghiêng ngẫu nhiên. Zoom chuyển cảnh giảm để giữ cảm giác chiều sâu mà không phóng chữ quá mạnh.
