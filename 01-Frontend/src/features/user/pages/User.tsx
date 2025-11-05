/**
 * Página principal para la gestión de usuarios
 */
import { Table } from '@/shared/components';
import { useStandardTable, useSecureNavigate } from '@/shared/hooks';
import { useUserCrud } from '../hooks/useUserCrud';
import { useUserTableData } from '../hooks/useUserTableData';

export default function User() {
    const navigate = useSecureNavigate();

    // Hooks CRUD y tabla
    const crudHook = useUserCrud({ mode: 'table' });
    const tableHook = useUserTableData({
        onEdit: (user) => {
            const id = `${user.useYea}-${user.useCod}`;
            navigate(`/user/edit/${id}`);
        },
        onDelete: crudHook.deleteItem
    });

    // Hook utilitario para tabla (elimina código repetitivo)
    const tableProps = useStandardTable(crudHook, tableHook);

    const handleCreate = () => {
        navigate('/user/create');
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
