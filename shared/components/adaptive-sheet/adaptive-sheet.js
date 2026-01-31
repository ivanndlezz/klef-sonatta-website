// ============================================================================
// ADAPTIVE SHEET SYSTEM - Shared Component for Portfolio & Detail Pages
// ============================================================================

(function () {
  "use strict";

  // ============================================
  // ADAPTIVE SHEET CONTROLLER
  // ============================================
  class AdaptiveSheet {
    constructor() {
      this.sheet = document.getElementById("bottomsheet");
      this.backdrop = document.getElementById("backdrop");
      this.closeBtn = document.getElementById("close-btn");
      this.topControls = document.querySelector(".sheet-top-controls");
      this.content = document.getElementById("sheet-content");
      this.state = "CLOSED";

      this.startY = 0;
      this.currentY = 0;
      this.isDragging = false;
    }

    init() {
      if (!this.sheet || !this.backdrop) {
        console.warn("⚠️ Adaptive Sheet elements not found");
        return;
      }

      // Drag handle for mobile
      const dragHandle = this.sheet.querySelector(".drag-handle");
      if (dragHandle) {
        dragHandle.addEventListener(
          "touchstart",
          this.handleTouchStart.bind(this),
        );
        dragHandle.addEventListener(
          "touchmove",
          this.handleTouchMove.bind(this),
        );
        dragHandle.addEventListener("touchend", this.handleTouchEnd.bind(this));
        // Mouse support for drag
        dragHandle.addEventListener(
          "mousedown",
          this.handleMouseDown.bind(this),
        );
      }

      // Close button
      if (this.closeBtn) {
        this.closeBtn.addEventListener("click", () => this.close());
      }

      // Backdrop click
      this.backdrop.addEventListener("click", () => this.close());

      // Escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.state !== "CLOSED") {
          this.close();
        }
      });

      // Window resize
      window.addEventListener("resize", () => {
        if (this.state !== "CLOSED") {
          this.adjustForViewport();
        }
      });

      // Top controls buttons
      this.initTopControls();

      // Bottom controls buttons
      this.initBottomControls();

      console.log("✅ Adaptive Sheet initialized");
    }

    initTopControls() {
      // Chevron for showing dropdown menu
      const chevronBtn = this.sheet.querySelector(".top-chevron");
      const dropdown = this.sheet.querySelector(".top-controls-dropdown");

      if (chevronBtn && dropdown) {
        chevronBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          chevronBtn.classList.toggle("expanded");
          dropdown.classList.toggle("active");
        });
      }

      // Close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (dropdown && dropdown.classList.contains("active")) {
          const isClickInside =
            chevronBtn.contains(e.target) || dropdown.contains(e.target);
          if (!isClickInside) {
            chevronBtn.classList.remove("expanded");
            dropdown.classList.remove("active");
          }
        }
      });

      // Handle dropdown menu item clicks
      const dropdownItems = this.sheet.querySelectorAll(
        ".top-controls-dropdown a, .top-controls-dropdown button",
      );
      dropdownItems.forEach((item) => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          const action = item.dataset.action;
          console.log(`🎯 Dropdown action clicked: ${action}`);
          this.sheet.dispatchEvent(
            new CustomEvent("sheet-dropdown-action", {
              detail: { action, element: item },
            }),
          );
          // Close dropdown after click
          if (dropdown) {
            chevronBtn.classList.remove("expanded");
            dropdown.classList.remove("active");
          }
        });
      });

      // Top action buttons
      const topBtns = this.sheet.querySelectorAll(".top-btn");
      topBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const action = btn.dataset.action;
          console.log(`🎯 Top action clicked: ${action}`);
          // Custom event for handling top actions
          this.sheet.dispatchEvent(
            new CustomEvent("sheet-top-action", {
              detail: { action, element: btn },
            }),
          );
        });
      });
    }

    initBottomControls() {
      // Primary action button
      const primaryBtn = this.sheet.querySelector(".btn-primary");
      if (primaryBtn) {
        primaryBtn.addEventListener("click", (e) => {
          const action = primaryBtn.dataset.action;
          console.log(`🎯 Primary action clicked: ${action}`);
          this.sheet.dispatchEvent(
            new CustomEvent("sheet-primary-action", {
              detail: { action, element: primaryBtn },
            }),
          );
        });
      }

      // Secondary action button
      const secondaryBtn = this.sheet.querySelector(".btn-secondary");
      if (secondaryBtn) {
        secondaryBtn.addEventListener("click", (e) => {
          const action = secondaryBtn.dataset.action;
          console.log(`🎯 Secondary action clicked: ${action}`);
          this.sheet.dispatchEvent(
            new CustomEvent("sheet-secondary-action", {
              detail: { action, element: secondaryBtn },
            }),
          );
        });
      }

      // More options button
      const moreBtn = this.sheet.querySelector(".btn-more");
      if (moreBtn) {
        moreBtn.addEventListener("click", (e) => {
          const action = moreBtn.dataset.action;
          console.log(`🎯 More options clicked: ${action}`);
          this.sheet.dispatchEvent(
            new CustomEvent("sheet-more-options", {
              detail: { action, element: moreBtn },
            }),
          );
        });
      }
    }

    handleMouseDown(e) {
      if (!this.isMobile()) return;
      this.startY = e.clientY;
      this.isDragging = true;
      document.addEventListener("mousemove", this.handleMouseMove.bind(this));
      document.addEventListener("mouseup", this.handleMouseUp.bind(this));
    }

    handleMouseMove(e) {
      if (!this.isDragging || !this.isMobile()) return;
      this.currentY = e.clientY;
      const deltaY = this.currentY - this.startY;

      if (deltaY > 0 && this.state === "NORMAL") {
        this.sheet.style.transform = `translateY(${deltaY}px)`;
      } else if (deltaY < 0 && this.state === "NORMAL") {
        this.sheet.style.transform = `translateY(${deltaY}px)`;
      }
    }

    handleMouseUp(e) {
      if (!this.isDragging || !this.isMobile()) return;
      const deltaY = this.currentY - this.startY;
      this.isDragging = false;
      this.sheet.style.transform = "";
      document.removeEventListener(
        "mousemove",
        this.handleMouseMove.bind(this),
      );
      document.removeEventListener("mouseup", this.handleMouseUp.bind(this));

      if (deltaY > 100 && this.state === "NORMAL") {
        this.close();
      } else if (deltaY < -100 && this.state === "NORMAL") {
        this.setState("FULL");
      }
    }

    isMobile() {
      return window.innerWidth < 768;
    }

    open() {
      this.sheet.classList.add("open");
      this.backdrop.classList.add("visible");
      this.state = "NORMAL";
      document.body.style.overflow = "hidden";
    }

    close() {
      this.sheet.classList.remove("open", "full");
      this.backdrop.classList.remove("visible");
      this.state = "CLOSED";
      document.body.style.overflow = "";
    }

    setState(state) {
      if (state === "FULL") {
        this.sheet.classList.add("full");
        this.state = "FULL";
      } else {
        this.sheet.classList.remove("full");
        this.state = "NORMAL";
      }
    }

    toggleFull() {
      if (this.state === "FULL") {
        this.setState("NORMAL");
      } else {
        this.setState("FULL");
      }
    }

    adjustForViewport() {
      if (!this.isMobile() && this.state === "FULL") {
        this.setState("FULL");
      }
    }

    handleTouchStart(e) {
      if (!this.isMobile()) return;
      this.startY = e.touches[0].clientY;
      this.isDragging = true;
    }

    handleTouchMove(e) {
      if (!this.isDragging || !this.isMobile()) return;

      this.currentY = e.touches[0].clientY;
      const deltaY = this.currentY - this.startY;

      if (deltaY > 0 && this.state === "NORMAL") {
        this.sheet.style.transform = `translateY(${deltaY}px)`;
      } else if (deltaY < 0 && this.state === "NORMAL") {
        this.sheet.style.transform = `translateY(${deltaY}px)`;
      }
    }

    handleTouchEnd(e) {
      if (!this.isDragging || !this.isMobile()) return;

      const deltaY = this.currentY - this.startY;
      this.isDragging = false;
      this.sheet.style.transform = "";

      if (deltaY > 100 && this.state === "NORMAL") {
        this.close();
      } else if (deltaY < -100 && this.state === "NORMAL") {
        this.setState("FULL");
      }
    }
  }

  // ============================================
  // COMPONENT LOADER
  // ============================================
  class ComponentLoader {
    constructor(targetId, componentLibrary = {}) {
      this.loadzone = document.getElementById(targetId);
      this.contentZone = document.getElementById("sheet-content");
      this.bottomControls = document.querySelector(".sheet-bottom-controls");
      this.nameZone = document.getElementById("component-name");
      this.componentLibrary = componentLibrary;
    }

    setLibrary(library) {
      this.componentLibrary = library;
    }

    async load(componentName, props = {}) {
      const component = this.componentLibrary[componentName];

      if (!component) {
        console.error(`❌ Component "${componentName}" not found`);
        return;
      }

      // Mostrar loading
      if (this.contentZone) {
        this.contentZone.innerHTML = `
                  <div class="loading">
                      <div class="spinner"></div>
                      <p>Cargando ${component.name}...</p>
                  </div>
              `;
      }

      // Simular delay de carga
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Inyectar contenido
      const result = component.render(props);

      // El componente puede retornar { content: '...', cta: '...' } o solo HTML string
      if (typeof result === "object" && result.content) {
        if (this.contentZone) {
          this.contentZone.innerHTML = result.content;
        }
        // Update bottom controls with component's CTA
        if (result.cta && this.bottomControls) {
          // Inject custom CTA HTML into bottom controls
          this.bottomControls.innerHTML = result.cta;
        }
      } else {
        // Retrocompatibilidad: si solo retorna string, usar loadzone
        if (this.loadzone) {
          this.loadzone.innerHTML = result;
        }
      }

      // Ejecutar inicializador si existe
      if (component.init && typeof component.init === "function") {
        component.init(this.contentZone || this.loadzone, props);
      }

      // Abrir el sheet
      if (window.adaptiveSheet) {
        window.adaptiveSheet.open();
      }
    }

    clear() {
      if (this.contentZone) {
        this.contentZone.innerHTML = "";
      }
      if (this.loadzone) {
        this.loadzone.innerHTML = "";
      }
      if (this.ctaZone) {
        this.ctaZone.innerHTML = "";
        this.ctaZone.style.display = "none";
      }
    }
  }

  // ============================================
  // AUTO-BIND: Sistema de emparejamiento automático
  // ============================================
  function bindComponentTriggers() {
    const triggers = document.querySelectorAll("[data-component]");

    console.log(`✅ Found ${triggers.length} component triggers`);

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();

        const componentName = trigger.getAttribute("data-component");

        // Obtener todos los data-attributes como props
        const props = {};
        Array.from(trigger.attributes).forEach((attr) => {
          if (attr.name.startsWith("data-") && attr.name !== "data-component") {
            // Convertir data-project-name -> projectName
            const propName = attr.name
              .replace("data-", "")
              .replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            props[propName] = attr.value;
          }
        });

        console.log(`🚀 Loading component: ${componentName}`, props);

        // Cargar el componente
        if (window.componentLoader) {
          window.componentLoader.load(componentName, props);
        }
      });
    });
  }

  // ============================================
  // INICIALIZACIÓN Y EXPORTACIÓN
  // ============================================
  function initAdaptiveSheet(componentLibrary = {}) {
    const adaptiveSheet = new AdaptiveSheet();
    const componentLoader = new ComponentLoader("loadzone", componentLibrary);

    adaptiveSheet.init();
    bindComponentTriggers();

    // Exponer globalmente
    window.adaptiveSheet = adaptiveSheet;
    window.componentLoader = componentLoader;

    console.log("✅ Adaptive Sheet System inicializado");
    console.log(
      '🎯 Usa data-component="nombre" en cualquier botón para vincularlo',
    );

    return { adaptiveSheet, componentLoader };
  }

  // Exportar función de inicialización
  window.initAdaptiveSheet = initAdaptiveSheet;
})();
