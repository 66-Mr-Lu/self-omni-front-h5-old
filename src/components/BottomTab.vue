<template>
  <!-- 底部 Tab 导航栏 -->
  <div class="bottom-tab fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
    <div class="flex justify-around items-center h-11">
      <div
        v-for="item in tabs"
        :key="item.id"
        class="tab-item flex flex-col items-center justify-center cursor-pointer py-0.5 px-2"
        :class="{ 'active': isActive(item.routePath) }"
        @click="handleTabClick(item.routePath)"
      >
        <span class="text-base">{{ item.icon }}</span>
        <span class="text-[10px] mt-0.5">{{ item.name }}</span>
      </div>
    </div>
    <!-- 安全区域适配 -->
    <div class="safe-area h-0" :style="{ height: `${safeAreaBottom}px` }"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getSortedCategories } from '@/data/menuData'

// 路由
const router = useRouter()
const route = useRoute()

// 底部安全区域高度
const safeAreaBottom = ref(0)

// 计算 Tab 数据（按优先级排序）
const tabs = computed(() => getSortedCategories())

// 判断当前路由是否匹配
const isActive = (routePath: string): boolean => {
  const fullPath = `/${routePath}`
  return route.path === fullPath || route.path.startsWith(`${fullPath}/`)
}

// Tab 点击事件
const handleTabClick = (routePath: string) => {
  router.push(`/${routePath}`)
}

// 初始化时获取安全区域高度
onMounted(() => {
  // 简单的安全区域检测
  safeAreaBottom.value = window.innerHeight - document.documentElement.clientHeight
})
</script>

<style scoped>
.bottom-tab {
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.tab-item {
  color: #999;
  transition: color 0.2s;
}

.tab-item.active {
  color: #4F46E5;
}

.tab-item.active span:first-child {
  transform: scale(1.1);
}
</style>
