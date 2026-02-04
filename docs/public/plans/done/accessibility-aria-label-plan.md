# Accessibility ARIA-Label Implementation Plan

**Created:** 2026-02-03
**File:** index.html
**Status:** Planning Complete - Ready for Implementation

## Overview

This plan outlines the comprehensive implementation of `aria-label` attributes throughout the index.html file to improve web accessibility for screen reader users.

## Elements Requiring aria-labels

### 1. Mega Topbar Buttons

| Element      | Line | Current Code                                                         | Proposed Change                                                                                             |
| ------------ | ---- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Back button  | 3435 | `<button class="back-btn" data-action="go-back">Volver</button>`     | `<button class="back-btn" data-action="go-back" aria-label="Volver al menú anterior">Volver</button>`       |
| Close button | 3436 | `<button class="close-btn" data-action="close-menu">Cerrar</button>` | `<button class="close-btn" data-action="close-menu" aria-label="Cerrar menú de navegación">Cerrar</button>` |

### 2. Navigation Menu Links

| Element             | Line      | Current Code                                                   | Proposed Change                                                                                |
| ------------------- | --------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Diseño y Media link | 3456-3468 | `<a href="#" data-mega="#Diseno" data-name="#Diseno">`         | `<a href="#" data-mega="#Diseno" data-name="#Diseno" aria-label="Sección Diseño y Media">`     |
| Tecnología link     | 3470-3482 | `<a href="#" data-mega="#Tecnologia" data-name="#Tecnologia">` | `<a href="#" data-mega="#Tecnologia" data-name="#Tecnologia" aria-label="Sección Tecnología">` |
| Marketing link      | 3484-3496 | `<a href="#" data-mega="#Marketing" data-name="#Marketing">`   | `<a href="#" data-mega="#Marketing" data-name="#Marketing" aria-label="Sección Marketing">`    |

### 3. Mega Menu Sidebar Links

#### Diseño y Media Menu (Lines 3530-3562)

| Element                | Current Code                                    | Proposed aria-label                               |
| ---------------------- | ----------------------------------------------- | ------------------------------------------------- |
| Branding link          | `<a href="#"><span>Branding</span>...`          | `aria-label="Ver proyectos de Branding"`          |
| Studio Multimedia link | `<a href="#"><span>Studio Multimedia</span>...` | `aria-label="Ver proyectos de Studio Multimedia"` |
| Publicidad link        | `<a href="#"><span>Publicidad</span>...`        | `aria-label="Ver proyectos de Publicidad"`        |

#### Tecnología Menu (Lines 3586-3618)

| Element             | Current Code                                 | Proposed aria-label                            |
| ------------------- | -------------------------------------------- | ---------------------------------------------- |
| Desarrollo Web link | `<a href="#"><span>Desarrollo Web</span>...` | `aria-label="Ver proyectos de Desarrollo Web"` |
| Apps Móviles link   | `<a href="#"><span>Apps Móviles</span>...`   | `aria-label="Ver proyectos de Apps Móviles"`   |
| E-commerce link     | `<a href="#"><span>E-commerce</span>...`     | `aria-label="Ver proyectos de E-commerce"`     |

#### Marketing Menu (Lines 3646-3678)

| Element               | Current Code                                   | Proposed aria-label                                |
| --------------------- | ---------------------------------------------- | -------------------------------------------------- |
| Social Media link     | `<a href="#"><span>Social Media</span>...`     | `aria-label="Ver proyectos de Social Media"`       |
| SEO/SEM link          | `<a href="#"><span>SEO/SEM</span>...`          | `aria-label="Ver estrategias SEO/SEM"`             |
| Content Strategy link | `<a href="#"><span>Content Strategy</span>...` | `aria-label="Ver estrategias de Content Strategy"` |

### 4. Hero Section Search Input

| Element      | Line      | Current Code                                                                                                            | Proposed Change                                                                                                                                          |
| ------------ | --------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Search input | 4003-4009 | `<input id="klef-search" type="text" class="input input-has-icon-left" placeholder="Search: Mockups, Logos, Design..."` | `<input id="klef-search" type="text" class="input input-has-icon-left" placeholder="Search: Mockups, Logos, Design..." aria-label="Buscar en el sitio">` |

### 5. Hero Tag Buttons (Spans needing accessibility)

| Element        | Lines     | Current Code                        | Proposed Change                                                                |
| -------------- | --------- | ----------------------------------- | ------------------------------------------------------------------------------ |
| Desarrollo tag | 4016-4031 | `<span class="border-emerald-500">` | Add `role="button" tabindex="0" aria-label="Filtrar proyectos por Desarrollo"` |
| Diseño tag     | 4032-4047 | `<span class="border-amber-500">`   | Add `role="button" tabindex="0" aria-label="Filtrar proyectos por Diseño"`     |
| Marketing tag  | 4048-4063 | `<span class="border-blue-500">`    | Add `role="button" tabindex="0" aria-label="Filtrar proyectos por Marketing"`  |

### 6. Footer Social Media Links

| Element        | Lines     | Current Code                                                              | Proposed Change                                                                                            |
| -------------- | --------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Instagram link | 5010-5034 | `<a href="https://www.instagram.com/klef.agency/" ...>`                   | `<a href="https://www.instagram.com/klef.agency/" ... aria-label="Síguenos en Instagram">`                 |
| Facebook link  | 5036-5061 | `<a href="https://www.facebook.com/klef.agency/" ...>`                    | `<a href="https://www.facebook.com/klef.agency/" ... aria-label="Síguenos en Facebook">`                   |
| YouTube link   | 5063-5088 | `<a href="https://www.youtube.com/channel/UCYFT6kwbsDzbiK6OjuKWM5w" ...>` | `<a href="https://www.youtube.com/channel/UCYFT6kwbsDzbiK6OjuKWM5w" ... aria-label="Síguenos en YouTube">` |
| WhatsApp link  | 5090-5115 | `<a href="https://wa.me/526245161037" ...>`                               | `<a href="https://wa.me/526245161037" ... aria-label="Contactarnos por WhatsApp">`                         |

### 7. Bottom Sheet Elements

#### Top Buttons (Lines 5800-5801)

| Element         | Current Code                                                           | Proposed Change                                                                                                    |
| --------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Acción 1 button | `<button class="top-btn" data-action="top-action-1">Acción 1</button>` | `<button class="top-btn" data-action="top-action-1" aria-label="Acción primaria del proyecto">Acción 1</button>`   |
| Acción 2 button | `<button class="top-btn" data-action="top-action-2">Acción 2</button>` | `<button class="top-btn" data-action="top-action-2" aria-label="Acción secundaria del proyecto">Acción 2</button>` |

#### Bottom Control Buttons (Lines 5916-5928)

| Element                 | Current Code                                                    | Proposed Change                                                                                                           |
| ----------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Secundario button       | `<button class="btn-secondary" data-action="secondary-action">` | `<button class="btn-secondary" data-action="secondary-action" aria-label="Ver opciones secundarias">Secundario</button>`  |
| Acción Principal button | `<button class="btn-primary" data-action="primary-action">`     | `<button class="btn-primary" data-action="primary-action" aria-label="Abrir proyecto completo">Acción Principal</button>` |

### 8. Dynamically Generated Elements (JavaScript)

#### Tab Buttons (Line 5621 in JS template)

```javascript
// Current:
<button class="tab-button ${cat.id === activeId ? "active" : ""}" data-id="${cat.id}">
  ${cat.label}
</button>

// Proposed:
<button class="tab-button ${cat.id === activeId ? "active" : ""}"
        data-id="${cat.id}"
        aria-label="Filtrar por ${cat.label}"
        aria-pressed="${cat.id === activeId}">
  ${cat.label}
</button>
```

#### Sub-Chips (Line 5647 in JS template)

```javascript
// Current:
<div class="${isMobile ? "sub-chip-mobile" : "sub-chip"}" onclick="selectSub(this)">
  ${sub}
</div>

// Proposed:
<div class="${isMobile ? "sub-chip-mobile" : "sub-chip"}"
     onclick="selectSub(this)"
     role="button"
     tabindex="0"
     aria-label="Filtrar por ${sub}">
  ${sub}
</div>
```

#### Portfolio Card Buttons (Line 5564 in JS template)

```javascript
// Current:
<button class="see-more" data-component="portfolioDetail" data-id="${card.id}">Más</button>

// Proposed:
<button class="see-more"
        data-component="portfolioDetail"
        data-id="${card.id}"
        aria-label="Ver detalles de ${card.title[0]}">
  Más
</button>
```

#### Project Actions Tag (Line 5561 in JS template)

```javascript
// Current:
<div class="tag-portfolio" aria-label="Leer historia">
  <i class="fa-solid fa-user"></i> Leer historia
</div>

// Proposed:
<div class="tag-portfolio"
     role="button"
     tabindex="0"
     aria-label="Leer historia de ${card.title[0]}">
  <i class="fa-solid fa-user"></i> Leer historia
</div>
```

## Implementation Order

1. **Phase 1: Static HTML Elements**
   - Mega Topbar buttons
   - Navigation menu links
   - Mega Menu sidebar links
   - Hero search input
   - Hero tag buttons
   - Footer social media links
   - Bottom Sheet elements

2. **Phase 2: JavaScript Templates**
   - Tab buttons
   - Sub-chips
   - Portfolio card buttons
   - Project actions

## Verification Checklist

- [ ] Test with screen readers (NVDA, VoiceOver, JAWS)
- [ ] Verify keyboard navigation works correctly
- [ ] Check ARIA attributes don't conflict with existing accessibility features
- [ ] Validate HTML with W3C validator
- [ ] Run Lighthouse accessibility audit
- [ ] Test with axe DevTools

## Estimated Impact

- **Improves:** Screen reader user experience
- **Affected Pages:** index.html
- **Backward Compatibility:** Fully backward compatible, no breaking changes
