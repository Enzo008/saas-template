import { Field } from '../components/FormContent';
import { apiClient } from '@/shared/services/apiClient';

/**
 * Tipo para las opciones del select
 * @property value - El valor de la opción (puede ser primitivo u objeto para claves compuestas)
 * @property label - La etiqueta visible para el usuario
 * @property originalValues - Los datos originales del objeto desde el que se creó la opción
 */
export type SelectOption = {
    value: any;
    label: string;
    [key: string]: any;
};

/**
 * Carga opciones desde un endpoint de API
 * @param field Configuración del campo
 * @returns Promesa que resuelve a un array de opciones para el select
 */
export const loadOptionsFromEndpoint = async (field: Field): Promise<SelectOption[]> => {
    if (!field.endpoint) {
        console.error(`No se especificó endpoint para el campo ${field.name}`);
        return [];
    }

    try {
        // Construir la URL del endpoint con /buscar
        const url = `${field.endpoint}/buscar`;
        
        // Realizar la petición POST con body vacío
        const response = await apiClient.post<any[]>(url, {});
        
        if (!response.success || !response.data) {
            console.error(`Error al cargar opciones para ${field.name}:`, response.message);
            return [];
        }
        
        // Mapear los datos a opciones del select
        return response.data.map(item => formatItemToOption(item, field));
    } catch (error) {
        console.error(`Error al cargar opciones para ${field.name}:`, error);
        return [];
    }
};

/**
 * Formatea un item de datos a una opción para el select
 * @param item Item de datos original
 * @param field Configuración del campo
 * @returns Opción formateada para el select
 */
export const formatItemToOption = (item: Record<string, any>, field: Field): SelectOption => {
    // Determinar el valor según la configuración del campo
    let value: any;
    
    // Usar la nueva configuración estandarizada si está disponible
    if (field.fieldType === 'composite' && Array.isArray(field.keyField)) {
        // Para claves compuestas con la nueva configuración
        const compositeValue: Record<string, any> = {};
        field.keyField.forEach(key => {
            compositeValue[key] = item[key];
        });
        value = compositeValue;
    } else if (field.fieldType === 'simple' && typeof field.keyField === 'string') {
        // Para claves simples con la nueva configuración
        value = item[field.keyField];
    }
    // Compatibilidad con la configuración anterior
    else if (field.isCompositeKey && field.compositeKeys && field.compositeKeys.length > 0) {
        // Para claves compuestas con la configuración anterior
        const compositeValue: Record<string, any> = {};
        field.compositeKeys.forEach(key => {
            compositeValue[key] = item[key];
        });
        value = compositeValue;
    } else {
        // Para claves simples con la configuración anterior
        const keyField = field.objectKey || getDefaultKeyField(field.endpoint);
        value = item[keyField];
    }
    
    // Determinar la etiqueta
    const labelField = field.labelKey || 'nombre';
    const label = item[labelField] || `${value}`;
    
    // Devolver la opción formateada
    return {
        value,
        label,
        originalValues: item // Guardamos el item original para acceder a todas sus propiedades
    };
};

/**
 * Compara dos valores para determinar si son iguales, incluso si son objetos complejos
 * @param value1 Primer valor a comparar
 * @param value2 Segundo valor a comparar
 * @param keys Claves a comparar si son objetos (para claves compuestas)
 * @returns true si los valores son iguales
 */
export const areValuesEqual = (
    value1: any, 
    value2: any, 
    keys?: string[]
): boolean => {
    // Si ambos son nulos o indefinidos
    if (value1 == null && value2 == null) return true;
    
    // Si solo uno es nulo o indefinido
    if (value1 == null || value2 == null) return false;
    
    // Si son primitivos, comparación directa
    if (typeof value1 !== 'object' && typeof value2 !== 'object') {
        return value1 === value2;
    }
    
    // Si son objetos pero no tenemos claves para comparar
    if (!keys || keys.length === 0) {
        // Intentar comparar por valor si tienen propiedad 'value'
        if ('value' in value1 && 'value' in value2) {
            return value1.value === value2.value;
        }
        // Comparación estricta de objetos (referencia)
        return value1 === value2;
    }
    
    // Comparar objetos por claves específicas
    return keys.every(key => 
        value1[key] !== undefined && 
        value2[key] !== undefined && 
        value1[key] === value2[key]
    );
};

/**
 * Obtiene el nombre del campo clave por defecto según el endpoint
 * @param endpoint Nombre del endpoint
 * @returns Nombre del campo clave
 */
export const getDefaultKeyField = (endpoint?: string): string => {
    if (!endpoint) return 'id';
    
    // Extraer el nombre del recurso del endpoint
    const resourceName = endpoint.split('/').pop()?.toLowerCase();
    if (!resourceName) return 'id';
    
    return 'id';
};
