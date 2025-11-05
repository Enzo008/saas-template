# ✅ Quick Start Checklist - Nuevo Proyecto

## 🎯 Objetivo
Usar esta plantilla para crear: **[NOMBRE DE TU PROYECTO]**

---

## 📝 Información del Proyecto

```
Nombre del proyecto: _________________ (ej: project-contability)
Título: _________________ (ej: Sistema de Contabilidad)
Base de datos: _________________ (ej: DB_CONTABILIDAD)
```

---

## 🚀 Pasos Rápidos

### 1️⃣ Preparación (5 min)

- [ ] Copiar toda la carpeta `saas-template`
- [ ] Renombrar carpeta a tu proyecto (ej: `project-contability`)
- [ ] Abrir en VS Code

---

### 2️⃣ Opción A: Usar Script Automático (Recomendado)

```powershell
# En PowerShell, desde la raíz del proyecto:
.\rename-project.ps1 -NewProjectName "project-contability" -NewProjectTitle "Sistema de Contabilidad"
```

**Luego ir al paso 4️⃣**

---

### 2️⃣ Opción B: Manual

#### Frontend (10 min)

- [ ] `01-Frontend/package.json`
  - [ ] Cambiar `"name": "project-contability.client"`
  - [ ] Cambiar `"description": "Tu descripción"`

- [ ] `01-Frontend/index.html`
  - [ ] Cambiar `<title>Tu Título</title>`

- [ ] `01-Frontend/.env.example` → copiar a `.env`
  - [ ] Cambiar `VITE_APP_NAME=project-contability`
  - [ ] Cambiar `VITE_APP_TITLE="Tu Título"`
  - [ ] Configurar `VITE_API_BASE_URL`

---

#### Backend (15 min)

- [ ] Renombrar archivo `.csproj`
  - [ ] `saas-template.server.csproj` → `project-contability.Server.csproj`

- [ ] Editar `.csproj`
  - [ ] `<RootNamespace>ProjectContability.Server</RootNamespace>`
  - [ ] `<AssemblyName>ProjectContability.Server</AssemblyName>`

- [ ] Buscar y reemplazar en TODOS los `.cs`:
  - [ ] Buscar: `SaaSTemplate.Server`
  - [ ] Reemplazar: `ProjectContability.Server`

- [ ] `02-Backend/appsettings.json`
  - [ ] `"ApplicationName": "Tu Título"`
  - [ ] `"ConnectionStrings"` → cambiar nombre de DB
  - [ ] `"Jwt.Issuer": "project-contability-api"`
  - [ ] `"Jwt.Audience": "project-contability-client"`

- [ ] `02-Backend/appsettings.Development.json`
  - [ ] Cambiar `ConnectionStrings`

---

#### Database (10 min)

- [ ] Crear base de datos con tu nombre
- [ ] Ejecutar scripts en orden:
  - [ ] `01-Schema/`
  - [ ] `02-Tables/`
  - [ ] `03-StoredProcedures/`
  - [ ] `99-SeedData/`

---

### 3️⃣ Limpieza de Ejemplos (Opcional - 10 min)

#### Frontend
- [ ] Eliminar `src/features/user/`
- [ ] Eliminar `src/features/charge/`
- [ ] Eliminar `src/features/beneficiarie/`
- [ ] Eliminar `src/features/form/`
- [ ] Limpiar `src/navigation/config/navigationConfig.ts`

#### Backend
- [ ] Eliminar controladores de ejemplo
- [ ] Eliminar DAOs de ejemplo

---

### 4️⃣ Instalación y Verificación (5 min)

#### Frontend
```bash
cd 01-Frontend
pnpm install
pnpm dev
```
- [ ] Abrir http://localhost:5173
- [ ] Verificar que carga sin errores

#### Backend
```bash
cd 02-Backend
dotnet restore
dotnet run
```
- [ ] Verificar que inicia sin errores
- [ ] Verificar conexión a DB

---

### 5️⃣ Configuración de Auth (2 min)

- [ ] Decidir si usar autenticación:
  - [ ] `AUTH_ENABLED = true` → Con login (producción)
  - [ ] `AUTH_ENABLED = false` → Sin login (prototipos)

**Archivo:** `01-Frontend/src/config/app.config.ts`

---

### 6️⃣ Git (5 min)

```bash
git init
git add .
git commit -m "Initial commit - [Tu Proyecto]"
git remote add origin [tu-repo-url]
git push -u origin master
```

---

## 📚 Documentación

- [ ] Leer `PROJECT_TEMPLATE_GUIDE.md` (completo)
- [ ] Leer `AUTH_BYPASS_README.md` (si usas bypass)
- [ ] Actualizar `README.md` con info de tu proyecto

---

## 🎨 Personalización

### Configuraciones Importantes

#### `01-Frontend/src/config/app.config.ts`
```typescript
export const AUTH_ENABLED = true;  // ← Cambiar según necesites

export const SIDEBAR_CONFIG = {
  defaultCollapsed: false,  // ← Sidebar colapsado por defecto
  expandedWidth: 280,
  collapsedWidth: 64
};

export const BREADCRUMB_CONFIG = {
  enabled: true,  // ← Mostrar breadcrumbs
  showIcons: false,
  separator: '>'
};
```

---

## 🔥 Crear Tu Primera Feature

### Ejemplo: Feature de "Cuentas"

```bash
# Estructura
01-Frontend/src/features/accounts/
├── components/
│   ├── AccountTable.tsx
│   └── AccountForm.tsx
├── hooks/
│   └── useAccountData.ts
├── pages/
│   ├── AccountsPage.tsx
│   ├── AccountCreatePage.tsx
│   └── AccountEditPage.tsx
├── services/
│   └── accountService.ts
└── types/
    └── account.types.ts
```

### Pasos:
1. [ ] Crear estructura de carpetas
2. [ ] Crear servicio (`accountService.ts`)
3. [ ] Crear tipos (`account.types.ts`)
4. [ ] Crear páginas
5. [ ] Registrar rutas en `navigationConfig.ts`
6. [ ] Crear tabla en DB
7. [ ] Crear SP en DB
8. [ ] Crear controlador en backend
9. [ ] Crear DAO en backend

---

## 🆘 Problemas Comunes

### Frontend no compila
```bash
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Backend no compila
```bash
dotnet clean
dotnet restore
dotnet build
```

### No conecta a DB
- [ ] Verificar `appsettings.json` → `ConnectionStrings`
- [ ] Verificar que SQL Server está corriendo
- [ ] Verificar que la DB existe
- [ ] Verificar credenciales

---

## ✅ Verificación Final

- [ ] Frontend carga en http://localhost:5173
- [ ] Backend responde en http://localhost:5000
- [ ] Puedes hacer login (si `AUTH_ENABLED = true`)
- [ ] O puedes acceder directo (si `AUTH_ENABLED = false`)
- [ ] Sidebar muestra menús
- [ ] Breadcrumbs funcionan
- [ ] No hay errores en consola

---

## 🎉 ¡Listo!

Tu proyecto está configurado y listo para desarrollo.

**Próximos pasos:**
1. Crear tus features
2. Personalizar UI según necesidades
3. Implementar lógica de negocio
4. ¡Desarrollar! 🚀

---

## 📞 Referencias Rápidas

- **Guía Completa:** `PROJECT_TEMPLATE_GUIDE.md`
- **Auth Bypass:** `AUTH_BYPASS_README.md`
- **Configuración:** `01-Frontend/src/config/app.config.ts`
- **Rutas:** `01-Frontend/src/navigation/config/navigationConfig.ts`

---

**Tiempo estimado total:** 30-60 minutos (dependiendo si usas script o manual)
