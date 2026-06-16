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
 * 解析 Shadowsocks 链接
 * 格式: ss://base64(method:password@server:port)#remarks
 */
export const parseSSLink = (link: string): ProxyNode | null => {
  try {
    const match = link.match(/^ss:\/\/([A-Za-z0-9+/=]+)(?:#(.+))?$/)
    if (!match) return null

    const base64Content = match[1]
    const remarks = match[2] ? decodeURIComponent(match[2]) : ''
    
    // Base64 解码
    const decoded = atob(base64Content)
    const parts = decoded.split(':')
    
    if (parts.length < 4) return null

    const [method, password, server, portStr] = parts
    const port = parseInt(portStr, 10)

    if (isNaN(port)) return null

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
    const match = link.match(/^ssr:\/\/([A-Za-z0-9+/=]+)$/)
    if (!match) return null

    const base64Content = match[1]
    const decoded = atob(base64Content)
    
    // 解析基础部分
    const [serverPort, protocol, method, obfs, passwordB64] = decoded.split('/?')[0].split(':')
    
    const [server, portStr] = serverPort.split(':')
    const port = parseInt(portStr, 10)
    const password = atob(passwordB64)

    if (isNaN(port)) return null

    // 解析参数部分
    const paramsPart = decoded.split('/?')[1] || ''
    const params: Record<string, string> = {}
    if (paramsPart) {
      paramsPart.split('&').forEach(param => {
        const [key, value] = param.split('=')
        if (key && value) {
          params[key] = decodeURIComponent(value)
        }
      })
    }

    const remarks = params.remarks ? atob(params.remarks) : ''

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
    const match = link.match(/^vmess:\/\/([A-Za-z0-9+/=]+)$/)
    if (!match) return null

    const base64Content = match[1]
    const decoded = atob(base64Content)
    const json = JSON.parse(decoded)

    return {
      id: generateId(),
      name: json.ps || json.remarks || `${json.add}:${json.port}`,
      type: 'vmess',
      server: json.add || '',
      port: parseInt(json.port, 10) || 0,
      uuid: json.id || '',
      alterId: parseInt(json.aid, 10) || 0,
      cipher: json.scy || 'auto',
      security: json.security || 'auto',
      network: json.net || '',
      path: json.path || '',
      sni: json.sni || '',
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
    const url = new URL(link)
    if (url.protocol !== 'trojan:') return null

    const password = url.username
    const server = url.hostname
    const port = parseInt(url.port, 10) || 443
    const remarks = url.hash ? decodeURIComponent(url.hash.slice(1)) : ''

    return {
      id: generateId(),
      name: remarks || `${server}:${port}`,
      type: 'trojan',
      server,
      port,
      password,
      sni: url.searchParams.get('sni') || '',
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
    /ss:\/\/[A-Za-z0-9+/=]+(?:#[^\s]*)?/g,
    /ssr:\/\/[A-Za-z0-9+/=]+/g,
    /vmess:\/\/[A-Za-z0-9+/=]+/g,
    /trojan:\/\/[^\s]+/g
  ]

  const links: string[] = []
  patterns.forEach(pattern => {
    const matches = content.match(pattern) || []
    matches.forEach(link => {
      if (!links.includes(link)) {
        links.push(link)
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