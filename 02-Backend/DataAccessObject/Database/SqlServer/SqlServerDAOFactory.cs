// *****************************************************************************************************
// Descripción       : Clase que define la fábrica de base de datos SQLServer
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 10/02/2025
// Acción a Realizar : Crear una instancia de la fábrica de base de datos SQLServer
// *****************************************************************************************************

// Modelos
using saas_template.server.DataAccessObject.Abstraction;
using saas_template.server.DataAccessObject.Core;

namespace saas_template.server.DataAccessObject.Database.SqlServer
{
    public class SqlServerDAOFactory : RepositoryFactory
    {
        // Declaración de variables
        private readonly string strCadenaConexion;
        private readonly SqlServerLogDAO clsLogDao;

        // Constructor
        public SqlServerDAOFactory(string strConexion)
        {
            strCadenaConexion = strConexion;
            clsLogDao = new SqlServerLogDAO();
        }

        // Métodos
        public override IPositionRepository GetPositionRepository()
        {
            return new SqlServerPositionDAO(strCadenaConexion, clsLogDao);
        }
        public override IFormRepository GetFormRepository()
        {
            return new SqlServerFormDAO(strCadenaConexion, clsLogDao);
        }
        public override IRoleRepository GetRoleRepository()
        {
            return new SqlServerRoleDAO(strCadenaConexion, clsLogDao);
        }
        public override IGenderRepository GetGenderRepository()
        {
            return new SqlServerGenderDAO(strCadenaConexion, clsLogDao);
        }
        public override IIdentityDocumentRepository GetIdentityDocumentRepository()
        {
            return new SqlServerIdentityDocumentDAO(strCadenaConexion, clsLogDao);
        }
        public override INationalityRepository GetNationalityRepository()
        {
            return new SqlServerNationalityDAO(strCadenaConexion, clsLogDao);
        }
        public override ILocationRepository GetLocationRepository()
        {
            return new SqlServerLocationDAO(strCadenaConexion, clsLogDao);
        }
        public override IUserRepository GetUserRepository()
        {
            return new SqlServerUserDAO(strCadenaConexion, clsLogDao);
        }
        public override ILogRepository GetLogRepository()
        {
            return new SqlServerLogDAO();
        }
        public override IAuthenticationRepository GetAuthenticationRepository()
        {
            return new SqlServerAuthenticationDAO(strCadenaConexion, clsLogDao);
        }
        public override IFileStorageRepository GetFileStorageRepository()
        {
            return new SqlServerFileStorageDAO(strCadenaConexion, clsLogDao);
        }
        public override IRepositoryRepository GetRepositoryRepository()
        {
            return new SqlServerRepositoryDAO(strCadenaConexion, clsLogDao);
        }
    }
}