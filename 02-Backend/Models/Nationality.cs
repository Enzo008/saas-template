// *****************************************************************************************************
// Description       : Model representing a nationality in the system
// Created by        : Enzo Gago Aguirre
// Creation Date     : 27/06/2025
// Purpose           : Stores information about available nationalities
// *****************************************************************************************************

using saas_template.server.Models.Base;

namespace saas_template.server.Models
{
    /// <summary>
    /// Represents a nationality in the system
    /// </summary>
    public class Nationality : AuditableEntity
    {
        /// <summary>
        /// Unique nationality code
        /// </summary>
        public string? NatCod { get; set; }

        /// <summary>
        /// Nationality name or description
        /// </summary>
        public string? NatNam { get; set; }
    }
}
