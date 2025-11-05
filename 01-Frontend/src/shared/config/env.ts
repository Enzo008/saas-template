/**
 * Configuración de variables de entorno
 * Implementación simple y directa sin over-engineering
 */

// Validación básica de variables críticas
const validateRequired = (value: string | undefined, name: string): string => {
  if (!value || value.trim() === '') {
    throw new Error(`❌ Variable de entorno requerida: ${name}`);
  }
  return value.trim();
};

// Configuración exportada
export const env = {
  // Variables críticas (validadas)
  apiBaseUrl: validateRequired(import.meta.env.VITE_API_BASE_URL, 'VITE_API_BASE_URL'),
  appEnv: validateRequired(import.meta.env.VITE_APP_ENV, 'VITE_APP_ENV'),
  
  // Variables opcionales con defaults
  appName: import.meta.env.VITE_APP_NAME || 'Demo App',
  
  // Helpers básicos del entorno
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Variables Vite nativas
  nodeEnv: import.meta.env.NODE_ENV,
} as const;

// Debug info solo en desarrollo
if (env.isDevelopment) {
  console.log('🔧 Env Config:', {
    apiBaseUrl: env.apiBaseUrl,
    appEnv: env.appEnv,
    appName: env.appName
  });
}