<template>
  <!-- 叶子菜单项 -->
  <div class="leaf-menu-item flex items-center h-12 px-4 cursor-pointer" @click="handleClick">
    <span class="text-lg mr-3">{{ item.icon }}</span>
    <span class="flex-1 text-gray-700 text-sm">{{ item.name }}</span>
    <!-- 角标 -->
    <span v-if="item.badge && item.badge > 0" class="badge bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
      {{ item.badge }}
    </span>
    <!-- 箭头指示器 -->
    <span v-if="hasChildren" class="text-gray-400 text-sm">›</span>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { LeafMenu } from '@/data/menuData'

// Props
interface Props {
  item: LeafMenu
  hasChildren?: boolean
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'click', item: LeafMenu): void
}

const emit = defineEmits<Emits>()

// 点击事件
const handleClick = () => {
  emit('click', props.item)
}
</script>

<style scoped>
.leaf-menu-item {
  transition: background-color 0.2s;
}

.leaf-menu-item:active {
  background-color: #f5f5f5;
}

.badge {
  min-width: 18px;
  text-align: center;
}
</style>
