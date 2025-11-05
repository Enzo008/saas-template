import { TreeNodeData, TreeNode } from './TreeNode';
import { useTree, UseTreeOptions } from './useTree';
import { Button } from '@/shared/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { clsx } from 'clsx';

export interface TreeProps extends Omit<UseTreeOptions, 'initialData'> {
  data: TreeNodeData[];
  className?: string;
  showControls?: boolean;
  renderCustomContent?: (node: TreeNodeData, level: number) => React.ReactNode;
  emptyMessage?: string;
  loading?: boolean;
}

export const Tree = ({
  data,
  className,
  showControls = false,
  renderCustomContent,
  emptyMessage = 'No hay elementos disponibles',
  loading = false,
  ...treeOptions
}: TreeProps) => {
  const tree = useTree({
    initialData: data,
    ...treeOptions
  });

  // Componente TreeNodeConnected que conecta TreeNode con el hook useTree
  const TreeNodeConnected = ({ node, level }: {
    node: TreeNodeData;
    level: number;
  }) => (
    <TreeNode
      node={node}
      level={level}
      isSelected={tree.isSelected(node.id)}
      isIndeterminate={tree.isIndeterminate(node.id)}
      isExpanded={tree.isExpanded(node.id)}
      onToggleExpand={tree.toggleExpand}
      onToggleSelect={tree.toggleSelect}
      renderCustomContent={renderCustomContent || ((node) => (
        <span className="text-sm font-medium truncate">{node.label}</span>
      ))}
    />
  );

  // Función recursiva para renderizar nodos
  const renderNodes = (nodes: TreeNodeData[], level: number = 0): React.ReactNode => {
    return nodes.map(node => (
      <div key={node.id}>
        <TreeNodeConnected node={node} level={level} />
        {node.children && 
         node.children.length > 0 && 
         tree.isExpanded(node.id) && (
          <div className="ml-4">
            {renderNodes(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className={clsx("p-4", className)}>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-4 h-4 bg-muted rounded" />
              <div className="w-4 h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={clsx("p-4 text-center text-muted-foreground", className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={clsx("space-y-1", className)}>
      {/* Controles opcionales */}
      {showControls && (
        <div className="flex items-center gap-2 p-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={tree.expandAll}
            className="h-8 px-2"
          >
            <Plus className="w-3 h-3 mr-1" />
            Expandir Todo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={tree.collapseAll}
            className="h-8 px-2"
          >
            <Minus className="w-3 h-3 mr-1" />
            Colapsar Todo
          </Button>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={tree.selectAll}
            className="h-8 px-2"
          >
            Seleccionar Todo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={tree.deselectAll}
            className="h-8 px-2"
          >
            Deseleccionar Todo
          </Button>
        </div>
      )}

      {/* Estadísticas opcionales */}
      {showControls && (
        <div className="px-2 py-1 text-xs text-muted-foreground">
          {tree.selectedIds.length} de {Array.from(tree.flatNodeMap.keys()).length} elementos seleccionados
        </div>
      )}

      {/* Árbol de nodos */}
      <div className="space-y-0.5">
        {renderNodes(data)}
      </div>
    </div>
  );
};

export default Tree;


