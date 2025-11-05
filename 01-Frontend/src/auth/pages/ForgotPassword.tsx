import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNotifications } from "@/shared/hooks/ui/useNotifications";

// Servicios
import { emailService } from "@/shared/services/emailService";
import { authService } from "../services/authService";

// Componentes UI
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Icons } from "@/shared/components/ui/icons";

// Esquemas de validación
const forgotPasswordSchema = (t: any) => z.object({
  email: z
    .string()
    .min(1, { message: t("auth.forgotPassword.emailRequired") })
    .email({ message: t("auth.forgotPassword.invalidEmailFormat") }),
});

const resetPasswordSchema = (t: any) => z
  .object({
    password: z
      .string()
      .min(8, { message: t("auth.resetPassword.passwordRequirements") })
      .regex(/[A-Z]/, { message: t("auth.resetPassword.passwordRequirements") })
      .regex(/[a-z]/, { message: t("auth.resetPassword.passwordRequirements") })
      .regex(/[0-9]/, { message: t("auth.resetPassword.passwordRequirements") })
      .regex(/[^A-Za-z0-9]/, { message: t("auth.resetPassword.passwordRequirements") }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: t("auth.resetPassword.passwordMismatch"),
    path: ["confirmPassword"],
  });

type ForgotPasswordFormValues = z.infer<ReturnType<typeof forgotPasswordSchema>>;
type ResetPasswordFormValues = z.infer<ReturnType<typeof resetPasswordSchema>>;

/**
 * Componente unificado para recuperación y restablecimiento de contraseña
 * Combina las funcionalidades de solicitud de restablecimiento y cambio de contraseña
 */
const ForgotPassword = () => {
  const { t } = useTranslation();
  const toast = useNotifications();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  
  // Obtener el token de la URL si existe
  const token = searchParams.get("token");
  
  // Determinar si estamos en modo de restablecimiento o solicitud
  const isResetMode = !!token;
  
  // Configurar el formulario de solicitud de restablecimiento
  const requestForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema(t)),
    defaultValues: {
      email: "",
    },
  });
  
  // Configurar el formulario de restablecimiento de contraseña
  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema(t)),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Verificar validez del token al cargar el componente
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(null);
        return;
      }
      
      try {
        // En un escenario real, verificaríamos el token con el backend
        // Por ahora, simulamos que el token es válido si existe
        const isValid = await authService.verifyResetToken(token);
        setTokenValid(isValid);
        
        if (!isValid) {
          toast.error("auth.resetPassword.invalidToken");
        }
      } catch (error) {
        console.error("Error al verificar el token:", error);
        setTokenValid(false);
        toast.error("auth.resetPassword.errorVerifyingToken");
      }
    };
    
    if (token) {
      verifyToken();
    }
  }, [token, toast]);

  // Manejar el envío del formulario de solicitud
  const onRequestSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    
    try {
      // Enviar solicitud de recuperación de contraseña
      const response = await authService.requestPasswordReset(data.email);
      
      if (response.success) {
        // Mostrar mensaje de éxito
        setEmailSent(true);
        toast.success(response.message || "Si el correo existe en nuestro sistema, recibirás las instrucciones para restablecer tu contraseña.");
      } else {
        toast.error(response.message || "Error al procesar la solicitud");
      }
      
    } catch (error: any) {
      console.error("Error al procesar la solicitud:", error);
      const errorMessage = error?.apiResponse?.message || "Error al procesar la solicitud. Intente nuevamente.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Manejar el envío del formulario de restablecimiento
  const onResetSubmit = async (formData: ResetPasswordFormValues) => {
    if (!token || !tokenValid) {
      toast.error("auth.resetPassword.invalidToken");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Llamar al servicio para restablecer contraseña
      const response = await authService.resetPassword(token, formData.password);
      
      if (response.success) {
        setIsSuccess(true);
        toast.success("auth.resetPassword.successTitle");
        
        // Enviar correo de confirmación de cambio de contraseña
        await emailService.sendPasswordChangedConfirmation(response.data?.email || "");
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        toast.error(response.message || "auth.resetPassword.errorResetting");
      }
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error);
      toast.error("auth.resetPassword.errorResetting");
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar pantalla de carga mientras se verifica el token
  if (token && tokenValid === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Renderizar pantalla de error si el token es inválido
  if (token && tokenValid === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md p-4">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                {t("auth.resetPassword.invalidTokenTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4 bg-red-50 border-red-200">
                <AlertTitle>{t("auth.resetPassword.invalidTokenTitle")}</AlertTitle>
                <AlertDescription>
                  {t("auth.resetPassword.invalidTokenDescription")}
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <div className="text-sm text-center w-full">
                <Link
                  to="/forgot-password"
                  className="text-primary hover:underline"
                >
                  {t("auth.resetPassword.requestNewLink")}
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {isResetMode 
                ? t("auth.resetPassword.title") 
                : t("auth.forgotPassword.title")}
            </CardTitle>
            <CardDescription className="text-center">
              {isResetMode 
                ? t("auth.resetPassword.description") 
                : t("auth.forgotPassword.description")}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Modo de solicitud de restablecimiento */}
            {!isResetMode && emailSent ? (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <AlertTitle>{t("auth.forgotPassword.emailSentTitle")}</AlertTitle>
                <AlertDescription>
                  {t("auth.forgotPassword.emailSentDescription")}
                </AlertDescription>
              </Alert>
            ) : !isResetMode && !emailSent ? (
              <Form {...requestForm}>
                <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
                  <FormField
                    control={requestForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth.forgotPassword.emailLabel")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("auth.forgotPassword.emailPlaceholder")}
                            type="email"
                            autoComplete="email"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t("auth.forgotPassword.submitButton")}
                  </Button>
                </form>
              </Form>
            ) : null}
            
            {/* Modo de restablecimiento de contraseña */}
            {isResetMode && isSuccess ? (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <AlertTitle>{t("auth.resetPassword.successTitle")}</AlertTitle>
                <AlertDescription>
                  {t("auth.resetPassword.successDescription")}
                </AlertDescription>
              </Alert>
            ) : isResetMode ? (
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                  <FormField
                    control={resetForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth.resetPassword.newPasswordLabel")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("auth.resetPassword.passwordRequirements")}
                            type="password"
                            autoComplete="new-password"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={resetForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth.resetPassword.confirmPasswordLabel")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("auth.resetPassword.passwordMismatch")}
                            type="password"
                            autoComplete="new-password"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t("auth.resetPassword.submitButton")}
                  </Button>
                </form>
              </Form>
            ) : null}
          </CardContent>
          
          <CardFooter>
            <div className="text-sm text-center w-full">
              <Link
                to="/login"
                className="text-primary hover:underline"
              >
                {isResetMode 
                  ? t("auth.resetPassword.backToLogin") 
                  : t("auth.forgotPassword.backToLogin")}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
