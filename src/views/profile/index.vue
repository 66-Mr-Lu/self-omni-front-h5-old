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
            <span v-if="menu.id === 'subpasswd' && appStore.isSetSubPasswd" class="text-gray-400 text-xs mr-2">已设置</span>
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

    <!-- 二级密码弹窗 -->
    <SubPasswdDialog
      v-model:show="showSubPasswdDialog"
      :mode="subPasswdDialogMode"
      :description="subPasswdDescription"
      :display-password="getSubPasswd(currentUser?.id || '') || ''"
      @confirm="handleSubPasswdConfirm"
      @cancel="handleSubPasswdCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { showToast, showSuccessToast } from 'vant'
import SubPasswdDialog from '@/components/SubPasswdDialog.vue'
import { setSubPasswd, hasLocalSubPasswd, getSubPasswd } from '@/utils/subPasswd'

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
  { id: 'subpasswd', name: '二级密码', icon: '🔑', badge: 0 },
  { id: 'settings', name: '设置', icon: '⚙️', badge: 0 },
  { id: 'theme', name: '主题设置', icon: '🎨', badge: 0 },
  { id: 'notification', name: '消息通知', icon: '🔔', badge: 3 },
  { id: 'privacy', name: '隐私设置', icon: '🔒', badge: 0 },
  { id: 'about', name: '关于我们', icon: 'ℹ️', badge: 0 }
]

// 二级密码弹窗状态
const showSubPasswdDialog = ref(false)
const subPasswdDialogMode = ref<'set' | 'input' | 'display'>('set')
const subPasswdDescription = ref('')

/**
 * 处理菜单点击
 */
const handleMenuClick = (menu: { id: string; name: string }) => {
  switch (menu.id) {
    case 'subpasswd':
      handleSubPasswdMenuClick()
      break
    case 'about':
      showToast({
        message: 'Omni工具箱 v1.0.0',
        position: 'top'
      })
      break
    default:
      showToast({
        message: `${menu.name}功能开发中`,
        position: 'top'
      })
  }
}

/**
 * 处理二级密码菜单点击
 */
const handleSubPasswdMenuClick = () => {
  if (!currentUser.value) return

  const userSubPasswdStatus = currentUser.value.isSetSubPasswd
  const hasLocal = hasLocalSubPasswd(currentUser.value.id)

  if (userSubPasswdStatus === 'N') {
    // 场景1：后台标记为未设置（N），进入设置模式
    subPasswdDialogMode.value = 'set'
    subPasswdDescription.value = '尚未设置二级密码，是否立即设置？（只能设置一次，且无法更改）'
    showSubPasswdDialog.value = true
  } else if (userSubPasswdStatus !== 'N' && !hasLocal) {
    // 场景2：后台标记非N（已设置），但本地未检测到，进入输入模式
    subPasswdDialogMode.value = 'input'
    subPasswdDescription.value = '之前已设置，但本地未检测到，请再次输入二级密码'
    showSubPasswdDialog.value = true
  } else {
    // 场景3：已设置且本地有缓存，直接展示二级密码
    subPasswdDialogMode.value = 'display'
    subPasswdDescription.value = ''
    showSubPasswdDialog.value = true
  }
}

/**
 * 处理二级密码确认
 */
const handleSubPasswdConfirm = async (password: string) => {
  if (!currentUser.value) return

  if (subPasswdDialogMode.value === 'set') {
    // 设置模式：直接保存到本地缓存
    setSubPasswd(currentUser.value.id, password)
    showSubPasswdDialog.value = false
    showSuccessToast('二级密码设置成功')
  } else if (subPasswdDialogMode.value === 'input') {
    // 输入模式：直接保存到本地缓存（用于恢复本地缓存）
    setSubPasswd(currentUser.value.id, password)
    showSubPasswdDialog.value = false
    showSuccessToast('二级密码保存成功')
  }
}

/**
 * 处理二级密码取消
 */
const handleSubPasswdCancel = () => {
  showSubPasswdDialog.value = false
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
