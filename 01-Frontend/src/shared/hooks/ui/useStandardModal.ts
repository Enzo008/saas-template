/**
 * Hook utilitario para configuración estándar de modales CRUD
 * Maneja automáticamente create/update y configuración común
 */
import { useTranslation } from 'react-i18next';
import { useDirectTranslation, DirectTranslation } from '../../utils/directTranslation';

export interface StandardModalProps<T> {
  modalVisible: boolean;
  onClose: () => void;
  title: string;
  enrichedFields: any[];
  onSubmit: (data: T) => Promise<any>;
  initialData?: T | null;
  isLoading: boolean;
}

/**
 * Hook que genera props estándar para el componente FormModal
 * Maneja automáticamente la lógica de create/update
 */
export function useStandardModal<T>(
  crudHook: {
    isModalOpen: boolean;
    selectedItem: T | null;
    closeModal: () => void;
    create: (data: T) => Promise<any>;
    update: (data: T) => Promise<any>;
    isLoading: boolean;
  },
  formFields: any[],
  title: string | DirectTranslation
): StandardModalProps<T> {
  const { t } = useTranslation();
  
  const translatedTitle = useDirectTranslation(title);

  // Función estándar para manejar submit (create o update)
  const handleSubmit = async (data: T): Promise<any> => {
    try {
      if (crudHook.selectedItem) {
        return await crudHook.update(data);
      } else {
        return await crudHook.create(data);
      }
    } catch (error) {
      return { 
        success: false, 
        error,
        message: t('errors.formSubmit', { entity: translatedTitle })
      };
    }
  };

  return {
    modalVisible: crudHook.isModalOpen,
    onClose: crudHook.closeModal,
    title: translatedTitle,
    enrichedFields: formFields,
    onSubmit: handleSubmit,
    initialData: crudHook.selectedItem,
    isLoading: crudHook.isLoading
  };
}