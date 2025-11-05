/**
 * Página de formulario para crear/editar roles
 * Siguiendo exactamente el patrón de UserMultiStepPage pero sin multi-pasos
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import SimplePageWrapper from '@/shared/components/forms/layouts/SimplePageWrapper';
import { RoleCustomForm } from '../components/RoleCustomForm';
import { RoleMenusPermissionsStep } from '../components/RoleMenusPermissionsStep';
import { useNotifications } from '@/shared/hooks';
import { Role, RoleMenuPermission } from '../types';
import { useRoleCrud } from '../hooks';

// Tipo simple para el formulario básico
interface RoleBasicFormData {
  rolNam: string;
}

// Estado principal del formulario
interface RoleFormState {
  basicInfo: RoleBasicFormData | null;
  menusPermissions: RoleMenuPermission[];
}

export default function RoleFormPage() {
  const navigate = useNavigate();
  const { error } = useNotifications();
  
  // Hook para operaciones CRUD
  const { 
    create, 
    update,
    getAllMenusAndPermissions,
    isLoading,
    selectedItem
  } = useRoleCrud({ mode: 'page' });

  // Estado del formulario
  const [formState, setFormState] = useState<RoleFormState>({
    basicInfo: null,
    menusPermissions: []
  });

  // Form para información básica
  const basicInfoForm = useForm<RoleBasicFormData>({
    mode: 'onChange',
    defaultValues: {
      rolNam: ''
    }
  });

  // Procesar rolData cuando esté disponible
  useEffect(() => {
    if (selectedItem) {
      const dataForReset = {
        rolNam: selectedItem.rolNam || ''
      };
      
      basicInfoForm.reset(dataForReset);
      setFormState(prev => ({ 
        ...prev, 
        basicInfo: dataForReset,
        menusPermissions: []
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]); // Solo cuando cambia selectedItem

  // Manejar cambios en menús y permisos
  const handleMenusPermissionsChange = (menusPermissions: RoleMenuPermission[]) => {
    setFormState(prev => ({ ...prev, menusPermissions }));
  };

  // Crear rol combinado para el panel
  const getCombinedRoleData = (): Role | undefined => {
    if (!formState.basicInfo) return selectedItem || undefined;
    
    return {
      ...selectedItem,
      ...formState.basicInfo,
    } as Role;
  };

  // Manejar el envío final del formulario
  const handleFinalSubmit = async () => {
    // Validar formulario básico primero
    const isValid = await basicInfoForm.trigger();
    if (!isValid) {
      error('Por favor complete correctamente la información básica');
      return;
    }

    const basicData = basicInfoForm.getValues();
    if (!basicData.rolNam) {
      error('Debe completar la información básica primero');
      return;
    }

    try {
      // Preparar datos combinando información básica con menús
      const completeFormData = {
        ...basicData,
        
        // Menús y permisos
        menus: formState.menusPermissions
          .filter(mp => mp.hasActive)
          .map(mp => ({
            ...mp.menu,
            permissions: mp.permissions
              .filter(p => p.hasActive)
              .map(p => p.permission)
          }))
      };

      const roleData = completeFormData as unknown as Role;

      let result;
      if (selectedItem) {
        result = await update({ ...roleData, rolCod: selectedItem.rolCod });
      } else {
        result = await create(roleData);
      }
      
      if (result.success) {
        navigate('/role');
      }
    } catch (err) {
      console.error('Error al guardar rol:', err);
    }
  };

  const handleCancel = () => {
    navigate('/role');
  };

  return (
    <SimplePageWrapper
      title={selectedItem ? 'Editar Rol' : 'Crear Rol'}
      subtitle={selectedItem ?
        'Modifique la información del rol y sus accesos' 
        : 'Configure la información del rol y sus accesos al sistema'}
      onSubmit={handleFinalSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      submitLabel={selectedItem ? 'Actualizar Rol' : 'Crear Rol'}
      isEditing={selectedItem !== null}
      selectedItem={selectedItem} // ✅ El wrapper maneja el loading automáticamente
    >
      <div className="space-y-8">
        {/* Información Básica del Rol */}
        <div className="bg-white p-6 rounded-lg shadow">
          <RoleCustomForm
            register={basicInfoForm.register}
            control={basicInfoForm.control}
            errors={basicInfoForm.formState.errors}
            watch={basicInfoForm.watch}
            setValue={basicInfoForm.setValue}
            dirtyFields={basicInfoForm.formState.dirtyFields}
            isSubmitted={basicInfoForm.formState.isSubmitted}
          />
        </div>

        {/* Menús y Permisos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <RoleMenusPermissionsStep
            menusPermissions={formState.menusPermissions}
            onChange={handleMenusPermissionsChange}
            isEditing={selectedItem !== null}
            roleData={getCombinedRoleData()}
            getAllMenusAndPermissions={getAllMenusAndPermissions}
          />
        </div>
      </div>
    </SimplePageWrapper>
  );
}
