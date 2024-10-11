<script setup lang="ts">
import type { Product } from '@/types/shop/product'
import { addToCartApi } from '@/api/shop/cart'
import { getProductListApi } from '@/api/shop/product'
import { getUserInfoApi } from '@/api/user/profile'
import { useAuthStore } from '@/stores/auth'
import { Button as AButton, Card, Checkbox, Col, Image, Layout, message, Row } from 'ant-design-vue'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { Content, Footer } = Layout

const brands = ref([])
const selectedBrands = ref([])

// 模拟的商品列表
const productList = ref<Product[]>()

const adding = ref(false)

async function addToCart(product_id: string) {
  adding.value = true
  try {
    await addToCartApi(product_id, 1)
    message.success(t('添加购物车成功'))
  }
  catch (_error) {
    message.error(t('添加购物车失败'))
  }
  finally {
    adding.value = false
  }
}

onMounted(async () => {
  try {
    const response = await getUserInfoApi()
    useAuthStore().setUser(response.data)
    const res = await getProductListApi()
    productList.value = res.data.productList
  }
  catch (_error) {
    message.error(t('获取用户信息失败'))
    useAuthStore().logout()
  }
})
</script>

<template>
  <Layout>
    <!-- 顶部导航 -->
    <!--    <Header class="flex items-center justify-between px-6 bg-white shadow-md"> -->
    <!--      <img src="@/assets/logo.svg" class="h-10" alt=""> -->
    <!--      <a-input-search -->
    <!--        placeholder="搜索商品" -->
    <!--        enter-button="搜索" -->
    <!--        style="max-width: 400px" -->
    <!--        class="mr-4" -->
    <!--      /> -->
    <!--      <div class="flex items-center"> -->
    <!--        <AButton type="link"> -->
    <!--          我的购物车 -->
    <!--        </AButton> -->
    <!--        <a-badge count="2" offset="[-10, 10]"> -->
    <!--          <a-icon type="shopping-cart" style="font-size: 24px" /> -->
    <!--        </a-badge> -->
    <!--      </div> -->
    <!--    </Header> -->

    <!-- 内容区域 -->
    <Content class="px-10 py-6">
      <!-- 商品分类筛选 -->
      <div class="mb-6">
        <Row :gutter="[16, 16]">
          <Col :span="4">
            <Card>
              <Checkbox.Group v-model="selectedBrands" class="flex flex-col gap-2">
                <Checkbox v-for="brand in brands" :key="brand" :value="brand">
                  {{ brand }}
                </Checkbox>
              </Checkbox.Group>
            </Card>
          </Col>

          <!-- 商品列表 -->
          <Col :span="20">
            <Card :bordered="false">
              <Row :gutter="[16, 16]">
                <Col v-for="product in productList" :key="product.id" :span="6">
                  <Card
                    hoverable
                    class="overflow-hidden"
                  >
                    <template #cover>
                      <Image
                        :preview="false"
                        :src="product.image"
                        fallback="data:image/png;base64,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"
                      />
                    </template>
                    <a-card-meta
                      :title="product.name"
                      :description="product.description"
                    />
                    <div class="mt-3 text-xl font-semibold">
                      {{ product.price }} {{ t('元') }}
                    </div>
                    <AButton :loading="adding" class="mt-3 w-full" type="primary" @click="addToCart(product.id)">
                      {{ t('加入购物车') }}
                    </AButton>
                  </Card>
                </Col>
              </Row>
              <!-- 分页 -->
              <!--              <Pagination -->
              <!--                class="mt-6 text-center" -->
              <!--                :total="productList.length" -->
              <!--                :page-size="6" -->
              <!--                show-size-changer -->
              <!--                show-quick-jumper -->
              <!--              /> -->
            </Card>
          </Col>
        </Row>
      </div>
    </Content>

    <!-- 页脚 -->
    <Footer class="text-center">
      FacePerks ©2024 Created by YourName
    </Footer>
  </Layout>
</template>
