import type { Response } from '@/types/response'
import type { Shop } from '@/types/shop/shop'
import { del, get } from '@/utils/apiServices'

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
