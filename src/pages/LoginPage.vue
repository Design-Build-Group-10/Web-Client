// src/pages/LoginPage.vue
<script lang="ts" setup>
import { getUserInfoApi } from '@/api/user/profile'
import { faceSignInApi, signInApi } from '@/api/user/signIn'
import { useAuthStore } from '@/stores/auth'
import { HomeOutlined, IdcardOutlined } from '@ant-design/icons-vue'
import { Button as AButton, Card, Flex, Form, FormItem, Input, InputPassword, Layout, message } from 'ant-design-vue'
import { nextTick, ref, watch } from 'vue'

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
    message.error('请填写完整的用户名和密码')
    return
  }
  loading.value = true
  try {
    const response = await signInApi(username, password)
    const { refreshToken, accessToken } = response.data
    if (accessToken) {
      const res = await getUserInfoApi()
      useAuthStore().login(accessToken, refreshToken, res.data)
    }
  }
  catch (_error) {
    message.error('登录失败')
  }
  finally {
    loading.value = false
  }
}

function onSubmit() {
  if (!form.value.username || !form.value.password) {
    message.error('请填写完整的用户名和密码')
    return
  }
  login(form.value.username, form.value.password)
  message.success('登录成功！')
}

const capturedImage = ref<string | null>(null)

function openCamera() {
  if (navigator.mediaDevices && videoRef.value) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.value) {
          videoRef.value.srcObject = stream
          isCameraActive.value = true
          buttonLabel.value = '登录'
          capturedImage.value = null
        }
      })
      .catch(() => {
        message.error('无法访问摄像头，请检查权限设置')
      })
  }
}

async function onFaceRecognition() {
  if (isCameraActive.value && videoRef.value && canvasRef.value) {
    const context = canvasRef.value.getContext('2d')
    if (context) {
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
    message.error('登录失败，请检查摄像头')
  }
}

const loginSuccess = ref(false) // 添加登录成功状态

async function onFaceLogin() {
  if (!capturedImage.value) {
    message.error('请先拍摄照片')
    return
  }
  faceLoading.value = true
  try {
    const blob = await (await fetch(capturedImage.value)).blob()
    const response = await faceSignInApi(blob)
    const { refreshToken, accessToken } = response.data
    if (accessToken) {
      const res = await getUserInfoApi()
      useAuthStore().login(accessToken, refreshToken, res.data)
    }
    message.success('人脸登录成功！')
    loginSuccess.value = true
  }
  catch (_error) {
    message.error('人脸登录失败')
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

  buttonLabel.value = '登录'
}

function enterSystem() {
  message.success('进入系统')
}

function retryFaceRecognition() {
  loginSuccess.value = false
  openCamera()
}
</script>

<template>
  <Layout class="flex items-center justify-center h-full">
    <Card
      class="max-w-96 w-full"
      :tab-list="tabList"
      :active-tab-key="key"
      @tab-change="onTabChange"
    >
      <template #customTab="item">
        <span v-if="item.key === 'tab1'" class="text-sm">
          <HomeOutlined /> 用户名密码登录
        </span>
        <span v-else-if="item.key === 'tab2'" class="text-sm">
          <IdcardOutlined /> 人脸识别登录
        </span>
      </template>
      <template v-if="key === 'tab1'">
        <Form layout="vertical" @submit.prevent="onSubmit">
          <FormItem label="用户名">
            <Input v-model:value="form.username" placeholder="请输入用户名" />
          </FormItem>
          <FormItem label="密码">
            <InputPassword v-model:value="form.password" placeholder="请输入密码" />
          </FormItem>
          <FormItem>
            <AButton :loading="loading" type="primary" html-type="submit" class="w-full">
              登录
            </AButton>
          </FormItem>
        </Form>
      </template>
      <template v-else-if="key === 'tab2'">
        <div class="flex flex-col items-center">
          <div class="mt-4 w-48 h-48 border-4 border-gray-300 rounded-full overflow-hidden flex items-center justify-center">
            <!-- 使用 v-show 来控制视频的显示和隐藏 -->
            <video v-show="!capturedImage" ref="videoRef" autoplay class="w-full h-full object-cover" />
            <!-- 使用 v-show 来控制 canvas 的显示和隐藏 -->
            <canvas v-show="capturedImage" ref="canvasRef" class="w-full h-full" />
          </div>
          <Flex gap="middle">
            <!-- 登录成功后显示"进入系统"和"重新人脸识别"按钮 -->
            <template v-if="loginSuccess">
              <AButton type="primary" class="mt-4" @click="enterSystem">
                进入系统
              </AButton>
              <AButton type="default" class="mt-4" @click="retryFaceRecognition">
                重新人脸识别
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
            请确保您的摄像头已连接
          </p>
        </div>
      </template>
    </Card>
  </Layout>
</template>

<style scoped>
</style>
