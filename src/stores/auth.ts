import type { User } from '@/types/user'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const user = ref<User | null>(null)

  // 计算属性，检查用户是否已通过 accessToken 验证
  const isAuthenticated = computed(() => !!accessToken.value)

  /**
   * 登录函数，接收 accessToken 和 refreshToken 以及用户信息
   */
  function login(newAccessToken: string, newRefreshToken: string, newUser: User) {
    accessToken.value = newAccessToken
    refreshToken.value = newRefreshToken
    user.value = newUser
  }

  /**
   * 登出函数，清空所有认证相关信息
   */
  function logout() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
  }

  /**
   * 更新 accessToken 函数
   * 通常在使用 refreshToken 刷新时调用
   */
  function updateAccessToken(newAccessToken: string) {
    accessToken.value = newAccessToken
  }

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    login,
    logout,
    updateAccessToken,
  }
}, {
  persist: true, // 使 store 持久化，保持用户的认证状态
})
