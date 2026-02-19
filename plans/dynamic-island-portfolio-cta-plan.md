# Plan: Agregar Preset "Historia Completa" a Dynamic Island

## Objetivo

Agregar un nuevo preset en el Dynamic Island que actúe como CTA (Call to Action) para leer la historia del portafolio en la sección de portafolios.

## Contexto

- El archivo principal es [`shared/components/dynamic-island/dynamic-island.js`](shared/components/dynamic-island/dynamic-island.js)
- Los presets se definen en [`DynamicIsland.presets`](shared/components/dynamic-island/dynamic-island.js:185)
- El botón "Completo" en el portafolio usa `data-view-target="full"` que al hacer clic establece `document.body.setAttribute("data-view", "full")` para mostrar el contenido completo de la historia

## Implementación

### 1. Agregar nuevo preset `portfolio_full_view`

Ubicación: Después del preset `help_settings_profile` en la línea 331

```javascript
portfolio_full_view: {
  getHtmlStructure(data) {
    return `
    <div class="island-content">
      <button class="island-btn accent" data-action="historia">
        <span class="icon">${data.historia.icon}</span>
        <span>${data.historia.name}</span>
      </button>
    </div>`;
  },
  data: {
    historia: {
      icon: ICONS.listMenu,
      name: "Historia Completa",
      function: () => {
        // Find the control button with data-view-target="full"
        const fullViewBtn = document.querySelector('.control-btn[data-view-target="full"]');
        if (fullViewBtn) {
          fullViewBtn.click();
        } else {
          // Fallback: directly set the view attribute
          document.body.setAttribute("data-view", "full");
        }
      },
    },
  },
},
```

### 2. Agregar el ícono listMenu a ICONS

Ubicación: En la sección ICONS alrededor de la línea 145

```javascript
listMenu: `
<svg
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="2"
style="--wh:20px; width: var(--wh); height: var(--wh);">
  <path d="M4 6h16M4 12h16M4 18h7"></path>
</svg>
`,
```

## Notas

- El preset sigue el mismo patrón que los presets existentes (`search_menu_cart`, `search_totop`, etc.)
- La función de acción primero intenta hacer clic en el botón existente, con fallback directo
- El estilo "accent" mantiene consistencia con otros botones principales

## Estado

- [x] Analizar la tarea y obtener información sobre los presets de dynamic island
- [x] Entender cómo funciona data-view-target="full" en portafolio
- [x] Crear nuevo preset "portfolio_full_view" en dynamic-island.js
- [x] Definir el ícono para el preset
- [x] Definir la función de acción que activa la vista completa
- [x] Agregar texto CTA "Historia Completa"
- [x] Implementar los cambios en modo Code
- [x] Agregar lógica de scroll para cambiar preset en portafolios
