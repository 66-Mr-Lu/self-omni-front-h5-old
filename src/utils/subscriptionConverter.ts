/**
 * 订阅转换工具 - 专门处理订阅链接的解析与转换
 */

// 节点配置接口
export interface ProxyNode {
  id: string
  name: string
  type: string
  server: string
  port: number
  password?: string
  method?: string
  cipher?: string
  uuid?: string
  alterId?: number
  security?: string
  sni?: string
  path?: string
  network?: string
  plugin?: string
  pluginOpts?: Record<string, string>
  remarks?: string
  group?: string
}

// 订阅链接类型
export type LinkType = 'ss' | 'ssr' | 'vmess' | 'trojan'

// 订阅链接格式选项
export const linkFormatOptions: { label: string; value: LinkType; desc: string }[] = [
  { label: 'Shadowsocks', value: 'ss', desc: 'ss:// 格式' },
  { label: 'ShadowsocksR', value: 'ssr', desc: 'ssr:// 格式' },
  { label: 'V2Ray VMess', value: 'vmess', desc: 'vmess:// 格式' },
  { label: 'Trojan', value: 'trojan', desc: 'trojan:// 格式' }
]

/**
 * Base64 URL安全解码
 */
const base64UrlDecode = (str: string): string => {
  // 替换URL安全的字符
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  // 添加填充
  while (base64.length % 4 !== 0) {
    base64 += '='
  }
  return atob(base64)
}

/**
 * 解析 Shadowsocks 链接
 * 格式: ss://base64(method:password@server:port)#remarks
 * 或新格式: ss://base64(method:password)@server:port#remarks
 */
export const parseSSLink = (link: string): ProxyNode | null => {
  try {
    // 移除前缀
    const withoutPrefix = link.substring(5) // 去掉 'ss://'
    
    // 分离备注部分
    const hashIndex = withoutPrefix.indexOf('#')
    const base64Part = hashIndex > -1 ? withoutPrefix.substring(0, hashIndex) : withoutPrefix
    const remarks = hashIndex > -1 ? decodeURIComponent(withoutPrefix.substring(hashIndex + 1)) : ''
    
    // Base64 解码
    const decoded = base64UrlDecode(base64Part)
    
    // 尝试解析新格式: method:password@server:port
    let method: string, password: string, server: string, portStr: string
    
    const atIndex = decoded.lastIndexOf('@')
    if (atIndex > -1) {
      // 新格式
      const userInfo = decoded.substring(0, atIndex)
      const hostInfo = decoded.substring(atIndex + 1)
      
      const colonIndex = userInfo.indexOf(':')
      if (colonIndex === -1) return null
      
      method = userInfo.substring(0, colonIndex)
      password = userInfo.substring(colonIndex + 1)
      
      const lastColonIndex = hostInfo.lastIndexOf(':')
      if (lastColonIndex === -1) return null
      
      server = hostInfo.substring(0, lastColonIndex)
      portStr = hostInfo.substring(lastColonIndex + 1)
    } else {
      // 旧格式: method:password:server:port
      const parts = decoded.split(':')
      if (parts.length < 4) return null
      
      method = parts[0]
      password = parts[1]
      server = parts[2]
      portStr = parts[3]
    }
    
    const port = parseInt(portStr, 10)
    if (isNaN(port) || port <= 0 || port > 65535) return null
    
    // 验证必要字段
    if (!method || !password || !server) return null

    return {
      id: generateId(),
      name: remarks || `${server}:${port}`,
      type: 'ss',
      server,
      port,
      password,
      method,
      remarks
    }
  } catch {
    return null
  }
}

/**
 * 解析 ShadowsocksR 链接
 * 格式: ssr://base64(server:port:protocol:method:obfs:password/?params)
 */
export const parseSSRLink = (link: string): ProxyNode | null => {
  try {
    const match = link.match(/^ssr:\/\/(.+)$/)
    if (!match) return null

    const base64Content = match[1]
    const decoded = base64UrlDecode(base64Content)
    
    // 分离基础部分和参数部分
    const questionMarkIndex = decoded.indexOf('/?')
    const basePart = questionMarkIndex > -1 ? decoded.substring(0, questionMarkIndex) : decoded
    const paramsPart = questionMarkIndex > -1 ? decoded.substring(questionMarkIndex + 2) : ''
    
    // 解析基础部分: server:port:protocol:method:obfs:password
    const parts = basePart.split(':')
    if (parts.length < 6) return null
    
    const server = parts[0]
    const portStr = parts[1]
    const protocol = parts[2]
    const method = parts[3]
    const obfs = parts[4]
    const passwordB64 = parts[5]
    
    const port = parseInt(portStr, 10)
    if (isNaN(port) || port <= 0 || port > 65535) return null
    
    // 解码密码
    let password: string
    try {
      password = base64UrlDecode(passwordB64)
    } catch {
      password = passwordB64
    }

    // 解析参数部分
    const params: Record<string, string> = {}
    if (paramsPart) {
      paramsPart.split('&').forEach(param => {
        const [key, value] = param.split('=')
        if (key && value) {
          try {
            params[key] = base64UrlDecode(value)
          } catch {
            params[key] = decodeURIComponent(value)
          }
        }
      })
    }

    const remarks = params.remarks || ''

    return {
      id: generateId(),
      name: remarks || `${server}:${port}`,
      type: 'ssr',
      server,
      port,
      password,
      method,
      remarks,
      pluginOpts: {
        protocol,
        obfs,
        ...params
      }
    }
  } catch {
    return null
  }
}

/**
 * 解析 V2Ray VMess 链接
 * 格式: vmess://base64(json)
 */
export const parseVMessLink = (link: string): ProxyNode | null => {
  try {
    const match = link.match(/^vmess:\/\/(.+)$/)
    if (!match) return null

    const base64Content = match[1]
    const decoded = base64UrlDecode(base64Content)
    const json = JSON.parse(decoded)

    // 验证必要字段
    if (!json.add || !json.port || !json.id) return null

    const port = typeof json.port === 'string' ? parseInt(json.port, 10) : json.port
    if (isNaN(port) || port <= 0 || port > 65535) return null

    return {
      id: generateId(),
      name: json.ps || json.remarks || `${json.add}:${port}`,
      type: 'vmess',
      server: json.add || '',
      port,
      uuid: json.id || '',
      alterId: json.aid ? parseInt(json.aid, 10) || 0 : 0,
      cipher: json.scy || 'auto',
      security: json.security || 'auto',
      network: json.net || 'tcp',
      path: json.path || '',
      sni: json.sni || json.host || '',
      remarks: json.ps || json.remarks || ''
    }
  } catch {
    return null
  }
}

/**
 * 解析 Trojan 链接
 * 格式: trojan://password@server:port#remarks
 */
export const parseTrojanLink = (link: string): ProxyNode | null => {
  try {
    // 手动解析 URL，避免 URL 构造函数的问题
    const withoutPrefix = link.substring(9) // 去掉 'trojan://'
    
    // 分离备注部分
    const hashIndex = withoutPrefix.indexOf('#')
    const mainPart = hashIndex > -1 ? withoutPrefix.substring(0, hashIndex) : withoutPrefix
    const remarks = hashIndex > -1 ? decodeURIComponent(withoutPrefix.substring(hashIndex + 1)) : ''
    
    // 分离密码和服务器信息
    const atIndex = mainPart.indexOf('@')
    if (atIndex === -1) return null
    
    const password = mainPart.substring(0, atIndex)
    const serverInfo = mainPart.substring(atIndex + 1)
    
    // 分离服务器和端口
    const lastColonIndex = serverInfo.lastIndexOf(':')
    if (lastColonIndex === -1) return null
    
    const server = serverInfo.substring(0, lastColonIndex)
    const portStr = serverInfo.substring(lastColonIndex + 1)
    const port = portStr ? parseInt(portStr, 10) : 443
    
    if (isNaN(port) || port <= 0 || port > 65535) return null
    if (!server || !password) return null

    return {
      id: generateId(),
      name: remarks || `${server}:${port}`,
      type: 'trojan',
      server,
      port,
      password,
      sni: '',
      remarks
    }
  } catch {
    return null
  }
}

/**
 * 根据链接前缀判断链接类型
 */
export const detectLinkType = (link: string): LinkType | null => {
  if (link.startsWith('ss://')) return 'ss'
  if (link.startsWith('ssr://')) return 'ssr'
  if (link.startsWith('vmess://')) return 'vmess'
  if (link.startsWith('trojan://')) return 'trojan'
  return null
}

/**
 * 解析单个链接
 */
export const parseLink = (link: string): ProxyNode | null => {
  const linkType = detectLinkType(link)
  if (!linkType) return null

  switch (linkType) {
    case 'ss':
      return parseSSLink(link)
    case 'ssr':
      return parseSSRLink(link)
    case 'vmess':
      return parseVMessLink(link)
    case 'trojan':
      return parseTrojanLink(link)
    default:
      return null
  }
}

/**
 * 从订阅内容中提取所有代理链接
 */
export const extractLinksFromContent = (content: string): string[] => {
  const patterns = [
    /ss:\/\/[^\s]+/gi,
    /ssr:\/\/[^\s]+/gi,
    /vmess:\/\/[^\s]+/gi,
    /trojan:\/\/[^\s]+/gi
  ]

  const links: string[] = []
  const seen = new Set<string>()
  
  patterns.forEach(pattern => {
    const matches = content.match(pattern) || []
    matches.forEach(link => {
      // 清理可能的尾部标点符号
      const cleanLink = link.replace(/[.,;!?)]+$/, '')
      if (!seen.has(cleanLink)) {
        seen.add(cleanLink)
        links.push(cleanLink)
      }
    })
  })
  return links
}

/**
 * 解析订阅内容，提取所有节点
 */
export const parseSubscriptionContent = (content: string): ProxyNode[] => {
  const links = extractLinksFromContent(content)
  const nodes: ProxyNode[] = []

  links.forEach(link => {
    const node = parseLink(link)
    if (node) {
      nodes.push(node)
    }
  })

  return nodes
}

/**
 * 将节点转换为 Shadowsocks 链接格式
 */
export const nodeToSSLink = (node: ProxyNode): string => {
  if (node.type !== 'ss') return ''
  const content = `${node.method}:${node.password}@${node.server}:${node.port}`
  const base64 = btoa(content)
  const remarks = node.remarks || node.name
  return `ss://${base64}#${encodeURIComponent(remarks)}`
}

/**
 * 将节点转换为 VMess 链接格式
 */
export const nodeToVMessLink = (node: ProxyNode): string => {
  if (node.type !== 'vmess') return ''
  const vmessObj = {
    v: '2',
    ps: node.name,
    add: node.server,
    port: node.port,
    id: node.uuid,
    aid: node.alterId,
    scy: node.cipher,
    net: node.network || 'tcp',
    path: node.path || '',
    sni: node.sni || ''
  }
  return `vmess://${btoa(JSON.stringify(vmessObj))}`
}

/**
 * 将节点转换为 Trojan 链接格式
 */
export const nodeToTrojanLink = (node: ProxyNode): string => {
  if (node.type !== 'trojan') return ''
  return `trojan://${node.password}@${node.server}:${node.port}#${encodeURIComponent(node.name)}`
}

/**
 * 将节点转换为指定类型的链接
 */
export const nodeToLink = (node: ProxyNode, targetType: LinkType): string => {
  switch (targetType) {
    case 'ss':
      return nodeToSSLink(node)
    case 'vmess':
      return nodeToVMessLink(node)
    case 'trojan':
      return nodeToTrojanLink(node)
    case 'ssr':
      return nodeToSSLink(node) // SSR 类型不支持直接转换，返回 SS 格式
    default:
      return ''
  }
}

/**
 * 将节点列表转换为链接列表
 */
export const nodesToLinks = (nodes: ProxyNode[], targetType: LinkType): string => {
  return nodes
    .map(node => nodeToLink(node, targetType))
    .filter(link => link)
    .join('\n')
}

/**
 * 订阅链接互转
 */
export const convertLink = (link: string, targetType: LinkType): string => {
  const node = parseLink(link)
  if (!node) return ''
  return nodeToLink(node, targetType)
}

/**
 * 批量转换订阅链接
 */
export const convertLinks = (content: string, targetType: LinkType): string => {
  const nodes = parseSubscriptionContent(content)
  return nodesToLinks(nodes, targetType)
}

/**
 * 生成唯一ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}