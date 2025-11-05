import { useState, useEffect, useCallback } from 'react';

interface UseDateTimeOptions {
  updateInterval?: number;
  timezone?: string;
  locale?: string;
}

/**
 * Hook para manejar fecha y hora actual con actualizaciones automáticas
 * Útil para relojes, timestamps, fechas dinámicas
 */
export function useDateTime(options: UseDateTimeOptions = {}) {
  const {
    updateInterval = 1000,
    timezone,
    locale = 'es-ES'
  } = options;

  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  const formatDate = useCallback((format: Intl.DateTimeFormatOptions = {}) => {
    return new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      ...format
    }).format(dateTime);
  }, [dateTime, locale, timezone]);

  const formatTime = useCallback((format: Intl.DateTimeFormatOptions = {}) => {
    return new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      ...format
    }).format(dateTime);
  }, [dateTime, locale, timezone]);

  const getRelativeTime = useCallback((targetDate: Date) => {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const diffInSeconds = (targetDate.getTime() - dateTime.getTime()) / 1000;
    
    if (Math.abs(diffInSeconds) < 60) {
      return rtf.format(Math.round(diffInSeconds), 'second');
    } else if (Math.abs(diffInSeconds) < 3600) {
      return rtf.format(Math.round(diffInSeconds / 60), 'minute');
    } else if (Math.abs(diffInSeconds) < 86400) {
      return rtf.format(Math.round(diffInSeconds / 3600), 'hour');
    } else {
      return rtf.format(Math.round(diffInSeconds / 86400), 'day');
    }
  }, [dateTime, locale]);

  return {
    dateTime,
    formatDate,
    formatTime,
    getRelativeTime,
    timestamp: dateTime.getTime(),
    iso: dateTime.toISOString()
  } as const;
}

/**
 * Hook para trabajar con rangos de fechas
 */
export function useDateRange(initialStart?: Date, initialEnd?: Date) {
  const [startDate, setStartDate] = useState<Date | null>(initialStart || null);
  const [endDate, setEndDate] = useState<Date | null>(initialEnd || null);

  const setRange = useCallback((start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  const clearRange = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
  }, []);

  const isValidRange = useCallback(() => {
    return startDate && endDate && startDate <= endDate;
  }, [startDate, endDate]);

  const getDaysDifference = useCallback(() => {
    if (!startDate || !endDate) return 0;
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }, [startDate, endDate]);

  const isDateInRange = useCallback((date: Date) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  }, [startDate, endDate]);

  const getFormattedRange = useCallback((locale: string = 'es-ES') => {
    if (!startDate || !endDate) return '';
    
    const formatter = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
  }, [startDate, endDate]);

  return {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setRange,
    clearRange,
    isValidRange: isValidRange(),
    daysDifference: getDaysDifference(),
    isDateInRange,
    getFormattedRange
  } as const;
}

/**
 * Hook para trabajar con zonas horarias
 */
export function useTimezone() {
  const [userTimezone] = useState(() => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  });

  const convertToTimezone = useCallback((date: Date, timezone: string) => {
    return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  }, []);

  const getTimezoneOffset = useCallback((timezone: string) => {
    const date = new Date();
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const targetTime = new Date(utc + (getTimezoneOffsetMinutes(timezone) * 60000));
    return targetTime.getTimezoneOffset();
  }, []);

  const formatInTimezone = useCallback((
    date: Date,
    timezone: string,
    options: Intl.DateTimeFormatOptions = {},
    locale: string = 'es-ES'
  ) => {
    return new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      ...options
    }).format(date);
  }, []);

  const getAvailableTimezones = useCallback(() => {
    return [
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Australia/Sydney',
      'America/Sao_Paulo',
      'America/Mexico_City'
    ];
  }, []);

  return {
    userTimezone,
    convertToTimezone,
    getTimezoneOffset,
    formatInTimezone,
    getAvailableTimezones
  } as const;
}

// Helper function para obtener offset de timezone
function getTimezoneOffsetMinutes(timezone: string): number {
  const date = new Date();
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const targetDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  return (targetDate.getTime() - utcDate.getTime()) / (1000 * 60);
}