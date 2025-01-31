import type { Function } from '@/types/robot'
import { RobotManager } from '@/utils/Robot/RobotManager'
import { WebSocketService } from '@/utils/WebSocketService'

let robotManager: RobotManager | null = null

export function getRobotManager(): RobotManager | null {
  return robotManager
}

export function clearRobotManager(): void {
  robotManager?.closeWebsocket()
  robotManager = null
}

export function createConnection(
  serialNumber: string,
  openEvent: Function,
  closeEvent: Function,
  sendEvent: Function,
  timeoutEvent: Function,
  errorEvent: Function,
): RobotManager {
  if (!robotManager) {
    const webSocketUrl = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/api/ws/camera/${serialNumber}`
    const webSocketService = new WebSocketService(webSocketUrl)
    robotManager = new RobotManager(
      webSocketService,
      openEvent,
      closeEvent,
      sendEvent,
      timeoutEvent,
      errorEvent,
    )
  }
  return robotManager
}
