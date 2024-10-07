import { createI18n } from 'vue-i18n'

// 导入语言文件
import en from './locales/en.json'
import zh from './locales/zh.json'

const savedLocale = localStorage.getItem('locale') || 'zh'

// 创建 i18n 实例
const i18n = createI18n({
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    zh,
  },
})

export default i18n
