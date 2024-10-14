<script setup lang="ts">
import type { Message } from '@/types/user'
import { getAllMessageApi, markAsReadApi } from '@/api/user/message'
import { formatTimestamp } from '@/utils/time'
import { message, Modal, Table, type TableColumnsType } from 'ant-design-vue'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const messages = ref<Message[]>([])

const isModalVisible = ref(false)
const selectedMessage = ref<Message | null>(null)

const columns: TableColumnsType = [
  {
    title: t('消息标题'),
    dataIndex: 'title',
    width: '20%',
  },
  {
    title: t('消息内容'),
    dataIndex: 'description',
    width: '30%',
  },
  {
    title: t('接收时间'),
    dataIndex: 'created_at',
    customRender: ({ text }) => formatTimestamp(text),
    width: '20%',
  },
  {
    title: t('已读时间'),
    dataIndex: 'read_at',
    customRender: ({ text }) => {
      if (text) {
        return formatTimestamp(text)
      }
      else {
        return t('未读')
      }
    },
    width: '20%',
  },
  {
    title: t('操作'),
    dataIndex: 'operation',
    width: '10%',
  },
]

// 显示消息详情
async function showMessageDetails(record: Message) {
  selectedMessage.value = record
  isModalVisible.value = true
  await markAsRead(record.id)
}

// 关闭 Modal
function handleCancel() {
  isModalVisible.value = false
}

const loading = ref(false)

async function getAllMessage() {
  loading.value = true
  try {
    const response = await getAllMessageApi()
    messages.value = response.data.all_messages
  }
  catch (_error) {
    message.error('获取消息失败')
  }
  finally {
    loading.value = false
  }
}

async function markAsRead(messageId: string) {
  const msg = messages.value.filter(item => item.id === messageId)[0]
  if (msg.is_read) {
    return
  }
  try {
    await markAsReadApi(messageId)
    await getAllMessage()
  }
  catch (_error) {
    message.error('标记为已读失败')
  }
}

onMounted(async () => {
  await getAllMessage()
})
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">
      {{ t('消息中心') }}
    </h1>
    <Table
      :loading="loading"
      :columns="columns"
      :data-source="messages"
      row-key="id"
      class="w-full"
      @row-click="showMessageDetails"
    >
      <template #bodyCell="{ column, record }">
        <span v-if="column.dataIndex === 'operation'" class="flex gap-2">
          <AButton type="link" class="p-0" @click="showMessageDetails(record as Message)">
            {{ t('查看') }}
          </AButton>
          <AButton v-if="!record.is_read" type="link" class="p-0" @click="markAsRead(record.id)">
            {{ t('标为已读') }}
          </AButton>
        </span>
      </template>
    </Table>

    <Modal
      v-model:open="isModalVisible"
      :title="t('消息详情')"
      :footer="null"
      @cancel="handleCancel"
    >
      <p><strong>{{ t('标题:') }}</strong> {{ selectedMessage?.title }}</p>
      <p><strong>{{ t('内容:') }}</strong> {{ selectedMessage?.description }}</p>
      <p><strong>{{ t('接收时间:') }}</strong> {{ selectedMessage?.created_at ? formatTimestamp(selectedMessage?.created_at) : "" }}</p>
    </Modal>
  </div>
</template>
