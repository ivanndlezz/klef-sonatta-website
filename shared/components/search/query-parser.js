/**
 * Query Parser - Parsea sintaxis key:value para búsqueda avanzada
 * Soporta: key:value, -key:value, "phrases", dates, negación
 */

(function (global) {
  "use strict";

  /**
   * Parsea un query string en componentes estructurados
   * @param {string} query - El query a parsear
   * @returns {Object} - { text, filters, exclude, errors }
   */
  function parseQuery(query) {
    if (!query || typeof query !== "string") {
      return {
        text: "",
        filters: {},
        exclude: [],
        errors: [],
      };
    }

    const result = {
      text: "",
      filters: {},
      exclude: [],
      errors: [],
    };

    // Normalizar: remover múltiples espacios
    query = query.trim().replace(/\s+/g, " ");

    // Expresiones regulares para parsing
    const patterns = {
      // Filtro con ключ:значение (con o sin -)
      filter: /^(-)?([a-zA-Z_][a-zA-Z0-9_]*):(.+)$/,
      // Fecha ISO: YYYY-MM-DD
      date: /^\d{4}-\d{2}-\d{2}$/,
      // Exclusión simple: -word
      exclusion: /^(-)([a-zA-Z_][a-zA-Z0-9_]*)$/,
    };

    // Tokenizar: separar comillas del resto
    const tokens = tokenizeQuery(query);

    // Procesar cada token
    let remainingText = [];

    tokens.forEach((token, index) => {
      // Verificar si es una frase entre comillas
      if (token.startsWith('"') && token.endsWith('"')) {
        const phrase = token.slice(1, -1);
        if (phrase) {
          remainingText.push(phrase);
        }
        return;
      }

      // Verificar si es una frase entrecomillada incompleta
      if (token.includes('"')) {
        const parts = token.split('"');
        parts.forEach((part, i) => {
          if (i % 2 === 0) {
            // Parte sin comillas, procesar
            if (part.trim()) {
              processToken(part.trim(), result, remainingText, patterns);
            }
          } else {
            // Parte entre comillas
            if (part) {
              remainingText.push(part);
            }
          }
        });
        return;
      }

      // Procesar token normal
      processToken(token, result, remainingText, patterns);
    });

    // Unir texto restante
    result.text = remainingText.join(" ").trim();

    return result;
  }

  /**
   * Tokeniza el query separando frases entre comillas
   */
  function tokenizeQuery(query) {
    const tokens = [];
    let current = "";
    let inQuote = false;
    let quoteChar = "";

    for (let i = 0; i < query.length; i++) {
      const char = query[i];

      if ((char === '"' || char === "'") && !inQuote) {
        if (current.trim()) {
          tokens.push(current.trim());
        }
        inQuote = true;
        quoteChar = char;
        current = char;
      } else if (char === quoteChar && inQuote) {
        current += char;
        tokens.push(current);
        current = "";
        inQuote = false;
        quoteChar = "";
      } else if (char === " " && !inQuote) {
        if (current.trim()) {
          tokens.push(current.trim());
        }
        current = "";
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      tokens.push(current.trim());
    }

    return tokens;
  }

  /**
   * Procesa un token individual
   */
  function processToken(token, result, remainingText, patterns) {
    // Verificar exclusión simple: -word
    const exclusionMatch = token.match(patterns.exclusion);
    if (exclusionMatch) {
      result.exclude.push(exclusionMatch[2].toLowerCase());
      return;
    }

    // Verificar filtro: -key:value o key:value
    const filterMatch = token.match(patterns.filter);
    if (filterMatch) {
      const isNegated = filterMatch[1] === "-";
      const key = filterMatch[2].toLowerCase();
      let value = filterMatch[3];

      // Si el valor contiene :, separar (para casos como author:is_client)
      if (value.includes(":")) {
        const subParts = value.split(":");
        value = subParts[0];
        const subValue = subParts.slice(1).join(":");
        if (subValue) {
          result.filters[value] = { value: subValue, negated: isNegated };
        }
      } else {
        // Validar fecha
        if (key === "after" || key === "before") {
          if (!patterns.date.test(value)) {
            result.errors.push(
              `Formato de fecha inválido para ${key}: ${value}. Usa YYYY-MM-DD`,
            );
            return;
          }
        }
        result.filters[key] = {
          value: value.toLowerCase(),
          negated: isNegated,
        };
      }
      return;
    }

    // Si no es filtro ni exclusión, es texto libre
    remainingText.push(token);
  }

  /**
   * Genera un query string desde un objeto de filtros
   * @param {Object} filters - Objeto de filtros
   * @param {string} text - Texto libre
   * @param {Array} exclude - Array de palabras a excluir
   * @returns {string} - Query string formateado
   */
  function buildQuery(filters, text, exclude = []) {
    const parts = [];

    // Añadir texto libre
    if (text) {
      parts.push(text);
    }

    // Añadir filtros
    Object.entries(filters).forEach(([key, { value, negated }]) => {
      const filterStr = negated ? `-${key}:${value}` : `${key}:${value}`;
      parts.push(filterStr);
    });

    // Añadir exclusiones
    exclude.forEach((word) => {
      parts.push(`-${word}`);
    });

    return parts.join(" ");
  }

  /**
   * Extrae claves de filtro de un query (para autocompletado)
   */
  function extractFilterKeys(query) {
    const keys = new Set();
    const regex = /([a-zA-Z_][a-zA-Z0-9_]*):/g;
    let match;

    while ((match = regex.exec(query)) !== null) {
      keys.add(match[1]);
    }

    return Array.from(keys);
  }

  /**
   * Detecta si el cursor está justo después de un key:
   * @param {string} query - Query completo
   * @param {number} cursorPos - Posición del cursor
   * @returns {Object|null} - { key, afterColon } o null
   */
  function detectFilterContext(query, cursorPos) {
    const textBeforeCursor = query.slice(0, cursorPos);

    // Buscar el último key: antes del cursor
    const match = textBeforeCursor.match(/([a-zA-Z_][a-zA-Z0-9_]*):\s*$/);

    if (match) {
      return {
        key: match[1],
        afterColon: true,
      };
    }

    // Buscar si estamos en medio de un filtro
    const partialMatch = textBeforeCursor.match(
      /([a-zA-Z_][a-zA-Z0-9_]*):([^:\s]*)$/,
    );
    if (partialMatch) {
      return {
        key: partialMatch[1],
        partialValue: partialMatch[2],
        afterColon: true,
      };
    }

    return null;
  }

  /**
   * Valida un query contra la configuración de filtros
   * @param {Object} parsed - Resultado de parseQuery
   * @param {Object} filterConfig - Configuración de filtros válidos
   * @returns {Array} - Lista de errores de validación
   */
  function validateFilters(parsed, filterConfig) {
    const errors = [];

    Object.entries(parsed.filters).forEach(([key, { value }]) => {
      // Normalizar claves alternativas (type -> t, category -> cat)
      const normalizedKey = normalizeFilterKey(key, filterConfig);

      if (!normalizedKey) {
        errors.push(`Filtro desconocido: ${key}`);
        return;
      }

      const config = filterConfig[normalizedKey];

      // Verificar si tiene valores permitidos
      if (config.values && config.values.length > 0) {
        if (!config.values.includes(value)) {
          errors.push(
            `Valor '${value}' no válido para ${key}. Valores permitidos: ${config.values.join(", ")}`,
          );
        }
      }
    });

    return errors;
  }

  /**
   * Normaliza una clave de filtro a su nombre canónico
   */
  function normalizeFilterKey(key, filterConfig) {
    for (const [canonicalKey, config] of Object.entries(filterConfig)) {
      if (canonicalKey === key) return canonicalKey;
      if (config.keys && config.keys.includes(key)) return canonicalKey;
    }
    return null;
  }

  // Exportar
  global.QueryParser = {
    parse: parseQuery,
    build: buildQuery,
    extractKeys: extractFilterKeys,
    detectContext: detectFilterContext,
    validate: validateFilters,
    normalizeKey: normalizeFilterKey,
  };
})(typeof window !== "undefined" ? window : global);
