/**
 * Exportaciones centralizadas de tipos comunes
 */

// Base types
export type {
  AuditFields,
  AuditableEntity,
  BaseEntity,
  EntityId,
  CompositeId,
  Timestamp,
  RecordStatus,
  CrudOperation,
  EntityConfig,
  EntityMetadata,
  FieldConfig,
  FieldType,
  SelectOption,
  ComponentConfig,
  ComponentSize,
  ComponentVariant,
  ComponentState,
  ThemeConfig
} from './base.types';

// Pagination types
export type {
  PaginationParams,
  PaginationMeta,
  PaginatedResponse,
  PaginationConfig,
  PageInfo,
  SortOption,
  PaginationState,
  PaginationActions
} from './pagination.types';