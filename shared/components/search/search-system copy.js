// ============================================================================
// SEARCH SYSTEM - GraphQL Search with Recent Searches
// ============================================================================

(function () {
  "use strict";

  // Referencias DOM
  let searchOverlay, searchInput, resultsContainer, quickSuggestions;
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

    if (!searchOverlay) return;

    searchOverlay.classList.remove("active");
    document.body.style.overflow = "";
    if (searchInput) searchInput.value = "";
    if (resultsContainer) resultsContainer.innerHTML = "";
    if (quickSuggestions) quickSuggestions.style.display = "block";
  }

  function searchFor(term) {
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

      // Agregar event listeners a los nuevos elementos
      list.querySelectorAll('[data-action="search-term"]').forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const term = link.getAttribute("data-term");
          if (term) {
            searchFor(term);
          }
        });
      });
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
                                sourceUrl(size: MEDIUM)
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
                        excerpt
                        date
                        featuredImage {
                            node {
                                sourceUrl(size: MEDIUM)
                                altText
                            }
                        }
                        categories {
                            nodes {
                                name
                            }
                        }
                    }
                }
            }
        `;

    try {
      const response = await fetch(CONFIG.GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: { searchTerm } }),
      });

      const json = await response.json();
      if (json.errors) throw new Error(json.errors[0].message);

      displayResults(json.data, searchTerm);
      saveToRecent(searchTerm);
    } catch (error) {
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
                            const featuredImage =
                              node.featuredImage?.node?.sourceUrl;
                            const imageAlt =
                              node.featuredImage?.node?.altText || node.title;
                            const imageHeight = "200px";

                            return `
                                <li class="result-item">
                                    <a href="${node.uri}">
                                        <div class="result-image" style="height: ${imageHeight};">
                                            ${
                                              featuredImage
                                                ? `<img src="${featuredImage}" alt="${imageAlt}" loading="lazy">`
                                                : `<div class="result-image-placeholder" style="height: 100%;">
                                                    <svg><use href="#${config.icon}"></use></svg>
                                                </div>`
                                            }
                                            <div class="result-type-icon ${config.class}">
                                                <svg><use href="#${config.icon}"></use></svg>
                                            </div>
                                        </div>
                                        <div class="result-content">
                                            <div class="result-type-label ${config.class}">${config.label}</div>
                                            <div class="result-title">${node.title}</div>
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

  // Inicializar event listeners
  function initSearchListeners() {
    searchOverlay = document.getElementById("searchOverlay");
    searchInput = document.getElementById("searchInput");
    resultsContainer = document.getElementById("resultsContainer");
    quickSuggestions = document.getElementById("quickSuggestions");

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

    // Event delegation para sugerencias de búsqueda (elementos estáticos y dinámicos)
    document.addEventListener("click", (e) => {
      const searchLink = e.target.closest('[data-action="search-suggestion"]');
      if (searchLink) {
        e.preventDefault();
        const term = searchLink.getAttribute("data-term");
        if (term) {
          searchFor(term);
        }
      }
    });

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
        clearTimeout(searchTimeout);
        const term = e.target.value.trim();

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
    }

    // Atajo de teclado Ctrl+K para abrir búsqueda
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
    });

    // Cerrar con ESC (manejado también en navigation-system.js, pero por si acaso)
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        searchOverlay &&
        searchOverlay.classList.contains("active")
      ) {
        closeSearch();
      }
    });
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
  // Cmd+K Listener
  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      openSearch();
    }
  });
})();
