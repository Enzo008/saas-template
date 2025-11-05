/**
 * Utilidad para traducciones directas usando arrays [ES, EN]
 * Sistema híbrido que permite traducciones simples sin archivos JSON
 */
import { useLanguage } from '@/shared/providers/LanguageProvider';

export type DirectTranslation = [string, string]; // [Español, Inglés]

/**
 * Hook para obtener traducciones directas basadas en arrays
 * @param translation Array con [español, inglés] o string simple
 * @returns Texto traducido según el idioma actual
 * 
 * @example
 * const label = useDirectTranslation(['Nombre del Cargo', 'Position Name']);
 * const placeholder = useDirectTranslation(['Ej: Analista', 'Ex: Analyst']);
 */
export function useDirectTranslation(translation: DirectTranslation | string): string {
  const { language } = useLanguage();
  
  // Si es un string simple, retornarlo tal como está
  if (typeof translation === 'string') {
    return translation;
  }
  
  // Si es un array, seleccionar según el idioma
  const [spanish, english] = translation;
  return language === 'es' ? spanish : english;
}

/**
 * Función utilitaria para obtener traducción directa sin hook
 * Útil para usar fuera de componentes React
 */
export function getDirectTranslation(
  translation: DirectTranslation | string, 
  language: 'es' | 'en'
): string {
  if (typeof translation === 'string') {
    return translation;
  }
  
  const [spanish, english] = translation;
  return language === 'es' ? spanish : english;
}

/**
 * Interfaz unificada para configuración de campo con traducciones directas
 * Compatible con fieldBuilder y otros sistemas
 */
export interface DirectFieldConfig {
  label: DirectTranslation | string;
  placeholder?: DirectTranslation | string;
  helpText?: DirectTranslation | string;
  patternMessage?: DirectTranslation | string;
  validation?: {
    required?: DirectTranslation | string;
    pattern?: DirectTranslation | string;
    minLength?: DirectTranslation | string;
    maxLength?: DirectTranslation | string;
    min?: DirectTranslation | string;
    max?: DirectTranslation | string;
  };
}

/**
 * Hook para procesar configuración completa de campo con traducciones directas
 * Versión simplificada que solo traduce las propiedades de texto
 */
export function useDirectFieldTranslation(config: DirectFieldConfig) {
  return {
    label: useDirectTranslation(config.label),
    placeholder: config.placeholder ? useDirectTranslation(config.placeholder) : '',
    helpText: config.helpText ? useDirectTranslation(config.helpText) : '',
    patternMessage: config.patternMessage ? useDirectTranslation(config.patternMessage) : '',
    validation: {
      required: config.validation?.required ? useDirectTranslation(config.validation.required) : '',
      pattern: config.validation?.pattern ? useDirectTranslation(config.validation.pattern) : '',
      minLength: config.validation?.minLength ? useDirectTranslation(config.validation.minLength) : '',
      maxLength: config.validation?.maxLength ? useDirectTranslation(config.validation.maxLength) : '',
      min: config.validation?.min ? useDirectTranslation(config.validation.min) : '',
      max: config.validation?.max ? useDirectTranslation(config.validation.max) : '',
    }
  };
}
