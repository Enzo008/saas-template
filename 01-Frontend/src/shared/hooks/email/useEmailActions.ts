/**
 * Hook especializado para acciones de email
 * Utiliza el sistema unificado de mutaciones y notificaciones
 */

import { useApiMutation } from '@/shared/hooks/api/useApiMutation';
import { emailService } from '@/shared/services';
import { UseFormReturn } from 'react-hook-form';

/**
 * Opciones para el hook de acciones de email
 */
interface UseEmailActionsOptions {
  // Formularios para reset automático
  simpleForm?: UseFormReturn<any> | undefined;
  completeForm?: UseFormReturn<any> | undefined;
  templateForm?: UseFormReturn<any> | undefined;
  registerForm?: UseFormReturn<any> | undefined;
  
  // Callbacks personalizados
  onEmailSent?: () => void;
  onConnectionTested?: (success: boolean) => void;
  onConfigChecked?: (success: boolean) => void;
}

/**
 * Hook para acciones de email con configuración unificada
 * 
 * Proporciona mutaciones pre-configuradas para todas las operaciones de email:
 * - Envío de emails (simple, completo, plantilla, predefinidos)
 * - Gestión de plantillas
 * - Pruebas de conexión y configuración
 * - Reset automático de formularios
 * - Notificaciones automáticas
 * 
 * @param options Configuración opcional del hook
 * @returns Objeto con todas las mutaciones de email disponibles
 */
export const useEmailActions = (options: UseEmailActionsOptions = {}) => {
  const {
    simpleForm,
    completeForm,
    templateForm,
    registerForm,
    onEmailSent,
    onConnectionTested,
    onConfigChecked
  } = options;

  // Mutaciones para envío de emails
  const sendSimpleEmail = useApiMutation({
    mutationFn: emailService.sendSimpleEmail,
    notifications: {
      successMessage: 'Email simple enviado exitosamente',
      useTranslation: false
    },
    form: {
      formHook: simpleForm || undefined,
      resetOnSuccess: true
    },
    onSuccess: () => {
      onEmailSent?.();
    }
  });

  const sendCompleteEmail = useApiMutation({
    mutationFn: emailService.sendEmail,
    notifications: {
      successMessage: 'Email completo enviado exitosamente',
      useTranslation: false
    },
    form: {
      formHook: completeForm || undefined,
      resetOnSuccess: true
    },
    onSuccess: () => {
      onEmailSent?.();
    }
  });

  const sendTemplateEmail = useApiMutation({
    mutationFn: emailService.sendTemplateEmail,
    notifications: {
      successMessage: 'Email con plantilla enviado exitosamente',
      useTranslation: false
    },
    form: {
      formHook: templateForm || undefined,
      resetOnSuccess: true
    },
    onSuccess: () => {
      onEmailSent?.();
    }
  });

  const sendBulkEmails = useApiMutation({
    mutationFn: emailService.sendBulkEmails,
    notifications: {
      successMessage: 'Emails masivos enviados exitosamente',
      errorMessage: 'Error al enviar emails masivos',
      useTranslation: false
    },
    onSuccess: () => {
      onEmailSent?.();
    }
  });

  // Mutaciones para emails predefinidos
  const sendWelcomeEmail = useApiMutation({
    mutationFn: emailService.sendWelcomeEmail,
    notifications: {
      successMessage: 'Email de bienvenida enviado',
      useTranslation: false
    }
  });

  const sendNotificationEmail = useApiMutation({
    mutationFn: emailService.sendNotificationEmail,
    notifications: {
      successMessage: 'Email de notificación enviado',
      useTranslation: false
    }
  });

  // Mutación para gestión de plantillas
  const registerTemplate = useApiMutation({
    mutationFn: emailService.registerTemplate,
    notifications: {
      successMessage: 'Plantilla registrada exitosamente',
      useTranslation: false
    },
    form: {
      formHook: registerForm || undefined,
      resetOnSuccess: true
    }
  });

  // Mutaciones para pruebas y configuración
  const testConnection = useApiMutation({
    mutationFn: emailService.testConnection,
    notifications: {
      successMessage: 'Conexión SMTP exitosa',
      errorMessage: 'Error de conexión SMTP',
      useTranslation: false
    },
    onSuccess: () => {
      onConnectionTested?.(true);
    },
    onError: () => {
      onConnectionTested?.(false);
    }
  });

  const checkConfig = useApiMutation({
    mutationFn: emailService.checkConfig,
    notifications: {
      successMessage: 'Configuración SMTP válida',
      errorMessage: 'Error en configuración SMTP',
      useTranslation: false
    },
    onSuccess: () => {
      onConfigChecked?.(true);
    },
    onError: () => {
      onConfigChecked?.(false);
    }
  });

  // Helpers para casos de uso comunes
  const sendPasswordReset = useApiMutation({
    mutationFn: (email: string) => emailService.sendPasswordResetEmail(email),
    notifications: {
      successMessage: 'Email de restablecimiento enviado',
      errorMessage: 'Error al enviar email de restablecimiento',
      useTranslation: false
    }
  });

  const sendPasswordChanged = useApiMutation({
    mutationFn: (email: string) => emailService.sendPasswordChangedConfirmation(email),
    notifications: {
      successMessage: 'Confirmación de cambio de contraseña enviada',
      errorMessage: 'Error al enviar confirmación',
      useTranslation: false
    }
  });

  return {
    // Envío de emails
    sendSimpleEmail,
    sendCompleteEmail,
    sendTemplateEmail,
    sendBulkEmails,
    
    // Emails predefinidos
    sendWelcomeEmail,
    sendNotificationEmail,
    
    // Gestión de plantillas
    registerTemplate,
    
    // Pruebas y configuración
    testConnection,
    checkConfig,
    
    // Helpers para casos comunes
    sendPasswordReset,
    sendPasswordChanged,
    
    // Estados útiles para UI
    isAnyLoading: [
      sendSimpleEmail.isPending,
      sendCompleteEmail.isPending,
      sendTemplateEmail.isPending,
      sendBulkEmails.isPending,
      sendWelcomeEmail.isPending,
      sendNotificationEmail.isPending,
      registerTemplate.isPending,
      testConnection.isPending,
      checkConfig.isPending,
      sendPasswordReset.isPending,
      sendPasswordChanged.isPending
    ].some(Boolean),
    
    // Errores consolidados
    errors: {
      sendSimpleEmail: sendSimpleEmail.error,
      sendCompleteEmail: sendCompleteEmail.error,
      sendTemplateEmail: sendTemplateEmail.error,
      sendBulkEmails: sendBulkEmails.error,
      sendWelcomeEmail: sendWelcomeEmail.error,
      sendNotificationEmail: sendNotificationEmail.error,
      registerTemplate: registerTemplate.error,
      testConnection: testConnection.error,
      checkConfig: checkConfig.error,
      sendPasswordReset: sendPasswordReset.error,
      sendPasswordChanged: sendPasswordChanged.error
    }
  };
};

/**
 * Hook simplificado para casos de uso básicos
 */
export const useSimpleEmailActions = () => {
  return useEmailActions();
};
