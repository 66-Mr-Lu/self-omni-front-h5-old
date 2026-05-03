<template>
  <div class="home-page min-h-screen bg-gradient-to-br from-primary to-info">
    <!-- 欢迎区域 -->
    <div class="welcome-section px-5 pt-12 pb-8">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-white text-opacity-80 text-sm mb-1">{{ currentDate }}</p>
          <h1 class="text-white text-2xl font-semibold">
            {{ appStore.greeting }}👋
          </h1>
          <p class="text-white text-opacity-60 text-sm mt-1">{{ appStore.appName }}</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
          <span class="text-white text-xl">🚀</span>
        </div>
      </div>
    </div>

    <!-- 仪表盘内容区域 -->
    <div class="dashboard-content bg-white rounded-t-3xl min-h-screen px-5 py-6">
      <!-- 统计卡片 -->
      <div class="stats-grid grid grid-cols-3 gap-3 mb-6 -mt-10">
        <div class="stat-card bg-white rounded-xl shadow-lg p-4 text-center">
          <div class="text-primary text-xl font-bold">0</div>
          <div class="text-gray-500 text-xs mt-1">工具总数</div>
        </div>
        <div class="stat-card bg-white rounded-xl shadow-lg p-4 text-center">
          <div class="text-secondary text-xl font-bold">0</div>
          <div class="text-gray-500 text-xs mt-1">使用次数</div>
        </div>
        <div class="stat-card bg-white rounded-xl shadow-lg p-4 text-center">
          <div class="text-warning text-xl font-bold">0</div>
          <div class="text-gray-500 text-xs mt-1">收藏夹</div>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="quick-access mb-6">
        <h2 class="text-gray-800 font-semibold text-base mb-3">快捷入口</h2>
        <div class="grid grid-cols-4 gap-3">
          <div
            v-for="(item, index) in quickAccessItems"
            :key="index"
            class="quick-item flex flex-col items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <div class="w-10 h-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mb-2">
              <span class="text-lg">{{ item.icon }}</span>
            </div>
            <span class="text-gray-600 text-xs">{{ item.name }}</span>
          </div>
        </div>
      </div>

      <!-- 最近使用 -->
      <div class="recent-section mb-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-gray-800 font-semibold text-base">最近使用</h2>
          <span class="text-gray-400 text-xs">暂无记录</span>
        </div>
        <div class="empty-state bg-gray-50 rounded-xl p-8 text-center">
          <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center">
            <span class="text-2xl">📦</span>
          </div>
          <p class="text-gray-400 text-sm">开始添加您的第一个工具吧</p>
        </div>
      </div>

      <!-- 公告区域 -->
      <div class="notice-section">
        <div class="bg-gradient-to-r from-primary to-info rounded-xl p-4 text-white">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3">
              <span>📢</span>
            </div>
            <div>
              <p class="text-sm font-medium">欢迎使用 Omni 工具箱</p>
              <p class="text-xs text-white text-opacity-80 mt-0.5">个人工具集合，随心所欲</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

// 当前日期
const currentDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()]
  return `${year}年${month}月${day}日 ${weekDay}`
})

// 快捷入口数据
const quickAccessItems = [
  { name: '常用工具', icon: '🛠️' },
  { name: '收藏夹', icon: '⭐' },
  { name: '历史记录', icon: '📜' },
  { name: '设置', icon: '⚙️' }
]
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  min-height: 100dvh;
}

.dashboard-content {
  margin-top: -1.5rem;
  position: relative;
  z-index: 1;
}

.stat-card {
  transform: translateY(-0.5rem);
}

.quick-item {
  cursor: pointer;
}
</style>