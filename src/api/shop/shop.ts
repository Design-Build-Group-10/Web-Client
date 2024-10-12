import type { Response } from '@/types/response'
import type { Shop } from '@/types/shop/shop'
import { del, get, post } from '@/utils/apiServices'

// 获取用户的店铺信息
export async function getUserShopListApi() {
  const response = await get<Response<{
    userShops: Shop[]
  }>>('/user/shops/', undefined, true)
  return response.data
}

// 获取所有店铺信息
export async function getShopListApi() {
  const response = await get<Response<{
    shopList: Shop[]
  }>>('/shop/', undefined, true)
  return response.data
}

// 获取某个店铺信息
export async function getShopInfoApi(shopId: string) {
  const response = await get<Response<{ shopInfo: Shop }>>(`/shop/${shopId}/`, undefined, true)
  return response.data
}

// 删除某个商品
export async function deleteProductApi(shopId: string, productId: string) {
  const response = await del(`/shop/${shopId}/remove-product/${productId}/`, true)
  return response.data
}

export async function registerShopApi(name: string, description: string, address: string, phone: string, email: string, startTime: string, endTIme: string, logo: Blob) {
  const formData = new FormData()
  formData.append('name', name)
  formData.append('description', description)
  formData.append('address', address)
  formData.append('phone', phone)
  formData.append('email', email)
  formData.append('startTime', startTime)
  formData.append('endTime', endTIme)
  formData.append('logo', logo)
  const response = await post<Response<Shop>>('/shop/register/', formData, true, {
    'Content-Type': 'multipart/form-data',
  })
  return response.data
}
