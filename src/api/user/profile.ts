import type { Response } from '@/types/response'
import type { User } from '@/types/user'
import { get, post, put } from '@/utils/apiServices'

export async function getUserInfoApi() {
  const response = await get<Response<User>>('/user', undefined, true)
  return response.data
}

export async function putUserAvatarApi(avatar: Blob) {
  const formData = new FormData()
  formData.append('avatar', avatar)
  const response = await put('/user/avatar', formData, true, {
    'Content-Type': 'multipart/form-data',
  })
  return response.data
}

export async function putUserFaceApi(face: Blob) {
  const formData = new FormData()
  formData.append('face', face)
  const response = await put('/user/face', formData, true, {
    'Content-Type': 'multipart/form-data',
  })
  return response.data
}

export async function putUserInfoApi(username: string, email: string, phone: string) {
  const response = await put('/user', { username, email, phone }, true)
  return response.data
}

export async function postUserPasswordApi(password: string, newPassword: string) {
  const response = await post('/user/password', { password, newPassword }, true)
  return response.data
}
