/**
 * Componente Icons
 * Colección centralizada de iconos para usar en toda la aplicación
 */

import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Command,
  CreditCard,
  File,
  FileText,
  HelpCircle,
  Image,
  Laptop,
  Loader2,
  Moon,
  MoreVertical,
  Pizza,
  Plus,
  Settings,
  SunMedium,
  Trash,
  Twitter,
  User,
  X,
  Eye,
  EyeOff,
  Mail,
  Lock,
  LogOut,
  Home,
  Search,
  Filter,
  Download,
  Upload,
  Calendar,
  Bell,
  Info,
} from "lucide-react";

// Tipo para los iconos de Lucide
export type Icon = typeof AlertTriangle;

export const Icons = {
  logo: Command,
  close: X,
  spinner: Loader2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  trash: Trash,
  settings: Settings,
  user: User,
  add: Plus,
  warning: AlertTriangle,
  arrowRight: ArrowRight,
  help: HelpCircle,
  pizza: Pizza,
  sun: SunMedium,
  moon: Moon,
  laptop: Laptop,
  check: Check,
  more: MoreVertical,
  file: File,
  fileText: FileText,
  image: Image,
  creditCard: CreditCard,
  twitter: Twitter,
  eye: Eye,
  eyeOff: EyeOff,
  mail: Mail,
  lock: Lock,
  logout: LogOut,
  home: Home,
  search: Search,
  filter: Filter,
  download: Download,
  upload: Upload,
  calendar: Calendar,
  bell: Bell,
  info: Info,
  
  // Alias para compatibilidad
  loading: Loader2,
  error: AlertTriangle,
  success: Check,
  
  // Método para obtener un icono por nombre
  getIcon(name: string): Icon {
    return (this as any)[name] || this.help;
  }
};
