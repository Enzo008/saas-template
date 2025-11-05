/**
 * Tipos para el sistema de envío de emails
 * Basados en los modelos del EmailController
 */

/**
 * Archivo adjunto para email
 */
export interface EmailAttachment {
  fileName: string;
  content: Uint8Array | string; // Base64 string o array de bytes
  contentType: string;
  isInline?: boolean;
  contentId?: string;
}

/**
 * Modelo principal para envío de emails
 */
export interface Email {
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  body?: string;
  htmlBody?: string;
  isHighPriority?: boolean;
  attachments?: EmailAttachment[];
  template?: string;
  templateVariables?: Record<string, string>;
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
}

/**
 * Resultado del envío de email
 */
export interface EmailSendResult {
  success: boolean;
  message: string;
  emailId?: string;
  sentAt: string; // ISO string date
  errorDetails?: string;
}

/**
 * Plantilla de email
 */
export interface EmailTemplate {
  name: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  availableVariables?: string[];
  description?: string;
  isActive?: boolean;
}

/**
 * Solicitud para envío de email simple
 */
export interface SimpleEmailRequest {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

/**
 * Solicitud para envío de email con plantilla
 */
export interface TemplateEmailRequest {
  templateName: string;
  to: string;
  variables?: Record<string, string>;
}

/**
 * Solicitud para email de bienvenida
 */
export interface WelcomeEmailRequest {
  email: string;
  name: string;
}

/**
 * Solicitud para email de notificación
 */
export interface NotificationEmailRequest {
  to: string;
  title?: string;
  message: string;
}

/**
 * Respuesta estándar de operaciones de email
 */
export interface EmailOperationResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

/**
 * Estado de conectividad del servicio de email
 */
export interface EmailConnectionStatus {
  isConnected: boolean;
  lastChecked: string;
  serverInfo?: string;
  error?: string;
}

/**
 * Opciones para el hook de email
 */
export interface UseEmailOptions {
  onSuccess?: (result: EmailSendResult) => void;
  onError?: (error: Error) => void;
  showNotifications?: boolean;
}

/**
 * Formulario para email simple
 */
export interface EmailSimpleForm {
  to: string;
  subject: string;
  body: string;
  isHtml: boolean;
}

/**
 * Formulario para email completo
 */
export interface EmailCompleteForm {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body?: string;
  htmlBody?: string;
  isHighPriority: boolean;
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
}

/**
 * Formulario para email con plantilla
 */
export interface EmailTemplateForm {
  templateName: string;
  to: string;
  variables: Array<{ key: string; value: string }>;
}

/**
 * Formulario para registrar plantilla
 */
export interface EmailTemplateRegistrationForm {
  name: string;
  htmlBody: string;
}

/**
 * Formulario para email de bienvenida
 */
export interface WelcomeEmailForm {
  email: string;
  name: string;
}

/**
 * Formulario para email de notificación
 */
export interface NotificationEmailForm {
  to: string;
  message: string;
}

/**
 * Categorías de funcionalidades de email
 */
export type EmailDemoCategory = 
  | 'simple' 
  | 'complete' 
  | 'template' 
  | 'bulk' 
  | 'predefined' 
  | 'connection';

/**
 * Configuración de demo de funcionalidad
 */
export interface EmailDemoConfig {
  category: EmailDemoCategory;
  title: string;
  description: string;
  icon: string;
  component: React.ComponentType;
}
