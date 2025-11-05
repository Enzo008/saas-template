/**
 * AppSidebar.tsx
 * Componente mejorado para la barra lateral de la aplicación
 *
 * Este componente:
 * - Estructura la barra lateral con secciones de encabezado, contenido y pie
 * - Integra los componentes de navegación mejorados
 * - Proporciona una experiencia de usuario consistente
 */

import { ReactNode } from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/shared/components/ui/sidebar";
import NavMain from "./NavMain";
import NavUser from "./NavUser";
import { SidebarMenuButton } from "@/shared/components/ui/sidebar";
import { Power } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  header?: ReactNode;
  footer?: ReactNode;
}

export default function AppSidebar({ header, footer }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {header || (
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Link
              to="/"
              className={cn(
                "flex items-center gap-2 px-2 py-3 w-full",
                "text-lg font-semibold tracking-tight",
                "text-sidebar-foreground hover:text-sidebar-foreground/90 transition-colors"
              )}
            >
              <Power className="h-5 w-5 shrink-0" />
              <span>SAAS TEMPLATE</span>
            </Link>
          </SidebarMenuButton>
        )}
      </SidebarHeader>

      <SidebarContent className="flex flex-col">
        <NavMain />
      </SidebarContent>

      <SidebarFooter className="border-t">
        {footer || <NavUser />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
