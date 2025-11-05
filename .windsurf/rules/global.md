---
trigger: always_on
---

# Reglas Globales

## Estilo de Código
- Seguir las reglas de ESLint configuradas en el proyecto
- Utilizar Prettier para formateo consistente
- Mantener un estilo de código limpio y legible
- Utilizar nombres descriptivos para variables y funciones
- Comentar código complejo o no obvio
- Evitar código duplicado, preferir abstracción y reutilización
- Seguir principios SOLID en el diseño de componentes y servicios

## Documentación
- **Seguir estándar de headers**: Ver documentation.mdc para formato específico
- **Headers obligatorios** en servicios, hooks principales, páginas y componentes de layout
- **Comentarios concisos**: Máximo 3 líneas en header, evitar documentación excesiva
- **JSDoc/TSDoc** para funciones públicas exportadas
- **Documentar decisiones técnicas** importantes cuando no sea obvio
- **Preferir comentarios inline** sobre archivos README separados
- **Documentar flujos complejos** con comentarios en el código, no documentos externos

## Comunicación
- Proporcionar explicaciones claras y concisas
- Ofrecer alternativas cuando sea apropiado
- Mantener un tono profesional y constructivo
- Utilizar canales apropiados para diferentes tipos de comunicación
- Documentar decisiones importantes en reuniones
- Mantener registro de cambios en commits descriptivos

## Seguridad
- No exponer información sensible en el código
- Implementar validación de entrada en todos los formularios
- Seguir las mejores prácticas de seguridad para JWT y autenticación
- Validar permisos tanto en frontend como backend
- Implementar protección contra ataques comunes (XSS, CSRF, SQL Injection)
- Utilizar HTTPS para todas las comunicaciones
- Seguir el principio de privilegio mínimo para accesos
- Auditar regularmente dependencias por vulnerabilidades

## Accesibilidad
- Asegurar que todos los componentes sean accesibles
- Utilizar atributos ARIA cuando sea necesario
- Mantener un contraste adecuado en la interfaz de usuario
- Implementar navegación por teclado para todas las funcionalidades
- Seguir las pautas WCAG 2.1 nivel AA
- Probar con lectores de pantalla
- Proporcionar textos alternativos para imágenes

## Control de Calidad
- Implementar pruebas unitarias para lógica crítica
- Realizar revisiones de código antes de integrar cambios
- Seguir flujo de trabajo con ramas para nuevas características
- Mantener cobertura de pruebas para código crítico
- Realizar pruebas de integración para flujos principales
- Validar compatibilidad con navegadores objetivo
- Implementar CI/CD para validación automática

## Rendimiento
- Optimizar carga inicial de la aplicación
- Implementar lazy loading para rutas y componentes grandes
- Monitorear y optimizar tiempos de respuesta de API
- Implementar caché donde sea apropiado
- Optimizar consultas de base de datos
- Comprimir recursos estáticos
- Seguir buenas prácticas de Core Web Vitals
