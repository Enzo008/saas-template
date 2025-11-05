// *****************************************************************************************************
// Description       : Model representing a permission in the system
// Created by        : Enzo Gago Aguirre
// Creation Date     : 10/02/2025
// Purpose           : Stores information about available permissions
// *****************************************************************************************************

using System.ComponentModel.DataAnnotations;
using saas_template.server.Models.Base;

namespace saas_template.server.Models
{
    /// <summary>
    /// Represents a permission in the system
    /// </summary>
    public class Permiso : AuditableEntity
    {
        /// <summary>
        /// Unique permission code
        /// </summary>
        [Key]
        public string? PerCod { get; set; }

        /// <summary>
        /// Permission name or description
        /// </summary>
        public string? PerNam { get; set; }

        /// <summary>
        /// Reference or route associated with permission
        /// </summary>
        public string? PerRef { get; set; }

        /// <summary>
        /// Indicates if permission is active
        /// </summary>
        public bool? HasActive { get; set; }
    }
}
