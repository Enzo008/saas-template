import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { ApiResponse } from '@/shared/types';
import { useNotifications } from '../ui/useNotifications';
import { useErrorManager } from '@/shared/managers';
import { UseFormReturn } from 'react-hook-form';
import { ErrorType } from '@/shared/managers/ErrorManager';

/**
 * Opciones extendidas para useApiMutation
 */
export interface UseApiMutationOptions<TData = any, TError = any, TVariables = any, TContext = any>
  extends Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> {

  // Función de mutación requerida
  mutationFn: (variables: TVariables) => Promise<TData>;

  // Configuración de notificaciones
  notifications?: {
    // Mensaje de éxito (puede ser clave de traducción o texto directo)
    successMessage?: string | undefined;
    // Mensaje de error personalizado
    errorMessage?: string | undefined;
    // Si mostrar notificación automática de éxito
    showSuccess?: boolean;
    // Si mostrar notificación automática de error
    showError?: boolean;
    // Usar traducción automática (default: true)
    useTranslation?: boolean;
  };

  // Configuración de formularios
  form?: {
    // Hook de formulario para reset automático
    formHook?: UseFormReturn<any> | undefined;
    // Si resetear el formulario en éxito
    resetOnSuccess?: boolean;
  };

  // Configuración de invalidación de cache
  invalidation?: {
    // Query keys a invalidar en éxito
    queryKeys?: string[];
    // Si invalidar automáticamente queries relacionadas
    autoInvalidate?: boolean;
  };
}

/**
 * Hook universal para mutaciones API con funcionalidades automáticas
 * 
 * Funcionalidades incluidas:
 * - Notificaciones automáticas de éxito/error
 * - Reset automático de formularios
 * - Invalidación automática de cache
 * - Manejo centralizado de errores
 * - Soporte para traducción automática
 * 
 * @param options Configuración de la mutación
 * @returns Hook de mutación configurado
 */
export function useApiMutation<TData = ApiResponse, TError = any, TVariables = any, TContext = any>(
  options: UseApiMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {

  const {
    mutationFn,
    notifications = {},
    form = {},
    invalidation = {},
    onSuccess,
    onError,
    ...mutationOptions
  } = options;

  // Configuración por defecto para notificaciones
  const {
    showSuccess = true,
    showError = true,
    successMessage = 'Operación completada exitosamente',
    errorMessage = 'Error en la operación'
  } = notifications;

  const {
    resetOnSuccess = true,
    formHook
  } = form;

  const notifications_hook = useNotifications();
  const errorManager = useErrorManager();

  return useMutation({
    mutationFn,

    onSuccess: (data, variables, onMutateResult, context) => {
      // Notificación de éxito automática
      if (showSuccess) {
        const message = successMessage;

        notifications_hook.success(message);
      }

      // Reset automático de formulario
      if (resetOnSuccess && formHook) {
        formHook.reset();
      }

      // Invalidación automática de cache (disponible para implementación futura)
      if (invalidation.queryKeys && invalidation.queryKeys.length > 0) {
        // Funcionalidad pendiente: invalidación de queries específicas
        // Requiere acceso al QueryClient desde el contexto
      }

      // Ejecutar callback personalizado
      onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      // Notificación de error automática
      if (showError) {
        const message = errorMessage;

        // Intentar extraer mensaje del error
        const apiError = error as any;
        const backendMessage = apiError?.response?.data?.message ||
          apiError?.response?.data?.Message ||
          apiError?.message;

        const finalMessage = backendMessage || message;

        notifications_hook.error(finalMessage);
      }

      // Manejo centralizado de errores
      errorManager.handleError(error, ErrorType.API, {
        context: 'api-mutation',
        operation: 'mutación'
      });

      // Ejecutar callback personalizado
      onError?.(error, variables, onMutateResult, context);
    },

    ...mutationOptions
  });
}

/**
 * Hook simplificado para mutaciones comunes con configuración predeterminada
 */
export function useSimpleApiMutation<TData = ApiResponse, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  successMessage?: string,
  formHook?: UseFormReturn<any> | undefined
) {
  return useApiMutation({
    mutationFn,
    notifications: {
      successMessage: successMessage || undefined,
      useTranslation: false // Para mensajes simples usamos texto directo
    },
    form: {
      formHook: formHook || undefined,
      resetOnSuccess: !!formHook
    }
  });
}

/**
 * Hook para mutaciones CRUD con configuración especializada
 */
export function useCrudMutation<TData = ApiResponse, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  operation: 'create' | 'update' | 'delete',
  entityName: string,
  formHook?: UseFormReturn<any> | undefined
) {
  const operationMessages = {
    create: `${entityName} creado exitosamente`,
    update: `${entityName} actualizado exitosamente`,
    delete: `${entityName} eliminado exitosamente`
  };

  return useApiMutation({
    mutationFn,
    notifications: {
      successMessage: operationMessages[operation] || undefined,
      useTranslation: false
    },
    form: {
      formHook: formHook || undefined,
      resetOnSuccess: operation === 'create' && !!formHook
    },
    invalidation: {
      autoInvalidate: true
    }
  });
}

// Re-export para compatibilidad
export { useApiMutation as useMutation };
