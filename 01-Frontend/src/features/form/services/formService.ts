/**
 * Servicio para gestión de formularios - operaciones CRUD
 * Cache manejado por React Query en el hook CRUD
 */
import { CrudService } from '@/shared/services/api';
import { Form } from '../types';


class FormService extends CrudService<Form> {
  constructor() {
    super('Form', {
      idField: ['forMasYea', 'forMasCod']
    });
  }
}

export const formService = new FormService();
