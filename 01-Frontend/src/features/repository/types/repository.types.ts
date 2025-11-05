import { AuditableEntity } from "@/shared";

export interface Repository extends AuditableEntity{
  repAno: string;
  repCod: string;
  repNom: string;
  ubiNom: string;
}

export type RepositoryResponse = Repository[];
