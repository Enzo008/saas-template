---
trigger: always_on
---

# TanStack Query Patterns

## Architecture Overview

Use TanStack React Query for server state management with centralized services, optimistic updates, and proper error handling integrated with the existing CRUD patterns.

## Core Patterns

### Service Layer Integration

- Extend `BaseService` or `PaginatedService` for all API operations
- Use existing `apiClient` with JWT interceptors
- Integrate with `useErrorManager` for consistent error handling
- Leverage `Logger` for operation tracking

### Query Organization

```typescript
// ✅ Correct: Use existing service pattern
const useUsersQuery = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => userService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ✅ Correct: Integrate with useCrudActions
const useOptimizedUserCrud = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      useErrorManager().handleError(error);
    },
  });
};
```

### Optimistic Updates

- Use for CRUD operations to improve UX
- Integrate with existing `useCrudActions` pattern
- Implement proper rollback on errors

```typescript
const useOptimisticUpdate = <T extends BaseEntity>() => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: T) => service.update(data.id, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["entity", newData.id] });
      const previousData = queryClient.getQueryData(["entity", newData.id]);
      queryClient.setQueryData(["entity", newData.id], newData);
      return { previousData };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(["entity", newData.id], context?.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["entity"] });
    },
  });
};
```

## Integration Rules

### With Existing Hooks

- Enhance `useCrudActions` with React Query for caching
- Use `useOptimizedCrud` for high-frequency operations
- Maintain compatibility with existing modal/page patterns

### Error Handling

- Always use `useErrorManager` for error processing
- Implement proper loading states with skeleton components
- Use toast notifications for operation feedback

### Performance

- Implement proper `staleTime` and `cacheTime` based on data volatility
- Use `keepPreviousData` for paginated queries
- Implement background refetching for critical data

## File Structure

```
src/shared/hooks/
├── queries/           # React Query hooks
│   ├── useUsersQuery.ts
│   └── useEntityQuery.ts
├── mutations/         # Mutation hooks
│   ├── useUserMutations.ts
│   └── useEntityMutations.ts
└── optimized/         # Optimized CRUD hooks
    └── useOptimizedCrud.ts
```

## Anti-Patterns

- ❌ Don't bypass existing service layer
- ❌ Don't ignore error handling patterns
- ❌ Don't create queries without proper TypeScript types
- ❌ Don't skip optimistic updates for user-facing operations