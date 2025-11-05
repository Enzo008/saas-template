import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useForm } from 'react-hook-form';
import SelectField from '@/shared/components/forms/fields/SelectField';
import { Field } from '@/shared/components/forms/components/FormContent';

export default function DynamicSelectFieldExample() {
  // Configuramos un formulario para los ejemplos
  const { formState: { errors, dirtyFields, isSubmitted }, handleSubmit, control, setValue, watch, register } = useForm();

  // Ejemplo 1: Select con opciones estáticas
  const [staticSelectField] = useState<Field>({
    name: 'nationality',
    type: 'select',
    label: 'Nacionalidad',
    placeholder: 'Seleccione su nacionalidad',
    fieldType: 'simple', // Tipo de campo: simple (valor único)
    keyField: 'value', // Campo que contiene el valor
    options: [
      { value: 'ar', label: 'Argentina' },
      { value: 'bo', label: 'Bolivia' },
      { value: 'br', label: 'Brasil' },
      { value: 'cl', label: 'Chile' },
      { value: 'co', label: 'Colombia' },
      { value: 'ec', label: 'Ecuador' },
      { value: 'mx', label: 'México' },
      { value: 'pe', label: 'Perú' },
      { value: 'uy', label: 'Uruguay' },
      { value: 've', label: 'Venezuela' }
    ],
    isClearable: true
  });

  // Ejemplo 2: Select con carga dinámica desde endpoint
  const [dynamicSelectField] = useState<Field>({
    name: 'genCod',
    type: 'select',
    label: 'Género',
    placeholder: 'Seleccione el género',
    fieldType: 'simple', // Tipo de campo: simple (valor único)
    endpoint: 'Genero', // Endpoint para cargar opciones
    keyField: 'genCod', // Campo que contiene el valor (reemplaza objectKey)
    labelKey: 'genNom', // Campo que contiene la etiqueta
    isClearable: true
  });

  // Ejemplo 3: Select con clave compuesta
  const [compositeKeySelectField] = useState<Field>({
    name: 'location',
    type: 'select',
    label: 'Ubicación',
    placeholder: 'Seleccione la ubicación',
    fieldType: 'composite', // Tipo de campo: compuesto (múltiples valores)
    endpoint: 'Ubicacion',
    keyField: ['ubiAno', 'ubiCod'], // Campos que forman la clave compuesta (reemplaza compositeKeys)
    labelKey: 'ubiNom', // Campo para mostrar como etiqueta
    isClearable: true,
    // Campos dependientes que se actualizan automáticamente al seleccionar
    // Solo necesitamos definir campos adicionales que no son parte de la clave
    dependentFields: [
      {
        sourceField: 'ubiNom',
        targetField: 'ubiNom' // Guardamos el nombre en un campo separado
      }
      // No necesitamos definir ubiAno y ubiCod aquí, se extraerán automáticamente
      // por ser parte de keyField
    ]
  });

  // Nota: Se eliminó el ejemplo de select con función personalizada para simplificar

  // Ejemplo 5: Select con selección múltiple
  const [multiSelectField] = useState<Field>({
    name: 'ubicaciones',
    type: 'select',
    label: 'Ubicaciones',
    placeholder: 'Seleccione la ubicación',
    fieldType: 'composite', // Tipo de campo: simple (valor único)
    keyField: ['ubiAno', 'ubiCod'], // Campo que contiene el valor
    isMulti: true,
    endpoint: 'Ubicacion',
    labelKey: 'ubiNom',
    isClearable: true
  });

  // Función para manejar el envío del formulario
  const onSubmit = (data: any) => {
    console.log('Datos enviados:', data);
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Ejemplos de SelectField Mejorado</h1>
      <p className="text-muted-foreground mb-6">
        Esta página muestra ejemplos del componente SelectField mejorado con soporte para carga dinámica, claves compuestas y más.
      </p>
      
      <Tabs defaultValue="static">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="static">Estático</TabsTrigger>
          <TabsTrigger value="dynamic">Dinámico</TabsTrigger>
          <TabsTrigger value="composite">Clave Compuesta</TabsTrigger>
          <TabsTrigger value="multi">Multi-Selección</TabsTrigger>
        </TabsList>
        
        <TabsContent value="static">
          <Card>
            <CardHeader>
              <CardTitle>Select con Opciones Estáticas</CardTitle>
              <CardDescription>
                Campo de selección con opciones predefinidas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <SelectField
                  field={staticSelectField}
                  errors={errors}
                  dirtyFields={dirtyFields}
                  control={control}
                  setValue={setValue}
                  isSubmitted={isSubmitted}
                  register={register}
                  watch={watch}
                />
                
                <Button type="submit">Enviar</Button>
              </form>
              
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h3 className="text-sm font-medium mb-2">Configuración del campo:</h3>
                <pre className="text-xs overflow-auto">{JSON.stringify(staticSelectField, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dynamic">
          <Card>
            <CardHeader>
              <CardTitle>Select con Carga Dinámica</CardTitle>
              <CardDescription>
                Campo de selección que carga opciones desde un endpoint.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-muted rounded-md">
                <h3 className="text-sm font-medium mb-2">Instrucciones:</h3>
                <p className="text-sm text-muted-foreground">
                  Este select carga datos dinámicamente desde un endpoint. Al hacer clic en el campo, se cargarán las opciones disponibles.
                  También puede escribir para filtrar las opciones.
                </p>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <SelectField
                  field={dynamicSelectField}
                  errors={errors}
                  dirtyFields={dirtyFields}
                  control={control}
                  setValue={setValue}
                  isSubmitted={isSubmitted}
                  register={register}
                  watch={watch}
                />
                
                <Button type="submit">Enviar</Button>
              </form>
              
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h3 className="text-sm font-medium mb-2">Configuración del campo:</h3>
                <pre className="text-xs overflow-auto">{JSON.stringify(dynamicSelectField, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="composite">
          <Card>
            <CardHeader>
              <CardTitle>Select con Clave Compuesta</CardTitle>
              <CardDescription>
                Campo de selección que maneja claves compuestas y campos dependientes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-muted rounded-md">
                <h3 className="text-sm font-medium mb-2">Instrucciones:</h3>
                <p className="text-sm text-muted-foreground">
                  Este select maneja claves compuestas (ubiAno y ubiCod) y actualiza automáticamente otros campos del formulario
                  cuando se selecciona una opción.
                </p>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <SelectField
                  field={compositeKeySelectField}
                  errors={errors}
                  dirtyFields={dirtyFields}
                  control={control}
                  setValue={setValue}
                  isSubmitted={isSubmitted}
                  register={register}
                  watch={watch}
                />
                
                {/* Visualización de los datos seleccionados */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-md">
                    <h4 className="text-sm font-medium mb-2">Nombre de ubicación:</h4>
                    <p className="text-sm">Valor actual: {watch('ubiNom') || 'No seleccionado'}</p>
                  </div>
                  <div className="p-4 border rounded-md">
                    <h4 className="text-sm font-medium mb-2">Año y código:</h4>
                    <p className="text-sm">Año: {watch('ubiAno') || 'No disponible'}</p>
                    <p className="text-sm">Código: {watch('ubiCod') || 'No disponible'}</p>
                  </div>
                </div>
                <div className="p-4 border rounded-md">
                  <h4 className="text-sm font-medium mb-2">Objeto completo seleccionado:</h4>
                  <p className="text-sm">Valor actual: {watch('ubicacion') ? JSON.stringify(watch('ubicacion')) : 'No seleccionado'}</p>
                </div>
                
                <Button type="submit">Enviar</Button>
              </form>
              
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h3 className="text-sm font-medium mb-2">Configuración del campo:</h3>
                <pre className="text-xs overflow-auto">{JSON.stringify(compositeKeySelectField, null, 2)}</pre>
              </div>
              
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h3 className="text-sm font-medium mb-2">Funcionamiento de campos dependientes:</h3>
                <pre className="text-xs overflow-auto">{
`// Al seleccionar una ubicación, el objeto completo se guarda en:
"ubicacion": {
  "ubiAno": "2024",
  "ubiCod": "001234",
  "ubiNom": "Bogotá"
}

// Y gracias a los dependentFields, también se extraen automáticamente:
"ubiAno": "2024",
"ubiCod": "001234",
"ubiNom": "Bogotá"

// Esto permite usar ambos formatos según se necesite`
                }</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Se eliminó la pestaña de carga personalizada para simplificar */}
        
        <TabsContent value="multi">
          <Card>
            <CardHeader>
              <CardTitle>Select con Multi-Selección</CardTitle>
              <CardDescription>
                Campo de selección que permite seleccionar múltiples opciones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-muted rounded-md">
                <h3 className="text-sm font-medium mb-2">Instrucciones:</h3>
                <p className="text-sm text-muted-foreground">
                  Este select permite seleccionar múltiples opciones y devuelve un array de valores.
                  Utiliza la propiedad valueFormat para controlar qué parte de los datos se devuelve.
                </p>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <SelectField
                  field={multiSelectField}
                  errors={errors}
                  dirtyFields={dirtyFields}
                  control={control}
                  setValue={setValue}
                  isSubmitted={isSubmitted}
                  register={register}
                  watch={watch}
                />
                
                <Button type="submit">Enviar</Button>
              </form>
              
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h3 className="text-sm font-medium mb-2">Configuración del campo:</h3>
                <pre className="text-xs overflow-auto">{JSON.stringify(multiSelectField, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
