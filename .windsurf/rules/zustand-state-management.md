---
trigger: always_on
---

# Zustand State Management Standards

## Overview

This enterprise application uses [Zustand](https://github.com/pmndrs/zustand) exclusively for **UI state management**. Server state is handled by TanStack React Query. Zustand provides lightweight (1.1kB gzipped) global state for user preferences, UI interactions, and component state that needs to persist across navigation.

## State Management Boundaries

- **Zustand**: UI state, user preferences, modal states, navigation state
- **React Query**: Server data, caching, synchronization, mutations
- **Component State**: Local form state, temporary UI interactions

## Core Principles

1. **Custom Hook Pattern**: Only export custom hooks, never raw stores
2. **Atomic Selectors**: Single-value selectors for optimal performance
3. **Separate Actions**: Organize actions in dedicated namespace
4. **Event-Driven Actions**: Model actions as events, not setters
5. **Small Focused Stores**: Keep stores small and purpose-specific

## Store Architecture Pattern

### Basic Store Structure

```typescript
// src/shared/stores/uiStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  sidebarCollapsed: boolean;
  theme: "light" | "dark" | "system";
  modalOpen: boolean;
  selectedItems: string[];
  actions: {
    toggleSidebar: () => void;
    setTheme: (theme: "light" | "dark" | "system") => void;
    openModal: () => void;
    closeModal: () => void;
    selectItem: (id: string) => void;
    clearSelection: () => void;
  };
}

// ⬇️ Not exported - prevents direct store access
const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      theme: "system",
      modalOpen: false,
      selectedItems: [],

      // ⬇️ Separate "namespace" for actions
      actions: {
        toggleSidebar: () =>
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

        setTheme: (theme) => set({ theme }),

        openModal: () => set({ modalOpen: true }),
        closeModal: () => set({ modalOpen: false }),

        selectItem: (id) =>
          set((state) => ({
            selectedItems: [...state.selectedItems, id],
          })),

        clearSelection: () => set({ selectedItems: [] }),
      },
    }),
    {
      name: "app-ui-storage",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);

// 💡 Exported custom hooks - atomic selectors
export const useSidebarCollapsed = () =>
  useUiStore((state) => state.sidebarCollapsed);
export const useTheme = () => useUiStore((state) => state.theme);
export const useModalOpen = () => useUiStore((state) => state.modalOpen);
export const useSelectedItems = () =>
  useUiStore((state) => state.selectedItems);

// 🎉 Single selector for all actions (actions never change)
export const useUiActions = () => useUiStore((state) => state.actions);
```

## Enterprise Application Store Patterns

### Navigation Store Example

```typescript
// src/shared/stores/navigationStore.ts
import { create } from "zustand";

interface NavigationState {
  breadcrumbs: Array<{ label: string; path: string }>;
  sidebarOpen: boolean;
  currentModule: string | null;
  actions: {
    setBreadcrumbs: (
      breadcrumbs: Array<{ label: string; path: string }>
    ) => void;
    toggleSidebar: () => void;
    setCurrentModule: (module: string) => void;
    addBreadcrumb: (breadcrumb: { label: string; path: string }) => void;
  };
}

const useNavigationStore = create<NavigationState>((set, get) => ({
  breadcrumbs: [],
  sidebarOpen: true,
  currentModule: null,

  actions: {
    setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    setCurrentModule: (module) => set({ currentModule: module }),

    addBreadcrumb: (breadcrumb) =>
      set((state) => ({
        breadcrumbs: [...state.breadcrumbs, breadcrumb],
      })),
  },
}));

// Atomic selectors
export const useBreadcrumbs = () =>
  useNavigationStore((state) => state.breadcrumbs);
export const useSidebarOpen = () =>
  useNavigationStore((state) => state.sidebarOpen);
export const useCurrentModule = () =>
  useNavigationStore((state) => state.currentModule);

// Actions
export const useNavigationActions = () =>
  useNavigationStore((state) => state.actions);
```

### Modal Management Store

```typescript
// src/shared/stores/modalStore.ts
import { create } from "zustand";

interface ModalState {
  modals: Record<string, boolean>;
  modalData: Record<string, unknown>;
  actions: {
    openModal: (modalId: string, data?: unknown) => void;
    closeModal: (modalId: string) => void;
    closeAllModals: () => void;
    setModalData: (modalId: string, data: unknown) => void;
  };
}

const useModalStore = create<ModalState>((set, get) => ({
  modals: {},
  modalData: {},

  actions: {
    openModal: (modalId, data) =>
      set((state) => ({
        modals: { ...state.modals, [modalId]: true },
        modalData: data
          ? { ...state.modalData, [modalId]: data }
          : state.modalData,
      })),

    closeModal: (modalId) =>
      set((state) => ({
        modals: { ...state.modals, [modalId]: false },
        modalData: { ...state.modalData, [modalId]: undefined },
      })),

    closeAllModals: () => set({ modals: {}, modalData: {} }),

    setModalData: (modalId, data) =>
      set((state) => ({
        modalData: { ...state.modalData, [modalId]: data },
      })),
  },
}));

// Atomic selectors
export const useModalOpen = (modalId: string) =>
  useModalStore((state) => state.modals[modalId] || false);

export const useModalData = <T = unknown>(modalId: string) =>
  useModalStore((state) => state.modalData[modalId] as T);

// Actions
export const useModalActions = () => useModalStore((state) => state.actions);
```

## Store Composition Patterns

### Combining UI State with CRUD Operations

```typescript
// src/shared/hooks/useTableState.ts
import { useCallback } from "react";
import { useModalOpen, useModalActions } from "@/shared/stores/modalStore";
import { useCrudActions } from "@/shared/hooks/useCrudActions";

export const useTableState = <T>(service: any, modalId: string) => {
  const modalOpen = useModalOpen(modalId);
  const { openModal, closeModal } = useModalActions();
  const { actions, state } = useCrudActions<T>({ service, mode: "modal" });

  const handleCreate = useCallback(() => {
    actions.create();
    openModal(modalId);
  }, [actions, openModal, modalId]);

  const handleEdit = useCallback(
    (item: T) => {
      actions.edit(item);
      openModal(modalId, item);
    },
    [actions, openModal, modalId]
  );

  const handleCloseModal = useCallback(() => {
    closeModal(modalId);
    actions.cancel();
  }, [closeModal, actions, modalId]);

  return {
    ...state,
    modalOpen,
    handleCreate,
    handleEdit,
    handleCloseModal,
    actions: {
      ...actions,
      save: async (data: T) => {
        await actions.save(data);
        closeModal(modalId);
      },
    },
  };
};
```

### Combining with Server State (React Query)

```typescript
// src/shared/hooks/useUserPreferences.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme, useUiActions } from "@/shared/stores/uiStore";
import { userService } from "@/shared/services/userService";

export const useUserPreferences = () => {
  const localTheme = useTheme();
  const { setTheme } = useUiActions();
  const queryClient = useQueryClient();

  // Server state
  const { data: serverPreferences, isLoading } = useQuery({
    queryKey: ["user-preferences"],
    queryFn: () => userService.getPreferences(),
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: userService.updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
    },
  });

  const syncTheme = useCallback(
    async (theme: "light" | "dark" | "system") => {
      // Update local state immediately for instant feedback
      setTheme(theme);

      // Sync to server
      try {
        await updatePreferencesMutation.mutateAsync({ theme });
      } catch (error) {
        // Revert local state on error
        setTheme(serverPreferences?.theme || "system");
        throw error;
      }
    },
    [setTheme, updatePreferencesMutation, serverPreferences]
  );

  return {
    theme: localTheme,
    serverPreferences,
    syncTheme,
    isLoading,
    isSyncing: updatePreferencesMutation.isPending,
  };
};
```

## Performance Best Practices

### Avoiding Over-Subscription

```typescript
// ❌ Bad: Subscribing to entire store
const badExample = () => {
  const { sidebarOpen, theme, modalOpen } = useUiStore(); // Subscribes to everything!
  return <div className={theme}>{sidebarOpen ? "Open" : "Closed"}</div>;
};

// ✅ Good: Atomic selectors
const goodExample = () => {
  const sidebarOpen = useSidebarOpen(); // Only subscribes to sidebarOpen
  const theme = useTheme(); // Only subscribes to theme
  return <div className={theme}>{sidebarOpen ? "Open" : "Closed"}</div>;
};
```

### Shallow Comparison for Objects

```typescript
// When you must return objects, use shallow comparison
import { shallow } from "zustand/shallow";

const useMultipleUiValues = () =>
  useUiStore(
    (state) => ({
      sidebarOpen: state.sidebarOpen,
      theme: state.theme,
    }),
    shallow
  );

// ✅ Better: Use multiple atomic selectors
const useUiState = () => ({
  sidebarOpen: useSidebarOpen(),
  theme: useTheme(),
});
```

### Optimizing Modal State

```typescript
// ✅ Efficient modal state management
const MyComponent = () => {
  // Only subscribes to specific modal
  const isUserModalOpen = useModalOpen("user-modal");
  const userData = useModalData<User>("user-modal");

  // Actions don't cause re-renders
  const { openModal, closeModal } = useModalActions();

  return (
    <div>
      <button onClick={() => openModal("user-modal", { id: 1 })}>
        Edit User
      </button>
      {isUserModalOpen && <UserModal data={userData} />}
    </div>
  );
};
```

## File Organization

```
src/shared/stores/
├── index.ts              # Export all stores
├── uiStore.ts            # UI preferences and theme
├── navigationStore.ts    # Navigation and breadcrumbs
├── modalStore.ts         # Modal state management
└── notificationStore.ts  # Toast notifications and alerts

src/shared/hooks/
├── useTableState.ts      # Combined table + modal state
├── useUserPreferences.ts # Server/client state sync
├── useAppNavigation.ts   # Navigation with breadcrumbs
└── useNotifications.ts   # Centralized notifications

src/features/[feature]/hooks/
├── useFeatureState.ts    # Feature-specific UI state
└── useFeatureModals.ts   # Feature-specific modal logic
```

## Integration Guidelines

### With CRUD Operations

```typescript
// Integrate Zustand UI state with CRUD hooks
const UsersPage = () => {
  const { actions, state } = useTableState(userService, "user-modal");
  const sidebarOpen = useSidebarOpen();

  return (
    <div className={`transition-all ${sidebarOpen ? "ml-64" : "ml-16"}`}>
      <div className="flex justify-between items-center mb-4">
        <h1>Users</h1>
        <Button onClick={actions.handleCreate}>Add User</Button>
      </div>

      <Table
        data={state.data}
        columns={userColumns}
        loading={state.loading}
        onEdit={actions.handleEdit}
        onDelete={actions.delete}
      />

      <UserModal
        open={state.modalOpen}
        onClose={actions.handleCloseModal}
        onSave={actions.save}
        initialData={state.selectedItem}
      />
    </div>
  );
};
```

### With React Query

```typescript
// Sync UI state with server preferences
const useAppInitialization = () => {
  const { setTheme } = useUiActions();

  const { data: userPreferences } = useQuery({
    queryKey: ["user-preferences"],
    queryFn: userService.getPreferences,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (userPreferences?.theme) {
      setTheme(userPreferences.theme);
    }
  }, [userPreferences, setTheme]);

  return { isInitialized: !!userPreferences };
};
```

## Common Anti-Patterns to Avoid

### ❌ Exporting Raw Stores

```typescript
// Don't do this
export const uiStore = create(/* ... */);

// Components might do this (bad)
const { sidebarOpen, theme } = uiStore(); // Subscribes to everything!
```

### ❌ Storing Server Data in Zustand

```typescript
// ❌ Bad: Server data in Zustand
const useUserStore = create(() => ({
  users: [], // This should be in React Query!
  loading: false,
  error: null,
}));

// ✅ Good: Only UI state in Zustand
const useUiStore = create(() => ({
  selectedUserId: null, // UI selection state
  modalOpen: false, // UI modal state
  sidebarOpen: true, // UI layout state
}));
```

### ❌ Using Setters Instead of Events

```typescript
// ❌ Bad: Setter-style actions
actions: {
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
}

// ✅ Good: Event-style actions
actions: {
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  switchTheme: (theme) => set({ theme }),
}
```

### ❌ Large Monolithic Stores

```typescript
// ❌ Bad: Everything in one store
const useAppStore = create(() => ({
  theme: "light",
  sidebarOpen: true,
  modalStates: {},
  notifications: [],
  breadcrumbs: [],
  selectedItems: {},
  // ... 20 more UI properties
}));

// ✅ Good: Separate focused stores
const useUiStore = create(/* theme, sidebar */);
const useModalStore = create(/* modal states */);
const useNavigationStore = create(/* breadcrumbs, navigation */);
```

## Integration with Project Architecture

### With useCrudActions Hook

```typescript
// Zustand handles UI state, useCrudActions handles server operations
const useUserManagement = () => {
  const modalOpen = useModalOpen("user-modal");
  const { openModal, closeModal } = useModalActions();

  const { actions, state } = useCrudActions<User>({
    service: userService,
    mode: "modal",
  });

  return {
    ...state,
    modalOpen,
    openCreateModal: () => {
      actions.create();
      openModal("user-modal");
    },
    closeModal: () => {
      closeModal("user-modal");
      actions.cancel();
    },
  };
};
```

### With ErrorManager

```typescript
// Zustand for notification state, ErrorManager for error handling
const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  actions: {
    addNotification: (notification) =>
      set((state) => ({
        notifications: [...state.notifications, notification],
      })),
    removeNotification: (id) =>
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),
  },
}));

// ErrorManager can use the store for UI notifications
ErrorManager.setNotificationHandler((message, type) => {
  const { addNotification } = useNotificationStore.getState().actions;
  addNotification({ id: Date.now(), message, type });
});
```

## Best Practices Summary

1. **Use Zustand only for UI state** - server data belongs in React Query
2. **Export atomic selectors** - never export raw stores
3. **Separate actions namespace** - organize actions separately from state
4. **Use persist middleware** - for user preferences that should survive page refresh
5. **Keep stores focused** - one concern per store (UI, modals, navigation)
6. **Compose with custom hooks** - combine Zustand with CRUD operations
7. **Event-driven actions** - model user interactions, not data setters