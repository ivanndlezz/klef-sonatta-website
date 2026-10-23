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
  if (!grid || !filters || !search) return;

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
      const response = await fetch("../data/blog/index.json");
      if (!response.ok) throw new Error(`Blog index failed: ${response.status}`);
      const payload = await response.json();
      const items = Array.isArray(payload.items) ? payload.items : [];
      if (!items.length) return;
      const featuredItem = items.find((item) => item.featured) || items[0];
      const gridItems = items.filter((item) => item.slug !== featuredItem.slug);

      const categories = [...new Set(items.flatMap((item) => Array.isArray(item.categories) ? item.categories : []))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "es"));
      let activeCategory = "all";

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
          <div class="klef-blog-featured-content"><div class="klef-blog-card-top"><span class="klef-blog-card-category">${escapeHtml(category)}</span><time class="klef-blog-card-date" datetime="${escapeHtml(item.date || item.modified || "")}">${escapeHtml(date)}</time></div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.excerpt)}</p>${renderAuthor(item)}<span class="klef-blog-featured-cta">Leer la nota <span aria-hidden="true">↗</span></span></div>`;
      }

      renderFeatured(featuredItem);

      function render() {
        const term = search.value.trim().toLocaleLowerCase("es");
        const featuredVisible = matches(featuredItem, term, activeCategory);
        if (featuredTarget) featuredTarget.hidden = !featuredVisible;
        const visible = gridItems.filter((item) => matches(item, term, activeCategory));

        if (!visible.length) {
          grid.innerHTML = '<div class="klef-blog-empty">No encontramos artículos con esos criterios.</div>';
          return;
        }

        grid.innerHTML = visible.map((item) => {
          const category = (item.categories || ["Klef"])[0];
          const date = formatDate(item.date || item.modified);
          const image = safeImageUrl(item.image);
          const author = authorFor(item);
          return `<a class="klef-blog-card" data-author-slug="${escapeHtml(author.slug)}" href="/blog/${escapeHtml(item.slug)}/">
            ${image ? `<div class="klef-blog-card-media"><img src="${escapeHtml(image)}" alt="${escapeHtml(item.image_alt || item.title)}" loading="lazy"></div>` : ""}
            <div class="klef-blog-card-body"><div class="klef-blog-card-top"><span class="klef-blog-card-category">${escapeHtml(category)}</span><time class="klef-blog-card-date" datetime="${escapeHtml(item.date || item.modified || "")}">${escapeHtml(date)}</time></div>
            <h2>${escapeHtml(item.title)}</h2>
            <p>${escapeHtml(item.excerpt)}</p>${renderAuthor(item)}
            <span class="klef-blog-card-arrow" aria-hidden="true">↗</span></div>
          </a>`;
        }).join("");
        document.dispatchEvent(new CustomEvent("klef:blog-index-rendered"));
      }

      filters.addEventListener("click", (event) => {
        const button = event.target.closest("[data-category]");
        if (!button) return;
        activeCategory = button.dataset.category || "all";
        filters.querySelectorAll(".klef-blog-filter").forEach((filter) => {
          filter.dataset.state = filter === button ? "active" : "idle";
        });
        render();
      });
      search.addEventListener("input", render);
      render();
    } catch (error) {
      console.warn("[BlogIndex] Static manifest unavailable; keeping HTML fallback.", error);
    }
  }

  loadBlog();
})();
