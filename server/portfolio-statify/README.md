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
```

El token se administra desde `Ajustes → Klef Statify` dentro de WordPress. El formulario valida el token contra GitHub, lo cifra usando las claves privadas de WordPress y permite guardar un token actual y otro siguiente con sus fechas de expiración. El token siguiente se activa automáticamente cuando el actual expira.

El token debe ser restringido al repositorio elegido y tener únicamente `Contents: Read and write`, que es el permiso requerido por la API de `repository_dispatch`. No se envía el contenido del post; sólo el ID y slug para identificar el evento.

Como alternativa temporal, `KLEF_STATIFY_GITHUB_TOKEN` todavía se puede definir en `wp-config.php` para arrancar el sistema, pero conviene migrarlo al formulario junto con su fecha de expiración.

## Ejecución local o manual

```bash
php server/portfolio-statify/build.php
php server/portfolio-statify/validate-static.php
```

Si WordPress contiene `Lorem ipsum` u otro contenido provisional detectado, la validación detiene el deploy.
