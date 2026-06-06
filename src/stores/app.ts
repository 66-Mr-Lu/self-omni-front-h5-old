import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 应用名称
  const appName = ref('Omni工具箱')

  // 欢迎语
  const greeting = ref('')

  // 当前激活的顶级分类ID
  const activeCategory = ref('ops')

  // 各二级组的折叠状态
  const collapsedGroups = ref<Record<string, boolean>>({})

  // 当前用户信息
  const currentUser = ref<UserInfo | null>(null)

  /**
   * 用户信息接口
   */
  interface UserInfo {
    username: string
    avatar?: string
    id: string
  }

  /**
   * 检查是否已登录
   */
  const isLoggedIn = computed(() => {
    return !!currentUser.value
  })

  /**
   * 获取当前用户
   */
  const getUser = () => {
    return currentUser.value
  }

  /**
   * 设置当前用户
   */
  const setUser = (user: UserInfo | null) => {
    currentUser.value = user
  }

  /**
   * 从本地存储加载用户信息
   */
  const loadUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem('omni_user') || sessionStorage.getItem('omni_user')
      if (userStr) {
        const user = JSON.parse(userStr)
        currentUser.value = {
          id: user.id || '1',
          username: user.username,
          avatar: user.avatar
        }
      }
    } catch (e) {
      console.error('加载用户信息失败:', e)
    }
  }

  /**
   * 退出登录
   */
  const logout = () => {
    currentUser.value = null
    localStorage.removeItem('omni_user')
    sessionStorage.removeItem('omni_user')
  }

  // 更新时间问候语
  const updateGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 6) {
      greeting.value = '凌晨好'
    } else if (hour < 9) {
      greeting.value = '早上好'
    } else if (hour < 12) {
      greeting.value = '上午好'
    } else if (hour < 14) {
      greeting.value = '中午好'
    } else if (hour < 18) {
      greeting.value = '下午好'
    } else if (hour < 22) {
      greeting.value = '晚上好'
    } else {
      greeting.value = '夜深了'
    }
  }

  // 设置当前激活的分类
  const setActiveCategory = (id: string) => {
    activeCategory.value = id
    // 切换分类时重置折叠状态
    resetCollapsed()
  }

  // 切换二级组折叠状态
  const toggleGroup = (groupId: string) => {
    collapsedGroups.value[groupId] = !collapsedGroups.value[groupId]
  }

  // 重置所有组为折叠状态
  const resetCollapsed = () => {
    collapsedGroups.value = {}
  }

  // 初始化
  updateGreeting()
  loadUserFromStorage()

  return {
    appName,
    greeting,
    activeCategory,
    collapsedGroups,
    currentUser,
    isLoggedIn,
    getUser,
    setUser,
    loadUserFromStorage,
    logout,
    updateGreeting,
    setActiveCategory,
    toggleGroup,
    resetCollapsed
  }
})
