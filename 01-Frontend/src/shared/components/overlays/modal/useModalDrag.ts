import { useState } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';

interface Position {
    x: number;
    y: number;
}

const useModalDrag = (onClose: () => void) => {
    const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

    const handleClose = () => {
        setTimeout(() => {
            setPosition({ x: 0, y: 0 });
        }, 200);
        onClose();
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { delta } = event;
        if (delta) {
            setPosition(prev => ({
                x: prev.x + delta.x,
                y: prev.y + delta.y
            }));
        }
    };

    return {
        position,
        handleClose,
        handleDragEnd
    };
};

export default useModalDrag;
