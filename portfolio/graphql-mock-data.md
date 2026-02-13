```graphql
query GetPortfolioItem {
  post(
    id: "fish-and-grill-re-diseno-de-marca-y-extension-de-identidad"
    idType: SLUG
  ) {
    id
    title
    slug
    uri
    date
    content(format: RENDERED)
    featuredImage {
      node {
        sourceUrl(size: LARGE)
        altText
      }
    }
    portfolioImages {
      id
      sourceUrl(size: LARGE)
      altText
      mediaItemUrl
    }
    categories {
      nodes {
        categoryId
        name
        slug
        uri
      }
    }
    tags {
      nodes {
        tagId
        name
        slug
      }
    }
    author {
      node {
        id
        name
        firstName
        lastName
        uri
        url
        userId
        rolesList
        avatar {
          url
        }
      }
    }
    coAuthors {
      __typename
      ... on User {
        id
        name
        firstName
        lastName
        uri
        url
        userId
        rolesList
        avatar {
          url
        }
        description
      }
      ... on GuestAuthor {
        id
        name
        firstName
        lastName
        email
        avatar {
          url
        }
        description
        website
      }
    }
  }
}
```

```json
{
  "data": {
    "post": {
      "id": "cG9zdDo5Mjc=",
      "title": "Fish & Grill: Re-diseño de Marca y Extensión de Identidad",
      "slug": "fish-and-grill-re-diseno-de-marca-y-extension-de-identidad",
      "uri": "/blog/fish-and-grill-re-diseno-de-marca-y-extension-de-identidad/",
      "date": "2026-01-27T02:49:51",
      "content": "\n<h3 class=\"wp-block-heading\">Introduccion &#8211; Estado Inicial</h3>\n\n\n\n<h3 class=\"wp-block-heading\">El logo.</h3>\n\n\n\n<p>Cuando recibimos la marca Fish &amp; Grill, nos encontramos con <strong>un logo visualmente atractivo y con personalidad clara.</strong></p>\n\n\n\n<p>#1) Un pez estilizado con textura de líneas paralelas que funcionaba como isotype. #2) una tipografía bold condensada en “<strong>FISH&amp;GRILL</strong>”; y #3) un script elegante en “Bistro by Sebastien Agnes”. La paleta de coral, aqua y crema le daba frescura y personalidad marina.</p>\n\n\n\n<p>El logo funcionaba y tenía carácter. Pero vivía solo en una versión.</p>\n\n\n\n<p><strong>Los inconvenientes:</strong></p>\n\n\n\n<p>Esto significaba que cuando necesitaras usarlo como avatar en Instagram, no existía una versión AdHoc que permitiera su identificación en ese formato.</p>\n\n\n\n<p>Para un favicon de sitio web, no había versión compacta. Si alguien pedía solo el pez para una aplicación pequeña, esa variante no existía. El logo estaba pensado para un solo contexto (horizontal, mediano, impreso) pero el negocio necesitaba que viviera en muchos espacios más.</p>\n\n\n\n<p><strong>Paleta de color.</strong></p>\n\n\n\n<p>La paleta de color existía visualmente, pero no existia una guía de uso. No había especificaciones técnicas: sin códigos HEX exactos, sin valores para impresión, sin Pantone para producción industrial. Y como solo existía una combinación de colores, no había forma de adaptar la marca a diferentes contextos manteniendo la identidad.</p>\n\n\n\n<p>Más allá del logo, no existían recursos gráficos complementarios. Patrones, iconografía, ni ningún elemento que permitiera extender el lenguaje visual. El logo era fuerte, pero no tenía sistema de soporte.</p>\n\n\n\n<h3 class=\"wp-block-heading\">La oportunidad</h3>\n\n\n\n<p>Fish &amp; Grill tenía un logo sólido, pero necesitaba un sistema de marca completo. No se trataba de empezar de cero. Se trataba de tomar lo que ya funcionaba y construir alrededor: crear las versiones que faltaban, codificar los colores, desarrollar los recursos gráficos, pulir los detalles técnicos.</p>\n\n\n\n<p>Crear a partir de lo existente. Quedarnos con lo que funciona. Retocar solo lo que falta o necesita pulirse.</p>\n\n\n\n<hr class=\"wp-block-separator has-alpha-channel-opacity\"/>\n\n\n\n<h3 class=\"wp-block-heading\">Bloque II: Construcción del Sistema</h3>\n\n\n\n<h3 class=\"wp-block-heading\">Paso 1: Pulir el Logo Base</h3>\n\n\n\n<p>El primer paso no fue rediseñar. Fue identificar qué funcionaba y qué necesitaba pulirse.</p>\n\n\n\n<p>El pez tenía líneas hermosas con carácter. Eso se quedaba. La estructura visual era sólida. Solo necesitábamos refinar algunos detalles técnicos para garantizar que funcionara impecablemente en cualquier escala.</p>\n\n\n\n<p>La tipografía &#8220;FISH&amp;GRILL&#8221; ya tenía presencia. La mantuvimos. El peso, la condensación, la personalidad bold estaban bien. Refinamos el tracking para que el ritmo visual fuera perfectamente consistente a cualquier tamaño. Cambiamos la tipografía por un mix de Veneer y Zing Rust que le dio más carácter manteniendo la misma fuerza visual.</p>\n\n\n\n<p>El cambio más visible vino en &#8220;Bistro by Sebastien Agnes&#8221;. En la versión original, &#8220;BY&#8221; estaba en mayúsculas y se leía rígido: &#8220;Bistro BY SEBASTIEN AGNES&#8221;. Lo cambiamos a minúsculas y modificamos el estilo tipográfico para que fluyera más naturalmente: &#8220;Bistro by Sebastien Agnes&#8221; usando Javacom, una tipografía script más personal.</p>\n\n\n\n<p>Ahora el logo tiene capas de lectura clara: primero ves FISH&amp;GRILL, luego Bistro, luego by Sebastien Agnes. Jerarquía natural, no competencia visual.</p>\n\n\n\n<p>El símbolo &#8220;&amp;&#8221; pasó de aqua a negro. Pequeño cambio, gran impacto. Ahora funciona como elemento de anclaje entre &#8220;FISH&#8221; y &#8220;GRILL&#8221; en lugar de competir cromáticamente. El negro le da peso y lo convierte en parte estructural del wordmark, no solo un detalle de color.</p>\n\n\n\n<p>También refinamos la paleta: el aqua se volvió más suave, más verde menta, menos saturado. Más sofisticado, más versátil.</p>\n\n\n\n<p>El resultado: tomamos un logo que ya tenía personalidad y lo pulimos técnicamente sin perder su esencia. Mismo ADN, mejor ejecución.</p>\n\n\n\n<hr class=\"wp-block-separator has-alpha-channel-opacity\"/>\n\n\n\n<h3 class=\"wp-block-heading\">Paso 2: Crear el Sistema de Versiones</h3>\n\n\n\n<p>Con el logo base pulido, era momento de crear las versiones que el negocio necesitaba.</p>\n\n\n\n<p>Una sola versión del logo no puede vivir en todos los contextos que una marca moderna requiere. Necesitábamos versiones específicas, cada una diseñada para un propósito claro.</p>\n\n\n\n<p>La <strong>versión horizontal</strong> ya existía y funcionaba bien. Proporciones 3:1 aproximadamente. Esta se convirtió en la versión principal para papelería, señalética, headers de web. Es la versión que ancla toda la identidad visual.</p>\n\n\n\n<p>Creamos la <strong>versión square</strong> pensando en el mundo digital: avatares, posts cuadrados de Instagram, íconos de apps. Proporción 1:1. Aquí el isotype y la tipografía se acomodan en formato vertical compacto. Diseñada desde cero para este contexto específico, no forzando la versión horizontal en un cuadrado.</p>\n\n\n\n<p>La <strong>versión small</strong> nació para contextos donde el espacio es limitado pero aún necesitas el logo completo: firmas de email, etiquetas, tags. Proporciones 2:1, elementos optimizados para máxima legibilidad en tamaño reducido.</p>\n\n\n\n<p>El <strong>isotype favicon</strong> es solo el pez. Sin texto. Para favicons, app icons, marcas de agua. Cuando tienes 16&#215;16 píxeles, necesitas un símbolo que se reconozca al instante. Extrajimos el elemento más fuerte del logo y lo convertimos en versión independiente.</p>\n\n\n\n<p>Y finalmente, creamos el <strong>wordmark</strong>: solo la tipografía “FISH&amp;GRILL”, sin el pez. Para contextos editoriales, menús internos, situaciones donde el isotype competiría con el contenido en lugar de apoyarlo.</p>\n\n\n\n<p>Cada versión se diseñó con proporciones y cualidades exactas. Todas funcionan en escala de grises. Todas respetan las mismas reglas de espaciado y zona de respeto. No son variaciones aleatorias. Son versiones funcionales creadas con propósito.</p>\n\n\n\n<hr class=\"wp-block-separator has-alpha-channel-opacity\"/>\n\n\n\n<h3 class=\"wp-block-heading\">Paso 3: Desarrollar el Sistema de Color</h3>\n\n\n\n<p>El logo tenía una paleta clara: coral, aqua, crema. Funcionaba bien. Pero vivía solo en la aplicación visual, sin especificaciones técnicas ni variaciones para diferentes contextos.</p>\n\n\n\n<p>El primer paso fue codificar la paleta original. Cada color recibió sus especificaciones exactas en todos los formatos necesarios: HEX (#E95F47 / #4ECDC4 / #F7F3E9) para web, RGB para digital, CMYK para impresión, Pantone para producción industrial. Ya no es “coral”. Es #E95F47. Ya no es “aqua”. Es #4ECDC4. Precisión técnica que garantiza consistencia.</p>\n\n\n\n<p>Luego desarrollamos cinco paletas adicionales derivadas de la misma lógica estructural. Todas tienen un color dominante, un color de acento, y un neutral. Todas siguen las mismas proporciones de uso. Lo que cambia es el mood, no la estructura.</p>\n\n\n\n<p>Rojo + verde menta para contextos más vibrantes. Naranja + gris para comunicación corporativa más sobria. Azul + aqua para líneas de productos enfocadas en mar. Verde + gris para propuestas sustentables. Gris + café para documentos formales.</p>\n\n\n\n<p>Cada paleta viene documentada con el mismo nivel de especificación técnica que la original. Y todas se entregan en archivo ASE (Adobe Swatch Exchange) listo para instalar en cualquier software de diseño.</p>\n\n\n\n<p>El sistema de color no restringe. Expande. Permite que la marca se adapte a diferentes contextos sin perder su esencia. Misma estructura, diferentes aplicaciones.</p>\n\n\n\n<hr class=\"wp-block-separator has-alpha-channel-opacity\"/>\n\n\n\n<h3 class=\"wp-block-heading\">Paso 4: Desarrollar Recursos Gráficos</h3>\n\n\n\n<p>El logo y sus versiones son el núcleo de la marca, pero necesitan un ecosistema gráfico que los soporte.</p>\n\n\n\n<p>El patrón de líneas paralelas nació directamente de la textura del isotype. Si el pez tiene esas líneas características, ¿por qué no convertirlas en un elemento gráfico recurrente? Desarrollamos tres densidades: sparse (espaciado amplio), medium (balance), y dense (compacto). Funcionan como backgrounds, overlays, o elementos decorativos. Siempre se sienten parte de Fish &amp; Grill porque nacieron del ADN visual del logo.</p>\n\n\n\n<p>La iconografía marina se desarrolló para complementar sin competir. Doce iconos en estilo línea, siguiendo el mismo lenguaje visual de la tipografía, algo grunge. Temas: pescados, mariscos, utensilios, elementos marinos. Formato SVG, escalables, editables. No etan pensados como decoración. Son herramientas funcionales para menús, señalética, interfaces digitales.</p>\n\n\n\n<p>Y finalmente, desarrollamos guidelines de fotografía. No podemos controlar qué fotos se tomarán en el futuro, pero sí podemos establecer cómo tratarlas para que se integren al sistema visual. Overlay sutil del patrón de líneas sobre las imágenes. Balance de color alineado a las paletas del sistema. Composiciones que respetan el lenguaje establecido.</p>\n\n\n\n<p>La regla que sostiene todo: cada elemento gráfico usa el mismo lenguaje visual (líneas, proporciones, peso). Si algo no se siente parte de la familia, no entra en el sistema.</p>\n\n\n\n<hr class=\"wp-block-separator has-alpha-channel-opacity\"/>\n\n\n\n<h3 class=\"wp-block-heading\">Bloque 3: El Manual y Entregables</h3>\n\n\n\n<h3 class=\"wp-block-heading\">Reto 5: Documentación Funcional</h3>\n\n\n\n<p>Los manuales de marca tradicionales son PDFs de 80 páginas que nadie lee. Documentos que explican todo pero no enseñan nada. Páginas y páginas de reglas sobre cómo usar el logo, qué colores aplicar, cuándo sí y cuándo no. Y al final, cuando alguien necesita crear algo, no sabe por dónde empezar.</p>\n\n\n\n<p>El manual de Fish &amp; Grill sigue un principio distinto: recursividad. Se explica a sí mismo mientras lo usas.</p>\n\n\n\n<p>Son 17 páginas. No más. Cada una diseñada con la misma obsesión que el logo mismo. Las primeras dos páginas muestran el logo refresh: antes y después, con los colores identificadores. La página 3 presenta la paleta principal con todos los códigos técnicos. Pero la página 4 no explica cómo usar esos colores. Los usa. La composición misma de la página aplica la paleta que acabas de ver. Aprendes viendo, no leyendo.</p>\n\n\n\n<p>La página 5 muestra las cinco versiones del logo: horizontal, square, small, isotype, wordmark. Las páginas 6 y 7 presentan el sistema tipográfico (familias, pesos, jerarquías). La página 8 introduce los patrones gráficos con las tres densidades del patrón de líneas. La página 9, la iconografía completa. La página 10, guidelines de fotografía.</p>\n\n\n\n<p>Y luego vienen las páginas 11 a 16: aplicaciones reales. Menú de mesa. Post de Instagram. Story. Señalética exterior. Packaging. Firma de email. Cada aplicación no solo muestra el resultado final. Muestra qué elementos del sistema se usaron, cómo se combinaron, y por qué funcionan juntos.</p>\n\n\n\n<p>La página 17 cierra con especificaciones técnicas: espaciados, tamaños mínimos, zonas de respeto. Pero para cuando llegas ahí, ya has visto todo en acción. Las reglas no llegan primero. Llegan al final, como confirmación de lo que ya entendiste visualmente.</p>\n\n\n\n<hr class=\"wp-block-separator has-alpha-channel-opacity\"/>\n\n\n\n<h3 class=\"wp-block-heading\">Archivos Entregados: Soberanía Total</h3>\n\n\n\n<p>No entregamos solo diseños. Entregamos herramientas de soberanía.</p>\n\n\n\n<p>La carpeta principal contiene logos en todos los formatos imaginables. Archivos AI (Adobe Illustrator) para quien necesite control total. SVG escalables y web-ready. PNG con transparencia para uso inmediato. PDF vectoriales para impresión profesional. Cada versión del logo (horizontal, square, small, isotype, wordmark) existe en todos esos formatos. No hay excusa para “no tener el archivo correcto”.</p>\n\n\n\n<p>La carpeta de colores incluye las paletas en formato ASE (Adobe Swatch Exchange), listas para instalar en cualquier software de diseño. Especificaciones en PDF con todos los códigos. Referencia de Pantone para producción industrial. Si alguien necesita imprimir algo mañana en una imprenta profesional, tiene todo lo que necesita.</p>\n\n\n\n<p>Las tipografías vienen en formato OTF instalable: Zing Rust, Veneer, Javacom. No son solo referencias. Son los archivos reales que se pueden instalar en cualquier computadora y usar inmediatamente. Consistencia tipográfica garantizada.</p>\n\n\n\n<p>Los recursos incluyen los patrones en formato editable (AI), los iconos en vectores (AI y SVG), y texturas en un archivo ZIP listo para usar. Todo nativo, todo editable, todo bajo control del cliente.</p>\n\n\n\n<p>Y finalmente, el manual. No solo en PDF para consulta, sino también como guía rápida de una página para los que necesitan respuestas inmediatas.</p>\n\n\n\n<p>Pero eso no es todo. También entregamos templates editables. Diez templates de Canva (posts, stories, menús) para que el equipo interno pueda crear sin conocimientos técnicos avanzados. Plantilla de presentación corporativa en PowerPoint. Plantillas de documentos en Word. Y recursos optimizados para web: favicons en tres tamaños (16&#215;16, 32&#215;32, 64&#215;64), PNG optimizados, SVG inline-ready.</p>\n\n\n\n<p>Todo está pensado para que Fish &amp; Grill no dependa de nadie. Tienen las herramientas. Tienen el conocimiento. Tienen el control.</p>\n\n\n\n<hr class=\"wp-block-separator has-alpha-channel-opacity\"/>\n\n\n\n<h3 class=\"wp-block-heading\">Casos de Uso: El Sistema en Acción</h3>\n\n\n\n<p>El manual incluye seis aplicaciones reales que demuestran el sistema funcionando.</p>\n\n\n\n<p>El menú de mesa usa la versión horizontal del logo, la paleta original, el patrón como elemento decorativo sutil, tipografía Zing Rust para títulos y Javacom para descripciones. Cada elemento tiene su lugar. Nada compite. Todo respira.</p>\n\n\n\n<p>El post de Instagram (cuadrado) usa la versión square del logo, una foto de platillo con overlay sutil del patrón, paleta aqua. Legible en móvil, atractivo visualmente, inconfundiblemente Fish &amp; Grill.</p>\n\n\n\n<p>La story de Instagram (vertical) pone el isotype en esquina, foto full-bleed, texto con la tipografía del sistema. Minimalista, efectivo, rápido de producir.</p>\n\n\n\n<p>La señalética exterior usa la versión horizontal a gran escala. Especificaciones de impresión en Pantone. Tamaño mínimo respetado. Funciona desde cinco metros de distancia.</p>\n\n\n\n<p>El packaging (caja para llevar) usa el patrón de líneas en repetición continua, el isotype como sello, versión monocromática para mantener costos de producción bajos. Identidad clara sin romper presupuesto.</p>\n\n\n\n<p>Y la firma de email usa la versión small, especificaciones de tamaño digital precisas, link directo a redes sociales. Profesional, compacta, funcional.</p>\n\n\n\n<p>Cada caso incluye screenshot de la aplicación real, especificaciones técnicas exactas, y archivos fuente editables. No son solo ejemplos. Son plantillas listas para duplicar y adaptar.</p>\n\n\n\n<hr class=\"wp-block-separator has-alpha-channel-opacity\"/>\n\n\n\n<h3 class=\"wp-block-heading\">Lo Que Cambió</h3>\n\n\n\n<p>Fish &amp; Grill pasó de tener un logo a tener un sistema de identidad completo.</p>\n\n\n\n<p>Consistencia visual: todas las aplicaciones ahora están alineadas al sistema. No hay más variaciones aleatorias, no hay más “interpretaciones creativas” que rompen la marca. Cero errores de reproducción del logo porque todas las versiones están documentadas y disponibles.</p>\n\n\n\n<p>Autonomía operativa: el equipo interno puede generar materiales sin depender de un diseñador externo cada vez que necesitan algo. El tiempo de producción pasó de días a minutos. Templates listos, sistema claro, ejecución inmediata.</p>\n\n\n\n<p>Escalabilidad garantizada: el sistema funciona desde favicon (16 píxeles) hasta valla publicitaria (cinco metros). Todas las versiones fueron probadas en reproducción real. No es teoría. Es práctica comprobada.</p>\n\n\n\n<p>Flexibilidad controlada: seis paletas de color significan variedad sin caos. Estructura fija con branding variable significa consistencia con adaptabilidad. La marca puede respirar en diferentes contextos sin perder su esencia.</p>\n\n\n\n<hr class=\"wp-block-separator has-alpha-channel-opacity\"/>\n\n\n\n<h3 class=\"wp-block-heading\">Sistema de Marca Funcional</h3>\n\n\n\n<p>Fish &amp; Grill ya no tiene solo un logo bonito. Tiene un sistema de identidad que funciona.</p>\n\n\n\n<p>No se trata de verse bien. Se trata de tener una herramienta que se puede aplicar, reproducir, escalar y mantener sin fricción. El manual no es un documento decorativo. Es una herramienta de trabajo. Los archivos no son entregables finales guardados en una carpeta olvidada. Son recursos de soberanía que se usan todos los días.</p>\n\n\n\n<p>El sistema no restringe. Estructura. No limita. Clarifica.</p>\n\n\n\n<p>Fish &amp; Grill ahora tiene lo que toda marca profesional necesita: claridad, consistencia y control total.</p>\n\n\n\n<p></p>\n",
      "featuredImage": {
        "node": {
          "sourceUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/01/Fish-and-Grill-Web-01-1024x576.jpg",
          "altText": ""
        }
      },
      "portfolioImages": [
        {
          "id": "cG9zdDo5MzI=",
          "sourceUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/01/Fish-and-Grill-Web-03-600x400-1.jpg",
          "altText": "",
          "mediaItemUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/01/Fish-and-Grill-Web-03-600x400-1.jpg"
        },
        {
          "id": "cG9zdDo5MzE=",
          "sourceUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/01/Fish-and-Grill-Web-04-600x400-1.jpg",
          "altText": "",
          "mediaItemUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/01/Fish-and-Grill-Web-04-600x400-1.jpg"
        },
        {
          "id": "cG9zdDo5MzA=",
          "sourceUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/01/Fish-and-Grill-Web-07-600x400-1.jpg",
          "altText": "",
          "mediaItemUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/01/Fish-and-Grill-Web-07-600x400-1.jpg"
        },
        {
          "id": "cG9zdDo5MzM=",
          "sourceUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/01/Fish-and-Grill-Web-05-1024x576.jpg",
          "altText": "",
          "mediaItemUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/01/Fish-and-Grill-Web-05.jpg"
        },
        {
          "id": "cG9zdDo5Mjk=",
          "sourceUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/01/Fish-and-Grill-Web-06-600x400-1.jpg",
          "altText": "",
          "mediaItemUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/01/Fish-and-Grill-Web-06-600x400-1.jpg"
        },
        {
          "id": "cG9zdDo5MzY=",
          "sourceUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/01/Fish-and-Grill-Web-10-1024x576.jpg",
          "altText": "",
          "mediaItemUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/01/Fish-and-Grill-Web-10.jpg"
        },
        {
          "id": "cG9zdDo5Mzc=",
          "sourceUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/01/Fish-and-Grill-Web-11-1024x576.jpg",
          "altText": "",
          "mediaItemUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/01/Fish-and-Grill-Web-11.jpg"
        },
        {
          "id": "cG9zdDo5MzQ=",
          "sourceUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/01/Fish-and-Grill-Web-09-1024x576.jpg",
          "altText": "",
          "mediaItemUrl": "https://klef.newfacecards.com/wp-content/uploads/2026/01/Fish-and-Grill-Web-09.jpg"
        }
      ],
      "categories": {
        "nodes": [
          {
            "categoryId": 24,
            "name": "Branding",
            "slug": "branding",
            "uri": "/blog/category/portfolio/branding/"
          },
          {
            "categoryId": 23,
            "name": "Portfolio",
            "slug": "portfolio",
            "uri": "/blog/category/portfolio/"
          }
        ]
      },
      "tags": {
        "nodes": []
      },
      "author": {
        "node": {
          "id": "dXNlcjox",
          "name": "ivangonzalez",
          "firstName": "Ivan",
          "lastName": "Gonzalez",
          "uri": "/blog/author/ivangonzalez/",
          "url": "http://klef.newfacecards.com",
          "userId": 1,
          "rolesList": ["administrator"],
          "avatar": {
            "url": "https://klef.newfacecards.com/wp-content/uploads/ultimatemember/1/profile_photo-190x190.jpg?1770793276"
          }
        }
      },
      "coAuthors": [
        {
          "__typename": "User",
          "id": "dXNlcjox",
          "name": "ivangonzalez",
          "firstName": "Ivan",
          "lastName": "Gonzalez",
          "uri": "/blog/author/ivangonzalez/",
          "url": "http://klef.newfacecards.com",
          "userId": 1,
          "rolesList": ["administrator"],
          "avatar": {
            "url": "https://klef.newfacecards.com/wp-content/uploads/ultimatemember/1/profile_photo-190x190.jpg?1770793276"
          },
          "description": null
        },
        {
          "__typename": "User",
          "id": "dXNlcjoy",
          "name": "Daniela Millan",
          "firstName": "Daniela",
          "lastName": "Millan",
          "uri": "/blog/author/danielamillan/",
          "url": null,
          "userId": 2,
          "rolesList": ["um_admin"],
          "avatar": {
            "url": "https://klef.newfacecards.com/wp-content/uploads/ultimatemember/2/profile_photo-190x190.png?1770793276"
          },
          "description": null
        },
        {
          "__typename": "User",
          "id": "dXNlcjo0",
          "name": "Fish &amp; Grill Restaurant",
          "firstName": "Fish &amp; Grill",
          "lastName": "Restaurant",
          "uri": "/blog/author/fishandgrill/",
          "url": null,
          "userId": 4,
          "rolesList": ["um_client"],
          "avatar": {
            "url": "https://klef.newfacecards.com/wp-content/uploads/ultimatemember/4/profile_photo-190x190.jpg?1770793276"
          },
          "description": null
        }
      ]
    }
  },
  "extensions": {
    "debug": [],
    "queryAnalyzer": {
      "keys": "314a22296baf73567e0acb5092348c0f530a07f4254adc50846ab586271bb35e graphql:Query operation:GetPortfolioItem cG9zdDo5Mjc= dXNlcjox cG9zdDo5MzU= cG9zdDo5MzI= cG9zdDo5MzE= cG9zdDo5MzA= cG9zdDo5MzM= cG9zdDo5Mjk= cG9zdDo5MzY= cG9zdDo5Mzc= cG9zdDo5MzQ= dGVybToyNA== dGVybToyMw== dXNlcjoy dXNlcjo0",
      "keysLength": 288,
      "keysCount": 18,
      "skippedKeys": "",
      "skippedKeysSize": 0,
      "skippedKeysCount": 0,
      "skippedTypes": []
    }
  }
}
```
