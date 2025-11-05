/**
 * Hook para manejar actualizaciones optimistas
 * Mejora la UX mostrando cambios inmediatamente antes de confirmar con el servidor
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export interface OptimisticUpdateOptions<T> {
  queryKey: (string | number)[];
  updateFn: (oldData: T[], newItem: T, action: 'create' | 'update' | 'delete') => T[];
  rollbackFn?: (oldData: T[], error: any) => T[];
}

export function useOptimisticUpdates<T>({
  queryKey,
  updateFn,
  rollbackFn: _rollbackFn
}: OptimisticUpdateOptions<T>) {
  const queryClient = useQueryClient();

  const optimisticUpdate = useCallback(
    (newItem: T, action: 'create' | 'update' | 'delete') => {
      // Cancelar queries en vuelo para evitar conflictos
      queryClient.cancelQueries({ queryKey });

      // Snapshot del estado anterior
      const previousData = queryClient.getQueryData(queryKey);

      // Actualización optimista
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData?.data?.data) return oldData;
        
        const updatedItems = updateFn(oldData.data.data, newItem, action);
        
        return {
          ...oldData,
          data: {
            ...oldData.data,
            data: updatedItems,
            totalCount: action === 'create' 
              ? oldData.data.totalCount + 1 
              : action === 'delete' 
                ? oldData.data.totalCount - 1 
                : oldData.data.totalCount
          }
        };
      });

      // Retornar función de rollback
      return () => {
        if (previousData) {
          queryClient.setQueryData(queryKey, previousData);
        }
      };
    },
    [queryClient, queryKey, updateFn]
  );

  const rollback = useCallback(
    (rollbackFn: () => void) => {
      rollbackFn();
    },
    []
  );

  return {
    optimisticUpdate,
    rollback
  };
}