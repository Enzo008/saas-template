/**
 * CRUD hook for positions - configuración automática para datos maestros
 */
import { createCrudHook } from '@/shared/hooks';
import { positionService } from '../services/positionService';

/**
 * CRUD hook for positions con configuración optimizada
 * - Tipo: 'static' (datos maestros que cambian poco)
 * - Cache: Largo tiempo de vida para mejor rendimiento
 * - Optimistic updates: habilitado para mejor UX
 * - Mode: modal by default
 */
export const usePositionCrud = createCrudHook({
    entityName: 'Position',
    service: positionService,
    preset: 'STATIC'
});