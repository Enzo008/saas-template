// *****************************************************************************************************
// Description       : Model representing a navigation menu item
// Created by        : Enzo Gago Aguirre
// Creation Date     : 10/02/2025
// Purpose           : Stores information about navigation menu items
// *****************************************************************************************************

using saas_template.server.Models.Base;

namespace saas_template.server.Models
{
    /// <summary>
    /// Represents a navigation menu item in the system
    /// </summary>
    public class Menu : AuditableEntity
    {
        /// <summary>
        /// Menu registration year
        /// </summary>
        public string? MenYea { get; set; }

        /// <summary>
        /// Unique menu item code
        /// </summary>
        public string? MenCod { get; set; }

        /// <summary>
        /// Parent menu registration year
        /// </summary>
        public string? MenYeaPar { get; set; }

        /// <summary>
        /// Parent menu item code
        /// </summary>
        public string? MenCodPar { get; set; }

        /// <summary>
        /// Menu item name or title
        /// </summary>
        public string? MenNam { get; set; }

        /// <summary>
        /// Menu item reference or route
        /// </summary>
        public string? MenRef { get; set; }

        /// <summary>
        /// Icon associated with menu item
        /// </summary>
        public string? MenIco { get; set; }

        /// <summary>
        /// Indicates if menu has active permissions
        /// </summary>
        public bool? HasActive { get; set; }

        /// <summary>
        /// Permissions assigned to the menu
        /// </summary>
        public List<Permiso>? Permissions { get; set; }
    }
}
