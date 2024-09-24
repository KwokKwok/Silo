const resources = [
  {
    _key: 'title',
    en: 'Silo - Multi-model chat, text-to-image',
    zh: 'Silo - 多模型对话，文生图',
  },
  {
    en: 'This place is so quiet',
    zh: '这地方真安静'
  }
]

const i18nFormatted = ['zh', 'en'].reduce((result, lang) => {
  const langObj = {
    translation: resources.reduce((acc, item) => ({
      ...acc,
      [item._key || item.zh]: item[lang]
    }), {})
  }

  result[lang] = langObj
  return result
}, {})

export default i18nFormatted;