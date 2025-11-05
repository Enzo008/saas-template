// *****************************************************************************************************
// Description       : Model representing a gender in the system
// Created by        : Enzo Gago Aguirre
// Creation Date     : 27/06/2025
// Purpose           : Stores information about available genders
// *****************************************************************************************************

using saas_template.server.Models.Base;

namespace saas_template.server.Models
{
    /// <summary>
    /// Represents a gender in the system
    /// </summary>
    public class Gender : AuditableEntity
    {
        /// <summary>
        /// Unique gender code
        /// </summary>
        public string? GenCod { get; set; }

        /// <summary>
        /// Gender name or description
        /// </summary>
        public string? GenNam { get; set; }
    }
}
