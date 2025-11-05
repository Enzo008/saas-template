// *****************************************************************************************************
// Description       : Model representing a dynamic master form
// Created by        : Enzo Gago Aguirre
// Creation Date     : 10/02/2025
// Purpose           : Stores information about dynamic forms
// *****************************************************************************************************

using saas_template.server.Models.Base;

namespace saas_template.server.Models
{
    /// <summary>
    /// Represents a dynamic master form in the system
    /// </summary>
    public class FormMaster : AuditableEntity
    {
        /// <summary>
        /// Form year
        /// </summary>
        public string? ForMasYea { get; set; }
        
        /// <summary>
        /// Form code
        /// </summary>
        public string? ForMasCod { get; set; }

        /// <summary>
        /// Form name
        /// </summary>
        public string? ForMasNam { get; set; }

        /// <summary>
        /// Form description
        /// </summary>
        public string? ForMasDes { get; set; }

        /// <summary>
        /// Form type
        /// </summary>
        public string? ForMasTyp { get; set; }

        /// <summary>
        /// Status (A=Active, I=Inactive)
        /// </summary>
        public string? ForMasSta { get; set; }

        /// <summary>
        /// Allows multiple responses
        /// </summary>
        public bool? ForMasMul { get; set; }

        /// <summary>
        /// Start date of validity
        /// </summary>
        public string? ForMasDatSta { get; set; }

        /// <summary>
        /// End date of validity
        /// </summary>
        public string? ForMasDatEnd { get; set; }

        /// <summary>
        /// Display order
        /// </summary>
        public int? ForMasOrd { get; set; }

        /// <summary>
        /// List of form fields
        /// </summary>
        public List<FormField>? Fields { get; set; }

        /// <summary>
        /// Page number for pagination
        /// </summary>
        public int? PageNumber { get; set; }

        /// <summary>
        /// Page size for pagination
        /// </summary>
        public int? PageSize { get; set; }

        /// <summary>
        /// Default constructor
        /// </summary>
        public FormMaster()
        {
            Fields = new List<FormField>();
        }
    }
}
