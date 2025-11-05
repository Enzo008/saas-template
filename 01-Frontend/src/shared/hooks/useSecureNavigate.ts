/**
 * Hook para navegación con encriptación automática de parámetros
 * 
 * ✅ MIDDLEWARE TRANSPARENTE:
 * - Encripta automáticamente el último segmento de URLs de edición
 * - Detecta patrones: /entity/edit/ID → /entity/edit/ENCRYPTED_ID
 * - No requiere cambios en el código de navegación existente
 */

import { useNavigate, NavigateOptions } from 'react-router-dom';
import { useCallback } from 'react';
import { encryptUrlParam } from '@/shared/utils/urlEncryption';

/**
 * Hook que reemplaza useNavigate con encriptación automática
 * 
 * @example
 * const navigate = useSecureNavigate();
 * 
 * // Código existente funciona igual:
 * navigate(`/user/edit/2025-000003`);
 * // URL resultante: /user/edit/U2FsdGVkX1...
 */
export const useSecureNavigate = () => {
  const navigate = useNavigate();
  
  /**
   * Navega a una ruta encriptando automáticamente el ID
   */
  const secureNavigate = useCallback((to: string | number, options?: NavigateOptions) => {
    // Si es un número (delta de navegación), usar directamente
    if (typeof to === 'number') {
      navigate(to);
      return;
    }
    
    // Encriptar el ID en la URL
    const encryptedUrl = encryptUrlPath(to);
    navigate(encryptedUrl, options);
  }, [navigate]);
  
  return secureNavigate;
};

/**
 * Encripta el ID en rutas de navegación
 * Detecta automáticamente el patrón /action/ID y encripta el ID
 * 
 * @example
 * encryptUrlPath('/user/edit/2025-000003')
 * // Retorna: '/user/edit/U2FsdGVkX1...'
 * 
 * encryptUrlPath('/role/edit/04')
 * // Retorna: '/role/edit/U2FsdGVkX1...'
 */
export const encryptUrlPath = (path: string): string => {
  // Separar query string y hash si existen
  const parts = path.split(/[?#]/);
  const basePath = parts[0] || '';
  const queryAndHash = parts.length > 1 ? path.substring(basePath.length) : '';
  
  // Dividir la ruta en segmentos
  const segments = basePath.split('/').filter(s => s);
  
  // Encriptar el último segmento si viene después de edit, view, delete, etc.
  if (segments.length >= 2) {
    const lastSegment = segments[segments.length - 1];
    const secondToLast = segments[segments.length - 2];
    
    // Acciones que requieren ID
    const actionsWithId = ['edit', 'view', 'delete', 'detail', 'details'];
    
    if (lastSegment && secondToLast && actionsWithId.includes(secondToLast)) {
      // ✅ Encriptar el ID (último segmento)
      segments[segments.length - 1] = encryptUrlParam(lastSegment);
    }
  }
  
  return '/' + segments.join('/') + queryAndHash;
};

/**
 * Hook con métodos helper para navegación común
 */
export const useSecureNavigation = () => {
  const navigate = useSecureNavigate();
  
  return {
    navigate,
    
    /**
     * Navega a la página de edición con ID encriptado
     */
    navigateToEdit: (basePath: string, id: string, options?: NavigateOptions) => {
      const encryptedId = encryptUrlParam(id);
      navigate(`${basePath}/edit/${encryptedId}`, options);
    },
    
    /**
     * Navega a la página de creación
     */
    navigateToCreate: (basePath: string, options?: NavigateOptions) => {
      navigate(`${basePath}/create`, options);
    },
    
    /**
     * Navega a la página de vista/detalle con ID encriptado
     */
    navigateToView: (basePath: string, id: string, options?: NavigateOptions) => {
      const encryptedId = encryptUrlParam(id);
      navigate(`${basePath}/view/${encryptedId}`, options);
    },
    
    /**
     * Navega a la página de lista
     */
    navigateToList: (basePath: string, options?: NavigateOptions) => {
      navigate(basePath, options);
    }
  };
};
