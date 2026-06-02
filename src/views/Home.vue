<template>
  <div class="home-page min-h-screen bg-gray-100 pb-20">
    <!-- 顶部导航栏 -->
    <div class="header fixed top-0 left-0 right-0 bg-gradient-to-r from-primary to-info z-50">
      <div class="flex items-center justify-between px-5 h-12">
        <div>
          <h1 class="text-white text-lg font-semibold">{{ appStore.appName }}</h1>
          <p class="text-white text-opacity-80 text-xs">{{ appStore.greeting }}👋</p>
        </div>
        <div class="w-9 h-9 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
          <span class="text-white">⚙️</span>
        </div>
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

// 状态管理
const appStore = useAppStore()
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
