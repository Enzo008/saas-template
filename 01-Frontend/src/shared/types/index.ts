/**
 * Exportaciones centralizadas de todos los tipos
 * Punto único de acceso para todos los tipos de la aplicación
 */

// Tipos comunes
export * from './common';

// API
export * from './api';

// Email
export * from './email.types';

// Re-exportar tipos de utility.types.ts para compatibilidad
export type {
  Prettify,
  DeepPartial,
  DeepRequired,
  DeepReadonly,
  KeysOfType,
  RequiredKeys,
  OptionalKeys,
  EntityWithId,
  FormData,
  CreateFormData,
  UpdateFormData,
  PaginatedData,
  FilterCondition,
  SearchFilters,
  EventHandler,
  AsyncEventHandler,
  HookState,
  AsyncHookActions,
  AsyncHook,
  ServiceConfig,
  CrudOperations,
  ValidationRule,
  ValidationSchema,
  ValidationErrors,
  DynamicField,
  FormSchema,
  SortDirection,
  ColumnDefinition,
  TableAction,
  TableConfig,
  RouteParams,
  QueryParams,
  NotificationType,
  Notification,
  AppConfig,
  FileType,
  UploadedFile,
  FileUploadConfig,
  MetricType,
  Metric,
  PerformanceMetrics,
  MockData,
  TestUtils,
  ID,
  JSONValue,
  JSONObject,
  JSONArray,
  If,
  IsEqual,
  IsNever,
  IsAny,
  IsUnknown,
  Predicate,
  Mapper,
  Reducer,
  Comparator,
  PromiseType,
  AsyncReturnType
} from './utility.types';