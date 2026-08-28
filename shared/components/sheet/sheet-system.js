/* ============================================
   SHEET SYSTEM - Main Entry Point
   ============================================ */

(function () {
  "use strict";

  // ============================================
  // SHEET SYSTEM CLASS
  // ============================================
  class SheetSystem {
    constructor() {
      this.sheet = null;
      this.backdrop = null;
      this.isOpen = false;
      this.handlers = null;
    }

    // Inicializar el sistema
    init() {
      if (this.initialized) return this;

      this.sheet = document.getElementById("bottomsheet");
      this.backdrop = document.getElementById("backdrop");

      if (!this.sheet || !this.backdrop) {
        // Sheet elements not found in DOM
        return this;
      }

      // Feature 2: Close sheet when pressing Escape
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen) {
          this.close();
        }
      });

      // Feature 3: Close sheet when clicking on backdrop
      this.backdrop.addEventListener("click", () => {
        if (this.isOpen) {
          this.close();
        }
      });

      this.initialized = true;
      return this;
    }

    // Cargar configuración y renderizar
    load(config) {
      if (!this.sheet) {
        // Sheet not initialized
        return this;
      }

      // Validar configuración
      this.validateConfig(config);

      // Mostrar loading
      this.showLoading();

      // Renderizar estructura
      this.render(config);

      // Inicializar handlers
      this.handlers = window.SheetHandlers.init(this.sheet);

      // Escuchar evento de cerrar
      this.sheet.addEventListener("sheet-close", () => this.close());

      // Abrir sheet
      this.open();

      return this;
    }

    // Validar configuración
    validateConfig(config) {
      if (!config) {
        throw new Error("[SheetSystem] Config is required");
      }
      if (!config.content) {
        throw new Error("[SheetSystem] Config must have content");
      }
      return true;
    }

    // Renderizar sheet completo
    render(config) {
      const html = window.SheetTemplates.renderSheet(config);
      this.sheet.innerHTML = html;
      return this;
    }

    // Mostrar estado de carga
    showLoading(message) {
      if (!this.sheet) return this;

      this.sheet.innerHTML = window.SheetTemplates.renderSheet({
        topControls: { actions: [], moreActions: { enabled: false } },
        content: { html: window.SheetTemplates.renderLoading(message) },
        bottomControls: { primary: null, moreActions: { enabled: false } },
      });

      return this;
    }

    // Abrir sheet
    open() {
      if (!this.sheet || !this.backdrop) return this;

      // Feature 1: Hide Dynamic Island when opening sheet
      if (typeof hideDynamicIsland === "function") {
        hideDynamicIsland();
      }

      this.sheet.classList.add("open");
      this.backdrop.classList.add("visible");
      this.isOpen = true;
      // Use iOS-compatible scroll lock
      if (typeof ScrollLock !== "undefined") {
        ScrollLock.lock();
      } else {
        document.body.style.overflow = "hidden";
      }

      return this;
    }

    // Cerrar sheet
    close() {
      if (!this.sheet || !this.backdrop) return this;

      this.sheet.classList.remove("open", "full");
      this.backdrop.classList.remove("visible");
      this.isOpen = false;
      // Use iOS-compatible scroll unlock
      if (typeof ScrollLock !== "undefined") {
        ScrollLock.unlock();
      } else {
        document.body.style.overflow = "";
      }

      return this;
    }

    // Alternar sheet
    toggle() {
      return this.isOpen ? this.close() : this.open();
    }

    // Actualizar top controls
    updateTopControls(config) {
      if (!this.sheet) return this;

      const topControls = this.sheet.querySelector(".sheet-top-controls");
      if (topControls) {
        topControls.innerHTML = window.SheetTemplates.renderTopControls(config);
      }

      // Reinicializar handlers para los nuevos elementos
      if (this.handlers) {
        this.handlers.handleTopActions();
        this.handlers.handleDropdown();
      }

      return this;
    }

    // Actualizar contenido
    updateContent(config) {
      if (!this.sheet) return this;

      const contentZone = this.sheet.querySelector("#sheet-content");
      if (contentZone) {
        contentZone.innerHTML = window.ContentRenderer.render(config);
      }

      return this;
    }

    // Actualizar bottom controls
    updateBottomControls(config) {
      if (!this.sheet) return this;

      const bottomControls = this.sheet.querySelector(".sheet-bottom-controls");
      if (bottomControls) {
        bottomControls.innerHTML = window.SheetTemplates.renderBottomControls(config);
      }

      // Reinicializar handlers para los nuevos elementos
      if (this.handlers) {
        this.handlers.handleBottomActions();
      }

      return this;
    }

    // Obtener estado
    getState() {
      return {
        isOpen: this.isOpen,
        isFull: this.sheet?.classList.contains("full") || false,
      };
    }

    // Alternar modo fullscreen
    toggleFull() {
      if (!this.sheet) return this;

      this.sheet.classList.toggle("full");
      return this;
    }
  }

  // ============================================
  // INSTANCIA GLOBAL
  // ============================================
  const sheetSystem = new SheetSystem();

  // Inicialización automática solo si no existe ya un sistema de sheets
  const autoInit = window.adaptiveSheet === undefined;
  if (autoInit) {
    sheetSystem.init();
  } else {
    // AdaptiveSheet detected, using deferred initialization
  }

  // ============================================
  // API PÚBLICA
  // ============================================
  window.sheetSystem = sheetSystem;

  // Función principal loadSheet(config)
  window.loadSheet = function (config) {
    // Ensure sheetSystem is initialized before loading
    if (!sheetSystem.sheet) {
      sheetSystem.init();
    }
    return sheetSystem.load(config);
  };

  // Funciones de conveniencia
  window.openSheet = function (config) {
    if (config) {
      return sheetSystem.load(config);
    }
    return sheetSystem.open();
  };

  window.closeSheet = function () {
    return sheetSystem.close();
  };

  window.toggleSheet = function (config) {
    if (config) {
      return sheetSystem.load(config);
    }
    return sheetSystem.toggle();
  };

  // ============================================
  // UTILIDADES
  // ============================================
  window.sheetUtils = {
    // Crear config para portfolio detail
    createPortfolioConfig(data, actions) {
      return {
        topControls: {
          actions: actions?.top || [],
          moreActions: actions?.more
            ? {
                enabled: true,
                actions: actions.more,
              }
            : { enabled: false },
        },
        content: {
          type: "portfolio-detail",
          data: data,
        },
        bottomControls: {
          primary: actions?.primary,
          secondary: actions?.secondary,
          moreActions: actions?.bottomMore
            ? { enabled: true }
            : { enabled: false },
        },
      };
    },

    // The global contact sheet intentionally contains direct contact options.
    // Keep this separate from portfolio sheets so a generic form cannot return.
    createContactSheetConfig() {
      const contactHtml = `
        <div class="contact-sheet-content">
          <div class="contact-cta-section">
            <h3>¿Listo para comenzar?</h3>
            <p>Elige la forma más cómoda de iniciar la conversación.</p>
            <div class="contact-options">
              <a href="tel:+526245161037" class="contact-option phone">
                <span>Atención al cliente</span>
              </a>
              <a href="https://wa.me/526245161037" class="contact-option whatsapp" target="_blank" rel="noopener">
                <span>WhatsApp</span>
              </a>
              <a href="mailto:info@klef.agency" class="contact-option email">
                <span>info@klef.agency</span>
              </a>
              <a href="tel:+526241682048" class="contact-option phone">
                <span>Soporte técnico</span>
              </a>
            </div>
          </div>
          <div class="social-section">
            <h4>Síguenos</h4>
            <div class="social-links">
              <a href="https://www.instagram.com/klef.agency/" target="_blank" rel="noopener" aria-label="Instagram">Instagram</a>
              <a href="https://www.facebook.com/klef.agency/" target="_blank" rel="noopener" aria-label="Facebook">Facebook</a>
              <a href="https://www.youtube.com/channel/UCYFT6kwbsDzbiK6OjuKWM5w" target="_blank" rel="noopener" aria-label="YouTube">YouTube</a>
            </div>
          </div>
        </div>
      `;

      return {
        topControls: {
          actions: [],
          moreActions: { enabled: false },
        },
        content: {
          type: "html",
          data: { html: contactHtml },
        },
        bottomControls: {
          primary: null,
          moreActions: { enabled: false },
        },
      };
    },

    // Crear config simple con HTML
    createHtmlConfig(html, actions = {}) {
      return {
        topControls: {
          actions: actions.top || [],
          moreActions: actions.more
            ? { enabled: true, actions: actions.more }
            : { enabled: false },
        },
        content: {
          type: "html",
          data: { html: html },
        },
        bottomControls: {
          primary: actions.primary,
          secondary: actions.secondary,
          moreActions: actions.bottomMore
            ? { enabled: true }
            : { enabled: false },
        },
      };
    },
  };
})();
