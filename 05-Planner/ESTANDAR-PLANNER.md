# ESTÁNDAR PARA PLANIFICACIÓN DE PROYECTOS

## Estructura de Identificadores y Etiquetas

### EN EL TÍTULO (Identificadores):
**Sprint**: [S0], [S1], [S2], [S3], [S4], [S5], [S6]...
**Prioridad**: [P1], [P2], [P3]

### ETIQUETAS DE COLORES (Categorización):

**Área Técnica** (Obligatorias):
- **Azul claro**: FE (Frontend)
- **Azul oscuro**: BE (Backend) 
- **Verde oscuro**: DB (Base de datos)
- **Gris oscuro**: DevOps
- **Lavanda**: QA/Testing
- **Melocotón**: UX/UI

**Tipo de Tarea** (Obligatorias):
- **Verde claro**: Feature (Nueva funcionalidad)
- **Amarillo**: Chore (Mantenimiento/Setup)
- **Rojo**: Bug/Fix
- **Caléndula**: Refactor

**Módulos/Contexto** (Variables por proyecto):
- **Rosa**: Auth/Seguridad
- **Verde**: Usuarios/Roles  
- **Azul**: Catálogos/Maestros
- **Púrpura**: Reportes/Analytics
- **Aguamarina**: CRUD/Mantenimientos
- **Verde azulado**: Integraciones
- **Plata**: Marco Lógico (para MEAL)
- **Marrón**: Cursos/Lecciones (para Academy)
- **Ciruela**: Inscripciones/Progreso
- **Cereza**: Presupuesto/Financiero
- **Naranja**: Beneficiarios/Ejecución
- **Verde lima**: Dashboard/Reportes
- **Bronce**: Documentación
- **Gris**: Otros/Generales

## Formato de Título Estándar:
`[Sprint][Prioridad] Descripción concisa`

**Ejemplos:**
- `[S1][P1] Login + guards + gestión de sesión`
- `[S0][P2] Componentes UI base + tabla paginación`
- `[S2][P1] CRUD estructura jerárquica Marco Lógico`

**Nota:** Si no hay etiquetas disponibles, solo usar identificadores en título: `[S1][P1][FE][Auth]`

## Estructura de Descripción (DoD):
- **Descripción clara del objetivo**
- **Definition of Done específico**

## Checklist Estándar:
- Items técnicos específicos
- Validaciones/Tests incluidos
- Documentación cuando aplique

## Dependencias:
- Referencias a otras tareas necesarias
- Formato: [Sprint][Área][Módulo] Nombre breve

## Asignación:
- Por especialidad técnica
- Por disponibilidad en sprint
- Por conocimiento del módulo

---

## Ventajas del Estándar:
1. **Visual**: Colores inmediatamente identifican sprint, prioridad y área
2. **Escalable**: Se adapta a cualquier tipo de proyecto
3. **Organizado**: Fácil filtrado y agrupación
4. **Consistente**: Mismo formato para todos los proyectos
5. **Copy-Paste Friendly**: Formato optimizado para planners
