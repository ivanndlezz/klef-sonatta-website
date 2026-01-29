# 🔍 Consultas GraphQL Flexibles para Búsqueda

Vamos a diseñar un sistema de queries **ultra flexible** que se adapte a cualquier combinación de filtros.

---

## 🎯 ESTRATEGIA: Query Dinámica con Variables

En lugar de múltiples queries fijas, usaremos **UNA query flexible** con variables opcionales.

---

## 📝 QUERY MAESTRA FLEXIBLE

```graphql
query FlexibleSearch(
  $searchTerm: String!
  $contentTypes: [ContentTypeEnum]
  $first: Int = 20
  $after: String
  $categoryIn: [ID]
  $dateQuery: DateQueryInput
) {
  # Buscar en PAGES
  pages(first: $first, after: $after, where: { search: $searchTerm }) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      title
      slug
      uri
      excerpt
      date
      contentType {
        node {
          name
        }
      }
    }
  }

  # Buscar en POSTS
  posts(
    first: $first
    after: $after
    where: {
      search: $searchTerm
      categoryIn: $categoryIn
      dateQuery: $dateQuery
    }
  ) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      title
      slug
      uri
      excerpt
      date
      categories {
        nodes {
          name
          slug
        }
      }
      featuredImage {
        node {
          sourceUrl(size: THUMBNAIL)
        }
      }
      contentType {
        node {
          name
        }
      }
    }
  }

  # Buscar en PORTFOLIOS
  portfolios(first: $first, after: $after, where: { search: $searchTerm }) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      title
      slug
      uri
      excerpt
      date
      featuredImage {
        node {
          sourceUrl(size: THUMBNAIL)
        }
      }
      portfolioImages {
        sourceUrl(size: THUMBNAIL)
      }
      contentType {
        node {
          name
        }
      }
    }
  }
}
```

---

## 🎨 EJEMPLOS DE USO CON DIFERENTES FILTROS

### **1. Búsqueda Simple (sin filtros)**

```javascript
{
  "searchTerm": "diseño"
}
```

**Resultado:** Busca "diseño" en Pages, Posts y Portfolios

---

### **2. Búsqueda con límite de resultados**

```javascript
{
  "searchTerm": "diseño",
  "first": 10
}
```

**Resultado:** Máximo 10 resultados por tipo

---

### **3. Búsqueda filtrada por categoría (solo Posts)**

```javascript
{
  "searchTerm": "diseño",
  "categoryIn": ["dGVybTox", "dGVybToy"]  // IDs de categorías
}
```

---

### **4. Búsqueda con rango de fechas**

```javascript
{
  "searchTerm": "diseño",
  "dateQuery": {
    "after": {
      "year": 2024,
      "month": 1,
      "day": 1
    },
    "before": {
      "year": 2024,
      "month": 12,
      "day": 31
    }
  }
}
```

---

## 🛠️ MIDDLEWARE PHP - Constructor Dinámico de Query

```js
/**
 * Configuración de búsqueda
 */
const CONFIG = {
  GRAPHQL_ENDPOINT: "https://klef.newfacecards.com/graphql",
  MIN_SEARCH_LENGTH: 2,
  MAX_RESULTS: 50,
};

/**
 * Función principal de búsqueda (Vanilla JS)
 */
async function performSearch(inputParams) {
  const startTime = performance.now();

  // 1. Preparar y Sanitizar parámetros
  const params = {
    searchTerm: (inputParams.searchTerm || "").trim().replace(/<[^>]*>?/gm, ""),
    contentTypes: inputParams.contentTypes || ["page", "post", "portfolio"],
    first: Math.min(parseInt(inputParams.first) || 20, CONFIG.MAX_RESULTS),
    categoryIn: inputParams.categoryIn || null,
    dateQuery: inputParams.dateQuery || null,
    after: inputParams.after || null,
  };

  // 2. Validaciones básicas
  if (params.searchTerm.length < CONFIG.MIN_SEARCH_LENGTH) {
    return { success: false, error: "Término demasiado corto" };
  }

  // 3. Construir el Query (Template Strings de ES6)
  const query = buildQuery(params);

  try {
    // 4. Petición con Fetch API
    const response = await fetch(CONFIG.GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: query,
        variables: params,
      }),
    });

    const json = await response.json();

    if (json.errors) throw new Error(json.errors[0].message);

    // 5. Procesar resultados (Igual que en tu PHP)
    const results = processNodes(json.data);
    const executionTime = (performance.now() - startTime).toFixed(2);

    return {
      success: true,
      searchTerm: params.searchTerm,
      results,
      meta: {
        executionTime: `${executionTime}ms`,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Auxiliar: Construcción dinámica del string de la Query
 */
function buildQuery(params) {
  const { contentTypes, after } = params;
  const afterParam = after ? `, after: $after` : "";

  let parts = [];

  if (contentTypes.includes("page")) {
    parts.push(`
            pages(first: $first${afterParam}, where: { search: $searchTerm }) {
                nodes { id title slug uri excerpt date contentType { node { name } } }
            }`);
  }

  if (contentTypes.includes("post")) {
    parts.push(`
            posts(first: $first${afterParam}, where: { search: $searchTerm }) {
                nodes { 
                    id title slug uri excerpt date 
                    categories { nodes { name } }
                    featuredImage { node { sourceUrl } }
                }
            }`);
  }

  if (contentTypes.includes("portfolio")) {
    parts.push(`
            portfolios(first: $first${afterParam}, where: { search: $searchTerm }) {
                nodes { 
                    id title slug uri excerpt 
                    portfolioImages { sourceUrl }
                }
            }`);
  }

  return `query($searchTerm: String!, $first: Int, $after: String) { ${parts.join(
    " "
  )} }`;
}

/**
 * Auxiliar: Formatear nodos
 */
function processNodes(data) {
  let total = 0;
  let groups = [];

  Object.keys(data).forEach((key) => {
    const nodes = data[key].nodes || [];
    total += nodes.length;
    nodes.forEach((node) => {
      groups.push({ ...node, originType: key });
    });
  });

  return { total, groups };
}

// --- MODO DE USO PARA TUS PRUEBAS ---
/*
performSearch({ searchTerm: 'test', first: 5 }).then(res => {
    console.log("Resultados para la UI:", res);
});
*/
```

---

## 🧪 EJEMPLOS DE RESPUESTA

### **Búsqueda: "diseño"**

```json
{
  "success": true,
  "searchTerm": "diseño",
  "results": {
    "total": 15,
    "byType": {
      "pages": {
        "count": 3,
        "items": [...]
      },
      "posts": {
        "count": 8,
        "items": [...]
      },
      "portfolios": {
        "count": 4,
        "items": [...]
      }
    },
    "groups": [
      {
        "id": "...",
        "title": "Diseño web moderno",
        "type": "page",
        "typeLabel": "Page",
        "uri": "/diseno-web-moderno"
      },
      ...
    ]
  },
  "meta": {
    "executionTime": "234.5ms"
  }
}
```

---

## 🎯 PRÓXIMO PASO

¿Quieres que te prepare:

1. ✅ **Frontend JavaScript** para consumir este middleware
2. ✅ **Sistema de corrección de typos** (algoritmo Levenshtein)
3. ✅ **Caché de resultados** (Redis o archivo)
4. ✅ **Highlighting de términos** en resultados

**¿Cuál primero?**
