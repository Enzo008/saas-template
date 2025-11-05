/**
 * CRUD hook for repository - configuración automática para datos de referencia
 */
import { createCrudHook } from '@/shared/hooks';
import { repositoryService } from '../services/repositoryService';

/**
 * CRUD hook for repository con configuración automática
 * - Tipo: 'realtime' (datos en tiempo real)
 * - Cache: Sin cache
 * - Optimistic updates: deshabilitado
 * - Modo: página por defecto
 */
export const useRepositoryCrud = createCrudHook({
    entityName: 'Repository',
    service: repositoryService,
    preset: 'REALTIME'
});