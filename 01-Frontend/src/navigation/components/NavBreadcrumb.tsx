/**
 * NavBreadcrumb.tsx
 * Componente mejorado para mostrar las migas de pan (breadcrumbs)
 * 
 * Este componente:
 * - Muestra la ruta de navegación actual
 * - Permite navegar a rutas anteriores
 * - Usa el hook useNavigation para obtener breadcrumbs dinámicos
 */

import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useNavigation } from '../hooks/useNavigation';
import { cn } from "@/lib/utils";

interface NavBreadcrumbProps {
  className?: string;
  separator?: React.ReactNode;
}

export default function NavBreadcrumb({ 
  className,
  separator = <ChevronRight className="h-4 w-4 opacity-50" />
}: NavBreadcrumbProps) {
    const { breadcrumbs } = useNavigation();
    
    if (breadcrumbs.length === 0) {
        return null;
    }
    
    return (
        <nav 
            className={cn(
                "flex items-center text-sm font-medium text-muted-foreground",
                className
            )}
            aria-label="Breadcrumb"
        >
            <ol className="flex items-center gap-1.5">
                {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    
                    return (
                        <li key={crumb.path} className="flex items-center gap-1.5">
                            {index > 0 && separator}
                            
                            {isLast ? (
                                <span className="font-semibold text-foreground">
                                    {crumb.label}
                                </span>
                            ) : crumb.isClickable !== false ? (
                                <Link 
                                    to={crumb.path}
                                    className="transition-colors hover:text-foreground"
                                >
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-muted-foreground cursor-default">
                                    {crumb.label}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
