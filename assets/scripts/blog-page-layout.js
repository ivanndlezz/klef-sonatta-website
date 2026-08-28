/**
 * Places the statically authored blog page inside the shared Klef shell.
 */
(function () {
  "use strict";

  function placeBlogContent() {
    const page = document.querySelector(".klef-blog-page");
    const shellMain = document.querySelector("body > main");
    if (!page || !shellMain || page.parentElement === shellMain) return;
    shellMain.appendChild(page);
  }

  window.addEventListener("loadBasicsReady", placeBlogContent, { once: true });
  window.setTimeout(placeBlogContent, 1500);
})();
