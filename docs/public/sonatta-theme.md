# Sonatta, by Klef Agency

## Introducción

**Sonatta** es un modelo de desarrollo de sitios web por Klef Agency, inspirado en la filosofía de "Web Nativa" y el sistema de diseño variable de klef-site-v3. Representa la evolución de un sitio estático headless a un tema CMS dinámico, manteniendo los principios de soberanía tecnológica, rendimiento nativo y diseño escalable.

## Filosofía y Concepto

Sonatta nace de la premisa de que un sitio web no debe depender de frameworks pesados ni de ecosistemas cerrados. En su lugar, ofrece una experiencia "nativa" dentro de WordPress, utilizando:

- **Tecnología Soberana**: Código puro sin dependencias externas innecesarias.
- **Diseño Variable**: Un motor de variables CSS que permite personalización profunda sin sacrificar rendimiento.
- **Arquitectura Headless-Friendly**: Integración nativa con APIs REST y GraphQL de WordPress.

El nombre "Sonatta" evoca una composición musical: una estructura armoniosa donde cada componente (estrategia, identidad, tecnología) toca en sincronía, creando una experiencia coherente y escalable.

## Características Principales

### 1. Sistema de Diseño Variable

- **Motor CSS Dinámico**: Utiliza variables CSS personalizadas (`--d:`, `--pos:`, etc.) para controlar layout, tipografía y colores en tiempo real.
- **Personalización Visual**: Panel de opciones en el Customizer de WordPress para ajustar variables sin tocar código.
- **Compatibilidad Responsiva**: Diseño fluido que se adapta a dispositivos mediante media queries inteligentes.

### 2. Componentes Interactivos

- **Mega Menú Dinámico**: Navegación jerárquica con soporte para menús anidados y estados hover/touch.
- **Sistema de Búsqueda Global**: Búsqueda en tiempo real a través de posts, páginas y custom post types, con resultados visuales.
- **Carrusel de Logos**: Animación CSS pura para mostrar clientes o partners sin JavaScript pesado.
- **Galería de Portafolio**: Vista masonry con lazy loading y filtros dinámicos.

### 3. Integración WordPress Nativa

- **Custom Post Types**: Soporte para portafolio, servicios y testimonios.
- **Campos Personalizados**: Integración con Advanced Custom Fields (ACF) para contenido estructurado.
- **SEO Optimizado**: Meta tags dinámicos, schema markup y preload de recursos críticos.
- **Multidioma**: Preparado para WPML o Polylang.

### 4. Rendimiento y Optimización

- **Carga Asíncrona**: Scripts y estilos cargados de forma diferida para LCP óptimo.
- **Imágenes Adaptativas**: Soporte para WebP, AVIF y lazy loading automático.
- **Cache Inteligente**: Integración con plugins como WP Rocket o W3 Total Cache.
- **Puntuación Lighthouse**: Diseñado para alcanzar 95+ en performance, accessibility y SEO.

## Arquitectura Técnica

### Estructura de Archivos

```
sonatta/
├── style.css (Hoja de estilos principal con variables)
├── functions.php (Funciones del tema y enqueue)
├── index.php (Plantilla base)
├── header.php (Encabezado con mega menú)
├── footer.php (Pie con enlaces dinámicos)
├── page.php (Páginas estándar)
├── single.php (Posts individuales)
├── assets/
│   ├── css/
│   │   ├── design-system.css (Sistema variable)
│   │   └── components.css (Estilos modulares)
│   ├── js/
│   │   ├── navigation.js (Mega menú)
│   │   ├── search.js (Búsqueda)
│   │   └── app.js (Inicialización)
│   └── fonts/ (Fuentes locales Inter y Monaspace)
└── templates/ (Plantillas personalizadas)
```

### Tecnologías Utilizadas

- **PHP 7.4+**: Para lógica del tema y hooks de WordPress.
- **CSS3 con Variables**: Sin preprocesadores como Sass para mantener simplicidad.
- **Vanilla JavaScript (ES6)**: Interacciones sin jQuery o frameworks.
- **GraphQL (Opcional)**: Para integraciones headless avanzadas.

## Beneficios para Usuarios

### Para Agencias y Freelancers

- **Rapidez de Desarrollo**: Componentes preconstruidos reducen tiempo de proyecto en 60%.
- **Consistencia de Marca**: Sistema variable asegura coherencia visual.
- **Escalabilidad**: Fácil de extender con nuevos componentes.

### Para Empresas

- **Rendimiento Superior**: Sitios más rápidos que temas tradicionales.
- **Mantenimiento Bajo**: Código limpio y documentado.
- **Personalización Avanzada**: Opciones profundas sin necesidad de desarrollo custom.

## Instalación y Configuración

1. **Descarga**: Obtén el archivo ZIP desde el repositorio de Klef Agency.
2. **Instalación**: Sube a WordPress vía Apariencia > Temas > Añadir Nuevo.
3. **Activación**: Activa Sonatta y configura opciones en Customizer.
4. **Plugins Recomendados**:
   - Advanced Custom Fields
   - WPGraphQL
   - Smush (optimización de imágenes)

## Soporte y Comunidad

- **Documentación Completa**: Guía detallada en [docs.klef.agency/sonatta](https://docs.klef.agency/sonatta).
- **Soporte Premium**: Acceso a actualizaciones y soporte técnico.
- **Comunidad**: Foro en Discord para usuarios de Sonatta.

## Conclusión

Sonatta no es solo un tema de WordPress; es una manifestación de la visión de Klef Agency para una web más nativa, eficiente y soberana. Combina la potencia de un CMS con la pureza del desarrollo web moderno, ofreciendo una alternativa viable a temas inflados y dependientes.

Para más información, visita [klef.agency/sonatta](https://klef.agency/sonatta) o contacta a nuestro equipo.
