// 叶子菜单项类型
export interface LeafMenu {
  id: string
  name: string
  icon: string
  action: string
  badge?: number
  priority?: number            // 优先级，数值越小优先级越高，默认 100
  routePath?: string           // 路由路径（可选）
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
      { id: 'shutdown', name: '关机', icon: '🔴', action: 'shutdown', priority: 10, routePath: '/ops/shutdown' },
      { id: 'remote-power', name: '远程开机', icon: '🟢', action: 'remotePower', priority: 20, routePath: '/ops/remote-power' }
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
          { id: 'cpu', name: 'CPU状态', icon: '💻', action: 'cpuMonitor', priority: 10, routePath: '/ops/monitor/cpu' },
          { id: 'memory', name: '内存使用率', icon: '🧠', action: 'memoryMonitor', priority: 20, routePath: '/ops/monitor/memory' },
          { id: 'disk', name: '硬盘健康度', icon: '💾', action: 'diskMonitor', priority: 30, routePath: '/ops/monitor/disk' },
          { id: 'network', name: 'IP信息', icon: '🌐', action: 'networkInfo', priority: 40, routePath: '/ops/monitor/network' }
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
      // { id: 'json-convert', name: 'JSONstring转json', icon: '📝', action: 'jsonConvert', priority: 10, routePath: '/tools/json-convert' }
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
          { id: 'rsa-keygen', name: 'RSA密钥对生成器', icon: '🔑', action: 'rsaKeygen', priority: 10, routePath: '/tools/encrypt/rsa-keygen' },
          { id: 'encrypt-decrypt', name: '加密/解密文本', icon: '🔒', action: 'encryptDecrypt', priority: 20, routePath: '/tools/encrypt/encrypt-decrypt' }
        ]
      }
    ]
  },
  {
    id: 'download',
    name: '下载',
    icon: '⬇️',
    routePath: 'download',
    priority: 30,              // 下载优先级第三
    // 直接的叶子菜单（没有二级菜单组）
    items: [
      { id: 'bilibili-download', name: 'bilibili视频下载', icon: '📺', action: 'bilibiliDownload', priority: 10, routePath: '/download/bilibili' },
      { id: 'douyin-download', name: '抖音视频下载', icon: '📱', action: 'douyinDownload', priority: 20, routePath: '/download/douyin' }
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
      { id: 'air-conditioner', name: '空调控制', icon: '❄️', action: 'airConditioner', priority: 10, routePath: '/control/air-conditioner' }
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
