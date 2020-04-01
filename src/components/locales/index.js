import enTWLocal from './en-US';
import { isBrowser } from '@/utils/utils';

const locales = { 'en-US': enTWLocal };

const getLanguage = () => {
  // support ssr
  const lang = undefined;
  if (isBrowser()) {
    window.localStorage.getItem('umi_locale');
  }
  return lang || window.g_locale || navigator.language;
};

export { getLanguage };

export default locale => {
  if (locale) {
    return locales[locale];
  }
  const gLocale = getLanguage();
  if (locales[gLocale]) {
    return locales[gLocale];
  }
  return locales[locale];
};
