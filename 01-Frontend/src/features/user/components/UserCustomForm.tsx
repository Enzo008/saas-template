/**
 * Formulario personalizado para usuarios - renderizado dinámico de campos
 */
import { Field } from '@/shared/components/forms/components/FormContent';
import InputField from '@/shared/components/forms/fields/InputField';
import SelectField from '@/shared/components/forms/fields/SelectField';
import RadioGroupField from '@/shared/components/forms/fields/RadioGroupField';
import PhoneInputField from '@/shared/components/forms/fields/PhoneInputField';
import { userFormFields } from '../config/formFields';

interface UserCustomFormProps {
  register: any;
  control: any;
  errors: any;
  watch?: any;
  setValue: any;
  dirtyFields: Record<string, boolean>;
  isSubmitted: boolean;
  isEditing: boolean;
}

export const UserCustomForm = ({
  register,
  control,
  errors,
  watch,
  setValue,
  dirtyFields,
  isSubmitted,
  isEditing
}: UserCustomFormProps) => {
  // Creamos un objeto con los campos para facilitar su acceso
  const fields: Record<string, Field> = {};
  
  userFormFields().forEach(field => {
    fields[field.name] = field;
  });

  return (
    <div className="space-y-6">
      {/* Sección: Información Personal */}
      <div className="bg-muted/50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium mb-2">Información Personal</h3>
        <p className="text-sm text-muted-foreground">
          Ingrese la información personal del usuario. Todos los campos marcados con * son obligatorios.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tipo de Documento */}
        {fields['ideDocCod'] && (
          <div className="animate-in fade-in duration-300">
            <SelectField
              field={fields['ideDocCod']}
              register={register}
              errors={errors}
              control={control}
              setValue={setValue}
              watch={watch}
              dirtyFields={dirtyFields}
              isSubmitted={isSubmitted}
            />
          </div>
        )}

        {/* Número de Documento */}
        {fields['useNumDoc'] && (
          <div className="animate-in fade-in duration-300" style={{ animationDelay: '50ms' }}>
            <InputField
              field={fields['useNumDoc']}
              register={register}
              errors={errors}
              control={control}
              setValue={setValue}
              watch={watch}
              dirtyFields={dirtyFields}
              isSubmitted={isSubmitted}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        {fields['useNam'] && (
          <div className="animate-in fade-in duration-300" style={{ animationDelay: '100ms' }}>
            <InputField
              field={fields['useNam']}
              register={register}
              errors={errors}
              control={control}
              setValue={setValue}
              watch={watch}
              dirtyFields={dirtyFields}
              isSubmitted={isSubmitted}
            />
          </div>
        )}

        {/* Apellido */}
        {fields['useLas'] && (
          <div className="animate-in fade-in duration-300" style={{ animationDelay: '150ms' }}>
            <InputField
              field={fields['useLas']}
              register={register}
              errors={errors}
              control={control}
              setValue={setValue}
              watch={watch}
              dirtyFields={dirtyFields}
              isSubmitted={isSubmitted}
            />
          </div>
        )}
      </div>

      {/* Sexo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields['useSex'] && (
          <div className="animate-in fade-in duration-300" style={{ animationDelay: '200ms' }}>
            <RadioGroupField
              field={fields['useSex']}
              register={register}
              errors={errors}
              control={control}
              setValue={setValue}
              watch={watch}
              dirtyFields={dirtyFields}
              isSubmitted={isSubmitted}
            />
          </div>
        )}
        {fields['useSta'] && (
          <div className="animate-in fade-in duration-300" style={{ animationDelay: '200ms' }}>
            <RadioGroupField
              field={fields['useSta']}
              register={register}
              errors={errors}
              control={control}
              setValue={setValue}
              watch={watch}
              dirtyFields={dirtyFields}
              isSubmitted={isSubmitted}
            />
          </div>
        )}
      </div>

      {/* Fecha de Nacimiento */}
      {fields['useBir'] && (
        <div className="grid grid-cols-1 gap-6">
          <div className="animate-in fade-in duration-300" style={{ animationDelay: '350ms' }}>
            <InputField
              field={fields['useBir']}
              register={register}
              errors={errors}
              control={control}
              setValue={setValue}
              watch={watch}
              dirtyFields={dirtyFields}
              isSubmitted={isSubmitted}
            />
          </div>
        </div>
      )}

      {/* Sección: Información de Contacto */}
      <div className="bg-muted/50 p-4 rounded-lg mb-6 mt-8">
        <h3 className="text-lg font-medium mb-2">Información de Contacto</h3>
        <p className="text-sm text-muted-foreground">
          Ingrese la información de contacto del usuario.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Correo Electrónico */}
        {fields['useEma'] && (
          <div className="animate-in fade-in duration-300" style={{ animationDelay: '400ms' }}>
            <InputField
              field={fields['useEma']}
              register={register}
              errors={errors}
              control={control}
              setValue={setValue}
              watch={watch}
              dirtyFields={dirtyFields}
              isSubmitted={isSubmitted}
            />
          </div>
        )}

        {/* Teléfono */}
        {fields['usePho'] && (
          <div className="animate-in fade-in duration-300" style={{ animationDelay: '450ms' }}>
            <PhoneInputField
              field={fields['usePho']}
              register={register}
              errors={errors}
              control={control}
              setValue={setValue}
              watch={watch}
              dirtyFields={dirtyFields}
              isSubmitted={isSubmitted}
            />
          </div>
        )}
      </div>

      {/* Sección: Ubicación */}
      <div className="bg-muted/50 p-4 rounded-lg mb-6 mt-8">
        <h3 className="text-lg font-medium mb-2">Ubicación</h3>
        <p className="text-sm text-muted-foreground">
          Seleccione la ubicación del usuario.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ubicación */}
        {fields['location'] && (
          <div className="animate-in fade-in duration-300" style={{ animationDelay: '500ms' }}>
            <SelectField
              field={fields['location']}
              register={register}
              errors={errors}
              control={control}
              setValue={setValue}
              watch={watch}
              dirtyFields={dirtyFields}
              isSubmitted={isSubmitted}
            />
          </div>
        )}

        {/* Repositorio */}
        {fields['repository'] && (
          <div className="animate-in fade-in duration-300" style={{ animationDelay: '525ms' }}>
            <SelectField
              field={fields['repository']}
              register={register}
              errors={errors}
              control={control}
              setValue={setValue}
              watch={watch}
              dirtyFields={dirtyFields}
              isSubmitted={isSubmitted}
            />
          </div>
        )}
      </div>

      {/* Sección: Información Laboral */}
      <div className="bg-muted/50 p-4 rounded-lg mb-6 mt-8">
        <h3 className="text-lg font-medium mb-2">Información Laboral</h3>
        <p className="text-sm text-muted-foreground">
          Ingrese la información laboral del usuario.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cargo */}
        {fields['posCod'] && (
          <div className="animate-in fade-in duration-300" style={{ animationDelay: '550ms' }}>
            <SelectField
              field={fields['posCod']}
              register={register}
              errors={errors}
              control={control}
              setValue={setValue}
              watch={watch}
              dirtyFields={dirtyFields}
              isSubmitted={isSubmitted}
            />
          </div>
        )}

        {/* Rol */}
        {fields['rolCod'] && (
          <div className="animate-in fade-in duration-300" style={{ animationDelay: '575ms' }}>
            <SelectField
              field={fields['rolCod']}
              register={register}
              errors={errors}
              control={control}
              setValue={setValue}
              watch={watch}
              dirtyFields={dirtyFields}
              isSubmitted={isSubmitted}
            />
          </div>
        )}
      </div>
      
      {
        !isEditing && (
          <>
            {/* Sección: Seguridad */}
            <div className="bg-muted/50 p-4 rounded-lg mb-6 mt-8">
              <h3 className="text-lg font-medium mb-2">Seguridad</h3>
              <p className="text-sm text-muted-foreground">
                Configure las credenciales de acceso del usuario.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Contraseña */}
              {fields['usePas'] && (
                <div className="animate-in fade-in duration-300" style={{ animationDelay: '650ms' }}>
                  <InputField
                    field={fields['usePas']}
                    register={register}
                    errors={errors}
                    control={control}
                    setValue={setValue}
                    watch={watch}
                    dirtyFields={dirtyFields}
                    isSubmitted={isSubmitted}
                  />
                </div>
              )}
            </div>
          </>
        )
      }
      
    </div>
  );
};
