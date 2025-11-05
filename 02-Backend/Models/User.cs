// *****************************************************************************************************
// Description       : Model representing a system user
// Created by        : Enzo Gago Aguirre
// Creation Date     : 10/02/2025
// Purpose           : Stores personal and access information of a user
// *****************************************************************************************************

using saas_template.server.Models.Base;

namespace saas_template.server.Models
{
    /// <summary>
    /// Represents a system user with personal and access information
    /// </summary>
    public class User : AuditableEntity
    {
        /// <summary>
        /// User registration year
        /// </summary>
        public string? UseYea { get; set; }

        /// <summary>
        /// Unique user code
        /// </summary>
        public string? UseCod { get; set; }

        /// <summary>
        /// Identity document type code
        /// </summary>
        public string? IdeDocCod { get; set; }

        /// <summary>
        /// Identity document type name
        /// </summary>
        public string? IdeDocNam { get; set; }

        /// <summary>
        /// Identity document type abbreviation
        /// </summary>
        public string? IdeDocAbr { get; set; }

        /// <summary>
        /// Identity document number
        /// </summary>
        public string? UseNumDoc { get; set; }

        /// <summary>
        /// User first name
        /// </summary>
        public string? UseNam { get; set; }

        /// <summary>
        /// User last name
        /// </summary>
        public string? UseLas { get; set; }

        /// <summary>
        /// User birth date
        /// </summary>
        public string? UseBir { get; set; }

        /// <summary>
        /// User gender
        /// </summary>
        public string? UseSex { get; set; }

        /// <summary>
        /// User email
        /// </summary>
        public string? UseEma { get; set; }

        /// <summary>
        /// Position code
        /// </summary>
        public string? PosCod { get; set; }

        /// <summary>
        /// Position name
        /// </summary>
        public string? PosNam { get; set; }

        /// <summary>
        /// User phone
        /// </summary>
        public string? UsePho { get; set; }

        /// <summary>
        /// Username
        /// </summary>
        public string? UseUse { get; set; }

        /// <summary>
        /// User password
        /// </summary>
        public string? UsePas { get; set; }

        /// <summary>
        /// User IP address
        /// </summary>
        public string? UseIp { get; set; }

        /// <summary>
        /// User status (Active/Inactive)
        /// </summary>
        public char? UseSta { get; set; }

        /// <summary>
        /// Role code
        /// </summary>
        public string? RolCod { get; set; }

        /// <summary>
        /// Role name
        /// </summary>
        public string? RolNam { get; set; }

        /// <summary>
        /// User image
        /// </summary>
        public string? UseImg { get; set; }

        /// <summary>
        /// Location year
        /// </summary>
        public string? LocYea { get; set; }

        /// <summary>
        /// Location code
        /// </summary>
        public string? LocCod { get; set; }

        /// <summary>
        /// Location name
        /// </summary>
        public string? LocNam { get; set; }

        /// <summary>
        /// Repository year
        /// </summary>
        public string? RepYea { get; set; }

        /// <summary>
        /// Repository code
        /// </summary>
        public string? RepCod { get; set; }

        /// <summary>
        /// Repository name
        /// </summary>
        public string? RepNam { get; set; }

        /// <summary>
        /// User session
        /// </summary>
        public string? UseSes { get; set; }

        /// <summary>
        /// IP address
        /// </summary>
        public string? Ip { get; set; }

        /// <summary>
        /// Page number for pagination
        /// </summary>
        public int? PageNumber { get; set; }

        /// <summary>
        /// Page size for pagination
        /// </summary>
        public int? PageSize { get; set; }

        /// <summary>
        /// Total record count
        /// </summary>
        public int? TotalCount { get; set; }

        /// <summary>
        /// Indicates whether to include menus and permissions in the response
        /// </summary>
        public bool? IncludeMenusPermissions { get; set; }

        /// <summary>
        /// Menus assigned to the user
        /// </summary>
        public List<Menu>? Menus { get; set; }
    }
}
