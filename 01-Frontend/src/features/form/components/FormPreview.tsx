/**
 * Componente para mostrar vista previa del formulario dinámico
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Eye, EyeOff, Monitor, Smartphone, Tablet } from 'lucide-react';
import { FormField, FieldType, FormType, FormStatus } from '../types';

interface FormPreviewProps {
  form: {
    forNom?: string | undefined;
    forDes?: string | undefined;
    forTip?: FormType | undefined;
    forEst?: FormStatus | undefined;
  };
  fields: FormField[];
  showHiddenFields?: boolean;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const viewportSizes = {
  desktop: { width: '100%', maxWidth: 'none', icon: Monitor, label: 'Escritorio' },
  tablet: { width: '768px', maxWidth: '768px', icon: Tablet, label: 'Tablet' },
  mobile: { width: '375px', maxWidth: '375px', icon: Smartphone, label: 'Móvil' }
};

export const FormPreview = ({
  form,
  fields,
  showHiddenFields = false
}: FormPreviewProps) => {
  const [currentViewport, setCurrentViewport] = useState<ViewportSize>('desktop');
  
  const visibleFields = fields
    .filter(field => showHiddenFields || field.forFieVis !== false)
    .sort((a, b) => (a.forFieOrd || 0) - (b.forFieOrd || 0));

  const renderFieldPreview = (field: FormField, viewport: ViewportSize = 'desktop') => {
    // Calcular columnas según el viewport
    const getResponsiveColumns = (originalColumns: number) => {
      if (viewport === 'mobile') return 1;
      if (viewport === 'tablet') return Math.min(originalColumns, 6);
      return originalColumns;
    };
    const getFieldTypeLabel = (type: FieldType): string => {
      const typeLabels: Record<FieldType, string> = {
        TEXT: 'Texto',
        TEXTAREA: 'Área de texto',
        NUMBER: 'Número',
        EMAIL: 'Email',
        PASSWORD: 'Contraseña',
        SELECT: 'Lista desplegable',
        RADIO: 'Opción única',
        CHECKBOX: 'Casilla de verificación',
        DATE: 'Fecha',
        TIME: 'Hora',
        DATETIME: 'Fecha y hora',
        FILE: 'Archivo',
        HIDDEN: 'Campo oculto'
      };
      return typeLabels[type] || type;
    };

    const renderFieldInput = () => {
      switch (field.forFieTyp) {
        case 'TEXT':
        case 'EMAIL':
        case 'PASSWORD':
          return (
            <input
              type={field.forFieTyp.toLowerCase()}
              placeholder={field.forFiePla || ''}
              defaultValue={field.forFieVal || ''}
              disabled
              className="w-full p-2 border border-input rounded-md bg-muted/50"
            />
          );
        
        case 'TEXTAREA':
          return (
            <textarea
              placeholder={field.forFiePla || ''}
              defaultValue={field.forFieVal || ''}
              disabled
              rows={3}
              className="w-full p-2 border border-input rounded-md bg-muted/50"
            />
          );
        
        case 'NUMBER':
          return (
            <input
              type="number"
              placeholder={field.forFiePla || ''}
              defaultValue={field.forFieVal || ''}
              min={field.forFieMin}
              max={field.forFieMax}
              disabled
              className="w-full p-2 border border-input rounded-md bg-muted/50"
            />
          );
        
        case 'SELECT':
          let selectOptions = [];
          try {
            selectOptions = field.forFieOpt ? JSON.parse(field.forFieOpt) : [];
          } catch {
            selectOptions = [];
          }
          return (
            <select disabled className="w-full p-2 border border-input rounded-md bg-muted/50">
              <option value="">{field.forFiePla || 'Seleccione una opción'}</option>
              {selectOptions.map((option: any, index: number) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        
        case 'RADIO':
          let radioOptions = [];
          try {
            radioOptions = field.forFieOpt ? JSON.parse(field.forFieOpt) : [];
          } catch {
            radioOptions = [];
          }
          return (
            <div className="space-y-2">
              {radioOptions.map((option: any, index: number) => (
                <label key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={field.forFieCod}
                    value={option.value}
                    disabled
                    className="text-primary"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          );
        
        case 'CHECKBOX':
          return (
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                defaultChecked={field.forFieVal === 'true'}
                disabled
                className="text-primary"
              />
              <span>{field.forFiePla || 'Marcar si aplica'}</span>
            </label>
          );
        
        case 'DATE':
          return (
            <input
              type="date"
              defaultValue={field.forFieVal || ''}
              disabled
              className="w-full p-2 border border-input rounded-md bg-muted/50"
            />
          );
        
        case 'TIME':
          return (
            <input
              type="time"
              defaultValue={field.forFieVal || ''}
              disabled
              className="w-full p-2 border border-input rounded-md bg-muted/50"
            />
          );
        
        case 'DATETIME':
          return (
            <input
              type="datetime-local"
              defaultValue={field.forFieVal || ''}
              disabled
              className="w-full p-2 border border-input rounded-md bg-muted/50"
            />
          );
        
        case 'FILE':
          return (
            <input
              type="file"
              disabled
              className="w-full p-2 border border-input rounded-md bg-muted/50"
            />
          );
        
        case 'HIDDEN':
          return (
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
              <span className="text-yellow-700">Campo oculto: {field.forFieVal || 'Sin valor'}</span>
            </div>
          );
        
        default:
          return (
            <div className="p-2 bg-muted border border-input rounded-md text-sm text-muted-foreground">
              Tipo de campo no soportado: {field.forFieTyp}
            </div>
          );
      }
    };

    const responsiveColumns = getResponsiveColumns(field.forFieCol || 12);
    
    return (
      <div
        key={field.forFieCod}
        className={`space-y-2 ${field.forFieVis === false ? 'opacity-50' : ''}`}
        style={{ 
          gridColumn: viewport === 'mobile' 
            ? 'span 1' 
            : viewport === 'tablet' 
            ? `span ${Math.min(responsiveColumns, 6)}`
            : `span ${Math.min(responsiveColumns, 12)}`
        }}
      >
        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium text-gray-700">
            {field.forFieLab}
            {field.forFieReq && <span className="text-red-500 ml-1">*</span>}
          </label>
          <Badge variant="outline" className="text-xs">
            {getFieldTypeLabel(field.forFieTyp)}
          </Badge>
          {field.forFieVis === false && (
            <EyeOff className="h-3 w-3 text-gray-400" />
          )}
        </div>
        
        {renderFieldInput()}
        
        {field.forFieHel && (
          <p className="text-xs text-muted-foreground">{field.forFieHel}</p>
        )}
        
        {field.forFieErr && (
          <p className="text-xs text-destructive">Error: {field.forFieErr}</p>
        )}
      </div>
    );
  };

  if (fields.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <Eye className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p>Vista previa del formulario</p>
            <p className="text-sm">Agrega campos para ver la vista previa</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vista Previa del Formulario
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {form.forNom || 'Formulario sin nombre'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {visibleFields.length} campo{visibleFields.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        
        {form.forDes && (
          <p className="text-sm text-muted-foreground mt-2">{form.forDes}</p>
        )}

        {/* Controles de viewport */}
        <div className="flex items-center gap-2 mt-4 p-2 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium text-muted-foreground">Vista:</span>
          {Object.entries(viewportSizes).map(([size, config]) => {
            const IconComponent = config.icon;
            return (
              <Button
                key={size}
                variant={currentViewport === size ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentViewport(size as ViewportSize)}
                className="flex items-center gap-1"
              >
                <IconComponent className="h-4 w-4" />
                <span className="hidden sm:inline">{config.label}</span>
              </Button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        {/* Contenedor responsive */}
        <div className="w-full overflow-x-auto">
          <div 
            className="mx-auto transition-all duration-300 border rounded-lg bg-background"
            style={{
              width: viewportSizes[currentViewport].width,
              maxWidth: viewportSizes[currentViewport].maxWidth,
              minHeight: '400px'
            }}
          >
            <div className="p-4">
              <div className={`grid gap-4 ${
                currentViewport === 'mobile' 
                  ? 'grid-cols-1' 
                  : currentViewport === 'tablet'
                  ? 'grid-cols-6'
                  : 'grid-cols-12'
              }`}>
                {visibleFields.map((field) => renderFieldPreview(field, currentViewport))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-end space-x-2">
            <button
              disabled
              className="px-4 py-2 bg-gray-100 text-gray-400 rounded-md cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              disabled
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-not-allowed"
            >
              Enviar Formulario
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};