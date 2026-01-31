/* ============================================
   SHEET SYSTEM - Content Renderer
   ============================================ */

const ContentRenderer = {
  registry: {},

  // Registrar un tipo de contenido
  register(type, renderer) {
    this.registry[type] = renderer;
    return this;
  },

  // Renderizar contenido por tipo
  render(config) {
    const type = config.type || "html";
    const renderer = this.registry[type];

    if (!renderer) {
      console.warn(`[ContentRenderer] Unknown content type: "${type}"`);
      return this.renderHtml({ html: "<p>Contenido no disponible</p>" });
    }

    return renderer(config.data || {}, config);
  },

  // Renderizar HTML directo
  renderHtml(data) {
    return data.html || "";
  },

  // Renderizar portfolio detail
  renderPortfolioDetail(data) {
    return `
      <div class="portfolio-detail" data-id="${data.id || ""}">
        ${
          data.cover
            ? `
          <img src="${data.cover}" alt="${data.title || "Proyecto"}" 
               class="portfolio-detail-cover" loading="lazy">
        `
            : ""
        }
        
        ${
          data.logo
            ? `
          <div class="portfolio-detail-header">
            <img src="${data.logo}" alt="Logo" class="portfolio-detail-logo">
            <div class="portfolio-detail-title">
              <h2>${data.title || "Proyecto"}</h2>
              ${data.client ? `<p class="portfolio-detail-client">${data.client}</p>` : ""}
            </div>
          </div>
        `
            : `
          <div class="portfolio-detail-title">
            <h2>${data.title || "Proyecto"}</h2>
            ${data.client ? `<p class="portfolio-detail-client">${data.client}</p>` : ""}
          </div>
        `
        }
        
        ${
          data.tags
            ? `
          <div class="portfolio-detail-meta">
            ${data.tags
              .map(
                (tag) => `
              <span class="tag ${tag.type ? "tag-" + tag.type : ""}">${tag.label}</span>
            `,
              )
              .join("")}
          </div>
        `
            : ""
        }
        
        ${
          data.description
            ? `
          <div class="portfolio-detail-description">
            ${data.description}
          </div>
        `
            : ""
        }
        
        ${
          data.content
            ? `
          <div class="portfolio-detail-content">
            ${data.content}
          </div>
        `
            : ""
        }
      </div>
    `;
  },

  // Renderizar formulario de contacto
  renderContactForm(data) {
    return `
      <div class="sheet-contact-form">
        ${data.title ? `<h3>${data.title}</h3>` : ""}
        ${data.subject ? `<p class="form-subject">${data.subject}</p>` : ""}
        
        <form class="contact-form" data-action="submit-form">
          <div class="form-group">
            <label for="sheet-name">Nombre</label>
            <input type="text" id="sheet-name" name="name" required 
                   placeholder="Tu nombre completo">
          </div>
          
          <div class="form-group">
            <label for="sheet-email">Email</label>
            <input type="email" id="sheet-email" name="email" required
                   placeholder="tu@email.com">
          </div>
          
          <div class="form-group">
            <label for="sheet-message">Mensaje</label>
            <textarea id="sheet-message" name="message" rows="4" required
                      placeholder="¿En qué podemos ayudarte?"></textarea>
          </div>
          
          <input type="hidden" name="subject" value="${data.subject || "Consulta"}">
        </form>
      </div>
    `;
  },

  // Renderizar lista de items
  renderList(data) {
    const items = data.items || [];
    return `
      <div class="sheet-list">
        ${data.title ? `<h3>${data.title}</h3>` : ""}
        <ul class="list-items">
          ${items
            .map(
              (item) => `
            <li class="list-item" data-action="${item.action || "#"}" 
                data-id="${item.id || ""}">
              ${item.icon ? `<span class="item-icon">${item.icon}</span>` : ""}
              <div class="item-content">
                <span class="item-label">${item.label}</span>
                ${item.sublabel ? `<span class="item-sublabel">${item.sublabel}</span>` : ""}
              </div>
              ${item.badge ? `<span class="item-badge">${item.badge}</span>` : ""}
            </li>
          `,
            )
            .join("")}
        </ul>
      </div>
    `;
  },

  // Renderizar mensaje simple
  renderMessage(data) {
    return `
      <div class="sheet-message">
        ${data.icon ? `<div class="message-icon">${data.icon}</div>` : ""}
        ${data.title ? `<h3>${data.title}</h3>` : ""}
        ${data.text ? `<p class="message-text">${data.text}</p>` : ""}
        ${
          data.action
            ? `
          <button class="btn-primary" data-action="${data.action.action}">
            ${data.action.label || "Aceptar"}
          </button>
        `
            : ""
        }
      </div>
    `;
  },

  // Inicializar tipos predefinidos
  init() {
    this.register("html", this.renderHtml.bind(this));
    this.register("portfolio-detail", this.renderPortfolioDetail.bind(this));
    this.register("contact-form", this.renderContactForm.bind(this));
    this.register("list", this.renderList.bind(this));
    this.register("message", this.renderMessage.bind(this));
    return this;
  },
};

// Inicializar automáticamente
ContentRenderer.init();
