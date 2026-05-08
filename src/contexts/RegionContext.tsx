import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import i18n from '@/i18n';
import { detectRegion, regions, type RegionConfig, type RegionId } from '@/regions';

const STORAGE_REGION = 'futureedu.region';
const STORAGE_LOCALE = 'futureedu.locale';
const STORAGE_CURRENCY = 'futureedu.currency';
const STORAGE_PICKER = 'futureedu.region.picker.dismissed';

interface RegionContextValue {
  region: RegionConfig;
  regionId: RegionId;
  locale: string;
  currency: string;
  setRegion: (id: RegionId) => void;
  setLocale: (locale: string) => void;
  setCurrency: (currency: string) => void;
  showPicker: boolean;
  openPicker: () => void;
  closePicker: () => void;
  isFirstRun: boolean;
}

const RegionContext = createContext<RegionContextValue | undefined>(undefined);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [regionId, setRegionId] = useState<RegionId>(() => {
    if (typeof window === 'undefined') return 'africa';
    const stored = window.localStorage.getItem(STORAGE_REGION) as RegionId | null;
    if (stored && regions[stored]) return stored;
    return detectRegion();
  });

  const [locale, setLocaleState] = useState<string>(() => {
    if (typeof window === 'undefined') return 'en';
    return window.localStorage.getItem(STORAGE_LOCALE) || regions[regionId].defaultLocale;
  });

  const [currency, setCurrencyState] = useState<string>(() => {
    if (typeof window === 'undefined') return regions[regionId].defaultCurrency;
    return window.localStorage.getItem(STORAGE_CURRENCY) || regions[regionId].defaultCurrency;
  });

  const [showPicker, setShowPicker] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const dismissed = window.localStorage.getItem(STORAGE_PICKER);
    const hasRegion = window.localStorage.getItem(STORAGE_REGION);
    return !dismissed && !hasRegion;
  });

  const isFirstRun = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return !window.localStorage.getItem(STORAGE_REGION);
  }, []);

  const region = regions[regionId];

  const setRegion = (id: RegionId) => {
    setRegionId(id);
    window.localStorage.setItem(STORAGE_REGION, id);
    const next = regions[id];
    if (!next.supportedLocales.includes(locale)) {
      setLocaleState(next.defaultLocale);
      window.localStorage.setItem(STORAGE_LOCALE, next.defaultLocale);
    }
    if (!next.currencies.includes(currency)) {
      setCurrencyState(next.defaultCurrency);
      window.localStorage.setItem(STORAGE_CURRENCY, next.defaultCurrency);
    }
  };

  const setLocale = (l: string) => {
    setLocaleState(l);
    window.localStorage.setItem(STORAGE_LOCALE, l);
  };

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    window.localStorage.setItem(STORAGE_CURRENCY, c);
  };

  const openPicker = () => setShowPicker(true);
  const closePicker = () => {
    setShowPicker(false);
    window.localStorage.setItem(STORAGE_PICKER, '1');
  };

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = region.rtl ? 'rtl' : 'ltr';
    root.setAttribute('data-region', region.id);
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale, region]);

  const value: RegionContextValue = {
    region,
    regionId,
    locale,
    currency,
    setRegion,
    setLocale,
    setCurrency,
    showPicker,
    openPicker,
    closePicker,
    isFirstRun,
  };

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion() {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error('useRegion must be used within RegionProvider');
  return ctx;
}
