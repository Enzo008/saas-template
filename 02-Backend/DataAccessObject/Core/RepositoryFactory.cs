// *****************************************************************************************************
// Descripción       : Clase abstracta que define las diferentes fábricas de conexiones a bases de datos
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 10/02/2025
// Acción a Realizar : Crear conexiones a diferentes bases de datos según el tipo especificado
// *****************************************************************************************************

// Modelos
using saas_template.server.DataAccessObject.Abstraction;
using saas_template.server.DataAccessObject.Database.SqlServer;

namespace saas_template.server.DataAccessObject.Core
{
    public abstract class RepositoryFactory
    {
        // Constantes para tipos de base de datos
        public const string SQLSERVER = "SQLSERVER";
        public const string ORACLE = "ORACLE";
        public const string MYSQL = "MYSQL";
        public const string POSTGRESQL = "POSTGRESQL";
        
        private static RepositoryFactory? clsInstanceSqlServer;
        
        // Método para obtener la instancia de la fábrica de conexiones SQLServer
        public static RepositoryFactory GetInstanceSqlServer(IConfiguration iConfiguration)
        {
            return clsInstanceSqlServer ??= GetRepositoryFactory(SQLSERVER, 
                iConfiguration.GetConnectionString("ConnectionStringSqlServer") ?? "");
        }

        // Método para obtener la fábrica de conexiones
        public static RepositoryFactory GetRepositoryFactory(string strDatabaseType, string strConnectionString)
        {
            return strDatabaseType.ToUpper() switch
            {
                SQLSERVER => new SqlServerDAOFactory(strConnectionString),
                // ORACLE => new OracleDAOFactory(connectionString),
                // MYSQL => new OracleDAOFactory(connectionString),
                // POSTGRESQL => new OracleDAOFactory(connectionString),
                _ => throw new ArgumentException($"Tipo de base de datos no soportado: {strDatabaseType}")
            };
        }

        // Métodos abstractos para obtener repositorios específicos
        public abstract IAuthenticationRepository GetAuthenticationRepository();
        public abstract IPositionRepository GetPositionRepository();
        public abstract IRoleRepository GetRoleRepository();
        public abstract IGenderRepository GetGenderRepository();
        public abstract IRepositoryRepository GetRepositoryRepository();
        public abstract IIdentityDocumentRepository GetIdentityDocumentRepository();
        public abstract INationalityRepository GetNationalityRepository();
        public abstract ILocationRepository GetLocationRepository();
        public abstract IFormRepository GetFormRepository();
        public abstract ILogRepository GetLogRepository();
        public abstract IUserRepository GetUserRepository();
        public abstract IFileStorageRepository GetFileStorageRepository();
        public abstract IPermissionRepository GetPermissionRepository();
    }
}