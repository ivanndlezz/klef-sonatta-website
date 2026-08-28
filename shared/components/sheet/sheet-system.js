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
      const legacyContactHtml = `
        <div class="contact-sheet-content">
          <div class="contact-cta-section">
            <h3>¿Listo para comenzar?</h3>
            <div class="contact-options">
              <a href="tel:+526245161037" class="contact-option phone">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span>Atención al cliente</span>
              </a>

              <a href="https://wa.me/526241682048" class="contact-option phone">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31.826-2.37-2.37a1.724 1.724 0 001.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543-.826-2.37 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>Soporte técnico</span>
              </a>

              <a href="mailto:info@klef.agency" class="contact-option email">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span>info@klef.agency</span>
              </a>

              <a href="https://wa.me/526245161037" class="contact-option whatsapp" target="_blank" rel="noopener">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/>
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
          <div class="social-section">
            <h4>Síguenos</h4>
            <div class="social-links">
              <a href="https://www.instagram.com/klef.agency/" target="_blank" rel="noopener" aria-label="Instagram">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 3.668-.014.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://www.facebook.com/klef.agency/" target="_blank" rel="noopener" aria-label="Facebook">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
              <a href="https://www.youtube.com/channel/UCYFT6kwbsDzbiK6OjuKWM5w" target="_blank" rel="noopener" aria-label="YouTube">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.872.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      `;

      const contactHtml =
        typeof window !== "undefined" &&
        typeof window.KlefContactMarkup === "function"
          ? window.KlefContactMarkup()
          : legacyContactHtml;

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
