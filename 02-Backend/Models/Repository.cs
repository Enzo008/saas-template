// *****************************************************************************************************
// Description       : Model representing a repository in the system
// Created by        : Enzo Gago Aguirre
// Creation Date     : 27/06/2025
// Purpose           : Stores information about available repositories
// *****************************************************************************************************

using saas_template.server.Models.Base;

namespace saas_template.server.Models
{
    /// <summary>
    /// Represents a repository in the system
    /// </summary>
    public class Repository : AuditableEntity
    {
        /// <summary>
        /// Repository year
        /// </summary>
        public string? RepYea { get; set; }

        /// <summary>
        /// Unique repository code
        /// </summary>
        public string? RepCod { get; set; }

        /// <summary>
        /// Location year
        /// </summary>
        public string? LocYea { get; set; }

        /// <summary>
        /// Unique location code
        /// </summary>
        public string? LocCod { get; set; }

        /// <summary>
        /// Location name
        /// </summary>
        public string? LocNam { get; set; }

        /// <summary>
        /// Repository name or description
        /// </summary>
        public string? RepNam { get; set; }
    }
}
