/**
 * Página para crear y editar usuarios con flujo multi-pasos
 * Paso 1: Información básica del usuario
 * Paso 2: Asignación de menús y permisos
 */

import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { MultiStepFormWrapper } from '@/shared/components/forms/layouts';
import { MultiStepFormStep } from '@/shared/components/forms/layouts/MultiStepFormWrapper';
import { UserBasicInfoStep } from '../components/steps/UserBasicInfoStep';
import { UserMenuPermission } from '../types';
import { User } from '@/auth/types';
import { useUserCrud } from '../hooks';
import { UserMenusPermissionsStep } from '../components/steps';
import { userFormFields } from '../config/formFields';
import { prepareInitialValuesForCompositeFields, flattenCompositeFieldValues } from '@/shared/utils/formDataUtils';
import { useMultiStepCrud } from '@/shared/hooks';

// Tipo simple para el formulario básico
interface UserBasicFormData {
  IdeDocCod: string;
  useNumDoc: string; 
  useNam: string;     
  useLas: string;     
  useBir: string;     
  useSex: 'M' | 'F';  
  useEma: string;     
  usePho: string;     
  posCod: string;     
  rolCod: string;
  location?: { locYea: string; locCod: string };  
  repository?: { repYea: string; repCod: string };
  usePas?: string;    
}

export default function UserMultiStepPage() {
  // Obtener campos del formulario
  const formFields = userFormFields();
  
  // Hook de usuario con métodos personalizados
  const userCrudHook = useUserCrud({ mode: 'page' });
  const { getAllMenusAndPermissions } = userCrudHook;
  
  // Hook multi-paso centralizado
  const {
    formState,
    currentStep,
    isLoading,
    selectedItem,
    updateFormState,
    handleNext: handleNextBase,
    handlePrevious,
    handleSubmit,
    handleCancel
  } = useMultiStepCrud<User>({
    totalSteps: 2,
    crudHook: userCrudHook,
    
    // Personalización: Cargar datos con campos compuestos
    onLoadInitialData: (user) => {
      const processed = prepareInitialValuesForCompositeFields(user, formFields);
      return {
        basicInfo: {
          ...processed,
          usePas: undefined // Limpiar contraseña en modo edición (updated field name)
        } as UserBasicFormData,
        menusPermissions: [] as UserMenuPermission[] // Se cargan en el paso 2
      };
    },
    
    // Personalización: Preparar datos con campos compuestos
    onPrepareSubmitData: (state) => {
      const flattened = flattenCompositeFieldValues(state['basicInfo'], formFields);
      return {
        ...flattened,
        menus: state['menusPermissions']
          .filter((mp: UserMenuPermission) => mp.hasActive)
          .map((mp: UserMenuPermission) => ({
            ...mp.menu,
            permissions: mp.permissions
              .filter(p => p.hasActive)
              .map(p => p.permission)
          }))
      } as User;
    },
    
    navigateOnSuccess: '/user',
    navigateOnCancel: '/user'
  });

  // Form para el paso 1 (información básica) - SIN zodResolver
  const basicInfoForm = useForm<UserBasicFormData>({
    mode: 'onChange',
    defaultValues: formState['basicInfo'] || {
      IdeDocCod: '', 
      useNumDoc: '', 
      useNam: '',     
      useLas: '',     
      useBir: '',     
      useSex: 'M',
      useEma: '',     
      posCod: '',     
      usePho: '',     
      rolCod: ''
    }
  });

  // Sincronizar form con formState cuando se cargan datos
  useEffect(() => {
    if (formState['basicInfo']) {
      basicInfoForm.reset(formState['basicInfo']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState['basicInfo']]); // Solo cuando cambia basicInfo específicamente

  // Manejar submit del paso 1 con validación RHF
  const handleStep1Next = () => {
    basicInfoForm.handleSubmit(
      (data) => {
        updateFormState({ basicInfo: data });
        handleNextBase();
      }
    )();
  };

  // Manejar cambios en menús y permisos del paso 2
  const handleMenusPermissionsChange = useCallback((menusPermissions: UserMenuPermission[]) => {
    updateFormState({ menusPermissions });
  }, [updateFormState]);

  // Crear usuario combinado para el panel del paso 2
  const getCombinedUserData = (): User | undefined => {
    if (!formState['basicInfo']) return selectedItem || undefined;
    
    return {
      ...selectedItem,
      ...formState['basicInfo'],
    } as User;
  };

  // Configuración de pasos
  const steps: MultiStepFormStep[] = [
    {
      id: 1,
      title: 'Información Básica',
      description: 'Configure los datos personales y laborales del usuario',
      completed: !!formState['basicInfo'] && currentStep !== 1,
      disabled: false,
      content: (
        <UserBasicInfoStep
          register={basicInfoForm.register}
          control={basicInfoForm.control}
          errors={basicInfoForm.formState.errors}
          watch={basicInfoForm.watch}
          setValue={basicInfoForm.setValue}
          dirtyFields={basicInfoForm.formState.dirtyFields}
          isSubmitted={basicInfoForm.formState.isSubmitted}
          isEditing={selectedItem !== null}
        />
      )
    },
    {
      id: 2,
      title: 'Menús y Permisos',
      description: 'Asigne los menús y permisos de acceso al usuario',
      completed: false,
      disabled: !formState['basicInfo'],
      content: (
        <UserMenusPermissionsStep
          menusPermissions={formState['menusPermissions'] || []}
          onChange={handleMenusPermissionsChange}
          isEditing={selectedItem !== null}
          userData={getCombinedUserData()}
          getAllMenusAndPermissions={getAllMenusAndPermissions}
        />
      )
    }
  ];

  return (
    <MultiStepFormWrapper
      steps={steps}
      currentStep={currentStep}
      title={selectedItem ? 'Editar Usuario' : 'Crear Usuario'}
      subtitle={selectedItem ?
        'Modifique la información del usuario y sus accesos' 
        : 'Configure la información del usuario y sus accesos al sistema'}
      isLoading={isLoading}
      isEditing={selectedItem !== null}
      selectedItem={selectedItem}
      onNext={currentStep === 1 ? handleStep1Next : handleNextBase}
      onPrevious={handlePrevious}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitLabel={selectedItem ? 'Actualizar Usuario' : 'Crear Usuario'}
      canSubmit={!!formState['basicInfo']}
    />
  );
}
