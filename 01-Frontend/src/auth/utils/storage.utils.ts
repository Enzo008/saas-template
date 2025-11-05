import { User } from '@/auth/types';

export const AUTH_STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  SESSION_TYPE: 'sessionType',
  REMEMBERED_EMAIL: 'rememberedEmail',
  LAST_ACTIVITY: 'lastActivity',
} as const;

export const storage = {
  getToken: (): string | null => {
    return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  },

  setToken: (token: string): void => {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser: (user: User): void => {
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
  },

  clearAuth: (): void => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    localStorage.removeItem(AUTH_STORAGE_KEYS.SESSION_TYPE);
    localStorage.removeItem(AUTH_STORAGE_KEYS.LAST_ACTIVITY);
    // No eliminamos REMEMBERED_EMAIL para que persista entre sesiones
  },

  // Session type management
  setSessionType: (type: 'normal' | 'extended'): void => {
    localStorage.setItem(AUTH_STORAGE_KEYS.SESSION_TYPE, type);
  },

  getSessionType: (): string | null => {
    return localStorage.getItem(AUTH_STORAGE_KEYS.SESSION_TYPE);
  },

  // Remembered email management
  setRememberedEmail: (email: string): void => {
    localStorage.setItem(AUTH_STORAGE_KEYS.REMEMBERED_EMAIL, email);
  },

  getRememberedEmail: (): string | null => {
    return localStorage.getItem(AUTH_STORAGE_KEYS.REMEMBERED_EMAIL);
  },

  clearRememberedEmail: (): void => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBERED_EMAIL);
  },

  // Activity tracking
  setLastActivity: (): void => {
    const now = Date.now().toString();
    localStorage.setItem(AUTH_STORAGE_KEYS.LAST_ACTIVITY, now);
  },

  getLastActivity: (): number => {
    const activity = localStorage.getItem(AUTH_STORAGE_KEYS.LAST_ACTIVITY);
    return activity ? parseInt(activity, 10) : Date.now();
  }
};
