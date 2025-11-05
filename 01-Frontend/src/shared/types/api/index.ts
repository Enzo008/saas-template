/**
 * Exportaciones centralizadas de tipos de API
 */

// Response types
export type {
  ApiResponse,
  ApiSuccess,
  ApiError,
  ApiPaginatedResponse,
  CrudResponse,
  ValidationResponse,
  ValidationError,
  ValidationWarning,
  FileResponse,
  StatsResponse
} from './responses.types';

// Response type guards
export {
  isApiSuccess,
  isApiError,
  isValidationError
} from './responses.types';

// Request types
export type {
  BaseRequest,
  FilteredRequest,
  PaginatedRequest,
  AdvancedSearchRequest,
  SearchFilter,
  FilterOperator,
  CreateRequest,
  UpdateRequest,
  DeleteRequest,
  FileUploadRequest,
  ExportRequest,
  ImportRequest,
  BatchRequest,
  BatchOperation
} from './requests.types';