import type { Response } from '@/types/response'
import type { Message } from '@/types/user'
import { get, post } from '@/utils/apiServices'

export async function getAllMessageApi() {
  const response = await get<Response<{ all_messages: Message[] }>>('/user/allmessages/', undefined, true)
  return response.data
}

export async function markAsReadApi(messageId: string) {
  const response = await post('/user/markread/', { message_id: messageId }, true)
  return response.data
}
