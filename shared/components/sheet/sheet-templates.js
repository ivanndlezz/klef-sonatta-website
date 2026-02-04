/* ============================================
   SHEET SYSTEM - Templates
   ============================================ */

const SheetTemplates = {
  // Iconos SVG predefinidos
  icons: {
    chevron: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>`,
    close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>`,
    share: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="18" cy="5" r="3"></circle>
      <circle cx="6" cy="12" r="3"></circle>
      <circle cx="18" cy="19" r="3"></circle>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>`,
    favorite: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>`,
    copy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>`,
    more: `⋮`,
  },

  // Renderizar botón
  renderButton(config, className) {
    if (!config) return "";
    const icon = config.icon ? config.icon : "";
    return `<button class="${className}" data-action="${config.action}">
      ${icon}
      ${config.label || ""}
    </button>`;
  },

  // Renderizar chevron
  renderChevron() {
    return `<button class="top-chevron" data-action="show-more" aria-label="Más opciones">
      ${this.icons.chevron}
    </button>`;
  },

  // Renderizar botón de cerrar
  renderCloseButton() {
    return `<button class="close-btn" id="close-btn" aria-label="Cerrar panel">
      ${this.icons.close}
    </button>`;
  },

  // Renderizar dropdown
  renderDropdown(actions) {
    if (!actions || actions.length === 0) return "";

    const items = actions
      .map((action) => {
        const icon = action.icon || this.icons[action.iconName] || "";
        return `<li>
        <a href="#" data-action="${action.action}">
          ${icon}
          ${action.label}
        </a>
      </li>`;
      })
      .join("");

    return `<div class="top-controls-dropdown">
      <ul>
        ${items}
      </ul>
    </div>`;
  },

  // Renderizar wrapper de controles
  renderControlsWrapper(content) {
    return `<div class="top-controls-wrapper">
      ${content}
    </div>`;
  },

  // Renderizar controles izquierdo
  renderLeftControls(config) {
    const actionsHtml = (config.actions || [])
      .map((action) => this.renderButton(action, "top-btn"))
      .join("");

    const moreHtml = config.moreActions?.enabled
      ? this.renderChevron() + this.renderDropdown(config.moreActions.actions)
      : "";

    return this.renderControlsWrapper(
      `<div class="top-controls-left">
        ${actionsHtml}
        ${moreHtml}
      </div>`,
    );
  },

  // Renderizar top controls completo
  renderTopControls(config) {
    return `<div class="sheet-top-controls">
      ${this.renderLeftControls(config)}
      ${this.renderCloseButton()}
    </div>`;
  },

  // Renderizar bottom controls
  renderBottomControls(config) {
    const secondaryHtml = this.renderButton(config.secondary, "btn-secondary");
    const primaryHtml = this.renderButton(config.primary, "btn-primary");
    const moreHtml = config.moreActions?.enabled
      ? `<button class="btn-more" data-action="more-options" aria-label="Más opciones">${this.icons.more}</button>`
      : "";

    return `<div class="sheet-bottom-controls">
      ${secondaryHtml}
      ${primaryHtml}
      ${moreHtml}
    </div>`;
  },

  // Renderizar contenido
  renderContent(config) {
    // Si ContentRenderer está disponible, usarlo
    if (typeof ContentRenderer !== "undefined" && config.type) {
      return `<div id="sheet-content">${ContentRenderer.render(config)}</div>`;
    }
    // Fallback para HTML directo
    return `<div id="sheet-content">${config.html || ""}</div>`;
  },

  // Renderizar drag handle
  renderDragHandle() {
    return `<div class="drag-handle"></div>`;
  },

  // Renderizar loading
  renderLoading(message = "Cargando...") {
    return `<div class="sheet-loading">
      <div class="spinner"></div>
      <p>${message}</p>
    </div>`;
  },

  // Renderizar estructura completa del sheet
  renderSheet(config) {
    return `
    ${this.renderDragHandle()}
    ${this.renderTopControls(config.topControls || {})}     
    ${this.renderContent(config.content || {})}
    ${this.renderBottomControls(config.bottomControls || {})}
    `;
  },
};
