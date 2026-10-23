(function () {
  "use strict";

  var article = document.querySelector("[data-author-slug]");
  if (!article) return;

  var slug = String(article.getAttribute("data-author-slug") || "").trim();
  if (!slug) return;

  var endpoint = article.getAttribute("data-author-endpoint") || "https://klef.newfacecards.com/graphql";
  var authorNameNodes = article.querySelectorAll("[data-author-name]");
  var authorLinkNodes = article.querySelectorAll("[data-author-link]");
  var authorAvatarNodes = article.querySelectorAll("[data-author-avatar]");

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

      authorNameNodes.forEach(function (node) { node.textContent = name; });
      authorLinkNodes.forEach(function (node) {
        if (profileUrl) {
          node.href = profileUrl;
          node.hidden = false;
        }
        node.setAttribute("aria-label", "Ver el perfil de " + name);
      });
      authorAvatarNodes.forEach(function (node) {
        if (!avatarUrl) return;
        node.src = avatarUrl;
        node.alt = "Foto de " + name;
        node.hidden = false;
      });

      updateStructuredData(name, profileUrl);

      article.setAttribute("data-author-resolved", "true");
      article.dispatchEvent(new CustomEvent("klef:author-resolved", { detail: author }));
    })
    .catch(function (error) {
      console.warn("[BlogAuthorHydrator] No se pudo resolver el autor desde WordPress.", error);
    });
})();
