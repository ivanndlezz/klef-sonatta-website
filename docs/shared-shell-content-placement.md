# Contrato de montaje del contenido y footer

## Error documentado

shared/components/load-basics/load-basics.js inserta el shell común (navegación, main y footer) al principio de body mediante afterbegin.

Por eso el orden del HTML fuente no es suficiente. Si una página escribe su article después del script de load-basics.js y no lo monta dentro del main compartido, el resultado visual es:

~~~text
shell main vacío
footer
contenido de la página
~~~

Ese fue el error de /contacto/: la página tenía contenido correcto, pero no tenía un montaje de contenido. El footer quedaba visible antes de la página.

## Contrato obligatorio

Toda página estática que use el shell compartido debe:

1. Marcar su elemento raíz de contenido con data-shell-content.
2. Cargar shared/components/load-basics/load-basics.js.
3. Dejar que load-basics.js mueva ese elemento a body > main.
4. Mantener cualquier script específico sólo para comportamiento adicional, no para resolver el orden básico.

Ejemplo:

~~~html
<article class="page-content" data-shell-content>
  ...
</article>
<script src="../shared/components/load-basics/load-basics.js"></script>
~~~

El loader central ahora ejecuta placeShellContent() inmediatamente después de insertar el shell y antes de disparar loadBasicsReady. Esto cubre páginas nuevas y evita depender de un mover distinto por plantilla.

## Protección contra regresiones

server/validate-shell-placement.php comprueba las páginas shell principales y confirma que:

- el loader central contiene el montaje;
- cada página declara data-shell-content;
- cada página carga load-basics.js.

El workflow de GitHub Actions ejecuta esta validación antes de desplegar. Si una página no respeta el contrato, el deploy se detiene.
