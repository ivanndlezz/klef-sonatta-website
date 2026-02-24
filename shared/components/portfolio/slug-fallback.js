/**
 * Slug Fallback Manager - SYNCHRONOUS VERSION
 * This script MUST load before portfolio-item-fetch.js
 * It adds the slug to the URL immediately if missing
 */

// ============================================
// CONFIGURATION
// ============================================

// Flag para debugging - cambiar a false en producción
const is_debugging = false;

// Default slug to use when no slug is found in URL
// Set to null to disable fallback behavior
const DEFAULT_FALLBACK_SLUG = is_debugging
  ? "fish-and-grill-los-cabos-restaurant-brand"
  : null;

// ============================================
// IMMEDIATE EXECUTION (runs before DOMContentLoaded)
// ============================================

(function initSlugFallback() {
  // Check if slug exists in URL
  const urlParams = new URLSearchParams(window.location.search);
  const currentSlug = urlParams.get("slug");

  // If no slug and fallback is enabled, add it immediately
  if (!currentSlug && DEFAULT_FALLBACK_SLUG) {
    // Adding fallback slug to URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("slug", DEFAULT_FALLBACK_SLUG);

    // Replace current URL without reload
    window.history.replaceState({}, "", newUrl);
  }
})();

// ============================================
// ERROR HANDLER FOR 404 SLUGS
// ============================================

// Listen for portfolio fetch errors - guard with typeof check for robustness
if (typeof document.addEventListener === "function") {
  document.addEventListener("DOMContentLoaded", () => {
    // Monitor for error state changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const body = mutation.target;

          // If error state detected
          if (body.classList.contains("error") && DEFAULT_FALLBACK_SLUG) {
            const urlParams = new URLSearchParams(window.location.search);
            const currentSlug = urlParams.get("slug");

            // Only try fallback if we're not already using it
            if (currentSlug && currentSlug !== DEFAULT_FALLBACK_SLUG) {
              // Trying fallback slug
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.set("slug", DEFAULT_FALLBACK_SLUG);
              window.location.href = newUrl.toString();
            }
          }
        }
      });
    });

    // Start observing body class changes
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
  });
}
