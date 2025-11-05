/**
 * Service for identity document management - CRUD operations
 */
import { CrudService } from '@/shared/services/api';
import { IdentityDocument } from '../types/identity-document.types';

class IdentityDocumentService extends CrudService<IdentityDocument> {
  constructor() {
    super('IdentityDocument', {
      idField: ['IdeDocCod']  // Updated to match new property name (3 chars per word: Ide-Doc-Cod)
    });
  }
}

export const identityDocumentService = new IdentityDocumentService();
