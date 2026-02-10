/**
 * Search Tags Filter System
 * Maneja el filtrado cuando el usuario hace click en los tags de búsqueda
 */

(function () {
  "use strict";

  console.log("[SearchTags] Script loaded");

  function initSearchTags() {
    console.log("[SearchTags] initSearchTags called");

    // Buscar elementos con data-filter dentro de #search-tags
    var searchTagsContainer = document.getElementById("search-tags");
    if (
      searchTagsContainer &&
      searchTagsContainer.hasAttribute("data-initialized")
    ) {
      console.warn("[SearchTags] Already initialized, skipping.");
      return;
    }

    var searchTags = document.querySelectorAll("#search-tags [data-filter]");
    console.log("[SearchTags] Found tags:", searchTags.length);

    if (searchTags.length === 0) {
      console.warn("[SearchTags] No search tags found, retrying...");
      // Intentar de nuevo en 100ms
      setTimeout(initSearchTags, 100);
      return;
    }

    if (searchTagsContainer) {
      searchTagsContainer.setAttribute("data-initialized", "true");
    }

    for (var i = 0; i < searchTags.length; i++) {
      (function (tag) {
        var filterValue = tag.getAttribute("data-filter");
        console.log("[SearchTags] Setting up tag:", filterValue);

        // Event click
        tag.addEventListener("click", function (e) {
          console.log("[SearchTags] Clicked on:", filterValue);

          // Toggle: si ya está activo, limpiar; si no, activar
          if (this.classList.contains("active")) {
            console.log("[SearchTags] Deactivating tag:", filterValue);
            // Limpiar filtros
            var allTags = document.querySelectorAll(
              "#search-tags [data-filter]",
            );
            for (var j = 0; j < allTags.length; j++) {
              allTags[j].classList.remove("active");
            }

            // Limpiar búsqueda del overlay si existe
            if (typeof window.clearAllFilters === "function") {
              console.log("[SearchTags] Calling clearAllFilters");
              window.clearAllFilters();
            }

            // Cerrar overlay de búsqueda si está abierto
            var searchOverlay = document.getElementById("searchOverlay");
            console.log("[SearchTags] searchOverlay found:", !!searchOverlay);
            if (searchOverlay) {
              searchOverlay.classList.remove("active");
            }
          } else {
            console.log("[SearchTags] Activating tag:", filterValue);
            // Remover active de otros tags
            var otherTags = document.querySelectorAll(
              "#search-tags [data-filter]",
            );
            for (var k = 0; k < otherTags.length; k++) {
              otherTags[k].classList.remove("active");
            }

            // Activar este tag
            this.classList.add("active");

            // Abrir overlay y ejecutar búsqueda
            openSearchWithFilter(filterValue);
          }
        });

        // Soporte para teclado (Enter y Espacio)
        tag.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.click();
          }
        });
      })(searchTags[i]);
    }
  }

  function openSearchWithFilter(filterValue) {
    console.log("[SearchTags] openSearchWithFilter called with:", filterValue);

    // Intentar usar window.openSearch (API pública)
    if (typeof window.openSearch === "function") {
      console.log("[SearchTags] Calling window.openSearch()...");
      try {
        window.openSearch();

        if (typeof window.searchFor === "function") {
          console.log(
            "[SearchTags] Calling window.searchFor(" + filterValue + ")...",
          );
          setTimeout(function () {
            window.searchFor(filterValue);
          }, 50);
        } else {
          console.warn("[SearchTags] window.searchFor not found");
        }
        return;
      } catch (e) {
        console.error("[SearchTags] Error calling openSearch:", e);
      }
    } else {
      console.warn("[SearchTags] window.openSearch is not a function");
    }

    // Fallback manual si falla lo anterior
    console.warn("[SearchTags] Using manual fallback");

    var searchOverlay = document.getElementById("searchOverlay");
    var searchInput = document.getElementById("searchInput");

    if (searchOverlay) {
      console.log("[SearchTags] Manually adding 'active' class to overlay");
      searchOverlay.classList.add("active");
      document.body.style.overflow = "hidden"; // Lock scroll
    } else {
      console.error("[SearchTags] searchOverlay element not found in DOM");
    }

    if (searchInput) {
      searchInput.value = filterValue;
      searchInput.focus();

      if (typeof window.performSearch === "function") {
        window.performSearch(filterValue);
      }
    } else {
      console.error("[SearchTags] searchInput element not found");
    }
  }

  // Usar MutationObserver para detectar cuando los tags aparecen
  function watchForTags() {
    var observer = new MutationObserver(function (mutations) {
      var searchTags = document.querySelectorAll("#search-tags [data-filter]");
      if (searchTags.length > 0) {
        console.log("[SearchTags] MutationObserver detected tags!");
        observer.disconnect();
        initSearchTags();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // También intentar inmediatamente
    setTimeout(function () {
      var searchTags = document.querySelectorAll("#search-tags [data-filter]");
      if (searchTags.length > 0) {
        observer.disconnect();
        initSearchTags();
      }
    }, 0);
  }

  // Inicializar
  console.log("[SearchTags] Starting observation...");
  watchForTags();
})();
