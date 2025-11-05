import { useTranslation } from "react-i18next";
import { useLanguage } from "@/shared/providers";
import { Button } from "@/shared/components/ui/button";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { changeLanguage } from "@/shared/i18n/config";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const handleLanguageChange = (newLanguage: "es" | "en") => {
    // Actualizar el estado en el contexto
    setLanguage(newLanguage);
    // Cambiar el idioma directamente en i18next
    changeLanguage(newLanguage);
    // Cerrar el dropdown
    setIsOpen(false);
    // Forzar un refresco de la página para asegurar que todos los componentes se actualicen
    // Esto es opcional y solo se recomienda durante el desarrollo
    // window.location.reload();
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe className="h-[1.2rem] w-[1.2rem]" />
        <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
          {language.toUpperCase()}
        </span>
        <span className="sr-only">{t('common.language.select')}</span>
      </Button>

      <div
        ref={dropdownRef}
        className={cn(
          "absolute right-0 min-w-[120px] rounded-lg border bg-popover p-1 shadow-md z-50",
          "transition-all duration-200",
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none",
          "top-full mt-2"
        )}
      >
        <div className="p-1">
          <button
            className={cn(
              "flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground",
              language === "es" ? "bg-accent text-accent-foreground" : ""
            )}
            onClick={() => handleLanguageChange("es")}
          >
            <span>{t('common.language.es')}</span>
          </button>
          <button
            className={cn(
              "flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground",
              language === "en" ? "bg-accent text-accent-foreground" : ""
            )}
            onClick={() => handleLanguageChange("en")}
          >
            <span>{t('common.language.en')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
