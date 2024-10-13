<script setup lang="ts">
import type { Dayjs } from 'dayjs'
import { registerShopApi } from '@/api/shop/shop'
import { delay } from '@/utils/time'
import { UploadOutlined } from '@ant-design/icons-vue'
import { Button as AButton, Card, Form, Image, Input, message, Result, Step, Steps, Textarea, TimeRangePicker } from 'ant-design-vue'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const currentStep = ref(0)
const { t } = useI18n()

const loading = ref(false)

// 初始化表单数据
const formState = reactive({
  name: '',
  description: '',
  address: '',
  phone: '',
  email: '',
  promotions: '',
  logo: null,
  businessHours: null as [Dayjs, Dayjs] | null,
})

// 上传图片状态
const logoFile = ref<File | null>(null)
const logoUrl = ref<string>('')
const fileInput = ref<HTMLInputElement | null>(null)

// 手机号和邮箱的正则表达式
const phoneRegex = /^(?:\+?\d{1,4}[\s-])?(?!0+\s+,?$)\d{10,13}$/ // 支持国际号码格式
const emailRegex = /^[\w.+-]+@[a-z0-9-]+\.[a-z0-9-.]+$/i

// 步骤切换逻辑
function nextStep() {
  if (currentStep.value === 0 && !validateStep1())
    return
  if (currentStep.value === 1 && !validateStep2())
    return
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 表单验证
function validateStep1() {
  if (!formState.name || !formState.description || !formState.address || !formState.businessHours || !formState.phone || !formState.email) {
    message.error(t('请完整填写所有必填字段'))
    return false
  }
  // 校验联系方式
  if (!phoneRegex.test(formState.phone)) {
    message.error(t('请输入有效的手机号码'))
    return false
  }
  if (!emailRegex.test(formState.email)) {
    message.error(t('请输入有效的邮箱地址'))
    return false
  }
  return true
}

function validateStep2() {
  // 因为 promotions 是可选项，所以不需要验证
  return true
}

// 调用 API 提交表单
async function handleSubmit() {
  if (
    formState.name
    && formState.description
    && formState.address
    && formState.businessHours
    && formState.phone
    && formState.email
    && logoFile.value
  ) {
    const [startTime, endTime] = formState.businessHours.map(time => time.format('HH:mm'))

    try {
      loading.value = true
      await registerShopApi(
        formState.name,
        formState.description,
        formState.address,
        formState.phone,
        formState.email,
        startTime,
        endTime,
        logoFile.value,
      )
      await delay(1000)
      message.success(t('店铺注册成功！'))
      nextStep()
    }
    catch (_error) {
      message.error(t('注册失败，请稍后重试'))
    }
    finally {
      loading.value = false
    }
  }
  else {
    message.error(t('请完整填写所有必填字段'))
  }
}

// 处理用户选中的图片
function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    logoFile.value = target.files[0]
    logoUrl.value = URL.createObjectURL(logoFile.value)
  }
}
</script>

<template>
  <Card class="max-w-3xl mx-auto rounded-lg shadow-lg min-h-0 overflow-y-auto">
    <!-- 步骤条 -->
    <Steps :current="currentStep" class="mb-6">
      <Step :title="t('店铺信息')" />
      <Step :title="t('促销活动')" />
      <Step :title="t('上传Logo')" />
      <Step :title="t('成功')" />
    </Steps>

    <!-- 步骤1: 填写商店基本信息 -->
    <div v-if="currentStep === 0">
      <Form layout="vertical">
        <Form.Item :label="t('店铺名称')" required>
          <Input v-model:value="formState.name" :placeholder="t('请输入店铺名称')" />
        </Form.Item>
        <Form.Item :label="t('店铺描述')" required>
          <Textarea v-model:value="formState.description" :rows="4" :placeholder="t('请输入店铺描述')" />
        </Form.Item>
        <Form.Item :label="t('地址')" required>
          <Input v-model:value="formState.address" :placeholder="t('请输入店铺地址')" />
        </Form.Item>
        <Form.Item :label="t('营业时间')" required>
          <TimeRangePicker
            v-model:value="formState.businessHours"
            format="HH:mm"
            :placeholder="[t('开始时间'), t('结束时间')]"
          />
        </Form.Item>
        <Form.Item :label="t('手机号')" required>
          <Input v-model:value="formState.phone" :placeholder="t('请输入手机号码')" />
        </Form.Item>
        <Form.Item :label="t('邮箱')" required>
          <Input v-model:value="formState.email" :placeholder="t('请输入邮箱地址')" />
        </Form.Item>
        <div class="flex justify-between mt-4">
          <AButton type="primary" @click="nextStep">
            {{ t('下一步') }}
          </AButton>
        </div>
      </Form>
    </div>

    <!-- 步骤2: 填写促销信息 -->
    <div v-if="currentStep === 1">
      <Form layout="vertical">
        <Form.Item :label="t('促销活动') + t('（可选）')">
          <Textarea v-model:value="formState.promotions" :rows="4" :placeholder="t('请输入促销信息')" />
        </Form.Item>
        <div class="flex justify-between mt-4">
          <AButton @click="prevStep">
            {{ t('上一步') }}
          </AButton>
          <AButton type="primary" @click="nextStep">
            {{ t('下一步') }}
          </AButton>
        </div>
      </Form>
    </div>

    <!-- 步骤3: 上传Logo -->
    <div v-if="currentStep === 2">
      <Form layout="vertical">
        <Form.Item :label="t('Logo')" required>
          <AButton class="flex justify-center items-center" @click="fileInput?.click()">
            <UploadOutlined />
            {{ t('上传Logo') }}
          </AButton>
          <div v-if="logoUrl" class="mt-2 flex justify-center">
            <Image :src="logoUrl" class="max-w-64 max-h-64" />
          </div>
        </Form.Item>
        <div class="flex justify-between mt-4">
          <AButton @click="prevStep">
            {{ t('上一步') }}
          </AButton>
          <AButton :loading="loading" type="primary" @click="handleSubmit">
            {{ t('提交') }}
          </AButton>
        </div>
      </Form>
    </div>

    <!-- 步骤4: 注册成功页面 -->
    <div v-if="currentStep === 3">
      <Result
        status="success"
        :title="t('注册成功')"
        :sub-title="t('您的店铺已成功注册，我们会尽快联系您。')"
      >
        <template #extra>
          <AButton type="primary">
            {{ t('注册其他店铺') }}
          </AButton>
        </template>
      </Result>
    </div>
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange">
  </Card>
</template>
