export interface User {
  id: number
  username: string
  avatar: string
  email: string
  phone: string
  face: string
  address: string
  payment_method: string
  role: 'user' | 'admin'
}
