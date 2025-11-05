/**
 * Hook genérico para manejar formularios multi-paso con CRUD
 * Centraliza la lógica común de navegación y envío de datos
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiStepForm } from '@/shared/components/forms/layouts/MultiStepFormWrapper';

interface CrudHookResult {
  create: (data: any) => Promise<{ success: boolean }>;
  update: (data: any) => Promise<{ success: boolean }>;
  isLoading: boolean;
  selectedItem: any;
  [key: string]: any; // Propiedades adicionales del hook CRUD
}

interface MultiStepCrudConfig<TEntity> {
  // Configuración básica
  totalSteps: number;
  crudHook: CrudHookResult;
  
  // Callbacks personalizables por feature
  onLoadInitialData?: (entity: TEntity) => Record<string, any>;
  onPrepareSubmitData?: (formState: Record<string, any>) => TEntity;
  
  // Navegación
  navigateOnSuccess?: string;
  navigateOnCancel?: string;
}

export function useMultiStepCrud<TEntity>({
  totalSteps,
  crudHook,
  onLoadInitialData,
  onPrepareSubmitData,
  navigateOnSuccess,
  navigateOnCancel
}: MultiStepCrudConfig<TEntity>) {
  
  const navigate = useNavigate();
  
  // Hook de navegación de pasos
  const { 
    currentStep, 
    goToNext, 
    goToPrevious
  } = useMultiStepForm(totalSteps);
  
  // Extraer funciones del hook CRUD
  const { 
    create, 
    update, 
    selectedItem 
  } = crudHook;
  
  // Estado genérico del formulario (por pasos)
  const [formState, setFormState] = useState<Record<string, any>>({});
  
  // Cargar datos iniciales (si está en modo edición)
  useEffect(() => {
    if (selectedItem && onLoadInitialData) {
      const initialData = onLoadInitialData(selectedItem);
      setFormState(initialData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]); // Solo cuando cambia selectedItem, no la función callback
  
  // Submit final
  const handleSubmit = useCallback(async () => {
    try {
      // Preparar datos para envío (personalizable)
      const submitData = onPrepareSubmitData 
        ? onPrepareSubmitData(formState)
        : formState;
      
      // Crear o actualizar
      const result = selectedItem
        ? await update(submitData)
        : await create(submitData);
      
      if (result.success && navigateOnSuccess) {
        navigate(navigateOnSuccess);
      }
    } catch (err) {
      console.error('Error al guardar:', err);
    }
  }, [formState, selectedItem, create, update, onPrepareSubmitData, navigate, navigateOnSuccess]);
  
  // Cancelar
  const handleCancel = useCallback(() => {
    if (navigateOnCancel) {
      navigate(navigateOnCancel);
    }
  }, [navigate, navigateOnCancel]);
  
  // Actualizar estado del formulario
  const updateFormState = useCallback((updates: Record<string, any>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  }, []);
  
  return {
    // Estado
    formState,
    currentStep,
    
    // Acciones
    updateFormState,
    handleNext: goToNext,
    handlePrevious: goToPrevious,
    handleSubmit,
    handleCancel,
    
    // Funciones CRUD adicionales del hook (incluye isLoading, selectedItem, create, update, etc.)
    ...crudHook
  };
}
