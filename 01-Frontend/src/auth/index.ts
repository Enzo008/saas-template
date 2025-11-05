/**
 * Auth Feature - Exportaciones principales del módulo de autenticación
 */

// Hooks
export { useAuth, useSession } from './hooks';

// Servicios
export { authService } from './services/authService';

// Controller
export { authController } from './controllers/authController';

// Store
export { useAuthStore } from './store/authStore';

// Provider
export { AuthProvider } from './components/AuthProvider';

// Páginas
export { default as LoginPage } from './pages/Login';


// Componentes
export { default as SessionManager } from './components/SessionManager';
export { ProtectedRoute, PrivateRoute, PublicRoute, useAuthGuard } from './components/ProtectedRoute';

// Utilidades
export { storage } from './utils/storage.utils';
export * from './utils/constants';
export * from './utils/error.utils';