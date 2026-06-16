/**
 * 配置文件解析工具 - 用于解析各种代理软件的配置文件
 */

import type { ProxyNode } from './subscriptionConverter'
import { generateId } from './subscriptionConverter'

/**
 * 解析 Clash 配置
 */
export const parseClashConfig = (content: string): ProxyNode[] => {
  const nodes: ProxyNode[] = []
  
  try {
    // 简单的 YAML 解析（实际项目中建议使用 js-yaml）
    const lines = content.split('\n')
    let inProxies = false
    let currentNode: Partial<ProxyNode> = {}
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      if (trimmed.startsWith('proxies:')) {
        inProxies = true
        continue
      }
      
      if (inProxies) {
        if (trimmed.startsWith('- name:')) {
          // 保存上一个节点
          if (currentNode.type && currentNode.server) {
            nodes.push(currentNode as ProxyNode)
          }
          
          // 开始新节点
          const name = trimmed.substring(7).trim().replace(/["']/g, '')
          currentNode = {
            id: generateId(),
            name,
            type: 'ss' // 默认值，后面会更新
          }
        } else if (trimmed.startsWith('type:') && currentNode.name) {
          currentNode.type = trimmed.substring(5).trim()
        } else if (trimmed.startsWith('server:') && currentNode.name) {
          currentNode.server = trimmed.substring(7).trim()
        } else if (trimmed.startsWith('port:') && currentNode.name) {
          currentNode.port = parseInt(trimmed.substring(5).trim())
        } else if (trimmed.startsWith('password:') && currentNode.name) {
          currentNode.password = trimmed.substring(9).trim().replace(/["']/g, '')
        } else if (trimmed.startsWith('cipher:') && currentNode.name) {
          currentNode.method = trimmed.substring(7).trim().replace(/["']/g, '')
        } else if (trimmed.startsWith('uuid:') && currentNode.name) {
          currentNode.uuid = trimmed.substring(5).trim().replace(/["']/g, '')
        }
      }
    }
    
    // 添加最后一个节点
    if (currentNode.type && currentNode.server) {
      nodes.push(currentNode as ProxyNode)
    }
  } catch (error) {
    console.error('解析 Clash 配置失败:', error)
  }
  
  return nodes
}

/**
 * 解析 Surge 配置
 */
export const parseSurgeConfig = (content: string): ProxyNode[] => {
  const nodes: ProxyNode[] = []
  
  try {
    const lines = content.split('\n')
    let inProxy = false
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      if (trimmed === '[Proxy]') {
        inProxy = true
        continue
      }
      
      if (trimmed.startsWith('[') && trimmed !== '[Proxy]') {
        inProxy = false
        continue
      }
      
      if (inProxy && trimmed && !trimmed.startsWith('#')) {
        // 解析代理行: name = type, server, port, ...
        const match = trimmed.match(/^([^=]+)\s*=\s*(\w+),\s*([^,]+),\s*(\d+)/)
        if (match) {
          const [, name, type, server, port] = match
          const node: ProxyNode = {
            id: generateId(),
            name: name.trim(),
            type: type.toLowerCase(),
            server: server.trim(),
            port: parseInt(port)
          }
          
          // 解析额外参数
          if (trimmed.includes('password=')) {
            const pwdMatch = trimmed.match(/password=([^,\s]+)/)
            if (pwdMatch) node.password = pwdMatch[1]
          }
          
          if (trimmed.includes('username=')) {
            const uuidMatch = trimmed.match(/username=([^,\s]+)/)
            if (uuidMatch) node.uuid = uuidMatch[1]
          }
          
          nodes.push(node)
        }
      }
    }
  } catch (error) {
    console.error('解析 Surge 配置失败:', error)
  }
  
  return nodes
}

/**
 * 自动检测并解析配置
 */
export const parseConfigContent = (content: string): ProxyNode[] => {
  // 检测配置格式
  if (content.includes('proxies:')) {
    return parseClashConfig(content)
  }
  
  if (content.includes('[Proxy]')) {
    return parseSurgeConfig(content)
  }
  
  // 默认尝试解析为链接列表
  return []
}
