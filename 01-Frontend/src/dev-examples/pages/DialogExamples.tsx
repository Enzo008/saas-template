import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { 
  useConfirmationDialog, 
  useInfoDialog, 
  useMultiOptionDialog, 
  useFormDialog 
} from '@/shared/components/overlays/dialogs';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useForm } from 'react-hook-form';

export default function DialogExamples() {
    const { confirm } = useConfirmationDialog();
    const { showInfo } = useInfoDialog();
    const { showOptions } = useMultiOptionDialog();
    const { showForm } = useFormDialog();
    
    // Ejemplo de formulario simple para el FormDialog
    const ExampleForm = () => {
        const { register } = useForm();
        
        return (
        <div className="space-y-4">
            <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" {...register('name')} />
            </div>
            <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            </div>
        </div>
        );
    };

    // Manejadores para los ejemplos
    const handleConfirmationClick = () => {
        confirm(
        '¿Estás seguro?',
        'Esta acción no se puede deshacer.',
        () => {
            console.log('Acción confirmada');
        },
        {
            confirmLabel: 'Sí, continuar',
            cancelLabel: 'No, cancelar',
            variant: 'destructive'
        }
        );
    };

    const handleInfoClick = () => {
        showInfo(
        'Información importante',
        <div className="space-y-2">
            <p>Este es un ejemplo de diálogo informativo.</p>
            <p>Puedes incluir cualquier contenido React aquí.</p>
        </div>,
        {
            closeLabel: 'Entendido'
        }
        );
    };

    const handleMultiOptionClick = () => {
        showOptions(
        'Selecciona una opción',
        '¿Qué acción deseas realizar?',
        [
            {
            label: 'Editar',
            value: 'edit',
            onClick: () => console.log('Editar seleccionado'),
            variant: 'default'
            },
            {
            label: 'Duplicar',
            value: 'duplicate',
            onClick: () => console.log('Duplicar seleccionado'),
            variant: 'secondary'
            },
            {
            label: 'Eliminar',
            value: 'delete',
            onClick: () => console.log('Eliminar seleccionado'),
            variant: 'destructive'
            }
        ]
        );
    };

    const handleFormClick = () => {
        showForm(
        'Formulario de ejemplo',
        <ExampleForm />,
        () => {
            console.log('Formulario enviado');
        },
        {
            submitLabel: 'Guardar',
            cancelLabel: 'Cancelar'
        }
        );
    };

    return (
        <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Ejemplos de Diálogos</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ejemplo de ConfirmationDialog */}
            <Card>
            <CardHeader>
                <CardTitle>Diálogo de Confirmación</CardTitle>
                <CardDescription>
                Utiliza este diálogo para confirmar acciones importantes o potencialmente destructivas.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleConfirmationClick}>Mostrar diálogo de confirmación</Button>
            </CardContent>
            </Card>

            {/* Ejemplo de InfoDialog */}
            <Card>
            <CardHeader>
                <CardTitle>Diálogo de Información</CardTitle>
                <CardDescription>
                Utiliza este diálogo para mostrar información importante al usuario.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleInfoClick} variant="secondary">Mostrar diálogo de información</Button>
            </CardContent>
            </Card>

            {/* Ejemplo de MultiOptionDialog */}
            <Card>
            <CardHeader>
                <CardTitle>Diálogo de Múltiples Opciones</CardTitle>
                <CardDescription>
                Utiliza este diálogo cuando el usuario debe elegir entre varias acciones.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleMultiOptionClick} variant="outline">Mostrar diálogo de opciones</Button>
            </CardContent>
            </Card>

            {/* Ejemplo de FormDialog */}
            <Card>
            <CardHeader>
                <CardTitle>Diálogo de Formulario</CardTitle>
                <CardDescription>
                Utiliza este diálogo para recopilar información del usuario mediante un formulario.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleFormClick}>Mostrar diálogo de formulario</Button>
            </CardContent>
            </Card>
        </div>
        </div>
    );
};