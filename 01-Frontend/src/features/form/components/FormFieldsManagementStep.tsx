import { FormField, FormType, FormStatus, FormFieldDraft } from '../types';
import { FormFieldManager } from './FormFieldManager';
import { FormPreview } from './FormPreview';

interface FormFieldsManagementStepProps {
  // Campos del formulario (simplificado)
  fields: FormFieldDraft[];
  onAddField: (fieldData: FormFieldDraft) => void;
  onEditField: (fieldId: string, fieldData: FormFieldDraft) => void;
  onDeleteField: (fieldId: string) => void;
  onReorderFields: (activeId: string, overId: string) => void;
  nextFieldId: number;
  
  // Datos del formulario para vista previa
  formData: {
    forMasNam: string;
    forMasDes?: string | undefined;
    forMasTyp: FormType;
    forMasSta: FormStatus;
    forMasYea?: string;
    forMasCod?: string;
  };
}

export function FormFieldsManagementStep({
  fields,
  onAddField,
  onEditField,
  onDeleteField,
  onReorderFields,
  nextFieldId,
  formData
}: FormFieldsManagementStepProps) {
  
  // Convertir campos draft a formato de vista previa (agregando claves principales temporales)
  const previewFields: FormField[] = fields.map((draftField: FormFieldDraft) => ({
    // Claves principales temporales (se generarán en el backend)
    forMasYea: formData.forMasYea || new Date().getFullYear().toString(),
    forMasCod: formData.forMasCod || 'TEMP',
    forFieYea: formData.forMasYea || new Date().getFullYear().toString(),
    forFieCod: draftField.id,
    // Propiedades del campo (ya están en formato backend)
    ...draftField,
    forFieSta: 'A' as const
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 overflow-auto">
        {/* Panel de gestión de campos */}
        <div className="space-y-4 order-1">
          <FormFieldManager
            fields={fields}
            onAddField={onAddField}
            onEditField={onEditField}
            onDeleteField={onDeleteField}
            onReorderFields={onReorderFields}
            nextFieldId={nextFieldId}
          />
        </div>
        <div className="space-y-4 order-2 xl:order-2 flex-1 overflow-auto">
          <div className="sticky top-4">
            <FormPreview
              form={{
                forNom: formData.forMasNam,
                forDes: formData.forMasDes,
                forTip: formData.forMasTyp,
                forEst: formData.forMasSta
              }}
              fields={previewFields}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
