## 1. Cấu trúc cốt lõi của một Page (The Page Schema)

Một Page không lưu dưới dạng mã HTML tĩnh mà được lưu dưới dạng một file JSON (DSL - Domain Specific Language). Cấu trúc này giúp AI dễ dàng đọc, hiểu và tự động tạo ra giao diện.

```json
{
  "pageId": "home-page-01",
  "meta": {
    "title": "Nền tảng AI Content",
    "description": "Tự động hóa nội dung với AI",
    "slug": "/home",
    "robots": "index, follow",
    "canonical": "https://domain.com/home"
  },
  "globalStyles": {
    "theme": "light",
    "primaryColor": "#3B82F6",
    "fontFamily": "Inter, sans-serif"
  },
  "nodes": [
    // Danh sách các Components sẽ nằm ở đây
  ]
}
```

---

## 2. Phân loại các Component bắt buộc phải có (The Node Library)

Một AI Builder cần một thư viện Component được module hóa cao. Chúng chia thành 4 nhóm chính:

### A. Nhóm Layout (Structural Components)
Đây là "bộ xương" của trang web, chứa các component khác.
* **Section:** Khối bao ngoài cùng, thường chiếm 100% chiều rộng màn hình (ví dụ: Hero Section, Footer Section). Chứa các thuộc tính về background (màu, ảnh, video), padding lớn.
* **Container:** Giới hạn chiều rộng nội dung (ví dụ: max-w-7xl) để nội dung luôn căn giữa và không bị tràn viền trên màn hình to.
* **Grid / Flex Row:** Hệ thống chia cột. Cho phép định nghĩa số cột trên Mobile, Tablet, Desktop.

### B. Nhóm Basic UI (Primitive Components)
* **Heading (H1 - H6):** Chứa nội dung văn bản tiêu đề.
* **Text / Paragraph:** Khối văn bản thông thường (Rich text có hỗ trợ bôi đậm, in nghiêng, chèn link).
* **Button:** Nút kêu gọi hành động (Call to Action). Có các trạng thái: Primary, Secondary, Outline, Ghost.
* **Image / Video:** Hiển thị đa phương tiện.
* **Icon:** Thư viện vector icon (SVG).

### C. Nhóm Composite (Pre-built Blocks)
Đây là các khối được lắp ghép từ Basic UI, giúp AI trả kết quả nhanh hơn thay vì phải ghép từng phần tử nhỏ:
* **Card:** Gồm Image + Title + Description + Button.
* **Accordion / FAQ:** Khối nội dung đóng/mở.
* **Testimonial:** Khối đánh giá của khách hàng (Avatar + Rating + Text).
* **Pricing Table:** Bảng giá dịch vụ.

### D. Nhóm Semantic & SEO (Vô hình nhưng quan trọng)
* **Schema Markup Block:** Khối ẩn, nơi AI tự động inject mã JSON-LD (Product, Article, LocalBusiness) vào thẳng DOM.

---

## 3. Cách bố trí bố cục (Layout Strategy)

Để Layout responsive và không bị vỡ khi AI tự động generate, anh nên áp dụng triết lý thiết kế **Flexbox/Grid kết hợp với Utility Classes (Tailwind)**.

1.  **Chỉ định hướng (Direction):** Mỗi Container/Row phải quy định rõ sắp xếp con cái theo chiều dọc (Column) hay chiều ngang (Row).
2.  **Khoảng cách (Spacing/Gap):** Dùng thuộc tính `gap` thay vì `margin` để kiểm soát khoảng cách giữa các phần tử trong một khối, giúp layout luôn đồng đều.
3.  **Responsive Tiers:** Mọi thuộc tính layout đều phải hỗ trợ đa màn hình dưới dạng object.
    * *Ví dụ:* `columns: { mobile: 1, tablet: 2, desktop: 4 }`

---

## 4. Chi tiết về Attribute của một Component (The Node Properties)

Mỗi Node (Component) trong file JSON sẽ mang một tập hợp các thuộc tính (Attributes). Đây là bộ schema chuẩn mực để React render ra UI và AI có thể can thiệp sửa đổi:

### Schema mẫu của một Node (Ví dụ: Heading Component)
```json
{
  "id": "node-uuid-1234",
  "type": "Heading",
  "content": {
    "text": "Giải pháp AI Tối ưu Hóa Nội Dung"
  },
  "seo": {
    "tag": "h1", // Rất quan trọng: AI phải biết chọn đúng H1, H2, H3
    "ariaLabel": "Tiêu đề chính của trang"
  },
  "styles": {
    "typography": {
      "fontSize": { "mobile": "text-3xl", "desktop": "text-5xl" },
      "fontWeight": "font-bold",
      "color": "text-gray-900",
      "alignment": "text-center"
    },
    "spacing": {
      "marginTop": "mt-4",
      "marginBottom": "mb-8"
    }
  },
  "aiMetadata": {
    "locked": false, // Nếu true, AI sẽ không được phép sửa đổi component này khi re-generate
    "contextRule": "Bắt buộc chứa từ khóa chính của trang"
  }
}
```

### Phân tích các bộ Attribute cốt lõi:

* **1. Nhóm `content`:** Chứa dữ liệu thực tế (Text, URL của ảnh, URL đích của nút bấm).
* **2. Nhóm `seo` & `accessibility`:** * Đối với Text: Quyết định thẻ HTML Semantic (`<h1>`, `<h2>`, `<p>`).
    * Đối với Image: Bắt buộc có `altText` và thuộc tính `loading="lazy"` (hoặc `eager` nếu là ảnh Hero ở nếp gấp đầu tiên).
    * Đối với Button/Link: Bắt buộc có thuộc tính `href`, `target` và `rel` (dofollow/nofollow).
* **3. Nhóm `styles`:** Quản lý giao diện. Thay vì lưu CSS tĩnh, hãy lưu các class của Tailwind. Việc này giúp AI dễ dàng xử lý và hệ thống render cực kỳ nhẹ.
* **4. Nhóm `aiMetadata`:** Đây là "vũ khí bí mật" của AI Builder. Chứa các quy tắc riêng biệt cho từng component để khi AI re-generate cấu trúc, nó biết được ranh giới (ví dụ: không được đổi màu nút CTA vì đây là màu brand).
