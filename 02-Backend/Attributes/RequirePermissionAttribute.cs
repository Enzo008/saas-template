// *****************************************************************************************************
// Descripción       : Atributo para validar permisos en endpoints
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 10/11/2025
// Acción a Realizar : Validar que el usuario tenga permisos específicos para ejecutar una acción
// *****************************************************************************************************

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;
using Microsoft.Extensions.Caching.Memory;
using saas_template.server.DataAccessObject.Core;
using saas_template.server.DataAccessObject.Helper;
using saas_template.server.Models;
using static Helper.Types;

namespace saas_template.server.Attributes
{
    /// <summary>
    /// Atributo para validar permisos en endpoints.
    /// Se coloca encima de los métodos del controller que requieren permisos específicos.
    /// 
    /// IMPORTANTE: Los datos del usuario (USUANO, USUCOD) se obtienen SIEMPRE del token JWT,
    /// nunca del body de la petición para evitar suplantación de identidad.
    /// </summary>
    /// <example>
    /// [RequirePermission("position", "01")]  // Permiso de CREAR en el menú Position
    /// public async Task<ActionResult> Create([FromBody] Position bPosition)
    /// </example>
    [AttributeUsage(AttributeTargets.Method, AllowMultiple = false)]
    public class RequirePermissionAttribute : TypeFilterAttribute
    {
        public RequirePermissionAttribute(string menuRef, string permissionCode) 
            : base(typeof(PermissionFilter))
        {
            Arguments = new object[] { menuRef, permissionCode };
        }
    }

    /// <summary>
    /// Filtro interno que ejecuta la validación de permisos usando patrón DAO
    /// </summary>
    public class PermissionFilter : IAsyncActionFilter
    {
        private readonly IConfiguration _configuration;
        private readonly LogHelper _logHelper;
        private readonly IMemoryCache _cache;
        private readonly string _menuRef;
        private readonly string _permissionCode;
        private const int CACHE_DURATION_MINUTES = 15;

        public PermissionFilter(IConfiguration configuration, LogHelper logHelper, IMemoryCache cache, string menuRef, string permissionCode)
        {
            _configuration = configuration;
            _logHelper = logHelper;
            _cache = cache;
            _menuRef = menuRef;
            _permissionCode = permissionCode;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            // Obtener claims del token JWT
            var user = context.HttpContext.User;
            
            if (!user.Identity?.IsAuthenticated ?? true)
            {
                context.Result = new UnauthorizedObjectResult(new
                {
                    Success = false,
                    Message = "Usuario no autenticado",
                    MessageType = "Error"
                });
                return;
            }

            // CRÍTICO: Obtener USUANO y USUCOD del token JWT (claims)
            var useYea = user.FindFirst("USEYEA")?.Value;
            var useCod = user.FindFirst("USECOD")?.Value;

            if (string.IsNullOrEmpty(useYea) || string.IsNullOrEmpty(useCod))
            {
                context.Result = new UnauthorizedObjectResult(new
                {
                    Success = false,
                    Message = "Token inválido: faltan datos del usuario",
                    MessageType = "Error"
                });
                return;
            }

            // Validar permiso usando patrón DAO con cache
            var hasPermission = await HasPermissionAsync(
                context.HttpContext,
                useYea, 
                useCod, 
                _menuRef, 
                _permissionCode
            );

            if (!hasPermission)
            {
                var userName = user.FindFirst("USENAM")?.Value ?? "Usuario";
                var action = GetActionDescription(_permissionCode);
                
                // Log de intento de acceso no autorizado
                Console.WriteLine($"❌ PERMISO DENEGADO - Usuario: {userName} ({useYea}-{useCod}), " +
                                $"Menú: {_menuRef}, Acción: {action} ({_permissionCode})");

                context.Result = new ObjectResult(new
                {
                    Success = false,
                    Message = $"No tienes permisos para {action} en este módulo",
                    MessageType = "Error",
                    RequiredPermission = new
                    {
                        Menu = _menuRef,
                        Action = action,
                        Code = _permissionCode
                    }
                })
                {
                    StatusCode = 403 // Forbidden
                };
                return;
            }

            // Log de acceso autorizado
            var userNameSuccess = user.FindFirst("USENAM")?.Value ?? "Usuario";
            Console.WriteLine($"✅ PERMISO CONCEDIDO - Usuario: {userNameSuccess} ({useYea}-{useCod}), " +
                            $"Menú: {_menuRef}, Acción: {GetActionDescription(_permissionCode)} ({_permissionCode})");

            // Permitir la ejecución del endpoint
            await next();
        }

        /// <summary>
        /// Valida si un usuario tiene un permiso específico usando patrón DAO con cache
        /// </summary>
        private async Task<bool> HasPermissionAsync(HttpContext httpContext, string useYea, string useCod, string menuRef, string permissionCode)
        {
            try
            {
                // Clave de cache única por usuario
                var cacheKey = $"UserPermissions_{useYea}_{useCod}";

                // Intentar obtener del cache
                if (!_cache.TryGetValue(cacheKey, out Dictionary<string, List<string>>? userPermissions))
                {
                    // Si no está en cache, consultar DB usando DAO
                    userPermissions = await GetUserPermissionsAsync(httpContext, useYea, useCod);

                    // Guardar en cache
                    var cacheOptions = new MemoryCacheEntryOptions()
                        .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));

                    _cache.Set(cacheKey, userPermissions, cacheOptions);
                }

                // Verificar si el usuario tiene el permiso
                if (userPermissions != null && 
                    userPermissions.TryGetValue(menuRef.ToLower(), out var permissions))
                {
                    return permissions.Contains(permissionCode);
                }

                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al validar permiso: {ex.Message}");
                // En caso de error, denegar acceso por seguridad
                return false;
            }
        }

        /// <summary>
        /// Obtiene todos los permisos de un usuario desde la base de datos usando patrón DAO
        /// </summary>
        private async Task<Dictionary<string, List<string>>> GetUserPermissionsAsync(HttpContext httpContext, string useYea, string useCod)
        {
            var permissions = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase);

            try
            {
                // Crear log desde el token
                var bLog = await _logHelper.CreateLogFromTokenAsync(httpContext);

                // Obtener repositorio usando el factory pattern
                var permissionRepository = RepositoryFactory.GetInstanceSqlServer(_configuration).GetPermissionRepository();

                // Consultar permisos usando el DAO
                var response = await permissionRepository.GetUserPermissions(useYea, useCod, bLog);

                if (response.Success && response.Data != null)
                {
                    // El DAO retorna un Dictionary<string, List<string>>
                    permissions = response.Data as Dictionary<string, List<string>> 
                        ?? new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al obtener permisos del usuario: {ex.Message}");
            }

            return permissions;
        }

        /// <summary>
        /// Obtener descripción legible de la acción según el código de permiso
        /// </summary>
        private string GetActionDescription(string permissionCode)
        {
            return permissionCode switch
            {
                "01" => "crear",
                "02" => "modificar",
                "03" => "eliminar",
                "04" => "consultar",
                "05" => "exportar",
                "06" => "importar",
                "07" => "imprimir",
                "08" => "aprobar",
                _ => "ejecutar esta acción"
            };
        }
    }
}
