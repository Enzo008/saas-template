// *****************************************************************************************************
// Description       : Interface IFormRepository (Form Repository)
// Created by        : Enzo Gago Aguirre
// Creation Date     : 10/02/2025
// Action            : Search, Create, Update and Delete Forms
// *****************************************************************************************************

using saas_template.server.Models;
using Helper;

namespace saas_template.server.DataAccessObject.Abstraction
{
    public interface IFormRepository
    {
        Task<OperationResponse> Search(FormMaster form, Log log);
        Task<OperationResponse> Create(FormMaster form, Log log);
        Task<OperationResponse> Update(FormMaster form, Log log);
        Task<OperationResponse> Delete(FormMaster form, Log log);
    }
}
