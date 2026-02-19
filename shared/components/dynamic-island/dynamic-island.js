// ============================================================================
// NAMESPACE KLEF
// ============================================================================

window.Klef = window.Klef || {};
window.Klef.DynamicIsland = window.Klef.DynamicIsland || {};

// ============================================================================
// FUNCIONES HELPER - DECLARADAS PRIMERO
// ============================================================================
function openSearch() {
  const searchOverlay = document.getElementById("searchOverlay");
  if (searchOverlay) {
    searchOverlay.classList.add("active");
    // Use iOS-compatible scroll lock
    if (typeof ScrollLock !== "undefined") {
      ScrollLock.lock();
    } else {
      document.body.style.overflow = "hidden";
    }

    searchOverlay.addEventListener(
      "transitionend",
      () => {
        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
          searchInput.focus();
        }
      },
      { once: true },
    );

    const navbar = document.getElementById("main-nav");
    if (navbar && navbar.classList.contains("mobile-open")) {
      return;
    }
  } else {
    // Abrir búsqueda
  }
}

function toggleMenu() {
  const mainNav = document.getElementById("main-nav");
  if (mainNav) {
    const isOpen = mainNav.classList.toggle("mobile-open");
    // Use iOS-compatible scroll lock
    if (typeof ScrollLock !== "undefined") {
      if (isOpen) {
        ScrollLock.lock();
      } else {
        ScrollLock.unlock();
      }
    } else {
      document.body.style.overflow = isOpen ? "hidden" : "";
    }
    hideDynamicIsland();
  } else {
    // Toggle menú
  }
}

function openCart() {
  // Abrir carrito
}

function hideDynamicIsland() {
  if (dynamicIslandInstance && dynamicIslandInstance.container) {
    dynamicIslandInstance.container.classList.remove("visible");
  }
}

function showDynamicIsland() {
  if (dynamicIslandInstance && dynamicIslandInstance.container) {
    dynamicIslandInstance.container.classList.add("visible");
  }
}

// ============================================================================
// SAFE ACTIONS - AHORA SÍ PUEDEN REFERENCIAR LAS FUNCIONES
// ============================================================================
const SafeActions = {
  openSearch: typeof openSearch === "function" ? openSearch : () => {},
  toggleMenu: typeof toggleMenu === "function" ? toggleMenu : () => {},
  openCart: typeof openCart === "function" ? openCart : () => {},
  totop: () => window.scrollTo({ top: 0, behavior: "smooth" }),
};

// ============================================================================
// SAFE TEMPLATE EVALUATOR (HARDENED)
// ============================================================================
function renderTemplate(templateString, data = {}) {
  if (typeof templateString !== "string") {
    // Template is not a string
    return "";
  }

  try {
    const safeData = deepFreeze({ ...data });

    const fn = new Function(
      "data",
      `"use strict";
  
      const window = undefined;
      const document = undefined;
      const globalThis = undefined;
      const self = undefined;
      const Function = undefined;

      return \`${templateString}\`;
  `,
    );

    return fn(safeData);
  } catch (err) {
    // Template error
    return "";
  }
}

// ============================================================================
// Deep freeze helper (defensive immutability)
// ============================================================================
function deepFreeze(obj) {
  if (!obj || typeof obj !== "object") return obj;

  Object.freeze(obj);

  Object.getOwnPropertyNames(obj).forEach((prop) => {
    if (
      obj[prop] !== null &&
      (typeof obj[prop] === "object" || typeof obj[prop] === "function") &&
      !Object.isFrozen(obj[prop])
    ) {
      deepFreeze(obj[prop]);
    }
  });

  return obj;
}

// ============================================================================
// ICONS - DEFINIDOS ANTES DE LA CLASE
// ============================================================================
const ICONS = {
  search: `
  <svg 
  viewBox="0 0 24 24" 
  fill="none" 
  stroke="currentColor"
  style="--wh:20px; width: var(--wh); height: var(--wh);">
    <use href="#icon-search"></use>
  </svg>`,
  cartBag: `
  <svg 
  viewBox="0 0 24 24" 
  fill="none" 
  stroke="currentColor" 
  style="--wh:20px; width: var(--wh); height: var(--wh);">
    <use href="#shop-bag"></use>
  </svg>`,
  hamMenu: `
    <span class="menu-line"></span>
    <span class="menu-line"></span>
    <span class="menu-line"></span>
  `,
  totop: `
  <svg 
  viewBox="0 0 24 24" 
  fill="none" 
  stroke="currentColor" 
  style="--wh:20px; width: var(--wh); height: var(--wh);">
    <use href="#arrow-up"></use>
  </svg>
  `,
  listMenu: `
  <svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  style="--wh:20px; width: var(--wh); height: var(--wh);">
    <path d="M4 6h16M4 12h16M4 18h7"></path>
  </svg>
`,
  gallery: `
  <svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  style="--wh:20px; width: var(--wh); height: var(--wh);">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
`,
};

// ============================================================================
// DYNAMIC ISLAND - Arquitectura modular y configurable
// ============================================================================
class DynamicIsland {
  // ==========================================================================
  // PRESETS: Todas las estructuras HTML predefinidas
  // ==========================================================================
  static presets = {
    island_base: `
    <div class="dynamic-island pill" role="region" aria-label="Dynamic Island">
      <button class="close-btn" aria-label="Cerrar">×</button>
      <div class="island-content">
        <div class="center-content" data-action="search">
          <span class="search-icon">${ICONS.search}</span>
          <span>Buscar</span>
        </div>
      </div>
    </div>`,

    default: {
      getHtmlStructure(data) {
        return `
        <div class="island-content">
          <div class="center-content" data-action="search">
            <span class="search-icon">${data.search.icon}</span>
            <span>${data.search.name}</span>
          </div>
        </div>`;
      },
      data: {
        search: {
          icon: ICONS.search,
          name: "Buscar",
          function: SafeActions.openSearch,
        },
      },
    },

    search_menu_cart: {
      getHtmlStructure(data) {
        return `
    <div class="island-content">
      <button class="island-btn secondary" data-action="menu">
        <span class="icon">${data.menu.icon}</span>
        <span>${data.menu.name}</span>
      </button>
      <div class="center-content" data-action="search">
        <span class="search-icon">${data.search.icon}</span>
        <span>${data.search.name}</span>
      </div>
      <button class="island-btn accent" data-action="cart">
        <span class="icon">${data.cart.icon}</span>
        <span>${data.cart.name}</span>
      </button>
    </div>`;
      },
      data: {
        menu: {
          icon: ICONS.hamMenu,
          name: "Menú",
          function: () => {
            if (window.innerWidth <= 768) {
              if (typeof toggleMenu === "function") {
                toggleMenu();
              }
            } else {
              const firstMenuBtn = document.querySelector("a[data-mega]");
              if (firstMenuBtn) {
                const mouseEnterEvent = new MouseEvent("mouseenter", {
                  view: window,
                  bubbles: true,
                  cancelable: true,
                });
                firstMenuBtn.dispatchEvent(mouseEnterEvent);
              }
            }
          },
        },
        search: {
          icon: ICONS.search,
          name: "Buscar",
          function: SafeActions.openSearch,
        },
        cart: {
          icon: ICONS.cartBag,
          name: "Carrito",
          function: SafeActions.openCart,
        },
      },
    },

    search_totop: {
      getHtmlStructure(data) {
        return `
        <div class="island-content">
          <div class="center-content" data-action="search">
            <span class="search-icon">${data.search.icon}</span>
            <span>${data.search.name}</span>
          </div>
          <button class="island-btn accent" data-action="totop">
            <span class="icon">${data.totop.icon}</span>
            <span>${data.totop.name}</span>
          </button>
        </div>`;
      },
      data: {
        search: {
          icon: ICONS.search,
          name: "Buscar",
          function: SafeActions.openSearch,
        },
        totop: {
          icon: ICONS.totop || "↑",
          name: "Volver arriba",
          function: SafeActions.totop,
        },
      },
    },

    help_settings_profile: {
      getHtmlStructure(data) {
        return `<div class="island-content">
          <button class="island-btn primary" data-action="settings">
            <span class="icon">${data.settings.icon}</span>
            <span>${data.settings.name}</span>
          </button>
          <div class="center-content" data-action="help">
            <span class="icon">${data.help.icon}</span>
            <span>${data.help.name}</span>
          </div>
          <button class="island-btn secondary" data-action="profile">
            <span class="icon">${data.profile.icon}</span>
            <span>${data.profile.name}</span>
          </button>
        </div>`;
      },
      data: {
        settings: {
          icon: ICONS.hamMenu,
          name: "Ajustes",
          function: () => {},
        },
        help: {
          icon: "❓",
          name: "Ayuda",
          function: () => {},
        },
        profile: {
          icon: "👤",
          name: "Perfil",
          function: () => {},
        },
      },
    },

    portfolio_full_view: {
      getHtmlStructure(data) {
        return `
        <div class="island-content">
          <button class="center-content island-btn accent" data-action="historia">
            <span class="icon">${data.historia.icon}</span>
            <span>${data.historia.name}</span>
          </button>
          <button class="island-btn secondary" data-action="visuales">
            <span class="icon">${data.visuales.icon}</span>
            <span>${data.visuales.name}</span>
          </button>
        </div>`;
      },
      data: {
        visuales: {
          icon: ICONS.gallery,
          name: "Visuales",
          function: () => {
            // Find the control button with data-view-target="full"
            const fullViewBtn = document.querySelector(
              '.control-btn[data-view-target="visual-only"]',
            );
            if (fullViewBtn) {
              fullViewBtn.click();
            } else {
              // Fallback: directly set the view attribute
              document.body.setAttribute("data-view", "visual-only");
            }
          },
        },
        historia: {
          icon: ICONS.listMenu,
          name: "Historia Completa",
          function: () => {
            // Find the control button with data-view-target="full"
            const fullViewBtn = document.querySelector(
              '.control-btn[data-view-target="full"]',
            );
            if (fullViewBtn) {
              fullViewBtn.click();
            } else {
              // Fallback: directly set the view attribute
              document.body.setAttribute("data-view", "full");
            }
          },
        },
      },
    },
  };

  // ==========================================================================
  // TOAST TEMPLATES
  // ==========================================================================
  static toastTemplates = {
    simple: (content) => `<div class="island-content">
      <div class="toast-content">${content}</div>
    </div>`,

    persistent: (content) => `<div class="island-content">
      <div class="toast-content">
        ${content}
        <button class="toast-close-btn" onclick="closeToast()">×</button>
      </div>
    </div>`,

    withActions: (content, actions) => {
      const actionsHtml = actions
        .map(
          (action, index) =>
            `<button class="toast-action-btn" data-action-index="${index}">${action.text}</button>`,
        )
        .join("");
      return `<div class="island-content">
        <div class="toast-content">
          ${content}
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem;">
            ${actionsHtml}
          </div>
        </div>
      </div>`;
    },

    cookies: (customText) => {
      const defaultText =
        customText ||
        "<small>Este sitio utiliza cookies para mejorar tu experiencia</small>";
      return `<div class="island-content">
        <div class="toast-content">
          <div style="display: flex; align-items: center; gap: 1rem; width: 100%;">
            <span style="font-size: 1.8em;">🍪</span>
            <div style="flex: 1;">
              <strong>Usamos cookies</strong><br>
              ${defaultText}
            </div>
          </div>
        </div>
      </div>`;
    },
  };

  // ==========================================================================
  // CONSTRUCTOR
  // ==========================================================================
  constructor(initialConfig = {}) {
    this.config = initialConfig;
    this.container = null;
    this.island = null;
    this.islandContent = null;
    this.centerBtn = null;
    this.islandCloseBtn = null;
    this.contextBadge = null;
    this.lastScroll = 0;
    this.scrollTimeout = null;
    this.isFullscreen = false;
    this.escapeHandler = null;
    this.currentPreset = initialConfig.presetName || "default";

    this.init();
  }

  // ==========================================================================
  // INICIALIZACIÓN
  // ==========================================================================
  init() {
    this._findOrCreateElements();
    this.setupScrollDetection();
    this.setupEventListeners();

    if (this.island) {
      this.island.setAttribute("data-status", "tool-set");
    }

    this._handleStaticContent();

    if (this.config.htmlStructure && this.config.data) {
      this.hydrateIsland(this.config.htmlStructure, this.config.data);
    }
  }

  _findOrCreateElements() {
    this.container = document.querySelector(".dynamic-island-container");

    if (!this.container) {
      let placeholder = document.getElementById("dynamic-island-placeholder");

      if (!placeholder) {
        placeholder = document.createElement("div");
        placeholder.id = "dynamic-island-placeholder";
        document.body.appendChild(placeholder);
      }

      const containerDiv = document.createElement("div");
      containerDiv.className = "dynamic-island-container";
      containerDiv.innerHTML = DynamicIsland.presets.island_base;

      placeholder.appendChild(containerDiv);

      this.container = document.querySelector(".dynamic-island-container");
      this.island = document.querySelector(".dynamic-island");
      this.islandContent = document.querySelector(".island-content");
      this.centerBtn = document.querySelector(".center-content");
      this.islandCloseBtn = document.querySelector(
        ".dynamic-island .close-btn",
      );
      this.contextBadge = document.querySelector(".context-badge");
    }

    this.island = document.querySelector(".dynamic-island");

    if (!this.island) {
      this.islandContent = null;
    } else {
      this.islandContent = this.island.querySelector(".island-content");
    }

    if (this.island && !this.islandContent) {
      // .island-content not found
    }

    this.centerBtn = document.querySelector(".center-content");
    this.islandCloseBtn = document.querySelector(".dynamic-island .close-btn");
    this.contextBadge = document.querySelector(".context-badge");
  }

  _handleStaticContent() {
    if (
      this.islandContent &&
      this.islandContent.children &&
      this.islandContent.children.length > 0 &&
      !(this.config.htmlStructure && this.config.data)
    ) {
      try {
        const fallbackData = DynamicIsland.presets.search_menu_cart?.data || {};
        this._autoMapActions(fallbackData);
        this.config = { data: fallbackData };
        this.attachEventListeners(fallbackData);
      } catch (err) {
        // Error auto-mapping static DOM
      }
    }
  }

  _autoMapActions(data) {
    const keys = Object.keys(data);
    const candidates = Array.from(
      this.islandContent.querySelectorAll(
        "button, div, [role=button], .island-btn, .center-content",
      ),
    );

    keys.forEach((key, idx) => {
      const candidate = candidates[idx];
      if (!candidate) return;
      if (!candidate.getAttribute("data-action")) {
        candidate.setAttribute("data-action", key);
      }
    });
  }

  hydrateIsland(htmlStructure, data) {
    if (!this.islandContent) {
      // islandContent not found
      return;
    }

    const renderedHTML = renderTemplate(htmlStructure, data);

    // Limpiar TODOS los wrappers de island-content y toast-content anidados
    let cleanHTML = renderedHTML.trim();

    // Remover wrappers externos hasta llegar al contenido real
    while (true) {
      const beforeClean = cleanHTML;

      cleanHTML = cleanHTML.replace(/^<div class="island-content">\s*/, "");
      cleanHTML = cleanHTML.replace(/\s*<\/div>$/, "");
      cleanHTML = cleanHTML.replace(/^<div class="toast-content">\s*/, "");
      cleanHTML = cleanHTML.replace(/\s*<\/div>$/, "");

      if (cleanHTML === beforeClean) break;
    }

    this.islandContent.innerHTML = cleanHTML;
    this.centerBtn = this.island.querySelector(".center-content");

    this._intelligentActionMapping(data);
    this.attachEventListeners(data);
    this._setupCenterButtonHaptic();
    this._setupEscapeKey();
  }

  _intelligentActionMapping(data) {
    if (!data || typeof data !== "object") return;

    const keys = Object.keys(data);
    const candidates = Array.from(
      this.islandContent.querySelectorAll(
        "button, div, [role=button], .island-btn, .center-content",
      ),
    );

    keys.forEach((key) => {
      const item = data[key];
      if (!item) return;

      if (this.islandContent.querySelector(`[data-action="${key}"]`)) return;

      const name = (item.name || "").toString().trim();
      const icon = (item.icon || "").toString();

      for (const el of candidates) {
        const text = (el.textContent || "").trim();
        if (name && text && text.includes(name)) {
          el.setAttribute("data-action", key);
          return;
        }
        if (icon && el.innerHTML && el.innerHTML.includes(icon)) {
          el.setAttribute("data-action", key);
          return;
        }
      }

      if (keys.length === 3 && candidates.length >= 3) {
        const idx = keys.indexOf(key);
        const candidate = candidates[idx];
        if (candidate) {
          candidate.setAttribute("data-action", key);
        }
      }
    });
  }

  attachEventListeners(data) {
    if (!this.islandContent) {
      // islandContent not available
      return;
    }

    const nodes = this.islandContent.querySelectorAll("[data-action]");

    nodes.forEach((el) => {
      const action = el.getAttribute("data-action");
      const handler = data?.[action]?.function;

      if (!handler) {
        // no handler found for action
        return;
      }

      el.style.pointerEvents = "auto";
      el.style.cursor = "pointer";

      if (el.dataset.diListenerAttached === "true") {
        el.removeAttribute("data-di-listener-attached");
      }

      el.dataset.diListenerAttached = "true";

      el.addEventListener("click", (e) => {
        try {
          e.stopPropagation();
          e.preventDefault();
          this._addHapticFeedback();
          handler();
          this.createRipple(el);
        } catch (err) {
          // Error executing handler
        }
      });
    });
  }

  _setupCenterButtonHaptic() {
    if (this.centerBtn) {
      this.centerBtn.addEventListener("click", () => {
        this._addHapticFeedback();
      });
    }
  }

  _setupEscapeKey() {
    const escapeHandler = (e) => {
      if (e.key === "Escape" && this.isFullscreen && this.islandCloseBtn) {
        this.islandCloseBtn.click();
      }
    };

    if (this.escapeHandler) {
      document.removeEventListener("keydown", this.escapeHandler);
    }
    this.escapeHandler = escapeHandler;
    document.addEventListener("keydown", escapeHandler);
  }

  setupScrollDetection() {
    window.addEventListener("scroll", () => {
      if (!this.container || !this.island) return;

      // Don't show dynamic island if body is scroll-locked (overlays are open)
      if (typeof ScrollLock !== "undefined" && ScrollLock.isLocked()) {
        return;
      }

      const currentScroll = window.pageYOffset;
      clearTimeout(this.scrollTimeout);

      if (currentScroll > 200) {
        this.container.classList.add("visible");

        setTimeout(() => {
          if (!this.isFullscreen && this.island) {
            this.island.classList.remove("pill");
            this.island.classList.add("expanded");

            if (currentScroll > 300 && currentScroll < 600) {
              if (this.contextBadge) {
                this.contextBadge.classList.add("show");
                setTimeout(
                  () => this.contextBadge.classList.remove("show"),
                  2000,
                );
              }
            }
          }
        }, 300);

        this.scrollTimeout = setTimeout(() => {
          if (!this.isFullscreen && this.island) {
            this.island.classList.remove("expanded");
            this.island.classList.add("pill");
          }
        }, 2000);
      } else {
        this.container.classList.remove("visible");
        if (this.island) {
          this.island.classList.remove("expanded");
          this.island.classList.add("pill");
        }
      }

      this.lastScroll = currentScroll;
    });
  }

  setupEventListeners() {
    if (this.islandCloseBtn) {
      this.islandCloseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this._addHapticFeedback();
        if (this.island) {
          this.island.classList.remove("fullscreen");
          this.island.classList.add("expanded");
        }
        // Use iOS-compatible scroll unlock
        if (typeof ScrollLock !== "undefined") {
          ScrollLock.unlock();
        } else {
          document.body.style.overflow = "";
        }
        this.isFullscreen = false;
      });
    }

    if (this.island) {
      this.island.addEventListener("click", (e) => {
        if (
          this.isFullscreen &&
          e.target === this.island &&
          this.islandCloseBtn
        ) {
          this.islandCloseBtn.click();
        }
      });
    }

    this._setupEscapeKey();
  }

  showToast(html, data = {}, type = "3s") {
    if (!this.island || !this.islandContent) return;

    this.container.classList.add("visible");
    this.island.setAttribute("data-status", "toast");

    if (data.fullWidth) {
      this.island.classList.add("full-width");
    }

    // Solo guardar previous si no es un toast anidado
    if (
      !this.previousHtml ||
      this.island.getAttribute("data-status") !== "toast"
    ) {
      this.previousHtml = this.islandContent.innerHTML;
      this.previousData = this.config.data || {};
    }

    let toastStructure;
    const toastData = { ...data };

    if (
      data.actions &&
      Array.isArray(data.actions) &&
      data.actions.length > 0
    ) {
      toastStructure = DynamicIsland.toastTemplates.withActions(
        html,
        data.actions,
      );
      toastData.actions = data.actions;
    } else if (type === "persistent") {
      toastStructure = DynamicIsland.toastTemplates.persistent(html);
    } else {
      toastStructure = DynamicIsland.toastTemplates.simple(html);
    }

    this.hydrateIsland(toastStructure, toastData);

    if (data.actions) {
      this._attachToastActionHandlers(data.actions);

      setTimeout(() => {
        this._attachToastActionHandlers(data.actions);
      }, 100);
    }

    this._scheduleToastDismiss(type, data.duration);
  }

  _attachToastActionHandlers(actions) {
    if (!this.islandContent) {
      // islandContent not available for toast actions
      return;
    }

    const actionBtns = this.islandContent.querySelectorAll(".toast-action-btn");

    if (actionBtns.length === 0) {
      // No .toast-action-btn elements found
      return;
    }

    actionBtns.forEach((btn, index) => {
      const action = actions[index];

      if (!action) {
        // No action defined for button index
        return;
      }

      btn.style.pointerEvents = "auto";
      btn.style.cursor = "pointer";

      const handleClick = (e) => {
        e.stopPropagation();
        e.preventDefault();

        try {
          if (typeof action.onClick === "function") {
            action.onClick();
          } else {
            // action.onClick is not a function
          }

          // Restaurar contenido inmediatamente (el onClick puede mostrar otro toast después)
          this.restoreContent();
        } catch (err) {
          // Error executing toast action
        }
      };

      if (btn._diClickHandler) {
        btn.removeEventListener("click", btn._diClickHandler);
      }

      btn._diClickHandler = handleClick;
      btn.addEventListener("click", handleClick);
    });
  }

  _scheduleToastDismiss(type, customDuration) {
    let duration = 3000;
    if (type === "1s") duration = 1000;
    if (type === "3s") duration = 3000;
    if (customDuration) duration = customDuration;

    if (type !== "persistent" && duration) {
      setTimeout(() => this.restoreContent(), duration);
    }
  }

  restoreContent() {
    if (!this.island) return;

    this.island.setAttribute("data-status", "tool-set");
    this.island.classList.remove("full-width");

    if (this.previousHtml && this.previousData) {
      this.islandContent.innerHTML = this.previousHtml;
      this.islandContent = this.island.querySelector(".island-content");
      this.config.data = this.previousData;
      this.attachEventListeners(this.previousData);
    } else if (this.config.htmlStructure && this.config.data) {
      this.hydrateIsland(this.config.htmlStructure, this.config.data);
    } else {
      this.loadDefault();
    }
  }

  setDynamicIsland(content) {
    this.config = content;
    this.currentPreset = content.presetName || "custom";
    this.hydrateIsland(content.htmlStructure, content.data);
  }

  loadDefault() {
    const preset =
      DynamicIsland.presets.search_totop || DynamicIsland.presets.default;
    if (!preset) {
      return;
    }
    this.currentPreset = "search_totop";
    this.hydrateIsland(preset.getHtmlStructure(preset.data), preset.data);
  }

  _addHapticFeedback() {
    if (this.island) {
      this.island.classList.add("haptic");
      setTimeout(() => this.island.classList.remove("haptic"), 200);
    }
  }

  createRipple(btn) {
    const ripple = document.createElement("div");
    ripple.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      background: rgba(255,255,255,0.5);
      border-radius: inherit;
      pointer-events: none;
      animation: ripple 0.6s ease-out;
    `;
    btn.style.position = "relative";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }
}

// ============================================================================
// ESTILOS CSS
// ============================================================================
const rippleStyle = document.createElement("style");
rippleStyle.textContent = `
  @keyframes ripple {
    from {
      transform: scale(0);
      opacity: 1;
    }
    to {
      transform: scale(2);
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleStyle);

// ============================================================================
// VARIABLE GLOBAL PARA INSTANCIA
// ============================================================================
let dynamicIslandInstance;

// ============================================================================
// API PÚBLICA
// ============================================================================
function initDynamicIsland(initialConfig = {}) {
  dynamicIslandInstance = new DynamicIsland(initialConfig);
}

function setDynamicIsland(content) {
  const htmlStructure = content.getHtmlStructure
    ? content.getHtmlStructure(content.data)
    : content.htmlStructure;
  const data = content.data || content;

  if (dynamicIslandInstance) {
    dynamicIslandInstance.setDynamicIsland({ htmlStructure, data });
    return;
  }

  initDynamicIsland({ htmlStructure, data });
  setTimeout(() => {
    if (dynamicIslandInstance) {
      dynamicIslandInstance.setDynamicIsland({ htmlStructure, data });
    }
  }, 150);
}

function hydrateIsland(htmlStructure, data) {
  if (dynamicIslandInstance) {
    dynamicIslandInstance.hydrateIsland(htmlStructure, data);
  }
}

function showToast(html, data = {}, type = "3s") {
  if (dynamicIslandInstance) {
    if (typeof data === "number" && typeof type === "undefined") {
      const duration = data;
      const message = html;
      dynamicIslandInstance.showToast(message, { duration }, "3s");
    } else {
      dynamicIslandInstance.showToast(html, data, type);
    }
  }
}

function listIslandActions() {
  if (!dynamicIslandInstance) return [];
  const content = dynamicIslandInstance.islandContent;
  if (!content) return [];
  return Array.from(content.querySelectorAll("[data-action]")).map((el) => ({
    action: el.getAttribute("data-action"),
    text: el.innerText,
    hasHandler:
      !!dynamicIslandInstance.config?.data?.[el.getAttribute("data-action")],
  }));
}

function triggerIslandAction(action) {
  if (!dynamicIslandInstance) {
    // no instance available
    return;
  }
  const el = dynamicIslandInstance.islandContent.querySelector(
    `[data-action="${action}"]`,
  );
  if (!el) {
    // action element not found
    return;
  }
  el.click();
}

function loadPreset(presetName) {
  const preset = DynamicIsland.presets[presetName];
  if (preset) {
    const config = {
      ...preset,
      presetName: presetName,
    };
    setDynamicIsland(config);
  }
}

function showCookieConsent(customText, options = {}) {
  const {
    acceptText = "Aceptar todas",
    essentialText = "Solo necesarias",
    onAcceptAll,
    onEssentialOnly,
  } = options;

  showToast(
    DynamicIsland.toastTemplates
      .cookies(customText)
      .replace('<div class="island-content"><div class="toast-content">', "")
      .replace("</div></div>", ""),
    {
      fullWidth: true,
      actions: [
        {
          text: acceptText,
          onClick:
            onAcceptAll ||
            (() => {
              const consent = setCookieConsent({
                essential: true,
                analytics: true,
                marketing: true,
                functional: true,
              });
              loadScriptsForConsentedCategories(consent);
              // Cookie preferences saved
              setTimeout(() => {
                showToast(
                  "✅ Preferencias de cookies guardadas",
                  { duration: 3000 },
                  "3s",
                );

                // Ocultar el Dynamic Island después
                setTimeout(() => {
                  if (dynamicIslandInstance?.container) {
                    dynamicIslandInstance.container.classList.remove("visible");
                  }
                }, 3500);
              }, 100);
            }),
        },
        {
          text: essentialText,
          onClick:
            onEssentialOnly ||
            (() => {
              const consent = setCookieConsent({
                essential: true,
                analytics: false,
                marketing: false,
                functional: false,
              });
              loadScriptsForConsentedCategories(consent);
              // Cookie preferences saved
              setTimeout(() => {
                showToast(
                  "✅ Solo cookies esenciales activadas",
                  { duration: 3000 },
                  "3s",
                );

                setTimeout(() => {
                  if (dynamicIslandInstance?.container) {
                    dynamicIslandInstance.container.classList.remove("visible");
                  }
                }, 3500);
              }, 100);
            }),
        },
      ],
    },
    "persistent",
  );
}

function checkAndShowCookieConsent() {
  const consent = getCookieConsent();

  if (!consent) {
    setTimeout(() => {
      showCookieConsent();
    }, 2000);
  }
}

function initCookieConsentUI() {
  const consent = getCookieConsent();

  // Si ya hay consentimiento, cargar scripts y salir
  if (consent) {
    loadScriptsForConsentedCategories(consent);
    return;
  }

  // Si no hay, mostrar Dynamic Island
  checkAndShowCookieConsent();

  // Manejar clics en botones
  const buttons = document.querySelectorAll(".toast-action-btn");

  // Botón "Aceptar todas"
  if (buttons[0]) {
    buttons[0].addEventListener("click", () => {
      const consent = setCookieConsent({
        essential: true,
        analytics: true,
        marketing: true,
        functional: true,
      });
      loadScriptsForConsentedCategories(consent);
      // Cerrar toast + confirmación
    });
  }

  // Botón "Configurar/Solo esenciales"
  if (buttons[1]) {
    buttons[1].addEventListener("click", () => {
      const consent = setCookieConsent({
        essential: true,
        analytics: false,
        marketing: false,
        functional: false,
      });
      loadScriptsForConsentedCategories(consent);
      // Cerrar toast + confirmación
    });
  }
}

window.closeToast = function () {
  if (dynamicIslandInstance) {
    dynamicIslandInstance.restoreContent();
  }
};

// ============================================================================
// KLEF DYNAMIC ISLAND API (NAMESPACED)
// ============================================================================
window.Klef.DynamicIsland = {
  Class: DynamicIsland,
  instance: () => dynamicIslandInstance,

  presets: DynamicIsland.presets,
  toastTemplates: DynamicIsland.toastTemplates,

  init: initDynamicIsland,
  set: setDynamicIsland,
  hydrate: hydrateIsland,

  showToast,
  listActions: listIslandActions,
  trigger: triggerIslandAction,
  loadPreset,

  showCookieConsent,
  checkAndShowCookieConsent,
  initCookieConsentUI,
};

// ============================================================================
// AUTO-INICIALIZACIÓN
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  let initialized = false;

  const initOnScroll = () => {
    if (!initialized) {
      initialized = true;
      initDynamicIsland();
      // Descomentar para mostrar cookie consent automáticamente
      // checkAndShowCookieConsent();
      window.removeEventListener("scroll", initOnScroll);
    }
  };

  window.addEventListener("scroll", initOnScroll, { passive: true });
});

// Export the class
window.Klef.DynamicIsland.DynamicIsland = DynamicIsland;
