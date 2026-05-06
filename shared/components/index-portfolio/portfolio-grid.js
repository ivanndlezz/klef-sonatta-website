(function () {
  "use strict";

  // Verificar elementos requeridos
  const required = [
    "#tabsList",
    "#cardGrid",
    "#tab-search__bar",
    "#results-count",
  ];
  if (!required.every((s) => document.querySelector(s))) {
    console.log("[PortfolioGrid] Elementos no encontrados, abortando.");
    return;
  }

  console.log("[PortfolioGrid] Inicializando...");

  // Configuración
  const categories = [
    { id: 0, label: "Todo", filter: "all", subs: [] },
    { id: 1, label: "Diseño", filter: "brands", subs: [] },
    { id: 2, label: "Webs", filter: "dev", subs: [] },
    { id: 3, label: "Studio", filter: "studio", subs: [] },
    { id: 4, label: "Marketing", filter: "strategy", subs: [] },
  ];

  const subMapping = {
    "Identidad visual": "Identidad Visual",
    Logo: "Logo",
    "Brand Kit": "Brand Kit",
    Desarrollo: "Desarrollo Web",
    Diseño: "Diseño UI/UX",
    App: "App",
    Foto: "Fotografía",
    Video: "Video",
    Planning: "Planning",
    Estrategia: "Marketing Digital",
    "Social Media": "Social Media",
    Ads: "Ads",
    Estudios: "Consultoría",
  };

  const disciplineLabels = {
    brands: "Klef Brands",
    dev: "Klef Dev",
    studio: "Klef Studio",
    strategy: "Klef Strategy",
  };

  // DOM elements
  const tabsList = document.getElementById("tabsList");
  const desktopSubChips = document.getElementById("desktopSubChips");
  const mobileSubDock = document.getElementById("mobileSubDock");
  const searchInputPortfolio = document.getElementById("tab-search__bar");
  const searchingCheckbox = document.getElementById("is-searching");
  const cardGrid = document.getElementById("cardGrid");
  const resultsCount = document.getElementById("results-count");

  // Estado
  let activeId = 0;
  let currentSub = "";
  let searchTerm = "";
  let allPortfolioItems = [];

  // ============================================
  // CARGA DE DATOS
  // ============================================

  function loadPortfolioData() {
    return new Promise((resolve, reject) => {
      renderSkeletonCards();

      if (!window.PortfolioManager) {
        reject(new Error("PortfolioManager no disponible"));
        return;
      }

      const state = window.PortfolioManager.getState();
      if (state.cached) {
        window.PortfolioManager.getAll()
          .then((items) => {
            allPortfolioItems = items;
            resolve();
          })
          .catch(reject);
        return;
      }

      const onReady = (e) => {
        allPortfolioItems = e.detail.data;
        resolve();
      };
      window.addEventListener("portfolioReady", onReady, { once: true });

      const onError = (e) => reject(e.detail.error);
      window.addEventListener("portfolioError", onError, { once: true });
    });
  }

  function renderSkeletonCards() {
    if (!cardGrid) return;
    const skel = Array(6)
      .fill("")
      .map(
        () => `
        <article class="card skeleton-card">
          <div class="skeleton-image"></div>
          <div class="skeleton-content">
            <div class="skeleton-header">
              <div class="skeleton-logo"></div>
              <div class="skeleton-text-group">
                <div class="skeleton-title"></div>
                <div class="skeleton-subtitle"></div>
              </div>
            </div>
            <div class="skeleton-description"></div>
            <div class="skeleton-actions"></div>
          </div>
        </article>
      `,
      )
      .join("");
    cardGrid.innerHTML = skel;
  }

  // ============================================
  // RENDER DE CARDS
  // ============================================

  function escapeHtml(text) {
    if (!text) return "";
    const d = document.createElement("div");
    d.textContent = text;
    return d.innerHTML;
  }

  /**
   * Trunca texto a máximo N palabras
   * @param {string} text
   * @param {number} maxWords
   * @returns {string}
   */
  function truncateToWords(text, maxWords) {
    if (!text) return "";
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  }

  function createCardTemplate(card) {
    const tagClass = card.discipline || "brands";
    const label = disciplineLabels[card.discipline] || "Klef";
    const logoSrc = card.logo || card.cover_image;
    const displayTitle = truncateToWords(card.title[0], 2);
    return `
      <article class="card dark" data-id="${card.id}" data-discipline="${card.discipline}" data-slug="${card.slug}">
        <span class="category-tag tag-${tagClass}">${label}</span>
        <img src="${card.cover_image}" alt="${escapeHtml(card.title[0])}" loading="lazy">
        <section>
          <div class="project-header">
            <div class="project-logo">
              <img src="${logoSrc}" alt="${escapeHtml(card.title[0])} logo" loading="lazy">
            </div>
            <div class="project-title">
              <h2>
                <div class="text-main" title="${escapeHtml(card.title[0])}">${escapeHtml(displayTitle)}</div>
                <small>| ${escapeHtml(card.title[1])}</small>
              </h2>
              <span>${card.category.join(", ")}</span>
            </div>
          </div>
          <p><br>${escapeHtml(card.extract)}</p>
          <div class="project-actions">
            <div class="tag-portfolio" role="button" tabindex="0" aria-label="Leer historia de ${escapeHtml(card.title[0])}">
              <i class="fa-solid fa-user"></i> Leer historia
            </div>
            <button class="see-more" data-component="portfolioDetail" data-id="${card.id}" aria-label="Ver detalles de ${escapeHtml(card.title[0])}">Más</button>
          </div>
        </section>
      </article>
    `;
  }

  function renderCards(cards) {
    if (!cardGrid) return;
    if (cards.length === 0) {
      cardGrid.innerHTML = `
        <div class="no-results-grid">
          <div class="no-results-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" color="currentColor" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18.5016 18.5L21 21M20 14.5C20 11.4624 17.5376 9 14.5 9C11.4624 9 9 11.4624 9 14.5C9 17.5376 11.4624 20 14.5 20C17.5376 20 20 17.5376 20 14.5Z" />
              <path d="M10 3H14M3 10V14M6.5 21C4.567 21 3 19.433 3 17.5M17.5 3C19.433 3 21 4.567 21 6.5M3 6.5C3 4.567 4.567 3 6.5 3" />
            </svg>
          </div>
          <div class="no-results-title">No se encontraron proyectos</div>
          <div class="no-results-text">Intenta con otros filtros o términos de búsqueda</div>
        </div>
      `;
    } else {
      cardGrid.innerHTML = cards.map((c) => createCardTemplate(c)).join("");
    }
    if (resultsCount) {
      resultsCount.textContent =
        cards.length + (cards.length === 1 ? " Proyecto" : " Proyectos");
    }
  }

  // ============================================
  // FILTROS
  // ============================================

  function applyFilters() {
    if (!allPortfolioItems.length) return;
    let filtered = allPortfolioItems.slice();

    const currentFilter = categories[activeId].filter;
    if (currentFilter !== "all") {
      filtered = filtered.filter((c) => c.discipline === currentFilter);
    }

    if (currentSub) {
      const mapped = subMapping[currentSub];
      if (mapped) {
        filtered = filtered.filter((c) =>
          c.category.some((cat) =>
            cat.toLowerCase().includes(mapped.toLowerCase()),
          ),
        );
      }
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.some((t) => t.toLowerCase().includes(term)) ||
          c.category.some((cat) => cat.toLowerCase().includes(term)) ||
          c.client_name.toLowerCase().includes(term) ||
          c.extract.toLowerCase().includes(term),
      );
    }

    renderCards(filtered);
  }

  // ============================================
  // UI TABS Y SUBMENUS
  // ============================================

  function renderTabs() {
    tabsList.innerHTML = categories
      .map((cat) => {
        const activeClass = cat.id === activeId ? "active" : "";
        return `
            <li data-name="${cat.label}">
              <button class="tab-button ${activeClass}" data-id="${cat.id}" aria-label="Filtrar por ${cat.label}" aria-pressed="${cat.id === activeId}">
                ${cat.label}
                ${cat.subs.length > 0 ? '<span class="has-sub-indicator"></span>' : ""}
              </button>
            </li>
          `;
      })
      .join("");
  }

  function updateSubMenus() {
    const category = categories.find((c) => c.id === activeId);
    desktopSubChips.innerHTML = "";
    mobileSubDock.innerHTML = "";
    desktopSubChips.classList.remove("active");
    mobileSubDock.classList.remove("active");

    if (!category || category.subs.length === 0) return;

    const isMobile = window.innerWidth <= 768;
    const chipsHTML = category.subs
      .map(
        (sub) => `
        <div class="${isMobile ? "sub-chip-mobile" : "sub-chip"}" onclick="window.selectSub(this)" role="button" tabindex="0" aria-label="Filtrar por ${sub}">
          ${sub}
        </div>
      `,
      )
      .join("");

    if (isMobile) {
      mobileSubDock.innerHTML = chipsHTML;
      mobileSubDock.classList.add("active");
    } else {
      desktopSubChips.innerHTML = chipsHTML;
      desktopSubChips.classList.add("active");
      const activeIndex = categories.findIndex((c) => c.id === activeId);
      const buttonWidth = 120;
      const offset = activeIndex * buttonWidth;
      const maxOffset = window.innerWidth - desktopSubChips.offsetWidth - 20;
      desktopSubChips.style.left = Math.min(offset, maxOffset) + "px";
      desktopSubChips.style.transform = "translateY(10px)";
    }
  }

  window.selectSub = (el) => {
    const selector = el.classList.contains("sub-chip-mobile")
      ? ".sub-chip-mobile"
      : ".sub-chip";
    document
      .querySelectorAll(selector)
      .forEach((c) => c.classList.remove("active"));
    el.classList.add("active");
    currentSub = el.textContent.trim();
    applyFilters();
  };

  // ============================================
  // EVENT LISTENERS
  // ============================================

  function initEventListeners() {
    tabsList.addEventListener("click", (e) => {
      const btn = e.target.closest(".tab-button");
      if (!btn) return;

      activeId = parseInt(btn.getAttribute("data-id"));
      currentSub = "";
      renderTabs();
      updateSubMenus();
      applyFilters();

      if (window.innerWidth <= 768) {
        setTimeout(() => {
          const container = document.getElementById("tabsContainer");
          const activeBtn = container.querySelector(".tab-button.active");
          if (!activeBtn) return;
          const containerW = container.offsetWidth;
          const btnW = activeBtn.offsetWidth;
          const btnOffset = activeBtn.offsetLeft;
          const scrollPos = btnOffset - containerW / 2 + btnW / 2;
          const maxScroll = container.scrollWidth - containerW;
          container.scrollTo({
            left: Math.min(Math.max(0, scrollPos), maxScroll),
            behavior: "smooth",
          });
        }, 0);
      }
    });

    // Cerrar menú expandido al hacer clic en tab
    tabsList.addEventListener("click", (e) => {
      const container = document.getElementById("tabsContainer");
      if (
        e.target.closest(".tab-button") &&
        container.classList.contains("expanded")
      ) {
        container.classList.remove("expanded");
        const mi = document.getElementById("menuIcon");
        const ci = document.getElementById("closeIcon");
        if (mi) mi.style.display = "block";
        if (ci) ci.style.display = "none";
      }
    });

    // Búsqueda
    if (searchInputPortfolio) {
      searchInputPortfolio.addEventListener("focus", () => {
        if (searchingCheckbox) searchingCheckbox.checked = true;
        desktopSubChips.classList.remove("active");
        mobileSubDock.classList.remove("active");
      });
      searchInputPortfolio.addEventListener("blur", () => {
        if (searchInputPortfolio.value.trim() === "" && searchingCheckbox) {
          searchingCheckbox.checked = false;
          updateSubMenus();
        }
      });
      searchInputPortfolio.addEventListener("input", (e) => {
        searchTerm = e.target.value;
        applyFilters();
      });
    }

    // Toggle menú móvil
    const menuToggle = document.getElementById("menuToggle");
    const menuIcon = document.getElementById("menuIcon");
    const closeIcon = document.getElementById("closeIcon");
    const tabsContainer = document.getElementById("tabsContainer");
    if (menuToggle) {
      menuToggle.addEventListener("click", () => {
        const expanded = tabsContainer.classList.toggle("expanded");
        if (menuIcon) menuIcon.style.display = expanded ? "none" : "block";
        if (closeIcon) closeIcon.style.display = expanded ? "block" : "none";
      });
    }

    // Resize
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateSubMenus, 100);
    });
  }

  // ============================================
  // INICIO
  // ============================================

  async function init() {
    console.log("[PortfolioGrid] Iniciando...");
    renderTabs();
    updateSubMenus();
    initEventListeners();
    try {
      await loadPortfolioData();
      applyFilters();
    } catch (err) {
      console.error("[PortfolioGrid] Error cargando datos:", err);
      if (cardGrid) {
        cardGrid.innerHTML =
          '<div class="error-message">Error al cargar proyectos. Por favor, recarga la página.</div>';
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  console.log("[PortfolioGrid] Listo.");
})();
