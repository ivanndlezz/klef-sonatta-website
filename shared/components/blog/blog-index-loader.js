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
  if (!grid || !filters || !search) return;

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

  async function loadBlog() {
    try {
      const response = await fetch("../data/blog/index.json");
      if (!response.ok) throw new Error(`Blog index failed: ${response.status}`);
      const payload = await response.json();
      const items = Array.isArray(payload.items) ? payload.items : [];
      if (!items.length) return;

      const categories = [...new Set(items.flatMap((item) => Array.isArray(item.categories) ? item.categories : []))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "es"));
      let activeCategory = "all";

      filters.innerHTML = [
        '<button class="klef-blog-filter" type="button" data-category="all" data-state="active">Todos</button>',
        ...categories.map((category) => `<button class="klef-blog-filter" type="button" data-category="${escapeHtml(category)}" data-state="idle">${escapeHtml(category)}</button>`),
      ].join("");

      function render() {
        const term = search.value.trim().toLocaleLowerCase("es");
        const visible = items.filter((item) => {
          const categoryMatch = activeCategory === "all" || (item.categories || []).includes(activeCategory);
          const searchable = [item.title, item.excerpt, ...(item.categories || []), ...(item.tags || [])].join(" ").toLocaleLowerCase("es");
          return categoryMatch && (!term || searchable.includes(term));
        });

        if (!visible.length) {
          grid.innerHTML = '<div class="klef-blog-empty">No encontramos artículos con esos criterios.</div>';
          return;
        }

        grid.innerHTML = visible.map((item) => {
          const category = (item.categories || ["Klef"])[0];
          const date = formatDate(item.date || item.modified);
          return `<a class="klef-blog-card" href="/blog/${escapeHtml(item.slug)}/">
            <div class="klef-blog-card-top"><span class="klef-blog-card-category">${escapeHtml(category)}</span><time class="klef-blog-card-date" datetime="${escapeHtml(item.date || item.modified || "")}">${escapeHtml(date)}</time></div>
            <h2>${escapeHtml(item.title)}</h2>
            <p>${escapeHtml(item.excerpt)}</p>
            <span class="klef-blog-card-arrow" aria-hidden="true">↗</span>
          </a>`;
        }).join("");
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
