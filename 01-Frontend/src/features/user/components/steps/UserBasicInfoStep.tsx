/**
 * Paso 1 del flujo multi-paso: Información básica del usuario
 */

import { UserCustomForm } from '../UserCustomForm';

interface UserBasicInfoStepProps {
  register: any;
  control: any;
  errors: any;
  watch: any;
  setValue: any;
  dirtyFields: Record<string, any>;
  isSubmitted: boolean;
  isEditing: boolean;
}

export const UserBasicInfoStep = ({
  register,
  control,
  errors,
  watch,
  setValue,
  dirtyFields,
  isSubmitted,
  isEditing
} : UserBasicInfoStepProps) => {
  return (
    <div className="space-y-6">
      {/* Formulario de información básica (reutilizamos el componente existente) */}
      <UserCustomForm
        register={register}
        control={control}
        errors={errors}
        watch={watch}
        setValue={setValue}
        dirtyFields={dirtyFields}
        isSubmitted={isSubmitted}
        isEditing={isEditing}
      />
    </div>
  );
};
