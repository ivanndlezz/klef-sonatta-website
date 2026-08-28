# Sistema de navegación de Klef

## Estado actual

El mega menú original es el sistema activo para el home y para las páginas que
cargan `shared/components/load-basics/load-basics.html`. Conserva la referencia
visual de la barra blanca, el panel desplegable de dos columnas y la navegación
móvil por niveles.

Sus tres entradas representan las secciones actuales del sitio:

- `Servicios` → `/servicios/`
- `Proyectos` → `/portfolio/`
- `Blog` → `/blog/`

`Contacto` permanece como acción directa en la barra de acciones.

## Menú parche

El menú simplificado/flotante no se elimina, pero permanece deshabilitado. En
`index.html` se conserva bajo los selectores condicionados por
`body[data-menu-patch="enabled"]`. El estado normal es `disabled`, definido por
`shared/components/navigation/navigation-system.js`.

Para una recuperación temporal, se puede cambiar el atributo del elemento
`body` a `data-menu-patch="enabled"`; cualquier activación debe probarse antes
de publicarse.

## Regla de mantenimiento

Cuando se agregue una sección, se deben actualizar en paralelo las dos copias
del shell que todavía existen:

- `index.html`
- `shared/components/load-basics/load-basics.html`

Los identificadores `data-mega` y los `id` de los paneles deben coincidir. Los
enlaces secundarios deben apuntar a rutas reales; no se deben dejar enlaces
`href="#"` dentro del mega menú.

### Intención de los enlaces

El panel `Proyectos` debe llevar a colecciones o a una acción explícita, nunca a
un caso individual usado como sustituto de una categoría. Actualmente:

- `Todos los proyectos` → `/portfolio/`
- `Marca y branding` → `/portfolio/?discipline=brands`
- `Web y producto digital` → `/portfolio/?discipline=dev`
- `Hablemos de tu proyecto` → `/contacto/`

El índice de portafolio lee `discipline` y activa el filtro correspondiente.
También conserva el estado cuando el visitante cambia de pestaña, actualizando
la URL sin recargar la página. Los alias amigables (`branding`, `desarrollo-web`
y `producto-digital`) se aceptan para enlaces futuros, pero los enlaces del
mega menú deben usar los valores canónicos `brands` y `dev`.

El controlador activo es
`shared/components/navigation/navigation-system.js`. El archivo
`assets/scripts/mega-menu-spa.js` queda como referencia heredada y no debe
volver a cargarse junto con el controlador activo sin una prueba específica.
