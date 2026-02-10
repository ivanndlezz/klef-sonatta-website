/**
 * global-setup.js
 * Configuración unificada para carga optimizada de todos los elementos básicos
 */

export const global_setup = {
  version: "1.1.0",
  lastUpdated: "2026-02-10",

  sets: {
    // 0. Favicons (Cargados dinámicamente en el head)
    favicons: {
      priority: 0,
      onComplete: function () {
        console.log("[BasicsLoader] Loading favicons");
        const faviconLinks = [
          {
            rel: "icon",
            href: "assets/images/favicons/favicon-32x32.png",
            sizes: "32x32",
          },
          {
            rel: "icon",
            href: "assets/images/favicons/favicon-192x192.png",
            sizes: "192x192",
          },
          {
            rel: "apple-touch-icon",
            href: "assets/images/favicons/favicon-180x180.png",
          },
        ];

        faviconLinks.forEach((attrs) => {
          const link = document.createElement("link");
          Object.keys(attrs).forEach((key) =>
            link.setAttribute(key, attrs[key]),
          );
          document.head.appendChild(link);
        });

        // MS Tile Image
        const meta = document.createElement("meta");
        meta.name = "msapplication-TileImage";
        meta.content = "assets/images/favicons/favicon-270x270.png";
        document.head.appendChild(meta);
      },
      conditions: { alwaysLoad: true },
    },

    // 1. Iconos SVG
    icons: {
      priority: 1,
      source: {
        file: "shared/utilities/icon-loader/svg-load.js",
        function: "loadSVGIcons",
      },
      domTarget: "#icon-set",
      conditions: { alwaysLoad: true },
    },

    // 2. Navegación Principal
    navigation: {
      priority: 2,
      dependsOn: ["icons"],
      components: [
        {
          id: "mobile-topbar",
          selector: ".mobile-topbar",
          html: `
            <div class="mobile-topbar">
              <div data-logo="klef-logo-mobile">
                <a id="logo" href="/" class="no-image">
                  <img src="assets/images/favicons/klef-logo.png" alt="Logo" width="30" height="30" />
                  Klef Agency
                </a>
              </div>
              <button class="close-btn toggle-menu" data-action="toggle-menu">Menu</button>
            </div>
          `,
        },
        {
          id: "mega-topbar",
          selector: ".mega-topbar",
          html: `
            <div class="mega-topbar">
              <button class="back-btn" data-action="go-back">Volver</button>
              <button class="close-btn" data-action="close-menu">Cerrar</button>
            </div>
          `,
        },
        {
          id: "main-nav",
          selector: "nav#main-nav",
          html: `
            <nav class="navbar" id="main-nav">
              <div data-logo="klef-logo-desktop">
                <a id="logo" href="/" class="no-image">
                  <img src="assets/images/favicons/klef-logo.png" alt="Klef Logo" width="30" height="30" />
                  Klef Agency
                </a>
              </div>
              <div class="menu-links">
                <a href="#" data-mega="#Diseno" data-name="#Diseno">Diseño y Media</a>
                <a href="#" data-mega="#Tecnologia" data-name="#Tecnologia">Tecnología</a>
                <a href="#" data-mega="#Marketing" data-name="#Marketing">Marketing</a>
              </div>
              <div class="right-menu">
                <button class="btn-icon" data-action="open-search">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="--wh: 20px; width: var(--wh); height: var(--wh)"><use href="#icon-search"></use></svg>
                </button>
                <button class="btn-icon" data-action="open-contact-sheet">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><use href="#phone"></use></svg>
                  <div class="vertical-line"></div>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><use href="#squircle-message"></use></svg>
                </button>
              </div>
            </nav>
          `,
        },
      ],
      styles: ["shared/components/mega-menu/mega-menu.css"],
      scripts: [
        "assets/scripts/scroll-lock.js",
        "shared/components/navigation/navigation-system.js",
      ],
      conditions: { alwaysLoad: true },
    },

    // 3. Mega Menús (Ahora se carga con la navegación, no lazy)
    megaMenus: {
      priority: 3,
      dependsOn: ["navigation"],
      container: {
        selector: ".mega-menus-container",
        html: `<div class="mega-menus-container"></div>`,
      },
      // Insertamos el HTML de los menús aquí
      html: `
        <!-- Diseño y Media -->
        <div class="mega-menu" id="Diseno">
          <div class="mega-content">
            <div class="mega-sidebar">
              <div class="mega-sidebar-title">Diseño y Media</div>
              <a href="#" aria-label="Ver proyectos de Branding">
                <span>Branding</span>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
              <a href="#" aria-label="Ver proyectos de Studio Multimedia">
                <span>Studio Multimedia</span>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
              <a href="#" aria-label="Ver proyectos de Publicidad">
                <span>Publicidad</span>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
            </div>
            <div class="mega-main">
              <div class="mega-featured">
                <div class="featured-image">🎨</div>
                <div class="featured-content">
                  <div class="featured-tag">By Klef•Brand</div>
                  <h3>Branding</h3>
                  <p>Descubre las marcas que hemos desarrollado y nuestras estrategias de diseño</p>
                  <a href="#" class="btn-primary">Ir a Brands</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tecnología -->
        <div class="mega-menu" id="Tecnologia">
          <div class="mega-content">
            <div class="mega-sidebar">
              <div class="mega-sidebar-title">Tecnología</div>
              <a href="#" aria-label="Ver proyectos de Desarrollo Web">
                <span>Desarrollo Web</span>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
              <a href="#" aria-label="Ver proyectos de Apps Móviles">
                <span>Apps Móviles</span>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
              <a href="#" aria-label="Ver proyectos de E-commerce">
                <span>E-commerce</span>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
            </div>
            <div class="mega-main">
              <div class="mega-featured">
                <div class="featured-image" style="background: linear-gradient(135deg, #c0e8ff, #a3c7ff)">💻</div>
                <div class="featured-content">
                  <div class="featured-tag">By Klef•Tech</div>
                  <h3>Desarrollo Web</h3>
                  <p>Soluciones tecnológicas modernas y escalables para tu negocio</p>
                  <a href="#" class="btn-primary">Ver Proyectos</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Marketing -->
        <div class="mega-menu" id="Marketing">
          <div class="mega-content">
            <div class="mega-sidebar">
              <div class="mega-sidebar-title">Marketing</div>
              <a href="#" aria-label="Ver proyectos de Social Media">
                <span>Social Media</span>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
              <a href="#" aria-label="Ver estrategias SEO/SEM">
                <span>SEO/SEM</span>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
              <a href="#" aria-label="Ver estrategias de Content Strategy">
                <span>Content Strategy</span>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
            </div>
            <div class="mega-main">
              <div class="mega-featured">
                <div class="featured-image" style="background: linear-gradient(135deg, #d4f1d4, #a3e6a3)">📊</div>
                <div class="featured-content">
                  <div class="featured-tag">By Klef•Marketing</div>
                  <h3>Marketing Digital</h3>
                  <p>Estrategias data-driven para impulsar tu presencia online</p>
                  <a href="#" class="btn-primary">Conocer Más</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
      styles: ["shared/components/mega-menu/mega-menu.css"],
      scripts: ["shared/components/mega-menu/mega-menu.js"],
      conditions: { alwaysLoad: true },
    },

    // 4. Sistema de Hojas (Bottomsheet / Side sheets)
    sheets: {
      priority: 4,
      html: `
        <div id="backdrop"></div>
        <div id="bottomsheet">
          <div class="drag-handle"></div>
          <div class="sheet-top-controls">
            <div id="sheet-header"></div>
            <button class="close-btn" id="close-btn">×</button>
          </div>
          <div id="sheet-content"></div>
          <div class="sheet-bottom-controls"></div>
        </div>
      `,
      styles: ["shared/components/sheet/sheet.css"],
      scripts: [
        "shared/components/sheet/sheet-templates.js",
        "shared/components/sheet/sheet-content.js",
        "shared/components/sheet/sheet-handlers.js",
        "shared/components/sheet/sheet-system.js",
      ],
      conditions: { alwaysLoad: true },
    },

    // 5. Búsqueda (Search Overlay)
    search: {
      priority: 5,
      html: `
        <div class="search-overlay" id="searchOverlay">
          <div class="search-panel">
            <button class="close-search" onclick="closeSearch()">×</button>
            <div class="search-content">
              <div class="search-input-wrapper">
                <input type="text" class="search-input" id="searchInput" placeholder="Buscar...">
              </div>
              
              <div class="quick-suggestions" id="quickSuggestions" style="display: block;">
                <div class="suggestions-grid">
                  <div class="suggestion-section">
                    <div class="suggestion-title">Sugerencias</div>
                    <ul class="suggestion-list">
                      <li><a href="#" class="suggestion-link" onclick="searchFor('portfolio'); return false;">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                          </svg>
                          Portfolio
                        </a></li>
                      <li><a href="#" class="suggestion-link" onclick="searchFor('servicios'); return false;">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                          </svg>
                          Servicios
                        </a></li>
                      <li><a href="#" class="suggestion-link" onclick="searchFor('contacto'); return false;">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                          </svg>
                          Contacto
                        </a></li>
                    </ul>
                  </div>
                  <div class="suggestion-section">
                    <div class="suggestion-title">Búsquedas recientes</div>
                    <ul class="suggestion-list" id="recentSearches">
                      <li><a href="#" data-action="search-term" data-term="branding"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>branding</a></li>
                      <li><a href="#" data-action="search-term" data-term="desarrollo"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>desarrollo</a></li>
                      <li><a href="#" data-action="search-term" data-term="marketing"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>marketing</a></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div id="resultsContainer"></div>
            </div>
          </div>
        </div>
      `,
      styles: ["shared/components/search/search-filter.css"],
      scripts: [
        "shared/components/search/query-parser.js",
        "shared/components/search/filter-config.js",
        "shared/components/search/search-system.js",
        "shared/components/search/search-tags-filter.js",
      ],
      conditions: { alwaysLoad: true },
    },

    // 6. Cookies y Dynamic Island
    cookiesAndIsland: {
      priority: 6,
      dependsOn: ["icons", "search"],
      scripts: [
        "shared/utilities/cookies/cookies.js",
        "shared/utilities/cookies/cookie-consent.js",
        "shared/components/dynamic-island/dynamic-island.js",
      ],
      styles: ["shared/components/dynamic-island/dynamic-island.css"],
      onComplete: function () {
        console.log("[BasicsLoader] Initializing Cookies and Dynamic Island");
        if (typeof initCookieConsentUI === "function") {
          initCookieConsentUI();
        }
        if (typeof initDynamicIsland === "function") {
          initDynamicIsland();
        }
      },
      conditions: { alwaysLoad: true },
    },

    // 7. Footer
    footer: {
      priority: 7,
      styles: ["shared/components/footer/footer.css"],
      onComplete: async function () {
        console.log("[BasicsLoader] Loading footer");
        // Importar el HTML del footer dinámicamente
        const { footerHTML } = await import("../footer/footer-loader.js");
        // Insertar el footer al final del body
        document.body.insertAdjacentHTML("beforeend", footerHTML);
      },
      conditions: { alwaysLoad: true },
    },
  },

  // === ORDEN DE CARGA ===
  loadOrder: [
    { step: 0, set: "favicons", strategy: "blocking" },
    { step: 1, set: "icons", strategy: "blocking" },
    { step: 2, set: "navigation", strategy: "blocking" },
    { step: 3, set: "megaMenus", strategy: "blocking" },
    { step: 4, set: "sheets", strategy: "blocking" },
    { step: 5, set: "search", strategy: "blocking" },
    { step: 6, set: "cookiesAndIsland", strategy: "blocking" },
    { step: 7, set: "footer", strategy: "blocking" },
  ],
};
