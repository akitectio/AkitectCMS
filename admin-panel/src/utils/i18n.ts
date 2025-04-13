import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from '../locales/en/translation.json';
import translationVI from '../locales/vi/translation.json';

// the translations
const resources = {
  en: {
    translation: translationEN,
  },
  vi: {
    translation: translationVI,
  }
};

i18n
  .use(initReactI18next as any) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en', // sử dụng tiếng Anh nếu ngôn ngữ hiện tại không có bản dịch
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
      useSuspense: true, // Updated from deprecated 'wait' option
    },
  } as any);

export default i18n;
