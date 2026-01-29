/**
 * K-PRO | Mega Menu System v4.0 (Optimized with Web Components)
 */

class MegaMenuSystem extends HTMLElement {
  constructor() {
    super();
    
    // Configuración
    this.config = {
      selectors: {
        nav: "#main-nav",
        barraTop: ".mega-topbar",
        btnVolver: ".back-btn",
        btnCerrar: ".close-btn",
        botones: "a[data-name]",
        submenus: ".mega-menu",
      },
      viewport: {
        mobile: 768,
      },
      debounceDelay: 150,
    };

    // Estado
    this.state = {
      currentMegaMenu: null,
      navigationStack: [],
      dynamicStyle: null,
      isMobile: window.innerWidth <= this.config.viewport.mobile,
    };

    // Referencias DOM (se inicializarán después)
    this.elements = {};

    // Bind methods
    this.handleResize = this.debounce(this.onResize.bind(this), this.config.debounceDelay);
    this.handleMouseMove = this.onMouseMove.bind(this);
    this.handleButtonClick = this.onButtonClick.bind(this);
    this.handleButtonHover = this.onButtonHover.bind(this);
  }

  connectedCallback() {
    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  disconnectedCallback() {
    this.cleanup();
  }

  init() {
    this.cacheElements();
    
    if (!this.elements.navbar) {
      console.error('[MegaMenu] Navbar no encontrado');
      return;
    }

    this.setupEventListeners();
    this.setupIntersectionObserver();
    this.updateMobileState();
  }

  cacheElements() {
    this.elements = {
      navbar: document.querySelector(this.config.selectors.nav),
      megaTopbar: document.querySelector(this.config.selectors.barraTop),
      backBtn: document.querySelector(this.config.selectors.btnVolver),
      closeBtn: document.querySelector(this.config.selectors.btnCerrar),
      megaBtns: document.querySelectorAll(this.config.selectors.botones),
      megaMenus: document.querySelectorAll(this.config.selectors.submenus),
    };
  }

  setupEventListeners() {
    // Mobile click handlers
    this.elements.megaBtns.forEach((btn) => {
      btn.addEventListener('click', this.handleButtonClick);
      btn.addEventListener('mouseenter', this.handleButtonHover);
    });

    // Desktop mouse movement
    document.addEventListener('mousemove', this.handleMouseMove);

    // Resize handler con debounce
    window.addEventListener('resize', this.handleResize);

    // Botones de navegación
    if (this.elements.backBtn) {
      this.elements.backBtn.addEventListener('click', () => this.goBack());
    }

    if (this.elements.closeBtn) {
      this.elements.closeBtn.addEventListener('click', () => this.closeMenu());
    }
  }

  setupIntersectionObserver() {
    // Observar visibilidad de mega menús para optimizar animaciones
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          entry.target.classList.remove('is-visible');
        }
      });
    }, options);

    // Observar cada mega menú
    this.elements.megaMenus.forEach((menu) => {
      this.observer.observe(menu);
    });
  }

  onButtonClick(e) {
    if (!this.state.isMobile) return;
    
    e.preventDefault();
    const selector = e.currentTarget.dataset.mega;
    if (selector) this.openMegaMenu(selector);
  }

  onButtonHover(e) {
    if (this.state.isMobile) return;
    
    const value = e.currentTarget.dataset.name;
    if (this.elements.navbar) {
      this.elements.navbar.dataset.mega = value;
    }
    this.applyDynamicStyle(value);
  }

  onMouseMove(e) {
    if (this.state.isMobile) return;

    const overNavbar = this.elements.navbar?.contains(e.target);
    const overMega = Array.from(this.elements.megaMenus).some((menu) =>
      menu.contains(e.target)
    );

    if (!overNavbar && !overMega) {
      this.removeDynamicStyle();
    }
  }

  onResize() {
    const wasMobile = this.state.isMobile;
    this.updateMobileState();

    // Si cambió de mobile a desktop o viceversa
    if (wasMobile !== this.state.isMobile) {
      this.closeMenu();
    }
  }

  updateMobileState() {
    this.state.isMobile = window.innerWidth <= this.config.viewport.mobile;
  }

  toggleMenu() {
    const isOpen = this.elements.navbar.classList.toggle('mobile-open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
    
    if (!isOpen) {
      this.closeMenu();
    }
  }

  closeMenu() {
    if (this.elements.navbar) {
      this.elements.navbar.classList.remove('mobile-open');
    }
    
    if (this.elements.megaTopbar) {
      this.elements.megaTopbar.classList.remove('active');
    }
    
    if (this.elements.backBtn) {
      this.elements.backBtn.classList.remove('visible');
    }

    document.body.style.overflow = '';
    
    this.elements.megaMenus.forEach((menu) => {
      menu.classList.remove('active');
    });

    this.state.currentMegaMenu = null;
    this.state.navigationStack = [];
    this.removeDynamicStyle();
  }

  goBack() {
    if (this.state.currentMegaMenu) {
      this.state.currentMegaMenu.classList.remove('active');
    }

    this.state.currentMegaMenu = null;
    this.state.navigationStack = [];

    if (this.elements.megaTopbar) {
      this.elements.megaTopbar.classList.remove('active');
    }

    if (this.elements.backBtn) {
      this.elements.backBtn.classList.remove('visible');
    }
  }

  openMegaMenu(selector) {
    const menu = document.querySelector(selector);
    
    if (!menu) {
      console.error(`[MegaMenu] No se encontró el mega menú: ${selector}`);
      return;
    }

    // Cerrar otros menús
    this.elements.megaMenus.forEach((m) => {
      if (m !== menu) m.classList.remove('active');
    });

    this.state.navigationStack = [selector];
    this.state.currentMegaMenu = menu;
    
    menu.classList.add('active');

    if (this.elements.megaTopbar) {
      this.elements.megaTopbar.classList.add('active');
    }

    if (this.elements.backBtn) {
      this.elements.backBtn.classList.add('visible');
    }
  }

  applyDynamicStyle(value) {
    this.removeDynamicStyle();

    this.state.dynamicStyle = document.createElement('style');
    this.state.dynamicStyle.dataset.origin = 'mega-menu-runtime';
    this.state.dynamicStyle.textContent = `
      @media (min-width: ${this.config.viewport.mobile + 1}px) {
        [data-mega*="${value}"]:hover + .mega-menus-container ${value},
        [data-mega*="${value}"] + .mega-menus-container ${value}:hover {
          display: flex;
          flex-direction: column;
        }
      }
    `;
    
    document.head.appendChild(this.state.dynamicStyle);
  }

  removeDynamicStyle() {
    if (this.state.dynamicStyle) {
      this.state.dynamicStyle.remove();
      this.state.dynamicStyle = null;
    }
  }

  // Utilidad: Debounce
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  cleanup() {
    // Remover event listeners
    this.elements.megaBtns?.forEach((btn) => {
      btn.removeEventListener('click', this.handleButtonClick);
      btn.removeEventListener('mouseenter', this.handleButtonHover);
    });

    document.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('resize', this.handleResize);

    // Desconectar observer
    if (this.observer) {
      this.observer.disconnect();
    }

    // Limpiar estilos dinámicos
    this.removeDynamicStyle();

    // Restaurar scroll
    document.body.style.overflow = '';
  }
}

// Registrar el Web Component
customElements.define('mega-menu-system', MegaMenuSystem);

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
  // Crear instancia si no existe
  if (!document.querySelector('mega-menu-system')) {
    const megaMenuSystem = document.createElement('mega-menu-system');
    document.body.appendChild(megaMenuSystem);
  }
});

// Exportar para uso modular (opcional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MegaMenuSystem;
}