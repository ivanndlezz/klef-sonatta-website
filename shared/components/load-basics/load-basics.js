/**
 * Load Basics - Smart Runtime Loader
 *
 * Dynamically loads the load-basics.html component from any page location.
 * Automatically calculates and adjusts all relative paths.
 *
 * Usage: <script src="[path-to]/load-basics.js"></script>
 */

(function () {
  "use strict";

  // Configuration
  const CONFIG = {
    componentFileName: "load-basics.html",
    targetElement: document.body,
    insertPosition: "afterbegin", // or 'beforeend'
  };

  // Detect the script's own location
  const scriptUrl = new URL(document.currentScript.src);
  const componentBaseUrl = new URL("./", scriptUrl).href;

  /**
   * Calculate the path prefix needed to reach the project root
   * from the current page location
   */
  function calculatePathPrefix() {
    const currentPath = window.location.pathname;

    // Count how many directory levels deep the current page is
    // (excluding the filename itself)
    const pathParts = currentPath.split("/").filter((part) => part.length > 0);

    // Remove the last part if it's a filename (has extension)
    if (pathParts.length > 0 && pathParts[pathParts.length - 1].includes(".")) {
      pathParts.pop();
    }

    const depth = pathParts.length;
    const prefix = "../".repeat(depth);

    return prefix;
  }

  /**
   * Adjust all relative paths in the HTML content
   * Replaces "../../../" style paths with the correct prefix for the current page
   */
  function adjustPaths(html, pathPrefix) {
    // Replace asset paths that start with ../../../
    // These are paths relative to load-basics.html location

    // For paths like ../../../assets/..., we need to calculate
    // how to get from current page to the component, then apply the original path

    // Strategy: Convert component-relative paths to absolute URLs,
    // then back to page-relative paths

    const adjustedHtml = html.replace(
      /(src|href|data-src|srcset)=(["'])([^"']*)(["'])/gi,
      (match, attr, quote1, path, quote2) => {
        // Skip external URLs and absolute paths
        if (
          path.startsWith("http") ||
          path.startsWith("//") ||
          path.startsWith("/") ||
          path.startsWith("#")
        ) {
          return match;
        }

        // Skip data URIs
        if (path.startsWith("data:")) {
          return match;
        }

        // For relative paths, resolve them relative to the component location
        try {
          const absoluteUrl = new URL(path, componentBaseUrl);

          // Convert back to relative path from current page
          const currentPageUrl = new URL(window.location.href);
          const relativePath = makeRelativePath(
            currentPageUrl.href,
            absoluteUrl.href,
          );

          // Debug: console.log(`[LoadBasics] Path adjusted: ${path} -> ${relativePath}`);

          return `${attr}=${quote1}${relativePath}${quote2}`;
        } catch (e) {
          // Debug: console.warn("[LoadBasics] Could not adjust path:", path, e);
          return match;
        }
      },
    );

    return adjustedHtml;
  }

  /**
   * Create a relative path from one URL to another
   */
  function makeRelativePath(fromUrl, toUrl) {
    const from = new URL(fromUrl);
    const to = new URL(toUrl);

    // If different origins, return absolute URL
    if (from.origin !== to.origin) {
      return to.href;
    }

    // Split paths into segments
    const fromParts = from.pathname.split("/").filter((p) => p);
    const toParts = to.pathname.split("/").filter((p) => p);

    // Remove filename from 'from' path
    if (fromParts.length > 0 && fromParts[fromParts.length - 1].includes(".")) {
      fromParts.pop();
    }

    // Find common base
    let commonLength = 0;
    while (
      commonLength < fromParts.length &&
      commonLength < toParts.length &&
      fromParts[commonLength] === toParts[commonLength]
    ) {
      commonLength++;
    }

    // Build relative path
    const upLevels = fromParts.length - commonLength;
    const downPath = toParts.slice(commonLength);

    const relativeParts = [];
    for (let i = 0; i < upLevels; i++) {
      relativeParts.push("..");
    }
    relativeParts.push(...downPath);

    const relativePath = relativeParts.join("/") || "./";
    return relativePath + to.search + to.hash;
  }

  /**
   * Extract content sections from the loaded HTML
   */
  function extractContent(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // Extract styles (both inline and external)
    const styles = Array.from(
      doc.querySelectorAll('style, link[rel="stylesheet"]'),
    );

    // Extract head elements (favicons, meta tags)
    const headElements = Array.from(
      doc.querySelectorAll(
        'link[rel*="icon"], link[rel="apple-touch-icon"], meta[name="msapplication-TileImage"]',
      ),
    );

    // Extract all body content
    const body = doc.body;

    // Extract inline scripts (we'll need to re-execute them)
    const scripts = Array.from(doc.querySelectorAll("script"));

    return { styles, body, scripts, headElements, doc };
  }

  /**
   * Inject styles into the current page
   */
  function injectStyles(styles) {
    styles.forEach((styleElement) => {
      const clone = styleElement.cloneNode(true);
      document.head.appendChild(clone);
      //console.log("[LoadBasics] Injected style:", styleElement.tagName);
    });
  }

  /**
   * Inject head elements (favicons, meta tags) into the current page
   */
  function injectHeadElements(elements) {
    elements.forEach((element) => {
      const clone = element.cloneNode(true);
      document.head.appendChild(clone);
    });
  }

  /**
   * Inject HTML content into the page
   */
  function injectHTML(bodyElement) {
    // Clone all child nodes from the loaded body
    const fragment = document.createDocumentFragment();

    Array.from(bodyElement.children).forEach((child) => {
      // Skip script tags - we'll handle them separately
      if (child.tagName !== "SCRIPT") {
        fragment.appendChild(child.cloneNode(true));
      }
    });

    // Insert into target element
    if (CONFIG.insertPosition === "afterbegin") {
      CONFIG.targetElement.insertBefore(
        fragment,
        CONFIG.targetElement.firstChild,
      );
    } else {
      CONFIG.targetElement.appendChild(fragment);
    }
  }

  /**
   * Keep authored page content between the shared shell's <main> and <footer>.
   * load-basics is inserted at the beginning of <body>, so pages must opt in
   * with data-shell-content instead of relying on source order.
   */
  function placeShellContent() {
    const shellMain = document.querySelector("body > main");
    if (!shellMain) return;

    Array.from(document.body.children)
      .filter((child) => child.hasAttribute("data-shell-content"))
      .forEach((content) => {
        if (content.parentElement !== shellMain) shellMain.appendChild(content);
      });
  }

  function directContactMarkup() {
    return `
      <div class="contact-sheet-content">
        <div class="contact-cta-section">
          <h3>¿Listo para comenzar?</h3>
          <div class="contact-options">
            <a href="tel:+526245161037" class="contact-option phone">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <span>Atención al cliente</span>
            </a>

            <a href="https://wa.me/526241682048" class="contact-option phone">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>Soporte técnico</span>
            </a>

            <a href="mailto:info@klef.agency" class="contact-option email">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span>info@klef.agency</span>
            </a>

            <a href="https://wa.me/526245161037" class="contact-option whatsapp" target="_blank" rel="noopener">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/>
              </svg>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
        <div class="social-section">
          <h4>Síguenos</h4>
          <div class="social-links">
            <a href="https://www.instagram.com/klef.agency/" target="_blank" rel="noopener" aria-label="Instagram">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.79 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://www.facebook.com/klef.agency/" target="_blank" rel="noopener" aria-label="Facebook">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </a>
            <a href="https://www.youtube.com/channel/UCYFT6kwbsDzbiK6OjuKWM5w" target="_blank" rel="noopener" aria-label="YouTube">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.872.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // Keep one canonical contact-sheet visual for every loading path.
  window.KlefContactMarkup = directContactMarkup;

  /**
   * Keep direct contact usable even when optional shell scripts are delayed.
   * This intentionally bypasses the generic sheet renderer and has no form.
   */
  function initDirectContactSheet() {
    const sheet = document.getElementById("bottomsheet");
    const backdrop = document.getElementById("backdrop");
    const content = document.getElementById("sheet-content");
    const buttons = document.querySelectorAll(
      '[data-action="open-contact-sheet"]',
    );

    if (!sheet || !backdrop || !content || !buttons.length) return;
    if (sheet.dataset.directContactReady === "true") return;

    const directChrome = [
      sheet.querySelector(".top-controls-left"),
      sheet.querySelector(".top-controls-dropdown"),
      sheet.querySelector(".sheet-bottom-controls"),
    ].filter(Boolean);

    const setDirectChrome = (hidden) => {
      directChrome.forEach((element) => {
        element.hidden = hidden;
      });
    };

    const close = () => {
      sheet.classList.remove("open", "full");
      backdrop.classList.remove("visible");
      document.body.classList.remove("scroll-locked");
      document.body.style.overflow = "";
      setDirectChrome(false);
    };

    const open = (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      content.innerHTML = directContactMarkup();
      setDirectChrome(true);
      sheet.classList.add("open");
      backdrop.classList.add("visible");
      document.body.classList.add("scroll-locked");
      document.body.style.overflow = "hidden";
    };

    buttons.forEach((button) => button.addEventListener("click", open));
    sheet.querySelector("#close-btn")?.addEventListener("click", close);
    backdrop.addEventListener("click", close);
    sheet.dataset.directContactReady = "true";
  }

  /**
   * Execute scripts from the loaded HTML
   */
  async function executeScripts(scripts) {
    for (const script of scripts) {
      if (script.src) {
        // Fetch and execute external shell scripts as inline scripts. This
        // avoids the browser race where dynamically appended external scripts
        // appear in the DOM but never initialize their global APIs.
        const response = await fetch(script.src);
        if (!response.ok) {
          throw new Error(`Failed to load shell script: ${response.status}`);
        }

        const source = await response.text();
        const executeExternalScript = new Function(
          `${source}\n//# sourceURL=${script.src}`,
        );
        executeExternalScript();
      } else {
        // Inline script - execute code
        try {
          const scriptContent = script.textContent;

          // Use Function constructor to execute in global scope
          const func = new Function(scriptContent);
          func();

          // Debug: console.log("[LoadBasics] Executed inline script");
        } catch (e) {
          // Debug: console.error("[LoadBasics] Error executing inline script:", e);
        }
      }
    }
  }

  /**
   * Main loader function
   */
  async function loadComponent() {
    //console.log("[LoadBasics] Starting component load...");

    try {
      // Fetch the component HTML
      const componentUrl =
        componentBaseUrl + CONFIG.componentFileName + "?v=12";
      //console.log("[LoadBasics] Fetching:", componentUrl);

      const response = await fetch(componentUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to load component: ${response.status} ${response.statusText}`,
        );
      }

      let htmlContent = await response.text();
      //console.log(
      //  "[LoadBasics] Component loaded, size:",
      //  htmlContent.length,
      //  "bytes",
      //);

      // Calculate path prefix
      const pathPrefix = calculatePathPrefix();

      // Adjust all paths in the HTML
      htmlContent = adjustPaths(htmlContent, pathPrefix);

      // Extract content sections
      const { styles, body, scripts, headElements } =
        extractContent(htmlContent);

      // Inject in order: styles -> head elements -> HTML -> scripts
      injectStyles(styles);
      injectHeadElements(headElements);
      injectHTML(body);
      placeShellContent();
      initDirectContactSheet();
      await executeScripts(scripts);

      // Dispatch custom event
      window.dispatchEvent(
        new CustomEvent("loadBasicsReady", {
          detail: { timestamp: Date.now() },
        }),
      );
    } catch (error) {
      // Debug: console.error("[LoadBasics] Error loading component:", error);
      throw error;
    }
  }

  // Auto-load when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadComponent);
  } else {
    // DOM already loaded, run immediately
    loadComponent();
  }
})();
