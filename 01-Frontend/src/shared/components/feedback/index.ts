/**
 * Feedback Components - Exportaciones centralizadas
 */

// Error Boundary básico (mantener compatibilidad)
export { default as ErrorBoundary } from './ErrorBoundary';

// Error Boundaries específicos
export {
  FormErrorBoundary,
  TableErrorBoundary,
  PageErrorBoundary,
  DataErrorBoundary,
  ModalErrorBoundary,
  useErrorBoundary,
  withFormErrorBoundary,
  withTableErrorBoundary,
  withPageErrorBoundary,
  withDataErrorBoundary,
  withModalErrorBoundary
} from './SpecificErrorBoundaries';