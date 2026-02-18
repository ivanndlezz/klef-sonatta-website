/**
 * Portfolio Loader - Smart Runtime Loader
 *
 * Dynamically loads the portfolio component from any page location.
 * Automatically calculates and adjusts all relative paths.
 *
 * Usage: <script src="[path-to]/portfolio-loader.js"></script>
 */

(function () {
  "use strict";

  // Detect the script's own location
  const scriptUrl = new URL(document.currentScript.src);
  const componentBaseUrl = scriptUrl.href.replace("portfolio-loader.js", "");

  //console.log("[PortfolioLoader] Script location:", scriptUrl.href);
  //console.log("[PortfolioLoader] Component base:", componentBaseUrl);

  /**
   * Adjust all relative paths in the HTML content
   */
  function adjustPaths(html) {
    const adjustedHtml = html.replace(
      /(src|href|data-src|srcset)=(["'])([^"']*)(["'])/gi,
      (match, attr, quote1, path, quote2) => {
        // Skip external URLs, absolute paths, and data URIs
        if (
          path.startsWith("http") ||
          path.startsWith("//") ||
          path.startsWith("/") ||
          path.startsWith("#") ||
          path.startsWith("data:")
        ) {
          return match;
        }

        // For relative paths starting with ./ or ../
        try {
          const absoluteUrl = new URL(path, componentBaseUrl);
          const currentPageUrl = new URL(window.location.href);
          const relativePath = makeRelativePath(
            currentPageUrl.href,
            absoluteUrl.href,
          );

          //console.log( `[PortfolioLoader] Path adjusted: ${path} -> ${relativePath}`,);

          return `${attr}=${quote1}${relativePath}${quote2}`;
        } catch (e) {
          //console.warn("[PortfolioLoader] Could not adjust path:", path, e);
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

    if (from.origin !== to.origin) {
      return to.href;
    }

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
   * Main loader function
   */
  async function loadPortfolio() {
    //console.log("[PortfolioLoader] Starting portfolio load...");

    try {
      // Fetch the portfolio HTML
      const portfolioUrl = componentBaseUrl + "index.html";
      //console.log("[PortfolioLoader] Fetching:", portfolioUrl);

      const response = await fetch(portfolioUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to load portfolio: ${response.status} ${response.statusText}`,
        );
      }

      let htmlContent = await response.text();
      //console.log(
      //  "[PortfolioLoader] Portfolio loaded, size:",
      //  htmlContent.length,
      //  "bytes",
      //);

      // Adjust all paths in the HTML
      htmlContent = adjustPaths(htmlContent);

      // Parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");

      // Find the main element to inject into
      const mainElement = document.querySelector("main");

      if (!mainElement) {
        throw new Error("No <main> element found in the page!");
      }

      // Extract and inject the body content (excluding scripts)
      Array.from(doc.body.children).forEach((child) => {
        if (child.tagName !== "SCRIPT") {
          // If child is MAIN, convert to DIV to avoid nesting
          // since load-basics already provides the <main> shell
          if (child.tagName === "MAIN") {
            const div = document.createElement("div");
            // Copy attributes
            Array.from(child.attributes).forEach((attr) => {
              div.setAttribute(attr.name, attr.value);
            });
            // Copy content
            div.innerHTML = child.innerHTML;
            mainElement.appendChild(div);
            //console.log("[PortfolioLoader] Converted nested <main> to <div>");
          } else {
            mainElement.appendChild(child.cloneNode(true));
          }
        }
      });

      //console.log("[PortfolioLoader] HTML content injected into <main>");

      // Extract and inject styles from head
      const styles = Array.from(
        doc.head.querySelectorAll('style, link[rel="stylesheet"]'),
      );
      styles.forEach((styleElement) => {
        const clone = styleElement.cloneNode(true);
        document.head.appendChild(clone);
        //console.log("[PortfolioLoader] Injected style:", styleElement.tagName);
      });

      // Extract and execute scripts
      const scripts = Array.from(doc.querySelectorAll("script"));

      for (const script of scripts) {
        if (script.src) {
          // External script
          await new Promise((resolve, reject) => {
            const newScript = document.createElement("script");

            // Adjust the script src path
            const scriptPath = script.src;
            let adjustedPath;

            if (
              scriptPath.startsWith("http") ||
              scriptPath.startsWith("//") ||
              scriptPath.startsWith("/")
            ) {
              adjustedPath = scriptPath;
            } else {
              try {
                const absoluteUrl = new URL(scriptPath, componentBaseUrl);
                adjustedPath = makeRelativePath(
                  window.location.href,
                  absoluteUrl.href,
                );
              } catch (e) {
                adjustedPath = scriptPath;
              }
            }

            newScript.src = adjustedPath;

            // Copy attributes
            Array.from(script.attributes).forEach((attr) => {
              if (attr.name !== "src") {
                newScript.setAttribute(attr.name, attr.value);
              }
            });

            newScript.onload = () => {
              //console.log("[PortfolioLoader] Loaded script:", adjustedPath);
              resolve();
            };
            newScript.onerror = reject;

            document.body.appendChild(newScript);
          });
        } else if (script.textContent.trim()) {
          // Inline script - execute
          try {
            const func = new Function(script.textContent);
            func();
            //console.log("[PortfolioLoader] Executed inline script");
          } catch (e) {
            console.error(
              "[PortfolioLoader] Error executing inline script:",
              e,
            );
          }
        }
      }

      //console.log("[PortfolioLoader] Portfolio successfully loaded!");

      // Dispatch custom event
      window.dispatchEvent(
        new CustomEvent("portfolioReady", {
          detail: { timestamp: Date.now() },
        }),
      );
    } catch (error) {
      console.error("[PortfolioLoader] Error loading portfolio:", error);
      throw error;
    }
  }

  // Wait for load-basics to be ready first
  let loaded = false;

  function initPortfolio() {
    if (loaded) return; // Prevent double execution
    loaded = true;
    //console.log("[PortfolioLoader] Initializing portfolio...");
    loadPortfolio();
  }

  // Listen for the loadBasicsReady event
  window.addEventListener("loadBasicsReady", initPortfolio);

  // Fallback: If event hasn't fired within 3 seconds, load anyway
  setTimeout(() => {
    if (!loaded) {
      console.warn(
        "[PortfolioLoader] loadBasicsReady timeout, loading portfolio anyway...",
      );
      initPortfolio();
    }
  }, 3000);

  // Also check if load-basics already finished (race condition)
  if (document.readyState === "complete" || document.querySelector("main")) {
    // Give it a small delay to see if the event fires naturally
    setTimeout(() => {
      if (!loaded) {
        //console.log(
        //  "[PortfolioLoader] DOM ready and main exists, loading portfolio...",
        //);
        initPortfolio();
      }
    }, 100);
  }
})();
