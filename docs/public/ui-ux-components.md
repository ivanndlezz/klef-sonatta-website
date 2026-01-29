# Componentes Clave de UI/UX: Mega Menu, Búsqueda y Dynamic Island

Este documento detalla los tres pilares de navegación y experiencia de usuario (UX) de Klef Site v3. Estos componentes trabajan en conjunto para ofrecer una navegación fluida, contextual y persistente.

---

## 1. Mega Menu: Navegación Profunda y Contextual

El **Mega Menu** es el sistema principal de navegación jerárquica. No es solo una lista de enlaces, sino una superficie de exploración de contenido.

### Diseño de Interfaz (UI)
- **Desktop**: Se despliega horizontalmente al hacer hover sobre los ítems principales. Muestra un layout de dos columnas:
  - **Sidebar Lateral**: Enlaces rápidos a categorías o subsecciones.
  - **Área Principal (Featured)**: Destaca contenido visual (imágenes, tarjetas) relevante a la sección.
- **Mobile**: Se transforma en un sistema "drill-down" (profundidad). Al tocar una categoría, la vista se desliza horizontalmente mostrando el submenú, con una barra superior dedicada (`mega-topbar`) y botón de regreso (`back-btn`).

### Experiencia de Usuario (UX)
- **Interacción Variable**: En desktop funciona por intención de hover (rápido), mientras que en móvil es por toque explícito (preciso).
- **Transiciones Físicas**: Las animaciones de entrada y salida utilizan curvas `cubic-bezier` personalizadas para sentir "peso" y "fricción", evitando movimientos lineales artificiales.
- **Micro-interacciones**:
  - **Cierre Inteligente**: En desktop, se detecta la salida del mouse de áreas seguras para cerrar el menú inmediatamente, evitando bloqueos visuales accidentales.
  - **Focus Trap**: En móvil, al abrir el menú, el scroll del `body` se bloquea para evitar pérdida de contexto.

### Implementación Técnica (`navigation-system.js`)
- **Estilos Dinámicos (Runtime CSS)**: Para mejorar el rendimiento en desktop, se inyectan estilos CSS `on-hover` específicos para la sección activa, en lugar de cargar todos los estilos o usar cálculos JS pesados en cada frame.
- **Manejo de Estado**: Gestiona transiciones entre viewports (si cambias de móvil a desktop con el menú abierto, este se resetea inteligentemente).

---

## 2. Sistema de Búsqueda: Persistencia y Acceso Global

El buscador no es una página destino, sino una capa de utilidad accesible desde cualquier parte del sitio (`Cmd+K` / `Ctrl+K`).

### Características Clave
- **Global Overlay**: Un modal de pantalla completa con fondo `backdrop-filter: blur`, manteniendo al usuario visualmente conectado con la página donde estaba.
- **Persistencia**:
  - **Búsquedas Recientes**: Almacena el historial en `localStorage`, permitiendo retomar flujos de navegación previos instantáneamente.
  - **Resultados Rápidos**: Ofrece sugerencias antes de escribir, basadas en contenido popular o reciente.

### Arquitectura de Datos (`search-system.js`)
- **GraphQL Native**: Realiza consultas directas al endpoint `/graphql` de WordPress.
- **Consultas Multi-Entidad**: En una sola petición busca a través de `Pages`, `Posts` y `Portfolios`, devolviendo un dataset unificado y tipificado.
- **Debouncing**: Optimiza el tráfico de red esperando 300ms de inactividad de tipeo antes de lanzar la consulta.

### UX Búsqueda
1. **Intención**: El usuario presiona el icono o `Cmd+K`.
2. **Contexto**: El fondo se desenfoca, el input toma foco inmediato.
3. **Feedback**: Spinner de carga sutil durante la consulta.
4. **Resultados**: Grid visual de tarjetas (no solo lista de texto), permitiendo escanear imágenes destacadas y tipos de contenido (iconos y badges de color).

---

## 3. Dynamic Island: El Centro de Control Persistente

Inspirado en interfaces móviles modernas, el **Dynamic Island** actúa como un hub de notificaciones y acciones contextuales que "flota" sobre la interfaz.

### Consistencia y Navegación
La "Isla" es el elemento unificador de la experiencia. A diferencia de barras de navegación estáticas, la isla cambia de forma y contenido según el contexto, pero **siempre está ahí** (o aparece cuando se necesita).

### Estados de la UI (`dynamic-island.css`)
La isla es un organismo vivo que muta entre varios estados mediante clases CSS:

1.  **Cápsula (Pill)**: Estado de reposo. Muestra información mínima o acciones primarias.
2.  **Expandida (Expanded)**: Crece para mostrar más detalles o controles adicionales al interactuar.
3.  **Full Width / Toast**: Se utiliza para notificaciones del sistema (ej. cookies, confirmaciones) que requieren atención completa en la zona inferior.
4.  **Fullscreen**: En casos extremos (ej. menús complejos en situaciones específicas), puede expandirse a ocupar la pantalla.

### Detalles de UX ("Apple-like Feel")
- **Física de Animación**: Usa `cubic-bezier(0.25, 0.1, 0, 1.02)` para un efecto de rebote elástico al cambiar de tamaño.
- **Haptic Feedback Visual**: Clase `.haptic` que escala la isla al 95% y regresa, simulando una pulsación física al recibir clicks o toques.
- **Efecto Glassmorphism**: Fondo semitransparente con `backdrop-filter: blur(40px)` y saturación aumentada, asegurando legibilidad sobre cualquier fondo mientras se siente integrada al entorno.
- **Modo Oscuro**: Soporte nativo `prefers-color-scheme: dark`, ajustando bordes y transparencias para mantener profundidad visual en fondos oscuros.

### Integración en Navegación
- **Coexistencia**: Cuando se abre el Menú Móvil, la Isla sabe ocultarse (`hideDynamicIsland()`) para no competir por atención o espacio en pantalla pequeña.
- **Acciones Rápidas**: Sirve como contenedor para "Toasts" de acción (ej. "Enlace copiado"), manteniendo la retroalimentación cerca del pulgar del usuario en móviles.

---

### Conclusión de Integración

La tríada **Mega Menu - Búsqueda - Dynamic Island** crea una experiencia cohesiva:
1.  **Mega Menu**: Para **explorar** (Top-down).
2.  **Búsqueda**: Para **encontrar** (Acceso directo).
3.  **Dynamic Island**: Para **estar informado y actuar** (Contexto y Feedback).

Juntos, eliminan la fricción de navegación habitual en sitios web, acercando la experiencia a la de una **aplicación nativa**.
