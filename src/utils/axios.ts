/**
 * Axios 配置文件
 */

import axios from 'axios'

// 创建axios实例
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
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

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 统一处理响应数据
    return response.data
  },
  (error) => {
    // 统一处理错误
    console.error('HTTP请求错误:', error)
    
    if (error.response) {
      // 请求已发出，服务器响应状态码不在2xx范围
      console.error('状态码:', error.response.status)
      console.error('响应数据:', error.response.data)
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('请求超时或无响应')
    } else {
      // 其他错误
      console.error('请求配置错误:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default instance