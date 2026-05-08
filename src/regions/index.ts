import { africaConfig } from './africa';
import { middleEastConfig } from './middleEast';
import { europeConfig } from './europe';
import { northAmericaConfig } from './northAmerica';
import type { RegionConfig, RegionId } from './types';

export const regions: Record<RegionId, RegionConfig> = {
  africa: africaConfig,
  middleEast: middleEastConfig,
  europe: europeConfig,
  northAmerica: northAmericaConfig,
};

export const regionList: RegionConfig[] = [
  africaConfig,
  middleEastConfig,
  europeConfig,
  northAmericaConfig,
];

export type { RegionConfig, RegionId } from './types';

const REGION_BY_LOCALE: Record<string, RegionId> = {
  ar: 'middleEast',
  he: 'middleEast',
  fa: 'middleEast',
  fr: 'europe',
  de: 'europe',
  es: 'europe',
  it: 'europe',
  nl: 'europe',
  pt: 'europe',
  pl: 'europe',
  sv: 'europe',
  sw: 'africa',
  yo: 'africa',
  ha: 'africa',
  am: 'africa',
};

const REGION_BY_COUNTRY: Record<string, RegionId> = {
  NG: 'africa', KE: 'africa', ZA: 'africa', GH: 'africa', EG: 'middleEast',
  ET: 'africa', SN: 'africa', TZ: 'africa', UG: 'africa', RW: 'africa',
  SA: 'middleEast', AE: 'middleEast', QA: 'middleEast', KW: 'middleEast',
  BH: 'middleEast', OM: 'middleEast', JO: 'middleEast', LB: 'middleEast', IL: 'middleEast',
  GB: 'europe', DE: 'europe', FR: 'europe', ES: 'europe', IT: 'europe',
  NL: 'europe', SE: 'europe', PL: 'europe', PT: 'europe', IE: 'europe',
  BE: 'europe', CH: 'europe',
  US: 'northAmerica', CA: 'northAmerica',
};

export function detectRegion(): RegionId {
  if (typeof window === 'undefined') return 'africa';

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.startsWith('Africa/')) return 'africa';
    if (tz.startsWith('Europe/')) return 'europe';
    if (tz.startsWith('America/')) return 'northAmerica';
    if (tz.startsWith('Asia/')) {
      const meZones = ['Riyadh', 'Dubai', 'Qatar', 'Kuwait', 'Bahrain', 'Muscat', 'Amman', 'Beirut', 'Jerusalem', 'Tehran'];
      if (meZones.some((z) => tz.includes(z))) return 'middleEast';
    }
  } catch {
    // ignore
  }

  const lang = (navigator.language || 'en').split('-');
  if (lang[1] && REGION_BY_COUNTRY[lang[1].toUpperCase()]) {
    return REGION_BY_COUNTRY[lang[1].toUpperCase()];
  }
  if (REGION_BY_LOCALE[lang[0]]) {
    return REGION_BY_LOCALE[lang[0]];
  }

  return 'africa';
}
