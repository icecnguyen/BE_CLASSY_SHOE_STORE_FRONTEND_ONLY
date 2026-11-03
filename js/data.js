/* ==========================================================================
   BE CLASSY — SEED DATA (data.js)
   Bám sát 100% thiết kế CSDL & Biểu đồ lớp thực thể trong BTL_UML_fix.docx
   ========================================================================== */

window.BECLASSY_SEED = {
  version: '1.0.2',

  // Bảng 4.1: ChuCuaHang
  ChuCuaHang: [
    {
      MaChu: 'CHU01',
      TenChu: 'Nguyễn Tiến Anh',
      Sdt: '0912345678',
      Email: 'admin@beclassy.vn',
      Matkhau: '123456'
    }
  ],

  // Bảng 4.2: NhanVien (mở rộng thêm các thuộc tính form Bảng 3.6)
  NhanVien: [
    {
      MaNv: 'NV01',
      MaChu: 'CHU01',
      TenNv: 'Nguyễn Anh Quân',
      Ngaysinh: '2003-05-14',
      Gioitinh: 'Nam',
      Sdt: '0987654321',
      Email: 'quan.na@beclassy.vn',
      Matkhau: '123456',
      Diachi: 'Số 45 Điện Biên, P. Lê Lợi, TP. Hưng Yên',
      Chucvu: 'Nhân viên bán hàng',
      Luong: 9500000,
      Trangthai: 'Đang làm việc'
    },
    {
      MaNv: 'NV02',
      MaChu: 'CHU01',
      TenNv: 'Phạm Thùy Linh',
      Ngaysinh: '2002-09-20',
      Gioitinh: 'Nữ',
      Sdt: '0978123456',
      Email: 'linh.pt@beclassy.vn',
      Matkhau: '123456',
      Diachi: 'Số 18 Nguyễn Văn Linh, P. Hiến Nam, TP. Hưng Yên',
      Chucvu: 'Nhân viên thủ kho',
      Luong: 9000000,
      Trangthai: 'Đang làm việc'
    },
    {
      MaNv: 'NV03',
      MaChu: 'CHU01',
      TenNv: 'Hoàng Văn Minh',
      Ngaysinh: '2001-12-08',
      Gioitinh: 'Nam',
      Sdt: '0934567890',
      Email: 'minh.hv@beclassy.vn',
      Matkhau: '123456',
      Diachi: 'Thị trấn Bần Yên Nhân, Mỹ Hào, Hưng Yên',
      Chucvu: 'Chăm sóc khách hàng',
      Luong: 8800000,
      Trangthai: 'Đang làm việc'
    }
  ],

  // Bảng 4.3: KhachHang
  KhachHang: [
    {
      MaKh: 'KH01',
      TenKh: 'Trần Minh Đức',
      Sdt: '0904112233',
      Email: 'khachhang@gmail.com',
      Matkhau: '123456',
      Diachi: 'Số 128 Phố Huế, Quận Hai Bà Trưng, Hà Nội',
      Diemtichluy: 420
    },
    {
      MaKh: 'KH02',
      TenKh: 'Lê Hoàng Nam',
      Sdt: '0915223344',
      Email: 'nam.lehoang@gmail.com',
      Matkhau: '123456',
      Diachi: 'Số 62 Chu Mạnh Trinh, P. Hiến Nam, TP. Hưng Yên',
      Diemtichluy: 260
    },
    {
      MaKh: 'KH03',
      TenKh: 'Vũ Tuấn Kiệt',
      Sdt: '0936778899',
      Email: 'kiet.vt@outlook.com',
      Matkhau: '123456',
      Diachi: 'Số 210 Lạch Tray, Quận Ngô Quyền, Hải Phòng',
      Diemtichluy: 185
    },
    {
      MaKh: 'KH04',
      TenKh: 'Đặng Quốc Bảo',
      Sdt: '0968445566',
      Email: 'quocbao.dang@gmail.com',
      Matkhau: '123456',
      Diachi: 'Tòa R2 Vinhomes Royal City, Thanh Xuân, Hà Nội',
      Diemtichluy: 510
    },
    {
      MaKh: 'KH05',
      TenKh: 'Ngô Thanh Tùng',
      Sdt: '0942998877',
      Email: 'tung.ngo@gmail.com',
      Matkhau: '123456',
      Diachi: 'Số 19 Trần Hưng Đạo, TP. Hải Dương',
      Diemtichluy: 90
    }
  ],

  // Bảng 4.4: ThuongHieu
  ThuongHieu: [
    { MaTh: 'TH01', TenTh: 'BE CLASSY Bespoke', Xuatxu: 'Việt Nam' },
    { MaTh: 'TH02', TenTh: 'BE CLASSY Classic', Xuatxu: 'Việt Nam' },
    { MaTh: 'TH03', TenTh: 'Regal Heritage', Xuatxu: 'Nhật Bản' },
    { MaTh: 'TH04', TenTh: 'Velasca Milano', Xuatxu: 'Ý' }
  ],

  // Bảng 4.5: LoaiSanPham
  LoaiSanPham: [
    { Maloai: 'LSP01', Tenloai: 'Giày Oxford', Mota: 'Phom dáng khép kín chuẩn mực cho vest và trang phục trang trọng.' },
    { Maloai: 'LSP02', Tenloai: 'Giày Derby', Mota: 'Mui giày mở linh hoạt, thoải mái cho ngày làm việc năng động.' },
    { Maloai: 'LSP03', Tenloai: 'Giày Loafer', Mota: 'Giày lười da thủ công thanh lịch, tiện dụng không dây buộc.' },
    { Maloai: 'LSP04', Tenloai: 'Chelsea Boots', Mota: 'Cổ lửng ôm chân sắc sảo, khâu đế bền bỉ qua nhiều mùa.' },
    { Maloai: 'LSP05', Tenloai: 'Monk Strap', Mota: 'Thiết kế khóa cài kim loại tạo điểm nhấn lịch lãm cho quý ông.' }
  ],

  // Bảng 4.6: SanPham
  SanPham: [
    {
      MaSp: 'SP01',
      Maloai: 'LSP01',
      MaTh: 'TH01',
      TenSp: 'Classic Cap-Toe Oxford',
      GiaBan: 2150000,
      Chatlieu: 'Da bê Full-grain Ý, đế da khâu Goodyear',
      Mota: 'Mẫu Cap-Toe Oxford kinh điển của BE CLASSY được chế tác trên phom Last BC-01 thon gọn vừa vặn bàn chân người Việt. Da bê nguyên tấm thảo mộc đánh màu thủ công kết hợp lót trong da bê mềm thoáng khí.',
      Hinhanh: 'assets/images/shoes/oxford-cognac.jpg',
      AnhTheoMau: {
        'Nâu Cognac': 'assets/images/shoes/oxford-cognac.jpg',
        'Đen': 'assets/images/shoes/oxford-black.jpg',
        'Đỏ Burgundy': 'assets/images/shoes/oxford-burgundy.jpg'
      },
      Noibat: true
    },
    {
      MaSp: 'SP02',
      Maloai: 'LSP01',
      MaTh: 'TH01',
      TenSp: 'Sovereign Black Box-Calf Oxford',
      GiaBan: 2350000,
      Chatlieu: 'Da bê Box-Calf Pháp, đế da 2 lớp chống trượt',
      Mota: 'Đôi giày Oxford đen tuyền trang trọng dành cho các sự kiện ký kết, lễ cưới và công sở cao cấp. Mũi giày được đánh bóng gương nhẹ cùng đường chỉ khâu chìm tinh xảo.',
      Hinhanh: 'assets/images/shoes/oxford-black.jpg',
      AnhTheoMau: {
        'Đen': 'assets/images/shoes/oxford-black.jpg',
        'Nâu Cognac': 'assets/images/shoes/oxford-cognac.jpg'
      },
      Noibat: true
    },
    {
      MaSp: 'SP03',
      Maloai: 'LSP01',
      MaTh: 'TH04',
      TenSp: 'Milano Oxblood Patina Oxford',
      GiaBan: 2590000,
      Chatlieu: 'Da bê nhuộm Patina thủ công, khâu McKay',
      Mota: 'Sắc đỏ rượu vang Burgundy được nghệ nhân lên màu nhiều lớp tạo chiều sâu sang trọng. Phù hợp phối cùng quần âu xám than, xanh navy hoặc nâu trầm.',
      Hinhanh: 'assets/images/shoes/oxford-burgundy.jpg',
      AnhTheoMau: {
        'Đỏ Burgundy': 'assets/images/shoes/oxford-burgundy.jpg',
        'Đen': 'assets/images/shoes/oxford-black.jpg'
      },
      Noibat: true
    },
    {
      MaSp: 'SP04',
      Maloai: 'LSP02',
      MaTh: 'TH03',
      TenSp: 'Norwegian Split-Toe Derby',
      GiaBan: 2450000,
      Chatlieu: 'Da bò hạt sáp Walnut, viền Storm Welt chống nước',
      Mota: 'Thiết kế mũi rẽ Split-Toe đặc trưng Bắc Âu kết hợp hệ thống dây mở của dòng Derby giúp mu bàn chân cao luôn thoải mái suốt 10 giờ di chuyển.',
      Hinhanh: 'assets/images/shoes/derby-walnut.jpg',
      AnhTheoMau: {
        'Nâu Walnut': 'assets/images/shoes/derby-walnut.jpg',
        'Nâu Đậm': 'assets/images/shoes/derby-espresso.jpg',
        'Đen': 'assets/images/shoes/derby-black.jpg'
      },
      Noibat: true
    },
    {
      MaSp: 'SP05',
      Maloai: 'LSP02',
      MaTh: 'TH02',
      TenSp: 'Contemporary Noir Derby',
      GiaBan: 1950000,
      Chatlieu: 'Da bò Nappa nguyên tấm, đế cao su khâu Blake',
      Mota: 'Phiên bản Derby tối giản dễ mang hằng ngày từ văn phòng đến những buổi gặp gỡ cuối tuần. Đế cao su tổng hợp êm ái và bám đường tốt trong điều kiện thời tiết mưa ẩm.',
      Hinhanh: 'assets/images/shoes/derby-black.jpg',
      AnhTheoMau: {
        'Đen': 'assets/images/shoes/derby-black.jpg',
        'Nâu Đậm': 'assets/images/shoes/derby-espresso.jpg'
      },
      Noibat: false
    },
    {
      MaSp: 'SP06',
      Maloai: 'LSP04',
      MaTh: 'TH01',
      TenSp: 'Heritage Espresso Chelsea Boots',
      GiaBan: 2690000,
      Chatlieu: 'Da bê nguyên tấm nâu Espresso, thun dệt đàn hồi kép',
      Mota: 'Đôi Chelsea Boots cổ lửng cắt liền mảnh hạn chế tối đa đường nối, giữ phom cổ chân đứng dáng sau nhiều năm sử dụng. Khâu đế Goodyear chắc chắn.',
      Hinhanh: 'assets/images/shoes/chelsea-brown.jpg',
      AnhTheoMau: {
        'Nâu Đậm': 'assets/images/shoes/chelsea-brown.jpg',
        'Đen': 'assets/images/shoes/chelsea-black.jpg',
        'Vàng Bò': 'assets/images/shoes/boots-tan.jpg'
      },
      Noibat: true
    },
    {
      MaSp: 'SP07',
      Maloai: 'LSP04',
      MaTh: 'TH01',
      TenSp: 'Chiselled Black Chelsea Boots',
      GiaBan: 2750000,
      Chatlieu: 'Da bê Box-Calf đen mờ, đế da gót chồng',
      Mota: 'Mũi giày vát nhẹ Chiselled sắc nét mang phong thái hiện đại tối giản. Dễ dàng kết hợp cùng quần âu ống đứng hoặc jeans tối màu.',
      Hinhanh: 'assets/images/shoes/chelsea-black.jpg',
      AnhTheoMau: {
        'Đen': 'assets/images/shoes/chelsea-black.jpg',
        'Nâu Đậm': 'assets/images/shoes/chelsea-brown.jpg'
      },
      Noibat: true
    },
    {
      MaSp: 'SP08',
      Maloai: 'LSP03',
      MaTh: 'TH02',
      TenSp: 'Saigon Gentleman Dress Loafer',
      GiaBan: 1890000,
      Chatlieu: 'Da bê đánh sáp mềm, lót đệm Memory Foam bọc da',
      Mota: 'Dòng giày lười công sở trọng lượng nhẹ, ôm gót chuẩn xác không tuột gót khi bước đi. Giải pháp lịch sự và nhanh gọn cho khí hậu nhiệt đới.',
      Hinhanh: 'assets/images/shoes/derby-espresso.jpg',
      AnhTheoMau: {
        'Nâu Đậm': 'assets/images/shoes/derby-espresso.jpg',
        'Đen': 'assets/images/shoes/editorial-black.jpg'
      },
      Noibat: true
    },
    {
      MaSp: 'SP09',
      Maloai: 'LSP05',
      MaTh: 'TH04',
      TenSp: 'Savile Antique Tan Dress Boot & Monk',
      GiaBan: 2490000,
      Chatlieu: 'Da bê thảo mộc Vàng Bò, đế da khâu thủ công',
      Mota: 'Phiên bản da thảo mộc vàng bò lên nước tự nhiên theo thời gian sử dụng, tôn lên cá tính lịch lãm cho trang phục Smart Casual.',
      Hinhanh: 'assets/images/shoes/boots-tan.jpg',
      AnhTheoMau: {
        'Vàng Bò': 'assets/images/shoes/boots-tan.jpg',
        'Nâu Cognac': 'assets/images/shoes/oxford-cognac.jpg'
      },
      Noibat: false
    },
    {
      MaSp: 'SP10',
      Maloai: 'LSP03',
      MaTh: 'TH03',
      TenSp: 'Atelier Bespoke Wholecut Edition',
      GiaBan: 2890000,
      Chatlieu: 'Da bê nguyên tấm tuyển chọn hạng A, đế khâu tay',
      Mota: 'Phiên bản giới hạn chế tác tỉ mỉ tại xưởng đóng giày thủ công của BE CLASSY, dành cho khách hàng yêu thích vẻ đẹp tối giản vượt thời gian.',
      Hinhanh: 'assets/images/shoes/editorial-espresso.jpg',
      AnhTheoMau: {
        'Nâu Đậm': 'assets/images/shoes/editorial-espresso.jpg',
        'Đen': 'assets/images/shoes/editorial-black.jpg'
      },
      Noibat: true
    }
  ],

  // Bảng 4.7: BienTheSanPham (Quản lý tồn kho theo từng Size + Màu)
  BienTheSanPham: [
    // SP01
    { MaBt: 'BT01', MaSp: 'SP01', Size: 39, Mau: 'Nâu Cognac', Soluongton: 8 },
    { MaBt: 'BT02', MaSp: 'SP01', Size: 40, Mau: 'Nâu Cognac', Soluongton: 12 },
    { MaBt: 'BT03', MaSp: 'SP01', Size: 41, Mau: 'Nâu Cognac', Soluongton: 6 },
    { MaBt: 'BT04', MaSp: 'SP01', Size: 42, Mau: 'Nâu Cognac', Soluongton: 2 },
    { MaBt: 'BT05', MaSp: 'SP01', Size: 40, Mau: 'Đen', Soluongton: 9 },
    { MaBt: 'BT06', MaSp: 'SP01', Size: 41, Mau: 'Đen', Soluongton: 5 },
    { MaBt: 'BT07', MaSp: 'SP01', Size: 41, Mau: 'Đỏ Burgundy', Soluongton: 3 },

    // SP02
    { MaBt: 'BT08', MaSp: 'SP02', Size: 39, Mau: 'Đen', Soluongton: 7 },
    { MaBt: 'BT09', MaSp: 'SP02', Size: 40, Mau: 'Đen', Soluongton: 10 },
    { MaBt: 'BT10', MaSp: 'SP02', Size: 41, Mau: 'Đen', Soluongton: 8 },
    { MaBt: 'BT11', MaSp: 'SP02', Size: 42, Mau: 'Đen', Soluongton: 0 },
    { MaBt: 'BT12', MaSp: 'SP02', Size: 41, Mau: 'Nâu Cognac', Soluongton: 4 },

    // SP03
    { MaBt: 'BT13', MaSp: 'SP03', Size: 40, Mau: 'Đỏ Burgundy', Soluongton: 6 },
    { MaBt: 'BT14', MaSp: 'SP03', Size: 41, Mau: 'Đỏ Burgundy', Soluongton: 5 },
    { MaBt: 'BT15', MaSp: 'SP03', Size: 42, Mau: 'Đỏ Burgundy', Soluongton: 2 },
    { MaBt: 'BT16', MaSp: 'SP03', Size: 40, Mau: 'Đen', Soluongton: 4 },

    // SP04
    { MaBt: 'BT17', MaSp: 'SP04', Size: 39, Mau: 'Nâu Walnut', Soluongton: 5 },
    { MaBt: 'BT18', MaSp: 'SP04', Size: 40, Mau: 'Nâu Walnut', Soluongton: 9 },
    { MaBt: 'BT19', MaSp: 'SP04', Size: 41, Mau: 'Nâu Walnut', Soluongton: 7 },
    { MaBt: 'BT20', MaSp: 'SP04', Size: 42, Mau: 'Nâu Đậm', Soluongton: 3 },
    { MaBt: 'BT21', MaSp: 'SP04', Size: 41, Mau: 'Đen', Soluongton: 6 },

    // SP05
    { MaBt: 'BT22', MaSp: 'SP05', Size: 39, Mau: 'Đen', Soluongton: 11 },
    { MaBt: 'BT23', MaSp: 'SP05', Size: 40, Mau: 'Đen', Soluongton: 14 },
    { MaBt: 'BT24', MaSp: 'SP05', Size: 41, Mau: 'Đen', Soluongton: 8 },
    { MaBt: 'BT25', MaSp: 'SP05', Size: 42, Mau: 'Nâu Đậm', Soluongton: 5 },

    // SP06
    { MaBt: 'BT26', MaSp: 'SP06', Size: 40, Mau: 'Nâu Đậm', Soluongton: 7 },
    { MaBt: 'BT27', MaSp: 'SP06', Size: 41, Mau: 'Nâu Đậm', Soluongton: 6 },
    { MaBt: 'BT28', MaSp: 'SP06', Size: 42, Mau: 'Nâu Đậm', Soluongton: 1 },
    { MaBt: 'BT29', MaSp: 'SP06', Size: 41, Mau: 'Vàng Bò', Soluongton: 4 },

    // SP07
    { MaBt: 'BT30', MaSp: 'SP07', Size: 40, Mau: 'Đen', Soluongton: 8 },
    { MaBt: 'BT31', MaSp: 'SP07', Size: 41, Mau: 'Đen', Soluongton: 6 },
    { MaBt: 'BT32', MaSp: 'SP07', Size: 42, Mau: 'Đen', Soluongton: 2 },
    { MaBt: 'BT33', MaSp: 'SP07', Size: 43, Mau: 'Đen', Soluongton: 0 },

    // SP08
    { MaBt: 'BT34', MaSp: 'SP08', Size: 39, Mau: 'Nâu Đậm', Soluongton: 9 },
    { MaBt: 'BT35', MaSp: 'SP08', Size: 40, Mau: 'Nâu Đậm', Soluongton: 10 },
    { MaBt: 'BT36', MaSp: 'SP08', Size: 41, Mau: 'Đen', Soluongton: 7 },

    // SP09
    { MaBt: 'BT37', MaSp: 'SP09', Size: 40, Mau: 'Vàng Bò', Soluongton: 5 },
    { MaBt: 'BT38', MaSp: 'SP09', Size: 41, Mau: 'Vàng Bò', Soluongton: 4 },
    { MaBt: 'BT39', MaSp: 'SP09', Size: 42, Mau: 'Nâu Cognac', Soluongton: 2 },

    // SP10
    { MaBt: 'BT40', MaSp: 'SP10', Size: 40, Mau: 'Nâu Đậm', Soluongton: 3 },
    { MaBt: 'BT41', MaSp: 'SP10', Size: 41, Mau: 'Nâu Đậm', Soluongton: 4 },
    { MaBt: 'BT42', MaSp: 'SP10', Size: 41, Mau: 'Đen', Soluongton: 2 }
  ],

  // Bảng 4.8: NhaCungCap
  NhaCungCap: [
    {
      MaNcc: 'NCC01',
      TenNcc: 'Xưởng Đóng Giày Thủ Công Phú Xuyên',
      Sdt: '02438556677',
      Email: 'lienhe@giaydaphuxuyen.vn',
      Diachi: 'Làng nghề Giày da Phú Yên, Phú Xuyên, Hà Nội'
    },
    {
      MaNcc: 'NCC02',
      TenNcc: 'Công ty TNHH Da Thuộc Đông Á',
      Sdt: '02839112288',
      Email: 'kinhdoanh@dathuocdongA.vn',
      Diachi: 'KCN Tân Bình, Quận Tân Phú, TP. Hồ Chí Minh'
    },
    {
      MaNcc: 'NCC03',
      TenNcc: 'Nhà Phân Phối Da Bê Toscana Việt Nam',
      Sdt: '02439901122',
      Email: 'import@toscanaleather.vn',
      Diachi: 'Số 82 Nguyễn Tuân, Quận Thanh Xuân, Hà Nội'
    }
  ],

  // Bảng 4.9: CongThanhToan
  CongThanhToan: [
    { Macong: 'CTT01', Tencong: 'Thanh toán khi nhận hàng (COD)' },
    { Macong: 'CTT02', Tencong: 'Chuyển khoản ngân hàng (VietQR)' },
    { Macong: 'CTT03', Tencong: 'Cổng thanh toán VNPay' },
    { Macong: 'CTT04', Tencong: 'Ví điện tử MoMo' }
  ],

  // Bảng 4.10: NhapHang
  NhapHang: [
    {
      MaNh: 'NH001',
      MaNv: 'NV02',
      MaNcc: 'NCC01',
      Macong: 'CTT02',
      Ngaynhap: '2026-10-05',
      Tongtien: 39600000,
      TrangthaiTT: 'Đã thanh toán'
    },
    {
      MaNh: 'NH002',
      MaNv: 'NV02',
      MaNcc: 'NCC03',
      Macong: 'CTT02',
      Ngaynhap: '2026-10-20',
      Tongtien: 31500000,
      TrangthaiTT: 'Đã thanh toán'
    },
    {
      MaNh: 'NH003',
      MaNv: 'NV01',
      MaNcc: 'NCC02',
      Macong: 'CTT02',
      Ngaynhap: '2026-10-29',
      Tongtien: 18400000,
      TrangthaiTT: 'Còn nợ'
    }
  ],

  // Bảng 4.11: ChiTietNhapHang
  ChiTietNhapHang: [
    { MaNh: 'NH001', MaBt: 'BT02', Soluong: 15, Gianhap: 1320000 },
    { MaNh: 'NH001', MaBt: 'BT09', Soluong: 15, Gianhap: 1320000 },
    { MaNh: 'NH002', MaBt: 'BT26', Soluong: 10, Gianhap: 1650000 },
    { MaNh: 'NH002', MaBt: 'BT30', Soluong: 10, Gianhap: 1500000 },
    { MaNh: 'NH003', MaBt: 'BT18', Soluong: 8, Gianhap: 1400000 },
    { MaNh: 'NH003', MaBt: 'BT35', Soluong: 8, Gianhap: 900000 }
  ],

  // Bảng 4.12: DonHang
  DonHang: [
    {
      MaDh: 'DH001',
      MaKh: 'KH01',
      MaNv: 'NV01',
      Macong: 'CTT02',
      Nguoinhan: 'Trần Minh Đức',
      Sdtnhan: '0904112233',
      Ngaydat: '2026-10-22',
      Diachigiao: 'Số 128 Phố Huế, Quận Hai Bà Trưng, Hà Nội',
      Trangthai: 'Đã giao',
      Tamtinh: 4300000,
      Giamgia: 200000,
      MaKm: 'BECLASSY200',
      Tongtien: 4100000,
      PhuongthucTT: 'Chuyển khoản ngân hàng (VietQR)',
      Ghichu: 'Giao giờ hành chính tại lễ tân tòa nhà.'
    },
    {
      MaDh: 'DH002',
      MaKh: 'KH02',
      MaNv: 'NV01',
      Macong: 'CTT01',
      Nguoinhan: 'Lê Hoàng Nam',
      Sdtnhan: '0915223344',
      Ngaydat: '2026-10-26',
      Diachigiao: 'Số 62 Chu Mạnh Trinh, P. Hiến Nam, TP. Hưng Yên',
      Trangthai: 'Đã giao',
      Tamtinh: 2690000,
      Giamgia: 0,
      MaKm: '',
      Tongtien: 2690000,
      PhuongthucTT: 'Thanh toán khi nhận hàng (COD)',
      Ghichu: ''
    },
    {
      MaDh: 'DH003',
      MaKh: 'KH04',
      MaNv: 'NV01',
      Macong: 'CTT03',
      Nguoinhan: 'Đặng Quốc Bảo',
      Sdtnhan: '0968445566',
      Ngaydat: '2026-10-29',
      Diachigiao: 'Tòa R2 Vinhomes Royal City, Thanh Xuân, Hà Nội',
      Trangthai: 'Đã giao',
      Tamtinh: 5240000,
      Giamgia: 524000,
      MaKm: 'QUYONG10',
      Tongtien: 4716000,
      PhuongthucTT: 'Cổng thanh toán VNPay',
      Ghichu: 'Kèm đón gót giày gỗ.'
    },
    {
      MaDh: 'DH004',
      MaKh: 'KH01',
      MaNv: 'NV01',
      Macong: 'CTT01',
      Nguoinhan: 'Trần Minh Đức',
      Sdtnhan: '0904112233',
      Ngaydat: '2026-11-01',
      Diachigiao: 'Số 128 Phố Huế, Quận Hai Bà Trưng, Hà Nội',
      Trangthai: 'Đang giao hàng',
      Tamtinh: 2450000,
      Giamgia: 0,
      MaKm: '',
      Tongtien: 2450000,
      PhuongthucTT: 'Thanh toán khi nhận hàng (COD)',
      Ghichu: 'Gọi trước khi giao 15 phút.'
    },
    {
      MaDh: 'DH005',
      MaKh: 'KH03',
      MaNv: '',
      Macong: 'CTT04',
      Nguoinhan: 'Vũ Tuấn Kiệt',
      Sdtnhan: '0936778899',
      Ngaydat: '2026-11-02',
      Diachigiao: 'Số 210 Lạch Tray, Quận Ngô Quyền, Hải Phòng',
      Trangthai: 'Chờ xác nhận',
      Tamtinh: 2350000,
      Giamgia: 0,
      MaKm: '',
      Tongtien: 2350000,
      PhuongthucTT: 'Ví điện tử MoMo',
      Ghichu: ''
    },
    {
      MaDh: 'DH006',
      MaKh: 'KH05',
      MaNv: 'NV01',
      Macong: 'CTT01',
      Nguoinhan: 'Ngô Thanh Tùng',
      Sdtnhan: '0942998877',
      Ngaydat: '2026-10-18',
      Diachigiao: 'Số 19 Trần Hưng Đạo, TP. Hải Dương',
      Trangthai: 'Đã hủy',
      Tamtinh: 1950000,
      Giamgia: 0,
      MaKm: '',
      Tongtien: 1950000,
      PhuongthucTT: 'Thanh toán khi nhận hàng (COD)',
      Ghichu: 'Khách báo đổi lịch công tác nên hủy đơn.'
    },
    {
      MaDh: 'DH007',
      MaKh: 'KH01',
      MaNv: 'NV01',
      Macong: 'CTT02',
      Nguoinhan: 'Trần Minh Đức',
      Sdtnhan: '0904112233',
      Ngaydat: '2026-10-30',
      Diachigiao: 'Số 128 Phố Huế, Quận Hai Bà Trưng, Hà Nội',
      Trangthai: 'Đã giao',
      Tamtinh: 2750000,
      Giamgia: 0,
      MaKm: '',
      Tongtien: 2750000,
      PhuongthucTT: 'Chuyển khoản ngân hàng (VietQR)',
      Ghichu: ''
    }
  ],

  // Bảng 4.13: ChiTietDonHang
  ChiTietDonHang: [
    { MaDh: 'DH001', MaBt: 'BT02', Soluong: 2, Dongia: 2150000 },
    { MaDh: 'DH002', MaBt: 'BT27', Soluong: 1, Dongia: 2690000 },
    { MaDh: 'DH003', MaBt: 'BT09', Soluong: 1, Dongia: 2350000 },
    { MaDh: 'DH003', MaBt: 'BT40', Soluong: 1, Dongia: 2890000 },
    { MaDh: 'DH004', MaBt: 'BT18', Soluong: 1, Dongia: 2450000 },
    { MaDh: 'DH005', MaBt: 'BT10', Soluong: 1, Dongia: 2350000 },
    { MaDh: 'DH006', MaBt: 'BT23', Soluong: 1, Dongia: 1950000 },
    { MaDh: 'DH007', MaBt: 'BT31', Soluong: 1, Dongia: 2750000 }
  ],

  // Bảng 4.14: PhieuHoTro
  PhieuHoTro: [
    {
      MaPhieu: 'HT001',
      MaKh: 'KH01',
      MaNv: 'NV03',
      MaDh: 'DH001',
      Loaivande: 'Bảo hành & Bảo dưỡng',
      Mucdouutien: 'Trung bình',
      Noidung: 'Cho mình hỏi quy trình gửi giày Classic Cap-Toe Oxford về cửa hàng để đánh xi dưỡng da định kỳ miễn phí như thế nào ạ?',
      Phanhoi: 'Chào anh Minh Đức, anh có thể mang trực tiếp qua cửa hàng hoặc gửi chuyển phát về địa chỉ showroom Hưng Yên kèm mã đơn DH001. BE CLASSY miễn phí dưỡng da & đánh bóng trong 12 tháng đầu ạ.',
      Ngaytao: '2026-10-28',
      Trangthai: 'Đã hoàn thành'
    },
    {
      MaPhieu: 'HT002',
      MaKh: 'KH03',
      MaNv: '',
      MaDh: 'DH005',
      Loaivande: 'Tư vấn chọn size',
      Mucdouutien: 'Cao',
      Noidung: 'Chân mình dài 25.8cm, bề ngang hơi bè đang đặt đơn DH005 size 41 mẫu Sovereign Oxford thì có bị kích mũi không? Nhờ shop kiểm tra trước khi gửi.',
      Phanhoi: '',
      Ngaytao: '2026-11-02',
      Trangthai: 'Chờ xử lý'
    }
  ],

  // Bảng 4.15: DoiTra
  DoiTra: [
    {
      MaDoitra: 'DT001',
      MaDh: 'DH002',
      MaBt: 'BT27',
      Soluong: 1,
      MaKh: 'KH02',
      MaNv: '',
      Loai: 'Đổi sản phẩm',
      Lydo: 'Mang thử trong nhà thấy cổ giày size 41 hơi ôm mu bàn chân, mong muốn đổi sang size 42 cùng mẫu.',
      Ngaydoitra: '2026-11-01',
      Ngayxuly: '',
      Tienhoan: 0,
      Ketqua: 'Chờ duyệt',
      GhichuXuLy: ''
    }
  ],

  // Bảng Khuyến mãi (Mục 4.B.8 & Mục 1.4 đặc tả)
  KhuyenMai: [
    {
      MaKm: 'KM01',
      Code: 'QUYONG10',
      TenKm: 'Ưu đãi Quý Ông Mùa Thu Đông (-10%)',
      Loaigiam: 'percent',
      Giatri: 10,
      DonToiThieu: 2000000,
      Tungay: '2026-10-01',
      Denngay: '2026-12-31',
      Trangthai: 'Đang áp dụng'
    },
    {
      MaKm: 'KM02',
      Code: 'BECLASSY200',
      TenKm: 'Giảm trực tiếp 200.000đ cho đơn từ 3.500.000đ',
      Loaigiam: 'fixed',
      Giatri: 200000,
      DonToiThieu: 3500000,
      Tungay: '2026-10-01',
      Denngay: '2026-11-30',
      Trangthai: 'Đang áp dụng'
    },
    {
      MaKm: 'KM03',
      Code: 'NEWMEMBER',
      TenKm: 'Chào mừng thành viên mới (-100.000đ)',
      Loaigiam: 'fixed',
      Giatri: 100000,
      DonToiThieu: 1500000,
      Tungay: '2026-09-01',
      Denngay: '2026-12-31',
      Trangthai: 'Đang áp dụng'
    }
  ],

  // Bảng 4.16: BaoCao
  BaoCao: [
    {
      MaBc: 'BC001',
      MaChu: 'CHU01',
      LoaiBc: 'Doanh thu',
      Tungay: '2026-10-01',
      Denngay: '2026-10-31',
      Ngaylap: '2026-11-01'
    },
    {
      MaBc: 'BC002',
      MaChu: 'CHU01',
      LoaiBc: 'Hàng tồn',
      Tungay: '2026-10-01',
      Denngay: '2026-11-02',
      Ngaylap: '2026-11-02'
    }
  ]
};

