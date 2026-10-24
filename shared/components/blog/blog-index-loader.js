/**
 * Progressive blog index enhancement.
 * The HTML fallback is already crawlable; this adds search and category
 * filters when the static index manifest is available.
 */
(function () {
  "use strict";

  const grid = document.getElementById("blog-grid");
  const filters = document.getElementById("blog-filters");
  const search = document.getElementById("blog-search");
  const featuredTarget = document.querySelector("[data-blog-featured]");
  const featuredSection = document.querySelector(".klef-blog-featured-section");
  const toolbar = document.querySelector(".klef-blog-toolbar");
  const homeNav = document.querySelector('[data-blog-nav="home"]');
  const exploreNav = document.querySelector('[data-blog-nav="explore"]');
  const savedNav = document.querySelector('[data-blog-nav="saved"]');
  const savedCount = document.querySelector("[data-blog-saved-count]");
  if (!grid || !filters || !search) return;

  document.body.classList.add("klef-blog-index-mode");

  const SAVED_STORAGE_KEY = "klef.blog.saved.v1";
  let savedSlugs = new Set();
  let savedView = false;

  function readSavedSlugs() {
    try {
      const raw = window.localStorage.getItem(SAVED_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed.filter((slug) => typeof slug === "string") : []);
    } catch (error) {
      return new Set();
    }
  }

  function writeSavedSlugs() {
    try {
      window.localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify([...savedSlugs]));
    } catch (error) {
      // The index remains usable when localStorage is unavailable.
    }
  }

  function updateSavedCount() {
    if (!savedCount) return;
    savedCount.textContent = String(savedSlugs.size);
    savedCount.hidden = savedSlugs.size === 0;
  }

  function saveButton(item) {
    const slug = escapeHtml(item.slug);
    const isSaved = savedSlugs.has(item.slug);
    const bookmarkIcon = '<svg viewBox="0 0 24 24"><path d="M6 3.75h12a1.5 1.5 0 0 1 1.5 1.5v15l-7.5-4.5-7.5 4.5v-15a1.5 1.5 0 0 1 1.5-1.5Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    return `<button class="klef-blog-save" type="button" data-blog-save="${slug}" aria-pressed="${isSaved}" aria-label="${isSaved ? "Quitar de guardados" : "Guardar artículo"}"><span class="klef-blog-save-icon" aria-hidden="true">${bookmarkIcon}</span>${isSaved ? " Guardado" : " Guardar"}</button>`;
  }

  savedSlugs = readSavedSlugs();
  updateSavedCount();

  const fallbackAuthor = {
    slug: "ivangonzalez",
    name: "Iván González",
    avatar: "/assets/images/portfolio/team/ivan-gonzalez-profile-photo-pic.jpg",
    url: "https://ivanklef.substack.com/",
  };

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("es-MX", { year: "numeric", month: "short", day: "numeric" }).format(date);
  };

  const authorFor = (item) => {
    const author = item && item.author && typeof item.author === "object" ? item.author : {};
    return {
      slug: item.authorSlug || fallbackAuthor.slug,
      name: author.name || item.authorName || fallbackAuthor.name,
      avatar: author.avatar || item.authorAvatar || fallbackAuthor.avatar,
      url: author.url || item.authorUrl || fallbackAuthor.url,
    };
  };

  const renderAuthor = (item) => {
    const author = authorFor(item);
    return `<span class="klef-blog-author"><img class="klef-blog-author-avatar" data-author-avatar src="${escapeHtml(author.avatar)}" alt="Foto de ${escapeHtml(author.name)}" width="40" height="40" loading="lazy"><span class="klef-blog-author-copy"><span class="klef-blog-author-label">Escrito por</span><span class="klef-blog-author-name" data-author-name>${escapeHtml(author.name)}</span></span></span>`;
  };

  async function loadBlog() {
    try {
      const response = await fetch("../data/blog/index.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`Blog index failed: ${response.status}`);
      const payload = await response.json();
      const items = (Array.isArray(payload.items) ? payload.items : []).filter((item) => item && item.listed !== false);
      if (!items.length) return;
      const featuredItem = items.find((item) => item.featured) || items[0];
      const gridItems = items.filter((item) => item.slug !== featuredItem.slug);

      const categories = [...new Set(items.flatMap((item) => Array.isArray(item.categories) ? item.categories : []))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "es"));
      let activeCategory = "all";

      function updateNavigationState() {
        const explorerActive = !savedView && Boolean(
          (toolbar && toolbar.dataset.explorer === "open")
          || search.value.trim()
          || activeCategory !== "all"
        );
        const homeActive = !savedView && !explorerActive;

        if (homeNav) {
          homeNav.dataset.state = homeActive ? "active" : "idle";
          if (homeActive) homeNav.setAttribute("aria-current", "page");
          else homeNav.removeAttribute("aria-current");
        }
        if (exploreNav) {
          exploreNav.dataset.state = explorerActive ? "active" : "idle";
          exploreNav.setAttribute("aria-pressed", String(explorerActive));
        }
        if (savedNav) {
          savedNav.dataset.state = savedView ? "active" : "idle";
          savedNav.setAttribute("aria-pressed", String(savedView));
        }
      }

      filters.innerHTML = [
        '<button class="klef-blog-filter" type="button" data-category="all" data-state="active">Todos</button>',
        ...categories.map((category) => `<button class="klef-blog-filter" type="button" data-category="${escapeHtml(category)}" data-state="idle">${escapeHtml(category)}</button>`),
      ].join("");

      const safeImageUrl = (value) => {
        const image = String(value ?? "").trim();
        return /^(https?:\/\/|\/)/i.test(image) ? image : "";
      };

      function matches(item, term, category) {
        const categoryMatch = category === "all" || (item.categories || []).includes(category);
        const searchable = [item.title, item.excerpt, ...(item.categories || []), ...(item.tags || [])].join(" ").toLocaleLowerCase("es");
        return categoryMatch && (!term || searchable.includes(term));
      }

      function renderFeatured(item) {
        if (!featuredTarget || !item) return;
        const category = (item.categories || ["Klef"])[0];
        const date = formatDate(item.date || item.modified);
        const image = safeImageUrl(item.image);
        const author = authorFor(item);
        featuredTarget.href = `/blog/${escapeHtml(item.slug)}/`;
        featuredTarget.setAttribute("data-author-slug", author.slug);
        featuredTarget.innerHTML = `
          <div class="klef-blog-featured-media">${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(item.image_alt || item.title)}" loading="eager">` : ""}</div>
          <div class="klef-blog-featured-content"><div class="klef-blog-card-top"><span class="klef-blog-card-category">${escapeHtml(category)}</span><time class="klef-blog-card-date" datetime="${escapeHtml(item.date || item.modified || "")}">${escapeHtml(date)}</time></div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.excerpt)}</p>${renderAuthor(item)}${saveButton(item)}<span class="klef-blog-featured-cta">Leer la nota <span aria-hidden="true">↗</span></span></div>`;
      }

      renderFeatured(featuredItem);

      function render() {
        const term = search.value.trim().toLocaleLowerCase("es");
        const featuredVisible = !savedView && matches(featuredItem, term, activeCategory);
        if (featuredTarget) featuredTarget.hidden = !featuredVisible;
        if (featuredSection) featuredSection.hidden = savedView;
        updateNavigationState();
        const sourceItems = savedView ? items : gridItems;
        const visible = sourceItems.filter((item) => matches(item, term, activeCategory) && (!savedView || savedSlugs.has(item.slug)));

        if (!visible.length) {
          grid.innerHTML = savedView
            ? '<div class="klef-blog-empty">Todavía no tienes artículos guardados. Usa “Guardar” en una tarjeta para volver a encontrarlos aquí.</div>'
            : '<div class="klef-blog-empty">No encontramos artículos con esos criterios.</div>';
          updateSavedCount();
          return;
        }

        grid.innerHTML = visible.map((item) => {
          const category = (item.categories || ["Klef"])[0];
          const date = formatDate(item.date || item.modified);
          const image = safeImageUrl(item.image);
          const author = authorFor(item);
          const cardClass = image ? "klef-blog-card" : "klef-blog-card klef-blog-card--no-media";
          return `<a class="${cardClass}" data-author-slug="${escapeHtml(author.slug)}" href="/blog/${escapeHtml(item.slug)}/">
            ${image ? `<div class="klef-blog-card-media"><img src="${escapeHtml(image)}" alt="${escapeHtml(item.image_alt || item.title)}" loading="lazy"></div>` : ""}
            <div class="klef-blog-card-body"><div class="klef-blog-card-top"><span class="klef-blog-card-category">${escapeHtml(category)}</span><time class="klef-blog-card-date" datetime="${escapeHtml(item.date || item.modified || "")}">${escapeHtml(date)}</time></div>
            <h2>${escapeHtml(item.title)}</h2>
            <p>${escapeHtml(item.excerpt)}</p>${renderAuthor(item)}${saveButton(item)}
            <span class="klef-blog-card-arrow" aria-hidden="true">↗</span></div>
          </a>`;
        }).join("");
        updateSavedCount();
        document.dispatchEvent(new CustomEvent("klef:blog-index-rendered"));
      }

      grid.addEventListener("click", (event) => {
        const button = event.target.closest("[data-blog-save]");
        if (!button) return;
        event.preventDefault();
        event.stopPropagation();
        const slug = button.dataset.blogSave;
        if (!slug) return;
        if (savedSlugs.has(slug)) savedSlugs.delete(slug);
        else savedSlugs.add(slug);
        writeSavedSlugs();
        render();
      });

      if (featuredTarget) {
        featuredTarget.addEventListener("click", (event) => {
          const button = event.target.closest("[data-blog-save]");
          if (!button) return;
          event.preventDefault();
          event.stopPropagation();
          const slug = button.dataset.blogSave;
          if (savedSlugs.has(slug)) savedSlugs.delete(slug);
          else savedSlugs.add(slug);
          writeSavedSlugs();
          renderFeatured(featuredItem);
          updateSavedCount();
        });
      }

      filters.addEventListener("click", (event) => {
        const button = event.target.closest("[data-category]");
        if (!button) return;
        activeCategory = button.dataset.category || "all";
        if (toolbar) toolbar.dataset.explorer = "open";
        filters.querySelectorAll(".klef-blog-filter").forEach((filter) => {
          filter.dataset.state = filter === button ? "active" : "idle";
        });
        render();
      });
      search.addEventListener("input", () => {
        if (toolbar) toolbar.dataset.explorer = "open";
        render();
      });

      if (exploreNav) {
        exploreNav.addEventListener("click", () => {
          savedView = false;
          if (toolbar) toolbar.dataset.explorer = "open";
          render();
          search.scrollIntoView({ behavior: "smooth", block: "center" });
          search.focus({ preventScroll: true });
        });
      }

      if (savedNav) {
        savedNav.addEventListener("click", () => {
          savedView = !savedView;
          render();
          grid.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }

      window.addEventListener("storage", (event) => {
        if (event.key !== SAVED_STORAGE_KEY) return;
        savedSlugs = readSavedSlugs();
        render();
      });
      render();
    } catch (error) {
      console.warn("[BlogIndex] Static manifest unavailable; keeping HTML fallback.", error);
    }
  }

  loadBlog();
})();
