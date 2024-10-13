export interface Product {
  id: string
  name: string
  description: string
  price: string
  stock: number
  quantity?: number
  image?: string
  created_at?: string
  updated_at?: string
  total_price?: string
}
