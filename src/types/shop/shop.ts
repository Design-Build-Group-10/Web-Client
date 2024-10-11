import type { Product } from '@/types/shop/product'

export interface Shop {
  id: string
  name: string
  description: string
  promotions: string
  featured_products: Product[]
}
