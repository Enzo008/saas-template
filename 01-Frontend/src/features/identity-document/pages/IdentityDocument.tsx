/**
 * Página principal de documentos de identidad - tabla con paginación + modal CRUD
 */
import React from 'react';
import { FormModal, Table } from '@/shared/components';
import { useStandardTable, useStandardModal } from '@/shared/hooks';
import { useIdentityDocumentTableData } from '../hooks/useIdentityDocumentTableData';
import { identityDocumentFormFields } from '../config/formFields';
import { useIdentityDocumentCrud } from '../hooks/useIdentityDocumentCrud';
import { useMenuPermissions } from '@/auth/hooks';

const IdentityDocument = React.memo(() => {
    const { canCreate, canUpdate, canDelete } = useMenuPermissions();
    const menuRef = 'identity-document';
    
    // Hooks CRUD y tabla
    const crudHook = useIdentityDocumentCrud({ mode: 'modal' });
    const tableHook = useIdentityDocumentTableData({
        onEdit: crudHook.openEditModal,
        onDelete: crudHook.deleteItem,
        // Pasar permisos al hook de tabla para controlar acciones
        canUpdate: canUpdate(menuRef),
        canDelete: canDelete(menuRef)
    });

    // Hooks utilitarios (eliminan código repetitivo)
    const tableProps = useStandardTable(crudHook, tableHook);
    const modalProps = useStandardModal(crudHook, identityDocumentFormFields(), 'Documento de Identidad');

    return (
        <>
            <Table
                {...tableProps}
                {...(canCreate(menuRef) && { onNew: crudHook.openCreateModal })}
            />

            <FormModal {...modalProps} />
        </>
    );
});

export default IdentityDocument;
