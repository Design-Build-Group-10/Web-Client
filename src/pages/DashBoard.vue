<script setup lang="ts">
import { getUserInfoApi } from '@/api/user/profile'
import { useAuthStore } from '@/stores/auth'
import { Button as AButton, Card, Checkbox, Col, Layout, message, Pagination, Row } from 'ant-design-vue'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { Content, Footer } = Layout

const brands = ref(['品牌A', '品牌B', '品牌C', '品牌D'])
const selectedBrands = ref([])

// 模拟的商品列表
const products = ref([
  { id: 1, name: '商品 1', description: '描述 1', price: 100 },
  { id: 2, name: '商品 2', description: '描述 2', price: 200 },
  { id: 3, name: '商品 3', description: '描述 3', price: 300 },
  { id: 4, name: '商品 4', description: '描述 4', price: 400 },
  { id: 5, name: '商品 5', description: '描述 5', price: 500 },
  { id: 6, name: '商品 6', description: '描述 6', price: 600 },
  { id: 7, name: '商品 7', description: '描述 7', price: 700 },
  { id: 8, name: '商品 8', description: '描述 8', price: 800 },
])

// const { Header, Sider, Content } = Layout

onMounted(async () => {
  try {
    const response = await getUserInfoApi()
    useAuthStore().setUser(response.data)
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
                <Col v-for="product in products" :key="product.id" :span="6">
                  <Card
                    hoverable
                    class="overflow-hidden"
                  >
                    <template #cover>
                      <img
                        alt="example"
                        src="http://dummyimage.com/200x200"
                      >
                    </template>
                    <a-card-meta
                      :title="product.name"
                      :description="product.description"
                    />
                    <div class="mt-3 text-xl font-semibold">
                      {{ product.price }} {{ t('元') }}
                    </div>
                    <AButton class="mt-3 w-full" type="primary">
                      {{ t('加入购物车') }}
                    </AButton>
                  </Card>
                </Col>
              </Row>
              <!-- 分页 -->
              <Pagination
                class="mt-6 text-center"
                :total="products.length"
                :page-size="6"
                show-size-changer
                show-quick-jumper
              />
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
