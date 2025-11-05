// *****************************************************************************************************
// Description       : Model representing a dynamic form field
// Created by        : Enzo Gago Aguirre
// Creation Date     : 10/02/2025
// Purpose           : Stores information about form fields
// *****************************************************************************************************

using saas_template.server.Models.Base;

namespace saas_template.server.Models
{
    /// <summary>
    /// Represents a dynamic form field in the system
    /// </summary>
    public class FormField : AuditableEntity
    {
        /// <summary>
        /// Form year (FK)
        /// </summary>
        public string? ForMasYea { get; set; }

        /// <summary>
        /// Form code (FK)
        /// </summary>
        public string? ForMasCod { get; set; }

        /// <summary>
        /// Field year
        /// </summary>
        public string? ForFieYea { get; set; }

        /// <summary>
        /// Field code
        /// </summary>
        public string? ForFieCod { get; set; }

        /// <summary>
        /// Field name
        /// </summary>
        public string? ForFieNam { get; set; }

        /// <summary>
        /// Label to display in UI
        /// </summary>
        public string? ForFieLab { get; set; }

        /// <summary>
        /// Field type (TEXT, SELECT, RADIO, etc.)
        /// </summary>
        public string? ForFieTyp { get; set; }

        /// <summary>
        /// Required field (false=No, true=Yes)
        /// </summary>
        public bool? ForFieReq { get; set; }

        /// <summary>
        /// Field order in form
        /// </summary>
        public int? ForFieOrd { get; set; }

        /// <summary>
        /// Options for SELECT/RADIO (JSON)
        /// </summary>
        public string? ForFieOpt { get; set; }

        /// <summary>
        /// Default value
        /// </summary>
        public string? ForFieVal { get; set; }

        /// <summary>
        /// Placeholder to display
        /// </summary>
        public string? ForFiePla { get; set; }

        /// <summary>
        /// Help/description text
        /// </summary>
        public string? ForFieHel { get; set; }

        /// <summary>
        /// Column width (1-12, grid system)
        /// </summary>
        public int? ForFieCol { get; set; }

        /// <summary>
        /// Minimum value/length
        /// </summary>
        public int? ForFieMin { get; set; }

        /// <summary>
        /// Maximum value/length
        /// </summary>
        public int? ForFieMax { get; set; }

        /// <summary>
        /// Validation pattern (regex)
        /// </summary>
        public string? ForFiePat { get; set; }

        /// <summary>
        /// Custom error message
        /// </summary>
        public string? ForFieErr { get; set; }

        /// <summary>
        /// Status (A=Active, I=Inactive)
        /// </summary>
        public string? ForFieSta { get; set; }

        /// <summary>
        /// Visible in form
        /// </summary>
        public bool? ForFieVis { get; set; }

        /// <summary>
        /// Editable by user
        /// </summary>
        public bool? ForFieEdi { get; set; }
    }
}
