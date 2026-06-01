// 叶子菜单项类型
export interface LeafMenu {
  id: string
  name: string
  icon: string
  action: string
  badge?: number
  priority?: number            // 优先级，数值越小优先级越高，默认 100
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
}

// 完整的菜单数据
export const menuData: TopCategory[] = [
  {
    id: 'ops',
    name: '运维',
    icon: '🔌',
    priority: 10,              // 运维优先级最高
    // 直接的叶子菜单
    items: [
      { id: 'shutdown', name: '关机', icon: '🔴', action: 'shutdown', priority: 10 },
      { id: 'remote-power', name: '远程开机', icon: '🟢', action: 'remotePower', priority: 20 }
    ],
    // 二级菜单组
    groups: [
      {
        id: 'monitor',
        name: '实时系统信息',
        icon: '📊',
        collapsed: true,
        priority: 10,
        children: [
          { id: 'cpu', name: 'CPU状态', icon: '💻', action: 'cpuMonitor', priority: 10 },
          { id: 'memory', name: '内存使用率', icon: '🧠', action: 'memoryMonitor', priority: 20 },
          { id: 'disk', name: '硬盘健康度', icon: '💾', action: 'diskMonitor', priority: 30 },
          { id: 'network', name: 'IP信息', icon: '🌐', action: 'networkInfo', priority: 40 }
        ]
      }
    ]
  },
  {
    id: 'tools',
    name: '工具',
    icon: '🛠️',
    priority: 20,              // 工具优先级次之
    // 直接的叶子菜单
    items: [
      { id: 'json-convert', name: 'JSONstring转json', icon: '📝', action: 'jsonConvert', priority: 10 }
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
          { id: 'rsa-keygen', name: 'RSA密钥对生成器', icon: '🔑', action: 'rsaKeygen', priority: 10 },
          { id: 'encrypt-decrypt', name: '加密/解密文本', icon: '🔒', action: 'encryptDecrypt', priority: 20 }
        ]
      }
    ]
  },
  {
    id: 'download',
    name: '下载',
    icon: '⬇️',
    priority: 30,              // 下载优先级第三
    // 直接的叶子菜单（没有二级菜单组）
    items: [
      { id: 'bilibili-download', name: 'bilibili视频下载', icon: '📺', action: 'bilibiliDownload', priority: 10 },
      { id: 'douyin-download', name: '抖音视频下载', icon: '📱', action: 'douyinDownload', priority: 20 }
    ],
    groups: []
  },
  {
    id: 'control',
    name: '控制',
    icon: '🌡️',
    priority: 40,              // 控制优先级最低
    // 直接的叶子菜单（没有二级菜单组）
    items: [
      { id: 'air-conditioner', name: '空调控制', icon: '❄️', action: 'airConditioner', priority: 10 }
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
