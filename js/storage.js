/* ==========================================================================
   BE CLASSY — LOCALSTORAGE & BUSINESS LOGIC LAYER (storage.js)
   Thực thi đầy đủ các ràng buộc nghiệp vụ UML & Store Procedures
   ========================================================================== */

(function () {
  const DB_KEY = 'BECLASSY_DB_V1';
  const SESSION_KEY = 'BECLASSY_SESSION_V1';
  const CART_KEY = 'BECLASSY_CART_V1';
  const PROMO_KEY = 'BECLASSY_CART_PROMO_V1';

  function cloneSeed() {
    return JSON.parse(JSON.stringify(window.BECLASSY_SEED));
  }

  function loadDB() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (!raw) {
        const fresh = cloneSeed();
        localStorage.setItem(DB_KEY, JSON.stringify(fresh));
        return fresh;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== window.BECLASSY_SEED.version) {
        const fresh = cloneSeed();
        localStorage.setItem(DB_KEY, JSON.stringify(fresh));
        return fresh;
      }
      return parsed;
    } catch (e) {
      return cloneSeed();
    }
  }

  function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  function resetDB() {
    const fresh = cloneSeed();
    saveDB(fresh);
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(PROMO_KEY);
    return fresh;
  }

  function todayISO() {
    // Mặc định lấy ngày hiện tại theo giờ địa phương YYYY-MM-DD
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function nextId(list, field, prefix, padLen = 2) {
    let maxNum = 0;
    list.forEach((item) => {
      const val = String(item[field] || '');
      if (val.startsWith(prefix)) {
        const num = parseInt(val.slice(prefix.length), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return prefix + String(maxNum + 1).padStart(padLen, '0');
  }

  // -------------------- AUTHENTICATION --------------------
  function getCurrentUser() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setCurrentUser(sessionObj) {
    if (!sessionObj) {
      localStorage.removeItem(SESSION_KEY);
    } else {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionObj));
    }
  }

  function login(identifier, password) {
    const idTrim = String(identifier || '').trim().toLowerCase();
    const pw = String(password || '');
    if (!idTrim || !pw) {
      return { ok: false, message: 'Vui lòng nhập đầy đủ Email/SĐT và mật khẩu.' };
    }

    const db = loadDB();

    // 1. Kiểm tra Chủ cửa hàng
    const owner = db.ChuCuaHang.find(
      (u) => (u.Email.toLowerCase() === idTrim || u.Sdt === idTrim || u.MaChu.toLowerCase() === idTrim) && u.Matkhau === pw
    );
    if (owner) {
      const session = {
        role: 'owner',
        roleLabel: 'Chủ cửa hàng',
        id: owner.MaChu,
        name: owner.TenChu,
        email: owner.Email,
        phone: owner.Sdt
      };
      setCurrentUser(session);
      return { ok: true, user: session };
    }

    // 2. Kiểm tra Nhân viên
    const staff = db.NhanVien.find(
      (u) => (u.Email.toLowerCase() === idTrim || u.Sdt === idTrim || u.MaNv.toLowerCase() === idTrim) && u.Matkhau === pw
    );
    if (staff) {
      if (staff.Trangthai === 'Ngừng làm việc') {
        return { ok: false, message: 'Tài khoản nhân viên này đã ngừng làm việc.' };
      }
      const session = {
        role: 'staff',
        roleLabel: 'Nhân viên',
        id: staff.MaNv,
        name: staff.TenNv,
        email: staff.Email,
        phone: staff.Sdt,
        position: staff.Chucvu
      };
      setCurrentUser(session);
      return { ok: true, user: session };
    }

    // 3. Kiểm tra Khách hàng
    const cust = db.KhachHang.find(
      (u) => (u.Email.toLowerCase() === idTrim || u.Sdt === idTrim || u.MaKh.toLowerCase() === idTrim) && u.Matkhau === pw
    );
    if (cust) {
      const session = {
        role: 'customer',
        roleLabel: 'Khách hàng',
        id: cust.MaKh,
        name: cust.TenKh,
        email: cust.Email,
        phone: cust.Sdt
      };
      setCurrentUser(session);
      return { ok: true, user: session };
    }

    return { ok: false, message: 'Thông tin Email/SĐT hoặc mật khẩu không chính xác.' };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  function registerCustomer({ TenKh, Sdt, Email, Diachi, Matkhau }) {
    const db = loadDB();
    const emailClean = String(Email || '').trim().toLowerCase();
    const phoneClean = String(Sdt || '').trim();

    if (!TenKh || !phoneClean || !emailClean || !Diachi || !Matkhau) {
      return { ok: false, message: 'Vui lòng điền đầy đủ các trường bắt buộc.' };
    }
    if (!/^0\d{9,10}$/.test(phoneClean)) {
      return { ok: false, message: 'Số điện thoại không hợp lệ (bắt đầu bằng số 0, từ 10-11 chữ số).' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      return { ok: false, message: 'Địa chỉ email không đúng định dạng.' };
    }
    if (Matkhau.length < 6) {
      return { ok: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' };
    }

    const emailExists =
      db.KhachHang.some((k) => k.Email.toLowerCase() === emailClean) ||
      db.NhanVien.some((n) => n.Email.toLowerCase() === emailClean) ||
      db.ChuCuaHang.some((c) => c.Email.toLowerCase() === emailClean);
    if (emailExists) {
      return { ok: false, message: 'Email này đã được sử dụng trong hệ thống.' };
    }

    const phoneExists = db.KhachHang.some((k) => k.Sdt === phoneClean);
    if (phoneExists) {
      return { ok: false, message: 'Số điện thoại này đã được đăng ký.' };
    }

    const MaKh = nextId(db.KhachHang, 'MaKh', 'KH', 2);
    const newCust = {
      MaKh,
      TenKh: TenKh.trim(),
      Sdt: phoneClean,
      Email: emailClean,
      Matkhau,
      Diachi: Diachi.trim(),
      Diemtichluy: 0
    };
    db.KhachHang.push(newCust);
    saveDB(db);

    const session = {
      role: 'customer',
      roleLabel: 'Khách hàng',
      id: newCust.MaKh,
      name: newCust.TenKh,
      email: newCust.Email,
      phone: newCust.Sdt
    };
    setCurrentUser(session);
    return { ok: true, user: session, customer: newCust };
  }

  // -------------------- PRODUCT & INVENTORY QUERIES --------------------
  function getProductsEnriched() {
    const db = loadDB();
    return db.SanPham.map((sp) => {
      const cat = db.LoaiSanPham.find((l) => l.Maloai === sp.Maloai);
      const brand = db.ThuongHieu.find((t) => t.MaTh === sp.MaTh);
      const variants = db.BienTheSanPham.filter((bt) => bt.MaSp === sp.MaSp);
      const totalStock = variants.reduce((sum, v) => sum + Number(v.Soluongton || 0), 0);
      const colors = [...new Set(variants.map((v) => v.Mau))];
      const sizes = [...new Set(variants.map((v) => Number(v.Size)))].sort((a, b) => a - b);
      return {
        ...sp,
        Tenloai: cat ? cat.Tenloai : 'Chưa phân loại',
        TenTh: brand ? brand.TenTh : 'BE CLASSY',
        Xuatxu: brand ? brand.Xuatxu : 'Việt Nam',
        variants,
        totalStock,
        colors,
        sizes
      };
    });
  }

  function getProductById(MaSp) {
    return getProductsEnriched().find((p) => p.MaSp === MaSp) || null;
  }

  function getVariantDetails(MaBt) {
    const db = loadDB();
    const bt = db.BienTheSanPham.find((v) => v.MaBt === MaBt);
    if (!bt) return null;
    const sp = db.SanPham.find((p) => p.MaSp === bt.MaSp);
    if (!sp) return null;
    const img = (sp.AnhTheoMau && sp.AnhTheoMau[bt.Mau]) ? sp.AnhTheoMau[bt.Mau] : sp.Hinhanh;
    return {
      ...bt,
      TenSp: sp.TenSp,
      GiaBan: Number(sp.GiaBan),
      Hinhanh: img,
      Maloai: sp.Maloai,
      MaTh: sp.MaTh
    };
  }

  // -------------------- SHOPPING CART --------------------
  function getCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }

  function getCartDetailed() {
    const cart = getCart();
    const detailed = [];
    cart.forEach((item) => {
      const info = getVariantDetails(item.MaBt);
      if (info) {
        detailed.push({
          MaBt: item.MaBt,
          MaSp: info.MaSp,
          TenSp: info.TenSp,
          Size: info.Size,
          Mau: info.Mau,
          Dongia: info.GiaBan,
          Hinhanh: info.Hinhanh,
          Soluong: Number(item.Soluong),
          Soluongton: Number(info.Soluongton),
          Thanhtien: Number(item.Soluong) * info.GiaBan
        });
      }
    });
    return detailed;
  }

  function addToCart(MaBt, qty = 1) {
    const amount = parseInt(qty, 10);
    if (isNaN(amount) || amount <= 0) {
      return { ok: false, message: 'Số lượng sản phẩm phải lớn hơn 0.' };
    }
    const info = getVariantDetails(MaBt);
    if (!info) {
      return { ok: false, message: 'Biến thể sản phẩm không tồn tại.' };
    }
    if (info.Soluongton <= 0) {
      return { ok: false, message: 'Biến thể kích cỡ và màu sắc này hiện đã hết hàng.' };
    }

    const cart = getCart();
    const existing = cart.find((c) => c.MaBt === MaBt);
    const currentInCart = existing ? Number(existing.Soluong) : 0;

    if (currentInCart + amount > info.Soluongton) {
      return {
        ok: false,
        message: `Kho chỉ còn ${info.Soluongton} đôi cho mẫu này (giỏ hàng đang có ${currentInCart} đôi).`
      };
    }

    if (existing) {
      existing.Soluong = currentInCart + amount;
    } else {
      cart.push({ MaBt, Soluong: amount });
    }
    saveCart(cart);
    return { ok: true, message: `Đã thêm "${info.TenSp}" (${info.Mau}, Size ${info.Size}) vào giỏ hàng.` };
  }

  function updateCartQty(MaBt, newQty) {
    const qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty <= 0) {
      return { ok: false, message: 'Số lượng phải từ 1 trở lên.' };
    }
    const info = getVariantDetails(MaBt);
    if (!info) return { ok: false, message: 'Sản phẩm không còn tồn tại.' };
    if (qty > info.Soluongton) {
      return { ok: false, message: `Không thể vượt quá tồn kho hiện tại (${info.Soluongton} đôi).` };
    }
    const cart = getCart();
    const item = cart.find((c) => c.MaBt === MaBt);
    if (item) {
      item.Soluong = qty;
      saveCart(cart);
    }
    return { ok: true };
  }

  function removeFromCart(MaBt) {
    const cart = getCart().filter((c) => c.MaBt !== MaBt);
    saveCart(cart);
    return { ok: true };
  }

  function clearCart() {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(PROMO_KEY);
  }

  function getAppliedPromoCode() {
    return localStorage.getItem(PROMO_KEY) || '';
  }

  function setAppliedPromoCode(code) {
    if (!code) localStorage.removeItem(PROMO_KEY);
    else localStorage.setItem(PROMO_KEY, String(code).trim().toUpperCase());
  }

  function validatePromoCode(code, subtotal) {
    if (!code) return { ok: false, discount: 0, message: '' };
    const clean = String(code).trim().toUpperCase();
    const db = loadDB();
    const promo = db.KhuyenMai.find((k) => k.Code.toUpperCase() === clean);
    if (!promo) {
      return { ok: false, discount: 0, message: 'Mã khuyến mãi không tồn tại.' };
    }
    if (promo.Trangthai !== 'Đang áp dụng') {
      return { ok: false, discount: 0, message: 'Chương trình khuyến mãi này hiện đang tạm dừng.' };
    }
    const now = todayISO();
    if (promo.Tungay && now < promo.Tungay) {
      return { ok: false, discount: 0, message: 'Chương trình khuyến mãi chưa đến ngày áp dụng.' };
    }
    if (promo.Denngay && now > promo.Denngay) {
      return { ok: false, discount: 0, message: 'Mã khuyến mãi đã hết hạn sử dụng.' };
    }
    if (subtotal < Number(promo.DonToiThieu || 0)) {
      return {
        ok: false,
        discount: 0,
        message: `Đơn tối thiểu ${Number(promo.DonToiThieu).toLocaleString('vi-VN')}đ để dùng mã ${clean}.`
      };
    }
    let discount = 0;
    if (promo.Loaigiam === 'percent') {
      discount = Math.round((subtotal * Number(promo.Giatri)) / 100);
    } else {
      discount = Number(promo.Giatri);
    }
    if (discount > subtotal) discount = subtotal;
    return { ok: true, discount, promo, message: `Áp dụng thành công mã ${clean}.` };
  }

  // -------------------- ORDER PLACEMENT & MANAGEMENT --------------------
  function placeOrder({ Nguoinhan, Sdtnhan, Diachigiao, Macong, Ghichu, MaKm }) {
    const session = getCurrentUser();
    if (!session || session.role !== 'customer') {
      return { ok: false, needLogin: true, message: 'Vui lòng đăng nhập bằng tài khoản Khách hàng để đặt hàng.' };
    }

    if (!Nguoinhan || !Sdtnhan || !Diachigiao || !Macong) {
      return { ok: false, message: 'Vui lòng nhập đầy đủ người nhận, số điện thoại, địa chỉ và phương thức thanh toán.' };
    }
    if (!/^0\d{9,10}$/.test(String(Sdtnhan).trim())) {
      return { ok: false, message: 'Số điện thoại nhận hàng không hợp lệ.' };
    }

    const db = loadDB();
    const cart = getCart();
    if (!cart.length) {
      return { ok: false, message: 'Giỏ hàng trống, không thể tạo đơn hàng.' };
    }

    // Kiểm tra tồn kho nghiêm ngặt (tương ứng sp_DatHang)
    let tamtinh = 0;
    const orderLines = [];

    for (const item of cart) {
      const bt = db.BienTheSanPham.find((v) => v.MaBt === item.MaBt);
      if (!bt) {
        return { ok: false, message: `Biến thể ${item.MaBt} không còn tồn tại trong hệ thống.` };
      }
      const sp = db.SanPham.find((p) => p.MaSp === bt.MaSp);
      if (!sp) {
        return { ok: false, message: `Sản phẩm của biến thể ${item.MaBt} không tồn tại.` };
      }
      if (Number(bt.Soluongton) < Number(item.Soluong)) {
        return {
          ok: false,
          message: `Sản phẩm "${sp.TenSp}" (${bt.Mau}, Size ${bt.Size}) chỉ còn ${bt.Soluongton} đôi trong kho. Vui lòng điều chỉnh giỏ hàng.`
        };
      }
      const dongia = Number(sp.GiaBan);
      tamtinh += dongia * Number(item.Soluong);
      orderLines.push({
        MaBt: bt.MaBt,
        Soluong: Number(item.Soluong),
        Dongia: dongia
      });
    }

    let giamgia = 0;
    let appliedCode = '';
    if (MaKm) {
      const promoCheck = validatePromoCode(MaKm, tamtinh);
      if (promoCheck.ok) {
        giamgia = promoCheck.discount;
        appliedCode = promoCheck.promo.Code;
      }
    }

    const gateway = db.CongThanhToan.find((c) => c.Macong === Macong);
    const MaDh = nextId(db.DonHang, 'MaDh', 'DH', 3);
    const tongtien = Math.max(0, tamtinh - giamgia);

    const newOrder = {
      MaDh,
      MaKh: session.id,
      MaNv: '',
      Macong,
      Nguoinhan: Nguoinhan.trim(),
      Sdtnhan: Sdtnhan.trim(),
      Ngaydat: todayISO(),
      Diachigiao: Diachigiao.trim(),
      Trangthai: 'Chờ xác nhận',
      Tamtinh: tamtinh,
      Giamgia: giamgia,
      MaKm: appliedCode,
      Tongtien: tongtien,
      PhuongthucTT: gateway ? gateway.Tencong : 'Thanh toán khi nhận hàng (COD)',
      Ghichu: (Ghichu || '').trim()
    };

    // Lưu đơn, lưu chi tiết, trừ tồn kho từng biến thể
    db.DonHang.unshift(newOrder);
    orderLines.forEach((line) => {
      db.ChiTietDonHang.push({
        MaDh,
        MaBt: line.MaBt,
        Soluong: line.Soluong,
        Dongia: line.Dongia
      });
      const bt = db.BienTheSanPham.find((v) => v.MaBt === line.MaBt);
      if (bt) {
        bt.Soluongton = Number(bt.Soluongton) - line.Soluong;
      }
    });

    // Cộng điểm tích lũy khách hàng (1 điểm / 10.000đ)
    const kh = db.KhachHang.find((k) => k.MaKh === session.id);
    if (kh) {
      kh.Diemtichluy = Number(kh.Diemtichluy || 0) + Math.floor(tongtien / 10000);
    }

    saveDB(db);
    clearCart();
    return { ok: true, order: newOrder };
  }

  function updateOrderStatus(MaDh, newStatus, actorId = '') {
    const db = loadDB();
    const order = db.DonHang.find((o) => o.MaDh === MaDh);
    if (!order) return { ok: false, message: 'Không tìm thấy đơn hàng.' };

    const oldStatus = order.Trangthai;
    if (oldStatus === newStatus) return { ok: true, order };

    if (oldStatus === 'Đã hủy') {
      return { ok: false, message: 'Đơn hàng đã hủy không thể chuyển sang trạng thái khác.' };
    }
    if (oldStatus === 'Đã giao' && newStatus !== 'Đã giao') {
      return { ok: false, message: 'Đơn hàng đã giao thành công không thể đổi ngược trạng thái (sử dụng nghiệp vụ Đổi trả nếu cần).' };
    }

    // Nếu chuyển sang Đã hủy -> hoàn lại tồn kho cho các biến thể trong đơn
    if (newStatus === 'Đã hủy') {
      const details = db.ChiTietDonHang.filter((ct) => ct.MaDh === MaDh);
      details.forEach((ct) => {
        const bt = db.BienTheSanPham.find((v) => v.MaBt === ct.MaBt);
        if (bt) {
          bt.Soluongton = Number(bt.Soluongton) + Number(ct.Soluong);
        }
      });
    }

    order.Trangthai = newStatus;
    if (actorId && actorId.startsWith('NV')) {
      order.MaNv = actorId;
    } else if (!order.MaNv && db.NhanVien.length > 0 && actorId) {
      order.MaNv = db.NhanVien[0].MaNv;
    }

    saveDB(db);
    return { ok: true, order, message: `Đã cập nhật đơn ${MaDh} sang trạng thái "${newStatus}".` };
  }

  // -------------------- RETURNS & EXCHANGES (DoiTra) --------------------
  function getEligibleOrdersForReturn(MaKh) {
    const db = loadDB();
    const now = new Date(todayISO());
    return db.DonHang.filter((o) => {
      if (o.MaKh !== MaKh || o.Trangthai !== 'Đã giao') return false;
      const orderDate = new Date(o.Ngaydat);
      const diffDays = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
      return diffDays <= 15; // Thời hạn đổi trả trong vòng 15 ngày
    });
  }

  function createReturnRequest({ MaDh, MaBt, Soluong, Loai, Lydo }) {
    const session = getCurrentUser();
    if (!session || session.role !== 'customer') {
      return { ok: false, message: 'Vui lòng đăng nhập tài khoản khách hàng.' };
    }
    const db = loadDB();
    const order = db.DonHang.find((o) => o.MaDh === MaDh && o.MaKh === session.id);
    if (!order) {
      return { ok: false, message: 'Đơn hàng không tồn tại hoặc không thuộc tài khoản của bạn.' };
    }
    if (order.Trangthai !== 'Đã giao') {
      return { ok: false, message: 'Chỉ những đơn hàng ở trạng thái "Đã giao" mới đủ điều kiện gửi yêu cầu đổi trả.' };
    }

    const diffDays = Math.floor((new Date(todayISO()) - new Date(order.Ngaydat)) / (1000 * 60 * 60 * 24));
    if (diffDays > 15) {
      return { ok: false, message: 'Đơn hàng đã quá thời hạn đổi trả 15 ngày kể từ ngày mua.' };
    }

    const line = db.ChiTietDonHang.find((ct) => ct.MaDh === MaDh && ct.MaBt === MaBt);
    const reqQty = parseInt(Soluong, 10);
    if (!line || isNaN(reqQty) || reqQty <= 0 || reqQty > Number(line.Soluong)) {
      return { ok: false, message: 'Sản phẩm hoặc số lượng yêu cầu không khớp với chi tiết đơn hàng.' };
    }

    if (!Lydo || String(Lydo).trim().length < 5) {
      return { ok: false, message: 'Vui lòng nhập rõ lý do đổi trả (tối thiểu 5 ký tự).' };
    }

    const duplicate = db.DoiTra.some(
      (dt) => dt.MaDh === MaDh && dt.MaBt === MaBt && (dt.Ketqua === 'Chờ duyệt' || dt.Ketqua === 'Đã duyệt')
    );
    if (duplicate) {
      return { ok: false, message: 'Sản phẩm thuộc đơn hàng này đã có yêu cầu đổi trả đang chờ xử lý hoặc đã được duyệt.' };
    }

    const MaDoitra = nextId(db.DoiTra, 'MaDoitra', 'DT', 3);
    const estRefund = Loai === 'Trả hàng hoàn tiền' ? Number(line.Dongia) * reqQty : 0;

    const record = {
      MaDoitra,
      MaDh,
      MaBt,
      Soluong: reqQty,
      MaKh: session.id,
      MaNv: '',
      Loai,
      Lydo: String(Lydo).trim(),
      Ngaydoitra: todayISO(),
      Ngayxuly: '',
      Tienhoan: estRefund,
      Ketqua: 'Chờ duyệt',
      GhichuXuLy: ''
    };
    db.DoiTra.unshift(record);
    saveDB(db);
    return { ok: true, record, message: `Đã gửi yêu cầu đổi trả ${MaDoitra} thành công.` };
  }

  function cancelReturnRequest(MaDoitra, MaKh) {
    const db = loadDB();
    const dt = db.DoiTra.find((r) => r.MaDoitra === MaDoitra && r.MaKh === MaKh);
    if (!dt) return { ok: false, message: 'Không tìm thấy yêu cầu đổi trả.' };
    if (dt.Ketqua !== 'Chờ duyệt') {
      return { ok: false, message: 'Chỉ được phép hủy yêu cầu khi đang ở trạng thái "Chờ duyệt".' };
    }
    dt.Ketqua = 'Đã hủy';
    saveDB(db);
    return { ok: true, message: `Đã hủy yêu cầu đổi trả ${MaDoitra}.` };
  }

  function processReturnRequest(MaDoitra, decision, TienhoanInput, GhichuXuLy, actorId) {
    const db = loadDB();
    const dt = db.DoiTra.find((r) => r.MaDoitra === MaDoitra);
    if (!dt) return { ok: false, message: 'Không tìm thấy phiếu đổi trả.' };
    if (dt.Ketqua !== 'Chờ duyệt') {
      return { ok: false, message: 'Phiếu đổi trả này đã được xử lý trước đó.' };
    }

    if (decision === 'Từ chối' && (!GhichuXuLy || !String(GhichuXuLy).trim())) {
      return { ok: false, message: 'Vui lòng nhập lý do từ chối để thông báo cho khách hàng.' };
    }

    dt.Ketqua = decision; // 'Đã duyệt' | 'Từ chối'
    dt.Ngayxuly = todayISO();
    dt.GhichuXuLy = String(GhichuXuLy || '').trim();
    dt.MaNv = actorId && actorId.startsWith('NV') ? actorId : (db.NhanVien[0]?.MaNv || 'NV01');

    if (decision === 'Đã duyệt') {
      dt.Tienhoan = dt.Loai === 'Trả hàng hoàn tiền' ? Number(TienhoanInput || dt.Tienhoan || 0) : 0;
      // Nhập hoàn sản phẩm trả về lại kho biến thể
      const bt = db.BienTheSanPham.find((v) => v.MaBt === dt.MaBt);
      if (bt) {
        bt.Soluongton = Number(bt.Soluongton) + Number(dt.Soluong || 1);
      }
    } else {
      dt.Tienhoan = 0;
    }

    saveDB(db);
    return { ok: true, record: dt, message: `Đã cập nhật phiếu ${MaDoitra}: ${decision}.` };
  }

  // -------------------- SUPPORT TICKETS (PhieuHoTro) --------------------
  function createSupportTicket({ MaKh, MaDh, Loaivande, Mucdouutien, Noidung, actorId }) {
    const db = loadDB();
    if (!MaKh) return { ok: false, message: 'Vui lòng chọn khách hàng.' };
    if (!Noidung || String(Noidung).trim().length < 5) {
      return { ok: false, message: 'Vui lòng nhập nội dung cần hỗ trợ (tối thiểu 5 ký tự).' };
    }
    const MaPhieu = nextId(db.PhieuHoTro, 'MaPhieu', 'HT', 3);
    const isStaffCreated = Boolean(actorId);
    const ticket = {
      MaPhieu,
      MaKh,
      MaNv: isStaffCreated && actorId.startsWith('NV') ? actorId : '',
      MaDh: MaDh || '',
      Loaivande: Loaivande || 'Tư vấn chọn size',
      Mucdouutien: Mucdouutien || 'Trung bình',
      Noidung: String(Noidung).trim(),
      Phanhoi: '',
      Ngaytao: todayISO(),
      Trangthai: isStaffCreated ? 'Đang xử lý' : 'Chờ xử lý'
    };
    db.PhieuHoTro.unshift(ticket);
    saveDB(db);
    return { ok: true, ticket, message: `Đã tạo phiếu hỗ trợ ${MaPhieu}.` };
  }

  function updateSupportTicket(MaPhieu, { Trangthai, Phanhoi, actorId }) {
    const db = loadDB();
    const ticket = db.PhieuHoTro.find((t) => t.MaPhieu === MaPhieu);
    if (!ticket) return { ok: false, message: 'Không tìm thấy phiếu hỗ trợ.' };

    ticket.Trangthai = Trangthai || ticket.Trangthai;
    if (Phanhoi !== undefined) ticket.Phanhoi = String(Phanhoi).trim();
    if (actorId && actorId.startsWith('NV')) ticket.MaNv = actorId;
    else if (!ticket.MaNv && db.NhanVien.length) ticket.MaNv = db.NhanVien[0].MaNv;

    saveDB(db);
    return { ok: true, ticket, message: `Đã cập nhật phiếu hỗ trợ ${MaPhieu}.` };
  }

  // -------------------- IMPORT GOODS (NhapHang - Bảng 3.23 & sp_NhapHang) --------------------
  function createImportReceipt({ MaNcc, Macong, TrangthaiTT, lines, actorId }) {
    const db = loadDB();
    if (!MaNcc) return { ok: false, message: 'Vui lòng chọn nhà cung cấp.' };
    if (!Macong) return { ok: false, message: 'Vui lòng chọn phương thức thanh toán.' };
    if (!Array.isArray(lines) || lines.length === 0) {
      return { ok: false, message: 'Phiếu nhập phải có ít nhất một dòng biến thể sản phẩm.' };
    }

    let tongtien = 0;
    for (const ln of lines) {
      const qty = parseInt(ln.Soluong, 10);
      const price = Number(ln.Gianhap);
      const bt = db.BienTheSanPham.find((v) => v.MaBt === ln.MaBt);
      if (!bt) return { ok: false, message: `Biến thể ${ln.MaBt} không tồn tại.` };
      if (isNaN(qty) || qty <= 0) return { ok: false, message: 'Số lượng nhập phải lớn hơn 0.' };
      if (isNaN(price) || price <= 0) return { ok: false, message: 'Giá nhập phải lớn hơn 0.' };
      tongtien += qty * price;
    }

    const MaNh = nextId(db.NhapHang, 'MaNh', 'NH', 3);
    const MaNv = actorId && actorId.startsWith('NV') ? actorId : (db.NhanVien[0]?.MaNv || 'NV01');

    const receipt = {
      MaNh,
      MaNv,
      MaNcc,
      Macong,
      Ngaynhap: todayISO(),
      Tongtien: tongtien,
      TrangthaiTT: TrangthaiTT || 'Đã thanh toán'
    };

    db.NhapHang.unshift(receipt);
    lines.forEach((ln) => {
      const qty = parseInt(ln.Soluong, 10);
      const price = Number(ln.Gianhap);
      db.ChiTietNhapHang.push({
        MaNh,
        MaBt: ln.MaBt,
        Soluong: qty,
        Gianhap: price
      });
      const bt = db.BienTheSanPham.find((v) => v.MaBt === ln.MaBt);
      if (bt) {
        bt.Soluongton = Number(bt.Soluongton) + qty;
      }
    });

    saveDB(db);
    return { ok: true, receipt, message: `Đã lập hóa đơn nhập hàng ${MaNh} và cộng tồn kho thành công.` };
  }

  // -------------------- ADMIN CRUD OPERATIONS --------------------
  // 1. Sản phẩm & Biến thể (tách biệt với Nhập hàng!)
  function saveProduct(payload, isEdit = false) {
    const db = loadDB();
    const { MaSp, TenSp, Maloai, MaTh, GiaBan, Chatlieu, Mota, Hinhanh, Noibat, variants } = payload;

    if (!TenSp || !Maloai || !MaTh || Number(GiaBan) <= 0) {
      return { ok: false, message: 'Vui lòng nhập tên sản phẩm, danh mục, thương hiệu và giá bán hợp lệ (> 0).' };
    }

    let targetId = MaSp ? String(MaSp).trim().toUpperCase() : '';
    if (!isEdit) {
      if (!targetId) targetId = nextId(db.SanPham, 'MaSp', 'SP', 2);
      if (db.SanPham.some((p) => p.MaSp.toUpperCase() === targetId)) {
        return { ok: false, message: `Mã sản phẩm ${targetId} đã tồn tại.` };
      }
      db.SanPham.unshift({
        MaSp: targetId,
        Maloai,
        MaTh,
        TenSp: TenSp.trim(),
        GiaBan: Number(GiaBan),
        Chatlieu: (Chatlieu || 'Da bê Full-grain').trim(),
        Mota: (Mota || '').trim(),
        Hinhanh: Hinhanh || 'assets/images/shoes/oxford-cognac.jpg',
        AnhTheoMau: {},
        Noibat: Boolean(Noibat)
      });
    } else {
      const sp = db.SanPham.find((p) => p.MaSp === targetId);
      if (!sp) return { ok: false, message: 'Không tìm thấy sản phẩm để cập nhật.' };
      sp.TenSp = TenSp.trim();
      sp.Maloai = Maloai;
      sp.MaTh = MaTh;
      sp.GiaBan = Number(GiaBan);
      sp.Chatlieu = (Chatlieu || '').trim();
      sp.Mota = (Mota || '').trim();
      if (Hinhanh) sp.Hinhanh = Hinhanh;
      sp.Noibat = Boolean(Noibat);
    }

    // Xử lý danh sách biến thể Size & Màu (Biến thể mới khởi tạo Soluongton = 0, muốn tăng tồn phải qua Nhập hàng!)
    if (Array.isArray(variants) && variants.length > 0) {
      variants.forEach((v) => {
        const sizeNum = parseInt(v.Size, 10);
        const colorStr = String(v.Mau || '').trim();
        if (!sizeNum || !colorStr) return;

        const existingBt = db.BienTheSanPham.find(
          (bt) => bt.MaSp === targetId && Number(bt.Size) === sizeNum && bt.Mau.toLowerCase() === colorStr.toLowerCase()
        );
        if (!existingBt) {
          const newMaBt = nextId(db.BienTheSanPham, 'MaBt', 'BT', 2);
          db.BienTheSanPham.push({
            MaBt: newMaBt,
            MaSp: targetId,
            Size: sizeNum,
            Mau: colorStr,
            Soluongton: 0
          });
        }
      });
    }

    saveDB(db);
    return { ok: true, MaSp: targetId, message: isEdit ? 'Đã cập nhật thông tin sản phẩm.' : `Đã tạo sản phẩm ${targetId}. Vui lòng vào Quản lý kho để lập phiếu nhập hàng.` };
  }

  function deleteProduct(MaSp) {
    const db = loadDB();
    const variants = db.BienTheSanPham.filter((bt) => bt.MaSp === MaSp);
    const variantIds = variants.map((v) => v.MaBt);

    const hasStock = variants.some((v) => Number(v.Soluongton) > 0);
    if (hasStock) {
      return { ok: false, message: 'Không thể xóa sản phẩm đang còn tồn kho (> 0).' };
    }
    const inOrders = db.ChiTietDonHang.some((ct) => variantIds.includes(ct.MaBt));
    const inImports = db.ChiTietNhapHang.some((ct) => variantIds.includes(ct.MaBt));
    if (inOrders || inImports) {
      return { ok: false, message: 'Không thể xóa sản phẩm đã phát sinh hóa đơn bán hoặc phiếu nhập kho.' };
    }

    db.SanPham = db.SanPham.filter((p) => p.MaSp !== MaSp);
    db.BienTheSanPham = db.BienTheSanPham.filter((bt) => bt.MaSp !== MaSp);
    saveDB(db);
    return { ok: true, message: `Đã xóa sản phẩm ${MaSp}.` };
  }

  // 2. Loại sản phẩm & Thương hiệu
  function saveCategory({ Maloai, Tenloai, Mota }, isEdit = false) {
    const db = loadDB();
    if (!Tenloai || !Tenloai.trim()) return { ok: false, message: 'Vui lòng nhập tên loại sản phẩm.' };
    const cleanName = Tenloai.trim();

    if (!isEdit) {
      const id = Maloai ? Maloai.trim().toUpperCase() : nextId(db.LoaiSanPham, 'Maloai', 'LSP', 2);
      if (db.LoaiSanPham.some((l) => l.Maloai === id || l.Tenloai.toLowerCase() === cleanName.toLowerCase())) {
        return { ok: false, message: 'Mã loại hoặc tên loại sản phẩm đã bị trùng.' };
      }
      db.LoaiSanPham.push({ Maloai: id, Tenloai: cleanName, Mota: (Mota || '').trim() });
    } else {
      const cat = db.LoaiSanPham.find((l) => l.Maloai === Maloai);
      if (!cat) return { ok: false, message: 'Không tìm thấy loại sản phẩm.' };
      cat.Tenloai = cleanName;
      cat.Mota = (Mota || '').trim();
    }
    saveDB(db);
    return { ok: true, message: isEdit ? 'Đã cập nhật loại sản phẩm.' : 'Đã thêm loại sản phẩm mới.' };
  }

  function deleteCategory(Maloai) {
    const db = loadDB();
    if (db.SanPham.some((p) => p.Maloai === Maloai)) {
      return { ok: false, message: 'Không thể xóa loại sản phẩm đang có sản phẩm trực thuộc.' };
    }
    db.LoaiSanPham = db.LoaiSanPham.filter((l) => l.Maloai !== Maloai);
    saveDB(db);
    return { ok: true, message: 'Đã xóa loại sản phẩm.' };
  }

  function saveBrand({ MaTh, TenTh, Xuatxu }, isEdit = false) {
    const db = loadDB();
    if (!TenTh || !Xuatxu) return { ok: false, message: 'Vui lòng nhập tên thương hiệu và xuất xứ.' };
    if (!isEdit) {
      const id = MaTh ? MaTh.trim().toUpperCase() : nextId(db.ThuongHieu, 'MaTh', 'TH', 2);
      if (db.ThuongHieu.some((t) => t.MaTh === id)) {
        return { ok: false, message: 'Mã thương hiệu đã tồn tại.' };
      }
      db.ThuongHieu.push({ MaTh: id, TenTh: TenTh.trim(), Xuatxu: Xuatxu.trim() });
    } else {
      const th = db.ThuongHieu.find((t) => t.MaTh === MaTh);
      if (!th) return { ok: false, message: 'Không tìm thấy thương hiệu.' };
      th.TenTh = TenTh.trim();
      th.Xuatxu = Xuatxu.trim();
    }
    saveDB(db);
    return { ok: true, message: 'Đã lưu thông tin thương hiệu.' };
  }

  function deleteBrand(MaTh) {
    const db = loadDB();
    if (db.SanPham.some((p) => p.MaTh === MaTh)) {
      return { ok: false, message: 'Không thể xóa thương hiệu đang gắn với sản phẩm.' };
    }
    db.ThuongHieu = db.ThuongHieu.filter((t) => t.MaTh !== MaTh);
    saveDB(db);
    return { ok: true, message: 'Đã xóa thương hiệu.' };
  }

  // 3. Nhà cung cấp (Bảng 3.1 - 3.4)
  function saveSupplier({ MaNcc, TenNcc, Sdt, Email, Diachi }, isEdit = false) {
    const db = loadDB();
    if (!TenNcc || !Sdt || !Diachi) {
      return { ok: false, message: 'Vui lòng nhập đầy đủ Tên NCC, SĐT và Địa chỉ.' };
    }
    if (!isEdit) {
      const id = MaNcc ? MaNcc.trim().toUpperCase() : nextId(db.NhaCungCap, 'MaNcc', 'NCC', 2);
      if (db.NhaCungCap.some((n) => n.MaNcc === id)) {
        return { ok: false, message: `Mã nhà cung cấp ${id} đã bị trùng.` };
      }
      db.NhaCungCap.push({
        MaNcc: id,
        TenNcc: TenNcc.trim(),
        Sdt: Sdt.trim(),
        Email: (Email || '').trim(),
        Diachi: Diachi.trim()
      });
    } else {
      const ncc = db.NhaCungCap.find((n) => n.MaNcc === MaNcc);
      if (!ncc) return { ok: false, message: 'Không tìm thấy nhà cung cấp.' };
      ncc.TenNcc = TenNcc.trim();
      ncc.Sdt = Sdt.trim();
      ncc.Email = (Email || '').trim();
      ncc.Diachi = Diachi.trim();
    }
    saveDB(db);
    return { ok: true, message: isEdit ? 'Đã cập nhật thông tin nhà cung cấp.' : 'Đã thêm nhà cung cấp mới.' };
  }

  function deleteSupplier(MaNcc) {
    const db = loadDB();
    if (db.NhapHang.some((nh) => nh.MaNcc === MaNcc)) {
      return { ok: false, message: 'Nhà cung cấp đang có phiếu nhập hàng liên quan, không được phép xóa.' };
    }
    db.NhaCungCap = db.NhaCungCap.filter((n) => n.MaNcc !== MaNcc);
    saveDB(db);
    return { ok: true, message: 'Đã xóa nhà cung cấp khỏi hệ thống.' };
  }

  // 4. Khách hàng (Bảng 3.9 - 3.12)
  function saveCustomer(payload, isEdit = false) {
    const db = loadDB();
    const { MaKh, TenKh, Sdt, Email, Diachi, Matkhau, Diemtichluy } = payload;
    if (!TenKh || !Sdt || !Email || !Diachi) {
      return { ok: false, message: 'Vui lòng nhập đủ Họ tên, SĐT, Email và Địa chỉ.' };
    }
    if (!isEdit) {
      const id = MaKh ? MaKh.trim().toUpperCase() : nextId(db.KhachHang, 'MaKh', 'KH', 2);
      if (db.KhachHang.some((k) => k.MaKh === id || k.Sdt === Sdt.trim() || k.Email.toLowerCase() === Email.trim().toLowerCase())) {
        return { ok: false, message: 'Mã KH, Số điện thoại hoặc Email đã tồn tại.' };
      }
      db.KhachHang.push({
        MaKh: id,
        TenKh: TenKh.trim(),
        Sdt: Sdt.trim(),
        Email: Email.trim().toLowerCase(),
        Diachi: Diachi.trim(),
        Matkhau: Matkhau || '123456',
        Diemtichluy: Number(Diemtichluy || 0)
      });
    } else {
      const kh = db.KhachHang.find((k) => k.MaKh === MaKh);
      if (!kh) return { ok: false, message: 'Không tìm thấy khách hàng.' };
      const dupPhone = db.KhachHang.some((k) => k.MaKh !== MaKh && k.Sdt === Sdt.trim());
      if (dupPhone) return { ok: false, message: 'Số điện thoại này đã thuộc về khách hàng khác.' };
      kh.TenKh = TenKh.trim();
      kh.Sdt = Sdt.trim();
      kh.Email = Email.trim().toLowerCase();
      kh.Diachi = Diachi.trim();
      if (Matkhau && Matkhau.trim()) kh.Matkhau = Matkhau.trim();
      if (Diemtichluy !== undefined) kh.Diemtichluy = Number(Diemtichluy);
    }
    saveDB(db);
    return { ok: true, message: isEdit ? 'Đã cập nhật thông tin khách hàng.' : 'Đã thêm khách hàng mới.' };
  }

  function deleteCustomer(MaKh) {
    const db = loadDB();
    if (db.DonHang.some((o) => o.MaKh === MaKh)) {
      return { ok: false, message: 'Khách hàng đang có lịch sử đơn hàng, hệ thống không cho phép xóa.' };
    }
    db.KhachHang = db.KhachHang.filter((k) => k.MaKh !== MaKh);
    saveDB(db);
    return { ok: true, message: 'Đã xóa khách hàng.' };
  }

  // 5. Nhân viên (Bảng 3.5 - 3.8)
  function saveEmployee(payload, isEdit = false) {
    const db = loadDB();
    const { MaNv, TenNv, Ngaysinh, Gioitinh, Sdt, Email, Diachi, Chucvu, Luong, Matkhau, Trangthai } = payload;
    if (!TenNv || !Sdt || !Email || !Chucvu) {
      return { ok: false, message: 'Vui lòng nhập đầy đủ Họ tên, SĐT, Email và Chức vụ.' };
    }
    if (!isEdit) {
      const id = MaNv ? MaNv.trim().toUpperCase() : nextId(db.NhanVien, 'MaNv', 'NV', 2);
      if (db.NhanVien.some((n) => n.MaNv === id || n.Email.toLowerCase() === Email.trim().toLowerCase())) {
        return { ok: false, message: 'Mã nhân viên hoặc Email đã tồn tại.' };
      }
      db.NhanVien.push({
        MaNv: id,
        MaChu: 'CHU01',
        TenNv: TenNv.trim(),
        Ngaysinh: Ngaysinh || '2002-01-01',
        Gioitinh: Gioitinh || 'Nam',
        Sdt: Sdt.trim(),
        Email: Email.trim().toLowerCase(),
        Diachi: (Diachi || '').trim(),
        Chucvu: Chucvu.trim(),
        Luong: Number(Luong || 8500000),
        Matkhau: Matkhau || '123456',
        Trangthai: Trangthai || 'Đang làm việc'
      });
    } else {
      const nv = db.NhanVien.find((n) => n.MaNv === MaNv);
      if (!nv) return { ok: false, message: 'Không tìm thấy nhân viên.' };
      nv.TenNv = TenNv.trim();
      nv.Ngaysinh = Ngaysinh || nv.Ngaysinh;
      nv.Gioitinh = Gioitinh || nv.Gioitinh;
      nv.Sdt = Sdt.trim();
      nv.Email = Email.trim().toLowerCase();
      nv.Diachi = (Diachi || '').trim();
      nv.Chucvu = Chucvu.trim();
      nv.Luong = Number(Luong || nv.Luong);
      if (Matkhau && Matkhau.trim()) nv.Matkhau = Matkhau.trim();
      if (Trangthai) nv.Trangthai = Trangthai;
    }
    saveDB(db);
    return { ok: true, message: isEdit ? 'Đã cập nhật hồ sơ nhân viên.' : 'Đã thêm nhân viên mới.' };
  }

  function deleteEmployee(MaNv) {
    const db = loadDB();
    const nv = db.NhanVien.find((n) => n.MaNv === MaNv);
    if (!nv) return { ok: false, message: 'Không tìm thấy nhân viên.' };

    const hasLinked =
      db.DonHang.some((o) => o.MaNv === MaNv) ||
      db.NhapHang.some((nh) => nh.MaNv === MaNv) ||
      db.PhieuHoTro.some((ht) => ht.MaNv === MaNv) ||
      db.DoiTra.some((dt) => dt.MaNv === MaNv);

    if (hasLinked) {
      nv.Trangthai = 'Ngừng làm việc';
      saveDB(db);
      return {
        ok: true,
        softDeleted: true,
        message: `Nhân viên ${MaNv} đã có hóa đơn/phiếu nghiệp vụ liên quan nên không xóa cứng mà được chuyển sang trạng thái "Ngừng làm việc".`
      };
    }

    db.NhanVien = db.NhanVien.filter((n) => n.MaNv !== MaNv);
    saveDB(db);
    return { ok: true, message: `Đã xóa nhân viên ${MaNv}.` };
  }

  // 6. Khuyến mãi & Lưu nhật ký Báo cáo
  function savePromo(payload, isEdit = false) {
    const db = loadDB();
    const { MaKm, Code, TenKm, Loaigiam, Giatri, DonToiThieu, Tungay, Denngay, Trangthai } = payload;
    if (!Code || !TenKm || Number(Giatri) <= 0) {
      return { ok: false, message: 'Vui lòng nhập Mã code, Tên chương trình và Giá trị giảm > 0.' };
    }
    if (Tungay && Denngay && Tungay > Denngay) {
      return { ok: false, message: 'Ngày bắt đầu không được lớn hơn ngày kết thúc.' };
    }
    if (!isEdit) {
      const id = nextId(db.KhuyenMai, 'MaKm', 'KM', 2);
      if (db.KhuyenMai.some((k) => k.Code.toUpperCase() === Code.trim().toUpperCase())) {
        return { ok: false, message: 'Mã code khuyến mãi đã tồn tại.' };
      }
      db.KhuyenMai.unshift({
        MaKm: id,
        Code: Code.trim().toUpperCase(),
        TenKm: TenKm.trim(),
        Loaigiam: Loaigiam || 'percent',
        Giatri: Number(Giatri),
        DonToiThieu: Number(DonToiThieu || 0),
        Tungay: Tungay || todayISO(),
        Denngay: Denngay || '2026-12-31',
        Trangthai: Trangthai || 'Đang áp dụng'
      });
    } else {
      const km = db.KhuyenMai.find((k) => k.MaKm === MaKm);
      if (!km) return { ok: false, message: 'Không tìm thấy chương trình khuyến mãi.' };
      km.Code = Code.trim().toUpperCase();
      km.TenKm = TenKm.trim();
      km.Loaigiam = Loaigiam;
      km.Giatri = Number(Giatri);
      km.DonToiThieu = Number(DonToiThieu || 0);
      km.Tungay = Tungay;
      km.Denngay = Denngay;
      km.Trangthai = Trangthai;
    }
    saveDB(db);
    return { ok: true, message: 'Đã lưu chương trình khuyến mãi.' };
  }

  function logReport({ LoaiBc, Tungay, Denngay }) {
    const db = loadDB();
    const MaBc = nextId(db.BaoCao, 'MaBc', 'BC', 3);
    db.BaoCao.unshift({
      MaBc,
      MaChu: 'CHU01',
      LoaiBc,
      Tungay,
      Denngay,
      Ngaylap: todayISO()
    });
    saveDB(db);
    return { ok: true, MaBc };
  }

  // -------------------- UNIFIED METRICS (Dashboard & Reports) --------------------
  function getUnifiedMetrics(fromDate = '', toDate = '') {
    const db = loadDB();
    const validOrders = db.DonHang.filter((o) => {
      if (o.Trangthai === 'Đã hủy') return false;
      if (fromDate && o.Ngaydat < fromDate) return false;
      if (toDate && o.Ngaydat > toDate) return false;
      return true;
    });

    const approvedReturns = db.DoiTra.filter((dt) => {
      if (dt.Ketqua !== 'Đã duyệt') return false;
      const d = dt.Ngayxuly || dt.Ngaydoitra;
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      return true;
    });

    const grossRevenue = validOrders.reduce((s, o) => s + Number(o.Tongtien || 0), 0);
    const refundedTotal = approvedReturns.reduce((s, r) => s + Number(r.Tienhoan || 0), 0);
    const netRevenue = Math.max(0, grossRevenue - refundedTotal);

    const totalStockUnits = db.BienTheSanPham.reduce((s, bt) => s + Number(bt.Soluongton || 0), 0);
    const lowStockVariants = db.BienTheSanPham.filter((bt) => Number(bt.Soluongton) <= 3);

    return {
      totalOrders: validOrders.length,
      allOrdersCount: db.DonHang.length,
      grossRevenue,
      refundedTotal,
      netRevenue,
      totalProducts: db.SanPham.length,
      totalVariants: db.BienTheSanPham.length,
      totalStockUnits,
      lowStockCount: lowStockVariants.length,
      totalCustomers: db.KhachHang.length,
      pendingOrdersCount: db.DonHang.filter((o) => o.Trangthai === 'Chờ xác nhận').length,
      pendingReturnsCount: db.DoiTra.filter((r) => r.Ketqua === 'Chờ duyệt').length,
      pendingSupportCount: db.PhieuHoTro.filter((s) => s.Trangthai !== 'Đã hoàn thành').length
    };
  }

  window.Store = {
    loadDB,
    saveDB,
    resetDB,
    todayISO,
    nextId,
    getCurrentUser,
    setCurrentUser,
    login,
    logout,
    registerCustomer,
    getProductsEnriched,
    getProductById,
    getVariantDetails,
    getCart,
    getCartDetailed,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    getAppliedPromoCode,
    setAppliedPromoCode,
    validatePromoCode,
    placeOrder,
    updateOrderStatus,
    getEligibleOrdersForReturn,
    createReturnRequest,
    cancelReturnRequest,
    processReturnRequest,
    createSupportTicket,
    updateSupportTicket,
    createImportReceipt,
    saveProduct,
    deleteProduct,
    saveCategory,
    deleteCategory,
    saveBrand,
    deleteBrand,
    saveSupplier,
    deleteSupplier,
    saveCustomer,
    deleteCustomer,
    saveEmployee,
    deleteEmployee,
    savePromo,
    logReport,
    getUnifiedMetrics
  };
})();

