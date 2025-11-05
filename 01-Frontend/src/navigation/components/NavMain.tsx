import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/shared/components/ui/sidebar"

import { cn } from "@/lib/utils";
import { useNavigation } from "../hooks/useNavigation"
import { useSidebarNavigation } from "../hooks/useSidebarNavigation"
import { menuIcons } from "../utils/menuIcons"
import { LayoutDashboard, ChevronRight } from 'lucide-react'
import { NavigationMenu } from '../services'
import { useState } from 'react'

export default function NavMain() {
  const { sidebarMenus, isPathActive } = useNavigation()
  const { handleNavigation } = useSidebarNavigation()

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})

  const toggleMenu = (menuId: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }))
  }



  const renderMenuItem = (menu: NavigationMenu, level: number = 0): React.JSX.Element => {
    const Icon = menuIcons[menu.icon || 'circle'] || LayoutDashboard
    const isActive = menu.path ? isPathActive(menu.path) : false
    const hasChildren = menu.children && menu.children.length > 0
    const isOpen = openMenus[menu.id] !== undefined ? openMenus[menu.id] : (menu.hasActiveChild || false)
    const hasActiveChild = hasChildren && menu.children!.some(child => 
      child.path ? isPathActive(child.path) : false
    )

    const handleClick = () => {
      if (hasChildren) {
        toggleMenu(menu.id)
      } else if (menu.path) {
        handleNavigation(menu.path)
      }
    }

    if (level === 0) {
      // Menú de nivel raíz
      return (
        <SidebarMenuItem key={menu.id}>
          <SidebarMenuButton
            className={cn(
              "cursor-pointer",
              (isActive || hasActiveChild) && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
            onClick={handleClick}
            tooltip={menu.title}
          >
            <Icon className="h-4 w-4" />
            <span>{menu.title}</span>
            {hasChildren && (
              <ChevronRight 
                className={cn(
                  "ml-auto h-4 w-4 transition-transform duration-200",
                  isOpen && "rotate-90"
                )} 
              />
            )}
          </SidebarMenuButton>
          
          {hasChildren && isOpen && (
            <SidebarMenuSub>
              {menu.children!.map((child) => renderMenuItem(child, level + 1))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      )
    } else {
      // Submenú
      return (
        <SidebarMenuSubItem key={menu.id}>
          <SidebarMenuSubButton
            className={cn(
              "cursor-pointer",
              (isActive || hasActiveChild) && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
            onClick={handleClick}
          >
            <span>{menu.title}</span>
            {hasChildren && (
              <ChevronRight 
                className={cn(
                  "ml-auto h-3 w-3 transition-transform duration-200",
                  isOpen && "rotate-90"
                )} 
              />
            )}
          </SidebarMenuSubButton>
          
          {hasChildren && isOpen && (
            <SidebarMenuSub>
              {menu.children!.map((child) => renderMenuItem(child, level + 1))}
            </SidebarMenuSub>
          )}
        </SidebarMenuSubItem>
      )
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menú</SidebarGroupLabel>
      <SidebarMenu>
        {sidebarMenus.map((menu: NavigationMenu) => renderMenuItem(menu, 0))}
      </SidebarMenu>
    </SidebarGroup>
  )
}