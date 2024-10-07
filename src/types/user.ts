export interface User {
  id: number
  username: string
  avatar: string
  email: string
  phone: string
  face: string
  role: 'user' | 'admin'
}
