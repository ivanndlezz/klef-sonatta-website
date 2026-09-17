(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  if (params.get("search_by") !== "author") return;

  var memberSlug = normalizeSlug(params.get("member") || "");
  var section = document.getElementById("author-project-search");
  var content = document.getElementById("author-project-search-content");
  if (!section || !content) return;

  section.hidden = false;
  document.documentElement.classList.add("author-project-search-mode");

  function normalizeSlug(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[char];
    });
  }

  function getMainAuthor(post) {
    return post && post.author && post.author.node
      ? post.author.node
      : post && post.author
        ? post.author
        : null;
  }

  function getCoAuthors(post) {
    var authors = post && post.coAuthors;
    if (Array.isArray(authors)) return authors;
    if (authors && Array.isArray(authors.nodes)) return authors.nodes;
    return [];
  }

  function getMemberKey(author) {
    if (!author) return "";
    var uri = String(author.uri || "").replace(/\/+$/, "");
    var uriSlug = uri.split("/").pop();
    return normalizeSlug(uriSlug || author.name || [author.firstName, author.lastName].filter(Boolean).join(" "));
  }

  function getProjectPeople(post) {
    var people = [];
    var mainAuthor = getMainAuthor(post);
    if (mainAuthor) people.push(mainAuthor);
    getCoAuthors(post).forEach(function (author) {
      if (author && !(author.rolesList || []).includes("um_client")) people.push(author);
    });

    var unique = {};
    return people.filter(function (person) {
      var key = getMemberKey(person) || normalizeSlug(person.name);
      if (!key || unique[key]) return false;
      unique[key] = true;
      return true;
    });
  }

  function getProjectTitle(item, post) {
    var title = item.title || (post && post.title) || "Proyecto de Klef";
    return Array.isArray(title) ? title.filter(Boolean).join(" | ") : title;
  }

  function getProjectDisplayTitle(item, post) {
    var title = item.title || (post && post.title) || "Proyecto de Klef";
    if (Array.isArray(title)) return title.filter(Boolean)[0] || "Proyecto de Klef";
    return String(title).split(/\s+\|\s+/)[0] || "Proyecto de Klef";
  }

  function getProjectImage(item, post) {
    return item.cover_image ||
      item.featuredImage?.node?.sourceUrl ||
      item.image ||
      (post && post.featuredImage && post.featuredImage.node && post.featuredImage.node.sourceUrl) ||
      "";
  }

  function getProjectCategories(item, post) {
    var categories = item.category || item.categories;
    if (categories && !Array.isArray(categories) && Array.isArray(categories.nodes)) {
      categories = categories.nodes.map(function (category) { return category.name; });
    }
    if (!Array.isArray(categories) && post && post.categories && Array.isArray(post.categories.nodes)) {
      categories = post.categories.nodes.map(function (category) { return category.name; });
    }
    return Array.isArray(categories) ? categories.filter(Boolean) : [];
  }

  function getProfileForProject(post) {
    var people = getProjectPeople(post);
    return people.find(function (person) { return getMemberKey(person) === memberSlug; }) || null;
  }

  async function loadProject(item) {
    var hasPeople = item.author || (Array.isArray(item.coAuthors) && item.coAuthors.length);
    if (hasPeople) return { item: item, post: item };

    try {
      var response = await fetch("/data/portfolio/" + encodeURIComponent(item.slug) + ".json", {
        headers: { Accept: "application/json" },
        cache: "no-cache",
      });
      if (!response.ok) throw new Error("No se pudo cargar el proyecto");
      var payload = await response.json();
      return { item: item, post: payload.data || {} };
    } catch (error) {
      return { item: item, post: {} };
    }
  }

  function renderProjectCard(project) {
    var item = project.item;
    var post = project.post;
    var title = getProjectTitle(item, post);
    var displayTitle = getProjectDisplayTitle(item, post);
    var slug = String(item.slug || post.slug || "");
    var image = getProjectImage(item, post);
    var imageHtml = image
      ? '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(title) + '" loading="lazy">'
      : '<div class="author-project-card__placeholder" aria-hidden="true">K</div>';
    var categories = getProjectCategories(item, post);
    var discipline = categories.filter(function (name) {
      return name.toLowerCase() !== "portfolio";
    }).join(" · ") || "Proyecto";

    return '<li class="author-project-card">' +
      '<a class="author-project-card__link" href="/portfolio/' + encodeURIComponent(slug) + '/" aria-label="Ver proyecto ' + escapeHtml(title) + '">' +
      '<div class="author-project-card__image">' + imageHtml +
      '<span class="author-project-card__badge">' + escapeHtml(discipline) + '</span></div>' +
      '<div class="author-project-card__body">' +
      '<h3>' + escapeHtml(displayTitle) + '</h3>' +
      '<span class="author-project-card__open" aria-hidden="true">Ver proyecto <svg viewBox="0 0 20 20" focusable="false"><path d="M4 10h11M11 6l4 4-4 4"/></svg></span>' +
      '</div></a></li>';
  }

  function getOtherAuthors(projects) {
    var authors = {};
    projects.forEach(function (project) {
      getProjectPeople(project.post).forEach(function (person) {
        var key = getMemberKey(person);
        if (!key || key === memberSlug) return;
        if (!authors[key]) authors[key] = { key: key, person: person, projectCount: 0 };
        authors[key].projectCount += 1;
      });
    });
    return Object.keys(authors).map(function (key) { return authors[key]; });
  }

  function renderOtherAuthor(author) {
    var person = author.person || {};
    var name = person.name || [person.firstName, person.lastName].filter(Boolean).join(" ") || author.key;
    var avatar = person.avatar && person.avatar.url;
    var avatarHtml = avatar
      ? '<img src="' + escapeHtml(avatar) + '" alt="">'
      : '<span aria-hidden="true">' + escapeHtml(name.charAt(0)) + '</span>';

    return '<li><a class="author-other-card" href="/?search_by=author&amp;member=' + encodeURIComponent(author.key) + '">' +
      '<span class="author-other-card__avatar">' + avatarHtml + '</span>' +
      '<span class="author-other-card__identity"><strong>' + escapeHtml(name) + '</strong><small>@' + escapeHtml(author.key) + '</small></span>' +
      '<span class="author-other-card__count">' + author.projectCount + ' ' + (author.projectCount === 1 ? 'proyecto' : 'proyectos') + '</span>' +
      '</a></li>';
  }

  function renderArchive(person, projects, otherAuthors) {
    var displayName = person && (person.name || [person.firstName, person.lastName].filter(Boolean).join(" "));
    var avatar = person && person.avatar && person.avatar.url;
    var userLabel = memberSlug;
    document.title = "Proyectos de @" + userLabel + " | Klef Agency";

    content.innerHTML =
      '<article class="author-project-archive">' +
      '<div class="author-project-navigation">' +
      '<nav class="author-project-breadcrumbs" aria-label="Ruta de navegación"><ol>' +
      '<li><a href="/">Inicio</a></li>' +
      '<li><a href="/portfolio/">Portafolio</a></li>' +
      '<li><span aria-current="page">' + escapeHtml(displayName || userLabel) + '</span></li>' +
      '</ol></nav>' +
      '<a class="author-project-back" href="/portfolio/"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 10H5m4-4-4 4 4 4"/></svg><span>Todos los proyectos</span></a>' +
      '</div>' +
      '<div class="author-project-layout">' +
      '<aside class="author-project-sidebar" aria-label="Perfil del autor">' +
      '<header class="author-profile-card">' +
      '<div class="author-profile-card__cover" aria-hidden="true"></div>' +
      '<div class="author-profile-card__identity">' +
      (avatar ? '<img class="author-profile-card__avatar" src="' + escapeHtml(avatar) + '" alt="Foto de perfil de ' + escapeHtml(displayName) + '">' : '<div class="author-profile-card__avatar author-profile-card__avatar--empty" aria-hidden="true">' + escapeHtml((displayName || userLabel).charAt(0)) + '</div>') +
      '<div class="author-profile-card__name"><p class="author-profile-card__eyebrow">Autor del portafolio</p>' +
      '<h1>' + escapeHtml(displayName || userLabel) + '</h1><p class="author-profile-card__handle">@' + escapeHtml(userLabel) + '</p></div>' +
      '<p class="author-profile-card__count"><strong>' + projects.length + '</strong><span>' + (projects.length === 1 ? 'proyecto' : 'proyectos') + '</span></p></div>' +
      '</header></aside>' +
      '<section class="author-project-results" aria-labelledby="author-project-title">' +
      '<div class="author-project-results__heading"><div><p class="author-project-results__eyebrow">Portafolio de Klef</p>' +
      '<h2 id="author-project-title">Proyectos de ' + escapeHtml(displayName || userLabel) + '</h2>' +
      '<p class="author-project-results__intro">Una selección de trabajos en los que participa @' + escapeHtml(userLabel) + '.</p></div></div>' +
      (projects.length
        ? '<ul class="author-project-grid">' + projects.map(renderProjectCard).join("") + '</ul>'
        : '<p class="author-project-empty">No encontramos proyectos asociados a este perfil.</p>') +
      '</section></div>' +
      (otherAuthors.length ? '<aside class="author-other-authors" id="author-other-authors" aria-labelledby="author-other-title">' +
        '<div><p class="author-project-results__eyebrow">Equipo creativo</p><h2 id="author-other-title">Otros autores.</h2></div>' +
        '<ul>' + otherAuthors.map(renderOtherAuthor).join("") + '</ul></aside>' : '') +
      '</article>';
    section.setAttribute("aria-busy", "false");
  }

  function renderMessage(message) {
    content.innerHTML = '<div class="author-project-message"><p class="author-project-results__eyebrow">Portafolio de Klef</p><h1>No encontramos este perfil</h1><p>' + escapeHtml(message) + '</p><a href="/portfolio/">Explorar el portafolio</a></div>';
    section.setAttribute("aria-busy", "false");
  }

  async function init() {
    if (!memberSlug) {
      renderMessage("El enlace no incluye un autor válido.");
      return;
    }

    try {
      var response = await fetch("/data/portfolio/index.json", {
        headers: { Accept: "application/json" },
        cache: "no-cache",
      });
      if (!response.ok) throw new Error("No se pudo cargar el índice del portafolio");
      var payload = await response.json();
      var items = Array.isArray(payload.items) ? payload.items : [];
      var projects = await Promise.all(items.map(loadProject));
      var matchingProjects = projects.filter(function (project) {
        return getProfileForProject(project.post) !== null;
      });
      var profile = matchingProjects.length ? getProfileForProject(matchingProjects[0].post) : null;

      if (!profile) {
        renderMessage("Revisa el nombre del autor o vuelve al portafolio para explorar todos los proyectos.");
        return;
      }

      renderArchive(profile, matchingProjects, getOtherAuthors(projects));
    } catch (error) {
      renderMessage("Por ahora no se pudo cargar el portafolio. Inténtalo de nuevo más tarde.");
    }
  }

  init();
})();
