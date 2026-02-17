// ============================================
// DYNAMIC PORTFOLIO ITEM RENDERING
// ============================================

// State management
const state = {
  loading: true,
  data: null,
  error: null,
};

// GraphQL endpoint
const GRAPHQL_ENDPOINT = "https://klef.newfacecards.com/graphql";

// GraphQL query for portfolio item
const GET_PORTFOLIO_ITEM_QUERY = `
    query GetPortfolioItem($slug: ID!) {
        post(id: $slug, idType: SLUG) {
            id
            title
            slug
            uri
            date
            content(format: RENDERED)
            featuredImage {
                node {
                    sourceUrl(size: LARGE)
                    altText
                }
            }
            portfolioImages {
                id
                sourceUrl(size: LARGE)
                altText
                mediaItemUrl
            }
            categories {
                nodes {
                    categoryId
                    name
                    slug
                    uri
                }
            }
            tags {
                nodes {
                    tagId
                    name
                    slug
                }
            }
            author {
                node {
                    id
                    name
                    firstName
                    lastName
                    uri
                    url
                    userId
                    rolesList
                    avatar {
                        url
                    }
                }
            }
            coAuthors {
                __typename
                ... on User {
                    id
                    name
                    firstName
                    lastName
                    uri
                    url
                    userId
                    rolesList
                    avatar {
                        url
                    }
                    description
                }
                ... on GuestAuthor {
                    id
                    name
                    firstName
                    lastName
                    email
                    avatar {
                        url
                    }
                    description
                    website
                }
            }
        }
    }
`;

/**
 * Extract slug from URL
 * Supports multiple URL patterns:
 * - ?slug=project-name
 * - /portfolio/project-name/
 * - /portfolio/project-name/index.html
 */
function getSlugFromURL() {
  // Try URL params first
  const urlParams = new URLSearchParams(window.location.search);
  const slugParam = urlParams.get("slug");
  if (slugParam) return slugParam;

  // Try pathname
  const pathParts = window.location.pathname.split("/").filter(Boolean);

  if (pathParts.length > 0) {
    let lastPart = pathParts[pathParts.length - 1];

    // Ignore index.html or index.php
    if (
      lastPart.toLowerCase() === "index.html" ||
      lastPart.toLowerCase() === "index.php"
    ) {
      if (pathParts.length > 1) {
        lastPart = pathParts[pathParts.length - 2];
      }
    }

    return lastPart;
  }

  // Fallback? Retornar null o lanzar error es mejor que un mock hardcodeado en producción
  // console.warn("Could not extract slug from URL");
  return null;
}

/**
 * Fetch portfolio item data from WordPress GraphQL
 */
async function fetchPortfolioItem(slug) {
  try {
    if (!slug) throw new Error("No slug provided");
    // console.log(`🔍 Fetching portfolio item: ${slug}`);

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: GET_PORTFOLIO_ITEM_QUERY,
        variables: { slug },
      }),
    });

    const json = await response.json();

    if (json.errors) {
      // console.error("❌ GraphQL errors:", json.errors);
      throw new Error(json.errors[0].message);
    }

    if (!json.data.post) {
      throw new Error("Portfolio item not found");
    }

    // console.log("✅ Portfolio item fetched:", json.data.post);
    return json.data.post;
  } catch (error) {
    // console.error("❌ Fetch error:", error);
    throw new Error(`Failed to fetch portfolio item: ${error.message}`);
  }
}

/**
 * Process coAuthors to separate client from team
 */
function processCoAuthors(data) {
  const allAuthors = data.coAuthors || [];

  // Find client (um_client role)
  const client = allAuthors.find(
    (author) => author.rolesList && author.rolesList.includes("um_client"),
  );

  // Get team members (exclude um_client)
  const team = allAuthors.filter(
    (author) => !author.rolesList || !author.rolesList.includes("um_client"),
  );

  return { client, team };
}

/**
 * Render header section
 */
function renderHeader(data) {
  const { client, team } = processCoAuthors(data);

  // Update page title
  document.title = `${data.title} - Klef Agency`;

  // Update h1
  const h1 = document.querySelector("h1");
  if (h1) {
    h1.textContent = data.title;
    h1.classList.remove("skeleton", "skeleton-title");
    h1.style.display = "block";
  }

  // Update category tag
  const tag = document.querySelector(".tag");
  if (tag && data.categories.nodes.length > 0) {
    tag.textContent = data.categories.nodes[0].name;
    tag.classList.remove("skeleton", "skeleton-tag");
  }

  // Update project name
  const projectName = document.querySelector(".project-name");
  if (projectName) {
    projectName.textContent = data.title;
    projectName.classList.remove("skeleton", "skeleton-text", "medium");
  }

  // Update project label
  const projectLabel = document.querySelector(".project-label");
  if (projectLabel) {
    projectLabel.textContent = "Proyecto";
    projectLabel.classList.remove("skeleton", "skeleton-text", "short");
  }

  // Update client avatar (if exists)
  const avatar = document.querySelector(".avatar");
  if (avatar && client) {
    avatar.classList.remove("skeleton", "skeleton-avatar");
    avatar.style.display = ""; // Clear inline style if any matches

    let img = avatar.querySelector("img");
    if (!img) {
      img = document.createElement("img");
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      avatar.appendChild(img);
    }

    if (client.avatar && client.avatar.url) {
      img.src = client.avatar.url;
      img.alt = client.name || "Client avatar";
    }
  } else if (avatar && !client) {
    // Hide avatar if no client
    avatar.classList.add("hidden");
  }

  // Update "Ver el proyecto" button data attributes
  const btnView = document.querySelector(".btn-view");
  if (btnView) {
    btnView.setAttribute("data-project-name", data.title);
    btnView.setAttribute(
      "data-project-type",
      data.categories.nodes[0]?.name || "Portfolio",
    );

    // Extract year from date
    const year = new Date(data.date).getFullYear();
    btnView.setAttribute("data-project-year", year);

    // Add component attribute for Adaptive Sheet
    btnView.setAttribute("data-component", "project-detail");

    btnView.classList.remove("skeleton", "skeleton-button");
    btnView.textContent = "Ver proyecto";
  }
}

/**
 * Count total images (featured + portfolio)
 */
function countTotalImages(data) {
  const featuredCount = data.featuredImage && data.featuredImage.node ? 1 : 0;
  const portfolioCount = data.portfolioImages ? data.portfolioImages.length : 0;
  return featuredCount + portfolioCount;
}

/**
 * Setup progressive image loading with IntersectionObserver
 */
function setupProgressiveImageLoading() {
  const portfolioImages = document.querySelector(".portfolio-images");
  if (!portfolioImages) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const placeholder = entry.target;
          const src = placeholder.dataset.src;
          const alt = placeholder.dataset.alt;
          const imgIndex = placeholder.dataset.imageIndex;

          if (src) {
            // Create new image and wait for it to load
            const newImg = new Image();
            newImg.className = "portfolio-img"; // Base class

            newImg.onload = () => {
              placeholder.replaceWith(newImg);
              // Add loaded class for fade-in effect
              // RequestAnimationFrame ensures transition happens after mount
              requestAnimationFrame(() => {
                newImg.classList.add("loaded");
              });

              // Dispatch event for tracking
              document.dispatchEvent(
                new CustomEvent("image-loaded", {
                  detail: { index: parseInt(imgIndex) },
                }),
              );
            };

            newImg.onerror = () => {
              // On error, show error placeholder
              const errorDiv = document.createElement("div");
              errorDiv.className = "image-error";
              errorDiv.textContent = "Error al cargar imagen";
              placeholder.replaceWith(errorDiv);
            };

            newImg.src = src;
            newImg.alt = alt || "Portfolio image";
            newImg.dataset.imageIndex = imgIndex;

            observer.unobserve(placeholder);
          }
        }
      });
    },
    {
      rootMargin: "100px", // Start loading 100px before visible
      threshold: 0.1,
    },
  );

  // Observe all skeleton placeholders
  portfolioImages
    .querySelectorAll(".skeleton-loading")
    .forEach((placeholder) => {
      observer.observe(placeholder);
    });
}

/**
 * Render portfolio images with progressive loading
 */
function renderImages(data) {
  const portfolioImages = document.querySelector(".portfolio-images");
  if (!portfolioImages) {
    // console.error("❌ renderImages: .portfolio-images no encontrado");
    return;
  }

  // console.log("🎨 renderImages ejecutado", data);
  // console.log("  - featuredImage:", data.featuredImage);
  // console.log("  - portfolioImages:", data.portfolioImages);

  // Count total images first
  const totalImages = countTotalImages(data);
  // console.log("  - totalImages:", totalImages);

  if (totalImages === 0) {
    // console.warn("⚠️ No hay imágenes para renderizar");
    portfolioImages.innerHTML =
      '<div class="no-images">No hay imágenes disponibles</div>';
    return;
  }

  // Build images array with metadata for progressive loading
  const images = [];
  let imageIndex = 0;

  if (data.featuredImage && data.featuredImage.node) {
    images.push({
      src: data.featuredImage.node.sourceUrl,
      alt: data.featuredImage.node.altText || data.title,
      index: imageIndex++,
    });
    // console.log("  - featured added:", images[0].src);
  }

  // Add portfolio images with correct incremental indices
  if (data.portfolioImages && data.portfolioImages.length > 0) {
    data.portfolioImages.forEach((img) => {
      images.push({
        src: img.sourceUrl,
        alt: img.altText || "Portfolio image",
        index: imageIndex++,
      });
    });
    // console.log("  - portfolio images added:", images.length);
  }

  // Create div elements with skeleton styling and data-src for progressive loading
  const imagesHTML = images
    .map(
      (img) =>
        `<div 
          class="portfolio-img skeleton skeleton-loading" 
          data-image-index="${img.index}"
          data-src="${img.src}"
          data-alt="${img.alt}"
        >
          <div class="skeleton-shimmer"></div>
        </div>`,
    )
    .join("");

  portfolioImages.innerHTML = imagesHTML;

  // Setup progressive loading
  setupProgressiveImageLoading();

  // Remove skeleton class from container
  portfolioImages.classList.remove("skeleton");
}

/**
 * Render sidebar section
 */
function renderSidebar(data) {
  const { client, team } = processCoAuthors(data);

  // Update description (if content exists)
  const sidebarDesc = document.querySelector(".sidebar-section p");
  if (sidebarDesc && data.content) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = data.content;
    const firstP = tempDiv.querySelector("p");

    if (firstP && firstP.textContent.trim()) {
      const description = firstP.textContent.trim();
      sidebarDesc.textContent =
        description.length > 100
          ? description.substring(0, 100) + "..."
          : description;

      sidebarDesc.classList.remove("skeleton", "skeleton-text", "long");

      // Find valid parent
      const sidebarSection = sidebarDesc.closest(".sidebar-section");
      if (sidebarSection) {
        // Update H3
        const h3 = sidebarSection.querySelector("h3");
        if (h3) {
          h3.textContent = "Acerca de este proyecto";
          h3.classList.remove("skeleton", "skeleton-text", "medium");
        }

        // Remove ONLY extra skeleton paragraphs, NOT the history card
        sidebarSection.querySelectorAll("p.skeleton").forEach((el) => {
          if (el !== sidebarDesc) el.remove();
        });
      }

      // Update history card text
      const historyCard = document.querySelector(".history-card");
      if (historyCard) {
        historyCard.classList.remove("skeleton", "skeleton-card");
        historyCard.innerHTML = `
            <div class="history-icon">
                <svg><use href="#icon-book"></use></svg>
            </div>
            <div class="history-text">
                <span>${description.substring(0, 60)}...</span>
                <button class="btn-read" data-component="project-story" data-story-title="Historia del Proyecto ${data.title}">Leer historia</button>
            </div>
        `;
      }
    } else {
      const descSection = document.querySelector(".sidebar-section");
      if (descSection) descSection.classList.add("hidden");
    }
  }

  // Render team section (only if team members exist)
  if (team.length > 0) {
    renderTeamSection(team);
  } else {
    const teamSections = document.querySelectorAll(
      ".sidebar-section .team-section",
    );
    teamSections.forEach((section) => {
      const parent = section.closest(".sidebar-section");
      if (parent) parent.classList.add("hidden");
    });
  }

  // Render tags (if exist)
  if (data.tags && data.tags.nodes.length > 0) {
    renderTags(data.tags.nodes);
  } // Else... handle hiding if needed, but template implies they might not exist
}

/**
 * Render team section
 */
function renderTeamSection(team) {
  // Update team avatars
  const teamAvatars = document.querySelectorAll(".team-avatars");
  teamAvatars.forEach((avatarsEl) => {
    avatarsEl.classList.remove("skeleton", "skeleton-team");
    avatarsEl.querySelectorAll(".skeleton").forEach((el) => el.remove());

    avatarsEl.innerHTML = team
      .map((author) => {
        const avatarUrl =
          author.avatar?.url ||
          `data:image/svg+xml,%3Csvg width='32' height='32' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='16' cy='16' r='16' fill='%23${Math.floor(Math.random() * 16777215).toString(16)}'/%3E%3C/svg%3E`;

        return `<img src="${avatarUrl}" alt="${author.name}" class="team-avatar" />`;
      })
      .join("");
  });

  // Update team names
  const teamNames = document.querySelectorAll(".team-names");
  const namesText = team
    .map((author) => {
      if (author.firstName && author.lastName) {
        return `${author.firstName} ${author.lastName}`;
      }
      return author.name;
    })
    .join(" • ");

  teamNames.forEach((nameEl) => {
    nameEl.textContent = namesText;
    nameEl.classList.remove("skeleton", "skeleton-text", "medium");

    // Update header if finding it purely by proximity
    const prevH3 = nameEl.parentElement.querySelector("h3");
    if (prevH3) {
      prevH3.textContent = "🦄 Creativos en este proyecto";
      prevH3.classList.remove("skeleton", "skeleton-text", "medium");
    }
  });
}

/**
 * Render tags section
 */
function renderTags(tags) {
  const tagsLists = document.querySelectorAll(".tags-list");
  const tagsHTML = tags.map((tag) => `<span>#${tag.slug}</span>`).join(" ");

  tagsLists.forEach((list) => {
    list.innerHTML = tagsHTML;
  });
}

/**
 * Render post content (full HTML from GraphQL) with dynamic section parsing
 */
function renderPostContent(data) {
  const postContent = document.getElementById("post-content");
  const mainContent = document.getElementById("mainContent"); // Alternate container sometimes used
  const target = postContent || mainContent;

  if (!target) return;

  if (data.content) {
    // If SectionNavigation is available, parse the content
    if (window.SectionNavigation) {
      const { sections, processedContent, imageRegistry } =
        window.SectionNavigation.parse(data.content);

      if (sections.length > 0) {
        target.innerHTML = processedContent;

        // --- SEO IMAGE HYDRATION INTEGRATION ---
        if (imageRegistry && imageRegistry.size > 0) {
          // 1. Populate/Create #seo-images for SEO (hidden container)
          let seoContainer = document.getElementById("seo-images");
          if (!seoContainer) {
            seoContainer = document.createElement("div");
            seoContainer.id = "seo-images";
            seoContainer.style.display = "none";
            document.body.appendChild(seoContainer);
          } else {
            seoContainer.innerHTML = ""; // Clear old
          }

          imageRegistry.forEach((imgData, id) => {
            // Append original markup to the hidden SEO container
            const parser = new DOMParser();
            const doc = parser.parseFromString(
              imgData.originalMarkup,
              "text/html",
            );
            const imgEl = doc.querySelector("img");
            if (imgEl) {
              imgEl.dataset.id = id;
              seoContainer.appendChild(imgEl);
            }
          });

          // 2. Initialize Hydrator
          window.SectionNavigation.initHydrator(imageRegistry);
        }

        // Render tabs if container exists
        const tabsScroll = document.getElementById("tabsScroll");
        if (tabsScroll) {
          window.SectionNavigation.renderTabs(sections, "#tabsScroll");

          // Re-initialize tab events and scroll spy if they exist
          if (typeof setupTabsNavigation === "function") {
            setupTabsNavigation();
          }
        }
      } else {
        target.innerHTML = data.content;
      }
    } else {
      target.innerHTML = data.content;
    }
    target.classList.remove("skeleton");
  } else {
    target.innerHTML = "<p>No content available</p>";
  }
}

/**
 * Main render function
 */
function renderPortfolioItem(data) {
  // console.log("🎨 Rendering portfolio item:", data.title);

  renderHeader(data);
  renderImages(data);
  renderSidebar(data);
  renderPostContent(data);

  // Dispatch event that render is complete
  document.dispatchEvent(
    new CustomEvent("portfolio-rendered", { detail: data }),
  );

  // console.log("✅ Portfolio item rendered successfully");
}

/**
 * Update UI state
 */
function updateState(newState) {
  Object.assign(state, newState);

  const errorEl = document.getElementById("error-message");

  if (state.loading) {
    document.body.classList.add("loading");
    if (errorEl) errorEl.style.display = "none";
  } else if (state.error) {
    document.body.classList.remove("loading");
    document.body.classList.add("error");
    if (errorEl) {
      errorEl.textContent = `⚠️ ${state.error}`;
      errorEl.style.display = "block";
    }
    console.error("❌ Error state:", state.error);
  } else if (state.data) {
    document.body.classList.remove("loading");
    document.body.classList.add("loaded");
    if (errorEl) errorEl.style.display = "none";
    renderPortfolioItem(state.data);
  }
}

/**
 * Initialize on page load
 */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const slug = getSlugFromURL();
    // console.log("🚀 Initializing portfolio item page with slug:", slug);

    if (!slug) {
      throw new Error("Could not determine project slug from URL");
    }

    const data = await fetchPortfolioItem(slug);
    updateState({ loading: false, data, error: null });
  } catch (error) {
    updateState({ loading: false, data: null, error: error.message });
  }
});

// ============================================
// COMPONENT LIBRARY - Portfolio Specific
// ============================================
const PortfolioComponents = {
  // 📄 Ver proyecto completo
  "project-detail": {
    name: "Detalles del Proyecto",
    render: (props = {}) => `
  <h3>${props.projectName || "Proyecto"}</h3>
  <p style="color: var(--text-secondary); margin-bottom: 24px;">
    ${props.projectType || "Tipo de proyecto"} • ${props.projectYear || "2024"}
  </p>

  <img 
    src="https://klef.agency/wp-content/uploads/2023/11/SEAD-Web_2.jpg" 
    alt="Project preview"
    class="project-image"
  />

  <div class="project-details">
    <div class="info-item">
      <label>Cliente</label>
      <div class="value">Sead Cabo</div>
    </div>
    <div class="info-item">
      <label>Categoría</label>
      <div class="value">Branding</div>
    </div>
    <div class="info-item">
      <label>Año</label>
      <div class="value">2023</div>
    </div>
    <div class="info-item">
      <label>Servicios</label>
      <div class="value">Identidad Visual</div>
    </div>
  </div>

  <h3 style="margin-top: 24px;">Descripción</h3>
  <p>
    Desarrollo integral de brandbook e identidad visual para Sead Cabo, 
    incluyendo diseño de logotipo, paleta de colores, tipografías corporativas 
    y aplicaciones en diferentes medios.
  </p>

  <p>
    El proyecto abarcó desde la conceptualización hasta la implementación 
    final, asegurando coherencia visual en todos los puntos de contacto 
    con el cliente.
  </p>

  <button class="expand-btn" onclick="adaptiveSheet.toggleFull()">
    ${window.adaptiveSheet?.state === "FULL" ? "↓ Reducir" : "↑ Expandir para ver más"}
  </button>
`,
    cta: () => `
  <button class="btn-primary">Ver el proyecto completo</button>
`,
  },

  // 📖 Leer historia del proyecto
  "project-story": {
    name: "Historia del Proyecto",
    render: (props = {}) => `
  <h3>${props.storyTitle || "Historia del Proyecto"}</h3>
  
  <p style="color: var(--text-secondary); font-style: italic; margin-bottom: 24px;">
    Cómo resolvimos las necesidades de Sead Cabo
  </p>

  <div class="info-item" style="background: #e3f2fd; border-left: 4px solid var(--k-blue);">
    <label style="color: #1976d2;">EL DESAFÍO</label>
    <div class="value" style="color: #0d47a1;">
      Crear una identidad visual que reflejara la esencia de la marca 
      mientras se destacaba en un mercado competitivo.
    </div>
  </div>

  <h3 style="margin-top: 24px;">El Proceso</h3>
  
  <div class="info-item">
    <label>1. Investigación</label>
    <div class="value">
      Análisis profundo del mercado, competencia y valores de la marca.
    </div>
  </div>

  <div class="info-item">
    <label>2. Conceptualización</label>
    <div class="value">
      Desarrollo de múltiples conceptos visuales alineados con la estrategia.
    </div>
  </div>

  <div class="info-item">
    <label>3. Diseño</label>
    <div class="value">
      Creación del brandbook completo con todas las aplicaciones necesarias.
    </div>
  </div>

  <div class="info-item">
    <label>4. Implementación</label>
    <div class="value">
      Aplicación de la identidad en todos los puntos de contacto.
    </div>
  </div>

  <h3 style="margin-top: 24px;">El Resultado</h3>
  <p>
    Una identidad visual sólida y coherente que ha permitido a Sead Cabo 
    destacarse en su industria y conectar emocionalmente con su audiencia.
  </p>

  <div class="info-item" style="background: #e8f5e9; border-left: 4px solid #4caf50; margin-top: 20px;">
    <label style="color: #2e7d32;">IMPACTO</label>
    <div class="value" style="color: #1b5e20;">
      +150% de reconocimiento de marca en el primer año
    </div>
  </div>

  <button class="expand-btn" onclick="adaptiveSheet.toggleFull()">
    ${window.adaptiveSheet?.state === "FULL" ? "↓ Reducir" : "↑ Ver más detalles"}
  </button>
`,
    cta: () => `
<button class="btn-primary" style="background: var(--k-dark);">
    <svg style="--wh: 16px; width: var(--wh); height: var(--wh); margin-right: 8px; vertical-align: middle;">
      <use href="#bag-mini"></use>
    </svg>
    <span>Adquirir paquete de branding</span>
</button>
`,
  },
};

// Initialize Adaptive Sheet if available
// Wait for window load to ensure adaptive-sheet.js is loaded
window.addEventListener("load", () => {
  if (window.initAdaptiveSheet) {
    window.initAdaptiveSheet(PortfolioComponents);
    // console.log("✅ Portfolio components initialized");
  } else {
    // console.warn(
    //   "⚠️ adaptive-sheet.js not loaded, PortfolioComponents not initialized",
    // );
  }
});
