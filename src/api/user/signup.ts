import { post, put } from '@/utils/apiServices'

export async function signupApi(username: string, password: string, face: Blob, email?: string, phone?: string) {
  const formData = new FormData()
  formData.append('username', username)
  formData.append('password', password)
  formData.append('face', face)
  if (email) {
    formData.append('email', email)
  }
  if (phone) {
    formData.append('phone', phone)
  }
  const response = await post('/user/signup', formData, false, {
    'Content-Type': 'multipart/form-data',
  })
  return response.data
}

export async function postUserFaceApi(face: Blob) {
  const formData = new FormData()
  formData.append('face', face)
  const response = await put('/user/face', formData, true, {
    'Content-Type': 'multipart/form-data',
  })
  return response.data
}
