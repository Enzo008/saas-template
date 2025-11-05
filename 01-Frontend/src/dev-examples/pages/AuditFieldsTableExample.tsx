/**
 * Ejemplo de uso del sistema de campos de auditoría en tablas
 * 
 * ⚠️ DEPRECATED: Este ejemplo usa el sistema viejo de useTableColumnsFactory
 * TODO: Actualizar para usar createTableDataHook
 * 
 * Ver features/position o features/user para ejemplos actualizados del nuevo sistema.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function AuditFieldsTableExample() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Ejemplo Deshabilitado Temporalmente</CardTitle>
          <CardDescription>
            Este ejemplo necesita ser actualizado para usar el nuevo sistema createTableDataHook
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              El sistema de tablas ha sido simplificado y unificado.
            </p>
            <p className="text-sm">
              <strong>Ver ejemplos actualizados en:</strong>
            </p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li><code>features/position/hooks/usePositionTableData.tsx</code></li>
              <li><code>features/user/hooks/useUserTableData.tsx</code></li>
              <li><code>features/rol/hooks/useRolTableData.tsx</code></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
