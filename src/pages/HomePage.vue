<script setup lang="ts">
import type { Product } from '@/types/shop/product'
import { getProductListApi } from '@/api/shop/product'
import { getUserInfoApi } from '@/api/user/profile'
import { useAuthStore } from '@/stores/auth'
import { Card, Col, InputSearch, Layout, message, Row, Spin } from 'ant-design-vue'
import { inject, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { Content, Footer } = Layout

// 模拟的商品列表
const productList = ref<Product[]>()

const searchQuery = ref('')

const loading = ref(false)

async function fetchProducts() {
  loading.value = true
  try {
    const res = await getProductListApi()
    productList.value = res.data.productList
  }
  catch (_error) {
    message.error(t('获取商品列表失败'))
  }
  finally {
    loading.value = false
  }
}

function handleSearch() {
  if (searchQuery.value) {
    productList.value = productList.value?.filter(product =>
      product.name.includes(searchQuery.value) || product.description.includes(searchQuery.value),
    )
  }
  else {
    fetchProducts() // 搜索为空时重新获取所有商品
  }
}

const openModal = inject('openModal') as (productId: string) => void

onMounted(async () => {
  try {
    const response = await getUserInfoApi()
    useAuthStore().setUser(response.data)
    const res = await getProductListApi()
    productList.value = [...res.data.productList, ...res.data.productList]
  }
  catch (_error) {
    message.error(t('获取用户信息失败'))
    useAuthStore().logout()
  }
})
</script>

<template>
  <Layout>
    <Row justify="center" align="middle">
      <Col>
        <InputSearch
          v-model:value="searchQuery"
          :placeholder="t('搜索商品')"
          enter-button="搜索"
          allow-clear
          style="max-width: 400px"
          @search="handleSearch"
        />
      </Col>
    </Row>

    <!-- 内容区域 -->
    <Content class="px-10 py-3">
      <Spin :spinning="loading || !productList" class="w-full flex justify-center">
        <!-- 商品分类筛选 -->
        <div class="mb-6 h-full">
          <!-- 商品列表 -->
          <Card :bordered="false" class="flex justify-center cursor-pointer">
            <div
              class="flex flex-wrap gap-2 px-4 pb-3 w-full"
              style="grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));"
            >
              <div
                v-for="product in productList"
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
    </Content>

    <!-- 页脚 -->
    <Footer class="text-center">
      FacePerks ©2024 Created by Group 10
    </Footer>
  </Layout>
</template>
