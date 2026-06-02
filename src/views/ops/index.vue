<template>
  <div class="ops-page">
    <!-- 统一排序的菜单列表 -->
    <template v-for="item in unifiedItems" :key="item.data.id">
      <!-- 直接叶子菜单 -->
      <div v-if="item.type === 'leaf'" class="direct-item bg-white rounded-xl shadow-sm mb-3 overflow-hidden">
        <LeafMenuItem
          :item="item.data"
          @click="handleChildClick"
        />
      </div>
      <!-- 二级菜单组 -->
      <MenuGroup
        v-else
        :group="item.data"
        @toggle="handleToggleGroup"
        @child-click="handleChildClick"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { showDialog } from 'vant'
import { useAppStore } from '@/stores/app'
import { menuData, getUnifiedSortedItems, type LeafMenu } from '@/data/menuData'
import MenuGroup from '@/components/MenuGroup.vue'
import LeafMenuItem from '@/components/LeafMenuItem.vue'

// 状态管理
const appStore = useAppStore()

// 当前分类
const currentCategory = computed(() => {
  return menuData.find(cat => cat.id === 'ops')
})

// 统一排序后的菜单项
const unifiedItems = computed(() => {
  if (!currentCategory.value) return []
  return getUnifiedSortedItems(currentCategory.value)
})

// 切换二级组折叠状态
const handleToggleGroup = (groupId: string) => {
  appStore.toggleGroup(groupId)
}

// 叶子菜单点击
const handleChildClick = (item: LeafMenu) => {
  // 使用 Vant showDialog 函数弹出提示
  showDialog({
    title: '提示',
    message: `${item.name}功能即将上线...`,
    confirmButtonText: '知道了'
  })
}
</script>

<style scoped>
.ops-page {
  min-height: 100%;
}
</style>
