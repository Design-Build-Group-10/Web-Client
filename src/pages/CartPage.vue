<script setup lang="ts">
import type { Cart } from '@/types/shop/cart'
import type { Product } from '@/types/shop/product'
import { changeCartApi, getCartApi } from '@/api/shop/cart'
import { useAuthStore } from '@/stores/auth'
import { Image, message, Modal, Table, type TableColumnsType } from 'ant-design-vue'
import { computed, inject, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

type Key = string | number

const cart = ref<Cart | null>(null)

const productList = ref<Product[]>([])

const clearing = ref(false)
const ordering = ref(false)

const columns: TableColumnsType = [
  {
    title: t('商品'),
    dataIndex: 'name',
    fixed: 'left',
    width: '30%',
  },
  {
    title: t('单价'),
    dataIndex: 'price',
    customRender: ({ text }) => `￥${text}`,
    width: '20%',
  },
  {
    title: t('数量'),
    dataIndex: 'quantity',
    width: '20%',
  },
  {
    title: t('小计'),
    dataIndex: 'total_price',
    customRender: ({ text }) => `￥${text}`,
    width: '20%',
  },
  {
    title: t('操作'),
    dataIndex: 'operation',
    fixed: 'right',
    width: '10%',
  },
]

const state = reactive<{
  selectedRowKeys: Key[]
  loading: boolean
}>({
  selectedRowKeys: [],
  loading: false,
})

const totalPrice = computed(() => {
  return productList.value
    .filter(item => state.selectedRowKeys.includes(item.id))
    .reduce((acc, cur) => acc + Number(cur.total_price), 0)
})

function onSelectChange(selectedRowKeys: Key[]) {
  state.selectedRowKeys = selectedRowKeys
}

const loading = ref(false)

async function getCart() {
  loading.value = true
  try {
    const response = await getCartApi()
    cart.value = response.data.cart
    productList.value = cart.value.products
  }
  catch (_error) {
    message.error(t('获取购物车失败'))
  }
  finally {
    loading.value = false
  }
}

async function handleQuantityChange(product_id: string, quantity: number) {
  if (product_id && quantity) {
    try {
      await changeCartApi(product_id, quantity)
      const product = productList.value.find(item => item.id === product_id)
      if (product) {
        product.total_price = String(Number(product.price) * quantity)
      }
    }
    catch (_error) {
      message.error(t('更新购物车失败'))
    }
  }
}

async function removeCartItem(product_id: string) {
  if (product_id) {
    try {
      await changeCartApi(product_id, 0)
      productList.value = []
      await getCart()
    }
    catch (_error) {
      message.error(t('删除失败'))
    }
  }
}

const selectedProducts = ref<Product[]>([])

function onClearing() {
  selectedProducts.value = productList.value.filter(item => state.selectedRowKeys.includes(item.id))
  if (selectedProducts.value.length === 0) {
    message.error(t('请选择商品'))
    return
  }
  clearing.value = true
}

const openModal = inject('openModal') as (productId: string) => void

async function submitOrder() {
  if (ordering.value) {
    return
  }
  ordering.value = true
  try {
    ordering.value = false
    clearing.value = false
  }
  catch (_error) {
    message.error(t('提交订单失败'))
  }
  finally {
    ordering.value = false
  }
}

onMounted(async () => {
  await getCart()
})
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">
      {{ t('全部商品') }} {{ productList.length }}
    </h1>

    <Table
      :scroll="{ x: 1000, y: 1000 }"
      :loading="loading"
      :row-selection="{ selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange }"
      :columns="columns"
      :data-source="productList"
      :row-key="record => record.id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'name'">
          <AButton type="link" class="flex h-full items-center" @click="openModal(record.id)">
            <Image
              :preview="false"
              :src="record.image"
              :width="100"
              :height="100"
            />
            <span class="ml-2">{{ record.name }}</span>
          </AButton>
        </template>

        <template v-if="column.dataIndex === 'operation'">
          <a-popconfirm
            :ok-text="t('确认')"
            :cancel-text="t('取消')"
            :title="t('确认删除？')"
            @confirm="removeCartItem(record.id)"
          >
            <AButton type="link">
              {{ t('删除') }}
            </AButton>
          </a-popconfirm>
        </template>

        <template v-else-if="column.dataIndex === 'quantity'">
          <a-input-number
            v-model:value="record.quantity"
            :min="1"
            :max="100"
            controls
            @change="handleQuantityChange(record.id, record.quantity)"
          />
        </template>
      </template>
    </Table>

    <!-- Footer actions -->
    <div class="flex justify-end items-center py-2 gap-2">
      <div class="font-bold">
        {{ t('selectedItems', { count: state.selectedRowKeys.length, total: totalPrice }) }}
      </div>
      <AButton :disabled="!state.selectedRowKeys.length" type="primary" @click="onClearing">
        {{ t('去结算') }}
      </AButton>
    </div>

    <Modal
      v-model:open="clearing"
      centered :title="t('填写并核对订单信息')"
      :ok-text="t('提交订单')"
      :cancel-text="t('返回修改购物车')"
      destroy-on-close
      :width="1000"
      @ok="submitOrder"
    >
      <div class="w-full mx-auto max-h-[50rem] overflow-y-auto px-3">
        <!-- 收货人信息 -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold">
            {{ t('收货人信息') }}
          </h2>
          <div class="border rounded p-4 mt-2">
            <span class="font-bold">{{ useAuthStore().user?.username }}</span> 北京
            <p class="text-sm text-gray-500 mt-1">
              {{ useAuthStore().user?.address }} {{ useAuthStore().user?.phone.substring(0, 3) }}****{{ useAuthStore().user?.phone.substring(7) }}
            </p>
            <AButton type="link" class="text-sm mt-2 p-0">
              {{ t('修改地址') }}
            </AButton>
          </div>
        </div>

        <!-- 支付方式 -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold">
            {{ t('支付方式') }}
          </h2>
          <div class="border rounded p-4 mt-2 flex items-center">
            <label class="flex items-center">
              <input type="radio" name="payment" checked class="mr-2">
              <span>{{ t('在线支付') }}</span>
            </label>
          </div>
        </div>

        <!-- 配送方式 -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold">
            {{ t('配送方式') }}
          </h2>
          <div class="border rounded p-4 mt-2">
            <div class="flex justify-between items-center">
              <span>{{ t('快递运输') }}</span>
              <span>{{ t('预计 24小时内 发货') }}</span>
            </div>
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold">
            {{ t('送货清单') }}
          </h2>
          <div v-for="product in selectedProducts" :key="product.id" class="border rounded p-4 mt-2">
            <div class="w-full flex">
              <div class="flex-1 flex justify-center items-center">
                <Image
                  :src="product.image"
                  alt=""
                  class="rounded-lg"
                />
              </div>
              <!-- 商品信息部分 -->
              <div class="w-full flex flex-col max-w-[40rem] ml-4">
                <!-- 商品标题和描述 -->
                <div class="flex justify-between">
                  <div>
                    <p class="font-semibold text-base">
                      {{ product.name }}
                    </p>
                  </div>
                  <!-- 价格 -->
                  <div class="text-red-500 text-lg font-bold">
                    ¥ {{ Number(product.price) * product.quantity! }}
                  </div>
                </div>

                <!-- 购买数量和库存状态 -->
                <div class="flex justify-between mt-2">
                  <p class="text-gray-500 text-sm">
                    x {{ product.quantity }}
                  </p>
                  <p class="text-sm">
                    {{ t('有货') }}
                  </p>
                </div>

                <!-- 支持退货提示 -->
                <div class="text-sm text-green-600 mt-auto">
                  {{ t('支持7天无理由退货') }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 发票信息 -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold">
            {{ t('发票信息') }}
          </h2>
          <div class="border rounded p-4">
            <p class="text-sm text-gray-500 mb-0">
              {{ t('不开具发票') }}
            </p>
          </div>
        </div>

        <!-- 订单结算 -->
        <div class="border-t pt-4">
          <div class="flex justify-between items-center">
            <span class="text-lg font-semibold">{{ t('应付金额') }}</span>
            <span class="text-red-600 text-2xl font-bold">¥ {{ totalPrice }}</span>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
</style>
