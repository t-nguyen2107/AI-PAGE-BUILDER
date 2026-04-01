Việc xuất ra "tóm tắt suy nghĩ" (Thought Process/Reasoning) cho người dùng xem không chỉ tăng trải nghiệm (UX) mà còn giúp họ kiên nhẫn hơn trong lúc chờ AI xử lý. Chúng ta sẽ áp dụng pattern **Plan-and-Execute** trong luồng đồ thị này.

Dưới đây là bản thiết kế chi tiết luồng LangGraph cho một câu lệnh (Prompt) tạo Landing Page.

---

## 1. Định nghĩa Trạng thái (Agent State)

Trong LangGraph, mọi Node đều đọc và ghi vào một `State` chung. Đây là cấu trúc dữ liệu chạy xuyên suốt đồ thị:

```python
from typing import TypedDict, List, Dict, Any

class PageBuilderState(TypedDict):
    user_prompt: str                # Prompt gốc của người dùng
    extracted_intent: Dict          # Ý định phân tích được (Ngành nghề, Tone màu, Layout...)
    thought_log: List[str]          # Danh sách suy nghĩ để stream ra UI ("Đang lấy mẫu Hero...", "Đang tối ưu H1...")
    retrieved_components: List[Any] # Code mẫu/JSON kéo từ Qdrant
    draft_page_json: Dict           # Bản nháp cấu trúc Page
    validation_errors: List[str]    # Lỗi nếu cấu trúc JSON hoặc SEO không chuẩn
    final_page_json: Dict           # Kết quả hoàn chỉnh cuối cùng
```

---

## 2. Chi tiết các Node trong LangGraph

Mỗi Node đại diện cho một Agent hoặc một Function cụ thể.

### Node 1: Intent Analyzer (Phân tích Ý định)
* **Nhiệm vụ:** Đọc prompt, bóc tách các yêu cầu cụ thể (Mục tiêu trang, phong cách, màu sắc).
* **Thought Log output:** `"Phân tích yêu cầu: Trang chủ bán khóa học, phong cách tối giản, màu chủ đạo xanh blue."`

### Node 2: Vector Retriever (Truy xuất Dữ liệu)
* **Nhiệm vụ:** Lấy kết quả từ Node 1, chuyển thành vector embedding và query vào **Qdrant** để lấy các `Component JSON Schema` phù hợp nhất (VD: mẫu Hero cho ngành giáo dục, mẫu Pricing 3 cột).
* **Thought Log output:** `"Đang tìm kiếm các cấu trúc UI phù hợp nhất trong thư viện hệ thống..."`

### Node 3: The Planner & Reasoner (Bộ não Tư duy) - *Core*
Đây là Node đặc biệt để xuất ra "Suy nghĩ" chi tiết cho người dùng trước khi thực sự viết code. Nó giúp anh tách bạch việc suy luận và việc xuất JSON.
* **Nhiệm vụ:** Lên dàn ý các Section sẽ có trên trang dựa trên dữ liệu lấy được từ Qdrant.
* **Thought Log output:** (Stream từng dòng ra UI)
    * *"1. Thêm Header với Logo và Navigation."*
    * *"2. Thêm Hero Section với Call-to-action mạnh mẽ."*
    * *"3. Bố trí 3 cột Feature để làm nổi bật lợi ích khóa học."*
    * *"4. Thêm Testimonial để tăng độ tin cậy."*

### Node 4: JSON Generator (Bộ tạo Cấu trúc)
* **Nhiệm vụ:** Lắp ghép dàn ý từ Node 3 và code mẫu từ Node 2 thành một cục `draft_page_json` hoàn chỉnh. Ép LLM (Claude 3.5 Sonnet hoặc GPT-4o) chỉ xuất ra JSON hợp lệ.
* **Thought Log output:** `"Đang biên dịch cấu trúc thành mã nguồn giao diện..."`

### Node 5: SEO & Schema Validator (Kiểm duyệt viên)
* **Nhiệm vụ:** Quét qua `draft_page_json`. Kiểm tra xem đã có đủ thẻ H1 chưa? Thứ tự H2, H3 có hợp lý không? Các Image component đã có thuộc tính `alt` chưa? 
* Nếu thiếu, Node này ghi lỗi vào `validation_errors`.
* **Thought Log output:** `"Đang tối ưu hóa cấu trúc SEO và Core Web Vitals..."`

---

## 3. Bản đồ luồng đi (Edges & Conditional Routing)

Đây là cách các Node kết nối với nhau để tạo thành đồ thị:

1. **START** ➡️ `Intent_Analyzer`
2. `Intent_Analyzer` ➡️ `Vector_Retriever`
3. `Vector_Retriever` ➡️ `Planner_Reasoner`
4. `Planner_Reasoner` ➡️ `JSON_Generator`
5. `JSON_Generator` ➡️ `SEO_Validator`
6. **Conditional Edge tại `SEO_Validator`:**
    * Nếu `validation_errors` rỗng (OK) ➡️ Chuyển sang **END**.
    * Nếu có lỗi ➡️ Vòng ngược lại (Loop) về `JSON_Generator` kèm theo list lỗi để LLM tự sửa. (Giới hạn tối đa 2 vòng lặp để tránh infinite loop).

---

## 4. Cách Stream "Tóm tắt suy nghĩ" ra Frontend (Next.js/React)

Để làm hiệu ứng giống các AI cao cấp hiện nay (text chạy ra mượt mà từng bước), anh không nên đợi cả luồng LangGraph chạy xong rồi mới trả kết quả. 

Thay vào đó, anh sử dụng tính năng **Streaming Events** của LangGraph (`.astream_events()`):

1. Từ Backend (API), anh chạy LangGraph dưới dạng stream.
2. Bất cứ khi nào một Node cập nhật trường `thought_log` trong State, Backend lập tức bắn sự kiện qua **Server-Sent Events (SSE)** xuống Client.
3. Ở Frontend (React), anh tạo một Component dạng *Terminal* hoặc *Loading Spinner* với các check-mark `[v]`:
   * ⏳ Phân tích yêu cầu... (Done)
   * ⏳ Đang quét thư viện UI... (Done)
   * ⏳ Lên bản vẽ nháp: Hero -> Features -> Footer... (Done)
   * 🔄 Đang tối ưu SEO (Thêm thẻ H1, Alt text)... (Processing)

