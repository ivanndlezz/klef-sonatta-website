(function () {
  "use strict";

  var map = document.querySelector("[data-contact-map]");
  if (!map) return;

  var iframe = map.querySelector("iframe[data-src]");
  var placeholder = map.querySelector("[data-map-placeholder]");
  var status = map.querySelector("[data-map-status]");
  if (!iframe) return;

  var fallbackTimer;

  function setState(state, message) {
    map.dataset.state = state;
    if (status && message) status.textContent = message;
    if (placeholder) placeholder.setAttribute("aria-hidden", state === "loaded" ? "true" : "false");
  }

  function loadMap() {
    if (!iframe.dataset.src) return;

    setState("loading", "Cargando ubicación…");
    iframe.addEventListener("load", function () {
      window.clearTimeout(fallbackTimer);
      setState("loaded", "Mapa cargado.");
    }, { once: true });

    fallbackTimer = window.setTimeout(function () {
      if (map.dataset.state !== "loaded") {
        setState("error", "No pudimos mostrar el mapa. Usa “Cómo llegar”.");
      }
    }, 12000);

    iframe.src = iframe.dataset.src;
    iframe.removeAttribute("data-src");
  }

  if (!("IntersectionObserver" in window)) {
    loadMap();
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
    observer.disconnect();
    loadMap();
  }, { rootMargin: "250px 0px" });

  observer.observe(map);
})();
