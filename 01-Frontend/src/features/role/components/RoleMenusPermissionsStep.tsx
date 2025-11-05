/**
 * Componente para asignación de menús y permisos a roles
 * Siguiendo el patrón estandarizado de UserMenusPermissionsStep
 */

import { useMemo, useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tree } from '@/shared/components/forms/components/Tree';
import { TreeNodeData } from '@/shared/components/forms/components/TreeNode';
import { RoleMenuPermission, Role } from '../types';
import { 
  Shield, 
  FolderTree,
  CheckSquare
} from 'lucide-react';

interface RoleMenusPermissionsStepProps {
  menusPermissions: RoleMenuPermission[];
  onChange: (menusPermissions: RoleMenuPermission[]) => void;
  isEditing: boolean;
  roleData?: Role | undefined;
  getAllMenusAndPermissions: (rol?: { rolCod?: string }) => Promise<any[] | { menus: any[] } | null>;
}

export const RoleMenusPermissionsStep = ({
  menusPermissions,
  onChange,
  isEditing,
  roleData,
  getAllMenusAndPermissions
}: RoleMenusPermissionsStepProps) => {

  const [isLoadingMenus, setIsLoadingMenus] = useState(true);

  // Función para procesar datos - ahora simplificada porque hasActive viene del backend
  const processMenusWithRolAssignments = useCallback((allMenus: any[], _rolMenusPermissions: RoleMenuPermission[]): RoleMenuPermission[] => {
    
    // Los datos ahora vienen con hasActive desde el backend, solo necesitamos formatear
    const processedMenus = allMenus.map(menu => {
      return {
        menu: {
          ...menu,
          menYeaPar: menu.menYeaPar || null,
          menCodPar: menu.menCodPar || null,
          menIco: menu.menIco || 'menu'
        },
        hasActive: menu.hasActive || false,
        permissions: (menu.permissions || []).map((permission: any) => {
          return {
            permission: {
              ...permission,
              perCod: permission.perCod,
              perNam: permission.perNam || '',
              perRef: permission.perRef || ''
            },
            hasActive: permission.hasActive || false
          };
        })
      };
    });
    
    return processedMenus;
  }, []);

  // SIMPLE: Cargar y procesar en un solo paso
  useEffect(() => {
    const loadAndProcess = async () => {
      try {
        setIsLoadingMenus(true);
        
        // Pasar el rol si estamos en modo edición
        const roleForQuery = isEditing && roleData ? { rolCod: roleData.rolCod } : undefined;
        const result = await getAllMenusAndPermissions(roleForQuery);
        
        // Obtener los datos
        let menusData: any[] = [];
        if (result && 'menus' in result && Array.isArray(result.menus)) {
          menusData = result.menus;
        } else if (result && Array.isArray(result)) {
          menusData = result;
        }
        
        // Procesar inmediatamente
        if (menusData.length > 0) {
          const processedData = processMenusWithRolAssignments(menusData, []);
          onChange(processedData);
        }
        
      } catch (error) {
        console.error('❌ Error al cargar menús y permisos:', error);
      } finally {
        setIsLoadingMenus(false);
      }
    };

    loadAndProcess();
  }, [getAllMenusAndPermissions, isEditing, roleData?.rolCod]);

  // Construir datos del árbol con menús y permisos
  const treeData = useMemo(() => {
    const buildMenuTree = (items: RoleMenuPermission[], parentId?: string): TreeNodeData[] => {
      return items
        .filter(item => {
          const menuParentId = item.menu.menYeaPar && item.menu.menCodPar 
            ? `${item.menu.menYeaPar}-${item.menu.menCodPar}`
            : undefined;
          return menuParentId === parentId;
        })
        .sort((a, b) => {
          const orderA = parseInt(a.menu.menOrd || '0');
          const orderB = parseInt(b.menu.menOrd || '0');
          return orderA - orderB;
        })
        .map(item => {
          const menuId = `${item.menu.menYea}-${item.menu.menCod}`;
          const children = buildMenuTree(items, menuId);
          
          // Agregar permisos como nodos hijos si no tiene submenús
          const permissionNodes: TreeNodeData[] = children.length === 0 
            ? item.permissions.map(permissionItem => ({
                id: `${menuId}-perm-${permissionItem.permission.perCod}`,
                label: permissionItem.permission.perNam,
                icon: <Shield className="h-3 w-3" />,
                metadata: {
                  type: 'permission',
                  menuId,
                  permission: permissionItem.permission,
                  hasActive: permissionItem.hasActive
                }
              }))
            : [];

          return {
            id: menuId,
            label: item.menu.menNam,
            children: [...children, ...permissionNodes],
            metadata: {
              type: 'menu',
              menu: item.menu,
              hasActive: item.hasActive,
              permissionsCount: item.permissions.length,
              activePermissionsCount: item.permissions.filter(p => p.hasActive).length
            }
          };
        });
    };
    return buildMenuTree(menusPermissions);
  }, [menusPermissions]);

  // Obtener IDs inicialmente seleccionados
  const initialSelectedIds = useMemo(() => {
    const selectedIds: string[] = [];
    
    const collectSelected = (items: RoleMenuPermission[]) => {
      items.forEach(item => {
        const menuId = `${item.menu.menYea}-${item.menu.menCod}`;
        
        // Agregar menú si está activo
        if (item.hasActive) {
          selectedIds.push(menuId);
        }
        
        // Agregar permisos activos
        item.permissions.forEach(permissionItem => {
          if (permissionItem.hasActive) {
            selectedIds.push(`${menuId}-perm-${permissionItem.permission.perCod}`);
          }
        });
      });
    };
    
    collectSelected(menusPermissions);
    return selectedIds;
  }, [menusPermissions]);

  // Manejar cambios en la selección del árbol
  const handleSelectionChange = useCallback((selectedIds: string[]) => {
    const updatedmenusPermissions = menusPermissions.map(item => {
      const menuId = `${item.menu.menYea}-${item.menu.menCod}`;
      const isMenuSelected = selectedIds.includes(menuId);
      
      // Actualizar permisos
      const updatedPermissions = item.permissions.map(permissionItem => ({
        ...permissionItem,
        hasActive: selectedIds.includes(`${menuId}-perm-${permissionItem.permission.perCod}`)
      }));
      
      return {
        ...item,
        hasActive: isMenuSelected,
        permissions: updatedPermissions
      };
    });
    
    // Notificar cambios al componente padre
    onChange(updatedmenusPermissions);
  }, [menusPermissions, onChange]);

  // Renderizar contenido personalizado para nodos del árbol
  const renderCustomContent = useCallback((node: TreeNodeData) => {
    const { metadata } = node;
    
    if (metadata?.['type'] === 'menu') {
      const activeCount = metadata['activePermissionsCount'] || 0;
      const totalCount = metadata['permissionsCount'] || 0;
      
      return (
        <div className="flex items-center justify-between w-full min-w-0">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="text-sm font-medium truncate">
              {node.label}
            </span>
          </div>
          
          {totalCount > 0 && (
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Badge 
                variant={activeCount > 0 ? "default" : "secondary"} 
                className="text-xs px-1.5 py-0.5"
              >
                {activeCount}/{totalCount}
              </Badge>
            </div>
          )}
        </div>
      );
    }
    
    if (metadata?.['type'] === 'permission') {
      return (
        <div className="flex items-center justify-between w-full min-w-0">
          <div className="min-w-0">
            <span className="text-sm truncate">
              {node.label}
            </span>
            {metadata['permission']?.perDes && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {metadata['permission'].perDes}
              </p>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <span className="text-sm font-medium truncate">
        {node.label}
      </span>
    );
  }, []);

  // Estadísticas
  const stats = useMemo(() => {
    const totalMenus = menusPermissions.length;
    const activeMenus = menusPermissions.filter(m => m.hasActive).length;
    const totalPermissions = menusPermissions.reduce((sum, m) => sum + m.permissions.length, 0);
    const activePermissions = menusPermissions.reduce((sum, m) => 
      sum + m.permissions.filter(p => p.hasActive).length, 0
    );
    
    return { totalMenus, activeMenus, totalPermissions, activePermissions };
  }, [menusPermissions]);

  if (isLoadingMenus) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Cargando menús y permisos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Layout de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Árbol de menús y permisos */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FolderTree className="w-5 h-5" />
                  Estructura de Menús
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <CheckSquare className="w-3 h-3 mr-1" />
                    {stats.activeMenus} menús
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    {stats.activePermissions} permisos
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tree
                key={`tree-${initialSelectedIds.length}`} // Forzar re-render cuando cambien los IDs
                data={treeData}
                initialSelected={initialSelectedIds}
                onSelectionChange={handleSelectionChange}
                renderCustomContent={renderCustomContent}
                showControls={true}
                className="max-h-[600px] overflow-y-auto"
                emptyMessage="No hay menús disponibles para asignar"
                loading={isLoadingMenus}
              />
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha - Información del rol */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Información del Rol
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {roleData && (
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Código:</span>
                    <p className="text-sm text-muted-foreground">{roleData.rolCod || 'Se generará automáticamente'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Nombre:</span>
                    <p className="text-sm text-muted-foreground">{roleData.rolNam}</p>
                  </div>
                </div>
              )}
              
              {/* Estadísticas */}
              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <FolderTree className="h-4 w-4" />
                    Menús
                  </span>
                  <Badge variant="secondary">
                    {stats.activeMenus}/{stats.totalMenus}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Permisos
                  </span>
                  <Badge variant="secondary">
                    {stats.activePermissions}/{stats.totalPermissions}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoleMenusPermissionsStep;
