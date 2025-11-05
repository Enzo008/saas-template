import { ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { DndContext, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import useModalDrag from '../../modal/useModalDrag';
import { useTranslation } from 'react-i18next';

export interface RadixDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    children: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
    showCloseButton?: boolean;
}

const dialogMaxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    'full': 'max-w-full'
};

const DraggableDialogContent = ({ 
    children, 
    position, 
    handleClose, 
    title,
    maxWidth = 'md',
    showCloseButton = true
}: { 
    children: ReactNode;
    position: { x: number; y: number };
    handleClose: () => void;
    title: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
    showCloseButton?: boolean;
}) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: 'dialog',
    });

    const style = transform ? {
        transform: CSS.Transform.toString({
            x: position.x + transform.x,
            y: position.y + transform.y,
            scaleX: 1,
            scaleY: 1
        })
    } : {
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`
    };

    const { t } = useTranslation();

    return (
        <DialogPrimitive.Content
            ref={setNodeRef}
            style={style}
            className={cn(
                "fixed top-[50%] left-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%]",
                "bg-background border border-border rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[90vh]",
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                "duration-200",
                dialogMaxWidths[maxWidth]
            )}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        >
            <header className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                <h2 
                    className="text-lg font-semibold text-foreground flex-1 text-center cursor-move"
                    {...attributes}
                    {...listeners}
                >
                    {title}
                </h2>
                {showCloseButton && (
                    <button 
                        onClick={handleClose}
                        className="rounded-full p-1 hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label={t('common.actions.close')}
                    >
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                )}
            </header>
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </DialogPrimitive.Content>
    );
};

export const RadixDialog = ({ 
    isOpen, 
    onOpenChange, 
    title, 
    children,
    maxWidth = 'md',
    showCloseButton = true
}: RadixDialogProps) => {
    const handleClose = () => {
        onOpenChange(false);
    };

    const { position, handleDragEnd } = useModalDrag(handleClose);

    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay 
                    className={cn(
                        "fixed inset-0 z-50 bg-black/50",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                        "transition-opacity duration-300"
                    )}
                />
                <DndContext onDragEnd={handleDragEnd}>
                    <DraggableDialogContent
                        position={position}
                        handleClose={handleClose}
                        title={title}
                        maxWidth={maxWidth}
                        showCloseButton={showCloseButton}
                    >
                        {children}
                    </DraggableDialogContent>
                </DndContext>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
};
