import { DialogProvider } from '@/shared/components/overlays/dialogs/provider';
import { SidebarProvider } from '@/shared/components/ui/sidebar';

// Este componente ahora solo agrupa providers de UI/Layout. Los providers globales
// (React Query, Auth y Toasts) viven en niveles superiores: main.tsx y App.tsx.
// NavigationProvider eliminado - breadcrumbs ahora en useNavigation hook

interface AppProvidersProps {
    children: React.ReactNode;
}

/**
 * Componente que centraliza todos los proveedores de contexto de la aplicación
 */
export function AppProviders({ children }: AppProvidersProps) {
    return (
        <DialogProvider>
            <SidebarProvider>
                {children}
            </SidebarProvider>
        </DialogProvider>
    );
}
