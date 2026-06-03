/**
 * Axios 配置文件
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

// 基础响应类型
export interface BaseResponse<T = any> {
  code: number
  message: string
  data?: T
}

// 创建axios实例
const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://guai01bin.hopto.org:32280/omni/api/v1',
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 可以在这里添加token等请求头
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器（不标注返回类型，让TS推断）
instance.interceptors.response.use(
  (response) => {
    // 统一处理响应数据
    return response.data
  },
  (error) => {
    // 统一处理错误
    console.error('HTTP请求错误:', error)
    
    if (error.response) {
      console.error('状态码:', error.response.status)
      console.error('响应数据:', error.response.data)
    } else if (error.request) {
      console.error('请求超时或无响应')
    } else {
      console.error('请求配置错误:', error.message)
    }
    
    return Promise.reject(error)
  }
)

/**
 * 封装请求方法，确保返回正确的类型
 */
const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<BaseResponse<T>> {
    return instance.get(url, config) as Promise<BaseResponse<T>>
  },
  
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<BaseResponse<T>> {
    return instance.post(url, data, config) as Promise<BaseResponse<T>>
  },
  
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<BaseResponse<T>> {
    return instance.put(url, data, config) as Promise<BaseResponse<T>>
  },
  
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<BaseResponse<T>> {
    return instance.delete(url, config) as Promise<BaseResponse<T>>
  }
}

export default request