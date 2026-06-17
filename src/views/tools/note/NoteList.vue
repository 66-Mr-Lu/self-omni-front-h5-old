<template>
  <div class="note-list-page min-h-screen bg-gray-100">
    <!-- 内容区域 -->
    <div class="content pt-1 pb-20">
      <!-- 空状态 -->
      <div v-if="notes.length === 0" class="px-4 py-4">
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
      <div v-else class="px-4 py-4 space-y-3">
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
          <div class="text-xs text-gray-400">{{ formatTime(note.updatedAt) }}</div>
        </div>
      </div>
    </div>

    <!-- 悬浮新建按钮 -->
    <button class="fab-button" @click="createNewNote" title="新建笔记">
      <span class="fab-icon">+</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllNotes, deleteNote, type Note } from '@/api/note'
import { showToast, showDialog } from 'vant'

// 路由
const router = useRouter()

// 状态
const notes = ref<Note[]>([])

/**
 * 加载笔记列表
 */
const loadNotes = async () => {
  try {
    notes.value = await getAllNotes()
  } catch (error) {
    console.error('加载笔记失败:', error)
  }
}

/**
 * 创建新笔记
 */
const createNewNote = () => {
  router.push('/tools/note/create')
}

/**
 * 编辑笔记
 */
const editNote = (note: Note) => {
  router.push(`/tools/note/edit/${note.id}`)
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
      await loadNotes()
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

// 页面加载时获取笔记列表
onMounted(() => {
  loadNotes()
})

// 监听路由变化，刷新列表
router.afterEach((to) => {
  if (to.path === '/tools/note') {
    loadNotes()
  }
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
