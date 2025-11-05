/**
 * Utilidad para encriptar/desencriptar parámetros de URL
 * Proporciona seguridad visual ocultando IDs y parámetros sensibles
 */

import CryptoJS from 'crypto-js';

// Clave secreta para encriptación (en producción debería estar en variable de entorno)
const SECRET_KEY = import.meta.env['VITE_URL_ENCRYPTION_KEY'] || 'saas-template-secret-key';

/**
 * Encripta un valor para usar en URL
 * Convierte el resultado a formato URL-safe (base64url)
 */
export const encryptUrlParam = (value: string): string => {
  if (!value) return '';
  
  try {
    // Encriptar con AES
    const encrypted = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
    
    // Convertir a base64url (URL-safe)
    const urlSafe = btoa(encrypted)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    return urlSafe;
  } catch (error) {
    console.error('Error encrypting URL param:', error);
    return value; // Fallback al valor original
  }
};

/**
 * Desencripta un parámetro de URL
 * Convierte de base64url a base64 normal antes de desencriptar
 */
export const decryptUrlParam = (encryptedValue: string): string => {
  if (!encryptedValue) return '';
  
  try {
    // Revertir base64url a base64 normal
    let base64 = encryptedValue
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Agregar padding si es necesario
    while (base64.length % 4) {
      base64 += '=';
    }
    
    // Decodificar base64
    const ciphertext = atob(base64);
    
    // Desencriptar con AES
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    return decrypted || encryptedValue; // Fallback si falla
  } catch (error) {
    console.error('Error decrypting URL param:', error);
    return encryptedValue; // Fallback al valor encriptado
  }
};

/**
 * Encripta todos los parámetros de un objeto
 */
export const encryptUrlParams = (params: Record<string, string>): Record<string, string> => {
  const encrypted: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(params)) {
    encrypted[key] = encryptUrlParam(value);
  }
  
  return encrypted;
};

/**
 * Desencripta todos los parámetros de un objeto
 */
export const decryptUrlParams = (params: Record<string, string | undefined>): Record<string, string> => {
  const decrypted: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      decrypted[key] = decryptUrlParam(value);
    }
  }
  
  return decrypted;
};
