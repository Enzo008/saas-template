---
trigger: always_on
---

# Structure & Architecture Patterns

## File Organization

### Frontend Structure (01-Frontend/src/)
```
src/
├── features/[feature]/     # Feature-based modules
│   ├── components/         # Feature-specific components
│   ├── hooks/             # Feature-specific hooks
│   ├── pages/             # Feature pages/routes
│   ├── services/          # Feature API services
│   └── types/             # Feature TypeScript types
├── shared/                # Shared utilities
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Generic hooks (useCrudActions, etc.)
│   ├── services/          # Base services (BaseService, PaginatedService)
│   └── managers/          # Centralized managers (ErrorManager, Logger)
├── layouts/               # App layouts (MainLayout)
└── router/                # Route configuration
```

### Backend Structure (02-Backend/)
```
02-Backend/
├── Controllers/           # API controllers by entity
├── Models/               # Data models and DTOs
├── DataAccessObject/     # DAO pattern implementation
├── Middleware/           # Custom middleware
├── Extensions/           # Extension methods
└── Config/              # Configuration classes
```

## Naming Conventions

**CRITICAL**: Follow these exact patterns when creating new files:

- **Components**: PascalCase (UserTable, FormContent, AppHeader)
- **Hooks**: camelCase with "use" prefix (useUserData, useCrudActions)
- **Services**: camelCase with "Service" suffix (userService, fileStorageService)
- **Pages**: PascalCase ending in "Page" (UsersPage, DashboardPage)
- **Types/Interfaces**: PascalCase (TableProps, BaseEntity, ApiResponse)
- **Constants**: UPPER_SNAKE_CASE (SUCCESS_MESSAGES, API_ENDPOINTS)
- **Utilities**: camelCase descriptive (compositeFieldUtils, dateHelpers)

## Required Patterns

### Service Layer Pattern
**ALWAYS** extend base services for new entities:
```typescript
// For simple CRUD operations
export class UserService extends BaseService<User> {
  constructor() {
    super('/api/users');
  }
}

// For paginated data
export class ProductService extends PaginatedService<Product> {
  constructor() {
    super('/api/products');
  }
}
```

### CRUD Hook Pattern
**ALWAYS** use the established CRUD hooks:
```typescript
// For modal-based CRUD
const { actions, state } = useCrudActions<User>({
  service: userService,
  mode: 'modal'
});

// For page-based CRUD with server pagination
const { actions, state } = useOptimizedCrud<Product>({
  service: productService,
  mode: 'page'
});
```

### Table Implementation Pattern
**MANDATORY** table structure:
```typescript
// Column definition with action column
const columns = [
  // ... data columns
  {
    id: 'actions',
    meta: { isAction: true }, // REQUIRED for action column
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button onClick={() => actions.edit(row.original)}>Edit</Button>
        <Button onClick={() => actions.delete(row.original)}>Delete</Button>
      </div>
    )
  }
];

// Table component usage
<Table
  data={state.data}
  columns={columns}
  loading={state.loading}
  pagination={state.pagination}
  onPaginationChange={actions.setPagination}
/>
```

### Form Configuration Pattern
**ALWAYS** separate field definitions from form rendering:
```typescript
// fields/userFields.ts
export const userFields: FormFieldConfig[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    validation: z.string().min(1, 'Name is required')
  },
  // ... more fields
];

// Component usage
<FormContent
  fields={userFields}
  onSubmit={actions.save}
  initialData={state.selectedItem}
/>
```

### Page Structure Pattern
**REQUIRED** page component structure:
```typescript
export default function EntityPage() {
  const { actions, state } = useCrudActions<Entity>({
    service: entityService,
    mode: 'modal' // or 'page'
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1>Entity Management</h1>
        <Button onClick={actions.create}>Add New</Button>
      </div>
      
      <Table
        data={state.data}
        columns={entityColumns}
        loading={state.loading}
        // ... pagination props
      />
      
      {/* Modal or form components */}
    </div>
  );
}
```

## State Management Rules

### Server State (React Query)
- **ALWAYS** use React Query for server data
- **NEVER** store server data in Zustand
- Use optimistic updates for CRUD operations
- Implement proper cache invalidation

### Global State (Zustand)
- **ONLY** for UI state and user preferences
- Keep stores small and focused
- Use selectors to prevent unnecessary re-renders

### Component State
- Use useState for local component state
- Use useReducer for complex state logic
- Lift state up only when necessary

## Error Handling Pattern

**MANDATORY** error handling approach:
```typescript
// In services
try {
  const response = await apiClient.post('/api/users', data);
  return response.data;
} catch (error) {
  ErrorManager.handleError(error, 'Failed to create user');
  throw error;
}

// In components - errors are handled automatically by ErrorManager
// No need for try/catch in components when using CRUD hooks
```

## File Import Rules

**REQUIRED** import order:
1. React and external libraries
2. Internal shared utilities
3. Feature-specific imports
4. Relative imports (./components, ../utils)

```typescript
// ✅ Correct import order
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { useCrudActions } from '@/shared/hooks/useCrudActions';
import { userService } from '../services/userService';
import { UserForm } from './UserForm';
```