# Sitio Web Klef Sonatta

## Descripción General

Este es el sitio web oficial de Klef Agency, construido utilizando el tema Sonatta - un tema moderno de nativo de Klef inspirado en la filosofía de "Web Soberana" y el sistema de diseño klef-site-v3. El sitio muestra los servicios de Klef Agency en branding, estrategia, estudio (diseño) y desarrollo, presentando un portafolio dinámico, menú mega interactivo y rendimiento optimizado.

## Características

### Funcionalidad Principal

- **Menú SPA Estático**: Aplicación de página única con navegación suave y menús mega
- **Sección Hero**: Diseño masonry dinámico mostrando proyectos del portafolio
- **Galería de Portafolio**: Tarjetas interactivas con detalles de proyectos y filtrado
- **Sección de Servicios**: Ticker de desplazamiento mostrando servicios de la agencia
- **Funcionalidad de Búsqueda**: Búsqueda global con resultados en tiempo real y sugerencias
- **Diseño Responsivo**: Enfoque mobile-first con layouts adaptativos

### Características Técnicas

- **Sistema de Diseño CSS Variable**: Propiedades personalizadas para estilos consistentes y fácil personalización
- **Optimizado para Rendimiento**: Carga diferida de imágenes, CSS eficiente y JavaScript mínimo
- **Accesibilidad**: HTML semántico, navegación por teclado y soporte para lectores de pantalla
- **Formatos de Imagen Modernos**: Soporte para WebP, AVIF y mejora progresiva

## Pila Tecnológica

- **Frontend**: HTML5, CSS3 (con Variables CSS), JavaScript Vanilla (ES6+)
- **Fuentes**: Fuentes variables Inter y Google Sans
- **Íconos**: Símbolos SVG personalizados y Font Awesome
- **Construcción**: Sitio estático sin proceso de construcción requerido
- **Hosting**: Compatible con plataformas de hosting estático

## Estructura del Proyecto

```
klef-sonatta-website/
├── index.html              # Archivo principal del sitio web
├── assets/
│   ├── fonts/             # Archivos de fuentes locales
│   ├── images/            # Imágenes optimizadas y favicons
│   ├── scripts/           # Módulos JavaScript
│   └── styles/            # Archivos CSS y sistema de diseño
├── docs/                  # Documentación y planificación
│   ├── sonatta-theme.md   # Especificación del tema
│   ├── about-this-site/   # Documentación del proyecto
│   └── plans/             # Planes de desarrollo
└── shared/                # Componentes reutilizables
    └── components/        # Componentes UI modulares
```

## Configuración e Instalación

1. **Clona el repositorio**:

   ```bash
   git clone https://github.com/klefagency/klef-sonatta-website.git
   cd klef-sonatta-website
   ```

2. **Abre en navegador**:
   - Simplemente abre `index.html` en cualquier navegador web moderno
   - No se requiere servidor para visualización básica

3. **Desarrollo**:
   - Usa un servidor local para mejor experiencia de desarrollo
   - Recomendado: `python -m http.server 8000` o similar

## Uso

### Navegación

- Usa el menú mega para acceso rápido a diferentes secciones
- Funcionalidad de búsqueda disponible en la navegación superior
- Menú hamburguesa amigable para móviles en pantallas pequeñas

### Interacción con Portafolio

- Haz clic en las tarjetas del portafolio para ver detalles del proyecto
- Usa la barra de búsqueda para filtrar proyectos
- La cuadrícula responsiva se adapta al tamaño de pantalla

### Personalización

- Modifica las variables CSS en `assets/styles/design-system.css` para temas
- Actualiza el contenido en `index.html` para cambios específicos del sitio
- Agrega nuevas imágenes a `assets/images/` siguiendo la convención de nomenclatura

## Soporte de Navegadores

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Rendimiento

- **Puntuación Lighthouse**: 95+ en rendimiento, accesibilidad y SEO
- **Core Web Vitals**: Optimizado para carga rápida e interacciones suaves
- **Optimización de Imágenes**: Múltiples formatos con carga diferida

## Contribución

1. Haz fork del repositorio
2. Crea una rama de característica: `git checkout -b nombre-caracteristica`
3. Haz tus cambios y prueba exhaustivamente
4. Confirma con mensajes descriptivos
5. Envía push a tu fork y crea un pull request

## Licencia

Este proyecto es propiedad de Klef Agency. Todos los derechos reservados.

## Contacto

- **Sitio Web**: [klef.agency](https://klef.agency)
- **Email**: hello@klef.agency
- **Ubicación**: Cabo San Lucas, México

## Agradecimientos

Construido con el tema Sonatta, representando el compromiso de Klef Agency con tecnologías web nativas, rendimiento y experiencia de usuario.
