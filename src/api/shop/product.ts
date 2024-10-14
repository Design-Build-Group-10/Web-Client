import type { Response } from '@/types/response'
import type { Product } from '@/types/shop/product'
import { get, post } from '@/utils/apiServices'
import axios from 'axios'

// 获取商品列表
export async function getProductListApi() {
  const response = await get<Response<{
    productList: Product[]
  }>>('/product/', undefined, true)
  return response.data
}

/// 修改某个商品的部分信息
export async function updateProductInfoApi(productId: string, name: string, description: string, price: string, stock: number, image: Blob | null) {
  const formData = new FormData()

  // 添加其他字段
  formData.append('name', name)
  formData.append('description', description)
  formData.append('price', price)
  formData.append('stock', stock.toString())

  // 如果 image 为 null 或 undefined，则不上传该字段
  if (image) {
    formData.append('image', image)
  }

  // 打印出 formData 的内容
  // for (const [key, value] of formData.entries()) {
  //   console.log(key, value)
  // }

  const response = await post<Response<{ product: Product }>>(`/shop/update-product/${productId}/`, formData, true, {
    'Content-Type': 'multipart/form-data',
  })

  return response.data
}

export async function getProductInfoApi(productId: string) {
  const response = await get<Response<{ productInfo: Product }>>(`/product/${productId}/`, undefined, true)
  return response.data
}

export async function fetchImageApi(url: string) {
  const response = await axios.get(url, {
    responseType: 'blob',
  })
  return response.data
}

export async function postProductApi(shopId: string, name: string, description: string, price: string, stock: number, image: Blob | null) {
  const formData = new FormData()

  formData.append('name', name)
  formData.append('description', description)
  formData.append('price', price)
  formData.append('stock', stock.toString())
  if (image) {
    formData.append('image', image)
  }

  const response = await post<Response<{ product: Product }>>(`/shop/${shopId}/add-product/`, formData, true, {
    'Content-Type': 'multipart/form-data',
  })
  return response.data
}

export async function getBrowseHistoryApi() {
  const response = await get<Response<{ browse_history: string[] }>>('/user/browse-history/', undefined, true)
  return response.data
}
