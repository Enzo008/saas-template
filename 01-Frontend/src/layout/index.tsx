/**
 * MainLayout/index.tsx
 * Layout principal de la aplicación que contiene la navegación y estructura base.
 */


import AppSidebar from '@/navigation/components/AppSidebar';
import { AppProviders } from './AppProviders';
import { AppContent } from './AppContent';

/**
 * Componente principal de layout que estructura toda la aplicación
 * Organiza los proveedores de contexto, la barra lateral, el encabezado y el contenido
 * 
 * Nota: SessionManager se maneja en AuthProvider para evitar duplicación
 */
export default function MainLayout() {
    return (
        <AppProviders>
            <AppSidebar />
            <AppContent />
        </AppProviders>
    );
}
