import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import resources from './resources';

// for compatibility with old version
resources.zh = resources['zh-CN']

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // 默认语言不在本地时的备选语言
    interpolation: {
      escapeValue: false, // 不需要在渲染前对值进行转义
    },
  });