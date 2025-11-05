# 🚀 Enterprise Application Template

**Plantilla empresarial full-stack reutilizable** para desarrollo rápido de aplicaciones web con React, ASP.NET Core y SQL Server.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org/)
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

## ✨ Características

### 🎯 **Sistema CRUD Unificado**
- Factory pattern para crear hooks CRUD reutilizables
- Soporte para operaciones simples y multi-paso
- Optimistic updates con React Query
- Paginación del servidor integrada
- Manejo de IDs simples y compuestos

### 🔐 **Autenticación y Autorización**
- JWT con access/refresh tokens
- Role-based access control (RBAC)
- Permisos granulares por menú
- Encriptación de contraseñas con BCrypt
- Session management
- **🔓 Bypass de autenticación** para prototipos (configurable con un flag)

### 📊 **Gestión de Datos**
- React Query para server state
- Zustand para UI state
- Caché inteligente con presets configurables
- Validación con Zod y React Hook Form
- Manejo centralizado de errores

### 🎨 **UI/UX Moderna**
- Componentes Radix UI + Tailwind CSS
- Tema claro/oscuro
- Responsive design
- Internacionalización (i18n)
- Skeleton loaders y estados de carga

### 📁 **Gestión de Archivos**
- Upload con progress tracking
- Download con streaming
- Validación de tipos MIME
- Límites configurables de tamaño
- Almacenamiento organizado

### 🌐 **Navegación Dinámica**
- Menús generados desde el servidor
- Breadcrumbs automáticos
- Lazy loading de rutas
- Encriptación de parámetros URL
- Navegación segura

### 🔧 **Developer Experience**
- Hot Module Replacement (HMR)
- TypeScript strict mode
- ESLint + Prettier
- Logging estructurado
- Error boundaries

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Features  │  │   Shared   │  │  Layouts   │            │
│  │  (CRUD)    │  │ Components │  │ Navigation │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│         │              │                │                    │
│         └──────────────┴────────────────┘                    │
│                        │                                     │
│                   React Query                                │
│                   Zustand Store                              │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/REST
                          │ JWT Auth
┌─────────────────────────▼───────────────────────────────────┐
│                   BACKEND (ASP.NET Core)                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │Controllers │  │    DAOs    │  │   Models   │            │
│  │  (API)     │  │ (Business) │  │   (DTOs)   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│         │              │                │                    │
│         └──────────────┴────────────────┘                    │
│                        │                                     │
│                  Helper Library                            │
└─────────────────────────┬───────────────────────────────────┘
                          │ ADO.NET/Dapper
                          │ Stored Procedures
┌─────────────────────────▼───────────────────────────────────┐
│                   DATABASE (SQL Server)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Tables   │  │    SPs     │  │   Views    │            │
│  │  (Master)  │  │ (Business) │  │ (Reports)  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
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
| React | 19.x | UI Framework |
| TypeScript | 5.6.x | Type Safety |
| Vite | 6.x | Build Tool |
| React Router | 7.x | Routing |
| TanStack Query | 5.x | Server State |
| Zustand | 5.x | UI State |
| React Hook Form | 7.x | Forms |
| Zod | 3.x | Validation |
| Tailwind CSS | 3.x | Styling |
| Radix UI | Latest | Components |
| i18next | 23.x | i18n |
| Axios | 1.x | HTTP Client |

### **Backend** (`02-Backend/`)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| .NET | 8.0 | Framework |
| ASP.NET Core | 8.0 | Web API |
| C# | 12.0 | Language |
| Dapper | 2.x | Micro-ORM |
| JWT | Latest | Authentication |
| BCrypt.Net | Latest | Password Hashing |
| Helper Library | Custom | Utilities Library |

### **Database** (`03-Database/`)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| SQL Server | 2022 | RDBMS |
| T-SQL | Latest | Stored Procedures |

### **DevOps**

| Tecnología | Propósito |
|------------|-----------|
| Git | Version Control |
| npm/pnpm | Package Manager |
| NuGet | .NET Packages |
| ESLint | Linting |
| Prettier | Formatting |

---

## 🚀 Inicio Rápido

### **Prerequisitos**

- Node.js 20+ y npm/pnpm
- .NET 8.0 SDK
- SQL Server 2022 (o compatible)
- Git

### **1. Clonar el Repositorio**

```bash
git clone https://github.com/Enzo008/saas-template.git
cd saas-template
```

### **2. Configurar Base de Datos**

```sql
-- Ejecutar en SQL Server Management Studio
-- 1. Crear base de datos
CREATE DATABASE SaaSTemplateDB;

-- 2. Ejecutar scripts en orden
USE SaaSTemplateDB;
-- Ejecutar: 03-Database/Tables/TABLES_EN.sql
-- Ejecutar: 03-Database/StoredProcedures/*.sql
-- Ejecutar: 03-Database/Data/SEED_DATA.sql (opcional)
```

### **3. Configurar Backend**

```bash
cd 02-Backend

# Configurar connection string en appsettings.Development.json
# {
#   "ConnectionStrings": {
#     "DefaultConnection": "Server=localhost;Database=SaaSTemplateDB;..."
#   }
# }

# Restaurar dependencias
dotnet restore

# Compilar
dotnet build

# Ejecutar
dotnet run
```

Backend corriendo en: `https://localhost:7001`

### **4. Configurar Frontend**

```bash
cd 01-Frontend

# Instalar dependencias
npm install
# o
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con la URL del backend

# Ejecutar en desarrollo
npm run dev
# o
pnpm dev
```

Frontend corriendo en: `http://localhost:5173`

### **5. Login Inicial**

```
Usuario: admin
Contraseña: admin123
```

---

## 📁 Estructura del Proyecto

```
saas-template/
├── 01-Frontend/                 # Aplicación React
│   ├── src/
│   │   ├── features/           # Módulos por funcionalidad
│   │   │   ├── user/          # Ejemplo: Gestión de usuarios
│   │   │   ├── position/      # Ejemplo: Gestión de cargos
│   │   │   └── ...
│   │   ├── shared/            # Código compartido
│   │   │   ├── components/    # Componentes UI reutilizables
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── services/      # Servicios API
│   │   │   ├── utils/         # Utilidades
│   │   │   └── types/         # TypeScript types
│   │   ├── layouts/           # Layouts de la app
│   │   ├── navigation/        # Sistema de navegación
│   │   └── providers/         # Context providers
│   └── README.md              # Documentación frontend
│
├── 02-Backend/                 # API ASP.NET Core
│   ├── Controllers/           # API Controllers
│   ├── DataAccessObject/      # Capa de acceso a datos
│   │   ├── Abstraction/      # Interfaces
│   │   ├── Database/         # Implementaciones
│   │   └── Helper/           # Helpers
│   ├── Models/               # DTOs y modelos
│   ├── Middleware/           # Custom middleware
│   ├── Extensions/           # Extension methods
│   └── README.md             # Documentación backend
│
├── 03-Helper/                  # Librería de utilidades
│   ├── Types.cs              # Tipos comunes
│   ├── EmailService.cs       # Servicio de email
│   ├── FileStorageHelper.cs  # Gestión de archivos
│   └── ...
│
├── 04-Database/               # Scripts SQL Server
│   ├── Tables/               # Definición de tablas
│   ├── StoredProcedures/     # Stored procedures
│   ├── Views/                # Vistas
│   ├── Functions/            # Funciones
│   ├── Data/                 # Datos iniciales
│   └── Documentation/        # Documentación DB
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

## 🎓 Guías de Desarrollo

### **Crear un CRUD Simple** (15 minutos)

```bash
# 1. Leer la guía
docs/guides/SIMPLE_CRUD_GUIDE.md

# 2. Usar el template
docs/templates/SIMPLE_CRUD_TEMPLATE.md

# 3. Implementar siguiendo el patrón de features existentes
```

### **Crear un Formulario Multi-Paso** (30 minutos)

```bash
# 1. Leer la guía
docs/guides/MULTISTEP_PAGES_GUIDE.md

# 2. Usar el template
docs/templates/MULTISTEP_PAGE_TEMPLATE.md

# 3. Ver ejemplo en features/user/
```

### **Agregar Autenticación a un Endpoint** (5 minutos)

```csharp
[Authorize] // Requiere autenticación
[Authorize(Roles = "Admin")] // Requiere rol específico
```

### **Implementar Paginación del Servidor** (10 minutos)

```typescript
// Frontend
const service = new PaginatedService<Entity>('/api/entity');
const { data, pagination } = useOptimizedCrud({ service });

// Backend - Ya implementado en DAOs
```

---

## 🎯 Casos de Uso

### **1. Sistema de Gestión de Usuarios**
- CRUD completo con formulario multi-paso
- Asignación de roles y permisos
- Gestión de contraseñas
- Auditoría de cambios

### **2. Catálogos Maestros**
- Positions (Cargos)
- Identity Documents (Documentos de identidad)
- Repositories (Repositorios)
- Configuración rápida con CRUD simple

### **3. Formularios Dinámicos**
- Creación de formularios desde la UI
- Campos configurables
- Validaciones personalizadas
- Preview en tiempo real

### **4. Gestión de Archivos**
- Upload con progress bar
- Download con streaming
- Validación de tipos
- Almacenamiento organizado

---

## 🔧 Configuración

### **Variables de Entorno**

#### Frontend (`.env.local`)
```env
VITE_API_BASE_URL=https://localhost:7001
VITE_APP_NAME=Enterprise App
VITE_ENABLE_DEBUG=true
```

#### Backend (`appsettings.Development.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=SaaSTemplateDB;..."
  },
  "Jwt": {
    "SecretKey": "your-secret-key-here",
    "Issuer": "your-app",
    "Audience": "your-app-users"
  }
}
```

---

## 🧪 Testing

### **Frontend**
```bash
cd 01-Frontend
npm run test          # Unit tests
npm run test:e2e      # E2E tests (Playwright)
npm run test:coverage # Coverage report
```

### **Backend**
```bash
cd 02-Backend
dotnet test
dotnet test --collect:"XPlat Code Coverage"
```

---

## 📦 Build y Deploy

### **Frontend**
```bash
cd 01-Frontend
npm run build         # Build para producción
npm run preview       # Preview del build
```

### **Backend**
```bash
cd 02-Backend
dotnet publish -c Release -o ./publish
```

### **Database**
```bash
# Ejecutar scripts de migración en orden
# Ver: 03-Database/Migration/
```

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### **Estándares de Código**

- Seguir las reglas de ESLint/Prettier
- Escribir tests para nuevas funcionalidades
- Documentar funciones públicas con JSDoc/XML docs
- Seguir los patrones establecidos en el proyecto

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👥 Autores

- **Enzo Gago Aguirre** - *Desarrollo inicial* - [GitHub](https://github.com/Enzo008)

---

## 🙏 Agradecimientos

- Comunidad de React y .NET
- Contribuidores de librerías open source
- Equipo de desarrollo

---

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/Enzo008/saas-template/issues)
- **Documentación**: [Wiki](https://github.com/Enzo008/saas-template/wiki)
- **Email**: enzoaguirre629@gmail.com

---

## 🗺️ Roadmap

### **v1.0** (Actual)
- ✅ Sistema CRUD unificado
- ✅ Autenticación JWT
- ✅ Gestión de archivos
- ✅ Navegación dinámica
- ✅ Internacionalización

### **v1.1** (Próximo)
- [ ] Tests unitarios completos
- [ ] Refresh token automático
- [ ] Notificaciones en tiempo real
- [ ] Dashboard analytics

### **v2.0** (Futuro)
- [ ] Micro-frontends
- [ ] GraphQL API
- [ ] Containerización (Docker)
- [ ] CI/CD pipeline

---

<div align="center">

**⭐ Si este proyecto te fue útil, considera darle una estrella ⭐**

Made with ❤️ by Enzo Gago Aguirre

</div>
