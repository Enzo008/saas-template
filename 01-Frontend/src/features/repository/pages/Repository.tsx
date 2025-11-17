/**
 * Página principal de repositorio - tabla con paginación + modal CRUD
 */
import React from 'react';
import { FormModal, Table } from '@/shared/components';
import { useStandardTable, useStandardModal } from '@/shared/hooks';
import { repositoryFormFields } from '../config/formFields';
import { useRepositoryTableData } from '../hooks/useRepositoryTableData';
import { useRepositoryCrud } from '../hooks/useRepositoryCrud';

const Repository = React.memo(() => {

    // Hooks CRUD y tabla
    const crudHook = useRepositoryCrud({ mode: 'modal' });
    const tableHook = useRepositoryTableData({
        onEdit: crudHook.openEditModal,
        onDelete: crudHook.deleteItem
    });

    // Hooks utilitarios (eliminan código repetitivo)
    const tableProps = useStandardTable(crudHook, tableHook);
    const modalProps = useStandardModal(crudHook, repositoryFormFields(), ['Repositorio', 'Repository']);

    return (
        <>
            <Table
                {...tableProps}
                onNew={crudHook.openCreateModal}
            />

            <FormModal {...modalProps} />
        </>
    );
});

export default Repository;
