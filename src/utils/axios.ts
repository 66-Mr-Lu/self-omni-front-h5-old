/**
 * Axios 配置文件
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { showToast, showDialog } from 'vant'

// 基础响应类型
export interface BaseResponse<T = any> {
  code: number
  message: string
  data?: T
}

// 创建axios实例
const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/omni/api/v1',
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 从本地存储获取 token
    const token = localStorage.getItem('omni_token') || sessionStorage.getItem('omni_token')
    if (token) {
      // config.headers.Authorization = `Bearer ${token}`
      config.headers.Authorization = `  ${token}`
    }
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
    const data = response.data
    
    // 检查 code 值是否为 200
    if (data.code !== 200) {
      // 401 未登录特殊处理
      if (data.code === 401) {
        showDialog({
          title: '提示',
          message: '您还未登录，是否进行登录操作？',
          showCancelButton: true,
          confirmButtonText: '去登录',
          cancelButtonText: '取消'
        }).then(() => {
          // 用户点击确认，跳转到登录页面（使用相对路径）
          const basePath = import.meta.env.VITE_APP_BASE_PATH || '/omni/'
          window.location.href = `${basePath}login`
        }).catch(() => {
          // 用户点击取消，不做任何操作
        })
      } else {
        // 其他错误码，弹出提示框
        showToast({
          message: data.message || '操作失败',
          position: 'top'
        })
      }
      
      // 返回 rejected Promise，让调用方可以继续处理
      return Promise.reject(new Error(data.message || '请求失败'))
    }
    
    return data
  },
  (error) => {
    // 统一处理 HTTP 错误
    console.error('HTTP请求错误:', error)
    
    if (error.response) {
      console.error('状态码:', error.response.status)
      console.error('响应数据:', error.response.data)
      
      // HTTP 状态码 401 处理
      if (error.response.status === 401) {
        showDialog({
          title: '提示',
          message: '您还未登录，是否进行登录操作？',
          showCancelButton: true,
          confirmButtonText: '去登录',
          cancelButtonText: '取消'
        }).then(() => {
          // 用户点击确认，跳转到登录页面（使用相对路径）
          const basePath = import.meta.env.VITE_APP_BASE_PATH || '/omni/'
          window.location.href = `${basePath}login`
        }).catch(() => {
          // 用户点击取消，不做任何操作
        })
      } else {
        // 其他 HTTP 错误
        const errorMessage = error.response.data?.message || `请求失败，状态码：${error.response.status}`
        showToast({
          message: errorMessage,
          position: 'top'
        })
      }
    } else if (error.request) {
      // 请求超时或无响应
      showToast({
        message: '请求超时，请稍后重试',
        position: 'top'
      })
    } else {
      // 请求配置错误
      showToast({
        message: error.message || '请求配置错误',
        position: 'top'
      })
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