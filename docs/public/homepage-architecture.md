# Arquitectura de Diseño de la Homepage (`index.html`)

Este documento analiza la estructura técnica y de diseño de la página de inicio, desglosando sus secciones críticas.

## 1. Mega Menú (Navegación)
*Para detalles profundos de interacción, ver: `ui-ux-components.md`*

El encabezado actúa como el "sistema nervioso" del sitio. No es estático; responde al contexto del dispositivo:
- **Desktop**: Detecta la intención del mouse (hover) para desplegar paneles ricos en contenido sin clics.
- **Mobile**: Se transforma en una aplicación de pantalla completa con navegación jerárquica (drill-down).

## 2. Sección Hero: Asimetría Funcional

El Hero introduce la propuesta de valor mediante una división de pantalla 50/50 (`.half-left` y `.half-right`), diseñada para equilibrar **mensaje** y **prueba visual**.

### A. Panel Izquierdo (`.half-left`)
Es el área de "Mensaje y Conversión".
- **Tipografía Dinámica**: El título utiliza un efecto de rotación de texto (`.word .letter`) para comunicar múltiples valores en el mismo espacio.
    - *Técnica*: Transformaciones CSS 3D (`rotateX`) secuenciadas para animar letras individualmente.
- **Búsqueda Integrada**: No espera a que el usuario navegue; ofrece una caja de búsqueda (`.search-container`) directamente en el hero, permitiendo saltar a la necesidad específica de inmediato.

### B. Panel Derecho (`.half-right`)
Es el área de "Prueba Visual".
- **Masonry Grid**: En lugar de una sola "imagen hero" estática, utiliza una grilla tipo masonry (`.masonry-block`) que muestra un collage de trabajos.
- **Efecto de Profundidad**: Las columnas tienen desplazamientos (`transform: translateY`) para crear un ritmo visual orgánico y no monótono.
- **Micro-interacciones**: Cada imagen responde al hover (`scale(1.05)`), invitando a la exploración.

---

## 3. Sección de Prueba Social: Carrusel de Clientes

Inmediatamente después del Hero, se valida la autoridad de la marca.

### Implementación (`.brandsCarousel`)
- **Loop Infinito**: Utiliza una animación CSS pura (`@keyframes infiniteLoop`) que mueve una pista larga de logos (`.carouselTrack`).
- **Sin JavaScript**: A diferencia de sliders tradicionales pesados, este carrusel corre sobre el compositor de la GPU (usando `translate3d`), garantizando 60fps sin bloquear el hilo principal del navegador.
- **Diseño**: Un contenedor con `overflow: hidden` y sombras laterales crea el efecto de desvanecimiento en los bordes.

---

## 4. Sección de Proceso (`.k-process`)

Explica "Cómo trabajamos" mediante un sistema visual de pasos progresivos variables.

### Sistema de Diseño "Klef Variable-Driven"
Esta sección es un ejemplo perfecto del uso de variables CSS para maquetación:
```css
:root {
    --k-step-w: 21rem;  /* Ancho de cada paso */
    --k-num-size: 4rem; /* Tamaño del indicador numérico */
}
```

### Arquitectura de Pasos (`.k-steps`)
- **Conexión Visual**: Los pasos no son islas aisladas; están conectados por líneas (`.k-step-line`) que guían el ojo de izquierda a derecha.
- **Semántica Visual**:
    - **Cabecera**: Número grande y claro para establecer orden.
    - **Cuerpo**: Título y descripción explicativa.
- **Responsive**: El sistema de variables permite reajustar los tamaños (`--k-step-w`) en media queries sin reescribir toda la estructura CSS.

---

## Resumen de UX

La página de inicio sigue un patrón narrativo clásico pero ejecutado con tecnología moderna:
1.  **Atracción (Hero)**: Captura interés con movimiento y promesa de valor.
2.  **Facilitación (Search)**: Ofrece atajos inmediatos.
3.  **Validación (Logos)**: Demuestra confianza.
4.  **Explicación (Process)**: Elimina dudas sobre el "cómo".

Todo esto sin cargar frameworks pesados, manteniendo el peso total de la página extremadamente bajo.
