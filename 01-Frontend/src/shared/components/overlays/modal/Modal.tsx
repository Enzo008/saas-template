import { ReactNode } from 'react';
import { DndContext, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import useModalDrag from './useModalDrag';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { backdropVariants, getTransition, prefersReducedMotion } from '@/shared/config/animations';

interface ModalProps {
    modalVisible: boolean;
    onClose: () => void;
    title: string;
    initialData?: Record<string, any> | null; 
    children: ReactNode;
    maxWidth?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    /** Elemento desde el cual se abre el modal (para animación) */
    triggerElement?: HTMLElement | null | undefined;
}

const DraggableModalContent = ({ 
    children, 
    position, 
    handleClose, 
    title, 
    initialData,
    maxWidth,
    size = 'md',
    showCloseButton = true
}: { 
    children: ReactNode;
    position: { x: number; y: number };
    handleClose: () => void;
    title: string;
    initialData?: Record<string, any> | null;
    maxWidth?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
}) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: 'modal',
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

    // Determinar el ancho máximo basado en el tamaño
    const getMaxWidth = () => {
        if (maxWidth) return maxWidth;
        
        switch (size) {
            case 'sm': return '400px';
            case 'md': return '600px';
            case 'lg': return '800px';
            case 'xl': return '1100px';
            case 'full': return '95vw';
            default: return '600px';
        }
    };

    return (
        <div 
            ref={setNodeRef}
            style={{
                ...style,
                maxWidth: getMaxWidth(),
                width: '100%',
                maxHeight: '90vh',
            }}
            className="bg-background rounded-lg shadow-lg overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
        >
            <header className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                <h2 
                    className="text-lg font-semibold text-foreground flex-1 text-center cursor-move"
                    {...attributes}
                    {...listeners}
                >
                    {initialData ? t('common.actions.edit') : t('common.actions.add')} {title}
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
        </div>
    );
};

const Modal = ({ 
    modalVisible, 
    onClose, 
    title, 
    initialData, 
    children,
    maxWidth,
    size = 'md',
    showCloseButton = true,
    triggerElement
}: ModalProps) => {
    const { position, handleClose, handleDragEnd } = useModalDrag(onClose);

    // Calcular posición inicial desde el trigger element
    const getTriggerPosition = () => {
        if (!triggerElement) {
            // Fallback: centro-derecha inferior
            return {
                x: window.innerWidth - 100,
                y: window.innerHeight - 50
            };
        }
        
        const rect = triggerElement.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    };

    const triggerPos = getTriggerPosition();

    // Si el usuario prefiere movimiento reducido, usar animaciones simples
    const shouldAnimate = !prefersReducedMotion();
    
    return (
        <AnimatePresence>
            {modalVisible && (
                <motion.div 
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    variants={backdropVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={getTransition('fast')}
                >
                    <DndContext onDragEnd={handleDragEnd}>
                        <motion.div
                            className="w-full flex items-center justify-center"
                            initial={shouldAnimate ? {
                                opacity: 0,
                                scale: 0,
                                x: triggerPos.x - window.innerWidth / 2,
                                y: triggerPos.y - window.innerHeight / 2
                            } : { opacity: 0 }}
                            animate={shouldAnimate ? {
                                opacity: 1,
                                scale: 1,
                                x: 0,
                                y: 0
                            } : { opacity: 1 }}
                            exit={shouldAnimate ? {
                                opacity: 0,
                                scale: 0,
                                x: triggerPos.x - window.innerWidth / 2,
                                y: triggerPos.y - window.innerHeight / 2
                            } : { opacity: 0 }}
                            transition={getTransition('modal')}
                        >
                            <DraggableModalContent
                                position={position}
                                handleClose={handleClose}
                                title={title}
                                initialData={initialData || null}
                                {...(maxWidth && { maxWidth })}
                                size={size}
                                showCloseButton={showCloseButton}
                            >
                                {children}
                            </DraggableModalContent>
                        </motion.div>
                    </DndContext>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Modal;