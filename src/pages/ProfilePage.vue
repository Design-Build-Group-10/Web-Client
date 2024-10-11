<script setup lang="ts">
import { getUserInfoApi, putUserAvatarApi, putUserInfoApi } from '@/api/user/profile'
import { useAuthStore } from '@/stores/auth'
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
}

const originalUserInfo = ref<editableUserInfo>({
  username: '',
  email: '',
  phone: '',
  avatar: '',
})

const userInfo = ref<editableUserInfo>({
  username: '',
  email: '',
  phone: '',
  avatar: '',
})

const avatarUrl = ref<string | null>(null)

const editAvatar = ref(false)

// 当用户按下 ENTER 键结束编辑时的处理函数
async function handleEditEnd(field: keyof editableUserInfo, value: string) {
  try {
    userInfo.value[field] = value
    await putUserInfoApi(userInfo.value.username, userInfo.value.email, userInfo.value.phone)
    message.success(`${field} ${t('修改成功')}`)
  }
  catch (_error) {
    message.error(`${field} ${t('修改失败')}`)
  }
}

// 当用户按下 ESC 键取消编辑时的处理函数
function handleEditCancel(field: keyof editableUserInfo) {
  originalUserInfo.value[field] = userInfo.value[field]
  message.info(`${field} ${t('修改已取消')}`)
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
  <Flex vertical gap="middle" class="max-w-2xl mx-auto">
    <Card class="p-3 rounded-lg shadow-md" :title="t('修改用户信息')">
      <Flex gap="middle" class="w-full justify-between">
        <div class="w-full">
          <!-- 用户名编辑 -->
          <a-typography class="flex gap-3">
            <span>{{ t('用户名：') }}</span>
            <a-typography-paragraph
              v-model:content="userInfo.username"
              :editable="{
                onEnd: (value: string) => handleEditEnd('username', value),
                onCancel: () => handleEditCancel('username'),
                tooltip: true,
              }"
              :maxlength="20"
              class="flex-1"
            >
              <template #editableTooltip>
                {{ t('修改用户名') }}
              </template>
            </a-typography-paragraph>
          </a-typography>

          <!-- 邮箱编辑 -->
          <a-typography class="flex gap-3">
            <span>{{ t('邮箱：') }} </span>
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
            <span>{{ t('电话号码：') }}</span>
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
      </flex>

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
