import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';
import de from './locales/de.json';
import es from './locales/es.json';

const STORAGE_LOCALE = 'futureedu.locale';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ar: { translation: ar },
      de: { translation: de },
      es: { translation: es },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'ar', 'de', 'es'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_LOCALE,
      caches: ['localStorage'],
    },
  });

export default i18n;
