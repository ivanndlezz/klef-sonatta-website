# Blog Statify

Blog Statify convierte los posts publicados en WordPress que tienen la categoría `Blog` en un índice y páginas HTML estáticas dentro de `/blog/`.

## Flujo

1. Se publica o actualiza un post con categoría `Blog` en WordPress.
2. El plugin `klef-portfolio-statify` solicita un `repository_dispatch` a GitHub.
3. GitHub Actions ejecuta `server/blog-statify/build.php` después de construir y validar el portafolio.
4. El generador consulta el índice de Blog por GraphQL y usa el REST nativo como puente si el listado público de WPGraphQL no expone esa categoría; después consulta cada artículo por GraphQL y escribe `data/blog/index.json`.
5. Cada artículo se publica en `blog/{slug}/index.html` con title, description, canonical, Open Graph y JSON-LD `Article`.
6. El índice HTML y `sitemap.xml` se actualizan automáticamente.

## Publicación editorial

La categoría `Blog` es el contrato editorial. Las categorías adicionales se convierten en filtros del índice; las etiquetas se usan para búsqueda. Si no hay posts todavía, `/blog/` conserva una página estática válida y el build no falla.

## Validación

```bash
php server/blog-statify/build.php
php server/blog-statify/validate-static.php
```

El validador comprueba el índice, el sitemap, los metadatos, el JSON-LD, las páginas individuales y la ausencia de `Lorem ipsum`.
