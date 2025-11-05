import React, { useEffect } from 'react';
import Modal from '../../overlays/modal/Modal';
import { FormContent, FormContentProps, FormSubmitResult } from './FormContent';

interface FormModalProps<T = Record<string, unknown>> {
    enrichedFields?: FormContentProps['enrichedFields'];
    title: string;
    modalVisible: boolean;
    onClose: () => void;
    onSubmit: (data: T) => Promise<FormSubmitResult> | FormSubmitResult;
    initialData?: T | null;
    isLoading?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    onAfterClose?: () => void;
    onAfterSubmit?: () => void;
    customFooter?: React.ReactNode;
    columnsCount?: 1 | 2 | 3 | 4;
    /** Elemento desde el cual se abre el modal (para animación) */
    triggerElement?: HTMLElement | null;
}

/**
 * FormModal - Un componente modal reutilizable para formularios
 * 
 * Este componente combina Modal y FormContent para crear un flujo completo
 * de formulario en un modal, con manejo de estados de carga y cierre automático
 * después de enviar el formulario con éxito.
 */
export default function FormModal<T = Record<string, unknown>>({ 
    enrichedFields, 
    modalVisible, 
    onSubmit,
    initialData,
    title,
    onClose,
    isLoading = false,
    size = 'md',
    showCloseButton = true,
    onAfterClose,
    onAfterSubmit,
    customFooter,
    columnsCount = 1,
    triggerElement
}: FormModalProps<T>) {
    // Efecto para manejar la limpieza cuando el modal se cierra
    useEffect(() => {
        if (!modalVisible && onAfterClose) {
            onAfterClose();
        }
    }, [modalVisible, onAfterClose]);
    
    // Manejador para el envío del formulario
    const handleSubmit = async (data: Record<string, unknown>): Promise<FormSubmitResult> => {
        try {
            const result = await onSubmit(data as T);
            // Ejecutar callback después de enviar si existe
            if (onAfterSubmit) {
                onAfterSubmit();
            }
            
            return result;
        } catch (error) {
            // El error ya debería ser manejado por el servicio/hook,
            // pero podemos agregar manejo adicional aquí si es necesario
            console.error('Error en el envío del formulario:', error);
            return {
                success: false,
                error,
                message: 'Error al procesar el formulario'
            };
        }
    };
    
    return (
        <Modal
            modalVisible={modalVisible}
            onClose={onClose}
            title={title}
            size={size}
            showCloseButton={showCloseButton}
            triggerElement={triggerElement}
        >
            <FormContent
                enrichedFields={enrichedFields || []}
                modalVisible={modalVisible}
                onSubmit={handleSubmit}
                initialData={initialData}
                isLoading={isLoading}
                columnsCount={columnsCount}
            />
            {customFooter}
        </Modal>
    );
}