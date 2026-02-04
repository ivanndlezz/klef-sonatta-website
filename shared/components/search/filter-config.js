/**
 * Filter Configuration - Define los filtros soportados para búsqueda
 */

(function (global) {
  "use strict";

  /**
   * Configuración de filtros disponibles
   * keys: nombres alternativos aceptados
   * values: valores permitidos (vacío = cualquier valor)
   * type: tipo de validación especial
   */
  const FILTER_CONFIG = {
    type: {
      keys: ["type", "t"],
      label: "Tipo",
      description: "Filtrar por tipo de contenido",
      values: ["page", "blog", "portfolio", "post", "document"],
      placeholder: "page | blog | portfolio",
      examples: ["type:portfolio", "t:blog"],
    },
    category: {
      keys: ["category", "cat", "c"],
      label: "Categoría",
      description: "Filtrar por categoría",
      values: [], // Se llena dinámicamente desde GraphQL
      placeholder: "marketing, branding, web...",
      examples: ["category:marketing", "cat:branding"],
    },
    tag: {
      keys: ["tag"],
      label: "Etiqueta",
      description: "Filtrar por etiqueta",
      values: [],
      placeholder: "标签名称",
      examples: ["tag:diseño", "tag:web"],
    },
    author: {
      keys: ["author", "by", "owner"],
      label: "Autor",
      description: "Filtrar por autor",
      values: ["me", "klef"],
      placeholder: "nombre de autor",
      examples: ["author:klef", "by:me"],
      special: {
        is_client: {
          label: "Proyectos de Clientes",
          description: "Solo proyectos de clientes",
        },
      },
    },
    after: {
      keys: ["after"],
      label: "Después de",
      description: "Contenido posterior a esta fecha",
      type: "date",
      format: "YYYY-MM-DD",
      placeholder: "2024-01-01",
      examples: ["after:2024-01-01", "after:2023-12-01"],
    },
    before: {
      keys: ["before"],
      label: "Antes de",
      description: "Contenido anterior a esta fecha",
      type: "date",
      format: "YYYY-MM-DD",
      placeholder: "2024-12-31",
      examples: ["before:2024-12-31", "before:2024-06-01"],
    },
    status: {
      keys: ["status", "state"],
      label: "Estado",
      description: "Filtrar por estado",
      values: ["published", "draft", "archived", "pending", "active"],
      placeholder: "published | draft | archived",
      examples: ["status:published", "state:draft"],
    },
    sort: {
      keys: ["sort", "order"],
      label: "Orden",
      description: "Ordenar resultados",
      values: ["date", "relevance", "title", "alpha"],
      placeholder: "date | relevance | title",
      examples: ["sort:date", "sort:relevance"],
    },
  };

  /**
   * Obtiene la clave canónica desde una clave alternativa
   */
  function getCanonicalKey(key) {
    for (const [canonical, config] of Object.entries(FILTER_CONFIG)) {
      if (canonical === key) return canonical;
      if (config.keys && config.keys.includes(key)) return canonical;
    }
    return null;
  }

  /**
   * Obtiene la configuración de un filtro
   */
  function getFilterConfig(key) {
    const canonical = getCanonicalKey(key);
    return canonical ? FILTER_CONFIG[canonical] : null;
  }

  /**
   * Obtiene todas las claves de filtro válidas
   */
  function getFilterKeys() {
    return Object.keys(FILTER_CONFIG);
  }

  /**
   * Obtiene los valores permitidos para un filtro
   */
  function getFilterValues(key) {
    const config = getFilterConfig(key);
    return config ? config.values : [];
  }

  /**
   * Obtiene ejemplos de uso para un filtro
   */
  function getFilterExamples(key) {
    const config = getFilterConfig(key);
    return config ? config.examples : [];
  }

  /**
   * Obtiene la configuración de ayuda para todos los filtros
   */
  function getAllFilterHelp() {
    return Object.entries(FILTER_CONFIG).map(([key, config]) => ({
      key,
      label: config.label,
      description: config.description,
      values: config.values,
      examples: config.examples,
    }));
  }

  /**
   * Obtiene sugerencias de autocompletado basadas en el prefijo
   */
  function getSuggestions(prefix) {
    const suggestions = [];
    const lowerPrefix = prefix.toLowerCase();

    // Buscar claves de filtro
    Object.entries(FILTER_CONFIG).forEach(([key, config]) => {
      // Incluir clave canónica
      if (key.startsWith(lowerPrefix)) {
        suggestions.push({
          type: "filter-key",
          value: `${key}:`,
          display: `${key}:`,
          description: config.description,
        });
      }
      // Incluir claves alternativas
      if (config.keys) {
        config.keys.forEach((altKey) => {
          if (altKey.startsWith(lowerPrefix) && altKey !== key) {
            suggestions.push({
              type: "filter-key",
              value: `${altKey}:`,
              display: `${altKey}:`,
              description: config.description,
            });
          }
        });
      }
    });

    return suggestions.slice(0, 10); // Limitar a 10 sugerencias
  }

  /**
   * Obtiene valores de autocompletado para una clave específica
   */
  function getValueSuggestions(key, prefix) {
    const config = getFilterConfig(key);
    if (!config) return [];

    const lowerPrefix = prefix.toLowerCase();
    const values = config.values || [];

    // Combinar valores estáticos con especiales
    let allValues = [...values];
    if (config.special) {
      Object.keys(config.special).forEach((specialKey) => {
        allValues.push(specialKey);
      });
    }

    return allValues
      .filter((v) => v.toLowerCase().startsWith(lowerPrefix))
      .map((value) => {
        let description = "";
        if (config.special && config.special[value]) {
          description = config.special[value].description;
        }
        return {
          type: "filter-value",
          value,
          display: value,
          description,
        };
      });
  }

  /**
   * Obtiene ayuda contextual basada en el query actual
   */
  function getContextualHelp(query) {
    const help = [];

    // Si no hay nada escrito, mostrar ayuda general
    if (!query.trim()) {
      help.push({
        title: "Búsqueda con filtros",
        content: "Usa filtros como type:portfolio para refinar resultados",
      });
      help.push({
        title: "Filtros disponibles",
        items: Object.entries(FILTER_CONFIG).map(
          ([key, config]) => `${key}: ${config.description}`,
        ),
      });
      return help;
    }

    // Si el query contiene errores conocidos, sugerir correcciones
    const parseResult =
      typeof global.QueryParser !== "undefined"
        ? global.QueryParser.parse(query)
        : null;

    if (parseResult && parseResult.errors && parseResult.errors.length > 0) {
      help.push({
        title: "Errores detectados",
        items: parseResult.errors,
      });
    }

    return help;
  }

  // Exportar
  global.FilterConfig = {
    config: FILTER_CONFIG,
    getCanonicalKey,
    getFilterConfig,
    getFilterKeys,
    getFilterValues,
    getFilterExamples,
    getAllFilterHelp,
    getSuggestions,
    getValueSuggestions,
    getContextualHelp,
  };
})(typeof window !== "undefined" ? window : global);
