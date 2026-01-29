# Proyecto: Rediseño de Homepage Klef v3

Este documento define la arquitectura, diseño y estrategia para la nueva Homepage de Klef. Se basa en la premisa de que **el sitio es una herramienta, no solo un folleto**, diseñada específicamente para el mercado mexicano que busca inmediatez y descubrimiento.

---

## 1. Visión y Estrategia

*   **Objetivo**: Transformar el Home en una superficie de "Descubrimiento Dinámico".
*   **Filosofía**: "Menos lectura, más exploración". El usuario no quiere leer párrafos largos; quiere ver qué hacemos, cómo lo hacemos y encontrar lo que busca rápido.
*   **Adaptación al Mercado**: Entendemos que el cliente local a veces desconoce terminología compleja (MVP, Design Thinking), por lo que la interfaz debe educar visualmente y guiar mediante conceptos tangibles ("Crece con...", "Encuentra tu solución").

---

## 2. Arquitectura de Secciones

### A. Header & Mega Menu (The Control Center)
El centro de mando del sitio.
*   **Diseño**:
    *   **Logo**: Izquierda.
    *   **Categorías**: Centro (Diseño y Media | Tecnología | Marketing).
    *   **Buscador Global**: Derecha (Icono Lupa + `Cmd+K`).
*   **Comportamiento**:
    *   Al hacer hover en categorías, despliega el "Mega Panel" con servicios específicos y accesos directos.
    *   El buscador es persistente y omnipresente.

### B. Hero Section: Asimetría de Conversión
Diseño dividido 50/50 para equilibrar la promesa verbal con la prueba visual.

*   **Columna Izquierda (Mensaje y Acción)**:
    *   **Hook Animado**: "Crece con..." seguido de texto cambiante (una web / un logo nuevo / estrategia / marketing).
    *   **Subtítulo**: "Descubre servicios creativos y digitales integrales en un solo click."
    *   **Herramienta de Búsqueda**: No un botón, sino un input real visible. "¿Qué estás buscando hoy?" con *Quick Tags* debajo (Desarrollo, Diseño, Marketing) para búsqueda rápida sin teclear.
*   **Columna Derecha (Prueba Visual)**:
    *   **Masonry Grid**: Collage de proyectos destacados.
    *   **Movimiento**: Desplazamiento vertical suave (parallax o scroll-linked) para dar profundidad.

### C. Social Proof (Carrusel de Confianza)
*   **Contenido**: Logos de clientes (monocromáticos para elegancia, color al hover).
*   **Técnica**: Loop infinito CSS puro (rendimiento máximo).
*   **Objetivo**: Validar inmediatamente la promesa del Hero.

### D. Value Proposition (El Manifiesto)
Bloque de texto tipográfico con alto contraste.
*   **Copy Final**: *"Laboratorio de Negocios: donde estrategia, identidad y tecnología convierten marcas en negocios funcionales y escalables."*
*   **Apoyo**: "Utilizamos Design Thinking y consultoría de negocios como motor estratégico."

### E. Nuestro Proceso (The How)
Explicación visual de cómo trabajamos.
*   **Formato**: Diagrama de pasos horizontal o vertical (dependiendo del dispositivo).
*   **Enfoque**: Simplificar la complejidad metodológica en 3-4 pasos claros (ej. Diagnóstico -> Estrategia -> Ejecución -> Escalamiento).

### F. Portfolio Explorer (La Herramienta)
No una galería estática, sino una aplicación de filtrado.
*   **UI**:
    *   Barra de Tabs/Filtros (Identidad, Web, Contenido).
    *   Vista Previa Rápida (Quickview) al hacer hover o clic sin salir del home.
    *   Datos visibles: Imagen destacada, Categoría, Título breve.
*   **CTA**: Botón claro "Ver todos los proyectos".

### G. Team (Human Side)
Mostrar a los especialistas detrás del laboratorio.
*   **Estructura**:
    *   Ivan (Líder Fundador)
    *   Abel (Co-fundador / Tech)
    *   Daniela (Co-fundadora / Creativa)
    *   David (Creativo)

### H. Servicios (Infinite Loop)
Un recordatorio visual de la amplitud de la oferta.
*   **Diseño**: "Ticker" o marquesina infinita con etiquetas en varias filas y direcciones opuestas.
*   **Tags**: #Marketing #Redes #Diseño #Videos #Programación #Webs #Wordpress #UI/UX #SEO #Webdev.
*   **Interacción**: Al pasar el mouse, la fila se pausa o ralentiza.

### I. Footer
Cierre funcional.
*   **Grid**: Enlaces a Producto, Compañía, Recursos.
*   **Newsletter**: Input de suscripción.
*   **Legal**: Copyright y enlaces sociales.

---

## 3. Requerimientos Técnicos

*   **Sin Frameworks JS**: Todo implementado con Vanilla JS (ES6+).
*   **CSS Variable-Driven**: Uso intensivo de Custom Properties (`--bg`, `--color`, `--gap`) para mantener coherencia y facilitar el modo oscuro.
*   **Performance**:
    *   Carga diferida (lazy loading) para el Masonry del Hero.
    *   CSS Animations para los loops (GPU accelerated).
*   **SEO**: Estructura semántica HTML5 (`<header>`, `<main>`, `<section>`, `<footer>`).
