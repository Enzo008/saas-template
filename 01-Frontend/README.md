# 🎨 Frontend - Enterprise Application Template

**Aplicación React moderna** con TypeScript, TanStack Query, Zustand y sistema CRUD unificado.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Inicio Rápido](#-inicio-rápido)
- [Arquitectura](#-arquitectura)
- [Patrones de Desarrollo](#-patrones-de-desarrollo)
- [Guías](#-guías)
- [Scripts Disponibles](#-scripts-disponibles)
- [Configuración](#-configuración)

---

## ✨ Características

### 🎯 **Sistema CRUD Unificado**

- **Factory Pattern**: `createCrudHook()` para generar hooks CRUD automáticamente
- **Presets Configurables**: `STATIC`, `DYNAMIC`, `REALTIME`, `MULTISTEP`
- **Optimistic Updates**: Actualizaciones instantáneas con rollback automático
- **Paginación del Servidor**: Integrada con React Query
- **IDs Compuestos**: Soporte nativo para claves primarias compuestas

```typescript
// Crear un hook CRUD en 3 líneas
export const usePositionCrud = createCrudHook({
  entityName: 'Position',
  service: positionService,
  preset: 'STATIC' // Datos maestros que cambian poco
});
```

### 🔐 **Autenticación y Seguridad**

- JWT con refresh token automático
- Role-based access control (RBAC)
- Permisos granulares por menú
- Encriptación de parámetros URL
- Session management con Zustand

### 📊 **Gestión de Estado**

- **TanStack Query**: Server state con caché inteligente
- **Zustand**: UI state ligero y performante
- **React Hook Form**: Formularios con validación
- **Zod**: Schemas de validación type-safe

### 🎨 **UI/UX Moderna**

- **Radix UI**: Componentes accesibles y sin estilos
- **Tailwind CSS**: Utility-first styling
- **Tema Claro/Oscuro**: Persistente con Zustand
- **Responsive**: Mobile-first design
- **i18n**: Soporte multiidioma con i18next

### 📁 **Gestión de Archivos**

- Upload con progress tracking en tiempo real
- Download con streaming
- Validación de tipos MIME
- Preview de imágenes
- Límites configurables

### 🌐 **Navegación Dinámica**

- Menús generados desde el servidor
- Breadcrumbs automáticos
- Lazy loading de rutas
- Navegación segura con encriptación
- Sidebar colapsable

---

## 🛠️ Stack Tecnológico

### **Core**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 19.x | UI Framework |
| TypeScript | 5.6.x | Type Safety |
| Vite | 6.x | Build Tool & Dev Server |

### **Routing & Navigation**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React Router DOM | 7.x | Client-side routing |
| React Router Future Flags | Latest | v7 compatibility |

### **State Management**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| TanStack Query | 5.x | Server state & caching |
| Zustand | 5.x | UI state management |

### **Forms & Validation**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React Hook Form | 7.x | Form management |
| Zod | 3.x | Schema validation |

### **UI Components**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Radix UI | Latest | Headless components |
| Tailwind CSS | 3.x | Utility-first CSS |
| Lucide React | Latest | Icon library |
| React Select | 5.x | Advanced selects |
| React Toastify | 10.x | Notifications |

### **HTTP & API**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Axios | 1.x | HTTP client |
| Crypto-JS | 4.x | URL encryption |

### **Internationalization**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| i18next | 23.x | i18n framework |
| react-i18next | 15.x | React bindings |

### **Development Tools**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| ESLint | 9.x | Code linting |
| Prettier | 3.x | Code formatting |
| TypeScript ESLint | 8.x | TS linting |

---

## 📁 Estructura del Proyecto

```
01-Frontend/
├── public/                      # Archivos estáticos
│   └── vite.svg
│
├── src/
│   ├── features/               # Módulos por funcionalidad
│   │   ├── user/              # Ejemplo: Gestión de usuarios
│   │   │   ├── components/    # Componentes específicos
│   │   │   ├── config/        # Configuración de campos
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── pages/         # Páginas del feature
│   │   │   ├── services/      # Servicios API
│   │   │   └── types/         # TypeScript types
│   │   ├── position/          # Ejemplo: CRUD simple
│   │   ├── repository/        # Ejemplo: CRUD simple
│   │   ├── identity-document/ # Ejemplo: CRUD simple
│   │   ├── rol/               # Ejemplo: Multi-paso
│   │   └── form/              # Ejemplo: Formularios dinámicos
│   │
│   ├── shared/                # Código compartido
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── ui/           # Componentes base (Button, Input, etc.)
│   │   │   ├── forms/        # Componentes de formularios
│   │   │   ├── tables/       # Componentes de tablas
│   │   │   ├── overlays/     # Modals, dialogs, tooltips
│   │   │   ├── feedback/     # Loaders, errors, toasts
│   │   │   └── utilities/    # Utilities (theme toggle, etc.)
│   │   │
│   │   ├── hooks/            # Custom hooks compartidos
│   │   │   ├── crud/         # Sistema CRUD
│   │   │   │   ├── core/     # useCrud base
│   │   │   │   ├── factories/# createCrudHook, createTableDataHook
│   │   │   │   └── optimized/# useOptimizedCrud
│   │   │   ├── browser/      # useMediaQuery, useLocalStorage
│   │   │   ├── ui/           # useNotifications, useDialog
│   │   │   └── utilities/    # useDebounce, useSmartPersistence
│   │   │
│   │   ├── services/         # Servicios API base
│   │   │   ├── api/          # BaseService, PaginatedService, CrudService
│   │   │   ├── apiClient.ts  # Axios instance configurado
│   │   │   └── fileStorageService.ts
│   │   │
│   │   ├── managers/         # Gestores centralizados
│   │   │   ├── ErrorManager.ts    # Manejo de errores
│   │   │   └── Logger.ts          # Logging estructurado
│   │   │
│   │   ├── providers/        # Context providers
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── NavigationProvider.tsx
│   │   │   ├── NotificationProvider.tsx
│   │   │   └── AppConfigProvider.tsx
│   │   │
│   │   ├── utils/            # Utilidades
│   │   │   ├── formDataUtils.ts
│   │   │   ├── dateUtils.ts
│   │   │   ├── urlEncryption.ts
│   │   │   └── auditFieldUtils.ts
│   │   │
│   │   ├── types/            # TypeScript types globales
│   │   │   ├── common/       # Tipos comunes
│   │   │   ├── api/          # Tipos de API
│   │   │   └── ui/           # Tipos de UI
│   │   │
│   │   ├── constants/        # Constantes
│   │   │   └── app.constants.ts
│   │   │
│   │   ├── config/           # Configuración
│   │   │   ├── env.ts        # Variables de entorno
│   │   │   └── reactQuery.ts # Configuración React Query
│   │   │
│   │   ├── i18n/            # Internacionalización
│   │   │   ├── config.ts
│   │   │   └── locales/
│   │   │       ├── en.json
│   │   │       └── es.json
│   │   │
│   │   └── index.ts         # Barrel export
│   │
│   ├── layouts/             # Layouts de la aplicación
│   │   ├── MainLayout.tsx   # Layout principal
│   │   ├── AuthLayout.tsx   # Layout de autenticación
│   │   └── components/      # Componentes de layout
│   │       ├── AppHeader.tsx
│   │       ├── AppSidebar.tsx
│   │       └── AppContent.tsx
│   │
│   ├── navigation/          # Sistema de navegación
│   │   ├── config/          # Configuración de rutas
│   │   ├── components/      # Componentes de navegación
│   │   └── utils/           # Utilidades de navegación
│   │
│   ├── router/              # Configuración de rutas
│   │   └── AppRouter.tsx
│   │
│   ├── dev-examples/        # Ejemplos de desarrollo
│   │   └── pages/
│   │
│   ├── App.tsx              # Componente raíz
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globales
│
├── .env.example             # Ejemplo de variables de entorno
├── .env.development         # Variables de desarrollo
├── .env.production          # Variables de producción
├── .env.local               # Variables locales (no commiteado)
├── .eslintrc.cjs            # Configuración ESLint
├── .prettierrc              # Configuración Prettier
├── tailwind.config.js       # Configuración Tailwind
├── tsconfig.json            # Configuración TypeScript
├── vite.config.ts           # Configuración Vite
├── package.json             # Dependencias
└── README.md                # Este archivo
```

---

## 🚀 Inicio Rápido

### **Prerequisitos**

- Node.js 20+ 
- npm o pnpm
- Backend corriendo en `https://localhost:7001`

### **Instalación**

```bash
# Instalar dependencias
npm install
# o
pnpm install

# Copiar variables de entorno
cp .env.example .env.local

# Editar .env.local con la URL del backend
# VITE_API_BASE_URL=https://localhost:7001
```

### **Desarrollo**

```bash
# Iniciar servidor de desarrollo
npm run dev
# o
pnpm dev

# Abrir en navegador
# http://localhost:5173
```

### **Build**

```bash
# Build para producción
npm run build

# Preview del build
npm run preview
```

---

## 🏗️ Arquitectura

### **Flujo de Datos**

```
┌─────────────────────────────────────────────────────────┐
│                    COMPONENT LAYER                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Page    │  │  Modal   │  │  Table   │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │             │             │                      │
│       └─────────────┴─────────────┘                      │
│                     │                                    │
└─────────────────────┼────────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────────┐
│                   HOOK LAYER                             │
│  ┌──────────────────────────────────────────┐            │
│  │  useCrudActions (Factory Generated)      │            │
│  │  - create, read, update, delete          │            │
│  │  - loading, error, success states        │            │
│  │  - optimistic updates                    │            │
│  └────┬─────────────────────────────────────┘            │
│       │                                                   │
└───────┼───────────────────────────────────────────────────┘
        │
┌───────▼───────────────────────────────────────────────────┐
│                  SERVICE LAYER                            │
│  ┌──────────────────────────────────────────┐            │
│  │  CrudService / PaginatedService          │            │
│  │  - getAll, getById, create, update, etc. │            │
│  │  - Extends BaseService                   │            │
│  └────┬─────────────────────────────────────┘            │
│       │                                                   │
└───────┼───────────────────────────────────────────────────┘
        │
┌───────▼───────────────────────────────────────────────────┐
│                   API CLIENT                              │
│  ┌──────────────────────────────────────────┐            │
│  │  Axios Instance                          │            │
│  │  - JWT interceptors                      │            │
│  │  - Error handling                        │            │
│  │  - Request/Response transformation       │            │
│  └────┬─────────────────────────────────────┘            │
│       │                                                   │
└───────┼───────────────────────────────────────────────────┘
        │ HTTP
┌───────▼───────────────────────────────────────────────────┐
│                   BACKEND API                             │
└───────────────────────────────────────────────────────────┘
```

### **State Management**

```
┌─────────────────────────────────────────────────────────┐
│                    REACT QUERY                           │
│  ┌──────────────────────────────────────────┐           │
│  │  Server State (Cache)                    │           │
│  │  - User data                             │           │
│  │  - Positions, Roles, etc.                │           │
│  │  - Automatic refetching                  │           │
│  │  - Optimistic updates                    │           │
│  └──────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                      ZUSTAND                             │
│  ┌──────────────────────────────────────────┐           │
│  │  UI State                                │           │
│  │  - Theme (light/dark)                    │           │
│  │  - Sidebar collapsed                     │           │
│  │  - Modal states                          │           │
│  │  - User preferences                      │           │
│  └──────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 COMPONENT STATE                          │
│  ┌──────────────────────────────────────────┐           │
│  │  Local State (useState)                  │           │
│  │  - Form inputs                           │           │
│  │  - Temporary UI state                    │           │
│  │  - Component-specific data               │           │
│  └──────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Patrones de Desarrollo

### **1. CRUD Simple (15 minutos)**

```typescript
// 1. Definir tipos
// features/entity/types/entity.types.ts
export interface Entity extends AuditableEntity {
  entCod: string;
  entNam: string;
}

// 2. Crear servicio
// features/entity/services/entityService.ts
export const entityService = new CrudService<Entity>('Entity', {
  idField: 'entCod'
});

// 3. Crear hook con factory
// features/entity/hooks/useEntityCrud.ts
export const useEntityCrud = createCrudHook({
  entityName: 'Entity',
  service: entityService,
  preset: 'STATIC'
});

// 4. Crear hook de tabla
// features/entity/hooks/useEntityTableData.tsx
export const useEntityTableData = createTableDataHook({
  entityName: 'Entity',
  useCrudHook: useEntityCrud,
  columns: entityColumns
});

// 5. Usar en página
// features/entity/pages/Entity.tsx
export default function EntityPage() {
  const { table, modal } = useEntityTableData();
  
  return (
    <>
      <DataTable {...table} />
      <EntityModal {...modal} />
    </>
  );
}
```

### **2. Formulario Multi-Paso**

```typescript
// 1. Definir pasos
const steps = [
  { id: 'basic', label: 'Información Básica' },
  { id: 'details', label: 'Detalles' },
  { id: 'review', label: 'Revisión' }
];

// 2. Usar hook multi-paso
const {
  currentStep,
  goToNextStep,
  goToPreviousStep,
  isFirstStep,
  isLastStep
} = useMultiStepForm(steps);

// 3. Renderizar paso actual
<FormStepIndicator steps={steps} currentStep={currentStep} />
{currentStep === 0 && <BasicInfoStep />}
{currentStep === 1 && <DetailsStep />}
{currentStep === 2 && <ReviewStep />}
```

### **3. Paginación del Servidor**

```typescript
// Servicio con paginación
const service = new PaginatedService<Entity>('/api/entity');

// Hook optimizado
const { actions, state } = useOptimizedCrud({
  service,
  mode: 'page'
});

// Componente
<DataTable
  data={state.data}
  pagination={state.pagination}
  onPaginationChange={actions.setPagination}
/>
```

### **4. Validación de Formularios**

```typescript
// Schema con Zod
const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  age: z.number().min(18, 'Debe ser mayor de edad')
});

// React Hook Form
const form = useForm({
  resolver: zodResolver(schema)
});

// Componente
<FormField
  control={form.control}
  name="name"
  render={({ field }) => <Input {...field} />}
/>
```

### **5. Gestión de Archivos**

```typescript
// Upload con progress
const handleUpload = async (file: File) => {
  const response = await fileStorageService.uploadFile(
    file,
    (progress) => {
      setUploadProgress(progress);
    }
  );
};

// Download
const handleDownload = async (fileId: string) => {
  await fileStorageService.downloadFile(fileId, 'filename.pdf');
};
```

---

## 📚 Guías

### **Crear un Nuevo Feature**

1. **Crear estructura de carpetas**:
```bash
features/my-feature/
├── components/
├── config/
├── hooks/
├── pages/
├── services/
└── types/
```

2. **Definir tipos** (`types/my-feature.types.ts`)
3. **Crear servicio** (`services/myFeatureService.ts`)
4. **Generar hooks** con factories
5. **Crear página** (`pages/MyFeature.tsx`)
6. **Agregar ruta** en `router/AppRouter.tsx`

### **Agregar un Componente UI**

1. Crear en `shared/components/ui/`
2. Usar Radix UI como base
3. Estilizar con Tailwind
4. Exportar desde `shared/components/ui/index.ts`
5. Documentar con JSDoc

### **Implementar Autenticación**

```typescript
// Usar el hook de autenticación
const { user, login, logout, isAuthenticated } = useAuth();

// Proteger rutas
<ProtectedRoute>
  <MyProtectedPage />
</ProtectedRoute>

// Verificar permisos
if (hasPermission('users.create')) {
  // Mostrar botón crear
}
```

### **Internacionalización**

```typescript
// Usar traducciones
const { t } = useTranslation();

// En componentes
<h1>{t('common.welcome')}</h1>

// Agregar traducciones en:
// shared/i18n/locales/es.json
// shared/i18n/locales/en.json
```

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run dev:host         # Exponer en red local

# Build
npm run build            # Build para producción
npm run preview          # Preview del build

# Linting & Formatting
npm run lint             # Ejecutar ESLint
npm run lint:fix         # Fix automático
npm run format           # Formatear con Prettier
npm run format:check     # Verificar formato

# Type Checking
npm run type-check       # Verificar tipos TypeScript

# Testing (si está configurado)
npm run test             # Ejecutar tests
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Coverage report
```

---

## ⚙️ Configuración

### **Variables de Entorno**

```env
# .env.local
VITE_API_BASE_URL=https://localhost:7001
VITE_APP_NAME=Enterprise App
VITE_ENABLE_DEBUG=true
VITE_DEFAULT_LANGUAGE=es
VITE_MAX_FILE_SIZE=104857600
```

### **React Query**

```typescript
// shared/config/reactQuery.ts
export const QUERY_PRESETS = {
  STATIC: {
    staleTime: 30 * 60 * 1000,    // 30 min
    gcTime: 60 * 60 * 1000,       // 1 hora
  },
  DYNAMIC: {
    staleTime: 5 * 60 * 1000,     // 5 min
    gcTime: 10 * 60 * 1000,       // 10 min
  },
  REALTIME: {
    staleTime: 30 * 1000,         // 30 seg
    gcTime: 2 * 60 * 1000,        // 2 min
  }
};
```

### **Tailwind**

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...}
      }
    }
  }
};
```

---

## 🧪 Testing

### **Unit Tests**

```typescript
// Example: hooks/useCrud.test.ts
import { renderHook } from '@testing-library/react';
import { useCrud } from './useCrud';

describe('useCrud', () => {
  it('should handle create operation', async () => {
    const { result } = renderHook(() => useCrud({ service }));
    await result.current.actions.create(data);
    expect(result.current.state.data).toContain(data);
  });
});
```

### **E2E Tests**

```typescript
// Example: e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('should login successfully', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="username"]', 'admin');
  await page.fill('[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

---

## 🎨 Convenciones de Código

### **Naming**

- **Components**: PascalCase (`UserTable`, `FormContent`)
- **Hooks**: camelCase con "use" (`useUserData`, `useCrudActions`)
- **Services**: camelCase con "Service" (`userService`, `fileStorageService`)
- **Types**: PascalCase (`User`, `ApiResponse`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### **File Organization**

- Un componente por archivo
- Exports nombrados preferidos
- Index files para barrel exports
- Co-locate related files

### **TypeScript**

- Evitar `any`, usar tipos explícitos
- Interfaces para objetos públicos
- Types para unions y utilities
- Generics para componentes reutilizables

---

## 🐛 Debugging

### **React DevTools**

```bash
# Instalar extensión de navegador
# Chrome: React Developer Tools
# Firefox: React Developer Tools
```

### **TanStack Query DevTools**

```typescript
// Ya incluido en desarrollo
// Abrir con botón flotante en esquina inferior
```

### **Logger**

```typescript
import { logger } from '@/shared/managers/Logger';

logger.info('User logged in', { userId: user.id });
logger.error('Failed to fetch data', error);
logger.debug('Component rendered', { props });
```

---

## 📦 Dependencias Principales

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.2",
    "@tanstack/react-query": "^5.62.7",
    "zustand": "^5.0.2",
    "react-hook-form": "^7.54.2",
    "zod": "^3.24.1",
    "@radix-ui/react-*": "^1.x",
    "tailwindcss": "^3.4.17",
    "axios": "^1.7.9",
    "i18next": "^23.17.4",
    "react-i18next": "^15.1.4"
  }
}
```

---

## 🚀 Performance

### **Optimizaciones Implementadas**

- ✅ Lazy loading de rutas
- ✅ Code splitting automático
- ✅ React.memo en componentes pesados
- ✅ useMemo/useCallback en cálculos costosos
- ✅ Virtualización de listas grandes (pendiente)
- ✅ Image lazy loading
- ✅ Debounce en búsquedas

### **Métricas Objetivo**

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle size: < 500KB (gzipped)

---

## 🔒 Seguridad

### **Implementado**

- ✅ JWT en headers Authorization
- ✅ Refresh token automático
- ✅ HTTPS only en producción
- ✅ Sanitización de inputs
- ✅ CORS configurado
- ✅ XSS protection
- ✅ CSRF tokens (pendiente)

### **Best Practices**

- No almacenar secrets en código
- Validar en cliente Y servidor
- Sanitizar datos antes de renderizar
- Usar HTTPS siempre
- Implementar rate limiting

---

## 📞 Soporte

- **Issues**: Ver README principal
- **Documentación**: `docs/` en raíz del proyecto
- **Ejemplos**: `src/dev-examples/`

---

## 🗺️ Roadmap

### **Próximas Mejoras**

- [ ] Tests unitarios completos
- [ ] Storybook para componentes
- [ ] PWA support
- [ ] Virtualización de tablas
- [ ] Drag & drop file upload
- [ ] Real-time notifications
- [ ] Dark mode mejorado

---

<div align="center">

**Parte del Enterprise Application Template**

[⬅️ Volver al README principal](../README.md)

</div>
