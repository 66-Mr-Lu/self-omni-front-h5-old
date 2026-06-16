/**
 * 配置转换工具 - 专门处理代理软件配置文件格式转换
 */

import type { ProxyNode } from './subscriptionConverter'

// 配置文件格式类型
export type ConfigFormat = 'clash' | 'surge' | 'quantumult' | 'quantumultX' | 'shadowrocket' | 'singbox'

// 配置格式选项
export const configFormatOptions: { label: string; value: ConfigFormat; desc: string }[] = [
  { label: 'Clash', value: 'clash', desc: 'Clash/ClashX/ClashForWindows' },
  { label: 'Surge', value: 'surge', desc: 'Surge Mac/iOS' },
  { label: 'Quantumult', value: 'quantumult', desc: 'Quantumult 经典版' },
  { label: 'Quantumult X', value: 'quantumultX', desc: 'Quantumult X' },
  { label: 'Shadowrocket', value: 'shadowrocket', desc: 'Shadowrocket' },
  { label: 'Sing-box', value: 'singbox', desc: 'Sing-box 配置格式' }
]

/**
 * 将节点转换为 Clash 配置格式
 */
export const convertToClash = (nodes: ProxyNode[]): string => {
  const proxies: string[] = []
  
  nodes.forEach(node => {
    let proxyStr = `- name: "${sanitizeName(node.name)}"\n  type: ${node.type}`
    
    switch (node.type) {
      case 'ss':
        proxyStr += `\n  server: ${node.server}\n  port: ${node.port}\n  password: "${node.password}"\n  cipher: "${node.method}"`
        break
      case 'ssr':
        proxyStr += `\n  server: ${node.server}\n  port: ${node.port}\n  password: "${node.password}"\n  cipher: "${node.method}"\n  protocol: ${node.pluginOpts?.protocol || 'origin'}\n  obfs: ${node.pluginOpts?.obfs || 'plain'}`
        if (node.pluginOpts?.protocolparam) {
          proxyStr += `\n  protocol-param: "${node.pluginOpts.protocolparam}"`
        }
        if (node.pluginOpts?.obfsparam) {
          proxyStr += `\n  obfs-param: "${node.pluginOpts.obfsparam}"`
        }
        break
      case 'vmess':
        proxyStr += `\n  server: ${node.server}\n  port: ${node.port}\n  uuid: "${node.uuid}"\n  alterId: ${node.alterId}\n  cipher: "${node.cipher}"`
        if (node.network) proxyStr += `\n  network: ${node.network}`
        if (node.path) proxyStr += `\n  path: "${node.path}"`
        if (node.sni) proxyStr += `\n  sni: "${node.sni}"`
        if (node.security && node.security !== 'auto') proxyStr += `\n  security: ${node.security}`
        break
      case 'trojan':
        proxyStr += `\n  server: ${node.server}\n  port: ${node.port}\n  password: "${node.password}"`
        if (node.sni) proxyStr += `\n  sni: "${node.sni}"`
        break
      default:
        return
    }
    
    proxies.push(proxyStr)
  })

  return `proxies:\n${proxies.join('\n\n')}\n\nproxy-groups:\n  - name: "🚀 节点选择"\n    type: select\n    proxies:\n      - DIRECT\n${proxies.map((_, i) => `      - "${sanitizeName(nodes[i]?.name || '')}"`).join('\n')}\n\nrules:\n  - MATCH,🚀 节点选择`
}

/**
 * 将节点转换为 Surge 配置格式
 */
export const convertToSurge = (nodes: ProxyNode[]): string => {
  const rules: string[] = []
  const proxyNames: string[] = []
  
  nodes.forEach(node => {
    let rule = ''
    switch (node.type) {
      case 'ss':
        rule = `${sanitizeName(node.name)} = ss, ${node.server}, ${node.port}, encrypt-method=${node.method}, password=${node.password}`
        break
      case 'vmess':
        rule = `${sanitizeName(node.name)} = vmess, ${node.server}, ${node.port}, username=${node.uuid}, encrypt-method=${node.cipher}, ${node.network || 'tcp'}, path=${node.path || ''}, sni=${node.sni || ''}`
        break
      case 'trojan':
        rule = `${sanitizeName(node.name)} = trojan, ${node.server}, ${node.port}, password=${node.password}, sni=${node.sni || ''}`
        break
      case 'ssr':
        rule = `# ${sanitizeName(node.name)} = ssr, ${node.server}, ${node.port} (Surge 不支持 SSR)`
        break
      default:
        rule = `# ${sanitizeName(node.name)} (不支持的类型: ${node.type})`
    }
    rules.push(rule)
    if (node.type !== 'ssr') {
      proxyNames.push(sanitizeName(node.name))
    }
  })

  return `[Proxy]\n${rules.join('\n')}\n\n[Proxy Group]\n🚀 节点选择 = select, ${proxyNames.join(', ')}\n\n[Rule]\nFINAL, 🚀 节点选择`
}

/**
 * 将节点转换为 Quantumult 配置格式
 */
export const convertToQuantumult = (nodes: ProxyNode[]): string => {
  const rules: string[] = []
  
  nodes.forEach(node => {
    let rule = ''
    switch (node.type) {
      case 'ss':
        rule = `ss=${node.server}:${node.port}, method=${node.method}, password=${node.password}, tag=${sanitizeName(node.name)}`
        break
      case 'vmess':
        rule = `vmess=${node.server}:${node.port}, username=${node.uuid}, method=${node.cipher}, obfs=${node.network || 'tcp'}, path=${node.path || ''}, tag=${sanitizeName(node.name)}`
        break
      case 'trojan':
        rule = `trojan=${node.server}:${node.port}, password=${node.password}, tag=${sanitizeName(node.name)}`
        break
      case 'ssr':
        rule = `# ssr=${node.server}:${node.port}, method=${node.method}, password=${node.password}, tag=${sanitizeName(node.name)} (Quantumult 不支持 SSR)`
        break
      default:
        rule = `# ${sanitizeName(node.name)} (不支持的类型: ${node.type})`
    }
    rules.push(rule)
  })

  const tagList = nodes
    .filter(n => n.type !== 'ssr')
    .map(n => sanitizeName(n.name))
    .join(',')

  return `[Proxy]\n${rules.join('\n')}\n\n[Proxy Group]\n🚀 节点选择 = select, ${tagList}\n\n[Rule]\nFINAL,🚀 节点选择`
}

/**
 * 将节点转换为 Quantumult X 配置格式
 */
export const convertToQuantumultX = (nodes: ProxyNode[]): string => {
  const proxies: string[] = []
  const proxyNames: string[] = []
  
  nodes.forEach(node => {
    let proxy = ''
    switch (node.type) {
      case 'ss':
        proxy = `- {name: "${sanitizeName(node.name)}", type: ss, server: ${node.server}, port: ${node.port}, cipher: ${node.method}, password: "${node.password}"}`
        break
      case 'vmess':
        proxy = `- {name: "${sanitizeName(node.name)}", type: vmess, server: ${node.server}, port: ${node.port}, uuid: "${node.uuid}", alterId: ${node.alterId}, cipher: ${node.cipher}, network: ${node.network || 'tcp'}, path: "${node.path || ''}", sni: "${node.sni || ''}"}`
        break
      case 'trojan':
        proxy = `- {name: "${sanitizeName(node.name)}", type: trojan, server: ${node.server}, port: ${node.port}, password: "${node.password}", sni: "${node.sni || ''}"}`
        break
      case 'ssr':
        proxy = `# - {name: "${sanitizeName(node.name)}", type: ssr} (Quantumult X 不支持 SSR)`
        break
      default:
        proxy = `# ${sanitizeName(node.name)} (不支持的类型: ${node.type})`
    }
    proxies.push(proxy)
    if (node.type !== 'ssr') {
      proxyNames.push(`"${sanitizeName(node.name)}"`)
    }
  })

  return `proxies:\n${proxies.join('\n')}\n\ngroups:\n  - {name: "🚀 节点选择", type: select, proxies: [${proxyNames.join(', ')}]}\n\nrules:\n  - MATCH,🚀 节点选择`
}

/**
 * 将节点转换为 Shadowrocket 配置格式（链接形式）
 */
export const convertToShadowrocket = (nodes: ProxyNode[]): string => {
  return nodes.map(node => {
    switch (node.type) {
      case 'ss':
        const ssContent = `${node.method}:${node.password}@${node.server}:${node.port}`
        return `ss://${btoa(ssContent)}#${encodeURIComponent(sanitizeName(node.name))}`
      case 'vmess':
        const vmessObj = {
          v: '2',
          ps: sanitizeName(node.name),
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
      case 'trojan':
        return `trojan://${node.password}@${node.server}:${node.port}#${encodeURIComponent(sanitizeName(node.name))}`
      case 'ssr':
        return `# SSR 链接不支持直接转换为 Shadowrocket 格式`
      default:
        return `# ${sanitizeName(node.name)} (不支持的类型: ${node.type})`
    }
  }).join('\n')
}

/**
 * 将节点转换为 Sing-box 配置格式
 */
export const convertToSingbox = (nodes: ProxyNode[]): string => {
  const outbounds: any[] = []
  const outboundTags: string[] = []
  
  nodes.forEach(node => {
    let outbound: any = {
      type: node.type,
      tag: sanitizeName(node.name),
      server: node.server,
      port: node.port
    }
    
    switch (node.type) {
      case 'ss':
        outbound.cipher = node.method
        outbound.password = node.password
        break
      case 'vmess':
        outbound.uuid = node.uuid
        outbound.alter_id = node.alterId
        outbound.security = node.security || 'auto'
        if (node.network) outbound.network = node.network
        if (node.path) outbound.transport = { type: node.network === 'ws' ? 'ws' : 'tcp', path: node.path }
        if (node.sni) outbound.tls = { enabled: true, server_name: node.sni }
        break
      case 'trojan':
        outbound.password = node.password
        if (node.sni) outbound.tls = { enabled: true, server_name: node.sni }
        break
      case 'ssr':
        // Sing-box 不原生支持 SSR
        return
      default:
        return
    }
    
    outbounds.push(outbound)
    outboundTags.push(sanitizeName(node.name))
  })

  const config = {
    log: { level: 'info' },
    inbounds: [{ type: 'mixed', listen: '0.0.0.0', port: 7890 }],
    outbounds: [
      { type: 'direct', tag: 'direct' },
      ...outbounds,
      {
        type: 'selector',
        tag: '🚀 节点选择',
        outbounds: outboundTags
      }
    ],
    route: {
      rules: [{ type: 'default', outbound: '🚀 节点选择' }]
    }
  }

  return JSON.stringify(config, null, 2)
}

/**
 * 根据目标格式转换节点
 */
export const convertToConfigFormat = (nodes: ProxyNode[], targetFormat: ConfigFormat): string => {
  switch (targetFormat) {
    case 'clash':
      return convertToClash(nodes)
    case 'surge':
      return convertToSurge(nodes)
    case 'quantumult':
      return convertToQuantumult(nodes)
    case 'quantumultX':
      return convertToQuantumultX(nodes)
    case 'shadowrocket':
      return convertToShadowrocket(nodes)
    case 'singbox':
      return convertToSingbox(nodes)
    default:
      return JSON.stringify(nodes, null, 2)
  }
}

/**
 * 清理节点名称（移除特殊字符）
 */
const sanitizeName = (name: string): string => {
  return name.replace(/["'`\\]/g, '')
}