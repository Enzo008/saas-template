import { ReactNode } from 'react';
import { RadixDialog } from '../../overlays/dialogs/radix';
import { Button } from '../../ui/button';
import { cn } from '@/lib/utils';

export interface FormDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    children: ReactNode;
    submitLabel?: string;
    cancelLabel?: string;
    onSubmit: () => void;
    onCancel?: () => void;
    isSubmitting?: boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
    submitButtonProps?: {
        variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
        disabled?: boolean;
        className?: string;
    };
}

export const FormDialog = ({
    isOpen,
    onOpenChange,
    title,
    children,
    submitLabel = 'Guardar',
    cancelLabel = 'Cancelar',
    onSubmit,
    onCancel,
    isSubmitting = false,
    maxWidth = 'md',
    submitButtonProps
}: FormDialogProps) => {
    // Ya no necesitamos handleClose porque RadixDialog maneja esto internamente

    const handleCancel = () => {
        if (!isSubmitting) {
            onOpenChange(false);
            onCancel?.();
        }
    };

    const handleSubmit = () => {
        onSubmit();
    };

    return (
        <RadixDialog
            isOpen={isOpen}
            onOpenChange={(open: boolean) => {
                // Solo permitimos cerrar el diálogo si no está enviando el formulario
                if (!isSubmitting || !open) {
                    onOpenChange(open);
                }
            }}
            title={title}
            maxWidth={maxWidth}
        >
            <div className="p-6">
                <div className="mb-6">
                    {children}
                </div>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                    <Button 
                        variant="outline" 
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        {cancelLabel}
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || submitButtonProps?.disabled}
                        variant={submitButtonProps?.variant || 'default'}
                        className={cn(
                            isSubmitting && 'opacity-70 cursor-not-allowed',
                            submitButtonProps?.className
                        )}
                    >
                        {isSubmitting ? 'Guardando...' : submitLabel}
                    </Button>
                </div>
            </div>
        </RadixDialog>
    );
};
