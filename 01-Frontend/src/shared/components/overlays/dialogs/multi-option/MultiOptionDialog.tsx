import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../ui/alert-dialog";
import { Button } from "../../../ui/button";
import { cn } from "@/lib/utils";

export interface DialogOption {
  /** Texto a mostrar en el botón */
  label: string;
  /** Valor del botón */
  value: string;
  /** Función a ejecutar cuando se hace clic en el botón */
  onClick: () => void;
  /** Variante del botón (default, destructive, outline, etc.) */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  /** Clase CSS adicional para el botón */
  className?: string;
  /** Si es true, este botón cerrará el diálogo automáticamente */
  closeOnClick?: boolean;
}

interface DialogMultiOptionsProps {
  /** Controla si el diálogo está abierto */
  isOpen: boolean;
  /** Función para cambiar el estado de apertura del diálogo */
  onOpenChange: (open: boolean) => void;
  /** Título del diálogo */
  title: string;
  /** Descripción o contenido principal del diálogo */
  description: string;
  /** Opciones/botones a mostrar en el diálogo */
  options: DialogOption[];
  /** Texto para el botón de cancelar. Si es null, no se muestra el botón */
  cancelLabel?: string | null;
  /** Función a ejecutar cuando se cancela el diálogo */
  onCancel?: () => void;
}

export const MultiOptionDialog = ({
  isOpen,
  onOpenChange,
  title,
  description,
  options,
  cancelLabel = "Cancelar",
  onCancel,
}: DialogMultiOptionsProps) => {
  const handleCancel = () => {
    onOpenChange(false);
    onCancel?.();
  };

  const handleOptionClick = (option: DialogOption) => {
    if (option.closeOnClick !== false) {
      onOpenChange(false);
    }
    option.onClick();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open: boolean) => {
      onOpenChange(open);
      if (!open) handleCancel();
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
          {cancelLabel && (
            <AlertDialogCancel onClick={handleCancel}>
              {cancelLabel}
            </AlertDialogCancel>
          )}
          {options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleOptionClick(option)}
              variant={option.variant || "default"}
              className={cn(option.className)}
            >
              {option.label}
            </Button>
          ))}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
