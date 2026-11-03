# HƯỚNG DẪN SỬ DỤNG & KỊCH BẢN TRÌNH DIỄN ĐỒ ÁN — BE CLASSY

Tài liệu hướng dẫn chạy và trình diễn website thương mại điện tử **BE CLASSY – Cửa hàng kinh doanh giày da thủ công**, được xây dựng phục vụ bảo vệ Bài tập lớn môn **Phân tích thiết kế hướng đối tượng với UML**.

---

## 1. Thông tin chung & Công nghệ

- **Đề tài:** Phân tích thiết kế hệ thống cửa hàng giày BE CLASSY
- **Phong cách thiết kế:** Contemporary Footwear Boutique
- **Công nghệ sử dụng:**
  - **HTML5:** Cấu trúc ngữ nghĩa cho 18 trang chức năng (8 trang Khách hàng, 10 trang Quản trị).
  - **CSS3 thuần:** Thiết kế giao diện, bố cục Grid/Flexbox, biểu đồ thống kê và responsive (không dùng framework UI).
  - **Vanilla JavaScript (ES6+):** Xử lý toàn bộ nghiệp vụ, kiểm tra dữ liệu đầu vào và cập nhật giao diện động.
  - **LocalStorage:** Lưu trữ đồng bộ 16 bảng dữ liệu theo đúng thiết kế CSDL trong báo cáo UML.

---

## 2. Cách khởi chạy Website

Website hoàn toàn tĩnh, hoạt động độc lập **không cần cài đặt môi trường, không cần database server hay internet**:

- **Cách 1 (Nhanh nhất):** Nháy đúp chuột mở trực tiếp file `index.html` tại thư mục gốc `d:\demo\index.html` trên trình duyệt (Chrome, Edge, Firefox...).
- **Cách 2 (Dùng VS Code):** Nhấp chuột phải vào `index.html` → chọn **Open with Live Server** (nếu có cài tiện ích Live Server).

> **Lưu ý:** Toàn bộ thao tác của Khách hàng và Quản trị viên dùng chung bộ nhớ `LocalStorage` trên cùng một trình duyệt. Vì vậy khi đặt đơn ở trang Khách hàng, đơn hàng và tồn kho bên trang Quản trị sẽ cập nhật ngay lập tức.

---

## 3. Tài khoản Đăng nhập & Mã Khuyến mãi Demo

Tại trang `login.html`, bạn có thể nhập thủ công hoặc nhấn vào **3 nút chọn nhanh vai trò** ở cuối khung đăng nhập:

| Tác nhân UML | Bảng CSDL | Email / SĐT đăng nhập | Mật khẩu | Phạm vi quyền hạn |
| :--- | :--- | :--- | :--- | :--- |
| **Khách hàng** | `KhachHang` | `khachhang@gmail.com` *(hoặc `0904112233`)* | `123456` | Mua sắm, quản lý giỏ hàng, đặt hàng, theo dõi đơn, gửi yêu cầu đổi trả & phiếu hỗ trợ. |
| **Nhân viên** | `NhanVien` | `quan.na@beclassy.vn` *(hoặc `0987654321`)* | `123456` | Quản lý sản phẩm, loại SP, tồn kho, lập phiếu nhập hàng, xử lý đơn hàng, khách hàng, đổi trả & hỗ trợ. |
| **Chủ cửa hàng** | `ChuCuaHang` | `admin@beclassy.vn` *(hoặc `0912345678`)* | `123456` | Toàn quyền của Nhân viên **cộng thêm**: Quản lý nhà cung cấp, Quản lý nhân viên, Khuyến mãi & Thống kê – Báo cáo. |

**Danh sách mã khuyến mãi mẫu (dùng tại trang Giỏ hàng):**
- `QUYONG10`: Giảm **10%** cho đơn hàng từ `2.000.000₫`.
- `BECLASSY200`: Giảm trực tiếp **200.000₫** cho đơn hàng từ `3.500.000₫`.
- `NEWMEMBER`: Giảm **100.000₫** cho đơn hàng từ `1.500.000₫`.

---

## 4. Cấu trúc thư mục dự án

```text
d:\demo\
├── index.html               # Trang chủ cửa hàng
├── products.html            # Danh sách sản phẩm (Tìm kiếm, lọc đa tiêu chí, sắp xếp, phân trang)
├── product-detail.html      # Chi tiết sản phẩm (Chọn màu & size, kiểm tra tồn kho theo biến thể)
├── login.html               # Đăng nhập chung cho 3 vai trò UML
├── register.html            # Đăng ký tài khoản khách hàng mới
├── cart.html                # Giỏ hàng & áp dụng mã khuyến mãi
├── checkout.html            # Thanh toán, chọn cổng thanh toán & tạo đơn hàng
├── account.html             # Hồ sơ khách hàng, lịch sử đơn, yêu cầu đổi trả & hỗ trợ
│
├── admin/                   # Phân hệ Quản trị (Sidebar điều hướng)
│   ├── index.html           # Dashboard tổng quan, biểu đồ doanh thu & cảnh báo sắp hết hàng
│   ├── products.html        # Quản lý Sản phẩm, Biến thể, Loại sản phẩm & Thương hiệu
│   ├── inventory.html       # Quản lý Tồn kho biến thể, Lập hóa đơn nhập hàng & Lịch sử nhập
│   ├── suppliers.html       # Quản lý Nhà cung cấp (Chỉ Chủ cửa hàng)
│   ├── orders.html          # Quản lý Đơn hàng & cập nhật tiến trình giao hàng
│   ├── customers.html       # Quản lý Khách hàng
│   ├── employees.html       # Quản lý Nhân viên (Chỉ Chủ cửa hàng)
│   ├── returns.html         # Tiếp nhận & phê duyệt Yêu cầu đổi trả
│   ├── support.html         # Lập phiếu & phản hồi Yêu cầu hỗ trợ khách hàng
│   └── reports.html         # Quản lý Khuyến mãi & Báo cáo Doanh thu / Tồn kho / Bán chạy
│
├── assets/
│   └── images/shoes/        # Bộ ảnh sản phẩm giày da & banner lưu cục bộ (chạy offline 100%)
│
├── css/
│   ├── style.css            # Hệ thống biến màu sắc, typography, bảng, form, modal, toast
│   ├── customer.css         # Giao diện cửa hàng phía khách hàng
│   └── admin.css            # Giao diện bảng điều khiển quản trị
│
└── js/
    ├── data.js              # Dữ liệu mẫu khởi tạo bám sát 16 bảng CSDL UML
    ├── storage.js           # Tầng LocalStorage & kiểm tra toàn bộ ràng buộc nghiệp vụ
    ├── common.js            # Hàm tiện ích chung, icon SVG, Header/Footer/Sidebar & phân quyền
    ├── customer.js          # Xử lý sự kiện và luồng tương tác của 8 trang Khách hàng
    └── admin.js             # Xử lý sự kiện và luồng tương tác của 10 trang Quản trị
```

---

## 5. Kịch bản trình diễn (Demo Script) khi bảo vệ Đồ án

Để phần thuyết trình trước giảng viên mạch lạc và thể hiện rõ chiều sâu nghiệp vụ UML, bạn có thể trình diễn theo **5 luồng liên hoàn** sau:

### Luồng 1: Trải nghiệm Mua sắm & Kiểm soát Tồn kho theo Biến thể
1. Mở `index.html`, giới thiệu bố cục trang chủ, danh mục giày và sản phẩm nổi bật.
2. Vào **Sản phẩm** (`products.html`), thử tìm kiếm từ khóa `"Oxford"`, lọc theo kích cỡ `Size 41` và sắp xếp theo giá.
3. Nhấn vào mẫu **Classic Cap-Toe Oxford** (`SP01`):
   - Đổi qua lại giữa các màu (`Nâu Cognac`, `Đen`, `Đỏ Burgundy`) → hình ảnh giày và danh sách Size kèm số lượng tồn kho (`BienTheSanPham`) cập nhật tương ứng.
   - Thử chọn biến thể hết hàng (ví dụ mẫu `SP02` Size 42 màu Đen) để chứng minh hệ thống khóa nút đặt mua khi tồn kho = 0.
   - Chọn biến thể còn hàng, thử bấm dấu `+` vượt quá số đôi tồn kho → hệ thống cảnh báo chặn ngay.
4. Nhấn **Thêm vào giỏ hàng** → vào `cart.html`, chọn nhanh mã giảm giá `QUYONG10` → nhấn **Tiến hành thanh toán**.
5. Nếu chưa đăng nhập, hệ thống tự chuyển qua `login.html` (đúng tiền điều kiện Use Case Đặt hàng). Nhấn nút chọn nhanh **Khách hàng** → hệ thống đưa thẳng về `checkout.html`.
6. Chọn phương thức thanh toán (COD / VietQR / VNPay / MoMo) và nhấn **Xác nhận đặt hàng** → ghi nhớ mã đơn vừa tạo (ví dụ `DH008`) và kiểm tra lại sản phẩm vừa mua sẽ thấy **số lượng tồn kho đã giảm đúng bằng số đôi vừa đặt**.

### Luồng 2: Xử lý Đơn hàng & Đổi trả (Liên thông Khách hàng ↔ Nhân viên)
1. Tại trang **Tài khoản cá nhân** (`account.html`):
   - Tab **Lịch sử đơn hàng**: Mở xem chi tiết đơn `DH008` vừa đặt với thanh tiến trình 4 bước.
   - Tab **Yêu cầu đổi trả (`DoiTra`)**: Chọn một đơn hàng đã ở trạng thái `Đã giao` trong hạn 15 ngày (ví dụ `DH007`), chọn sản phẩm, hình thức `Trả hàng hoàn tiền`, nhập lý do rồi gửi yêu cầu → phiếu tạo mới ở trạng thái `Chờ duyệt` (khách có thể bấm `Hủy yêu cầu` khi đang chờ duyệt).
   - Tab **Gửi yêu cầu hỗ trợ (`PhieuHoTro`)**: Gửi một câu hỏi bảo dưỡng da.
2. Đăng xuất hoặc vào `login.html` chọn nhanh vai trò **Nhân viên**:
   - Vào **Quản lý đơn hàng** (`admin/orders.html`): Mở đơn `DH008`, cập nhật trạng thái từ `Chờ xác nhận` → `Đã xác nhận` → `Đang giao hàng` → `Đã giao` (hoặc thử chuyển sang `Đã hủy` để chứng minh hệ thống tự hoàn lại tồn kho).
   - Vào **Yêu cầu đổi trả** (`admin/returns.html`): Mở phiếu đổi trả vừa gửi, chọn **Duyệt yêu cầu** → hệ thống ghi nhận tiền hoàn, ngày xử lý, mã nhân viên và **tự động cộng hoàn sản phẩm về lại tồn kho biến thể**.
   - Vào **Yêu cầu hỗ trợ** (`admin/support.html`): Nhập nội dung phản hồi cho khách hoặc bấm **Lập phiếu hỗ trợ mới** (mô phỏng khách gọi hotline).

### Luồng 3: Phân biệt Tạo sản phẩm mới với Nhập hàng từ Nhà cung cấp
1. Vào **Quản lý sản phẩm** (`admin/products.html`) → nhấn **Thêm sản phẩm mới**:
   - Nhập tên mẫu giày mới, chọn loại sản phẩm, thương hiệu, giá bán và khai báo 2 biến thể (`Size 40 - Đen`, `Size 41 - Đen`) → Lưu lại.
   - Chỉ ra cho hội đồng thấy: các biến thể mới tạo có **tồn kho = 0** (tách biệt rõ ràng giữa khai báo danh mục hàng hóa và nghiệp vụ nhập kho).
2. Chuyển sang **Quản lý kho & Nhập hàng** (`admin/inventory.html`) → Tab **Lập hóa đơn nhập hàng**:
   - Chọn biến thể vừa tạo, nhập số lượng `10` đôi, đơn giá nhập `1.350.000₫` → nhấn **Thêm dòng hàng vào phiếu nhập** (có thể thêm nhiều dòng biến thể trong cùng 1 hóa đơn đúng như `sp_NhapHang`).
   - Chọn Nhà cung cấp, phương thức thanh toán và nhấn **Xác nhận lập hóa đơn & Nhập kho** → kiểm tra lại tab Tồn kho sẽ thấy biến thể đã tăng lên `10 đôi`.

### Luồng 4: Phân quyền Tác nhân UML & Báo cáo Thống kê
1. Khi đang ở vai trò **Nhân viên**, nhấn thử vào các mục dành riêng cho Chủ cửa hàng trên Sidebar (`Quản lý nhà cung cấp`, `Quản lý nhân viên`, `Khuyến mãi & Báo cáo`):
   - Hệ thống hiển thị màn hình thông báo giới hạn phân quyền theo đúng **Biểu đồ Use Case tổng quát (Hình 3.1)**.
2. Nhấn nút **Đổi sang Chủ cửa hàng** ngay góc phải thanh Topbar (hoặc nút chuyển trong thông báo):
   - Truy cập **Khuyến mãi & Báo cáo** (`admin/reports.html`) để trình diễn 4 tab: Báo cáo doanh thu theo khoảng ngày (có trừ đơn hủy và tiền hoàn đổi trả), Báo cáo tồn kho cảnh báo dưới định mức, Xếp hạng sản phẩm bán chạy và Quản lý mã khuyến mãi.

### Luồng 5: Kiểm tra các Ràng buộc Toàn vẹn Dữ liệu (Ngoại lệ UML)
- **Xóa Nhà cung cấp (`admin/suppliers.html`):** Thử xóa `NCC01` → hệ thống từ chối vì nhà cung cấp đã có hóa đơn nhập hàng.
- **Xóa Khách hàng (`admin/customers.html`):** Thử xóa `KH01` → hệ thống từ chối vì khách đã có lịch sử đơn hàng.
- **Xóa Sản phẩm (`admin/products.html`):** Thử xóa `SP01` → hệ thống từ chối vì sản phẩm còn tồn kho và đã có chi tiết đơn hàng.
- **Xóa Nhân viên (`admin/employees.html`):** Thử xóa `NV01` (nhân viên đã từng lập phiếu/xử lý đơn) → hệ thống không xóa mất dữ liệu lịch sử mà tự động chuyển sang trạng thái **`Ngừng làm việc`** đúng theo đặc tả Bảng 3.8.

---

## 6. Khôi phục Dữ liệu Mẫu (Reset Demo)

Sau khi thử nghiệm thêm/sửa/xóa nhiều dữ liệu, nếu muốn đưa toàn bộ hệ thống về lại trạng thái mẫu sạch ban đầu trước khi lên thuyết trình:

1. Đăng nhập vào trang Quản trị (`admin/index.html`).
2. Nhấn nút **Khôi phục dữ liệu mẫu** ở góc dưới cùng bên trái thanh Sidebar → xác nhận **Khôi phục ngay**.

