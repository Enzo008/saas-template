import { Field } from "@/shared/components/forms/components/FormContent";

/**
 * Prepara los valores iniciales para campos compuestos basándose en la configuración de campos
 * @param initialData - Datos iniciales del formulario
 * @param fields - Configuración de campos del formulario
 * @returns Objeto con los valores iniciales procesados
 */
export const prepareInitialValuesForCompositeFields = (
    initialData: any,
    fields: Field[]
): any => {
    // Use structured logging instead of console.log
    if (!initialData || !fields) {
        return initialData;
    }

    const processedData = { ...initialData };
    let compositeFieldsProcessed = 0;

    // Procesar cada campo para identificar los que son composite
    fields.forEach(field => {
        if (field.isCompositeKey && field.compositeKeys && field.compositeKeys.length > 0) {
            // Construir el valor compuesto para este campo
            const compositeValue: Record<string, any> = {};
            let hasAllKeys = true;
            const missingKeys: string[] = [];

            // Verificar si todos los keys del composite existen en initialData
            field.compositeKeys.forEach(key => {
                if (initialData[key] !== undefined && initialData[key] !== null && initialData[key] !== '') {
                    compositeValue[key] = initialData[key];
                } else {
                    hasAllKeys = false;
                    missingKeys.push(key);
                }
            });

            // Solo asignar el valor compuesto si tenemos todos los keys necesarios
            if (hasAllKeys && Object.keys(compositeValue).length > 0) {
                processedData[field.name] = compositeValue;
                compositeFieldsProcessed++;
            }
        }
    });

    return processedData;
};

/**
 * Extrae los valores de campos compuestos y los aplana al objeto principal
 * Útil para preparar datos antes de enviar al backend
 * @param formData - Datos del formulario
 * @param fields - Configuración de campos del formulario
 * @returns Objeto con los valores compuestos aplanados
 */
export const flattenCompositeFieldValues = (
    formData: any,
    fields: Field[]
): any => {
    if (!formData || !fields) {
        return formData;
    }

    const flattenedData = { ...formData };

    // Procesar cada campo compuesto
    fields.forEach(field => {
        if (field.isCompositeKey && field.compositeKeys && field.compositeKeys.length > 0) {
            const compositeValue = formData[field.name];
            
            if (compositeValue && typeof compositeValue === 'object') {
                // Extraer cada key del valor compuesto y agregarlo al objeto principal
                field.compositeKeys.forEach(key => {
                    if (compositeValue[key] !== undefined) {
                        flattenedData[key] = compositeValue[key];
                    }
                });
            }
        }
    });

    return flattenedData;
};

/**
 * Valida si un campo compuesto tiene todos sus keys requeridos
 * @param compositeValue - Valor del campo compuesto
 * @param compositeKeys - Array de keys requeridos
 * @returns true si tiene todos los keys, false en caso contrario
 */
export const validateCompositeField = (
    compositeValue: any,
    compositeKeys: string[]
): boolean => {
    if (!compositeValue || typeof compositeValue !== 'object') {
        return false;
    }

    return compositeKeys.every(key => 
        compositeValue[key] !== undefined && 
        compositeValue[key] !== null && 
        compositeValue[key] !== ''
    );
};
