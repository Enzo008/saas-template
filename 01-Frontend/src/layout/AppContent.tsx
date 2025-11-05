
import { Outlet } from 'react-router-dom';
import { SidebarInset } from '@/shared/components/ui/sidebar';
import { AppHeader } from './AppHeader';
import { RouteProgressBar } from '@/shared/components/loading';

/**
 * Componente que contiene el contenido principal de la aplicación
 * Incluye el encabezado y el área de contenido donde se renderiza la ruta activa
 */
export function AppContent() {
    return (
        <SidebarInset className="overflow-auto">
            <RouteProgressBar />
            <AppHeader />
            <div className="flex flex-col overflow-auto p-2 flex-grow-1">
                <Outlet />
            </div>
        </SidebarInset>
    );
}
