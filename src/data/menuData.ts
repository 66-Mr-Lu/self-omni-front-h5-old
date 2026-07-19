// 叶子菜单项类型
export interface LeafMenu {
  id: string
  name: string
  icon: string
  action: string
  badge?: number
  priority?: number            // 优先级，数值越小优先级越高，默认 100
  routePath?: string           // 路由路径（可选）
  desc?: string                // 功能描述（可选）
  tags?: string[]              // 关键词标签数组（可选）
}

// 二级菜单组类型
export interface MenuGroup {
  id: string
  name: string
  icon: string
  children: LeafMenu[]
  collapsed: boolean
  priority?: number            // 优先级，数值越小优先级越高，默认 100
}

// 顶级分类类型
export interface TopCategory {
  id: string
  name: string
  icon: string
  activeIcon?: string
  items?: LeafMenu[]           // 直接的叶子菜单
  groups: MenuGroup[]          // 二级菜单组
  priority?: number            // 优先级，数值越小优先级越高，默认 100
  routePath: string            // 路由路径
}

// 统一菜单项类型（用于同级别排序）
export type UnifiedMenuItem = {
  type: 'leaf'
  data: LeafMenu
} | {
  type: 'group'
  data: MenuGroup
}

// 完整的菜单数据
export const menuData: TopCategory[] = [
  {
    id: 'ops',
    name: '运维',
    icon: '🔌',
    routePath: 'ops',
    priority: 10,              // 运维优先级最高
    // 直接的叶子菜单
    items: [
      { 
        id: 'shutdown', 
        name: '关机', 
        icon: '🔴', 
        action: 'shutdown', 
        priority: 10, 
        routePath: '/ops/shutdown',
        desc: '远程关闭计算机',
        tags: ['关机', 'shutdown', '电源', '远程']
      },
      { 
        id: 'remote-power', 
        name: '远程开机', 
        icon: '🟢', 
        action: 'remotePower', 
        priority: 20, 
        routePath: '/ops/remote-power',
        desc: '通过网络远程启动计算机',
        tags: ['开机', 'WOL', '网络唤醒', '远程']
      }
    ],
    // 二级菜单组
    groups: [
      {
        id: 'monitor',
        name: '实时系统信息',
        icon: '📊',
        collapsed: true,
        priority: 30,
        children: [
          { 
            id: 'cpu', 
            name: 'CPU状态', 
            icon: '💻', 
            action: 'cpuMonitor', 
            priority: 10, 
            routePath: '/ops/monitor/cpu',
            desc: '实时监控CPU使用率和温度',
            tags: ['CPU', '处理器', '监控', '性能']
          },
          { 
            id: 'memory', 
            name: '内存使用率', 
            icon: '🧠', 
            action: 'memoryMonitor', 
            priority: 20, 
            routePath: '/ops/monitor/memory',
            desc: '查看内存使用情况',
            tags: ['内存', 'RAM', '监控', '性能']
          },
          { 
            id: 'disk', 
            name: '硬盘健康度', 
            icon: '💾', 
            action: 'diskMonitor', 
            priority: 30, 
            routePath: '/ops/monitor/disk',
            desc: '检测硬盘健康状态和温度',
            tags: ['硬盘', '磁盘', '健康', 'SMART']
          },
          { 
            id: 'network', 
            name: 'IP信息', 
            icon: '🌐', 
            action: 'networkInfo', 
            priority: 40, 
            routePath: '/ops/monitor/network',
            desc: '查看网络IP地址和连接信息',
            tags: ['IP', '网络', '网卡', '地址']
          }
        ]
      }
    ]
  },
  {
    id: 'tools',
    name: '工具',
    icon: '🛠️',
    routePath: 'tools',
    priority: 20,              // 工具优先级次之
    // 直接的叶子菜单
    items: [
      { 
        id: 'json-escape-convert', 
        name: 'JSON转义转换', 
        icon: '📝', 
        action: 'jsonEscapeConvert', 
        priority: 10, 
        routePath: '/tools/json-escape-convert',
        desc: 'JSON字符串转义与反转义工具',
        tags: ['JSON', '转义', '格式化', '字符串']
      },
      { 
        id: 'unicode-convert', 
        name: 'Unicode编解码', 
        icon: '🔤', 
        action: 'unicodeConvert', 
        priority: 15, 
        routePath: '/tools/unicode-convert',
        desc: 'Unicode编码与解码转换工具',
        tags: ['Unicode', '编码', '解码', '字符', '转换']
      },
      { 
        id: 'text-processor', 
        name: '文本处理', 
        icon: '📄', 
        action: 'textProcessor', 
        priority: 20, 
        routePath: '/tools/text-processor',
        desc: '强大的文本处理工具，支持查找、替换、格式化',
        tags: ['文本', '查找', '替换', '格式化', '编辑']
      },
      { 
        id: 'cron-expression', 
        name: 'Cron表达式', 
        icon: '⏰', 
        action: 'cronExpression', 
        priority: 25, 
        routePath: '/tools/cron-expression',
        desc: 'Cron表达式生成器和验证工具',
        tags: ['Cron', '定时任务', '表达式', '调度', '计划']
      },
      { 
        id: 'subscription-convert', 
        name: '订阅转换', 
        icon: '🔗', 
        action: 'subscriptionConvert', 
        priority: 30, 
        routePath: '/tools/subscription-convert',
        desc: '订阅链接与配置文件转换',
        tags: ['订阅', '转换', '代理', 'Clash', 'V2Ray', 'Surge', 'Shadowrocket']
      },
      { 
        id: 'base64-convert', 
        name: 'Base64编解码', 
        icon: '🔐', 
        action: 'base64Convert', 
        priority: 35, 
        routePath: '/tools/base64-convert',
        desc: 'Base64编码与解码转换工具',
        tags: ['Base64', '编码', '解码', '转换', '加密']
      },
      { 
        id: 'note', 
        name: '记事本', 
        icon: '📒', 
        action: 'note', 
        priority: 40, 
        routePath: '/tools/note',
        desc: '个人记事本，数据存储在云端',
        tags: ['笔记', '记事本', '备忘录', '云端存储']
      }
    ],
    // 二级菜单组
    groups: [
      {
        id: 'tools-encrypt',
        name: '加密',
        icon: '🔐',
        collapsed: true,
        priority: 10,
        children: [
          { 
            id: 'rsa-keygen', 
            name: 'RSA密钥对生成器', 
            icon: '🔑', 
            action: 'rsaKeygen', 
            priority: 10, 
            routePath: '/tools/encrypt/rsa-keygen',
            desc: '生成RSA公钥和私钥对',
            tags: ['RSA', '密钥', '加密', '公钥', '私钥']
          },
          { 
            id: 'encrypt-decrypt', 
            name: '加密/解密文本', 
            icon: '🔒', 
            action: 'encryptDecrypt', 
            priority: 20, 
            routePath: '/tools/encrypt/encrypt-decrypt',
            desc: '对文本进行加密和解密操作',
            tags: ['加密', '解密', 'AES', 'DES', '安全']
          }
        ]
      }
    ]
  },
  {
    id: 'resource',
    name: '资源',
    icon: '📦',
    routePath: 'resource',
    priority: 30,              // 资源优先级第三
    // 直接的叶子菜单（没有二级菜单组）
    items: [
      { 
        id: 'bilibili-download', 
        name: 'bilibili视频下载', 
        icon: '📺', 
        action: 'bilibiliDownload', 
        priority: 10, 
        routePath: '/resource/bilibili',
        desc: '下载B站视频和音频',
        tags: ['B站', 'bilibili', '视频', '下载', 'Bilibili']
      },
      { 
        id: 'video-list', 
        name: '视频列表', 
        icon: '📋', 
        action: 'videoList', 
        priority: 15, 
        routePath: '/resource/videos',
        desc: '查看已下载的视频列表',
        tags: ['视频', '列表', '播放', '已下载']
      },
      { 
        id: 'douyin-download', 
        name: '抖音视频下载', 
        icon: '📱', 
        action: 'douyinDownload', 
        priority: 20, 
        routePath: '/resource/douyin',
        desc: '下载抖音短视频',
        tags: ['抖音', 'douyin', '视频', '下载', 'TikTok']
      }
    ],
    groups: []
  },
  {
    id: 'control',
    name: '控制',
    icon: '🌡️',
    routePath: 'control',
    priority: 40,              // 控制优先级最低
    // 直接的叶子菜单（没有二级菜单组）
    items: [
      { 
        id: 'air-conditioner', 
        name: '空调控制', 
        icon: '❄️', 
        action: 'airConditioner', 
        priority: 10, 
        routePath: '/control/air-conditioner',
        desc: '智能空调远程控制',
        tags: ['空调', '温度', '控制', '智能家居']
      }
    ],
    groups: []
  }
]

// 获取排序后的顶级分类
export const getSortedCategories = (): TopCategory[] => {
  return [...menuData].sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
}

// 获取排序后的直接叶子菜单
export const getSortedItems = (items?: LeafMenu[]): LeafMenu[] => {
  if (!items) return []
  return [...items].sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
}

// 获取排序后的二级菜单组
export const getSortedGroups = (groups: MenuGroup[]): MenuGroup[] => {
  return [...groups].sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
}

// 获取排序后的组内子菜单
export const getSortedChildren = (children: LeafMenu[]): LeafMenu[] => {
  return [...children].sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
}

// 获取统一排序后的菜单项（合并 items 和 groups）
export const getUnifiedSortedItems = (category: TopCategory): UnifiedMenuItem[] => {
  const result: UnifiedMenuItem[] = []

  // 添加直接叶子菜单
  if (category.items) {
    for (const item of category.items) {
      result.push({ type: 'leaf', data: item })
    }
  }

  // 添加二级菜单组
  for (const group of category.groups) {
    result.push({ type: 'group', data: group })
  }

  // 按 priority 排序
  return result.sort((a, b) => (a.data.priority ?? 100) - (b.data.priority ?? 100))
}

// 根据分类ID获取路由路径
export const getCategoryRoutePath = (categoryId: string): string => {
  const category = menuData.find(cat => cat.id === categoryId)
  return category?.routePath || '/ops'
}

// 根据路由路径获取分类ID
export const getCategoryIdByRoute = (routePath: string): string => {
  const category = menuData.find(cat => routePath.startsWith(cat.routePath))
  return category?.id || 'ops'
}
