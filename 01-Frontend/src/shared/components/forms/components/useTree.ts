import { useState, useCallback, useMemo } from 'react';
import { TreeNodeData } from './TreeNode';

export interface UseTreeOptions {
  initialData: TreeNodeData[];
  initialSelected?: string[];
  initialExpanded?: string[];
  multiSelect?: boolean;
  onSelectionChange?: (selectedIds: string[], selectedNodes: TreeNodeData[]) => void;
}

export interface TreeState {
  selectedIds: Set<string>;
  expandedIds: Set<string>;
  indeterminateIds: Set<string>;
}

export interface UseTreeReturn {
  // Estado
  selectedIds: string[];
  expandedIds: string[];
  indeterminateIds: string[];
  
  // Funciones
  toggleExpand: (nodeId: string) => void;
  toggleSelect: (nodeId: string, selected: boolean) => void;
  expandAll: () => void;
  collapseAll: () => void;
  selectAll: () => void;
  deselectAll: () => void;
  
  // Utilidades
  isSelected: (nodeId: string) => boolean;
  isExpanded: (nodeId: string) => boolean;
  isIndeterminate: (nodeId: string) => boolean;
  getSelectedNodes: () => TreeNodeData[];
  
  // Datos procesados
  flatNodeMap: Map<string, TreeNodeData>;
  parentChildMap: Map<string, string[]>;
  childParentMap: Map<string, string>;
}

export const useTree = (options: UseTreeOptions): UseTreeReturn => {
  const {
    initialData,
    initialSelected = [],
    initialExpanded = [],
    onSelectionChange
  } = options;

  // Estado interno
  const [state, setState] = useState<TreeState>(() => ({
    selectedIds: new Set(initialSelected),
    expandedIds: new Set(initialExpanded),
    indeterminateIds: new Set()
  }));

  // Mapa plano de todos los nodos para acceso rápido
  const flatNodeMap = useMemo(() => {
    const map = new Map<string, TreeNodeData>();
    
    const traverse = (nodes: TreeNodeData[]) => {
      nodes.forEach(node => {
        map.set(node.id, node);
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    
    traverse(initialData);
    return map;
  }, [initialData]);

  // Mapa de relaciones padre-hijo
  const parentChildMap = useMemo(() => {
    const map = new Map<string, string[]>();
    
    const traverse = (nodes: TreeNodeData[], parentId?: string) => {
      nodes.forEach(node => {
        if (parentId) {
          const siblings = map.get(parentId) || [];
          if (!siblings.includes(node.id)) {
            map.set(parentId, [...siblings, node.id]);
          }
        }
        
        if (node.children) {
          traverse(node.children, node.id);
        }
      });
    };
    
    traverse(initialData);
    return map;
  }, [initialData]);

  // Mapa de relaciones hijo-padre
  const childParentMap = useMemo(() => {
    const map = new Map<string, string>();
    
    parentChildMap.forEach((children, parentId) => {
      children.forEach(childId => {
        map.set(childId, parentId);
      });
    });
    
    return map;
  }, [parentChildMap]);

  // Función para obtener todos los descendientes de un nodo
  const getAllDescendants = useCallback((nodeId: string): string[] => {
    const descendants: string[] = [];
    const children = parentChildMap.get(nodeId) || [];
    
    children.forEach(childId => {
      descendants.push(childId);
      descendants.push(...getAllDescendants(childId));
    });
    
    return descendants;
  }, [parentChildMap]);

  // Función para obtener todos los ancestros de un nodo
  const getAllAncestors = useCallback((nodeId: string): string[] => {
    const ancestors: string[] = [];
    let currentParent = childParentMap.get(nodeId);
    
    while (currentParent) {
      ancestors.push(currentParent);
      currentParent = childParentMap.get(currentParent);
    }
    
    return ancestors;
  }, [childParentMap]);

  // Función para calcular estados indeterminados
  const calculateIndeterminateStates = useCallback((selectedIds: Set<string>): Set<string> => {
    const indeterminateIds = new Set<string>();
    
    // Para cada nodo padre, verificar si tiene algunos (pero no todos) los hijos seleccionados
    parentChildMap.forEach((children, parentId) => {
      const selectedChildren = children.filter(childId => selectedIds.has(childId));
      const hasSelectedChildren = selectedChildren.length > 0;
      const allChildrenSelected = selectedChildren.length === children.length;
      const isParentSelected = selectedIds.has(parentId);
      
      // Un nodo está indeterminado si:
      // 1. Tiene algunos hijos seleccionados pero no todos
      // 2. Y el padre mismo no está explícitamente seleccionado
      if (hasSelectedChildren && !allChildrenSelected && !isParentSelected) {
        indeterminateIds.add(parentId);
      }
    });
    
    return indeterminateIds;
  }, [parentChildMap]);

  // Toggle expand/collapse
  const toggleExpand = useCallback((nodeId: string) => {
    setState(prev => {
      const newExpandedIds = new Set(prev.expandedIds);
      
      if (newExpandedIds.has(nodeId)) {
        newExpandedIds.delete(nodeId);
      } else {
        newExpandedIds.add(nodeId);
      }
      
      return {
        ...prev,
        expandedIds: newExpandedIds
      };
    });
  }, []);

  // Toggle select con lógica jerárquica
  const toggleSelect = useCallback((nodeId: string, selected: boolean) => {
    setState(prev => {
      const newSelectedIds = new Set(prev.selectedIds);
      
      if (selected) {
        // Seleccionar el nodo y todos sus descendientes
        newSelectedIds.add(nodeId);
        const descendants = getAllDescendants(nodeId);
        descendants.forEach(id => newSelectedIds.add(id));
      } else {
        // Deseleccionar el nodo y todos sus descendientes
        newSelectedIds.delete(nodeId);
        const descendants = getAllDescendants(nodeId);
        descendants.forEach(id => newSelectedIds.delete(id));
      }
      
      // Actualizar ancestros - lógica mejorada
      const ancestors = getAllAncestors(nodeId);
      ancestors.forEach(ancestorId => {
        const children = parentChildMap.get(ancestorId) || [];
        const selectedChildren = children.filter(childId => newSelectedIds.has(childId));
        
        if (selected) {
          // Si estamos seleccionando, seleccionar todos los ancestros
          newSelectedIds.add(ancestorId);
        } else {
          // Si estamos deseleccionando, solo deseleccionar ancestros si no tienen otros hijos seleccionados
          if (selectedChildren.length === 0) {
            newSelectedIds.delete(ancestorId);
          }
        }
      });
      
      const newIndeterminateIds = calculateIndeterminateStates(newSelectedIds);
      
      const newState = {
        ...prev,
        selectedIds: newSelectedIds,
        indeterminateIds: newIndeterminateIds
      };
      
      // Notificar cambio
      if (onSelectionChange) {
        const selectedNodes = Array.from(newSelectedIds)
          .map(id => flatNodeMap.get(id))
          .filter(Boolean) as TreeNodeData[];
        onSelectionChange(Array.from(newSelectedIds), selectedNodes);
      }
      
      return newState;
    });
  }, [getAllDescendants, getAllAncestors, parentChildMap, calculateIndeterminateStates, onSelectionChange, flatNodeMap]);

  // Expand all
  const expandAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      expandedIds: new Set(Array.from(flatNodeMap.keys()))
    }));
  }, [flatNodeMap]);

  // Collapse all
  const collapseAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      expandedIds: new Set()
    }));
  }, []);

  // Select all
  const selectAll = useCallback(() => {
    const allIds = Array.from(flatNodeMap.keys());
    setState(prev => ({
      ...prev,
      selectedIds: new Set(allIds),
      indeterminateIds: new Set()
    }));
    
    if (onSelectionChange) {
      const selectedNodes = Array.from(flatNodeMap.values());
      onSelectionChange(allIds, selectedNodes);
    }
  }, [flatNodeMap, onSelectionChange]);

  // Deselect all
  const deselectAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedIds: new Set(),
      indeterminateIds: new Set()
    }));
    
    if (onSelectionChange) {
      onSelectionChange([], []);
    }
  }, [onSelectionChange]);

  // Utilidades
  const isSelected = useCallback((nodeId: string) => state.selectedIds.has(nodeId), [state.selectedIds]);
  const isExpanded = useCallback((nodeId: string) => state.expandedIds.has(nodeId), [state.expandedIds]);
  const isIndeterminate = useCallback((nodeId: string) => state.indeterminateIds.has(nodeId), [state.indeterminateIds]);
  
  const getSelectedNodes = useCallback(() => {
    return Array.from(state.selectedIds)
      .map(id => flatNodeMap.get(id))
      .filter(Boolean) as TreeNodeData[];
  }, [state.selectedIds, flatNodeMap]);

  return {
    // Estado
    selectedIds: Array.from(state.selectedIds),
    expandedIds: Array.from(state.expandedIds),
    indeterminateIds: Array.from(state.indeterminateIds),
    
    // Funciones
    toggleExpand,
    toggleSelect,
    expandAll,
    collapseAll,
    selectAll,
    deselectAll,
    
    // Utilidades
    isSelected,
    isExpanded,
    isIndeterminate,
    getSelectedNodes,
    
    // Datos procesados
    flatNodeMap,
    parentChildMap,
    childParentMap
  };
};
