/* ==========================================================================
   BE CLASSY — SHARED UI UTILITIES, ICONS & SHELL RENDERERS (common.js)
   ========================================================================== */

(function () {
  function isInAdminFolder() {
    const p = window.location.pathname.replace(/\\/g, '/').toLowerCase();
    return p.includes('/admin/');
  }

  function resolvePath(relPath) {
    if (!relPath) return '';
    if (/^(https?:|data:|blob:)/i.test(relPath)) return relPath;
    const clean = relPath.replace(/^\.?\//, '');
    return isInAdminFolder() ? `../${clean}` : clean;
  }

  function escapeHTML(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatVND(amount) {
    const num = Number(amount || 0);
    return num.toLocaleString('vi-VN') + '₫';
  }

  function formatDateVN(isoStr) {
    if (!isoStr) return '—';
    const parts = String(isoStr).split('-');
    if (parts.length !== 3) return escapeHTML(isoStr);
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function colorHex(colorName) {
    const map = {
      'Nâu Cognac': '#8E4E2A',
      'Nâu Walnut': '#7B512D',
      'Nâu Đậm': '#432B1D',
      'Đen': '#1F1F1D',
      'Đỏ Burgundy': '#661C24',
      'Vàng Bò': '#B47938',
      'Trắng Ngà': '#EFECE4'
    };
    return map[colorName] || '#76523B';
  }

  function statusBadge(status) {
    const s = String(status || '').trim();
    const map = {
      'Chờ xác nhận': 'badge-warning',
      'Chờ xử lý': 'badge-warning',
      'Chờ duyệt': 'badge-warning',
      'Còn nợ': 'badge-warning',
      'Đang xử lý': 'badge-info',
      'Đã xác nhận': 'badge-info',
      'Đang giao hàng': 'badge-accent',
      'Đã giao': 'badge-success',
      'Đã hoàn thành': 'badge-success',
      'Đã duyệt': 'badge-success',
      'Đã thanh toán': 'badge-success',
      'Đang làm việc': 'badge-success',
      'Đang áp dụng': 'badge-success',
      'Đã hủy': 'badge-error',
      'Từ chối': 'badge-error',
      'Ngừng làm việc': 'badge-neutral',
      'Tạm dừng': 'badge-neutral'
    };
    const cls = map[s] || 'badge-neutral';
    return `<span class="badge ${cls}">${escapeHTML(s)}</span>`;
  }

  // Clean 1.7px stroke SVG Icons (Zero Emoji)
  const Icons = {
    search: `<svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
    bag: `<svg class="icon" viewBox="0 0 24 24"><path d="M6 7h12l1 13H5L6 7Z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>`,
    user: `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>`,
    menu: `<svg class="icon" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
    close: `<svg class="icon" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
    arrowRight: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
    check: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="m5 12 5 5L20 7"/></svg>`,
    plus: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>`,
    edit: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
    trash: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/></svg>`,
    eye: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
    shield: `<svg class="icon icon-lg" viewBox="0 0 24 24"><path d="M12 3 4 7v5c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V7l-8-4Z"/><path d="m9 12 2 2 4-4"/></svg>`,
    award: `<svg class="icon icon-lg" viewBox="0 0 24 24"><circle cx="12" cy="9" r="6"/><path d="m8.5 14.5-1.5 6.5 5-2.5 5 2.5-1.5-6.5"/></svg>`,
    refresh: `<svg class="icon icon-lg" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>`,
    dashboard: `<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>`,
    box: `<svg class="icon" viewBox="0 0 24 24"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></svg>`,
    layers: `<svg class="icon" viewBox="0 0 24 24"><path d="m12 2 10 5-10 5L2 7l10-5Z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/></svg>`,
    orders: `<svg class="icon" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>`,
    users: `<svg class="icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    idCard: `<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M14 9h4M14 13h4M5.5 17a4.5 4.5 0 0 1 7 0"/></svg>`,
    truck: `<svg class="icon" viewBox="0 0 24 24"><rect x="1" y="4" width="14" height="12" rx="1"/><path d="M15 8h4l4 4v4h-8V8Z"/><circle cx="5.5" cy="18" r="2"/><circle cx="18.5" cy="18" r="2"/></svg>`,
    support: `<svg class="icon" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/></svg>`,
    chart: `<svg class="icon" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 16v-5M12 16V8M17 16v-3"/></svg>`,
    logout: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    store: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="m3 9 2-5h14l2 5"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></svg>`,
    alert: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
  };

  // -------------------- TOAST & CONFIRM DIALOG --------------------
  function ensureToastContainer() {
    let c = document.getElementById('bc-toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'bc-toast-container';
      c.className = 'toast-container';
      document.body.appendChild(c);
    }
    return c;
  }

  function showToast(message, type = 'success') {
    const container = ensureToastContainer();
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span>${escapeHTML(message)}</span>`;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.2s ease';
      setTimeout(() => el.remove(), 220);
    }, 3200);
  }

  function confirmDialog({ title = 'Xác nhận thao tác', message = 'Bạn có chắc chắn muốn thực hiện thao tác này?', confirmText = 'Xác nhận', danger = false, onConfirm }) {
    let backdrop = document.getElementById('bc-confirm-modal');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'bc-confirm-modal';
      backdrop.className = 'modal-backdrop';
      document.body.appendChild(backdrop);
    }
    backdrop.innerHTML = `
      <div class="modal" style="max-width:440px;">
        <div class="modal-header">
          <h3 class="modal-title">${escapeHTML(title)}</h3>
          <button type="button" class="modal-close" data-close-confirm>${Icons.close}</button>
        </div>
        <div class="modal-body">
          <p style="font-size:0.9rem;color:var(--text-secondary);line-height:1.6;">${escapeHTML(message)}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" data-close-confirm>Hủy bỏ</button>
          <button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="bc-confirm-ok">${escapeHTML(confirmText)}</button>
        </div>
      </div>
    `;
    backdrop.classList.add('open');

    const close = () => backdrop.classList.remove('open');
    backdrop.querySelectorAll('[data-close-confirm]').forEach((b) => b.addEventListener('click', close));
    backdrop.querySelector('#bc-confirm-ok').addEventListener('click', () => {
      close();
      if (typeof onConfirm === 'function') onConfirm();
    });
  }

  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  }

  // -------------------- CUSTOMER HEADER & FOOTER --------------------
  function updateCartBadge() {
    const cart = window.Store.getCart();
    const count = cart.reduce((s, item) => s + Number(item.Soluong || 0), 0);
    document.querySelectorAll('[data-cart-badge]').forEach((el) => {
      el.textContent = count;
    });
  }

  function renderCustomerHeader(activePage = '') {
    const mount = document.getElementById('site-header-mount');
    if (!mount) return;
    const user = window.Store.getCurrentUser();
    const cart = window.Store.getCart();
    const cartCount = cart.reduce((s, i) => s + Number(i.Soluong || 0), 0);

    let accountActionHTML = '';
    if (!user) {
      accountActionHTML = `
        <a href="login.html" class="header-icon-btn ${activePage === 'login' ? 'text-accent' : ''}">
          ${Icons.user}
          <span>Đăng nhập</span>
        </a>
      `;
    } else if (user.role === 'owner' || user.role === 'staff') {
      accountActionHTML = `
        <a href="admin/index.html" class="btn btn-outline btn-sm">
          <span>Quản trị (${escapeHTML(user.roleLabel)})</span>
        </a>
        <button type="button" class="header-icon-btn" id="cust-logout-btn" title="Đăng xuất">
          ${Icons.logout}
        </button>
      `;
    } else {
      accountActionHTML = `
        <a href="account.html" class="header-icon-btn ${activePage === 'account' ? 'text-accent' : ''}">
          ${Icons.user}
          <span>${escapeHTML(user.name)}</span>
        </a>
      `;
    }

    mount.innerHTML = `
      <div class="topbar-notice">
        <div class="container">
          <span>BE CLASSY — Giày da thủ công chuẩn phom Việt | Đổi trả trong 15 ngày đối với đơn đã giao</span>
          <div class="topbar-links">
            <a href="products.html">Bộ sưu tập Thu Đông</a>
            <a href="account.html?tab=support">Chăm sóc &amp; Bảo hành</a>
            <a href="admin/index.html">Kênh Quản trị</a>
          </div>
        </div>
      </div>
      <header class="site-header">
        <div class="container header-inner">
          <a href="index.html" class="brand-logo">
            <span class="brand-logo-main">BE CLASSY</span>
            <span class="brand-logo-sub">Handcrafted Footwear</span>
          </a>

          <nav class="main-nav" id="main-nav-menu">
            <a href="index.html" class="${activePage === 'home' ? 'active' : ''}">Trang chủ</a>
            <a href="products.html" class="${activePage === 'products' ? 'active' : ''}">Sản phẩm</a>
            <a href="products.html?cat=LSP01" class="">Giày Oxford</a>
            <a href="products.html?cat=LSP02" class="">Giày Derby</a>
            <a href="products.html?cat=LSP04" class="">Chelsea Boots</a>
          </nav>

          <div class="header-actions">
            <a href="products.html#search" class="header-icon-btn" title="Tìm kiếm sản phẩm">
              ${Icons.search}
            </a>
            <a href="cart.html" class="header-icon-btn ${activePage === 'cart' ? 'text-accent' : ''}">
              ${Icons.bag}
              <span>Giỏ hàng</span>
              <span class="cart-count-badge" data-cart-badge>${cartCount}</span>
            </a>
            ${accountActionHTML}
            <button type="button" class="mobile-menu-toggle" id="mobile-nav-btn" aria-label="Menu">
              ${Icons.menu}
            </button>
          </div>
        </div>
      </header>
    `;

    const mobileBtn = document.getElementById('mobile-nav-btn');
    const navMenu = document.getElementById('main-nav-menu');
    if (mobileBtn && navMenu) {
      mobileBtn.addEventListener('click', () => navMenu.classList.toggle('open'));
    }

    const logoutBtn = document.getElementById('cust-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        window.Store.logout();
        showToast('Đã đăng xuất khỏi tài khoản.');
        setTimeout(() => { window.location.href = 'index.html'; }, 350);
      });
    }
  }

  function renderCustomerFooter() {
    const mount = document.getElementById('site-footer-mount');
    if (!mount) return;
    mount.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <div class="footer-brand-title">BE CLASSY</div>
              <p style="font-size:0.85rem;color:#ABA69D;line-height:1.65;max-width:340px;">
                Thương hiệu giày da thủ công đương đại dành cho quý ông Việt. Chú trọng chất liệu da bê nguyên tấm, phom Last chuẩn mực và quy trình bảo dưỡng minh bạch.
              </p>
            </div>
            <div>
              <h4 class="footer-heading">Danh mục giày</h4>
              <ul class="footer-links">
                <li><a href="products.html?cat=LSP01">Giày Tây Oxford</a></li>
                <li><a href="products.html?cat=LSP02">Giày Da Derby</a></li>
                <li><a href="products.html?cat=LSP03">Giày Lười Loafer</a></li>
                <li><a href="products.html?cat=LSP04">Chelsea Boots</a></li>
                <li><a href="products.html?cat=LSP05">Monk Strap</a></li>
              </ul>
            </div>
            <div>
              <h4 class="footer-heading">Dịch vụ khách hàng</h4>
              <ul class="footer-links">
                <li><a href="account.html">Tài khoản &amp; Đơn hàng</a></li>
                <li><a href="account.html?tab=returns">Yêu cầu đổi trả (15 ngày)</a></li>
                <li><a href="account.html?tab=support">Gửi phiếu hỗ trợ</a></li>
                <li><a href="cart.html">Kiểm tra giỏ hàng</a></li>
              </ul>
            </div>
            <div>
              <h4 class="footer-heading">Showroom &amp; Liên hệ</h4>
              <ul class="footer-links">
                <li>Số 68 Điện Biên, P. Lê Lợi, TP. Hưng Yên</li>
                <li>Số 73 Lý Tự Trọng, Quận 1, TP. Hồ Chí Minh</li>
                <li>Hotline: 0912 345 678 (8:30 – 21:30)</li>
                <li>Email: cskh@beclassy.vn</li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© 2026 BE CLASSY Footwear Boutique. Đồ án Phân tích thiết kế hệ thống UML.</span>
            <span>Sinh viên thực hiện: Nguyễn Tiến Anh &amp; Nguyễn Anh Quân</span>
          </div>
        </div>
      </footer>
    `;
  }

  // -------------------- ADMIN SIDEBAR & SHELL --------------------
  function renderAdminShell({ activePage = 'dashboard', pageTitle = 'Tổng quan hệ thống', ownerOnly = false }) {
    let user = window.Store.getCurrentUser();
    // Nếu chưa đăng nhập hoặc đang đăng nhập tài khoản khách hàng khi mở trang quản trị:
    // Kiểm tra tiền điều kiện Use Case Quản trị -> chuyển sang trang Đăng nhập hoặc cho phép chọn nhanh tài khoản quản trị
    if (!user || (user.role !== 'owner' && user.role !== 'staff')) {
      const fileName = window.location.pathname.replace(/\\/g, '/').split('/').pop() || 'index.html';
      window.location.href = '../login.html?redirect=' + encodeURIComponent('admin/' + fileName);
      return { authorized: false };
    }

    const metrics = window.Store.getUnifiedMetrics();
    const isOwner = user.role === 'owner';

    const sidebarMount = document.getElementById('admin-sidebar-mount');
    if (sidebarMount) {
      sidebarMount.innerHTML = `
        <aside class="admin-sidebar" id="admin-sidebar">
          <div class="sidebar-brand">
            <span class="sidebar-brand-title">BE CLASSY</span>
            <span class="sidebar-brand-sub">Hệ thống Quản trị Cửa hàng</span>
          </div>

          <div class="sidebar-section-label">Tổng quan</div>
          <nav class="sidebar-nav">
            <a href="index.html" class="sidebar-link ${activePage === 'dashboard' ? 'active' : ''}">
              <span class="sidebar-link-left">${Icons.dashboard} <span>Dashboard</span></span>
            </a>
          </nav>

          <div class="sidebar-section-label">Nghiệp vụ Bán hàng &amp; Kho</div>
          <nav class="sidebar-nav">
            <a href="products.html" class="sidebar-link ${activePage === 'products' ? 'active' : ''}">
              <span class="sidebar-link-left">${Icons.box} <span>Quản lý sản phẩm</span></span>
              <span class="sidebar-count">${metrics.totalProducts}</span>
            </a>
            <a href="inventory.html" class="sidebar-link ${activePage === 'inventory' ? 'active' : ''}">
              <span class="sidebar-link-left">${Icons.layers} <span>Quản lý kho &amp; Nhập hàng</span></span>
              ${metrics.lowStockCount > 0 ? `<span class="sidebar-count" title="Biến thể sắp hết">${metrics.lowStockCount}</span>` : ''}
            </a>
            <a href="orders.html" class="sidebar-link ${activePage === 'orders' ? 'active' : ''}">
              <span class="sidebar-link-left">${Icons.orders} <span>Quản lý đơn hàng</span></span>
              ${metrics.pendingOrdersCount > 0 ? `<span class="sidebar-count">${metrics.pendingOrdersCount}</span>` : ''}
            </a>
            <a href="customers.html" class="sidebar-link ${activePage === 'customers' ? 'active' : ''}">
              <span class="sidebar-link-left">${Icons.users} <span>Quản lý khách hàng</span></span>
            </a>
            <a href="returns.html" class="sidebar-link ${activePage === 'returns' ? 'active' : ''}">
              <span class="sidebar-link-left">${Icons.refresh.replace('icon-lg', '')} <span>Yêu cầu đổi trả</span></span>
              ${metrics.pendingReturnsCount > 0 ? `<span class="sidebar-count">${metrics.pendingReturnsCount}</span>` : ''}
            </a>
            <a href="support.html" class="sidebar-link ${activePage === 'support' ? 'active' : ''}">
              <span class="sidebar-link-left">${Icons.support} <span>Yêu cầu hỗ trợ</span></span>
              ${metrics.pendingSupportCount > 0 ? `<span class="sidebar-count">${metrics.pendingSupportCount}</span>` : ''}
            </a>
          </nav>

          <div class="sidebar-section-label">Quản trị Chủ cửa hàng</div>
          <nav class="sidebar-nav">
            <a href="suppliers.html" class="sidebar-link ${activePage === 'suppliers' ? 'active' : ''} ${!isOwner ? 'owner-only-locked' : ''}">
              <span class="sidebar-link-left">${Icons.truck} <span>Quản lý nhà cung cấp</span></span>
            </a>
            <a href="employees.html" class="sidebar-link ${activePage === 'employees' ? 'active' : ''} ${!isOwner ? 'owner-only-locked' : ''}">
              <span class="sidebar-link-left">${Icons.idCard} <span>Quản lý nhân viên</span></span>
            </a>
            <a href="reports.html" class="sidebar-link ${activePage === 'reports' ? 'active' : ''} ${!isOwner ? 'owner-only-locked' : ''}">
              <span class="sidebar-link-left">${Icons.chart} <span>Khuyến mãi &amp; Báo cáo</span></span>
            </a>
          </nav>

          <div class="sidebar-footer">
            <a href="../index.html" class="sidebar-footer-btn">
              ${Icons.store} <span>Xem giao diện Khách hàng</span>
            </a>
            <button type="button" class="sidebar-footer-btn" id="btn-reset-demo">
              ${Icons.refresh.replace('icon-lg', 'icon-sm')} <span>Khôi phục dữ liệu mẫu</span>
            </button>
            <button type="button" class="sidebar-footer-btn" id="btn-admin-logout">
              ${Icons.logout} <span>Đăng xuất</span>
            </button>
          </div>
        </aside>
      `;
    }

    const topbarMount = document.getElementById('admin-topbar-mount');
    if (topbarMount) {
      topbarMount.innerHTML = `
        <header class="admin-topbar">
          <div class="admin-topbar-left">
            <button type="button" class="admin-mobile-toggle" id="admin-menu-btn">${Icons.menu}</button>
            <h1 class="admin-page-title">${escapeHTML(pageTitle)}</h1>
          </div>
          <div class="admin-topbar-right">
            <div class="actor-pill">
              <span class="badge ${isOwner ? 'badge-accent' : 'badge-info'}">${escapeHTML(user.roleLabel)}</span>
              <span class="font-medium">${escapeHTML(user.name)} (${escapeHTML(user.id)})</span>
            </div>
            <button type="button" class="btn btn-subtle btn-sm" id="btn-quick-switch-role" title="Chuyển nhanh vai trò Chủ cửa hàng / Nhân viên để demo phân quyền UML">
              Đổi sang ${isOwner ? 'Nhân viên' : 'Chủ cửa hàng'}
            </button>
          </div>
        </header>
      `;
    }

    // Bind mobile sidebar toggle
    const menuBtn = document.getElementById('admin-menu-btn');
    const sidebarEl = document.getElementById('admin-sidebar');
    if (menuBtn && sidebarEl) {
      menuBtn.addEventListener('click', () => sidebarEl.classList.toggle('open'));
    }

    // Bind quick role switcher for UML actor demonstration
    const switchBtn = document.getElementById('btn-quick-switch-role');
    if (switchBtn) {
      switchBtn.addEventListener('click', () => {
        if (isOwner) {
          window.Store.login('quan.na@beclassy.vn', '123456');
        } else {
          window.Store.login('admin@beclassy.vn', '123456');
        }
        window.location.reload();
      });
    }

    // Bind reset demo data
    const resetBtn = document.getElementById('btn-reset-demo');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        confirmDialog({
          title: 'Khôi phục dữ liệu mẫu ban đầu',
          message: 'Toàn bộ sản phẩm, tồn kho, đơn hàng và phiếu yêu cầu sẽ được đưa về dữ liệu mẫu gốc để trình diễn lại từ đầu. Bạn có muốn tiếp tục?',
          confirmText: 'Khôi phục ngay',
          danger: true,
          onConfirm: () => {
            window.Store.resetDB();
            showToast('Đã khôi phục dữ liệu mẫu thành công.');
            setTimeout(() => window.location.reload(), 400);
          }
        });
      });
    }

    // Bind logout
    const logoutBtn = document.getElementById('btn-admin-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        window.Store.logout();
        window.location.href = '../login.html';
      });
    }

    // Check UML Actor authorization (Hình 3.1: Chủ cửa hàng mới có quyền Quản lý NCC, Quản lý NV, Thống kê - Báo cáo)
    if (ownerOnly && !isOwner) {
      const mainContent = document.getElementById('admin-page-content');
      if (mainContent) {
        mainContent.innerHTML = `
          <div class="permission-gate">
            <div style="margin-bottom:12px;color:var(--warning);">${Icons.alert.replace('icon-sm', 'icon-lg')}</div>
            <h2 style="font-size:1.15rem;margin-bottom:8px;">Giới hạn phân quyền tác nhân UML</h2>
            <p style="font-size:0.875rem;color:var(--text-secondary);margin-bottom:20px;line-height:1.6;">
              Theo Biểu đồ Use Case tổng quát (Hình 3.1), chức năng <strong>${escapeHTML(pageTitle)}</strong> chỉ dành cho tác nhân <strong>Chủ cửa hàng</strong>. Bạn đang đăng nhập với vai trò <strong>Nhân viên (${escapeHTML(user.name)})</strong>.
            </p>
            <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
              <a href="index.html" class="btn btn-outline">Về Dashboard</a>
              <button type="button" class="btn btn-primary" id="gate-switch-owner">Chuyển sang tài khoản Chủ cửa hàng</button>
            </div>
          </div>
        `;
        document.getElementById('gate-switch-owner')?.addEventListener('click', () => {
          window.Store.login('admin@beclassy.vn', '123456');
          window.location.reload();
        });
      }
      return { authorized: false, user };
    }

    return { authorized: true, user, isOwner };
  }

  // Close modals when clicking backdrop or [data-close-modal]
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('[data-close-modal]');
    if (closeBtn) {
      const modalId = closeBtn.getAttribute('data-close-modal');
      if (modalId) closeModal(modalId);
      else closeBtn.closest('.modal-backdrop')?.classList.remove('open');
    }
    if (e.target.classList.contains('modal-backdrop') && e.target.id !== 'bc-confirm-modal') {
      e.target.classList.remove('open');
    }
  });

  window.UI = {
    resolvePath,
    escapeHTML,
    formatVND,
    formatDateVN,
    colorHex,
    statusBadge,
    Icons,
    showToast,
    confirmDialog,
    openModal,
    closeModal,
    updateCartBadge,
    renderCustomerHeader,
    renderCustomerFooter,
    renderAdminShell
  };
})();
