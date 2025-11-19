# Política de Seguridad

## 🔐 Versiones Soportadas

Actualmente, estamos dando soporte de seguridad a la siguiente versión:

| Versión | Soporte          |
| ------- | ---------------- |
| main    | ✅ Activo        |
| < main  | ❌ No soportado  |

## 🚨 Reportar una Vulnerabilidad

La seguridad es una prioridad. Si descubres una vulnerabilidad de seguridad, por favor repórtala de forma responsable.

### Proceso de Reporte

**NO abras un issue público** para vulnerabilidades de seguridad.

En su lugar:

1. **Envía un email** a: [Tu email aquí o usar GitHub Security Advisories]
2. **Incluye** los siguientes detalles:
   - Descripción de la vulnerabilidad
   - Pasos para reproducirla
   - Impacto potencial
   - Versión afectada
   - Cualquier posible mitigación

### Qué Esperar

- **Confirmación**: Responderemos en un plazo de 48 horas
- **Evaluación**: Evaluaremos y confirmaremos el issue
- **Corrección**: Trabajaremos en un fix
- **Divulgación**: Coordinaremos la divulgación pública responsable

## 🛡️ Mejores Prácticas de Seguridad

Al usar este template:

### Configuración

- ✅ **NUNCA** hagas commit de:
  - Claves de API
  - Secrets de JWT
  - Connection strings con credenciales
  - Certificados privados
  - Archivos `.env` con datos sensibles

- ✅ **SIEMPRE**:
  - Usa variables de entorno para secretos
  - Mantén `.env.example` sin valores reales
  - Rota las claves regularmente
  - Usa HTTPS en producción

### Autenticación

- ✅ Cambia el `JWT.SecretKey` en producción
- ✅ Usa passwords fuertes (mínimo 8 caracteres)
- ✅ Implementa rate limiting en endpoints de login
- ✅ Considera agregar 2FA para producción

### Base de Datos

- ✅ Usa credenciales únicas por ambiente
- ✅ Limita privilegios de usuario de BD
- ✅ Mantén SQL Server actualizado
- ✅ Habilita auditoría de base de datos

### Frontend

- ✅ Sanitiza input de usuarios
- ✅ Valida datos en cliente Y servidor
- ✅ Implementa CSP (Content Security Policy)
- ✅ Mantén dependencias actualizadas

### Backend

- ✅ Valida y sanitiza todo input
- ✅ Usa prepared statements (ya implementado en SPs)
- ✅ Implementa rate limiting
- ✅ Mantén .NET actualizado

## 🔄 Actualizaciones de Seguridad

Las actualizaciones de seguridad se publicarán:

1. Como un nuevo commit en `main`
2. Con un issue de seguridad explicando el cambio
3. En las release notes si es una vulnerabilidad mayor

## 📚 Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [.NET Security](https://learn.microsoft.com/en-us/aspnet/core/security/)
- [React Security](https://react.dev/learn/security)
- [SQL Server Security](https://learn.microsoft.com/en-us/sql/relational-databases/security/)

## 🙏 Agradecimientos

Agradecemos a todos los investigadores de seguridad que reportan vulnerabilidades de forma responsable.

---

**Última actualización**: 2025-01-19
