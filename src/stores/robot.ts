import type { Robot } from '@/types/robot'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRobotStore = defineStore('robot', () => {
  const robot = ref<Robot>()
  const image = ref<Blob | null>(null)
  const isFaceDetectionEnabled = ref(false)

  function reset() {
    image.value = null
  }

  return {
    robot,
    image,
    isFaceDetectionEnabled,
    reset,
  }
}, {
  persist: true,
})
