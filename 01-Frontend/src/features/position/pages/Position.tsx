/**
 * Página principal de cargos - tabla con paginación + modal CRUD con traducción
 * Implementa guards de permisos para controlar acceso a acciones CRUD
 */
import React from 'react';
import { FormModal, Table } from '@/shared/components';
import { useStandardTable, useStandardModal } from '@/shared/hooks';
import { usePositionTableData } from '../hooks/usePositionTableData';
import { positionFormFields } from '../config/formFields';
import { usePositionCrud } from '../hooks/usePositionCrud';
import { useMenuPermissions } from '@/auth/hooks';

const Position = React.memo(() => {
    // Hook de permisos para el menú 'position'
    const { canCreate, canUpdate, canDelete } = useMenuPermissions();
    const menuRef = 'position';
    
    // Hooks CRUD y tabla
    const crudHook = usePositionCrud({ mode: 'modal' });
    const tableHook = usePositionTableData({
        onEdit: crudHook.openEditModal,
        onDelete: crudHook.deleteItem,
        // Pasar permisos al hook de tabla para controlar acciones
        canUpdate: canUpdate(menuRef),
        canDelete: canDelete(menuRef)
    });

    // Hooks utilitarios (eliminan código repetitivo)
    const tableProps = useStandardTable(crudHook, tableHook);
    const modalProps = useStandardModal(crudHook, positionFormFields(), ['Position', 'Position']);

    return (
        <>
            <Table
                {...tableProps}
                // Solo mostrar botón "Nuevo" si tiene permiso de crear
                {...(canCreate(menuRef) && { onNew: crudHook.openCreateModal })}
            />

            <FormModal {...modalProps} />
        </>
    );
});

export default Position;
