import { createContext, useContext, useState, ReactNode } from 'react';
import { ConfirmationDialog, ConfirmationDialogProps } from '../confirmation';
import { InfoDialog, InfoDialogProps } from '../info';
import { MultiOptionDialog, DialogOption } from '../multi-option';
import { FormDialog, FormDialogProps } from '../../../forms/components/FormDialog';

// Tipos para los diferentes diálogos
type ConfirmationDialogState = Omit<ConfirmationDialogProps, 'isOpen' | 'onOpenChange'>;
type InfoDialogState = Omit<InfoDialogProps, 'isOpen' | 'onOpenChange'>;
type MultiOptionDialogState = {
  title: string;
  description: string;
  options: DialogOption[];
  cancelLabel?: string | null;
  onCancel?: () => void;
};
type FormDialogState = Omit<FormDialogProps, 'isOpen' | 'onOpenChange'>;

// Estado del contexto
interface DialogContextState {
  // Métodos para abrir diálogos
  showConfirmation: (props: ConfirmationDialogState) => void;
  showInfo: (props: InfoDialogState) => void;
  showMultiOption: (props: MultiOptionDialogState) => void;
  showForm: (props: FormDialogState) => void;
  
  // Métodos para cerrar diálogos
  closeConfirmation: () => void;
  closeInfo: () => void;
  closeMultiOption: () => void;
  closeForm: () => void;
}

// Crear el contexto
const DialogContext = createContext<DialogContextState | undefined>(undefined);

// Props para el provider
interface DialogProviderProps {
  children: ReactNode;
}

export const DialogProvider = ({ children }: DialogProviderProps) => {
  // Estados para controlar la visibilidad de cada tipo de diálogo
  const [confirmationDialog, setConfirmationDialog] = useState<ConfirmationDialogState & { isOpen: boolean }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const [infoDialog, setInfoDialog] = useState<InfoDialogState & { isOpen: boolean }>({
    isOpen: false,
    title: '',
    children: null,
  });

  const [multiOptionDialog, setMultiOptionDialog] = useState<MultiOptionDialogState & { isOpen: boolean }>({
    isOpen: false,
    title: '',
    description: '',
    options: [],
  });

  const [formDialog, setFormDialog] = useState<FormDialogState & { isOpen: boolean }>({
    isOpen: false,
    title: '',
    children: null,
    onSubmit: () => {},
  });

  // Métodos para mostrar diálogos
  const showConfirmation = (props: ConfirmationDialogState) => {
    setConfirmationDialog({ ...props, isOpen: true });
  };

  const showInfo = (props: InfoDialogState) => {
    setInfoDialog({ ...props, isOpen: true });
  };

  const showMultiOption = (props: MultiOptionDialogState) => {
    setMultiOptionDialog({ ...props, isOpen: true });
  };

  const showForm = (props: FormDialogState) => {
    setFormDialog({ ...props, isOpen: true });
  };

  // Métodos para cerrar diálogos
  const closeConfirmation = () => {
    setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
  };

  const closeInfo = () => {
    setInfoDialog(prev => ({ ...prev, isOpen: false }));
  };

  const closeMultiOption = () => {
    setMultiOptionDialog(prev => ({ ...prev, isOpen: false }));
  };

  const closeForm = () => {
    setFormDialog(prev => ({ ...prev, isOpen: false }));
  };

  // Valor del contexto
  const contextValue: DialogContextState = {
    showConfirmation,
    showInfo,
    showMultiOption,
    showForm,
    closeConfirmation,
    closeInfo,
    closeMultiOption,
    closeForm,
  };

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      
      {/* Renderizar los diálogos */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) closeConfirmation();
        }}
        title={confirmationDialog.title}
        description={confirmationDialog.description}
        confirmLabel={confirmationDialog.confirmLabel || 'Confirmar'}
        cancelLabel={confirmationDialog.cancelLabel || 'Cancelar'}
        onConfirm={confirmationDialog.onConfirm}
        onCancel={confirmationDialog.onCancel || (() => {})}
        variant={confirmationDialog.variant || 'default'}
      />

      <InfoDialog
        isOpen={infoDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) closeInfo();
        }}
        title={infoDialog.title}
        closeLabel={infoDialog.closeLabel || 'Cerrar'}
        onClose={infoDialog.onClose || (() => {})}
        maxWidth={infoDialog.maxWidth || 'md'}
      >
        {infoDialog.children}
      </InfoDialog>

      <MultiOptionDialog
        isOpen={multiOptionDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) closeMultiOption();
        }}
        title={multiOptionDialog.title}
        description={multiOptionDialog.description}
        options={multiOptionDialog.options}
        cancelLabel={multiOptionDialog.cancelLabel || null}
        onCancel={multiOptionDialog.onCancel || (() => {})}
      />

      <FormDialog
        isOpen={formDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) closeForm();
        }}
        title={formDialog.title}
        submitLabel={formDialog.submitLabel || 'Enviar'}
        cancelLabel={formDialog.cancelLabel || 'Cancelar'}
        onSubmit={formDialog.onSubmit}
        onCancel={formDialog.onCancel || (() => {})}
        isSubmitting={formDialog.isSubmitting || false}
        maxWidth={formDialog.maxWidth || 'md'}
        {...(formDialog.submitButtonProps && { submitButtonProps: formDialog.submitButtonProps })}
      >
        {formDialog.children}
      </FormDialog>
    </DialogContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialog debe ser usado dentro de un DialogProvider');
  }
  return context;
};
