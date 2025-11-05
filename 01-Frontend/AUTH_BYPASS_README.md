# 🔓 Sistema de Bypass de Autenticación

Este documento explica cómo habilitar/deshabilitar el sistema de autenticación en la aplicación.

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Cómo Usar](#cómo-usar)
- [Casos de Uso](#casos-de-uso)
- [Configuración Detallada](#configuración-detallada)
- [Estructura del Sistema](#estructura-del-sistema)

---

## 🎯 Descripción General

La aplicación incluye un **sistema de bypass de autenticación** que permite alternar fácilmente entre:

- **Modo Producción** (`AUTH_ENABLED = true`): Sistema completo de login, JWT, sesiones, etc.
- **Modo Desarrollo/Demo** (`AUTH_ENABLED = false`): Acceso directo sin login, ideal para prototipos

---

## 🚀 Cómo Usar

### Paso 1: Abrir el archivo de configuración

```
📁 01-Frontend/src/config/app.config.ts
```

### Paso 2: Cambiar el flag de autenticación

```typescript
/**
 * Habilitar/Deshabilitar sistema de autenticación
 */
export const AUTH_ENABLED = true;  // ← Cambiar a false para bypass
```

### Paso 3: Personalizar datos mock (opcional)

Si `AUTH_ENABLED = false`, puedes personalizar:

```typescript
export const NO_AUTH_CONFIG = {
  mockUser: {
    useNam: 'Tu Nombre',      // ← Personaliza el usuario
    useLas: 'Tu Apellido',
    useEma: 'tu@email.com',
    // ... más campos
  }
};
```

### Paso 4: Guardar y recargar

¡Listo! La aplicación ahora funcionará sin login.

---

## 💡 Casos de Uso

### ✅ Cuándo usar `AUTH_ENABLED = false`

1. **Prototipos rápidos**
   - Quieres probar la UI sin configurar backend
   - Necesitas demostrar funcionalidades sin login

2. **Aplicaciones frontend-only**
   - Expense manager personal
   - Todo list
   - Calculadoras
   - Herramientas de productividad

3. **Desarrollo sin backend**
   - El backend no está listo
   - Trabajas solo en frontend
   - Pruebas de UI/UX

4. **Demos y presentaciones**
   - Mostrar la aplicación sin configurar usuarios
   - Presentaciones a clientes

### ✅ Cuándo usar `AUTH_ENABLED = true`

1. **Producción**
   - Aplicación real con usuarios
   - Seguridad requerida
   - Múltiples usuarios con diferentes permisos

2. **Desarrollo con backend**
   - Integración completa
   - Pruebas de autenticación
   - Testing de permisos

---

## ⚙️ Configuración Detallada

### Estructura del archivo `app.config.ts`

```typescript
// ==========================================
// CONFIGURACIÓN DE AUTENTICACIÓN
// ==========================================

export const AUTH_ENABLED = true;  // ← Flag principal

export const NO_AUTH_CONFIG = {
  mockUser: { /* Usuario mock */ }
};

// ==========================================
// CONFIGURACIÓN DE DESARROLLO
// ==========================================

export const DEV_MODE = import.meta.env.DEV;
export const DEBUG_NAVIGATION = false;  // ← Logs de navegación
export const DEBUG_AUTH = false;        // ← Logs de auth

// ==========================================
// CONFIGURACIÓN DE UI
// ==========================================

export const SIDEBAR_CONFIG = {
  defaultCollapsed: false,
  expandedWidth: 280,
  collapsedWidth: 64
};

export const BREADCRUMB_CONFIG = {
  enabled: true,
  showIcons: false,
  separator: '>'
};

export const NOTIFICATION_CONFIG = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false
};

// ==========================================
// CONFIGURACIÓN DE RUTAS
// ==========================================

export const DEFAULT_ROUTE_AFTER_LOGIN = '/';
export const LOGIN_ROUTE = '/login';

// ==========================================
// CONFIGURACIÓN DE API
// ==========================================

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_TIMEOUT = 30000;
```

---

## 🏗️ Estructura del Sistema

### Archivos Principales

```
01-Frontend/
├── src/
│   ├── config/
│   │   └── app.config.ts          ← Configuración principal
│   ├── auth/
│   │   └── components/
│   │       └── AuthBypass.tsx     ← Lógica de bypass
│   └── App.tsx                     ← Integración
```

### Flujo de Autenticación

#### Con `AUTH_ENABLED = true`

```
Usuario → Login → AuthProvider → Validación JWT → Dashboard
```

#### Con `AUTH_ENABLED = false`

```
Usuario → AuthBypass → Auto-login con mock → Dashboard
```

---

## 🔧 Personalización Avanzada

### Cambiar usuario mock

```typescript
mockUser: {
  useNam: 'Admin',
  useLas: 'Principal',
  useEma: 'admin@miapp.com',
  useSta: 'A',
  // ... más campos
}
```

---

## 📝 Notas Importantes

1. **Nunca uses `AUTH_ENABLED = false` en producción**
   - Solo para desarrollo y demos
   - Sin seguridad real

2. **Los datos mock no se guardan**
   - Se pierden al recargar
   - Solo en memoria

3. **Las rutas siguen funcionando igual**
   - El sistema de rutas es independiente
   - Solo cambia la autenticación

4. **Compatibilidad total**
   - Puedes cambiar entre modos sin problemas
   - No afecta el código de la aplicación

---

## 🎨 Ejemplo Completo

### Aplicación de Gastos Personales (sin backend)

```typescript
// app.config.ts
export const AUTH_ENABLED = false;

export const NO_AUTH_CONFIG = {
  mockUser: {
    useNam: 'Usuario',
    useLas: 'Personal',
    useEma: 'yo@email.com',
    // ... resto de campos
  }
};
```

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo tener diferentes configuraciones para dev y prod?**
R: Sí, puedes usar variables de entorno:

```typescript
export const AUTH_ENABLED = import.meta.env.PROD ? true : false;
```

**P: ¿Los menús mock deben coincidir con rutas reales?**
R: Sí, el `menRef` debe coincidir con las rutas definidas en `navigationConfig.ts`

**P: ¿Puedo agregar más campos al usuario mock?**
R: Sí, pero deben coincidir con la interfaz `User` en `user.types.ts`

---

## 🎉 ¡Listo!

Ahora puedes alternar fácilmente entre modo con autenticación y sin autenticación según tus necesidades.

**Recuerda:** Siempre usa `AUTH_ENABLED = true` en producción.
