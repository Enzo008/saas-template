/**
 * Servicio para gestión de repositorio - operaciones CRUD
 */
import { CrudService } from '@/shared/services/api';
import { Repository } from '../types/repository.types';

class RepositoryService extends CrudService<Repository> {
  constructor() {
    super('Repository', {
      idField: ['repAno','repCod']
    });
  }
}

export const repositoryService = new RepositoryService();
