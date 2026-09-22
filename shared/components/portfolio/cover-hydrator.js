/**
 * Enhanced Portfolio Renderer for New Template
 * Extends portfolio-item-fetch.js to hydrate cover section, team, and tags
 */

/**
 * Hydrate cover section with featured image and description
 */
function renderCoverSection(data) {
  // Update featured image in cover-visual
  const coverVisual = document.querySelector(".cover-visual");
  if (coverVisual && data.featuredImage?.node?.sourceUrl) {
    // Remove skeleton class
    coverVisual.classList.remove("skeleton");

    // Create and insert image
    const img = document.createElement("img");
    img.src = data.featuredImage.node.sourceUrl;
    img.alt = data.featuredImage.node.altText || data.title;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";

    coverVisual.innerHTML = "";
    coverVisual.appendChild(img);
  } else if (coverVisual) {
    // No cover image - add data-state to disable skeleton animation
    coverVisual.setAttribute("data-state", "no-cover");
  }

  // Update description paragraph in cover
  const coverP = document.querySelector(".cover > p");
  if (coverP && data.excerpt) {
    const cleanExcerpt = data.excerpt.replace(/<[^>]*>/g, "").trim();
    if (cleanExcerpt) {
      coverP.textContent =
        cleanExcerpt.substring(0, 150) +
        (cleanExcerpt.length > 150 ? "..." : "");
      coverP.classList.remove("skeleton", "skeleton-text", "long");
    }
  }

  // Update breadcrumb
  const breadcrumbTitle = document.getElementById("breadcrumb-title");
  if (breadcrumbTitle) {
    breadcrumbTitle.textContent = data.title;
    breadcrumbTitle.classList.remove("skeleton", "skeleton-text", "short");
    breadcrumbTitle.setAttribute("data-active", "true");
  }
}

/**
 * Render team section from coAuthors
 */
function renderCoverTeamSection(data) {
  const source = data.coAuthors;
  const coAuthors = Array.isArray(source)
    ? source
    : Array.isArray(source?.nodes)
      ? source.nodes
      : [];
  if (coAuthors.length === 0) return;

  // Filter out clients, keep only team members
  const team = coAuthors.filter(
    (author) => !author.rolesList || !author.rolesList.includes("um_client"),
  );

  if (team.length === 0) return;

  const escapeTeamMarkup = (value) =>
    String(value || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char]);
  const getTeamMemberSlug = (member) => {
    const uriSlug = String(member.uri || "").replace(/\/+$/, "").split("/").pop();
    const name = member.name || [member.firstName, member.lastName].filter(Boolean).join(" ");
    return uriSlug || name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  };
  const getTeamMemberName = (member) =>
    member.name || [member.firstName, member.lastName].filter(Boolean).join(" ");
  const getTeamMemberHref = (member) =>
    `/?search_by=author&member=${encodeURIComponent(getTeamMemberSlug(member))}`;

  // Find or create team section
  let teamSection = document.getElementById("equipo");
  if (!teamSection) {
    teamSection = document.createElement("section");
    teamSection.id = "equipo";
    teamSection.className = "section-container";

    // Insert before tags section or at end of main content
    const mainContent = document.getElementById("post-content");
    mainContent.appendChild(teamSection);
  }

  // Build team names
  const teamNames = team
    .map((member) =>
      `<a class="team-member-link" href="${escapeTeamMarkup(getTeamMemberHref(member))}">${escapeTeamMarkup(getTeamMemberName(member))}</a>`,
    )
    .join(' <span class="team-name-separator" aria-hidden="true">•</span> ');

  // Build avatars HTML
  const avatarsHTML = team
    .map((member) => {
      const name = getTeamMemberName(member);
      const avatarUrl = member.avatar?.url || "";
      return `<a class="team-avatar-link" href="${escapeTeamMarkup(getTeamMemberHref(member))}" aria-label="Ver proyectos de ${escapeTeamMarkup(name)}"><img src="${escapeTeamMarkup(avatarUrl)}" alt="${escapeTeamMarkup(name)}" class="team-avatar"></a>`;
    })
    .join("");

  // Render team section
  teamSection.innerHTML = `
    <h2 class="creativos">Creativos y Colaboradores</h2>
    <div class="accordion" id="labAccordion" data-open="true">
      <div class="team-section">
        <div class="team-avatars">
          ${avatarsHTML}
        </div>
        <div class="creatives-in-project">
          <h3 class="team-names">${teamNames}</h3>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render tags section
 */
function renderTagsSection(data) {
  if (!data.tags || !data.tags.nodes || data.tags.nodes.length === 0) return;

  // Find or create tags container
  let tagsContainer = document.querySelector(".final-tags");
  if (!tagsContainer) {
    tagsContainer = document.createElement("div");
    tagsContainer.className = "final-tags";

    // Insert at end of main content
    const mainContent = document.getElementById("post-content");
    mainContent.appendChild(tagsContainer);
  }

  // Build tags HTML with # prefix
  const tagsHTML = data.tags.nodes
    .map((tag) => {
      // Convert slug to hashtag format (e.g., "estrategia-de-marca" -> "#EstrategiaDeMarca")
      const hashtagName = tag.slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");

      return `<span class="pill">#${hashtagName}</span>`;
    })
    .join("\n        ");

  tagsContainer.innerHTML = tagsHTML;
}

// Listen for portfolio-rendered event and enhance rendering
document.addEventListener("portfolio-rendered", (event) => {
  const data = event.detail;
  if (data) {
    renderCoverSection(data);
    renderCoverTeamSection(data);
    renderTagsSection(data);
  }
});
