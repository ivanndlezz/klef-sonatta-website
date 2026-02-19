// ============================================================================
// APP INIT - Inicialización principal de la aplicación
// ============================================================================

(function () {
  "use strict";

  function initApp() {
    // Detectar si es una página de portafolio para cargar el preset correcto
    // Cargar el preset inicial (Búsqueda + Volver arriba)
    if (typeof loadPreset === "function") {
      loadPreset("search_totop");
    }

    if (typeof initCookieConsentUI === "function") {
      initCookieConsentUI();
    }

    // SEO Image Hydrator se auto-inicializa en su propio módulo
    // Hero Animation se auto-inicializa en su propio módulo
    // Navigation System se auto-inicializa en su propio módulo
    // Search System se auto-inicializa en su propio módulo
  }

  // Inicializar cuando el DOM esté listo y después de que los scripts se hayan cargado
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      // Pequeño delay para asegurar que todos los scripts estén cargados
      setTimeout(initApp, 100);
    });
  } else {
    setTimeout(initApp, 100);
  }
})();
