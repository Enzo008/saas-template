import { AuditableEntity } from "@/shared";

export interface Position extends AuditableEntity{
  posCod: string;
  posNam: string;
}

export type PositionResponse = Position[];