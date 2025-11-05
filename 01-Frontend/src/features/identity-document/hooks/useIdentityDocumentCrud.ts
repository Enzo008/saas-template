/**
 * Hook CRUD para documentos de identidad - configuración automática para datos maestros
 */
import { createCrudHook } from '@/shared/hooks';
import { identityDocumentService } from '../services/identityDocumentService';

/**
 * Hook CRUD para documentos de identidad con configuración automática
 * - Tipo: 'realtime' (datos en tiempo real)
 * - Cache: Sin cache
 * - Optimistic updates: deshabilitado
 * - Modo: página por defecto
 */
export const useIdentityDocumentCrud = createCrudHook({
    entityName: 'IdentityDocument',
    service: identityDocumentService,
    preset: 'REALTIME'
});