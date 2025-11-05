import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { env } from '@/shared/config/env';

// Importamos los archivos de traducción
import translationEN from './locales/en/translation.json';
import translationES from './locales/es/translation.json';

// Los recursos contienen las traducciones por idioma
const resources = {
  en: {
    translation: translationEN
  },
  es: {
    translation: translationES
  }
};

i18n
  // Detecta el idioma del usuario
  .use(LanguageDetector)
  // Pasa el i18n a react-i18next
  .use(initReactI18next)
  // Inicializa i18next
  .init({
    resources,
    fallbackLng: 'es', // Idioma de respaldo
    debug: env.isDevelopment,

    interpolation: {
      escapeValue: false, // No es necesario para React
    },

    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },

    // Asegurarse de que los componentes se actualicen cuando cambia el idioma
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
    }
  });

// Función de ayuda para cambiar el idioma desde cualquier parte de la aplicación
export const changeLanguage = (lng: string) => {
  return i18n.changeLanguage(lng);
};

export default i18n;
