import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNotifications } from "@/shared/hooks/ui/useNotifications";

// Componentes UI
import { Button } from "@/shared/components/ui";
import { Input } from "@/shared/components/ui";
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
import { Icons } from "@/shared/components/ui";

// Servicios
import { authService } from "../services/authService";
import { emailService } from "@/shared/services/emailService";

// Esquema de validación
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

type ResetPasswordFormValues = z.infer<ReturnType<typeof resetPasswordSchema>>;

/**
 * Componente para restablecer contraseña
 * Permite al usuario establecer una nueva contraseña después de recibir un token de restablecimiento
 */
const ResetPassword = () => {
  const { t } = useTranslation();
  const toast = useNotifications();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  
  // Obtener el token de la URL
  const token = searchParams.get("token");
  
  // Configurar el formulario con validación
  const form = useForm<ResetPasswordFormValues>({
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
        setTokenValid(false);
        return;
      }
      
      try {
        // En un escenario real, verificaríamos el token con el backend
        // Por ahora, simulamos que el token es válido si existe
        setTokenValid(true);
      } catch (error) {
        console.error("Error al verificar el token:", error);
        setTokenValid(false);
      }
    };
    
    verifyToken();
  }, [token]);

  // Manejar el envío del formulario
  const onSubmit = async (formData: ResetPasswordFormValues) => {
    if (!token) {
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
        await emailService.sendPasswordChangedConfirmation("usuario@ejemplo.com"); // Idealmente, usar el email del usuario
        
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

  // Mostrar mensaje de error si el token no es válido
  if (tokenValid === false) {
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
                  {t("auth.forgotPassword.title")}
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Mostrar indicador de carga mientras se verifica el token
  if (tokenValid === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {t("auth.resetPassword.title")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("auth.resetPassword.description")}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isSuccess ? (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <AlertTitle>{t("auth.resetPassword.successTitle")}</AlertTitle>
                <AlertDescription>
                  {t("auth.resetPassword.successDescription")}
                </AlertDescription>
              </Alert>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
            )}
          </CardContent>
          
          <CardFooter>
            <div className="text-sm text-center w-full">
              <Link
                to="/login"
                className="text-primary hover:underline"
              >
                {t("auth.resetPassword.backToLogin")}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
