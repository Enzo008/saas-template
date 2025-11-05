/**
 * Hook para manejar parámetros de URL encriptados automáticamente
 * Desencripta todos los parámetros de forma transparente
 * 
 * ✅ MIDDLEWARE TRANSPARENTE:
 * - Desencripta automáticamente el parámetro 'id' de la URL
 * - Todo el resto del código funciona igual (parseo de IDs compuestos, etc.)
 * - No requiere cambios en useCrud ni en la lógica existente
 */

import { useParams } from 'react-router-dom';
import { decryptUrlParam } from '@/shared/utils/urlEncryption';
import { useMemo } from 'react';

/**
 * Hook que reemplaza useParams de react-router-dom
 * Desencripta automáticamente el parámetro 'id' de URL
 * 
 * @example
 * // URL: /user/edit/U2FsdGVkX1...
 * const { id } = useEncryptedParams();
 * // id = "2025-000003" (desencriptado)
 * 
 * // El resto del código funciona igual:
 * const parts = id.split('-'); // ["2025", "000003"]
 */
export const useEncryptedParams = <T extends Record<string, string | undefined> = Record<string, string | undefined>>(): T => {
  const encryptedParams = useParams();
  
  // Desencriptar solo el parámetro 'id' (el que usamos para navegación)
  const decryptedParams = useMemo(() => {
    const decrypted: Record<string, string | undefined> = {};
    
    for (const [key, value] of Object.entries(encryptedParams)) {
      if (value && key === 'id') {
        // ✅ Desencriptar solo el parámetro 'id'
        const decryptedValue = decryptUrlParam(value);
        decrypted[key] = decryptedValue;
      } else {
        // Otros parámetros se pasan sin cambios
        decrypted[key] = value;
      }
    }
    
    return decrypted as T;
  }, [encryptedParams]);
  
  return decryptedParams;
};

/**
 * Hook que devuelve tanto los parámetros encriptados como desencriptados
 * Útil si necesitas acceder a ambas versiones
 */
export const useEncryptedParamsWithOriginal = <T extends Record<string, string | undefined> = Record<string, string | undefined>>() => {
  const encryptedParams = useParams();
  const decryptedParams = useEncryptedParams<T>();
  
  return {
    encrypted: encryptedParams,
    decrypted: decryptedParams,
    // Alias para facilitar uso
    params: decryptedParams
  };
};
