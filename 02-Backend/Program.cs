// *****************************************************************************************************
// Descripción       : Punto de entrada principal de la aplicación web API
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 11/02/2025
// Acción a Realizar : Configuración y ejecución del servidor web API
// *****************************************************************************************************

using System.Globalization;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using saas_template.server.DataAccessObject.Helper;
using saas_template.server.Config;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Server.IIS;
using Microsoft.AspNetCore.Http;

namespace saas_template.server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Configuración de globalización para el servidor
            ConfigureGlobalization();

            // Crear y configurar la aplicación
            var builder = CreateAndConfigureBuilder(args);

            // Construir y configurar el pipeline HTTP
            var app = ConfigureApplication(builder);

            // Ejecutar la aplicación
            app.Run();
        }

        private static void ConfigureGlobalization()
        {
            AppContext.SetSwitch("System.Globalization.Invariant", false);
            Thread.CurrentThread.CurrentCulture = new CultureInfo("es-ES");
            Thread.CurrentThread.CurrentUICulture = new CultureInfo("es-ES");
            CultureInfo.DefaultThreadCurrentCulture = new CultureInfo("es-ES");
            CultureInfo.DefaultThreadCurrentUICulture = new CultureInfo("es-ES");
        }

        private static WebApplicationBuilder CreateAndConfigureBuilder(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            
            // Configurar URL del servidor
            builder.WebHost.UseUrls("http://localhost:5181");

            // Configurar servicios básicos
            ConfigureBasicServices(builder);

            // Configurar autenticación JWT
            ConfigureJwtAuthentication(builder);

            // Configurar controladores y opciones JSON
            ConfigureControllersAndJson(builder);

            // Configurar contexto HTTP
            builder.Services.AddHttpContextAccessor();

            // Configurar CORS
            ConfigureCors(builder);

            return builder;
        }

        private static void ConfigureBasicServices(WebApplicationBuilder builder)
        {
            builder.Services.AddMemoryCache();
            builder.Services.AddHttpClient();
            builder.Services.AddScoped<LogHelper>();
            // Registrar el helper para el almacenamiento de archivos
            builder.Services.AddScoped<FileStorageHelper>();
            
            // Registrar la configuración centralizada
            builder.Services.AddSingleton<AppSettings>();
        }

        /// <summary>
        /// Configura la autenticación JWT para la aplicación.
        /// 
        /// IMPORTANTE: Este método establece la configuración en SecurityHelper para garantizar
        /// que se utilice la misma clave secreta tanto para generar como para validar tokens JWT.
        /// La clave se obtiene de la configuración (JwtSettings:SecretKey) o se utiliza una clave
        /// por defecto si la configuración no está disponible.
        /// </summary>
        /// <param name="builder">El constructor de la aplicación web</param>
        private static void ConfigureJwtAuthentication(WebApplicationBuilder builder)
        {
            // Obtener la configuración de JWT
            var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
            var secretKey = jwtSettings?.SecretKey ?? "03qQXpA0X3Z6O6RWbPOR1SizVCx0QHL1";
            
            // Registrar la clave secreta para que esté disponible en toda la aplicación
            builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
            
            // IMPORTANTE: Establecer la configuración en SecurityHelper para que use la misma clave
            SecurityHelper.SetConfiguration(builder.Configuration);
            
            // Imprimir información de depuración sobre la clave secreta
            Console.WriteLine($"Usando clave secreta JWT: {secretKey.Substring(0, Math.Min(10, secretKey.Length))}...");
            
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secretKey)),
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ClockSkew = TimeSpan.Zero,
                        RequireSignedTokens = true,
                        ValidateLifetime = true
                    };
                    
                    // Agregar manejo de eventos para depurar problemas de validación
                    options.Events = new JwtBearerEvents
                    {
                        OnAuthenticationFailed = context =>
                        {
                            Console.WriteLine($"Error de autenticación JWT: {context.Exception.Message}");
                            return Task.CompletedTask;
                        },
                        OnTokenValidated = context =>
                        {
                            Console.WriteLine("Token JWT validado exitosamente");
                            return Task.CompletedTask;
                        }
                    };
                });
        }

        private static void ConfigureControllersAndJson(WebApplicationBuilder builder)
        {
            // Configurar límites para permitir archivos grandes (hasta 100MB)
            builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                options.JsonSerializerOptions.WriteIndented = true;
            });
            
            // Configurar límites de tamaño para la carga de archivos
            builder.Services.Configure<IISServerOptions>(options =>
            {
                options.MaxRequestBodySize = 104857600; // 100MB en bytes
            });
            
            // Configurar límites de tamaño para el formateador de formularios
            builder.Services.Configure<FormOptions>(options =>
            {
                options.MultipartBodyLengthLimit = 104857600; // 100MB en bytes
                options.ValueLengthLimit = int.MaxValue;
                options.MultipartHeadersLengthLimit = int.MaxValue;
            });
        }

        private static void ConfigureCors(WebApplicationBuilder builder)
        {
            // Obtener la configuración de CORS
            var corsSettings = builder.Configuration.GetSection("CorsSettings").Get<Config.CorsSettings>();
            var defaultOrigins = new[] 
            { 
                "http://localhost:3000",
                "http://localhost:4200",
                "https://localhost:5173",
                "http://localhost:5174"
            };
            
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowedOrigins",
                    policy =>
                    {
                        var origins = corsSettings?.AllowedOrigins;
                        if (origins == null || origins.Length == 0)
                        {
                            origins = defaultOrigins;
                        }
                        
                        var policyBuilder = policy.WithOrigins(origins);

                        if (corsSettings?.AllowAnyMethod ?? true)
                            policyBuilder.AllowAnyMethod();

                        if (corsSettings?.AllowAnyHeader ?? true)
                            policyBuilder.AllowAnyHeader();

                        if (corsSettings?.AllowCredentials ?? true)
                            policyBuilder.AllowCredentials();
                            
                        // Exponer encabezados necesarios para la descarga de archivos
                        policyBuilder.WithExposedHeaders("Content-Disposition", "Content-Length", "Content-Type");
                    });
            });
        }

        private static WebApplication ConfigureApplication(WebApplicationBuilder builder)
        {
            var app = builder.Build();

            // Configurar middleware de CORS
            app.UseCors("AllowedOrigins");
            
            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // app.UseHsts();
            }
            
            // Configurar pipeline de autenticación y autorización
            // app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseAuthorization();

            // Configurar rutas API
            app.MapControllers();
            
            // Configurar para servir archivos estáticos y la aplicación SPA
            app.UseDefaultFiles();
            app.UseStaticFiles();
            
            // Configurar para que todas las rutas no API se redirijan al index.html para React Router
            app.MapFallbackToFile("index.html");

            return app;
        }
    }

    public class CorsSettings
    {
        public string[] AllowedOrigins { get; set; } = Array.Empty<string>();
        public bool AllowAnyMethod { get; set; } = true;
        public bool AllowAnyHeader { get; set; } = true;
        public bool AllowCredentials { get; set; } = true;
    }
}
