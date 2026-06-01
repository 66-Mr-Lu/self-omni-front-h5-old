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

    <!-- 主内容区 -->
    <div class="content pt-16 px-4 pb-6">
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

      <!-- 空状态 -->
      <div v-if="!unifiedItems.length" class="empty-state bg-white rounded-xl p-8 text-center">
        <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center">
          <span class="text-2xl">📦</span>
        </div>
        <p class="text-gray-400 text-sm">暂无内容</p>
      </div>
    </div>

    <!-- 底部 Tab 导航 -->
    <BottomTab v-model="appStore.activeCategory" />

    <!-- 功能操作弹窗 -->
    <div v-if="showModal" class="modal-overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4" @click.self="closeModal">
      <div class="modal-content bg-white rounded-2xl w-full max-w-sm p-6">
        <div class="modal-header text-center mb-4">
          <div class="w-12 h-12 mx-auto rounded-full bg-primary bg-opacity-10 flex items-center justify-center mb-3">
            <span class="text-2xl">{{ selectedItem?.icon }}</span>
          </div>
          <h3 class="text-gray-800 font-semibold">{{ selectedItem?.name }}</h3>
        </div>
        <div class="modal-body mb-6">
          <p class="text-gray-500 text-sm text-center">此功能即将上线...</p>
        </div>
        <div class="modal-footer">
          <button class="w-full bg-primary text-white py-3 rounded-xl font-medium" @click="closeModal">
            确定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { menuData, getUnifiedSortedItems, type LeafMenu } from '@/data/menuData'
import BottomTab from '@/components/BottomTab.vue'
import MenuGroup from '@/components/MenuGroup.vue'
import LeafMenuItem from '@/components/LeafMenuItem.vue'

// 状态管理
const appStore = useAppStore()

// 弹窗状态
const showModal = ref(false)
const selectedItem = ref<LeafMenu | null>(null)

// 当前选中的分类
const currentCategory = computed(() => {
  return menuData.find(cat => cat.id === appStore.activeCategory)
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
  selectedItem.value = item
  showModal.value = true
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
  selectedItem.value = null
}
</script>

<style scoped>
/* 弹窗样式 */
.modal-overlay {
  animation: fadeIn 0.2s;
}

.modal-content {
  animation: slideUp 0.2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
