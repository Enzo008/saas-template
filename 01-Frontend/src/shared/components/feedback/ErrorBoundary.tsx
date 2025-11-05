/**
 * Error Boundary básico para compatibilidad
 * Mantiene la funcionalidad original pero integrado con ErrorManager
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from "../ui/button";
import { ErrorManager, ErrorType } from "../../managers/ErrorManager";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  private errorManager = ErrorManager.getInstance();

  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Usar ErrorManager para manejar el error
    this.errorManager.handleError(error, ErrorType.UNKNOWN, {
      componentStack: errorInfo.componentStack,
      boundary: 'ErrorBoundary'
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <h1 className="text-2xl font-semibold mb-4">
            Algo salió mal
          </h1>
          <p className="text-muted-foreground text-center mb-6">
            {this.state.error?.message || 'Ha ocurrido un error inesperado'}
          </p>
          <Button
            variant="default"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            Recargar página
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;