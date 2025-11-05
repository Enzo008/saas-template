import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useForm } from 'react-hook-form';
import InputField from '@/shared/components/forms/fields/InputField';
import TextAreaField from '@/shared/components/forms/fields/TextAreaField';
import RadioGroupField from '@/shared/components/forms/fields/RadioGroupField';
import InputColorField from '@/shared/components/forms/fields/InputColorField';
import { Field } from '@/shared/components/forms/components/FormContent';
import { formatter, formatterBudget } from '@/lib/utils';

export default function FormFieldsExamples() {
  // Configuramos un formulario para cada tipo de campo
  const { register, formState: { errors, dirtyFields, isSubmitted }, handleSubmit, reset, control, setValue, watch } = useForm();
  
  // Definimos un campo de tipo input
  const [inputField, setInputField] = useState<Field>({
    name: 'username',
    type: 'text',
    label: 'Nombre de usuario',
    placeholder: 'Ingrese su nombre de usuario',
    required: true,
    useDecimal: false,
    validation: {
      required: 'Este campo es obligatorio',
      minLength: {
        value: 3,
        message: 'El nombre debe tener al menos 3 caracteres'
      }
    }
  });
  
  // Estado para mostrar el valor formateado (solo para demostración)
  const [formattedValue, setFormattedValue] = useState<string>('');
  
  // Observar el valor del campo de ejemplo para formatearlo
  const inputValue = watch('username');
  
  // Actualizar el valor formateado cuando cambie el valor del campo (solo para demostración)
  useEffect(() => {
    if (inputField.type === 'number' && inputValue !== undefined && inputValue !== '') {
      const numValue = parseFloat(inputValue);
      if (!isNaN(numValue)) {
        const useDecimalFormat = inputField.numberFormat === 'decimal';
        if (useDecimalFormat) {
          setFormattedValue(formatterBudget.format(numValue));
        } else {
          setFormattedValue(formatter.format(numValue));
        }
      } else {
        setFormattedValue('');
      }
    } else {
      setFormattedValue('');
    }
  }, [inputValue, inputField.type, inputField.numberFormat]);
  
  // Definimos un campo de tipo textarea
  const [textAreaField, setTextAreaField] = useState<Field>({
    name: 'description',
    type: 'textarea',
    label: 'Descripción',
    placeholder: 'Ingrese una descripción detallada',
    rows: 4,
    maxLength: 500,
    validation: {
      maxLength: {
        value: 500,
        message: 'La descripción no puede exceder los 500 caracteres'
      }
    }
  });
  
  // Definimos un campo de tipo radiogroup
  const [radioGroupField, setRadioGroupField] = useState<Field>({
    name: 'sex',
    type: 'radiogroup',
    label: 'Sexo',
    options: [
      { value: 'M', label: 'Masculino' },
      { value: 'F', label: 'Femenino' },
      { value: 'O', label: 'Otro' }
    ],
    required: true,
    orientation: 'horizontal',
    validation: {
      required: 'Debe seleccionar una opción'
    },
    helpText: 'Seleccione su sexo biológico'
  });
  
  // Definimos un campo de tipo color
  const [colorField] = useState<Field>({
    name: 'favoriteColor',
    type: 'color',
    label: 'Color favorito',
    required: false
  });

  // Función para manejar el envío del formulario
  const onSubmit = (data: any) => {
    console.log('Datos enviados:', data);
    alert(JSON.stringify(data, null, 2));
  };

  // Función para cambiar el tipo de input
  const changeInputType = (type: 'text' | 'number') => {
    setInputField(prev => ({
      ...prev,
      type: type,
      placeholder: `Ingrese ${type === 'text' ? 'texto' : 'un número'}`,
      // Para números, agregamos validación específica
      validation: type === 'number' 
        ? {
            required: 'Este campo es obligatorio',
            min: {
              value: 0,
              message: 'El valor debe ser mayor o igual a 0'
            },
            max: {
              value: 1000000,
              message: 'El valor debe ser menor o igual a 1,000,000'
            }
          }
        : {
            required: 'Este campo es obligatorio',
            minLength: {
              value: 3,
              message: 'El nombre debe tener al menos 3 caracteres'
            }
          }
    }));
    reset();
  };
  
  // Función para cambiar el formato decimal
  const toggleDecimalFormat = (format: 'integer' | 'decimal') => {
    setInputField(prev => ({
      ...prev,
      numberFormat: format,
      useDecimal: format === 'decimal' // Mantener compatibilidad con useDecimal
    }));
  };

  // Función para cambiar la orientación del RadioGroup
  const toggleOrientation = (orientation: 'horizontal' | 'vertical') => {
    setRadioGroupField(prev => ({
      ...prev,
      orientation
    }));
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Ejemplos de Campos de Formulario</h1>
      <p className="text-muted-foreground mb-6">
        Esta página muestra ejemplos de los diferentes campos de formulario personalizados disponibles en la aplicación.
      </p>
      
      <Tabs defaultValue="input">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="input">Input Field</TabsTrigger>
          <TabsTrigger value="textarea">TextArea Field</TabsTrigger>
          <TabsTrigger value="radio">Radio Field</TabsTrigger>
          <TabsTrigger value="radiogroup">RadioGroup Field</TabsTrigger>
          <TabsTrigger value="color">Color Field</TabsTrigger>
        </TabsList>
        
        <TabsContent value="input">
          <Card>
            <CardHeader>
              <CardTitle>Input Field</CardTitle>
              <CardDescription>
                Campo de entrada básico para texto, números, email y contraseñas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-2">
                <Button onClick={() => changeInputType('text')}>Tipo Texto</Button>
                <Button onClick={() => changeInputType('number')}>Tipo Número</Button>
              </div>
              
              {inputField.type === 'number' && (
                <div className="mb-4 flex flex-wrap gap-2">
                  <Button 
                    variant={inputField.numberFormat === 'integer' ? "default" : "outline"}
                    onClick={() => toggleDecimalFormat('integer')}
                  >
                    Formato Entero
                  </Button>
                  <Button 
                    variant={inputField.numberFormat === 'decimal' ? "default" : "outline"}
                    onClick={() => toggleDecimalFormat('decimal')}
                  >
                    Formato Decimal
                  </Button>
                </div>
              )}
              
              <div className="mb-4 p-4 bg-muted rounded-md">
                <h3 className="text-sm font-medium mb-2">Instrucciones:</h3>
                <p className="text-sm text-muted-foreground">
                  {inputField.type === 'number' 
                    ? "Ingrese un valor numérico para ver el formateo automático en tiempo real con separadores de miles y decimales. El valor se formatea mientras escribe." 
                    : "Ingrese texto para probar la validación de longitud mínima."}
                </p>
                {inputField.type === 'number' && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Formato actual:</strong> {inputField.useDecimal ? "Decimal (con 2 decimales)" : "Entero (sin decimales)"}
                  </p>
                )}
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <InputField
                  field={inputField}
                  register={register}
                  errors={errors}
                  dirtyFields={dirtyFields}
                  control={control}
                  setValue={setValue}
                  watch={watch}
                  isSubmitted={isSubmitted}
                />
                
                <Button type="submit">Enviar</Button>
              </form>
              
              {/* Mostrar valor formateado solo para números en el ejemplo */}
              {inputField.type === 'number' && inputValue && formattedValue && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Valor formateado:</strong> <span className="font-mono">{formattedValue}</span>
                    <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                      {inputField.numberFormat === 'decimal' ? 'Decimal' : 'Entero'}
                    </span>
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Este formateo se configura mediante el parámetro <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">numberFormat</code>
                  </p>
                </div>
              )}
              
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h3 className="text-sm font-medium mb-2">Configuración del campo:</h3>
                <pre className="text-xs overflow-auto">{JSON.stringify(inputField, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="textarea">
          <Card>
            <CardHeader>
              <CardTitle>TextArea Field</CardTitle>
              <CardDescription>
                Campo para entrada de texto multilínea, ideal para descripciones largas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-2">
                <Button onClick={() => setTextAreaField(prev => ({ ...prev, rows: 2 }))}>2 Filas</Button>
                <Button onClick={() => setTextAreaField(prev => ({ ...prev, rows: 4 }))}>4 Filas</Button>
                <Button onClick={() => setTextAreaField(prev => ({ ...prev, rows: 6 }))}>6 Filas</Button>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <TextAreaField
                  field={textAreaField}
                  register={register}
                  errors={errors}
                  dirtyFields={dirtyFields}
                  control={control}
                  setValue={setValue}
                  watch={watch}
                  isSubmitted={isSubmitted}
                />
                
                <Button type="submit">Enviar</Button>
              </form>
              
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h3 className="text-sm font-medium mb-2">Configuración del campo:</h3>
                <pre className="text-xs overflow-auto">{JSON.stringify(textAreaField, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radiogroup">
          <Card>
            <CardHeader>
              <CardTitle>RadioGroup Field</CardTitle>
              <CardDescription>
                Campo de tipo RadioGroup para seleccionar una opción entre varias con mejor experiencia de usuario.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-2">
                <Button 
                  variant={radioGroupField.orientation === 'horizontal' ? "default" : "outline"}
                  onClick={() => toggleOrientation('horizontal')}
                >
                  Orientación Horizontal
                </Button>
                <Button 
                  variant={radioGroupField.orientation === 'vertical' ? "default" : "outline"}
                  onClick={() => toggleOrientation('vertical')}
                >
                  Orientación Vertical
                </Button>
              </div>

              <div className="mb-4 p-4 bg-muted rounded-md">
                <h3 className="text-sm font-medium mb-2">Instrucciones:</h3>
                <p className="text-sm text-muted-foreground">
                  Seleccione una opción para ver cómo funciona el campo de tipo RadioGroup.
                  Puede cambiar la orientación entre horizontal y vertical usando los botones superiores.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Orientación actual:</strong> {radioGroupField.orientation === 'horizontal' ? "Horizontal" : "Vertical"}
                </p>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <RadioGroupField
                  field={radioGroupField}
                  register={register}
                  errors={errors}
                  dirtyFields={dirtyFields}
                  control={control}
                  setValue={setValue}
                  watch={watch}
                  isSubmitted={isSubmitted}
                />
                
                <Button type="submit">Enviar</Button>
              </form>
              
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h3 className="text-sm font-medium mb-2">Configuración del campo:</h3>
                <pre className="text-xs overflow-auto">{JSON.stringify(radioGroupField, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="color">
          <Card>
            <CardHeader>
              <CardTitle>Color Field</CardTitle>
              <CardDescription>
                Campo para seleccionar un color con selector visual y entrada hexadecimal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <InputColorField
                  field={colorField}
                  register={register}
                  errors={errors}
                  dirtyFields={dirtyFields}
                  control={control}
                  setValue={setValue}
                  watch={watch}
                  isSubmitted={isSubmitted}
                />
                
                <Button type="submit">Enviar</Button>
              </form>
              
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h3 className="text-sm font-medium mb-2">Configuración del campo:</h3>
                <pre className="text-xs overflow-auto">{JSON.stringify(colorField, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
