/**
 * Página para crear y editar formularios dinámicos con flujo multi-pasos
 * Paso 1: Información básica del formulario
 * Paso 2: Gestión de fields del formulario
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { MultiStepFormWrapper } from '@/shared/components/forms/layouts';
import { MultiStepFormStep } from '@/shared/components/forms/layouts/MultiStepFormWrapper';
import { useFormCrud } from '../hooks/useFormCrud';
import { FormBasicInfoStep } from '../components/FormBasicInfoStep';
import { FormFieldsManagementStep } from '../components/FormFieldsManagementStep';
import { Form, FormFieldDraft } from '../types';
import { useMultiStepCrud } from '@/shared/hooks';

// Tipo para el formulario básico (paso 1)
interface FormBasicInfoData {
  forMasNam: string;
  forMasDes?: string;
  forMasTyp: 'GENERAL' | 'ENCUESTA' | 'EVALUACION' | 'REGISTRO' | 'SOLICITUD';
  forMasSta: 'A' | 'I';
  forMasMul?: boolean;
  forMasDatSta?: string;
  forMasDatEnd?: string;
  forMasOrd?: number;
}

export default function FormMultiStepPage() {
  // Estados para gestión de fields
  const [nextFieldId, setNextFieldId] = useState(1);
  
  // Hook multi-paso centralizado
  const {
    formState,
    currentStep,
    isLoading,
    selectedItem,
    updateFormState,
    handleNext: handleNextBase,
    handlePrevious,
    handleSubmit,
    handleCancel
  } = useMultiStepCrud<Form>({
    totalSteps: 2,
    crudHook: useFormCrud({ mode: 'page' }),
    
    // Personalización: Cargar datos iniciales
    onLoadInitialData: (form) => {
      const basicData: FormBasicInfoData = {
        forMasNam: form.forMasNam || '',
        forMasDes: form.forMasDes || '',
        forMasTyp: form.forMasTyp || 'GENERAL',
        forMasSta: form.forMasSta || 'A',
        forMasMul: form.forMasMul || false,
        forMasDatSta: form.forMasDatSta || '',
        forMasDatEnd: form.forMasDatEnd || '',
        forMasOrd: form.forMasOrd || 1
      };
      
      // Convertir fields del servidor a drafts
      const fields = form.fields?.map((field, index) => ({
        id: `field-${index + 1}`,
        forFieYea: field.forFieYea,
        forFieCod: field.forFieCod,
        forFieNam: field.forFieNam,
        forFieLab: field.forFieLab,
        forFieTyp: field.forFieTyp,
        forFieReq: field.forFieReq,
        forFieOrd: field.forFieOrd,
        forFieOpt: field.forFieOpt || '',
        forFieVal: field.forFieVal || '',
        forFiePla: field.forFiePla || '',
        forFieHel: field.forFieHel || '',
        forFieCol: field.forFieCol || 12,
        forFieMin: field.forFieMin || 0,
        forFieMax: field.forFieMax || 0,
        forFiePat: field.forFiePat || '',
        forFieErr: field.forFieErr || '',
        forFieSta: field.forFieSta || 'A',
        forFieVis: field.forFieVis !== false,
        forFieEdi: field.forFieEdi !== false,
        options: field.options || []
      } as FormFieldDraft)) || [];
      
      // Actualizar el próximo ID de campo
      const maxFieldId = form.fields?.length || 0;
      setNextFieldId(maxFieldId + 1);
      
      return {
        basicInfo: basicData,
        fields
      };
    },
    
    // Personalización: Preparar datos para submit
    onPrepareSubmitData: (state) => {
      const payload: Partial<Form> = {
        // Datos básicos
        forMasNam: state['basicInfo'].forMasNam,
        forMasDes: state['basicInfo'].forMasDes || '',
        forMasTip: state['basicInfo'].forMasTip,
        forMasSta: state['basicInfo'].forMasSta,
        forMasMul: state['basicInfo'].forMasMul || false,
        forMasDatSta: state['basicInfo'].forMasDatSta || '',
        forMasDatEnd: state['basicInfo'].forMasDatEnd || '',
        forMasOrd: state['basicInfo'].forMasOrd || 1,
        
        // fields (limpiar IDs temporales)
        fields: state['fields'].map((field: FormFieldDraft) => {
          const { id, ...cleanField } = field;
          return cleanField;
        })
      };
      
      // Si estamos editando, agregar las PKs
      if (selectedItem) {
        payload.forMasYea = selectedItem.forMasYea;
        payload.forMasCod = selectedItem.forMasCod;
        
        // Asegurar que los fields tengan las PKs del formulario padre
        payload.fields = payload.fields?.map(field => ({
          ...field,
          forMasYea: selectedItem.forMasYea,
          forMasCod: selectedItem.forMasCod
        })) || [];
      }
      
      return payload as Form;
    },
    
    navigateOnSuccess: '/form',
    navigateOnCancel: '/form'
  });

  // Form para el paso 1 (información básica) - SIN zodResolver
  const basicInfoForm = useForm<FormBasicInfoData>({
    mode: 'onChange',
    defaultValues: formState['basicInfo'] || {
      forMasNam: '',
      forMasDes: '',
      forMasTyp: 'GENERAL' as const,
      forMasSta: 'A' as const,
      forMasMul: false,
      forMasDatSta: '',
      forMasDatEnd: '',
      forMasOrd: 1
    }
  });

  // Sincronizar form con formState cuando se cargan datos
  useEffect(() => {
    if (formState['basicInfo']) {
      basicInfoForm.reset(formState['basicInfo']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState['basicInfo']]); // Solo cuando cambia basicInfo específicamente

  // Manejar submit del paso 1 con validación RHF
  const handleStep1Next = () => {
    basicInfoForm.handleSubmit(
      (data) => {
        updateFormState({ basicInfo: data });
        handleNextBase();
      },
      (errors) => {
        console.log('❌ Errores de validación:', errors);
      }
    )();
  };

  // Función para agregar un campo al formulario
  const handleAddField = (fieldData: FormFieldDraft) => {
    const currentFields = formState['fields'] || [];
    const newField = {
      ...fieldData,
      forFieOrd: currentFields.length + 1 // Orden automático correlativo
    };

    updateFormState({
      fields: [...currentFields, newField]
    });

    // Incrementar el ID para el siguiente campo
    setNextFieldId(prev => prev + 1);
  };

  // Función para editar un campo existente
  const handleEditField = (fieldId: string, fieldData: FormFieldDraft) => {
    const currentFields = formState['fields'] || [];
    updateFormState({
      fields: currentFields.map((campo: FormFieldDraft) =>
        campo.id === fieldId ? fieldData : campo
      )
    });
  };

  // Función para eliminar un campo
  const handleDeleteField = (fieldId: string) => {
    const currentFields = formState['fields'] || [];
    const filteredfields = currentFields.filter((campo: FormFieldDraft) => campo.id !== fieldId);

    // Reordenar automáticamente después de eliminar
    const reorderedfields = filteredfields.map((campo: FormFieldDraft, index: number) => ({
      ...campo,
      forFieOrd: index + 1 // Correlativo perfecto: 1, 2, 3, 4, 5...
    }));

    updateFormState({ fields: reorderedfields });
  };

  // Función para reordenar campos con drag & drop
  const handleReorderFields = (activeId: string, overId: string) => {
    const currentFields = formState['fields'] || [];
    
    const activeIndex = currentFields.findIndex((field: FormFieldDraft) => field.id === activeId);
    const overIndex = currentFields.findIndex((field: FormFieldDraft) => field.id === overId);

    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
      return;
    }

    // Crear nueva lista reordenada
    const newFields = [...currentFields];
    const [reorderedItem] = newFields.splice(activeIndex, 1);
    newFields.splice(overIndex, 0, reorderedItem);

    // Actualizar el orden correlativo de TODOS los campos
    const reorderedFields = newFields.map((field, index) => ({
      ...field,
      forFieOrd: index + 1 // Correlativo perfecto: 1, 2, 3, 4, 5...
    }));

    // ✅ Una sola actualización de estado con todos los campos
    updateFormState({ fields: reorderedFields });
  };

  // Configuración de pasos
  const steps: MultiStepFormStep[] = [
    {
      id: 1,
      title: 'Información Básica',
      description: 'Configure los datos generales del formulario',
      completed: !!formState['basicInfo'] && currentStep !== 1,
      disabled: false,
      content: (
        <FormBasicInfoStep
          register={basicInfoForm.register}
          control={basicInfoForm.control}
          errors={basicInfoForm.formState.errors}
          watch={basicInfoForm.watch}
          setValue={basicInfoForm.setValue}
          dirtyFields={basicInfoForm.formState.dirtyFields}
          isSubmitted={basicInfoForm.formState.isSubmitted}
        />
      )
    },
    {
      id: 2,
      title: 'Gestión de fields',
      description: 'Agregue y configure los fields del formulario',
      completed: formState['fields']?.length > 0 && currentStep !== 2,
      disabled: !formState['basicInfo'],
      content: (
        <FormFieldsManagementStep
          fields={formState['fields'] || []}
          onAddField={handleAddField}
          onEditField={handleEditField}
          onDeleteField={handleDeleteField}
          onReorderFields={handleReorderFields}
          nextFieldId={nextFieldId}
          formData={formState['basicInfo'] || {
            forMasNam: '',
            forMasDes: '',
            forMasTyp: 'GENERAL' as const,
            forMasSta: 'A' as const
          }}
        />
      )
    }
  ];

  const fieldsCount = formState['fields']?.length;

  return (
    <MultiStepFormWrapper
      steps={steps}
      currentStep={currentStep}
      title={selectedItem ? 'Editar Formulario' : 'Crear Formulario'}
      subtitle="Configura tu formulario dinámico paso a paso"
      isLoading={isLoading}
      isEditing={selectedItem !== null}
      selectedItem={selectedItem}
      onNext={currentStep === 1 ? handleStep1Next : handleNextBase}
      onPrevious={handlePrevious}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitLabel={selectedItem ? 'Actualizar Formulario' : 'Crear Formulario'}
      canSubmit={fieldsCount > 0 && formState['basicInfo'] !== null}
      submitDisabledReason={
        !formState['basicInfo'] ? 'Completa la información básica del formulario' :
          fieldsCount === 0 ? 'Debes agregar al menos un campo al formulario' : ''
      }
    />
  );
}
