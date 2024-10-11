import { post } from '@/utils/apiServices'

export async function signInApi(username: string, password: string) {
  const response = await post('/user/signIn/', { username, password }, false)
  return response.data
}

export async function faceSignInApi(face: Blob) {
  const formData = new FormData()
  formData.append('face', face)
  const response = await post('/user/face/signIn/', formData, false, {
    'Content-Type': 'multipart/form-data',
  })
  return response.data
}
