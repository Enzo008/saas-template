import { useState } from 'react';

export default function useModal<T extends Record<string, any>>() {
    const [modalVisible, setModalVisible] = useState(false);
    const [estadoEditado, setEstadoEditado] = useState<T | null>(null);

    const openModal = (data?: T) => {
        setEstadoEditado(data || null);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setEstadoEditado(null);
    };

    return {
        modalVisible,
        estadoEditado,
        openModal,
        closeModal
    };
}
