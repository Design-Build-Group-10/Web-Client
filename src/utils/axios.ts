import type { AxiosResponse } from 'axios'
import router from '@/router'
import axios from 'axios'

// 创建axios实例
const instance = axios.create({
  baseURL: '/api/',
  timeout: 10000,
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // console.log('请求拦截器：', config)
    return config
  },
  (error) => {
    // console.error('请求发生错误：', error);
    return Promise.reject(error)
  },
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    if (error.response.status === 401) {
      try {
        await router.push('/login')
      }
      catch (error) {
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  },
)

export default instance
