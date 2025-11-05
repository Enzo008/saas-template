/**
 * Wrapper reutilizable para formularios multi-paso con animaciones
 * Proporciona la estructura y navegación común para cualquier formulario con pasos
 * Maneja automáticamente el estado de carga inicial en modo edición
 * Incluye transiciones suaves entre pasos con Framer Motion
 */

import { ReactNode, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { StepProgressBar, Step } from './StepProgressBar';
import { Button } from '@/shared/components/ui/button';
import { ChevronLeft, ChevronRight, Save, X } from 'lucide-react';
import { stepVariants, getTransition, prefersReducedMotion } from '@/shared/config/animations';

export interface MultiStepFormStep extends Step {
  content: ReactNode;
}

interface MultiStepFormWrapperProps {
  // Configuración de pasos
  steps: MultiStepFormStep[];
  currentStep: number;
  
  // Títulos y descripciones
  title: string;
  subtitle?: string;
  
  // Estados
  isLoading?: boolean;
  isEditing?: boolean;
  /**
   * Datos del item que se está editando
   * Se usa para determinar si los datos están listos
   */
  selectedItem?: any;
  
  // Callbacks de navegación
  onNext?: () => void;
  onPrevious?: () => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  
  // Configuración de botones
  submitLabel?: string;
  cancelLabel?: string;
  nextLabel?: string;
  previousLabel?: string;
  
  // Personalización
  className?: string;
  showStepIndicator?: boolean;
  showNavigation?: boolean;
  variant?: 'default' | 'compact';
  
  // Validación personalizada
  canSubmit?: boolean;
  submitDisabledReason?: string | undefined;
}

export const MultiStepFormWrapper = ({
  steps,
  currentStep,
  title,
  subtitle,
  isLoading = false,
  isEditing = false,
  selectedItem,
  onNext,
  onPrevious,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel = 'Cancelar',
  nextLabel = 'Siguiente',
  previousLabel = 'Anterior',
  className = '',
  showStepIndicator = true,
  showNavigation = true,
  variant = 'default',
  canSubmit = true,
  submitDisabledReason
}: MultiStepFormWrapperProps) => {
  // ✅ Detectar automáticamente si estamos en modo edición por URL
  const { id } = useParams<{ id: string }>();
  const isEditMode = useMemo(() => !!id, [id]);
  
  // ✅ Estado para controlar la dirección de la animación
  const [direction, setDirection] = useState(0);
  
  // ✅ Determinar si debemos mostrar loading
  // En modo edición: mostrar loading hasta que selectedItem esté disponible
  // En modo creación: nunca mostrar loading inicial
  const shouldShowLoading = useMemo(() => {
    if (isEditMode && !selectedItem) return true;
    return false;
  }, [isEditMode, selectedItem]);
  
  const currentStepData = steps.find(step => step.id === currentStep);
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === steps.length;

  // Determinar el label del botón de submit
  const getSubmitLabel = () => {
    if (submitLabel) return submitLabel;
    return isEditing ? 'Actualizar' : 'Crear';
  };

  // ✅ Si está cargando datos iniciales, mostrar solo el loading screen
  if (shouldShowLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30">
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
    );
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Indicador de pasos - Fijo en la parte superior (solo visual, sin click) */}
      {showStepIndicator && (
        <div className="flex-shrink-0 px-6 py-4 border-b">
          <StepProgressBar
            steps={steps}
            currentStep={currentStep}
            variant={variant}
          />
        </div>
      )}

      {/* Contenido del paso actual - Scrollable */}
      <div className="flex-1 flex flex-col overflow-auto">
        <Card className="flex-1 flex flex-col border-0 shadow-none">
          <CardHeader className="flex-shrink-0 px-6 py-4">
            <CardTitle>{title}</CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
            {currentStepData && (
              <p className="text-sm text-muted-foreground">
                Paso {currentStep} de {steps.length}: {currentStepData.description}
              </p>
            )}
          </CardHeader>
          
          <CardContent className="flex-1 px-6 pb-6 overflow-auto">
            {/* Contenido del paso actual con animación */}
            {prefersReducedMotion() ? (
              // Sin animaciones si el usuario prefiere movimiento reducido
              currentStepData?.content
            ) : (
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={getTransition('step')}
                  style={{ width: '100%' }}
                >
                  {currentStepData?.content}
                </motion.div>
              </AnimatePresence>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navegación - Fija en la parte inferior */}
      {showNavigation && (
        <div className="flex-shrink-0 px-6 py-4 border-t bg-background">
          <div className="flex items-center justify-between">
            {/* Botón Anterior */}
            <div>
              {!isFirstStep && onPrevious && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDirection(-1); // Animación hacia la izquierda
                    onPrevious();
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {previousLabel}
                </Button>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-2">
              {/* Botón Cancelar */}
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  {cancelLabel}
                </Button>
              )}

              {/* Botón Siguiente o Enviar */}
              {isLastStep ? (
                // Botón de envío en el último paso
                onSubmit && (
                  <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={isLoading || !canSubmit}
                    className="flex items-center gap-2"
                    title={!canSubmit ? submitDisabledReason : undefined}
                  >
                    <Save className="h-4 w-4" />
                    {isLoading ? 'Guardando...' : getSubmitLabel()}
                  </Button>
                )
              ) : (
                // Botón siguiente en pasos intermedios
                onNext && (
                  <Button
                    type="button"
                    onClick={() => {
                      setDirection(1); // Animación hacia la derecha
                      onNext();
                    }}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {nextLabel}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook personalizado para manejar la lógica de navegación de pasos
export const useMultiStepForm = (totalSteps: number, initialStep: number = 1) => {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const goToNext = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  }, [totalSteps]);

  const goToPrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const reset = useCallback(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  return {
    currentStep,
    goToNext,
    goToPrevious,
    goToStep,
    reset,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps
  };
};