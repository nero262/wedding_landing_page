# Dương & Ngân · Wedding landing page

Thiệp cưới **Lương Tùng Dương & Võ Thị Thúy Ngân**, ngày **29/11/2026**. Giao diện tiếng Việt, phong thư CSS 3D, ba sắc trời chọn theo giờ thiết bị khi mở trang, bình minh bụi nắng và sao lấp lánh, album chuyển ảnh, lưu RSVP bằng SQLite và duyệt lời chúc. Không có dependency bên ngoài, không gọi dịch vụ trả phí.

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

## Kiểu chữ và hành trình máy quay

Cormorant Garamond cho tên/tiêu đề, Be Vietnam Pro cho nội dung tiếng Việt và biểu mẫu; Google Fonts dùng display=swap, có font dự phòng. Trang cuộn tài liệu tự nhiên, không ghim nội dung, không chặn wheel/touch/phím cuộn và không tự nhảy đến cảnh tiếp theo. Nền là một thế giới phối cảnh nhiều lớp, tính theo vị trí cuộn.

`public/camera.mjs` định nghĩa bảy điểm dừng: khung cửa trong phòng → lời mời → album → lễ cưới → hồi âm → lưu bút → vòm hoa. Khi bất kỳ phần nào của tấm thiệp còn trong khung nhìn, máy quay giữ nguyên. Chỉ các khoảng trống giữa thiệp làm máy tiến/lùi. Đường cong quintic làm vận tốc và gia tốc về 0 ở đầu/cuối từng đoạn. Mọi trạng thái là hàm của vị trí cuộn nên cuộn ngược đi đúng đường cũ. Phòng mở rộng qua hai mép và tan hết trước khi nhân vật chuyển từ hiên về góc.

`public/landscape.mjs` dựng phối cảnh bằng phép chiếu các mặt phẳng trong tọa độ 3D: chín lớp đồi ở chín độ sâu, cây, hồ, vòm hoa, khung cửa có chiều sâu và bóng. Cửa đầu dùng chính đường cong trong SVG vòm cuối, giữ tỷ lệ 600×800. Chòm sao D & N bám theo tọa độ vòm và nằm phía trên nhân vật trong chế độ Đêm sao. Đây là hiệu ứng 3D bằng phép chiếu canvas/CSS, không phải mô hình nhân vật 3D có xương chuyển động.

Khách điều khiển hoàn toàn bằng cuộn tài liệu, nút trước/sau hoặc thanh tiến độ. Không có tự chạy và không can thiệp wheel/touch/phím cuộn. Thanh tiến độ đi liên tục theo chiều dài tài liệu; nút trước/sau đặt tấm thiệp dưới header. Giảm chuyển động hòa chuyển giữa hai khung hình tĩnh kế tiếp và rút ngắn khoảng nối, không bay qua không gian.

### Nhịp dựng và góc máy đã chỉnh

1. Mở phong thư với giấy kem, dập nổi, ruy băng và con dấu; mặt giấy nở vào đúng hình học cửa phòng qua một đoạn chuyển cùng sắc sáng. Sau đó giữ một cảnh toàn qua cửa vòm. Hai người đứng trên cùng mặt hiên, đủ lớn trên điện thoại.
2. Máy tiến qua cửa trước; hai người giữ nguyên vị trí màn hình đến khi phòng tan hoàn toàn. Sau đó mới lùi nhẹ vào chiều sâu và chuyển sang góc, nhường chỗ cho lời mời.
3. Hành trình qua thung lũng đi theo một vòng lượn nhẹ, không đảo trục trái/phải liên tục. Chín lớp đồi, cây, hồ và vòm được vẽ theo đúng thứ tự độ sâu. Con đường cong nhẹ men bên trái hồ dẫn mắt tới vòm; thung lũng rộng và thoải. Cây tới sát mép khung ở Album, bờ hồ mở ra tại Lễ cưới, rồi cây và hồ khuất phía sau trước cảnh Hồi âm. Vòm lớn dần suốt hành trình.
4. Máy dừng suốt khoảng thời gian bất kỳ phần nào của thiệp còn xuất hiện. Chỉ khoảng trắng làm máy chạy; đường chân trời không nghiêng. Ánh sao, bụi nắng và cường độ sáng đều bám tiến độ máy, không chạy theo thời gian nên cảnh đọc và biểu mẫu đứng yên hoàn toàn. Sắc trời tự động được chọn khi mở trang, không tự đổi giữa lúc khách viết.
5. Nhân vật đổi dáng giữa đoạn máy chạy, dưới một nhịp blur ngắn 0–6–0 px. Mỗi thời điểm chỉ hiện một dáng để tránh hai khuôn mặt chồng nhau. Vị trí và kích thước tiếp tục chuyển mềm, cuộn ngược dựng lại đúng trạng thái cũ.
6. Thiệp cuối cuộn ra hẳn, để lại cảnh toàn trước vòm hoa cùng tỷ lệ, vị trí mặt đất và trục giữa của khung cửa đầu. Chế độ sáng thêm sắc chiều ấm khi tới vòm. Đêm sao đặt D & N phía trên đôi uyên ương, bên trong vòm.

## Hình minh họa & mỹ thuật

Bản mới dùng tranh màu nước tạo bằng Imagegen: khung cửa bình minh/đôi uyên ương, nhẫn cưới bên hoa và khu vườn đêm. Đây là hình minh họa, không phải ngoại hình thật của Dương & Ngân. Prompt mỹ thuật: editorial watercolor + fine graphite, cotton paper, muted ivory/champagne/sage, delicate botanical details, no text or clipart.

Các asset trong `public/assets/`: `hero-dawn.webp`, `memory-rings.webp`, `memory-night.webp`; nhánh hoa `botanical.svg` và con dấu `wax-seal.svg` được vẽ bằng vector. Phong thư và thẻ giấy dùng nếp gấp, đường viền mảnh, bóng sáng mềm. WebP chỉ chuyển định dạng ảnh gốc, không thay nội dung hình. Bản Pages sao chép các asset này vào `docs/assets/`.

## Nhân vật và phối cảnh responsive

Cặp búp bê có ba atlas 3 cột × 2 hàng, sáu dáng tiết chế: nắm tay, tựa nhẹ vào vai, cùng giữ bó hoa, khẽ nghiêng đầu, nắm tay gần nhau và hướng nhìn về cổng. Đã thay dáng vẫy tay/tạo tim. Đây là minh họa, chưa dùng ảnh nhận diện thật.

Trang phục bám chặng của câu chuyện, độc lập với sắc trời: mở đầu/lời mời/Album dùng váy ngà và suit navy (`couple-western.webp`); Lễ cưới dùng áo dài đỏ–xanh đậm thêu vàng tiết chế (`couple-ceremony.webp`); Hồi âm/Lưu bút/cảnh kết dùng áo dài champagne–xanh đêm tối giản (`couple-evening.webp`). Mỗi atlas được Imagegen chỉnh từ cùng cặp nhân vật. Prompt và đường dẫn asset nằm trong `design/character-brief.md`.

`public/character.mjs` chọn một bộ, một dáng tại mỗi vị trí cuộn. Đổi trang phục tại hai đoạn nối, được che bởi cành hoa/lá tiền cảnh; không hòa tan áo dài/suit hoặc đổi đồ khi khách đọc. `public/character-parts.mjs` tách thân áo, vạt vải, phần voan ngoài và hai đầu bằng clip SVG. Gương mặt/tóc của cả ba bộ luôn lấy từ cùng atlas Western; bù neo chân để không nhảy đầu khi thay bộ. Khăn đóng đỏ nằm trên lớp trang phục, phía ngoài lớp tóc/mặt chung.

Chuyển trọng tâm, nghiêng đầu, voan/vạt áo và một gợi ý khép mí rất nhẹ dùng thông số từ vị trí cuộn; không chạy theo đồng hồ hoặc lặp tự động. Mí nằm trên vùng mắt đo từ ảnh, không thay mắt nguyên gốc. Mọi chuyển động về 0 ở điểm dừng; giảm chuyển động tắt hoàn toàn cử chỉ và tiền cảnh che chuyển bộ. Đây là hoạt họa lớp minh họa trong phong cảnh có phối cảnh, chưa phải nhân vật 3D có xương, facial rig hoặc mô phỏng vải.

Trên PC, tấm thiệp và cặp nhân vật nằm ở hai phía đối diện. Trên điện thoại, thiệp dùng chiều rộng đầy đủ; một lớp phong cảnh phía dưới giữ nhân vật luôn nhìn rõ và che phần nội dung đang đi ra khỏi vùng đọc. Lớp này có pointer-events:none để không chặn thao tác biểu mẫu ở vùng trong suốt. Nội dung tiếp tục cuộn tự nhiên để đọc đầy đủ, không tạo hộp cuộn bên trong. Album mở trong dialog riêng; khóa cuộn nền trong lúc mở và giữ nguyên vị trí khi đóng. Khoảng nối trên điện thoại ngắn hơn PC. Khi bàn phím mở, dải nhân vật và điều khiển được ẩn để ưu tiên nhập biểu mẫu. Input 16px, vùng chạm tối thiểu 44px, có safe-area và hỗ trợ màn hình ngang.

Agent design expert vẽ `cinematic-tree.svg`, `cinematic-arch.svg` và `cinematic-room.svg`: lá có gân, hoa nhiều lớp cánh, nhánh mềm, dải lụa và viền vàng; phòng có rèm linen hai bên, bàn gỗ sáng, lọ hoa và ghế đôn. Sàn gỗ hội tụ theo ngưỡng cửa, có vệt sáng từ hiên. Các vật thể tiền cảnh mở rộng và lướt ra mép cùng đường máy. SVG hỗ trợ cả href/xlink:href, không có tài nguyên bên ngoài. `docs/` nhận bản sao khi chạy build:pages.

Đã kiểm tra toán học về điểm dừng, đường lùi, tính liên tục, việc cửa tan trước khi nhân vật di chuyển, vị trí chân tại hai vòm và giới hạn nhân vật trên sáu kích thước khung nhìn. Kiểm tra ba bộ xuất hiện đúng chặng, chỉ một bộ/dáng hiện mỗi lúc, neo mặt chung không lệch trên điện thoại/PC, cử chỉ tĩnh tại thẻ, cổng luôn lớn dần, cây/hồ tới đúng cảnh, toàn bộ trạng thái máy giữ nguyên trong vùng đọc, hòa chuyển giảm chuyển động và hình học mở giấy nối đúng cửa; seek liên tục qua các mốc. Đã xem khung phối cảnh bằng renderer canvas native; chưa kiểm thử giao diện hoàn chỉnh trong trình duyệt thật hoặc đo FPS trên thiết bị.
