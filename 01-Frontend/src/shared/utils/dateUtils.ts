/**
 * Utilidades para formatear fechas con timezone
 * Maneja fechas DATETIMEOFFSET desde el backend
 */

/**
 * Obtiene información del timezone del cliente
 */
export const getClientTimezoneInfo = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    const offsetMinutes = now.getTimezoneOffset();
    const offsetHours = -offsetMinutes / 60;
    const offset = `${offsetHours >= 0 ? '+' : ''}${offsetHours.toString().padStart(2, '0')}:00`;

    return {
        timezoneName: timezone,     // "Europe/Madrid", "America/Lima"
        timezoneOffset: offset,     // "+01:00", "-05:00"
        locale: navigator.language  // "es-ES", "en-US"
    };
};

/**
 * Extrae el timezone de una fecha ISO 8601
 * @param isoString - Fecha en formato ISO 8601 con timezone
 * @returns Offset del timezone (ej: "-05:00")
 */
export const extractTimezoneFromISO = (isoString: string): string => {
    const match = isoString.match(/[+-]\d{2}:\d{2}$/);
    return match ? match[0] : '+00:00';
};

/**
 * Función para formatear el nombre de una zona horaria
 * @param timezone - Nombre de la zona horaria (ej: "America/Lima")
 * @returns Nombre formateado de la zona horaria con palabras capitalizadas
 */
export const formatTimezone = (timezone: string): string => {
    if (!timezone) return 'UTC';
    
    // Si ya es un nombre legible sin barras, solo capitalizar
    if (!timezone.includes('/')) {
        return capitalizeWords(timezone);
    }
    
    // Reemplazar barras por espacios y guiones bajos por espacios
    const formatted = timezone.replace(/\//g, ' ').replace(/_/g, ' ');
    
    // Capitalizar cada palabra
    return capitalizeWords(formatted);
};

/**
 * Función auxiliar para capitalizar cada palabra de un texto
 * @param text - Texto a capitalizar
 * @returns Texto con cada palabra capitalizada
 */
const capitalizeWords = (text: string): string => {
    return text
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * Formatea una fecha DATETIMEOFFSET para mostrar en la UI
 * @param isoString - Fecha en formato ISO 8601 con timezone
 * @param options - Opciones de formateo
 * @param timezoneName - Nombre de la zona horaria (opcional, si viene del backend)
 * @returns Fecha formateada con timezone
 */
export const formatDateWithTimezone = (
    isoString: string,
    options: {
        showTimezone?: boolean;
        format?: 'short' | 'long';
        convertToLocal?: boolean;
    } = {},
    timezoneName?: string
) => {
    const {
        showTimezone = true,
        convertToLocal = false
    } = options;

    if (!isoString) return '';

    const date = new Date(isoString);
    
    // Opciones de formateo
    const formatOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };

    // Si queremos convertir al timezone local del usuario
    if (convertToLocal) {
        const localFormatted = date.toLocaleString('es-ES', formatOptions);
        const userTimezone = getClientTimezoneInfo().timezoneName;
        return showTimezone
            ? `${localFormatted} (${userTimezone})`
            : localFormatted;
    }

    // Formatear manteniendo el timezone original
    const formatted = date.toLocaleString('es-ES', formatOptions);

    // Si se proporciona un nombre de zona horaria y se quiere mostrar
    if (showTimezone && timezoneName) {
        return `${formatted} (${formatTimezone(timezoneName)})`;
    }
    
    // Si se quiere mostrar el timezone pero no se proporciona nombre, usar el offset
    if (showTimezone) {
        const originalTimezone = extractTimezoneFromISO(isoString);
        return `${formatted} (${originalTimezone})`;
    }

    return formatted;
};

/**
 * Convierte una fecha DATETIMEOFFSET a diferentes formatos para la UI
 * @param isoString - Fecha en formato ISO 8601 con timezone
 * @param timezoneName - Nombre de la zona horaria (opcional, si viene del backend)
 * @returns Objeto con diferentes formatos de la fecha
 */
export const parseDateTimeOffset = (isoString: string, timezoneName?: string) => {
    if (!isoString) {
        return {
            formatted: '',
            local: new Date(),
            originalTimezone: '+00:00',
            timezoneName: timezoneName || 'UTC',
            iso: isoString
        };
    }

    const date = new Date(isoString);
    const originalTimezone = extractTimezoneFromISO(isoString);
    const formattedTimezoneName = timezoneName ? formatTimezone(timezoneName) : originalTimezone;

    return {
        // Fecha formateada con timezone original
        formatted: formatDateWithTimezone(isoString, { showTimezone: true }, timezoneName),

        // Fecha como objeto Date (se convierte automáticamente al timezone local)
        local: date,

        // Timezone original del registro
        originalTimezone,

        // Nombre amigable del timezone
        timezoneName: formattedTimezoneName,

        // String ISO original
        iso: isoString,

        // Solo la fecha (sin hora)
        dateOnly: date.toLocaleDateString('es-ES'),

        // Solo la hora (sin fecha)
        timeOnly: date.toLocaleTimeString('es-ES', { hour12: false })
    };
};

/**
 * Compara dos fechas DATETIMEOFFSET
 * @param date1 - Primera fecha ISO 8601
 * @param date2 - Segunda fecha ISO 8601
 * @returns Diferencia en milisegundos (positivo si date1 > date2)
 */
export const compareDateTimeOffset = (date1: string, date2: string): number => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getTime() - d2.getTime();
};

/**
 * Verifica si una fecha DATETIMEOFFSET está en un rango
 * @param dateToCheck - Fecha a verificar
 * @param startDate - Fecha de inicio del rango
 * @param endDate - Fecha de fin del rango
 * @returns true si la fecha está en el rango
 */
export const isDateInRange = (
    dateToCheck: string,
    startDate: string,
    endDate: string
): boolean => {
    const check = new Date(dateToCheck);
    const start = new Date(startDate);
    const end = new Date(endDate);

    return check >= start && check <= end;
};

/**
 * Obtiene la fecha actual en el timezone del usuario para enviar al backend
 * @returns Información de timezone para el backend
 */
export const getCurrentTimezoneForBackend = () => {
    const clientInfo = getClientTimezoneInfo();

    return {
        clientTimezone: clientInfo.timezoneOffset,
        clientTimezoneName: clientInfo.timezoneName,
        clientLocale: clientInfo.locale
    };
};

/**
 * Mapeo de estados de registro (estReg) a valores amigables
 */
const RECORD_STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
    'I': { 
        label: 'Ingresado', 
        color: 'text-green-600 bg-green-50', 
        icon: '✅' 
    },
    'M': { 
        label: 'Modificado', 
        color: 'text-blue-600 bg-blue-50', 
        icon: '📝' 
    },
    'E': { 
        label: 'Eliminado', 
        color: 'text-red-600 bg-red-50', 
        icon: '🗑️' 
    }
};

/**
 * Convierte el código de estado de registro a un valor amigable
 * @param estReg - Código de estado (I, M, E)
 * @returns Información del estado con label, color e icono
 */
export const getRecordStatusInfo = (estReg: string) => {
    const status = RECORD_STATUS_MAP[estReg?.toUpperCase()];
    
    if (!status) {
        return {
            label: 'Desconocido',
            color: 'text-gray-600 bg-gray-50',
            icon: '❓'
        };
    }
    
    return status;
};

/**
 * Convierte el código de estado de registro a solo el texto amigable
 * @param estReg - Código de estado (I, M, E)
 * @returns Texto amigable del estado
 */
export const formatRecordStatus = (estReg: string): string => {
    return getRecordStatusInfo(estReg).label;
};

/**
 * Convierte el código de estado de registro a texto con icono
 * @param estReg - Código de estado (I, M, E)
 * @returns Texto con icono del estado
 */
export const formatRecordStatusWithIcon = (estReg: string): string => {
    const status = getRecordStatusInfo(estReg);
    return `${status.icon} ${status.label}`;
};

/**
 * Función de prueba para debugging de timezone
 * Llama a esta función desde la consola del navegador para ver los logs
 */
export const testTimezone = () => {
    console.log('🧪 === TESTING TIMEZONE FORMATTING ===');

    // Obtener info del cliente actual
    const clientInfo = getClientTimezoneInfo();
    console.log('👤 Client timezone info:', clientInfo);

    // Probar con fechas reales y nombres de zona horaria
    console.log('\n📅 === TESTING WITH REAL DATES AND TIMEZONE NAMES ===');
    const testCases = [
        { date: '2025-01-18T10:30:00.000-05:00', zone: 'America/Lima' },
        { date: '2025-01-18T16:30:00.000+01:00', zone: 'Europe/Madrid' },
        { date: '2025-01-18T09:30:00.000-06:00', zone: 'America/Mexico_City' },
        { date: '2025-01-18T15:30:00.000+00:00', zone: 'UTC' }
    ];

    testCases.forEach(({ date, zone }) => {
        console.log(`\n📆 Testing date: ${date} with zone: ${zone}`);
        const formatted = formatDateWithTimezone(date, { showTimezone: true }, zone);
        console.log(`✨ Formatted result: "${formatted}"`);
    });

    console.log('\n🎯 === TEST COMPLETE ===');
    return 'Check console for detailed logs!';

    console.log('\n🎯 === TEST COMPLETE ===');
    return 'Check console for detailed logs!';
};