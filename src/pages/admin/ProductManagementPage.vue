<script setup lang="ts">
import type { Product } from '@/types/shop/product'
import type { Shop } from '@/types/shop/shop'
import type { SelectValue } from 'ant-design-vue/es/select'
import { fetchImageApi, getProductInfoApi, postProductApi, updateProductInfoApi } from '@/api/shop/product'
import { deleteProductApi, getShopInfoApi, getUserShopListApi } from '@/api/shop/shop'
import { delay } from '@/utils/time'

import { UploadOutlined } from '@ant-design/icons-vue'
import {
  Button as AButton,
  Flex,
  Form,
  Image,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Table,
  type TableColumnsType,
} from 'ant-design-vue'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 当前选中的店铺
const selectedShopId = ref<SelectValue>()
const shopList = ref<Shop[]>([])

// 当前选中的店铺的商品列表
const productList = ref<Product[]>([])

const isAdding = ref(false)
const isEditing = ref(false)

// 用于保存正在编辑的商品
const editingProduct = ref<Product>()

const columns: TableColumnsType = [
  {
    title: t('商品图片'),
    dataIndex: 'image',
    fixed: 'left',
    width: '10%',
  },
  {
    title: t('商品名称'),
    dataIndex: 'name',
    width: '20%',
  },
  {
    title: t('描述'),
    dataIndex: 'description',
    width: '25%',
  },
  {
    title: t('单价'),
    dataIndex: 'price',
    width: '15%',
    customRender: ({ text }) => `￥${text}`,
  },
  {
    title: t('库存'),
    dataIndex: 'stock',
    width: '15%',
  },
  {
    title: t('操作'),
    dataIndex: 'operation',
    fixed: 'right',
    width: '15%',
  },
]

// 加载用户店铺列表
async function loadUserShops() {
  try {
    const response = await getUserShopListApi()
    shopList.value = response.data.userShops
  }
  catch (_error) {
    message.error(t('获取店铺列表失败'))
  }
}

const loading = ref(false)

// 加载某个店铺的商品列表
async function loadShopProducts(shopId: string) {
  loading.value = true
  productList.value = []
  await delay(1000)
  try {
    const response = await getShopInfoApi(shopId)
    const productIds = response.data.shopInfo.featured_products
    for (const id of productIds) {
      const res = await getProductInfoApi(id)
      productList.value.push(res.data.productInfo)
    }
  }
  catch (_error) {
    message.error(t('获取商品列表失败'))
  }
  finally {
    loading.value = false
  }
}

const file_Blob = ref<Blob | null>(null)

async function fetchImage(url: string) {
  try {
    return await fetchImageApi(url)
  }
  catch (_error) {
    message.error(t('图片加载失败'))
  }
}

// 进入编辑模式，设置正在编辑的商品
async function editProduct(product: Product) {
  isAdding.value = false
  editingProduct.value = { ...product }
  if (product.image) {
    const blob = await fetchImage(product.image)
    if (blob) {
      file_Blob.value = blob
    }
  }
  isEditing.value = true
}

// 提交商品修改
async function saveProduct() {
  if (!editingProduct.value || !isAdding.value)
    return
  try {
    if (isAdding.value) {
      await postProductApi(
        selectedShopId.value as string,
        editingProduct.value.name,
        editingProduct.value.description,
        editingProduct.value.price,
        editingProduct.value.stock,
        file_Blob.value,
      )
      message.success(t('商品添加成功'))
    }
    else if (isEditing.value) {
      // 更新商品信息
      const { id, ...updatedData } = editingProduct.value
      await updateProductInfoApi(id, updatedData.name, updatedData.description, updatedData.price, updatedData.stock, file_Blob.value)
      message.success(t('商品信息修改成功'))
    }
    await loadShopProducts(selectedShopId.value as string)
  }
  catch (_error) {
    message.error(t(isAdding.value ? '添加商品失败' : '商品信息修改失败'))
  }
  isEditing.value = false
  isAdding.value = false
}

// 删除商品
async function deleteProduct(productId: string) {
  if (!selectedShopId.value)
    return
  try {
    await deleteProductApi(selectedShopId.value as string, productId)
    message.success(t('商品删除成功'))
    await loadShopProducts(selectedShopId.value as string)
  }
  catch (_error) {
    message.error(t('商品删除失败'))
  }
}

function handleShopChange(value: SelectValue) {
  selectedShopId.value = value
  loadShopProducts(value as string)
}

const fileInput = ref<HTMLInputElement | null>(null)

// 处理文件选择事件
function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    // 检查是否为图片
    if (!file.type.startsWith('image/')) {
      message.error('只能上传图片文件!')
      return
    }

    // 将文件转换为URL
    const imageUrl = URL.createObjectURL(file)
    file_Blob.value = file
    if (editingProduct.value) {
      editingProduct.value.image = imageUrl
    }
  }
}

const isModalOpen = computed(() => isAdding.value || isEditing.value)

// 当关闭模态框时，重置相关状态
function closeModal() {
  isAdding.value = false
  isEditing.value = false
}

onMounted(() => {
  loadUserShops()
})
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">
      {{ t('店铺商品管理') }}
    </h1>

    <!-- 店铺选择 -->
    <Flex gap="middle" class="mb-6 items-center">
      <label class="mr-2 font-semibold">{{ t('选择店铺：') }}</label>
      <Select
        v-model:value="selectedShopId"
        show-search
        :placeholder="t('选择店铺')"
        style="width: 300px"
        :options="shopList.map(shop => ({ label: shop.name, value: shop.id }))"
        @change="handleShopChange"
      />

      <!-- 添加商品按钮 -->
      <AButton
        :disabled="!selectedShopId"
        type="primary" @click="() => {
          if (!selectedShopId){
            message.error(t('请先选择店铺'))
            return
          }
          isAdding = true;
          isEditing = false;
          editingProduct = { id: '', name: '', description: '', price: '', stock: 0, image: '' }
        }"
      >
        {{ t('添加商品') }}
      </AButton>
    </Flex>

    <!-- 商品列表 -->
    <Table :loading="loading" :scroll="{ x: 1000, y: 1000 }" :columns="columns" :data-source="productList" row-key="id" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'image'">
          <Image
            :preview="false"
            :src="record.image"
            fallback="data:image/png;base64,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"
          />
        </template>
        <template v-if="column.dataIndex === 'operation'">
          <AButton type="primary" class="mr-2" @click="editProduct(record as Product)">
            {{ t('编辑') }}
          </AButton>
          <a-popconfirm
            :ok-text="t('确认')"
            :cancel-text="t('取消')"
            :title="t('确认删除？')"
            @confirm="deleteProduct(record.id)"
          >
            <AButton danger>
              {{ t('删除') }}
            </AButton>
          </a-popconfirm>
        </template>
      </template>
    </Table>

    <!-- 商品编辑模态框 -->
    <Modal
      v-model:open="isModalOpen" :title="isAdding ? t('添加商品') : t('编辑商品')" :ok-text="t('确定')"
      :cancel-text="t('取消')" @ok="saveProduct"
      @cancel="closeModal"
    >
      <Form v-if="editingProduct" layout="vertical">
        <Form.Item :label="t('商品名称')">
          <Input v-model:value="editingProduct.name" />
        </Form.Item>
        <Form.Item :label="t('商品描述')">
          <Input v-model:value="editingProduct.description" />
        </Form.Item>
        <Form.Item :label="t('单价')">
          <InputNumber v-model:value="editingProduct.price" prefix="¥" suffix="RMB" class="w-full" />
        </Form.Item>
        <Form.Item :label="t('库存')">
          <InputNumber v-model:value="editingProduct.stock" class="w-full" />
        </Form.Item>
        <Form.Item :label="t('商品图片')">
          <AButton class="flex justify-center items-center" @click="fileInput?.click()">
            <UploadOutlined />
            {{ t('上传图片') }}
          </AButton>
          <Flex vertical gap="middle" class="items-center mt-2">
            <Image
              :src="editingProduct.image"
              class="max-w-64 max-h-64"
              fallback="data:image/png;base64,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"
            />
          </Flex>
        </Form.Item>
      </Form>
    </Modal>

    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange">
  </div>
</template>

<style scoped lang="less">
</style>
