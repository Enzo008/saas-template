/**
 * Configuración global de la aplicación
 * 
 * Este archivo centraliza las configuraciones principales de la app
 * para facilitar el cambio entre diferentes modos de operación
 */

// ==========================================
// CONFIGURACIÓN DE AUTENTICACIÓN
// ==========================================

/**
 * Habilitar/Deshabilitar sistema de autenticación
 * 
 * - `true`: Requiere login, maneja sesiones, tokens JWT, etc.
 * - `false`: Bypass completo del sistema de auth - útil para:
 *   * Prototipos rápidos
 *   * Apps frontend-only (expense manager, todo list, etc.)
 *   * Desarrollo sin backend
 *   * Demos y pruebas
 * 
 * @default true
 */
export const AUTH_ENABLED = true;

/**
 * Configuración para modo sin autenticación
 * Estos valores se usan cuando AUTH_ENABLED = false
 * 
 * NOTA: Los tipos se definen como 'any' para evitar dependencias circulares
 * En AuthBypass.tsx se castean a los tipos correctos
 */
export const NO_AUTH_CONFIG = {
  /**
   * Usuario mock para modo sin autenticación
   * Se usa para poblar el contexto de usuario sin hacer login
   */
  mockUser: {
    useYea: '2025',
    useCod: '1',
    useNam: 'Usuario',
    useLas: 'Demo',
    useSta: 'A',
    useEma: 'demo@demo.com',
    usePas: '',
    useRol: '1',
    useEst: 'A',
    useFot: null,
    useTel: null,
    useDni: null,
    useFecNac: null,
    useDirec: null,
    useCiu: null,
    usePai: null,
    useGen: null,
    useFecReg: new Date().toISOString(),
    useFecMod: new Date().toISOString(),
    useUsuReg: 'SYSTEM',
    useUsuMod: 'SYSTEM'
  }
};

// ==========================================
// CONFIGURACIÓN DE DESARROLLO
// ==========================================

/**
 * Habilitar modo de desarrollo
 * Muestra información adicional en consola, debug tools, etc.
 */
export const DEV_MODE = import.meta.env.DEV;

/**
 * Mostrar logs de navegación y breadcrumbs
 */
export const DEBUG_NAVIGATION = false;

/**
 * Mostrar logs de autenticación
 */
export const DEBUG_AUTH = false;

// ==========================================
// CONFIGURACIÓN DE UI
// ==========================================

/**
 * Configuración del sidebar
 */
export const SIDEBAR_CONFIG = {
  /**
   * Estado inicial del sidebar (colapsado o expandido)
   */
  defaultCollapsed: false,

  /**
   * Ancho del sidebar cuando está expandido (en píxeles)
   */
  expandedWidth: 280,

  /**
   * Ancho del sidebar cuando está colapsado (en píxeles)
   */
  collapsedWidth: 64
};

/**
 * Configuración de breadcrumbs
 */
export const BREADCRUMB_CONFIG = {
  /**
   * Mostrar breadcrumbs en el header
   */
  enabled: true,

  /**
   * Mostrar íconos en los breadcrumbs
   */
  showIcons: false,

  /**
   * Separador entre breadcrumbs
   */
  separator: '>' // Puede ser '>', '/', '•', etc.
};

// ==========================================
// CONFIGURACIÓN DE NOTIFICACIONES
// ==========================================

/**
 * Configuración de toasts/notificaciones
 */
export const NOTIFICATION_CONFIG = {
  /**
   * Posición de las notificaciones
   */
  position: 'top-right' as const,

  /**
   * Tiempo de auto-cierre en milisegundos
   */
  autoClose: 5000,

  /**
   * Mostrar barra de progreso
   */
  hideProgressBar: false
};

// ==========================================
// CONFIGURACIÓN DE RUTAS
// ==========================================

/**
 * Ruta por defecto después del login
 */
export const DEFAULT_ROUTE_AFTER_LOGIN = '/';

/**
 * Ruta de login
 */
export const LOGIN_ROUTE = '/login';

/**
 * Ruta de redirección cuando no está autenticado
 */
export const REDIRECT_WHEN_NOT_AUTHENTICATED = LOGIN_ROUTE;

// ==========================================
// CONFIGURACIÓN DE API
// ==========================================

/**
 * URL base de la API
 * Se obtiene de las variables de entorno
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Timeout para peticiones HTTP (en milisegundos)
 */
export const API_TIMEOUT = 30000;

// ==========================================
// EXPORTACIÓN POR DEFECTO
// ==========================================

/**
 * Configuración completa de la aplicación
 */
export const appConfig = {
  auth: {
    enabled: AUTH_ENABLED,
    noAuthConfig: NO_AUTH_CONFIG,
    defaultRoute: DEFAULT_ROUTE_AFTER_LOGIN,
    loginRoute: LOGIN_ROUTE,
    redirectWhenNotAuthenticated: REDIRECT_WHEN_NOT_AUTHENTICATED
  },
  dev: {
    mode: DEV_MODE,
    debugNavigation: DEBUG_NAVIGATION,
    debugAuth: DEBUG_AUTH
  },
  ui: {
    sidebar: SIDEBAR_CONFIG,
    breadcrumbs: BREADCRUMB_CONFIG,
    notifications: NOTIFICATION_CONFIG
  },
  api: {
    baseUrl: API_BASE_URL,
    timeout: API_TIMEOUT
  }
} as const;

export default appConfig;
