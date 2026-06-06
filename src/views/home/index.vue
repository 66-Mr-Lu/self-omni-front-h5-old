<template>
  <div class="home-page min-h-screen bg-gray-100 pb-20">
    <!-- 顶部导航栏 -->
    <div class="header fixed top-0 left-0 right-0 bg-gradient-to-r from-primary to-info z-50">
      <div class="flex items-center justify-between px-5 h-12">
        <div>
          <h1 class="text-white text-lg font-semibold">{{ appStore.appName }}</h1>
          <p class="text-white text-opacity-80 text-xs">{{ appStore.greeting }}👋</p>
        </div>
        <!-- 个人中心入口 -->
        <button
          @click="handleProfileClick"
          class="w-9 h-9 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-opacity"
        >
          <span v-if="appStore.isLoggedIn" class="text-white">👤</span>
          <span v-else class="text-white">👥</span>
        </button>
      </div>
    </div>

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
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import BottomTab from '@/components/BottomTab.vue'
import { showToast } from 'vant'

// 状态管理
const appStore = useAppStore()

/**
 * 处理个人中心点击
 */
const handleProfileClick = () => {
  if (appStore.isLoggedIn) {
    // 已登录，显示用户信息
    const user = appStore.getUser()
    showToast({
      message: `欢迎回来，${user?.username || '用户'}`,
      position: 'top'
    })
  } else {
    // 未登录，跳转到登录页（使用相对路径）
    const basePath = import.meta.env.VITE_APP_BASE_PATH || '/omni/'
    window.location.href = `${basePath}login`
  }
}
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
