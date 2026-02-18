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
  const componentBaseUrl = scriptUrl.href.replace("load-basics.js", "");

  console.log("[LoadBasics] Script location:", scriptUrl.href);
  console.log("[LoadBasics] Component base:", componentBaseUrl);

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

    console.log("[LoadBasics] Current path:", currentPath);
    console.log("[LoadBasics] Depth:", depth);
    console.log("[LoadBasics] Path prefix:", prefix || "(root)");

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

          console.log(`[LoadBasics] Path adjusted: ${path} -> ${relativePath}`);

          return `${attr}=${quote1}${relativePath}${quote2}`;
        } catch (e) {
          console.warn("[LoadBasics] Could not adjust path:", path, e);
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

    return relativeParts.join("/") || "./";
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
      console.log(
        "[LoadBasics] Injected head element:",
        element.tagName,
        element.rel || element.name,
      );
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

    console.log("[LoadBasics] Injected HTML content");
  }

  /**
   * Execute scripts from the loaded HTML
   */
  function executeScripts(scripts) {
    scripts.forEach((script) => {
      if (script.src) {
        // External script - create new script element
        const newScript = document.createElement("script");
        newScript.src = script.src;

        // Copy attributes
        Array.from(script.attributes).forEach((attr) => {
          if (attr.name !== "src") {
            newScript.setAttribute(attr.name, attr.value);
          }
        });

        document.body.appendChild(newScript);
        //console.log("[LoadBasics] Loaded external script:", script.src);
      } else {
        // Inline script - execute code
        try {
          const scriptContent = script.textContent;

          // Use Function constructor to execute in global scope
          const func = new Function(scriptContent);
          func();

          console.log("[LoadBasics] Executed inline script");
        } catch (e) {
          console.error("[LoadBasics] Error executing inline script:", e);
        }
      }
    });
  }

  /**
   * Main loader function
   */
  async function loadComponent() {
    //console.log("[LoadBasics] Starting component load...");

    try {
      // Fetch the component HTML
      const componentUrl = componentBaseUrl + CONFIG.componentFileName;
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
      executeScripts(scripts);

      console.log("[LoadBasics] Component successfully loaded and injected!");

      // Dispatch custom event
      window.dispatchEvent(
        new CustomEvent("loadBasicsReady", {
          detail: { timestamp: Date.now() },
        }),
      );
    } catch (error) {
      console.error("[LoadBasics] Error loading component:", error);
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
