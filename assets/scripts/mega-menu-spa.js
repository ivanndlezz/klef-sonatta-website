// Configuración de menús
const MENU_CONFIG = {
  el: {
    nav: "#main-nav",
    barraTop: ".mega-topbar",
    btnVolver: ".back-btn",
    btnCerrar: ".close-btn",
    botones: "a[data-name]",
    submenus: ".mega-menu",
  },
  viewport: {
    movil: 768,
  },
};

// Estado del menú
let currentMegaMenu = null;
let navigationStack = [];
let dynamicStyle = null;

// Variables globales para el componente
let navbar, megaTopbar, backBtn, closeBtn, megaBtns, megaMenus;

// Función de inicialización
function initMegaMenu() {
  // Referencias a elementos del DOM
  navbar = document.querySelector(MENU_CONFIG.el.nav);
  megaTopbar = document.querySelector(MENU_CONFIG.el.barraTop);
  backBtn = document.querySelector(MENU_CONFIG.el.btnVolver);
  closeBtn = document.querySelector(MENU_CONFIG.el.btnCerrar);
  megaBtns = document.querySelectorAll(MENU_CONFIG.el.botones);
  megaMenus = document.querySelectorAll(MENU_CONFIG.el.submenus);

  if (!navbar) {
    console.error("Navbar not found");
    return;
  }

  // Event listeners para mobile
  megaBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (window.innerWidth <= MENU_CONFIG.viewport.movil) {
        e.preventDefault();
        const selector = btn.dataset.mega;
        if (selector) openMegaMenu(selector);
      }
    });
  });

  // Event listeners para desktop hover
  megaBtns.forEach((btn) => {
    btn.addEventListener("mouseenter", (e) => {
      if (window.innerWidth > MENU_CONFIG.viewport.movil) {
        const value = e.currentTarget.dataset.name;
        if (navbar) navbar.dataset.mega = value;
        applyDynamicStyle(value);
      }
    });
  });

  // Cerrar mega menús al salir con el mouse en desktop
  document.addEventListener("mousemove", (e) => {
    if (window.innerWidth > MENU_CONFIG.viewport.movil) {
      const overNavbar = navbar && navbar.contains(e.target);
      const overMega = Array.from(megaMenus).some((menu) =>
        menu.contains(e.target)
      );
      if (!overNavbar && !overMega) removeDynamicStyle();
    }
  });

  // Cerrar menú al cambiar tamaño a desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > MENU_CONFIG.viewport.movil) closeMenu();
  });
}

// Función para toggle del menú móvil
function toggleMenu() {
  const isOpen = navbar.classList.toggle("mobile-open");
  if (isOpen) {
    ScrollLock.lock();
  } else {
    ScrollLock.unlock();
  }
}

// Función para cerrar completamente el menú
function closeMenu() {
  if (navbar) navbar.classList.remove("mobile-open");
  if (megaTopbar) megaTopbar.classList.remove("active");
  if (backBtn) backBtn.classList.remove("visible");
  ScrollLock.unlock();
  megaMenus.forEach((menu) => menu.classList.remove("active"));
  currentMegaMenu = null;
  navigationStack = [];
  removeDynamicStyle();
}

// Función para retroceder en navegación móvil
function goBack() {
  if (currentMegaMenu) currentMegaMenu.classList.remove("active");
  currentMegaMenu = null;
  navigationStack = [];
  if (megaTopbar) megaTopbar.classList.remove("active");
  if (backBtn) backBtn.classList.remove("visible");
}

// Función para abrir un mega menú desde data-mega
function openMegaMenu(selector) {
  const menu = document.querySelector(selector);
  if (!menu) return console.error(`No se encontró el mega menú: ${selector}`);
  megaMenus.forEach((m) => m.classList.remove("active"));
  navigationStack = [selector];
  currentMegaMenu = menu;
  menu.classList.add("active");
  if (megaTopbar) megaTopbar.classList.add("active");
  if (backBtn) backBtn.classList.add("visible");
}

// Función para crear y aplicar estilo dinámico en hover desktop
function applyDynamicStyle(value) {
  removeDynamicStyle();
  dynamicStyle = document.createElement("style");
  dynamicStyle.dataset.origin = "mega-menu-runtime";
  dynamicStyle.textContent = `
    @media (min-width: ${MENU_CONFIG.viewport.movil + 1}px) {
      [data-mega*="${value}"]:hover + .mega-menus-container ${value},
      [data-mega*="${value}"] + .mega-menus-container ${value}:hover {
        display: flex;
        flex-direction: column;
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

// Llamar a la inicialización cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  // Esperar un poco para que los componentes se carguen
  setTimeout(initMegaMenu, 100);
});
