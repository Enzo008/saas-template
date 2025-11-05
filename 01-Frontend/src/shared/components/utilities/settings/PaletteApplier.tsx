/**
 * PaletteApplier - Componente que aplica paletas dinámicamente
 * Se monta en el nivel superior de la aplicación para aplicar la paleta seleccionada
 */

import { useAppConfig } from '../../../providers/AppConfigProvider';
import { useDynamicPalette } from '../../../hooks/theme/useDynamicPalette';

export function PaletteApplier() {
  const currentPalette = useAppConfig().getCurrentPalette();

  // Aplicar la paleta actual
  useDynamicPalette(currentPalette);

  // Este componente no renderiza nada, solo aplica estilos
  return null;
}

export default PaletteApplier;