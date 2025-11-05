/**
 * Componente de tooltip para mostrar texto de ayuda en campos de formulario
 * Muestra un icono "i" que al hacer hover o click muestra el mensaje de ayuda
 */
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';

interface HelpTooltipProps {
  content: string;
  fieldName?: string;
}

export const HelpTooltip = ({ content, fieldName }: HelpTooltipProps) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger
          type="button"
          className="inline-flex items-center justify-center rounded-full hover:bg-accent transition-colors"
          aria-label={`Ayuda para ${fieldName || 'este campo'}`}
          onClick={(e) => e.preventDefault()} // Prevenir submit del formulario
        >
          <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          className="max-w-xs text-sm"
        >
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default HelpTooltip;
