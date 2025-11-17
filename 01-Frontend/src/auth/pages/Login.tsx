/**
 * Login - Página optimizada de inicio de sesión
 * Integra validación mejorada, manejo de errores y UX optimizada
 */

import { useAuth } from '../hooks/useAuth';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../utils/storage.utils';
import { VALIDATION_RULES } from '../utils/constants';
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Eye, EyeOff, Mail, Lock, X } from 'lucide-react';

// Schema de validación mejorado
const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: VALIDATION_RULES.EMAIL.REQUIRED })
    .email({ message: VALIDATION_RULES.EMAIL.INVALID }),
  password: z
    .string()
    .min(1, { message: VALIDATION_RULES.PASSWORD.REQUIRED })
    .min(6, { message: VALIDATION_RULES.PASSWORD.MIN_LENGTH })
    .max(50, { message: VALIDATION_RULES.PASSWORD.MAX_LENGTH }),
  keepSession: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function Login() {
  const { isLoading, error, handleLogin, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [hasRememberedEmail, setHasRememberedEmail] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "demo@demo.com",
      password: "123456",
      keepSession: false,
    },
  });

  // Pre-llenar email recordado al cargar el componente
  useEffect(() => {
    const rememberedEmail = storage.getRememberedEmail();
    if (rememberedEmail) {
      form.setValue('email', rememberedEmail);
      setHasRememberedEmail(true);
      // Enfocar el campo de contraseña si hay email recordado
      setTimeout(() => {
        const passwordField = document.querySelector('input[name="password"]') as HTMLInputElement;
        passwordField?.focus();
      }, 100);
    }
  }, [form]);

  // Limpiar error cuando el usuario empiece a escribir
  useEffect(() => {
    const subscription = form.watch(() => {
      if (error) {
        clearError();
      }
    });
    return () => subscription.unsubscribe();
  }, [form, error, clearError]);

  const onSubmit = async (data: FormValues) => {
    await handleLogin(data.email, data.password, data.keepSession);
  };

  const clearRememberedEmail = () => {
    storage.clearRememberedEmail();
    form.setValue('email', '');
    setHasRememberedEmail(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0 bg-card/95 backdrop-blur">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold">
              Iniciar Sesión
            </CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="border-destructive/20">
                    <AlertDescription className="flex items-center justify-between">
                      <span>{error}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearError}
                        className="h-auto p-1 hover:bg-transparent"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Correo Electrónico
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="correo@ejemplo.com"
                            type="email"
                            disabled={isLoading}
                            className="pr-10"
                            {...field}
                          />
                          {hasRememberedEmail && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={clearRememberedEmail}
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                              title="Limpiar email recordado"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Contraseña
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            disabled={isLoading}
                            className="pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={togglePasswordVisibility}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                            title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          >
                            {showPassword ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="keepSession"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          Mantener sesión iniciada
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          {field.value 
                            ? 'Tu sesión durará 30 días' 
                            : 'Tu sesión durará 8 horas'
                          }
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </form>
            </Form>

            {/* Enlace para recuperación de contraseña */}
            <div className="text-center">
              <Button
                variant="link"
                asChild
                className="text-sm text-muted-foreground hover:text-primary"
              >
                <Link to="/forgot-password">
                  ¿Olvidaste tu contraseña?
                </Link>
              </Button>
            </div>

            {hasRememberedEmail && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Email recordado de sesión anterior
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
