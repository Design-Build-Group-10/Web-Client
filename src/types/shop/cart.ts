import type { Product } from '@/types/shop/product'

export interface Cart {
  id: string
  products: Product[]
  quantity: number
  total_price: number
}
