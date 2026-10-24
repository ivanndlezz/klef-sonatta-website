(function () {
  "use strict";

  var article = document.querySelector(".klef-blog-article");
  if (!article) return;
  if (!article.id) article.id = "top";

  document.body.classList.add("klef-blog-reader-mode");

  var savedStorageKey = "klef.blog.saved.v1";
  var articleSlug = window.location.pathname.split("/").filter(Boolean).pop() || "";
  var articleSaved = false;
  try {
    var savedRaw = window.localStorage.getItem(savedStorageKey);
    var savedItems = savedRaw ? JSON.parse(savedRaw) : [];
    articleSaved = Array.isArray(savedItems) && savedItems.includes(articleSlug);
  } catch (error) {
    articleSaved = false;
  }

  var readerExploreIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
  var readerBookmarkIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.75h12a1.5 1.5 0 0 1 1.5 1.5v15l-7.5-4.5-7.5 4.5v-15a1.5 1.5 0 0 1 1.5-1.5Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
  var readerTopIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

  var readerBottom = document.createElement("nav");
  readerBottom.className = "klef-blog-reader-bottom";
  readerBottom.setAttribute("aria-label", "Controles de lectura");
  readerBottom.innerHTML = `
    <a class="klef-blog-reader-link" href="/blog/"><span class="klef-blog-reader-action-icon">${readerExploreIcon}</span><span>Explorar</span></a>
    <div class="klef-blog-reader-progress" aria-label="Progreso de lectura">
      <span class="klef-blog-reader-progress-label" data-progress-label>0% leído</span>
      <span class="klef-blog-reader-progress-track" data-progress-track role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="0% leído">
        <span class="klef-blog-reader-progress-fill" data-progress-fill></span>
      </span>
    </div>
    <button class="klef-blog-reader-save" type="button" data-reader-save aria-pressed="${articleSaved}" aria-label="${articleSaved ? "Quitar de guardados" : "Guardar artículo"}"><span class="klef-blog-reader-action-icon">${readerBookmarkIcon}</span><span data-reader-save-label>${articleSaved ? "Guardado" : "Guardar"}</span></button>
  `;

  var backLink = article.querySelector(".klef-blog-back");
  if (backLink) {
    article.insertBefore(readerBottom, backLink);
  } else {
    article.appendChild(readerBottom);
  }

  var fill = readerBottom.querySelector("[data-progress-fill]");
  var label = readerBottom.querySelector("[data-progress-label]");
  var track = readerBottom.querySelector("[data-progress-track]");
  var readerMarkup = readerBottom.innerHTML;
  var footerFallbackMarkup = `
    <a class="klef-blog-reader-link" href="/blog/"><span class="klef-blog-reader-action-icon">${readerExploreIcon}</span><span>Explorar</span></a>
    <span class="klef-blog-reader-progress-label">Llegaste al final</span>
    <a class="klef-blog-reader-link" href="#top" data-reader-top><span class="klef-blog-reader-action-icon">${readerTopIcon}</span><span>Subir</span></a>
  `;
  var nextArticle = null;
  var footerActive = false;
  var staticFooterSnapshot = null;

  var renderStaticFooterIsland = function () {
    var container = document.querySelector(".dynamic-island-container");
    var island = container && container.querySelector(".dynamic-island");
    if (!container || !island) return false;

    if (!staticFooterSnapshot) {
      staticFooterSnapshot = {
        islandClass: island.className,
        islandHtml: island.innerHTML,
      };
    }

    var lucideIcon = function (name) {
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#${name}"></use></svg>`;
    };
    var iconList = lucideIcon("icon-stacked-list");
    var iconTop = lucideIcon("arrow-up");
    var iconNext = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

    island.className = "dynamic-island expanded blog-footer-navigation";
    island.innerHTML = `
      <button class="close-btn" aria-label="Cerrar" type="button">×</button>
      <div class="island-content blog-footer-navigation-content">
        <button class="island-btn secondary" data-blog-footer-action="explore" type="button"><span class="icon">${iconList}</span><span>Explorar</span></button>
        <button class="island-btn primary" data-blog-footer-action="top" type="button"><span class="icon">${iconTop}</span><span>Subir</span></button>
        <button class="island-btn accent" data-blog-footer-action="next" type="button"><span class="icon">${iconNext}</span><span>${nextArticle ? "Siguiente" : "Inicio"}</span></button>
      </div>
    `;

    if (!island.dataset.blogFooterActions) {
      island.dataset.blogFooterActions = "true";
      island.addEventListener("click", function (event) {
        var action = event.target.closest("[data-blog-footer-action]")?.dataset.blogFooterAction;
        if (action === "explore") window.location.href = "/blog/";
        if (action === "top") window.scrollTo({ top: 0, behavior: "smooth" });
        if (action === "next") window.location.href = nextArticle ? nextArticle.url : "/";
      });
    }

    container.classList.add("visible");
    return true;
  };

  var requestDynamicIsland = function () {
    if (window.Klef && window.Klef.DynamicIsland) return;
    if (document.querySelector("script[data-klef-blog-dynamic-island]")) return;

    if (!document.querySelector('link[data-klef-blog-dynamic-island-style]')) {
      var styleLink = document.createElement("link");
      styleLink.rel = "stylesheet";
      styleLink.href = new URL("../../shared/components/dynamic-island/dynamic-island.css", document.baseURI).href;
      styleLink.dataset.klefBlogDynamicIslandStyle = "true";
      document.head.appendChild(styleLink);
    }

    var script = document.createElement("script");
    script.src = new URL("../../shared/components/dynamic-island/dynamic-island.js", document.baseURI).href;
    script.dataset.klefBlogDynamicIsland = "true";
    document.head.appendChild(script);
  };

  var update = function () {
    if (!fill || !label || !track) return;
    var bounds = article.getBoundingClientRect();
    var start = window.scrollY + bounds.top;
    var total = Math.max(1, article.offsetHeight - window.innerHeight * 0.55);
    var amount = Math.min(100, Math.max(0, ((window.scrollY - start + window.innerHeight * 0.35) / total) * 100));
    var rounded = Math.round(amount);
    fill.style.width = amount + "%";
    label.textContent = rounded + "% leído";
    track.setAttribute("aria-valuenow", String(rounded));
    track.setAttribute("aria-valuetext", rounded + "% leído");
  };

  var renderFooterIsland = function () {
    var api = window.Klef && window.Klef.DynamicIsland;
    var preset = api && api.presets && api.presets.blog_footer_navigation;
    if (!api || !preset) return renderStaticFooterIsland();

    if (!api.instance() && typeof api.init === "function") api.init();

    var data = {
      explore: {
        icon: preset.data.explore.icon,
        name: preset.data.explore.name,
        function: function () {
          window.location.href = "/blog/";
        },
      },
      top: {
        icon: preset.data.top.icon,
        name: preset.data.top.name,
        function: function () {
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
      },
      next: {
        icon: preset.data.next.icon,
        name: nextArticle ? "Siguiente" : "Inicio",
        function: function () {
          window.location.href = nextArticle ? nextArticle.url : "/";
        },
      },
    };

    api.set({
      presetName: "blog_footer_navigation",
      getHtmlStructure: preset.getHtmlStructure,
      data: data,
    });

    var instance = api.instance();
    if (!instance || !instance.container || !instance.island) return false;

    instance.currentPreset = "blog_footer_navigation";
    instance.container.classList.add("visible");
    instance.island.classList.remove("pill");
    instance.island.classList.add("expanded", "blog-footer-navigation");
    return true;
  };

  var activateFooterIsland = function (attempt) {
    if (!footerActive) return;
    if (attempt === 0) requestDynamicIsland();
    if (renderFooterIsland()) {
      document.body.classList.add("klef-blog-footer-mode");
      readerBottom.classList.remove("klef-blog-reader-bottom--fallback");
      return;
    }

    if (attempt < 20) {
      window.setTimeout(function () {
        activateFooterIsland(attempt + 1);
      }, 250);
    } else {
      readerBottom.classList.add("klef-blog-reader-bottom--fallback");
    }
  };

  var enterFooterState = function () {
    if (footerActive) return;
    footerActive = true;
    readerBottom.dataset.state = "footer";
    readerBottom.innerHTML = footerFallbackMarkup;
    activateFooterIsland(0);
  };

  var leaveFooterState = function () {
    if (!footerActive) return;
    footerActive = false;
    document.body.classList.remove("klef-blog-footer-mode");
    readerBottom.dataset.state = "reading";
    readerBottom.classList.remove("klef-blog-reader-bottom--fallback");
    readerBottom.innerHTML = readerMarkup;
    fill = readerBottom.querySelector("[data-progress-fill]");
    label = readerBottom.querySelector("[data-progress-label]");
    track = readerBottom.querySelector("[data-progress-track]");
    update();

    var api = window.Klef && window.Klef.DynamicIsland;
    var instance = api && api.instance && api.instance();
    if (instance && instance.island && instance.container) {
      instance.island.classList.remove("blog-footer-navigation", "expanded");
      instance.island.classList.add("pill");
      instance.container.classList.remove("visible");
      if (typeof api.loadPreset === "function") api.loadPreset("search_totop");
    } else if (staticFooterSnapshot) {
      var staticIsland = document.querySelector(".dynamic-island");
      if (staticIsland) {
        staticIsland.className = staticFooterSnapshot.islandClass;
        staticIsland.innerHTML = staticFooterSnapshot.islandHtml;
        delete staticIsland.dataset.blogFooterActions;
      }
      var staticContainer = document.querySelector(".dynamic-island-container");
      if (staticContainer) staticContainer.classList.remove("visible");
    }
  };

  var installFooterObserver = function () {
    var footer = document.querySelector("body > footer") || document.querySelector("footer");
    if (!footer || !window.IntersectionObserver) return false;

    var observer = new IntersectionObserver(function (entries) {
      var entry = entries[0];
      if (!entry) return;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.08) {
        enterFooterState();
      } else {
        leaveFooterState();
      }
    }, {
      rootMargin: "0px 0px -15% 0px",
      threshold: [0, 0.08],
    });

    observer.observe(footer);
    return true;
  };

  readerBottom.addEventListener("click", function (event) {
    var saveControl = event.target.closest("[data-reader-save]");
    if (saveControl) {
      event.preventDefault();
      try {
        var savedRaw = window.localStorage.getItem(savedStorageKey);
        var savedItems = savedRaw ? JSON.parse(savedRaw) : [];
        var savedSet = new Set(Array.isArray(savedItems) ? savedItems.filter(function (slug) { return typeof slug === "string"; }) : []);
        if (savedSet.has(articleSlug)) savedSet.delete(articleSlug);
        else savedSet.add(articleSlug);
        articleSaved = savedSet.has(articleSlug);
        window.localStorage.setItem(savedStorageKey, JSON.stringify(Array.from(savedSet)));
      } catch (error) {
        articleSaved = !articleSaved;
      }
      saveControl.setAttribute("aria-pressed", String(articleSaved));
      saveControl.setAttribute("aria-label", articleSaved ? "Quitar de guardados" : "Guardar artículo");
      var saveLabel = saveControl.querySelector("[data-reader-save-label]");
      if (saveLabel) saveLabel.textContent = articleSaved ? "Guardado" : "Guardar";
      readerMarkup = readerBottom.innerHTML;
      return;
    }
    var topLink = event.target.closest("[data-reader-top]");
    if (!topLink) return;
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();

  fetch("/data/blog/index.json", { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) throw new Error("Blog index unavailable");
      return response.json();
    })
    .then(function (payload) {
      var items = Array.isArray(payload.items) ? payload.items : [];
      var currentSlug = window.location.pathname.split("/").filter(Boolean).pop();
      var currentIndex = items.findIndex(function (item) {
        return item && item.slug === currentSlug;
      });
      var candidate = currentIndex >= 0 ? items[currentIndex + 1] : null;
      if (candidate && candidate.slug) {
        nextArticle = {
          title: candidate.title || "Siguiente artículo",
          url: "/blog/" + encodeURIComponent(candidate.slug) + "/",
        };
        if (footerActive) renderFooterIsland();
      }
    })
    .catch(function () {
      // The footer still works with the Inicio fallback.
    });

  if (!installFooterObserver()) {
    window.addEventListener("loadBasicsReady", installFooterObserver, { once: true });
  }
})();
