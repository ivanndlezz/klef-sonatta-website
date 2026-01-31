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
      this.sheet = document.getElementById("bottomsheet");
      this.backdrop = document.getElementById("backdrop");

      if (!this.sheet || !this.backdrop) {
        console.warn("[SheetSystem] Sheet elements not found in DOM");
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

      console.log("[SheetSystem] Initialized");
      return this;
    }

    // Cargar configuración y renderizar
    load(config) {
      if (!this.sheet) {
        console.error("[SheetSystem] Sheet not initialized");
        return this;
      }

      // Validar configuración
      this.validateConfig(config);

      // Mostrar loading
      this.showLoading();

      // Renderizar estructura
      this.render(config);

      // Inicializar handlers
      this.handlers = SheetHandlers.init(this.sheet);

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
      const html = SheetTemplates.renderSheet(config);
      this.sheet.innerHTML = html;
      return this;
    }

    // Mostrar estado de carga
    showLoading(message) {
      if (!this.sheet) return this;

      this.sheet.innerHTML = SheetTemplates.renderSheet({
        topControls: { actions: [], moreActions: { enabled: false } },
        content: { html: SheetTemplates.renderLoading(message) },
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
      document.body.style.overflow = "hidden";

      return this;
    }

    // Cerrar sheet
    close() {
      if (!this.sheet || !this.backdrop) return this;

      this.sheet.classList.remove("open", "full");
      this.backdrop.classList.remove("visible");
      this.isOpen = false;
      document.body.style.overflow = "";

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
        topControls.innerHTML = SheetTemplates.renderTopControls(config);
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
        contentZone.innerHTML = ContentRenderer.render(config);
      }

      return this;
    }

    // Actualizar bottom controls
    updateBottomControls(config) {
      if (!this.sheet) return this;

      const bottomControls = this.sheet.querySelector(".sheet-bottom-controls");
      if (bottomControls) {
        bottomControls.innerHTML = SheetTemplates.renderBottomControls(config);
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
  sheetSystem.init();

  // ============================================
  // API PÚBLICA
  // ============================================
  window.sheetSystem = sheetSystem;

  // Función principal loadSheet(config)
  window.loadSheet = function (config) {
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

    // Crear config para formulario de contacto
    createContactConfig(subject, primaryAction) {
      return {
        topControls: {
          actions: [],
          moreActions: { enabled: false },
        },
        content: {
          type: "contact-form",
          data: { subject: subject },
        },
        bottomControls: {
          primary: primaryAction || { label: "Enviar", action: "submit-form" },
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

  console.log("[SheetSystem] Loaded and ready");
})();
