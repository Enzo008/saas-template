/**
 * NavContainer.tsx
 * Contenedor principal para los elementos de navegación
 * 
 * Este componente:
 * - Proporciona una estructura consistente para los elementos de navegación
 * - Maneja la visualización condicional basada en permisos
 */

import { ReactNode } from 'react';

interface NavContainerProps {
  children: ReactNode;
  className?: string;
  requiresAuth?: boolean;
  requiredPermissions?: string[];
}

export default function NavContainer({ 
  children, 
  className = ''
}: NavContainerProps) {
  // NavContainer simplificado - la lógica de permisos se maneja en el sidebar
  // Este componente ahora solo es un wrapper simple
  
  return (
    <div className={`nav-container ${className}`}>
      {children}
    </div>
  );
}
