export interface Robot {
  id: string
  name: string
  serial_number: string
  created_at: string
  updated_at: string
}

export type Function = (...args: any[]) => void

export interface WebSocketMessage {
  command: 'toggle_face_detection'
  enabled: boolean
}
