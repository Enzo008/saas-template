import { useState } from "react";

type FetchDataFunction = () => Promise<void>;

interface UseModalReturn<T> {
    modalVisible: boolean;
    estadoEditado: T | null;
    openModal: (estado?: T | null) => Promise<void>;
    closeModal: () => void;
}

const useModal = <T extends Record<string, any>>(
    fetchDataFunctions: FetchDataFunction[] = []
): UseModalReturn<T> => {
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [estadoEditado, setEstadoEditado] = useState<T | null>(null);

    const openModal = async (estado: T | null = null) => {
        // Limpieza de los datos del estado si es necesario
        if (estado) {
            const cleanedState = { ...estado };
            for (let key in cleanedState) {
                if (typeof cleanedState[key] === 'string') {
                    cleanedState[key] = cleanedState[key].replace(/\s+/g, ' ').trim();
                }
            }
            estado = cleanedState;
        }

        // Ejecutar todas las funciones de carga de datos en paralelo
        try {
            await Promise.all(fetchDataFunctions.map(func => func()));
            setEstadoEditado(estado);
            setModalVisible(true);
        } catch (error) {
            console.error('Error al cargar los datos para el modal:', error);
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setEstadoEditado(null);
    };

    return { modalVisible, estadoEditado, openModal, closeModal };
};

export default useModal;
