/**
 * Tipos de utilidad avanzados para TypeScript
 * Proporciona tipos más específicos y seguros para la aplicación
 */

// Tipos básicos de utilidad
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Tipos para manejo de claves
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

// Tipos para entidades de base de datos
export type EntityId<T> = T extends { id: infer U } 
  ? U 
  : T extends { [K in keyof T]: T[K] extends string | number ? T[K] : never }
    ? { [K in KeysOfType<T, string | number>]: T[K] }
    : never;

export type EntityWithId<T> = T & { id: string | number };

export type EntityTimestamps = {
  fecIng?: string | Date;
  usuIng?: string;
  fecMod?: string | Date;
  usuMod?: string;
};

export type AuditableEntity<T = {}> = T & EntityTimestamps & {
  estReg?: 'A' | 'I';
};

// Tipos para formularios
export type FormData<T> = Omit<T, keyof EntityTimestamps | 'estReg'>;

export type CreateFormData<T> = Omit<T, keyof EntityTimestamps | 'estReg' | 'id'>;

export type UpdateFormData<T> = Partial<Omit<T, keyof EntityTimestamps>> & 
  Pick<T, KeysOfType<T, string | number>>;

// Tipos para API responses
export type ApiSuccess<T = any> = {
  success: true;
  data: T;
  message?: string;
  messageType?: 'success' | 'info';
};

export type ApiError = {
  success: false;
  message: string;
  messageType?: 'error' | 'warning';
  errors?: Record<string, string[]>;
  statusCode?: number;
};

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

// Type guards para API responses
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.success === true;
}

export function isApiError(response: ApiResponse): response is ApiError {
  return response.success === false;
}

// Tipos para paginación
export type PaginationMeta = {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedData<T> = {
  data: T[];
} & PaginationMeta;

export type PaginationParams = {
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

// Tipos para filtros de búsqueda
export type FilterOperator = 
  | 'eq'      // igual
  | 'ne'      // no igual
  | 'gt'      // mayor que
  | 'gte'     // mayor o igual que
  | 'lt'      // menor que
  | 'lte'     // menor o igual que
  | 'like'    // contiene
  | 'ilike'   // contiene (case insensitive)
  | 'in'      // en lista
  | 'nin'     // no en lista
  | 'between' // entre valores
  | 'null'    // es nulo
  | 'nnull';  // no es nulo

export type FilterCondition<T, K extends keyof T = keyof T> = {
  field: K;
  operator: FilterOperator;
  value: T[K] | T[K][] | [T[K], T[K]]; // Valor, array de valores, o rango
};

export type SearchFilters<T> = {
  conditions?: FilterCondition<T>[];
  logic?: 'AND' | 'OR';
  search?: {
    term: string;
    fields: (keyof T)[];
  };
};

// Tipos para configuración de componentes
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
export type ComponentState = 'idle' | 'loading' | 'success' | 'error';

// Tipos para eventos
export type EventHandler<T = any> = (event: T) => void;
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;

// Tipos para hooks
export type HookState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  success: boolean;
};

export type AsyncHookActions<T> = {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
  setData: (data: T) => void;
  setError: (error: Error) => void;
};

export type AsyncHook<T> = [HookState<T>, AsyncHookActions<T>];

// Tipos para configuración de servicios
export type ServiceConfig = {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
};

export type CrudOperations<T> = {
  create: (data: CreateFormData<T>) => Promise<ApiResponse<T>>;
  read: (id: EntityId<T>) => Promise<ApiResponse<T>>;
  update: (data: UpdateFormData<T>) => Promise<ApiResponse<T>>;
  delete: (id: EntityId<T>) => Promise<ApiResponse<void>>;
  list: (filters?: SearchFilters<T>, pagination?: PaginationParams) => Promise<ApiResponse<PaginatedData<T>>>;
};

// Tipos para validación
export type ValidationRule<T = any> = {
  required?: boolean | string;
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  custom?: (value: T) => boolean | string;
};

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

export type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

// Tipos para formularios dinámicos
export type FieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url'
  | 'textarea' 
  | 'select' 
  | 'multiselect'
  | 'radio' 
  | 'radiogroup'
  | 'checkbox' 
  | 'switch'
  | 'date' 
  | 'datetime' 
  | 'time'
  | 'file' 
  | 'image'
  | 'color'
  | 'range'
  | 'hidden';

export type FieldOption = {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
};

export type DynamicField<T = any> = {
  name: keyof T;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  readonly?: boolean;
  options?: FieldOption[];
  validation?: ValidationRule<T[keyof T]>;
  dependencies?: {
    field: keyof T;
    value: any;
    action: 'show' | 'hide' | 'enable' | 'disable' | 'require';
  }[];
  grid?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  section?: string;
  order?: number;
};

export type FormSchema<T> = {
  fields: DynamicField<T>[];
  sections?: {
    name: string;
    title: string;
    description?: string;
    collapsible?: boolean;
    defaultExpanded?: boolean;
  }[];
  layout?: 'vertical' | 'horizontal' | 'grid';
  validation?: ValidationSchema<T>;
};

// Tipos para tablas
export type SortDirection = 'asc' | 'desc';

export type ColumnDefinition<T> = {
  key: keyof T;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: T[keyof T], row: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
  footerRender?: (data: T[]) => React.ReactNode;
};

export type TableAction<T> = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  variant?: ComponentVariant;
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
  onClick: (row: T, index: number) => void;
};

export type TableConfig<T> = {
  columns: ColumnDefinition<T>[];
  actions?: TableAction<T>[];
  selectable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  virtualized?: boolean;
  stickyHeader?: boolean;
  stickyColumns?: (keyof T)[];
  emptyMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
};

// Tipos para navegación y rutas
export type RouteParams = Record<string, string>;
export type QueryParams = Record<string, string | string[] | undefined>;

export type NavigationItem = {
  key: string;
  label: string;
  path?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  hidden?: boolean;
  children?: NavigationItem[];
  onClick?: () => void;
};

// Tipos para notificaciones
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  actions?: {
    label: string;
    action: () => void;
    variant?: ComponentVariant;
  }[];
};

// Tipos para configuración de aplicación
export type AppConfig = {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  api: {
    baseURL: string;
    timeout: number;
  };
  features: Record<string, boolean>;
  theme: {
    primaryColor: string;
    darkMode: boolean;
  };
  localization: {
    defaultLanguage: string;
    supportedLanguages: string[];
  };
};

// NOTA: Tipos de autenticación movidos a auth/types/
// Para usar tipos de User, Permission, Role, AuthState:
// import { User, Permission, Role, AuthState } from '@/auth/types';

// Tipos para archivos y uploads
export type FileType = 'image' | 'document' | 'video' | 'audio' | 'archive' | 'other' | 'pdf';

export type UploadedFile = {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  uploadedBy: string;
};

export type FileUploadConfig = {
  maxSize: number;
  allowedTypes: string[];
  multiple: boolean;
  accept?: string;
  onProgress?: (progress: number) => void;
  onSuccess?: (file: UploadedFile) => void;
  onError?: (error: Error) => void;
};

// Tipos para métricas y analytics
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'timer';

export type Metric = {
  name: string;
  type: MetricType;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
};

export type PerformanceMetrics = {
  renderTime: number;
  loadTime: number;
  memoryUsage: number;
  networkRequests: number;
  errors: number;
};

// Tipos para testing
export type MockData<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? T[K] & { mockImplementation: (fn: T[K]) => void }
    : T[K];
};

export type TestUtils<T> = {
  render: (props?: Partial<T>) => any;
  mockProps: Partial<T>;
  defaultProps: T;
};

// Exportar tipos comunes como alias
export type ID = string | number;
export type Timestamp = string | Date;
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];

// Tipos condicionales avanzados
export type If<C extends boolean, T, F> = C extends true ? T : F;

export type IsEqual<T, U> = T extends U ? (U extends T ? true : false) : false;

export type IsNever<T> = [T] extends [never] ? true : false;

export type IsAny<T> = 0 extends (1 & T) ? true : false;

export type IsUnknown<T> = IsAny<T> extends true 
  ? false 
  : unknown extends T 
    ? true 
    : false;

// Tipos para funciones de utilidad
export type Predicate<T> = (value: T) => boolean;
export type Mapper<T, U> = (value: T) => U;
export type Reducer<T, U> = (accumulator: U, current: T) => U;
export type Comparator<T> = (a: T, b: T) => number;

// Tipos para promesas y async
export type PromiseType<T> = T extends Promise<infer U> ? U : T;
export type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (...args: any) => Promise<infer R> ? R : any;