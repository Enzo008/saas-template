import { useDialog } from './DialogProvider';
import { DialogOption } from '../multi-option';

// Hook para diálogos de confirmación
export const useConfirmationDialog = () => {
  const { showConfirmation } = useDialog();
  
  return {
    confirm: (
      title: string,
      description: string,
      onConfirm: () => void,
      options?: {
        confirmLabel?: string;
        cancelLabel?: string;
        onCancel?: () => void;
        variant?: "default" | "destructive";
      }
    ) => {
      showConfirmation({
        title,
        description,
        onConfirm,
        ...options
      });
    }
  };
};

// Hook para diálogos de información
export const useInfoDialog = () => {
  const { showInfo } = useDialog();
  
  return {
    showInfo: (
      title: string,
      content: React.ReactNode,
      options?: {
        closeLabel?: string;
        onClose?: () => void;
        maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
      }
    ) => {
      showInfo({
        title,
        children: content,
        ...options
      });
    }
  };
};

// Hook para diálogos de múltiples opciones
export const useMultiOptionDialog = () => {
  const { showMultiOption } = useDialog();
  
  return {
    showOptions: (
      title: string,
      description: string,
      options: DialogOption[],
      cancelOptions?: {
        cancelLabel?: string | null;
        onCancel?: () => void;
      }
    ) => {
      showMultiOption({
        title,
        description,
        options,
        ...cancelOptions
      });
    }
  };
};

// Hook para diálogos de formulario
export const useFormDialog = () => {
  const { showForm } = useDialog();
  
  return {
    showForm: (
      title: string,
      content: React.ReactNode,
      onSubmit: () => void,
      options?: {
        submitLabel?: string;
        cancelLabel?: string;
        onCancel?: () => void;
        isSubmitting?: boolean;
        maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
        submitButtonProps?: {
          variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
          disabled?: boolean;
          className?: string;
        };
      }
    ) => {
      showForm({
        title,
        children: content,
        onSubmit,
        ...options
      });
    }
  };
};
