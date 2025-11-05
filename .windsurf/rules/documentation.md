---
trigger: always_on
---

# Documentation Standards

## File Headers

### Frontend (.ts, .tsx files)

All main files require concise headers (1-2 lines max):

```typescript
/**
 * [Brief purpose description]
 * [Additional context if needed - max 2 lines]
 */
```

**Examples by file type:**

- **Services**: `Servicio para gestión de usuarios - operaciones CRUD con cache optimizado`
- **Main hooks**: `Hook unificado para CRUD - maneja modal/page modes y paginación del servidor`
- **Pages**: `Página principal de usuarios - tabla con paginación + modal CRUD`
- **UI components**: `Componente de encabezado - sidebar trigger, breadcrumbs y controles`
- **Configs/Utils**: `Configuración de campos para formulario de usuarios`

### Backend (.cs files)

Maintain existing C# header format:

```csharp
// *****************************************************************************************************
// Descripción       : [Controller/class description]
// Creado por        : [Developer name]
// Fecha de Creación : [DD/MM/YYYY]
// Acción a Realizar : [Main actions performed]
// *****************************************************************************************************
```

## Documentation Rules

### Required Documentation

- **File headers**: Services, hooks, pages, main components
- **Inline comments**: Complex logic, non-obvious decisions
- **JSDoc**: Public exported functions
- **Technical decisions**: When reasoning isn't obvious

### Avoid Over-Documentation

- No excessive documentation (like 600+ line comments)
- No unnecessary README files - prefer code comments
- No obvious comments that repeat code
- No duplicate documentation
- No headers for trivial files (simple types, exports)

## Documentation Levels

**Level 1** (Header + critical comments): Main services, complex hooks, pages, layouts
**Level 2** (Basic header): UI components, simple hooks, configs, utilities  
**Level 3** (Inline only): Simple types, index files, basic constants