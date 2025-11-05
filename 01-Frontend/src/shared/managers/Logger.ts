/**
 * Sistema de logging unificado y optimizado
 * Combina las mejores características de OptimizedLogger y logger básico
 */

import { env } from '@/shared/config/env';

// Niveles de logging
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

// Contexto de logging
export interface LogContext {
  component?: string;
  feature?: string;
  action?: string;
  userId?: string;
  [key: string]: any;
}

// Configuración del logger
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
  enablePerformanceTracking: boolean;
  enableNetworkLogging: boolean;
}

// Entrada de log
export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext | undefined;
  timestamp: Date;
  error?: Error | undefined;
  performance?: {
    name: string;
    value: number;
    unit: string;
  } | undefined;
}

/**
 * Logger unificado y optimizado
 */
export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private logEntries: LogEntry[] = [];
  private performanceMarks: Map<string, number> = new Map();

  private constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: env.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN,
      enableConsole: true,
      enableStorage: env.isDevelopment,
      maxStorageEntries: 1000,
      enablePerformanceTracking: env.isDevelopment,
      enableNetworkLogging: env.isDevelopment,
      ...config
    };
  }

  /**
   * Obtiene la instancia singleton del logger
   */
  public static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  /**
   * Actualiza configuración
   */
  public updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Verifica si un nivel está habilitado
   */
  private isLevelEnabled(level: LogLevel): boolean {
    return level <= this.config.level;
  }

  /**
   * Formatea el mensaje de log
   */
  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level}: ${message}${contextStr}`;
  }

  /**
   * Log principal
   */
  public log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.isLevelEnabled(level)) return;

    const entry: LogEntry = {
      level,
      message,
      context: context || undefined,
      timestamp: new Date(),
      error: error || undefined
    };

    // Agregar al storage si está habilitado
    if (this.config.enableStorage) {
      this.addEntry(entry);
    }

    // Log a consola si está habilitado
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }
  }

  /**
   * Log de error
   */
  public error(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log de warning
   */
  public warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log de información
   */
  public info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log de debug
   */
  public debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log de API
   */
  public api(method: string, url: string, status: number, duration?: number, context?: LogContext): void {
    if (!this.config.enableNetworkLogging) return;

    const message = `${method.toUpperCase()} ${url} - ${status}${duration ? ` (${duration}ms)` : ''}`;
    const apiContext = {
      ...context,
      type: 'api',
      method,
      url,
      status,
      duration
    };

    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, message, apiContext);
  }

  /**
   * Log de acción de usuario
   */
  public userAction(action: string, context?: LogContext): void {
    const message = `User action: ${action}`;
    const actionContext = {
      ...context,
      type: 'user_action',
      action
    };
    this.log(LogLevel.INFO, message, actionContext);
  }

  /**
   * Log de uso de feature
   */
  public featureUsage(feature: string, action: string, context?: LogContext): void {
    const message = `Feature usage: ${feature}.${action}`;
    const featureContext = {
      ...context,
      type: 'feature_usage',
      feature,
      action
    };
    this.log(LogLevel.INFO, message, featureContext);
  }

  /**
   * Log de performance
   */
  public performance(name: string, value: number, unit: string = 'ms', context?: LogContext): void {
    if (!this.config.enablePerformanceTracking) return;

    const message = `Performance: ${name} = ${value}${unit}`;
    const entry: LogEntry = {
      level: LogLevel.INFO,
      message,
      context: { ...context, type: 'performance' },
      timestamp: new Date(),
      performance: { name, value, unit }
    };

    if (this.config.enableStorage) {
      this.addEntry(entry);
    }

    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }
  }

  /**
   * Inicia medición de performance
   */
  public startPerformanceMark(name: string): void {
    if (!this.config.enablePerformanceTracking) return;
    this.performanceMarks.set(name, performance.now());
  }

  /**
   * Termina medición de performance
   */
  public endPerformanceMark(name: string, context?: LogContext): void {
    if (!this.config.enablePerformanceTracking) return;

    const startTime = this.performanceMarks.get(name);
    if (startTime !== undefined) {
      const duration = performance.now() - startTime;
      this.performance(name, Math.round(duration), 'ms', context);
      this.performanceMarks.delete(name);
    }
  }

  /**
   * Mide el tiempo de ejecución de una función
   */
  public measureFunction<T>(name: string, fn: () => T, context?: LogContext): T {
    if (!this.config.enablePerformanceTracking) {
      return fn();
    }

    this.startPerformanceMark(name);
    try {
      const result = fn();
      this.endPerformanceMark(name, context);
      return result;
    } catch (error) {
      this.endPerformanceMark(name, context);
      throw error;
    }
  }

  /**
   * Mide el tiempo de ejecución de una función async
   */
  public async measureAsyncFunction<T>(name: string, fn: () => Promise<T>, context?: LogContext): Promise<T> {
    if (!this.config.enablePerformanceTracking) {
      return fn();
    }

    this.startPerformanceMark(name);
    try {
      const result = await fn();
      this.endPerformanceMark(name, context);
      return result;
    } catch (error) {
      this.endPerformanceMark(name, context);
      throw error;
    }
  }

  /**
   * Log a consola
   */
  private logToConsole(entry: LogEntry): void {
    const levelName = LogLevel[entry.level];
    const formattedMessage = this.formatMessage(levelName, entry.message, entry.context);

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formattedMessage, entry.error);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        console.log(formattedMessage);
        break;
    }
  }

  /**
   * Agrega entrada al log
   */
  private addEntry(entry: LogEntry): void {
    this.logEntries.push(entry);

    // Mantener solo las últimas N entradas
    if (this.logEntries.length > this.config.maxStorageEntries) {
      this.logEntries = this.logEntries.slice(-this.config.maxStorageEntries);
    }
  }

  /**
   * Obtiene las entradas de log
   */
  public getLogEntries(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logEntries.filter(entry => entry.level === level);
    }
    return [...this.logEntries];
  }

  /**
   * Obtiene estadísticas de log
   */
  public getLogStats(): Record<string, number> {
    const stats: Record<string, number> = {
      total: this.logEntries.length,
      error: 0,
      warn: 0,
      info: 0,
      debug: 0
    };

    this.logEntries.forEach(entry => {
      const levelName = LogLevel[entry.level].toLowerCase();
      if (stats[levelName] !== undefined) {
        stats[levelName]++;
      }
    });

    return stats;
  }

  /**
   * Limpia las entradas de log
   */
  public clearLogEntries(): void {
    this.logEntries = [];
  }

  /**
   * Exporta logs para debugging
   */
  public exportLogs(): string {
    return JSON.stringify({
      config: this.config,
      stats: this.getLogStats(),
      entries: this.logEntries
    }, null, 2);
  }
}

// Instancia global del logger
const logger = Logger.getInstance();

// Hook para usar el logger en componentes React
export function useLogger() {
  return logger;
}

// Exportar instancia por defecto
export default logger;