<script setup lang="ts">
import type { Robot, WebSocketMessage } from '@/types/robot'
import type { TableColumnsType } from 'ant-design-vue'
import { getRobotInfoApi } from '@/api/robot/robot'
import { useRobotStore } from '@/stores/robot'
import { clearRobotManager, createConnection, getRobotManager } from '@/utils/Robot/Robot'
import { delay, formatTimestamp } from '@/utils/time'
import { Button as AButton, Image, message, Modal, Table } from 'ant-design-vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 表格数据
const robotList = ref<Robot[]>([])

// 控制弹窗显示状态
const isModalVisible = ref(false)

// 使用 store 获取 image Blob
const robotStore = useRobotStore()

// 打开弹窗
function showModal(robot: Robot) {
  robotStore.robot = robot
  isModalVisible.value = true
}

// 表格的列配置
const columns: TableColumnsType = [
  {
    title: t('机器人ID'),
    dataIndex: 'id',
    width: '10%',
  },
  {
    title: t('机器人名称'),
    dataIndex: 'name',
  },
  {
    title: t('序列号'),
    dataIndex: 'serial_number',
  },
  {
    title: t('创建时间'),
    dataIndex: 'created_at',
    customRender: ({ text }) => formatTimestamp(text),
  },
  {
    title: t('更新时间'),
    dataIndex: 'updated_at',
    customRender: ({ text }) => formatTimestamp(text),
  },
  {
    title: t('操作'),
    dataIndex: 'operation',
    width: '10%',
  },
]

const imageUrl = ref<string>('')
const isConnected = ref(false) // 是否连接的状态

// 监听 Blob 对象的变化，并转换为 URL
watch(() => robotStore.image, (newImage) => {
  if (newImage) {
    // 将 Blob 转换为可用的 URL
    imageUrl.value = URL.createObjectURL(newImage)
  }
})

const gettingRobotList = ref(false)

async function getRobotList() {
  try {
    gettingRobotList.value = true
    const response = await getRobotInfoApi()
    await delay(1000)
    robotList.value = response.data.robotList
  }
  catch (_error) {
    message.error(t('获取机器人列表失败'))
  }
  finally {
    gettingRobotList.value = false
  }
}

function openEvent() {
  isConnected.value = true
  message.success(t('连接机器人成功'))
  setFaceDetection(useRobotStore().isFaceDetectionEnabled)
}

function closeEvent() {
  isConnected.value = false // 断开连接后重置连接状态
}

function sendEvent() {
}

function timeoutEvent() {
  isConnected.value = false
}

function errorEvent() {
  isConnected.value = false
  message.error(t('连接机器人失败'))
}

const loading = ref(false)
const connecting = ref(false)

async function connectRobot(robot?: Robot) {
  if (isConnected.value) {
    connecting.value = true
    await delay(1000)
    try {
      clearRobotManager()
      message.success(t('断开连接成功'))
      imageUrl.value = ''
    }
    catch (_error) {
      message.error(t('断开连接失败'))
    }
    finally {
      connecting.value = false
    }
    return
  }
  if (!robot || !robot.serial_number) {
    message.error(t('连接失败，请刷新页面重试'))
    return
  }
  try {
    connecting.value = true
    await delay(1000)
    createConnection(robot.serial_number, openEvent, closeEvent, sendEvent, timeoutEvent, errorEvent)
  }
  catch (_error: any) {
    message.error(t('连接机器人失败'))
  }
  finally {
    connecting.value = false
  }
}

function handleClose() {
  loading.value = true
  try {
    clearRobotManager()
  }
  catch (_error) {
    message.error(t('断开连接失败'))
  }
  finally {
    isModalVisible.value = false
    loading.value = false
    imageUrl.value = ''
  }
}

function setFaceDetection(checked: boolean) {
  const robotManager = getRobotManager()
  useRobotStore().isFaceDetectionEnabled = checked
  if (!robotManager) {
    return
  }
  const commandData: WebSocketMessage = {
    command: 'toggle_face_detection',
    enabled: useRobotStore().isFaceDetectionEnabled,
  }
  try {
    robotManager?.sendMessage(commandData)
  }
  catch (_error) {
    message.error(t('发送指令失败'))
  }
}

onMounted(async () => {
  await getRobotList()
})

// 在组件销毁时，清理创建的 Blob URL
onBeforeUnmount(() => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value)
  }
})
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">
      {{ t('机器人管理') }}
    </h1>
    <!-- 表格 -->
    <Table :loading="gettingRobotList" :columns="columns" :data-source="robotList" :scroll="{ x: 500, y: 1000 }">
      <!-- 自定义操作列 -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operation'">
          <AButton type="link" class="p-0" @click="showModal(record as Robot)">
            {{ t('查看详情') }}
          </AButton>
        </template>
      </template>
    </Table>

    <!-- 弹窗 -->
    <Modal
      v-model:open="isModalVisible"
      centered
      :closable="false"
      destroy-on-close
      :title="t('机器人详情')"
      :after-close="handleClose"
    >
      <div class="flex flex-col items-center">
        <!-- 图片展示 -->
        <ASpin :tip="t(isConnected ? '断开连接中...' : '连接中...')" :spinning="connecting">
          <Image
            :preview="false"
            :src="imageUrl"
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
          />
        </ASpin>
        <span v-if="isConnected && !imageUrl">{{ t('等待机器人连接中...') }}</span>
        <!-- Face Detection Switch 开关 -->
        <div class="mt-2 flex items-center">
          <span class="mr-2">{{ t('人脸识别') }}</span>
          <ASwitch :checked="useRobotStore().isFaceDetectionEnabled" @change="setFaceDetection" />
        </div>
        <!-- 连接按钮 -->
        <AButton :loading="connecting" type="primary" class="mt-2" @click="connectRobot(robotStore.robot)">
          {{ isConnected ? t('断开连接') : t('连接机器人') }}
        </AButton>
      </div>

      <template #footer>
        <AButton key="back" :loading="loading" @click="handleClose">
          {{ t('关闭') }}
        </AButton>
      </template>
    </Modal>
  </div>
</template>

<style scoped lang="less">
</style>
