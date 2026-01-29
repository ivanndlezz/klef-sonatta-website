/* ============================================
   KLEF DESIGN SYSTEM V3
   Ergonomic Recursive Tokens + Limited Flags
   
   PHILOSOPHY:
   "Classes define intention.
    Variables define behavior."
   
   INTENT:
   Sistema ultra-ergonómico donde cada variable CSS
   es un token recursivo que se auto-aplica.
   Reducción máxima de fricción para escribir UI.
   
   PRINCIPLE: Token-First Design
   Todos los valores vienen de design tokens.
   No hay números mágicos ni valores arbitrarios.
   
   PRINCIPLE: Declarative over Imperative
   HTML describe QUÉ mostrar, no CÓMO mostrarlo.
   Las variables declaran comportamiento.
   
   PRINCIPLE: Composable Architecture
   Las variables se combinan libremente sin conflictos.
   No hay límites en la composición.
   
   ============================================ */

/* ============================================
   CORE PRINCIPLES (Manifiesto Aplicado)
   
   1. INTENCIÓN PERSISTENTE
      → Cada variable tiene propósito documentado
      → El sistema se explica a sí mismo
   
   2. COMENTARIOS COMO PROMPTS
      → Reducen entropía de decisiones
      → Guían tanto a humanos como a IA
   
   3. DOBLE LECTURA (HUMANO-IA)
      → Mismo código, dos lectores
      → Sin lenguajes paralelos
   
   4. NATIVE-FIRST
      → CSS puro, sin abstracciones innecesarias
      → Estándares web como fundamento
   
   5. SEMÁNTICA SOBRE ORNAMENTO
      → Nombres que comunican significado
      → No modas, sino intención
   
   6. RESTRICCIÓN EXPLÍCITA
      → Decimos qué NO hacer
      → Menos libertad mal entendida
   
   7. HUMILDAD TÉCNICA
      → No reinventar, apoyarse en el ecosistema
      → El sistema sobrevive a herramientas
   
   ============================================ */

/* ============================================
   WHEN TO USE
   
   PREFER:
   ✓ Design systems de gran escala
   ✓ Component libraries reutilizables
   ✓ CMS y UI builders
   ✓ Aplicaciones JSON-driven
   ✓ Interfaces Apple-inspired
   ✓ Proyectos con co-desarrollo IA
   
   AVOID:
   ✗ Prototipos rápidos sin sistema
   ✗ Proyectos con un solo componente
   ✗ Cuando no se necesita escalabilidad
   
   ============================================ */

/* ============================================
   TOKEN MAP (v3) — Official Vocabulary
   
   RATIONALE:
   Vocabulario corto y memorizable que reduce
   fricción cognitiva. Cada token tiene exactamente
   un propósito. La brevedad facilita escritura
   pero los comentarios preservan claridad.
   
   CONSTRAINT:
   No agregar tokens sin documentar el caso de uso.
   Menos es más. Mantener el vocabulario compacto.
   
   ============================================ */

/* === LAYOUT & POSITION ===
   SCOPE: Control de display y posicionamiento
   
   --d      display (flex, grid, block, inline)
   --pos    position (relative, absolute, fixed, sticky)
   --zi     z-index (usar tokens: --z-dropdown, --z-modal, etc.)
*/

/* === SIZE ===
   SCOPE: Dimensiones de elementos
   ANTI-PATTERN: No usar alturas fijas salvo necesario
   
   --w      width
   --h      height
   --wh     width & height (mismo valor para cuadrados)
   --mw     max-width
   --mh     max-height
   --minw   min-width
   --minh   min-height
*/

/* === SPACING ===
   SCOPE: Padding, margin, gap
   PREFER: Usar tokens de spacing (--sp-1 a --sp-10)
   
   --p      padding (todos los lados)
   --px     padding-inline (horizontal)
   --py     padding-block (vertical)
   --m      margin (todos los lados)
   --mx     margin-inline (horizontal)
   --my     margin-block (vertical)
   --g      gap (para flex y grid)
*/

/* === VISUAL ===
   SCOPE: Apariencia visual
   PREFER: Usar variables semánticas (--bg-primary, --text-primary)
   
   --bg     background
   --c      color
   --bd     border
   --rad    border-radius
   --sh     box-shadow
   --op     opacity
*/

/* === TYPOGRAPHY ===
   SCOPE: Control tipográfico
   PREFER: Usar escala predefinida (--fs-base, --fw-semibold)
   
   --fs     font-size
   --fw     font-weight
   --lh     line-height
   --ls     letter-spacing
   --ta     text-align
*/

/* === MOTION ===
   SCOPE: Transformaciones y transiciones
   PREFER: Usar easing tokens (--ease-out, --ease-expo)
   
   --trs    transform
   --trn    transition
*/

/* === FLEX / GRID ===
   SCOPE: Layout systems
   PREFER: Grid para layouts macro, flex para componentes
   
   --fd     flex-direction
   --fw     flex-wrap
   --ai     align-items
   --jc     justify-content
   --gtc    grid-template-columns
   --gtr    grid-template-rows
   --ga     grid-area
*/

/* ============================================
   CORE RECURSIVE CALLBACKS
   
   RATIONALE:
   Cada selector [style*="--token:"] actúa como
   un "callback" que aplica la propiedad CSS.
   Es un sistema declarativo: declaras la variable
   y automáticamente se aplica la propiedad.
   
   BENEFIT:
   - Escribes menos código
   - No creas clases por cada combinación
   - La IA entiende el patrón inmediatamente
   - Los humanos leen variables, no clases crípticas
   
   PRINCIPLE: Amortización del Costo de Tokens
   Estos selectores se escriben una vez y se
   reutilizan infinitamente. El costo inicial
   se recupera con cada uso.
   
   ============================================ */

/* === 1. LAYOUT & POSITION ===
   INTENT: Control fundamental de posicionamiento */

[style*="--d:"] {
  display: var(--d);
}

[style*="--pos:"] {
  position: var(--pos);
}

/* CONSTRAINT: Solo usar valores de z-index predefinidos */
[style*="--zi:"] {
  z-index: var(--zi);
}

/* === 2. SIZE ===
   ANTI-PATTERN: Evitar width/height 100% cuando no es necesario
   PREFER: Usar --wh para elementos cuadrados (íconos, avatares) */

[style*="--w:"] {
  width: var(--w);
}

[style*="--h:"] {
  height: var(--h);
}

/* INTENT: Token de conveniencia para cuadrados perfectos */
[style*="--wh:"] {
  width: var(--wh);
  height: var(--wh);
}

[style*="--mw:"] {
  max-width: var(--mw);
}

[style*="--mh:"] {
  max-height: var(--mh);
}

[style*="--minw:"] {
  min-width: var(--minw);
}

[style*="--minh:"] {
  min-height: var(--minh);
}

/* === 3. SPACING ===
   RATIONALE: Inline/block mejor que left/right/top/bottom
   BENEFIT: Soporte automático para RTL languages */

[style*="--p:"] {
  padding: var(--p);
}

/* SCOPE: Padding horizontal (izquierda + derecha) */
[style*="--px:"] {
  padding-left: var(--px);
  padding-right: var(--px);
}

/* SCOPE: Padding vertical (arriba + abajo) */
[style*="--py:"] {
  padding-top: var(--py);
  padding-bottom: var(--py);
}

[style*="--m:"] {
  margin: var(--m);
}

/* SCOPE: Margin horizontal (izquierda + derecha) */
[style*="--mx:"] {
  margin-left: var(--mx);
  margin-right: var(--mx);
}

/* SCOPE: Margin vertical (arriba + abajo) */
[style*="--my:"] {
  margin-top: var(--my);
  margin-bottom: var(--my);
}

/* PREFER: Usar gap sobre margin para espaciado de hijos
   RATIONALE: Gap no colapsa y es más predecible */
[style*="--g:"] {
  gap: var(--g, 0.5rem);
}

/* === 4. VISUAL ===
   SCOPE: Propiedades visuales fundamentales */

[style*="--bg:"] {
  background: var(--bg);
}

[style*="--c:"] {
  color: var(--c);
}

[style*="--bd:"] {
  border: var(--bd);
}

/* PREFER: Usar tokens de radius (--radius-sm, --radius-lg) */
[style*="--rad:"] {
  border-radius: var(--rad);
}

/* PREFER: Usar tokens de shadow (--shadow-sm, --shadow-lg) */
[style*="--sh:"] {
  box-shadow: var(--sh);
}

[style*="--op:"] {
  opacity: var(--op);
}

/* === 5. TYPOGRAPHY ===
   CONSTRAINT: Usar siempre la escala tipográfica predefinida
   ANTI-PATTERN: No usar valores arbitrarios como 19px */

[style*="--fs:"] {
  font-size: var(--fs);
}

[style*="--fw:"] {
  font-weight: var(--fw);
}

[style*="--lh:"] {
  line-height: var(--lh);
}

[style*="--ls:"] {
  letter-spacing: var(--ls);
}

[style*="--ta:"] {
  text-align: var(--ta);
}

/* === 6. MOTION ===
   PREFER: ease-out para la mayoría de interacciones
   SCOPE: Transformaciones y transiciones suaves */

[style*="--trs:"] {
  transform: var(--trs);
}

[style*="--trn:"] {
  transition: var(--trn);
}

/* === 7. FLEXBOX ===
   RATIONALE: Flex es el layout system más usado
   PREFER: Flex para componentes, grid para layouts */

[style*="--fd:"] {
  flex-direction: var(--fd);
}

/* ANTI-PATTERN: flex-wrap puede causar layouts impredecibles
   PREFER: Grid cuando necesitas wrapping controlado */
[style*="--fw:"] {
  flex-wrap: var(--fw);
}

[style*="--ai:"] {
  align-items: var(--ai);
}

[style*="--jc:"] {
  justify-content: var(--jc);
}

/* === 8. GRID ===
   SCOPE: Sistema de layout bidimensional
   PREFER: Grid para layouts macro complejos */

[style*="--gtc:"] {
  grid-template-columns: var(--gtc);
}

[style*="--gtr:"] {
  grid-template-rows: var(--gtr);
}

[style*="--ga:"] {
  grid-area: var(--ga);
}

/* ============================================
   LIMITED FLAGS (INTENTION ONLY)
   
   PHILOSOPHY: Keep intentionally SMALL
   
   RATIONALE:
   Las flags son atajos semánticos para patrones
   extremadamente comunes. NO son una biblioteca
   de utilities. Mantener este conjunto mínimo
   es crítico para la ergonomía del sistema.
   
   CONSTRAINT:
   Solo agregar flags cuando:
   1. El patrón se usa en >50% de componentes
   2. No se puede expresar con una variable
   3. La flag comunica intención semántica
   
   ANTI-PATTERN:
   No crear flags como --bold, --uppercase, etc.
   Esos son valores, no intenciones.
   
   ============================================ */

/* === DISPLAY FLAGS ===
   SCOPE: Los 3 display modes más comunes */

/* FLAG: Flex layout (el más común) */
[style*="--flex"] {
  display: flex;
}

/* FLAG: Grid layout (segundo más común) */
[style*="--grid"] {
  display: grid;
}

/* FLAG: Inline display (para textos) */
[style*="--inline"] {
  display: inline;
}

/* === UTILITY FLAGS ===
   SCOPE: Patrones universales que trascienden componentes */

/* FLAG: Centrado perfecto (horizontal + vertical)
   RATIONALE: Este patrón aparece en botones, cards,
   modals, y docenas de componentes. Es una intención
   semántica clara: "este contenido debe estar centrado" */
[style*="--center"] {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* FLAG: Ocultar elemento completamente
   CONSTRAINT: Usar !important porque ocultar debe
   tener precedencia sobre cualquier otro display */
[style*="--hidden"] {
  display: none !important;
}

/* ============================================
   CONTAINER QUERY TOKEN PATTERN
   
   INTENT: Componentes responsivos basados en su
   contenedor, no en viewport (más moderno que @media)
   
   RATIONALE:
   Container queries permiten componentes verdaderamente
   modulares que se adaptan a su espacio disponible,
   no a la pantalla completa.
   
   USAGE:
   <div class="klef-container">
     <div style="--cols">
       <!-- Se adapta automáticamente: 1, 2 o 3 columnas -->
     </div>
   </div>
   
   BENEFIT:
   - Componentes reutilizables en cualquier contexto
   - No necesitas media queries específicas
   - La IA puede componer layouts sin conocer el viewport
   
   ============================================ */

/* SCOPE: Marca el contenedor padre para container queries */
.klef-container {
  container-type: inline-size;
}

/* RESPONSIVE: 1 columna por defecto (mobile-first) */
[style*="--cols"] {
  display: grid;
  grid-template-columns: repeat(var(--cols, 1), 1fr);
}

/* RESPONSIVE: 2 columnas en containers medianos */
@container (min-width: 480px) {
  [style*="--cols"] {
    --cols: 2;
  }
}

/* RESPONSIVE: 3 columnas en containers grandes */
@container (min-width: 900px) {
  [style*="--cols"] {
    --cols: 3;
  }
}

/* ============================================
   DEBUG MODE (OPTIONAL)
   
   INTENT: Visualizar todos los elementos con inline styles
   
   USAGE:
   Descomentar para debug visual durante desarrollo.
   Ver qué elementos tienen variables inline.
   
   CONSTRAINT:
   Solo usar en desarrollo, nunca en producción.
   
   ============================================ */

/*
SCOPE: Debug visual mode

[style] {
  outline: 1px dashed rgba(0, 0, 0, 0.2);
}

[style]:hover {
  outline: 2px solid rgba(0, 113, 227, 0.5);
  background: rgba(0, 113, 227, 0.02);
}
*/

/* ============================================
   USAGE EXAMPLES
   
   PRINCIPLE: Progressive Disclosure
   Los ejemplos enseñan el sistema gradualmente
   
   ============================================ */

/*
═══════════════════════════════════════════════
EXAMPLE 1: SIMPLE BUTTON
───────────────────────────────────────────────
Traditional CSS:
  .btn {
    display: flex;
    align-items: center;
    padding: 12px 24px;
    background: blue;
    border-radius: 8px;
  }

Klef V3:
  <button style="--flex; --ai:center; --px:24px; --py:12px; --bg:var(--blue); --rad:8px">
    Click me
  </button>

BENEFIT: Sin crear clase, composición directa
═══════════════════════════════════════════════

═══════════════════════════════════════════════
EXAMPLE 2: CARD COMPONENT
───────────────────────────────────────────────
<div style="--p:var(--sp-5); --bg:var(--bg-primary); --rad:var(--radius-lg); --sh:var(--shadow-md)">
  <h3 style="--fs:var(--fs-2xl); --fw:var(--fw-semibold); --my:var(--sp-2)">
    Card Title
  </h3>
  <p style="--c:var(--text-secondary); --lh:var(--lh-relaxed)">
    Card description text
  </p>
</div>

RATIONALE: Cada elemento declara su comportamiento
═══════════════════════════════════════════════

═══════════════════════════════════════════════
EXAMPLE 3: CENTERED HERO
───────────────────────────────────────────────
<section style="--center; --minh:60vh; --flex; --fd:column; --g:var(--sp-6)">
  <h1 style="--fs:var(--fs-8xl); --fw:var(--fw-semibold); --ta:center">
    Welcome
  </h1>
  <p style="--fs:var(--fs-lg); --c:var(--text-secondary); --ta:center; --mw:600px">
    Your tagline here
  </p>
</section>

BENEFIT: Layout completo sin CSS externo
═══════════════════════════════════════════════

═══════════════════════════════════════════════
EXAMPLE 4: RESPONSIVE GRID
───────────────────────────────────────────────
<div class="klef-container">
  <div style="--cols; --g:var(--sp-4)">
    <div style="--p:var(--sp-4); --bg:var(--gray-100); --rad:var(--radius-md)">Item 1</div>
    <div style="--p:var(--sp-4); --bg:var(--gray-100); --rad:var(--radius-md)">Item 2</div>
    <div style="--p:var(--sp-4); --bg:var(--gray-100); --rad:var(--radius-md)">Item 3</div>
  </div>
</div>

RATIONALE: Container queries automáticas
═══════════════════════════════════════════════

═══════════════════════════════════════════════
EXAMPLE 5: NAVIGATION BAR
───────────────────────────────────────────────
<nav style="--flex; --ai:center; --jc:space-between; --px:var(--sp-5); --py:var(--sp-4); --bg:var(--bg-primary); --bd:1px solid var(--border-light)">
  <div style="--fs:var(--fs-xl); --fw:var(--fw-semibold)">Logo</div>
  <div style="--flex; --g:var(--sp-6)">
    <a href="#">Home</a>
    <a href="#">About</a>
    <a href="#">Contact</a>
  </div>
</nav>

BENEFIT: Nav completo sin clases custom
═══════════════════════════════════════════════

═══════════════════════════════════════════════
EXAMPLE 6: FORM INPUT
───────────────────────────────────────────────
<div style="--flex; --fd:column; --g:var(--sp-2); --my:var(--sp-4)">
  <label style="--fs:var(--fs-sm); --fw:var(--fw-medium); --c:var(--text-secondary)">
    Email
  </label>
  <input 
    type="email"
    style="--p:12px 16px; --fs:var(--fs-base); --bd:1px solid var(--gray-300); --rad:var(--radius-sm)"
  >
</div>

SCOPE: Form completo con tokens
═══════════════════════════════════════════════
*/

/* ============================================
   INTEGRATION WITH KLEF V2
   
   RATIONALE:
   V3 es una capa ADICIONAL sobre V2, no un reemplazo.
   Puedes usar V2 (classes) y V3 (variables) juntos.
   
   WORKFLOW:
   1. Usa V2 para componentes complejos reutilizables
   2. Usa V3 para composición rápida y one-offs
   3. Combina ambos según el contexto
   
   EXAMPLE:
   <div class="card" style="--p:var(--sp-6); --bg:linear-gradient(135deg, var(--blue), var(--purple))">
     <h3 class="card-title">Title</h3>
     <p class="card-description">Description</p>
   </div>
   
   ✓ .card viene de V2 (estructura base)
   ✓ Variables inline de V3 (personalización)
   ✓ Mejor de ambos mundos
   
   ============================================ */

/* ============================================
   FILOSOFÍA FINAL
   
   PRINCIPLE: Intención Persistente
   Este sistema documenta su propio propósito.
   Cada comentario reduce fricción futura.
   
   PRINCIPLE: Doble Lectura
   Un humano y una IA leen el mismo código
   y ambos entienden la intención.
   
   PRINCIPLE: Semántica sobre Ornamento
   --center comunica intención
   flex+align+justify comunica implementación
   
   PRINCIPLE: Amortización de Tokens
   El costo de escribir estos selectores se
   recupera con cada uso. Es inversión, no gasto.
   
   PRINCIPLE: Humildad Técnica
   No reinventamos CSS, lo hacemos más ergonómico.
   No competimos con Tailwind, servimos otro propósito.
   
   ────────────────────────────────────────
   
   Este sistema está diseñado para:
   ✓ Reducir fricción al escribir UI
   ✓ Facilitar co-desarrollo humano-IA
   ✓ Mantener intención persistente
   ✓ Escalar sin complejidad
   ✓ Sobrevivir a frameworks y modas
   
   El verdadero costo no son los tokens,
   es la pérdida de intención y ergonomía.
   
   ────────────────────────────────────────
   
   Version: 3.0.0
   License: MIT
   Author: Klef Design Team
   Updated: 2025
   Philosophy: Human–AI Co-Development
   
   ============================================ */