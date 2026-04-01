TÀI LIỆU CHI TIẾT HỆ THỐNG AI-FIRST PAGE BUILDER
1. Hệ thống chức năng toàn diện (Feature Matrix)
1.1. Bộ não khởi tạo (The Core Generator)
Prompt-to-Site (Text-to-UI): Chuyển đổi mô tả tự nhiên thành Website hoàn chỉnh.

Image-to-Site: Upload ảnh chụp màn hình hoặc bản vẽ tay, AI sử dụng Vision Model để phân tích layout và tái tạo lại bằng code.

URL-to-Site: Nhập link đối thủ, AI quét cấu trúc (scraping), phân tích UX/UI và tạo ra một phiên bản "tương tự nhưng tốt hơn" (không copy nguyên bản).

1.2. Trình chỉnh sửa thông minh (AI Editor)
Contextual AI Toolbar: Khi click vào bất kỳ thành phần nào, một menu AI hiện ra hỗ trợ:

Text: Viết lại, rút ngắn, mở rộng, đổi tone giọng SEO-optimized.

Image: Generate ảnh mới, mở rộng vùng ảnh (Outpainting).

Global Styling: Một câu lệnh để đổi toàn bộ Branding (ví dụ: "Chuyển sang style Cyberpunk, font chữ không chân, màu chủ đạo neon").

Smart Component Swapping: Ra lệnh đổi kiểu (ví dụ: "Đổi phần Pricing này từ dạng bảng sang dạng danh sách trượt").

1.3. Trợ lý SEO & Marketing (The Specialist)
Auto-Schema Markup: Tự động tạo cấu trúc Schema (Organization, Product, FAQ) chuẩn JSON-LD.

Lighthouse Optimizer: AI tự tối ưu code để đạt điểm 100/100 Google Lighthouse (tự nén ảnh, lazy load, inline CSS quan trọng).

Heatmap Prediction: AI dự đoán khu vực người dùng sẽ chú ý nhiều nhất dựa trên thiết kế hiện tại.

2. Quy trình lấy thông tin khách hàng (The Onboarding)
Để tạo ra website "đầy đủ thông tin" và đúng ý, anh cần một bộ câu hỏi Dynamic Onboarding. Thay vì bắt khách hàng điền một form dài, hãy dùng chatbot để "phỏng vấn".

Bước 1: Thông tin cơ bản (The Identity)
Tên doanh nghiệp & Ngành nghề.

Mục tiêu chính: (Bán hàng, lấy lead, giới thiệu thương hiệu, hay làm Portfolio).

USP (Unique Selling Point): Điều gì làm bạn khác biệt?

Bước 2: Thu thập tài nguyên (The Assets)
Yêu cầu khách hàng cung cấp: Logo, mã màu (nếu có), danh sách dịch vụ/sản phẩm.

AI Feature: Cho phép khách hàng dán link Facebook Fanpage hoặc LinkedIn profile để AI tự "cào" thông tin về tiểu sử và dịch vụ.

Bước 3: Định hình phong cách (The Visual Preference)
Đưa ra 3-4 mẫu layout nhanh và bắt khách hàng chọn 1.

Hỏi về "Cảm xúc": (Tin cậy, Sáng tạo, Sang trọng, hay Thân thiện).

3. Nghệ thuật viết Prompt cho AI Builder
Anh cần thiết kế một hệ thống Prompt Orchestration (Phối hợp nhiều prompt nhỏ) thay vì một prompt duy nhất.

3.1. Cấu trúc Prompt Nội bộ (System Prompt)
Khi người dùng nhập: "Tạo web bán thực phẩm sạch", hệ thống của anh sẽ tự động "nâng cấp" nó thành:

"Bạn là chuyên gia UI/UX và SEO cấp cao. Hãy thiết kế một website cho ngành [Thực phẩm sạch].

Cấu trúc: Header (Logo bên trái), Hero (Title đánh vào sức khỏe), Benefits (3 cột), Product Grid, Testimonial, Footer.

Màu sắc: Sử dụng bảng màu Sage Green (#B2AC88) và White.

SEO: H1 phải chứa từ khóa 'thực phẩm sạch', hình ảnh có thuộc tính alt mô tả chi tiết.

Output: Trả về định dạng JSON theo schema [Your_Schema_Name]."

3.2. User Prompt Guide (Dành cho người dùng)
Cung cấp cho người dùng công thức "Mục tiêu + Đối tượng + Phong cách":

Ví dụ tốt: "Tạo landing page cho dịch vụ sửa nhà tại Hà Nội, nhắm đến đối tượng trung lưu, phong cách chuyên nghiệp, tin cậy, có nút gọi ngay ở đầu trang."

4. Cách thức Generate Code chi tiết (Workflow)
Đây là quy trình kỹ thuật dựa trên stack anh đang có (LangChain, Qdrant, React):

Giai đoạn Phân tích (LLM):

Sử dụng Claude 3.5 Sonnet để phân tích yêu cầu từ Onboarding.

Tách yêu cầu thành các "Khối" (Sections).

Giai đoạn Truy xuất (RAG + Qdrant):

Mỗi Component (Hero, Footer, v.v.) anh lưu dưới dạng mã Tailwind/React trong Vector DB.

Hệ thống tìm kiếm các Component phù hợp nhất với ngành nghề khách hàng.

Giai đoạn "May đo" (Assembly):

AI nhận Code mẫu từ RAG và bắt đầu thay thế dữ liệu (Text, Image) của khách hàng vào.

AI kiểm tra tính nhất quán (ví dụ: Màu nút bấm ở Section 1 phải giống Section 5).

Giai đoạn Xuất bản (Deployment):

Convert JSON cuối cùng thành mã Next.js/React.

Đẩy lên Vercel/Netlify qua API để có link demo ngay lập tức.

5. Tài liệu tham khảo kỹ thuật
Tài liệu lập trình & API
Vercel AI SDK: Hướng dẫn tạo giao diện Streaming (nhìn thấy code/page chạy đến đâu hiện đến đó).

Tailwind CSS Documentation: Ngôn ngữ thiết kế chuẩn nhất để AI đọc và viết.

LangChain Expression Language (LCEL): Để xâu chuỗi các bước từ Onboarding -> Prompt -> Code.

Cảm hứng UI/UX
SiteGPT/Durable.co: Tham khảo cách họ làm Onboarding cực nhanh (30 giây xong 1 web).

Framer.com: Tham khảo cách họ cho phép AI can thiệp sâu vào từng layer thiết kế.

Lời khuyên cho anh: Với nền tảng SEO siêu cấp, hãy biến tool này thành "SEO-First AI Builder". Các tool hiện nay chỉ mạnh về thẩm mỹ, nếu anh làm được tool tạo ra web tự động có điểm Core Web Vitals tuyệt đối và cấu trúc Schema tự động, anh sẽ dẫn đầu thị trường.