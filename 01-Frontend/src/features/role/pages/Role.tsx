/**
 * Página principal para la gestión de roles
 */
import { Table } from '@/shared/components';
import { useStandardTable, useSecureNavigate } from '@/shared/hooks';
import { useRoleCrud } from '../hooks/useRoleCrud';
import { useRoleTableData } from '../hooks/useRoleTableData';

export default function Role() {
    const navigate = useSecureNavigate();

    // Hooks CRUD y tabla
    const crudHook = useRoleCrud({ mode: 'table' });
    const tableHook = useRoleTableData({
        onEdit: (role) => {
            const id = role.rolCod;
            navigate(`/role/edit/${id}`);
        },
        onDelete: crudHook.deleteItem
    });

    // Hook utilitario para tabla (elimina código repetitivo)
    const tableProps = useStandardTable(crudHook, tableHook);

    // Acciones personalizadas para navegación
    const handleCreate = () => {
        navigate('/role/create'); // No se encripta (no tiene ID)
    };

    return (
        <>
            <Table
                {...tableProps}
                onNew={handleCreate}
            />
        </>
    );
}
