<template>
  <!-- 搜索弹窗 -->
  <van-popup
    v-model:show="visible"
    position="top"
    :style="{ height: '80%', borderRadius: '0 0 16px 16px' }"
    @open="handleOpen"
    @close="handleClose"
  >
    <div class="search-menu">
      <!-- 搜索输入框 -->
      <div class="search-header">
        <div class="custom-search">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchText"
            type="text"
            placeholder="搜索功能菜单..."
            class="search-input"
            autofocus
            @input="handleSearch"
          />
          <button class="search-cancel" @click="handleCancel">取消</button>
        </div>
      </div>

      <!-- 搜索结果列表 -->
      <div class="search-results">
        <!-- 空状态 -->
        <div v-if="!searchText" class="empty-state">
          <div class="text-6xl mb-4">🔍</div>
          <p class="text-gray-400">输入关键词搜索功能</p>
        </div>

        <!-- 无结果 -->
        <div v-else-if="searchResults.length === 0" class="empty-state">
          <div class="text-6xl mb-4">😕</div>
          <p class="text-gray-400">未找到相关功能</p>
        </div>

        <!-- 搜索结果 -->
        <div v-else class="result-list">
          <div class="result-count text-sm text-gray-500 px-4 py-2">
            找到 {{ searchResults.length }} 个结果
          </div>
          
          <van-cell-group>
            <van-cell
              v-for="result in searchResults"
              :key="result.id"
              :title="result.name"
              :label="result.desc"
              is-link
              @click="handleResultClick(result)"
            >
              <template #icon>
                <span class="text-2xl mr-3">{{ result.icon }}</span>
              </template>
              <template #value>
                <span class="text-xs text-gray-400">{{ result.categoryName }}</span>
              </template>
            </van-cell>
          </van-cell-group>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { menuData, type LeafMenu, type TopCategory } from '@/data/menuData'

// Props
const props = defineProps<{
  show: boolean
}>()

// Emits
const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

// 路由
const router = useRouter()

// 搜索文本
const searchText = ref('')

// 弹窗可见性
const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

// 搜索结果类型
interface SearchResult extends LeafMenu {
  categoryName: string  // 所属分类名称
  categoryIcon: string  // 所属分类图标
}

// 搜索结果
const searchResults = ref<SearchResult[]>([])

/**
 * 搜索菜单项
 */
const handleSearch = () => {
  const query = searchText.value.trim().toLowerCase()
  
  if (!query) {
    searchResults.value = []
    return
  }

  const results: SearchResult[] = []

  // 遍历所有分类
  menuData.forEach((category: TopCategory) => {
    // 搜索直接叶子菜单
    if (category.items) {
      category.items.forEach((item: LeafMenu) => {
        if (matchItem(item, query)) {
          results.push({
            ...item,
            categoryName: category.name,
            categoryIcon: category.icon
          })
        }
      })
    }

    // 搜索二级菜单组中的子菜单
    category.groups.forEach(group => {
      group.children.forEach((item: LeafMenu) => {
        if (matchItem(item, query)) {
          results.push({
            ...item,
            categoryName: category.name,
            categoryIcon: category.icon
          })
        }
      })
    })
  })

  // 按优先级排序
  searchResults.value = results.sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
}

/**
 * 匹配菜单项
 */
const matchItem = (item: LeafMenu, query: string): boolean => {
  // 匹配名称
  if (item.name.toLowerCase().includes(query)) {
    return true
  }

  // 匹配描述
  if (item.desc && item.desc.toLowerCase().includes(query)) {
    return true
  }

  // 匹配标签
  if (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query))) {
    return true
  }

  // 匹配路由路径
  if (item.routePath && item.routePath.toLowerCase().includes(query)) {
    return true
  }

  return false
}

/**
 * 点击搜索结果
 */
const handleResultClick = (result: SearchResult) => {
  // 关闭弹窗
  visible.value = false
  
  // 跳转到对应页面
  if (result.routePath) {
    router.push(result.routePath)
  }
}

/**
 * 弹窗打开时
 */
const handleOpen = () => {
  // 清空搜索
  searchText.value = ''
  searchResults.value = []
}

/**
 * 弹窗关闭时
 */
const handleClose = () => {
  // 清空搜索
  searchText.value = ''
  searchResults.value = []
}

/**
 * 取消搜索
 */
const handleCancel = () => {
  visible.value = false
}
</script>

<style scoped>
.search-menu {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f7f8fa;
}

.search-header {
  background-color: white;
  padding: 12px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
}

.search-results {
  flex: 1;
  overflow-y: auto;
  padding-top: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.result-list {
  padding-bottom: 20px;
}

.result-count {
  background-color: white;
  border-bottom: 1px solid #f0f0f0;
}

/* 自定义搜索框样式 */
.custom-search {
  display: flex;
  align-items: center;
  background-color: #f7f8fa;
  border-radius: 20px;
  padding: 6px 12px;
  margin: 0 12px;
  height: 36px;
  width: calc(100% - 24px);
}

.search-icon {
  font-size: 16px;
  margin-right: 8px;
  color: #999;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
}

.search-input::placeholder {
  color: #999;
}

.search-cancel {
  background: none;
  border: none;
  outline: none;
  font-size: 14px;
  color: #666;
  padding: 4px 8px;
  margin-left: 8px;
}

.search-cancel:active {
  opacity: 0.6;
}

/* Vant 组件样式覆盖 */
:deep(.van-cell) {
  padding: 12px 16px;
}

:deep(.van-cell__title) {
  font-weight: 500;
}
</style>