---
trigger: always_on
---

# Product Rules & UX Patterns

## Core Design Principles

- **Simplicity**: Clean interfaces with reusable components
- **Consistency**: Uniform patterns using Tailwind CSS + Radix UI
- **Feedback**: Clear user feedback via toast notifications
- **Efficiency**: Minimize steps to complete tasks
- **Accessibility**: ARIA attributes and proper contrast

## UI Component Standards

### Modals & Dialogs

- Use Radix UI Modal components for CRUD operations (never create custom modals)
- Never use native `confirm()` - always use Radix UI confirmation dialogs
- Implement FormContent component for dynamic form fields in modals

### Tables

- Always use server-side pagination for datasets >100 records
- Actions column must be last column and fixed to the right
- Use `meta: { isAction: true }` for action columns in table definitions
- Implement skeleton loaders during initial loading states
- Support column sorting, filtering, and visibility toggles

### Forms

- Use React Hook Form + Zod for all form validation
- Handle composite fields with dedicated utilities (compositeFieldUtils)
- Implement real-time validation with contextual error messages
- Support both simple and multi-step forms based on complexity

### Notifications

- Use react-toastify for all user notifications (success, error, info)
- Never use alert() or other native browser notifications
- Implement centralized error handling with ErrorManager

## Navigation & Routing

- Dynamic navigation based on server-provided menus
- Use breadcrumbs with friendly names (menNom) not technical keys (menRef)
- Implement lazy loading for all page components
- Structure: MainLayout > AppContent > AppHeader/AppSidebar

## Data Management Patterns

- JWT authentication with role-based permissions
- Server-side pagination for all data tables
- Optimistic updates for CRUD operations
- File upload/download with progress tracking
- Centralized CRUD logic using useCrudActions hook

## Performance Requirements

- Lazy load components with React.lazy + Suspense
- Implement virtualization for lists >1000 items
- Use React.memo for frequently re-rendering components
- Server-side pagination mandatory for datasets >20k records
- Code splitting by routes to reduce initial bundle size

## Quality Standards

- Strong TypeScript typing (avoid `any`)
- Centralized error handling with user-friendly messages
- Consistent loading states with skeleton components
- Proper ARIA attributes for accessibility
- Structured logging for debugging and monitoring