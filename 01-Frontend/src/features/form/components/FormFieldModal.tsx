/**
 * Modal para agregar/editar campos de formulario
 */

import { useMemo } from 'react';
import FormModal from '@/shared/components/forms/components/FormModal';
import { FormSubmitResult } from '@/shared/components/forms/components/FormContent';
import { FormField } from '@/features/form/types';
import { FormFieldDraft } from '@/features/form/types';
import { FieldFormData } from '@/features/form/types';
import { fieldEditorFields } from '../config';

interface FormFieldModalProps<T = FormField | FormFieldDraft> {
    isOpen: boolean;
    onClose: () => void;
    onSave: (fieldData: FieldFormData) => void;
    field?: T | null;
    isEditing: boolean;
    isLoading?: boolean;
    fieldOrder?: number; // Orden que se asignará al campo (manejado externamente)
}

export const FormFieldModal = ({
    isOpen,
    onClose,
    onSave,
    field,
    isEditing,
    isLoading = false,
    fieldOrder = 1
}: FormFieldModalProps) => {
    // Defaults para creación (no dependen de "field")
    const creationDefaults = useMemo(() => ({
        forFieNam: '',
        forFieLab: '',
        forFieTyp: 'TEXT',
        forFieReq: false,
        forFieOrd: fieldOrder, // Usar el orden pasado como prop
        forFieOpc: '',
        forFieVal: '',
        forFiePla: '',
        forFieAyu: '',
        forFieCol: 12,
        forFieMin: undefined,
        forFieMax: undefined,
        forFiePat: '',
        forFieErr: '',
        forFieVis: true,
        forFieEdi: true
    }), [fieldOrder]);

    // Datos iniciales reales a pasar al modal según el modo
    const initialData = useMemo(() => {
        if (isEditing && field) {
            // Editar: usar el registro tal cual, sin mezclar defaults
            return field;
        }
        // Crear: usar defaults limpios
        return creationDefaults;
    }, [isEditing, field, creationDefaults]);

    // Manejar envío del formulario
    const handleSubmit = async (data: any): Promise<FormSubmitResult> => {
        try {

            onSave(data);

            return {
                success: true,
                message: isEditing ? 'Campo actualizado exitosamente' : 'Campo agregado exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                error,
                message: 'Error al guardar el campo'
            };
        }
    };

    // Obtener campos del formulario (fuera de useMemo para evitar hooks dentro de useMemo)
    const editorFields = fieldEditorFields();
    
    // Configurar campos enriquecidos para el modal
    const enrichedFields = useMemo(() => {
        return Object.values(editorFields);
    }, [editorFields]);

    return (
        <FormModal
            modalVisible={isOpen}
            onClose={onClose}
            onSubmit={handleSubmit}
            title={isEditing ? 'Editar Campo' : 'Nuevo Campo'}
            initialData={initialData}
            isLoading={isLoading}
            size="lg"
            enrichedFields={enrichedFields}
            columnsCount={2}
            onAfterSubmit={onClose}
        />
    );
};