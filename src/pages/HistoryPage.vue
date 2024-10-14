<script setup lang="ts">
import type { Product } from '@/types/shop/product'
import { getBrowseHistoryApi, getProductInfoApi } from '@/api/shop/product'
import { Card, Layout, message, Spin } from 'ant-design-vue'
import { inject, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const loading = ref(false)
const historyList = ref<Product[]>([])

const { Content } = Layout

async function getBrowseHistory() {
  loading.value = true
  try {
    const response = await getBrowseHistoryApi()
    const browseHistory = response.data.browse_history
    const temp: Product[] = []
    for (const id of browseHistory) {
      const res = await getProductInfoApi(id)
      temp.push(res.data.productInfo)
    }
    historyList.value = temp
  }
  catch (_error) {
    message.error('获取浏览历史失败')
  }
  finally {
    loading.value = false
  }
}

const openModal = inject('openModal') as (productId: string) => void

onMounted(async () => {
  await getBrowseHistory()
})
</script>

<template>
  <Layout class="p-4">
    <h1 class="text-xl font-bold mb-4">
      {{ t('浏览历史') }}
    </h1>
    <!--    <Row justify="center" align="middle"> -->
    <!--      <Col> -->
    <!--        <InputSearch -->
    <!--          v-model:value="searchQuery" -->
    <!--          :placeholder="t('搜索商品')" -->
    <!--          enter-button="搜索" -->
    <!--          allow-clear -->
    <!--          style="max-width: 400px" -->
    <!--          @search="handleSearch" -->
    <!--        /> -->
    <!--      </Col> -->
    <!--    </Row> -->

    <!-- 内容区域 -->
    <Content>
      <Spin v-if="historyList.length" :spinning="loading || !historyList" class="w-full flex justify-center">
        <!-- 商品分类筛选 -->
        <div class="mb-6 h-full">
          <!-- 商品列表 -->
          <Card :bordered="false" class="flex justify-center cursor-pointer">
            <div
              class="flex flex-wrap gap-2 px-4 pb-3 w-full"
              style="grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));"
            >
              <div
                v-for="product in historyList"
                :key="product.id"
                class="min-w-[25rem] flex-1 max-h-full w-full !h-64"
                style="flex:1 1 200px;"
                @click="openModal(product.id)"
              >
                <div class="w-full h-full flex p-5 flex-row bg-transparent rounded-lg shadow-md hover:shadow-lg">
                  <div class="flex-1 w-full flex-col flex">
                    <h3 class="font-bold text-lg line-clamp-1">
                      {{ product.name }}
                    </h3>
                    <p class="text-gray-500 line-clamp-3">
                      {{ product.description }}
                    </p>
                    <div class="text-red-600 mt-auto text-xl font-semibold">
                      ¥ {{ product.price }} {{ t('元') }}
                    </div>
                  </div>
                  <div class="w-1/3 h-full ml-5 flex justify-end">
                    <img
                      :src="product.image"
                      alt=""
                      class="rounded-lg block object-contain"
                    >
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Spin>

      <div v-else class="w-full h-full flex justify-center items-center">
        <p class="text-gray-400 text-sm mb-0">
          {{ t('您还没有浏览过任何商品哦，快去看看吧！') }}
        </p>
      </div>
    </Content>
  </Layout>
</template>

<style scoped lang="less">

</style>
