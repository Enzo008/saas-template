import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  ChevronLeft, 
  Menu, 
  LogOut, 
  CircleUserRound,
  Bell,
  FileText,
  Briefcase,
  Code,
  Circle,
  Folder,
  Palette,
  Clock,
  Mail,
  Table,
  FormInput,
  ChevronDown,
  type LucideIcon 
} from 'lucide-react'

// Mapa de iconos por menRef y tipos
export const menuIcons: Record<string, LucideIcon> = {
  // Iconos de menús dinámicos
  'dashboard': LayoutDashboard,
  'user': Users,
  'users': Users,
  'position': Briefcase,
  'briefcase': Briefcase,
  'form': FileText,
  'file-text': FileText,
  
  // Iconos de ejemplos
  'code': Code,
  'bell': Bell,
  'palette': Palette,
  'table': Table,
  'form-input': FormInput,
  'chevron-down': ChevronDown,
  'clock': Clock,
  'mail': Mail,
  'folder': Folder,
  
  // Iconos por defecto
  'circle': Circle,
  'notification-examples': Bell,
  'result-chain': Settings,
};

// Iconos de sistema
export const systemIcons = {
  chevronLeft: ChevronLeft,
  menu: Menu,
  logout: LogOut,
  accountCircle: CircleUserRound,
  settings: Settings,
} as const;
