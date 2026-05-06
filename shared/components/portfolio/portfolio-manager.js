/**
 * Portfolio Manager - GraphQL Data Layer
 *
 * Responsable de obtener y gestionar los datos del portfolio desde WordPress WPGraphQL.
 * Implementa caching, manejo de errores y estrategia de fetch dual (posts + tags).
 *
 * @author Kilo
 * @since 2026
 */

(function () {
  "use strict";

  // ============================================
  // CONFIGURACIÓN
  // ============================================
  const CONFIG = {
    GRAPHQL_ENDPOINT: "https://klef.newfacecards.com/graphql",
    CACHE_KEY: "portfolio_cache_v2", // v2: extract sanitizado
    CACHE_TTL: 5 * 60 * 1000, // 5 minutos
    MIN_SEARCH_LENGTH: 2,
  };

  // ============================================
  // ESTADO
  // ============================================
  let portfolioCache = null;
  let isLoading = false;
  let error = null;

  // ============================================
  // TIPOS DE DATOS
  // ============================================
  /**
   * Estructura esperada de un item de portfolio:
   * {
   *   id: string,
   *   slug: string,
   *   discipline: 'brands' | 'dev' | 'studio' | 'strategy',
   *   category: string[],
   *   title: [string, string], // [nombre proyecto, tipo]
   *   client_name: string,
   *   client_industry: string,
   *   extract: string,
   *   cover_image: string,
   *   logo: string
   * }
   */

  // ============================================
  // QUERY GRAPHQL OPTIMIZADA
  // ============================================
  const PORTFOLIO_QUERY = `
    query GetPortfolioCards {
      posts(first: 20, where: { categoryName: "Portfolio" }) {
        nodes {
          id
          title
          slug
          excerpt
          date
          featuredImage {
            node {
              sourceUrl
              altText
              mediaDetails {
                width
                height
              }
            }
          }
          categories {
            nodes {
              name
              slug
            }
          }
          tags {
            nodes {
              name
              slug
            }
          }
          author {
            node {
              name
            }
          }
        }
      }
    }
  `;

  // ============================================
  // FETCH Y CACHÉ
  // ============================================

  /**
   * Obtiene datos desde GraphQL con cacheo en sessionStorage
   */
  async function fetchPortfolioData(forceRefresh = false) {
    // Verificar cache primero
    if (!forceRefresh) {
      const cached = sessionStorage.getItem(CONFIG.CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const timestamp = parsed.timestamp;
          if (Date.now() - timestamp < CONFIG.CACHE_TTL) {
            console.log("[PortfolioManager] Cache hit");
            portfolioCache = parsed.data;
            return parsed.data;
          }
        } catch (e) {
          console.warn("[PortfolioManager] Cache parse error:", e);
        }
      }
    }

    // Fetch desde GraphQL
    console.log("[PortfolioManager] Fetching from GraphQL...");
    isLoading = true;
    error = null;

    try {
      const response = await fetch(CONFIG.GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: PORTFOLIO_QUERY,
          variables: {},
        }),
      });

      if (!response.ok) {
        throw new Error(`GraphQL error: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();

      if (json.errors) {
        throw new Error(json.errors[0].message);
      }

      // Mapear datos de WordPress a nuestro modelo de UI
      const mappedData = mapWordPressData(json.data.posts.nodes);

      // Guardar en caché
      sessionStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify({
        data: mappedData,
        timestamp: Date.now(),
      }));

      portfolioCache = mappedData;
      isLoading = false;
      return mappedData;

    } catch (err) {
      error = err;
      isLoading = false;
      console.error("[PortfolioManager] Fetch error:", err);

      // Fallback a datos hardcodeados si hay error
      return getFallbackData();
    }
  }

  /**
   * Mapea nodos de WordPress a formato de UI
   */
  function mapWordPressData(nodes) {
    return nodes.map((node, index) => {
      // Determinar disciplina desde categorías
      const discipline = inferDiscipline(node);
      const categories = extractCategories(node);
      const titlePair = parseTitle(node.title, discipline);

      // Extraer featured image
      const featuredImage = node.featuredImage?.node;
      const coverImage = featuredImage?.sourceUrl || getPlaceholderImage(index);

      // Extraer logo (de ACF o fallback)
      const logoUrl = node.portfolioFields?.clientLogo?.node?.sourceUrl
        || featuredImage?.sourceUrl
        || coverImage;

       return {
         id: node.id,
         slug: node.slug,
         discipline: discipline,
         category: categories,
         content_type: "Portfolio", // Siempre es Portfolio
         title: titlePair, // [nombre proyecto, tipo]
         client_name: stripHtml(node.portfolioFields?.clientName || node.author?.node?.name || "Klef"),
         client_industry: stripHtml(node.portfolioFields?.clientIndustry || "Agencia de Marketing Digital"),
         extract: node.excerpt ? stripHtml(node.excerpt) : stripHtml(node.title || ""),
         cover_image: coverImage,
         logo: logoUrl,
         project_url: node.portfolioFields?.projectUrl || node.portfolioFields?.liveUrl || null,
         // Campos extra para futuro uso
         _raw: node, // Guardar nodo completo por si se necesitan más campos
       };
    });
  }

  /**
   * Infiere la disciplina basada en categorías
   */
  function inferDiscipline(node) {
    const categories = node.categories?.nodes || [];
    const categoryNames = categories.map(c => c.name.toLowerCase());

    if (categoryNames.some(name => name.includes('brand') || name.includes('diseño'))) {
      return 'brands';
    }
    if (categoryNames.some(name => name.includes('web') || name.includes('desarrollo') || name.includes('dev'))) {
      return 'dev';
    }
    if (categoryNames.some(name => name.includes('studio') || name.includes('multimedia') || name.includes('video'))) {
      return 'studio';
    }
    if (categoryNames.some(name => name.includes('marketing') || name.includes('strategy') || name.includes('estrategia'))) {
      return 'strategy';
    }

    // Default: Brands
    return 'brands';
  }

  /**
   * Extrae array de strings de categorías
   */
  function extractCategories(node) {
    return node.categories?.nodes?.map(c => c.name) || [];
  }

  /**
   * Parsea el título en [nombre, tipo]
   * Ej: "Hello Dish | Identidad" → ["Hello Dish", "Identidad"]
   */
  function parseTitle(title, discipline) {
    if (!title) return ["Sin título", discipline];

    // Si el título contiene "|", dividirlo
    if (title.includes("|")) {
      const parts = title.split("|").map(p => p.trim());
      return [parts[0], parts.slice(1).join(" | ") || discipline];
    }

    // Si no, usar título completo + disciplina
    return [title, discipline];
  }

  /**
   * Elimina tags HTML de un string
   */
  function stripHtml(html) {
    if (typeof html !== 'string') return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  /**
   * Imagen de placeholder si no hay featuredImage
   */
  function getPlaceholderImage(index) {
    const colors = ['#8e44ad', '#2980b9', '#16a085', '#db4b10'];
    // Data URI de un placeholder de 300x300
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='${encodeURIComponent(colors[index % colors.length])}' width='300' height='300'/%3E%3Ctext fill='%23fff' font-family='sans-serif' font-size='48' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E${index + 1}%3C/text%3E%3Crect fill='none' stroke='%23fff' stroke-width='2' x='20' y='20' width='260' height='260' rx='16'/%3E%3C/svg%3E`;
  }

  /**
   * Datos de fallback hardcodeados (por si GraphQL falla)
   */
  function getFallbackData() {
    console.warn("[PortfolioManager] Using fallback hardcoded data");
    return [
      {
        id: "001-fallback",
        slug: "hello-dish",
        discipline: "brands",
        category: ["manual-de-marca", "branding"],
        content_type: "Portfolio",
        title: ["Hello Dish", "Identidad"],
        client_name: "Hello Dish",
        client_industry: "Restaurantes",
        extract: "La convergencia entre lo análogo y lo digital nos da lugar a Hello Dish.",
        cover_image: "../../../assets/images/portfolio/hello-dish-portfolio-card.jpg",
        logo: "../../../assets/images/portfolio/logos/hello-dish-logo.jpg",
        _fallback: true,
      },
      // ... más items si se necesitan
    ];
  }

  // ============================================
  // API PÚBLICA
  // ============================================

  const PortfolioManager = {
    /**
     * Inicializa el manager y obtiene los datos
     */
    async init(forceRefresh = false) {
      try {
        const data = await fetchPortfolioData(forceRefresh);
        this.dispatchReadyEvent(data);
        return data;
      } catch (err) {
        this.dispatchErrorEvent(err);
        throw err;
      }
    },

    /**
     * Obtiene todos los items (desde cache si está disponible)
     * Retorna una promesa que se resuelve con los datos
     */
    getAll() {
      // Si ya hay datos en cache, retornar inmediatamente
      if (portfolioCache) {
        return Promise.resolve(portfolioCache);
      }

      // Si ya está cargando, esperar a que termine
      if (isLoading) {
        return new Promise((resolve) => {
          const interval = setInterval(() => {
            if (portfolioCache) {
              clearInterval(interval);
              resolve(portfolioCache);
            }
          }, 50);
        });
      }

      // Si no está cargando, iniciar la carga
      return this.init();
    },

    /**
     * Obtiene un item por ID (comparación como string para compatibilidad)
     */
    getById(id) {
      const idStr = String(id);
      return this.getAll().then(items =>
        items.find(item => String(item.id) === idStr)
      );
    },

    /**
     * Obtiene un item por slug
     */
    getBySlug(slug) {
      return this.getAll().then(items => items.find(item => item.slug === slug));
    },

    /**
     * Filtra items por disciplina
     */
    getByDiscipline(discipline) {
      return this.getAll().then(items =>
        items.filter(item => item.discipline === discipline)
      );
    },

    /**
     * Limpia el cache
     */
    clearCache() {
      portfolioCache = null;
      sessionStorage.removeItem(CONFIG.CACHE_KEY);
      console.log("[PortfolioManager] Cache cleared");
    },

    /**
     * Fuerza refresco desde servidor
     */
    async refresh() {
      this.clearCache();
      return this.init(true);
    },

    /**
     * Estado actual
     */
    getState() {
      return {
        isLoading,
        error,
        cached: !!portfolioCache,
        count: portfolioCache ? portfolioCache.length : 0,
      };
    },

    // ============================================
    // EVENTOS
    // ============================================

    dispatchReadyEvent(data) {
      window.dispatchEvent(new CustomEvent("portfolioReady", {
        detail: { data, timestamp: Date.now() }
      }));
    },

    dispatchErrorEvent(error) {
      window.dispatchEvent(new CustomEvent("portfolioError", {
        detail: { error, timestamp: Date.now() }
      }));
    }
  };

  // ============================================
  // EXPORTACIÓN GLOBAL
  // ============================================
  window.PortfolioManager = PortfolioManager;

  // Auto-inicialización removida para evitar race conditions con portfolio-grid.js
  // portfolio-grid.js ahora controla la inicialización explícitamente

})();
