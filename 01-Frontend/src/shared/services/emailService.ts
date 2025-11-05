/**
 * Servicio para manejo de emails usando la nueva arquitectura
 * Extiende BaseApiService para manejo unificado de errores y cache
 */

import logger from '@/shared/managers/Logger';
import { 
  Email, 
  SimpleEmailRequest, 
  TemplateEmailRequest, 
  EmailTemplate, 
  WelcomeEmailRequest, 
  NotificationEmailRequest
} from '@/shared/types/email.types';
import { ApiResponse } from '@/shared/types/api';
import { BaseService } from './api';

class EmailService extends BaseService {
  
  constructor() {
    super('Email', {
      retryAttempts: 1, // Solo un intento para emails
      timeout: 30000 // 30 segundos para operaciones de email
    });
  }

  /**
   * Envía un email completo
   */
  sendEmail = async (email: Email): Promise<ApiResponse> => {
    return await this.post<ApiResponse>(this.buildUrl('/send'), email);
  }

  /**
   * Envía un email simple con parámetros básicos
   */
  sendSimpleEmail = async (request: SimpleEmailRequest): Promise<ApiResponse> => {
    return await this.post<ApiResponse>(this.buildUrl('/send-simple'), request);
  }

  /**
   * Envía múltiples emails
   */
  sendBulkEmails = async (emails: Email[]): Promise<ApiResponse> => {
    return await this.post<ApiResponse>(this.buildUrl('/send-bulk'), emails);
  }

  /**
   * Envía un email usando una plantilla
   */
  sendTemplateEmail = async (request: TemplateEmailRequest): Promise<ApiResponse> => {
    return await this.post<ApiResponse>(this.buildUrl('/send-template'), request);
  }

  /**
   * Registra una nueva plantilla de email
   */
  registerTemplate = async (template: EmailTemplate): Promise<ApiResponse> => {
    return await this.post<ApiResponse>(this.buildUrl('/register-template'), template);
  }

  /**
   * Verifica la conectividad del servicio de email
   */
  testConnection = async (): Promise<ApiResponse> => {
    return await this.get<ApiResponse>(this.buildUrl('/test-connection'));
  }

  /**
   * Verifica solo la configuración SMTP sin intentar conectar
   */
  checkConfig = async (): Promise<ApiResponse> => {
    return await this.get<ApiResponse>(this.buildUrl('/check-config'));
  }

  /**
   * Envía un email de bienvenida usando plantilla predefinida
   */
  sendWelcomeEmail = async (request: WelcomeEmailRequest): Promise<ApiResponse> => {
    return await this.post<ApiResponse>(this.buildUrl('/send-welcome'), request);
  }

  /**
   * Envía un email de notificación usando plantilla predefinida
   */
  sendNotificationEmail = async (request: NotificationEmailRequest): Promise<ApiResponse> => {
    return await this.post<ApiResponse>(this.buildUrl('/send-notification'), request);
  }

  /**
   * Envía un email de restablecimiento de contraseña
   */
  sendPasswordResetEmail = async (email: string): Promise<boolean> => {
    try {
      const response = await this.sendSimpleEmail({
        to: email,
        subject: 'Restablecimiento de contraseña',
        body: `Se ha solicitado el restablecimiento de contraseña para su cuenta.
        
Si no solicitó este cambio, ignore este mensaje.
        
Para restablecer su contraseña, haga clic en el siguiente enlace:
[Enlace de restablecimiento]

Este enlace expirará en 24 horas.

Saludos,
El equipo de soporte`,
        isHtml: false
      });
      return response.success;
    } catch (error) {
      logger.error('Error enviando email de restablecimiento', error as Error, { 
        feature: 'email',
        action: 'send_reset_password'
      });
      return false;
    }
  }

  /**
   * Envía un email de confirmación de cambio de contraseña
   */
  sendPasswordChangedConfirmation = async (email: string): Promise<boolean> => {
    try {
      const response = await this.sendSimpleEmail({
        to: email,
        subject: 'Contraseña modificada exitosamente',
        body: `Su contraseña ha sido modificada exitosamente.

Si no realizó este cambio, contacte inmediatamente con el soporte técnico.

Fecha del cambio: ${new Date().toLocaleString('es-ES')}

Saludos,
El equipo de soporte`,
        isHtml: false
      });
      return response.success;
    } catch (error) {
      console.error('Error enviando confirmación de cambio de contraseña:', error);
      return false;
    }
  }

  // Métodos auxiliares para validación y utilidades

  /**
   * Valida una dirección de email
   */
  validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida múltiples direcciones de email separadas por coma
   */
  validateMultipleEmails = (emails: string): { valid: string[]; invalid: string[] } => {
    const emailList = emails.split(',').map(email => email.trim()).filter(email => email);
    const valid: string[] = [];
    const invalid: string[] = [];

    emailList.forEach(email => {
      if (this.validateEmail(email)) {
        valid.push(email);
      } else {
        invalid.push(email);
      }
    });

    return { valid, invalid };
  }

  /**
   * Convierte archivo a base64
   */
  fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remover el prefijo "data:mimetype;base64,"
        const base64 = result.split(',')[1];
        if (base64) {
          resolve(base64);
        } else {
          reject(new Error('No se pudo convertir el archivo a base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Prepara archivos adjuntos desde FileList
   */
  prepareAttachments = async (files: FileList): Promise<Array<{
    fileName: string;
    content: string;
    contentType: string;
  }>> => {
    const attachments = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file) {
        const content = await this.fileToBase64(file);
        
        attachments.push({
          fileName: file.name,
          content,
          contentType: file.type || 'application/octet-stream'
        });
      }
    }
    
    return attachments;
  }

  /**
   * Formatea variables de plantilla desde array a objeto
   */
  formatTemplateVariables = (variables: Array<{ key: string; value: string }>): Record<string, string> => {
    return variables.reduce((acc, { key, value }) => {
      if (key.trim()) {
        acc[key.trim()] = value;
      }
      return acc;
    }, {} as Record<string, string>);
  }

  /**
   * Convierte string separado por comas a array
   */
  stringToEmailArray = (emails: string): string[] => {
    return emails
      .split(',')
      .map(email => email.trim())
      .filter(email => email && this.validateEmail(email));
  }

  /**
   * Genera un email de ejemplo para testing
   */
  generateSampleEmail = (): Email => {
    return {
      to: 'destinatario@ejemplo.com',
      cc: ['copia@ejemplo.com'],
      bcc: ['copia.oculta@ejemplo.com'],
      subject: 'Email de prueba desde la aplicación',
      htmlBody: `
        <h2>¡Hola!</h2>
        <p>Este es un email de prueba enviado desde nuestra aplicación.</p>
        <p>Características incluidas:</p>
        <ul>
          <li>Formato HTML</li>
          <li>Destinatarios múltiples (CC/BCC)</li>
          <li>Contenido estructurado</li>
        </ul>
        <p>Saludos,<br>El equipo de desarrollo</p>
      `,
      body: 'Versión en texto plano del email de prueba.',
      isHighPriority: false,
      fromName: 'Sistema de Pruebas',
      attachments: []
    };
  }

  /**
   * Genera variables de plantilla de ejemplo
   */
  generateSampleTemplateVariables = (): Array<{ key: string; value: string }> => {
    return [
      { key: 'nombre', value: 'Usuario de Prueba' },
      { key: 'empresa', value: 'Mi Empresa' },
      { key: 'fecha', value: new Date().toLocaleDateString('es-ES') },
      { key: 'mensaje', value: 'Este es un mensaje personalizado' }
    ];
  }
}

// Exportar instancia singleton
export const emailService = new EmailService();
export default emailService;