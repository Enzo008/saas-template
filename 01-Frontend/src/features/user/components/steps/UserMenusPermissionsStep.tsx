/**
 * Paso 2 del flujo multi-paso: Asignación de menús y permisos
 * Diseño minimalista de 2 columnas con sistema de árbol reutilizable
 */

import { useMemo, useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tree } from '@/shared/components/forms/components/Tree';
import { TreeNodeData } from '@/shared/components/forms/components/TreeNode';
import { UserMenuPermission } from '../../types';
import { User } from '@/auth/types';
import UserInfoPanel from '../UserInfoPanel';
import { 
  Shield, 
  FolderTree,
  CheckSquare
} from 'lucide-react';

interface UserMenusPermissionsStepProps {
  menusPermissions: UserMenuPermission[];
  onChange: (menusPermissions: UserMenuPermission[]) => void;
  isEditing: boolean;
  userData?: User | undefined;
  getAllMenusAndPermissions: (user?: { useYea?: string; useCod?: string; rolCod?: string }) => Promise<any[] | { menus: any[] } | null>;
}

export const UserMenusPermissionsStep = ({
  menusPermissions,
  onChange,
  isEditing,
  userData,
  getAllMenusAndPermissions
}: UserMenusPermissionsStepProps) => {

  const [isLoadingMenus, setIsLoadingMenus] = useState(true);
  
  // Extraer primitivos para detectar cambios sin causar bucles infinitos
  const useYea = userData?.useYea;
  const useCod = userData?.useCod;
  const rolCod = userData?.rolCod;

  // Función para procesar datos - ahora simplificada porque hasActive viene del backend
  const processMenusWithUserAssignments = useCallback((allMenus: any[], _userMenusPermissions: UserMenuPermission[]): UserMenuPermission[] => {
    
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
        
        // ✅ Preparar query según el modo:
        // - Modo edición: pasar usuario completo
        // - Modo creación: pasar solo rolCod para pre-seleccionar según rol
        let userForQuery: { useYea?: string; useCod?: string; rolCod?: string } | undefined;
        
        if (isEditing && useYea && useCod) {
          // Modo edición: pasar usuario completo
          userForQuery = { useYea, useCod };
        } else if (!isEditing && rolCod) {
          // Modo creación: pasar solo rolCod para pre-seleccionar
          userForQuery = { rolCod };
        }
        
        const result = await getAllMenusAndPermissions(userForQuery);
        
        // Obtener los datos
        let menusData: any[] = [];
        if (result && 'menus' in result && Array.isArray(result.menus)) {
          menusData = result.menus;
        } else if (result && Array.isArray(result)) {
          menusData = result;
        }
        
        // Procesar inmediatamente
        if (menusData.length > 0) {
          const processedData = processMenusWithUserAssignments(menusData, []);
          onChange(processedData);
        }
        
      } catch (error) {
        console.error('❌ Error al cargar menús y permisos:', error);
      } finally {
        setIsLoadingMenus(false);
      }
    };

    loadAndProcess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllMenusAndPermissions, isEditing, useYea, useCod, rolCod]);

  // Construir datos del árbol con menús y permisos
  const treeData = useMemo(() => {
    const buildMenuTree = (items: UserMenuPermission[], parentId?: string): TreeNodeData[] => {
      return items
        .filter(item => {
          const menuParentId = item.menu.menYeaPar && item.menu.menCodPar 
            ? `${item.menu.menYeaPar}-${item.menu.menCodPar}`
            : undefined;
          return menuParentId === parentId;
        })
        .sort((a, b) => {
          // menOrd no existe, ordenar por menCod
          const orderA = parseInt(a.menu.menCod || '0');
          const orderB = parseInt(b.menu.menCod || '0');
          return orderA - orderB;
        })
        .map(item => {
          const menuId = `${item.menu.menYea}-${item.menu.menCod}`;
          const children = buildMenuTree(items, menuId);
          
          // Agregar permisos como nodos hijos si no tiene submenús
          const permissionNodes: TreeNodeData[] = children.length === 0 
            ? item.permissions.map(permissionItem => ({
                id: `${menuId}-perm-${permissionItem.permission.perCod}`,
                label: permissionItem.permission.perNam || 'Sin nombre',
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
            label: item.menu.menNam || 'Sin nombre',
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
    
    const collectSelected = (items: UserMenuPermission[]) => {
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

        {/* Columna derecha - Información del usuario */}
        <div className="lg:col-span-1">
          <UserInfoPanel 
            user={userData} 
            isEditing={isEditing}
            className="sticky top-4"
          />
        </div>
      </div>
    </div>
  );
};

export default UserMenusPermissionsStep;