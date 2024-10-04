import type { Response } from '@/types/response'
import type { User } from '@/types/user'
import { get } from '@/utils/apiServices'

export async function getUserInfoApi() {
  const response = await get<Response<User>>('/user', undefined, true)
  return response.data
}
