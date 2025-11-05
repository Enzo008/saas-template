/**
 * createCrudHook - Factory inteligente para crear hooks CRUD
 * Configuración automática basada en tipo de entidad con overrides opcionales
 * V2: Ahora soporta métodos personalizados integrados
 */

import { useCallback } from 'react';
import { 
  useCrud, 
  UseCrudOptions, 
  UseCrudReturn 
} from '../core/useCrud';
import { CrudService } from '@/shared/services/api/CrudService';
import { QUERY_PRESETS } from '@/shared/config/reactQuery';

/**
 * Definición de un método personalizado
 * Recibe el servicio y retorna una función que puede ser llamada
 * TService permite usar el tipo específico del servicio con sus métodos custom
 */
export type CustomMethod<TService = any, TArgs extends any[] = any[], TReturn = any> = 
  (service: TService) => (...args: TArgs) => Promise<TReturn>;

/**
 * Opciones para createCrudHook
 * TService permite especificar el tipo exacto del servicio con sus métodos custom
 */
export interface CreateCrudHookOptions<T, TService extends CrudService<T> = CrudService<T>> {
  /** Nombre de la entidad (ej: 'Cargo', 'Usuario') */
  entityName: string;
  /** Servicio CRUD específico */
  service: TService;
  /** 
   * Configuración predefinida a usar
   * - STATIC: Datos que raramente cambian (30min stale, 1h cache)
   * - DYNAMIC: Datos que cambian frecuentemente (5min stale, 10min cache)
   * - REALTIME: Datos en tiempo real (30s stale, 2min cache)
   * - MULTISTEP: Para formularios multi-paso (sin auto-loading)
   */
  preset?: keyof typeof QUERY_PRESETS;
  /** 
   * Overrides específicos para esta entidad
   * Se aplican después de la configuración automática/preset
   */
  overrides?: Partial<UseCrudOptions<T>>;
  /**
   * Métodos personalizados que se agregarán al hook
   * Cada método recibe el servicio y retorna una función
   * 
   * @example
   * customMethods: {
   *   getAllMenusAndPermissions: (service) => async (user) => {
   *     return await service.getAllMenusAndPermissions(user);
   *   }
   * }
   */
  customMethods?: Record<string, CustomMethod<TService>>;
}

/**
 * Retorno extendido del hook CRUD con métodos personalizados
 */
export type ExtendedUseCrudReturn<T, TMethods = {}> = UseCrudReturn<T> & TMethods;

/**
 * Crea un hook CRUD personalizado con configuración inteligente
 * 
 * @example
 * // Uso básico con preset
 * export const usePositionCrud = createCrudHook({
 *   entityName: 'Position',
 *   service: positionService,
 *   preset: 'STATIC'
 * });
 * 
 * @example
 * // Con métodos personalizados
 * export const useUserCrud = createCrudHook({
 *   entityName: 'Usuario',
 *   service: userService,
 *   preset: 'DYNAMIC',
 *   customMethods: {
 *     getAllMenusAndPermissions: (service) => async (user) => {
 *       return await service.getAllMenusAndPermissions(user);
 *     },
 *     changePassword: (service) => async (userId, newPassword) => {
 *       return await service.changePassword(userId, newPassword);
 *     }
 *   }
 * });
 * 
 * @example
 * // Con overrides personalizados
 * export const useReportCrud = createCrudHook({
 *   entityName: 'Reporte',
 *   service: reportService,
 *   preset: 'REALTIME',
 *   overrides: {
 *     staleTime: 10000, // 10 segundos
 *     enableOptimisticUpdates: false
 *   }
 * });
 */
export function createCrudHook<T, TMethods extends Record<string, any> = {}, TService extends CrudService<T> = CrudService<T>>(
  options: CreateCrudHookOptions<T, TService>
) {
  const { entityName, service, preset, overrides = {}, customMethods = {} } = options;

  return function useEntityCrud(
    hookOptions: Partial<UseCrudOptions<T>> = {}
  ): ExtendedUseCrudReturn<T, TMethods> {
    // Configuración base del CRUD
    const baseConfig = {
      ...QUERY_PRESETS[preset || 'REALTIME'],
      ...overrides
    };
    
    const finalOptions: UseCrudOptions<T> = {
      service,
      entityName,
      ...baseConfig,
      ...hookOptions
    };

    // Hook CRUD base
    const baseCrud = useCrud<T>(finalOptions);

    // Crear métodos personalizados con useCallback para estabilidad
    const customMethodsImplementation = {} as TMethods;
    
    Object.entries(customMethods).forEach(([methodName, methodFactory]) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      customMethodsImplementation[methodName as keyof TMethods] = useCallback(
        methodFactory(service),
        [service]
      ) as any;
    });

    // Combinar CRUD base con métodos personalizados
    return {
      ...baseCrud,
      ...customMethodsImplementation
    };
  };
}

/**
 * Factory simplificado para casos comunes
 * Usa solo el nombre de entidad y servicio con configuración automática
 */
export function createSimpleCrudHook<T>(
  entityName: string,
  service: CrudService<T>
) {
  return createCrudHook({
    entityName,
    service
  });
}

/**
 * Factory para entidades con configuración específica
 */
export const createCrudHookWithPreset = {
  /**
   * Para datos estáticos (cargos, roles, tipos)
   */
  static: <T>(entityName: string, service: CrudService<T>) =>
    createCrudHook({ entityName, service, preset: 'STATIC' }),

  /**
   * Para datos dinámicos (usuarios, formularios)
   */
  dynamic: <T>(entityName: string, service: CrudService<T>) =>
    createCrudHook({ entityName, service, preset: 'DYNAMIC' }),

  /**
   * Para datos en tiempo real (reportes, logs)
   */
  realtime: <T>(entityName: string, service: CrudService<T>) =>
    createCrudHook({ entityName, service, preset: 'REALTIME' }),

  /**
   * Para formularios multi-paso
   */
  multistep: <T>(entityName: string, service: CrudService<T>) =>
    createCrudHook({ entityName, service, preset: 'MULTISTEP' })
};
