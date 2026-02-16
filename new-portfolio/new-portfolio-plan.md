Usar como nuevo template para portfolio:

/portfolio/fish-and-grill-los-cabos-restaurant-brand/index.html

Vaciar de datos y dejar pura estructura con skel animations esperando a que carguen datos.

---

¡Perfecto! Entiendo perfectamente lo que quieres hacer. Es un patrón de **carga paralela + hidratación** muy eficiente. Te armo la solución completa:

---

## 🚀 Solución: Carga Paralela + Hidratación

### Arquitectura del patrón:

```javascript
// Al cargar página /portfolio/proyecto-x

Promise.all([
  fetchGraphQLData(slug),      // ← Petición 1: Datos
  loadTemplate('portfolio')     // ← Petición 2: Template
])
  ↓
Wait for both to complete
  ↓
Inject template into DOM
  ↓
Wait for IDs to exist
  ↓
Hydrate with GraphQL data
```

---

## 📁 Estructura de Archivos

```
src/
├── templates/
│   ├── portfolio-templates.js     # Templates HTML
│   ├── blog-templates.js
│   └── case-study-templates.js
├── utils/
│   ├── dom-helpers.js             # Wait for elements
│   └── hydration.js               # Hydrate functions
├── api/
│   └── graphql.js                 # GraphQL queries
└── router.js                       # Main router
```

---

## 💾 1. Templates (Módulos ES6)

```javascript
// src/templates/portfolio-templates.js

export const portfolioTemplates = {
  "hero-gallery": `
    <article class="portfolio-detail template-hero-gallery">
      <!-- Hero Section -->
      <div class="hero" id="hero-section">
        <div class="hero-image" id="hero-image"></div>
        <h1 id="project-title"></h1>
        <div class="meta" id="project-meta"></div>
      </div>
      
      <!-- Content -->
      <div class="content-wrapper">
        <div class="excerpt" id="project-excerpt"></div>
        
        <!-- Gallery -->
        <div class="gallery-section">
          <div class="gallery-grid" id="gallery-grid">
            <!-- Se llenará dinámicamente -->
          </div>
        </div>
        
        <!-- Main Content -->
        <div class="main-content" id="main-content"></div>
      </div>
      
      <!-- Authors -->
      <div class="authors" id="project-authors"></div>
    </article>
  `,

  "case-study": `
    <article class="portfolio-detail template-case-study">
      <header class="case-study-header">
        <span class="client-tag" id="client-name"></span>
        <h1 id="project-title"></h1>
        <div class="meta">
          <div id="project-category"></div>
          <div id="project-date"></div>
        </div>
      </header>
      
      <div class="hero-media" id="hero-media"></div>
      
      <div class="case-study-body">
        <section class="challenge">
          <h2>El Reto</h2>
          <div id="challenge-content"></div>
        </section>
        
        <section class="solution">
          <h2>La Solución</h2>
          <div id="solution-content"></div>
        </section>
        
        <section class="results">
          <h2>Resultados</h2>
          <div id="results-content"></div>
        </section>
        
        <div class="gallery" id="gallery-grid"></div>
      </div>
    </article>
  `,

  "before-after": `
    <article class="portfolio-detail template-before-after">
      <h1 id="project-title"></h1>
      
      <div class="comparison-slider" id="comparison-container">
        <!-- Se llenará con el before/after slider -->
      </div>
      
      <div class="content" id="main-content"></div>
      <div class="stats" id="project-stats"></div>
    </article>
  `,

  "video-showcase": `
    <article class="portfolio-detail template-video-showcase">
      <div class="video-hero" id="video-container">
        <!-- Video se insertará aquí -->
      </div>
      
      <h1 id="project-title"></h1>
      <div class="video-meta" id="project-meta"></div>
      <div class="content" id="main-content"></div>
      <div class="gallery" id="gallery-grid"></div>
    </article>
  `,
};

// Template por defecto
export const defaultTemplate = portfolioTemplates["hero-gallery"];
```

---

## 🔧 2. Utilidades DOM

```javascript
// src/utils/dom-helpers.js

/**
 * Esperar a que un elemento exista en el DOM
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout en ms (default: 5000)
 * @returns {Promise<Element>}
 */
export function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    // Si ya existe, resolverlo inmediatamente
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    // Usar MutationObserver para detectar cuando aparece
    const observer = new MutationObserver((mutations) => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Timeout de seguridad
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

/**
 * Esperar a que múltiples elementos existan
 * @param {string[]} selectors - Array de CSS selectors
 * @returns {Promise<Element[]>}
 */
export async function waitForElements(selectors) {
  const promises = selectors.map((selector) => waitForElement(selector));
  return Promise.all(promises);
}

/**
 * Esperar a que un elemento exista Y obtenerlo
 * @param {string} id - ID del elemento (sin #)
 * @returns {Promise<Element>}
 */
export async function waitForId(id) {
  return waitForElement(`#${id}`);
}

/**
 * Batch: esperar múltiples IDs
 * @param {string[]} ids - Array de IDs (sin #)
 * @returns {Promise<Object>} Objeto con elementos por ID
 */
export async function waitForIds(ids) {
  const elements = await Promise.all(ids.map((id) => waitForId(id)));

  // Convertir a objeto { id: element }
  return ids.reduce((acc, id, index) => {
    acc[id] = elements[index];
    return acc;
  }, {});
}
```

---

## 💧 3. Sistema de Hidratación

```javascript
// src/utils/hydration.js

/**
 * Hidratar template con datos de GraphQL
 */
export class PortfolioHydrator {
  constructor(data, template) {
    this.data = data;
    this.template = template;
  }

  /**
   * Hidratar basado en el template usado
   */
  async hydrate() {
    switch (this.template) {
      case "hero-gallery":
        return this.hydrateHeroGallery();
      case "case-study":
        return this.hydrateCaseStudy();
      case "before-after":
        return this.hydrateBeforeAfter();
      case "video-showcase":
        return this.hydrateVideoShowcase();
      default:
        return this.hydrateHeroGallery();
    }
  }

  /**
   * Hero Gallery template
   */
  async hydrateHeroGallery() {
    const { waitForIds } = await import("./dom-helpers.js");

    // Esperar a que todos los IDs existan
    const elements = await waitForIds([
      "hero-image",
      "project-title",
      "project-meta",
      "project-excerpt",
      "gallery-grid",
      "main-content",
      "project-authors",
    ]);

    // Hidratar hero
    if (this.data.featuredImage?.node?.sourceUrl) {
      elements["hero-image"].style.backgroundImage =
        `url(${this.data.featuredImage.node.sourceUrl})`;
    }

    // Título
    elements["project-title"].textContent = this.data.title;

    // Meta (categorías, fecha)
    const categories = this.data.categories?.nodes || [];
    const date = new Date(this.data.date).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    elements["project-meta"].innerHTML = `
      <span class="categories">
        ${categories.map((cat) => `<span class="tag">${cat.name}</span>`).join("")}
      </span>
      <span class="date">${date}</span>
    `;

    // Excerpt
    const excerpt = this.data.excerpt?.replace(/<[^>]*>/g, "") || "";
    elements["project-excerpt"].textContent = excerpt;

    // Gallery
    if (this.data.portfolioImages && this.data.portfolioImages.length > 0) {
      elements["gallery-grid"].innerHTML = this.data.portfolioImages
        .map(
          (img) => `
        <figure class="gallery-item">
          <img 
            src="${img.sourceUrl}" 
            alt="${img.altText || this.data.title}"
            loading="lazy"
          >
        </figure>
      `,
        )
        .join("");
    }

    // Content
    elements["main-content"].innerHTML = this.data.content || "";

    // Authors
    if (this.data.coAuthors && this.data.coAuthors.length > 0) {
      elements["project-authors"].innerHTML = `
        <div class="authors-list">
          <h3>Créditos</h3>
          ${this.data.coAuthors
            .map(
              (author) => `
            <div class="author">
              ${
                author.avatar?.url
                  ? `<img src="${author.avatar.url}" alt="${author.name}">`
                  : ""
              }
              <span>${author.name}</span>
            </div>
          `,
            )
            .join("")}
        </div>
      `;
    }
  }

  /**
   * Case Study template
   */
  async hydrateCaseStudy() {
    const { waitForIds } = await import("./dom-helpers.js");

    const elements = await waitForIds([
      "client-name",
      "project-title",
      "project-category",
      "project-date",
      "hero-media",
      "challenge-content",
      "solution-content",
      "results-content",
      "gallery-grid",
    ]);

    // Cliente (primera categoría)
    const client = this.data.categories?.nodes?.[0]?.name || "Cliente";
    elements["client-name"].textContent = client;

    // Título
    elements["project-title"].textContent = this.data.title;

    // Categoría y fecha
    elements["project-category"].textContent =
      this.data.categories?.nodes?.map((c) => c.name).join(", ") || "";

    elements["project-date"].textContent = new Date(
      this.data.date,
    ).getFullYear();

    // Hero media
    if (this.data.featuredImage?.node?.sourceUrl) {
      elements["hero-media"].innerHTML = `
        <img src="${this.data.featuredImage.node.sourceUrl}" 
             alt="${this.data.title}">
      `;
    }

    // Parsear secciones del contenido
    const sections = this.parseContentSections(this.data.content);

    elements["challenge-content"].innerHTML = sections.challenge || "";
    elements["solution-content"].innerHTML = sections.solution || "";
    elements["results-content"].innerHTML = sections.results || "";

    // Gallery
    if (this.data.portfolioImages?.length > 0) {
      elements["gallery-grid"].innerHTML = this.data.portfolioImages
        .map(
          (img) => `
        <img src="${img.sourceUrl}" alt="${img.altText || ""}" loading="lazy">
      `,
        )
        .join("");
    }
  }

  /**
   * Parsear contenido en secciones
   */
  parseContentSections(content) {
    // Parsear JSON si viene de contentSections
    if (this.data.contentSections) {
      try {
        const sections = JSON.parse(this.data.contentSections);
        return {
          challenge:
            sections.find((s) => s.section_type === "challenge")
              ?.section_content || "",
          solution:
            sections.find((s) => s.section_type === "solution")
              ?.section_content || "",
          results:
            sections.find((s) => s.section_type === "results")
              ?.section_content || "",
        };
      } catch (e) {
        console.warn("Could not parse content sections:", e);
      }
    }

    // Fallback: usar el contenido completo
    return {
      challenge: content || "",
      solution: "",
      results: "",
    };
  }

  /**
   * Before/After template
   */
  async hydrateBeforeAfter() {
    const { waitForIds } = await import("./dom-helpers.js");

    const elements = await waitForIds([
      "project-title",
      "comparison-container",
      "main-content",
      "project-stats",
    ]);

    elements["project-title"].textContent = this.data.title;

    // Comparison slider (asumiendo que las primeras 2 imágenes son before/after)
    const images = this.data.portfolioImages || [];
    if (images.length >= 2) {
      elements["comparison-container"].innerHTML = `
        <div class="comparison-slider-wrapper">
          <img src="${images[0].sourceUrl}" alt="Antes" class="before-image">
          <img src="${images[1].sourceUrl}" alt="Después" class="after-image">
          <input type="range" min="0" max="100" value="50" class="slider">
        </div>
      `;

      // Inicializar slider (opcional, puedes usar una librería)
      this.initComparisonSlider(elements["comparison-container"]);
    }

    elements["main-content"].innerHTML = this.data.content || "";

    // Stats (si existen en el contenido)
    // Puedes parsear del content o de un campo específico
    elements["project-stats"].innerHTML = this.extractStats(this.data.content);
  }

  /**
   * Video Showcase template
   */
  async hydrateVideoShowcase() {
    const { waitForIds } = await import("./dom-helpers.js");

    const elements = await waitForIds([
      "video-container",
      "project-title",
      "project-meta",
      "main-content",
      "gallery-grid",
    ]);

    // Video
    const videoUrl = this.extractVideoUrl(this.data.content);
    if (videoUrl) {
      elements["video-container"].innerHTML = `
        <video controls autoplay muted>
          <source src="${videoUrl}" type="video/mp4">
        </video>
      `;
    } else if (this.data.featuredImage?.node?.sourceUrl) {
      elements["video-container"].innerHTML = `
        <img src="${this.data.featuredImage.node.sourceUrl}" alt="${this.data.title}">
      `;
    }

    elements["project-title"].textContent = this.data.title;
    elements["project-meta"].innerHTML = this.generateMeta();
    elements["main-content"].innerHTML = this.data.content || "";

    // Gallery
    if (this.data.portfolioImages?.length > 0) {
      elements["gallery-grid"].innerHTML = this.data.portfolioImages
        .map(
          (img) => `
        <img src="${img.sourceUrl}" alt="${img.altText || ""}" loading="lazy">
      `,
        )
        .join("");
    }
  }

  // Helpers
  extractVideoUrl(content) {
    // Buscar URL de video en el contenido
    const match = content?.match(/https?:\/\/[^\s]+\.(mp4|webm|ogg)/i);
    return match ? match[0] : null;
  }

  generateMeta() {
    const categories = this.data.categories?.nodes || [];
    const date = new Date(this.data.date).toLocaleDateString("es-MX");

    return `
      <span>${categories.map((c) => c.name).join(", ")}</span>
      <span>${date}</span>
    `;
  }

  extractStats(content) {
    // Implementar parseo de stats desde el contenido
    // Por ahora retornar vacío
    return "";
  }

  initComparisonSlider(container) {
    // Implementación simple de slider de comparación
    const slider = container.querySelector(".slider");
    const afterImage = container.querySelector(".after-image");

    if (slider && afterImage) {
      slider.addEventListener("input", (e) => {
        afterImage.style.clipPath = `inset(0 ${100 - e.target.value}% 0 0)`;
      });
    }
  }
}
```

---

## 🎯 4. Router Principal con Carga Paralela

```javascript
// src/router.js

import {
  portfolioTemplates,
  defaultTemplate,
} from "./templates/portfolio-templates.js";
import { PortfolioHydrator } from "./utils/hydration.js";
import { fetchPostBySlug } from "./api/graphql.js";

class Router {
  constructor() {
    this.init();
  }

  async handlePortfolioDetail(slug) {
    const app = document.getElementById("app");

    // Mostrar loading
    app.innerHTML = '<div class="loading-skeleton"></div>';

    try {
      // 🚀 CARGA PARALELA: Ambas peticiones al mismo tiempo
      const [graphqlData, templateModule] = await Promise.all([
        fetchPostBySlug(slug), // Petición 1: Datos
        import("./templates/portfolio-templates.js"), // Petición 2: Template (si es dinámico)
      ]);

      if (!graphqlData) {
        this.render404();
        return;
      }

      // Determinar qué template usar
      const templateId = graphqlData.portfolioTemplate || "hero-gallery";
      const template = portfolioTemplates[templateId] || defaultTemplate;

      // ⚡ INYECTAR TEMPLATE (antes de hidratar)
      app.innerHTML = template;

      // 💧 HIDRATAR con datos
      const hydrator = new PortfolioHydrator(graphqlData, templateId);
      await hydrator.hydrate();

      // 🎨 Actualizar meta tags
      this.updatePageMeta(graphqlData);

      // ✅ Listo
      console.log("✅ Page hydrated successfully");
    } catch (error) {
      console.error("Error loading portfolio:", error);
      this.renderError(error);
    }
  }

  updatePageMeta(data) {
    document.title = `${data.title} | Klef Agency`;

    // Meta tags dinámicos
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content =
        data.excerpt?.replace(/<[^>]*>/g, "").substring(0, 160) || "";
    }

    // Open Graph
    this.updateOgTag("og:title", data.title);
    this.updateOgTag("og:description", data.excerpt?.replace(/<[^>]*>/g, ""));
    this.updateOgTag("og:image", data.featuredImage?.node?.sourceUrl);
    this.updateOgTag("og:url", window.location.href);
  }

  updateOgTag(property, content) {
    if (!content) return;

    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("property", property);
      document.head.appendChild(tag);
    }
    tag.content = content;
  }

  render404() {
    document.getElementById("app").innerHTML = `
      <div class="error-404">
        <h1>404</h1>
        <p>Proyecto no encontrado</p>
        <a href="/portfolio">Ver todos los proyectos</a>
      </div>
    `;
  }

  renderError(error) {
    document.getElementById("app").innerHTML = `
      <div class="error">
        <h1>Error</h1>
        <p>No pudimos cargar el proyecto. Por favor intenta de nuevo.</p>
        <button onclick="location.reload()">Recargar</button>
      </div>
    `;
  }
}

export default Router;
```

---

## 📊 Timeline Visual del Proceso

```
t=0ms    Usuario visita /portfolio/proyecto-x
         │
         ├─→ Fetch GraphQL data ────────┐
         │                              │ (250ms)
         └─→ Load template (cache) ─┐   │
                                    │   │ (10ms)
                                    ▼   ▼
t=250ms  Both promises resolved
         │
         ├─→ Inject template HTML
         │   (instantáneo)
         │
t=260ms  ├─→ Wait for IDs in DOM
         │   (MutationObserver, ~5ms)
         │
t=265ms  └─→ Hydrate data into elements
             (instantáneo)

t=270ms  ✅ Page fully loaded and interactive
```

**Total: ~270ms** (vs. secuencial que sería ~500ms)

---

## ✅ Ventajas de Este Enfoque

1. **Velocidad**: 2x más rápido que carga secuencial
2. **Modular**: Templates separados del código
3. **Type-safe**: Los IDs se esperan explícitamente
4. **Error handling**: Si un ID no existe, se captura
5. **Flexible**: Puedes tener N templates diferentes
6. **Cacheable**: Los templates se pueden cachear

---

De donde se hace fetch data: revisar /shared/components/portfolio/portfolio-item-fetch.js

Que datos esperamos en la respuesta?

```json
{
  "data": {
    "post": {
      "id": "cG9zdDo5OTc=",
      "title": "Fish and Grill • Los Cabos | Restaurant Brand",
      "slug": "fish-and-grill-los-cabos-restaurant-brand",
      "uri": "/blog/fish-and-grill-los-cabos-restaurant-brand/",
      "date": "2026-02-12T22:47:09",
      "content": "\n<h2 class=\"wp-block-heading\">Bloque 1: El Estado Inicial</h2>\n\n\n\n<p>Nos encontramos con un logo visualmente atractivo pero que vivía solo. Tenía carácter y personalidad marina, pero carecía de adaptabilidad técnica.</p>\n\n\n\n<figure class=\"wp-block-image\"><img decoding=\"async\" src=\"https://klef.newfacecards.com/wp-content/uploads/2026/02/Fish-and-grill-Guidelines-2.jpg\" alt=\"Portfolio image\"/></figure>\n\n\n\n<h2 class=\"wp-block-heading\">Bloque 2: Construcción del Sistema</h2>\n\n\n\n<p>Refinamos el tracking y jerarquías. El símbolo &#8220;&amp;&#8221; pasó de aqua a negro para actuar como anclaje estructural.</p>\n\n\n\n<figure class=\"wp-block-image\"><img decoding=\"async\" src=\"https://klef.newfacecards.com/wp-content/uploads/2026/01/Fish-and-Grill-Web-03-600x400-1.jpg\" alt=\"Portfolio image\"/></figure>\n\n\n\n<h2 class=\"wp-block-heading\">Desarrollo de Recursos</h2>\n\n\n\n<p>Codificamos la paleta original y desarrollamos cinco paletas adicionales para diferentes estados de ánimo.</p>\n\n\n\n<p></p>\n\n\n\n<figure class=\"wp-block-image\"><img decoding=\"async\" src=\"https://klef.newfacecards.com/wp-content/uploads/2026/02/fish-and-grill-re-diseno-de-marca-y-extension-de-identidad-4.jpg\" alt=\"Portfolio image\"/></figure>\n\n\n\n<figure class=\"wp-block-image\"><img decoding=\"async\" src=\"https://klef.newfacecards.com/wp-content/uploads/2026/02/fish-and-grill-re-diseno-de-marca-y-extension-de-identidad-6.jpg\" alt=\"Portfolio image\"/></figure>\n\n\n\n<figure class=\"wp-block-image\"><img decoding=\"async\" src=\"https://klef.newfacecards.com/wp-content/uploads/2026/02/fish-and-grill-re-diseno-de-marca-y-extension-de-identidad-2.jpg\" alt=\"Portfolio image\"/></figure>\n\n\n\n<h2 class=\"wp-block-heading\">Bloque 3: Documentación</h2>\n\n\n\n<p>Creamos un manual de 17 páginas enfocado en la recursividad y escalabilidad del negocio.</p>\n\n\n\n<figure class=\"wp-block-image\"><img decoding=\"async\" src=\"https://klef.newfacecards.com/wp-content/uploads/2026/02/fish-and-grill-re-diseno-de-marca-y-extension-de-identidad-9.jpg\" alt=\"Portfolio image\"/></figure>\n\n\n\n<figure class=\"wp-block-image\"><img decoding=\"async\" src=\"https://klef.newfacecards.com/wp-content/uploads/2026/02/fish-and-grill-re-diseno-de-marca-y-extension-de-identidad-10.jpg\" alt=\"Portfolio image\"/></figure>\n\n\n\n<figure class=\"wp-block-image\"><img decoding=\"async\" src=\"https://klef.newfacecards.com/wp-content/uploads/2026/02/fish-and-grill-re-diseno-de-marca-y-extension-de-identidad-3.jpg\" alt=\"Portfolio image\"/></figure>\n",
      "featuredImage": {
        "node": {
          "sourceUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/01/Fish-and-Grill-Web-01-1024x576.jpg",
          "altText": ""
        }
      },
      "portfolioImages": [
        {
          "id": "cG9zdDo5OTU=",
          "sourceUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/02/fish-and-grill-re-diseno-de-marca-y-extension-de-identidad-1.jpg",
          "altText": "",
          "mediaItemUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/02/fish-and-grill-re-diseno-de-marca-y-extension-de-identidad-1.jpg"
        },
        {
          "id": "cG9zdDo5OTQ=",
          "sourceUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/02/fish-and-grill-re-diseno-de-marca-y-extension-de-identidad-13.jpg",
          "altText": "",
          "mediaItemUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/02/fish-and-grill-re-diseno-de-marca-y-extension-de-identidad-13.jpg"
        },
        {
          "id": "cG9zdDo5OTM=",
          "sourceUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/02/fish-and-grill-re-diseno-de-marca-y-extension-de-identidad-12.jpg",
          "altText": "",
          "mediaItemUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/02/fish-and-grill-re-diseno-de-marca-y-extension-de-identidad-12.jpg"
        },
        {
          "id": "cG9zdDo5OTI=",
          "sourceUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/02/fish-and-grill-re-diseno-de-marca-y-extension-de-identidad-11.jpg",
          "altText": "",
          "mediaItemUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/02/fish-and-grill-re-diseno-de-marca-y-extension-de-identidad-11.jpg"
        }
      ],
      "categories": {
        "nodes": [
          {
            "categoryId": 24,
            "name": "Branding",
            "slug": "branding",
            "uri": "/blog/category/portfolio/branding/"
          },
          {
            "categoryId": 23,
            "name": "Portfolio",
            "slug": "portfolio",
            "uri": "/blog/category/portfolio/"
          }
        ]
      },
      "tags": {
        "nodes": [
          {
            "tagId": 42,
            "name": "Branding",
            "slug": "branding"
          },
          {
            "tagId": 40,
            "name": "Cabo San Lucas",
            "slug": "cabo-san-lucas"
          },
          {
            "tagId": 37,
            "name": "Estrategia-de-Marca",
            "slug": "estrategia-de-marca"
          },
          {
            "tagId": 39,
            "name": "Los Cabos",
            "slug": "los-cabos"
          },
          {
            "tagId": 41,
            "name": "Sistema de diseño",
            "slug": "sistema-de-diseno"
          }
        ]
      },
      "author": {
        "node": {
          "id": "dXNlcjox",
          "name": "ivangonzalez",
          "firstName": "Ivan",
          "lastName": "Gonzalez",
          "uri": "/blog/author/ivangonzalez/",
          "url": "http://klef.newfacecards.com",
          "userId": 1,
          "rolesList": ["administrator"],
          "avatar": {
            "url": "https://klef.newfacecards.com/wp-content/uploads/ultimatemember/1/profile_photo-190x190.jpg?1770961683"
          }
        }
      },
      "coAuthors": [
        {
          "__typename": "User",
          "id": "dXNlcjox",
          "name": "ivangonzalez",
          "firstName": "Ivan",
          "lastName": "Gonzalez",
          "uri": "/blog/author/ivangonzalez/",
          "url": "http://klef.newfacecards.com",
          "userId": 1,
          "rolesList": ["administrator"],
          "avatar": {
            "url": "https://klef.newfacecards.com/wp-content/uploads/ultimatemember/1/profile_photo-190x190.jpg?1770961683"
          },
          "description": null
        },
        {
          "__typename": "User",
          "id": "dXNlcjoy",
          "name": "Daniela Millan",
          "firstName": "Daniela",
          "lastName": "Millan",
          "uri": "/blog/author/danielamillan/",
          "url": null,
          "userId": 2,
          "rolesList": ["um_admin"],
          "avatar": {
            "url": "https://klef.newfacecards.com/wp-content/uploads/ultimatemember/2/profile_photo-190x190.jpg?1770961683"
          },
          "description": null
        }
      ]
    }
  },
  "extensions": {
    "debug": [],
    "queryAnalyzer": {
      "keys": "470e95931896da5f459b04894e1175f267851248bf3a934315ffe85415bb9901 graphql:Query operation:GetPortfolioItem cG9zdDo5OTc= dXNlcjox cG9zdDo5MzU= cG9zdDo5OTU= cG9zdDo5OTQ= cG9zdDo5OTM= cG9zdDo5OTI= dGVybToyNA== dGVybToyMw== dGVybTo0Mg== dGVybTo0MA== dGVybTozNw== dGVybTozOQ== dGVybTo0MQ== dXNlcjoy",
      "keysLength": 292,
      "keysCount": 18,
      "skippedKeys": "",
      "skippedKeysSize": 0,
      "skippedKeysCount": 0,
      "skippedTypes": []
    }
  }
}
```

ahora, la forma en la que se solicitara la carga dinamica sera

colocar en una nueva ruta:

/mi-nueva-ruta/
└── index.html

en este index ira:

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Loading portfolio...</title>
  </head>
  <body>
    <div id="loading-screen">
      <div class="skel-loader"></div>
    </div>
    <script>
      //fetch template
      //fetch data wait for template and hydrate
    </script>
  </body>
</html>
```
