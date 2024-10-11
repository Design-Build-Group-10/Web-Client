import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useConfigStore = defineStore('config', () => {
  const theme = ref<'dark' | 'light'>('light')
  const isManualThemeChange = ref<boolean>(false)
  const isDarkMode = computed(() => theme.value === 'dark')
  const collapsed = ref(true)

  const fontSize = ref(14)
  const colorPrimary = ref('#1677ff')

  function setTheme(mode: 'dark' | 'light') {
    theme.value = mode === 'dark' ? 'dark' : 'light'
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    isManualThemeChange.value = true
  }

  function setPrimaryColor(color: string) {
    colorPrimary.value = color
    updateThemeColor(color)
  }

  function setFontSize(size: number) {
    fontSize.value = size
    updateFontSize(size)
  }

  // 动态修改主题色的方法
  function updateThemeColor(color: string) {
    document.documentElement.style.setProperty('--ant-primary-color', color)
  }

  // 动态修改字体大小的方法
  function updateFontSize(size: number) {
    document.documentElement.style.setProperty('--global-font-size', `${size}px`)
  }

  function reset() {
    theme.value = 'light'
    fontSize.value = 14
    colorPrimary.value = '#1677ff'
  }

  return {
    collapsed,
    fontSize,
    colorPrimary,
    theme,
    isManualThemeChange,
    isDarkMode,
    setTheme,
    toggleTheme,
    setFontSize,
    setPrimaryColor,
    reset,
  }
}, {
  persist: true,
})
