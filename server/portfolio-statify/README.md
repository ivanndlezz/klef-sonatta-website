# Klef Portfolio Statify

Statify compila el portafolio desde WPGraphQL usando PHP y deja el HTML, los snapshots JSON y el sitemap listos para GitHub Pages.

## Flujo

1. WordPress guarda un post de la categoría `Portfolio`.
2. El plugin `server/wordpress/klef-portfolio-statify.php` activa `repository_dispatch`.
3. GitHub Actions ejecuta `build.php` y `validate-static.php`.
4. El resultado se publica sólo si cada ficha contiene contenido HTML estático y no contiene placeholders.

Mientras una ficha esté pendiente de contenido editorial, puede excluirse temporalmente del build con `PORTFOLIO_STATIFY_EXCLUDED_SLUGS` (lista separada por comas). La ficha de LOME queda fuera de esta primera activación y se reincorpora al terminar su contenido.

## Configuración en WordPress

Agregar en `wp-config.php`, fuera del repositorio:

```php
define('KLEF_STATIFY_GITHUB_REPOSITORY', 'ivanndlezz/klef-sonatta-website');
define('KLEF_STATIFY_GITHUB_TOKEN', 'TOKEN_DE_GITHUB');
```

El token debe ser restringido al repositorio elegido y tener únicamente `Contents: Read and write`, que es el permiso requerido por la API de `repository_dispatch`. No se envía el contenido del post; sólo el ID y slug para identificar el evento.

## Ejecución local o manual

```bash
php server/portfolio-statify/build.php
php server/portfolio-statify/validate-static.php
```

Si WordPress contiene `Lorem ipsum` u otro contenido provisional detectado, la validación detiene el deploy.
