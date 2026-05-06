He trazado un plan detallado para transformar tu cuadrícula estática en un sistema dinámico, modular y de alto rendimiento.

Este plan sigue los principios de **Arquitectura Limpia**, separando completamente el diseño (CSS) de la lógica de datos (`data-attributes`) y utilizando GraphQL para la hidratación.

Puedes encontrar el plan aquí: [plan-hidratacion-portfolio.md](file:///c:/Users/Ivan%20Gonzalez/Sitios/klef-sonatta-website/docs/plan-hidratacion-portfolio.md)

````markdown
# 🚀 Plan: Hidratación Dinámica del Portfolio (GraphQL)

Este plan detalla la transición de un grid estático a un sistema basado en componentes hidratados desde WordPress (WPGraphQL), priorizando el performance y la arquitectura limpia.

## 🏗️ 1. Arquitectura del Sistema

Dividiremos el sistema en tres capas claras:

1.  **Capa de Datos (Data Layer):** Peticiones GraphQL y mapeo de campos de WordPress a nuestro modelo de UI.
2.  **Capa de Estado (State Layer):** Uso intensivo de `data-* attributes` para almacenar IDs, categorías y estados (loading, active), evitando el uso de clases CSS para lógica.
3.  **Capa de Presentación (UI Layer):** Plantillas de componentes (Cards) y Skeleton loaders.

---

## 🛠️ 2. Componentes a Desarrollar

### A. Portfolio Manager (`portfolio-manager.js`)

El cerebro del sistema.

- Se encarga del `fetch` a `klef.newfacecards.com/graphql`.
- Maneja el estado de la aplicación (loading -> success -> error).
- Orquestra la renderización en el contenedor `#cardGrid`.

### B. Skeleton Loader

- Un template HTML/CSS que imita la estructura de la card con gradientes animados.
- Se muestra mientras la promesa de GraphQL está pendiente.

### C. Dynamic Card Template

- Generación de HTML semántico basado en los nodos devueltos por GraphQL.
- **Atributos de Datos:** Cada card tendrá `data-id`, `data-discipline`, `data-slug` para que los componentes externos (como el Search o el Sheet) interactúen sin conocer el HTML interno.

---

## 📡 3. Estrategia de Hidratación (GraphQL)

Utilizaremos una query optimizada que solo traiga lo necesario para la card, evitando el sobrecosto de datos:

```graphql
query GetPortfolioCards {
  posts(first: 10, where: { categoryName: "Portfolio" }) {
    nodes {
      id
      title
      slug
      excerpt
      featuredImage {
        node {
          sourceUrl
        }
      }
      categories {
        nodes {
          name
          slug
        }
      }
      # Campos personalizados (ACF) si existen para el logo
      portfolioFields {
        clientLogo {
          node {
            sourceUrl
          }
        }
      }
    }
  }
}
```
````

---

## ⚡ 4. Optimización de Performance

1.  **Image Optimization:** Uso de `srcset` en las imágenes devueltas por WordPress para cargar solo el tamaño necesario según el dispositivo.
2.  **Fragment Shifting:** Reservar el espacio del grid mediante CSS (aspect-ratio) para evitar el Cumulative Layout Shift (CLS) cuando las cards se hidratan.
3.  **Caching:** Almacenar temporalmente los resultados en `sessionStorage` para evitar peticiones repetidas al navegar entre páginas.

---

## 🎨 5. Separación de Preocupaciones

- **CSS Clases:** Exclusivamente para diseño (`.card`, `.card-dark`, `.grid-layout`).
- **JavaScript / Lógica:** Exclusivamente mediante selectores de atributos (`[data-id]`, `[data-discipline]`).

---

## 📅 Pasos de Implementación

1.  **Fase 1:** Crear el `PortfolioManager` y la función de fetch.
2.  **Fase 2:** Implementar el CSS del Skeleton Loading.
3.  **Fase 3:** Crear la función `renderCard(data)` que genere el HTML dinámico.
4.  **Fase 4:** Conectar los botones "Más" al sistema de `portfolioDetail` que ya corregimos anteriormente.

```

```
