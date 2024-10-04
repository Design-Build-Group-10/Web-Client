// apiServices.ts
import instance from './axios'

/**
 * 发送 GET 请求的函数，支持可选的授权。
 *
 * @param url 请求的 URL 地址
 * @param params 请求的查询参数
 * @param auth 是否需要授权（如果需要，则在请求头中添加Bearer token）
 * @returns 返回 axios 的 Promise 响应
 */
export async function get<T = any>(url: string, params?: any, auth?: boolean) {
  return instance.get<T>(url, {
    params,
    headers: auth ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {},
  })
}

/**
 * 发送POST请求的函数，支持自定义headers和可选的授权。
 *
 * @param url 请求的URL地址
 * @param data 请求的负载数据
 * @param auth 是否需要授权
 * @param customHeaders 可选的自定义请求头
 * @returns 返回axios的Promise响应
 */
export async function post<T = any>(
  url: string,
  data?: any,
  auth: boolean = false,
  customHeaders?: Record<string, string>,
) {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
    ...(auth && { Authorization: `Bearer ${localStorage.getItem('token')}` }),
  }

  return instance.post<T>(url, data, { headers })
}

/**
 * 发送 DELETE 请求的函数，支持可选的授权。
 *
 * @param url 请求的 URL 地址
 * @param auth 是否需要授权（如果需要，则在请求头中添加Bearer token）
 * @returns 返回 axios 的 Promise 响应
 */
export async function del<T = any>(url: string, auth?: boolean) {
  return instance.delete<T>(url, {
    headers: auth ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {},
  })
}

/**
 * 发送 PUT 请求的函数，支持发送数据和可选的授权。
 *
 * @param url 请求的 URL 地址
 * @param data 请求的负载数据
 * @param auth 是否需要授权（如果需要，则在请求头中添加Bearer token）
 * @param customHeaders
 * @returns 返回 axios 的 Promise 响应
 */
export async function put<T = any>(
  url: string,
  data?: any,
  auth?: boolean,
  customHeaders?: Record<string, string>,
) {
  return instance.put<T>(url, data, {
    headers: {
      'Content-Type': 'application/json',
      ...customHeaders,
      ...(auth && { Authorization: `Bearer ${localStorage.getItem('token')}` }),
    },
  })
}
