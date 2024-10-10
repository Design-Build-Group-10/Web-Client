import type { Response } from '@/types/response'
import type { Robot } from '@/types/robot'
import { get } from '@/utils/apiServices'

export async function getRobotInfoApi() {
  const response = await get<Response<{
    robotList: Robot[]
  }>>('/robot/info', undefined, true)
  return response.data
}
