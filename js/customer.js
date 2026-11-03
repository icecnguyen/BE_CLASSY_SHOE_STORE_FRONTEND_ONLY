/* ==========================================================================
   BE CLASSY — CUSTOMER STOREFRONT CONTROLLERS (customer.js)
   ========================================================================== */

(function () {
  const { escapeHTML, formatVND, formatDateVN, colorHex, statusBadge, Icons, showToast, confirmDialog, openModal, closeModal, updateCartBadge, renderCustomerHeader, renderCustomerFooter, resolvePath } = window.UI;

  function renderProductCardHTML(p) {
    let tagHTML = '';
    if (p.totalStock <= 0) {
      tagHTML = `<span class="product-status-tag out">Hết hàng</span>`;
    } else if (p.totalStock <= 5) {
      tagHTML = `<span class="product-status-tag low">Sắp hết (${p.totalStock} đôi)</span>`;
    }

    const dotsHTML = (p.colors || [])
      .map((c) => `<span class="color-dot" style="background:${colorHex(c)};" title="${escapeHTML(c)}"></span>`)
      .join('');

    return `
      <article class="product-item">
        <a href="product-detail.html?id=${encodeURIComponent(p.MaSp)}" class="product-thumb-wrap">
          ${tagHTML}
          <img src="${escapeHTML(resolvePath(p.Hinhanh))}" alt="${escapeHTML(p.TenSp)}" loading="lazy">
        </a>
        <div class="product-meta-row">
          <span>${escapeHTML(p.Tenloai)}</span>
          <span>${escapeHTML(p.TenTh)}</span>
        </div>
        <h3 class="product-name">
          <a href="product-detail.html?id=${encodeURIComponent(p.MaSp)}">${escapeHTML(p.TenSp)}</a>
        </h3>
        <div class="product-bottom-row">
          <span class="product-price">${formatVND(p.GiaBan)}</span>
          <div class="color-dots">${dotsHTML}</div>
        </div>
      </article>
    `;
  }

  // -------------------- 1. HOME PAGE --------------------
  function initHomePage() {
    renderCustomerHeader('home');
    renderCustomerFooter();

    const db = window.Store.loadDB();
    const products = window.Store.getProductsEnriched();

    // Render Category Showcase (top 4 categories)
    const catMount = document.getElementById('home-categories-grid');
    if (catMount) {
      const catImages = {
        LSP01: 'assets/images/shoes/oxford-cognac.jpg',
        LSP02: 'assets/images/shoes/derby-walnut.jpg',
        LSP03: 'assets/images/shoes/derby-espresso.jpg',
        LSP04: 'assets/images/shoes/chelsea-brown.jpg',
        LSP05: 'assets/images/shoes/boots-tan.jpg'
      };
      catMount.innerHTML = db.LoaiSanPham.slice(0, 4)
        .map((cat) => {
          const count = products.filter((p) => p.Maloai === cat.Maloai).length;
          const img = catImages[cat.Maloai] || 'assets/images/shoes/oxford-cognac.jpg';
          return `
            <a href="products.html?cat=${encodeURIComponent(cat.Maloai)}" class="category-tile">
              <div class="category-tile-img">
                <img src="${escapeHTML(img)}" alt="${escapeHTML(cat.Tenloai)}">
              </div>
              <div class="category-tile-info">
                <span class="category-tile-name">${escapeHTML(cat.Tenloai)}</span>
                <span class="category-tile-count">${count} mẫu ${Icons.arrowRight}</span>
              </div>
            </a>
          `;
        })
        .join('');
    }

    // Render Featured Products
    const featMount = document.getElementById('home-featured-grid');
    if (featMount) {
      const featured = products.filter((p) => p.Noibat).slice(0, 8);
      featMount.innerHTML = featured.map(renderProductCardHTML).join('');
    }

    // Render Active Promo Highlight
    const promoMount = document.getElementById('home-active-promo');
    if (promoMount) {
      const activePromo = db.KhuyenMai.find((k) => k.Trangthai === 'Đang áp dụng');
      if (activePromo) {
        promoMount.innerHTML = `
          <span class="text-secondary" style="font-size:0.825rem;">Mã ưu đãi đang mở:</span>
          <strong class="mono-code text-accent" style="font-size:0.95rem;">${escapeHTML(activePromo.Code)}</strong>
          <span class="badge badge-accent">${escapeHTML(activePromo.TenKm)}</span>
        `;
      }
    }
  }

  // -------------------- 2. PRODUCT CATALOG PAGE --------------------
  function initProductsPage() {
    renderCustomerHeader('products');
    renderCustomerFooter();

    const db = window.Store.loadDB();
    const allProducts = window.Store.getProductsEnriched();
    const params = new URLSearchParams(window.location.search);

    const state = {
      q: params.get('q') || '',
      categories: params.get('cat') ? [params.get('cat')] : [],
      brands: [],
      priceRange: 'all',
      size: null,
      color: '',
      sort: 'default',
      page: 1,
      perPage: 6
    };

    // Populate Category checkboxes
    const catListEl = document.getElementById('filter-categories');
    if (catListEl) {
      catListEl.innerHTML = db.LoaiSanPham.map(
        (c) => `
          <label class="filter-check-item">
            <input type="checkbox" value="${escapeHTML(c.Maloai)}" ${state.categories.includes(c.Maloai) ? 'checked' : ''}>
            <span>${escapeHTML(c.Tenloai)}</span>
          </label>
        `
      ).join('');
      catListEl.addEventListener('change', () => {
        state.categories = Array.from(catListEl.querySelectorAll('input:checked')).map((i) => i.value);
        state.page = 1;
        applyAndRender();
      });
    }

    // Populate Brand checkboxes
    const brandListEl = document.getElementById('filter-brands');
    if (brandListEl) {
      brandListEl.innerHTML = db.ThuongHieu.map(
        (b) => `
          <label class="filter-check-item">
            <input type="checkbox" value="${escapeHTML(b.MaTh)}">
            <span>${escapeHTML(b.TenTh)} (${escapeHTML(b.Xuatxu)})</span>
          </label>
        `
      ).join('');
      brandListEl.addEventListener('change', () => {
        state.brands = Array.from(brandListEl.querySelectorAll('input:checked')).map((i) => i.value);
        state.page = 1;
        applyAndRender();
      });
    }

    // Populate Size chips
    const sizes = [39, 40, 41, 42, 43];
    const sizeGridEl = document.getElementById('filter-sizes');
    if (sizeGridEl) {
      sizeGridEl.innerHTML = sizes
        .map((sz) => `<button type="button" class="size-chip" data-size="${sz}">${sz}</button>`)
        .join('');
      sizeGridEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-size]');
        if (!btn) return;
        const val = Number(btn.getAttribute('data-size'));
        state.size = state.size === val ? null : val;
        sizeGridEl.querySelectorAll('.size-chip').forEach((b) => {
          b.classList.toggle('active', Number(b.getAttribute('data-size')) === state.size);
        });
        state.page = 1;
        applyAndRender();
      });
    }

    // Populate Color filter
    const allColors = [...new Set(db.BienTheSanPham.map((v) => v.Mau))];
    const colorSelect = document.getElementById('filter-color');
    if (colorSelect) {
      colorSelect.innerHTML =
        `<option value="">Tất cả màu sắc</option>` +
        allColors.map((c) => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join('');
      colorSelect.addEventListener('change', () => {
        state.color = colorSelect.value;
        state.page = 1;
        applyAndRender();
      });
    }

    // Price radios
    document.querySelectorAll('input[name="priceRange"]').forEach((r) => {
      r.addEventListener('change', () => {
        state.priceRange = r.value;
        state.page = 1;
        applyAndRender();
      });
    });

    // Search input & Sort
    const searchInput = document.getElementById('catalog-search-input');
    const searchForm = document.getElementById('catalog-search-form');
    if (searchInput) {
      searchInput.value = state.q;
      if (window.location.hash === '#search') searchInput.focus();
      searchInput.addEventListener('input', () => {
        state.q = searchInput.value.trim();
        state.page = 1;
        applyAndRender();
      });
    }
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        state.q = searchInput.value.trim();
        state.page = 1;
        applyAndRender();
      });
    }

    const sortSelect = document.getElementById('catalog-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        state.sort = sortSelect.value;
        state.page = 1;
        applyAndRender();
      });
    }

    // Clear all filters
    document.getElementById('btn-clear-filters')?.addEventListener('click', () => {
      state.q = '';
      state.categories = [];
      state.brands = [];
      state.priceRange = 'all';
      state.size = null;
      state.color = '';
      state.sort = 'default';
      state.page = 1;
      if (searchInput) searchInput.value = '';
      if (colorSelect) colorSelect.value = '';
      if (sortSelect) sortSelect.value = 'default';
      document.querySelectorAll('#filter-categories input, #filter-brands input').forEach((i) => { i.checked = false; });
      document.querySelectorAll('input[name="priceRange"]').forEach((r) => { r.checked = r.value === 'all'; });
      document.querySelectorAll('#filter-sizes .size-chip').forEach((b) => b.classList.remove('active'));
      applyAndRender();
    });

    function applyAndRender() {
      let filtered = allProducts.filter((p) => {
        if (state.q) {
          const kw = state.q.toLowerCase();
          const match =
            p.TenSp.toLowerCase().includes(kw) ||
            p.MaSp.toLowerCase().includes(kw) ||
            p.Tenloai.toLowerCase().includes(kw) ||
            p.TenTh.toLowerCase().includes(kw);
          if (!match) return false;
        }
        if (state.categories.length && !state.categories.includes(p.Maloai)) return false;
        if (state.brands.length && !state.brands.includes(p.MaTh)) return false;
        if (state.priceRange === 'under2m' && p.GiaBan >= 2000000) return false;
        if (state.priceRange === '2mto25m' && (p.GiaBan < 2000000 || p.GiaBan > 2500000)) return false;
        if (state.priceRange === 'over25m' && p.GiaBan <= 2500000) return false;
        if (state.size !== null) {
          const hasSize = p.variants.some((v) => Number(v.Size) === state.size && Number(v.Soluongton) > 0);
          if (!hasSize) return false;
        }
        if (state.color) {
          const hasColor = p.variants.some((v) => v.Mau === state.color);
          if (!hasColor) return false;
        }
        return true;
      });

      if (state.sort === 'price-asc') filtered.sort((a, b) => a.GiaBan - b.GiaBan);
      else if (state.sort === 'price-desc') filtered.sort((a, b) => b.GiaBan - a.GiaBan);
      else if (state.sort === 'name-asc') filtered.sort((a, b) => a.TenSp.localeCompare(b.TenSp, 'vi'));

      const countEl = document.getElementById('catalog-result-count');
      if (countEl) countEl.textContent = `Hiển thị ${filtered.length} sản phẩm`;

      const gridEl = document.getElementById('catalog-products-grid');
      const pagEl = document.getElementById('catalog-pagination');
      if (!gridEl) return;

      if (!filtered.length) {
        gridEl.innerHTML = `
          <div class="empty-state" style="grid-column:1 / -1;">
            ${Icons.search}
            <h3>Không tìm thấy sản phẩm phù hợp</h3>
            <p>Vui lòng thử từ khóa khác hoặc xóa bớt điều kiện lọc.</p>
          </div>
        `;
        if (pagEl) pagEl.innerHTML = '';
        return;
      }

      const totalPages = Math.ceil(filtered.length / state.perPage);
      if (state.page > totalPages) state.page = totalPages;
      const start = (state.page - 1) * state.perPage;
      const slice = filtered.slice(start, start + state.perPage);

      gridEl.innerHTML = slice.map(renderProductCardHTML).join('');

      if (pagEl) {
        if (totalPages <= 1) {
          pagEl.innerHTML = '';
        } else {
          let html = `<button type="button" class="page-btn" data-p="${state.page - 1}" ${state.page === 1 ? 'disabled' : ''}>Trước</button>`;
          for (let i = 1; i <= totalPages; i++) {
            html += `<button type="button" class="page-btn ${i === state.page ? 'active' : ''}" data-p="${i}">${i}</button>`;
          }
          html += `<button type="button" class="page-btn" data-p="${state.page + 1}" ${state.page === totalPages ? 'disabled' : ''}>Sau</button>`;
          pagEl.innerHTML = html;
          pagEl.querySelectorAll('[data-p]').forEach((btn) => {
            btn.addEventListener('click', () => {
              state.page = Number(btn.getAttribute('data-p'));
              applyAndRender();
              window.scrollTo({ top: 140, behavior: 'smooth' });
            });
          });
        }
      }
    }

    applyAndRender();
  }

  // -------------------- 3. PRODUCT DETAIL PAGE --------------------
  function initProductDetailPage() {
    renderCustomerHeader('products');
    renderCustomerFooter();

    const params = new URLSearchParams(window.location.search);
    const allProducts = window.Store.getProductsEnriched();
    const reqId = params.get('id') || (allProducts[0] && allProducts[0].MaSp);
    const product = window.Store.getProductById(reqId);

    const mount = document.getElementById('product-detail-mount');
    if (!mount) return;

    if (!product) {
      mount.innerHTML = `
        <div class="empty-state panel">
          <h3>Sản phẩm không tồn tại</h3>
          <p>Mẫu giày bạn đang tìm không còn trong danh mục hệ thống.</p>
          <a href="products.html" class="btn btn-primary">Quay lại danh sách sản phẩm</a>
        </div>
      `;
      return;
    }

    document.title = `${product.TenSp} — BE CLASSY`;
    const bcName = document.getElementById('detail-breadcrumb-name');
    if (bcName) bcName.textContent = product.TenSp;

    // Default selected color & size
    let selectedColor = product.colors[0] || '';
    let selectedVariant = null;

    function pickDefaultVariantForColor(color) {
      const matching = product.variants.filter((v) => v.Mau === color);
      const inStock = matching.find((v) => Number(v.Soluongton) > 0);
      return inStock || matching[0] || null;
    }

    selectedVariant = pickDefaultVariantForColor(selectedColor);

    // Collect gallery images (main + color images)
    const galleryImgs = [product.Hinhanh];
    if (product.AnhTheoMau) {
      Object.values(product.AnhTheoMau).forEach((src) => {
        if (src && !galleryImgs.includes(src)) galleryImgs.push(src);
      });
    }

    mount.innerHTML = `
      <div class="detail-grid">
        <div>
          <div class="detail-gallery-main">
            <img id="detail-main-img" src="${escapeHTML(product.Hinhanh)}" alt="${escapeHTML(product.TenSp)}">
          </div>
          <div class="detail-thumbs" id="detail-thumbs">
            ${galleryImgs
              .map(
                (src, idx) => `
                <button type="button" class="detail-thumb-btn ${idx === 0 ? 'active' : ''}" data-img="${escapeHTML(src)}">
                  <img src="${escapeHTML(src)}" alt="Góc nhìn ${idx + 1}">
                </button>
              `
              )
              .join('')}
          </div>
        </div>

        <div>
          <span class="eyebrow">${escapeHTML(product.TenTh)} • ${escapeHTML(product.Tenloai)}</span>
          <h1 class="serif-heading detail-title">${escapeHTML(product.TenSp)}</h1>
          <div class="detail-price">${formatVND(product.GiaBan)}</div>
          <p class="detail-desc">${escapeHTML(product.Mota)}</p>

          <div class="variant-section">
            <div class="variant-label">
              <span>Màu sắc: <strong id="selected-color-label">${escapeHTML(selectedColor)}</strong></span>
              <span class="mono-code text-muted" id="selected-mabt-label"></span>
            </div>
            <div class="variant-options" id="detail-color-options"></div>
          </div>

          <div class="variant-section">
            <div class="variant-label">
              <span>Kích cỡ (Size chuẩn Âu - Việt):</span>
              <button type="button" class="text-accent font-medium" style="font-size:0.8rem;text-decoration:underline;" id="btn-open-size-guide">Hướng dẫn chọn size</button>
            </div>
            <div class="variant-options" id="detail-size-options"></div>
          </div>

          <div class="stock-status-box" id="detail-stock-box"></div>

          <div class="qty-action-row">
            <div class="qty-control">
              <button type="button" class="qty-btn" id="qty-minus">−</button>
              <input type="number" class="qty-input" id="qty-input" value="1" min="1" max="20">
              <button type="button" class="qty-btn" id="qty-plus">+</button>
            </div>
            <button type="button" class="btn btn-primary btn-lg" style="flex:1;" id="btn-add-cart">
              ${Icons.bag} <span>Thêm vào giỏ hàng</span>
            </button>
            <button type="button" class="btn btn-dark btn-lg" id="btn-buy-now">Mua ngay</button>
          </div>

          <div class="spec-list">
            <div class="spec-item">
              <span>Mã sản phẩm</span>
              <strong class="mono-code">${escapeHTML(product.MaSp)}</strong>
            </div>
            <div class="spec-item">
              <span>Xuất xứ thương hiệu</span>
              <strong>${escapeHTML(product.Xuatxu)}</strong>
            </div>
            <div class="spec-item" style="grid-column:1 / -1;">
              <span>Chất liệu &amp; Cấu trúc đế</span>
              <strong>${escapeHTML(product.Chatlieu || 'Da bê Full-grain cao cấp')}</strong>
            </div>
          </div>
        </div>
      </div>
    `;

    const mainImgEl = document.getElementById('detail-main-img');
    const thumbsWrap = document.getElementById('detail-thumbs');
    const colorOptsEl = document.getElementById('detail-color-options');
    const sizeOptsEl = document.getElementById('detail-size-options');
    const stockBoxEl = document.getElementById('detail-stock-box');
    const qtyInput = document.getElementById('qty-input');
    const btnAddCart = document.getElementById('btn-add-cart');
    const btnBuyNow = document.getElementById('btn-buy-now');

    function setMainImage(src) {
      if (!src || !mainImgEl) return;
      mainImgEl.src = src;
      thumbsWrap?.querySelectorAll('.detail-thumb-btn').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-img') === src);
      });
    }

    thumbsWrap?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-img]');
      if (btn) setMainImage(btn.getAttribute('data-img'));
    });

    function renderVariantSelectors() {
      // Colors
      colorOptsEl.innerHTML = product.colors
        .map(
          (c) => `
            <button type="button" class="variant-btn ${c === selectedColor ? 'active' : ''}" data-color="${escapeHTML(c)}">
              <span class="color-dot" style="background:${colorHex(c)};"></span>
              <span>${escapeHTML(c)}</span>
            </button>
          `
        )
        .join('');

      colorOptsEl.querySelectorAll('[data-color]').forEach((btn) => {
        btn.addEventListener('click', () => {
          selectedColor = btn.getAttribute('data-color');
          selectedVariant = pickDefaultVariantForColor(selectedColor);
          if (product.AnhTheoMau && product.AnhTheoMau[selectedColor]) {
            setMainImage(product.AnhTheoMau[selectedColor]);
          }
          qtyInput.value = 1;
          renderVariantSelectors();
        });
      });

      document.getElementById('selected-color-label').textContent = selectedColor;
      document.getElementById('selected-mabt-label').textContent = selectedVariant ? `Mã biến thể: ${selectedVariant.MaBt}` : '';

      // Sizes for selectedColor
      const colorVariants = product.variants
        .filter((v) => v.Mau === selectedColor)
        .sort((a, b) => Number(a.Size) - Number(b.Size));

      sizeOptsEl.innerHTML = colorVariants
        .map((v) => {
          const out = Number(v.Soluongton) <= 0;
          const isAct = selectedVariant && selectedVariant.MaBt === v.MaBt;
          return `
            <button type="button" class="variant-btn ${isAct ? 'active' : ''} ${out ? 'out-of-stock' : ''}" data-mabt="${escapeHTML(v.MaBt)}">
              Size ${v.Size}
            </button>
          `;
        })
        .join('');

      sizeOptsEl.querySelectorAll('[data-mabt]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const mabt = btn.getAttribute('data-mabt');
          selectedVariant = product.variants.find((v) => v.MaBt === mabt) || null;
          qtyInput.value = 1;
          renderVariantSelectors();
        });
      });

      // Update live stock box (refresh from DB in case cart/order changed)
      const freshVar = selectedVariant ? window.Store.getVariantDetails(selectedVariant.MaBt) : null;
      const stock = freshVar ? Number(freshVar.Soluongton) : 0;

      if (!freshVar || stock <= 0) {
        stockBoxEl.innerHTML = `
          <span>Tình trạng kho: <strong class="text-error">Hết hàng cho biến thể này</strong></span>
          <span class="badge badge-error">Tồn kho: 0 đôi</span>
        `;
        btnAddCart.disabled = true;
        btnBuyNow.disabled = true;
        qtyInput.value = 0;
        qtyInput.disabled = true;
      } else {
        const badgeCls = stock <= 3 ? 'badge-warning' : 'badge-success';
        const statusTxt = stock <= 3 ? 'Sắp hết hàng' : 'Còn hàng sẵn sàng giao';
        stockBoxEl.innerHTML = `
          <span>Tình trạng: <strong class="${stock <= 3 ? 'text-warning' : 'text-success'}">${statusTxt}</strong></span>
          <span class="badge ${badgeCls}">Còn ${stock} đôi trong kho</span>
        `;
        btnAddCart.disabled = false;
        btnBuyNow.disabled = false;
        qtyInput.disabled = false;
        qtyInput.max = stock;
        if (Number(qtyInput.value) < 1) qtyInput.value = 1;
        if (Number(qtyInput.value) > stock) qtyInput.value = stock;
      }
    }

    renderVariantSelectors();

    document.getElementById('qty-minus')?.addEventListener('click', () => {
      const cur = parseInt(qtyInput.value, 10) || 1;
      if (cur > 1) qtyInput.value = cur - 1;
    });

    document.getElementById('qty-plus')?.addEventListener('click', () => {
      if (!selectedVariant) return;
      const fresh = window.Store.getVariantDetails(selectedVariant.MaBt);
      const maxStock = fresh ? Number(fresh.Soluongton) : 1;
      const cur = parseInt(qtyInput.value, 10) || 1;
      if (cur < maxStock) qtyInput.value = cur + 1;
      else showToast(`Kho chỉ còn tối đa ${maxStock} đôi cho size này.`, 'warning');
    });

    btnAddCart?.addEventListener('click', () => {
      if (!selectedVariant) return;
      const res = window.Store.addToCart(selectedVariant.MaBt, qtyInput.value);
      if (!res.ok) {
        showToast(res.message, 'error');
        return;
      }
      updateCartBadge();
      showToast(res.message, 'success');
    });

    btnBuyNow?.addEventListener('click', () => {
      if (!selectedVariant) return;
      const res = window.Store.addToCart(selectedVariant.MaBt, qtyInput.value);
      if (!res.ok) {
        showToast(res.message, 'error');
        return;
      }
      updateCartBadge();
      window.location.href = 'cart.html';
    });

    document.getElementById('btn-open-size-guide')?.addEventListener('click', () => openModal('size-guide-modal'));

    // Related products
    const relMount = document.getElementById('related-products-grid');
    if (relMount) {
      let related = allProducts.filter((p) => p.MaSp !== product.MaSp && p.Maloai === product.Maloai);
      if (related.length < 4) {
        const extra = allProducts.filter((p) => p.MaSp !== product.MaSp && p.Maloai !== product.Maloai);
        related = related.concat(extra);
      }
      relMount.innerHTML = related.slice(0, 4).map(renderProductCardHTML).join('');
    }
  }

  // -------------------- 4. LOGIN & REGISTER PAGES --------------------
  function initLoginPage() {
    renderCustomerHeader('login');
    renderCustomerFooter();

    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect') || '';

    const form = document.getElementById('login-form');
    const idInput = document.getElementById('login-identifier');
    const pwInput = document.getElementById('login-password');
    const alertBox = document.getElementById('login-alert');

    document.querySelectorAll('[data-demo-login]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const email = btn.getAttribute('data-email');
        const pw = btn.getAttribute('data-pw');
        idInput.value = email;
        pwInput.value = pw;
        form.requestSubmit();
      });
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      alertBox.style.display = 'none';
      const res = window.Store.login(idInput.value, pwInput.value);
      if (!res.ok) {
        alertBox.textContent = res.message;
        alertBox.style.display = 'flex';
        return;
      }
      showToast(`Xin chào ${res.user.name} (${res.user.roleLabel})!`, 'success');
      setTimeout(() => {
        if (redirect) {
          window.location.href = redirect;
        } else if (res.user.role === 'owner' || res.user.role === 'staff') {
          window.location.href = 'admin/index.html';
        } else {
          window.location.href = 'index.html';
        }
      }, 350);
    });
  }

  function initRegisterPage() {
    renderCustomerHeader('login');
    renderCustomerFooter();

    const form = document.getElementById('register-form');
    const alertBox = document.getElementById('register-alert');

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      alertBox.style.display = 'none';

      const TenKh = document.getElementById('reg-name').value;
      const Sdt = document.getElementById('reg-phone').value;
      const Email = document.getElementById('reg-email').value;
      const Diachi = document.getElementById('reg-address').value;
      const Matkhau = document.getElementById('reg-password').value;
      const Confirm = document.getElementById('reg-confirm').value;

      if (Matkhau !== Confirm) {
        alertBox.textContent = 'Mật khẩu xác nhận không trùng khớp.';
        alertBox.style.display = 'flex';
        return;
      }

      const res = window.Store.registerCustomer({ TenKh, Sdt, Email, Diachi, Matkhau });
      if (!res.ok) {
        alertBox.textContent = res.message;
        alertBox.style.display = 'flex';
        return;
      }

      showToast('Đăng ký tài khoản thành công!', 'success');
      setTimeout(() => {
        window.location.href = 'account.html';
      }, 450);
    });
  }

  // -------------------- 5. CART PAGE --------------------
  function initCartPage() {
    renderCustomerHeader('cart');
    renderCustomerFooter();

    const mount = document.getElementById('cart-content-mount');
    if (!mount) return;

    function renderCartView() {
      const items = window.Store.getCartDetailed();
      updateCartBadge();

      if (!items.length) {
        mount.innerHTML = `
          <div class="panel empty-state">
            ${Icons.bag}
            <h3>Giỏ hàng của bạn đang trống</h3>
            <p>Hãy khám phá các thiết kế giày da thủ công mới nhất từ BE CLASSY.</p>
            <a href="products.html" class="btn btn-primary">Tiếp tục mua sắm</a>
          </div>
        `;
        return;
      }

      const subtotal = items.reduce((s, i) => s + i.Thanhtien, 0);
      const savedCode = window.Store.getAppliedPromoCode();
      const promoCheck = savedCode ? window.Store.validatePromoCode(savedCode, subtotal) : { ok: false, discount: 0 };
      const discount = promoCheck.ok ? promoCheck.discount : 0;
      const finalTotal = Math.max(0, subtotal - discount);

      const db = window.Store.loadDB();
      const activePromos = db.KhuyenMai.filter((k) => k.Trangthai === 'Đang áp dụng');

      mount.innerHTML = `
        <div class="cart-layout">
          <div class="panel">
            <div class="panel-header">
              <h2 class="panel-title">Sản phẩm trong giỏ (${items.length} dòng sản phẩm)</h2>
              <a href="products.html" class="text-accent font-medium" style="font-size:0.85rem;">+ Mua thêm sản phẩm</a>
            </div>
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Sản phẩm &amp; Biến thể</th>
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th class="text-right">Thành tiền</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${items
                    .map(
                      (item) => `
                    <tr>
                      <td>
                        <div class="cart-item-cell">
                          <img src="${escapeHTML(item.Hinhanh)}" alt="${escapeHTML(item.TenSp)}" class="cart-item-img">
                          <div>
                            <a href="product-detail.html?id=${encodeURIComponent(item.MaSp)}" class="font-semibold">${escapeHTML(item.TenSp)}</a>
                            <div class="text-muted" style="font-size:0.8rem;margin-top:2px;">
                              Màu: <strong>${escapeHTML(item.Mau)}</strong> • Size: <strong>${item.Size}</strong>
                            </div>
                            <div style="font-size:0.75rem;margin-top:2px;" class="${item.Soluong > item.Soluongton ? 'text-error' : 'text-secondary'}">
                              Tồn kho hiện tại: ${item.Soluongton} đôi
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>${formatVND(item.Dongia)}</td>
                      <td>
                        <div class="qty-control" style="transform:scale(0.9);transform-origin:left center;">
                          <button type="button" class="qty-btn" data-cart-dec="${escapeHTML(item.MaBt)}">−</button>
                          <input type="number" class="qty-input" value="${item.Soluong}" min="1" max="${item.Soluongton}" data-cart-input="${escapeHTML(item.MaBt)}">
                          <button type="button" class="qty-btn" data-cart-inc="${escapeHTML(item.MaBt)}">+</button>
                        </div>
                      </td>
                      <td class="text-right font-semibold">${formatVND(item.Thanhtien)}</td>
                      <td class="text-right">
                        <button type="button" class="btn btn-danger-outline btn-sm" data-cart-remove="${escapeHTML(item.MaBt)}" title="Xóa khỏi giỏ">
                          ${Icons.trash}
                        </button>
                      </td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          </div>

          <aside class="summary-card">
            <h3 style="font-size:1.05rem;font-weight:600;margin-bottom:14px;">Tóm tắt đơn hàng</h3>

            <div class="form-group">
              <label class="form-label">Mã khuyến mãi</label>
              <div style="display:flex;gap:8px;">
                <input type="text" class="form-control mono-code" id="cart-promo-input" placeholder="Nhập mã (VD: QUYONG10)" value="${escapeHTML(savedCode)}">
                <button type="button" class="btn btn-outline" id="btn-apply-promo">Áp dụng</button>
              </div>
              ${
                activePromos.length
                  ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">
                      ${activePromos
                        .map(
                          (p) =>
                            `<button type="button" class="badge badge-accent" style="cursor:pointer;" data-quick-promo="${escapeHTML(p.Code)}">${escapeHTML(p.Code)}</button>`
                        )
                        .join('')}
                    </div>`
                  : ''
              }
              ${
                savedCode && !promoCheck.ok
                  ? `<div class="text-error" style="font-size:0.78rem;margin-top:6px;">${escapeHTML(promoCheck.message)}</div>`
                  : ''
              }
              ${
                promoCheck.ok
                  ? `<div class="text-success" style="font-size:0.78rem;margin-top:6px;">Đã áp dụng: ${escapeHTML(promoCheck.promo.TenKm)}</div>`
                  : ''
              }
            </div>

            <div class="summary-row">
              <span>Tạm tính</span>
              <span>${formatVND(subtotal)}</span>
            </div>
            <div class="summary-row">
              <span>Giảm giá khuyến mãi</span>
              <span class="${discount > 0 ? 'text-success font-medium' : ''}">${discount > 0 ? '-' + formatVND(discount) : '0₫'}</span>
            </div>
            <div class="summary-row">
              <span>Phí vận chuyển</span>
              <span>Miễn phí</span>
            </div>
            <div class="summary-row total">
              <span>Tổng thanh toán</span>
              <span class="text-accent">${formatVND(finalTotal)}</span>
            </div>

            <button type="button" class="btn btn-primary btn-lg btn-block" style="margin-top:18px;" id="btn-proceed-checkout">
              Tiến hành thanh toán ${Icons.arrowRight}
            </button>
          </aside>
        </div>
      `;

      // Bind quantity buttons
      mount.querySelectorAll('[data-cart-dec]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const mabt = btn.getAttribute('data-cart-dec');
          const curItem = items.find((i) => i.MaBt === mabt);
          if (!curItem) return;
          if (curItem.Soluong <= 1) {
            confirmRemove(mabt, curItem.TenSp);
            return;
          }
          const res = window.Store.updateCartQty(mabt, curItem.Soluong - 1);
          if (!res.ok) showToast(res.message, 'error');
          renderCartView();
        });
      });

      mount.querySelectorAll('[data-cart-inc]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const mabt = btn.getAttribute('data-cart-inc');
          const curItem = items.find((i) => i.MaBt === mabt);
          if (!curItem) return;
          const res = window.Store.updateCartQty(mabt, curItem.Soluong + 1);
          if (!res.ok) showToast(res.message, 'warning');
          renderCartView();
        });
      });

      mount.querySelectorAll('[data-cart-input]').forEach((inp) => {
        inp.addEventListener('change', () => {
          const mabt = inp.getAttribute('data-cart-input');
          const res = window.Store.updateCartQty(mabt, inp.value);
          if (!res.ok) showToast(res.message, 'error');
          renderCartView();
        });
      });

      function confirmRemove(mabt, name) {
        confirmDialog({
          title: 'Xóa sản phẩm khỏi giỏ hàng',
          message: `Bạn có chắc muốn xóa "${name}" ra khỏi giỏ hàng?`,
          confirmText: 'Xóa sản phẩm',
          danger: true,
          onConfirm: () => {
            window.Store.removeFromCart(mabt);
            showToast('Đã xóa sản phẩm khỏi giỏ hàng.');
            renderCartView();
          }
        });
      }

      mount.querySelectorAll('[data-cart-remove]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const mabt = btn.getAttribute('data-cart-remove');
          const curItem = items.find((i) => i.MaBt === mabt);
          confirmRemove(mabt, curItem ? curItem.TenSp : mabt);
        });
      });

      // Promo code apply
      document.getElementById('btn-apply-promo')?.addEventListener('click', () => {
        const code = document.getElementById('cart-promo-input').value.trim();
        if (!code) {
          window.Store.setAppliedPromoCode('');
          renderCartView();
          return;
        }
        const check = window.Store.validatePromoCode(code, subtotal);
        window.Store.setAppliedPromoCode(code);
        if (check.ok) showToast(check.message, 'success');
        else showToast(check.message, 'error');
        renderCartView();
      });

      mount.querySelectorAll('[data-quick-promo]').forEach((chip) => {
        chip.addEventListener('click', () => {
          const code = chip.getAttribute('data-quick-promo');
          window.Store.setAppliedPromoCode(code);
          const check = window.Store.validatePromoCode(code, subtotal);
          if (check.ok) showToast(check.message, 'success');
          else showToast(check.message, 'warning');
          renderCartView();
        });
      });

      // Proceed checkout (check Tiền điều kiện: Khách hàng đã đăng nhập - Bảng 3.27 & 3.34)
      document.getElementById('btn-proceed-checkout')?.addEventListener('click', () => {
        const user = window.Store.getCurrentUser();
        if (!user) {
          showToast('Vui lòng đăng nhập tài khoản Khách hàng để đặt hàng.', 'warning');
          setTimeout(() => {
            window.location.href = 'login.html?redirect=checkout.html';
          }, 500);
          return;
        }
        if (user.role !== 'customer') {
          showToast('Bạn đang đăng nhập vai trò Quản trị. Vui lòng chuyển sang tài khoản Khách hàng để đặt mua.', 'warning');
          setTimeout(() => {
            window.location.href = 'login.html?redirect=checkout.html';
          }, 700);
          return;
        }
        // Check stock before entering checkout
        const stockIssue = items.find((i) => i.Soluong > i.Soluongton || i.Soluongton <= 0);
        if (stockIssue) {
          showToast(`Sản phẩm "${stockIssue.TenSp}" vượt quá tồn kho hiện tại. Vui lòng điều chỉnh số lượng.`, 'error');
          return;
        }
        window.location.href = 'checkout.html';
      });
    }

    renderCartView();
  }

  // -------------------- 6. CHECKOUT PAGE --------------------
  function initCheckoutPage() {
    renderCustomerHeader('cart');
    renderCustomerFooter();

    const mount = document.getElementById('checkout-mount');
    if (!mount) return;

    const user = window.Store.getCurrentUser();
    if (!user || user.role !== 'customer') {
      window.location.href = 'login.html?redirect=checkout.html';
      return;
    }

    const items = window.Store.getCartDetailed();
    if (!items.length) {
      mount.innerHTML = `
        <div class="panel empty-state">
          <h3>Chưa có sản phẩm để thanh toán</h3>
          <p>Giỏ hàng của bạn hiện đang trống.</p>
          <a href="products.html" class="btn btn-primary">Quay lại chọn sản phẩm</a>
        </div>
      `;
      return;
    }

    const db = window.Store.loadDB();
    const customer = db.KhachHang.find((k) => k.MaKh === user.id) || {};
    const subtotal = items.reduce((s, i) => s + i.Thanhtien, 0);
    const savedCode = window.Store.getAppliedPromoCode();
    const promoCheck = savedCode ? window.Store.validatePromoCode(savedCode, subtotal) : { ok: false, discount: 0 };
    const discount = promoCheck.ok ? promoCheck.discount : 0;
    const total = Math.max(0, subtotal - discount);

    mount.innerHTML = `
      <form id="checkout-form" class="checkout-layout">
        <div>
          <div class="panel" style="margin-bottom:22px;">
            <div class="panel-header">
              <h2 class="panel-title">1. Thông tin người nhận &amp; Địa chỉ giao hàng</h2>
            </div>
            <div class="panel-body">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Họ và tên người nhận <span class="req">*</span></label>
                  <input type="text" class="form-control" id="ck-name" value="${escapeHTML(customer.TenKh || user.name)}" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Số điện thoại liên hệ <span class="req">*</span></label>
                  <input type="tel" class="form-control" id="ck-phone" value="${escapeHTML(customer.Sdt || user.phone)}" required>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Địa chỉ nhận hàng chi tiết <span class="req">*</span></label>
                <input type="text" class="form-control" id="ck-address" value="${escapeHTML(customer.Diachi || '')}" placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố" required>
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">Ghi chú giao hàng (tùy chọn)</label>
                <textarea class="form-control" id="ck-note" placeholder="Ví dụ: Giao trong giờ hành chính, gọi trước khi giao..."></textarea>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-header">
              <h2 class="panel-title">2. Phương thức thanh toán (CongThanhToan)</h2>
            </div>
            <div class="panel-body" id="ck-gateways">
              ${db.CongThanhToan.map(
                (gw, idx) => `
                  <label class="payment-option ${idx === 0 ? 'selected' : ''}">
                    <input type="radio" name="Macong" value="${escapeHTML(gw.Macong)}" ${idx === 0 ? 'checked' : ''}>
                    <div>
                      <div class="font-semibold">${escapeHTML(gw.Tencong)}</div>
                      <div class="text-muted" style="font-size:0.8rem;margin-top:2px;">
                        ${
                          gw.Macong === 'CTT01'
                            ? 'Kiểm tra ngoại quan giày trước khi thanh toán tiền mặt cho bưu tá.'
                            : 'Mô phỏng xác thực giao dịch trực tuyến tức thì cho đồ án.'
                        }
                      </div>
                    </div>
                  </label>
                `
              ).join('')}
            </div>
          </div>
        </div>

        <aside class="summary-card">
          <h3 style="font-size:1.05rem;font-weight:600;margin-bottom:14px;">Đơn hàng của bạn (${items.length} mẫu)</h3>
          <div style="max-height:260px;overflow-y:auto;margin-bottom:14px;border-bottom:1px solid var(--border);padding-bottom:10px;">
            ${items
              .map(
                (i) => `
                <div style="display:flex;justify-content:space-between;gap:10px;padding:8px 0;font-size:0.84rem;">
                  <div>
                    <div class="font-medium">${escapeHTML(i.TenSp)}</div>
                    <div class="text-muted" style="font-size:0.76rem;">${escapeHTML(i.Mau)} • Size ${i.Size} × ${i.Soluong}</div>
                  </div>
                  <div class="font-semibold">${formatVND(i.Thanhtien)}</div>
                </div>
              `
              )
              .join('')}
          </div>

          <div class="summary-row">
            <span>Tạm tính</span>
            <span>${formatVND(subtotal)}</span>
          </div>
          <div class="summary-row">
            <span>Khuyến mãi ${promoCheck.ok ? `(${escapeHTML(promoCheck.promo.Code)})` : ''}</span>
            <span class="${discount > 0 ? 'text-success' : ''}">${discount > 0 ? '-' + formatVND(discount) : '0₫'}</span>
          </div>
          <div class="summary-row">
            <span>Phí vận chuyển</span>
            <span>Miễn phí</span>
          </div>
          <div class="summary-row total">
            <span>Tổng thanh toán</span>
            <span class="text-accent">${formatVND(total)}</span>
          </div>

          <button type="submit" class="btn btn-primary btn-lg btn-block" style="margin-top:18px;">
            Xác nhận đặt hàng
          </button>
          <a href="cart.html" class="btn btn-outline btn-block" style="margin-top:10px;">Quay lại giỏ hàng</a>
        </aside>
      </form>
    `;

    // Highlight selected payment gateway
    const gwWrap = document.getElementById('ck-gateways');
    gwWrap?.addEventListener('change', () => {
      gwWrap.querySelectorAll('.payment-option').forEach((lbl) => {
        const radio = lbl.querySelector('input[type="radio"]');
        lbl.classList.toggle('selected', Boolean(radio && radio.checked));
      });
    });

    document.getElementById('checkout-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const Macong = document.querySelector('input[name="Macong"]:checked')?.value || 'CTT01';
      const res = window.Store.placeOrder({
        Nguoinhan: document.getElementById('ck-name').value,
        Sdtnhan: document.getElementById('ck-phone').value,
        Diachigiao: document.getElementById('ck-address').value,
        Ghichu: document.getElementById('ck-note').value,
        Macong,
        MaKm: promoCheck.ok ? promoCheck.promo.Code : ''
      });

      if (!res.ok) {
        showToast(res.message, 'error');
        return;
      }

      updateCartBadge();
      const ord = res.order;
      mount.innerHTML = `
        <div class="panel" style="max-width:640px;margin:16px auto;padding:36px 32px;text-align:center;">
          <div style="width:52px;height:52px;border-radius:50%;background:var(--success-bg);color:var(--success);display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
            ${Icons.check}
          </div>
          <span class="eyebrow">Đặt hàng hoàn tất</span>
          <h2 class="serif-heading" style="font-size:2rem;margin:6px 0 10px;">Cảm ơn bạn đã chọn BE CLASSY</h2>
          <p class="text-secondary" style="font-size:0.9rem;margin-bottom:22px;">
            Đơn hàng <strong class="mono-code text-main">${escapeHTML(ord.MaDh)}</strong> đã được ghi nhận ở trạng thái <strong>${escapeHTML(ord.Trangthai)}</strong> và hệ thống đã cập nhật trừ tồn kho tương ứng.
          </p>

          <div style="text-align:left;background:var(--bg-main);border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px 20px;margin-bottom:24px;font-size:0.875rem;">
            <div style="display:flex;justify-content:space-between;padding:5px 0;">
              <span class="text-muted">Mã đơn hàng:</span>
              <strong class="mono-code">${escapeHTML(ord.MaDh)}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;padding:5px 0;">
              <span class="text-muted">Người nhận:</span>
              <strong>${escapeHTML(ord.Nguoinhan)} (${escapeHTML(ord.Sdtnhan)})</strong>
            </div>
            <div style="display:flex;justify-content:space-between;padding:5px 0;">
              <span class="text-muted">Địa chỉ giao:</span>
              <span>${escapeHTML(ord.Diachigiao)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:5px 0;">
              <span class="text-muted">Phương thức thanh toán:</span>
              <span>${escapeHTML(ord.PhuongthucTT)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0 2px;border-top:1px solid var(--border);margin-top:6px;">
              <span class="font-semibold">Tổng tiền thanh toán:</span>
              <strong class="text-accent" style="font-size:1.05rem;">${formatVND(ord.Tongtien)}</strong>
            </div>
          </div>

          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
            <a href="account.html?tab=orders" class="btn btn-primary">Theo dõi đơn hàng</a>
            <a href="products.html" class="btn btn-outline">Tiếp tục xem sản phẩm</a>
          </div>
        </div>
      `;
    });
  }

  // -------------------- 7. CUSTOMER ACCOUNT PORTAL --------------------
  function initAccountPage() {
    renderCustomerHeader('account');
    renderCustomerFooter();

    const user = window.Store.getCurrentUser();
    if (!user) {
      window.location.href = 'login.html?redirect=account.html';
      return;
    }
    if (user.role !== 'customer') {
      window.location.href = 'admin/index.html';
      return;
    }

    const params = new URLSearchParams(window.location.search);
    let currentTab = params.get('tab') || 'profile';
    let preselectOrderForReturn = params.get('returnOrder') || '';

    const navBtns = document.querySelectorAll('[data-acc-tab]');
    const panes = document.querySelectorAll('[data-acc-pane]');

    function switchTab(tabName) {
      currentTab = tabName;
      navBtns.forEach((b) => b.classList.toggle('active', b.getAttribute('data-acc-tab') === tabName));
      panes.forEach((p) => p.classList.toggle('active', p.getAttribute('data-acc-pane') === tabName));
      if (tabName === 'profile') renderProfilePane();
      if (tabName === 'orders') renderOrdersPane();
      if (tabName === 'returns') renderReturnsPane();
      if (tabName === 'support') renderSupportPane();
    }

    navBtns.forEach((b) => {
      b.addEventListener('click', () => switchTab(b.getAttribute('data-acc-tab')));
    });

    document.getElementById('acc-logout-btn')?.addEventListener('click', () => {
      window.Store.logout();
      showToast('Đã đăng xuất thành công.');
      setTimeout(() => { window.location.href = 'index.html'; }, 350);
    });

    function refreshSidebarIdentity() {
      const db = window.Store.loadDB();
      const kh = db.KhachHang.find((k) => k.MaKh === user.id) || {};
      const nameEl = document.getElementById('acc-sidebar-name');
      const codeEl = document.getElementById('acc-sidebar-meta');
      if (nameEl) nameEl.textContent = kh.TenKh || user.name;
      if (codeEl) codeEl.textContent = `Mã KH: ${user.id} • ${kh.Diemtichluy || 0} điểm`;
    }

    // Tab 1: Profile
    function renderProfilePane() {
      refreshSidebarIdentity();
      const db = window.Store.loadDB();
      const kh = db.KhachHang.find((k) => k.MaKh === user.id);
      if (!kh) return;
      const pane = document.querySelector('[data-acc-pane="profile"]');
      pane.innerHTML = `
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Thông tin cá nhân</h2>
            <span class="badge badge-accent">Điểm tích lũy: ${kh.Diemtichluy || 0} điểm</span>
          </div>
          <div class="panel-body">
            <form id="profile-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Mã khách hàng</label>
                  <input type="text" class="form-control mono-code" value="${escapeHTML(kh.MaKh)}" readonly>
                </div>
                <div class="form-group">
                  <label class="form-label">Họ và tên <span class="req">*</span></label>
                  <input type="text" class="form-control" id="pf-name" value="${escapeHTML(kh.TenKh)}" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Số điện thoại <span class="req">*</span></label>
                  <input type="tel" class="form-control" id="pf-phone" value="${escapeHTML(kh.Sdt)}" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Địa chỉ Email <span class="req">*</span></label>
                  <input type="email" class="form-control" id="pf-email" value="${escapeHTML(kh.Email)}" required>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Địa chỉ nhận hàng mặc định <span class="req">*</span></label>
                <input type="text" class="form-control" id="pf-address" value="${escapeHTML(kh.Diachi)}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Đổi mật khẩu mới (để trống nếu giữ nguyên)</label>
                <input type="password" class="form-control" id="pf-password" placeholder="Nhập mật khẩu mới từ 6 ký tự...">
              </div>
              <button type="submit" class="btn btn-primary">Lưu thay đổi</button>
            </form>
          </div>
        </div>
      `;

      document.getElementById('profile-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPw = document.getElementById('pf-password').value;
        if (newPw && newPw.length < 6) {
          showToast('Mật khẩu mới phải có ít nhất 6 ký tự.', 'error');
          return;
        }
        const res = window.Store.saveCustomer(
          {
            MaKh: kh.MaKh,
            TenKh: document.getElementById('pf-name').value,
            Sdt: document.getElementById('pf-phone').value,
            Email: document.getElementById('pf-email').value,
            Diachi: document.getElementById('pf-address').value,
            Matkhau: newPw || kh.Matkhau
          },
          true
        );
        if (!res.ok) {
          showToast(res.message, 'error');
          return;
        }
        user.name = document.getElementById('pf-name').value.trim();
        window.Store.setCurrentUser(user);
        renderCustomerHeader('account');
        refreshSidebarIdentity();
        showToast('Đã cập nhật thông tin tài khoản thành công.');
      });
    }

    // Tab 2: Orders History & Status Tracking
    function renderOrdersPane() {
      const db = window.Store.loadDB();
      const myOrders = db.DonHang.filter((o) => o.MaKh === user.id);
      const pane = document.querySelector('[data-acc-pane="orders"]');

      if (!myOrders.length) {
        pane.innerHTML = `
          <div class="panel empty-state">
            ${Icons.orders}
            <h3>Bạn chưa có đơn hàng nào</h3>
            <p>Các đơn đặt mua của bạn sẽ hiển thị tại đây kèm trạng thái vận chuyển chi tiết.</p>
            <a href="products.html" class="btn btn-primary">Mua sắm ngay</a>
          </div>
        `;
        return;
      }

      pane.innerHTML = `
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Lịch sử mua hàng &amp; Theo dõi đơn hàng (${myOrders.length})</h2>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Ngày đặt</th>
                  <th>Thanh toán</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th class="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                ${myOrders
                  .map(
                    (o) => `
                  <tr>
                    <td class="mono-code font-semibold">${escapeHTML(o.MaDh)}</td>
                    <td>${formatDateVN(o.Ngaydat)}</td>
                    <td style="font-size:0.8125rem;">${escapeHTML(o.PhuongthucTT)}</td>
                    <td class="font-semibold text-accent">${formatVND(o.Tongtien)}</td>
                    <td>${statusBadge(o.Trangthai)}</td>
                    <td class="text-right">
                      <div class="table-actions">
                        <button type="button" class="btn btn-outline btn-sm" data-view-order="${escapeHTML(o.MaDh)}">${Icons.eye} Chi tiết</button>
                        ${
                          o.Trangthai === 'Chờ xác nhận'
                            ? `<button type="button" class="btn btn-danger-outline btn-sm" data-cancel-order="${escapeHTML(o.MaDh)}">Hủy đơn</button>`
                            : ''
                        }
                        ${
                          o.Trangthai === 'Đã giao'
                            ? `<button type="button" class="btn btn-subtle btn-sm" data-return-order="${escapeHTML(o.MaDh)}">Đổi/Trả</button>`
                            : ''
                        }
                      </div>
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

      pane.querySelectorAll('[data-view-order]').forEach((btn) => {
        btn.addEventListener('click', () => showCustomerOrderModal(btn.getAttribute('data-view-order')));
      });

      pane.querySelectorAll('[data-cancel-order]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const madh = btn.getAttribute('data-cancel-order');
          confirmDialog({
            title: `Hủy đơn hàng ${madh}`,
            message: 'Bạn có chắc muốn hủy đơn hàng này? Số lượng giày trong đơn sẽ được hoàn trả lại kho.',
            confirmText: 'Xác nhận hủy đơn',
            danger: true,
            onConfirm: () => {
              const res = window.Store.updateOrderStatus(madh, 'Đã hủy');
              if (!res.ok) showToast(res.message, 'error');
              else showToast(`Đã hủy đơn hàng ${madh}.`);
              renderOrdersPane();
            }
          });
        });
      });

      pane.querySelectorAll('[data-return-order]').forEach((btn) => {
        btn.addEventListener('click', () => {
          preselectOrderForReturn = btn.getAttribute('data-return-order');
          switchTab('returns');
        });
      });
    }

    function showCustomerOrderModal(MaDh) {
      const db = window.Store.loadDB();
      const ord = db.DonHang.find((o) => o.MaDh === MaDh);
      if (!ord) return;
      const lines = db.ChiTietDonHang.filter((ct) => ct.MaDh === MaDh);

      const steps = ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao hàng', 'Đã giao'];
      const curIdx = steps.indexOf(ord.Trangthai);

      let stepperHTML = '';
      if (ord.Trangthai === 'Đã hủy') {
        stepperHTML = `<div class="alert alert-error">Đơn hàng này đã bị hủy.</div>`;
      } else {
        stepperHTML = `
          <div class="order-Timeline">
            ${steps
              .map((st, idx) => {
                let cls = '';
                if (idx < curIdx || ord.Trangthai === 'Đã giao') cls = 'done';
                else if (idx === curIdx) cls = 'current';
                return `<div class="timeline-step ${cls}">${idx + 1}. ${escapeHTML(st)}</div>`;
              })
              .join('')}
          </div>
        `;
      }

      const modalBody = document.getElementById('cust-order-modal-body');
      if (!modalBody) return;
      modalBody.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
          <div>Mã đơn: <strong class="mono-code">${escapeHTML(ord.MaDh)}</strong> • Ngày đặt: <strong>${formatDateVN(ord.Ngaydat)}</strong></div>
          <div>${statusBadge(ord.Trangthai)}</div>
        </div>
        ${stepperHTML}
        <div style="background:var(--bg-main);padding:12px 16px;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:16px;font-size:0.85rem;">
          <div><strong>Người nhận:</strong> ${escapeHTML(ord.Nguoinhan)} — ${escapeHTML(ord.Sdtnhan)}</div>
          <div style="margin-top:4px;"><strong>Địa chỉ giao:</strong> ${escapeHTML(ord.Diachigiao)}</div>
          <div style="margin-top:4px;"><strong>Phương thức thanh toán:</strong> ${escapeHTML(ord.PhuongthucTT)}</div>
          ${ord.Ghichu ? `<div style="margin-top:4px;"><strong>Ghi chú:</strong> ${escapeHTML(ord.Ghichu)}</div>` : ''}
        </div>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Biến thể</th>
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
                      <td class="font-medium">${escapeHTML(info ? info.TenSp : ln.MaBt)}</td>
                      <td>${info ? `${escapeHTML(info.Mau)} • Size ${info.Size}` : escapeHTML(ln.MaBt)}</td>
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
        <div style="text-align:right;margin-top:14px;font-size:0.9rem;">
          ${ord.Giamgia > 0 ? `<div class="text-muted">Tạm tính: ${formatVND(ord.Tamtinh)} | Giảm giá: -${formatVND(ord.Giamgia)}</div>` : ''}
          <div style="font-size:1.05rem;margin-top:4px;">Tổng cộng: <strong class="text-accent">${formatVND(ord.Tongtien)}</strong></div>
        </div>
      `;
      openModal('cust-order-modal');
    }

    // Tab 3: Returns & Exchanges (DoiTra - Bảng 3.35 - 3.37)
    function renderReturnsPane() {
      const db = window.Store.loadDB();
      const eligibleOrders = window.Store.getEligibleOrdersForReturn(user.id);
      const myReturns = db.DoiTra.filter((r) => r.MaKh === user.id);
      const pane = document.querySelector('[data-acc-pane="returns"]');

      const selectedOrderId = preselectOrderForReturn && eligibleOrders.some((o) => o.MaDh === preselectOrderForReturn)
        ? preselectOrderForReturn
        : (eligibleOrders[0]?.MaDh || '');

      pane.innerHTML = `
        <div class="panel" style="margin-bottom:24px;">
          <div class="panel-header">
            <h2 class="panel-title">Gửi yêu cầu đổi / trả hàng</h2>
            <span class="text-muted" style="font-size:0.8rem;">Điều kiện: Đơn hàng "Đã giao" trong vòng 15 ngày</span>
          </div>
          <div class="panel-body">
            ${
              !eligibleOrders.length
                ? `<div class="alert alert-info" style="margin-bottom:0;">Hiện tại bạn không có đơn hàng nào ở trạng thái "Đã giao" trong thời hạn 15 ngày để gửi yêu cầu đổi trả.</div>`
                : `
                <form id="return-request-form">
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">Chọn đơn hàng đủ điều kiện <span class="req">*</span></label>
                      <select class="form-control" id="ret-order-select" required>
                        ${eligibleOrders
                          .map(
                            (o) =>
                              `<option value="${escapeHTML(o.MaDh)}" ${o.MaDh === selectedOrderId ? 'selected' : ''}>${escapeHTML(o.MaDh)} — Ngày đặt ${formatDateVN(o.Ngaydat)} (${formatVND(o.Tongtien)})</option>`
                          )
                          .join('')}
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Hình thức yêu cầu <span class="req">*</span></label>
                      <select class="form-control" id="ret-type" required>
                        <option value="Đổi sản phẩm">Đổi sản phẩm (Đổi size / mẫu)</option>
                        <option value="Trả hàng hoàn tiền">Trả hàng hoàn tiền</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">Sản phẩm trong đơn <span class="req">*</span></label>
                      <select class="form-control" id="ret-variant-select" required></select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Số lượng cần đổi/trả <span class="req">*</span></label>
                      <input type="number" class="form-control" id="ret-qty" value="1" min="1" required>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Lý do đổi trả chi tiết <span class="req">*</span></label>
                    <textarea class="form-control" id="ret-reason" placeholder="Mô tả rõ tình trạng sản phẩm hoặc size mong muốn đổi sang..." required></textarea>
                  </div>

                  <button type="submit" class="btn btn-primary">Gửi yêu cầu đổi trả</button>
                </form>
              `
            }
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Danh sách yêu cầu đổi trả đã gửi (${myReturns.length})</h2>
          </div>
          ${
            !myReturns.length
              ? `<div class="empty-state"><p>Bạn chưa gửi yêu cầu đổi trả nào.</p></div>`
              : `
              <div class="table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Mã phiếu</th>
                      <th>Đơn hàng</th>
                      <th>Sản phẩm</th>
                      <th>Hình thức</th>
                      <th>Lý do &amp; Phản hồi</th>
                      <th>Trạng thái</th>
                      <th class="text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${myReturns
                      .map((r) => {
                        const vInfo = window.Store.getVariantDetails(r.MaBt);
                        return `
                          <tr>
                            <td class="mono-code font-semibold">${escapeHTML(r.MaDoitra)}<div class="text-muted" style="font-size:0.75rem;">${formatDateVN(r.Ngaydoitra)}</div></td>
                            <td class="mono-code">${escapeHTML(r.MaDh)}</td>
                            <td>
                              <div class="font-medium">${escapeHTML(vInfo ? vInfo.TenSp : r.MaBt)}</div>
                              <div class="text-muted" style="font-size:0.78rem;">${vInfo ? `${escapeHTML(vInfo.Mau)} • Size ${vInfo.Size}` : ''} × ${r.Soluong || 1}</div>
                            </td>
                            <td>
                              <div>${escapeHTML(r.Loai)}</div>
                              ${r.Tienhoan > 0 ? `<div class="text-accent font-medium" style="font-size:0.78rem;">Hoàn: ${formatVND(r.Tienhoan)}</div>` : ''}
                            </td>
                            <td style="max-width:260px;font-size:0.82rem;">
                              <div>${escapeHTML(r.Lydo)}</div>
                              ${r.GhichuXuLy ? `<div class="text-secondary" style="margin-top:4px;"><em>Cửa hàng: ${escapeHTML(r.GhichuXuLy)}</em></div>` : ''}
                            </td>
                            <td>${statusBadge(r.Ketqua)}</td>
                            <td class="text-right">
                              ${
                                r.Ketqua === 'Chờ duyệt'
                                  ? `<button type="button" class="btn btn-danger-outline btn-sm" data-cancel-ret="${escapeHTML(r.MaDoitra)}">Hủy yêu cầu</button>`
                                  : '<span class="text-muted" style="font-size:0.78rem;">—</span>'
                              }
                            </td>
                          </tr>
                        `;
                      })
                      .join('')}
                  </tbody>
                </table>
              </div>
            `
          }
        </div>
      `;

      const ordSel = document.getElementById('ret-order-select');
      const varSel = document.getElementById('ret-variant-select');
      const qtyInp = document.getElementById('ret-qty');

      function populateOrderItems() {
        if (!ordSel || !varSel) return;
        const madh = ordSel.value;
        const lines = db.ChiTietDonHang.filter((ct) => ct.MaDh === madh);
        varSel.innerHTML = lines
          .map((ln) => {
            const info = window.Store.getVariantDetails(ln.MaBt);
            const label = info
              ? `${info.TenSp} (${info.Mau}, Size ${info.Size}) — Đã mua: ${ln.Soluong}`
              : `${ln.MaBt} — SL: ${ln.Soluong}`;
            return `<option value="${escapeHTML(ln.MaBt)}" data-max="${ln.Soluong}">${escapeHTML(label)}</option>`;
          })
          .join('');
        syncMaxQty();
      }

      function syncMaxQty() {
        if (!varSel || !qtyInp) return;
        const opt = varSel.options[varSel.selectedIndex];
        const max = opt ? Number(opt.getAttribute('data-max') || 1) : 1;
        qtyInp.max = max;
        qtyInp.value = 1;
      }

      ordSel?.addEventListener('change', populateOrderItems);
      varSel?.addEventListener('change', syncMaxQty);
      populateOrderItems();

      document.getElementById('return-request-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const res = window.Store.createReturnRequest({
          MaDh: ordSel.value,
          MaBt: varSel.value,
          Soluong: qtyInp.value,
          Loai: document.getElementById('ret-type').value,
          Lydo: document.getElementById('ret-reason').value
        });
        if (!res.ok) {
          showToast(res.message, 'error');
          return;
        }
        preselectOrderForReturn = '';
        showToast(res.message, 'success');
        renderReturnsPane();
      });

      pane.querySelectorAll('[data-cancel-ret]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-cancel-ret');
          confirmDialog({
            title: 'Hủy yêu cầu đổi trả',
            message: `Bạn có chắc muốn hủy yêu cầu đổi trả ${id}?`,
            confirmText: 'Hủy yêu cầu',
            danger: true,
            onConfirm: () => {
              const res = window.Store.cancelReturnRequest(id, user.id);
              if (!res.ok) showToast(res.message, 'error');
              else showToast(res.message, 'success');
              renderReturnsPane();
            }
          });
        });
      });
    }

    // Tab 4: Support Requests (PhieuHoTro)
    function renderSupportPane() {
      const db = window.Store.loadDB();
      const myOrders = db.DonHang.filter((o) => o.MaKh === user.id);
      const myTickets = db.PhieuHoTro.filter((t) => t.MaKh === user.id);
      const pane = document.querySelector('[data-acc-pane="support"]');

      pane.innerHTML = `
        <div class="panel" style="margin-bottom:24px;">
          <div class="panel-header">
            <h2 class="panel-title">Gửi yêu cầu hỗ trợ khách hàng</h2>
          </div>
          <div class="panel-body">
            <form id="cust-support-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Chủ đề cần hỗ trợ <span class="req">*</span></label>
                  <select class="form-control" id="sup-topic">
                    <option value="Tư vấn chọn size">Tư vấn chọn size &amp; phom chân</option>
                    <option value="Bảo hành & Bảo dưỡng">Bảo hành &amp; Bảo dưỡng da định kỳ</option>
                    <option value="Giao hàng & Vận chuyển">Giao hàng &amp; Vận chuyển</option>
                    <option value="Khiếu nại dịch vụ">Khiếu nại dịch vụ</option>
                    <option value="Khác">Vấn đề khác</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Đơn hàng liên quan (nếu có)</label>
                  <select class="form-control" id="sup-order">
                    <option value="">-- Không gắn đơn hàng --</option>
                    ${myOrders
                      .map((o) => `<option value="${escapeHTML(o.MaDh)}">${escapeHTML(o.MaDh)} (${formatDateVN(o.Ngaydat)})</option>`)
                      .join('')}
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Nội dung chi tiết <span class="req">*</span></label>
                <textarea class="form-control" id="sup-content" placeholder="Nhập câu hỏi hoặc vấn đề cần nhân viên BE CLASSY hỗ trợ..." required></textarea>
              </div>
              <button type="submit" class="btn btn-primary">Gửi phiếu hỗ trợ</button>
            </form>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Lịch sử phiếu hỗ trợ (${myTickets.length})</h2>
          </div>
          ${
            !myTickets.length
              ? `<div class="empty-state"><p>Bạn chưa gửi yêu cầu hỗ trợ nào.</p></div>`
              : `
              <div class="table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Mã phiếu</th>
                      <th>Chủ đề</th>
                      <th>Nội dung yêu cầu &amp; Phản hồi từ nhân viên</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${myTickets
                      .map(
                        (t) => `
                        <tr>
                          <td class="mono-code font-semibold">
                            ${escapeHTML(t.MaPhieu)}
                            <div class="text-muted" style="font-size:0.75rem;">${formatDateVN(t.Ngaytao)}</div>
                          </td>
                          <td>
                            <div class="font-medium">${escapeHTML(t.Loaivande)}</div>
                            ${t.MaDh ? `<div class="mono-code text-muted" style="font-size:0.76rem;">Đơn: ${escapeHTML(t.MaDh)}</div>` : ''}
                          </td>
                          <td style="max-width:380px;">
                            <div>${escapeHTML(t.Noidung)}</div>
                            ${
                              t.Phanhoi
                                ? `<div style="margin-top:8px;padding:8px 12px;background:var(--bg-subtle);border-left:3px solid var(--accent);font-size:0.82rem;">
                                    <strong>Phản hồi CSKH:</strong> ${escapeHTML(t.Phanhoi)}
                                  </div>`
                                : `<div class="text-muted" style="font-size:0.78rem;margin-top:4px;">Đang chờ nhân viên phản hồi...</div>`
                            }
                          </td>
                          <td>${statusBadge(t.Trangthai)}</td>
                        </tr>
                      `
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
            `
          }
        </div>
      `;

      document.getElementById('cust-support-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const res = window.Store.createSupportTicket({
          MaKh: user.id,
          MaDh: document.getElementById('sup-order').value,
          Loaivande: document.getElementById('sup-topic').value,
          Mucdouutien: 'Trung bình',
          Noidung: document.getElementById('sup-content').value
        });
        if (!res.ok) {
          showToast(res.message, 'error');
          return;
        }
        showToast(res.message, 'success');
        renderSupportPane();
      });
    }

    switchTab(currentTab);
  }

  // -------------------- BOOTSTRAP BY DATA-PAGE --------------------
  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.getAttribute('data-page');
    if (page === 'home') initHomePage();
    else if (page === 'products') initProductsPage();
    else if (page === 'product-detail') initProductDetailPage();
    else if (page === 'login') initLoginPage();
    else if (page === 'register') initRegisterPage();
    else if (page === 'cart') initCartPage();
    else if (page === 'checkout') initCheckoutPage();
    else if (page === 'account') initAccountPage();
  });
})();

