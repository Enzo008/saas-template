import { useMemo, useEffect } from 'react';
import { useForm, UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue, Control } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { prepareInitialValuesForCompositeFields, flattenCompositeFieldValues } from '@/shared/utils/formDataUtils';
import { SmartFormLayout } from '../layouts/SmartFormLayout';
import { useConditionalFields } from '@/shared/hooks';
import { renderField as renderFieldUtil } from '../utils/FieldRenderer';

export interface FieldOption {
    value: string | number;
    label: string;
    metadata?: Record<string, any>; // Datos adicionales para la opción
}

// ============================================================================
// SISTEMA DE CAMPOS CONDICIONALES
// ============================================================================

/**
 * Operadores disponibles para condiciones
 * 
 * @example
 * // Mostrar campo solo si tipo es 'SELECT'
 * { operator: 'equals', value: 'SELECT' }
 * 
 * // Mostrar campo si tipo es 'SELECT' o 'RADIO'
 * { operator: 'in', value: ['SELECT', 'RADIO'] }
 * 
 * // Condición personalizada compleja
 * { operator: 'custom', customFn: (value, formValues) => value > 10 && formValues.otherField === 'X' }
 */
export type ConditionalOperator = 
    | 'equals'        // Valor exactamente igual
    | 'notEquals'     // Valor diferente
    | 'in'            // Valor está en array
    | 'notIn'         // Valor NO está en array
    | 'greaterThan'   // Mayor que (números)
    | 'lessThan'      // Menor que (números)
    | 'contains'      // String contiene texto
    | 'custom';       // Función personalizada

/**
 * Definición de una condición para campos condicionales
 * 
 * @property operator - Tipo de comparación a realizar
 * @property value - Valor o array de valores a comparar (según operador)
 * @property customFn - Función personalizada para lógica compleja (solo con operator: 'custom')
 */
export interface ConditionalCondition {
    operator: ConditionalOperator;
    value?: any | any[];
    customFn?: (watchValue: any, formValues: any) => boolean;
}

/**
 * Acciones a ejecutar cuando una condición se cumple
 * 
 * @property show - Si true, muestra el campo; si false, lo oculta
 * @property enable - Si true, habilita el campo; si false, lo deshabilita
 * @property require - Si true, hace el campo requerido; si false, opcional
 * @property setValue - Valor a establecer automáticamente cuando la condición se cumple
 * @property clearValue - Si true, limpia el valor del campo cuando se oculta
 * 
 * @example
 * // Mostrar y hacer requerido cuando condición se cumple
 * { show: true, require: true, clearValue: true }
 * 
 * // Establecer valor por defecto cuando se muestra
 * { show: true, setValue: 'default_value' }
 */
export interface ConditionalActions {
    show?: boolean;
    enable?: boolean;
    require?: boolean;
    setValue?: any;
    clearValue?: boolean;
    // Validaciones dinámicas
    setValidation?: {
        pattern?: RegExp;
        patternMessage?: string | string[];
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
    };
}

/**
 * Regla condicional completa para un campo
 * 
 * Define cuándo y cómo un campo debe cambiar su comportamiento
 * basándose en el valor de otro campo del formulario.
 * 
 * @property watchField - Nombre del campo a observar (debe existir en el formulario)
 * @property condition - Condición que debe cumplirse
 * @property actions - Acciones a ejecutar cuando la condición es verdadera
 * 
 * @example
 * // Mostrar campo 'forFieOpt' solo cuando 'forFieTyp' es 'SELECT' o 'RADIO'
 * {
 *   watchField: 'forFieTyp',
 *   condition: { operator: 'in', value: ['SELECT', 'RADIO'] },
 *   actions: { show: true, require: true, clearValue: true }
 * }
 * 
 * @example
 * // Deshabilitar campo cuando otro campo tiene un valor específico
 * {
 *   watchField: 'status',
 *   condition: { operator: 'equals', value: 'LOCKED' },
 *   actions: { enable: false }
 * }
 */
export interface ConditionalRule {
    watchField: string;
    condition: ConditionalCondition;
    actions?: ConditionalActions;
}

export interface Field {
    name: string;
    type: 'text' | 'number' | 'select' | 'textarea' | 'radio' | 'color' | 'date' | 'email' | 'tel' | 'phone' | 'radiogroup' | 'checkbox';
    required?: boolean;
    label?: string;
    placeholder?: string;
    validation?: Record<string, any>;
    options?: FieldOption[];
    isMulti?: boolean;
    rows?: number;
    minRows?: number; // Número mínimo de filas para textarea auto-resize
    maxRows?: number; // Número máximo de filas antes de mostrar scroll
    maxLength?: number;
    autoFocus?: boolean;
    useDecimal?: boolean; // Para campos numéricos, indica si se debe usar formato decimal
    numberFormat?: 'integer' | 'decimal'; // Formato específico para números (alternativa a useDecimal)
    disabled?: boolean; // Indica si el campo está deshabilitado
    hidden?: boolean; // Indica si el campo está oculto
    isClearable?: boolean; // Para select, indica si se puede limpiar la selección

    // Propiedades para carga dinámica de opciones
    loadOptions?: (inputValue: string) => Promise<any[]>; // Función para cargar opciones dinámicamente
    endpoint?: string; // Endpoint para cargar opciones (ej: 'Genero', 'Nacionalidad')

    // Propiedades para manejo de valores (estandarizadas)
    fieldType?: 'simple' | 'composite'; // Tipo de campo: simple (valor único) o composite (valor compuesto)
    keyField?: string | string[]; // Campo(s) que contienen el valor (reemplaza objectKey y compositeKeys)
    valueFormat?: 'value' | 'object' | 'objectKey'; // Formato del valor devuelto por el select (legacy)
    objectKey?: string; // Clave a usar cuando valueFormat es 'objectKey' (legacy)
    labelKey?: string; // Clave a usar para mostrar el label cuando se usan objetos

    // Propiedades para manejo de claves compuestas (legacy)
    isCompositeKey?: boolean; // Indica si la clave es compuesta (ej: ubiAno,ubiCod)
    compositeKeys?: string[]; // Array con los nombres de las propiedades que forman la clave compuesta

    // Propiedades para organización y visualización
    section?: string; // Sección a la que pertenece el campo (ej: 'personal', 'contact', 'job')
    fieldWidth?: 'full' | '1/2' | '1/3' | '2/3' | '1/4' | '3/4' | '1/6' | '5/6'; // Ancho del campo
    orientation?: 'horizontal' | 'vertical'; // Orientación para campos tipo radio o checkbox
    defaultValue?: string | number | boolean; // Valor por defecto para el campo
    helpText?: string; // Texto de ayuda para mostrar debajo del campo

    // Propiedades para campos dependientes
    dependentFields?: Array<{
        sourceField: string; // Campo de la opción seleccionada que contiene el valor
        targetField: string; // Campo del formulario que se actualizará
        isComposite?: boolean; // Indica si el campo destino espera un valor compuesto
    }>; // Campos que dependen de la selección actual

    // ============================================================================
    // CAMPOS CONDICIONALES
    // ============================================================================
    
    /**
     * Reglas condicionales que controlan el comportamiento del campo
     * 
     * Permite mostrar/ocultar, habilitar/deshabilitar, hacer requerido/opcional
     * y establecer valores automáticamente basándose en otros campos.
     * 
     * @example
     * // Campo visible solo cuando tipo es SELECT o RADIO
     * conditionalRules: [{
     *   watchField: 'forFieTyp',
     *   condition: { operator: 'in', value: ['SELECT', 'RADIO'] },
     *   actions: { show: true, require: true, clearValue: true }
     * }]
     * 
     * @example
     * // Múltiples reglas para diferentes condiciones
     * conditionalRules: [
     *   {
     *     watchField: 'forFieTyp',
     *     condition: { operator: 'equals', value: 'NUMBER' },
     *     actions: { show: true }
     *   },
     *   {
     *     watchField: 'forFieReq',
     *     condition: { operator: 'equals', value: true },
     *     actions: { require: true }
     *   }
     * ]
     */
    conditionalRules?: ConditionalRule[];
}

export interface FieldProps {
    field: Field;
    register: UseFormRegister<any>;
    errors: FieldErrors;
    control: Control<any>;
    setValue: UseFormSetValue<any>;
    watch: UseFormWatch<any>;
    dirtyFields: Record<string, boolean>;
    isSubmitted: boolean;
}

// Tipo para el resultado de envío del formulario
export interface FormSubmitResult {
    success: boolean;
    data?: any;
    error?: any;
    message?: string;
    statusCode?: number;
}

export interface FormContentProps<T = Record<string, unknown>> {
    enrichedFields: Field[];
    modalVisible: boolean;
    onSubmit: (data: T) => Promise<FormSubmitResult> | FormSubmitResult;
    initialData?: any;
    isLoading?: boolean;
    columnsCount?: 1 | 2 | 3 | 4;
}

export const FormContent = <T = Record<string, unknown>>({
    enrichedFields = [],
    modalVisible,
    onSubmit,
    initialData,
    isLoading: externalIsLoading,
    columnsCount = 1
}: FormContentProps<T>) => {

    // Procesar los valores iniciales para campos compuestos
    const defaultValues = useMemo(() => {
        if (!initialData) return {};
        return prepareInitialValuesForCompositeFields(initialData, enrichedFields);
    }, [initialData, enrichedFields]);
    const {
        register,
        handleSubmit,
        formState: { errors, dirtyFields, isSubmitted },
        reset,
        control,
        setValue,
        watch,
        setFocus
    } = useForm({
        mode: "onChange",
        defaultValues
    });

    const { t } = useTranslation();

    // Campos condicionales: evaluar reglas y filtrar visibles
    const { getFieldState } = useConditionalFields({
        fields: enrichedFields,
        watch,
        setValue
    });

    // Filtrar campos visibles y aplicar estado condicional
    const fieldsWithState = useMemo(() => {
        return enrichedFields.map(field => {
            const state = getFieldState(field.name);
            return {
                ...field,
                hidden: !state.isVisible,
                disabled: !state.isEnabled,
                required: state.isRequired
            };
        }).filter(field => !field.hidden);
    }, [enrichedFields, getFieldState]);

    // Renderizar campo con props completas
    const renderField = (field: Field) => {
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
        return renderFieldUtil(fieldProps);
    };

    // Focus automático en el primer campo con error
    useEffect(() => {
        if (Object.keys(errors).length > 0 && isSubmitted) {
            const firstErrorField = Object.keys(errors)[0];
            setFocus(firstErrorField || '');
        }
    }, [errors, isSubmitted, setFocus]);

    // Manejador de envío del formulario optimizado
    const handleFormSubmit = handleSubmit(async (data) => {
        try {
            // Aplanar los campos compuestos antes de enviar al backend
            const flattenedData = flattenCompositeFieldValues(data, enrichedFields);

            // Llamamos a onSubmit con los datos aplanados y esperamos su resultado
            const result = await onSubmit(flattenedData as T);

            // Si la operación fue exitosa y no estamos en modo de edición, reseteamos el formulario
            if (result && result.success && !initialData) {
                reset();
            }

            return result;
        } catch (error) {
            console.error('Error en el envío del formulario:', error);
            // No reseteamos el formulario en caso de error
            return { success: false, error };
        }
    });

    // Si se proporciona isLoading externamente, usamos ese valor
    // De lo contrario, mantenemos la compatibilidad con versiones anteriores
    const isLoading = externalIsLoading !== undefined ? externalIsLoading : false;

    return (
        <form
            className="flex flex-col p-4 h-full"
            onSubmit={handleFormSubmit}
        >
            <div className="flex flex-col space-y-4 overflow-auto flex-1 p-1">
                {modalVisible && enrichedFields.length > 0 && (
                    <>
                        {columnsCount === 1 ? (
                            // Renderizado simple para una columna
                            <div className="space-y-4">
                                {fieldsWithState.map(field => (
                                    <div key={field.name}>
                                        {renderField(field)}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Renderizado con SmartFormLayout para múltiples columnas (grid 12 cols)
                            <SmartFormLayout
                                fields={fieldsWithState}
                                renderField={renderField}
                            />
                        )}
                    </>
                )}
            </div>
            <div
                className="sticky bottom-0 pt-2 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
            >
                <button
                    className={cn(
                        "w-full py-2 px-4 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",
                        "bg-primary text-primary-foreground hover:bg-primary/90",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "flex items-center justify-center"
                    )}
                    type="submit"
                    disabled={isLoading}
                    aria-busy={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('common.messages.loading')}
                        </>
                    ) : initialData ? (
                        t('common.actions.update')
                    ) : (
                        t('common.actions.save')
                    )}
                </button>
            </div>
        </form>
    );
};