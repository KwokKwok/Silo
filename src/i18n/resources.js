import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import ru from './locales/ru.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import es from './locales/es.json';
import it from './locales/it.json';
import en from './locales/en.json';

const resources = {
  'zh-CN': {
    label: '简体中文',
    translation: zhCN,
  },
  'zh-TW': {
    label: '繁體中文',
    translation: zhTW,
  },
  en: {
    label: 'English',
    translation: en,
  },
  ja: {
    label: '日本語',
    translation: ja,
  },
  ko: {
    label: '한국어',
    translation: ko,
  },
  ru: {
    label: 'Русский',
    translation: ru,
  },
  fr: {
    label: 'Français',
    translation: fr,
  },
  de: {
    label: 'Deutsch',
    translation: de,
  },
  es: {
    label: 'Español',
    translation: es,
  },
  it: {
    label: 'Italiano',
    translation: it,
  },

};

export default resources;

export const i18nOptions = Object.keys(resources).map(key => ({
  label: resources[key].label,
  value: key,
}));
