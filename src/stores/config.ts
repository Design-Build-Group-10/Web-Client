import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useConfigStore = defineStore('config', () => {
  const theme = ref<'dark' | 'light'>('light')
  const isManualThemeChange = ref<boolean>(false)
  const isDarkMode = computed(() => theme.value === 'dark')
  const collapsed = ref(true)

  function setTheme(mode: 'dark' | 'light') {
    theme.value = mode === 'dark' ? 'dark' : 'light'
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    isManualThemeChange.value = true
  }

  function reset() {
    theme.value = 'light'
  }

  return {
    collapsed,
    theme,
    isManualThemeChange,
    isDarkMode,
    setTheme,
    toggleTheme,
    reset,
  }
}, {
  persist: true,
})
