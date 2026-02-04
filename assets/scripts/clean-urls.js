/**
 * Clean URLs Utility
 * Maintains clean URLs by intercepting hash-based navigation while preserving smooth scrolling functionality.
 *
 * Features:
 * - Intercepts all hash links (href="#...")
 * - Prevents URL hash updates while enabling smooth scrolling
 * - Cleans up existing hashes on page load
 * - Accessibility-friendly with proper focus management
 * - iOS/Safari compatible
 */

(function () {
  "use strict";

  const CleanUrls = {
    /**
     * Configuration options
     */
    config: {
      // CSS selector for hash links to intercept (leave empty for all)
      selector: 'a[href^="#"]',
      // Smooth scroll behavior options
      scrollBehavior: {
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      },
      // Whether to clean existing hash on page load
      cleanOnLoad: true,
      // Duration to wait before cleaning hash (ms) - allows for any initial scroll animations
      cleanDelay: 100,
      // Offset for scroll position (useful for fixed headers)
      scrollOffset: 0,
    },

    /**
     * Scroll to a target element by ID
     * @param {string} id - The element ID to scroll to
     */
    scrollTo(id) {
      const element = document.getElementById(id);

      if (!element) {
        console.warn(`[CleanUrls] Element with ID "${id}" not found`);
        return false;
      }

      // Apply scroll offset if configured
      const scrollOptions = { ...this.config.scrollBehavior };

      if (this.config.scrollOffset !== 0) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - this.config.scrollOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: scrollOptions.behavior,
        });
      } else {
        element.scrollIntoView(scrollOptions);
      }

      // Accessibility: Set focus to the target element after scroll
      // This ensures screen readers can read the content
      element.setAttribute("tabindex", "-1");
      setTimeout(() => {
        element.focus({ preventScroll: true });
      }, 500);

      return true;
    },

    /**
     * Clean hash from URL on page load
     * Uses history.replaceState to remove hash without triggering scroll
     */
    cleanInitialHash() {
      if (!window.location.hash) {
        return;
      }

      // Store the target ID for potential scrolling
      const targetId = window.location.hash.slice(1);

      // Replace the URL with a clean version (pathname + search, no hash)
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );

      // Optionally scroll to the target element
      if (targetId) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          this.scrollTo(targetId);
        }, this.config.cleanDelay);
      }
    },

    /**
     * Handle hash link click events
     * @param {Event} event - Click event
     */
    handleClick(event) {
      // Use event delegation - find closest anchor with hash href
      const link = event.target.closest(this.config.selector);

      if (!link) {
        return;
      }

      // Get the hash from href
      const href = link.getAttribute("href");
      const hash = href.startsWith("#") ? href.slice(1) : null;

      if (!hash) {
        return;
      }

      // Prevent default browser behavior (URL hash update + instant scroll)
      event.preventDefault();

      // Scroll to the target element
      this.scrollTo(hash);

      // Update URL without hash using replaceState (doesn't create history entry)
      // This keeps the URL clean
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    },

    /**
     * Initialize the CleanUrls utility
     */
    init() {
      // Clean existing hash on page load
      if (this.config.cleanOnLoad) {
        // Use a small delay to ensure DOM is ready
        setTimeout(() => {
          this.cleanInitialHash();
        }, this.config.cleanDelay);
      }

      // Add click event listener for hash links
      document.addEventListener("click", (event) => {
        this.handleClick(event);
      });

      // Expose utility methods globally for programmatic use
      window.CleanUrls = {
        scrollTo: this.scrollTo.bind(this),
        cleanHash: () =>
          history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search,
          ),
        config: this.config,
      };
    },
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => CleanUrls.init());
  } else {
    // DOM already loaded
    CleanUrls.init();
  }
})();
