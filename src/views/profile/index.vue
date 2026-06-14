<template>
  <div class="profile-page min-h-screen bg-gray-100 pb-20">
    <!-- 顶部背景区域 -->
    <div class="profile-header bg-gradient-to-br from-primary to-info pt-16 pb-20 px-4">
      <!-- 用户信息卡片 -->
      <div class="user-card bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4">
        <div class="flex items-center">
          <!-- 用户头像 -->
          <div class="avatar-wrapper w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-4">
            <span class="text-3xl">👤</span>
          </div>
          <!-- 用户信息 -->
          <div class="user-info flex-1">
            <h2 class="text-white text-xl font-semibold">{{ currentUser?.nickname || currentUser?.username || '用户' }}</h2>
            <p class="text-white text-opacity-80 text-sm mt-1">@{{ currentUser?.username }}</p>
          </div>
          <!-- 编辑按钮 -->
          <button @click="goToEditProfile" class="edit-btn px-3 py-1.5 bg-white bg-opacity-20 rounded-full text-white text-sm hover:bg-opacity-30 transition-opacity">
            编辑资料
          </button>
        </div>
      </div>

      <!-- 统计数据 -->
      <div class="stats-row flex justify-around mt-6">
        <div class="stat-item text-center">
          <p class="text-white text-2xl font-bold">{{ userStats.downloadCount }}</p>
          <p class="text-white text-opacity-80 text-xs mt-1">下载次数</p>
        </div>
        <div class="stat-divider w-px h-8 bg-white bg-opacity-20"></div>
        <div class="stat-item text-center">
          <p class="text-white text-2xl font-bold">{{ userStats.usageDays }}</p>
          <p class="text-white text-opacity-80 text-xs mt-1">使用天数</p>
        </div>
        <div class="stat-divider w-px h-8 bg-white bg-opacity-20"></div>
        <div class="stat-item text-center">
          <p class="text-white text-2xl font-bold">{{ userStats.storageUsed }}</p>
          <p class="text-white text-opacity-80 text-xs mt-1">存储使用</p>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="profile-content px-4 -mt-12">
      <!-- 快捷入口卡片 -->
      <div class="quick-actions bg-white rounded-2xl shadow-sm p-4 mb-4">
        <h3 class="text-gray-800 font-semibold mb-3">快捷入口</h3>
        <div class="grid grid-cols-4 gap-3">
          <div
            v-for="action in quickActions"
            :key="action.id"
            class="action-item flex flex-col items-center py-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span class="text-2xl mb-1">{{ action.icon }}</span>
            <span class="text-xs text-gray-600">{{ action.name }}</span>
          </div>
        </div>
      </div>

      <!-- 菜单列表 -->
      <div class="menu-list bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
        <div
          v-for="menu in profileMenus"
          :key="menu.id"
          class="menu-item flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors"
          @click="handleMenuClick(menu)"
        >
          <div class="flex items-center">
            <span class="text-xl mr-3">{{ menu.icon }}</span>
            <span class="text-gray-800">{{ menu.name }}</span>
          </div>
          <div class="flex items-center">
            <span v-if="menu.badge" class="badge bg-red-500 text-white text-xs px-2 py-0.5 rounded-full mr-2">{{ menu.badge }}</span>
            <span class="text-gray-400 text-base">›</span>
          </div>
        </div>
      </div>

      <!-- 版本信息 -->
      <div class="version-info text-center py-6">
        <p class="text-gray-400 text-xs">Omni v{{ appStore.appVersion }}</p>
        <p class="text-gray-400 text-xs mt-1">一切尽在掌控</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { showToast } from 'vant'

// 路由
const router = useRouter()

// 状态管理
const appStore = useAppStore()

// 当前用户信息
const currentUser = computed(() => appStore.getUser())

// 用户统计数据
const userStats = ref({
  downloadCount: 128,
  usageDays: 365,
  storageUsed: '2.3GB'
})

// 快捷入口配置
const quickActions = [
  { id: 'download', name: '下载记录', icon: '📥' },
  { id: 'favorite', name: '我的收藏', icon: '❤️' },
  { id: 'history', name: '使用记录', icon: '📜' },
  { id: 'share', name: '分享应用', icon: '🔗' }
]

// 个人中心菜单配置
const profileMenus = [
  { id: 'settings', name: '设置', icon: '⚙️', badge: 0 },
  { id: 'theme', name: '主题设置', icon: '🎨', badge: 0 },
  { id: 'notification', name: '消息通知', icon: '🔔', badge: 3 },
  { id: 'privacy', name: '隐私设置', icon: '🔒', badge: 0 },
  { id: 'about', name: '关于我们', icon: 'ℹ️', badge: 0 }
]

/**
 * 处理菜单点击
 */
const handleMenuClick = (menu: { id: string; name: string }) => {
  showToast({
    message: `${menu.name}功能开发中`,
    position: 'top'
  })
}

/**
 * 跳转到编辑资料页面
 */
const goToEditProfile = () => {
  router.push('/profile/edit')
}
</script>

<style scoped>
.profile-header {
  background: linear-gradient(135deg, #4F46E5 0%, #0EA5E9 100%);
}

.user-card {
  backdrop-filter: blur(10px);
}

.avatar-wrapper {
  background: rgba(255, 255, 255, 0.2);
}

.action-item {
  transition: transform 0.2s;
}

.action-item:active {
  transform: scale(0.95);
}

.menu-item:active {
  background-color: #f3f4f6;
}
</style>
