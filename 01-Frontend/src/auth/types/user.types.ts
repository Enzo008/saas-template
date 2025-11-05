/**
 * Tipos relacionados con usuarios para Auth
 * NOTA: Los tipos principales se han movido a @/features/user/types
 * Este archivo mantiene re-exports para compatibilidad
 */

export type {
  User,
  UserBasicInfo,
  UserMenusPermissions,
  Menu,
  Permission
} from '@/features/user/types/user.types';
