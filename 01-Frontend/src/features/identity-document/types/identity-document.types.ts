/**
 * Types for identity document management (matching backend IdentityDocument model)
 */

import { AuditableEntity } from "@/shared";

export interface IdentityDocument extends AuditableEntity {
  IdeDocCod?: string;    // Identity Document Code
  IdeDocNam?: string;    // Identity Document Name
  IdeDocAbr?: string;    // Identity Document Abbreviation
}

export type IdentityDocumentResponse = IdentityDocument[];
