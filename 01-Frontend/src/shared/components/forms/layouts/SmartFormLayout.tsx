/**
 * Layout inteligente para formularios con manejo automático de anchos
 * Organiza los campos en una grilla responsive basada en las propiedades de width
 * 
 * RESPONSABILIDAD: Solo maneja el layout (grid + secciones)
 * El renderizado de campos y lógica condicional se manejan externamente
 */

import { Field } from '../components/FormContent';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface SmartFormLayoutProps {
  fields: Field[];
  className?: string;
  renderField: (field: Field) => ReactNode;
}

/**
 * Mapeo de anchos a clases de Tailwind CSS
 */
const WIDTH_CLASSES = {
  'full': 'col-span-12',
  '1/2': 'col-span-6',
  '1/3': 'col-span-4',
  '2/3': 'col-span-8',
  '1/4': 'col-span-3',
  '3/4': 'col-span-9',
  '1/6': 'col-span-2',
  '5/6': 'col-span-10',
} as const;

/**
 * Mapeo de anchos para diferentes breakpoints
 */
const RESPONSIVE_WIDTH_CLASSES = {
  'full': 'col-span-12',
  '1/2': 'col-span-12 md:col-span-6',
  '1/3': 'col-span-12 md:col-span-4',
  '2/3': 'col-span-12 md:col-span-8',
  '1/4': 'col-span-12 md:col-span-3',
  '3/4': 'col-span-12 md:col-span-9',
  '1/6': 'col-span-12 md:col-span-2',
  '5/6': 'col-span-12 md:col-span-10',
} as const;

/**
 * Extrae el ancho del campo desde fieldWidth, width o section como fallback
 */
const extractWidthFromField = (field: Field): keyof typeof WIDTH_CLASSES => {
  // Priorizar fieldWidth si existe
  if (field.fieldWidth) {
    return field.fieldWidth as keyof typeof WIDTH_CLASSES;
  }
  
  // Buscar en field.width (compatibilidad con createField)
  const fieldWithWidth = field as any;
  if (fieldWithWidth.width) {
    return fieldWithWidth.width as keyof typeof WIDTH_CLASSES;
  }
  
  // Fallback: buscar en section para compatibilidad
  if (!field.section) return 'full';
  
  // Buscar clases de ancho en la sección
  const widthMatch = field.section.match(/col-span-(\d+)/);
  if (widthMatch) {
    const spanValue = widthMatch[1];
    switch (spanValue) {
      case '12': return 'full';
      case '6': return '1/2';
      case '4': return '1/3';
      case '8': return '2/3';
      case '3': return '1/4';
      case '9': return '3/4';
      case '2': return '1/6';
      case '10': return '5/6';
      default: return 'full';
    }
  }
  
  return 'full';
};

// Agrupar campos por secciones
const groupFieldsBySection = (fields: Field[]) => {
  const sections: Record<string, Field[]> = {};
  const noSectionFields: Field[] = [];

  fields.forEach(field => {
    // NO filtrar por field.hidden: el estado condicional se aplica después
    const sectionName = field.section?.replace(/col-span-\d+/g, '').trim() || null;
    
    if (sectionName && sectionName !== '') {
      if (!sections[sectionName]) {
        sections[sectionName] = [];
      }
      sections[sectionName].push(field);
    } else {
      noSectionFields.push(field);
    }
  });

  return { sections, noSectionFields };
};


/**
 * Componente principal del layout inteligente
 * Solo maneja la organización visual de los campos en grid y secciones
 */
export const SmartFormLayout = ({
  fields,
  className,
  renderField
}: SmartFormLayoutProps) => {
  const { sections, noSectionFields } = groupFieldsBySection(fields);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Campos sin sección */}
      {noSectionFields.length > 0 && (
        <div className="grid grid-cols-12 gap-4">
          {noSectionFields.map(field => {
            const width = extractWidthFromField(field);
            const widthClass = RESPONSIVE_WIDTH_CLASSES[width];
            
            return (
              <div 
                key={field.name} 
                className={widthClass}
                style={{ display: field.hidden ? 'none' : undefined }}
              >
                {renderField(field)}
              </div>
            );
          })}
        </div>
      )}

      {/* Campos agrupados por sección */}
      {Object.entries(sections).map(([sectionName, sectionFields]) => (
        <div key={sectionName} className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            {sectionName.charAt(0).toUpperCase() + sectionName.slice(1).replace(/-/g, ' ')}
          </h3>
          <div className="grid grid-cols-12 gap-4">
            {sectionFields.map(field => {
              const width = extractWidthFromField(field);
              const widthClass = RESPONSIVE_WIDTH_CLASSES[width];
              
              return (
                <div 
                  key={field.name} 
                  className={widthClass}
                  style={{ display: field.hidden ? 'none' : undefined }}
                >
                  {renderField(field)}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};


export default SmartFormLayout;