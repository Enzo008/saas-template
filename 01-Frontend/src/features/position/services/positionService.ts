/**
 * Servicio para gestión de cargos - operaciones CRUD
 */
import { CrudService } from '@/shared/services/api';
import { Position } from '../types/position.types';

class PositionService extends CrudService<Position> {
  constructor() {
    super('Position', {
      idField: ['posCod']
    });
  }
}

export const positionService = new PositionService();
