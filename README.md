# Enterprise SaaS Template

Full-stack application template for rapid development of enterprise SaaS applications using React, ASP.NET Core, and SQL Server.

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-CC2927?logo=microsoft-sql-server)](https://www.microsoft.com/sql-server)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Stack Tecnológico](#-stack-tecnológico)
- [Inicio Rápido](#-inicio-rápido)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Documentación](#-documentación)
- [Guías de Desarrollo](#-guías-de-desarrollo)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## Características

### Sistema CRUD Unificado
- Hooks reutilizables con TanStack Query para operaciones CRUD
- Paginación del servidor con búsqueda y filtros
- Optimistic updates para mejor UX
- Soporte para formularios multi-paso
- Manejo de IDs compuestos

### Autenticación y Autorización
- JWT authentication con BCrypt
- Role-based access control
- Permisos por menú desde base de datos
- Session validation
- Bypass configurable para desarrollo (AUTH_ENABLED flag)

### Gestión de Estado
- TanStack Query v5 para server state
- Zustand v5 para UI state
- React Hook Form v7 + Zod v3 para validación
- Error handling centralizado

### Interfaz de Usuario
- Radix UI components con Tailwind CSS v4
- Tema claro/oscuro con next-themes
- Responsive design
- Internacionalización con i18next
- Framer Motion para animaciones

### Gestión de Archivos
- Upload con progress tracking
- Download con streaming
- Validación de tipos MIME
- Almacenamiento en servidor

### Navegación
- Menús dinámicos desde base de datos
- Breadcrumbs automáticos
- Lazy loading de rutas
- Encriptación de parámetros URL

---

## 🏗️ Arquitectura

```
┌───────────────────────────────────────────────────┐
│                      FRONTEND (React)             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │  Features  │  │   Shared   │  │  Layouts   │   │
│  │  (CRUD)    │  │ Components │  │ Navigation │   │
│  └────────────┘  └────────────┘  └────────────┘   │
│         │              │                │         │
│         └──────────────┴────────────────┘         │
│                        │                          │
│                   React Query                     │
│                   Zustand Store                   │
└─────────────────────────┬─────────────────────────┘
                          │ HTTP/REST
                          │ JWT Auth
┌─────────────────────────▼─────────────────────────┐
│                   BACKEND (ASP.NET Core)          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │Controllers │  │    DAOs    │  │   Models   │   │
│  │  (API)     │  │ (Business) │  │   (DTOs)   │   │
│  └────────────┘  └────────────┘  └────────────┘   │
│         │              │                │         │
│         └──────────────┴────────────────┘         │
│                        │                          │
│                  Helper Library                   │
└─────────────────────────┬─────────────────────────┘
                          │ ADO.NET/Dapper
                          │ Stored Procedures
┌─────────────────────────▼─────────────────────────┐
│                   DATABASE (SQL Server)           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │   Tables   │  │    SPs     │  │   Views    │   │
│  │  (Master)  │  │ (Business) │  │ (Reports)  │   │
│  └────────────┘  └────────────┘  └────────────┘   │
└───────────────────────────────────────────────────┘
```

### **Principios de Diseño**

- **Feature-based organization**: Módulos independientes por funcionalidad
- **Separation of concerns**: Capas bien definidas (UI, Business, Data)
- **DRY (Don't Repeat Yourself)**: Componentes y hooks reutilizables
- **SOLID principles**: Código mantenible y escalable
- **Convention over configuration**: Defaults inteligentes

---

## 🛠️ Stack Tecnológico

### **Frontend** (`01-Frontend/`)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 19.2 | UI Framework |
| TypeScript | 5.9 | Type Safety |
| Vite | 6.3 | Build Tool |
| React Router | 7.9 | Routing |
| TanStack Query | 5.90 | Server State |
| Zustand | 5.0 | UI State |
| React Hook Form | 7.63 | Forms |
| Zod | 3.25 | Validation |
| Tailwind CSS | 4.1 | Styling |
| Radix UI | Latest | Components |
| i18next | 25.5 | i18n |
| Axios | 1.12 | HTTP Client |
| Framer Motion | 11.18 | Animations |

### **Backend** (`02-Backend/`)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| .NET | 8.0 | Framework |
| ASP.NET Core | 8.0 | Web API |
| C# | 12.0 | Language |
| Microsoft.Data.SqlClient | 6.0 | Database Access |
| JWT Bearer | 8.0 | Authentication |
| BCrypt.Net-Next | 4.0 | Password Hashing |
| Newtonsoft.Json | 13.0 | JSON Serialization |

### **Database** (`04-Database/`)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| SQL Server | 2022 | RDBMS |
| T-SQL | - | Stored Procedures |

### **Development Tools**

| Tecnología | Propósito |
|------------|-----------|
| pnpm | Package Manager |
| ESLint | Code Linting |
| Vitest | Unit Testing |

---

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 20+
- pnpm 9+
- .NET 8.0 SDK
- SQL Server 2022 o compatible

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/saas-template.git
cd saas-template
```

### 2. Configurar Base de Datos

```sql
-- Crear base de datos en SQL Server
CREATE DATABASE SaasTemplateDB;
GO

-- Ejecutar scripts en orden:
-- 1. 04-Database/Tables/TABLES_EN.sql
-- 2. 04-Database/StoredProcedures/*.sql
-- 3. 04-Database/TableTypes/*.sql
```

### 3. Configurar Backend

```bash
cd 02-Backend

# Copiar archivo de configuración
cp appsettings.example.json appsettings.Development.json

# Editar appsettings.Development.json con tu connection string
# "DefaultConnection": "Server=localhost;Database=SaasTemplateDB;..."

# Restaurar dependencias
dotnet restore

# Ejecutar
dotnet run
```

Backend: `https://localhost:7001`

### 4. Configurar Frontend

```bash
cd 01-Frontend

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env con la URL del backend
# VITE_API_BASE_URL=https://localhost:7001

# Ejecutar en desarrollo
pnpm dev
```

Frontend: `http://localhost:5173`

---

## 📁 Estructura del Proyecto

```
saas-template/
├── 01-Frontend/                    # React application
│   ├── src/
│   │   ├── auth/                  # Authentication system
│   │   ├── features/              # Feature modules
│   │   │   ├── dashboard/        # Dashboard
│   │   │   ├── user/             # User management
│   │   │   ├── role/             # Role management
│   │   │   ├── form/             # Dynamic forms
│   │   │   ├── fileStorage/      # File management
│   │   │   ├── position/         # Position catalog
│   │   │   ├── repository/       # Repository catalog
│   │   │   └── identity-document/ # ID document catalog
│   │   ├── shared/               # Shared code
│   │   │   ├── components/       # Reusable UI components
│   │   │   ├── hooks/            # Custom hooks
│   │   │   ├── services/         # API services
│   │   │   └── utils/            # Utilities
│   │   ├── layout/               # App layouts
│   │   ├── navigation/           # Navigation system
│   │   └── config/               # App configuration
│   └── package.json
│
├── 02-Backend/                     # ASP.NET Core API
│   ├── Controllers/               # API Controllers
│   ├── DataAccessObject/          # Data access layer
│   ├── Models/                    # DTOs and models
│   ├── Middleware/                # Custom middleware
│   └── saas-template.server.csproj
│
├── 03-Helper/                      # Shared utilities library
│   ├── Core/                      # Core types
│   ├── Database/                  # Database helpers
│   ├── Helpers/                   # Common helpers
│   └── Helper.csproj
│
├── 04-Database/                    # SQL Server scripts
│   ├── Tables/                    # Table definitions
│   ├── StoredProcedures/          # Stored procedures
│   ├── TableTypes/                # User-defined table types
│   └── Templates/                 # SP templates
│
├── 05-Planner/                     # Project planning
│   └── ESTANDAR-PLANNER.md
│
├── PROJECT_TEMPLATE_GUIDE.md       # Template usage guide
├── QUICK_START_CHECKLIST.md        # Quick start checklist
├── PROJECT_NAME_LOCATIONS.md       # Naming reference
└── saas-template.sln               # Visual Studio solution
```

---

## 📚 Documentación

### **🎯 Usar como Plantilla (NUEVO)**

¿Quieres crear un nuevo proyecto usando esta plantilla?

1. **[📖 PROJECT_TEMPLATE_GUIDE.md](PROJECT_TEMPLATE_GUIDE.md)** - Guía completa paso a paso
2. **[✅ QUICK_START_CHECKLIST.md](QUICK_START_CHECKLIST.md)** - Checklist rápido
3. **[📍 PROJECT_NAME_LOCATIONS.md](PROJECT_NAME_LOCATIONS.md)** - Dónde cambiar nombres
4. **[🤖 rename-project.ps1](rename-project.ps1)** - Script automático de renombrado

```powershell
# Uso rápido del script
.\rename-project.ps1 -NewProjectName "project-contability" -NewProjectTitle "Sistema de Contabilidad"
```

### **🔓 Sistema de Bypass de Autenticación**

- **[AUTH_BYPASS_README.md](01-Frontend/AUTH_BYPASS_README.md)** - Cómo habilitar/deshabilitar auth

```typescript
// Cambiar en: src/config/app.config.ts
export const AUTH_ENABLED = false;  // ← true para producción, false para prototipos
```

### **Documentación Principal**

- [Frontend README](01-Frontend/README.md) - Guía completa del frontend
- [Backend README](02-Backend/README.md) - Guía completa del backend

---

## Configuración

### Variables de Entorno

Frontend (`.env`):
```env
VITE_API_BASE_URL=https://localhost:7001
VITE_APP_NAME=SaaS Template
```

Backend (`appsettings.Development.json`):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=SaasTemplateDB;..."
  },
  "Jwt": {
    "SecretKey": "your-secret-key-here",
    "Issuer": "saas-template-api",
    "Audience": "saas-template-client"
  }
}
```

### Build

Frontend:
```bash
pnpm build
```

Backend:
```bash
dotnet publish -c Release
```

---

## Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## Autor

Enzo Gago Aguirre - [GitHub](https://github.com/Enzo008)
