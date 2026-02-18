# Sistema de Navegación por Secciones para Contenido Gutenberg

## Resumen

Este documento describe un sistema de utilidades en JavaScript para procesar contenido de WordPress Gutenberg (recibido via GraphQL) y generar navegación dinámica basada en secciones marcadas con una sintaxis de meta-markdown personalizada.

---

## Problema

El contenido de `data.post.content` proveniente de WordPress Gutenberg contiene:

- Texto formateado con bloques HTML
- Imágenes embebidas
- Estructura no predecible

Se necesita una forma de:

1. Dividir el contenido en secciones lógicas
2. Asignar identificadores únicos a cada sección
3. Generar navegación dinámica (tabs) que lleve a cada sección
4. Mantener un menú de navegación sticky

---

## Solución: Markdown-Style para Secciones

### Sintaxis Propuesta

Usaremos una sintaxis de "marcador" simple que se integra naturalmente en el flujo de escritura de Gutenberg o cualquier editor Markdown:

```markdown
-# section-name | Título de la Sección
```

O simplemente:

```markdown
-# Estado-Inicial
```

**Normalización Automática:**

- El sistema detecta el patrón `-#`.
- Si escribes `-# Estado-Inicial`, el sistema genera `id="estado-inicial"` y el título del tab será **"Estado Inicial"** (reemplazando `-` por espacios).
- Soporta espacios opcionales después de `-#`.

**Componentes:**

- `-#` - Prefijo identificador.
- `section-name` - Slug o candidato a título.
- `|` - Separador (opcional).
- `Título de la Sección` - Título explícito (opcional).

### Ejemplo de Contenido Gutenberg

```html
<p>-#introduccion | Introducción</p>
<p>Este es el contenido de la introducción...</p>
<img src="imagen1.jpg" alt="Imagen intro" />

<p>-#antecedentes</p>
<h2>Antecedentes del Proyecto</h2>
<p>Texto sobre los antecedentes...</p>

<p>-#proceso | Proceso de Diseño</p>
<p>Descripción del proceso...</p>
<img src="proceso.jpg" />

<p>-#resultados</p>
<h3>Resultados Finales</h3>
<p>Los resultados obtenidos...</p>
```

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE DATOS                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  GraphQL Response                                           │
│       │                                                     │
│       ▼                                                     │
│  ┌───────────────────────┐                                   │
│  │SectionNavigation.parse()│  ← Extrae secciones del HTML    │
│  └──────────┬────────────┘                                   │
│             │                                               │
│             ▼                                               │
│  ┌───────────────────────┐                                   │
│  │ sections[] e HTML     │  ← Data y HTML procesado         │
│  └──────────┬────────────┘                                   │
│             │                                               │
│       ┌─────┴─────┐                                         │
│       │           │                                         │
│       ▼           ▼                                         │
│ ┌───────────┐ ┌───────────────┐                             │
│ │renderTabs()│ │target.innerHTML│                             │
│ └───────────┘ └───────────────┘                             │
│       │               │                                     │
│       ▼               ▼                                     │
│   Tab Buttons     Secciones con IDs                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Estructura de Datos

### Tipo: SectionData

```javascript
/**
 * @typedef {Object} SectionData
 * @property {string} id - Slug de la sección (kebab-case)
 * @property {string} title - Título legible para el tab
 * @property {string} content - Contenido HTML de la sección
 */
```

### Tipo: ParseResult

```javascript
/**
 * @typedef {Object} ParseResult
 * @property {SectionData[]} sections - Array de secciones encontradas
 * @property {string} processedContent - HTML con wrappers <section> y placeholders de imagen
 * @property {Map} imageRegistry - Mapa de imágenes para hidratación (ID -> Data)
 */
```

---

## Rendimiento: Image SEO Hydrator

El sistema detecta automáticamente etiquetas `<img>` dentro del contenido de Gutenberg y optimiza su carga:

1.  **Extracción**: Durante el parseo, las imágenes se reemplazan por placeholders: `<div class="image-hydrator skeleton" data-image-id="..."></div>`.
2.  **SEO Container**: Se crea un contenedor oculto `#seo-images` donde se colocan las imágenes originales para que los motores de búsqueda las indexen.
3.  **Hidratación**: Se utiliza `IntersectionObserver` para detectar cuándo un placeholder entra en el viewport y cargar la imagen real dinámicamente.
4.  **Layout Shifts**: Si el bloque de Gutenberg incluye atributos `width` y `height`, el sistema los usa para definir un `aspect-ratio` en el placeholder, evitando saltos visuales.

---

## Funciones Principales

### 1. SectionNavigation.parse(content)

Extrae todas las secciones del contenido HTML y genera el HTML procesado.

```javascript
SectionNavigation.parse = function (content) {
  if (!content) return { sections: [], processedContent: "" };

  const markerRegex = /-#\s*([^|\n<]+)(?:\s*\|\s*([^<\n]+))?/g;
  const sections = [];
  const matches = [];
  let match;

  while ((match = markerRegex.exec(content)) !== null) {
    matches.push({
      fullMatch: match[0],
      idCandidate: match[1].trim(),
      explicitTitle: match[2] ? match[2].trim() : null,
      index: match.index,
    });
  }

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    const start = current.index + current.fullMatch.length;
    const end = next ? next.index : content.length;

    let sectionContent = content.substring(start, end).trim();
    let sectionId = SectionNavigation.slugify(current.idCandidate);
    let sectionTitle = current.explicitTitle;

    if (!sectionTitle) {
      if (
        current.idCandidate.includes("-") ||
        current.idCandidate.includes(" ")
      ) {
        sectionTitle = current.idCandidate
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
      } else {
        const headingMatch = sectionContent.match(
          /<h[1-6][^>]*>(.*?)<\/h[1-6]>/i,
        );
        sectionTitle = headingMatch
          ? headingMatch[1].replace(/<[^>]*>/g, "").trim()
          : sectionId;
      }
    }

    sections.push({
      id: sectionId,
      title: sectionTitle,
      content: sectionContent,
    });
  }

  const processedContent = sections
    .map((section) => {
      const cleanContent = section.content.replace(/^<br\s*\/?>/i, "");
      return `<section id="${section.id}" class="section-container" data-section-title="${section.title}">
      ${cleanContent}
    </section>`;
    })
    .join("\n");

  return { sections, processedContent };
};
```

### 2. SectionNavigation.renderTabs(sections, containerSelector)

Genera los botones de navegación dinámicamente.

```javascript
SectionNavigation.renderTabs = function (sections, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container || !sections.length) return;

  container.innerHTML = "";
  sections.forEach((section, index) => {
    const button = document.createElement("button");
    button.className = "tab-btn";
    button.dataset.target = section.id;
    button.dataset.state = index === 0 ? "active" : "idle";
    button.textContent = section.title;
    container.appendChild(button);
  });
};
```

---

## Uso con GraphQL

```javascript
// Ejemplo de uso con respuesta GraphQL
async function loadPostContent(slug) {
  const query = `query GetPost($id: ID!) { post(id: $id, idType: SLUG) { content } }`;
  const response = await fetch("/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { id: slug } }),
  });

  const { data } = await response.json();

  if (data.post && data.post.content) {
    const { sections, processedContent } = SectionNavigation.parse(
      data.post.content,
    );

    // Inyectar contenido procesado
    document.getElementById("post-content").innerHTML = processedContent;

    // Renderizar tabs
    SectionNavigation.renderTabs(sections, "#tabsScroll");

    // Iniciar navegación
    if (window.setupTabsNavigation) window.setupTabsNavigation();
  }
}
```

---

## Estilos CSS Recomendados

```css
/* Contenedor de navegación sticky */
.sticky-section-nav {
  position: sticky;
  top: 60px; /* Debajo del header principal */
  z-index: 100;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 0.5rem 0;
}

/* Lista de tabs */
.section-tabs {
  display: flex;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.section-tabs::-webkit-scrollbar {
  display: none;
}

/* Tab individual */
.section-tab {
  flex-shrink: 0;
}

.section-tab-link {
  display: block;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.section-tab-link:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.section-tab.active .section-tab-link,
.section-tab[aria-selected="true"] .section-tab-link {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

/* Secciones de contenido */
.content-section {
  scroll-margin-top: 100px; /* Offset para header sticky */
  padding-top: 1rem;
}
```

---

## Consideraciones para Gutenberg

### Bloques que Preservan Comentarios

Gutenberg preserva los comentarios HTML en los siguientes bloques:

- Bloque "HTML Personalizado"
- Bloque "Código Corto"
- Dentro del contenido de bloques personalizados

### Alternativa: Bloque Personalizado

Para mayor robustez, se puede crear un bloque de Gutenberg personalizado:

```javascript
// register-block.js
registerBlockType("klef/section-marker", {
  title: "Marcador de Sección",
  icon: "editor-insertmore",
  category: "layout",
  attributes: {
    sectionId: {
      type: "string",
      source: "attribute",
      attribute: "data-section-id",
    },
    sectionTitle: {
      type: "string",
      source: "attribute",
      attribute: "data-section-title",
    },
  },
  save({ attributes }) {
    return (
      <div
        className="wp-block-klef-section-marker"
        data-section-id={attributes.sectionId}
        data-section-title={attributes.sectionTitle}
      />
    );
  },
});
```

### Alternativa: Atributos de Datos en Bloques Existentes

Otra opción es usar los atributos de bloque existentes:

```html
<!-- wp:heading {"level":2,"className":"section-marker","anchor":"introduccion"} -->
<h2 id="introduccion" class="section-marker" data-section-title="Introducción">
  Introducción
</h2>
<!-- /wp:heading -->
```

---

## API Completa

```javascript
// Métodos disponibles en SectionNavigation
SectionNavigation.slugify(text); // Normaliza slugs
SectionNavigation.parse(content); // Retorna { sections, processedContent }
SectionNavigation.renderTabs(sections, containerSelector); // Renderiza botones
```

---

## Ejemplo Completo de Implementación

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Post con Secciones</title>
  </head>
  <body>
    <div id="tabsScroll" class="tabs-nav"></div>
    <article id="post-content"></article>

    <script src="shared/utilities/section-navigation.js"></script>
    <script>
      // Simulando carga de datos
      const content = `
        <p>-# introduccion</p>
        <h2>Introducción</h2>
        <p>Contenido...</p>
        
        <p>-# Proceso-Diseño</p>
        <p>Contenido del proceso...</p>
      `;

      const { sections, processedContent } = SectionNavigation.parse(content);
      document.getElementById("post-content").innerHTML = processedContent;
      SectionNavigation.renderTabs(sections, "#tabsScroll");
    </script>
  </body>
</html>
```

---

## Ventajas de Esta Solución

1. **Baja Fricción**: La sintaxis `-#` es fácil de escribir para usuarios no técnicos.
2. **Normalización Inteligente**: Genera IDs y títulos limpios automáticamente.
3. **Flexible**: Funciona con cualquier contenido de Gutenberg (incluso dentro de `<p>`).
4. **SEO-friendly**: Los IDs permiten deep linking.
5. **Performance**: Usa Intersection Observer para Scroll Spy eficiente.

---

## Limitaciones

1. Requiere que los editores usen la sintaxis correcta de marcadores.
2. No soporta secciones anidadas (por diseño).
3. Requiere JavaScript habilitado para la funcionalidad de pestañas.

---

## Futuras Mejoras

- [ ] Panel de administración para gestionar marcadores
- [ ] Generación automática de TOC (Table of Contents)
- [ ] Bloque nativo de Gutenberg para insertar marcadores visualmente
- [ ] Soporte para internacionalización de títulos
