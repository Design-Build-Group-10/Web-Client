import type { Function, WebSocketMessage } from '@/types/robot'
import type { WebSocketService } from '@/utils/WebSocketService'
import { useRobotStore } from '@/stores/robot'

export class RobotManager {
  private readonly webSocketService: WebSocketService
  private readonly openEvent: Function
  private readonly closeEvent: Function
  private readonly sendEvent: Function
  private readonly timeoutEvent: Function
  private readonly errorEvent: Function
  private robotStore

  // 心跳相关
  private heartbeatInterval: number | null = null // 心跳定时器
  private readonly heartbeatTimeout = 30000 // 心跳间隔（30秒）

  // 重连相关
  private reconnectInterval = 1000 // 初始重连时间间隔（毫秒）
  private readonly maxReconnectInterval = 30000 // 最大重连时间间隔
  private reconnectAttempts = 0 // 当前重连次数
  private readonly maxReconnectAttempts = 10 // 最大重连次数
  private reconnectTimeout: number | null = null // 重连定时器

  constructor(
    webSocketService: WebSocketService,
    openEvent: Function,
    closeEvent: Function,
    sendEvent: Function,
    timeoutEvent: Function,
    errorEvent: Function,
  ) {
    const robotStore = useRobotStore()
    this.webSocketService = webSocketService
    this.robotStore = robotStore
    this.openEvent = openEvent
    this.closeEvent = closeEvent
    this.sendEvent = sendEvent
    this.timeoutEvent = timeoutEvent
    this.errorEvent = errorEvent

    this.webSocketService.connect(
      this.handleMessage.bind(this),
      this.handleError.bind(this),
      this.handleClose.bind(this),
      this.handleOpen.bind(this),
    )
  }

  private handleOpen(_event: Event) {
    // eslint-disable-next-line no-console
    console.log('WebSocket connected')
    this.openEvent()
    this.startHeartbeat() // 启动心跳
    this.resetReconnect() // 重置重连状态
  }

  private handleTimeout() {
    this.timeoutEvent()
    this.stopHeartbeat()
    this.attemptReconnect()
  }

  private async handleMessage(event: MessageEvent) {
    const type = typeof event.data
    if (type === 'string') {
      const data = JSON.parse(event.data)
      if (data.status && data.status.includes('enabled')) {
        this.robotStore.isFaceDetectionEnabled = true
      }
      else if (data.status && data.status.includes('disabled')) {
        this.robotStore.isFaceDetectionEnabled = false
      }
    }
    else if (type === 'object') {
      this.robotStore.image = event.data
    }
  }

  private handleError(_error: Event) {
    console.error('WebSocket encountered an error')
    this.errorEvent()
    this.stopHeartbeat()
    this.attemptReconnect()
  }

  private handleClose(_event: CloseEvent) {
    console.warn('WebSocket closed')
    this.closeEvent()
    this.stopHeartbeat()
    // this.attemptReconnect();
  }

  sendMessage(message: WebSocketMessage) {
    if (this.webSocketService.isConnected()) {
      this.webSocketService.send(JSON.stringify(message))
      this.sendEvent()
    }
    else {
      console.error('WebSocket is not connected')
    }
  }

  closeWebsocket(code: number = 1000, reason: string = 'Normal closure') {
    this.webSocketService.close(code, reason)
    this.stopHeartbeat()
    this.clearReconnectTimeout()
  }

  // 心跳机制
  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    this.heartbeatInterval = window.setInterval(() => {
      if (this.webSocketService.isConnected()) {
        // eslint-disable-next-line no-console
        console.log('Heartbeat ping')
      }
      else {
        this.handleTimeout()
      }
    }, this.heartbeatTimeout)
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // 重连机制
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached')
      return
    }

    if (this.reconnectTimeout) {
      // 已经安排了重连，不需要再次安排
      return
    }

    const delay = Math.min(this.reconnectInterval * 2 ** this.reconnectAttempts, this.maxReconnectInterval)
    // eslint-disable-next-line no-console
    console.log(`Attempting to reconnect in ${delay / 1000} seconds...`)

    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectAttempts += 1
      // eslint-disable-next-line no-console
      console.log(`Reconnecting attempt ${this.reconnectAttempts}...`)
      this.webSocketService.connect(
        this.handleMessage.bind(this),
        this.handleError.bind(this),
        this.handleClose.bind(this),
        this.handleOpen.bind(this),
      )
      this.reconnectTimeout = null
    }, delay)
  }

  private resetReconnect() {
    this.reconnectAttempts = 0
    this.reconnectInterval = 1000
    this.clearReconnectTimeout()
  }

  private clearReconnectTimeout() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }

  // 主动重连方法
  reconnect() {
    // eslint-disable-next-line no-console
    console.log('Manually triggered reconnect')
    this.closeWebsocket() // 关闭当前 WebSocket 连接
    this.resetReconnect() // 重置重连状态
    this.attemptReconnect() // 尝试重连
  }
}
