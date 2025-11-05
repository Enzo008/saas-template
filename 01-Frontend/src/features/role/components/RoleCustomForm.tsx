/**
 * Formulario personalizado para roles - renderizado manual de campos
 * Siguiendo el patrón de UserCustomForm
 */
import InputField from '@/shared/components/forms/fields/InputField';
import { roleFormFields } from '../config/formFields';
import { Field } from '@/shared/components/overlays';
interface RoleCustomFormProps {
  register: any;
  control: any;
  errors: any;
  watch?: any;
  setValue: any;
  dirtyFields: Record<string, boolean>;
  isSubmitted: boolean;
}

export const RoleCustomForm = ({
  register,
  control,
  errors,
  watch,
  setValue,
  dirtyFields,
  isSubmitted
}: RoleCustomFormProps) => {

  const fields: Record<string, Field> = {};
  
  roleFormFields().forEach(field => {
    fields[field.name] = field;
  });
  
  
  return (
    <div className="space-y-6">
      {/* Sección: Información Básica del Rol */}
      <div className="bg-muted/50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium mb-2">Información Básica</h3>
        <p className="text-sm text-muted-foreground">
          Ingrese la información del rol. El código se genera automáticamente.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Nombre del Rol */}
        {fields['rolNam'] && (
          <InputField
            field={fields['rolNam']}
            register={register}
            errors={errors}
            control={control}
            setValue={setValue}
            watch={watch}
            dirtyFields={dirtyFields}
            isSubmitted={isSubmitted}
          />
        )}
      </div>
    </div>
  );
};
