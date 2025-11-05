import { ReactNode } from 'react';
import { RadixDialog } from '../radix';
import { Button } from '../../../ui/button';

export interface InfoDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    children: ReactNode;
    closeLabel?: string;
    onClose?: () => void;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
}

export const InfoDialog = ({
    isOpen,
    onOpenChange,
    title,
    children,
    closeLabel = 'Cerrar',
    onClose,
    maxWidth = 'md'
}: InfoDialogProps) => {
    const handleClose = () => {
        onClose?.();
    };

    return (
        <RadixDialog
            isOpen={isOpen}
            onOpenChange={(open: boolean) => {
                onOpenChange(open);
                if (!open) handleClose();
            }}
            title={title}
            maxWidth={maxWidth}
        >
            <div className="p-6">
                <div className="mb-6">
                    {children}
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleClose}>
                        {closeLabel}
                    </Button>
                </div>
            </div>
        </RadixDialog>
    );
};
