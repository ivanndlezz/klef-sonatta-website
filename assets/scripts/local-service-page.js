/**
 * Places the statically authored local-service article inside the shared
 * Klef shell. The common loader inserts its navigation, main and footer at
 * the beginning of body; this keeps the article between the main and footer
 * without changing the home or portfolio layouts.
 */
(function () {
  "use strict";

  function placeServiceContent() {
    const article = document.querySelector(".klef-local-page");
    const shellMain = document.querySelector("body > main");

    if (!article || !shellMain || article.parentElement === shellMain) return;
    shellMain.appendChild(article);
  }

  window.addEventListener("loadBasicsReady", placeServiceContent, { once: true });
  window.setTimeout(placeServiceContent, 1500);
})();
