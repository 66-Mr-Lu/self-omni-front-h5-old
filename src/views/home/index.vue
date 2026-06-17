<template>
  <div class="home-page min-h-screen bg-gray-100 pb-20">
    <!-- 顶部导航栏 -->
    <div class="header fixed top-0 left-0 right-0 bg-gradient-to-r from-primary to-info z-50">
      <!-- 子页面导航栏样式 -->
      <div v-if="showBackButton" class="flex items-center px-5 h-12">
        <div class="back-btn w-8 h-8 flex items-center justify-center cursor-pointer" @click="goBack">
          <span class="text-white text-2xl">‹</span>
        </div>
        <h1 class="text-white text-lg font-semibold mx-3">{{ currentPageTitle }}</h1>
      </div>
      <!-- 首页导航栏样式 -->
      <div v-else class="flex items-center justify-between px-5 h-12">
        <div>
          <h1 class="text-white text-lg font-semibold">{{ appStore.appName }}</h1>
          <p class="text-white text-opacity-80 text-xs">{{ appStore.greeting }}👋</p>
        </div>
        <!-- 右侧按钮组 -->
        <div class="flex items-center space-x-3">
          <!-- 全屏按钮 -->
          <button
            @click="toggleFullscreen"
            class="w-9 h-9 flex items-center justify-center rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-opacity"
          >
            <span class="text-white text-lg">{{ isFullscreen ? '⛶' : '⛶' }}</span>
          </button>
          
          <!-- 搜索按钮 -->
          <button
            @click="showSearch = true"
            class="w-9 h-9 flex items-center justify-center rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-opacity"
          >
            <span class="text-white text-lg">🔍</span>
          </button>
          
          <!-- 个人中心入口 -->
          <div class="relative">
            <button
              @click="handleProfileClick"
              class="flex items-center justify-center transition-opacity"
              :class="appStore.isLoggedIn ? 'w-9 h-9 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30' : 'px-3 py-1.5 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-sm font-medium'"
            >
              <span v-if="appStore.isLoggedIn" class="text-white">👤</span>
              <span v-else class="text-white">去登录</span>
            </button>
            
            <!-- 下拉菜单（仅已登录时显示） -->
            <div
              v-if="showUserMenu"
              class="dropdown-menu absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50"
            >
              <div class="px-4 py-2 border-b border-gray-100">
                <div class="flex items-center">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center mr-2">
                    <span class="text-white text-sm">👤</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-800">{{ currentUser?.nickname || currentUser?.username }}</p>
                    <p class="text-xs text-gray-500">{{ currentUser?.username }}</p>
                  </div>
                </div>
              </div>
              <button
                @click="goToProfile"
                class="dropdown-item w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <span class="mr-2">👤</span>
                <span>个人中心</span>
              </button>
              <button
                @click="goToSettings"
                class="dropdown-item w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <span class="mr-2">⚙️</span>
                <span>设置</span>
              </button>
              <div class="border-t border-gray-100 my-1"></div>
              <button
                @click="handleLogout"
                class="dropdown-item w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center"
              >
                <span class="mr-2">🚪</span>
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 点击外部关闭下拉菜单 -->
    <div
      v-if="showUserMenu"
      class="dropdown-overlay fixed inset-0 z-40"
      @click="showUserMenu = false"
    ></div>

    <!-- 主内容区 - 使用 router-view 显示子页面 -->
    <div class="content pt-16 px-4 pb-6">
      <router-view v-slot="{ Component }">
        <div v-if="Component" class="view-wrapper">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </div>
      </router-view>
    </div>

    <!-- 底部 Tab 导航 -->
    <BottomTab />

    <!-- 搜索菜单弹窗 -->
    <SearchMenu v-model:show="showSearch" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import BottomTab from '@/components/BottomTab.vue'
import SearchMenu from '@/components/SearchMenu.vue'
import { showToast, showDialog } from 'vant'

// 路由
const router = useRouter()
const route = useRoute()

// 状态管理
const appStore = useAppStore()

// 搜索弹窗显示状态
const showSearch = ref(false)

// 用户菜单显示状态
const showUserMenu = ref(false)

// 全屏状态
const isFullscreen = ref(false)

// 当前用户信息
const currentUser = computed(() => appStore.getUser())

// 是否显示返回按钮（在子页面显示）
const showBackButton = computed(() => {
  // 定义需要显示返回按钮的路由路径
  const subPagePaths = [
    '/tools/note',
    '/tools/json-escape-convert',
    '/tools/text-processor',
    '/tools/unicode-convert',
    '/tools/cron-expression',
    '/tools/subscription-convert',
    '/tools/base64-convert',
    '/download/bilibili',
    '/profile',
    '/profile/edit'
  ]
  
  // 检查当前路由是否匹配
  return subPagePaths.some(path => route.path.startsWith(path))
})

// 当前页面标题
const currentPageTitle = computed(() => {
  const titleMap: Record<string, string> = {
    '/tools/note': '记事本',
    '/tools/note/create': '新建笔记',
    '/tools/note/edit': '编辑笔记',
    '/tools/json-escape-convert': 'JSON转义转换',
    '/tools/text-processor': '文本处理',
    '/tools/unicode-convert': 'Unicode编解码',
    '/tools/cron-expression': 'Cron表达式生成器',
    '/tools/subscription-convert': '订阅转换',
    '/tools/base64-convert': 'Base64编解码',
    '/download/bilibili': 'B站视频下载',
    '/profile': '个人中心',
    '/profile/edit': '编辑资料'
  }
  
  // 查找匹配的标题
  for (const [path, title] of Object.entries(titleMap)) {
    if (route.path.startsWith(path)) {
      return title
    }
  }
  
  return '页面'
})

/**
 * 返回上一页
 */
const goBack = () => {
  window.history.back()
}

/**
 * 处理个人中心点击
 * 未登录时直接跳转到登录页，已登录时显示下拉菜单
 */
const handleProfileClick = () => {
  if (appStore.isLoggedIn) {
    // 已登录，切换下拉菜单显示状态
    showUserMenu.value = !showUserMenu.value
  } else {
    // 未登录，直接跳转到登录页
    const basePath = import.meta.env.VITE_APP_BASE_PATH || '/omni/'
    window.location.href = `${basePath}login`
  }
}

/**
 * 跳转到个人中心
 */
const goToProfile = () => {
  showUserMenu.value = false
  router.push('/profile')
}

/**
 * 跳转到设置（预留）
 */
const goToSettings = () => {
  showUserMenu.value = false
  showToast({
    message: '设置功能开发中',
    position: 'top'
  })
}

/**
 * 处理退出登录
 */
const handleLogout = () => {
  showUserMenu.value = false
  showDialog({
    title: '确认退出',
    message: '确定要退出登录吗？',
    confirmButtonText: '退出',
    confirmButtonColor: '#ef4444',
    cancelButtonText: '取消'
  }).then(async () => {
    // 用户点击确认退出
    try {
      await appStore.logout()
      showToast({
        message: '退出成功',
        position: 'top'
      })
      // 刷新页面回到首页
      const basePath = import.meta.env.VITE_APP_BASE_PATH || '/omni/'
      window.location.href = basePath
    } catch (error) {
      showToast({
        message: '退出失败',
        position: 'top'
      })
    }
  }).catch(() => {
    // 用户点击取消，不做任何操作
  })
}

/**
 * 切换全屏模式
 */
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    // 进入全屏
    document.documentElement.requestFullscreen().then(() => {
      isFullscreen.value = true
    }).catch((err) => {
      console.error('进入全屏失败:', err)
      showToast({
        message: '进入全屏失败',
        position: 'top'
      })
    })
  } else {
    // 退出全屏
    document.exitFullscreen().then(() => {
      isFullscreen.value = false
    }).catch((err) => {
      console.error('退出全屏失败:', err)
      showToast({
        message: '退出全屏失败',
        position: 'top'
      })
    })
  }
}

// 监听全屏状态变化
document.addEventListener('fullscreenchange', () => {
  isFullscreen.value = !!document.fullscreenElement
})
</script>

<style scoped>
.view-wrapper {
  min-height: 100%;
}

/* 路由切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
