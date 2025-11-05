/**
 * Error Boundaries específicos para diferentes contextos
 * Proporcionan manejo de errores más granular y específico
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { ErrorManager, ErrorType } from '@/shared/managers/ErrorManager';

// Tipos base para error boundaries
interface BaseErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface BaseErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

// Error Boundary base con funcionalidades comunes
abstract class BaseErrorBoundary extends Component<BaseErrorBoundaryProps, BaseErrorBoundaryState> {
  private resetTimeoutId: number | null = null;
  private errorManager = ErrorManager.getInstance();

  public state: BaseErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    eventId: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<BaseErrorBoundaryState> {
    return {
      hasError: true,
      error,
      eventId: `error-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Usar ErrorManager para manejar el error
    this.errorManager.handleError(error, ErrorType.UNKNOWN, {
      componentStack: errorInfo.componentStack,
      eventId: this.state.eventId,
      boundary: this.constructor.name
    });
    
    // Callback personalizado
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  public componentDidUpdate(prevProps: BaseErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetOnPropsChange) {
        this.resetErrorBoundary();
      }
    }
  }

  protected resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        eventId: null,
      });
    }, 100);
  };

  protected abstract renderErrorFallback(): ReactNode;

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return this.renderErrorFallback();
    }

    return this.props.children;
  }
}

// Error Boundary para formularios
export class FormErrorBoundary extends BaseErrorBoundary {
  protected renderErrorFallback(): ReactNode {
    const { error } = this.state;

    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Error en el Formulario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al procesar el formulario. Por favor, intente nuevamente.
          </p>
          
          {error && (
            <details className="text-xs bg-muted p-2 rounded">
              <summary className="cursor-pointer font-medium">Detalles del error</summary>
              <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>
            </details>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={this.resetErrorBoundary}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
}

// Error Boundary para tablas
export class TableErrorBoundary extends BaseErrorBoundary {
  protected renderErrorFallback(): ReactNode {
    const { error } = this.state;

    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error al cargar los datos</h3>
          <p className="text-muted-foreground mb-4">
            No se pudieron cargar los datos de la tabla. Verifique su conexión e intente nuevamente.
          </p>
          
          {error && (
            <details className="text-xs bg-muted p-2 rounded mb-4 text-left">
              <summary className="cursor-pointer font-medium">Detalles del error</summary>
              <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>
            </details>
          )}

          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={this.resetErrorBoundary}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Recargar datos
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
}

// Error Boundary para páginas completas
export class PageErrorBoundary extends BaseErrorBoundary {
  protected renderErrorFallback(): ReactNode {
    const { error } = this.state;

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Página no disponible</h1>
            <p className="text-muted-foreground mb-6">
              Ha ocurrido un error inesperado. La página no se puede mostrar en este momento.
            </p>
            
            {error && (
              <details className="text-xs bg-muted p-2 rounded mb-6 text-left">
                <summary className="cursor-pointer font-medium">Detalles del error</summary>
                <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>
              </details>
            )}

            <div className="flex flex-col gap-2">
              <Button
                onClick={this.resetErrorBoundary}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </Button>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Ir al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

// Error Boundary para componentes de carga de datos
export class DataErrorBoundary extends BaseErrorBoundary {
  protected renderErrorFallback(): ReactNode {
    const { error } = this.state;

    return (
      <div className="p-4 border border-destructive rounded-lg bg-destructive/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-destructive mb-1">Error al cargar datos</h4>
            <p className="text-sm text-muted-foreground mb-3">
              No se pudieron cargar los datos solicitados.
            </p>
            
            {error && (
              <details className="text-xs bg-muted p-2 rounded mb-3">
                <summary className="cursor-pointer font-medium">Detalles del error</summary>
                <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>
              </details>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={this.resetErrorBoundary}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

// Error Boundary para modales
export class ModalErrorBoundary extends BaseErrorBoundary {
  protected renderErrorFallback(): ReactNode {
    const { error } = this.state;

    return (
      <div className="p-6 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
        <h3 className="font-semibold mb-2">Error en el modal</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Ha ocurrido un error al mostrar este contenido.
        </p>
        
        {error && (
          <details className="text-xs bg-muted p-2 rounded mb-4 text-left">
            <summary className="cursor-pointer font-medium">Detalles del error</summary>
            <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>
          </details>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={this.resetErrorBoundary}
          className="flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
      </div>
    );
  }
}

// Hook para usar error boundaries programáticamente
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return {
    captureError,
    resetError,
  };
}

// HOCs para envolver componentes con error boundaries específicos
export const withFormErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <FormErrorBoundary>
      <Component {...(props as P)} ref={ref} />
    </FormErrorBoundary>
  ));
  
  WrappedComponent.displayName = `withFormErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export const withTableErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <TableErrorBoundary>
      <Component {...(props as P)} ref={ref} />
    </TableErrorBoundary>
  ));
  
  WrappedComponent.displayName = `withTableErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export const withPageErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <PageErrorBoundary>
      <Component {...(props as P)} ref={ref} />
    </PageErrorBoundary>
  ));
  
  WrappedComponent.displayName = `withPageErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export const withDataErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <DataErrorBoundary>
      <Component {...(props as P)} ref={ref} />
    </DataErrorBoundary>
  ));
  
  WrappedComponent.displayName = `withDataErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export const withModalErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <ModalErrorBoundary>
      <Component {...(props as P)} ref={ref} />
    </ModalErrorBoundary>
  ));
  
  WrappedComponent.displayName = `withModalErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};