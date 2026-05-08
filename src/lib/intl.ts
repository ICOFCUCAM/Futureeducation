// ============================================
// Intl-based locale-aware formatting helpers
// ============================================

export function formatCurrency(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatNumber(value: number, locale: string, opts?: Intl.NumberFormatOptions): string {
  try {
    return new Intl.NumberFormat(locale, opts).format(value);
  } catch {
    return String(value);
  }
}

export function formatDate(
  input: string | number | Date,
  locale: string,
  opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' },
): string {
  try {
    return new Intl.DateTimeFormat(locale, opts).format(new Date(input));
  } catch {
    return String(input);
  }
}

export function formatRelativeTime(input: string | number | Date, locale: string): string {
  const target = new Date(input).getTime();
  const now = Date.now();
  const diffSec = Math.round((target - now) / 1000);
  const abs = Math.abs(diffSec);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (abs < 60) return rtf.format(diffSec, 'second');
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour');
  if (abs < 2592000) return rtf.format(Math.round(diffSec / 86400), 'day');
  if (abs < 31536000) return rtf.format(Math.round(diffSec / 2592000), 'month');
  return rtf.format(Math.round(diffSec / 31536000), 'year');
}

const localeForCountryFromTimezone: Record<string, string> = {
  'Africa/Lagos': 'NG',
  'Africa/Cairo': 'EG',
  'Africa/Johannesburg': 'ZA',
  'Africa/Nairobi': 'KE',
  'Africa/Accra': 'GH',
  'Asia/Riyadh': 'SA',
  'Asia/Dubai': 'AE',
  'Asia/Qatar': 'QA',
  'Europe/London': 'GB',
  'Europe/Berlin': 'DE',
  'Europe/Paris': 'FR',
  'America/New_York': 'US',
  'America/Toronto': 'CA',
};

export function formatNameByOrder(
  given: string,
  family: string,
  order: 'given-family' | 'family-given' | 'patronymic',
  middle?: string,
): string {
  const parts = [given, middle, family].filter(Boolean);
  if (order === 'family-given') return [family, given].filter(Boolean).join(' ');
  if (order === 'patronymic') return [given, middle ? `bin ${middle}` : null, family].filter(Boolean).join(' ');
  return parts.join(' ');
}

export { localeForCountryFromTimezone };
