# 🚀 Guía de Plantilla de Proyecto - Enterprise Template

Esta guía explica cómo usar esta plantilla para crear nuevos proyectos empresariales.

---

## 📋 Tabla de Contenidos

- [Estructura General](#estructura-general)
- [Qué Copiar](#qué-copiar)
- [Cambios de Nombre del Proyecto](#cambios-de-nombre-del-proyecto)
- [Configuración Inicial](#configuración-inicial)
- [Limpieza de Ejemplos](#limpieza-de-ejemplos)
- [Checklist de Inicio](#checklist-de-inicio)

---

## 🏗️ Estructura General

```
📁 saas-template/                          ← Nombre del proyecto (cambiar)
├── 📁 01-Frontend/                   ← Aplicación React + TypeScript
├── 📁 02-Backend/                    ← API ASP.NET Core
├── 📁 03-Database/                   ← Scripts SQL Server
├── 📄 .gitignore                     ← Configuración Git
├── 📄 README.md                      ← Documentación principal
└── 📄 PROJECT_TEMPLATE_GUIDE.md      ← Esta guía
```

---

## 📦 Qué Copiar

### ✅ **COPIAR SIEMPRE (Estructura Base)**

#### **Frontend (01-Frontend/)**

```
01-Frontend/
├── public/                           ✅ Copiar todo
├── src/
│   ├── auth/                         ✅ Sistema de autenticación completo
│   │   ├── components/
│   │   ├── controllers/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── config/                       ✅ Configuraciones centralizadas
│   │   └── app.config.ts             ← AUTH_ENABLED y más
│   │
│   ├── layout/                       ✅ Layout principal (Sidebar, Header)
│   │   ├── AppContent.tsx
│   │   ├── AppHeader.tsx
│   │   ├── AppProviders.tsx
│   │   └── index.tsx
│   │
│   ├── navigation/                   ✅ Sistema de navegación dinámico
│   │   ├── components/
│   │   ├── config/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── shared/                       ✅ Componentes y utilidades compartidas
│   │   ├── components/
│   │   │   ├── data-display/        (Tables, Cards, etc.)
│   │   │   ├── forms/               (Inputs, Selects, etc.)
│   │   │   ├── loading/             (Skeletons, Spinners)
│   │   │   ├── overlays/            (Modals, Dialogs)
│   │   │   ├── ui/                  (shadcn/ui components)
│   │   │   └── utilities/           (Settings, Controls)
│   │   ├── hooks/                   (useCrudActions, etc.)
│   │   ├── managers/                (ErrorManager, Logger)
│   │   ├── providers/               (Theme, Language, etc.)
│   │   ├── services/                (BaseService, apiClient)
│   │   ├── types/                   (Tipos compartidos)
│   │   └── utils/                   (Helpers, validators)
│   │
│   ├── App.tsx                       ✅ Componente principal
│   ├── main.tsx                      ✅ Entry point
│   ├── index.css                     ✅ Estilos globales
│   └── vite-env.d.ts                 ✅ Tipos de Vite
│
├── .env.example                      ✅ Variables de entorno
├── .eslintrc.cjs                     ✅ Configuración ESLint
├── .prettierrc                       ✅ Configuración Prettier
├── components.json                   ✅ Configuración shadcn/ui
├── index.html                        ✅ HTML principal
├── package.json                      ⚠️ Cambiar nombre del proyecto
├── postcss.config.js                 ✅ Configuración PostCSS
├── tailwind.config.js                ✅ Configuración Tailwind
├── tsconfig.json                     ✅ Configuración TypeScript
├── tsconfig.app.json                 ✅ Configuración TypeScript (app)
├── tsconfig.node.json                ✅ Configuración TypeScript (node)
└── vite.config.ts                    ✅ Configuración Vite
```

#### **Backend (02-Backend/)**

```
02-Backend/
├── Config/                           ✅ Configuraciones
│   └── AppSettings.cs
├── Controllers/                      ✅ Controladores base
│   └── AuthController.cs             (Ejemplo de autenticación)
├── DataAccessObject/                 ✅ Patrón DAO
│   └── AuthDAO.cs                    (Ejemplo)
├── Extensions/                       ✅ Extension methods
│   ├── ServiceCollectionExtensions.cs
│   └── StringExtensions.cs
├── Middleware/                       ✅ Middlewares personalizados
│   ├── ErrorHandlingMiddleware.cs
│   └── JwtMiddleware.cs
├── Models/                           ✅ Modelos base
│   ├── ApiResponse.cs
│   ├── LoginRequest.cs
│   └── User.cs
├── Program.cs                        ⚠️ Cambiar namespace
├── appsettings.json                  ⚠️ Configurar conexión DB
├── appsettings.Development.json      ⚠️ Configurar conexión DB
└── [ProjectName].csproj              ⚠️ Renombrar archivo
```

#### **Database (03-Database/)**

```
03-Database/
├── 01-Schema/                        ✅ Esquemas de base de datos
│   └── 01-CreateSchema.sql
├── 02-Tables/                        ✅ Tablas base
│   ├── TM_USUARIO.sql                (Ejemplo)
│   └── TM_MENU.sql                   (Ejemplo)
├── 03-StoredProcedures/              ✅ SPs base
│   ├── SP_LOGIN.sql                  (Ejemplo)
│   └── SP_OBTENER_MENUS.sql          (Ejemplo)
├── 04-Functions/                     ✅ Funciones (si aplica)
├── 05-Views/                         ✅ Vistas (si aplica)
└── 99-SeedData/                      ✅ Datos iniciales
    └── 01-InsertInitialData.sql
```

---

### ❌ **NO COPIAR (Ejemplos de Referencia)**

```
01-Frontend/src/features/
├── user/                             ❌ Ejemplo - crear tus propias features
├── charge/                           ❌ Ejemplo
├── beneficiarie/                     ❌ Ejemplo
├── form/                             ❌ Ejemplo
└── index/                            ⚠️ Puedes mantener como dashboard base
```

---

## 🔄 Cambios de Nombre del Proyecto

### **Nombre Actual:** `saas-template`
### **Nuevo Nombre:** `project-contability` (ejemplo)

---

### **1️⃣ Frontend**

#### **A. package.json**

```json
{
  "name": "project-contability.client",  // ← Cambiar aquí (MANTENER .client)
  "version": "0.0.0",
  "description": "Sistema de Contabilidad", // ← Cambiar descripción
  // ...
}
```

**📍 Ubicación:** `01-Frontend/package.json`

**⚠️ IMPORTANTE:** El sufijo `.client` es **NECESARIO**:
- ✅ Identifica el paquete como frontend
- ✅ Evita conflictos con el backend
- ✅ Facilita el manejo en monorepos
- ✅ Convención estándar en npm

---

#### **B. index.html**

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sistema de Contabilidad</title> <!-- ← Cambiar aquí -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**📍 Ubicación:** `01-Frontend/index.html`

---

#### **C. Variables de Entorno (.env)**

```env
# Nombre del proyecto
VITE_APP_NAME=project-contability           # ← Cambiar aquí
VITE_APP_TITLE="Sistema de Contabilidad"    # ← Cambiar aquí

# API Base URL
VITE_API_BASE_URL=http://localhost:5000

# Otras configuraciones...
```

**📍 Ubicación:** `01-Frontend/.env` (crear desde `.env.example`)

---

#### **D. Configuración de la App**

```typescript
// src/config/app.config.ts

/**
 * Configuración global de la aplicación
 * Proyecto: Sistema de Contabilidad  // ← Cambiar aquí
 */

// ... resto del archivo
```

**📍 Ubicación:** `01-Frontend/src/config/app.config.ts`

---

### **2️⃣ Backend**

#### **A. Archivo del Proyecto (.csproj)**

**Renombrar archivo:**
```
saas-template.server.csproj  →  project-contability.Server.csproj
```

**Contenido del archivo:**
```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <RootNamespace>ProjectContability.Server</RootNamespace>  <!-- ← Cambiar aquí (MANTENER .Server) -->
    <AssemblyName>ProjectContability.Server</AssemblyName>    <!-- ← Cambiar aquí (MANTENER .Server) -->
    <!-- ... -->
  </PropertyGroup>
  <!-- ... -->
</Project>
```

**📍 Ubicación:** `02-Backend/[ProjectName].csproj`

---

#### **B. Program.cs**

```csharp
// Program.cs

namespace ProjectContability.Server  // ← Cambiar namespace
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            
            // Configuración...
            
            var app = builder.Build();
            
            // Middleware...
            
            app.Run();
        }
    }
}
```

**📍 Ubicación:** `02-Backend/Program.cs`

---

#### **C. Todos los archivos .cs**

**Cambiar namespace en TODOS los archivos:**

```csharp
// Antes:
namespace SaaSTemplate.Server.Controllers
namespace SaaSTemplate.Server.Models
namespace SaaSTemplate.Server.Services

// Después:
namespace ProjectContability.Server.Controllers
namespace ProjectContability.Server.Models
namespace ProjectContability.Server.Services
```

**💡 Tip:** Usa "Find and Replace" en tu IDE:
- Buscar: `SaaSTemplate.Server`
- Reemplazar: `ProjectContability.Server`

---

#### **D. appsettings.json**

```json
{
  "AppSettings": {
    "ApplicationName": "Sistema de Contabilidad",  // ← Cambiar aquí
    "Version": "1.0.0",
    "Environment": "Development"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DB_CONTABILIDAD;..."  // ← Cambiar DB
  },
  "Jwt": {
    "Issuer": "project-contability-api",  // ← Cambiar aquí
    "Audience": "project-contability-client",  // ← Cambiar aquí
    // ...
  }
}
```

**📍 Ubicación:** `02-Backend/appsettings.json`

---

### **3️⃣ Database**

#### **A. Nombre de la Base de Datos**

```sql
-- 01-CreateDatabase.sql

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'DB_CONTABILIDAD')  -- ← Cambiar aquí
BEGIN
    CREATE DATABASE DB_CONTABILIDAD;  -- ← Cambiar aquí
END
GO

USE DB_CONTABILIDAD;  -- ← Cambiar aquí
GO
```

**📍 Ubicación:** `03-Database/00-CreateDatabase.sql` (crear este archivo)

---

#### **B. Prefijos de Tablas**

**Convención de nombres:**
```sql
-- Sistema de Contabilidad
TM_CUENTA          -- Tabla Maestra de Cuentas
TM_ASIENTO         -- Tabla Maestra de Asientos
TD_ASIENTO_DETALLE -- Tabla Detalle de Asientos
TT_CUENTA          -- Table Type de Cuentas
```

**Prefijos recomendados:**
- `TM_` = Tabla Maestra
- `TD_` = Tabla Detalle
- `TT_` = Table Type
- `SP_` = Stored Procedure
- `FN_` = Function
- `VW_` = View

---

### **4️⃣ Carpeta Raíz**

#### **A. Renombrar Carpeta Principal**

```
saas-template/  →  project-contability/
```

---

#### **B. README.md**

```markdown
# 💼 Sistema de Contabilidad

Sistema empresarial de contabilidad desarrollado con React + ASP.NET Core + SQL Server.

## 📋 Descripción

[Descripción de tu proyecto]

## 🚀 Tecnologías

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS
- **Backend:** ASP.NET Core 8.0
- **Database:** SQL Server

## 🏗️ Estructura del Proyecto

...
```

**📍 Ubicación:** `README.md`

---

## ⚙️ Configuración Inicial

### **1. Frontend**

```bash
cd 01-Frontend

# Instalar dependencias
pnpm install

# Crear archivo .env desde .env.example
cp .env.example .env

# Editar .env con tus configuraciones
# VITE_APP_NAME=project-contability
# VITE_API_BASE_URL=http://localhost:5000

# Ejecutar en desarrollo
pnpm dev
```

---

### **2. Backend**

```bash
cd 02-Backend

# Restaurar paquetes NuGet
dotnet restore

# Configurar appsettings.json
# - Cambiar ConnectionStrings
# - Cambiar JWT settings
# - Cambiar ApplicationName

# Ejecutar en desarrollo
dotnet run
```

---

### **3. Database**

```sql
-- 1. Crear base de datos
USE master;
GO
CREATE DATABASE DB_CONTABILIDAD;
GO

-- 2. Ejecutar scripts en orden
USE DB_CONTABILIDAD;
GO

-- Ejecutar en orden:
-- 01-Schema/
-- 02-Tables/
-- 03-StoredProcedures/
-- 04-Functions/
-- 05-Views/
-- 99-SeedData/
```

---

## 🧹 Limpieza de Ejemplos

### **Eliminar Features de Ejemplo**

```bash
# Frontend
rm -rf 01-Frontend/src/features/user
rm -rf 01-Frontend/src/features/charge
rm -rf 01-Frontend/src/features/beneficiarie
rm -rf 01-Frontend/src/features/form

# Mantener solo:
# - 01-Frontend/src/features/index (dashboard base)
```

---

### **Limpiar Rutas de Ejemplo**

```typescript
// src/navigation/config/navigationConfig.ts

export const navigationConfig = {
  // Rutas de usuario (dinámicas desde DB)
  userRoutes: {},  // ← Limpiar ejemplos

  // Rutas standalone (no en menús)
  standaloneRoutes: {},  // ← Limpiar ejemplos

  // Rutas de features secundarias
  featureRoutes: {},  // ← Limpiar ejemplos

  // Rutas de ejemplo (mantener para referencia o eliminar)
  exampleRoutes: {}  // ← Eliminar si no necesitas
};
```

---

### **Limpiar Backend**

```bash
# Eliminar controladores de ejemplo
rm 02-Backend/Controllers/UserController.cs
rm 02-Backend/Controllers/ChargeController.cs

# Eliminar DAOs de ejemplo
rm 02-Backend/DataAccessObject/UserDAO.cs
rm 02-Backend/DataAccessObject/ChargeDAO.cs

# Mantener solo:
# - AuthController.cs
# - AuthDAO.cs
```

---

### **Limpiar Database**

```bash
# Eliminar tablas de ejemplo
rm 03-Database/02-Tables/TM_USUARIO.sql
rm 03-Database/02-Tables/TM_CARGO.sql

# Eliminar SPs de ejemplo
rm 03-Database/03-StoredProcedures/SP_OBTENER_USUARIOS.sql

# Mantener solo:
# - Tablas de autenticación (TM_USUARIO, TM_MENU, etc.)
# - SPs de autenticación (SP_LOGIN, SP_OBTENER_MENUS, etc.)
```

---

## ✅ Checklist de Inicio

### **📋 Antes de Empezar**

- [ ] Copiar toda la estructura de carpetas
- [ ] Renombrar carpeta principal (`saas-template` → `project-contability`)
- [ ] Leer esta guía completa

---

### **📋 Frontend**

- [ ] Cambiar `package.json` → `name` y `description`
- [ ] Cambiar `index.html` → `<title>`
- [ ] Crear `.env` desde `.env.example`
- [ ] Configurar `VITE_APP_NAME` y `VITE_API_BASE_URL`
- [ ] Actualizar `src/config/app.config.ts`
- [ ] Eliminar features de ejemplo
- [ ] Limpiar `navigationConfig.ts`
- [ ] Ejecutar `pnpm install`
- [ ] Ejecutar `pnpm dev` y verificar

---

### **📋 Backend**

- [ ] Renombrar archivo `.csproj`
- [ ] Cambiar `RootNamespace` y `AssemblyName` en `.csproj`
- [ ] Cambiar namespace en `Program.cs`
- [ ] Buscar y reemplazar `SaaSTemplate.Server` → `ProjectContability.Server`
- [ ] Configurar `appsettings.json`:
  - [ ] `ApplicationName`
  - [ ] `ConnectionStrings`
  - [ ] `Jwt.Issuer` y `Jwt.Audience`
- [ ] Eliminar controladores de ejemplo
- [ ] Eliminar DAOs de ejemplo
- [ ] Ejecutar `dotnet restore`
- [ ] Ejecutar `dotnet run` y verificar

---

### **📋 Database**

- [ ] Crear base de datos con nuevo nombre
- [ ] Actualizar prefijos de tablas si es necesario
- [ ] Ejecutar scripts en orden:
  - [ ] 01-Schema
  - [ ] 02-Tables
  - [ ] 03-StoredProcedures
  - [ ] 04-Functions
  - [ ] 05-Views
  - [ ] 99-SeedData
- [ ] Verificar conexión desde backend

---

### **📋 General**

- [ ] Actualizar `README.md` con información del proyecto
- [ ] Configurar `.gitignore` si es necesario
- [ ] Inicializar repositorio Git
- [ ] Hacer commit inicial
- [ ] Crear repositorio remoto (GitHub, GitLab, etc.)
- [ ] Push inicial

---

## 🎯 Ejemplo Completo: Sistema de Contabilidad

### **Cambios de Nombre**

| Ubicación | Antes | Después |
|-----------|-------|---------|
| Carpeta raíz | `saas-template` | `project-contability` |
| Frontend package.json | `saas-template.client` | `project-contability.client` |
| Backend .csproj | `saas-template.server.csproj` | `project-contability.Server.csproj` |
| Backend namespace | `SaaSTemplate.Server` | `ProjectContability.Server` |
| Database | `DB_SAAS_TEMPLATE` | `DB_CONTABILIDAD` |
| JWT Issuer | `saas-template-api` | `project-contability-api` |

---

### **Estructura de Features**

```
01-Frontend/src/features/
├── index/                    ← Dashboard (mantener)
├── accounts/                 ← Nueva feature: Cuentas
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   └── types/
├── entries/                  ← Nueva feature: Asientos
│   └── ...
└── reports/                  ← Nueva feature: Reportes
    └── ...
```

---

### **Tablas de Database**

```sql
-- Contabilidad
TM_CUENTA              -- Plan de cuentas
TM_ASIENTO             -- Asientos contables
TD_ASIENTO_DETALLE     -- Detalle de asientos
TM_PERIODO             -- Períodos contables
TM_TIPO_DOCUMENTO      -- Tipos de documentos

-- Autenticación (mantener)
TM_USUARIO             -- Usuarios del sistema
TM_MENU                -- Menús dinámicos
TM_PERMISO             -- Permisos
```

---

## 📚 Recursos Adicionales

### **Documentación Interna**

- `AUTH_BYPASS_README.md` - Sistema de bypass de autenticación
- `PROJECT_TEMPLATE_GUIDE.md` - Esta guía
- `README.md` - Documentación principal

### **Configuraciones Importantes**

- `01-Frontend/src/config/app.config.ts` - Configuración centralizada
- `02-Backend/appsettings.json` - Configuración del backend
- `01-Frontend/.env` - Variables de entorno

### **Patrones y Estándares**

- **Frontend:** Ver `MEMORY[structure.md]` y `MEMORY[tech.md]`
- **Backend:** Patrón Controller-DAO-Model
- **Database:** Convenciones de nombres SQL Server

---

## 🆘 Troubleshooting

### **Problema: Errores de compilación en Frontend**

```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

---

### **Problema: Errores de namespace en Backend**

```bash
# Buscar y reemplazar en todos los archivos .cs
# Buscar: SaaSTemplate.Server
# Reemplazar: [TuProyecto].Server
```

---

### **Problema: No conecta a la base de datos**

```json
// Verificar appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DB_TU_PROYECTO;User Id=sa;Password=tu_password;TrustServerCertificate=True;"
  }
}
```

---

## 🎉 ¡Listo para Empezar!

Ahora tienes una plantilla profesional lista para crear cualquier proyecto empresarial.

**Próximos pasos:**
1. Seguir el checklist
2. Crear tus propias features
3. Personalizar según necesidades del proyecto
4. ¡Desarrollar! 🚀

---

## 📞 Soporte

Para dudas o problemas:
1. Revisar esta guía
2. Consultar documentación interna
3. Revisar código de ejemplo en features

---

**Versión:** 1.0.0  
**Última actualización:** Noviembre 2025
**Plantilla:** Enterprise Template
