import { User } from '@/auth/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  lastActivity: number;
  sessionExpiresAt: number | null;
  setAuth: (auth: Partial<AuthState>) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  updateLastActivity: () => void;
  setSessionExpiration: (expiresAt: number) => void;
  isSessionValid: () => boolean;
}

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  lastActivity: Date.now(),
  sessionExpiresAt: null
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setAuth: (auth) => {
          set((state) => ({
            ...state,
            ...auth,
            lastActivity: Date.now()
          }));
        },

        clearAuth: () => {
          set(initialState);
        },

        setLoading: (loading: boolean) => {
          set((state) => ({ ...state, loading }));
        },

        updateLastActivity: () => {
          set((state) => ({ ...state, lastActivity: Date.now() }));
        },

        setSessionExpiration: (expiresAt: number) => {
          set((state) => ({ ...state, sessionExpiresAt: expiresAt }));
        },

        isSessionValid: () => {
          const { sessionExpiresAt } = get();
          return sessionExpiresAt ? Date.now() < sessionExpiresAt : false;
        }
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          lastActivity: state.lastActivity,
          sessionExpiresAt: state.sessionExpiresAt
        })
      }
    ),
    { name: 'AuthStore' }
  )
);
