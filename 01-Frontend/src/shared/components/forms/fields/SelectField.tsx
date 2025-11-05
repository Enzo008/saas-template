import { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import Select, { MultiValue, SingleValue, components } from 'react-select';
import AsyncSelect from 'react-select/async';
import { useTranslation } from 'react-i18next';
import { Loader2, AlertCircle, CheckCircle2, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loadOptionsFromEndpoint, SelectOption } from './selectFieldUtils';
import { FieldProps, FieldOption } from '../components/FormContent';
import { HelpTooltip } from '../components/HelpTooltip';

const SelectField = ({ 
    field, 
    control, 
    errors,
    dirtyFields,
    setValue
}: FieldProps) => {
    const error = errors[field.name];
    const isValid = dirtyFields[field.name] && !error;
    const { t } = useTranslation();

    // Determinar si usamos opciones estáticas o dinámicas
    const isDynamic = !!field.endpoint;
    const isMulti = field.isMulti === true;

    // Estado para manejar la carga de opciones
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [initialLoadComplete, setInitialLoadComplete] = useState(!isDynamic); // Para opciones estáticas, ya está "cargado"
    
    // Función para cargar opciones de forma asíncrona
    const loadOptions = async () => {
        if (!isDynamic) return [];
        
        try {
            setIsLoading(true);
            
            // Si hay un endpoint configurado, usar la utilidad para cargar desde API
            if (field.endpoint) {
                return await loadOptionsFromEndpoint(field);
            }
            
            return [];
        } catch (error) {
            console.error(`Error loading options for ${field.name}:`, error);
            return [];
        } finally {
            setIsLoading(false);
        }
    };
    
    // Cargar opciones iniciales si es necesario
    useEffect(() => {
        if (isDynamic && field.endpoint) {
            setIsLoading(true);
            setInitialLoadComplete(false);
            
            // Cargar opciones desde el endpoint configurado
            loadOptionsFromEndpoint(field)
                .then((loadedOptions: SelectOption[]) => {
                    setOptions(loadedOptions);
                    setInitialLoadComplete(true);
                })
                .catch((error: any) => {
                    console.error(`Error loading initial options for ${field.name} from endpoint:`, error);
                    setInitialLoadComplete(true); // Marcar como completo incluso si hay error
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else if (field.options) {
            // Usar opciones estáticas si están disponibles
            const staticOptions = field.options.map((opt: FieldOption) => ({
                value: opt.value,
                label: opt.label,
                ...(opt.metadata || {}) // Incluir metadatos adicionales si existen
            }));
            setOptions(staticOptions);
            setInitialLoadComplete(true);
        }
    }, [field.name, field.endpoint, isDynamic]);

    // Componentes personalizados para react-select con mejor accesibilidad
    const CustomDropdownIndicator = (props: any) => {
        return (
            <components.DropdownIndicator {...props}>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </components.DropdownIndicator>
        );
    };

    const CustomClearIndicator = (props: any) => {
        return (
            <components.ClearIndicator {...props}>
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </components.ClearIndicator>
        );
    };

    const CustomLoadingIndicator = (props: any) => {
        return (
            <components.LoadingIndicator {...props}>
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </components.LoadingIndicator>
        );
    };

    // ClassNames para react-select (recomendado desde v5.7.0)
    const selectClassNames = {
        control: (state: any) => cn(
            "min-h-9 rounded-md bg-transparent text-sm transition-colors",
            "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            "overflow-hidden",
            // Usar border-2 para estados de validación para mejor visibilidad
            error ? "border-2 border-destructive focus-within:ring-destructive" : 
            isValid ? "border-2 border-green-500 focus-within:ring-green-500" : 
            "border border-input hover:border-ring",
            state.isDisabled && "cursor-not-allowed opacity-50"
        ),
        menu: () => cn(
            "bg-popover text-popover-foreground border border-border rounded-md shadow-lg z-50 overflow-hidden"
        ),
        option: (state: any) => cn(
            "relative cursor-pointer select-none py-2 px-3 text-sm",
            state.isSelected ? "bg-primary text-primary-foreground" :
            state.isFocused ? "bg-accent text-accent-foreground" :
            "hover:bg-accent hover:text-accent-foreground"
        ),
        multiValue: () => cn(
            "bg-accent text-accent-foreground rounded-sm px-1.5 py-0.5 text-xs"
        ),
        multiValueLabel: () => cn("text-accent-foreground"),
        multiValueRemove: () => cn(
            "text-accent-foreground hover:bg-destructive hover:text-destructive-foreground rounded-sm"
        ),
        placeholder: () => cn("text-muted-foreground"),
        input: () => cn("text-foreground"),
        singleValue: () => cn("text-foreground"),
        indicatorSeparator: () => cn("bg-border"),
        dropdownIndicator: () => cn(
            "text-muted-foreground hover:text-foreground",
            // Prevenir overflow durante rotación del icono - parte de la solución del parpadeo
            "overflow-hidden flex items-center justify-center"
        ),
        clearIndicator: () => cn("text-muted-foreground hover:text-foreground"),
        loadingIndicator: () => cn("text-muted-foreground"),
        noOptionsMessage: () => cn("text-muted-foreground py-3 px-3 text-sm"),
        loadingMessage: () => cn("text-muted-foreground py-3 px-3 text-sm"),
    };

    // Estilos complementarios para casos específicos (trabajando con classNames)
    const selectStyles = {
        // Solo mantener estilos que no se pueden hacer con classNames
        menuPortal: (baseStyles: any) => ({
            ...baseStyles,
            zIndex: 9999, // Asegurar z-index alto en portal
        }),
        
        dropdownIndicator: (baseStyles: any, state: any) => ({
            ...baseStyles,
            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
        }),
    };

    // Función para formatear el valor actual del formulario para react-select
    const formatCurrentValue = (value: any) => {
        if (!value) return isMulti ? [] : null;
        
        // Si estamos cargando opciones dinámicas y aún no hemos terminado, no mostrar valores
        // Esto evita mostrar "Desconocido" mientras se cargan las opciones
        if (isDynamic && !initialLoadComplete) {
            return isMulti ? [] : null;
        }
        
        // Determinar si estamos trabajando con claves compuestas
        const isCompositeField = (field.fieldType === 'composite' && Array.isArray(field.keyField)) || 
                               (field.isCompositeKey && field.compositeKeys);
        
        // Obtener las claves a usar para comparación en caso de claves compuestas
        const compositeKeys = field.fieldType === 'composite' && Array.isArray(field.keyField) 
            ? field.keyField 
            : field.compositeKeys || [];
        
        if (isMulti) {
            // Para selección múltiple
            if (!Array.isArray(value)) {
                try {
                    // Intentar parsear si es un string (JSON)
                    value = typeof value === 'string' ? JSON.parse(value) : [value];
                } catch (e) {
                    return [];
                }
            }
            
            if (value.length === 0) return [];
            
            // Si los elementos ya son objetos con estructura de react-select
            if (typeof value[0] === 'object' && value[0] !== null && 
                value[0].hasOwnProperty('value') && value[0].hasOwnProperty('label')) {
                return value;
            }
            
            // Para claves compuestas
            if (isCompositeField) {
                return value.map((val: any) => {
                    // Buscar en las opciones cargadas
                    const matchingOption = options.find(opt => {
                        if (typeof val !== 'object') return false;
                        
                        return compositeKeys.every(key => 
                            opt['originalValues'] && 
                            val[key] !== undefined && 
                            opt['originalValues'][key] === val[key]
                        );
                    });
                    
                    if (matchingOption) {
                        return matchingOption;
                    }
                    
                    // Si no encontramos coincidencia, no mostrar nada (mejor que "Desconocido")
                    // Esto evita confusión y posibles errores de datos
                    return null;
                }).filter(Boolean);
            }
            
            // Para claves simples, buscar en las opciones cargadas
            return options.filter(opt => 
                value.includes(opt.value)
            );
        } else {
            // Para selección simple
            if (value === null || value === undefined) return null;
            
            // Si ya es un objeto con estructura de react-select
            if (typeof value === 'object' && value !== null &&
                value.hasOwnProperty('value') && value.hasOwnProperty('label')) {
                return value;
            }
            
            // Para claves compuestas
            if (isCompositeField && typeof value === 'object') {
                // Buscar en las opciones cargadas
                const matchingOption = options.find(opt => {
                    return compositeKeys.every(key => 
                        opt['originalValues'] && 
                        value[key] !== undefined && 
                        opt['originalValues'][key] === value[key]
                    );
                });
                
                if (matchingOption) {
                    return matchingOption;
                }
                
                // Si no encontramos coincidencia, no mostrar nada (mejor que "Desconocido")
                // Esto evita confusión y posibles errores de datos
                return null;
            }
            
            // Para claves simples, buscar en las opciones cargadas
            const matchingOption = options.find(opt => opt.value === value);
            return matchingOption || null;
        }
    };

    // Función para formatear el valor seleccionado para el formulario
    const formatOnChange = (selectedOptions: MultiValue<SelectOption> | SingleValue<SelectOption>) => {
        if (!selectedOptions) return null;
        
        // Determinar si estamos trabajando con claves compuestas
        const isCompositeField = (field.fieldType === 'composite' && Array.isArray(field.keyField)) || 
                               (field.isCompositeKey && field.compositeKeys);
        
        // Obtener las claves a usar para comparación en caso de claves compuestas
        const compositeKeys = field.fieldType === 'composite' && Array.isArray(field.keyField) 
            ? field.keyField 
            : field.compositeKeys || [];
        
        if (isMulti) {
            // Para selección múltiple
            const multiOptions = selectedOptions as MultiValue<SelectOption>;
            
            if (field.valueFormat === 'object') {
                // Devolver el array completo de objetos
                return multiOptions;
            }
            
            if (isCompositeField) {
                // Para claves compuestas, devolver array de objetos con las claves necesarias
                return multiOptions.map(opt => {
                    if (opt['originalValues']) {
                        const result: Record<string, any> = {};
                        compositeKeys.forEach(key => {
                            result[key] = opt['originalValues'][key];
                        });
                        return result;
                    }
                    return opt.value;
                });
            }
            
            if (field.valueFormat === 'objectKey' && field.objectKey) {
                // Devolver array de valores específicos de cada objeto
                return multiOptions.map(opt => opt[field.objectKey || 'value']);
            }
            
            // Por defecto, devolver array de valores
            return multiOptions.map(opt => opt.value);
        } else {
            // Para selección simple
            const singleOption = selectedOptions as SingleValue<SelectOption>;
            
            if (!singleOption) return null;
            
            if (field.valueFormat === 'object') {
                // Devolver el objeto completo
                return singleOption;
            }
            
            if (isCompositeField) {
                // Para claves compuestas, devolver objeto con las claves necesarias
                if (singleOption['originalValues']) {
                    const result: Record<string, any> = {};
                    compositeKeys.forEach(key => {
                        result[key] = singleOption['originalValues'][key];
                    });
                    return result;
                }
                return singleOption.value;
            }
            
            if (field.valueFormat === 'objectKey' && field.objectKey) {
                // Devolver un valor específico del objeto
                return singleOption[field.objectKey];
            }
            
            // Por defecto, devolver el valor
            return singleOption.value;
        }
    };

    // Función para actualizar campos dependientes
    const updateDependentFields = (selectedOptions: MultiValue<SelectOption> | SingleValue<SelectOption>) => {
        if (!selectedOptions || !setValue) return;
        
        if (isMulti) {
            // Para selección múltiple
            const multiOptions = selectedOptions as MultiValue<SelectOption>;
            
            // Actualizar campos dependientes si es necesario
            if (field.dependentFields) {
                field.dependentFields.forEach(depField => {
                    if (depField.sourceField && depField.targetField) {
                        const sourceValues = multiOptions.map(opt => 
                            opt['originalValues'] ? opt['originalValues'][depField.sourceField || 'value'] : opt[depField.sourceField || 'value']
                        );
                        setValue(depField.targetField, sourceValues);
                    }
                });
            }
        } else {
            // Para selección simple
            const singleOption = selectedOptions as SingleValue<SelectOption>;
            
            if (!singleOption) return;
            
            // Manejar campos dependientes definidos explícitamente
            if (field.dependentFields) {
                field.dependentFields.forEach(depField => {
                    if (depField.sourceField && depField.targetField) {
                        if (depField.isComposite && singleOption['originalValues']) {
                            // Si el campo dependiente espera un valor compuesto
                            const sourceFields = depField.sourceField.split(',');
                            const values = sourceFields.map(sf => singleOption['originalValues'][sf.trim()]);
                            setValue(depField.targetField, values);
                        } else {
                            // Caso normal: un solo valor
                            const sourceValue = singleOption['originalValues'] 
                                ? singleOption['originalValues'][depField.sourceField] 
                                : singleOption[depField.sourceField || 'value'];
                            setValue(depField.targetField, sourceValue);
                        }
                    }
                });
            }
            
            // Extraer automáticamente los campos de la clave compuesta para la nueva configuración
            if (field.fieldType === 'composite' && Array.isArray(field.keyField) && singleOption['originalValues']) {
                field.keyField.forEach(key => {
                    // Verificar si ya existe un campo dependiente para esta clave
                    const existingField = field.dependentFields?.find(df => df.targetField === key);
                    if (!existingField && singleOption['originalValues'][key] !== undefined) {
                        setValue(key, singleOption['originalValues'][key]);
                    }
                });
            }
            // Compatibilidad con la configuración anterior
            else if (field.isCompositeKey && field.compositeKeys && singleOption['originalValues']) {
                field.compositeKeys.forEach(key => {
                    // Verificar si ya existe un campo dependiente para esta clave
                    const existingField = field.dependentFields?.find(df => df.targetField === key);
                    if (!existingField && singleOption['originalValues'][key] !== undefined) {
                        setValue(key, singleOption['originalValues'][key]);
                    }
                });
            }
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1.5">
                <label 
                    htmlFor={field.name} 
                    className={cn(
                        "block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                        error ? "text-destructive" : "text-foreground",
                        field.required && "after:content-['*'] after:ml-1 after:text-destructive"
                    )}
                >
                    {field.label || field.name}
                </label>
                {field.helpText && <HelpTooltip content={field.helpText} fieldName={field.label || field.name} />}
            </div>
            
            <div className="relative">
                <Controller
                    name={field.name}
                    control={control}
                    {...(field.validation && { rules: field.validation })}
                    render={({ field: { onChange, value, ref } }) => {
                        // Componente a renderizar
                        const SelectComponent = isDynamic ? AsyncSelect : Select;
                        
                        // Props comunes para ambos tipos de select
                        const commonProps = {
                            inputRef: ref,
                            inputId: field.name,
                            instanceId: field.name,
                            value: formatCurrentValue(value),
                            onChange: (newValue: MultiValue<SelectOption> | SingleValue<SelectOption>) => {
                                const formattedValue = formatOnChange(newValue);
                                onChange(formattedValue);
                                updateDependentFields(newValue);
                            },
                            isMulti,
                            placeholder: isDynamic && !initialLoadComplete 
                                ? t('common.messages.loading') 
                                : field.placeholder || t('common.select'),
                            isDisabled: field.disabled || (isDynamic && !initialLoadComplete),
                            isClearable: field.isClearable !== false,
                            isSearchable: (field as any).isSearchable !== false,
                            styles: selectStyles,
                            classNames: selectClassNames,
                            className: "react-select-container",
                            classNamePrefix: "react-select",
                            menuPortalTarget: document.body,
                            menuPosition: "fixed" as const,
                            menuPlacement: "auto" as const,
                            noOptionsMessage: () => t('common.messages.noOptions'),
                            loadingMessage: () => t('common.messages.loading'),
                            // Componentes personalizados para mejor UX
                            components: {
                                DropdownIndicator: CustomDropdownIndicator,
                                ClearIndicator: CustomClearIndicator,
                                LoadingIndicator: CustomLoadingIndicator,
                            },
                            // Mejoras de UX y rendimiento
                            closeMenuOnSelect: !isMulti, // Cerrar menú solo en selección simple
                            hideSelectedOptions: false, // Mostrar opciones seleccionadas para mejor UX
                            blurInputOnSelect: !isMulti, // Mantener foco en multi-select
                            captureMenuScroll: false, // Mejor scroll en contenedores
                            tabSelectsValue: true, // Permitir selección con Tab
                            backspaceRemovesValue: true, // Permitir eliminar con Backspace
                            escapeClearsValue: true, // Limpiar con Escape
                            openMenuOnFocus: false, // No abrir automáticamente al enfocar
                            // Accesibilidad mejorada
                            'aria-label': field.label || field.name,
                            'aria-describedby': cn(
                                error ? `${field.name}-error` : undefined,
                                field.helpText ? `${field.name}-help` : undefined
                            ).trim() || undefined,
                            'aria-invalid': !!error,
                            'aria-required': field.required,
                        };
                        
                        // Renderizar el componente adecuado según si es dinámico o no
                        return isDynamic ? (
                            <SelectComponent
                                {...commonProps}
                                cacheOptions
                                defaultOptions={options}
                                loadOptions={loadOptions}
                                isLoading={isLoading}
                            />
                        ) : (
                            <SelectComponent
                                {...commonProps}
                                options={options}
                                isLoading={isLoading}
                            />
                        );
                    }}
                />
                
                {/* Indicador visual de estado */}
                {/* Posicionado más a la izquierda para evitar sobreposición con botones de react-select (clear + dropdown) */}
                {(error || isValid) && (
                    <div className="absolute right-[60px] top-1/2 -translate-y-1/2 pointer-events-none z-10">
                        {error ? (
                            <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
                        ) : isValid ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
                        ) : null}
                    </div>
                )}
            </div>
            
            {/* Mensaje de error */}
            {error && (
                <p 
                    id={`${field.name}-error`}
                    className="text-sm font-medium text-destructive"
                    role="alert"
                    aria-live="polite"
                >
                    {error.message?.toString()}
                </p>
            )}
            
            {/* Indicador de carga global */}
            {isLoading && !isDynamic && (
                <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.messages.loading')}
                </div>
            )}
        </div>
    );
};

export default SelectField;
