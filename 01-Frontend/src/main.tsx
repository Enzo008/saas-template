import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Importar la configuración de i18n antes de renderizar la aplicación
import './shared/i18n';

// Importar configuración simplificada de React Query
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createQueryClient } from '@/shared/config/reactQuery';
import { env } from '@/shared/config/env';

// Importar estilos de toasts (el ToastContainer se maneja en NotificationProvider)
import 'react-toastify/dist/ReactToastify.css';

// Crear cliente de React Query
const queryClient = createQueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
      <App />
      {env.isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
);
