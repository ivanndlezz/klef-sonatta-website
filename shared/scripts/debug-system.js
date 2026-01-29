// ============================================================================
// DEBUG SYSTEM
// ============================================================================

const DEBUG = {
    enabled: false,
    levels: {
        INFO: { color: "#2196F3", emoji: "ℹ️", priority: 1 },
        SUCCESS: { color: "#4CAF50", emoji: "✅", priority: 2 },
        WARNING: { color: "#FF9800", emoji: "⚠️", priority: 3 },
        ERROR: { color: "#F44336", emoji: "❌", priority: 4 },
        DEBUG: { color: "#9C27B0", emoji: "🔍", priority: 0 },
    },
    minPriority: 0, // Solo muestra mensajes con prioridad >= a este valor
    showTimestamp: true,
    showStackTrace: false,
};

// Función principal de debugging
function debug(id, data, level = "DEBUG") {
    if (!DEBUG.enabled) return;

    const levelConfig = DEBUG.levels[level] || DEBUG.levels.DEBUG;

    // Filtrar por prioridad
    if (levelConfig.priority < DEBUG.minPriority) return;

    // Construir mensaje
    const timestamp = DEBUG.showTimestamp
        ? `[${new Date().toLocaleTimeString()}]`
        : "";
    const prefix = `${levelConfig.emoji} ${timestamp} [${id}]`;

    // Estilo para el navegador
    const style = `color: ${levelConfig.color}; font-weight: bold;`;

    // Detectar si data es un objeto
    if (typeof data === "object" && data !== null) {
        console.groupCollapsed(`%c${prefix}`, style);
        console.log(data);
        if (DEBUG.showStackTrace) {
            console.trace("Stack trace:");
        }
        console.groupEnd();
    } else {
        console.log(`%c${prefix}`, style, data);
    }

    return { id, data, level, timestamp: new Date() };
}

// Funciones auxiliares para cada nivel
const logger = {
    info: (id, data) => debug(id, data, "INFO"),
    success: (id, data) => debug(id, data, "SUCCESS"),
    warn: (id, data) => debug(id, data, "WARNING"),
    error: (id, data) => debug(id, data, "ERROR"),
    debug: (id, data) => debug(id, data, "DEBUG"),
};

// Exportar para uso global
window.logger = logger;
window.DEBUG = DEBUG;
