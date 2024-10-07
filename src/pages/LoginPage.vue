// src/pages/LoginPage.vue
<script lang="ts" setup>
import { getUserInfoApi } from '@/api/user/profile'
import { faceSignInApi, signInApi } from '@/api/user/signIn'
import { useAuthStore } from '@/stores/auth'
import { HomeOutlined, IdcardOutlined } from '@ant-design/icons-vue'
import { Button as AButton, Card, Flex, Form, FormItem, Input, InputPassword, Layout, message } from 'ant-design-vue'
import { nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()

const router = useRouter()

const loading = ref(false)
const faceLoading = ref(false)

const form = ref({
  username: '',
  password: '',
})

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const isCameraActive = ref(false)
const buttonLabel = ref('登录')

const tabList = [
  {
    key: 'tab1',
    tab: '用户名密码登录',
  },
  {
    key: 'tab2',
    tab: '人脸识别登录',
  },
]

const key = ref('tab1')

watch(key, async (newKey) => {
  reset() // 重置所有状态

  if (newKey === 'tab2') {
    await nextTick(() => {
      openCamera() // 打开摄像头
    })
  }
})

function onTabChange(value: string) {
  key.value = value
}

async function login(username: string, password: string) {
  if (!username || !password) {
    message.error(t('请填写完整的用户名和密码'))
    return
  }
  loading.value = true
  try {
    const response = await signInApi(username, password)
    const { refreshToken, accessToken } = response.data
    if (accessToken) {
      useAuthStore().setToken(accessToken, refreshToken)
      const res = await getUserInfoApi()
      useAuthStore().setUser(res.data)
      message.success(t('登录成功！'))
      await router.push('/dashboard')
    }
    else {
      message.error(t('登录失败'))
    }
  }
  catch (_error) {
    message.error(t('登录失败'))
  }
  finally {
    loading.value = false
  }
}

async function onSubmit() {
  if (!form.value.username || !form.value.password) {
    message.error(t('请填写完整的用户名和密码'))
    return
  }
  await login(form.value.username, form.value.password)
}

const capturedImage = ref<string | null>(null)

function openCamera() {
  if (navigator.mediaDevices && videoRef.value) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.value) {
          videoRef.value.srcObject = stream
          isCameraActive.value = true
          buttonLabel.value = t('登录')
          capturedImage.value = null
        }
      })
      .catch(() => {
        message.error(t('无法访问摄像头，请检查权限设置'))
      })
  }
}

async function onFaceRecognition() {
  if (isCameraActive.value && videoRef.value && canvasRef.value) {
    const context = canvasRef.value.getContext('2d')
    if (context) {
      // 计算长宽比
      const aspectRatio = videoRef.value.videoWidth / videoRef.value.videoHeight
      canvasRef.value.width = videoRef.value.videoWidth
      canvasRef.value.height = videoRef.value.videoWidth / aspectRatio
      // 拍摄照片
      context.drawImage(videoRef.value, 0, 0, canvasRef.value.width, canvasRef.value.height)
      // 停止摄像头流
      const stream = videoRef.value.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      isCameraActive.value = false
      capturedImage.value = canvasRef.value.toDataURL('image/png')
      // 执行人脸登录
      await onFaceLogin()
    }
  }
  else {
    message.error(t('登录失败，请检查摄像头'))
  }
}

const loginSuccess = ref(false) // 添加登录成功状态

async function onFaceLogin() {
  if (!capturedImage.value) {
    message.error(t('请先拍摄照片'))
    return
  }
  faceLoading.value = true
  try {
    const blob = await (await fetch(capturedImage.value)).blob()
    const response = await faceSignInApi(blob)
    const { refreshToken, accessToken } = response.data
    if (accessToken) {
      useAuthStore().setToken(accessToken, refreshToken)
      const res = await getUserInfoApi()
      useAuthStore().setUser(res.data)
    }
    message.success(t('人脸登录成功！'))
    loginSuccess.value = true
  }
  catch (_error) {
    message.error(t('人脸登录失败'))
    retryFaceRecognition()
  }
  finally {
    faceLoading.value = false
  }
}

function reset() {
  // 重置登录表单
  form.value.username = ''
  form.value.password = ''
  loginSuccess.value = false

  // 重置加载状态
  loading.value = false
  faceLoading.value = false

  // 重置摄像头状态
  capturedImage.value = null
  isCameraActive.value = false

  // 停止摄像头流
  if (videoRef.value && videoRef.value.srcObject) {
    const stream = videoRef.value.srcObject as MediaStream
    stream.getTracks().forEach(track => track.stop())
    videoRef.value.srcObject = null
  }

  buttonLabel.value = t('登录')
}

function enterSystem() {
  router.push('/dashboard')
}

function retryFaceRecognition() {
  loginSuccess.value = false
  openCamera()
}

function navigateToRegister() {
  router.push('/register')
}
</script>

<template>
  <Layout class="flex items-center justify-center h-full overflow-y-auto">
    <div class="max-w-96 w-full overflow-y-auto">
      <Card
        :tab-list="tabList"
        :active-tab-key="key"
        @tab-change="onTabChange"
      >
        <template #customTab="item">
          <span v-if="item.key === 'tab1'" class="text-sm">
            <HomeOutlined /> {{ t('用户名密码登录') }}
          </span>
          <span v-else-if="item.key === 'tab2'" class="text-sm">
            <IdcardOutlined /> {{ t('人脸识别登录') }}
          </span>
        </template>
        <template v-if="key === 'tab1'">
          <Form layout="vertical" @submit.prevent="onSubmit">
            <FormItem :label="t('用户名')">
              <Input v-model:value="form.username" :placeholder="t('请输入用户名')" />
            </FormItem>
            <FormItem :label="t('密码')">
              <InputPassword v-model:value="form.password" :placeholder="t('请输入密码')" />
            </FormItem>
            <FormItem>
              <AButton :loading="loading" type="primary" html-type="submit" class="w-full">
                {{ t('登录') }}
              </AButton>
            </FormItem>
            <p class="text-center mt-4">
              {{ t('没有账号？') }}<AButton type="link" @click="navigateToRegister">
                {{ t('立即注册') }}
              </AButton>
            </p>
          </Form>
        </template>
        <template v-else-if="key === 'tab2'">
          <div class="flex flex-col items-center">
            <div class="mt-4 w-48 h-48 border-4 border-gray-300 rounded-full overflow-hidden flex items-center justify-center">
              <!-- 使用 v-show 来控制视频的显示和隐藏 -->
              <video v-show="!capturedImage" ref="videoRef" autoplay class="w-full h-full object-cover" />
              <!-- 使用 v-show 来控制 canvas 的显示和隐藏 -->
              <canvas v-show="capturedImage" ref="canvasRef" class="w-full h-full object-cover" />
            </div>

            <!-- 登录成功时显示用户名 -->
            <template v-if="loginSuccess">
              <p class="text-xl font-bold mb-0">
                {{ useAuthStore().user?.username }}
              </p>
            </template>

            <Flex gap="middle" class="justify-center items-center p-3">
              <!-- 登录成功后显示"进入系统"和"重新人脸识别"按钮 -->
              <template v-if="loginSuccess">
                <AButton type="primary" @click="enterSystem">
                  {{ t('进入系统') }}
                </AButton>
                <AButton type="default" @click="retryFaceRecognition">
                  {{ t('切换账号') }}
                </AButton>
              </template>
              <!-- 否则显示登录按钮 -->
              <template v-else>
                <AButton type="primary" :loading="faceLoading" class="mt-4" @click="onFaceRecognition">
                  {{ buttonLabel }}
                </AButton>
              </template>
            </Flex>
            <p class="mt-2 text-gray-500">
              {{ t('请确保您的摄像头已连接') }}
            </p>
          </div>
        </template>
      </Card>
    </div>
  </Layout>
</template>

<style scoped>
</style>
