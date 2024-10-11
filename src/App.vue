<script setup lang="ts">
import SideBar from '@/components/SideBar.vue'
import { useConfigStore } from '@/stores/config'
import { BulbOutlined, GlobalOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { ConfigProvider, FloatButton, Layout, theme } from 'ant-design-vue'
import { Moon } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t, locale } = useI18n()

function changeLanguage() {
  locale.value = locale.value === 'en' ? 'zh' : 'en'
  localStorage.setItem('locale', locale.value)
  window.location.reload()
}

const { Header, Sider, Content } = Layout

function toggleTheme() {
  useConfigStore().toggleTheme()
}

const route = useRoute()

const showHeader = computed(() => {
  return route.meta.header !== false
})

const showNavBar = computed(() => {
  return route.meta.navbar !== false
})
</script>

<template>
  <ConfigProvider
    :theme="{
      token: {
        colorPrimary: useConfigStore().colorPrimary,
        fontSize: useConfigStore().fontSize,
      },
      algorithm: useConfigStore().isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    }"
  >
    <Layout class="h-full overflow-hidden">
      <Header
        v-if="showHeader" class="header flex items-center" :style="`border-color: ${useConfigStore().colorPrimary}; border-bottom-width: 0.3em;`"
      >
        <div class="logo" />
        <span class="text-white font-bold text-2xl">FacePerks</span>
      </Header>
      <Layout>
        <Sider v-if="showNavBar" v-model:collapsed="useConfigStore().collapsed" width="256" theme="light" collapsible>
          <SideBar />
        </Sider>
        <Content class="overflow-x-hidden overflow-y-auto p-3">
          <RouterView />
        </Content>
      </Layout>
    </Layout>
    <FloatButton.Group trigger="hover">
      <template #icon>
        <SettingOutlined class="size-5" />
      </template>
      <FloatButton :tooltip="t('切换主题')" @click="toggleTheme">
        <template #icon>
          <BulbOutlined v-if="useConfigStore().isDarkMode" class="size-5" />
          <Moon v-else class="size-5" />
        </template>
      </FloatButton>

      <FloatButton :tooltip="t('切换语言')" @click="changeLanguage()">
        <template #icon>
          <GlobalOutlined class="size-5" />
        </template>
      </FloatButton>
    </FloatButton.Group>
  </ConfigProvider>
</template>

<style lang="less" scoped>
.header {
  padding-inline: 0;
  height: 3.4em;

  .logo {
    height: 60%;
    width: 5em;
    background: url("@/assets/logo.svg") no-repeat center center / contain;
  }
}
</style>
