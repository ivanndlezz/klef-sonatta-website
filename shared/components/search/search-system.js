// ============================================================================
// SEARCH SYSTEM - GraphQL Search with Recent Searches
// ============================================================================

(function () {
  "use strict";

  // Referencias DOM
  let searchOverlay,
    searchInput,
    resultsContainer,
    quickSuggestions,
    clearInput;
  let searchTimeout;
  let recentSearches = JSON.parse(
    localStorage.getItem("recentSearches") || "[]",
  );

  // Configuración de búsqueda
  const CONFIG = {
    GRAPHQL_ENDPOINT: "https://klef.newfacecards.com/graphql",
    MIN_SEARCH_LENGTH: 2,
    DEBOUNCE_DELAY: 300,
  };

  // Funciones de búsqueda
  function openSearch() {
    if (!searchOverlay) {
      searchOverlay = document.getElementById("searchOverlay");
    }
    if (!searchInput) {
      searchInput = document.getElementById("searchInput");
    }

    if (!searchOverlay) return;

    searchOverlay.classList.add("active");
    document.body.style.overflow = "hidden";

    // Remover estilo dinámico si existe
    if (typeof removeDynamicStyle === "function") {
      removeDynamicStyle();
    }

    // Enfocar el input después de que la transición termine
    searchOverlay.addEventListener(
      "transitionend",
      () => {
        if (searchInput) {
          searchInput.focus();
        }
      },
      { once: true },
    );

    updateRecentSearches();
  }

  function closeSearch() {
    if (!searchOverlay) {
      searchOverlay = document.getElementById("searchOverlay");
    }
    if (!searchInput) {
      searchInput = document.getElementById("searchInput");
    }
    if (!resultsContainer) {
      resultsContainer = document.getElementById("resultsContainer");
    }
    if (!quickSuggestions) {
      quickSuggestions = document.getElementById("quickSuggestions");
    }
    if (!clearInput) {
      clearInput = document.getElementById("clearInput");
    }

    if (!searchOverlay) return;

    searchOverlay.classList.remove("active");
    document.body.style.overflow = "";
    if (searchInput) searchInput.value = "";
    if (clearInput) clearInput.classList.remove("visible");
    if (resultsContainer) resultsContainer.innerHTML = "";
    if (quickSuggestions) quickSuggestions.style.display = "block";
  }

  function searchFor(term) {
    //console.log("🔍 searchFor llamado con:", term);
    if (!searchInput) {
      searchInput = document.getElementById("searchInput");
    }
    if (!searchInput) return;

    searchInput.value = term;
    performSearch(term);
  }

  function updateRecentSearches() {
    const list = document.getElementById("recentSearches");
    if (!list) return;

    if (recentSearches.length === 0) {
      list.innerHTML =
        '<li style="color: #86868b; font-size: 13px;">Sin búsquedas recientes</li>';
    } else {
      list.innerHTML = recentSearches
        .slice(0, 3)
        .map(
          (term) => `
                <li><a href="#" data-action="search-term" data-term="${term.replace(/"/g, "&quot;")}">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    ${term}
                </a></li>
            `,
        )
        .join("");

      // ✅ NO AGREGAR LISTENERS AQUÍ - se manejan por delegación
    }
  }

  function saveToRecent(term) {
    recentSearches = [term, ...recentSearches.filter((t) => t !== term)].slice(
      0,
      5,
    );
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
    updateRecentSearches();
  }

  async function performSearch(searchTerm) {
    //console.log("🔎 performSearch llamado con:", searchTerm);

    if (!resultsContainer) {
      resultsContainer = document.getElementById("resultsContainer");
    }
    if (!quickSuggestions) {
      quickSuggestions = document.getElementById("quickSuggestions");
    }

    if (searchTerm.length < CONFIG.MIN_SEARCH_LENGTH) {
      if (resultsContainer) resultsContainer.innerHTML = "";
      if (quickSuggestions) quickSuggestions.style.display = "block";
      return;
    }

    if (quickSuggestions) quickSuggestions.style.display = "none";
    if (resultsContainer) {
      resultsContainer.innerHTML =
        '<div class="loading"><div class="loading-spinner"></div><div>Buscando...</div></div>';
    }

    const query = `
            query FlexibleSearch($searchTerm: String!) {
                pages(first: 20, where: { search: $searchTerm }) {
                    nodes {
                        id
                        title
                        slug
                        uri
                        date
                        content(format: RENDERED)
                        featuredImage {
                            node {
                                sourceUrl(size: LARGE)
                                altText
                            }
                        }
                    }
                }
                posts(first: 20, where: { search: $searchTerm }) {
                    nodes {
                        id
                        title
                        slug
                        uri
                        date
                        content(format: RENDERED)
                        featuredImage {
                            node {
                                sourceUrl(size: LARGE)
                                altText
                            }
                        }
                        portfolioImages {
                            id
                            sourceUrl(size: LARGE)
                            altText
                            mediaItemUrl
                            filePath
                        }
                        categories {
                            nodes {
                                categoryId
                                name
                                slug
                                uri
                            }
                        }
                        tags {
                            nodes {
                                tagId
                                name
                                slug
                            }
                        }
                        author {
                            node {
                                id
                                name
                                firstName
                                lastName
                                uri
                                url
                                userId
                                avatar {
                                    url
                                }
                            }
                        }
                        coAuthors {
                            __typename
                            ... on User {
                                id
                                name
                                firstName
                                lastName
                                uri
                                url
                                userId
                                avatar {
                                    url
                                }
                                description
                            }
                            ... on GuestAuthor {
                                id
                                name
                                firstName
                                lastName
                                email
                                avatar {
                                    url
                                }
                                description
                                website
                            }
                        }
                    }
                }
            }
        `;

    // DEBUG: Log query structure
    console.log("📡 GraphQL Query built with extended fields:", {
      pagesFields: [
        "id",
        "title",
        "slug",
        "uri",
        "date",
        "content",
        "featuredImage",
      ],
      postsFields: [
        "id",
        "title",
        "slug",
        "uri",
        "date",
        "content",
        "featuredImage",
        "portfolioImages",
        "categories",
        "tags",
        "author",
        "coAuthors",
      ],
    });

    try {
      const response = await fetch(CONFIG.GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: { searchTerm } }),
      });

      const json = await response.json();
      console.log("📦 GraphQL Response:", json);

      if (json.errors) throw new Error(json.errors[0].message);

      displayResults(json.data, searchTerm);
      saveToRecent(searchTerm);
    } catch (error) {
      console.error("❌ Error en búsqueda:", error);
      if (resultsContainer) {
        resultsContainer.innerHTML = `<div class="no-results"><div class="no-results-title">Error</div><div class="no-results-text">${error.message}</div></div>`;
      }
    }
  }

  function displayResults(data, searchTerm) {
    if (!resultsContainer) {
      resultsContainer = document.getElementById("resultsContainer");
    }
    if (!resultsContainer) return;

    const typeConfig = {
      pages: { label: "Page", icon: "icon-page", class: "page" },
      posts: { label: "Blog Post", icon: "icon-post", class: "blog" },
    };

    let allResults = [];
    let totalResults = 0;

    // Combinar todos los resultados en un solo array
    Object.entries(data).forEach(([type, { nodes }]) => {
      nodes.forEach((node) => {
        allResults.push({
          ...node,
          contentType: type,
          config: typeConfig[type],
        });
      });
      totalResults += nodes.length;
    });

    let html = "";

    if (totalResults === 0) {
      html = `
                <div class="no-results">
                    <svg class="no-results-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <div class="no-results-title">No se encontraron resultados</div>
                    <div class="no-results-text">Intenta con otros términos de búsqueda</div>
                </div>
            `;
    } else {
      // Header con contador
      html = `
                <div class="results-header">
                    <h4>Resultados para "${searchTerm}"</h4>
                    <p>${totalResults} coincidencia${totalResults !== 1 ? "s" : ""}</p>
                </div>
                <div class="result-group">
                    <ul class="result-items">
                        ${allResults
                          .map((node) => {
                            const config = node.config;

                            // Get dynamic category class for posts based on categories data
                            const categoryClass =
                              node.contentType === "posts"
                                ? getCategoryFromPostNode(node)
                                : config.class;

                            // Get label class based on content type
                            const labelClass =
                              node.contentType === "posts"
                                ? getCategoryFromPostNode(node)
                                : config.class;

                            // Get display label text
                            const labelText =
                              node.contentType === "posts"
                                ? getCategoryFromPostNode(node)
                                    .replace(/-/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())
                                : config.label;

                            // Get icon name based on category
                            const iconName =
                              node.contentType === "posts"
                                ? getIconForCategory(categoryClass)
                                : config.icon;

                            // Get featured image (or first portfolio image for posts)
                            let imageUrl = node.featuredImage?.node?.sourceUrl;
                            let imageAlt =
                              node.featuredImage?.node?.altText || node.title;

                            // Use first portfolio image if available (for posts)
                            if (
                              node.contentType === "posts" &&
                              node.portfolioImages &&
                              node.portfolioImages.length > 0
                            ) {
                              const firstPortfolio = node.portfolioImages[0];
                              imageUrl = firstPortfolio.sourceUrl;
                              imageAlt = firstPortfolio.altText || node.title;
                            }

                            const imageHeight = "200px";

                            // Get categories for display
                            const categories =
                              node.categories?.nodes
                                ?.map((c) => c.name)
                                .join(", ") || "";

                            // Get author name
                            const authorName = node.author?.node?.name || "";

                            return `
                                <li class="result-item">
                                    <a href="${node.uri}">
                                        <div class="result-image" style="height: ${imageHeight};">
                                            ${
                                              imageUrl
                                                ? `<img src="${imageUrl}" alt="${imageAlt}" loading="lazy">`
                                                : `<div class="result-image-placeholder" style="height: 100%;">
                                                            <svg><use href="#${iconName}"></use></svg>
                                                        </div>`
                                            }
                                            <div class="result-type-icon ${categoryClass}">
                                                <svg><use href="#${iconName}"></use></svg>
                                            </div>
                                        </div>
                                        <div class="result-content">
                                            <div class="result-type-label ${labelClass}">${labelText}</div>
                                            <div class="result-title">${node.title}</div>
                                            ${categories ? `<div class="result-meta">${categories}</div>` : ""}
                                            ${authorName ? `<div class="result-author">Por ${authorName}</div>` : ""}
                                        </div>
                                    </a>
                                </li>
                            `;
                          })
                          .join("")}
                    </ul>
                </div>
            `;
    }

    resultsContainer.innerHTML = html;
  }

  function stripHtml(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  /**
   * Get icon name based on category
   * Maps categories to their corresponding icon names
   */
  function getIconForCategory(categoryClass) {
    const iconMap = {
      blog: "icon-post",
      portfolio: "icon-portfolio",
      "sin-categoria": "icon-post",
    };

    return iconMap[categoryClass] || "icon-post";
  }

  /**
   * Extract category from GraphQL post node
   * Uses categories data from node.categories.nodes[].uri
   * Examples:
   * - categories.uri = /blog/category/blog/ → returns "blog"
   * - categories.uri = /blog/category/sin-categoria/ → returns "sin-categoria"
   * - categories.uri = /blog/category/portfolio/branding/ → returns "portfolio"
   */
  function getCategoryFromPostNode(node) {
    // Get categories array from node
    const categories = node.categories?.nodes;

    if (!categories || categories.length === 0) {
      console.log(
        "🔍 getCategoryFromPostNode: No categories found, returning 'blog'",
      );
      return "blog";
    }

    console.log("🔍 getCategoryFromPostNode: Categories:", categories);

    // Get first category URI
    const firstCategory = categories[0];
    const categoryUri = firstCategory?.uri;

    console.log("🔍 getCategoryFromPostNode: First category URI:", categoryUri);

    if (!categoryUri) {
      return "blog";
    }

    // Parse URI structure: /blog/category/{category-name}/...
    const match = categoryUri.match(/\/blog\/category\/([^/]+)/);
    console.log("🔍 getCategoryFromPostNode: Regex match:", match);

    if (match && match[1]) {
      const category = match[1];
      console.log("🔍 getCategoryFromPostNode: Extracted category:", category);

      // Map known categories to CSS class names
      const categoryMap = {
        blog: "blog",
        portfolio: "portfolio",
        "sin-categoria": "sin-categoria",
      };

      const result = categoryMap[category] || "blog";
      console.log("🔍 getCategoryFromPostNode: Final result:", result);
      return result;
    }

    console.log(
      "🔍 getCategoryFromPostNode: No pattern matched, returning 'blog'",
    );
    return "blog"; // Default fallback
  }

  // Inicializar event listeners
  function initSearchListeners() {
    //console.log("🚀 Inicializando Search System...");

    searchOverlay = document.getElementById("searchOverlay");
    searchInput = document.getElementById("searchInput");
    resultsContainer = document.getElementById("resultsContainer");
    quickSuggestions = document.getElementById("quickSuggestions");

    /*console.log("📋 Elementos DOM encontrados:", {
      searchOverlay: !!searchOverlay,
      searchInput: !!searchInput,
      resultsContainer: !!resultsContainer,
      quickSuggestions: !!quickSuggestions,
    });*/

    // Reemplazar onclick inline con event listeners
    document.querySelectorAll('[data-action="open-search"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openSearch();
      });
    });

    document.querySelectorAll('[data-action="close-search"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        closeSearch();
      });
    });

    // ✅ DELEGACIÓN DE EVENTOS para búsquedas recientes
    // Escuchar clicks en el contenedor de sugerencias
    if (quickSuggestions) {
      quickSuggestions.addEventListener("click", (e) => {
        // Buscar el link más cercano con data-action="search-term"
        const searchLink = e.target.closest('[data-action="search-term"]');
        if (searchLink) {
          e.preventDefault();
          const term = searchLink.getAttribute("data-term");
          //console.log("🎯 Click en búsqueda reciente:", term);
          if (term) {
            searchFor(term);
          }
        }

        // También manejar sugerencias estáticas
        const suggestionLink = e.target.closest(
          '[data-action="search-suggestion"]',
        );
        if (suggestionLink) {
          e.preventDefault();
          const term = suggestionLink.getAttribute("data-term");
          //console.log("🎯 Click en sugerencia:", term);
          if (term) {
            searchFor(term);
          }
        }
      });
      //console.log("✅ Delegación de eventos configurada en quickSuggestions");
    }

    // Cerrar al hacer clic en overlay de búsqueda
    if (searchOverlay) {
      searchOverlay.addEventListener("click", (e) => {
        if (e.target === searchOverlay) {
          closeSearch();
        }
      });
    }

    // Inicializar búsquedas recientes
    updateRecentSearches();

    // Event listener para input de búsqueda
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        console.log("Input event triggered, value:", e.target.value);
        clearTimeout(searchTimeout);
        const term = e.target.value.trim();
        console.log("Term length:", term.length);

        // Show/hide clear button based on input content
        if (!clearInput) {
          clearInput = document.getElementById("clearInput");
        }
        if (clearInput) {
          console.log("Clear button found, adding/removing .visible");
          if (term.length > 0) {
            clearInput.classList.add("visible");
            console.log("Added .visible class");
          } else {
            clearInput.classList.remove("visible");
            console.log("Removed .visible class");
          }
        }

        if (term.length >= CONFIG.MIN_SEARCH_LENGTH) {
          searchTimeout = setTimeout(
            () => performSearch(term),
            CONFIG.DEBOUNCE_DELAY,
          );
        } else {
          if (resultsContainer) resultsContainer.innerHTML = "";
          if (quickSuggestions) quickSuggestions.style.display = "block";
        }
      });
      //console.log("✅ Listener de input configurado");
    }

    // Event listener para botón de limpiar
    if (!clearInput) {
      clearInput = document.getElementById("clearInput");
    }
    if (clearInput) {
      clearInput.addEventListener("click", () => {
        if (searchInput) {
          searchInput.value = "";
          searchInput.focus();
          // Hide clear button
          clearInput.classList.remove("visible");
          // Clear results and show suggestions
          if (resultsContainer) resultsContainer.innerHTML = "";
          if (quickSuggestions) quickSuggestions.style.display = "block";
        }
      });
    }

    // Atajo de teclado Ctrl+K para abrir búsqueda
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
    });

    // Cerrar con ESC
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        searchOverlay &&
        searchOverlay.classList.contains("active")
      ) {
        closeSearch();
      }
    });

    //console.log("✅ Search System inicializado correctamente");
  }

  // Exportar funciones al scope global para compatibilidad
  window.openSearch = openSearch;
  window.closeSearch = closeSearch;
  window.searchFor = searchFor;

  // Inicializar cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSearchListeners);
  } else {
    initSearchListeners();
  }
})();
