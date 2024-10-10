type Function = (...args: any[]) => void

export class WebSocketService {
  private socket: WebSocket | null = null
  private readonly url: string

  constructor(url: string) {
    this.url = url
  }

  connect(onMessage: Function, onError: Function, onClose: Function, onOpen: Function) {
    this.socket = new WebSocket(this.url)
    this.socket.onmessage = event => onMessage(event)
    this.socket.onerror = error => onError(error)
    this.socket.onclose = event => onClose(event)
    this.socket.onopen = event => onOpen(event)
  }

  send(messages: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(messages)
    }
  }

  close(code: number, reason: string) {
    if (this.socket) {
      this.socket.close(code, reason)
      this.socket = null
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN
  }
}
