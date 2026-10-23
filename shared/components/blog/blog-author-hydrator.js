(function () {
  "use strict";

  var endpoint = "https://klef.newfacecards.com/graphql";
  var pending = {};

  function getRoots() {
    return Array.prototype.slice.call(document.querySelectorAll("[data-author-slug]"));
  }

  function getSlug(root) {
    return String(root.getAttribute("data-author-slug") || "").trim();
  }

  function getNodes(slug, selector) {
    var nodes = [];
    getRoots().forEach(function (root) {
      if (getSlug(root) !== slug) return;
      Array.prototype.push.apply(nodes, Array.prototype.slice.call(root.querySelectorAll(selector)));
    });
    return nodes;
  }

  var query = `query GetBlogAuthor($slug: ID!) {
    user(id: $slug, idType: SLUG) {
      id
      name
      firstName
      lastName
      uri
      url
      avatar { url }
    }
  }`;

  function safeUrl(value) {
    try {
      var url = new URL(String(value || ""), window.location.origin);
      return /^https?:$/.test(url.protocol) ? url.href : "";
    } catch (error) {
      return "";
    }
  }

  function getAuthorName(author) {
    return author.name || [author.firstName, author.lastName].filter(Boolean).join(" ") || slug;
  }

  function updateStructuredData(name, profileUrl) {
    document.querySelectorAll('script[type="application/ld+json"]').forEach(function (node) {
      try {
        var schema = JSON.parse(node.textContent || "");
        if (!schema || typeof schema !== "object" || !schema.author) return;
        schema.author = Object.assign({}, schema.author, { name: name });
        if (profileUrl) schema.author.url = profileUrl;
        node.textContent = JSON.stringify(schema);
      } catch (error) {
        // A different JSON-LD block should not prevent the author from hydrating.
      }
    });
  }

  function hydrate(slug) {
    if (!slug || pending[slug]) return;
    pending[slug] = true;
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: query, variables: { slug: slug } }),
      cache: "no-store",
    })
      .then(function (response) {
        if (!response.ok) throw new Error("GraphQL author request failed: " + response.status);
        return response.json();
      })
      .then(function (payload) {
        if (payload.errors && payload.errors.length) throw new Error(payload.errors[0].message || "GraphQL author error");
        var author = payload.data && payload.data.user;
        if (!author) return;

        var name = getAuthorName(author);
        var profileUrl = safeUrl(author.url || author.uri);
        var avatarUrl = safeUrl(author.avatar && author.avatar.url);
        getNodes(slug, "[data-author-name]").forEach(function (node) { node.textContent = name; });
        getNodes(slug, "[data-author-link]").forEach(function (node) {
          if (profileUrl) {
            node.href = profileUrl;
            node.hidden = false;
          }
          node.setAttribute("aria-label", "Ver el perfil de " + name);
        });
        getNodes(slug, "[data-author-avatar]").forEach(function (node) {
          if (!avatarUrl) return;
          node.src = avatarUrl;
          node.alt = "Foto de " + name;
          node.hidden = false;
        });

        updateStructuredData(name, profileUrl);
        getRoots().filter(function (root) { return getSlug(root) === slug; }).forEach(function (root) {
          root.setAttribute("data-author-resolved", "true");
          root.dispatchEvent(new CustomEvent("klef:author-resolved", { detail: author }));
        });
      })
      .catch(function (error) {
        console.warn("[BlogAuthorHydrator] No se pudo resolver el autor desde WordPress.", error);
      });
  }

  function collect() {
    var slugs = [];
    getRoots().forEach(function (root) {
      var slug = getSlug(root);
      if (slug && slugs.indexOf(slug) === -1) slugs.push(slug);
    });
    slugs.forEach(hydrate);
  }

  document.addEventListener("klef:blog-index-rendered", collect);
  collect();
})();
