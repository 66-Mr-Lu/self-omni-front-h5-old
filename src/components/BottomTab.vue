<template>
  <!-- 底部 Tab 导航栏 -->
  <div class="bottom-tab fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
    <div class="flex justify-around items-center h-14">
      <div
        v-for="(item, index) in tabs"
        :key="item.id"
        class="tab-item flex flex-col items-center justify-center cursor-pointer py-1 px-3"
        :class="{ 'active': activeId === item.id }"
        @click="handleTabClick(item.id)"
      >
        <span class="text-xl">{{ item.icon }}</span>
        <span class="text-xs mt-0.5">{{ item.name }}</span>
      </div>
    </div>
    <!-- 安全区域适配 -->
    <div class="safe-area h-0" :style="{ height: `${safeAreaBottom}px` }"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getSortedCategories, type TopCategory } from '@/data/menuData'

// Props
interface Props {
  modelValue: string
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'update:modelValue', value: string): void
}

const emit = defineEmits<Emits>()

// 底部安全区域高度
const safeAreaBottom = ref(0)

// 计算 Tab 数据（按优先级排序）
const tabs = computed<TopCategory[]>(() => getSortedCategories())

// 当前激活的 Tab ID
const activeId = computed(() => props.modelValue)

// Tab 点击事件
const handleTabClick = (id: string) => {
  emit('update:modelValue', id)
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
