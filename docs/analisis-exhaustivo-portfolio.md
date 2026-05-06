# 📋 Análisis Exhaustivo: Sección Portfolio (#portfolio-section)

**Archivo base:** `index.html` (líneas 4636-4733 + scripts asociados)  
**Fecha:** 2026-05-05  
**Autor:** Kilo (Análisis técnico)

---

## 📐 ESTRUCTURA GENERAL DE LA SECCIÓN

La sección `#portfolio-section` está compuesta por **5 elementos principales**:

1. **Cabecera con título y descripción** (líneas 4637-4642)
2. **Barra de控制 de búsqueda y filtros** (líneas 4643-4715)
   - Contiene: checkbox oculto, input de búsqueda, tabs de categorías, toggle button móvil, sub-chips desktop/mobile
3. **Contenedor de tarjetas** (línea 4719): `<div class="card-grid" id="cardGrid"></div>`
4. **Contador de resultados** (línea 4720): `<span id="results-count">12 Proyectos</span>`
5. **Botón "Ver todos"** (líneas 4721-4728)

---

## 🔍 BARRA DE BÚSQUEDA Y FILTROS

### 2.1. Elementos DOM

#### **A. Checkbox Oculto de Estado**
```html
<input type="checkbox" style="display: none" id="is-searching" />
```
- **Propósito:** Actúa como flag de estado para CSS (checkbox hack)
- **Selectores CSS que lo usan:**
  ```css
  #is-searching:checked + .tab-menu-wrapper .tabs-scroll-container { ... }
  #is-searching:checked + .tab-menu-wrapper .tabs-list { width: 0; opacity: 0; }
  #is-searching:checked + .tab-menu-wrapper .search-wrapper { flex: 1; }
  #is-searching:checked + .tab-menu-wrapper .search-input-portfolio { width: 100%; }
  ```
- **Comportamiento:** Cuando está `checked`, oculta los tabs y expande el input de búsqueda. Usado para transición suave entre "modo navegación" y "modo búsqueda".

#### **B. Input de Búsqueda con Toggle**
```html
<div class="search-wrapper">
  <input
    id="tab-search__bar"
    type="text"
    class="search-input-portfolio"
    placeholder="Buscar proyectos..."
    aria-label="Buscar"
  />
  <div class="search-icon-portfolio">...svg...</div>
</div>
```
- **Estados del input:**
  1. **Estado idle (por defecto):**
     - `width: 48px` (colapsado, icono visible)
     - `padding: 0`
     - `color: transparent` (placeholder invisible)
     - `cursor: pointer`
     - `border-radius: 50px` (círculo)
  
  2. **Estado focus (cuando se hace clic):**
     - Se activa el `#is-searching` checkbox
     - `width: 100%`
     - `padding: 0 20px 0 45px`
     - `color: var(--primary-black)` (texto visible)
     - `cursor: text`
     - `border-color: var(--primary-black)`
  
  3. **Estado con texto:**
     - Se aplica en tiempo real vía `input` event
     - Filtra las cards inmediatamente (sin debounce)
  
  4. **Estado blur (pérdida de foco):**
     - Si el input está vacío → `#is-searching` se unchecked → se restaura UI original
     - Si tiene texto → mantiene estado expandido (permite seguir filtrando)

- **Transition:** `all 0.4s cubic-bezier(0.4, 0, 0.2, 1)` — animación suave de expansión

#### **C. Tabs de Categorías Principales**
```html
<div class="tabs-scroll-container" id="tabsContainer">
  <ul class="tabs-list" id="tabsList"></ul>
</div>
```

**Generación dinámica** (portfolio-grid.js:254-267):
```javascript
categories = [
  { id: 0, label: "Todo", filter: "all", subs: [] },
  { id: 1, label: "Diseño", filter: "brands", subs: [] },
  { id: 2, label: "Webs", filter: "dev", subs: [] },
  { id: 3, label: "Studio", filter: "studio", subs: [] },
  { id: 4, label: "Marketing", filter: "strategy", subs: [] },
];
```

**Estados del botón tab:**
- **Estado default:**
  - `padding: 10px 35px 10px 22px` (espaciado generoso)
  - `border-radius: 50px` (pill shape)
  - `border: 1px solid #d0d0d0`
  - `background: white`
  - `color: #5f6368`
  - `font-size: 14px`
  - `font-weight: 500`
  - `white-space: nowrap`
  - `transition: all 0.3s ease`

- **Estado active (cuando se hace clic):**
  - `background: var(--primary-black)` → `#1a1a1a`
  - `color: white`
  - `border-color: var(--primary-black)`
  - Se agrega clase `.active`

- **Estado hover:**
  - `background: #f5f5f5` (gris claro)
  - En móvil, se transforma en botón circular negro (`.menu-toggle-btn`)

**Indicador de submenú:**
- Clase `.has-sub-indicator` — triángulo CSS que rota 90° cuando el tab está active
- `position: absolute; right: 12px; top: 50%; transform: translateY(-50%)`

**Scroll behavior (móvil):**
- `overflow-x: auto` con scrollbar oculto (`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`)
- Cuando se hace clic en un tab en móvil, se calcula posición para **centrar el botón activo** (portfolio-grid.js:336-362):
  ```javascript
  const scrollPosition = buttonOffset - containerWidth / 2 + buttonWidth / 2;
  container.scrollTo({ left: finalScroll, behavior: "smooth" });
  ```

#### **D. Toggle Button (Móvil)**
```html
<button class="menu-toggle-btn" id="menuToggle" aria-label="Abrir menú">
  <!-- Íconos hamburger/close -->
</button>
```
- **Display:** `none` por defecto, visible solo en `@media (max-width: 999px)` (linea 2866-2870)
- **Estilo:** Fondo negro (`var(--primary-black)`), icono blanco en forma circular (48×48px)
- **Función:** Alterna clase `.expanded` en `.tabs-scroll-container`
  - **Expandido:** Los tabs se envuelven (`flex-wrap: wrap`), se muestran todos los sub-chips
  - **Colapsado:** Los tabs son horizontalmente scrollables, sub-chips ocultos
- **Iconos:**
  - `#menuIcon` (líneas 4680-4694): three lines (hamburger)
  - `#closeIcon` (líneas 4696-4710): X mark (oculto por defecto)
- **Transición:** El contenedor de tabs obtiene `box-shadow: none` y `border-radius: 24px` cuando expandido (CSS línea 2857-2860)

### 2.2. Sub-Menus (Chips)

#### **Desktop Sub-Chips**
```html
<div class="desktop-sub-chips" id="desktopSubChips"></div>
```
- **Posicionamiento:** `position: absolute; top: 100%; left: 0;`
- **Animación de entrada:**
  - `opacity: 0; visibility: hidden; transform: translateY(10px)`
  - Cuando active: `opacity: 1; visibility: visible; transform: translateY(0)`
  - `transition: all 0.3s ease`
- **Posición dinámica:** Se calcula en base al índice del tab activo (portfolio-grid.js:299-312):
  ```javascript
  const offset = activeIndex * buttonWidth;
  const maxOffset = viewportWidth - subMenuWidth - 20;
  const leftPosition = Math.min(offset, maxOffset);
  desktopSubChips.style.left = `${leftPosition}px`;
  ```
  Esto hace que el submenú "siga" al tab activo, pero sin salirse del viewport.
- **Estilos del chip:**
  ```css
  .sub-chip {
    padding: 6px 16px;
    background: white;
    border: 1px solid #d0d0d0;
    border-radius: 20px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .sub-chip.active {
    background: var(--primary-black);
    color: white;
    border-color: var(--primary-black);
  }
  ```

#### **Mobile Sub-Dock (Thumb Dock)**
```html
<div class="mobile-thumb-dock" id="mobileSubDock"></div>
```
- **Posicionamiento:** Fixed en la parte inferior central
  ```css
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%) translateY(150px); /* oculto inicialmente */
  width: calc(100% - 40px);
  max-width: 450px;
  background: rgba(26, 26, 26, 0.9);
  backdrop-filter: blur(10px);
  padding: 12px;
  border-radius: 24px;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: var(--z-floating);
  ```
- **Estado activo:** Clase `.active` → `transform: translateX(-50%) translateY(0)` (aparece desde abajo)
- **Chips móviles (`.sub-chip-mobile`):**
  ```css
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border-radius: 15px;
  white-space: nowrap;
  font-size: 14px;
  ```
- **Display controlado por media queries:**
  - `@media (min-width: 769px) { .mobile-thumb-dock { display: none; } }`
  - `@media (max-width: 768px) { .desktop-sub-chips { display: none; } }`

### 2.3. Lógica de Filtrado

**Estado global:**
```javascript
let activeId = 0;        // Índice de categoría principal (0-4)
let currentSub = "";     // Subcategoría seleccionada (string del sub-chip)
let searchTerm = "";     //Texto del input de búsqueda
```

**Estructura de datos:**
```javascript
categories = [
  { id: 0, label: "Todo", filter: "all", subs: [] },
  { id: 1, label: "Diseño", filter: "brands", subs: [] },
  { id: 2, label: "Webs", filter: "dev", subs: [] },
  { id: 3, label: "Studio", filter: "studio", subs: [] },
  { id: 4, label: "Marketing", filter: "strategy", subs: [] },
];
```

**Función `applyFilters()` (portfolio-grid.js:218-252):**
1. Comienza con `portfolioData` completo (6 items hardcodeados en index.html)
2. **Filtro por disciplina (categoría principal):**
   ```javascript
   const currentFilter = categories[activeId].filter;
   if (currentFilter !== "all") {
     filtered = filtered.filter(card => card.discipline === currentFilter);
   }
   ```
   - Mapping: `brands` → Diseño, `dev` → Webs, `studio` → Studio, `strategy` → Marketing
3. **Filtro por subcategoría:**
   ```javascript
   if (currentSub) {
     const mapped = subMapping[currentSub]; // ej: "Identidad Visual" → "Identidad Visual"
     if (mapped) {
       filtered = filtered.filter(card =>
         card.category.some(c => c.toLowerCase().includes(mapped.toLowerCase()))
       );
     }
   }
   ```
   - `subMapping` (líneas 148-162) mapea nombres de UI a slugs/tags del CMS
   - Filtra por **alguna** categoría que contenga el substring
4. **Filtro por texto de búsqueda:**
   ```javascript
   if (searchTerm) {
     filtered = filtered.filter(card =>
       card.title.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
       card.category.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())) ||
       card.client_name.toLowerCase().includes(searchTerm.toLowerCase())
     );
   }
   ```
   - Busca en: título (array de strings), categorías (array), nombre del cliente
   - **No busca en el extracto** (solo en campos estructurados)
5. **Renderización:**
   ```javascript
   renderCards(filtered);
   ```

**Actualización de sub-menús (`updateSubMenus()`:269-314):**
- Limpia ambos contenedores (desktop y mobile)
- Si la categoría activa no tiene subs → no muestra nada
- Renderiza chips del array `category.subs` (actualmente vacío en todas las categorías)
- **Problema detectado:** `category.subs` está vacío para todas las categorías, por lo que `updateSubMenus()` nunca muestra contenido. Los subs están declarados en el HTML de mega-menus pero no en el JS del portfolio.

---

## 🎴 PORTFOLIO CARDS

### 3.1. Template de la Card

**Función `createCardTemplate()` (portfolio-grid.js:180-209):**

```javascript
function createCardTemplate(card) {
  return `
    <article class="card dark" data-id="${card.id}" data-discipline="${card.discipline}">
      <span class="category-tag tag-${card.discipline}">${disciplineLabels[card.discipline]}</span>
      <img src="${card.cover_image}" alt="${card.title[0]}">
      <section>
        <div class="project-header">
          <div class="project-logo">
            <img src="${card.logo || card.cover_image}" alt="${card.title[0]}">
          </div>
          <div class="project-title">
            <h2>${card.title[0]} <small>| ${card.title[1]}</small></h2>
            <span>${card.category.join(", ")}</span>
          </div>
        </div>
        <p><br>${card.extract}</p>
        <div class="project-actions">
          <div class="tag-portfolio" role="button" tabindex="0" aria-label="Leer historia de ${card.title[0]}">
            <i class="fa-solid fa-user"></i> Leer historia
          </div>
          <button class="see-more" data-component="portfolioDetail" data-id="${card.id}" aria-label="Ver detalles de ${card.title[0]}">Más</button>
        </div>
      </section>
    </article>
  `;
}
```

### 3.2. Estructura HTML de la Card

```html
<article class="card dark" data-id="001" data-discipline="brands">
  <!-- Tag flotante superior izquierdo -->
  <span class="category-tag tag-brands">Klef Brands</span>

  <!-- Imagen de portada (objeto-fit: cover) -->
  <img src="..." alt="Hello Dish">

  <!-- Contenido superpuesto (gradiente + blur) -->
  <section>
    <!-- Header: Logo + Título -->
    <div class="project-header">
      <div class="project-logo">
        <img src="..." alt="Hello Dish logo"> <!-- 48×48px default -->
      </div>
      <div class="project-title">
        <h2>Hello Dish <small>| Identidad</small></h2>
        <span>manual-de-marca, branding</span>
      </div>
    </div>

    <!-- Extracto (oculto por defecto, aparece en hover) -->
    <p>La convergencia entre lo análogo...</p>

    <!-- Acciones (aparecen en hover) -->
    <div class="project-actions">
      <div class="tag-portfolio" role="button" tabindex="0">
        <i class="fa-solid fa-user"></i> Leer historia
      </div>
      <button class="see-more" data-component="portfolioDetail" data-id="001">
        Más
      </button>
    </div>
  </section>
</article>
```

### 3.3. Estados Visuales de la Card

**Estado base (no hover):**
- `position: relative`
- `overflow: clip` (para que el pseudo-elemento `::before` no se salga)
- `background: var(--bg)` → `#222` (modo oscuro)
- `border-radius: 2rem`
- `padding: 0.5rem` (borde interior)
- `width: 20rem` (~320px)
- `height: 32rem` (~512px) — **aspect ratio fijo**
- `transition` en `::before` para movimiento del gradiente

**Pseudo-elemento `::before` (gradiente/flood):**
```css
.card::before {
  content: "";
  position: absolute;
  width: calc(100% - 1rem);
  height: 10rem;
  bottom: 0.5rem;
  left: 0.5rem;
  mask: linear-gradient(#0000, #000f 80%);
  backdrop-filter: blur(1rem);
  border-radius: 0 0 1.5rem 1.5rem;
  translate: 0 0;
  transition: translate 0.25s;
  background: var(--bg); /* Mismo color que la card */
}
```
- **Propósito:** Capa que se "desliza" hacia arriba en hover, revelando el contenido
- `mask`: Degradado que hace que la parte superior sea transparente
- `backdrop-filter: blur(1rem)` → difumina el fondo

**Header del proyecto (`project-header`):**
```css
.card:not(:hover):not(:focus-within) .project-header {
  translate: 0 -50px;
  z-index: var(--z-1);
}
```
- **No hover:** Se desplaza hacia arriba (`translateY(-50px)`), quedando parcialmente fuera de la card
- **Hover/focus:** Vuelve a su posición normal (`translate: 0`)
- Esto crea el efecto "floating header" que solo se ve completo en hover

**Imagen (`img`):**
```css
.card > img {
  max-width: 100%;
  aspect-ratio: 2 / 3; /* Relación 2:3 (vertical) */
  object-fit: cover;
  object-position: 50% 5%; /* Ligeramente arriba para mostrar lo importante */
  border-radius: 1.5rem;
  transition:
    aspect-ratio 0.25s,
    object-position 0.5s;
  width: 100%;
  height: auto;
}
```
- **Estado base:** Aspect ratio 2:3 (retrato)
- **Hover:** Cambia a `aspect-ratio: 1 / 1` (cuadrado) y `object-position: 50% 10%` (center-top)
  - Esto hace un **zoom/crop** de la imagen, mostrando el centro superior
  - Transición suave de 0.25s

**Extracto (`p`):**
```css
.card > section p {
  font-size: 0.95rem;
  line-height: 1.3;
  color: var(--text-color);
  opacity: 0;
  margin: 0;
  margin-block-end: 0.5rem;
  translate: 0 100%;
  transition:
    margin-block-end 0.25s,
    opacity 1s 0.2s,
    translate 0.25s 0.2s;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 60px;
}
```
- **Oculto inicialmente:** `opacity: 0`, `translateY(100%)` (fuera de la card, abajo)
- **Aparece en hover:** Después de 0.2s de delay (espera a que el header baje)
  - `opacity: 1`
  - `translate: 0`
  - `margin-block-end`恢复正常
- **Clamp:** Limita a 3 líneas máximo

**Botones de acción (`project-actions`):**
```css
.card > section .project-actions {
  flex: 1;
  align-items: flex-end;
  display: flex;
  justify-content: space-between;
  translate: 0 100%;
  opacity: 0;
  transition:
    translate 0.25s 0.2s,
    opacity 1s;
}
```
- **Ocultos inicialmente** (igual que el párrafo)
- **Aparecen después:** Delay de 0.2s, transición más lenta (1s para opacity)
- Contienen:
  - **"Leer historia"** (`.tag-portfolio`): `role="button"`, `tabindex="0"` → accesible
    - Icono FontAwesome: `fa-solid fa-user`
    - **NO tiene event listener directo** — es decorativo
  - **Botón "Más"**: `<button class="see-more" data-component="portfolioDetail" data-id="...">`
    - Desplazamiento con `translate: 1rem` (se mueve 1rem a la derecha)
    - **Pseudo-elementos `::before` y `::after`** crean una flecha/icono de "expandir"
      - `::before`: línea horizontal
      - `::after`: línea vertical (rotada 90°)
    - Al hacer hover: `background: var(--button-color-hover)`
    - Al hacer focus: `outline: 2px solid var(--text-color)`
    - **Event delegation** captura clics en este botón (index.html:6334-6347)

**Cambios globales en hover:**
```css
.card:hover::before,
.card:focus-within::before {
  translate: 0 100%; /* Se desplaza completamente abajo, cubriendo el fondo */
}

.card:hover > img,
.card:focus-within > img {
  aspect-ratio: 1 / 1;
  object-position: 50% 10%;
}

.card:hover > section p,
.card:focus-within > section p {
  translate: 0 0;
  opacity: 1;
}

.card:hover > section h2,
.card:focus-within > section h2 {
  color: var(--title-color-hover);
}

.card:hover > section .project-actions,
.card:focus-within > section .project-actions {
  translate: 0 0;
  opacity: 1;
  transition:
    translate 0.25s 0.25s,
    opacity 0.5s 0.25s;
}
```

**Accesibilidad:**
- `:focus-within` soportado → cuando algún elemento interactivo dentro de la card recibe foco, se aplican los mismos estilos que hover
- `role="button"` y `tabindex="0"` en elementos clickeables no-nativos
- `aria-label` en botones con íconos

### 3.4. Datos de Portfolio (Hardcodeados)

**Array `portfolioData` (portfolio-grid.js:60-139):**
```javascript
[
  {
    id: "001",
    slug: "hello-dish",
    discipline: "brands",  // ← Usado para filtro principal y clase CSS
    category: ["manual-de-marca", "branding"],  // ← Array de strings para filtro sub-cat
    content_type: "Portfolio",
    title: ["Hello Dish", "Identidad"],  // ← [nombre proyecto, tipo de proyecto]
    client_name: "Hello Dish",
    client_industry: "Restaurantes",
    extract: "La convergencia entre lo análogo...",
    cover_image: "../../../assets/images/portfolio/hello-dish-portfolio-card.jpg",
    logo: "../../../assets/images/portfolio/logos/hello-dish-logo.jpg",
  },
  // ... 5 más (total 6)
];
```

- **6 proyectos** representando las 4 disciplinas:
  - `brands` (3): Hello Dish, Klef, Casa Valentina
  - `dev` (1): JB Pools
  - `studio` (1): Cumbre del Tezal
  - `strategy` (1): Tour Company

---

## 📜 SIDE SHEET / BOTTOM SHEET

### 4.1. Estructura HTML

```html
<div id="backdrop"></div>           <!-- Overlay oscuro -->
<div id="bottomsheet">              <!-- Panel principal -->
  <div class="drag-handle"></div>   <!-- Móvil: handle para arrastrar -->
  <div class="sheet-top-controls">  <!-- Header con botones -->
    <div class="top-controls-left">
      <button class="top-btn" data-action="top-action-1">Acción 1</button>
      <button class="top-btn" data-action="top-action-2">Acción 2</button>
      <button class="top-chevron" data-action="show-more">▼</button>
    </div>
    <div class="top-controls-dropdown">...menu...</div>
    <button class="close-btn" id="close-btn">✕</button>
  </div>
  <div id="sheet-content"></div>   <!-- Contenido dinámico -->
  <div class="sheet-bottom-controls"> <!-- Footer con acciones -->
    <button class="btn-secondary">Secundario</button>
    <button class="btn-primary">Acción Principal</button>
    <button class="btn-more">⋮</button>
  </div>
</div>
```

### 4.2. Estados del Sheet

**Modo Móvil (bottom sheet):**
```css
@media (max-width: 767px) {
  #bottomsheet {
    bottom: 0;
    left: 0;
    right: 0;
    height: 70vh;
    max-height: 90vh;
    transform: translateY(100%); /* Oculto abajo */
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  }
  #bottomsheet.open {
    transform: translateY(0); /* Se desliza hacia arriba */
  }
  #bottomsheet.full {
    height: 95vh; /* Fullscreen casi completo */
  }
}
```

**Modo Escritorio (side panel):**
```css
@media (min-width: 768px) {
  #bottomsheet {
    top: 0;
    right: 0;
    bottom: 0;
    width: 480px;
    max-width: 90vw;
    height: 100vh;
    transform: translateX(100%); /* Oculto a la derecha */
    border-left: 1px solid var(--k-light);
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  }
  #bottomsheet.open {
    transform: translateX(0); /* Se desliza hacia la izquierda */
  }
  #bottomsheet.full {
    width: 680px; /* Panel más ancho */
  }
}
```

- **Transición:** `transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)` — ease-out suave
- **Backdrop:** `#backdrop` se opacity-fade in simultáneamente

**Drag Handle (solo móvil):**
- `<div class="drag-handle">` — barra gris de 40×4px en la parte superior
- `display: block` solo en móvil, `none` en desktop
- Proporciona affordance de "arrastrar hacia abajo para cerrar" (aunque no esté implementado el drag gesture)

### 4.3. Inicialización y Ciclo de Vida

**Carga de scripts (index.html:6240-6244):**
```html
<link rel="stylesheet" href="./shared/components/sheet/sheet.css" />
<script src="./shared/components/sheet/sheet-templates.js"></script>
<script src="./shared/components/sheet/sheet-content.js"></script>
<script src="./shared/components/sheet/sheet-handlers.js"></script>
<script src="./shared/components/sheet/sheet-system.js"></script>
```

**API Global (sheet-system.js:232-253):**
```javascript
window.loadSheet = function(config) { ... };
window.openSheet = function(config) { ... };
window.closeSheet = function() { ... };
window.toggleSheet = function(config) { ... };
window.sheetUtils = {
  createPortfolioConfig(data, actions),
  createContactConfig(subject, primaryAction),
  createHtmlConfig(html, actions)
};
```

**Activación desde Portfolio Grid (index.html:6334-6347):**
```javascript
document.addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-component]");
  if (!trigger) return;

  const componentName = trigger.getAttribute("data-component");
  if (componentName === "portfolioDetail") {
    e.preventDefault();
    const portfolioId = trigger.getAttribute("data-id");
    if (window.loadPortfolioDetail) {
      window.loadPortfolioDetail(portfolioId);
    }
  }
});
```

**Función `loadPortfolioDetail()` (index.html:6255-6330):**
1. Busca el item en `portfolioData` por `id`
2. Si no encuentra, carga sheet con mensaje "Proyecto no encontrado"
3. Si encuentra:
   - Genera HTML del detalle (clase `.portfolio-detail`)
   - Construye tags HTML a partir de `portfolioItem.category`
   - Llama a `loadSheet({...})` con configuración completa

**Contenido generado:**
```html
<div class="portfolio-detail">
  <img src="cover_image" class="portfolio-detail-cover">
  <div class="portfolio-detail-header">
    <img src="logo" class="portfolio-detail-logo">
    <div class="portfolio-detail-title">
      <h2>Hello Dish <small>| Identidad</small></h2>
      <span class="portfolio-detail-client">Hello Dish • Restaurantes</span>
    </div>
  </div>
  <div class="portfolio-detail-meta">
    <span class="tag tag-discipline">Brands</span>
    <!-- Tags de categoría -->
    <span class="tag">manual-de-marca</span>
    <span class="tag">branding</span>
  </div>
  <p class="portfolio-detail-description">La convergencia entre lo análogo...</p>
</div>
```

**Controles superiores (top controls):**
- **Acciones primarias:** Dos botones `Acción 1` y `Acción 2` (placeholders)
- **Botón chevron:** `data-action="show-more"` → despliega dropdown menu
- **Dropdown menu:** `.top-controls-dropdown` con items:
  - Compartir
  - Agregar a favoritos
  - Copiar enlace
  - Reportar contenido

**Controles inferiores (bottom controls):**
- **Botón secundario:** `Secundario` (clase `.btn-secondary`)
- **Botón primario:** `Acción Principal` (clase `.btn-primary`) → etiqueta "Ver Proyecto Completo"
- **Botón más opciones:** `⋮` (clase `.btn-more`) — trigrama vertical

**Handlers (sheet-handlers.js — no visto pero inferido):**
- Gestionan eventos de los botones (`data-action` attributes)
- disparan eventos `sheet-close` para cerrar
- posiblemente manejan el dropdown toggle

### 4.4. Comunicación con el exterior

**Evento personalizado:**
```javascript
this.sheet.addEventListener("sheet-close", () => this.close());
```
- Cualquier script puede hacer: `sheet.dispatchEvent(new CustomEvent('sheet-close'))`

**Callbacks de acciones:**
- Los botones del top/bottom tienen `data-action` que son capturados por `SheetHandlers.init()`
- No hay callbacks configurados en el `loadPortfolioDetail` actual — acciones son estáticas

---

## 🔢 CONTADOR DE RESULTADOS

**Elemento:** `<span id="results-count">12 Proyectos</span>` (línea 4720)

**Actualización (portfolio-grid.js:213-215):**
```javascript
function renderCards(cards) {
  cardGrid.innerHTML = cards.map(...).join("");
  if (resultsCount) {
    resultsCount.textContent = `${cards.length} Proyecto${cards.length !== 1 ? "s" : ""}`;
  }
}
```

- **Format:** `<number> Proyecto|Proyectos`
- **Actualización:** Cada vez que `applyFilters()` altera el array filtrado
- **Singular/Plural:** Usa template literals con operador ternario
- **Localización:** Hardcoded en español (no internacionalizado)

**No hay animación de transición** — cambio directo de texto.

---

## 🎯 BUSQUEDA INTEGRADA (Search Overlay vs Portfolio Search)

### 5.1. Dos Sistemas de Búsqueda Paralelos

| Característica | **Hero Search** (`#klef-search`) | **Portfolio Search** (`#tab-search__bar`) |
|----------------|-----------------------------------|------------------------------------------|
| **Ubicación**  | Hero, dentro del `.white-shadow`  | Dentro de la barra de filtros del portfolio |
| **Overlay**    | Abre `#searchOverlay` completo  | **NO** — filtra in-place |
| **Input expandible** | No — siempre expandido | Sí — de 48px circular a ancho completo |
| **Delay**      | 800ms + 1s overlay delay (shimmer) | 0ms — filtrado inmediato |
| **Fuente de datos** | GraphQL API (WPGraphQL) | `portfolioData` array local |
| **Ámbito** | Toda la web (pages + posts) | Solo proyectos del portfolio estático |
| **URL sync**   | Sí — `?q=...&f_type=...` | No — estado solo en memoria |
| **Historial**  | Sí — localStorage `recentSearches` | No |
| **Chips de filtro** | Sí — chips activos removibles | No — solo tabs/sub-chips |
| **Teclado**    | Ctrl+K para abrir | No |

### 5.2. Flujo de Búsqueda del Hero (SearchInputCapture)

**Estado del input (index.html:5560-5665):**
```javascript
class SearchInputCapture {
  constructor() {
    this.currentValue = "";
    this.history = [];
    this.typingTimer = null;
    this.typingDelay = 800;      // 800ms después de dejar teclear
    this.overlayDelay = 1000;    // 1s antes de abrir overlay
  }
}
```

**Secuencia:**
1. Usuario escribe en `#klef-search` → evento `input`
2. Cada keystroke resetea `typingTimer`
3. Si hay texto, `setTimeout(..., 800)` → `onTypingComplete()`
4. `onTypingComplete()`:
   - Agrega clase `.shimmer-active` al input (efecto de brillo)
   - Copia valor a `#searchInput` (input del overlay)
   - `setTimeout(..., 1000)` → `openOverlayAndSearch()`
5. `openOverlayAndSearch()`:
   - Remueve shimmer
   - Llama a `window.openSearch()` (muestra overlay con animación)
   - Espera 100ms → `window.searchFor(val)` (ejecuta búsqueda real en GraphQL)
6. Búsqueda completa → resultados en `#resultsContainer`

**Shimmer effect (CSS lines 2517-2544):**
```css
#klef-search.shimmer-active {
  background: linear-gradient(
    90deg,
    var(--shimmer-color-1) 0%,
    var(--shimmer-color-2) 20%,
    var(--shimmer-color-3) 40%,
    var(--shimmer-color-2) 60%,
    var(--shimmer-color-1) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 1.5s infinite linear;
}
```
- Animación: `@keyframes shimmer { from { background-position: -1000px 0 } to { background-position: 1000px 0 } }`
- Colores por defecto: blanco → gris claro → azul claro → gris claro → blanco
- Da feedback visual de "procesando"

---

## 🎨 SISTEMA DE ARQUITECTURA LIMPIA (Plan)

**docs/plan-hidratacion-portfolio.md** establece:

### Principios:
1. **Separación total entre Data Layer / State Layer / UI Layer**
2. Uso de `data-* attributes` para estado (loading, active, etc.)
3. GraphQL para fetch de datos (actualmente los 6 proyectos están hardcodeados en el HTML)
4. Template rendering dinámico (actualmente `innerHTML` con template literal estático)

### Componentes propuestos:

| Componente | Responsabilidad |
|------------|----------------|
| `PortfolioManager` | Fetch GraphQL, manejo de estado, orquestación |
| Skeleton Loader | CSS/HTML que simula card durante carga |
| Dynamic Card Template | Generador HTML basado en nodos GraphQL |
| `sheetUtils.createPortfolioConfig()` | Factory para configurar sheet con datos |

### Optimizaciones sugeridas:
- **srcset** para imágenes responsivas
- **aspect-ratio** reservado en CSS para evitar CLS
- **sessionStorage** cache de resultados
- **IntersectionObserver** para lazy-load de más items (paginación infinita)

---

## ⚠️ PROBLEMAS DETECTADOS

1. **`subMapping` no se usa en el portfolio-grid actual**
   - Las categorías tienen `subs: []` vacío
   - Los sub-menús nunca se muestran (excepto si se agregaran dinámicamente desde backend)
   - El mapping `subMapping` está definido pero solo se usa en `applyFilters()` para búsqueda de texto, no para chips visuales

2. **Filtrado de búsqueda del portfolio limitado**
   - Solo busca en `title`, `category`, `client_name`
   - No busca en `extract` (descripción larga)
   - No soporta búsqueda por palabras parciales en categorías (solo substring directo)

3. **Hardcodeo de datos**
   - `portfolioData` está en el script inline (líneas 5700-5778 de index.html)
   - Duplicado en `portfolio-grid.js` (líneas 60-139) — **inconsistente**
   - Si se agrega un proyecto, hay que modificar dos archivos

4. **Event delegation duplicado**
   - En `index.html` (6334-6347) y en `portfolio-grid.js` no hay — solo el de index
   - El evento se registra después de DOMContentLoaded en index.html

5. **Accesibilidad parcial:**
   - Los chips de sub-menú en móvil tienen `role="button"` y `tabindex="0"` pero no manejan `Enter`/`Space`
   - El "Leer historia" (`.tag-portfolio`) no tiene event listener — solo decorativo

6. **SEO:**
   - Las cards se renderizan en el servidor (HTML inicial) — ✅ bueno para SEO
   - Pero el contenido está hardcodeado, no dinámico desde WordPress

7. **Missing error handling:**
   - Si `portfolioData` no está definido, el script falla silenciosamente
   - No hay fallback si el fetch de GraphQL fallara (en futura implementación)

---

## 📊 RESUMEN DE FLUJOS

### Flujo de interacción del usuario:
```
1. Usuario ve la sección Portfolio
   ↓
2. Ve 6 cards pre-renderizadas
   ↓
3. Puede:
   a) Click en tab "Diseño" → filtra por discipline=brands (3 cards)
   b) Click en input de búsqueda (expandirse a ancho completo)
   c) Escribir "Hello" → filtra por título (1 card)
   d) Click en botón "Más" de una card → abre Bottom Sheet con detalle
   ↓
4. En Bottom Sheet:
   - Ve imagen cover + logo + descripción
   - Puede clickear "Ver Proyecto Completo" (sin handler)
   - Click en backdrop o botón X → cierra sheet
```

### Estados del input de búsqueda del portfolio:
```
[Idle circular] --focus--> [Expanded con cursor text]
       ↑                              |
       |-- blur (vacío) --------------|
       |-- blur (con texto) --> mantiene expandido
       |-- input --> actualiza filtered array en tiempo real
```

### Rutas de navegación:
- **Sin JavaScript:** Se ven todas las cards estáticas (graceful degradation)
- **Con JS:** Filtrado instantáneo, transiciones suaves, bottom sheet para detalles
- **Con error de JS:** Las cards siguen visibles, el input no expande, los botones "Más" no hacen nada (no hay fallback)

---

## 🎯 CONCLUSIONES

1. **Performance:** El sistema es **muy rápido** porque:
   - No hay network requests (datos inline)
   - Filtrado en memoria (O(n) sobre 6 items)
   - CSS transitions GPU-acceleradas (`transform`, `opacity`)
   - Skeleton loading solo en búsqueda global (no en portfolio local)

2. **UX:** La transición de **circular → expanded input** es elegante y ahorra espacio. El **bottom sheet** mantiene contexto sin navegar away.

3. **Escalabilidad:** El sistema está **diseñado para 500+ proyectos** (el plan de hidratación GraphQL), pero actualmente hardcodeado a 6. Los filtros funcionan independentemente del tamaño del dataset.

4. **Mobile-first:** El diseño es completamente responsive con dos layouts distintos:
   - Móvil: tabs expandibles + thumb dock inferior + bottom sheet deslizante
   - Desktop: tabs horizontales fijos + side panel derecho

5. **Tech debt menor:**
   - Datos duplicados en dos archivos
   - Subs vacíos (feature incompleta)
   - El botón "Leer historia" no hace nada (dead UI)
   - No hay paginación ni infinite scroll

---

**FIN DEL ANÁLISIS DETALLADO**
