import { UseFormRegister, Control, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { basicInfoFields } from '../config/formFields';
import { SmartFormLayout } from '@/shared/components/forms/layouts';
import { renderField } from '@/shared/components/forms/utils/FieldRenderer';
import { FieldProps } from '@/shared/components/forms/components/FormContent';

interface FormBasicInfoStepProps {
  register: UseFormRegister<any>;
  control: Control<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  dirtyFields: Record<string, boolean>;
  isSubmitted: boolean;
}

export function FormBasicInfoStep({
  register,
  control,
  errors,
  watch,
  setValue,
  dirtyFields,
  isSubmitted
}: FormBasicInfoStepProps) {

  // Función para renderizar cada campo con las props necesarias
  const renderFieldWithProps = (field: any) => {
    const fieldProps: FieldProps = {
      field,
      register,
      errors,
      control,
      setValue,
      watch,
      dirtyFields,
      isSubmitted
    };
    return renderField(fieldProps);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado descriptivo */}
      <div className="border-l-4 border-primary bg-muted/30 p-4 rounded-r-lg">
        <h3 className="text-lg font-medium mb-2">Configuración del Formulario</h3>
        <p className="text-sm text-muted-foreground">
          Configure la información general del formulario. Los campos se organizan automáticamente por secciones.
        </p>
      </div>

      {/* Usar SmartFormLayout con los campos del nuevo sistema */}
      <SmartFormLayout
        fields={basicInfoFields()}
        renderField={renderFieldWithProps}
        className="space-y-6"
      />

      {/* Campo adicional que no está en la configuración estándar */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="text-md font-medium mb-3">Opciones Adicionales</h4>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="forMasMul"
            {...register('forMasMul')}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="forMasMul" className="text-sm font-medium">
            Permitir múltiples respuestas por usuario
          </label>
          <span className="text-xs text-muted-foreground ml-2">
            (Los usuarios podrán enviar el formulario varias veces)
          </span>
        </div>
      </div>
    </div>
  );
}
