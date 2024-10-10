import type { User } from '@/types/user'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)

  // 计算属性，检查用户是否已通过 accessToken 验证
  const isAuthenticated = computed(() => !!localStorage.getItem('accessToken'))

  function setToken(newAccessToken: string, newRefreshToken: string) {
    localStorage.setItem('accessToken', newAccessToken)
    localStorage.setItem('refreshToken', newRefreshToken)
  }

  function setUser(newUser: User) {
    user.value = newUser
    user.value.role = newUser.role ?? 'admin'
  }

  /**
   * 登出函数，清空所有认证相关信息
   */
  function logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    user.value = null
  }

  /**
   * 更新 accessToken 函数
   * 通常在使用 refreshToken 刷新时调用
   */
  function updateAccessToken(newAccessToken: string) {
    localStorage.setItem('accessToken', newAccessToken)
  }

  return {
    setToken,
    setUser,
    user,
    isAuthenticated,
    logout,
    updateAccessToken,
  }
}, {
  persist: true, // 使 store 持久化，保持用户的认证状态
})
