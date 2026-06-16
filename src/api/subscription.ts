/**
 * 订阅获取 API - 用于从HTTP/HTTPS链接获取订阅内容
 */

import request from '@/utils/axios'

/**
 * 获取订阅请求参数
 */
export interface FetchSubscriptionRequest {
  url: string
}

/**
 * 获取订阅响应数据
 */
export interface FetchSubscriptionResponse {
  content: string
  format?: string
  url?: string
}

/**
 * 从URL获取订阅内容
 * @param params 请求参数
 * @returns 订阅内容
 */
export const fetchSubscription = async (params: FetchSubscriptionRequest): Promise<FetchSubscriptionResponse> => {
  // 验证URL格式
  if (!params.url.startsWith('http://') && !params.url.startsWith('https://')) {
    throw new Error('仅支持 HTTP 或 HTTPS 协议的订阅链接')
  }

  const response = await request.post('/proxy/subscription/fetch', {
    url: params.url
  })
  
  return response.data
}

/**
 * 检测订阅内容格式
 * @param content 订阅内容
 * @returns 格式类型
 */
export const detectSubscriptionFormat = (content: string): string => {
  // 尝试解析为 YAML (Clash)
  if (content.includes('proxies:') || content.includes('Proxy Group:')) {
    return 'clash'
  }
  
  // 尝试解析为 Surge 格式
  if (content.includes('[Proxy]') || content.includes('[Proxy Group]')) {
    return 'surge'
  }
  
  // 尝试解析为 Quantumult 格式
  if (content.includes('[SERVER]') || content.includes('[SOURCE]')) {
    return 'quantumult'
  }
  
  // 尝试解析为 Base64 编码的链接列表
  try {
    const decoded = atob(content.trim())
    if (decoded.includes('://')) {
      return 'base64-links'
    }
  } catch {
    // 不是 Base64
  }
  
  // 检查是否包含代理链接
  if (content.includes('ss://') || content.includes('vmess://') || 
      content.includes('trojan://') || content.includes('ssr://')) {
    return 'links'
  }
  
  return 'unknown'
}

/**
 * 解码 Base64 订阅内容
 * @param content Base64 编码的内容
 * @returns 解码后的内容
 */
export const decodeBase64Subscription = (content: string): string => {
  try {
    // 清理空白字符
    const trimmed = content.trim()
    
    // 尝试直接解码
    return atob(trimmed)
  } catch {
    // 如果失败，尝试 URL 安全的 Base64
    try {
      let base64 = content.replace(/-/g, '+').replace(/_/g, '/')
      while (base64.length % 4 !== 0) {
        base64 += '='
      }
      return atob(base64)
    } catch {
      throw new Error('Base64 解码失败')
    }
  }
}
