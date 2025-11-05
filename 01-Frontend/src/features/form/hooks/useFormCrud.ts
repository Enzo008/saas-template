/**
 * Hook CRUD para formularios dinámicos - configuración automática para datos transaccionales
 */
import { createCrudHook } from '@/shared/hooks';
import { formService } from '../services/formService';

/**
 * Hook CRUD para formularios con configuración automática
 * - Tipo: 'transactional' (datos que cambian frecuentemente) - configurado en ENTITY_TYPE_MAPPING
 * - Cache: 5min stale, 15min memoria - con refetch automático
 * - Optimistic updates: habilitado para mejor UX
 * - Refetch on focus: habilitado para datos frescos
 */
export const useFormCrud = createCrudHook({
  entityName: 'Formulario',
  service: formService
  // Sin override de mode - permite que la página lo configure
});
