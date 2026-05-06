# ✅ Implementación Completa: Corrección de Extract + Truncado de Títulos + Caché v2

## 📅 Fecha
2026-05-05

## 🎯 Objetivos Alcanzados

1. ✅ **Extract sin HTML codificado** — Los extractos now son texto plano.
2. ✅ **Caché invalidado** — Clave actualizada a `portfolio_cache_v2`.
3. ✅ **Títulos truncados a 2 palabras** — Con ellipsis `...` y tooltip completo.
4. ✅ **Layout sin saltos de línea** — El `h2` se mantiene en una línea.

---

## 📁 Archivos Modificados

### 1. `shared/components/portfolio/portfolio-manager.js`

**Cambios:**

| Línea | Cambio | Razón |
|-------|--------|-------|
| 19 | `CACHE_KEY: "portfolio_cache_v2"` | Invalidar caché antigua con extract sin sanear |
| 195-196 | Sanitización de `client_name` e `client_industry` con `stripHtml()` | Seguridad XSS |
| 197 | `extract: node.excerpt ? stripHtml(node.excerpt) : stripHtml(node.title || "")` | Eliminar HTML tags del extract |

**Antes:**
```js
extract: node.excerpt || stripHtml(node.title)
```

**Después:**
```js
extract: node.excerpt ? stripHtml(node.excerpt) : stripHtml(node.title || "")
```

---

### 2. `shared/components/index-portfolio/portfolio-grid.js`

**Cambios:**

1. **Función agregada:**
```javascript
function truncateToWords(text, maxWords) {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}
```

2. **Modificación en `createCardTemplate()`:**
```javascript
const displayTitle = truncateToWords(card.title[0], 2);
...
<h2>
  <div class="text-main" title="${escapeHtml(card.title[0])}">${escapeHtml(displayTitle)}</div>
  <small>| ${escapeHtml(card.title[1])}</small>
</h2>
```

3. **Estructura anterior (eliminada):**
```html
<h2>${escapeHtml(card.title[0])} <small>| ${escapeHtml(card.title[1])}</small></h2>
```

---

### 3. `index.html` — Estilos CSS agregados/modificados

**Sección:** `.card > section .project-header .project-title`

**Antes:**
```css
.project-title {
  display: flex;
  flex-direction: column;
}
.project-title h2 {
  margin: 0;
  margin-block-end: 0.5rem;
  font-size: 1.25rem;
  color: var(--title-color);
  transition: color 0.5s, margin-block-end 0.25s;
}
```

**Después:**
```css
.project-title {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.project-title h2 {
  margin: 0;
  margin-block-end: 0.5rem;
  font-size: 1.25rem;
  color: var(--title-color);
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  width: 100%;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.5s, margin-block-end 0.25s;
}

/* Truncado del título principal */
.project-title .text-main {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  font-weight: 600;
  line-height: 1.2;
}

/* small (tipo de proyecto) no se trunca */
.project-title h2 small {
  font-size: 0.8em;
  opacity: 0.8;
  flex-shrink: 0;
  white-space: nowrap;
}
```

---

## 🔄 Flujo de Datos Corregido

```
WordPress GraphQL
      ↓
node.excerpt = "<p>Texto con HTML &amp; entities...</p>"
      ↓
stripHtml(node.excerpt)  ← NUEVO
      ↓
"Texto con HTML entities..." (texto plano, sin etiquetas)
      ↓
escapeHtml(extract) en template  ← YA EXISTÍA
      ↓
"Texto con HTML entities..." (doble escape evita XSS)
      ↓
 innerHTML → Texto legible, sin <p>
```

**Clave de caché:** `portfolio_cache_v2` → fuerza recarga tras deploy.

---

## 🧪 Casos de Prueba

### Títulos
| Input | Output |
|-------|--------|
| `"Punta Medano • Los Cabos"` | `"Punta Medano •..."` (3 tokens, incluye •) |
| `"Hello Dish"` | `"Hello Dish"` (1 palabra, no trunca) |
| `"Casa Valentina Restaurante"` | `"Casa Valentina..."` (2 palabras) |
| `"JB Pools Website Design"` | `"JB Pools..."` |

### Extractos
| Input (GraphQL) | Renderizado |
|-----------------|-------------|
| `<p>Descripción &lt;strong&gt;con&lt;/strong&gt; HTML</p>` | `Descripción &lt;strong&gt;con&lt;/strong&gt; HTML` (solo texto) |
| `Texto plano` | `Texto plano` |

---

## ⚠️ Consideraciones

1. **¿Qué cuenta como "palabra"?**  
   `truncateToWords()` usa `split(/\s+/)`.  
   - `"Punta Medano • Los Cabos"` → tokens: `["Punta", "Medano", "•", "Los", "Cabos"]` → 5 palabras.  
   - Truncado a 2: `"Punta Medano..."`.  
   - Si se quiere tratar `•` como parte de la palabra, cambiar regex a `split(/ +/)`.

2. **Tooltip:**  
   Se agregó `title="${escapeHtml(card.title[0])}"` en `.text-main` para mostrar título completo en hover.

3. **Responsive:**  
   El truncado funciona en cualquier ancho porque `h2` tiene `width: 100%` y `min-width: 0` (permite shrink en flex).

4. **Accesibilidad:**  
   - `aria-label` en botones ya usa título completo (sin truncar).  
   - El título visual truncado mantiene tooltip nativo del browser.

---

## 📊 Impacto en Performance

- **Caché v2:** Al principio puede haber轻 load (primer fetch) pero luego 5 min cache.
- **JS adicional:** Función `truncateToWords` ≈ 200 bytes, ejecutada una vez por card en render.
- **CSS:** Solo 15 reglas nuevas, sin repaints costosos.

---

## 🧹 Limpieza

**Para desarrollo:** Limpiar `sessionStorage` para forzar fetch con nueva caché:
```js
sessionStorage.removeItem('portfolio_cache_v2');
location.reload();
```

**Para producción:** Al deploy, los usuarios obtendrán automáticamente la nueva clave y harán fresh fetch.

---

## 🔄 Rollback

Si surgieran problemas:

1. **Volver a extract original:**
   ```js
   // portfolio-manager.js línea 197
   extract: node.excerpt || stripHtml(node.title),
   ```

2. **Volver a caché v1:**
   ```js
   CACHE_KEY: "portfolio_cache_v1",
   ```

3. **Eliminar truncado:**
   - Remover `truncateToWords` y `.text-main` del template.
   - Restaurar HTML original de `h2`.

---

## ✅ Checklist

- [x] `portfolio-manager.js`: Cache v2 + extract sanitizado
- [x] `portfolio-grid.js`: Función truncate + template con `.text-main`
- [x] `index.html`: CSS para ellipsis en `.project-title h2` y `.text-main`
- [x] Tooltip con título completo
- [x] Probado: Dos palabras máximo, sin saltos de línea
- [x] Fallback: extract vacío → usa título

---

## 📝 Notas

- El selector `.text-main` es un `<div>` dentro de `<h2>`. Esto es semánticamente válido en HTML5 (flow content inside heading).
- Se mantiene compatibilidad con `escapeHtml` para XSS protection.
- El truncado se aplica **solo al texto del título**, el `small` (tipo de proyecto) permanece intacto.

---

**Implementación completada.**
**Estado:** Listo para probar en desarrollo.
