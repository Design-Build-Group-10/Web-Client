import { createI18n } from 'vue-i18n'

// 导入语言文件
import en from './locales/en.json'
import fr from './locales/fr.json'
import ja from './locales/ja.json'
import zhCN from './locales/zh-CN.json'
import zhTW from './locales/zh-TW.json'

const savedLocale = localStorage.getItem('locale') || 'en'

const messages: Record<any, any> = {
  'en': en,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'fr': fr,
  'ja': ja,
}

// 创建 i18n 实例
const i18n = createI18n({
  locale: savedLocale,
  fallbackLocale: 'en',
  messages,
})

export default i18n
