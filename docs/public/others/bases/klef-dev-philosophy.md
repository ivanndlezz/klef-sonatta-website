# Metodología KLEF — Arquitectura Nativa para la Web

---

## Tema 1 — La Web como Plataforma Completa

### Preámbulo

Durante años, el desarrollo web moderno ha incorporado múltiples capas de frameworks y dependencias con el objetivo de acelerar la productividad. Sin embargo, esta acumulación de abstracciones ha generado ecosistemas complejos, frágiles y dependientes de tooling externo. La metodología KLEF parte de una observación distinta: el navegador moderno ya es una plataforma suficientemente completa.

### Premisa técnica

Los navegadores actuales integran de forma nativa motores de render (HTML/CSS), motores de lógica (JavaScript), gráficos vectoriales (SVG), almacenamiento local, red avanzada y ejecución modular. Esto significa que gran parte de las capacidades que los frameworks ofrecen como valor agregado ya existen en el estándar web. KLEF propone aprovechar estas capacidades directamente, sin introducir capas propietarias innecesarias.

### Ejemplo

Un componente interactivo puede construirse únicamente con HTML semántico, CSS variable-driven y JavaScript modular:

```html
<button class="btn" style="--bg:var(--color-primary)">Enviar</button>
<script type="module">
  document.querySelector('.btn').addEventListener('click', ()=> alert('Acción'));
</script>
```

Sin compiladores, sin dependencias, sin runtime externo.

### Comparación

* Framework tradicional: requiere bundler, transpiler, dependencias, runtime.
* KLEF: funciona directamente en el navegador.

Resultado: menor complejidad, mayor longevidad y cero deuda tecnológica inducida por herramientas externas.

---

## Tema 2 — Diseño Variable-Driven en lugar de Clases Utilitarias

### Preámbulo

Los sistemas utility-first popularizaron el uso de clases para cada propiedad visual. Si bien esto aumenta control granular, introduce verbosidad, repetición y fricción cognitiva, tanto para humanos como para IA.

### Premisa técnica

KLEF adopta un modelo basado en variables CSS como tokens de diseño. Las decisiones de espaciado, color, tipografía y layout viven en tokens globales y se aplican mediante propiedades declarativas inline o clases semánticas mínimas.

### Ejemplo

```css
:root {
  --sp-4: 1rem;
  --color-primary: #2563eb;
}
```

```html
<section style="--py:var(--sp-4); --bg:var(--color-primary)">
  Contenido
</section>
```

### Comparación

* Utility-first: múltiples clases por elemento, alto consumo de tokens.
* KLEF: una sola declaración variable-driven, legible y compacta.

Resultado: menor código, mayor consistencia y mejor compatibilidad con generación por IA.

---

## Tema 3 — JSON como Modelo de Datos Simple y Versionable

### Preámbulo

La tendencia habitual es incorporar bases de datos y CMS incluso para proyectos donde los datos son estáticos o semiestáticos. Esto introduce capas de infraestructura innecesarias.

### Premisa técnica

KLEF propone usar JSON como fuente de datos primaria cuando la complejidad transaccional no lo requiere. JSON es legible, versionable con Git y consumible directamente por JavaScript sin transformaciones.

### Ejemplo

```json
{
  "products": [
    {"name": "Tarjeta NFC", "price": 800},
    {"name": "Perfil Digital", "price": 0}
  ]
}
```

```js
fetch('data.json').then(r=>r.json()).then(data=>render(data.products));
```

### Comparación

* Base de datos tradicional: servidor, ORM, backups, migraciones.
* JSON estático: archivo versionado, deploy simple, cero mantenimiento.

Resultado: arquitectura más liviana y estable a largo plazo.

---

## Tema 4 — SVG como Sistema Gráfico Modular

### Preámbulo

Los íconos y gráficos suelen incluirse inline en cada componente, generando código repetitivo y costoso en tokens.

### Premisa técnica

KLEF utiliza kits de SVG centralizados en JSON o sprite sheets, referenciados dinámicamente por identificador. Esto separa estructura de contenido gráfico.

### Ejemplo

```html
<div data-icon="menu"></div>
```

```js
iconLoader.load('menu');
```

### Comparación

* SVG inline: repetición de markup en cada uso.
* SVG referenciado: una sola fuente reutilizable.

Resultado: menor código HTML y mejor rendimiento cognitivo y técnico.

---

## Tema 5 — Arquitectura Pensada para Humanos y para IA

### Preámbulo

El desarrollo asistido por IA ya es parte permanente del flujo de trabajo moderno. Sin embargo, muchos stacks actuales no fueron diseñados considerando cómo leen y generan código los modelos.

### Premisa técnica

KLEF estructura código semántico, declarativo y predecible. Esto facilita que herramientas de IA comprendan contexto, intención y patrones sin necesidad de prompts extensos.

### Ejemplo

```css
/* KLEF: No sobrescribir componentes. Usar tokens de variables */
```

Los comentarios funcionan como prompts persistentes para asistentes de código.

### Comparación

* Stack tradicional: configuraciones dispersas y convenciones implícitas.
* KLEF: reglas visibles y contexto explícito dentro del código.

Resultado: mayor productividad asistida por IA y menor riesgo de generación incorrecta.

---

## Conclusión

KLEF no busca reemplazar el ecosistema moderno. Busca recordar que la web nativa sigue siendo la plataforma más estable, universal y futura. La metodología integra los patrones efectivos de la ingeniería moderna dentro de tecnologías estándar, creando sistemas simples, longevos y comprensibles tanto para humanos como para máquinas.
