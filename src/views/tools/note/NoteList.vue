<template>
  <div class="note-list-page min-h-screen bg-gray-100">
    <!-- 内容区域 -->
    <div class="content pt-1 pb-20">
      <!-- 加载状态 -->
      <div v-if="loading && notes.length === 0 && !error" class="flex justify-center items-center py-12">
        <div class="loading-indicator">
          <span class="loading-dots"></span>
          <span class="text-gray-400 text-sm">加载中...</span>
        </div>
      </div>
      
      <!-- 错误状态 -->
      <div v-if="error" class="px-4 py-4">
        <div class="bg-white rounded-xl shadow-sm p-8 text-center">
          <div class="text-6xl mb-4">⚠️</div>
          <div class="text-gray-500 text-base mb-2">加载失败</div>
          <div class="text-gray-400 text-sm mb-6">{{ errorMessage }}</div>
          <button 
            class="px-6 py-2.5 bg-gradient-to-r from-primary to-info text-white rounded-xl text-sm font-medium transition-all active:opacity-80 shadow-md"
            @click="retryLoad"
          >
            重新加载
          </button>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="notes.length === 0 && !loading" class="px-4 py-4">
        <div class="bg-white rounded-xl shadow-sm p-8 text-center">
          <div class="text-6xl mb-4">📝</div>
          <div class="text-gray-500 text-base mb-6">暂无笔记</div>
          <button 
            class="px-6 py-2.5 bg-gradient-to-r from-primary to-info text-white rounded-xl text-sm font-medium transition-all active:opacity-80 shadow-md"
            @click="createNewNote"
          >
            创建第一篇笔记
          </button>
        </div>
      </div>
      
      <!-- 笔记列表 -->
      <div v-else-if="notes.length > 0" class="px-4 py-4 space-y-3">
        <div 
          v-for="note in notes" 
          :key="note.id" 
          class="note-item bg-white rounded-xl shadow-sm p-4 transition-all active:scale-[0.98]"
          @click="editNote(note)"
        >
          <div class="flex items-start justify-between mb-2">
            <h3 class="text-gray-800 font-semibold text-base flex-1 mr-2">{{ note.title || '无标题' }}</h3>
            <button 
              class="delete-btn px-3 py-1 bg-red-50 text-red-500 rounded-lg text-xs transition-all active:opacity-80"
              @click.stop="confirmDelete(note.id)"
            >
              删除
            </button>
          </div>
          <p class="text-gray-600 text-sm line-clamp-2 mb-2">{{ truncateContent(note.content) }}</p>
          <div class="text-xs text-gray-400">{{ formatTime(note.updateAt) }}</div>
        </div>
        
        <!-- 加载更多提示 -->
        <div v-if="hasMore && loadingMore" class="text-center py-4">
          <div class="loading-indicator">
            <span class="loading-dots"></span>
            <span class="text-gray-400 text-sm">加载中...</span>
          </div>
        </div>
        
        <!-- 已加载全部 -->
        <div v-if="!hasMore && notes.length > 0" class="text-center py-4">
          <span class="text-gray-400 text-sm">已加载全部笔记</span>
        </div>
      </div>
      
      <!-- 滚动触发标记（用于 IntersectionObserver） -->
      <div ref="loadMoreTrigger" class="load-more-trigger"></div>
    </div>

    <!-- 悬浮新建按钮 -->
    <button class="fab-button" @click="createNewNote" title="新建笔记">
      <span class="fab-icon">+</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllNotes, deleteNote, type Note, type PageResponse } from '@/api/note'
import { showToast, showDialog } from 'vant'

// 路由
const router = useRouter()

// 分页状态
const notes = ref<Note[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const hasMore = ref(true)
const loading = ref(false)
const loadingMore = ref(false)

// 错误状态
const error = ref(false)
const errorMessage = ref('网络请求失败，请稍后重试')

// 滚动触发元素引用
const loadMoreTrigger = ref<HTMLElement | null>(null)

// IntersectionObserver 实例
let observer: IntersectionObserver | null = null

/**
 * 加载笔记列表
 * @param page 页码
 * @param isLoadMore 是否为加载更多
 */
const loadNotes = async (page: number = 1, isLoadMore: boolean = false) => {
  // 加载更多时设置独立的 loading 状态
  if (isLoadMore) {
    if (loadingMore.value) return
    loadingMore.value = true
  } else {
    if (loading.value) return
    loading.value = true
    // 重置错误状态
    error.value = false
    errorMessage.value = ''
  }
  
  try {
    const response: PageResponse<Note> = await getAllNotes({
      pageNum: page,
      pageSize: pageSize.value
    })
    
    if (isLoadMore) {
      // 加载更多，追加数据（使用 MyBatis Plus 的 records 字段）
      notes.value = [...notes.value, ...response.records]
    } else {
      // 刷新，替换数据（使用 MyBatis Plus 的 records 字段）
      notes.value = response.records
    }
    
    total.value = response.total
    currentPage.value = response.current
    
    // 判断是否还有更多数据
    hasMore.value = notes.value.length < response.total
  } catch (err) {
    console.error('加载笔记失败:', err)
    const errMsg = err instanceof Error ? err.message : '网络请求失败，请稍后重试'
    if (!isLoadMore) {
      notes.value = []
      error.value = true
      errorMessage.value = errMsg
    } else {
      // 加载更多失败时提示用户
      showToast({ message: '加载更多失败', position: 'top' })
    }
  } finally {
    if (isLoadMore) {
      loadingMore.value = false
    } else {
      loading.value = false
    }
  }
}

/**
 * 重试加载
 */
const retryLoad = () => {
  currentPage.value = 1
  hasMore.value = true
  notes.value = []
  loadNotes(1)
}

/**
 * 加载更多
 */
const loadMore = () => {
  if (hasMore.value && !loading.value) {
    loadNotes(currentPage.value + 1, true)
  }
}

/**
 * 创建新笔记
 */
const createNewNote = () => {
  router.push('/tools/note/create')
}

/**
 * 编辑笔记（通过路由参数传递数据）
 */
const editNote = (note: Note) => {
  // 将笔记数据存储到 sessionStorage，确保刷新页面后仍能获取
  sessionStorage.setItem(`note_${note.id}`, JSON.stringify(note))
  
  router.push({
    path: `/tools/note/edit/${note.id}`,
    state: { noteData: note }
  })
}

/**
 * 确认删除
 */
const confirmDelete = async (id: string) => {
  showDialog({
    title: '确认删除',
    message: '删除后无法恢复，确定要删除吗？',
    showCancelButton: true,
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await deleteNote(id)
      showToast({ message: '删除成功', position: 'top' })
      // 重置分页，重新加载第一页
      currentPage.value = 1
      hasMore.value = true
      await loadNotes(1)
    } catch (error) {
      console.error('删除笔记失败:', error)
      showToast({ message: '删除失败', position: 'top' })
    }
  }).catch(() => {
    // 用户取消删除
  })
}

/**
 * 截断内容预览
 */
const truncateContent = (content: string, maxLength = 50): string => {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}

/**
 * 格式化时间
 */
const formatTime = (timeStr: string): string => {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }
  // 小于1小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }
  // 小于24小时
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  }
  // 今年
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
  // 其他
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

/**
 * 初始化滚动加载监听
 */
const initScrollObserver = () => {
  if (typeof IntersectionObserver !== 'undefined' && loadMoreTrigger.value) {
    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && hasMore.value && !loading.value) {
          loadMore()
        }
      },
      {
        rootMargin: '0px 0px 100px 0px', // 提前100px触发
        threshold: 0.1
      }
    )
    
    observer.observe(loadMoreTrigger.value)
  }
}

/**
 * 销毁滚动监听
 */
const destroyScrollObserver = () => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
}

// 页面加载时获取笔记列表
onMounted(() => {
  loadNotes(1)
  // 初始化滚动监听
  setTimeout(() => {
    initScrollObserver()
  }, 100)
})

// 页面卸载时销毁监听
onUnmounted(() => {
  destroyScrollObserver()
})
</script>

<style scoped>
.note-item {
  position: relative;
  overflow: hidden;
}

.note-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, #4CAF50, #45a049);
  opacity: 0;
  transition: opacity 0.2s;
}

.note-item:active::before {
  opacity: 1;
}

.delete-btn {
  flex-shrink: 0;
}

.delete-btn:active {
  background-color: #fee2e2;
}

/* 多行文本截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 加载指示器 */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loading-dots {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ddd;
  border-radius: 50%;
  border-top-color: #4CAF50;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 滚动触发标记 */
.load-more-trigger {
  height: 50px;
}

/* 悬浮按钮样式 */
.fab-button {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: #fff;
  border: none;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1000;
}

.fab-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.5);
}

.fab-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
}

.fab-icon {
  font-size: 32px;
  font-weight: 300;
  line-height: 1;
}
</style>