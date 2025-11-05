---
trigger: always_on
---

# Technical Standards & Architecture

## Project Context

**Enterprise Application Template** - Reusable monorepo with React frontend, ASP.NET Core backend, and SQL Server database. Focus on rapid but well-structured implementations for client delivery.

**Core Features**: Unified CRUD system (useCrudActions), JWT authentication, file management with progress tracking, dynamic navigation, i18n support, centralized notifications and error handling.

## Frontend Stack (01-Frontend)

**Tech Stack**: React 19 + TypeScript, Vite, Tailwind CSS + Radix UI, React Router DOM, Zustand (UI state), TanStack React Query (server state), React Hook Form + Zod, i18next, Axios

### TypeScript Rules

- **NEVER** use `any` - use explicit types or `Record<string, unknown>`
- **ALWAYS** extend `BaseEntity` for entities with common properties
- **REQUIRED** generic types for reusable components: `Table<T>`, `useCrudActions<T>`
- Use discriminated unions for state types (loading | error | success)
- Define interfaces for all data models with proper documentation

### React Patterns

- **MANDATORY** functional components with hooks following project patterns
- Use `React.memo` for frequently re-rendering components
- Use `React.forwardRef` for UI components needing refs (Button, Input)
- Optimize with `useMemo`/`useCallback` for lists and expensive calculations
- Single responsibility principle - one concern per component
- Use Context API only for related component groups

### Performance Requirements

- **MANDATORY** lazy loading for routes: `React.lazy` + `Suspense`
- **MANDATORY** server-side pagination for datasets >20k records
- **REQUIRED** skeleton loaders for loading states
- Code splitting by routes to reduce bundle size
- Virtualization for lists >1000 items
- WebP images with lazy loading

### Service Layer

- **ALWAYS** extend `BaseService<T>` or `PaginatedService<T>` for new entities
- **REQUIRED** centralized error handling with `ErrorManager`
- **MANDATORY** use `apiClient` for all HTTP requests
- Implement progress tracking for file operations with `postWithProgress`
- Use `AbortController` for request cancellation
- Centralize JWT token handling in interceptors

## Backend Architecture (02-Backend)

**Tech Stack**: ASP.NET Core, JWT authentication, SQL Server, Dapper ORM

### Required Patterns

- **MANDATORY** Controller-DAO-Model pattern for separation of concerns
- **ALWAYS** use 03-Helper library for common utilities
- **REQUIRED** standardized `ApiResponse<T>` for all API responses
- **MANDATORY** stored procedures for complex database operations
- Use dependency injection for all services and helpers
- Centralize configuration in AppSettings classes

### Security Standards

- **REQUIRED** JWT with access/refresh tokens
- **MANDATORY** role-based permission validation per endpoint
- **ALWAYS** validate all user inputs server-side
- Configure CORS for allowed origins only
- Implement rate limiting for brute force protection

### File Management

- **REQUIRED** streaming for files >10MB
- **MANDATORY** proper Content-Disposition headers for downloads
- **LIMITS** 100MB max file size (configurable)
- Use `FileStorageHelper` for common file operations
- Validate MIME types and implement progress tracking

## Database Standards (03-Database)

**Engine**: SQL Server with `SQL_Latin1_General_CP1_CI_AI` collation

### Naming Conventions (MANDATORY)

- **Tables**: Singular PascalCase (`Usuario`, `Producto`)
- **Stored Procedures**: `SP_VERBO_ENTIDAD` (`SP_OBTENER_USUARIO`)
- **Parameters**: `@P_NOMBRE_PARAMETRO` (`@P_ID_USUARIO`)
- **Variables**: `@V_NOMBRE_VARIABLE` (`@V_CONTADOR`)
- **Indexes**: `IX_TABLA_COLUMNA` (`IX_Usuario_Email`)
- **Primary Keys**: `PK_TABLA` (`PK_Usuario`)
- **Foreign Keys**: `FK_TABLA_TABLAREF` (`FK_Usuario_Perfil`)

### Stored Procedure Standards

- **REQUIRED** pagination parameters: `@P_PageSize`, `@P_PageNumber`
- **MANDATORY** `FOR JSON PATH` for complex nested results
- **ALWAYS** use `TRY/CATCH` for error handling
- **REQUIRED** transaction handling for multi-table operations
- Use output parameters for result metadata
- Document all parameters and expected behavior

### Database Design Rules

- **MANDATORY** normalize to 3rd normal form
- **REQUIRED** appropriate data types for each column
- **ALWAYS** implement integrity constraints (CHECK, UNIQUE, etc.)
- Use schemas for logical organization
- Prefer set-based operations over cursors
- Implement proper indexing for frequent queries