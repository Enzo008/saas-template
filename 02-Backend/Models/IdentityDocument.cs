// *****************************************************************************************************
// Description       : Model representing an identity document in the system
// Created by        : Enzo Gago Aguirre
// Creation Date     : 27/06/2025
// Purpose           : Stores information about available identity documents
// *****************************************************************************************************

using saas_template.server.Models.Base;

namespace saas_template.server.Models
{
    /// <summary>
    /// Represents an identity document in the system
    /// </summary>
    public class IdentityDocument : AuditableEntity
    {
        /// <summary>
        /// Unique identity document code (3 chars per word: Ide-Doc-Cod)
        /// </summary>
        public string? IdeDocCod { get; set; }

        /// <summary>
        /// Identity document name or description (3 chars per word: Ide-Doc-Nam)
        /// </summary>
        public string? IdeDocNam { get; set; }

        /// <summary>
        /// Identity document abbreviation (3 chars per word: Ide-Doc-Abr)
        /// </summary>
        public string? IdeDocAbr { get; set; }
    }
}
