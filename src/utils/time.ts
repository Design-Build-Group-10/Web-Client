import * as moment from 'moment-timezone'

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function formatTimestamp(timestamp: string) {
  return moment.utc(timestamp).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
}

export function getCurrentTime() {
  return moment.tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
}

// 解决耗时任务导致页面卡顿的问题
export function runTask(task: () => void): Promise<void> {
  return new Promise((resolve) => {
    _runTask(task, resolve)
  })
}

function _runTask(task: () => void, callback: () => void): void {
  const start = Date.now()
  requestAnimationFrame(() => {
    if (Date.now() - start < 16.6) {
      task()
      callback()
    }
    else {
      _runTask(task, callback)
    }
  })
}
