# Plan: Sistema de Filtrado por Tags de Búsqueda

## Objetivo

Al hacer clic en los tags de búsqueda en `#search-tags` (Desarrollo, Diseño, Marketing), filtrar proyectos que contengan esa palabra en sus `categories` o `tags` del backend de WordPress.

## Mapeo de Tags

- **Desarrollo** → busca coincidencia con "desarrollo" en categories/tags
- **Diseño** → busca coincidencia con "diseño" en categories/tags
- **Marketing** → busca coincidencia con "marketing" en categories/tags

## Arquitectura del Sistema

```mermaid
flowchart TD
    A[User hace clic en tag #search-tags] --> B[Obtener texto del tag<br/>Desarrollo | Diseño | Marketing]
    B --> C[Abrir overlay de búsqueda<br/>con query: tag:texto]
    C --> D[search-system.js<br/>filterResultsLocally]
    D --> E[Filtrar por categories.nodes.name<br/>y tags.nodes.name]
    E --> F[Mostrar resultados<br/>en searchOverlay]
```

## Archivos a Modificar

### 1. [`index.html`](index.html:3816)

- Agregar `data-filter` attribute a cada span en `#search-tags`
- Estructura actual ya existe

### 2. [`shared/components/search/search-system.js`](shared/components/search/search-system.js)

- Crear función `filterBySearchTag(tagText)`
- Integrar con overlay de búsqueda existente

### 3. [`index.html`](index.html) - Estilos CSS

- Añadir estilos para estado activo de los tags
- `.search-tag.active` con color de borde correspondente

## Implementación Paso a Paso

### Paso 1: Agregar data attributes a los tags

```html
<span
  class="border-emerald-500"
  data-filter="desarrollo"
  role="button"
  tabindex="0"
  aria-label="Filtrar proyectos por Desarrollo"
>
  <svg>...</svg>
  Desarrollo
</span>
<span
  class="border-amber-500"
  data-filter="diseño"
  role="button"
  tabindex="0"
  aria-label="Filtrar proyectos por Diseño"
>
  <svg>...</svg>
  Diseño
</span>
<span
  class="border-blue-500"
  data-filter="marketing"
  role="button"
  tabindex="0"
  aria-label="Filtrar proyectos por Marketing"
>
  <svg>...</svg>
  Marketing
</span>
```

### Paso 2: Script de event listeners

```javascript
// Buscar todos los tags en #search-tags
document.querySelectorAll("#search-tags span[data-filter]").forEach((tag) => {
  tag.addEventListener("click", function () {
    const filterValue = this.getAttribute("data-filter");

    // Toggle: si ya está activo, limpiar; si no, activar
    if (this.classList.contains("active")) {
      clearAllFilters();
      this.classList.remove("active");
    } else {
      // Remover active de otros tags
      document
        .querySelectorAll("#search-tags span[data-filter]")
        .forEach((t) => {
          t.classList.remove("active");
        });

      // Activar este tag
      this.classList.add("active");

      // Ejecutar búsqueda con filtro de tag
      filterBySearchTag(filterValue);
    }
  });

  // Soporte para teclado
  tag.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.click();
    }
  });
});
```

### Paso 3: Integración con search-system.js

```javascript
function filterBySearchTag(tagText) {
  // Usar el sistema existente con filtro de tag
  activeFilters.filters = {
    tag: { value: tagText, negated: false },
  };
  rebuildQueryAndSearch();
}
```

### Paso 4: CSS para estados activos

```css
#search-tags > span {
  transition: all 0.2s ease;
  cursor: pointer;
}

#search-tags > span:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

#search-tags > span.active {
  ring: 2px;
  ring-color: currentColor;
  transform: translateY(-2px);
}

#search-tags > span[data-filter="desarrollo"].active {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

#search-tags > span[data-filter="diseño"].active {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

#search-tags > span[data-filter="marketing"].active {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}
```

## Consideraciones de UX

1. **Toggle**: Al hacer clic de nuevo en el tag activo, se limpia el filtro
2. **Visual feedback**: El tag muestra estado activo con color de borde y fondo
3. **Keyboard accessible**: Soporta Enter y Espacio para accesibilidad
4. **Resultados**: Se muestran en el overlay de búsqueda existente

## Archivos Modificados

| Archivo                                                                                    | Cambio                             |
| ------------------------------------------------------------------------------------------ | ---------------------------------- |
| [`index.html`](index.html:3816)                                                            | Agregar `data-filter` attributes   |
| [`index.html`](index.html:2203)                                                            | Añadir estilos CSS                 |
| [`shared/components/search/search-system.js`](shared/components/search/search-system.js:1) | Añadir función `filterBySearchTag` |
| [`index.html`](index.html:4838)                                                            | Añadir event listeners             |

## Estado

Plan listo para implementación. ¿Procedemos con el desarrollo?
