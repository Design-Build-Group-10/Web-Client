import i18n from '@/i18n'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import Antd from 'ant-design-vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/style.css'
import 'ant-design-vue/dist/reset.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia).use(router).use(Antd).use(i18n).use(autoAnimatePlugin).mount('#app')
