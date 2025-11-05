/**
 * Página principal para la gestión de formularios dinámicos
 */
import { Table } from '@/shared/components';
import { useStandardTable, useSecureNavigate } from '@/shared/hooks';
import { useFormCrud } from '../hooks/useFormCrud';
import { useFormTableData } from '../hooks/useFormTableData';
import type { Form } from '../types';

export default function FormPage() {
    const navigate = useSecureNavigate();

    // Hooks CRUD y tabla
    const crudHook = useFormCrud({ mode: 'table' });
    const tableHook = useFormTableData({
        onEdit: (form: Form) => {
            const formId = `${form.forMasYea}-${form.forMasCod}`;
            navigate(`/form/edit/${formId}`);
        },
        onDelete: crudHook.deleteItem
    });

    // Hook utilitario para tabla (elimina código repetitivo)
    const tableProps = useStandardTable(crudHook, tableHook);

    // Acciones personalizadas para navegación
    const handleCreate = () => {
        navigate('/form/create'); // No se encripta (no tiene ID)
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
