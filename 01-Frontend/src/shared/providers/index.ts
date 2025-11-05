/**
 * ================================================================================================
 * PROVIDERS CENTRALIZADOS
 * ================================================================================================
 * 
 * Todos los React Context Providers de la aplicación consolidados en una ubicación.
 * Estructura limpia sin duplicación entre providers/ y context/
 */

// ===== PROVIDERS DE CONFIGURACIÓN Y TEMAS =====
export { AppConfigProvider, useAppConfig } from './AppConfigProvider';
export { LanguageProvider, useLanguage } from './LanguageProvider';
export { ThemeProvider, useTheme } from './ThemeProvider';

// ===== PROVIDERS DE SISTEMA =====
export { ErrorManagerProvider } from './ErrorManagerProvider';
export { NotificationProvider } from './NotificationProvider';

// ===== RE-EXPORTS DE TIPOS ÚTILES =====
// Si necesitamos exportar tipos específicos de los providers, se pueden agregar aquí

/**
 * ================================================================================================
 * ORDEN RECOMENDADO DE PROVIDERS EN App.tsx:
 * ================================================================================================
 * 
 * <ErrorManagerProvider>
 *   <NotificationProvider>
 *     <ThemeProvider>
 *       <LanguageProvider>
 *         <AppConfigProvider>
 *           // Resto de la aplicación
 *         </AppConfigProvider>
 *       </LanguageProvider>
 *     </ThemeProvider>
 *   </NotificationProvider>
 * </ErrorManagerProvider>
 */
