/**
 * Portfolio index loader
 * Loads the reusable portfolio catalog after load-basics has created the page shell.
 */
(function () {
  "use strict";

  const scriptUrl = new URL(document.currentScript.src);
  const componentBaseUrl = new URL(
    "./",
    scriptUrl.href,
  ).href;
  const assetVersion = scriptUrl.searchParams.get("v") || "1";
  let loaded = false;

  function loadExternalScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  async function loadPortfolioIndex() {
    if (loaded) return;
    loaded = true;

    try {
      const response = await fetch(
        componentBaseUrl + `portfolio-index.html?v=${assetVersion}`,
      );
      if (!response.ok) {
        throw new Error(`Portfolio index failed: ${response.status}`);
      }

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const page = doc.querySelector("#portfolio-index-page");
      const main = document.querySelector("main");

      if (!page || !main) {
        throw new Error("Portfolio index target is not available");
      }

      const stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.href = componentBaseUrl + `portfolio-index.css?v=${assetVersion}`;
      document.head.appendChild(stylesheet);

      main.appendChild(page);
      document.title = "Portafolio | Klef Agency";

      await loadExternalScript(
        componentBaseUrl + `portfolio-manager.js?v=${assetVersion}`,
      );
      await loadExternalScript(
        componentBaseUrl + `../index-portfolio/portfolio-grid.js?v=${assetVersion}`,
      );
      await loadExternalScript(
        componentBaseUrl + `portfolio-index-runtime.js?v=${assetVersion}`,
      );

      window.dispatchEvent(
        new CustomEvent("portfolioIndexReady", {
          detail: { timestamp: Date.now() },
        }),
      );
    } catch (error) {
      loaded = false;
      console.error("[PortfolioIndex] Error loading portfolio index:", error);
    }
  }

  window.addEventListener("loadBasicsReady", loadPortfolioIndex, { once: true });

  setTimeout(() => {
    if (!loaded) loadPortfolioIndex();
  }, 3000);
})();
