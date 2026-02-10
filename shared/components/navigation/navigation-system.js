// ============================================================================
// NAVIGATION SYSTEM - Mega Menu and Mobile Navigation
// ============================================================================

(function () {
  "use strict";

  // Referencias DOM
  let navbar, megaTopbar, backBtn, megaMenusContainer;
  let currentMegaMenu = null;
  let dynamicStyle = null;

  // Funciones de navegación
  function toggleMenu() {
    if (!navbar) {
      navbar = document.getElementById("main-nav");
    }
    if (!navbar) return;

    const isOpen = navbar.classList.toggle("mobile-open");
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

    // Ocultar Dynamic Island si está visible
    if (typeof hideDynamicIsland === "function") {
      hideDynamicIsland();
    }
  }

  function openMegaMenu(selector) {
    if (!megaMenusContainer) {
      megaMenusContainer = document.querySelector(".mega-menus-container");
    }
    if (!megaTopbar) {
      megaTopbar = document.querySelector(".mega-topbar");
    }
    if (!backBtn) {
      backBtn = document.querySelector(".back-btn");
    }

    const menu = document.querySelector(selector);
    if (!menu) {
      console.error("No se encontró el mega menú:", selector);
      return;
    }

    // Cerrar todos los mega menus
    document
      .querySelectorAll(".mega-menu")
      .forEach((m) => m.classList.remove("active"));

    // Mostrar el contenedor y el menú seleccionado
    if (megaMenusContainer) {
      megaMenusContainer.classList.add("show");
    }
    menu.classList.add("active");

    currentMegaMenu = menu;

    // El mega-topbar es SOLO para mobile
    // En desktop, el mega menu se muestra directamente debajo del navbar
    if (window.innerWidth <= 768) {
      if (megaTopbar) {
        megaTopbar.classList.add("active");
      }
      if (backBtn) backBtn.classList.add("visible");
    }
  }

  function goBack() {
    if (currentMegaMenu) {
      currentMegaMenu.classList.remove("active");
    }

    if (megaMenusContainer) megaMenusContainer.classList.remove("show");
    currentMegaMenu = null;

    // El mega-topbar es SOLO para mobile
    if (window.innerWidth <= 768) {
      if (megaTopbar) megaTopbar.classList.remove("active");
      if (backBtn) backBtn.classList.remove("visible");
    }
  }

  function closeMenu() {
    if (!navbar) {
      navbar = document.getElementById("main-nav");
    }
    if (!megaMenusContainer) {
      megaMenusContainer = document.querySelector(".mega-menus-container");
    }
    if (!megaTopbar) {
      megaTopbar = document.querySelector(".mega-topbar");
    }
    if (!backBtn) {
      backBtn = document.querySelector(".back-btn");
    }

    if (navbar) navbar.classList.remove("mobile-open");
    if (megaMenusContainer) megaMenusContainer.classList.remove("show");
    if (megaTopbar) megaTopbar.classList.remove("active");
    if (backBtn) backBtn.classList.remove("visible");
    // Use iOS-compatible scroll unlock
    if (typeof ScrollLock !== "undefined") {
      ScrollLock.unlock();
    } else {
      document.body.style.overflow = "";
    }

    document
      .querySelectorAll(".mega-menu")
      .forEach((menu) => menu.classList.remove("active"));
    currentMegaMenu = null;
    removeDynamicStyle();
  }

  // Estilo dinámico para hover desktop
  function applyDynamicStyle(value) {
    removeDynamicStyle();
    dynamicStyle = document.createElement("style");
    dynamicStyle.dataset.origin = "mega-menu-runtime";
    dynamicStyle.textContent = `
            @media (min-width: 769px) {
                [data-mega*="${value}"]:hover + .mega-menus-container ${value},
                [data-mega*="${value}"] + .mega-menus-container ${value}:hover {
                    display: block;
                }
            }
        `;
    document.head.appendChild(dynamicStyle);
  }

  function removeDynamicStyle() {
    if (dynamicStyle) {
      dynamicStyle.remove();
      dynamicStyle = null;
    }
  }

  // Inicializar event listeners
  function initNavigationListeners() {
    if (window.navigationInitialized) return;
    window.navigationInitialized = true;

    navbar = document.getElementById("main-nav");
    megaTopbar = document.querySelector(".mega-topbar");
    backBtn = document.querySelector(".back-btn");
    megaMenusContainer = document.querySelector(".mega-menus-container");

    // Reemplazar onclick inline con event listeners usando data-action
    document.querySelectorAll('[data-action="toggle-menu"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
      });
    });

    document.querySelectorAll('[data-action="go-back"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        goBack();
      });
    });

    document.querySelectorAll('[data-action="close-menu"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        closeMenu();
      });
    });

    // Contact Sheet trigger
    document
      .querySelectorAll('[data-action="open-contact-sheet"]')
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          if (
            typeof loadSheet === "function" &&
            typeof sheetUtils !== "undefined"
          ) {
            loadSheet(sheetUtils.createContactConfig("General Inquiry"));
          } else {
            console.warn("[Navigation] loadSheet or sheetUtils not found");
          }
        });
      });

    // Click en items con mega menú (móvil)
    document.querySelectorAll("[data-mega]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          const selector = btn.getAttribute("data-mega");
          if (selector) {
            openMegaMenu(selector);
          }
        }
      });

      // Hover en desktop
      btn.addEventListener("mouseenter", (e) => {
        if (window.innerWidth > 768) {
          const selector = btn.getAttribute("data-mega");
          if (selector) {
            openMegaMenu(selector);
          }
        }
      });
    });

    // Cerrar mega menús al salir con el mouse en desktop
    document.addEventListener("mousemove", (e) => {
      if (window.innerWidth > 768) {
        // En desktop, el mega-topbar NO debería estar activo
        if (megaTopbar && megaTopbar.classList.contains("active")) {
          megaTopbar.classList.remove("active");
        }
        if (backBtn) backBtn.classList.remove("visible");

        if (!megaMenusContainer) {
          megaMenusContainer = document.querySelector(".mega-menus-container");
        }

        const overNavbar = navbar && navbar.contains(e.target);
        const overMega =
          megaMenusContainer && megaMenusContainer.contains(e.target);

        if (!overNavbar && !overMega) {
          // Solo cerrar el mega menu, NO el navbar
          if (currentMegaMenu) {
            currentMegaMenu.classList.remove("active");
          }
          if (megaMenusContainer) {
            megaMenusContainer.classList.remove("show");
          }
          currentMegaMenu = null;
        }
      }
    });

    // Cerrar con ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const searchOverlay = document.getElementById("searchOverlay");
        if (searchOverlay && searchOverlay.classList.contains("active")) {
          if (typeof closeSearch === "function") {
            closeSearch();
          }
        } else if (navbar && navbar.classList.contains("mobile-open")) {
          closeMenu();
        } else {
          removeDynamicStyle();
        }
      }
    });

    // Cerrar al hacer clic en overlay oscuro
    document.body.addEventListener("click", (e) => {
      if (
        e.target === document.body &&
        navbar &&
        navbar.classList.contains("mobile-open")
      ) {
        closeMenu();
      }
    });

    // Cerrar menú al cambiar a desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });
  }

  // Exportar funciones al scope global para compatibilidad
  window.toggleMenu = toggleMenu;
  window.goBack = goBack;
  window.closeMenu = closeMenu;
  window.openMegaMenu = openMegaMenu;
  window.applyDynamicStyle = applyDynamicStyle;
  window.removeDynamicStyle = removeDynamicStyle;

  // Inicializar cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavigationListeners);
  } else {
    initNavigationListeners();
  }
})();
