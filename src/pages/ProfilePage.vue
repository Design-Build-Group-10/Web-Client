<script setup lang="ts">
import { getUserInfoApi, postUserInfoApi, putUserAvatarApi } from '@/api/user/profile'
import { useAuthStore } from '@/stores/auth'
import { delay } from '@/utils/time'
import {
  CreditCardOutlined,
  InboxOutlined,
  MessageOutlined,
  RightOutlined,
  SafetyOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import { Button as AButton, Avatar, Badge, Card, Flex, message, Modal } from 'ant-design-vue'
import { onMounted, ref } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import { useI18n } from 'vue-i18n'
import 'vue-advanced-cropper/dist/style.css'
import 'vue-advanced-cropper/dist/theme.compact.css'

const { t } = useI18n()

interface editableUserInfo {
  username: string
  email: string
  phone: string
  avatar: string
  shipping_address: string
  payment_method: string
}

const originalUserInfo = ref<editableUserInfo>({
  username: '',
  email: '',
  phone: '',
  avatar: '',
  shipping_address: '',
  payment_method: '',
})

const userInfo = ref<editableUserInfo>({
  username: '',
  email: '',
  phone: '',
  avatar: '',
  shipping_address: '',
  payment_method: '',
})

const avatarUrl = ref<string | null>(null)

const editAvatar = ref(false)

// 当用户按下 ENTER 键结束编辑时的处理函数
async function handleEditEnd(field: keyof editableUserInfo, value: string) {
  try {
    userInfo.value[field] = value
    await delay(1)
    await postUserInfoApi(userInfo.value.email, userInfo.value.phone, userInfo.value.shipping_address, userInfo.value.payment_method)
    message.success(`${t(field)} ${t('修改成功')}`)
  }
  catch (_error) {
    message.error(`${t(field)} ${t('修改失败')}`)
  }
}

// 当用户按下 ESC 键取消编辑时的处理函数
function handleEditCancel(field: keyof editableUserInfo) {
  originalUserInfo.value[field] = userInfo.value[field]
  message.info(`${t(field)} ${t('修改已取消')}`)
}

// const loading = ref(false)

const cropper = ref<any>(null)
const file = ref<HTMLInputElement | null>(null)

async function cropImage() {
  if (!cropper.value)
    return
  const canvas: HTMLCanvasElement = cropper.value.getResult().canvas
  canvas.toBlob(async (blob) => {
    try {
      if (!blob) {
        message.error(t('头像裁剪失败'))
        return
      }
      await putUserAvatarApi(blob)
      await getUserInfo()
    }
    catch (error) {
      console.error(error)
      message.error(t('头像上传失败'))
    }
  }, 'image/png')
  editAvatar.value = false
  avatarUrl.value = null
}

function uploadImage(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (!files || !files[0]) {
    return
  }
  const fileType = files[0].type
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/svg+xml']
  if (!validImageTypes.includes(fileType)) {
    message.error(t('上传的文件不是图片文件'))
    file.value!.value = ''
    return
  }
  try {
    avatarUrl.value = URL.createObjectURL(files[0])
    editAvatar.value = true
  }
  catch (_error) {
    message.error(t('上传头像失败'))
  }
  file.value!.value = ''
}

async function getUserInfo() {
  const response = await getUserInfoApi()
  useAuthStore().setUser(response.data)
  originalUserInfo.value = { ...response.data }
  userInfo.value = { ...response.data }
}

async function handlePaymentMethodChange(e: Event) {
  try {
    userInfo.value.payment_method = (e.target as HTMLInputElement).value
    await postUserInfoApi(userInfo.value.email, userInfo.value.phone, userInfo.value.shipping_address, userInfo.value.payment_method)
    message.success(t('支付方式修改成功'))
    userInfo.value.payment_method = (e.target as HTMLInputElement).value
  }
  catch (_error) {
    message.error(t('支付方式修改失败'))
  }
}

onMounted(async () => {
  try {
    await getUserInfo()
  }
  catch (_error) {
    message.error(t('获取用户信息失败'))
  }
})
</script>

<template>
  <Flex vertical gap="middle" class="max-w-3xl mx-auto">
    <Card class="p-3 rounded-lg shadow-md" :title="t('修改用户信息')">
      <Flex gap="middle" class="w-full justify-between">
        <div class="w-full">
          <!-- 用户名编辑 -->
          <a-typography class="flex gap-3">
            {{ t('用户名：') }}
            <a-typography-paragraph
              v-model:content="userInfo.username"
              :copyable="{
                onCopy: () => message.success(t('复制成功')),
              }"
              class="flex-1"
            >
              <template #copyableTooltip="{ copied }">
                <span v-if="!copied" key="copy-tooltip">{{ t('复制') }}</span>
                <span v-else key="copied-tooltip">{{ t('复制成功') }}</span>
              </template>
            </a-typography-paragraph>
          </a-typography>

          <!-- 邮箱编辑 -->
          <a-typography class="flex gap-3">
            {{ t('邮箱：') }}
            <a-typography-paragraph
              v-model:content="userInfo.email"
              :editable="{
                onEnd: (value: string) => handleEditEnd('email', value),
                onCancel: () => handleEditCancel('email'),
                tooltip: true,
              }"
              :maxlength="50"
              class="flex-1"
            >
              <template #editableTooltip>
                {{ t('修改邮箱') }}
              </template>
            </a-typography-paragraph>
          </a-typography>

          <!-- 电话编辑 -->
          <a-typography class="flex gap-3">
            {{ t('电话号码：') }}
            <a-typography-paragraph
              v-model:content="userInfo.phone"
              :editable="{
                onEnd: (value: string) => handleEditEnd('phone', value),
                onCancel: () => handleEditCancel('phone'),
                tooltip: true,
              }"
              :maxlength="11"
              class="flex-1"
            >
              <template #editableTooltip>
                {{ t('修改电话号码') }}
              </template>
            </a-typography-paragraph>
          </a-typography>

          <!-- 地址编辑 -->
          <a-typography class="flex gap-3">
            {{ t('收货地址：') }}
            <a-typography-paragraph
              v-model:content="userInfo.shipping_address"
              :editable="{
                onEnd: (value: string) => handleEditEnd('shipping_address', value),
                onCancel: () => handleEditCancel('shipping_address'),
                tooltip: true,
              }"
              :maxlength="100"
              class="flex-1"
            >
              <template #editableTooltip>
                {{ t('修改地址') }}
              </template>
            </a-typography-paragraph>
          </a-typography>

          <!-- 支付方式编辑 -->
          <a-typography class="flex gap-3 whitespace-nowrap">
            {{ t('支付方式：') }}
            <a-radio-group
              :value="userInfo.payment_method"
              class="whitespace-normal"
              @change="handlePaymentMethodChange"
            >
              <a-radio value="credit_card">
                {{ t('信用卡') }}
              </a-radio>
              <a-radio value="paypal">
                {{ t('PayPal') }}
              </a-radio>
              <a-radio value="wechat">
                {{ t('微信支付') }}
              </a-radio>
              <a-radio value="alipay">
                {{ t('支付宝') }}
              </a-radio>
            </a-radio-group>
          </a-typography>
        </div>

        <Flex vertical gap="small" class="items-center">
          <!-- 显示当前头像 -->
          <Avatar :size="100" :src="userInfo.avatar">
            <template v-if="!useAuthStore().user?.avatar" #icon>
              <UserOutlined />
            </template>
          </Avatar>

          <!-- 上传头像按钮 -->
          <AButton class="flex justify-center items-center text-xs" @click="file?.click()">
            <UploadOutlined />
            {{ t('修改头像') }}
          </AButton>
        </Flex>
      </Flex>

      <input
        ref="file"
        type="file"
        accept="image/*"
        class="hidden"
        @change="uploadImage"
      >

      <Modal
        v-model:open="editAvatar"
        :title="t('裁剪头像')"
        centered
        :ok-text="t('确定')"
        :cancel-text="t('取消')"
        @ok="cropImage"
        @cancel="() => {
          editAvatar = false
          avatarUrl = null
        }"
      >
        <Cropper
          ref="cropper"
          class="h-72 mb-5"
          :src="avatarUrl"
          :stencil-props="{
            aspectRatio: 1,
          }"
        />
      </Modal>
    </Card>

    <Card class="p-3 rounded-lg shadow-md" title="我的订单">
      <div class="grid grid-cols-5 gap-4 text-center">
        <div class="flex flex-col items-center">
          <component :is="CreditCardOutlined" class="text-2xl" />
          <span class="mt-2">待付款</span>
        </div>

        <div class="flex flex-col items-center">
          <component :is="InboxOutlined" class="text-2xl" />
          <span class="mt-2">待收货</span>
        </div>

        <div class="flex flex-col items-center relative">
          <Badge count="1">
            <component :is="MessageOutlined" class="text-2xl" />
          </Badge>
          <span class="mt-2">待评价</span>
        </div>

        <div class="flex flex-col items-center">
          <component :is="SafetyOutlined" class="text-2xl" />
          <span class="mt-2">退换/售后</span>
        </div>

        <div class="flex flex-col items-center">
          <component :is="RightOutlined" class="text-2xl text-gray-400" />
          <span class="mt-2">全部订单</span>
        </div>
      </div>
    </Card>
  </Flex>
</template>
