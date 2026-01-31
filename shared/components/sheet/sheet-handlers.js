/* ============================================
   SHEET SYSTEM - Event Handlers
   ============================================ */

const SheetHandlers = {
  // Inicializar todos los handlers para un sheet
  init(sheetElement) {
    if (!sheetElement) {
      console.warn("[SheetHandlers] No sheet element provided");
      return;
    }

    this.sheet = sheetElement;
    this.handleTopActions();
    this.handleDropdown();
    this.handleBottomActions();
    this.handleClose();
    this.handleDrag();

    return this;
  },

  // Manejar acciones de top controls
  handleTopActions() {
    const topBtns = this.sheet.querySelectorAll(".top-btn");
    topBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.dispatchEvent("sheet-top-action", {
          action: btn.dataset.action,
          element: btn,
        });
      });
    });
  },

  // Manejar dropdown
  handleDropdown() {
    const chevron = this.sheet.querySelector(".top-chevron");
    const dropdown = this.sheet.querySelector(".top-controls-dropdown");

    if (!chevron || !dropdown) return;

    // Toggle dropdown
    chevron.addEventListener("click", (e) => {
      e.stopPropagation();
      chevron.classList.toggle("expanded");
      dropdown.classList.toggle("active");
    });

    // Cerrar al hacer click fuera
    const closeDropdown = (e) => {
      const isClickInside =
        chevron.contains(e.target) || dropdown.contains(e.target);
      if (!isClickInside && dropdown.classList.contains("active")) {
        chevron.classList.remove("expanded");
        dropdown.classList.remove("active");
      }
    };

    document.addEventListener("click", closeDropdown);

    // Manejar items del dropdown
    dropdown.querySelectorAll("a, button").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const action = item.dataset.action;

        this.dispatchEvent("sheet-dropdown-action", {
          action: action,
          element: item,
        });

        // Cerrar dropdown
        chevron.classList.remove("expanded");
        dropdown.classList.remove("active");
      });
    });
  },

  // Manejar acciones de bottom controls
  handleBottomActions() {
    // Primary action
    const primary = this.sheet.querySelector(".btn-primary");
    if (primary) {
      primary.addEventListener("click", () => {
        this.dispatchEvent("sheet-primary-action", {
          action: primary.dataset.action,
          element: primary,
        });
      });
    }

    // Secondary action
    const secondary = this.sheet.querySelector(".btn-secondary");
    if (secondary) {
      secondary.addEventListener("click", () => {
        this.dispatchEvent("sheet-secondary-action", {
          action: secondary.dataset.action,
          element: secondary,
        });
      });
    }

    // More actions
    const more = this.sheet.querySelector(".btn-more");
    if (more) {
      more.addEventListener("click", () => {
        this.dispatchEvent("sheet-more-options", {
          action: more.dataset.action,
          element: more,
        });
      });
    }
  },

  // Manejar botón de cerrar
  handleClose() {
    const closeBtn = this.sheet.querySelector(".close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.dispatchEvent("sheet-close", {});
      });
    }
  },

  // Manejar drag para cerrar (mobile)
  handleDrag() {
    const dragHandle = this.sheet.querySelector(".drag-handle");
    if (!dragHandle) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const isMobile = () => window.innerWidth < 768;

    const handleStart = (e) => {
      if (!isMobile()) return;
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      isDragging = true;
    };

    const handleMove = (e) => {
      if (!isDragging || !isMobile()) return;
      currentY = e.touches ? e.touches[0].clientY : e.clientY;
      const deltaY = currentY - startY;

      if (deltaY > 0) {
        this.sheet.style.transform = `translateY(${deltaY}px)`;
      }
    };

    const handleEnd = () => {
      if (!isDragging || !isMobile()) return;
      isDragging = false;
      this.sheet.style.transform = "";

      const deltaY = currentY - startY;
      if (deltaY > 100) {
        this.dispatchEvent("sheet-close", {});
      }
    };

    // Touch events - marked as passive for better scroll performance
    dragHandle.addEventListener("touchstart", handleStart, { passive: true });
    dragHandle.addEventListener("touchmove", handleMove, { passive: true });
    dragHandle.addEventListener("touchend", handleEnd, { passive: true });

    // Mouse events for testing
    dragHandle.addEventListener("mousedown", handleStart);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
  },

  // Dispatch custom event
  dispatchEvent(name, detail) {
    this.sheet.dispatchEvent(
      new CustomEvent(name, {
        detail: detail,
        bubbles: true,
      }),
    );
  },
};
