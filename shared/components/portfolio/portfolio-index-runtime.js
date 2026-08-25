(function () {
  "use strict";


  function escapeHtml(value) {
    const node = document.createElement("div");
    node.textContent = value || "";
    return node.innerHTML;
  }

  function getDisciplineLabel(discipline) {
    return {
      brands: "Brands",
      strategy: "Strategy",
      studio: "Studio",
      dev: "Development",
    }[discipline] || discipline || "Klef";
  }

  function fallbackLoadSheet(config) {
    const sheet = document.getElementById("bottomsheet");
    const backdrop = document.getElementById("backdrop");
    if (!sheet || !backdrop) return;

    const primary = config.bottomControls?.primary;
    sheet.innerHTML = `
      <div class="sheet-top-controls">
        <div class="top-controls-wrapper"></div>
        <button class="close-btn" type="button" aria-label="Cerrar panel">×</button>
      </div>
      <div id="sheet-content">${config.content?.html || ""}</div>
      ${primary ? `<div class="sheet-bottom-controls"><button class="btn-primary" type="button" data-action="${primary.action}">${primary.label}</button></div>` : ""}
    `;

    const close = () => {
      sheet.classList.remove("open", "full");
      backdrop.classList.remove("visible");
      document.body.style.overflow = "";
    };

    sheet.querySelector(".close-btn")?.addEventListener("click", close);
    backdrop.addEventListener("click", close, { once: true });
    sheet.classList.add("open");
    backdrop.classList.add("visible");
    document.body.style.overflow = "hidden";
  }

  function showSheet(config) {
    if (typeof window.loadSheet === "function") {
      window.loadSheet(config);
    } else {
      fallbackLoadSheet(config);
    }
  }

  async function loadPortfolioDetail(portfolioId) {
    const item = await window.PortfolioManager?.getById(portfolioId);

    if (!item) {
      showSheet({
        topControls: { actions: [], moreActions: { enabled: false } },
        content: { html: "<p>Proyecto no encontrado</p>" },
        bottomControls: { primary: null },
      });
      return;
    }

    window.currentPortfolioItem = item;
    const title = escapeHtml(item.title?.[0]);
    const type = escapeHtml(item.title?.[1]);
    const categories = (item.category || [])
      .map((category) => `<span class="tag">${escapeHtml(category)}</span>`)
      .join("");

    const contentHtml = `
      <div class="portfolio-detail">
        <img src="${escapeHtml(item.cover_image)}" alt="${title}" class="portfolio-detail-cover">
        <div class="portfolio-detail-header">
          <img src="${escapeHtml(item.logo || item.cover_image)}" alt="${title} logo" class="portfolio-detail-logo">
          <div class="portfolio-detail-title">
            <h2>${title} <small>| ${type}</small></h2>
            <span class="portfolio-detail-client">${escapeHtml(item.client_name)} · ${escapeHtml(item.client_industry)}</span>
          </div>
        </div>
        <div class="portfolio-detail-meta">
          <span class="tag tag-discipline">${escapeHtml(getDisciplineLabel(item.discipline))}</span>
          ${categories}
        </div>
        <p class="portfolio-detail-description">${escapeHtml(item.extract)}</p>
      </div>
    `;

    showSheet({
      topControls: {
        actions: [],
        moreActions: {
          enabled: true,
          actions: [
            { label: "Compartir", action: "share", iconName: "share" },
            { label: "Agregar a favoritos", action: "favorite", iconName: "favorite" },
            { label: "Copiar enlace", action: "copy-link", iconName: "copy" },
          ],
        },
      },
      content: { html: contentHtml },
      bottomControls: {
        primary: { label: "Ver Proyecto Completo", action: "open-project" },
        moreActions: { enabled: false },
      },
    });
  }

  window.loadPortfolioDetail = loadPortfolioDetail;

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-component='portfolioDetail'], .tag-portfolio");
    if (!trigger) return;


    const card = trigger.closest("[data-id]");
    const portfolioId = trigger.getAttribute("data-id") || card?.getAttribute("data-id");
    if (!portfolioId) return;

    event.preventDefault();
    loadPortfolioDetail(portfolioId).catch((error) => {
      console.error("[PortfolioIndex] Detail error:", error);
    });
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action='open-project']");
    const item = window.currentPortfolioItem;
    if (button && item?.slug) {
      window.location.href = `/portfolio/${item.slug}/`;
    }
  });
})();
