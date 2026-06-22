'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { translations, Locale } from './index';

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: typeof translations.en;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('locale');

    if (saved === 'en' || saved === 'es') {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (locale: Locale) => {
    localStorage.setItem('locale', locale);
    setLocaleState(locale);
  };

  console.log('Current locale:', locale);

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t: translations[locale],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }

  return context;
}
