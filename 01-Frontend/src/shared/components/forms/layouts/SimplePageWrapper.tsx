/**
 * SimplePageWrapper - Wrapper profesional para páginas de formulario
 * Con scroll interno, loading states y diseño mejorado
 * Maneja automáticamente el estado de carga inicial en modo edición
 */

import { ReactNode, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { FileEdit, Plus } from 'lucide-react';

interface SimplePageWrapperProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onSubmit?: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  showSubmitButton?: boolean;
  showCancelButton?: boolean;
  canSubmit?: boolean;
  /** 
   * Indica si estamos en modo edición
   * Se usa para determinar el icono y badge
   */
  isEditing?: boolean;
  /** 
   * Loading inicial de datos (para modo edición)
   * Cuando es true, muestra pantalla de carga completa
   */
  isLoadingInitialData?: boolean;
  /**
   * Datos del item que se está editando
   * Se usa para determinar si los datos están listos
   */
  selectedItem?: any;
}

/**
 * SimplePageWrapper - Wrapper profesional para páginas completas
 * 
 * Características:
 * - Header fijo con título mejorado y badge de estado
 * - Loading screen para carga inicial de datos
 * - Contenido con scroll interno
 * - Footer fijo con botones de acción
 * - Diseño profesional y consistente
 */
export default function SimplePageWrapper({ 
  title,
  subtitle,
  children,
  onSubmit,
  onCancel,
  isLoading = false,
  isSubmitting = false,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  showSubmitButton = true,
  showCancelButton = true,
  canSubmit = true,
  isEditing = false,
  isLoadingInitialData = false,
  selectedItem
}: SimplePageWrapperProps) {
  
  // ✅ Detectar automáticamente si estamos en modo edición por URL
  const { id } = useParams<{ id: string }>();
  const isEditMode = useMemo(() => !!id, [id]);
  
  // ✅ Determinar si debemos mostrar loading
  // En modo edición: mostrar loading hasta que selectedItem esté disponible
  // En modo creación: nunca mostrar loading inicial
  const shouldShowLoading = useMemo(() => {
    if (isLoadingInitialData) return true;
    if (isEditMode && !selectedItem) return true;
    return false;
  }, [isLoadingInitialData, isEditMode, selectedItem]);
  
  // ✅ Si está cargando datos iniciales, mostrar solo el loading screen
  if (shouldShowLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-muted/30">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-xl font-semibold text-foreground">Cargando datos...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Por favor espera mientras obtenemos la información
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-muted/30">
      {/* Header Fijo - Mejorado */}
      <div className="flex-none bg-background border-b shadow-sm">
        <div className="px-6 py-5">
          <div className="flex items-start gap-4">
            {/* Icono según modo */}
            <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${
              isEditing ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
            }`}>
              {isEditing ? <FileEdit className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </div>
            
            {/* Título y subtítulo */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                  isEditing 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-green-100 text-green-700 border border-green-200'
                }`}>
                  {isEditing ? 'Modo Edición' : 'Nuevo Registro'}
                </span>
              </div>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content - Con scroll interno */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          {children}
        </div>
      </div>

      {/* Footer Fijo - Mejorado */}
      <div className="flex-none bg-background border-t shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Info adicional */}
            <div className="text-sm text-muted-foreground">
              {isLoading && (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </span>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-3">
              {showCancelButton && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="min-w-[100px]"
                >
                  {cancelLabel}
                </Button>
              )}
              {showSubmitButton && onSubmit && (
                <Button
                  type="button"
                  onClick={onSubmit}
                  disabled={isSubmitting || isLoading || !canSubmit}
                  className="min-w-[140px]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </span>
                  ) : (
                    submitLabel
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
