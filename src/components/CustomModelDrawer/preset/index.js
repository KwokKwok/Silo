import laughingBabyResolveFn from "./laughingBaby.js?raw"
import geminiResolveFn from "./gemini.js?raw"
import { CUSTOM_PRESET_PREFIX } from "../../../utils/types";

const CUSTOM_MODEL_PRESET = [
  {
    name: '爱笑的小孩（带参数说明）',
    icon: 'https://chat.kwok.ink/logo.svg',
    id: 'preset-ai-laughing-baby',
    ids: 'Silo/Laughing-Baby-16K,Silo/Laughing-Baby-32K',
    length: '2048',
    price: 0,
    resolveFn: laughingBabyResolveFn,
    link: 'https://chat.kwok.ink/'
  },
  {
    name: 'Google Gemini',
    id: 'preset-gemini',
    icon: '',
    ids: 'google/gemini-1.5-flash,google/gemini-1.5-pro',
    length: '',
    price: void 0,
    resolveFn: geminiResolveFn,
    link: 'https://deepmind.google/technologies/gemini/'
  }
].map(item => ({ ...item, name: CUSTOM_PRESET_PREFIX + item.name, isPreset: true }));

export default CUSTOM_MODEL_PRESET;