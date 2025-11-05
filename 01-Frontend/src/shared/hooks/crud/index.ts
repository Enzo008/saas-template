/**
 * Hooks CRUD - Exports centralizados
 * Agrupa toda la funcionalidad CRUD reutilizable
 */

// Factories para crear hooks CRUD
export * from './factories';

// Hooks core de CRUD
export * from './core';

// Re-exports de tipos importantes
export type { 
  UseCrudOptions, 
  UseCrudReturn 
} from './core/useCrud';

export type { 
  CreateCrudHookOptions 
} from './factories/createCrudHook';

export type { 
  CreateTableDataHookOptions,
  TableDataHookProps,
  TableDataHookReturn,
  ColumnConfig
} from './factories/createTableDataHook';
