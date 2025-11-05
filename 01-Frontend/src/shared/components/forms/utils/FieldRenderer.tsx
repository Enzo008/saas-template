/**
 * Renderizador unificado de campos de formulario
 * Consolida la lógica de renderizado que estaba duplicada en FormContent y SmartFormLayout
 */

import InputField from '../fields/InputField';
import InputCheckboxField from '../fields/InputCheckboxField';
import SelectField from '../fields/SelectField';
import TextAreaField from '../fields/TextAreaField';
import RadioGroupField from '../fields/RadioGroupField';
import InputColorField from '../fields/InputColorField';
import PhoneInputField from '../fields/PhoneInputField';
import { FieldProps } from '../components/FormContent';

/**
 * Renderiza un campo según su tipo
 * @param field - Configuración del campo
 * @param fieldProps - Props necesarias para el campo (register, errors, control, etc.)
 * @returns Componente del campo correspondiente
 */
export const renderField = (fieldProps: FieldProps) => {
  const { field } = fieldProps;

  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'number':
    case 'date':
      return <InputField key={field.name} {...fieldProps} />;
    
    case 'phone':
      return <PhoneInputField key={field.name} {...fieldProps} />;
    
    case 'textarea':
      return <TextAreaField key={field.name} {...fieldProps} />;
    
    case 'select':
      return <SelectField key={field.name} {...fieldProps} />;
    
    case 'checkbox':
      return <InputCheckboxField key={field.name} {...fieldProps} />;
    
    case 'radio':
    case 'radiogroup':
      return <RadioGroupField key={field.name} {...fieldProps} />;
    
    case 'color':
      return <InputColorField key={field.name} {...fieldProps} />;
    
    default:
      console.warn(`Tipo de campo no soportado: ${field.type}`);
      return <InputField key={field.name} {...fieldProps} />;
  }
};
