/**
 * Componente para gestionar fields de formularios dinámicos
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { Plus, Edit, Trash2, GripVertical, Copy, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { FormField, FieldType, FieldFormData, FormFieldDraft } from '../types';
import { FormFieldModal } from './FormFieldModal';
import { FieldTemplateSelector } from './FieldTemplateSelector';
import { type FieldTemplate } from '../config/fieldTemplates';
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface FormFieldManagerProps {
  // fields del formulario (simplificado)
  fields: FormFieldDraft[];
  onAddField: (fieldData: FormFieldDraft) => void;
  onEditField: (fieldId: string, fieldData: FormFieldDraft) => void;
  onDeleteField: (fieldId: string) => void;
  onReorderFields: (activeId: string, overId: string) => void;
  nextFieldId: number;
}

// Componente para elementos arrastrables
interface SortableFieldItemProps {
  field: FormField | FormFieldDraft;
  identifier: string | number;
  onEdit: (field: FormField | FormFieldDraft) => void;
  onDelete: (identifier: string | number) => void;
  onDuplicate: (field: FormField | FormFieldDraft) => void;
  getFieldTypeLabel: (type: FieldType) => string;
}

const SortableFieldItem = ({
  field,
  identifier,
  onEdit,
  onDelete,
  onDuplicate,
  getFieldTypeLabel
}: SortableFieldItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: identifier });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };


  // Ambos tipos usan las mismas propiedades del backend
  const fieldOrder = field.forFieOrd;
  const fieldLabel = field.forFieLab;
  const fieldType = field.forFieTyp;
  const fieldRequired = field.forFieReq;
  const fieldHelp = field.forFieHel || '';

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group hover:shadow-md transition-shadow ${isDragging ? 'shadow-lg' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="text-xs">
              #{fieldOrder}
            </Badge>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{fieldLabel}</span>
              <Badge variant="secondary" className="text-xs">
                {getFieldTypeLabel(fieldType)}
              </Badge>
              {fieldRequired && (
                <Badge variant="destructive" className="text-xs">
                  Requerido
                </Badge>
              )}
            </div>
            {fieldHelp && (
              <p className="text-sm text-muted-foreground mt-1">{fieldHelp}</p>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(field)}
              className="h-8 w-8 p-0"
              title="Duplicar field"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(field)}
              className="h-8 w-8 p-0"
              title="Editar campo"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(identifier)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              title="Eliminar campo"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const FormFieldManager = ({
  fields,
  onAddField,
  onEditField,
  onDeleteField,
  onReorderFields,
  nextFieldId
}: FormFieldManagerProps) => {
  const [editingField, setEditingField] = useState<FormFieldDraft | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemplatesSelectorOpen, setIsTemplatesSelectorOpen] = useState(false);
  const templatesTriggerRef = useRef<HTMLButtonElement>(null);

  // Calcular el número actual de fields
  const currentFieldsCount = fields.length;

  // Handlers para agregar fields
  const handleAddField = useCallback(() => {
    setEditingField(null);
    setIsModalOpen(true);
  }, []);

  // Handlers para editar fields
  const handleEditField = useCallback((field: FormField | FormFieldDraft) => {
    setEditingField(field as FormFieldDraft);
    setIsModalOpen(true);
  }, []);

  // Handlers para eliminar fields
  const handleDeleteField = useCallback((identifier: string | number) => {
    onDeleteField(identifier.toString());
  }, [onDeleteField]);

  // Handlers para duplicar fields
  const handleDuplicateField = useCallback((field: FormField | FormFieldDraft) => {
    const newField: FormFieldDraft = {
      ...(field as FormFieldDraft),
      id: nextFieldId.toString(),
      forFieOrd: fields.length + 1,
      forFieLab: `${field.forFieLab} (Copia)`
    };
    onAddField(newField);
  }, [fields.length, nextFieldId, onAddField]);

  // Handlers para guardar fields (desde el modal)
  const handleSaveField = useCallback((fieldData: FieldFormData) => {
    if (editingField) {
      // Editando campo existente
      onEditField(editingField.id, { ...fieldData, id: editingField.id });
    } else {
      // Agregando nuevo campo
      const newField: FormFieldDraft = {
        ...fieldData,
        id: nextFieldId.toString(),
        forFieOrd: fields.length + 1
      };
      onAddField(newField);
    }

    setIsModalOpen(false);
    setEditingField(null);
  }, [editingField, onEditField, onAddField, nextFieldId, fields.length]);

  // Handlers para cerrar modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingField(null);
  }, []);

  // Handlers para templates
  const handleOpenTemplates = useCallback(() => {
    setIsTemplatesSelectorOpen(true);
  }, []);

  const handleCloseTemplates = useCallback(() => {
    setIsTemplatesSelectorOpen(false);
  }, []);

  const handleSelectTemplate = useCallback((template: FieldTemplate) => {
    const newField: FormFieldDraft = {
      ...template.template,
      id: nextFieldId.toString(),
      forFieOrd: fields.length + 1
    };
    onAddField(newField);
    setIsTemplatesSelectorOpen(false);
  }, [nextFieldId, fields.length, onAddField]);

  // Configurar sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Handler para reordenar fields con drag & drop
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Usar la función de reordenamiento que maneja todo correctamente
    onReorderFields(active.id.toString(), over.id.toString());
  }, [onReorderFields]);

  // Función para obtener etiquetas de tipos de campo
  const getFieldTypeLabel = useMemo(() => {
    const typeLabels: Record<string, string> = {
      TEXT: 'Texto',
      TEXTAREA: 'Área de texto',
      NUMBER: 'Número',
      EMAIL: 'Correo electrónico',
      PASSWORD: 'Contraseña',
      SELECT: 'Lista desplegable',
      RADIO: 'Opción única',
      CHECKBOX: 'Casilla de verificación',
      DATE: 'Fecha',
      TIME: 'Hora',
      DATETIME: 'Fecha y hora',
      FILE: 'Archivo',
      HIDDEN: 'Campo oculto'
    };
    return (type: FieldType): string => typeLabels[type] || type;
  }, []);

  // Memoizar los IDs de los fields para el contexto de drag & drop
  const fieldIds = useMemo(() => {
    return fields.map(field => field.id);
  }, [fields]);

  // Memoizar los fields ordenados
  const sortedFields = useMemo(() => {
    return [...fields].sort((a, b) => (a.forFieOrd || 0) - (b.forFieOrd || 0));
  }, [fields]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            fields del Formulario
            {currentFieldsCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {currentFieldsCount}
              </Badge>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            {currentFieldsCount === 0
              ? 'Comienza agregando fields a tu formulario'
              : `${currentFieldsCount} campo${currentFieldsCount !== 1 ? 's' : ''} configurado${currentFieldsCount !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            ref={templatesTriggerRef}
            onClick={handleOpenTemplates} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Templates
          </Button>
          <Button onClick={handleAddField} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Field Personalizado
          </Button>
        </div>
      </div>

      {/* Lista de fields */}
      <div className="space-y-3">
        {currentFieldsCount === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center text-muted-foreground">
                <p>No hay fields configurados</p>
                <p className="text-sm">Haz clic en "Agregar Campo" para comenzar</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {sortedFields.map((field) => {
                  const identifier = field.id;
                  return (
                    <SortableFieldItem
                      key={identifier}
                      field={field}
                      identifier={identifier}
                      onEdit={handleEditField}
                      onDelete={handleDeleteField}
                      onDuplicate={handleDuplicateField}
                      getFieldTypeLabel={getFieldTypeLabel}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Modal para agregar/editar fields */}
      <FormFieldModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveField}
        field={editingField}
        isEditing={!!editingField}
        fieldOrder={editingField ? editingField.forFieOrd : fields.length + 1}
      />

      {/* Selector de templates */}
      <FieldTemplateSelector
        isOpen={isTemplatesSelectorOpen}
        onClose={handleCloseTemplates}
        onSelectTemplate={handleSelectTemplate}
        triggerElement={templatesTriggerRef.current}
      />
    </div>
  );
};
