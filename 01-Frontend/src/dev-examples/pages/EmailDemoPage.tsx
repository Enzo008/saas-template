/**
 * Página de demostración del sistema de emails - SISTEMA UNIFICADO
 * Muestra todas las funcionalidades con el nuevo sistema de hooks optimizado
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Mail, 
  Send, 
  FileText, 
  Users, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react';

import { useEmailActions } from '@/shared/hooks/email/useEmailActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';

// Schemas de validación con Zod
const simpleEmailSchema = z.object({
  to: z.string().email('Email válido requerido'),
  subject: z.string().min(1, 'Asunto requerido'),
  body: z.string().min(1, 'Mensaje requerido'),
  isHtml: z.boolean().default(false)
});

const completeEmailSchema = z.object({
  to: z.string().email('Email válido requerido'),
  cc: z.string().email('Email válido requerido').optional().or(z.literal('')),
  bcc: z.string().email('Email válido requerido').optional().or(z.literal('')),
  subject: z.string().min(1, 'Asunto requerido'),
  body: z.string().optional(),
  htmlBody: z.string().optional(),
  isHighPriority: z.boolean().default(false),
  fromEmail: z.string().email('Email válido requerido').optional().or(z.literal('')),
  fromName: z.string().optional(),
  replyTo: z.string().email('Email válido requerido').optional().or(z.literal(''))
});

const templateEmailSchema = z.object({
  to: z.string().email('Email válido requerido'),
  templateName: z.string().min(1, 'Nombre de plantilla requerido'),
  variables: z.record(z.string()).optional()
});

const registerTemplateSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  subject: z.string().min(1, 'Asunto requerido'),
  body: z.string().min(1, 'Cuerpo requerido'),
  description: z.string().optional()
});

const welcomeEmailSchema = z.object({
  to: z.string().email('Email válido requerido'),
  userName: z.string().min(1, 'Nombre de usuario requerido'),
  welcomeMessage: z.string().optional()
});

const notificationEmailSchema = z.object({
  to: z.string().email('Email válido requerido'),
  notificationType: z.string().min(1, 'Tipo de notificación requerido'),
  message: z.string().min(1, 'Mensaje requerido'),
  priority: z.enum(['low', 'normal', 'high']).default('normal')
});

const bulkEmailSchema = z.object({
  recipients: z.string().min(1, 'Lista de destinatarios requerida'),
  subject: z.string().min(1, 'Asunto requerido'),
  body: z.string().min(1, 'Mensaje requerido'),
  isHtml: z.boolean().default(false)
});

// Tipos inferidos
type SimpleEmailForm = z.infer<typeof simpleEmailSchema>;
type CompleteEmailForm = z.infer<typeof completeEmailSchema>;
type TemplateEmailForm = z.infer<typeof templateEmailSchema>;
type RegisterTemplateForm = z.infer<typeof registerTemplateSchema>;
type WelcomeEmailForm = z.infer<typeof welcomeEmailSchema>;
type NotificationEmailForm = z.infer<typeof notificationEmailSchema>;
type BulkEmailForm = z.infer<typeof bulkEmailSchema>;

export default function EmailDemoPage() {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});

  // Formularios
  const simpleForm = useForm<SimpleEmailForm>({
    resolver: zodResolver(simpleEmailSchema),
    defaultValues: { to: '', subject: '', body: '', isHtml: false }
  });

  const completeForm = useForm<CompleteEmailForm>({
    resolver: zodResolver(completeEmailSchema),
    defaultValues: {
      to: '', cc: '', bcc: '', subject: '', body: '', htmlBody: '',
      isHighPriority: false, fromEmail: '', fromName: '', replyTo: ''
    }
  });

  const templateForm = useForm<TemplateEmailForm>({
    resolver: zodResolver(templateEmailSchema),
    defaultValues: { to: '', templateName: '', variables: {} }
  });

  const registerForm = useForm<RegisterTemplateForm>({
    resolver: zodResolver(registerTemplateSchema),
    defaultValues: { name: '', subject: '', body: '', description: '' }
  });

  const welcomeForm = useForm<WelcomeEmailForm>({
    resolver: zodResolver(welcomeEmailSchema),
    defaultValues: { to: '', userName: '', welcomeMessage: '' }
  });

  const notificationForm = useForm<NotificationEmailForm>({
    resolver: zodResolver(notificationEmailSchema),
    defaultValues: { to: '', notificationType: '', message: '', priority: 'normal' }
  });

  const bulkForm = useForm<BulkEmailForm>({
    resolver: zodResolver(bulkEmailSchema),
    defaultValues: { recipients: '', subject: '', body: '', isHtml: false }
  });

  // Hook unificado para todas las acciones de email
  const emailActions = useEmailActions({
    simpleForm,
    completeForm,
    templateForm,
    registerForm,
    onConnectionTested: (success) => {
      setConnectionStatus(success ? 'connected' : 'error');
    },
    onEmailSent: () => {
      console.log('Email enviado exitosamente');
    }
  });

  // Handlers
  const handleSimpleEmail = (data: SimpleEmailForm) => {
    emailActions.sendSimpleEmail.mutate(data);
  };

  const handleCompleteEmail = (data: CompleteEmailForm) => {
    const emailData = {
      to: data.to,
      subject: data.subject,
      isHighPriority: data.isHighPriority,
      ...(data.cc && { cc: [data.cc] }),
      ...(data.bcc && { bcc: [data.bcc] }),
      ...(data.body && { body: data.body }),
      ...(data.htmlBody && { htmlBody: data.htmlBody }),
      ...(data.fromEmail && { fromEmail: data.fromEmail }),
      ...(data.fromName && { fromName: data.fromName }),
      ...(data.replyTo && { replyTo: data.replyTo })
    };
    emailActions.sendCompleteEmail.mutate(emailData);
  };

  const handleTemplateEmail = (data: TemplateEmailForm) => {
    const templateData = {
      to: data.to,
      templateName: data.templateName,
      variables: { ...templateVariables, ...data.variables }
    };
    emailActions.sendTemplateEmail.mutate(templateData);
  };

  const handleRegisterTemplate = (data: RegisterTemplateForm) => {
    const templateData = {
      name: data.name,
      subject: data.subject,
      htmlBody: data.body,
      textBody: data.body,
      ...(data.description && { description: data.description })
    };
    emailActions.registerTemplate.mutate(templateData);
  };

  const handleWelcomeEmail = (data: WelcomeEmailForm) => {
    const welcomeData = {
      email: data.to,
      name: data.userName
    };
    emailActions.sendWelcomeEmail.mutate(welcomeData);
  };

  const handleNotificationEmail = (data: NotificationEmailForm) => {
    const notificationData = {
      to: data.to,
      title: data.notificationType,
      message: data.message
    };
    emailActions.sendNotificationEmail.mutate(notificationData);
  };

  const handleBulkEmail = (data: BulkEmailForm) => {
    const recipients = data.recipients.split(',').map(email => email.trim());
    const emails = recipients.map(to => ({
      to,
      subject: data.subject,
      body: data.body,
      isHtml: data.isHtml
    }));
    emailActions.sendBulkEmails.mutate(emails);
  };

  const handleTestConnection = () => {
    emailActions.testConnection.mutate(undefined);
  };

  // Utilidades para template variables
  const addTemplateVariable = () => {
    const key = prompt('Nombre de la variable:');
    const value = prompt('Valor de la variable:');
    if (key && value) {
      setTemplateVariables(prev => ({ ...prev, [key]: value }));
    }
  };

  const removeTemplateVariable = (key: string) => {
    setTemplateVariables(prev => {
      const newVars = { ...prev };
      delete newVars[key];
      return newVars;
    });
  };

  // Helpers para UI
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Settings className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Conectado';
      case 'error': return 'Error';
      default: return 'Sin probar';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sistema de Emails</h2>
          <p className="text-muted-foreground">
            Demo completa del sistema de envío de emails con todas las funcionalidades
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-1">Estado: {getStatusText()}</span>
          </Badge>
        </div>
      </div>

      {/* Panel de Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Panel de Control
          </CardTitle>
          <CardDescription>
            Prueba la configuración y conectividad del servicio de email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              onClick={handleTestConnection}
              disabled={emailActions.testConnection.isPending}
              variant="default"
              className="flex-1"
            >
              {emailActions.testConnection.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Probar Conexión
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Funcionalidades */}
      <Tabs defaultValue="simple" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="simple" className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            Simple
          </TabsTrigger>
          <TabsTrigger value="complete" className="flex items-center gap-1">
            <Send className="h-3 w-3" />
            Completo
          </TabsTrigger>
          <TabsTrigger value="template" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Plantilla
          </TabsTrigger>
          <TabsTrigger value="register" className="flex items-center gap-1">
            <Plus className="h-3 w-3" />
            Registro
          </TabsTrigger>
          <TabsTrigger value="predefined" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Predefinidos
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Masivo
          </TabsTrigger>
        </TabsList>

        {/* Tab Email Simple */}
        <TabsContent value="simple">
          <Card>
            <CardHeader>
              <CardTitle>Email Simple</CardTitle>
              <CardDescription>Envía un email básico con los campos esenciales</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...simpleForm}>
                <form onSubmit={simpleForm.handleSubmit(handleSimpleEmail)} className="space-y-4">
                  <FormField
                    control={simpleForm.control}
                    name="to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Para</FormLabel>
                        <FormControl>
                          <Input placeholder="destinatario@ejemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={simpleForm.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asunto</FormLabel>
                        <FormControl>
                          <Input placeholder="Asunto del email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={simpleForm.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensaje</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Contenido del email..." className="min-h-[100px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={simpleForm.control}
                    name="isHtml"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Formato HTML</FormLabel>
                          <p className="text-sm text-muted-foreground">Enviar como HTML en lugar de texto plano</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={emailActions.sendSimpleEmail.isPending} className="w-full">
                    {emailActions.sendSimpleEmail.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Email Simple
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Email Completo */}
        <TabsContent value="complete">
          <Card>
            <CardHeader>
              <CardTitle>Email Completo</CardTitle>
              <CardDescription>Envía un email con todas las opciones avanzadas disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...completeForm}>
                <form onSubmit={completeForm.handleSubmit(handleCompleteEmail)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={completeForm.control}
                      name="to"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Para *</FormLabel>
                          <FormControl>
                            <Input placeholder="destinatario@ejemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={completeForm.control}
                      name="cc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CC</FormLabel>
                          <FormControl>
                            <Input placeholder="copia@ejemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={completeForm.control}
                      name="bcc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>BCC</FormLabel>
                          <FormControl>
                            <Input placeholder="copia-oculta@ejemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={completeForm.control}
                      name="replyTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responder a</FormLabel>
                          <FormControl>
                            <Input placeholder="respuesta@ejemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={completeForm.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asunto *</FormLabel>
                        <FormControl>
                          <Input placeholder="Asunto del email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={completeForm.control}
                      name="body"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensaje (Texto)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Contenido en texto plano..." className="min-h-[100px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={completeForm.control}
                      name="htmlBody"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensaje (HTML)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="<p>Contenido en HTML...</p>" className="min-h-[100px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={completeForm.control}
                    name="isHighPriority"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Alta Prioridad</FormLabel>
                          <p className="text-sm text-muted-foreground">Marcar el email como prioridad alta</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={emailActions.sendCompleteEmail.isPending} className="w-full">
                    {emailActions.sendCompleteEmail.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Email Completo
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Con Plantilla */}
        <TabsContent value="template">
          <Card>
            <CardHeader>
              <CardTitle>Email con Plantilla</CardTitle>
              <CardDescription>Envía un email usando una plantilla predefinida con variables</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...templateForm}>
                <form onSubmit={templateForm.handleSubmit(handleTemplateEmail)} className="space-y-4">
                  <FormField
                    control={templateForm.control}
                    name="to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Para</FormLabel>
                        <FormControl>
                          <Input placeholder="destinatario@ejemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={templateForm.control}
                    name="templateName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de Plantilla</FormLabel>
                        <FormControl>
                          <Input placeholder="nombre-plantilla" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Variables de plantilla */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Variables de Plantilla</Label>
                      <Button type="button" onClick={addTemplateVariable} size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar Variable
                      </Button>
                    </div>
                    
                    {Object.entries(templateVariables).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 p-2 border rounded">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{key}</span>
                        <span>=</span>
                        <span className="flex-1">{value}</span>
                        <Button 
                          type="button" 
                          onClick={() => removeTemplateVariable(key)} 
                          size="sm" 
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button type="submit" disabled={emailActions.sendTemplateEmail.isPending} className="w-full">
                    {emailActions.sendTemplateEmail.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <FileText className="h-4 w-4 mr-2" />
                    Enviar con Plantilla
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Registrar Plantilla */}
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Plantilla</CardTitle>
              <CardDescription>Crea una nueva plantilla de email para uso futuro</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegisterTemplate)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la Plantilla</FormLabel>
                        <FormControl>
                          <Input placeholder="mi-plantilla-personalizada" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Input placeholder="Descripción de la plantilla..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asunto de la Plantilla</FormLabel>
                        <FormControl>
                          <Input placeholder="{{variable}} - Asunto con variables" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cuerpo de la Plantilla</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Hola {{nombre}}, este es el contenido de la plantilla..." 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={emailActions.registerTemplate.isPending} className="w-full">
                    {emailActions.registerTemplate.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Plantilla
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Emails Predefinidos */}
        <TabsContent value="predefined">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Email de Bienvenida */}
            <Card>
              <CardHeader>
                <CardTitle>Email de Bienvenida</CardTitle>
                <CardDescription>Envía un email de bienvenida a nuevos usuarios</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...welcomeForm}>
                  <form onSubmit={welcomeForm.handleSubmit(handleWelcomeEmail)} className="space-y-4">
                    <FormField
                      control={welcomeForm.control}
                      name="to"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email del Usuario</FormLabel>
                          <FormControl>
                            <Input placeholder="usuario@ejemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={welcomeForm.control}
                      name="userName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Usuario</FormLabel>
                          <FormControl>
                            <Input placeholder="Juan Pérez" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={welcomeForm.control}
                      name="welcomeMessage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensaje Personalizado</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Mensaje adicional de bienvenida..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={emailActions.sendWelcomeEmail.isPending} className="w-full">
                      {emailActions.sendWelcomeEmail.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Enviar Bienvenida
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Email de Notificación */}
            <Card>
              <CardHeader>
                <CardTitle>Email de Notificación</CardTitle>
                <CardDescription>Envía notificaciones del sistema a usuarios</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(handleNotificationEmail)} className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="to"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destinatario</FormLabel>
                          <FormControl>
                            <Input placeholder="usuario@ejemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="notificationType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Notificación</FormLabel>
                          <FormControl>
                            <Input placeholder="actualizacion-sistema" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensaje</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Contenido de la notificación..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prioridad</FormLabel>
                          <FormControl>
                            <select {...field} className="w-full p-2 border rounded">
                              <option value="low">Baja</option>
                              <option value="normal">Normal</option>
                              <option value="high">Alta</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={emailActions.sendNotificationEmail.isPending} className="w-full">
                      {emailActions.sendNotificationEmail.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Enviar Notificación
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Envío Masivo */}
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Envío Masivo</CardTitle>
              <CardDescription>Envía el mismo email a múltiples destinatarios</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...bulkForm}>
                <form onSubmit={bulkForm.handleSubmit(handleBulkEmail)} className="space-y-4">
                  <FormField
                    control={bulkForm.control}
                    name="recipients"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lista de Destinatarios</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="usuario1@ejemplo.com, usuario2@ejemplo.com, usuario3@ejemplo.com"
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Separa los emails con comas
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bulkForm.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asunto</FormLabel>
                        <FormControl>
                          <Input placeholder="Asunto del email masivo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bulkForm.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensaje</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Contenido del email que se enviará a todos los destinatarios..."
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bulkForm.control}
                    name="isHtml"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Formato HTML</FormLabel>
                          <p className="text-sm text-muted-foreground">Enviar como HTML en lugar de texto plano</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={emailActions.sendBulkEmails.isPending} className="w-full">
                    {emailActions.sendBulkEmails.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Users className="h-4 w-4 mr-2" />
                    Enviar a Todos
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Estado de carga global */}
      {emailActions.isAnyLoading && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Procesando operación de email...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}