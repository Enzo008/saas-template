/**
 * Shared Components Index
 * Exportaciones organizadas y optimizadas para tree-shaking
 * 
 * IMPORTANTE: Para mejor performance, importa componentes específicos:
 * import { Button } from '@/shared/components/ui/button'
 * import { FormModal } from "./business/forms/components/FormModal";
 * import { Table } from '@/shared/components/data-display/table'
 */

// ===== COMPONENTES CRÍTICOS =====
export { default as ErrorBoundary } from "./feedback/ErrorBoundary";
export { LoadingScreen, SimpleRouteSuspense } from "./loading";
export { StepProgressBar } from "./forms/layouts/StepProgressBar";

// ===== COMPONENTES DE UI ESENCIALES =====
export { Table } from "./tables";
export { default as FormModal } from "./forms/components/FormModal";

// ===== PROVIDERS DE DIALOGS =====
export { DialogProvider, useConfirmationDialog } from "./overlays/dialogs";

// ===== TOGGLES Y UTILIDADES =====
export { LanguageToggle, ThemeToggle } from "./utilities/controls";

// ===== ERROR BOUNDARIES =====
export { withPageErrorBoundary } from "./feedback";