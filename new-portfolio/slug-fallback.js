/**
 * Slug Fallback Manager - SYNCHRONOUS VERSION
 * This script MUST load before portfolio-item-fetch.js
 * It adds the slug to the URL immediately if missing
 */

// ============================================
// CONFIGURATION
// ============================================

/**
 * Default slug to use when no slug is found in URL
 * Set to null to disable fallback behavior
 */
const DEFAULT_FALLBACK_SLUG = "fish-and-grill-los-cabos-restaurant-brand";

// To disable fallback, comment out the line above and uncomment this:
// const DEFAULT_FALLBACK_SLUG = null;

// ============================================
// IMMEDIATE EXECUTION (runs before DOMContentLoaded)
// ============================================

(function initSlugFallback() {
  // Check if slug exists in URL
  const urlParams = new URLSearchParams(window.location.search);
  const currentSlug = urlParams.get("slug");

  // If no slug and fallback is enabled, add it immediately
  if (!currentSlug && DEFAULT_FALLBACK_SLUG) {
    console.log(
      `⚠️ No slug found in URL. Adding fallback: ${DEFAULT_FALLBACK_SLUG}`,
    );

    // Update URL with fallback slug
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("slug", DEFAULT_FALLBACK_SLUG);

    // Replace current URL without reload
    window.history.replaceState({}, "", newUrl);

    console.log(`✅ Fallback slug added to URL: ${newUrl.toString()}`);
  } else if (currentSlug) {
    console.log(`✅ Slug found in URL: ${currentSlug}`);
  } else {
    console.log(`⚠️ No slug in URL and fallback is disabled`);
  }
})();

// ============================================
// ERROR HANDLER FOR 404 SLUGS
// ============================================

// Listen for portfolio fetch errors
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
            console.log(
              `⚠️ Slug "${currentSlug}" failed. Trying fallback: ${DEFAULT_FALLBACK_SLUG}`,
            );

            // Update URL and reload
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

  console.log("✅ Slug fallback manager initialized");
  if (DEFAULT_FALLBACK_SLUG) {
    console.log(`   Default fallback slug: ${DEFAULT_FALLBACK_SLUG}`);
  } else {
    console.log("   Fallback disabled (no default slug set)");
  }
});
