# 🔧 Backend - Enterprise Application Template

**API REST con ASP.NET Core 8.0**, autenticación JWT, patrón DAO y librería Helper para utilidades comunes.

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![C#](https://img.shields.io/badge/C%23-12.0-239120?logo=c-sharp)](https://docs.microsoft.com/dotnet/csharp/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-CC2927?logo=microsoft-sql-server)](https://www.microsoft.com/sql-server)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Inicio Rápido](#-inicio-rápido)
- [Arquitectura](#-arquitectura)
- [Patrones de Desarrollo](#-patrones-de-desarrollo)
- [Guías](#-guías)
- [API Endpoints](#-api-endpoints)
- [Configuración](#-configuración)
- [Seguridad](#-seguridad)

---

## ✨ Características

### 🎯 **Arquitectura en Capas**

- **Controllers**: Capa de presentación (API REST)
- **DAOs**: Capa de acceso a datos (Business Logic)
- **Models**: DTOs y entidades
- **Helper**: Librería de utilidades compartidas

### 🔐 **Autenticación y Autorización**

- JWT (JSON Web Tokens) con access/refresh tokens
- Role-based access control (RBAC)
- Permisos granulares por endpoint
- Encriptación de contraseñas con BCrypt
- Session management

### 📊 **Acceso a Datos**

- Patrón DAO (Data Access Object)
- Stored Procedures para lógica compleja
- Dapper para mapeo objeto-relacional
- Soporte para IDs simples y compuestos
- Transacciones ACID

### 🔧 **Helper Library**

- `Types`: Tipos comunes y responses estandarizados
- `EmailService`: Envío de correos con plantillas
- `FileStorageHelper`: Gestión de archivos
- `SecurityHelper`: JWT, encriptación, hashing
- `PasswordHelper`: Validación y generación de contraseñas

### 📁 **Gestión de Archivos**

- Upload con validación de tipos
- Download con streaming
- Almacenamiento organizado por entidad
- Límites configurables de tamaño
- Metadata tracking

### 🔍 **Logging y Auditoría**

- Logging estructurado con `LogHelper`
- Auditoría automática de operaciones
- Tracking de cambios con campos de auditoría
- Información de usuario desde JWT

---

## 🛠️ Stack Tecnológico

### **Core**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| .NET | 8.0 | Framework |
| ASP.NET Core | 8.0 | Web API |
| C# | 12.0 | Lenguaje |

### **Data Access**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Dapper | 2.1.x | Micro-ORM |
| System.Data.SqlClient | Latest | SQL Server driver |
| ADO.NET | Built-in | Database connectivity |

### **Authentication & Security**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Microsoft.AspNetCore.Authentication.JwtBearer | 8.0 | JWT authentication |
| BCrypt.Net-Next | 4.x | Password hashing |
| System.IdentityModel.Tokens.Jwt | Latest | JWT generation |

### **Utilities**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Newtonsoft.Json | 13.x | JSON serialization |
| Helper | Custom | Shared utilities |

### **Development Tools**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Swashbuckle.AspNetCore | 6.x | Swagger/OpenAPI |
| Microsoft.Extensions.Logging | 8.0 | Logging |

---

## 📁 Estructura del Proyecto

```
02-Backend/
├── Controllers/                 # API Controllers
│   ├── Base/                   # Base controllers
│   │   └── BaseController.cs   # Controller base con helpers
│   ├── AuthenticationController.cs
│   ├── UserController.cs
│   ├── PositionController.cs
│   ├── RepositoryController.cs
│   ├── IdentityDocumentController.cs
│   ├── RolController.cs
│   └── FormController.cs
│
├── DataAccessObject/           # Capa de acceso a datos
│   ├── Abstraction/           # Interfaces (contratos)
│   │   ├── IUserRepository.cs
│   │   ├── IPositionRepository.cs
│   │   ├── IRepositoryRepository.cs
│   │   ├── IIdentityDocumentRepository.cs
│   │   ├── IRolRepository.cs
│   │   └── IFormRepository.cs
│   │
│   ├── Database/              # Implementaciones por DB
│   │   └── SqlServer/        # Implementación SQL Server
│   │       ├── SqlServerDAOFactory.cs
│   │       ├── SqlServerUserDAO.cs
│   │       ├── SqlServerPositionDAO.cs
│   │       ├── SqlServerRepositoryDAO.cs
│   │       ├── SqlServerIdentityDocumentDAO.cs
│   │       ├── SqlServerRolDAO.cs
│   │       └── SqlServerFormDAO.cs
│   │
│   ├── Helper/                # Helpers de DAO
│   │   ├── LogHelper.cs       # Logging de operaciones
│   │   ├── PasswordHelper.cs  # Gestión de contraseñas
│   │   └── FileStorageHelper.cs
│   │
│   └── Core/                  # Core DAO
│       └── RepositoryFactory.cs
│
├── Models/                     # DTOs y entidades
│   ├── Usuario.cs
│   ├── Position.cs
│   ├── Repository.cs
│   ├── IdentityDocument.cs
│   ├── Rol.cs
│   ├── Form.cs
│   ├── Menu.cs
│   ├── Permission.cs
│   └── Log.cs
│
├── Middleware/                 # Custom middleware
│   ├── ExceptionMiddleware.cs
│   └── JwtMiddleware.cs
│
├── Extensions/                 # Extension methods
│   ├── ServiceExtensions.cs
│   └── HttpContextExtensions.cs
│
├── Config/                     # Configuración
│   └── AppSettings.cs
│
├── bin/                        # Binarios compilados
├── obj/                        # Archivos objeto
├── Properties/                 # Propiedades del proyecto
│   └── launchSettings.json
│
├── appsettings.json            # Configuración base
├── appsettings.Development.json # Configuración desarrollo
├── appsettings.Production.json  # Configuración producción
├── Program.cs                  # Entry point
├── saas-template.server.csproj      # Archivo del proyecto
└── README.md                   # Este archivo
```

---

## 🚀 Inicio Rápido

### **Prerequisitos**

- .NET 8.0 SDK
- SQL Server 2022 (o compatible)
- Visual Studio 2022 / VS Code / Rider

### **Instalación**

```bash
# Clonar repositorio (si no lo has hecho)
git clone https://github.com/Enzo008/saas-template.git
cd saas-template/02-Backend

# Restaurar dependencias
dotnet restore

# Configurar connection string
# Editar appsettings.Development.json
```

### **Configuración de Base de Datos**

```json
// appsettings.Development.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=SaaSTemplateDB;User Id=sa;Password=YourPassword;TrustServerCertificate=True;"
  }
}
```

### **Ejecutar**

```bash
# Desarrollo
dotnet run

# Con hot reload
dotnet watch run

# API disponible en:
# https://localhost:7001
# http://localhost:5000
```

### **Swagger UI**

Abrir en navegador: `https://localhost:7001/swagger`

---

## 🏗️ Arquitectura

### **Patrón Controller-DAO-Model**

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENT (Frontend)                      │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP/REST
                      │ JWT Token
┌─────────────────────▼───────────────────────────────────┐
│                 CONTROLLER LAYER                         │
│  ┌──────────────────────────────────────────┐           │
│  │  UserController                          │           │
│  │  - [HttpPost] Create                     │           │
│  │  - [HttpPut] Update                      │           │
│  │  - [HttpDelete] Delete                   │           │
│  │  - [HttpGet] GetById                     │           │
│  └────┬─────────────────────────────────────┘           │
│       │ Validación, Autorización                        │
└───────┼─────────────────────────────────────────────────┘
        │
┌───────▼─────────────────────────────────────────────────┐
│                    DAO LAYER                             │
│  ┌──────────────────────────────────────────┐           │
│  │  IUserRepository (Interface)          │           │
│  │  - Search()                              │           │
│  │  - CreateMultiStep()                     │           │
│  │  - UpdateMultiStep()                     │           │
│  │  - GetAllMenusPermissions()              │           │
│  └────┬─────────────────────────────────────┘           │
│       │                                                  │
│  ┌────▼─────────────────────────────────────┐           │
│  │  SqlServerUserDAO (Implementation)    │           │
│  │  - Business Logic                        │           │
│  │  - Transaction Management                │           │
│  │  - Error Handling                        │           │
│  └────┬─────────────────────────────────────┘           │
│       │                                                  │
└───────┼──────────────────────────────────────────────────┘
        │ ADO.NET / Dapper
        │ Stored Procedures
┌───────▼──────────────────────────────────────────────────┐
│                   DATABASE LAYER                         │
│  ┌──────────────────────────────────────────┐           │
│  │  SQL Server                              │           │
│  │  - Tables                                │           │
│  │  - Stored Procedures                     │           │
│  │  - Views                                 │           │
│  │  - Functions                             │           │
│  └──────────────────────────────────────────┘           │
└──────────────────────────────────────────────────────────┘
```

### **Factory Pattern**

```csharp
// Obtener instancia del DAO
var factory = RepositoryFactory.GetInstanceSqlServer(configuration);
var usuarioDao = factory.GetUserRepository();

// Usar el DAO
var response = await usuarioDao.Search(usuario, log);
```

### **Dependency Injection**

```csharp
// Program.cs
builder.Services.AddScoped<LogHelper>();
builder.Services.AddScoped<IConfiguration>(sp => configuration);

// Controller
public UserController(LogHelper logHelper, IConfiguration configuration)
{
    clsLogHelper = logHelper;
    iUsuarioDao = RepositoryFactory
        .GetInstanceSqlServer(configuration)
        .GetUserRepository();
}
```

---

## 🎯 Patrones de Desarrollo

### **1. Crear un Controller**

```csharp
// Controllers/EntityController.cs
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EntityController : BaseController
{
    private readonly IEntityRepository iEntityDao;
    private readonly LogHelper clsLogHelper;

    public EntityController(LogHelper logHelper, IConfiguration configuration)
    {
        clsLogHelper = logHelper;
        iEntityDao = RepositoryFactory
            .GetInstanceSqlServer(configuration)
            .GetEntityRepository();
    }

    [HttpPost("buscar")]
    public async Task<ActionResult<OperationResponse>> Search(
        [FromBody] Entity entity)
    {
        try
        {
            var log = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);
            var response = await iEntityDao.Search(entity, log);
            return FromOperationResponse<OperationResponse>(response);
        }
        catch (Exception ex)
        {
            return HandleException<OperationResponse>(ex);
        }
    }
}
```

### **2. Crear un DAO**

```csharp
// DataAccessObject/Abstraction/IEntityRepository.cs
public interface IEntityRepository
{
    Task<OperationResponse> Search(Entity entity, Log log);
    Task<OperationResponse> Create(Entity entity, Log log);
    Task<OperationResponse> Update(Entity entity, Log log);
    Task<OperationResponse> Delete(Entity entity, Log log);
}

// DataAccessObject/Database/SqlServer/SqlServerEntityDAO.cs
public class SqlServerEntityDAO : IEntityRepository
{
    private readonly string connectionString;

    public SqlServerEntityDAO(string connectionString)
    {
        this.connectionString = connectionString;
    }

    public async Task<OperationResponse> Search(Entity entity, Log log)
    {
        using var connection = new SqlConnection(connectionString);
        var parameters = new DynamicParameters();
        parameters.Add("@P_ENT_COD", entity.EntCod);
        
        var result = await connection.QueryAsync<Entity>(
            "SP_SEARCH_ENTITY",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        return new OperationResponse
        {
            Code = "200",
            Message = "Success",
            Data = result.ToList()
        };
    }
}
```

### **3. Crear un Model**

```csharp
// Models/Entity.cs
public class Entity
{
    // Primary Key
    public string EntCod { get; set; } = string.Empty;
    
    // Properties
    public string EntNam { get; set; } = string.Empty;
    public string EntDes { get; set; } = string.Empty;
    
    // Audit Fields
    public int? RecSta { get; set; }
    public string? RecUsrCre { get; set; }
    public DateTime? RecDatCre { get; set; }
    public string? RecUsrMod { get; set; }
    public DateTime? RecDatMod { get; set; }
}
```

### **4. Usar Helper**

```csharp
// Generar JWT
var token = SecurityHelper.GenerateToken(usuario);

// Validar contraseña
var isValid = PasswordHelper.VerifyPassword(inputPassword, hashedPassword);

// Hash de contraseña
var hashed = PasswordHelper.HashPassword(password);

// Generar contraseña aleatoria
var randomPassword = PasswordHelper.GenerateRandomPassword();

// Enviar email
await EmailService.SendEmailAsync(to, subject, body);

// Gestión de archivos
var filePath = FileStorageHelper.SaveFile(file, "uploads/users");
```

---

## 📚 Guías

### **Implementar Autenticación en Endpoint**

```csharp
// Requiere autenticación
[Authorize]
public class MyController : BaseController { }

// Requiere rol específico
[Authorize(Roles = "Admin")]
[HttpDelete("{id}")]
public async Task<ActionResult> Delete(string id) { }

// Permitir anónimo
[AllowAnonymous]
[HttpPost("login")]
public async Task<ActionResult> Login() { }
```

### **Manejo de Transacciones**

```csharp
using var connection = new SqlConnection(connectionString);
connection.Open();
using var transaction = connection.BeginTransaction();

try
{
    // Operación 1
    await connection.ExecuteAsync(sql1, param1, transaction);
    
    // Operación 2
    await connection.ExecuteAsync(sql2, param2, transaction);
    
    transaction.Commit();
    return Success("Operación exitosa");
}
catch (Exception ex)
{
    transaction.Rollback();
    throw;
}
```

### **Logging de Operaciones**

```csharp
// Crear log desde token JWT
var log = await clsLogHelper.CreateLogFromTokenAsync(HttpContext);

// Log contiene:
// - LogUseCod: Código de usuario
// - LogUseYea: Año del usuario
// - LogDat: Fecha/hora de operación
// - LogIp: IP del cliente
```

### **Validación de Datos**

```csharp
// En Controller
if (string.IsNullOrEmpty(entity.EntNam))
{
    return BadRequest("El nombre es requerido");
}

// En DAO
if (entity.EntCod == null)
{
    return new OperationResponse
    {
        Code = "400",
        Message = "Código requerido"
    };
}
```

---

## 🌐 API Endpoints

### **Authentication**

```
POST   /api/authentication/login
POST   /api/authentication/refresh-token
POST   /api/authentication/logout
GET    /api/authentication/validate-token
```

### **Users**

```
POST   /api/user/buscar
POST   /api/user
POST   /api/user/multistep
PUT    /api/user
DELETE /api/user/{year}/{code}
POST   /api/user/menus-permisos-disponibles
```

### **Positions**

```
POST   /api/position/buscar
POST   /api/position
PUT    /api/position
DELETE /api/position/{code}
```

### **Repositories**

```
POST   /api/repository/buscar
POST   /api/repository
PUT    /api/repository
DELETE /api/repository/{code}
```

### **Identity Documents**

```
POST   /api/identitydocument/buscar
POST   /api/identitydocument
PUT    /api/identitydocument
DELETE /api/identitydocument/{code}
```

### **Roles**

```
POST   /api/rol/buscar
POST   /api/rol/multistep
PUT    /api/rol/multistep
DELETE /api/rol/{code}
POST   /api/rol/menus-permisos-disponibles
```

### **Forms**

```
POST   /api/form/buscar
POST   /api/form
PUT    /api/form
DELETE /api/form/{code}
GET    /api/form/{code}
```

---

## ⚙️ Configuración

### **appsettings.json**

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=SaaSTemplateDB;..."
  },
  "Jwt": {
    "SecretKey": "your-super-secret-key-min-32-chars",
    "Issuer": "saas-template",
    "Audience": "saas-template-users",
    "ExpirationMinutes": 60,
    "RefreshExpirationDays": 7
  },
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:5173",
      "https://localhost:5173"
    ]
  },
  "FileStorage": {
    "BasePath": "C:\\FileStorage",
    "MaxFileSizeMB": 100,
    "AllowedExtensions": [".pdf", ".jpg", ".png", ".docx", ".xlsx"]
  },
  "Email": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "FromEmail": "noreply@saas-template.com",
    "FromName": "SaaS Template"
  }
}
```

### **Program.cs**

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]))
        };
    });

// Helpers
builder.Services.AddScoped<LogHelper>();

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

---

## 🔒 Seguridad

### **JWT Configuration**

```csharp
// Generar token
var token = SecurityHelper.GenerateToken(usuario, keepSession: false);

// Token contiene:
// - UseCod: Código de usuario
// - UseYea: Año del usuario
// - Roles: Lista de roles
// - Permissions: Permisos del usuario
// - Expiration: 60 minutos (configurable)
```

### **Password Security**

```csharp
// Validar seguridad
if (!PasswordHelper.IsPasswordSecure(password))
{
    return Warning("La contraseña debe tener al menos 8 caracteres");
}

// Hash con BCrypt
var hashedPassword = PasswordHelper.HashPassword(password);

// Verificar
var isValid = PasswordHelper.VerifyPassword(inputPassword, hashedPassword);
```

### **CORS**

```csharp
// Configurar orígenes permitidos
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "https://production-url.com"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});
```

### **SQL Injection Protection**

```csharp
// ✅ CORRECTO: Usar parámetros
var parameters = new DynamicParameters();
parameters.Add("@P_USER_NAME", userName);
var result = await connection.QueryAsync<User>(
    "SP_SEARCH_USER",
    parameters,
    commandType: CommandType.StoredProcedure
);

// ❌ INCORRECTO: Concatenar strings
var sql = $"SELECT * FROM Users WHERE UserName = '{userName}'";
```

---

## 🧪 Testing

### **Unit Tests**

```csharp
// Example: UserControllerTests.cs
[Fact]
public async Task Create_ValidUser_ReturnsSuccess()
{
    // Arrange
    var user = new Usuario { UseNam = "Test User" };
    
    // Act
    var result = await controller.Create(user);
    
    // Assert
    Assert.IsType<OkObjectResult>(result.Result);
}
```

### **Integration Tests**

```csharp
// Example: UserIntegrationTests.cs
public class UserIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public UserIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsToken()
    {
        // Test implementation
    }
}
```

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
dotnet run                    # Ejecutar aplicación
dotnet watch run              # Hot reload

# Build
dotnet build                  # Compilar
dotnet build -c Release       # Compilar para producción
dotnet publish -c Release     # Publicar

# Testing
dotnet test                   # Ejecutar tests
dotnet test --collect:"XPlat Code Coverage"  # Con coverage

# Database
dotnet ef migrations add      # Crear migración (si usa EF)
dotnet ef database update     # Aplicar migraciones

# Limpieza
dotnet clean                  # Limpiar build
```

---

## 🐛 Debugging

### **Visual Studio**

- F5: Iniciar con debugging
- F10: Step over
- F11: Step into
- Breakpoints: Click en margen izquierdo

### **VS Code**

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": ".NET Core Launch (web)",
      "type": "coreclr",
      "request": "launch",
      "preLaunchTask": "build",
      "program": "${workspaceFolder}/bin/Debug/net8.0/saas-template.server.dll",
      "args": [],
      "cwd": "${workspaceFolder}",
      "stopAtEntry": false,
      "serverReadyAction": {
        "action": "openExternally",
        "pattern": "\\bNow listening on:\\s+(https?://\\S+)"
      },
      "env": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  ]
}
```

### **Logging**

```csharp
// En Controller
_logger.LogInformation("User {UserId} logged in", userId);
_logger.LogWarning("Invalid login attempt for {Username}", username);
_logger.LogError(ex, "Error creating user");
```

---

## 📦 Dependencias

```xml
<ItemGroup>
  <!-- ASP.NET Core -->
  <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="8.0.0" />
  
  <!-- Authentication -->
  <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
  <PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="7.0.0" />
  
  <!-- Data Access -->
  <PackageReference Include="Dapper" Version="2.1.28" />
  <PackageReference Include="System.Data.SqlClient" Version="4.8.6" />
  
  <!-- Security -->
  <PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
  
  <!-- Utilities -->
  <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
  
  <!-- Swagger -->
  <PackageReference Include="Swashbuckle.AspNetCore" Version="6.5.0" />
</ItemGroup>
```

---

## 🚀 Deployment

### **Publicar para IIS**

```bash
dotnet publish -c Release -o ./publish

# Copiar carpeta publish a servidor IIS
# Configurar Application Pool (.NET 8.0, No Managed Code)
# Configurar bindings (puerto, SSL, etc.)
```

### **Docker**

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["saas-template.server.csproj", "./"]
RUN dotnet restore
COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "saas-template.server.dll"]
```

---

## 📞 Soporte

- **Issues**: Ver README principal
- **Documentación**: `../docs/` en raíz del proyecto
- **Swagger**: `https://localhost:7001/swagger`

---

## 🗺️ Roadmap

### **Próximas Mejoras**

- [ ] Tests unitarios completos
- [ ] Refresh token automático
- [ ] Rate limiting
- [ ] API versioning
- [ ] Health checks
- [ ] Metrics y monitoring
- [ ] GraphQL endpoint

---

<div align="center">

**Parte del Enterprise Application Template**

[⬅️ Volver al README principal](../README.md)

</div>
