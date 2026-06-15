<template>
  <div class="tools-page">
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
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { menuData, getUnifiedSortedItems, type LeafMenu } from '@/data/menuData'
import MenuGroup from '@/components/MenuGroup.vue'
import LeafMenuItem from '@/components/LeafMenuItem.vue'

// 路由
const router = useRouter()

// 状态管理
const appStore = useAppStore()

// 当前分类
const currentCategory = computed(() => {
  return menuData.find(cat => cat.id === 'tools')
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
  // JSON转义转换功能跳转到对应的页面
  if (item.action === 'jsonEscapeConvert' && item.routePath) {
    router.push(item.routePath)
    return
  }
  
  // Unicode编解码功能跳转到对应的页面
  if (item.action === 'unicodeConvert' && item.routePath) {
    router.push(item.routePath)
    return
  }
  
  // 文本处理功能跳转到对应的页面
  if (item.action === 'textProcessor' && item.routePath) {
    router.push(item.routePath)
    return
  }
  
  // 使用 Vant showDialog 函数弹出提示
  showDialog({
    title: '提示',
    message: `${item.name}功能即将上线...`,
    confirmButtonText: '知道了'
  })
}
</script>

<style scoped>
.tools-page {
  min-height: 100%;
}
</style>
