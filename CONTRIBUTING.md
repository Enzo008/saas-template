# Guía de Contribución

¡Gracias por tu interés en contribuir al Enterprise SaaS Template! Este documento te guiará a través del proceso de contribución.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Puedo Contribuir?](#cómo-puedo-contribuir)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Commits y Pull Requests](#commits-y-pull-requests)

---

## 📜 Código de Conducta

Este proyecto y todos los participantes están regidos por un código de conducta basado en el respeto mutuo. Al participar, te comprometes a mantener este estándar.

---

## 🤝 ¿Cómo Puedo Contribuir?

### Reportar Bugs

Si encuentras un bug, por favor:

1. **Verifica** que no haya sido reportado previamente
2. **Abre un issue** con:
   - Título descriptivo
   - Pasos para reproducir el bug
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Versión del navegador/SO

### Sugerir Mejoras

Para sugerir nuevas características:

1. **Abre un issue** describiendo:
   - El problema que resuelve
   - Solución propuesta
   - Alternativas consideradas
   - Impacto esperado

### Pull Requests

1. **Fork** el repositorio
2. **Crea una rama** desde `main`:
   ```bash
   git checkout -b feat/mi-nueva-caracteristica
   ```
3. **Realiza tus cambios** siguiendo los estándares
4. **Haz commit** de tus cambios
5. **Push** a tu fork
6. **Abre un Pull Request**

---

## 🔄 Proceso de Desarrollo

### Configuración del Entorno

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Enzo008/saas-template.git
   cd saas-template
   ```

2. Sigue las instrucciones en [README.md](README.md) para configurar frontend, backend y base de datos

### Estructura de Ramas

Usamos **GitHub Flow** con las siguientes convenciones:

- `main` - Código en producción, siempre estable
- `feat/[nombre]` - Nuevas características
- `fix/[nombre]` - Corrección de bugs
- `refactor/[nombre]` - Refactorización de código
- `docs/[nombre]` - Cambios en documentación

---

## 📝 Estándares de Código

### Frontend (TypeScript/React)

- **ESLint**: El código debe pasar todas las reglas de ESLint
- **TypeScript**: Evita `any`, usa tipos explícitos
- **Componentes**: Usa componentes funcionales con hooks
- **Naming**: PascalCase para componentes, camelCase para funciones

### Backend (C#/.NET)

- **Convenciones**: Sigue las convenciones de C# estándar
- **Naming**: PascalCase para clases y métodos públicos
- **SOLID**: Respeta los principios SOLID
- **Async**: Usa `async/await` para operaciones I/O

### Base de Datos (SQL Server)

- **Stored Procedures**: Usa el prefijo `SP_`
- **Naming**: UPPER_CASE con underscores
- **Comentarios**: Documenta lógica compleja
- **Templates**: Usa los templates en `04-Database/Templates/`

---

## 🎯 Commits y Pull Requests

### Formato de Commits

Seguimos el formato **Conventional Commits**:

```
<type>: <description>

[optional body]
```

**Tipos válidos:**
- `feat`: Nueva característica
- `fix`: Corrección de bug
- `refactor`: Refactorización
- `docs`: Cambios en documentación
- `chore`: Tareas de mantenimiento
- `test`: Añadir o modificar tests

**Ejemplos:**
```bash
feat: add user profile picture upload
fix: resolve authentication token expiration issue
refactor: extract validation logic to shared utility
docs: update installation instructions in README
```

**Reglas:**
- ✅ Usa imperativo ("add" no "added")
- ✅ Primera letra en minúscula después del tipo
- ✅ Sin punto final en el título
- ✅ Máximo 72 caracteres en el título
- ❌ No uses emojis
- ❌ No uses lenguaje casual

Lee [`.windsurf/rules/github-workflow.md`](.windsurf/rules/github-workflow.md) para más detalles.

### Pull Request Guidelines

**Antes de abrir un PR:**
- ✅ Tu código compila sin errores
- ✅ Has probado localmente los cambios
- ✅ Has actualizado la documentación si es necesario
- ✅ Tus commits siguen el formato estándar

**En el PR:**
- Título descriptivo siguiendo el formato de commits
- Descripción clara de qué cambia y por qué
- Screenshots si hay cambios visuales
- Referencias a issues relacionados

**Ejemplo de descripción:**

```markdown
## Cambios
- Implementa upload de avatar de usuario
- Agrega validación de tamaño de imagen (max 5MB)
- Actualiza UI del perfil de usuario

## Tipo de cambio
- [ ] Bug fix
- [x] Nueva característica
- [ ] Breaking change
- [ ] Documentación

## Checklist
- [x] El código compila correctamente
- [x] He probado los cambios localmente
- [x] He actualizado la documentación
- [x] Mis commits siguen el estándar

## Screenshots
![imagen del cambio]
```

---

## 🧪 Testing

Aunque actualmente no tenemos tests completos, al agregar nuevas características considera:

- Agregar tests unitarios para lógica de negocio
- Tests de integración para endpoints
- Documentar casos de prueba manual

---

## 📚 Recursos

- [React Documentation](https://react.dev/)
- [.NET Documentation](https://learn.microsoft.com/dotnet/)
- [SQL Server Documentation](https://learn.microsoft.com/sql/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 💬 ¿Preguntas?

Si tienes preguntas, puedes:

1. Abrir un [issue](https://github.com/Enzo008/saas-template/issues) con la etiqueta `question`
2. Revisar [issues existentes](https://github.com/Enzo008/saas-template/issues)

---

¡Gracias por contribuir! 🎉
