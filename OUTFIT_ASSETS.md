# Trang phục theo sắc trời

Chỉnh sửa bằng công cụ Imagegen tích hợp, dùng `public/assets/couple-poses.webp` làm ảnh gốc. Giữ atlas 3 cột × 2 hàng, sáu dáng và nền alpha. WebP chỉ là chuyển định dạng PNG đầu ra, không chỉnh màu bằng bộ lọc trên toàn bộ nhân vật.

| Chế độ | Trang phục | Asset |
| --- | --- | --- |
| Sáng | Kem ngà | `public/assets/couple-poses.webp` |
| Trầm | Vest cacao, váy champagne | `public/assets/couple-poses-dusk.webp` |
| Đêm sao | Vest midnight, váy xanh trắng ngọc trai | `public/assets/couple-poses-night.webp` |

Bản demo sao chép hai ảnh mới vào `docs/assets/`. Các lớp trang phục hòa trong 0,9 giây; Giảm chuyển động đổi ngay. Nền đêm sao: `#070e1c`.

## Prompt chung

Use case: precise-object-edit. Edit target: the attached transparent wedding couple sprite atlas. Preserve EXACTLY the 3-column by 2-row grid, all six full-body poses, each character's silhouette, position, size, faces, eyes, hair, skin tones, bouquets and ceramic/clay material. Keep every pose within its original tile and aligned exactly as source; no additional margins. Change ONLY the wedding clothing fabric colors, consistently across all six poses. Preserve fabric folds, fine highlights and garment designs. Genuine transparent alpha background, no checkerboard or colors outside subjects, no text. 

## Phần bổ sung cho chế độ Trầm

Groom jacket and trousers: warm cocoa brown (#745445); waistcoat and bow tie: pale champagne. Bride gown: warm champagne with subtle rose-gold undertones (#e5c8a4), veil warm ivory. All faces, hair, hands, exposed skin and flowers unchanged.

## Phần bổ sung cho chế độ Đêm sao

Groom jacket and trousers: elegant deep midnight navy blue (#182b49); waistcoat a slightly lighter navy, white shirt and pearl silver bow tie. Bride gown: icy pearl blue-white satin (#d8e5f4) with silver-blue folds; veil translucent cool pearl white. All faces, hair, hands, exposed skin and flowers unchanged. Do not darken the skin or overall illustration; it must remain clearly visible on a dark blue-black website.
