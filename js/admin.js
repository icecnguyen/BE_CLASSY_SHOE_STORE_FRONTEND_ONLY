/* ==========================================================================
   BE CLASSY — ADMIN MANAGEMENT CONTROLLERS (admin.js)
   ========================================================================== */

(function () {
  const { escapeHTML, formatVND, formatDateVN, statusBadge, Icons, showToast, confirmDialog, openModal, closeModal, renderAdminShell, resolvePath } = window.UI;

  const STUDIO_IMAGES = [
    { label: 'Oxford Nâu Cognac', path: 'assets/images/shoes/oxford-cognac.jpg' },
    { label: 'Oxford Đen Box-Calf', path: 'assets/images/shoes/oxford-black.jpg' },
    { label: 'Oxford Đỏ Burgundy', path: 'assets/images/shoes/oxford-burgundy.jpg' },
    { label: 'Derby Nâu Walnut', path: 'assets/images/shoes/derby-walnut.jpg' },
    { label: 'Derby Đen Tối Giản', path: 'assets/images/shoes/derby-black.jpg' },
    { label: 'Loafer / Derby Nâu Espresso', path: 'assets/images/shoes/derby-espresso.jpg' },
    { label: 'Chelsea Boots Nâu Đậm', path: 'assets/images/shoes/chelsea-brown.jpg' },
    { label: 'Chelsea Boots Đen', path: 'assets/images/shoes/chelsea-black.jpg' },
    { label: 'Boots / Monk Vàng Bò', path: 'assets/images/shoes/boots-tan.jpg' },
    { label: 'Atelier Bespoke Nâu Trầm', path: 'assets/images/shoes/editorial-espresso.jpg' },
    { label: 'Atelier Bespoke Đen', path: 'assets/images/shoes/editorial-black.jpg' }
  ];

  function setupTabs(rootEl, onTabChange) {
    const btns = rootEl.querySelectorAll('[data-tab-btn]');
    const panes = rootEl.querySelectorAll('[data-tab-pane]');
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab-btn');
        btns.forEach((b) => b.classList.toggle('active', b === btn));
        panes.forEach((p) => p.classList.toggle('active', p.getAttribute('data-tab-pane') === target));
        if (typeof onTabChange === 'function') onTabChange(target);
      });
    });
  }

  // -------------------- 1. DASHBOARD --------------------
  function initDashboard() {
    const auth = renderAdminShell({ activePage: 'dashboard', pageTitle: 'Dashboard — Tổng quan vận hành' });
    if (!auth.authorized) return;

    const mount = document.getElementById('admin-page-content');
    const db = window.Store.loadDB();
    const m = window.Store.getUnifiedMetrics();

    // Group revenue by date from valid orders
    const revByDate = {};
    db.DonHang.filter((o) => o.Trangthai !== 'Đã hủy').forEach((o) => {
      revByDate[o.Ngaydat] = (revByDate[o.Ngaydat] || 0) + Number(o.Tongtien || 0);
    });
    const sortedDates = Object.keys(revByDate).sort();
    const maxRev = Math.max(1, ...Object.values(revByDate));

    const lowStockList = db.BienTheSanPham
      .filter((bt) => Number(bt.Soluongton) <= 3)
      .sort((a, b) => Number(a.Soluongton) - Number(b.Soluongton))
      .slice(0, 6);

    const recentOrders = db.DonHang.slice(0, 6);

    mount.innerHTML = `
      <section class="kpi-strip">
        <div class="kpi-cell">
          <div class="kpi-label"><span>Tổng đơn hàng hợp lệ</span> ${Icons.orders}</div>
          <div class="kpi-value">${m.totalOrders}</div>
          <div class="kpi-sub">${m.pendingOrdersCount} đơn đang chờ xác nhận</div>
        </div>
        <div class="kpi-cell">
          <div class="kpi-label"><span>Doanh thu thực thu</span> ${Icons.chart}</div>
          <div class="kpi-value text-accent">${formatVND(m.netRevenue)}</div>
          <div class="kpi-sub">Đã trừ đơn hủy &amp; tiền hoàn trả</div>
        </div>
        <div class="kpi-cell">
          <div class="kpi-label"><span>Sản phẩm &amp; Tồn kho</span> ${Icons.box}</div>
          <div class="kpi-value">${m.totalProducts} mẫu / ${m.totalStockUnits} đôi</div>
          <div class="kpi-sub">${m.totalVariants} biến thể Size &amp; Màu</div>
        </div>
        <div class="kpi-cell">
          <div class="kpi-label"><span>Khách hàng thành viên</span> ${Icons.users}</div>
          <div class="kpi-value">${m.totalCustomers}</div>
          <div class="kpi-sub">${m.pendingSupportCount} phiếu hỗ trợ chưa đóng</div>
        </div>
      </section>

      <div class="dash-grid">
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Biểu đồ doanh thu theo ngày phát sinh đơn</h2>
            <span class="text-muted" style="font-size:0.8rem;">Đơn vị: VNĐ</span>
          </div>
          <div class="panel-body">
            ${
              !sortedDates.length
                ? `<div class="empty-state"><p>Chưa có dữ liệu doanh thu.</p></div>`
                : `
                <div class="chart-box">
                  <div class="bar-chart-grid">
                    ${sortedDates
                      .map((dt) => {
                        const val = revByDate[dt];
                        const pct = Math.max(8, Math.round((val / maxRev) * 100));
                        const shortD = dt.slice(8, 10) + '/' + dt.slice(5, 7);
                        const shortVal = (val / 1000000).toFixed(1) + 'tr';
                        return `
                          <div class="bar-col" title="${formatDateVN(dt)}: ${formatVND(val)}">
                            <span class="bar-val-top">${shortVal}</span>
                            <div class="bar-fill" style="height:${pct}%;"></div>
                            <span class="bar-lbl-bottom">${shortD}</span>
                          </div>
                        `;
                      })
                      .join('')}
                  </div>
                </div>
              `
            }
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Cảnh báo tồn kho thấp (≤ 3 đôi)</h2>
            <a href="inventory.html" class="text-accent font-medium" style="font-size:0.8rem;">Nhập kho ngay</a>
          </div>
          <div class="panel-body" style="padding:12px 18px;">
            ${
              !lowStockList.length
                ? `<p class="text-muted" style="font-size:0.85rem;padding:12px 0;">Tất cả biến thể đều đủ định mức tồn kho.</p>`
                : lowStockList
                    .map((bt) => {
                      const info = window.Store.getVariantDetails(bt.MaBt);
                      return `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--border);font-size:0.84rem;">
                          <div>
                            <div class="font-medium">${escapeHTML(info ? info.TenSp : bt.MaSp)}</div>
                            <div class="text-muted" style="font-size:0.76rem;">${escapeHTML(bt.MaBt)} • ${escapeHTML(bt.Mau)} • Size ${bt.Size}</div>
                          </div>
                          <span class="badge ${bt.Soluongton === 0 ? 'badge-error' : 'badge-warning'}">
                            ${bt.Soluongton === 0 ? 'Hết hàng' : `Còn ${bt.Soluongton} đôi`}
                          </span>
                        </div>
                      `;
                    })
                    .join('')
            }
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h2 class="panel-title">Đơn hàng gần đây</h2>
          <a href="orders.html" class="btn btn-outline btn-sm">Quản lý tất cả đơn hàng</a>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Phương thức TT</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              ${recentOrders
                .map(
                  (o) => `
                  <tr>
                    <td class="mono-code font-semibold"><a href="orders.html" class="text-accent">${escapeHTML(o.MaDh)}</a></td>
                    <td>
                      <div class="font-medium">${escapeHTML(o.Nguoinhan)}</div>
                      <div class="text-muted" style="font-size:0.76rem;">${escapeHTML(o.Sdtnhan)}</div>
                    </td>
                    <td>${formatDateVN(o.Ngaydat)}</td>
                    <td style="font-size:0.82rem;">${escapeHTML(o.PhuongthucTT)}</td>
                    <td class="font-semibold">${formatVND(o.Tongtien)}</td>
                    <td>${statusBadge(o.Trangthai)}</td>
                  </tr>
                `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // -------------------- 2. QUẢN LÝ SẢN PHẨM, LOẠI SP & THƯƠNG HIỆU --------------------
  function initProductsAdmin() {
    const auth = renderAdminShell({ activePage: 'products', pageTitle: 'Quản lý sản phẩm & Danh mục' });
    if (!auth.authorized) return;

    const mount = document.getElementById('admin-page-content');
    let searchKw = '';
    let filterCat = '';

    function renderAll() {
      const db = window.Store.loadDB();
      const products = window.Store.getProductsEnriched();

      const filtered = products.filter((p) => {
        if (filterCat && p.Maloai !== filterCat) return false;
        if (searchKw) {
          const kw = searchKw.toLowerCase();
          return p.TenSp.toLowerCase().includes(kw) || p.MaSp.toLowerCase().includes(kw) || p.TenTh.toLowerCase().includes(kw);
        }
        return true;
      });

      const tbody = document.getElementById('adm-prod-tbody');
      if (tbody) {
        tbody.innerHTML = filtered.length
          ? filtered
              .map(
                (p) => `
                <tr>
                  <td class="mono-code font-semibold">${escapeHTML(p.MaSp)}</td>
                  <td>
                    <div class="admin-prod-cell">
                      <img src="${escapeHTML(resolvePath(p.Hinhanh))}" alt="" class="admin-prod-thumb">
                      <div>
                        <div class="font-semibold">${escapeHTML(p.TenSp)}</div>
                        <div class="text-muted" style="font-size:0.76rem;">${escapeHTML(p.TenTh)} • ${p.Noibat ? 'Nổi bật' : 'Tiêu chuẩn'}</div>
                      </div>
                    </div>
                  </td>
                  <td>${escapeHTML(p.Tenloai)}</td>
                  <td class="font-semibold text-accent">${formatVND(p.GiaBan)}</td>
                  <td>
                    <div class="variant-mini-list">
                      ${p.variants
                        .map(
                          (v) =>
                            `<span class="variant-mini-pill ${v.Soluongton === 0 ? 'out' : v.Soluongton <= 3 ? 'low' : ''}">${escapeHTML(v.Mau)} S${v.Size}: <strong>${v.Soluongton}</strong></span>`
                        )
                        .join('')}
                    </div>
                  </td>
                  <td class="text-right">
                    <div class="table-actions">
                      <button type="button" class="btn btn-outline btn-sm" data-edit-sp="${escapeHTML(p.MaSp)}">${Icons.edit} Sửa</button>
                      <button type="button" class="btn btn-danger-outline btn-sm" data-del-sp="${escapeHTML(p.MaSp)}">${Icons.trash}</button>
                    </div>
                  </td>
                </tr>
              `
              )
              .join('')
          : `<tr><td colspan="6" class="text-center text-muted" style="padding:28px;">Không tìm thấy sản phẩm phù hợp.</td></tr>`;

        tbody.querySelectorAll('[data-edit-sp]').forEach((b) => {
          b.addEventListener('click', () => openProductModal(b.getAttribute('data-edit-sp')));
        });
        tbody.querySelectorAll('[data-del-sp]').forEach((b) => {
          b.addEventListener('click', () => {
            const id = b.getAttribute('data-del-sp');
            confirmDialog({
              title: `Xóa sản phẩm ${id}`,
              message: `Xác nhận xóa sản phẩm ${id}? (Lưu ý: Không thể xóa nếu còn tồn kho hoặc đã phát sinh đơn hàng/phiếu nhập).`,
              confirmText: 'Xóa sản phẩm',
              danger: true,
              onConfirm: () => {
                const res = window.Store.deleteProduct(id);
                if (!res.ok) showToast(res.message, 'error');
                else {
                  showToast(res.message, 'success');
                  renderAll();
                }
              }
            });
          });
        });
      }

      // Render Categories Table
      const catTbody = document.getElementById('adm-cat-tbody');
      if (catTbody) {
        catTbody.innerHTML = db.LoaiSanPham.map((c) => {
          const count = db.SanPham.filter((p) => p.Maloai === c.Maloai).length;
          return `
            <tr>
              <td class="mono-code font-semibold">${escapeHTML(c.Maloai)}</td>
              <td class="font-medium">${escapeHTML(c.Tenloai)}</td>
              <td class="text-secondary">${escapeHTML(c.Mota || '—')}</td>
              <td>${count} sản phẩm</td>
              <td class="text-right">
                <div class="table-actions">
                  <button type="button" class="btn btn-outline btn-sm" data-edit-cat="${escapeHTML(c.Maloai)}">${Icons.edit} Sửa</button>
                  <button type="button" class="btn btn-danger-outline btn-sm" data-del-cat="${escapeHTML(c.Maloai)}">${Icons.trash}</button>
                </div>
              </td>
            </tr>
          `;
        }).join('');

        catTbody.querySelectorAll('[data-edit-cat]').forEach((b) => {
          b.addEventListener('click', () => openCategoryModal(b.getAttribute('data-edit-cat')));
        });
        catTbody.querySelectorAll('[data-del-cat]').forEach((b) => {
          b.addEventListener('click', () => {
            const id = b.getAttribute('data-del-cat');
            confirmDialog({
              title: `Xóa loại sản phẩm ${id}`,
              message: 'Bạn có chắc muốn xóa loại sản phẩm này?',
              confirmText: 'Xóa',
              danger: true,
              onConfirm: () => {
                const res = window.Store.deleteCategory(id);
                if (!res.ok) showToast(res.message, 'error');
                else {
                  showToast(res.message, 'success');
                  renderAll();
                }
              }
            });
          });
        });
      }

      // Render Brands Table
      const brTbody = document.getElementById('adm-brand-tbody');
      if (brTbody) {
        brTbody.innerHTML = db.ThuongHieu.map((t) => {
          const count = db.SanPham.filter((p) => p.MaTh === t.MaTh).length;
          return `
            <tr>
              <td class="mono-code font-semibold">${escapeHTML(t.MaTh)}</td>
              <td class="font-medium">${escapeHTML(t.TenTh)}</td>
              <td>${escapeHTML(t.Xuatxu)}</td>
              <td>${count} sản phẩm</td>
              <td class="text-right">
                <div class="table-actions">
                  <button type="button" class="btn btn-outline btn-sm" data-edit-th="${escapeHTML(t.MaTh)}">${Icons.edit} Sửa</button>
                  <button type="button" class="btn btn-danger-outline btn-sm" data-del-th="${escapeHTML(t.MaTh)}">${Icons.trash}</button>
                </div>
              </td>
            </tr>
          `;
        }).join('');

        brTbody.querySelectorAll('[data-edit-th]').forEach((b) => {
          b.addEventListener('click', () => openBrandModal(b.getAttribute('data-edit-th')));
        });
        brTbody.querySelectorAll('[data-del-th]').forEach((b) => {
          b.addEventListener('click', () => {
            const id = b.getAttribute('data-del-th');
            confirmDialog({
              title: `Xóa thương hiệu ${id}`,
              message: 'Xác nhận xóa thương hiệu này khỏi hệ thống?',
              confirmText: 'Xóa',
              danger: true,
              onConfirm: () => {
                const res = window.Store.deleteBrand(id);
                if (!res.ok) showToast(res.message, 'error');
                else {
                  showToast(res.message, 'success');
                  renderAll();
                }
              }
            });
          });
        });
      }
    }

    const dbInit = window.Store.loadDB();
    mount.innerHTML = `
      <div class="tabs-nav">
        <button type="button" class="tab-btn active" data-tab-btn="sp">Danh sách sản phẩm &amp; Biến thể</button>
        <button type="button" class="tab-btn" data-tab-btn="cat">Quản lý danh mục (LoaiSanPham)</button>
        <button type="button" class="tab-btn" data-tab-btn="brand">Quản lý thương hiệu (ThuongHieu)</button>
      </div>

      <div class="tab-pane active" data-tab-pane="sp">
        <div class="alert alert-info">
          ${Icons.alert}
          <span><strong>Nguyên tắc nghiệp vụ:</strong> Thao tác thêm sản phẩm &amp; khai báo biến thể (Size, Màu) tách biệt với thao tác <strong>Nhập hàng</strong>. Biến thể mới tạo có tồn kho khởi tạo bằng 0; vui lòng lập phiếu nhập tại mục <a href="inventory.html" class="text-accent font-semibold">Quản lý kho &amp; Nhập hàng</a> để cộng tồn kho.</span>
        </div>
        <div class="panel">
          <div class="panel-header">
            <div class="admin-filters">
              <input type="text" class="form-control admin-search-input" id="adm-sp-search" placeholder="Tìm mã SP, tên giày, thương hiệu...">
              <select class="form-control" id="adm-sp-cat-filter">
                <option value="">Tất cả loại giày</option>
                ${dbInit.LoaiSanPham.map((c) => `<option value="${escapeHTML(c.Maloai)}">${escapeHTML(c.Tenloai)}</option>`).join('')}
              </select>
            </div>
            <button type="button" class="btn btn-primary" id="btn-add-sp">${Icons.plus} Thêm sản phẩm mới</button>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Mã SP</th>
                  <th>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá bán</th>
                  <th>Biến thể (Màu / Size : Tồn)</th>
                  <th class="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody id="adm-prod-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="tab-pane" data-tab-pane="cat">
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Danh sách loại sản phẩm</h2>
            <button type="button" class="btn btn-primary" id="btn-add-cat">${Icons.plus} Thêm loại sản phẩm</button>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Mã loại</th>
                  <th>Tên loại sản phẩm</th>
                  <th>Mô tả</th>
                  <th>Số lượng mẫu</th>
                  <th class="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody id="adm-cat-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="tab-pane" data-tab-pane="brand">
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Danh sách thương hiệu</h2>
            <button type="button" class="btn btn-primary" id="btn-add-brand">${Icons.plus} Thêm thương hiệu</button>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Mã TH</th>
                  <th>Tên thương hiệu</th>
                  <th>Xuất xứ</th>
                  <th>Số mẫu</th>
                  <th class="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody id="adm-brand-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    setupTabs(mount);

    document.getElementById('adm-sp-search')?.addEventListener('input', (e) => {
      searchKw = e.target.value.trim();
      renderAll();
    });
    document.getElementById('adm-sp-cat-filter')?.addEventListener('change', (e) => {
      filterCat = e.target.value;
      renderAll();
    });

    document.getElementById('btn-add-sp')?.addEventListener('click', () => openProductModal(null));
    document.getElementById('btn-add-cat')?.addEventListener('click', () => openCategoryModal(null));
    document.getElementById('btn-add-brand')?.addEventListener('click', () => openBrandModal(null));

    function openProductModal(editMaSp) {
      const db = window.Store.loadDB();
      const sp = editMaSp ? window.Store.getProductById(editMaSp) : null;
      const modalBody = document.getElementById('sp-modal-body');
      document.getElementById('sp-modal-title').textContent = sp ? `Chỉnh sửa sản phẩm ${sp.MaSp}` : 'Thêm sản phẩm mới';

      modalBody.innerHTML = `
        <form id="sp-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Mã sản phẩm</label>
              <input type="text" class="form-control mono-code" id="f-masp" value="${escapeHTML(sp ? sp.MaSp : '')}" placeholder="Để trống tự sinh (VD: SP11)" ${sp ? 'readonly' : ''}>
            </div>
            <div class="form-group">
              <label class="form-label">Tên sản phẩm <span class="req">*</span></label>
              <input type="text" class="form-control" id="f-tensp" value="${escapeHTML(sp ? sp.TenSp : '')}" required>
            </div>
          </div>
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">Loại sản phẩm <span class="req">*</span></label>
              <select class="form-control" id="f-maloai" required>
                ${db.LoaiSanPham.map((c) => `<option value="${escapeHTML(c.Maloai)}" ${sp && sp.Maloai === c.Maloai ? 'selected' : ''}>${escapeHTML(c.Tenloai)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Thương hiệu <span class="req">*</span></label>
              <select class="form-control" id="f-math" required>
                ${db.ThuongHieu.map((t) => `<option value="${escapeHTML(t.MaTh)}" ${sp && sp.MaTh === t.MaTh ? 'selected' : ''}>${escapeHTML(t.TenTh)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Giá bán (VNĐ) <span class="req">*</span></label>
              <input type="number" class="form-control" id="f-giaban" value="${sp ? sp.GiaBan : 2150000}" min="10000" step="10000" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Hình ảnh studio</label>
              <select class="form-control" id="f-hinhanh">
                ${STUDIO_IMAGES.map((img) => `<option value="${escapeHTML(img.path)}" ${sp && sp.Hinhanh === img.path ? 'selected' : ''}>${escapeHTML(img.label)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Chất liệu &amp; Đế</label>
              <input type="text" class="form-control" id="f-chatlieu" value="${escapeHTML(sp ? sp.Chatlieu : 'Da bê Full-grain, đế khâu Goodyear')}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Mô tả sản phẩm</label>
            <textarea class="form-control" id="f-mota">${escapeHTML(sp ? sp.Mota : '')}</textarea>
          </div>

          <div class="form-group">
            <label class="filter-check-item">
              <input type="checkbox" id="f-noibat" ${!sp || sp.Noibat ? 'checked' : ''}>
              <span>Hiển thị tại mục "Sản phẩm nổi bật" ngoài Trang chủ</span>
            </label>
          </div>

          <div style="border-top:1px solid var(--border);padding-top:14px;margin-top:10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <label class="form-label" style="margin:0;">Khai báo biến thể Kích cỡ &amp; Màu sắc (Tồn khởi tạo = 0)</label>
              <button type="button" class="btn btn-subtle btn-sm" id="btn-add-var-row">${Icons.plus} Thêm dòng biến thể</button>
            </div>
            ${
              sp && sp.variants.length
                ? `<div class="variant-mini-list" style="margin-bottom:10px;">
                    ${sp.variants.map((v) => `<span class="variant-mini-pill">Đã có: ${escapeHTML(v.MaBt)} (${escapeHTML(v.Mau)} - S${v.Size} | Tồn: ${v.Soluongton})</span>`).join('')}
                  </div>`
                : ''
            }
            <div id="new-variants-container" style="display:flex;flex-direction:column;gap:8px;"></div>
          </div>

          <div class="modal-footer" style="margin:18px -22px -20px;">
            <button type="button" class="btn btn-outline" data-close-modal="sp-modal">Hủy</button>
            <button type="submit" class="btn btn-primary">Lưu sản phẩm</button>
          </div>
        </form>
      `;

      const varContainer = document.getElementById('new-variants-container');
      function addVarRow(defaultSize = 40, defaultColor = 'Nâu Cognac') {
        const row = document.createElement('div');
        row.style.cssText = 'display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:center;';
        row.innerHTML = `
          <select class="form-control var-size">
            ${[38, 39, 40, 41, 42, 43, 44].map((sz) => `<option value="${sz}" ${sz === defaultSize ? 'selected' : ''}>Size ${sz}</option>`).join('')}
          </select>
          <select class="form-control var-color">
            ${['Nâu Cognac', 'Đen', 'Đỏ Burgundy', 'Nâu Walnut', 'Nâu Đậm', 'Vàng Bò'].map((c) => `<option value="${c}" ${c === defaultColor ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
          <button type="button" class="btn btn-danger-outline btn-sm">${Icons.trash}</button>
        `;
        row.querySelector('button').addEventListener('click', () => row.remove());
        varContainer.appendChild(row);
      }

      if (!sp) {
        addVarRow(40, 'Nâu Cognac');
        addVarRow(41, 'Nâu Cognac');
      }
      document.getElementById('btn-add-var-row')?.addEventListener('click', () => addVarRow(41, 'Đen'));

      document.getElementById('sp-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const newVars = Array.from(varContainer.children).map((r) => ({
          Size: r.querySelector('.var-size').value,
          Mau: r.querySelector('.var-color').value
        }));

        const res = window.Store.saveProduct(
          {
            MaSp: document.getElementById('f-masp').value,
            TenSp: document.getElementById('f-tensp').value,
            Maloai: document.getElementById('f-maloai').value,
            MaTh: document.getElementById('f-math').value,
            GiaBan: document.getElementById('f-giaban').value,
            Hinhanh: document.getElementById('f-hinhanh').value,
            Chatlieu: document.getElementById('f-chatlieu').value,
            Mota: document.getElementById('f-mota').value,
            Noibat: document.getElementById('f-noibat').checked,
            variants: newVars
          },
          Boolean(sp)
        );
        if (!res.ok) {
          showToast(res.message, 'error');
          return;
        }
        closeModal('sp-modal');
        showToast(res.message, 'success');
        renderAll();
      });

      openModal('sp-modal');
    }

    function openCategoryModal(editMaloai) {
      const db = window.Store.loadDB();
      const cat = editMaloai ? db.LoaiSanPham.find((c) => c.Maloai === editMaloai) : null;
      document.getElementById('cat-modal-title').textContent = cat ? `Sửa loại sản phẩm ${cat.Maloai}` : 'Thêm loại sản phẩm';
      const body = document.getElementById('cat-modal-body');
      body.innerHTML = `
        <form id="cat-form">
          <div class="form-group">
            <label class="form-label">Mã loại</label>
            <input type="text" class="form-control mono-code" id="c-maloai" value="${escapeHTML(cat ? cat.Maloai : '')}" placeholder="Tự sinh nếu để trống" ${cat ? 'readonly' : ''}>
          </div>
          <div class="form-group">
            <label class="form-label">Tên loại sản phẩm <span class="req">*</span></label>
            <input type="text" class="form-control" id="c-tenloai" value="${escapeHTML(cat ? cat.Tenloai : '')}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Mô tả</label>
            <textarea class="form-control" id="c-mota">${escapeHTML(cat ? cat.Mota || '' : '')}</textarea>
          </div>
          <div class="modal-footer" style="margin:18px -22px -20px;">
            <button type="button" class="btn btn-outline" data-close-modal="cat-modal">Hủy</button>
            <button type="submit" class="btn btn-primary">Lưu lại</button>
          </div>
        </form>
      `;
      document.getElementById('cat-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const res = window.Store.saveCategory(
          {
            Maloai: document.getElementById('c-maloai').value,
            Tenloai: document.getElementById('c-tenloai').value,
            Mota: document.getElementById('c-mota').value
          },
          Boolean(cat)
        );
        if (!res.ok) return showToast(res.message, 'error');
        closeModal('cat-modal');
        showToast(res.message);
        renderAll();
      });
      openModal('cat-modal');
    }

    function openBrandModal(editMaTh) {
      const db = window.Store.loadDB();
      const th = editMaTh ? db.ThuongHieu.find((t) => t.MaTh === editMaTh) : null;
      document.getElementById('cat-modal-title').textContent = th ? `Sửa thương hiệu ${th.MaTh}` : 'Thêm thương hiệu';
      const body = document.getElementById('cat-modal-body');
      body.innerHTML = `
        <form id="th-form">
          <div class="form-group">
            <label class="form-label">Mã thương hiệu</label>
            <input type="text" class="form-control mono-code" id="t-math" value="${escapeHTML(th ? th.MaTh : '')}" placeholder="Tự sinh nếu để trống" ${th ? 'readonly' : ''}>
          </div>
          <div class="form-group">
            <label class="form-label">Tên thương hiệu <span class="req">*</span></label>
            <input type="text" class="form-control" id="t-tenth" value="${escapeHTML(th ? th.TenTh : '')}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Xuất xứ <span class="req">*</span></label>
            <input type="text" class="form-control" id="t-xuatxu" value="${escapeHTML(th ? th.Xuatxu : 'Việt Nam')}" required>
          </div>
          <div class="modal-footer" style="margin:18px -22px -20px;">
            <button type="button" class="btn btn-outline" data-close-modal="cat-modal">Hủy</button>
            <button type="submit" class="btn btn-primary">Lưu thương hiệu</button>
          </div>
        </form>
      `;
      document.getElementById('th-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const res = window.Store.saveBrand(
          {
            MaTh: document.getElementById('t-math').value,
            TenTh: document.getElementById('t-tenth').value,
            Xuatxu: document.getElementById('t-xuatxu').value
          },
          Boolean(th)
        );
        if (!res.ok) return showToast(res.message, 'error');
        closeModal('cat-modal');
        showToast(res.message);
        renderAll();
      });
      openModal('cat-modal');
    }

    renderAll();
  }

  // -------------------- 3. QUẢN LÝ KHO & NHẬP HÀNG --------------------
  function initInventoryAdmin() {
    const auth = renderAdminShell({ activePage: 'inventory', pageTitle: 'Quản lý tồn kho & Nhập hàng' });
    if (!auth.authorized) return;

    const mount = document.getElementById('admin-page-content');
    let stockSearch = '';
    let stockFilter = 'all';
    let draftLines = [];

    mount.innerHTML = `
      <div class="tabs-nav" id="inv-tabs">
        <button type="button" class="tab-btn active" data-tab-btn="stock">Tồn kho theo biến thể (BienTheSanPham)</button>
        <button type="button" class="tab-btn" data-tab-btn="import">Lập hóa đơn nhập hàng (NhapHang)</button>
        <button type="button" class="tab-btn" data-tab-btn="history">Lịch sử phiếu nhập kho</button>
      </div>

      <div class="tab-pane active" data-tab-pane="stock">
        <div class="panel">
          <div class="panel-header">
            <div class="admin-filters">
              <input type="text" class="form-control admin-search-input" id="inv-search" placeholder="Tìm mã biến thể, tên SP, màu, size...">
              <select class="form-control" id="inv-status-filter">
                <option value="all">Tất cả mức tồn kho</option>
                <option value="low">Sắp hết hàng (1 – 3 đôi)</option>
                <option value="out">Đã hết hàng (0 đôi)</option>
                <option value="ok">Đủ hàng (> 3 đôi)</option>
              </select>
            </div>
            <button type="button" class="btn btn-primary" id="btn-goto-import">${Icons.plus} Lập phiếu nhập mới</button>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Mã BT</th>
                  <th>Sản phẩm</th>
                  <th>Màu sắc</th>
                  <th>Kích cỡ</th>
                  <th>Giá bán</th>
                  <th>Số lượng tồn</th>
                  <th>Cảnh báo</th>
                  <th class="text-right">Nhập kho</th>
                </tr>
              </thead>
              <tbody id="inv-stock-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="tab-pane" data-tab-pane="import">
        <div class="import-builder-grid">
          <div class="panel">
            <div class="panel-header">
              <h2 class="panel-title">Chi tiết sản phẩm cần nhập (ChiTietNhapHang)</h2>
            </div>
            <div class="panel-body">
              <div class="form-row-3" style="align-items:end;margin-bottom:16px;">
                <div class="form-group" style="margin:0;">
                  <label class="form-label">Chọn biến thể sản phẩm <span class="req">*</span></label>
                  <select class="form-control" id="imp-variant-sel"></select>
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label">Số lượng nhập <span class="req">*</span></label>
                  <input type="number" class="form-control" id="imp-qty" value="10" min="1">
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label">Đơn giá nhập (VNĐ) <span class="req">*</span></label>
                  <input type="number" class="form-control" id="imp-price" value="1350000" min="10000" step="10000">
                </div>
              </div>
              <button type="button" class="btn btn-outline" id="btn-add-imp-line">${Icons.plus} Thêm dòng hàng vào phiếu nhập</button>

              <div class="table-wrap" style="margin-top:20px;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Mã BT</th>
                      <th>Sản phẩm &amp; Biến thể</th>
                      <th>SL nhập</th>
                      <th>Giá nhập</th>
                      <th class="text-right">Thành tiền</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody id="imp-draft-tbody"></tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-header">
              <h2 class="panel-title">Thông tin hóa đơn nhập</h2>
            </div>
            <div class="panel-body">
              <form id="imp-submit-form">
                <div class="form-group">
                  <label class="form-label">Nhà cung cấp (NhaCungCap) <span class="req">*</span></label>
                  <select class="form-control" id="imp-supplier" required></select>
                </div>
                <div class="form-group">
                  <label class="form-label">Phương thức thanh toán <span class="req">*</span></label>
                  <select class="form-control" id="imp-gateway" required></select>
                </div>
                <div class="form-group">
                  <label class="form-label">Tình trạng thanh toán NCC</label>
                  <select class="form-control" id="imp-pay-status">
                    <option value="Đã thanh toán">Đã thanh toán đủ</option>
                    <option value="Còn nợ">Còn nợ công nợ NCC</option>
                  </select>
                </div>
                <div style="padding:12px 14px;background:var(--bg-subtle);border-radius:var(--radius-sm);margin-bottom:16px;">
                  <div style="display:flex;justify-content:space-between;font-size:0.85rem;">
                    <span>Tổng dòng hàng:</span>
                    <strong id="imp-total-lines">0</strong>
                  </div>
                  <div style="display:flex;justify-content:space-between;font-size:1rem;margin-top:6px;">
                    <span class="font-semibold">Tổng tiền nhập:</span>
                    <strong class="text-accent" id="imp-total-money">0₫</strong>
                  </div>
                </div>
                <button type="submit" class="btn btn-primary btn-block btn-lg">Xác nhận lập hóa đơn &amp; Nhập kho</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div class="tab-pane" data-tab-pane="history">
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Danh sách hóa đơn nhập hàng đã lưu</h2>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Mã phiếu nhập</th>
                  <th>Ngày nhập</th>
                  <th>Nhà cung cấp</th>
                  <th>Nhân viên lập</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th class="text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody id="imp-history-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    setupTabs(mount);

    function switchInvTab(tabKey) {
      mount.querySelector(`[data-tab-btn="${tabKey}"]`)?.click();
    }

    document.getElementById('btn-goto-import')?.addEventListener('click', () => switchInvTab('import'));

    function renderInventoryViews() {
      const db = window.Store.loadDB();
      // Populate variant selector & supplier selector
      const varSel = document.getElementById('imp-variant-sel');
      if (varSel) {
        const curVal = varSel.value;
        varSel.innerHTML = db.BienTheSanPham.map((bt) => {
          const sp = db.SanPham.find((p) => p.MaSp === bt.MaSp);
          return `<option value="${escapeHTML(bt.MaBt)}">${escapeHTML(bt.MaBt)} — ${escapeHTML(sp ? sp.TenSp : bt.MaSp)} (${escapeHTML(bt.Mau)}, S${bt.Size} | Tồn: ${bt.Soluongton})</option>`;
        }).join('');
        if (curVal) varSel.value = curVal;
      }

      const supSel = document.getElementById('imp-supplier');
      if (supSel) {
        supSel.innerHTML = db.NhaCungCap.map((n) => `<option value="${escapeHTML(n.MaNcc)}">${escapeHTML(n.TenNcc)} (${escapeHTML(n.MaNcc)})</option>`).join('');
      }

      const gwSel = document.getElementById('imp-gateway');
      if (gwSel) {
        gwSel.innerHTML = db.CongThanhToan.map((c) => `<option value="${escapeHTML(c.Macong)}">${escapeHTML(c.Tencong)}</option>`).join('');
      }

      // Stock table
      const rows = db.BienTheSanPham.map((bt) => {
        const sp = db.SanPham.find((p) => p.MaSp === bt.MaSp) || {};
        return { ...bt, TenSp: sp.TenSp || bt.MaSp, GiaBan: Number(sp.GiaBan || 0), Hinhanh: sp.Hinhanh || '' };
      }).filter((r) => {
        if (stockFilter === 'low' && (r.Soluongton <= 0 || r.Soluongton > 3)) return false;
        if (stockFilter === 'out' && r.Soluongton !== 0) return false;
        if (stockFilter === 'ok' && r.Soluongton <= 3) return false;
        if (stockSearch) {
          const kw = stockSearch.toLowerCase();
          return (
            r.MaBt.toLowerCase().includes(kw) ||
            r.TenSp.toLowerCase().includes(kw) ||
            r.Mau.toLowerCase().includes(kw) ||
            String(r.Size).includes(kw)
          );
        }
        return true;
      });

      const stockTbody = document.getElementById('inv-stock-tbody');
      if (stockTbody) {
        stockTbody.innerHTML = rows
          .map((r) => {
            let badge = `<span class="badge badge-success">Đủ hàng</span>`;
            if (r.Soluongton === 0) badge = `<span class="badge badge-error">Hết hàng</span>`;
            else if (r.Soluongton <= 3) badge = `<span class="badge badge-warning">Sắp hết hàng</span>`;

            return `
              <tr>
                <td class="mono-code font-semibold">${escapeHTML(r.MaBt)}</td>
                <td class="font-medium">${escapeHTML(r.TenSp)}</td>
                <td>${escapeHTML(r.Mau)}</td>
                <td>Size ${r.Size}</td>
                <td>${formatVND(r.GiaBan)}</td>
                <td class="font-semibold">${r.Soluongton} đôi</td>
                <td>${badge}</td>
                <td class="text-right">
                  <button type="button" class="btn btn-subtle btn-sm" data-quick-imp="${escapeHTML(r.MaBt)}">+ Nhập thêm</button>
                </td>
              </tr>
            `;
          })
          .join('');

        stockTbody.querySelectorAll('[data-quick-imp]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const mabt = btn.getAttribute('data-quick-imp');
            const existing = draftLines.find((l) => l.MaBt === mabt);
            if (existing) existing.Soluong += 5;
            else draftLines.push({ MaBt: mabt, Soluong: 10, Gianhap: 1300000 });
            renderDraftImport();
            switchInvTab('import');
            showToast(`Đã đưa biến thể ${mabt} vào phiếu nhập nháp.`);
          });
        });
      }

      // Import History Table
      const histTbody = document.getElementById('imp-history-tbody');
      if (histTbody) {
        histTbody.innerHTML = db.NhapHang.map((nh) => {
          const ncc = db.NhaCungCap.find((n) => n.MaNcc === nh.MaNcc);
          const nv = db.NhanVien.find((v) => v.MaNv === nh.MaNv);
          return `
            <tr>
              <td class="mono-code font-semibold">${escapeHTML(nh.MaNh)}</td>
              <td>${formatDateVN(nh.Ngaynhap)}</td>
              <td>${escapeHTML(ncc ? ncc.TenNcc : nh.MaNcc)}</td>
              <td>${escapeHTML(nv ? nv.TenNv : nh.MaNv)}</td>
              <td class="font-semibold text-accent">${formatVND(nh.Tongtien)}</td>
              <td>${statusBadge(nh.TrangthaiTT || 'Đã thanh toán')}</td>
              <td class="text-right">
                <button type="button" class="btn btn-outline btn-sm" data-view-nh="${escapeHTML(nh.MaNh)}">${Icons.eye} Xem dòng hàng</button>
              </td>
            </tr>
          `;
        }).join('');

        histTbody.querySelectorAll('[data-view-nh]').forEach((btn) => {
          btn.addEventListener('click', () => showImportDetailModal(btn.getAttribute('data-view-nh')));
        });
      }
    }

    function renderDraftImport() {
      const tbody = document.getElementById('imp-draft-tbody');
      if (!tbody) return;
      if (!draftLines.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding:24px;">Chưa có dòng sản phẩm nào trong phiếu nhập.</td></tr>`;
      } else {
        tbody.innerHTML = draftLines
          .map((ln, idx) => {
            const info = window.Store.getVariantDetails(ln.MaBt);
            return `
              <tr>
                <td class="mono-code">${escapeHTML(ln.MaBt)}</td>
                <td>${info ? `${escapeHTML(info.TenSp)} (${escapeHTML(info.Mau)}, S${info.Size})` : escapeHTML(ln.MaBt)}</td>
                <td>${ln.Soluong}</td>
                <td>${formatVND(ln.Gianhap)}</td>
                <td class="text-right font-semibold">${formatVND(ln.Soluong * ln.Gianhap)}</td>
                <td class="text-right">
                  <button type="button" class="btn btn-danger-outline btn-sm" data-rm-draft="${idx}">${Icons.trash}</button>
                </td>
              </tr>
            `;
          })
          .join('');
        tbody.querySelectorAll('[data-rm-draft]').forEach((b) => {
          b.addEventListener('click', () => {
            draftLines.splice(Number(b.getAttribute('data-rm-draft')), 1);
            renderDraftImport();
          });
        });
      }

      const totalMoney = draftLines.reduce((s, l) => s + l.Soluong * l.Gianhap, 0);
      document.getElementById('imp-total-lines').textContent = draftLines.length;
      document.getElementById('imp-total-money').textContent = formatVND(totalMoney);
    }

    function showImportDetailModal(MaNh) {
      const db = window.Store.loadDB();
      const nh = db.NhapHang.find((n) => n.MaNh === MaNh);
      if (!nh) return;
      const lines = db.ChiTietNhapHang.filter((ct) => ct.MaNh === MaNh);
      const ncc = db.NhaCungCap.find((n) => n.MaNcc === nh.MaNcc);
      const body = document.getElementById('inv-modal-body');
      body.innerHTML = `
        <div style="margin-bottom:14px;font-size:0.875rem;">
          <div><strong>Mã hóa đơn nhập:</strong> <span class="mono-code">${escapeHTML(nh.MaNh)}</span> • Ngày nhập: <strong>${formatDateVN(nh.Ngaynhap)}</strong></div>
          <div style="margin-top:4px;"><strong>Nhà cung cấp:</strong> ${escapeHTML(ncc ? ncc.TenNcc : nh.MaNcc)}</div>
          <div style="margin-top:4px;"><strong>Tình trạng thanh toán:</strong> ${statusBadge(nh.TrangthaiTT || 'Đã thanh toán')}</div>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã BT</th>
                <th>Sản phẩm</th>
                <th>SL nhập</th>
                <th>Giá nhập</th>
                <th class="text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${lines
                .map((ln) => {
                  const info = window.Store.getVariantDetails(ln.MaBt);
                  return `
                    <tr>
                      <td class="mono-code">${escapeHTML(ln.MaBt)}</td>
                      <td>${info ? `${escapeHTML(info.TenSp)} (${escapeHTML(info.Mau)}, S${info.Size})` : escapeHTML(ln.MaBt)}</td>
                      <td>${ln.Soluong}</td>
                      <td>${formatVND(ln.Gianhap)}</td>
                      <td class="text-right font-semibold">${formatVND(ln.Soluong * ln.Gianhap)}</td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
          </table>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;font-size:1rem;flex-wrap:wrap;gap:10px;">
          <div>
            ${nh.TrangthaiTT === 'Còn nợ' ? `<button type="button" class="btn btn-success btn-sm" id="btn-settle-nh">Xác nhận đã tất toán công nợ NCC</button>` : ''}
          </div>
          <div>Tổng giá trị hóa đơn: <strong class="text-accent">${formatVND(nh.Tongtien)}</strong></div>
        </div>
      `;
      document.getElementById('btn-settle-nh')?.addEventListener('click', () => {
        const curDb = window.Store.loadDB();
        const target = curDb.NhapHang.find((x) => x.MaNh === MaNh);
        if (target) {
          target.TrangthaiTT = 'Đã thanh toán';
          window.Store.saveDB(curDb);
          closeModal('inv-detail-modal');
          showToast(`Đã cập nhật hóa đơn nhập ${MaNh} sang trạng thái Đã thanh toán.`);
          renderInventoryViews();
        }
      });
      openModal('inv-detail-modal');
    }

    document.getElementById('inv-search')?.addEventListener('input', (e) => {
      stockSearch = e.target.value.trim();
      renderInventoryViews();
    });
    document.getElementById('inv-status-filter')?.addEventListener('change', (e) => {
      stockFilter = e.target.value;
      renderInventoryViews();
    });

    document.getElementById('btn-add-imp-line')?.addEventListener('click', () => {
      const MaBt = document.getElementById('imp-variant-sel').value;
      const Soluong = parseInt(document.getElementById('imp-qty').value, 10);
      const Gianhap = Number(document.getElementById('imp-price').value);
      if (!MaBt || isNaN(Soluong) || Soluong <= 0 || isNaN(Gianhap) || Gianhap <= 0) {
        return showToast('Vui lòng nhập số lượng và đơn giá nhập lớn hơn 0.', 'error');
      }
      const existing = draftLines.find((l) => l.MaBt === MaBt);
      if (existing) {
        existing.Soluong += Soluong;
        existing.Gianhap = Gianhap;
      } else {
        draftLines.push({ MaBt, Soluong, Gianhap });
      }
      renderDraftImport();
    });

    document.getElementById('imp-submit-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const res = window.Store.createImportReceipt({
        MaNcc: document.getElementById('imp-supplier').value,
        Macong: document.getElementById('imp-gateway').value,
        TrangthaiTT: document.getElementById('imp-pay-status').value,
        lines: draftLines,
        actorId: auth.user.id
      });
      if (!res.ok) return showToast(res.message, 'error');
      draftLines = [];
      renderDraftImport();
      renderInventoryViews();
      showToast(res.message, 'success');
      switchInvTab('history');
    });

    renderInventoryViews();
    renderDraftImport();
  }

  // -------------------- 4. QUẢN LÝ NHÀ CUNG CẤP (Chủ cửa hàng) --------------------
  function initSuppliersAdmin() {
    const auth = renderAdminShell({ activePage: 'suppliers', pageTitle: 'Quản lý nhà cung cấp', ownerOnly: true });
    if (!auth.authorized) return;

    const mount = document.getElementById('admin-page-content');
    let kw = '';

    mount.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <input type="text" class="form-control admin-search-input" id="sup-search" placeholder="Tìm mã NCC, tên nhà cung cấp, SĐT...">
          <button type="button" class="btn btn-primary" id="btn-add-ncc">${Icons.plus} Thêm nhà cung cấp</button>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã NCC</th>
                <th>Tên nhà cung cấp</th>
                <th>Số điện thoại</th>
                <th>Email</th>
                <th>Địa chỉ</th>
                <th class="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody id="ncc-tbody"></tbody>
          </table>
        </div>
      </div>
    `;

    function renderTable() {
      const db = window.Store.loadDB();
      const list = db.NhaCungCap.filter((n) => {
        if (!kw) return true;
        const s = kw.toLowerCase();
        return n.MaNcc.toLowerCase().includes(s) || n.TenNcc.toLowerCase().includes(s) || n.Sdt.includes(s);
      });
      const tbody = document.getElementById('ncc-tbody');
      tbody.innerHTML = list
        .map(
          (n) => `
          <tr>
            <td class="mono-code font-semibold">${escapeHTML(n.MaNcc)}</td>
            <td class="font-medium">${escapeHTML(n.TenNcc)}</td>
            <td>${escapeHTML(n.Sdt)}</td>
            <td>${escapeHTML(n.Email || '—')}</td>
            <td>${escapeHTML(n.Diachi)}</td>
            <td class="text-right">
              <div class="table-actions">
                <button type="button" class="btn btn-outline btn-sm" data-edit-ncc="${escapeHTML(n.MaNcc)}">${Icons.edit} Sửa</button>
                <button type="button" class="btn btn-danger-outline btn-sm" data-del-ncc="${escapeHTML(n.MaNcc)}">${Icons.trash}</button>
              </div>
            </td>
          </tr>
        `
        )
        .join('');

      tbody.querySelectorAll('[data-edit-ncc]').forEach((b) => {
        b.addEventListener('click', () => openSupplierModal(b.getAttribute('data-edit-ncc')));
      });
      tbody.querySelectorAll('[data-del-ncc]').forEach((b) => {
        b.addEventListener('click', () => {
          const id = b.getAttribute('data-del-ncc');
          confirmDialog({
            title: `Xóa nhà cung cấp ${id}`,
            message: 'Bạn có chắc muốn xóa nhà cung cấp này khỏi hệ thống?',
            confirmText: 'Xóa',
            danger: true,
            onConfirm: () => {
              const res = window.Store.deleteSupplier(id);
              if (!res.ok) showToast(res.message, 'error');
              else {
                showToast(res.message);
                renderTable();
              }
            }
          });
        });
      });
    }

    function openSupplierModal(editId) {
      const db = window.Store.loadDB();
      const ncc = editId ? db.NhaCungCap.find((n) => n.MaNcc === editId) : null;
      document.getElementById('ncc-modal-title').textContent = ncc ? `Sửa nhà cung cấp ${ncc.MaNcc}` : 'Thêm nhà cung cấp mới';
      document.getElementById('ncc-modal-body').innerHTML = `
        <form id="ncc-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Mã NCC</label>
              <input type="text" class="form-control mono-code" id="n-mancc" value="${escapeHTML(ncc ? ncc.MaNcc : '')}" placeholder="Tự sinh nếu để trống" ${ncc ? 'readonly' : ''}>
            </div>
            <div class="form-group">
              <label class="form-label">Số điện thoại <span class="req">*</span></label>
              <input type="tel" class="form-control" id="n-sdt" value="${escapeHTML(ncc ? ncc.Sdt : '')}" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Tên nhà cung cấp <span class="req">*</span></label>
            <input type="text" class="form-control" id="n-tenncc" value="${escapeHTML(ncc ? ncc.TenNcc : '')}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email liên hệ</label>
            <input type="email" class="form-control" id="n-email" value="${escapeHTML(ncc ? ncc.Email || '' : '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Địa chỉ <span class="req">*</span></label>
            <input type="text" class="form-control" id="n-diachi" value="${escapeHTML(ncc ? ncc.Diachi : '')}" required>
          </div>
          <div class="modal-footer" style="margin:18px -22px -20px;">
            <button type="button" class="btn btn-outline" data-close-modal="ncc-modal">Hủy</button>
            <button type="submit" class="btn btn-primary">Lưu nhà cung cấp</button>
          </div>
        </form>
      `;
      document.getElementById('ncc-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const res = window.Store.saveSupplier(
          {
            MaNcc: document.getElementById('n-mancc').value,
            TenNcc: document.getElementById('n-tenncc').value,
            Sdt: document.getElementById('n-sdt').value,
            Email: document.getElementById('n-email').value,
            Diachi: document.getElementById('n-diachi').value
          },
          Boolean(ncc)
        );
        if (!res.ok) return showToast(res.message, 'error');
        closeModal('ncc-modal');
        showToast(res.message);
        renderTable();
      });
      openModal('ncc-modal');
    }

    document.getElementById('sup-search')?.addEventListener('input', (e) => {
      kw = e.target.value.trim();
      renderTable();
    });
    document.getElementById('btn-add-ncc')?.addEventListener('click', () => openSupplierModal(null));
    renderTable();
  }

  // -------------------- 5. QUẢN LÝ ĐƠN HÀNG --------------------
  function initOrdersAdmin() {
    const auth = renderAdminShell({ activePage: 'orders', pageTitle: 'Quản lý đơn hàng (DonHang)' });
    if (!auth.authorized) return;

    const mount = document.getElementById('admin-page-content');
    let kw = '';
    let stFilter = '';

    mount.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <div class="admin-filters">
            <input type="text" class="form-control admin-search-input" id="ord-search" placeholder="Tìm mã đơn, tên khách hàng, SĐT...">
            <select class="form-control" id="ord-status-filter">
              <option value="">Tất cả trạng thái</option>
              <option value="Chờ xác nhận">Chờ xác nhận</option>
              <option value="Đã xác nhận">Đã xác nhận</option>
              <option value="Đang giao hàng">Đang giao hàng</option>
              <option value="Đã giao">Đã giao</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách nhận</th>
                <th>Ngày đặt</th>
                <th>Thanh toán</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th class="text-right">Xử lý đơn</th>
              </tr>
            </thead>
            <tbody id="adm-orders-tbody"></tbody>
          </table>
        </div>
      </div>
    `;

    function renderOrders() {
      const db = window.Store.loadDB();
      const list = db.DonHang.filter((o) => {
        if (stFilter && o.Trangthai !== stFilter) return false;
        if (kw) {
          const s = kw.toLowerCase();
          return o.MaDh.toLowerCase().includes(s) || o.Nguoinhan.toLowerCase().includes(s) || o.Sdtnhan.includes(s);
        }
        return true;
      });

      const tbody = document.getElementById('adm-orders-tbody');
      tbody.innerHTML = list.length
        ? list
            .map(
              (o) => `
              <tr>
                <td class="mono-code font-semibold">${escapeHTML(o.MaDh)}</td>
                <td>
                  <div class="font-medium">${escapeHTML(o.Nguoinhan)}</div>
                  <div class="text-muted" style="font-size:0.76rem;">${escapeHTML(o.Sdtnhan)} • KH: ${escapeHTML(o.MaKh)}</div>
                </td>
                <td>${formatDateVN(o.Ngaydat)}</td>
                <td style="font-size:0.82rem;">${escapeHTML(o.PhuongthucTT)}</td>
                <td class="font-semibold text-accent">${formatVND(o.Tongtien)}</td>
                <td>${statusBadge(o.Trangthai)}</td>
                <td class="text-right">
                  <button type="button" class="btn btn-outline btn-sm" data-manage-ord="${escapeHTML(o.MaDh)}">${Icons.eye} Chi tiết &amp; Cập nhật</button>
                </td>
              </tr>
            `
            )
            .join('')
        : `<tr><td colspan="7" class="text-center text-muted" style="padding:28px;">Không có đơn hàng nào khớp bộ lọc.</td></tr>`;

      tbody.querySelectorAll('[data-manage-ord]').forEach((b) => {
        b.addEventListener('click', () => openOrderManageModal(b.getAttribute('data-manage-ord')));
      });
    }

    function openOrderManageModal(MaDh) {
      const db = window.Store.loadDB();
      const ord = db.DonHang.find((o) => o.MaDh === MaDh);
      if (!ord) return;
      const lines = db.ChiTietDonHang.filter((ct) => ct.MaDh === MaDh);
      const locked = ord.Trangthai === 'Đã hủy' || ord.Trangthai === 'Đã giao';

      document.getElementById('ord-modal-title').textContent = `Chi tiết đơn hàng ${ord.MaDh}`;
      document.getElementById('ord-modal-body').innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;background:var(--bg-main);padding:14px 16px;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:16px;font-size:0.85rem;">
          <div>
            <div><strong>Khách nhận:</strong> ${escapeHTML(ord.Nguoinhan)} (${escapeHTML(ord.Sdtnhan)})</div>
            <div style="margin-top:4px;"><strong>Địa chỉ giao:</strong> ${escapeHTML(ord.Diachigiao)}</div>
            ${ord.Ghichu ? `<div style="margin-top:4px;"><strong>Ghi chú:</strong> ${escapeHTML(ord.Ghichu)}</div>` : ''}
          </div>
          <div>
            <div><strong>Ngày đặt:</strong> ${formatDateVN(ord.Ngaydat)}</div>
            <div style="margin-top:4px;"><strong>Thanh toán:</strong> ${escapeHTML(ord.PhuongthucTT)}</div>
            <div style="margin-top:4px;"><strong>Nhân viên phụ trách:</strong> ${escapeHTML(ord.MaNv || 'Chưa phân công')}</div>
          </div>
        </div>

        <div class="table-wrap" style="margin-bottom:16px;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã BT</th>
                <th>Sản phẩm &amp; Biến thể</th>
                <th>Đơn giá</th>
                <th>SL</th>
                <th class="text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${lines
                .map((ln) => {
                  const info = window.Store.getVariantDetails(ln.MaBt);
                  return `
                    <tr>
                      <td class="mono-code">${escapeHTML(ln.MaBt)}</td>
                      <td>${info ? `${escapeHTML(info.TenSp)} (${escapeHTML(info.Mau)}, S${info.Size})` : escapeHTML(ln.MaBt)}</td>
                      <td>${formatVND(ln.Dongia)}</td>
                      <td>${ln.Soluong}</td>
                      <td class="text-right font-semibold">${formatVND(ln.Dongia * ln.Soluong)}</td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
          </table>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--border);flex-wrap:wrap;gap:12px;">
          <div>
            Tổng thanh toán: <strong class="text-accent" style="font-size:1.1rem;">${formatVND(ord.Tongtien)}</strong>
            ${ord.Giamgia > 0 ? `<span class="text-muted" style="font-size:0.8rem;"> (Đã giảm ${formatVND(ord.Giamgia)})</span>` : ''}
          </div>

          <form id="ord-status-form" style="display:flex;align-items:center;gap:8px;">
            <select class="form-control" id="ord-next-status" ${locked ? 'disabled' : ''}>
              ${['Chờ xác nhận', 'Đã xác nhận', 'Đang giao hàng', 'Đã giao', 'Đã hủy']
                .map((st) => `<option value="${st}" ${ord.Trangthai === st ? 'selected' : ''}>${st}</option>`)
                .join('')}
            </select>
            <button type="submit" class="btn btn-primary" ${locked ? 'disabled' : ''}>Cập nhật trạng thái</button>
          </form>
        </div>
      `;

      document.getElementById('ord-status-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const nextSt = document.getElementById('ord-next-status').value;
        const res = window.Store.updateOrderStatus(ord.MaDh, nextSt, auth.user.id);
        if (!res.ok) return showToast(res.message, 'error');
        closeModal('ord-modal');
        showToast(res.message, 'success');
        renderOrders();
      });

      openModal('ord-modal');
    }

    document.getElementById('ord-search')?.addEventListener('input', (e) => {
      kw = e.target.value.trim();
      renderOrders();
    });
    document.getElementById('ord-status-filter')?.addEventListener('change', (e) => {
      stFilter = e.target.value;
      renderOrders();
    });

    renderOrders();
  }

  // -------------------- 6. QUẢN LÝ KHÁCH HÀNG --------------------
  function initCustomersAdmin() {
    const auth = renderAdminShell({ activePage: 'customers', pageTitle: 'Quản lý khách hàng (KhachHang)' });
    if (!auth.authorized) return;

    const mount = document.getElementById('admin-page-content');
    let kw = '';

    mount.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <input type="text" class="form-control admin-search-input" id="kh-search" placeholder="Tìm mã KH, tên khách hàng, SĐT, email...">
          <button type="button" class="btn btn-primary" id="btn-add-kh">${Icons.plus} Thêm khách hàng</button>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã KH</th>
                <th>Họ và tên</th>
                <th>Liên hệ</th>
                <th>Địa chỉ</th>
                <th>Đơn đã mua</th>
                <th>Điểm tích lũy</th>
                <th class="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody id="kh-tbody"></tbody>
          </table>
        </div>
      </div>
    `;

    function renderCustomers() {
      const db = window.Store.loadDB();
      const list = db.KhachHang.filter((k) => {
        if (!kw) return true;
        const s = kw.toLowerCase();
        return k.MaKh.toLowerCase().includes(s) || k.TenKh.toLowerCase().includes(s) || k.Sdt.includes(s) || k.Email.toLowerCase().includes(s);
      });

      const tbody = document.getElementById('kh-tbody');
      tbody.innerHTML = list
        .map((k) => {
          const ordCount = db.DonHang.filter((o) => o.MaKh === k.MaKh).length;
          return `
            <tr>
              <td class="mono-code font-semibold">${escapeHTML(k.MaKh)}</td>
              <td class="font-medium">${escapeHTML(k.TenKh)}</td>
              <td>
                <div>${escapeHTML(k.Sdt)}</div>
                <div class="text-muted" style="font-size:0.76rem;">${escapeHTML(k.Email)}</div>
              </td>
              <td style="max-width:240px;font-size:0.82rem;">${escapeHTML(k.Diachi)}</td>
              <td>${ordCount} đơn</td>
              <td><span class="badge badge-accent">${k.Diemtichluy || 0} điểm</span></td>
              <td class="text-right">
                <div class="table-actions">
                  <button type="button" class="btn btn-outline btn-sm" data-edit-kh="${escapeHTML(k.MaKh)}">${Icons.edit} Sửa</button>
                  <button type="button" class="btn btn-danger-outline btn-sm" data-del-kh="${escapeHTML(k.MaKh)}">${Icons.trash}</button>
                </div>
              </td>
            </tr>
          `;
        })
        .join('');

      tbody.querySelectorAll('[data-edit-kh]').forEach((b) => {
        b.addEventListener('click', () => openCustomerModal(b.getAttribute('data-edit-kh')));
      });
      tbody.querySelectorAll('[data-del-kh]').forEach((b) => {
        b.addEventListener('click', () => {
          const id = b.getAttribute('data-del-kh');
          confirmDialog({
            title: `Xóa khách hàng ${id}`,
            message: 'Xác nhận xóa tài khoản khách hàng này?',
            confirmText: 'Xóa',
            danger: true,
            onConfirm: () => {
              const res = window.Store.deleteCustomer(id);
              if (!res.ok) showToast(res.message, 'error');
              else {
                showToast(res.message);
                renderCustomers();
              }
            }
          });
        });
      });
    }

    function openCustomerModal(editId) {
      const db = window.Store.loadDB();
      const kh = editId ? db.KhachHang.find((k) => k.MaKh === editId) : null;
      document.getElementById('kh-modal-title').textContent = kh ? `Chỉnh sửa khách hàng ${kh.MaKh}` : 'Thêm khách hàng mới';
      document.getElementById('kh-modal-body').innerHTML = `
        <form id="kh-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Mã KH</label>
              <input type="text" class="form-control mono-code" id="k-makh" value="${escapeHTML(kh ? kh.MaKh : '')}" placeholder="Tự sinh nếu để trống" ${kh ? 'readonly' : ''}>
            </div>
            <div class="form-group">
              <label class="form-label">Họ và tên <span class="req">*</span></label>
              <input type="text" class="form-control" id="k-tenkh" value="${escapeHTML(kh ? kh.TenKh : '')}" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Số điện thoại <span class="req">*</span></label>
              <input type="tel" class="form-control" id="k-sdt" value="${escapeHTML(kh ? kh.Sdt : '')}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Email <span class="req">*</span></label>
              <input type="email" class="form-control" id="k-email" value="${escapeHTML(kh ? kh.Email : '')}" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Địa chỉ <span class="req">*</span></label>
            <input type="text" class="form-control" id="k-diachi" value="${escapeHTML(kh ? kh.Diachi : '')}" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Điểm tích lũy</label>
              <input type="number" class="form-control" id="k-diem" value="${kh ? kh.Diemtichluy || 0 : 0}" min="0">
            </div>
            <div class="form-group">
              <label class="form-label">Mật khẩu ${kh ? '(để trống nếu giữ nguyên)' : ''}</label>
              <input type="text" class="form-control" id="k-pw" value="${kh ? '' : '123456'}">
            </div>
          </div>
          <div class="modal-footer" style="margin:18px -22px -20px;">
            <button type="button" class="btn btn-outline" data-close-modal="kh-modal">Hủy</button>
            <button type="submit" class="btn btn-primary">Lưu thông tin</button>
          </div>
        </form>
      `;

      document.getElementById('kh-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const res = window.Store.saveCustomer(
          {
            MaKh: document.getElementById('k-makh').value,
            TenKh: document.getElementById('k-tenkh').value,
            Sdt: document.getElementById('k-sdt').value,
            Email: document.getElementById('k-email').value,
            Diachi: document.getElementById('k-diachi').value,
            Diemtichluy: document.getElementById('k-diem').value,
            Matkhau: document.getElementById('k-pw').value
          },
          Boolean(kh)
        );
        if (!res.ok) return showToast(res.message, 'error');
        closeModal('kh-modal');
        showToast(res.message);
        renderCustomers();
      });

      openModal('kh-modal');
    }

    document.getElementById('kh-search')?.addEventListener('input', (e) => {
      kw = e.target.value.trim();
      renderCustomers();
    });
    document.getElementById('btn-add-kh')?.addEventListener('click', () => openCustomerModal(null));
    renderCustomers();
  }

  // -------------------- 7. QUẢN LÝ NHÂN VIÊN (Chủ cửa hàng) --------------------
  function initEmployeesAdmin() {
    const auth = renderAdminShell({ activePage: 'employees', pageTitle: 'Quản lý nhân viên (NhanVien)', ownerOnly: true });
    if (!auth.authorized) return;

    const mount = document.getElementById('admin-page-content');
    let kw = '';

    mount.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <input type="text" class="form-control admin-search-input" id="nv-search" placeholder="Tìm mã NV, họ tên, chức vụ...">
          <button type="button" class="btn btn-primary" id="btn-add-nv">${Icons.plus} Thêm nhân viên</button>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã NV</th>
                <th>Họ tên &amp; Giới tính</th>
                <th>Chức vụ</th>
                <th>Liên hệ</th>
                <th>Lương cơ bản</th>
                <th>Trạng thái</th>
                <th class="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody id="nv-tbody"></tbody>
          </table>
        </div>
      </div>
    `;

    function renderEmployees() {
      const db = window.Store.loadDB();
      const list = db.NhanVien.filter((n) => {
        if (!kw) return true;
        const s = kw.toLowerCase();
        return n.MaNv.toLowerCase().includes(s) || n.TenNv.toLowerCase().includes(s) || (n.Chucvu || '').toLowerCase().includes(s);
      });

      const tbody = document.getElementById('nv-tbody');
      tbody.innerHTML = list
        .map(
          (n) => `
          <tr>
            <td class="mono-code font-semibold">${escapeHTML(n.MaNv)}</td>
            <td>
              <div class="font-medium">${escapeHTML(n.TenNv)}</div>
              <div class="text-muted" style="font-size:0.76rem;">${escapeHTML(n.Gioitinh || 'Nam')} • NS: ${formatDateVN(n.Ngaysinh)}</div>
            </td>
            <td>${escapeHTML(n.Chucvu || 'Nhân viên')}</td>
            <td>
              <div>${escapeHTML(n.Sdt)}</div>
              <div class="text-muted" style="font-size:0.76rem;">${escapeHTML(n.Email)}</div>
            </td>
            <td class="font-medium">${formatVND(n.Luong || 0)}</td>
            <td>${statusBadge(n.Trangthai || 'Đang làm việc')}</td>
            <td class="text-right">
              <div class="table-actions">
                <button type="button" class="btn btn-outline btn-sm" data-edit-nv="${escapeHTML(n.MaNv)}">${Icons.edit} Sửa</button>
                <button type="button" class="btn btn-danger-outline btn-sm" data-del-nv="${escapeHTML(n.MaNv)}">${Icons.trash}</button>
              </div>
            </td>
          </tr>
        `
        )
        .join('');

      tbody.querySelectorAll('[data-edit-nv]').forEach((b) => {
        b.addEventListener('click', () => openEmployeeModal(b.getAttribute('data-edit-nv')));
      });
      tbody.querySelectorAll('[data-del-nv]').forEach((b) => {
        b.addEventListener('click', () => {
          const id = b.getAttribute('data-del-nv');
          confirmDialog({
            title: `Xóa nhân viên ${id}`,
            message: 'Xác nhận xóa nhân viên? (Nếu nhân viên đã có hóa đơn/phiếu nhập liên quan, hệ thống sẽ chuyển sang trạng thái "Ngừng làm việc" theo đặc tả UML).',
            confirmText: 'Xác nhận',
            danger: true,
            onConfirm: () => {
              const res = window.Store.deleteEmployee(id);
              if (!res.ok) showToast(res.message, 'error');
              else {
                showToast(res.message, res.softDeleted ? 'warning' : 'success');
                renderEmployees();
              }
            }
          });
        });
      });
    }

    function openEmployeeModal(editId) {
      const db = window.Store.loadDB();
      const nv = editId ? db.NhanVien.find((n) => n.MaNv === editId) : null;
      document.getElementById('nv-modal-title').textContent = nv ? `Cập nhật nhân viên ${nv.MaNv}` : 'Thêm nhân viên mới';
      document.getElementById('nv-modal-body').innerHTML = `
        <form id="nv-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Mã nhân viên</label>
              <input type="text" class="form-control mono-code" id="e-manv" value="${escapeHTML(nv ? nv.MaNv : '')}" placeholder="Tự sinh nếu để trống" ${nv ? 'readonly' : ''}>
            </div>
            <div class="form-group">
              <label class="form-label">Họ và tên <span class="req">*</span></label>
              <input type="text" class="form-control" id="e-tennv" value="${escapeHTML(nv ? nv.TenNv : '')}" required>
            </div>
          </div>
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">Ngày sinh</label>
              <input type="date" class="form-control" id="e-ngaysinh" value="${escapeHTML(nv ? nv.Ngaysinh || '2002-01-01' : '2002-01-01')}">
            </div>
            <div class="form-group">
              <label class="form-label">Giới tính</label>
              <select class="form-control" id="e-gioitinh">
                <option value="Nam" ${nv && nv.Gioitinh === 'Nam' ? 'selected' : ''}>Nam</option>
                <option value="Nữ" ${nv && nv.Gioitinh === 'Nữ' ? 'selected' : ''}>Nữ</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Chức vụ <span class="req">*</span></label>
              <input type="text" class="form-control" id="e-chucvu" value="${escapeHTML(nv ? nv.Chucvu : 'Nhân viên bán hàng')}" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Số điện thoại <span class="req">*</span></label>
              <input type="tel" class="form-control" id="e-sdt" value="${escapeHTML(nv ? nv.Sdt : '')}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Email đăng nhập <span class="req">*</span></label>
              <input type="email" class="form-control" id="e-email" value="${escapeHTML(nv ? nv.Email : '')}" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Địa chỉ</label>
            <input type="text" class="form-control" id="e-diachi" value="${escapeHTML(nv ? nv.Diachi || '' : '')}">
          </div>
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">Lương (VNĐ)</label>
              <input type="number" class="form-control" id="e-luong" value="${nv ? nv.Luong || 9000000 : 9000000}" step="100000">
            </div>
            <div class="form-group">
              <label class="form-label">Trạng thái</label>
              <select class="form-control" id="e-trangthai">
                <option value="Đang làm việc" ${!nv || nv.Trangthai === 'Đang làm việc' ? 'selected' : ''}>Đang làm việc</option>
                <option value="Ngừng làm việc" ${nv && nv.Trangthai === 'Ngừng làm việc' ? 'selected' : ''}>Ngừng làm việc</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Mật khẩu ${nv ? '(để trống nếu giữ)' : ''}</label>
              <input type="text" class="form-control" id="e-pw" value="${nv ? '' : '123456'}">
            </div>
          </div>
          <div class="modal-footer" style="margin:18px -22px -20px;">
            <button type="button" class="btn btn-outline" data-close-modal="nv-modal">Hủy</button>
            <button type="submit" class="btn btn-primary">Lưu nhân viên</button>
          </div>
        </form>
      `;

      document.getElementById('nv-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const res = window.Store.saveEmployee(
          {
            MaNv: document.getElementById('e-manv').value,
            TenNv: document.getElementById('e-tennv').value,
            Ngaysinh: document.getElementById('e-ngaysinh').value,
            Gioitinh: document.getElementById('e-gioitinh').value,
            Chucvu: document.getElementById('e-chucvu').value,
            Sdt: document.getElementById('e-sdt').value,
            Email: document.getElementById('e-email').value,
            Diachi: document.getElementById('e-diachi').value,
            Luong: document.getElementById('e-luong').value,
            Trangthai: document.getElementById('e-trangthai').value,
            Matkhau: document.getElementById('e-pw').value
          },
          Boolean(nv)
        );
        if (!res.ok) return showToast(res.message, 'error');
        closeModal('nv-modal');
        showToast(res.message);
        renderEmployees();
      });

      openModal('nv-modal');
    }

    document.getElementById('nv-search')?.addEventListener('input', (e) => {
      kw = e.target.value.trim();
      renderEmployees();
    });
    document.getElementById('btn-add-nv')?.addEventListener('click', () => openEmployeeModal(null));
    renderEmployees();
  }

  // -------------------- 8. QUẢN LÝ ĐỔI TRẢ (DoiTra) --------------------
  function initReturnsAdmin() {
    const auth = renderAdminShell({ activePage: 'returns', pageTitle: 'Quản lý yêu cầu đổi trả (DoiTra)' });
    if (!auth.authorized) return;

    const mount = document.getElementById('admin-page-content');
    let stFilter = '';

    mount.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <select class="form-control" style="max-width:220px;" id="ret-adm-filter">
            <option value="">Tất cả trạng thái</option>
            <option value="Chờ duyệt">Chờ duyệt</option>
            <option value="Đã duyệt">Đã duyệt</option>
            <option value="Từ chối">Từ chối</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã phiếu</th>
                <th>Đơn gốc</th>
                <th>Khách hàng</th>
                <th>Sản phẩm &amp; SL</th>
                <th>Hình thức</th>
                <th>Tiền hoàn</th>
                <th>Kết quả</th>
                <th class="text-right">Xử lý</th>
              </tr>
            </thead>
            <tbody id="ret-adm-tbody"></tbody>
          </table>
        </div>
      </div>
    `;

    function renderReturns() {
      const db = window.Store.loadDB();
      const list = db.DoiTra.filter((r) => !stFilter || r.Ketqua === stFilter);
      const tbody = document.getElementById('ret-adm-tbody');

      tbody.innerHTML = list.length
        ? list
            .map((r) => {
              const kh = db.KhachHang.find((k) => k.MaKh === r.MaKh);
              const vInfo = window.Store.getVariantDetails(r.MaBt);
              return `
                <tr>
                  <td class="mono-code font-semibold">
                    ${escapeHTML(r.MaDoitra)}
                    <div class="text-muted" style="font-size:0.75rem;">${formatDateVN(r.Ngaydoitra)}</div>
                  </td>
                  <td class="mono-code">${escapeHTML(r.MaDh)}</td>
                  <td>${escapeHTML(kh ? kh.TenKh : r.MaKh)}</td>
                  <td>
                    <div class="font-medium">${escapeHTML(vInfo ? vInfo.TenSp : r.MaBt)}</div>
                    <div class="text-muted" style="font-size:0.76rem;">${vInfo ? `${escapeHTML(vInfo.Mau)} • S${vInfo.Size}` : ''} × ${r.Soluong || 1}</div>
                  </td>
                  <td>${escapeHTML(r.Loai)}</td>
                  <td class="font-medium">${r.Tienhoan > 0 ? formatVND(r.Tienhoan) : '0₫'}</td>
                  <td>${statusBadge(r.Ketqua)}</td>
                  <td class="text-right">
                    <button type="button" class="btn btn-outline btn-sm" data-proc-ret="${escapeHTML(r.MaDoitra)}">${Icons.eye} Chi tiết / Duyệt</button>
                  </td>
                </tr>
              `;
            })
            .join('')
        : `<tr><td colspan="8" class="text-center text-muted" style="padding:28px;">Không có phiếu đổi trả nào.</td></tr>`;

      tbody.querySelectorAll('[data-proc-ret]').forEach((b) => {
        b.addEventListener('click', () => openReturnProcessModal(b.getAttribute('data-proc-ret')));
      });
    }

    function openReturnProcessModal(MaDoitra) {
      const db = window.Store.loadDB();
      const dt = db.DoiTra.find((r) => r.MaDoitra === MaDoitra);
      if (!dt) return;
      const ord = db.DonHang.find((o) => o.MaDh === dt.MaDh);
      const vInfo = window.Store.getVariantDetails(dt.MaBt);
      const isPending = dt.Ketqua === 'Chờ duyệt';

      document.getElementById('ret-modal-title').textContent = `Xử lý phiếu đổi trả ${dt.MaDoitra}`;
      document.getElementById('ret-modal-body').innerHTML = `
        <div style="background:var(--bg-main);padding:14px 16px;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:16px;font-size:0.86rem;">
          <div><strong>Đơn hàng gốc:</strong> <span class="mono-code">${escapeHTML(dt.MaDh)}</span> (Ngày đặt: ${ord ? formatDateVN(ord.Ngaydat) : '—'})</div>
          <div style="margin-top:4px;"><strong>Sản phẩm yêu cầu:</strong> ${vInfo ? `${escapeHTML(vInfo.TenSp)} (${escapeHTML(vInfo.Mau)}, Size ${vInfo.Size})` : escapeHTML(dt.MaBt)} × ${dt.Soluong || 1}</div>
          <div style="margin-top:4px;"><strong>Hình thức khách chọn:</strong> ${escapeHTML(dt.Loai)}</div>
          <div style="margin-top:4px;"><strong>Lý do khách gửi:</strong> ${escapeHTML(dt.Lydo)}</div>
          <div style="margin-top:4px;"><strong>Trạng thái hiện tại:</strong> ${statusBadge(dt.Ketqua)}</div>
        </div>

        <form id="ret-proc-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Quyết định xử lý</label>
              <select class="form-control" id="rp-decision" ${!isPending ? 'disabled' : ''}>
                <option value="Đã duyệt" ${dt.Ketqua === 'Đã duyệt' ? 'selected' : ''}>Duyệt yêu cầu (Nhập hoàn tồn kho)</option>
                <option value="Từ chối" ${dt.Ketqua === 'Từ chối' ? 'selected' : ''}>Từ chối yêu cầu</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Số tiền hoàn trả (VNĐ)</label>
              <input type="number" class="form-control" id="rp-refund" value="${dt.Tienhoan || (vInfo && dt.Loai === 'Trả hàng hoàn tiền' ? vInfo.GiaBan * (dt.Soluong || 1) : 0)}" ${!isPending ? 'readonly' : ''}>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Ghi chú xử lý / Lý do phản hồi khách hàng</label>
            <textarea class="form-control" id="rp-note" placeholder="Nhập hướng dẫn gửi hàng đổi hoặc lý do từ chối..." ${!isPending ? 'readonly' : ''}>${escapeHTML(dt.GhichuXuLy || '')}</textarea>
          </div>
          <div class="modal-footer" style="margin:18px -22px -20px;">
            <button type="button" class="btn btn-outline" data-close-modal="ret-modal">Đóng</button>
            ${isPending ? `<button type="submit" class="btn btn-primary">Xác nhận kết quả xử lý</button>` : ''}
          </div>
        </form>
      `;

      document.getElementById('ret-proc-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const res = window.Store.processReturnRequest(
          dt.MaDoitra,
          document.getElementById('rp-decision').value,
          document.getElementById('rp-refund').value,
          document.getElementById('rp-note').value,
          auth.user.id
        );
        if (!res.ok) return showToast(res.message, 'error');
        closeModal('ret-modal');
        showToast(res.message, 'success');
        renderReturns();
      });

      openModal('ret-modal');
    }

    document.getElementById('ret-adm-filter')?.addEventListener('change', (e) => {
      stFilter = e.target.value;
      renderReturns();
    });
    renderReturns();
  }

  // -------------------- 9. QUẢN LÝ HỖ TRỢ KHÁCH HÀNG (PhieuHoTro) --------------------
  function initSupportAdmin() {
    const auth = renderAdminShell({ activePage: 'support', pageTitle: 'Quản lý yêu cầu hỗ trợ (PhieuHoTro)' });
    if (!auth.authorized) return;

    const mount = document.getElementById('admin-page-content');
    let stFilter = '';

    mount.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <select class="form-control" style="max-width:220px;" id="sup-adm-filter">
            <option value="">Tất cả trạng thái</option>
            <option value="Chờ xử lý">Chờ xử lý</option>
            <option value="Đang xử lý">Đang xử lý</option>
            <option value="Đã hoàn thành">Đã hoàn thành</option>
          </select>
          <button type="button" class="btn btn-primary" id="btn-create-ticket">${Icons.plus} Lập phiếu hỗ trợ mới</button>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã phiếu</th>
                <th>Khách hàng</th>
                <th>Loại vấn đề</th>
                <th>Ưu tiên</th>
                <th>Nội dung</th>
                <th>Trạng thái</th>
                <th class="text-right">Phản hồi</th>
              </tr>
            </thead>
            <tbody id="sup-adm-tbody"></tbody>
          </table>
        </div>
      </div>
    `;

    function renderTickets() {
      const db = window.Store.loadDB();
      const list = db.PhieuHoTro.filter((t) => !stFilter || t.Trangthai === stFilter);
      const tbody = document.getElementById('sup-adm-tbody');

      tbody.innerHTML = list.length
        ? list
            .map((t) => {
              const kh = db.KhachHang.find((k) => k.MaKh === t.MaKh);
              return `
                <tr>
                  <td class="mono-code font-semibold">
                    ${escapeHTML(t.MaPhieu)}
                    <div class="text-muted" style="font-size:0.75rem;">${formatDateVN(t.Ngaytao)}</div>
                  </td>
                  <td>
                    <div class="font-medium">${escapeHTML(kh ? kh.TenKh : t.MaKh)}</div>
                    ${t.MaDh ? `<div class="mono-code text-muted" style="font-size:0.75rem;">Đơn: ${escapeHTML(t.MaDh)}</div>` : ''}
                  </td>
                  <td>${escapeHTML(t.Loaivande)}</td>
                  <td><span class="badge ${t.Mucdouutien === 'Cao' ? 'badge-error' : 'badge-neutral'}">${escapeHTML(t.Mucdouutien || 'Trung bình')}</span></td>
                  <td style="max-width:280px;font-size:0.83rem;">${escapeHTML(t.Noidung)}</td>
                  <td>${statusBadge(t.Trangthai)}</td>
                  <td class="text-right">
                    <button type="button" class="btn btn-outline btn-sm" data-reply-sup="${escapeHTML(t.MaPhieu)}">${Icons.edit} Xử lý</button>
                  </td>
                </tr>
              `;
            })
            .join('')
        : `<tr><td colspan="7" class="text-center text-muted" style="padding:28px;">Không có phiếu hỗ trợ nào.</td></tr>`;

      tbody.querySelectorAll('[data-reply-sup]').forEach((b) => {
        b.addEventListener('click', () => openReplyModal(b.getAttribute('data-reply-sup')));
      });
    }

    function openCreateTicketModal() {
      const db = window.Store.loadDB();
      document.getElementById('sup-modal-title').textContent = 'Lập phiếu hỗ trợ khách hàng (Bảng 3.40)';
      document.getElementById('sup-modal-body').innerHTML = `
        <form id="staff-ticket-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Khách hàng <span class="req">*</span></label>
              <select class="form-control" id="st-kh" required>
                ${db.KhachHang.map((k) => `<option value="${escapeHTML(k.MaKh)}">${escapeHTML(k.TenKh)} (${escapeHTML(k.Sdt)})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Mã đơn liên quan (tùy chọn)</label>
              <input type="text" class="form-control mono-code" id="st-dh" placeholder="VD: DH001">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Loại vấn đề</label>
              <select class="form-control" id="st-topic">
                <option value="Tư vấn chọn size">Tư vấn chọn size</option>
                <option value="Bảo hành & Bảo dưỡng">Bảo hành &amp; Bảo dưỡng</option>
                <option value="Giao hàng & Vận chuyển">Giao hàng &amp; Vận chuyển</option>
                <option value="Khiếu nại dịch vụ">Khiếu nại dịch vụ</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Mức độ ưu tiên</label>
              <select class="form-control" id="st-prio">
                <option value="Thấp">Thấp</option>
                <option value="Trung bình" selected>Trung bình</option>
                <option value="Cao">Cao</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Nội dung ghi nhận <span class="req">*</span></label>
            <textarea class="form-control" id="st-content" required placeholder="Ghi nhận yêu cầu của khách hàng qua hotline/showroom..."></textarea>
          </div>
          <div class="modal-footer" style="margin:18px -22px -20px;">
            <button type="button" class="btn btn-outline" data-close-modal="sup-modal">Hủy</button>
            <button type="submit" class="btn btn-primary">Lưu phiếu hỗ trợ</button>
          </div>
        </form>
      `;

      document.getElementById('staff-ticket-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const res = window.Store.createSupportTicket({
          MaKh: document.getElementById('st-kh').value,
          MaDh: document.getElementById('st-dh').value.trim().toUpperCase(),
          Loaivande: document.getElementById('st-topic').value,
          Mucdouutien: document.getElementById('st-prio').value,
          Noidung: document.getElementById('st-content').value,
          actorId: auth.user.id
        });
        if (!res.ok) return showToast(res.message, 'error');
        closeModal('sup-modal');
        showToast(res.message);
        renderTickets();
      });

      openModal('sup-modal');
    }

    function openReplyModal(MaPhieu) {
      const db = window.Store.loadDB();
      const t = db.PhieuHoTro.find((x) => x.MaPhieu === MaPhieu);
      if (!t) return;
      const kh = db.KhachHang.find((k) => k.MaKh === t.MaKh);

      document.getElementById('sup-modal-title').textContent = `Xử lý phiếu hỗ trợ ${t.MaPhieu}`;
      document.getElementById('sup-modal-body').innerHTML = `
        <div style="background:var(--bg-main);padding:12px 16px;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:16px;font-size:0.86rem;">
          <div><strong>Khách hàng:</strong> ${escapeHTML(kh ? `${kh.TenKh} (${kh.Sdt})` : t.MaKh)}</div>
          <div style="margin-top:4px;"><strong>Chủ đề:</strong> ${escapeHTML(t.Loaivande)} ${t.MaDh ? `• Đơn: ${escapeHTML(t.MaDh)}` : ''}</div>
          <div style="margin-top:6px;"><strong>Nội dung khách gửi:</strong> ${escapeHTML(t.Noidung)}</div>
        </div>
        <form id="reply-sup-form">
          <div class="form-group">
            <label class="form-label">Trạng thái xử lý</label>
            <select class="form-control" id="rs-status">
              <option value="Chờ xử lý" ${t.Trangthai === 'Chờ xử lý' ? 'selected' : ''}>Chờ xử lý</option>
              <option value="Đang xử lý" ${t.Trangthai === 'Đang xử lý' ? 'selected' : ''}>Đang xử lý</option>
              <option value="Đã hoàn thành" ${t.Trangthai === 'Đã hoàn thành' ? 'selected' : ''}>Đã hoàn thành</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Nội dung phản hồi cho khách hàng <span class="req">*</span></label>
            <textarea class="form-control" id="rs-reply" required placeholder="Nhập câu trả lời hướng dẫn cho khách hàng...">${escapeHTML(t.Phanhoi || '')}</textarea>
          </div>
          <div class="modal-footer" style="margin:18px -22px -20px;">
            <button type="button" class="btn btn-outline" data-close-modal="sup-modal">Đóng</button>
            <button type="submit" class="btn btn-primary">Cập nhật &amp; Gửi phản hồi</button>
          </div>
        </form>
      `;

      document.getElementById('reply-sup-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const res = window.Store.updateSupportTicket(t.MaPhieu, {
          Trangthai: document.getElementById('rs-status').value,
          Phanhoi: document.getElementById('rs-reply').value,
          actorId: auth.user.id
        });
        if (!res.ok) return showToast(res.message, 'error');
        closeModal('sup-modal');
        showToast(res.message);
        renderTickets();
      });

      openModal('sup-modal');
    }

    document.getElementById('sup-adm-filter')?.addEventListener('change', (e) => {
      stFilter = e.target.value;
      renderTickets();
    });
    document.getElementById('btn-create-ticket')?.addEventListener('click', openCreateTicketModal);
    renderTickets();
  }

  // -------------------- 10. KHUYẾN MÃI & BÁO CÁO (Chủ cửa hàng) --------------------
  function initReportsAdmin() {
    const auth = renderAdminShell({ activePage: 'reports', pageTitle: 'Khuyến mãi & Thống kê — Báo cáo', ownerOnly: true });
    if (!auth.authorized) return;

    const mount = document.getElementById('admin-page-content');
    let revFrom = '2026-10-01';
    let revTo = '2026-11-30';
    let stockThreshold = 3;
    let topLimit = 5;

    mount.innerHTML = `
      <div class="tabs-nav">
        <button type="button" class="tab-btn active" data-tab-btn="rev">Báo cáo doanh thu</button>
        <button type="button" class="tab-btn" data-tab-btn="inv">Báo cáo hàng tồn kho</button>
        <button type="button" class="tab-btn" data-tab-btn="top">Thống kê sản phẩm bán chạy</button>
        <button type="button" class="tab-btn" data-tab-btn="promo">Quản lý chương trình khuyến mãi</button>
      </div>

      <div class="tab-pane active" data-tab-pane="rev" id="rep-rev-pane"></div>
      <div class="tab-pane" data-tab-pane="inv" id="rep-inv-pane"></div>
      <div class="tab-pane" data-tab-pane="top" id="rep-top-pane"></div>
      <div class="tab-pane" data-tab-pane="promo" id="rep-promo-pane"></div>
    `;

    setupTabs(mount);

    function renderRevenueReport() {
      const pane = document.getElementById('rep-rev-pane');
      if (revFrom && revTo && revFrom > revTo) {
        showToast('Ngày bắt đầu không được sau ngày kết thúc.', 'error');
        return;
      }
      const db = window.Store.loadDB();
      const metrics = window.Store.getUnifiedMetrics(revFrom, revTo);

      const ordersInRange = db.DonHang.filter((o) => {
        if (o.Trangthai === 'Đã hủy') return false;
        if (revFrom && o.Ngaydat < revFrom) return false;
        if (revTo && o.Ngaydat > revTo) return false;
        return true;
      });

      const byDate = {};
      ordersInRange.forEach((o) => {
        if (!byDate[o.Ngaydat]) byDate[o.Ngaydat] = { count: 0, total: 0 };
        byDate[o.Ngaydat].count += 1;
        byDate[o.Ngaydat].total += Number(o.Tongtien);
      });
      const dates = Object.keys(byDate).sort();
      const maxVal = Math.max(1, ...dates.map((d) => byDate[d].total));

      pane.innerHTML = `
        <div class="panel" style="margin-bottom:22px;">
          <div class="panel-header">
            <div class="admin-filters">
              <label style="font-size:0.82rem;font-weight:600;">Từ ngày:</label>
              <input type="date" class="form-control" id="r-from" value="${escapeHTML(revFrom)}">
              <label style="font-size:0.82rem;font-weight:600;">Đến ngày:</label>
              <input type="date" class="form-control" id="r-to" value="${escapeHTML(revTo)}">
              <button type="button" class="btn btn-primary btn-sm" id="btn-filter-rev">Thống kê</button>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="btn-save-bc">Lưu kỳ báo cáo (BaoCao)</button>
          </div>
          <div class="panel-body">
            <div class="kpi-strip" style="margin-bottom:20px;">
              <div class="kpi-cell">
                <div class="kpi-label">Số đơn thành công</div>
                <div class="kpi-value">${metrics.totalOrders} đơn</div>
              </div>
              <div class="kpi-cell">
                <div class="kpi-label">Doanh thu gộp</div>
                <div class="kpi-value">${formatVND(metrics.grossRevenue)}</div>
              </div>
              <div class="kpi-cell">
                <div class="kpi-label">Hoàn tiền đổi trả</div>
                <div class="kpi-value text-error">-${formatVND(metrics.refundedTotal)}</div>
              </div>
              <div class="kpi-cell">
                <div class="kpi-label">Doanh thu thuần</div>
                <div class="kpi-value text-accent">${formatVND(metrics.netRevenue)}</div>
              </div>
            </div>

            ${
              !dates.length
                ? `<div class="empty-state"><p>Không có dữ liệu doanh thu trong khoảng thời gian đã chọn.</p></div>`
                : `
                <div class="bar-chart-grid" style="margin-bottom:24px;">
                  ${dates
                    .map((d) => {
                      const pct = Math.max(8, Math.round((byDate[d].total / maxVal) * 100));
                      return `
                        <div class="bar-col">
                          <span class="bar-val-top">${formatVND(byDate[d].total)}</span>
                          <div class="bar-fill" style="height:${pct}%;"></div>
                          <span class="bar-lbl-bottom">${formatDateVN(d)} (${byDate[d].count} đơn)</span>
                        </div>
                      `;
                    })
                    .join('')}
                </div>
              `
            }
          </div>
        </div>
      `;

      document.getElementById('btn-filter-rev')?.addEventListener('click', () => {
        const f = document.getElementById('r-from').value;
        const t = document.getElementById('r-to').value;
        if (f && t && f > t) return showToast('Khoảng thời gian không hợp lệ: Ngày bắt đầu sau ngày kết thúc.', 'error');
        revFrom = f;
        revTo = t;
        renderRevenueReport();
      });

      document.getElementById('btn-save-bc')?.addEventListener('click', () => {
        const res = window.Store.logReport({ LoaiBc: 'Doanh thu', Tungay: revFrom, Denngay: revTo });
        showToast(`Đã lưu bản ghi báo cáo ${res.MaBc} vào bảng BaoCao.`);
      });
    }

    function renderInventoryReport() {
      const pane = document.getElementById('rep-inv-pane');
      const products = window.Store.getProductsEnriched();
      let totalPairs = 0;
      let totalValue = 0;

      products.forEach((p) => {
        totalPairs += p.totalStock;
        totalValue += p.totalStock * Number(p.GiaBan);
      });

      pane.innerHTML = `
        <div class="panel">
          <div class="panel-header">
            <div class="admin-filters">
              <label style="font-size:0.82rem;font-weight:600;">Ngưỡng cảnh báo tồn tối thiểu (theo mẫu):</label>
              <input type="number" class="form-control" style="width:90px;" id="rep-thresh" value="${stockThreshold}" min="1" max="50">
              <button type="button" class="btn btn-outline btn-sm" id="btn-apply-thresh">Áp dụng</button>
            </div>
            <div style="font-size:0.875rem;">
              Tổng tồn: <strong>${totalPairs} đôi</strong> • Giá trị tồn kho: <strong class="text-accent">${formatVND(totalValue)}</strong>
            </div>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Mã SP</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Tổng tồn kho</th>
                  <th>Giá trị tồn (theo giá bán)</th>
                  <th>Trạng thái định mức</th>
                </tr>
              </thead>
              <tbody>
                ${products
                  .map(
                    (p) => `
                    <tr>
                      <td class="mono-code font-semibold">${escapeHTML(p.MaSp)}</td>
                      <td class="font-medium">${escapeHTML(p.TenSp)}</td>
                      <td>${escapeHTML(p.Tenloai)}</td>
                      <td class="font-semibold">${p.totalStock} đôi</td>
                      <td>${formatVND(p.totalStock * p.GiaBan)}</td>
                      <td>
                        ${
                          p.totalStock <= stockThreshold
                            ? `<span class="badge badge-error">Dưới định mức (≤ ${stockThreshold})</span>`
                            : `<span class="badge badge-success">An toàn</span>`
                        }
                      </td>
                    </tr>
                  `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      document.getElementById('btn-apply-thresh')?.addEventListener('click', () => {
        stockThreshold = Math.max(0, parseInt(document.getElementById('rep-thresh').value, 10) || 3);
        renderInventoryReport();
      });
    }

    function renderBestSellersReport() {
      const pane = document.getElementById('rep-top-pane');
      const db = window.Store.loadDB();
      const validOrderIds = new Set(db.DonHang.filter((o) => o.Trangthai !== 'Đã hủy').map((o) => o.MaDh));

      const agg = {};
      db.ChiTietDonHang.forEach((ct) => {
        if (!validOrderIds.has(ct.MaDh)) return;
        const bt = db.BienTheSanPham.find((v) => v.MaBt === ct.MaBt);
        if (!bt) return;
        if (!agg[bt.MaSp]) agg[bt.MaSp] = { qty: 0, rev: 0 };
        agg[bt.MaSp].qty += Number(ct.Soluong);
        agg[bt.MaSp].rev += Number(ct.Soluong) * Number(ct.Dongia);
      });

      const ranked = Object.keys(agg)
        .map((masp) => {
          const sp = db.SanPham.find((p) => p.MaSp === masp) || { TenSp: masp };
          return { MaSp: masp, TenSp: sp.TenSp, qty: agg[masp].qty, rev: agg[masp].rev };
        })
        .sort((a, b) => b.qty - a.qty || b.rev - a.rev)
        .slice(0, topLimit);

      const maxQty = Math.max(1, ...ranked.map((r) => r.qty));

      pane.innerHTML = `
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Xếp hạng sản phẩm bán chạy nhất</h2>
            <select class="form-control" style="width:140px;" id="top-n-sel">
              <option value="5" ${topLimit === 5 ? 'selected' : ''}>Top 5 sản phẩm</option>
              <option value="10" ${topLimit === 10 ? 'selected' : ''}>Top 10 sản phẩm</option>
            </select>
          </div>
          <div class="panel-body">
            ${
              !ranked.length
                ? `<div class="empty-state"><p>Chưa có dữ liệu bán hàng.</p></div>`
                : `
                <div class="rank-list" style="margin-bottom:24px;">
                  ${ranked
                    .map(
                      (r, i) => `
                      <div>
                        <div class="rank-item-head">
                          <span><strong>#${i + 1}. ${escapeHTML(r.TenSp)}</strong> (${escapeHTML(r.MaSp)})</span>
                          <span><strong>${r.qty} đôi</strong> • ${formatVND(r.rev)}</span>
                        </div>
                        <div class="rank-track">
                          <div class="rank-progress" style="width:${Math.round((r.qty / maxQty) * 100)}%;"></div>
                        </div>
                      </div>
                    `
                    )
                    .join('')}
                </div>
              `
            }
          </div>
        </div>
      `;

      document.getElementById('top-n-sel')?.addEventListener('change', (e) => {
        topLimit = Number(e.target.value);
        renderBestSellersReport();
      });
    }

    function renderPromosPane() {
      const pane = document.getElementById('rep-promo-pane');
      const db = window.Store.loadDB();

      pane.innerHTML = `
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Chương trình khuyến mãi &amp; Mã giảm giá</h2>
            <button type="button" class="btn btn-primary" id="btn-add-km">${Icons.plus} Tạo khuyến mãi mới</button>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Mã Code</th>
                  <th>Tên chương trình</th>
                  <th>Mức giảm</th>
                  <th>Đơn tối thiểu</th>
                  <th>Thời hạn</th>
                  <th>Trạng thái</th>
                  <th class="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                ${db.KhuyenMai.map(
                  (km) => `
                  <tr>
                    <td class="mono-code font-semibold text-accent">${escapeHTML(km.Code)}</td>
                    <td class="font-medium">${escapeHTML(km.TenKm)}</td>
                    <td>${km.Loaigiam === 'percent' ? `${km.Giatri}%` : formatVND(km.Giatri)}</td>
                    <td>${formatVND(km.DonToiThieu)}</td>
                    <td style="font-size:0.8rem;">${formatDateVN(km.Tungay)} → ${formatDateVN(km.Denngay)}</td>
                    <td>${statusBadge(km.Trangthai)}</td>
                    <td class="text-right">
                      <button type="button" class="btn btn-outline btn-sm" data-edit-km="${escapeHTML(km.MaKm)}">${Icons.edit} Sửa</button>
                    </td>
                  </tr>
                `
                ).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      document.getElementById('btn-add-km')?.addEventListener('click', () => openPromoModal(null));
      pane.querySelectorAll('[data-edit-km]').forEach((b) => {
        b.addEventListener('click', () => openPromoModal(b.getAttribute('data-edit-km')));
      });
    }

    function openPromoModal(editMaKm) {
      const db = window.Store.loadDB();
      const km = editMaKm ? db.KhuyenMai.find((k) => k.MaKm === editMaKm) : null;
      document.getElementById('km-modal-title').textContent = km ? `Sửa khuyến mãi ${km.Code}` : 'Tạo chương trình khuyến mãi';
      document.getElementById('km-modal-body').innerHTML = `
        <form id="km-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Mã Code <span class="req">*</span></label>
              <input type="text" class="form-control mono-code" id="km-code" value="${escapeHTML(km ? km.Code : '')}" placeholder="VD: WINTER15" required>
            </div>
            <div class="form-group">
              <label class="form-label">Trạng thái</label>
              <select class="form-control" id="km-status">
                <option value="Đang áp dụng" ${!km || km.Trangthai === 'Đang áp dụng' ? 'selected' : ''}>Đang áp dụng</option>
                <option value="Tạm dừng" ${km && km.Trangthai === 'Tạm dừng' ? 'selected' : ''}>Tạm dừng</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Tên chương trình <span class="req">*</span></label>
            <input type="text" class="form-control" id="km-name" value="${escapeHTML(km ? km.TenKm : '')}" required>
          </div>
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">Hình thức giảm</label>
              <select class="form-control" id="km-type">
                <option value="percent" ${!km || km.Loaigiam === 'percent' ? 'selected' : ''}>Theo %</option>
                <option value="fixed" ${km && km.Loaigiam === 'fixed' ? 'selected' : ''}>Số tiền cố định</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Giá trị giảm <span class="req">*</span></label>
              <input type="number" class="form-control" id="km-val" value="${km ? km.Giatri : 10}" min="1" required>
            </div>
            <div class="form-group">
              <label class="form-label">Đơn tối thiểu (VNĐ)</label>
              <input type="number" class="form-control" id="km-min" value="${km ? km.DonToiThieu : 1500000}" min="0" step="100000">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Từ ngày</label>
              <input type="date" class="form-control" id="km-from" value="${escapeHTML(km ? km.Tungay : '2026-10-01')}">
            </div>
            <div class="form-group">
              <label class="form-label">Đến ngày</label>
              <input type="date" class="form-control" id="km-to" value="${escapeHTML(km ? km.Denngay : '2026-12-31')}">
            </div>
          </div>
          <div class="modal-footer" style="margin:18px -22px -20px;">
            <button type="button" class="btn btn-outline" data-close-modal="km-modal">Hủy</button>
            <button type="submit" class="btn btn-primary">Lưu chương trình</button>
          </div>
        </form>
      `;

      document.getElementById('km-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const res = window.Store.savePromo(
          {
            MaKm: km ? km.MaKm : '',
            Code: document.getElementById('km-code').value,
            TenKm: document.getElementById('km-name').value,
            Loaigiam: document.getElementById('km-type').value,
            Giatri: document.getElementById('km-val').value,
            DonToiThieu: document.getElementById('km-min').value,
            Tungay: document.getElementById('km-from').value,
            Denngay: document.getElementById('km-to').value,
            Trangthai: document.getElementById('km-status').value
          },
          Boolean(km)
        );
        if (!res.ok) return showToast(res.message, 'error');
        closeModal('km-modal');
        showToast(res.message);
        renderPromosPane();
      });

      openModal('km-modal');
    }

    renderRevenueReport();
    renderInventoryReport();
    renderBestSellersReport();
    renderPromosPane();
  }

  // -------------------- BOOTSTRAP ADMIN PAGES --------------------
  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.getAttribute('data-admin-page');
    if (page === 'dashboard') initDashboard();
    else if (page === 'products') initProductsAdmin();
    else if (page === 'inventory') initInventoryAdmin();
    else if (page === 'suppliers') initSuppliersAdmin();
    else if (page === 'orders') initOrdersAdmin();
    else if (page === 'customers') initCustomersAdmin();
    else if (page === 'employees') initEmployeesAdmin();
    else if (page === 'returns') initReturnsAdmin();
    else if (page === 'support') initSupportAdmin();
    else if (page === 'reports') initReportsAdmin();
  });
})();
