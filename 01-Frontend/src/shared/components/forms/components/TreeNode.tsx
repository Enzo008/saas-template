import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { clsx } from 'clsx';

export interface TreeNodeData {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: TreeNodeData[];
  disabled?: boolean;
  metadata?: Record<string, any>;
}

export interface TreeNodeProps {
  node: TreeNodeData;
  level: number;
  isSelected: boolean;
  isIndeterminate: boolean;
  isExpanded: boolean;
  onToggleExpand: (nodeId: string) => void;
  onToggleSelect: (nodeId: string, selected: boolean) => void;
  renderCustomContent?: (node: TreeNodeData, level: number) => React.ReactNode;
  className?: string;
}

export const TreeNode = ({
  node,
  level,
  isSelected,
  isIndeterminate,
  isExpanded,
  onToggleExpand,
  onToggleSelect,
  renderCustomContent,
  className
}: TreeNodeProps) => {
  const hasChildren = node.children && node.children.length > 0;
  const paddingLeft = level * 24; // 24px por nivel

  const handleToggleExpand = () => {
    if (hasChildren) {
      onToggleExpand(node.id);
    }
  };

  const handleToggleSelect = (checked: boolean) => {
    onToggleSelect(node.id, checked);
  };

  return (
    <div className={clsx("select-none", className)}>
      {/* Nodo principal */}
      <div 
        className={clsx(
          "flex items-center py-2 px-3 rounded-md hover:bg-muted/50 transition-colors",
          isSelected && "bg-primary/10",
          node.disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{ paddingLeft: `${paddingLeft + 12}px` }}
      >
        {/* Expand/Collapse Icon */}
        <div className="flex items-center justify-center w-5 h-5 mr-2">
          {hasChildren ? (
            <button
              onClick={handleToggleExpand}
              className="p-0.5 rounded hover:bg-muted transition-colors"
              disabled={node.disabled}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4" />
          )}
        </div>

        {/* Checkbox */}
        <Checkbox
          checked={isSelected}
          ref={(el) => {
            if (el && el.querySelector('input')) {
              (el.querySelector('input') as HTMLInputElement).indeterminate = isIndeterminate;
            }
          }}
          onCheckedChange={handleToggleSelect}
          disabled={node.disabled}
          className="mr-3"
        />

        {/* Icon */}
        {node.icon && (
          <div className="flex items-center justify-center w-5 h-5 mr-2 text-muted-foreground">
            {node.icon}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {renderCustomContent ? (
            renderCustomContent(node, level)
          ) : (
            <span className="text-sm font-medium truncate">
              {node.label}
            </span>
          )}
        </div>
      </div>

      {/* Children se renderizan desde Tree.tsx */}
    </div>
  );
};

export default TreeNode;
