<script setup lang="ts">
import type { Product } from '@/types/shop/product'
import { addToCartApi } from '@/api/shop/cart'
import { getProductInfoApi } from '@/api/shop/product'
import SideBar from '@/components/SideBar.vue'
import { useConfigStore } from '@/stores/config'
import { delay } from '@/utils/time'
import { BulbOutlined, GlobalOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { ConfigProvider, FloatButton, Image, Layout, message, Modal, Spin, theme } from 'ant-design-vue'
import { Moon } from 'lucide-vue-next'
import { computed, provide, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t, locale } = useI18n()

function changeLanguage() {
  locale.value = locale.value === 'en' ? 'zh-CN' : 'en'
  localStorage.setItem('locale', locale.value)
  window.location.reload()
}

const { Header, Sider, Content } = Layout

function toggleTheme() {
  useConfigStore().toggleTheme()
}

const route = useRoute()

const adding = ref(false)

async function addToCart(product_id: string) {
  adding.value = true
  try {
    await addToCartApi(product_id, 1)
    await delay(1000)
    message.success(t('添加购物车成功'))
  }
  catch (_error) {
    message.error(t('添加购物车失败'))
  }
  finally {
    adding.value = false
  }
}

const previewing = ref(false)
const previewProduct = ref<Product | null>(null)
const loadingProduct = ref(false)

async function openModal(productId: string) {
  previewing.value = true
  loadingProduct.value = true
  try {
    const response = await getProductInfoApi(productId)
    previewProduct.value = response.data.productInfo
  }
  catch (_error) {
    message.error(t('获取商品详情失败'))
  }
  finally {
    loadingProduct.value = false
  }
}

provide('openModal', openModal)

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
        <!--        <span class="text-white font-bold text-2xl">FacePerks</span> -->
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

      <FloatButton :tooltip="t('切换语言')" @click="changeLanguage">
        <template #icon>
          <GlobalOutlined class="size-5" />
        </template>
      </FloatButton>
    </FloatButton.Group>

    <Modal
      v-model:open="previewing"
      centered :title="t('商品详情')"
      :ok-text="t('加入购物车')"
      destroy-on-close
      :footer="null"
      :width="1000"
      @after-close="previewProduct = null"
    >
      <Spin :spinning="loadingProduct">
        <div class="max-w-[80rem] flex">
          <!-- 左侧图片部分 -->
          <div class="flex-1 flex justify-center items-center">
            <Image
              :src="previewProduct?.image"
              alt=""
              class="rounded-lg"
            />
          </div>

          <!-- 右侧产品信息部分 -->
          <div class="flex-1 flex flex-col justify-between ml-6">
            <!-- 商品描述 -->
            <div class="product-info">
              <h1 class="text-2xl font-bold">
                {{ previewProduct?.name }}
              </h1>
              <p class="text-gray-500 mt-2">
                {{ previewProduct?.description }}
              </p>
              <!--              <div class="mt-4"> -->
              <!--                <img src="" alt="Installation Before" class="inline-block w-16 h-16 rounded-lg mr-2"> -->
              <!--                <img src="" alt="Installation After" class="inline-block w-16 h-16 rounded-lg"> -->
              <!--              </div> -->
            </div>

            <!-- 价格和按钮 -->
            <div class="product-buy flex flex-col mt-6">
              <div class="price text-2xl font-semibold text-red-600">
                ¥ {{ previewProduct?.price }} {{ t('元') }}
              </div>
              <AButton
                :loading="adding" type="primary" class="rounded-lg my-2" @click="() => {
                  if (previewProduct) {
                    addToCart(previewProduct.id)
                  }
                }"
              >
                {{ t('加入购物车') }}
              </AButton>
              <p class="text-gray-400 text-sm mb-0">
                {{ t('温馨提示 · 支持7天无理由退货') }}
              </p>
            </div>
          </div>
        </div>
      </Spin>
    </Modal>
  </ConfigProvider>
</template>

<style lang="less" scoped>
.header {
  padding-inline: 0;
  height: 3.4em;

  .logo {
    height: 90%;
    width: 12em;
    background: url("@/assets/logo1.svg") no-repeat center center / contain;
  }
}
</style>
