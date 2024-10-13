<script setup lang="ts">
import type { SelectValue } from 'ant-design-vue/es/select'
import { useConfigStore } from '@/stores/config'
import { Button as AButton, Card, Input, Select, Slider, Space, Switch } from 'ant-design-vue'
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const configStore = useConfigStore()

const { t, locale } = useI18n()
const defaultFontSize = 14
const defaultColorPrimary = '#1677ff'

// 初始化语言选项和当前语言
const languageOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: '繁體中文', value: 'zh-TW' },
  { label: 'English', value: 'en' },
  { label: 'Français', value: 'fr' },
  { label: '日本語', value: 'ja' },
]
const currentLanguage = ref(locale.value)

const fontSize = ref(defaultFontSize)
const colorPrimary = ref(defaultColorPrimary)

type Function = (...args: any[]) => void

function debounce(func: Function, delay: number) {
  let timerId: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    if (timerId) {
      clearTimeout(timerId)
    }
    timerId = setTimeout(() => func(...args), delay)
  }
}

const updateFontSize = debounce((value: number) => {
  fontSize.value = value
  configStore.setFontSize(value)
}, 300)

const updatePrimaryColor = debounce((value: string) => {
  colorPrimary.value = value
  configStore.setPrimaryColor(value)
}, 300)

function toggleDarkMode(checked: boolean) {
  configStore.setTheme(checked ? 'dark' : 'light')
}

function resetToDefault() {
  fontSize.value = defaultFontSize
  colorPrimary.value = defaultColorPrimary
  configStore.setFontSize(defaultFontSize)
  configStore.setPrimaryColor(defaultColorPrimary)
  configStore.setTheme('light')
  locale.value = 'en'
}

function changeLanguage(value: SelectValue) {
  locale.value = value as string
  localStorage.setItem('locale', locale.value)
  currentLanguage.value = value as string
  window.location.reload()
}

onMounted(() => {
  fontSize.value = configStore.fontSize
  colorPrimary.value = configStore.colorPrimary
})

watch(() => configStore.colorPrimary, (newColor) => {
  colorPrimary.value = newColor
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl mb-6">
      {{ t('个性化设置') }}
    </h1>

    <Card :title="t('全局设置')" class="mb-6" bordered>
      <Space direction="vertical" size="large" style="width: 100%">
        <div>
          <label class="mr-2 font-semibold">{{ t('切换主题模式') }}</label>
          <Switch
            :checked="configStore.isDarkMode"
            :checked-children="t('暗色')"
            :un-checked-children="t('亮色')"
            @change="(value) => toggleDarkMode(value as boolean)"
          />
        </div>

        <div>
          <label class="mr-2 font-semibold">{{ t('字体大小') }}</label>
          <Slider
            v-model:value="fontSize"
            :min="12"
            :max="24"
            style="width: 300px"
            @change="(value) => updateFontSize(value)"
          />
          <span>{{ fontSize }} px</span>
        </div>

        <div>
          <label class="mr-2 font-semibold">{{ t('主题色') }}</label>
          <Input
            :value="colorPrimary"
            type="color"
            style="width: 60px"
            @change.stop="(e) => updatePrimaryColor(e.target.value)"
          />
          <span class="ml-2">{{ colorPrimary }}</span>
        </div>

        <!-- 语言切换 -->
        <div>
          <label class="mr-2 font-semibold">{{ t('语言切换') }}</label>
          <Select
            :value="currentLanguage"
            :options="languageOptions"
            style="width: 200px"
            @change="changeLanguage"
          />
        </div>
      </Space>
    </Card>

    <!-- 恢复默认设置按钮 -->
    <div class="text-right">
      <AButton type="primary" @click="resetToDefault">
        {{ t('恢复默认值') }}
      </AButton>
    </div>
  </div>
</template>

<style lang="less">
</style>
