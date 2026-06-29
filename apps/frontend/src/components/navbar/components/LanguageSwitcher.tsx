'use client';

import { useLanguage } from '@/shared/i18n/LanguageContext';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        onClick={() => setLocale('en')}
        className={locale === 'en' ? 'font-semibold' : 'text-neutral-400'}
      >
        EN
      </button>

      <span>|</span>

      <button
        onClick={() => setLocale('es')}
        className={locale === 'es' ? 'font-semibold' : 'text-neutral-400'}
      >
        ES
      </button>
    </div>
  );
}
