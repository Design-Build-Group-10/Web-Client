import type { Response } from '@/types/response'
import type { Product } from '@/types/shop/product'
import { get } from '@/utils/apiServices'

export async function getProductListApi() {
  const response = await get<Response<{
    productList: Product[]
  }>>('/product/', undefined, true)
  return response.data
}
