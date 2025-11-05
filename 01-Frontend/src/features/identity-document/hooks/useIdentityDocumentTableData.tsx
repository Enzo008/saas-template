/**
 * Table data hook for identity documents - simplified configuration
 */
import { createTableDataHook } from '@/shared/hooks';
import { IdentityDocument } from "../types/identity-document.types";

/**
 * Table hook for identity documents with standard actions (view, edit, delete)
 */
export const useIdentityDocumentTableData = createTableDataHook<IdentityDocument>({
  columns: [
    { key: 'ideDocNam', header: ['Nombre', 'Name'] },
    { key: 'ideDocAbr', header: ['Abreviatura', 'Abbreviation'] }
  ]
});
