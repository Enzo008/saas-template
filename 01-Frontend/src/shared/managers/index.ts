/**
 * Exportaciones centralizadas de managers
 */

// Logger
export { default as Logger, useLogger } from './Logger';
export type {
  LogLevel,
  LogContext,
  LoggerConfig,
  LogEntry
} from './Logger';

// Error Manager
export { default as ErrorManager, useErrorManager } from './ErrorManager';
export type {
  AppError,
  ErrorType,
  ErrorSeverity,
  ValidationError,
  ErrorManagerConfig
} from './ErrorManager';

export {
  shouldRetryError,
  retryWithBackoff,
  showError,
  withErrorHandling
} from './ErrorManager';