# Portfolio Sheet - Arquitectura JSON

## Visión General

Separar la capa de diseño (estructura HTML/CSS) de la capa de datos (configuración JSON). Esto permite que el componente sheet sea reutilizable y configurable sin modificar el código.

## Estructura de Capas

```
┌─────────────────────────────────────────────────┐
│              loadSheet(config)                   │  ← API pública
├─────────────────────────────────────────────────┤
│         Capa de Datos (JSON Config)              │  ← Solo datos
├─────────────────────────────────────────────────┤
│         Capa de Render (Templates)               │  ← Templates JS
├─────────────────────────────────────────────────┤
│       Capa de Diseño (HTML/CSS)                  │  ← Estructura fija
└─────────────────────────────────────────────────┘
```

## JSON Schema para loadSheet()

### Estructura Principal

```json
{
  "topControls": {
    "actions": [
      { "label": "String", "action": "event-name", "icon": "svg-string?" }
    ],
    "moreActions": {
      "enabled": true,
      "actions": [
        { "label": "String", "action": "event-name", "icon": "svg-string?" }
      ]
    }
  },
  "content": {
    "type": "portfolio-detail | custom",
    "data": { /* data específica del tipo */ }
  },
  "bottomControls": {
    "primary": { "label": "String", "action": "event-name" },
    "secondary": { "label": "String", "action": "event-name" }?,
    "moreActions": { "enabled": true }?
  }
}
```

### Ejemplo de Uso

```javascript
// Portfolio Detail
loadSheet({
  topControls: {
    actions: [
      { label: "Ver proyecto", action: "view-project" }
    ],
    moreActions: {
      enabled: true,
      actions: [
        { label: "Compartir", action: "share", icon: "..." },
        { label: "Favoritos", action: "favorite", icon: "..." }
      ]
    }
  },
  content: {
    type: "portfolio-detail",
    data: { id: "casa-valentina", ... }
  },
  bottomControls: {
    primary: { label: "Ver caso de estudio", action: "open-case-study" },
    secondary: { label: "Más proyectos", action: "show-more" },
    moreActions: { enabled: true }
  }
});

// Contact Form
loadSheet({
  topControls: {
    actions: [],
    moreActions: { enabled: false }
  },
  content: {
    type: "contact-form",
    data: { subject: "Cotización" }
  },
  bottomControls: {
    primary: { label: "Enviar mensaje", action: "submit-form" },
    moreActions: { enabled: false }
  }
});
```

## Componentes del Sistema

### 1. Template Library (Templates.js)

```javascript
const SheetTemplates = {
  // Botones
  renderButton(config, className) {
    return `<button class="${className}" data-action="${config.action}">
      ${config.icon ? config.icon : ""}
      ${config.label || ""}
    </button>`;
  },

  renderChevron() {
    return `<button class="top-chevron" data-action="show-more" aria-label="Más opciones">
      <svg>...</svg>
    </button>`;
  },

  renderCloseButton() {
    return `<button class="close-btn" id="close-btn" aria-label="Cerrar panel">
      <svg>...</svg>
    </button>`;
  },

  // Dropdown
  renderDropdown(actions) {
    return `<div class="top-controls-dropdown">
      <ul>
        ${actions
          .map(
            (action) => `
          <li>
            <a href="#" data-action="${action.action}">
              ${action.icon || ""}
              ${action.label}
            </a>
          </li>
        `,
          )
          .join("")}
      </ul>
    </div>`;
  },

  // Contenedores
  renderTopControls(config) {
    const actionsHtml =
      config.actions
        ?.map((action) => this.renderButton(action, "top-btn"))
        .join("") || "";

    const moreActionsHtml = config.moreActions?.enabled
      ? this.renderDropdown(config.moreActions.actions)
      : "";

    return `<div class="sheet-top-controls">
      <div class="top-controls-wrapper">
        <div class="top-controls-left">
          ${actionsHtml}
          ${config.moreActions?.enabled ? this.renderChevron() : ""}
        </div>
        ${moreActionsHtml}
      </div>
      ${this.renderCloseButton()}
    </div>`;
  },

  renderBottomControls(config) {
    const secondaryHtml = config.secondary
      ? this.renderButton(config.secondary, "btn-secondary")
      : "";

    const primaryHtml = config.primary
      ? this.renderButton(config.primary, "btn-primary")
      : "";

    const moreBtnHtml = config.moreActions?.enabled
      ? `<button class="btn-more" data-action="more-options" aria-label="Más opciones">⋮</button>`
      : "";

    return `<div class="sheet-bottom-controls">
      ${secondaryHtml}
      ${primaryHtml}
      ${moreBtnHtml}
    </div>`;
  },

  renderContent(config) {
    // Aquí se delega al ContentRenderer
    return ContentRenderer.render(config);
  },
};
```

### 2. Content Renderer (ContentRenderer.js)

```javascript
const ContentRenderer = {
  registry: {},

  register(type, renderer) {
    this.registry[type] = renderer;
  },

  render(config) {
    const renderer = this.registry[config.type];
    if (!renderer) {
      console.warn(`Unknown content type: ${config.type}`);
      return '<div class="empty-content"></div>';
    }
    return renderer(config.data);
  },

  // Tipos predefinidos
  init() {
    this.register("portfolio-detail", PortfolioContent.render);
    this.register("contact-form", ContactContent.render);
    this.register("custom", CustomContent.render);
  },
};
```

### 3. Event Handlers (Handlers.js)

```javascript
const SheetHandlers = {
  init(sheetElement) {
    // Top controls
    this.handleTopActions(sheetElement);
    this.handleDropdown(sheetElement);

    // Bottom controls
    this.handleBottomActions(sheetElement);

    // Close button
    this.handleClose(sheetElement);
  },

  handleTopActions(sheet) {
    sheet.querySelectorAll(".top-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        sheet.dispatchEvent(
          new CustomEvent("sheet-top-action", {
            detail: { action: btn.dataset.action },
          }),
        );
      });
    });
  },

  handleDropdown(sheet) {
    const chevron = sheet.querySelector(".top-chevron");
    const dropdown = sheet.querySelector(".top-controls-dropdown");

    if (chevron && dropdown) {
      chevron.addEventListener("click", (e) => {
        e.stopPropagation();
        chevron.classList.toggle("expanded");
        dropdown.classList.toggle("active");
      });

      dropdown.querySelectorAll("a").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          sheet.dispatchEvent(
            new CustomEvent("sheet-dropdown-action", {
              detail: { action: item.dataset.action },
            }),
          );
          chevron.classList.remove("expanded");
          dropdown.classList.remove("active");
        });
      });
    }
  },

  handleBottomActions(sheet) {
    const primary = sheet.querySelector(".btn-primary");
    const secondary = sheet.querySelector(".btn-secondary");
    const more = sheet.querySelector(".btn-more");

    if (primary) {
      primary.addEventListener("click", () => {
        sheet.dispatchEvent(
          new CustomEvent("sheet-primary-action", {
            detail: { action: primary.dataset.action },
          }),
        );
      });
    }

    if (secondary) {
      secondary.addEventListener("click", () => {
        sheet.dispatchEvent(
          new CustomEvent("sheet-secondary-action", {
            detail: { action: secondary.dataset.action },
          }),
        );
      });
    }

    if (more) {
      more.addEventListener("click", () => {
        sheet.dispatchEvent(
          new CustomEvent("sheet-more-options", {
            detail: { action: more.dataset.action },
          }),
        );
      });
    }
  },

  handleClose(sheet) {
    const closeBtn = sheet.querySelector(".close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        sheet.dispatchEvent(new CustomEvent("sheet-close"));
      });
    }
  },
};
```

### 4. API Principal (SheetManager.js)

```javascript
class SheetManager {
  constructor() {
    this.sheet = document.getElementById("bottomsheet");
    this.backdrop = document.getElementById("backdrop");
    this.contentZone = document.getElementById("sheet-content");
    ContentRenderer.init();
  }

  load(config) {
    // Validar config
    this.validateConfig(config);

    // Renderizar top controls
    this.renderTopControls(config.topControls);

    // Renderizar contenido
    this.renderContent(config.content);

    // Renderizar bottom controls
    this.renderBottomControls(config.bottomControls);

    // Inicializar handlers
    SheetHandlers.init(this.sheet);

    // Abrir sheet
    this.open();
  }

  renderTopControls(config) {
    const topControls = this.sheet.querySelector(".sheet-top-controls");
    topControls.innerHTML = SheetTemplates.renderTopControls(config);
  }

  renderContent(config) {
    this.contentZone.innerHTML = SheetTemplates.renderContent(config);
  }

  renderBottomControls(config) {
    const bottomControls = this.sheet.querySelector(".sheet-bottom-controls");
    bottomControls.innerHTML = SheetTemplates.renderBottomControls(config);
  }

  validateConfig(config) {
    // Validar que tenga la estructura correcta
    if (!config.topControls || !config.content || !config.bottomControls) {
      throw new Error("Invalid sheet config: missing required sections");
    }
  }

  open() {
    this.sheet.classList.add("open");
    this.backdrop.classList.add("visible");
  }

  close() {
    this.sheet.classList.remove("open");
    this.backdrop.classList.remove("visible");
  }
}

// Exportar instancia global
window.sheetManager = new SheetManager();
window.loadSheet = (config) => window.sheetManager.load(config);
```

## Archivos del Sistema

```
shared/components/sheet/
├── sheet-system.js          # Entry point, combina todo
├── sheet-config.js          # Schema y constantes
├── sheet-templates.js       # Templates HTML
├── sheet-content.js         # ContentRenderer y tipos
├── sheet-handlers.js        # Event handlers
└── sheet.css                # Estilos del componente
```

## Uso Simple

```javascript
// Cargar un sheet con la configuración
loadSheet({
  topControls: {
    actions: [{ label: "Editar", action: "edit" }],
    moreActions: {
      enabled: true,
      actions: [
        { label: "Duplicar", action: "duplicate" },
        { label: "Eliminar", action: "delete" },
      ],
    },
  },
  content: {
    type: "portfolio-detail",
    data: { id: "123" },
  },
  bottomControls: {
    primary: { label: "Guardar", action: "save" },
    secondary: { label: "Cancelar", action: "cancel" },
    moreActions: { enabled: true },
  },
});

// Escuchar eventos
document
  .querySelector("#bottomsheet")
  .addEventListener("sheet-primary-action", (e) => {
    console.log("Primary action:", e.detail.action);
  });
```

## Resumen de Componentes

| Capa      | Archivo              | Responsabilidad                 |
| --------- | -------------------- | ------------------------------- |
| API       | `sheet-system.js`    | loadSheet(), open(), close()    |
| Templates | `sheet-templates.js` | Renderizar HTML de controles    |
| Content   | `sheet-content.js`   | Renderizar contenido según tipo |
| Handlers  | `sheet-handlers.js`  | Manejar eventos de botones      |
| Styles    | `sheet.css`          | CSS del componente              |
