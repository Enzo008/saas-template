// *****************************************************************************************************
// Description       : Model representing a position in the system
// Created by        : Enzo Gago Aguirre
// Creation Date     : 10/02/2025
// Purpose           : Stores information about available positions
// *****************************************************************************************************

using saas_template.server.Models.Base;

namespace saas_template.server.Models
{
    /// <summary>
    /// Represents a position in the system
    /// </summary>
    public class Position : AuditableEntity
    {
        /// <summary>
        /// Unique position code
        /// </summary>
        public string? PosCod { get; set; }

        /// <summary>
        /// Position name or description
        /// </summary>
        public string? PosNam { get; set; }

        /// <summary>
        /// Page number for pagination
        /// </summary>
        public int? PageNumber { get; set; }

        /// <summary>
        /// Page size for pagination
        /// </summary>
        public int? PageSize { get; set; }
    }
}

