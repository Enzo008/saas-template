/**
 * Utility functions and formatters for the application
 * This file provides common utilities and maintains compatibility with shared utils
 */

/**
 * cn.ts
 * Utilidad para combinar nombres de clases de manera condicional
 * 
 * Esta utilidad:
 * - Permite combinar múltiples clases de Tailwind
 * - Soporta condiciones para incluir/excluir clases
 * - Elimina valores falsy automáticamente
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina nombres de clases de manera condicional y optimiza las clases de Tailwind
 * @param inputs - Lista de clases o expresiones condicionales
 * @returns String con las clases combinadas y optimizadas
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Number formatter for budget and monetary values
 * Formats numbers with exactly 2 decimal places using US locale
 * 
 * @example
 * ```typescript
 * formatterBudget.format(1234.5) // "1,234.50"
 * formatterBudget.format(1000) // "1,000.00"
 * ```
 */
export const formatterBudget = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2
});

/**
 * Number formatter for integer values (quantities, counts, etc.)
 * Formats numbers without decimal places using US locale
 * 
 * @example
 * ```typescript
 * formatter.format(1234.5) // "1,235"
 * formatter.format(1000) // "1,000"
 * ```
 */
export const formatter = new Intl.NumberFormat("en-US");