import type { Response } from '@/types/response'
import type { Cart } from '@/types/shop/cart'
import { get, post } from '@/utils/apiServices'

export async function getCartApi() {
  const response = await get<Response<{
    cart: Cart
  }>>('/cart/', undefined, true)
  return response.data
}

export async function addToCartApi(product_id: string, quantity: number) {
  const response = await post(`/cart/add/`, {
    product_id,
    quantity,
  }, true)
  return response.data
}

export async function changeCartApi(product_id: string, quantity: number) {
  const response = await post(`/cart/change/`, {
    product_id,
    quantity,
  }, true)
  return response.data
}
