/**
 * Utilitários nativos para manipulação e formatação de datas e horários.
 * Utiliza exclusivamente as APIs nativas do JavaScript (Intl.DateTimeFormat, Date)
 * com zero bibliotecas externas, zero bundle size e tipagem estrita (zero any).
 */

const DEFAULT_LOCALE = 'pt-BR';

/**
 * Formata data no padrão técnico ISO (YYYY-MM-DD).
 * Exemplo: 2026-10-01
 */
export function formatISODate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Formata data de forma legível e editorial utilizando a API nativa Intl.
 * Exemplo: "1 de outubro de 2026" ou "01 de out. de 2026"
 */
export function formatDisplayDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  },
  locale: string = DEFAULT_LOCALE
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(d);
}

/**
 * Formata data por extenso completa.
 * Exemplo: "1 de outubro de 2026"
 */
export function formatFullDate(
  date: Date | string,
  locale: string = DEFAULT_LOCALE
): string {
  return formatDisplayDate(
    date,
    { day: 'numeric', month: 'long', year: 'numeric' },
    locale
  );
}

/**
 * Calcula tempo relativo amigável utilizando a API nativa Intl.RelativeTimeFormat.
 * Exemplo: "há 3 dias", "há 2 meses", "amanhã"
 */
export function formatRelativeTime(
  date: Date | string,
  baseDate: Date = new Date(),
  locale: string = DEFAULT_LOCALE
): string {
  const target = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.round((target.getTime() - baseDate.getTime()) / 1000);

  const units: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 }
  ];

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  for (const { unit, seconds } of units) {
    if (Math.abs(diffInSeconds) >= seconds || unit === 'second') {
      const count = Math.round(diffInSeconds / seconds);
      return rtf.format(count, unit);
    }
  }

  return rtf.format(0, 'second');
}

/**
 * Retorna a string formatada do fuso horário utilizando exclusivamente a API nativa Intl.
 * Exemplo: "UTC-03:00 // BRASILIA" ou "UTC±00:00 // UTC / ZULU"
 */
export function formatTimezoneMeta(
  timeZone: string = 'America/Sao_Paulo',
  label?: string
): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset'
    });
    const parts = formatter.formatToParts(new Date());
    const tzPart = parts.find((p) => p.type === 'timeZoneName')?.value || 'GMT-3';

    // Normaliza GMT-3, GMT+0, GMT+5:30 para padrão técnico UTC-03:00
    let offset = tzPart.replace('GMT', 'UTC');
    if (offset === 'UTC') {
      offset = 'UTC±00:00';
    } else {
      const match = offset.match(/^UTC([+-])(\d{1,2})(?::(\d{2}))?$/);
      if (match) {
        const sign = match[1];
        const hours = match[2].padStart(2, '0');
        const mins = match[3] || '00';
        offset = `UTC${sign}${hours}:${mins}`;
      }
    }

    const resolvedLabel =
      label ||
      timeZone.split('/').pop()?.replace(/_/g, ' ').toUpperCase() ||
      'LOCAL';
    return `${offset} // ${resolvedLabel}`;
  } catch {
    return `UTC-03:00 // ${label || 'BRASILIA'}`;
  }
}
