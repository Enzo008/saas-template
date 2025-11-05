import { ChevronsUpDown } from "lucide-react"
import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/components/ui/sidebar"
import NavUserDropdown from "./NavUserDropdown"
import { useAuthStore } from "@/auth/store/authStore"

export default function NavUser() {
  const user = useAuthStore(state => state.user)
  const { isMobile } = useSidebar()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  const initials = user.useNam ? user.useNam.slice(0, 2).toUpperCase() : 'U'

  return (
    <SidebarMenu>
      <SidebarMenuItem className="relative">
        <SidebarMenuButton
          size="lg"
          className="cursor-pointer w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={() => setIsOpen(!isOpen)}
          data-state={isOpen ? "open" : "closed"}
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user.useAva || undefined} alt={user.useNam} />
            <AvatarFallback className="rounded-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.useNam}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user.useEma?.toLowerCase()}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </SidebarMenuButton>

        <NavUserDropdown
          user={user}
          isOpen={isOpen}
          isMobile={isMobile}
          onClose={() => setIsOpen(false)}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
