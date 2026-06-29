(function () {
  "use strict";

  const PAGE_SIZE = 9;
  const DATA_URL = "data/products.json";
  const ORGANIZER = "国家金融监督管理总局榕江监管支局";

  const AMOUNT_BUCKETS = [
    { key: "all", label: "不限" },
    { key: "le100", label: "100万元及以下", max: 100 },
    { key: "100-300", label: "100-300万元", min: 100, max: 300 },
    { key: "300-500", label: "300-500万元", min: 300, max: 500 },
    { key: "500-1000", label: "500-1000万元", min: 500, max: 1000 },
    { key: "gt1000", label: "1000万元以上", min: 1000 },
  ];

  const TERM_BUCKETS = [
    { key: "all", label: "不限" },
    { key: "le12", label: "12个月及以内", max: 12 },
    { key: "le24", label: "24个月及以内", max: 24 },
    { key: "le36", label: "36个月及以内", max: 36 },
    { key: "le60", label: "60个月及以内", max: 60 },
    { key: "gt60", label: "60个月以上", min: 60 },
  ];

  const GUARANTEE_TYPES = [
    { key: "all", label: "全部" },
    { key: "信用", label: "信用" },
    { key: "担保", label: "担保/保证" },
    { key: "抵押", label: "抵押" },
    { key: "质押", label: "质押" },
    { key: "组合", label: "组合担保" },
    { key: "其他", label: "其他" },
  ];

  const state = {
    data: null,
    products: [],
    filtered: [],
    filters: {
      keyword: "",
      bank: "all",
      category: "all",
      guarantee: "all",
      amount: "all",
      term: "all",
    },
    page: 1,
  };

  const els = {
    siteTitle: document.getElementById("site-title"),
    siteSubtitle: document.getElementById("site-subtitle"),
    headerStats: document.getElementById("header-stats"),
    keyword: document.getElementById("keyword"),
    btnSearch: document.getElementById("btn-search"),
    btnReset: document.getElementById("btn-reset"),
    filterToggle: document.getElementById("filter-toggle"),
    filterToggleText: document.getElementById("filter-toggle-text"),
    filterPanel: document.getElementById("filter-panel"),
    filterBank: document.getElementById("filter-bank"),
    filterCategory: document.getElementById("filter-category"),
    filterGuarantee: document.getElementById("filter-guarantee"),
    filterAmount: document.getElementById("filter-amount"),
    filterTerm: document.getElementById("filter-term"),
    resultSummary: document.getElementById("result-summary"),
    productList: document.getElementById("product-list"),
    pagination: document.getElementById("pagination"),
    footerText: document.getElementById("footer-text"),
    modal: document.getElementById("detail-modal"),
    modalTitle: document.getElementById("modal-title"),
    modalBank: document.getElementById("modal-bank"),
    modalBadges: document.getElementById("modal-badges"),
    modalMetrics: document.getElementById("modal-metrics"),
    modalBody: document.getElementById("modal-body"),
    modalClose: document.getElementById("modal-close"),
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function matchGuarantee(productGuarantee, filterKey) {
    if (filterKey === "all") return true;
    const g = productGuarantee || "";
    if (filterKey === "信用") return g.includes("信用");
    if (filterKey === "担保") return /保证|担保/.test(g);
    if (filterKey === "抵押") return g.includes("抵押");
    if (filterKey === "质押") return g.includes("质押");
    if (filterKey === "组合") {
      const types = [g.includes("信用"), /保证|担保/.test(g), g.includes("抵押"), g.includes("质押")];
      return types.filter(Boolean).length >= 2;
    }
    if (filterKey === "其他") {
      return !g || g === "不限";
    }
    return g.includes(filterKey);
  }

  function matchAmountBucket(amountMax, bucketKey) {
    if (bucketKey === "all") return true;
    const bucket = AMOUNT_BUCKETS.find((b) => b.key === bucketKey);
    if (!bucket || amountMax == null) return bucketKey === "all";
    if (bucket.min != null && amountMax < bucket.min) return false;
    if (bucket.max != null && amountMax > bucket.max) return false;
    return true;
  }

  function matchTermBucket(termMaxMonths, bucketKey) {
    if (bucketKey === "all") return true;
    const bucket = TERM_BUCKETS.find((b) => b.key === bucketKey);
    if (!bucket || termMaxMonths == null) return bucketKey === "all";
    if (bucket.min != null && termMaxMonths <= bucket.min) return false;
    if (bucket.max != null && termMaxMonths > bucket.max) return false;
    return true;
  }

  function applyFilters() {
    const kw = state.filters.keyword.trim().toLowerCase();
    state.filtered = state.products.filter((p) => {
      if (state.filters.bank !== "all" && p.bank !== state.filters.bank) return false;
      if (state.filters.category !== "all" && p.category !== state.filters.category) return false;
      if (!matchGuarantee(p.guarantee, state.filters.guarantee)) return false;
      if (!matchAmountBucket(p.amountMax, state.filters.amount)) return false;
      if (!matchTermBucket(p.termMaxMonths, state.filters.term)) return false;
      if (!kw) return true;
      const haystack = [
        p.name,
        p.bank,
        p.category,
        p.target,
        p.conditions,
        p.guarantee,
        p.amount,
        p.term,
        p.rate,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(kw);
    });
    state.page = 1;
  }

  function buildFilterChips(container, options, filterKey, withAllLabel) {
    container.innerHTML = "";
    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = "filter-chip active";
    allBtn.textContent = withAllLabel || "全部";
    allBtn.dataset.value = "all";
    allBtn.addEventListener("click", () => setFilter(filterKey, "all"));
    container.appendChild(allBtn);

    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-chip";
      btn.textContent = opt.label || opt;
      btn.dataset.value = opt.key || opt;
      btn.addEventListener("click", () => setFilter(filterKey, opt.key || opt));
      container.appendChild(btn);
    });
  }

  function setFilter(filterKey, value) {
    state.filters[filterKey] = value;
    const groupMap = {
      bank: els.filterBank,
      category: els.filterCategory,
      guarantee: els.filterGuarantee,
      amount: els.filterAmount,
      term: els.filterTerm,
    };
    const container = groupMap[filterKey];
    if (container) {
      container.querySelectorAll(".filter-chip").forEach((chip) => {
        chip.classList.toggle("active", chip.dataset.value === value);
      });
    }
    applyFilters();
    render();
  }

  function renderHeader() {
    const meta = state.data.meta;
    if (meta.title) els.siteTitle.textContent = meta.title;
    if (meta.subtitle) els.siteSubtitle.textContent = meta.subtitle;
    els.footerText.textContent = meta.title || "榕江县小微企业金融服务信贷平台";

    const stats = meta.stats || {};
    els.headerStats.innerHTML = [
      `<span class="stat-chip"><strong>${stats.products || state.products.length}</strong> 信贷产品</span>`,
      `<span class="stat-chip"><strong>${stats.banks || meta.filters?.banks?.length || 0}</strong> 银行机构</span>`,
    ].join("");
  }

  function renderFilters() {
    const f = state.data.meta.filters || {};
    buildFilterChips(els.filterBank, f.banks || [], "bank");
    buildFilterChips(els.filterCategory, f.categories || [], "category");
    buildFilterChips(els.filterGuarantee, GUARANTEE_TYPES.slice(1), "guarantee", "全部");
    buildFilterChips(els.filterAmount, AMOUNT_BUCKETS.slice(1), "amount", "不限");
    buildFilterChips(els.filterTerm, TERM_BUCKETS.slice(1), "term", "不限");
  }

  function renderProducts() {
    const total = state.filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;

    const start = (state.page - 1) * PAGE_SIZE;
    const pageItems = state.filtered.slice(start, start + PAGE_SIZE);

    els.resultSummary.textContent =
      total > 0
        ? `智能搜索 ${total} 个产品 · 第 ${state.page} / ${totalPages} 页`
        : "未找到符合条件的产品，请调整筛选条件";

    if (pageItems.length === 0) {
      els.productList.innerHTML = `<div class="empty-state">暂无匹配产品，请尝试放宽筛选或更换关键词。</div>`;
      els.pagination.innerHTML = "";
      return;
    }

    els.productList.innerHTML = pageItems
      .map((p) => {
        const desc = p.target || p.conditions || "";
        return `
          <article class="product-card" data-id="${escapeHtml(p.id)}">
            <div class="card-header">
              <h2 class="card-title">${escapeHtml(p.name)}</h2>
              ${p.category ? `<span class="card-badge">${escapeHtml(p.category)}</span>` : ""}
            </div>
            <div class="card-bank">${escapeHtml(p.bank)}</div>
            ${desc ? `<p class="card-desc">${escapeHtml(desc)}</p>` : ""}
            <div class="card-meta">
              ${p.amount ? `<span>最高额度 <strong>${escapeHtml(p.amount)}</strong></span>` : ""}
              ${p.rate ? `<span>参考利率 <strong>${escapeHtml(p.rate)}</strong></span>` : ""}
              ${p.term ? `<span>贷款期限 <strong>${escapeHtml(p.term)}</strong></span>` : ""}
            </div>
            <div class="card-footer">
              <button type="button" class="btn-detail" data-id="${escapeHtml(p.id)}">查看详情</button>
            </div>
          </article>
        `;
      })
      .join("");

    els.productList.querySelectorAll(".btn-detail").forEach((btn) => {
      btn.addEventListener("click", () => openDetail(btn.dataset.id));
    });
  }

  function renderPagination() {
    const total = state.filtered.length;
    const totalPages = Math.ceil(total / PAGE_SIZE);
    if (totalPages <= 1) {
      els.pagination.innerHTML = "";
      return;
    }

    const parts = [];
    const addBtn = (label, page, disabled, active) => {
      parts.push(
        `<button type="button" class="page-btn${active ? " active" : ""}" data-page="${page}" ${disabled ? "disabled" : ""}>${label}</button>`
      );
    };

    addBtn("上一页", state.page - 1, state.page <= 1, false);
    for (let i = 1; i <= totalPages; i += 1) {
      if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - state.page) > 1) {
        if (i === 3 || i === totalPages - 2) parts.push("<span>…</span>");
        continue;
      }
      addBtn(String(i), i, false, i === state.page);
    }
    addBtn("下一页", state.page + 1, state.page >= totalPages, false);
    if (state.page < totalPages) {
      addBtn("末页", totalPages, false, false);
    }

    els.pagination.innerHTML = parts.join("");
    els.pagination.querySelectorAll(".page-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const page = Number(btn.dataset.page);
        if (page >= 1 && page <= totalPages) {
          state.page = page;
          renderProducts();
          renderPagination();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });
  }

  function render() {
    renderProducts();
    renderPagination();
  }

  function formatProcessSteps(process) {
    if (!process) return "";
    const steps = process.split(/[,，、]/).map((s) => s.trim()).filter(Boolean);
    if (steps.length <= 1) {
      return `<p class="detail-text">${escapeHtml(process)}</p>`;
    }
    return `<ol class="detail-steps">${steps
      .map((step) => `<li>${escapeHtml(step)}</li>`)
      .join("")}</ol>`;
  }

  function openDetail(id) {
    const p = state.products.find((item) => String(item.id) === String(id));
    if (!p) return;

    els.modalTitle.textContent = p.name;
    els.modalBank.textContent = p.bank || "";

    const badges = [];
    if (p.category) badges.push(`<span class="modal-badge">${escapeHtml(p.category)}</span>`);
    if (p.guarantee) badges.push(`<span class="modal-badge modal-badge-outline">${escapeHtml(p.guarantee)}</span>`);
    els.modalBadges.innerHTML = badges.join("");

    const metrics = [
      { label: "融资额度", value: p.amount, icon: "额" },
      { label: "年利率", value: p.rate, icon: "率" },
      { label: "贷款期限", value: p.term, icon: "期" },
    ].filter((m) => m.value);

    els.modalMetrics.innerHTML = metrics.length
      ? `<div class="metric-grid">${metrics
          .map(
            (m) =>
              `<div class="metric-card"><span class="metric-icon" aria-hidden="true">${m.icon}</span><span class="metric-label">${escapeHtml(m.label)}</span><span class="metric-value">${escapeHtml(m.value)}</span></div>`
          )
          .join("")}</div>`
      : "";

    const infoRows = [
      ["服务对象", p.target],
      ["申请条件", p.conditions],
    ].filter(([, val]) => val);

    let bodyHtml = "";

    if (infoRows.length) {
      bodyHtml += `<section class="detail-section"><h3 class="detail-section-title">产品说明</h3><div class="detail-info-grid">${infoRows
        .map(
          ([label, val]) =>
            `<div class="detail-info-item"><span class="detail-label">${escapeHtml(label)}</span><span class="detail-value">${escapeHtml(val)}</span></div>`
        )
        .join("")}</div></section>`;
    }

    if (p.process) {
      bodyHtml += `<section class="detail-section"><h3 class="detail-section-title">申请流程</h3>${formatProcessSteps(p.process)}</section>`;
    }

    if (p.contact) {
      bodyHtml += `<section class="detail-section detail-contact"><h3 class="detail-section-title">联系咨询</h3><div class="contact-box"><span class="contact-icon" aria-hidden="true">☎</span><div class="contact-content"><span class="contact-label">联系人及电话</span><span class="contact-value">${escapeHtml(p.contact)}</span></div></div></section>`;
    }

    els.modalBody.innerHTML = bodyHtml || `<p class="detail-empty">暂无更多详情信息。</p>`;
    els.modal.showModal();
  }

  function resetFilters() {
    state.filters = {
      keyword: "",
      bank: "all",
      category: "all",
      guarantee: "all",
      amount: "all",
      term: "all",
    };
    els.keyword.value = "";
    renderFilters();
    applyFilters();
    render();
  }

  function bindEvents() {
    els.btnSearch.addEventListener("click", () => {
      state.filters.keyword = els.keyword.value;
      applyFilters();
      render();
    });

    els.keyword.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        state.filters.keyword = els.keyword.value;
        applyFilters();
        render();
      }
    });

    els.btnReset.addEventListener("click", resetFilters);

    els.filterToggle.addEventListener("click", () => {
      const expanded = els.filterToggle.getAttribute("aria-expanded") === "true";
      els.filterToggle.setAttribute("aria-expanded", String(!expanded));
      els.filterPanel.hidden = expanded;
      els.filterToggleText.textContent = expanded ? "展开更多筛选" : "收起更多筛选";
    });

    els.modalClose.addEventListener("click", () => els.modal.close());
    els.modal.addEventListener("click", (e) => {
      if (e.target === els.modal) els.modal.close();
    });
  }

  async function init() {
    bindEvents();
    try {
      const res = await fetch(DATA_URL);
      if (!res.ok) throw new Error("数据加载失败");
      state.data = await res.json();
      state.products = state.data.products || [];
      if (!state.data.meta.organizer) state.data.meta.organizer = ORGANIZER;
      renderHeader();
      renderFilters();
      applyFilters();
      render();
    } catch (err) {
      els.resultSummary.textContent = "加载失败，请确认 data/products.json 存在并已通过 import_xlsx.py 生成。";
      els.productList.innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
    }
  }

  init();
})();
