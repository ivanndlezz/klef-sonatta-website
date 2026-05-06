# Resolución del Sistema de Portfolio

## Problema Original

El sistema de portfolio tenía una **condición de carrera (race condition)** que causaba que las tarjetas de portfolio no se cargaran correctamente en algunos casos, resultando en esqueletos infinitos y promesas colgadas.

### Detalles de la Condición de Carrera

1. **`portfolio-manager.js`** se auto-inicializaba al cargar la página si existía `#cardGrid`, despachando el evento `portfolioReady` al completar.

2. **`portfolio-grid.js`** registraba su listener para `portfolioReady` **dentro** de `loadPortfolioData()`, que solo se ejecutaba después de `renderSkeletonCards()`.

3. Si `PortfolioManager` completaba sincrónicamente desde cache (timing de microtareas), el evento podía dispararse **antes** del registro del listener → promesa colgada.

4. El flag `getState().cached` dependía de la variable `portfolioCache`, que era `null` en hits de cache.

### Problema Adicional del CTA

El botón "Ver Proyecto Completo" en el bottom sheet no navegaba al proyecto porque:
- El botón era estático en `index.html`.
- La configuración dinámica no actualizaba el botón con los atributos de datos necesarios.
- El listener de eventos no estaba correctamente configurado.

## Solución Implementada

### 1. Eliminación de Auto-Inicialización

**Archivo:** `shared/components/portfolio/portfolio-manager.js`

- Removida la auto-inicialización condicional que causaba la carrera.
- Ahora `portfolio-manager.js` solo proporciona la API, sin inicialización automática.

```javascript
// Código removido:
// if (document.readyState === "loading") {
//   document.addEventListener("DOMContentLoaded", () => {
//     if (document.getElementById("cardGrid")) {
//       PortfolioManager.init()...
//     }
//   });
// }
```

### 2. Control Explícito de Inicialización

**Archivo:** `shared/components/index-portfolio/portfolio-grid.js`

- Modificada `loadPortfolioData()` para llamar `PortfolioManager.init()` directamente cuando no hay cache.
- Esto elimina la dependencia de eventos y asegura timing controlado.

```javascript
function loadPortfolioData() {
  // ... renderSkeletonCards()
  
  const state = window.PortfolioManager.getState();
  if (state.cached) {
    // Usar cache inmediatamente
    return window.PortfolioManager.getAll().then(items => {
      allPortfolioItems = items;
    });
  } else {
    // Inicializar explícitamente
    return window.PortfolioManager.init().then(data => {
      allPortfolioItems = data;
    });
  }
}
```

### 3. Fix del Cache Hit

**Archivo:** `shared/components/portfolio/portfolio-manager.js`

- Agregada asignación `portfolioCache = parsed.data;` en la rama de cache hit.
- Esto asegura que `getState().cached` retorne `true` inmediatamente.

```javascript
if (Date.now() - timestamp < CONFIG.CACHE_TTL) {
  console.log("[PortfolioManager] Cache hit");
  portfolioCache = parsed.data;  // ← Fix agregado
  return parsed.data;
}
```

### 4. Funcionalidad del Botón CTA

**Archivo:** `index.html`

- `loadPortfolioDetail()` ahora almacena el item actual en `window.currentPortfolioItem`.
- Agregado listener de click para el botón estático que navega usando el slug almacenado.

```javascript
// En loadPortfolioDetail:
window.currentPortfolioItem = portfolioItem;

// Listener global:
document.addEventListener("click", (e) => {
  if (e.target.matches(".sheet-bottom-controls .btn-primary[data-action='open-project']")) {
    if (window.currentPortfolioItem && window.currentPortfolioItem.slug) {
      window.location.href = `/portfolio/${window.currentPortfolioItem.slug}`;
    }
  }
});
```

## Cómo Funciona Ahora

### Carga Inicial (Sin Cache)
1. Usuario carga la página.
2. `portfolio-grid.js` detecta elementos requeridos.
3. `loadPortfolioData()` ve que no hay cache.
4. Llama `PortfolioManager.init()` → fetch desde GraphQL → cachea → retorna datos.
5. Renderiza tarjetas inmediatamente.

### Recarga (Con Cache)
1. Usuario recarga la página.
2. `loadPortfolioData()` ve que hay cache (gracias al fix).
3. Llama `PortfolioManager.getAll()` → retorna cache inmediatamente.
4. Renderiza tarjetas instantáneamente, sin skeleton visible.

### Interacción con Tarjetas
1. Usuario hace click en tarjeta de portfolio.
2. `loadPortfolioDetail(portfolioId)` obtiene el item via `PortfolioManager.getById()`.
3. Carga el bottom sheet con detalles del proyecto.
4. Almacena `window.currentPortfolioItem` para el CTA.
5. Usuario hace click en "Ver Proyecto Completo" → navega a `/portfolio/{slug}`.

## Beneficios

- ✅ **Sin condiciones de carrera:** `portfolio-grid.js` controla completamente la inicialización.
- ✅ **Carga instantánea desde cache:** Fix del flag `cached` permite render inmediato.
- ✅ **CTA funcional:** Botón navega correctamente al proyecto individual.
- ✅ **Consistencia:** Comportamiento predecible en todas las cargas.
- ✅ **Sin side effects:** Remoción de auto-init no afecta otras partes del sistema.

## Testing

Para verificar:
1. **Primera carga:** Network request → tarjetas renderizan.
2. **Recarga:** Sin network request → tarjetas renderizan instantáneamente.
3. **Click en tarjeta:** Bottom sheet carga → click CTA → navega a `/portfolio/{slug}`.
4. **Consola:** Sin errores de promesas colgadas o "No project URL available".

La implementación es robusta y elimina los problemas de timing que causaban la inestabilidad del portfolio.</content>
<parameter name="filePath">C:\Users\Ivan Gonzalez\Sitios\klef-sonatta-website\docs\portfolio-resolution.md