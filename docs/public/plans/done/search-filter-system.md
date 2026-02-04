# Caso de estudio: Sintaxis de búsqueda tipo `key:value` (cuasi-estándar)

## Resumen ejecutivo

En muchas plataformas modernas (Google Drive, Gmail, GCP, GitHub, Notion, Slack, etc.) se repite un patrón de búsqueda avanzada basado en texto que mezcla:

- **términos libres** (texto normal)
- **filtros estructurados** (tokens tipo `key:value`)
- **operadores lógicos** (implícitos o explícitos)
- **operadores de fecha** (`after:`, `before:`)

Ejemplo típico:

```
 type:document test after:2026-01-28
```

Aunque se percibe como “un estándar”, en realidad es un **estándar de facto**: no está formalizado por un organismo único, pero se ha convertido en un patrón repetido por su utilidad.

---

## 1) Qué es este “cuasi-estándar”

### 1.1 Definición práctica

Es una **sintaxis de consulta (query syntax)** donde el usuario escribe en un solo campo de texto:

- palabras normales (búsqueda full-text)
- filtros con formato `clave:valor`

Esto permite construir consultas complejas sin interfaces llenas de dropdowns.

### 1.2 Cómo se llama en la industria

No existe un nombre único oficial. Los términos más comunes son:

- **Search operators** (operadores de búsqueda)
- **Advanced query syntax**
- **Query language** (cuando crece mucho)
- **Filter tokens**
- **Text-based filtering**

---

## 2) Por qué se volvió tan común

### 2.1 Beneficios clave

Este patrón ganó tracción por 5 razones:

1. **Velocidad**: escribir es más rápido que usar UI.
2. **Aprendizaje progresivo**: se puede empezar con texto normal y luego usar filtros.
3. **Compatibilidad con autocompletado**: el sistema puede sugerir claves/valores.
4. **Escalabilidad funcional**: agregar un filtro nuevo no obliga a rediseñar toda la interfaz.
5. **Portabilidad mental**: si aprendes `from:` en Gmail, entiendes `owner:` en Drive.

### 2.2 Por qué Google lo impulsó

Google consolidó este estilo por años en:

- **Google Search** (operadores clásicos)
- **Gmail** (`from:`, `to:`, `label:`, `has:`)
- **Drive** (`type:`, `owner:`, `is:starred`)
- **GCP** (Logs Explorer con sintaxis propia)

Esto creó un efecto cultural: los usuarios se acostumbraron y lo esperan.

---

## 3) Anatomía del formato

### 3.1 Consulta híbrida

Una query suele tener 3 capas:

- **Texto libre**: `test`, `invoice`, `Juan`
- **Filtros**: `type:pdf`, `owner:me`
- **Operadores**: `AND`, `OR`, `-` (negación)

Ejemplo:

```
(type:pdf OR type:doc) invoice -draft after:2025-01-01
```

### 3.2 Componentes típicos

#### A) `key:value`

- `type:document`
- `status:active`
- `tag:marketing`

#### B) booleanos tipo `is:`

- `is:starred`
- `is:archived`
- `is:public`

#### C) fechas

- `after:2026-01-28`
- `before:2026-02-01`

#### D) negación

- `-tag:spam`
- `-draft`

#### E) comillas

- `"cabo san lucas"`

---

## 4) Variantes que verás en plataformas

### 4.1 Estilo “Google clásico”

- `from:`, `to:`, `subject:`
- `before:`, `after:`
- `has:attachment`

### 4.2 Estilo “GitHub / Dev tools”

- `is:issue`, `is:pr`
- `label:bug`
- `author:ivan`

### 4.3 Estilo “Notion / Slack”

- `in:#general`
- `from:@ivan`
- `has:link`

### 4.4 Estilo “Cloud / observabilidad”

Aquí se vuelve más formal y cercano a un lenguaje:

- GCP Logs Explorer
- Datadog
- Splunk
- Kibana

Normalmente ya incluye:

- paréntesis
- comparadores (`=`, `!=`, `>=`)
- campos anidados

---

## 5) Nivel de “estandarización” real

### 5.1 Qué cosas sí son consistentes

A través de muchas plataformas, se repite:

- `key:value`
- comillas para frases
- `-` para excluir
- `after:` / `before:` para fechas

### 5.2 Qué cosas cambian

- si el espacio implica `AND` o `OR`
- si `OR` se escribe en mayúsculas
- si soporta paréntesis
- si soporta comparadores numéricos
- si soporta campos anidados (`user.name:`)

---

## 6) Caso de estudio (desglose de tu ejemplo)

Consulta:

```
 type:document test after:2026-01-28
```

Interpretación típica:

- `type:document` → filtra por documentos (no PDF, no imágenes)
- `test` → texto libre que debe aparecer en nombre o contenido
- `after:2026-01-28` → fecha de creación/modificación posterior a ese día

Traducción conceptual a filtros:

- type = document
- full_text contains "test"
- date > 2026-01-28

---

## 7) Modelo mental recomendado (para diseñarlo bien)

### 7.1 Lo importante

Este sistema debe funcionar bien en 3 niveles:

1. **Usuario casual**: escribe solo texto y encuentra cosas.
2. **Usuario intermedio**: usa `type:`, `tag:`, `after:`.
3. **Usuario pro**: combina `OR`, negaciones, comillas y paréntesis.

### 7.2 Regla de oro

**No debes obligar al usuario a aprenderlo.**

Debe ser:

- opcional
- incremental
- sugerido por autocompletado

---

## 8) Buenas prácticas de UX

### 8.1 Autocompletado

Cuando el usuario escribe:

- `type:` → sugerir `document`, `pdf`, `image`
- `status:` → sugerir `active`, `archived`

### 8.2 Chips visuales (opcional)

Muchos sistemas convierten tokens en chips:

- `type:document` se vuelve una etiqueta
- `after:2026-01-28` se vuelve un filtro

Pero sin romper la posibilidad de escribir texto.

### 8.3 Mensajes de error útiles

Si el usuario escribe:

- `after:ayer`

El sistema debe decir:

- “Formato inválido, usa YYYY-MM-DD”

---

## 9) Diseño técnico (implementación)

### 9.1 Flujo típico

1. El usuario escribe una query.
2. Un parser identifica tokens.
3. Se separan filtros vs texto.
4. Se valida el tipo de dato.
5. Se genera una consulta interna.

### 9.2 Ejemplo de salida interna

Entrada:

```
 type:document "cabo san lucas" -draft after:2026-01-28
```

Salida interna:

```json
{
  "text": "cabo san lucas",
  "exclude_text": ["draft"],
  "filters": {
    "type": "document",
    "after": "2026-01-28"
  }
}
```

---

## 10) Mini-especificación propuesta (para tu proyecto)

Si quieres implementar este patrón en tu producto, esta sería una base sólida:

### 10.1 Gramática mínima

- Espacio = `AND`
- `key:value`
- comillas para frases
- `-token` para excluir
- `OR` opcional (solo si quieres)

### 10.2 Lista de filtros recomendada

- `type:` (document, link, profile, product)
- `status:` (active, archived)
- `tag:` (string)
- `after:` (YYYY-MM-DD)
- `before:` (YYYY-MM-DD)
- `owner:` (me, user_id)

---

## 11) Conclusión

El formato `key:value` no es un estándar formal, pero es uno de los **patrones de búsqueda avanzada más consolidados** del software moderno.

Se volvió un “lenguaje universal informal” porque:

- es rápido
- es escalable
- es fácil de aprender
- funciona bien con autocompletado

Y por eso lo ves repetido en Google Drive, GCP y muchas otras plataformas.
