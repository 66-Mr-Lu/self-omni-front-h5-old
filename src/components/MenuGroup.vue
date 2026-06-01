<template>
  <!-- 二级菜单组 -->
  <div class="menu-group bg-white rounded-xl shadow-sm mb-3 overflow-hidden">
    <!-- 组标题（可点击折叠） -->
    <div class="group-header flex items-center h-12 px-4 cursor-pointer" @click="handleToggle">
      <span class="text-lg mr-3">{{ group.icon }}</span>
      <span class="flex-1 text-gray-800 font-medium text-sm">{{ group.name }}</span>
      <!-- 折叠箭头 -->
      <span class="arrow text-gray-400 text-sm transition-transform" :class="{ 'rotate': !collapsed }">›</span>
    </div>
    
    <!-- 子菜单项（折叠区域，按优先级排序） -->
    <div class="children-wrapper transition-all duration-200" :class="{ 'collapsed': collapsed }">
      <div class="children-list">
        <LeafMenuItem
          v-for="child in sortedChildren"
          :key="child.id"
          :item="child"
          @click="handleChildClick"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits, ref, watch } from 'vue'
import type { MenuGroup } from '@/data/menuData'
import type { LeafMenu } from '@/data/menuData'
import { getSortedChildren } from '@/data/menuData'
import LeafMenuItem from './LeafMenuItem.vue'

// Props
interface Props {
  group: MenuGroup
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'toggle', groupId: string): void
  (e: 'childClick', item: LeafMenu): void
}

const emit = defineEmits<Emits>()

// 折叠状态
const collapsed = ref(props.group.collapsed)

// 排序后的子菜单
const sortedChildren = computed(() => getSortedChildren(props.group.children))

// 监听 props 变化
watch(() => props.group.collapsed, (newVal) => {
  collapsed.value = newVal
})

// 切换折叠状态
const handleToggle = () => {
  collapsed.value = !collapsed.value
  emit('toggle', props.group.id)
}

// 子菜单点击
const handleChildClick = (item: LeafMenu) => {
  emit('childClick', item)
}
</script>

<style scoped>
.group-header {
  transition: background-color 0.2s;
}

.group-header:active {
  background-color: #f9f9f9;
}

.arrow {
  display: inline-block;
  transform: rotate(-90deg);
}

.arrow.rotate {
  transform: rotate(0deg);
}

.children-wrapper {
  max-height: 500px;
  opacity: 1;
}

.children-wrapper.collapsed {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

.children-list {
  border-top: 1px solid #f0f0f0;
}
</style>
