<!-- src/pages/RegisterPage.vue -->
<script lang="ts" setup>
import { signupApi } from '@/api/user/signup'
import { useAuthStore } from '@/stores/auth'
import { Button as AButton, Card, Form, FormItem, Input, InputPassword, Layout, message } from 'ant-design-vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()

const router = useRouter()

const loading = ref(false)

// 表单数据
const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  faceImage: null as string | null,
})

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const isCameraActive = ref(false)
const cameraButtonText = ref(t('打开摄像头'))

function openCamera() {
  if (navigator.mediaDevices && videoRef.value) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.value) {
          videoRef.value.srcObject = stream
          isCameraActive.value = true
          cameraButtonText.value = t('拍照')
        }
      })
      .catch(() => {
        message.error(t('无法访问摄像头，请检查权限设置'))
      })
  }
}

function closeCamera() {
  if (videoRef.value && videoRef.value.srcObject) {
    const stream = videoRef.value.srcObject as MediaStream
    stream.getTracks().forEach(track => track.stop())
    videoRef.value.srcObject = null
    isCameraActive.value = false
    cameraButtonText.value = t('打开摄像头')
  }
}

function captureImage() {
  if (isCameraActive.value && videoRef.value && canvasRef.value) {
    const context = canvasRef.value.getContext('2d')
    if (context) {
      const aspectRatio = videoRef.value.videoWidth / videoRef.value.videoHeight
      canvasRef.value.width = videoRef.value.videoWidth
      canvasRef.value.height = videoRef.value.videoWidth / aspectRatio
      // 拍摄照片
      context.drawImage(videoRef.value, 0, 0, canvasRef.value.width, canvasRef.value.height)
      form.value.faceImage = canvasRef.value.toDataURL('image/png')
      closeCamera()
    }
  }
}

function resetCamera() {
  form.value.faceImage = null
  openCamera()
}

async function onSubmit() {
  loading.value = true
  // 表单校验
  if (!form.value.username || !form.value.password || !form.value.confirmPassword) {
    message.error(t('请填写所有必填项'))
    loading.value = false
    return
  }
  if (form.value.password !== form.value.confirmPassword) {
    message.error(t('两次输入的密码不一致'))
    loading.value = false
    return
  }
  // if (form.value.password.length < 6) {
  //   message.error('密码长度必须大于6位')
  // loading.value = false
  //   return
  // }
  if (!form.value.faceImage) {
    message.error(t('请上传您的面部照片'))
    loading.value = false
    return
  }

  try {
    const blob = await (await fetch(form.value.faceImage)).blob()
    // 调用注册 API，上传用户信息
    const response = await signupApi(form.value.username, form.value.password, blob, form.value.email, form.value.phone)
    const { accessToken, refreshToken, user } = response.data
    if (accessToken && refreshToken) {
      useAuthStore().setToken(accessToken, refreshToken)
    }
    else if (!accessToken && !refreshToken && user) {
      message.success(t('已有账号，请直接登录'))
    }
    navigateToLogin()
  }
  catch (error: any) {
    if (error.response.data.detail.includes('用户 已存在')) {
      message.error(t('用户名已存在'))
    }
    else {
      message.error(t('注册失败，请重试'))
    }
  }
  finally {
    loading.value = false
  }
}

function navigateToLogin() {
  router.push('/login')
}
</script>

<template>
  <Layout class="flex items-center justify-center h-full">
    <div class="max-w-96 w-full overflow-y-auto">
      <Card>
        <Form layout="vertical" @submit.prevent="onSubmit">
          <FormItem :label="t('用户名')" required>
            <Input v-model:value="form.username" :placeholder="t('请输入用户名')" />
          </FormItem>
          <FormItem :label="t('密码')" required>
            <InputPassword v-model:value="form.password" :placeholder="t('请输入密码')" />
          </FormItem>
          <FormItem :label="t('确认密码')" required>
            <InputPassword v-model:value="form.confirmPassword" :placeholder="t('请再次输入密码')" />
          </FormItem>
          <FormItem :label="t('邮箱')">
            <Input v-model:value="form.email" :placeholder="t('请输入邮箱')" />
          </FormItem>
          <FormItem :label="t('电话号码')">
            <Input v-model:value="form.phone" :placeholder="t('请输入电话号码')" />
          </FormItem>
          <FormItem :label="t('人脸识别')" required>
            <div class="flex flex-col items-center">
              <div class="mt-4 w-48 h-48 border-4 border-gray-300 rounded-full overflow-hidden flex items-center justify-center">
                <video v-show="!form.faceImage" ref="videoRef" autoplay class="w-full h-full object-cover" />
                <canvas v-show="form.faceImage" ref="canvasRef" class="w-full h-full object-cover" />
              </div>
              <AButton v-if="!form.faceImage" type="primary" class="mt-4" @click="isCameraActive ? captureImage() : openCamera()">
                {{ cameraButtonText }}
              </AButton>
              <AButton v-if="isCameraActive" type="default" class="mt-4" @click="closeCamera">
                {{ t('关闭摄像头') }}
              </AButton>
              <AButton v-if="form.faceImage" type="default" class="mt-4" @click="resetCamera">
                {{ t('重新拍照') }}
              </AButton>
            </div>
          </FormItem>
          <FormItem>
            <AButton :loading="loading" type="primary" html-type="submit" class="w-full">
              {{ t('注册') }}
            </AButton>
          </FormItem>
          <p class="text-center mt-4">
            {{ t('已有账号？') }}<AButton type="link" @click="navigateToLogin">
              {{ t('立即登录') }}
            </AButton>
          </p>
        </Form>
      </Card>
    </div>
  </Layout>
</template>
