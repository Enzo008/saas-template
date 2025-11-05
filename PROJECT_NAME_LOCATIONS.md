# 📍 Ubicaciones del Nombre del Proyecto

Esta es una referencia rápida de **TODOS** los lugares donde aparece el nombre del proyecto `saas-template` y debe ser cambiado.

---

## 🎯 Nombre Actual del Proyecto

```
Nombre base: saas-template
Frontend: saas-template.client        ← Identificador del paquete frontend
Backend: saas-template.server         ← Identificador del paquete backend (minúsculas)
PascalCase: SaaSTemplate
Título: SaaS Template
Database: DB_SAAS_TEMPLATE
```

### **⚠️ IMPORTANTE: Sufijos .client y .server**

Los sufijos son **NECESARIOS** para:
- ✅ Evitar conflictos de nombres entre frontend y backend
- ✅ Identificar claramente qué paquete es cuál
- ✅ Facilitar el manejo en monorepos
- ✅ Seguir convenciones de naming estándar

**Convención recomendada (minúsculas):**
- Frontend: `[nombre-proyecto].client`
- Backend: `[nombre-proyecto].server`

**💡 Nota:** Visual Studio genera `.Server` (capitalizado) por defecto, pero puedes usar `.server` (minúsculas) sin problemas. Es solo una convención, no un requisito técnico. Usar minúsculas es más consistente con las convenciones web modernas.

---

## 📂 Frontend (01-Frontend/)

### 1. `package.json`
```json
{
  "name": "saas-template.client",           // ← CAMBIAR
  "description": "SaaS Template",   // ← CAMBIAR
  // ...
}
```
**Líneas:** 2, 4

---

### 2. `index.html`
```html
<title>SaaS Template</title>        <!-- ← CAMBIAR -->
```
**Línea:** 7

---

### 3. `.env.example`
```env
VITE_APP_NAME=saas-template                 # ← CAMBIAR
VITE_APP_TITLE="SaaS Template"     # ← CAMBIAR
```
**Líneas:** 2, 3

---

### 4. `.env` (si existe)
```env
VITE_APP_NAME=saas-template                 # ← CAMBIAR
VITE_APP_TITLE="SaaS Template"     # ← CAMBIAR
```
**Líneas:** 2, 3

---

### 5. `src/config/app.config.ts`
```typescript
/**
 * Configuración global de la aplicación
 * Proyecto: SaaS Template          // ← CAMBIAR (comentario)
 */
```
**Línea:** 3 (comentario opcional)

---

### 6. `vite.config.ts` (opcional)
```typescript
// Si hay referencias al nombre del proyecto
```
**Verificar si hay referencias**

---

## 📂 Backend (02-Backend/)

### 1. Nombre del archivo `.csproj`
```
saas-template.server.csproj                 // ← RENOMBRAR ARCHIVO
```
**Acción:** Renombrar archivo completo

---

### 2. Contenido del `.csproj`
```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <RootNamespace>SaaSTemplate.Server</RootNamespace>        <!-- ← CAMBIAR -->
    <AssemblyName>SaaSTemplate.Server</AssemblyName>          <!-- ← CAMBIAR -->
  </PropertyGroup>
</Project>
```
**Líneas:** 4, 5

---

### 3. `Program.cs`
```csharp
namespace SaaSTemplate.Server               // ← CAMBIAR
{
    public class Program
    {
        // ...
    }
}
```
**Línea:** 1

---

### 4. TODOS los archivos `.cs` - Namespaces

**Buscar en todos los archivos:**
```csharp
namespace SaaSTemplate.Server.Controllers   // ← CAMBIAR
namespace SaaSTemplate.Server.Models        // ← CAMBIAR
namespace SaaSTemplate.Server.Services      // ← CAMBIAR
namespace SaaSTemplate.Server.DataAccessObject  // ← CAMBIAR
namespace SaaSTemplate.Server.Middleware    // ← CAMBIAR
namespace SaaSTemplate.Server.Extensions    // ← CAMBIAR
```

**Archivos afectados:**
- `Controllers/*.cs` (todos)
- `Models/*.cs` (todos)
- `Services/*.cs` (todos)
- `DataAccessObject/*.cs` (todos)
- `Middleware/*.cs` (todos)
- `Extensions/*.cs` (todos)
- `Config/*.cs` (todos)

**Método rápido:**
```
Buscar: SaaSTemplate.Server
Reemplazar: [TuProyecto].Server
```

---

### 5. TODOS los archivos `.cs` - Using statements

```csharp
using SaaSTemplate.Server.Controllers;      // ← CAMBIAR
using SaaSTemplate.Server.Models;           // ← CAMBIAR
using SaaSTemplate.Server.Services;         // ← CAMBIAR
// etc...
```

**Se cambian automáticamente con el Find & Replace de namespaces**

---

### 6. `appsettings.json`
```json
{
  "AppSettings": {
    "ApplicationName": "SaaS Template",     // ← CAMBIAR
    "Version": "1.0.0",
    "Environment": "Development"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DB_SAAS_TEMPLATE;..."  // ← CAMBIAR DB
  },
  "Jwt": {
    "Issuer": "saas-template-api",                  // ← CAMBIAR
    "Audience": "saas-template-client",             // ← CAMBIAR
    "SecretKey": "..."
  }
}
```
**Líneas:** 3, 7, 10, 11

---

### 7. `appsettings.Development.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DB_SAAS_TEMPLATE;..."  // ← CAMBIAR DB
  }
}
```
**Línea:** 3

---

### 8. `appsettings.Production.json` (si existe)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=DB_SAAS_TEMPLATE;..."  // ← CAMBIAR DB
  }
}
```
**Línea:** 3

---

## 📂 Database (03-Database/)

### 1. Scripts de creación de DB

**Cualquier script que cree la base de datos:**
```sql
CREATE DATABASE DB_SAAS_TEMPLATE;           -- ← CAMBIAR
GO
USE DB_SAAS_TEMPLATE;                       -- ← CAMBIAR
GO
```

**Archivos comunes:**
- `00-CreateDatabase.sql`
- `01-Schema/01-CreateSchema.sql`

---

### 2. Scripts de tablas

**En comentarios o nombres:**
```sql
-- Base de datos: DB_SAAS_TEMPLATE          -- ← CAMBIAR (comentarios)
-- Proyecto: SaaS Template          -- ← CAMBIAR (comentarios)
```

**Verificar en:**
- `02-Tables/*.sql`
- `03-StoredProcedures/*.sql`

---

### 3. Stored Procedures

**En comentarios:**
```sql
-- *****************************************************
-- Descripción       : [Descripción]
-- Proyecto          : SaaS Template    -- ← CAMBIAR
-- Base de datos     : DB_SAAS_TEMPLATE          -- ← CAMBIAR
-- *****************************************************
```

**Verificar en:**
- `03-StoredProcedures/*.sql`

---

## 📂 Raíz del Proyecto

### 1. `README.md`
```markdown
# SaaS Template                     <!-- ← CAMBIAR -->

Sistema empresarial desarrollado con...

## Descripción
SaaS Template es...                <!-- ← CAMBIAR -->
```
**Líneas:** 1, 5+

---

### 2. Nombre de la carpeta raíz
```
saas-template/                              // ← RENOMBRAR CARPETA
```
**Acción:** Renombrar carpeta completa

---

### 3. `.git/config` (si ya existe repo)
```
[remote "origin"]
    url = https://github.com/usuario/saas-template.git    # ← CAMBIAR
```
**Línea:** 2

---

## 🔍 Búsqueda Global Recomendada

### En VS Code:

**1. Buscar nombre en minúsculas:**
```
Buscar: saas-template
Reemplazar: [tu-proyecto]
```

**2. Buscar nombre en PascalCase:**
```
Buscar: SaaSTemplate
Reemplazar: [TuProyecto]
```

**3. Buscar nombre de DB:**
```
Buscar: DB_SAAS_TEMPLATE
Reemplazar: DB_[TU_PROYECTO]
```

**4. Buscar en JWT:**
```
Buscar: saas-template-api
Reemplazar: [tu-proyecto]-api

Buscar: saas-template-client
Reemplazar: [tu-proyecto]-client
```

---

## 📊 Resumen por Tipo

### Archivos de Configuración
| Archivo | Ubicación | Qué cambiar |
|---------|-----------|-------------|
| `package.json` | Frontend | name, description |
| `index.html` | Frontend | title |
| `.env` | Frontend | VITE_APP_NAME, VITE_APP_TITLE |
| `.csproj` | Backend | Nombre archivo, RootNamespace, AssemblyName |
| `appsettings.json` | Backend | ApplicationName, ConnectionStrings, JWT |
| `README.md` | Raíz | Título, descripción |

---

### Código Fuente
| Tipo | Ubicación | Qué cambiar |
|------|-----------|-------------|
| Namespaces | Backend `*.cs` | `SaaSTemplate.Server` → `[TuProyecto].Server` |
| Using statements | Backend `*.cs` | `using SaaSTemplate.Server` → `using [TuProyecto].Server` |
| Comentarios | Todos | Referencias al proyecto |

---

### Base de Datos
| Tipo | Ubicación | Qué cambiar |
|------|-----------|-------------|
| Nombre DB | Scripts SQL | `DB_SAAS_TEMPLATE` → `DB_[TU_PROYECTO]` |
| Comentarios | Scripts SQL | Referencias al proyecto |
| Connection Strings | Backend config | Nombre de la base de datos |

---

## ✅ Checklist de Verificación

Después de cambiar todo, verificar:

- [ ] `package.json` - nombre y descripción actualizados
- [ ] `index.html` - título actualizado
- [ ] `.env` - variables actualizadas
- [ ] `.csproj` - archivo renombrado y contenido actualizado
- [ ] Todos los `.cs` - namespaces actualizados
- [ ] `appsettings.json` - todas las referencias actualizadas
- [ ] Scripts SQL - nombre de DB actualizado
- [ ] `README.md` - título y descripción actualizados
- [ ] Carpeta raíz - renombrada

---

## 🤖 Script Automático

Para automatizar estos cambios, usa:

```powershell
.\rename-project.ps1 -NewProjectName "tu-proyecto" -NewProjectTitle "Tu Título"
```

El script cambia automáticamente:
- ✅ Frontend: package.json, index.html, .env
- ✅ Backend: .csproj, namespaces, appsettings
- ✅ README.md

**Cambios manuales pendientes:**
- ⚠️ Nombre de carpeta raíz
- ⚠️ Scripts de base de datos
- ⚠️ Comentarios específicos

---

## 📝 Notas Importantes

1. **Case Sensitivity:**
   - `saas-template` (kebab-case) → URLs, nombres de archivo
   - `SaaSTemplate` (PascalCase) → Namespaces, clases
   - `DB_SAAS_TEMPLATE` (UPPER_SNAKE_CASE) → Base de datos

2. **Consistencia:**
   - Usa el mismo formato en todos los lugares correspondientes
   - Ejemplo: Si usas `project-contability`, usa `ProjectContability` en namespaces

3. **Git:**
   - Si ya tienes un repo, actualiza la URL remota
   - Considera hacer un commit después de renombrar

4. **Testing:**
   - Después de renombrar, verifica que compile:
     - Frontend: `pnpm type-check`
     - Backend: `dotnet build`

---

## 🎯 Ejemplo Completo: saas-template → project-contability

| Ubicación | Antes | Después | Nota |
|-----------|-------|---------|------|
| Carpeta | `saas-template/` | `project-contability/` | Nombre base |
| **package.json** | `saas-template.client` | `project-contability.client` | ⚠️ **Mantener .client** |
| index.html | `SaaS Template` | `Sistema de Contabilidad` | Título visible |
| .env | `VITE_APP_NAME=saas-template` | `VITE_APP_NAME=project-contability` | Nombre base |
| **.csproj (archivo)** | `saas-template.server.csproj` | `project-contability.server.csproj` | ⚠️ **Mantener .server** (minúsculas) |
| .csproj (namespace) | `SaaSTemplate.Server` | `ProjectContability.Server` | PascalCase interno |
| Namespaces .cs | `SaaSTemplate.Server.*` | `ProjectContability.Server.*` | PascalCase interno |
| appsettings | `DB_SAAS_TEMPLATE` | `DB_CONTABILIDAD` | UPPER_SNAKE_CASE |
| JWT Issuer | `saas-template-api` | `project-contability-api` | kebab-case + -api |
| JWT Audience | `saas-template-client` | `project-contability-client` | kebab-case + -client |

### **🔑 Regla de Oro:**
- **Nombres de archivo:** Usar minúsculas para consistencia
  - Frontend: `[nombre-proyecto].client`
  - Backend: `[nombre-proyecto].server` (no `.Server`)
- **Namespaces internos:** Usar PascalCase
  - Backend namespace: `[NombreProyecto].Server`
- Estos sufijos **NO SON OPCIONALES** - son identificadores necesarios

### **📝 Aclaración: .server vs .Server**
- **Archivo .csproj:** Usa `.server` (minúsculas) → `project-contability.server.csproj`
- **Namespace C#:** Usa `.Server` (PascalCase) → `ProjectContability.Server`
- **No hay conflicto:** Son dos cosas diferentes (nombre de archivo vs namespace)

---

**Última actualización:** Noviembre 2024  
**Versión:** 1.0.0
