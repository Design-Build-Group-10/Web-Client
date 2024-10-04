<script setup lang="ts">
import { useConfigStore } from '@/stores/config'
import { BulbOutlined } from '@ant-design/icons-vue'
import { ConfigProvider, FloatButton, Layout, theme } from 'ant-design-vue'
import { Moon } from 'lucide-vue-next'

const { Content } = Layout

function toggleTheme() {
  useConfigStore().toggleTheme()
}
</script>

<template>
  <ConfigProvider
    :theme="{
      algorithm: useConfigStore().isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    }"
  >
    <Layout class="h-full overflow-hidden">
      <!--      <Header class="header flex items-center"> -->
      <!--        <div class="logo" /> -->
      <!--        <span class="text-white font-bold text-2xl">智慧篮球管理系统</span> -->
      <!--      </Header> -->
      <Layout>
        <!--        <Sider v-if="showNavBar" width="256" theme="light"> -->
        <!--          <SideBar /> -->
        <!--        </Sider> -->
        <Content class="overflow-x-hidden overflow-y-auto">
          <RouterView />
        </Content>
      </Layout>
    </Layout>
    <FloatButton tooltip="切换主题" @click="toggleTheme">
      <template #icon>
        <BulbOutlined v-if="useConfigStore().isDarkMode" class="size-5" />
        <Moon v-else class="size-5" />
      </template>
    </FloatButton>
  </ConfigProvider>
</template>

<style scoped>
</style>
