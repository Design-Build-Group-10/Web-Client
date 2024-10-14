export interface User {
  id: number
  username: string
  avatar: string
  email: string
  phone: string
  face: string
  shipping_address: string
  payment_method: string
  role: 'user' | 'admin'
  points: number
}

export interface Message {
  id: string
  title: string
  description: string
  created_at: string
  is_read: boolean
  read_at: string
  type?: 'info' | 'warning' | 'error'
}
