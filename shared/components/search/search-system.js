// ============================================================================
// SEARCH SYSTEM - GraphQL Search with key:value Filter Support
// ============================================================================

(function () {
  "use strict";

  // Referencias DOM
  let searchOverlay,
    searchInput,
    resultsContainer,
    quickSuggestions,
    clearInput,
    filterChipsContainer;
  let searchTimeout;
  let filterTimeout;
  let recentSearches = JSON.parse(
    localStorage.getItem("recentSearches") || "[]",
  );

  // Estado de filtros activo
  let activeFilters = {
    text: "",
    filters: {},
    exclude: [],
  };

  // Configuracion de busqueda
  const CONFIG = {
    GRAPHQL_ENDPOINT: "https://klef.newfacecards.com/graphql",
    MIN_SEARCH_LENGTH: 2,
    DEBOUNCE_DELAY: 300,
    FILTER_DEBOUNCE_DELAY: 150,
  };

  // ============================================
  // FILTER SYSTEM INTEGRATION
  // ============================================

  /**
   * Procesa el query y extrae filtros
   */
  function processFilters(query) {
    if (typeof QueryParser === "undefined") {
      return { text: query, filters: {}, exclude: [] };
    }
    return QueryParser.parse(query);
  }

  /**
   * Filtra resultados localmente (fallback cuando GraphQL no soporta filtros)
   */
  function filterResultsLocally(results, filters) {
    if (
      !filters ||
      (Object.keys(filters.filters).length === 0 &&
        filters.exclude.length === 0)
    ) {
      return results;
    }

    const filterConfig = filters.filters;
    const exclude = filters.exclude;

    return results.filter(function (item) {
      // Filtrar por tipo
      if (filterConfig.type) {
        var itemType = getItemType(item);
        if (itemType !== filterConfig.type.value) {
          return false;
        }
      }

      // Filtrar por categoria
      if (filterConfig.category) {
        var itemCategories = getItemCategories(item).map(function (c) {
          return c.toLowerCase();
        });
        if (
          itemCategories.indexOf(filterConfig.category.value.toLowerCase()) ===
          -1
        ) {
          return false;
        }
      }

      // Filtrar por tag
      if (filterConfig.tag) {
        var itemTags = getItemTags(item).map(function (t) {
          return t.toLowerCase();
        });
        if (itemTags.indexOf(filterConfig.tag.value.toLowerCase()) === -1) {
          return false;
        }
      }

      // Filtrar por autor
      if (filterConfig.author) {
        var authorName = getItemAuthor(item).toLowerCase();
        if (
          authorName.indexOf(filterConfig.author.value.toLowerCase()) === -1
        ) {
          return false;
        }
      }

      // Filtrar por fecha (after)
      if (filterConfig.after) {
        var itemDate = new Date(getItemDate(item));
        var afterDate = new Date(filterConfig.after.value);
        if (itemDate < afterDate) {
          return false;
        }
      }

      // Filtrar por fecha (before)
      if (filterConfig.before) {
        var itemDate2 = new Date(getItemDate(item));
        var beforeDate = new Date(filterConfig.before.value);
        if (itemDate2 > beforeDate) {
          return false;
        }
      }

      // Verificar exclusiones
      var searchText = getItemSearchText(item).toLowerCase();
      for (var i = 0; i < exclude.length; i++) {
        if (searchText.indexOf(exclude[i].toLowerCase()) !== -1) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Obtiene el tipo de un item
   */
  function getItemType(item) {
    if (item.contentType === "pages") return "page";
    if (item.contentType === "posts") {
      var cat =
        item.categories && item.categories.nodes && item.categories.nodes[0];
      return cat && cat.name ? cat.name.toLowerCase() : "blog";
    }
    return "unknown";
  }

  /**
   * Obtiene categorias de un item
   */
  function getItemCategories(item) {
    if (!item.categories || !item.categories.nodes) return [];
    return item.categories.nodes.map(function (c) {
      return c.name;
    });
  }

  /**
   * Obtiene tags de un item
   */
  function getItemTags(item) {
    if (!item.tags || !item.tags.nodes) return [];
    return item.tags.nodes.map(function (t) {
      return t.name;
    });
  }

  /**
   * Obtiene autor de un item
   */
  function getItemAuthor(item) {
    return item.author && item.author.node && item.author.node.name
      ? item.author.node.name
      : "";
  }

  /**
   * Obtiene fecha de un item
   */
  function getItemDate(item) {
    return item.date || "";
  }

  /**
   * Obtiene texto para busqueda
   */
  function getItemSearchText(item) {
    return (item.title + " " + (item.content || "")).toLowerCase();
  }

  /**
   * Renderiza los chips de filtros activos
   */
  function renderFilterChips(filters) {
    if (!filterChipsContainer) {
      filterChipsContainer = document.getElementById("filterChipsContainer");
    }
    if (!filterChipsContainer) return;

    var chips = [];

    // Chips de filtros
    Object.keys(filters.filters).forEach(function (key) {
      var filter = filters.filters[key];
      var label = (filter.negated ? "-" : "") + key + ":" + filter.value;
      chips.push({
        key: key,
        value: filter.value,
        negated: filter.negated,
        label: label,
        type: "filter",
      });
    });

    // Chips de exclusion
    filters.exclude.forEach(function (word) {
      chips.push({
        key: "exclude",
        value: word,
        negated: true,
        label: "-" + word,
        type: "exclude",
      });
    });

    if (chips.length === 0) {
      filterChipsContainer.innerHTML = "";
      filterChipsContainer.style.display = "none";
      return;
    }

    var html = "";
    chips.forEach(function (chip) {
      html +=
        '<button class="filter-chip' +
        (chip.negated ? " negated" : "") +
        '" ' +
        'data-key="' +
        chip.key +
        '" ' +
        'data-value="' +
        chip.value +
        '" ' +
        'data-negated="' +
        chip.negated +
        '" ' +
        'data-type="' +
        chip.type +
        '" ' +
        'title="Click para remover">' +
        chip.label +
        '<svg class="chip-remove" viewBox="0 0 24 24" fill="none" stroke="currentColor">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>' +
        "</svg></button>";
    });

    html +=
      '<button class="filter-chip-clear" data-action="clear-filters">Limpiar todo</button>';

    filterChipsContainer.style.display = "flex";
    filterChipsContainer.innerHTML = html;

    // Event listeners para remover chips
    var chipButtons = filterChipsContainer.querySelectorAll(".filter-chip");
    for (var i = 0; i < chipButtons.length; i++) {
      chipButtons[i].addEventListener(
        "click",
        (function (btn) {
          return function (e) {
            if (
              e.target.classList.contains("chip-remove") ||
              e.target.closest(".chip-remove")
            ) {
              removeFilter(
                btn.getAttribute("data-key"),
                btn.getAttribute("data-value"),
                btn.getAttribute("data-negated") === "true",
              );
            }
          };
        })(chipButtons[i]),
      );
    }

    var clearBtn = filterChipsContainer.querySelector(
      '[data-action="clear-filters"]',
    );
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        clearAllFilters();
      });
    }
  }

  /**
   * Remueve un filtro especifico
   */
  function removeFilter(key, value, negated) {
    if (
      activeFilters.filters[key] &&
      activeFilters.filters[key].value === value
    ) {
      delete activeFilters.filters[key];
    }
    activeFilters.exclude = activeFilters.exclude.filter(function (v) {
      return v !== value;
    });
    rebuildQueryAndSearch();
  }

  /**
   * Limpia todos los filtros
   */
  function clearAllFilters() {
    activeFilters.filters = {};
    activeFilters.exclude = [];
    rebuildQueryAndSearch();
  }

  /**
   * reconstruye el query y ejecuta busqueda
   */
  function rebuildQueryAndSearch() {
    if (typeof QueryParser !== "undefined") {
      var query = QueryParser.build(
        activeFilters.filters,
        activeFilters.text,
        activeFilters.exclude,
      );
      if (searchInput) {
        searchInput.value = query;
      }
      performSearch(query);
    }
  }

  /**
   * Sincroniza filtros con URL
   */
  function syncFiltersToURL() {
    var params = new URLSearchParams();
    if (activeFilters.text) {
      params.set("q", activeFilters.text);
    }
    Object.keys(activeFilters.filters).forEach(function (key) {
      params.set("f_" + key, activeFilters.filters[key].value);
    });
    if (activeFilters.exclude.length > 0) {
      params.set("f_exclude", activeFilters.exclude.join(","));
    }

    var newURL =
      window.location.pathname +
      (params.toString() ? "?" + params.toString() : "");
    history.replaceState({}, "", newURL);
  }

  /**
   * Carga filtros desde URL
   */
  function loadFiltersFromURL() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    var exclude = params.get("f_exclude");

    if (
      q ||
      exclude ||
      Array.from(params.keys()).some(function (k) {
        return k.indexOf("f_") === 0;
      })
    ) {
      var filters = { filters: {}, exclude: [] };

      if (q) {
        filters.text = q;
      }

      params.forEach(function (value, key) {
        if (key.indexOf("f_") === 0 && key !== "f_exclude") {
          var filterKey = key.substring(2);
          filters.filters[filterKey] = { value: value, negated: false };
        }
      });

      if (exclude) {
        filters.exclude = exclude.split(",");
      }

      return filters;
    }

    return null;
  }

  // ============================================
  // SEARCH FUNCTIONS
  // ============================================

  function openSearch() {
    if (!searchOverlay) {
      searchOverlay = document.getElementById("searchOverlay");
    }
    if (!searchInput) {
      searchInput = document.getElementById("searchInput");
    }
    if (!filterChipsContainer) {
      filterChipsContainer = document.getElementById("filterChipsContainer");
    }

    if (!searchOverlay) return;

    // Cargar filtros desde URL si existen
    var urlFilters = loadFiltersFromURL();
    if (urlFilters) {
      activeFilters = urlFilters;
      if (typeof QueryParser !== "undefined") {
        searchInput.value = QueryParser.build(
          activeFilters.filters,
          activeFilters.text,
          activeFilters.exclude,
        );
      }
    }

    searchOverlay.classList.add("active");

    if (typeof ScrollLock !== "undefined") {
      ScrollLock.lock();
    } else {
      document.body.style.overflow = "hidden";
    }

    if (typeof removeDynamicStyle === "function") {
      removeDynamicStyle();
    }

    searchOverlay.addEventListener(
      "transitionend",
      function () {
        if (searchInput) {
          searchInput.focus();
        }
      },
      { once: true },
    );

    updateRecentSearches();

    // Render chips si hay filtros activos
    renderFilterChips(activeFilters);
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

    if (typeof ScrollLock !== "undefined") {
      ScrollLock.unlock();
    } else {
      document.body.style.overflow = "";
    }

    if (searchInput) searchInput.value = "";
    if (clearInput) clearInput.classList.remove("visible");
    if (resultsContainer) resultsContainer.innerHTML = "";
    if (quickSuggestions) quickSuggestions.style.display = "block";

    // Limpiar filtros
    activeFilters = { text: "", filters: {}, exclude: [] };
    renderFilterChips(activeFilters);
    syncFiltersToURL();
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
    var list = document.getElementById("recentSearches");
    if (!list) return;

    if (recentSearches.length === 0) {
      list.innerHTML =
        '<li style="color: #86868b; font-size: 13px;">Sin busquedas recientes</li>';
    } else {
      var items = [];
      for (var i = 0; i < Math.min(recentSearches.length, 3); i++) {
        var term = recentSearches[i];
        var safeTerm = term.replace(/"/g, '"');
        items.push(
          '<li><a href="#" data-action="search-term" data-term="' +
            safeTerm +
            '">' +
            '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>' +
            term +
            "</a></li>",
        );
      }
      list.innerHTML = items.join("");
    }
  }

  function saveToRecent(term) {
    recentSearches = [term]
      .concat(
        recentSearches.filter(function (t) {
          return t !== term;
        }),
      )
      .slice(0, 5);
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
    updateRecentSearches();
  }

  async function performSearch(searchTerm) {
    // Parsear filtros
    var parsed = processFilters(searchTerm);
    activeFilters = parsed;

    // Actualizar UI de chips
    renderFilterChips(parsed);
    syncFiltersToURL();

    if (!resultsContainer) {
      resultsContainer = document.getElementById("resultsContainer");
    }
    if (!quickSuggestions) {
      quickSuggestions = document.getElementById("quickSuggestions");
    }

    // Si solo hay filtros sin texto, esperar mas input
    var searchText = parsed.text || "";
    if (
      searchText.length < CONFIG.MIN_SEARCH_LENGTH &&
      Object.keys(parsed.filters).length === 0
    ) {
      if (resultsContainer) resultsContainer.innerHTML = "";
      if (quickSuggestions) quickSuggestions.style.display = "block";
      return;
    }

    if (quickSuggestions) quickSuggestions.style.display = "none";

    if (resultsContainer) {
      // Show skeleton loading cards
      var skelCards = "";
      for (var i = 0; i < 4; i++) {
        skelCards +=
          '<li class="result-item skel-card">' +
          '<div class="skel-image"></div>' +
          '<div class="skel-content">' +
          '<div class="skel-label"></div>' +
          '<div class="skel-title"></div>' +
          '<div class="skel-title short"></div>' +
          '<div class="skel-meta"></div>' +
          "</div>" +
          "</li>";
      }
      resultsContainer.innerHTML =
        '<div class="result-group"><ul class="result-items">' +
        skelCards +
        "</ul></div>";
    }

    // GraphQL query
    var queryStr =
      "query FlexibleSearch($searchTerm: String!) {" +
      "pages(first: 20, where: { search: $searchTerm }) {" +
      "nodes { id title slug uri date content featuredImage { node { sourceUrl altText } } }" +
      "}" +
      "posts(first: 20, where: { search: $searchTerm }) {" +
      "nodes { id title slug uri date content featuredImage { node { sourceUrl altText } } " +
      "categories { nodes { name slug uri } } tags { nodes { name slug } } " +
      "author { node { name uri } } }" +
      "}" +
      "}";

    try {
      var response = await fetch(CONFIG.GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryStr,
          variables: { searchTerm: searchText },
        }),
      });

      var json = await response.json();

      if (json.errors) throw new Error(json.errors[0].message);

      // Aplicar filtros localmente si es necesario
      var data = json.data;

      // Si hay filtros, aplicar filtrado client-side
      if (Object.keys(parsed.filters).length > 0 || parsed.exclude.length > 0) {
        var allResults = [];
        Object.keys(data).forEach(function (type) {
          var nodes = data[type].nodes;
          nodes.forEach(function (node) {
            allResults.push(
              Object.assign({}, node, {
                contentType: type,
              }),
            );
          });
        });

        var filteredResults = filterResultsLocally(allResults, parsed);

        // Reconstruir data para displayResults
        data = {
          pages: {
            nodes: filteredResults.filter(function (n) {
              return n.contentType === "pages";
            }),
          },
          posts: {
            nodes: filteredResults.filter(function (n) {
              return n.contentType === "posts";
            }),
          },
        };
      }

      displayResults(data, searchTerm, parsed);
      saveToRecent(searchTerm);
    } catch (error) {
      console.error("Error en busqueda:", error);
      if (resultsContainer) {
        resultsContainer.innerHTML =
          '<div class="no-results"><div class="no-results-title">Error</div><div class="no-results-text">' +
          error.message +
          "</div></div>";
      }
    }
  }

  function displayResults(data, searchTerm, parsed) {
    if (!resultsContainer) {
      resultsContainer = document.getElementById("resultsContainer");
    }
    if (!resultsContainer) return;

    var typeConfig = {
      pages: { label: "Page", icon: "icon-page", class: "page" },
      posts: { label: "Blog Post", icon: "icon-post", class: "blog" },
    };

    var allResults = [];
    var totalResults = 0;

    Object.keys(data).forEach(function (type) {
      var nodes = data[type].nodes;
      nodes.forEach(function (node) {
        allResults.push(
          Object.assign({}, node, {
            contentType: type,
            config: typeConfig[type],
          }),
        );
      });
      totalResults += nodes.length;
    });

    var html = "";

    if (totalResults === 0) {
      var hintHtml =
        Object.keys(parsed.filters).length > 0
          ? '<div class="no-results-hint">Los filtros activos pueden estar limitando los resultados</div>'
          : "";
      html =
        '<div class="no-results">' +
        '<svg class="no-results-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>' +
        "</svg>" +
        '<div class="no-results-title">No se encontraron resultados</div>' +
        '<div class="no-results-text">Intenta con otros terminos de busqueda</div>' +
        hintHtml +
        "</div>";
    } else {
      // Construir mensaje de resultados con filtros
      var filterInfo = Object.keys(parsed.filters)
        .map(function (key) {
          return key + ":" + parsed.filters[key].value;
        })
        .join(" ");

      var filterLabel = filterInfo ? " (filtros: " + filterInfo + ")" : "";

      html =
        '<div class="results-header">' +
        '<h4>Resultados para "' +
        searchTerm +
        '"' +
        filterLabel +
        "</h4>" +
        "<p>" +
        totalResults +
        " coincidencia" +
        (totalResults !== 1 ? "s" : "") +
        "</p>" +
        "</div>" +
        '<div class="result-group"><ul class="result-items">';

      allResults.forEach(function (node) {
        var config = node.config;
        var categoryClass =
          node.contentType === "posts"
            ? getCategoryFromPostNode(node)
            : config.class;
        var labelClass =
          node.contentType === "posts"
            ? getCategoryFromPostNode(node)
            : config.class;
        var labelText =
          node.contentType === "posts"
            ? getCategoryFromPostNode(node)
                .replace(/-/g, " ")
                .replace(/\b\w/g, function (l) {
                  return l.toUpperCase();
                })
            : config.label;
        var iconName =
          node.contentType === "posts"
            ? getIconForCategory(categoryClass)
            : config.icon;

        var imageUrl =
          node.featuredImage && node.featuredImage.node
            ? node.featuredImage.node.sourceUrl
            : null;
        var imageAlt =
          (node.featuredImage &&
            node.featuredImage.node &&
            node.featuredImage.node.altText) ||
          node.title ||
          "";

        var imageHeight = "200px";
        var categories =
          node.categories && node.categories.nodes
            ? node.categories.nodes
                .map(function (c) {
                  return c.name;
                })
                .join(", ")
            : "";
        var authorName =
          (node.author && node.author.node && node.author.node.name) || "";

        var imageHtml = imageUrl
          ? '<img src="' + imageUrl + '" alt="' + imageAlt + '" loading="lazy">'
          : '<div class="result-image-placeholder" style="height: 100%;"><svg><use href="#' +
            iconName +
            '"></use></svg></div>';

        var categoriesHtml = categories
          ? '<div class="result-meta">' + categories + "</div>"
          : "";
        var authorHtml = authorName
          ? '<div class="result-author">Por ' + authorName + "</div>"
          : "";

        html +=
          '<li class="result-item">' +
          '<a href="' +
          (node.uri || "#") +
          '">' +
          '<div class="result-image" style="height: ' +
          imageHeight +
          ';">' +
          imageHtml +
          '<div class="result-type-icon ' +
          categoryClass +
          '">' +
          '<svg><use href="#' +
          iconName +
          '"></use></svg>' +
          "</div>" +
          "</div>" +
          '<div class="result-content">' +
          '<div class="result-type-label ' +
          labelClass +
          '">' +
          labelText +
          "</div>" +
          '<div class="result-title">' +
          (node.title || "") +
          "</div>" +
          categoriesHtml +
          authorHtml +
          "</div>" +
          "</a></li>";
      });

      html += "</ul></div>";
    }

    resultsContainer.innerHTML = html;
  }

  function stripHtml(html) {
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  function formatDate(dateString) {
    var date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function getIconForCategory(categoryClass) {
    var iconMap = {
      blog: "icon-post",
      portfolio: "icon-portfolio",
      "sin-categoria": "icon-post",
    };
    return iconMap[categoryClass] || "icon-post";
  }

  function getCategoryFromPostNode(node) {
    var categories = node.categories && node.categories.nodes;

    if (!categories || categories.length === 0) {
      return "blog";
    }

    var firstCategory = categories[0];
    var categoryName = firstCategory && firstCategory.name;

    if (!categoryName) {
      return "blog";
    }

    var categoryMap = {
      blog: "blog",
      portfolio: "portfolio",
      "sin-categoria": "sin-categoria",
    };
    return categoryMap[categoryName.toLowerCase()] || "blog";
  }

  // Inicializar event listeners
  function initSearchListeners() {
    searchOverlay = document.getElementById("searchOverlay");
    searchInput = document.getElementById("searchInput");
    resultsContainer = document.getElementById("resultsContainer");
    quickSuggestions = document.getElementById("quickSuggestions");
    filterChipsContainer = document.getElementById("filterChipsContainer");

    // Botones para abrir busqueda
    var openButtons = document.querySelectorAll('[data-action="open-search"]');
    for (var i = 0; i < openButtons.length; i++) {
      openButtons[i].addEventListener("click", function (e) {
        e.preventDefault();
        openSearch();
      });
    }

    // Botones para cerrar busqueda
    var closeButtons = document.querySelectorAll(
      '[data-action="close-search"]',
    );
    for (var i = 0; i < closeButtons.length; i++) {
      closeButtons[i].addEventListener("click", function (e) {
        e.preventDefault();
        closeSearch();
      });
    }

    // Delegacion de eventos para busquedas recientes
    if (quickSuggestions) {
      quickSuggestions.addEventListener("click", function (e) {
        var searchLink = e.target.closest('[data-action="search-term"]');
        if (searchLink) {
          e.preventDefault();
          var term = searchLink.getAttribute("data-term");
          if (term) {
            searchFor(term);
          }
        }

        var suggestionLink = e.target.closest(
          '[data-action="search-suggestion"]',
        );
        if (suggestionLink) {
          e.preventDefault();
          var term = suggestionLink.getAttribute("data-term");
          if (term) {
            searchFor(term);
          }
        }
      });
    }

    // Cerrar al hacer clic en overlay
    if (searchOverlay) {
      searchOverlay.addEventListener("click", function (e) {
        if (e.target === searchOverlay) {
          closeSearch();
        }
      });
    }

    updateRecentSearches();

    // Event listener para input de busqueda
    if (searchInput) {
      searchInput.addEventListener("input", function (e) {
        clearTimeout(searchTimeout);
        var term = e.target.value.trim();

        // Show/hide clear button
        if (!clearInput) {
          clearInput = document.getElementById("clearInput");
        }
        if (clearInput) {
          if (term.length > 0) {
            clearInput.classList.add("visible");
          } else {
            clearInput.classList.remove("visible");
          }
        }

        if (term.length >= CONFIG.MIN_SEARCH_LENGTH) {
          searchTimeout = setTimeout(function () {
            performSearch(term);
          }, CONFIG.DEBOUNCE_DELAY);
        } else if (term.length === 0) {
          // Limpiar cuando el input esta vacio
          if (resultsContainer) resultsContainer.innerHTML = "";
          if (quickSuggestions) quickSuggestions.style.display = "block";
          renderFilterChips({ filters: {}, exclude: [] });
        }
      });
    }

    // Event listener para boton de limpiar
    if (!clearInput) {
      clearInput = document.getElementById("clearInput");
    }
    if (clearInput) {
      clearInput.addEventListener("click", function () {
        if (searchInput) {
          searchInput.value = "";
          searchInput.focus();
          clearInput.classList.remove("visible");
          if (resultsContainer) resultsContainer.innerHTML = "";
          if (quickSuggestions) quickSuggestions.style.display = "block";
          activeFilters = { text: "", filters: {}, exclude: [] };
          renderFilterChips(activeFilters);
          syncFiltersToURL();
        }
      });
    }

    // Atajo de teclado Ctrl+K para abrir busqueda
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
    });

    // Cerrar con ESC
    document.addEventListener("keydown", function (e) {
      if (
        e.key === "Escape" &&
        searchOverlay &&
        searchOverlay.classList.contains("active")
      ) {
        closeSearch();
      }
    });
  }

  // Exportar funciones al scope global
  window.openSearch = openSearch;
  window.closeSearch = closeSearch;
  window.searchFor = searchFor;
  window.getActiveFilters = function () {
    return activeFilters;
  };

  // Inicializar cuando el DOM este listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSearchListeners);
  } else {
    initSearchListeners();
  }
})();
