
import { SidebarTrigger } from '@/shared/components/ui/sidebar';
import { Separator } from '@/shared/components/ui/separator';
import NavBreadcrumb from '@/navigation/components/NavBreadcrumb';
import { ThemeToggle, LanguageToggle, FullscreenToggle } from '@/shared/components/utilities/controls';

/**
 * Componente de encabezado de la aplicación
 * Contiene el botón de sidebar, migas de pan y controles de usuario
 */
export function AppHeader() {
    return (
        <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <NavBreadcrumb />
            </div>
            <div className="ml-auto flex items-center gap-2 px-4">
                <LanguageToggle />
                <ThemeToggle />
                <FullscreenToggle />
            </div>
        </header>
    );
}
