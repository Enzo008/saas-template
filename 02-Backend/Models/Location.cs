// *****************************************************************************************************
// Description       : Model representing a location in the system
// Created by        : Enzo Gago Aguirre
// Creation Date     : 27/06/2025
// Purpose           : Stores information about available locations
// *****************************************************************************************************

using saas_template.server.Models.Base;

namespace saas_template.server.Models
{
    /// <summary>
    /// Represents a location in the system
    /// </summary>
    public class Location : AuditableEntity
    {
        /// <summary>
        /// Location year
        /// </summary>
        public string? LocYea { get; set; }

        /// <summary>
        /// Unique location code
        /// </summary>
        public string? LocCod { get; set; }

        /// <summary>
        /// Location name or description
        /// </summary>
        public string? LocNam { get; set; }

        /// <summary>
        /// Location type
        /// </summary>
        public string? LocTyp { get; set; }

        /// <summary>
        /// Parent location year
        /// </summary>
        public string? LocYeaPar { get; set; }

        /// <summary>
        /// Parent location code
        /// </summary>
        public string? LocCodPar { get; set; }

        /// <summary>
        /// Location latitude
        /// </summary>
        public string? LocLat { get; set; }

        /// <summary>
        /// Location longitude
        /// </summary>
        public string? LocLon { get; set; }

        /// <summary>
        /// Location address
        /// </summary>
        public string? LocAdd { get; set; }

        /// <summary>
        /// Location status
        /// </summary>
        public string? LocSta { get; set; }
    }
}
