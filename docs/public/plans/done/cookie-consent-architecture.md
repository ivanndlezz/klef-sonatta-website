# Arquitectura del Sistema de Consentimiento de Cookies

## Resumen

El sistema de consentimiento de cookies de Klef Agency implementa un modelo modular y escalable integrado con el Dynamic Island, utilizando un modelo de datos estructurado y configuración centralizada de scripts.

## Componentes Principales

### 1. Modelo de Datos (`localStorage`)

Se utiliza una clave única `klef_cookie_consent` con un objeto JSON estructurado:

```json
{
  "version": 1,
  "timestamp": "2026-01-21T22:44:00Z",
  "categories": {
    "essential": true,
    "analytics": true,
    "marketing": false,
    "functional": false
  }
}
```

- **Versionado**: Para migraciones futuras
- **Timestamp**: Auditoría y expiración opcional
- **Categorías**: Control granular por tipo de cookie

### 2. Configuración de Scripts (`shared/utilities/cookies/cookies.js`)

Archivo dedicado con configuración modular de scripts por categoría. Incluye ejemplos comentados y un mock script para testing:

```javascript
// Ejemplos comentados de Google Analytics, Facebook Pixel, HubSpot, etc.

const KLEF_COOKIE_SCRIPTS = {
  analytics: [
    // Scripts de analytics aquí
  ],
  marketing: [
    // Scripts de marketing aquí
  ],
  functional: [
    {
      id: "mock_cookie_script",
      load() {
        console.log(
          "🍪 Mock cookie script loaded - replace with real implementation",
        );
      },
    },
  ],
};
```

### 3. API Centralizada (`shared/utilities/cookie-consent.js`)

Funciones mínimas para manejo del consentimiento:

- `getCookieConsent()`: Recupera el consentimiento actual
- `setCookieConsent(categories)`: Guarda nuevas preferencias
- `loadScriptsForConsentedCategories(consent)`: Carga scripts según consentimiento

### 4. Integración con Dynamic Island (`shared/components/dynamic-island/dynamic-island.js`)

- `initCookieConsentUI()`: Función principal que inicializa el flujo
- `showCookieConsent()`: Muestra el toast con opciones
- `checkAndShowCookieConsent()`: Verifica si mostrar el consentimiento

## Flujo de Funcionamiento

1. **Inicialización**: `initCookieConsentUI()` verifica consentimiento existente
2. **Carga automática**: Si hay consentimiento, carga scripts automáticamente
3. **Mostrar UI**: Si no hay consentimiento, muestra Dynamic Island con opciones
4. **Guardar preferencias**: Usuario selecciona opción, se guarda en localStorage
5. **Cargar scripts**: Scripts se cargan según categorías consentidas

## Categorías Implementadas

- **essential**: Siempre activas (navegación, funcionalidad básica)
- **analytics**: Simple Analytics, Microsoft Clarity
- **marketing**: Calendly
- **functional**: Reservado para futuras implementaciones

## Ventajas

- **Modular**: Scripts separados por categorías
- **Auditable**: Código nativo, sin strings HTML
- **Escalable**: Fácil agregar nuevas categorías/scripts
- **Conforme**: Modelo de datos estructurado para compliance
- **UX**: Integración seamless con Dynamic Island

## Consideraciones Técnicas

- Error handling en carga de scripts con try/catch
- Versionado del modelo de datos para migraciones
- Timestamp para auditoría y expiración opcional
- Futuro: Panel avanzado de configuración con toggles individuales

## Archivos Relacionados

- `shared/utilities/cookies/cookies.js`: Configuración de scripts
- `shared/utilities/cookies/cookie-consent.js`: API centralizada
- `shared/components/dynamic-island/dynamic-island.js`: Integración UI
- `index.html`: Inicialización del sistema
