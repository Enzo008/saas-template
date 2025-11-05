import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { User, Mail, Phone, Calendar, MapPin, Building, UserCheck, Shield } from 'lucide-react';
import { User as UserType } from '@/features/user/types';
import { clsx } from 'clsx';
import { capitalizeText } from '@/shared/utils/textUtils';

interface UserInfoPanelProps {
  user?: UserType | undefined;
  isEditing: boolean;
  className?: string;
}

export const UserInfoPanel = ({
  user,
  isEditing,
  className
}: UserInfoPanelProps) => {
  if (!user) {
    return (
      <Card className={clsx("", className)}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            {isEditing ? 'Cargando información del usuario...' : 'Nuevo Usuario'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'No especificado';
    try {
      // Si es un string en formato ISO (YYYY-MM-DD), parsearlo como fecha local
      if (typeof date === 'string' && date.includes('-')) {
        const dateOnly = date.split('T')[0];
        const parts = dateOnly?.split('-');
        if (parts && parts.length === 3) {
          const [year, month, day] = parts;
          // Crear fecha local (mes es 0-indexed en JS)
          const localDate = new Date(
            parseInt(year || '0'), 
            parseInt(month || '1') - 1, 
            parseInt(day || '1')
          );
          return localDate.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      }
      // Si ya es un objeto Date o formato diferente
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'a':
      case 'activo':
        return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>;
      case 'i':
      case 'inactivo':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Inactivo</Badge>;
      case 'p':
      case 'pendiente':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      default:
        return <Badge variant="outline">{estado || 'Sin estado'}</Badge>;
    }
  };

  return (
    <Card className={clsx("h-fit", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="w-5 h-5" />
          {isEditing ? 'Editando Usuario' : 'Nuevo Usuario'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Avatar y nombre */}
        <div className="flex flex-col items-center space-y-3">
          <Avatar className="w-20 h-20">
            <AvatarImage src="" alt={`${user.useNam} ${user.useLas}`} />
            <AvatarFallback className="text-lg font-semibold bg-primary/10">
              {getInitials(user.useNam || '', user.useLas || '')}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center space-y-1">
            <h3 className="font-semibold text-lg">
              {capitalizeText(user.useNam || '')} {capitalizeText(user.useLas || '')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {user.posNam || 'Cargo no especificado'}
            </p>
            {getStatusBadge(user.useSta || '')}
          </div>
        </div>

        {/* Información personal */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Información Personal
          </h4>
          
          <div className="space-y-3">
            {/* Documento */}
            <div className="flex items-start gap-3">
              <UserCheck className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Documento</p>
                <p className="text-sm text-muted-foreground">
                  {user.useNumDoc || 'No especificado'}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Correo Electrónico</p>
                <p className="text-sm text-muted-foreground break-all">
                  {user.useEma || 'No especificado'}
                </p>
              </div>
            </div>

            {/* Teléfono */}
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Teléfono</p>
                <p className="text-sm text-muted-foreground">
                  {user.usePho || 'No especificado'}
                </p>
              </div>
            </div>

            {/* Fecha de nacimiento */}
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Fecha de Nacimiento</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(user.useBir)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información laboral */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Información Laboral
          </h4>
          
          <div className="space-y-3">
            {/* Ubicación */}
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Ubicación</p>
                <p className="text-sm text-muted-foreground">
                  {user.locNam || 'No especificado'}
                </p>
              </div>
            </div>

            {/* Repositorio */}
            <div className="flex items-start gap-3">
              <Building className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Repositorio</p>
                <p className="text-sm text-muted-foreground">
                  {user.repNam || 'No especificado'}
                </p>
              </div>
            </div>

            {/* Rol */}
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Rol del Sistema</p>
                <p className="text-sm text-muted-foreground">
                  {user.rolNam || 'No especificado'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInfoPanel;
