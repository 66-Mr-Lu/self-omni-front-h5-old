<template>
  <div class="note-editor-page min-h-screen bg-gray-100">
    <!-- 顶部固定工具栏（滚动时位置不变） -->
    <div class="editor-toolbar fixed top-0 left-0 right-0 z-50">
      <div class="toolbar-container bg-white border-b border-gray-200">
        <div class="toolbar-content">
          <!-- 返回按钮 -->
          <button 
            class="toolbar-btn" 
            :class="{ disabled: loading }"
            :disabled="loading"
            @click="handleGoBack"
            title="返回"
          >
            <span class="btn-icon">←</span>
          </button>
          
          <!-- 撤销按钮 -->
          <button 
            class="toolbar-btn" 
            :class="{ disabled: !canUndo || loading }"
            :disabled="!canUndo || loading"
            @click="undo"
            title="撤销"
          >
            <span class="btn-icon">↶</span>
          </button>
          
          <!-- 重做按钮 -->
          <button 
            class="toolbar-btn" 
            :class="{ disabled: !canRedo || loading }"
            :disabled="!canRedo || loading"
            @click="redo"
            title="重做"
          >
            <span class="btn-icon">↷</span>
          </button>
          
          <!-- 保存按钮 -->
          <button 
            class="toolbar-btn save-btn" 
            :class="{ disabled: loading }"
            :disabled="loading"
            @click="saveNote"
            title="保存"
          >
            <span v-if="!saving" class="btn-icon">✓</span>
            <span v-else class="saving-icon">●</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="content pt-14">
      <div class="flex justify-center items-center py-20">
        <div class="loading-indicator">
          <span class="loading-dots"></span>
          <span class="text-gray-400 text-sm">加载中...</span>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div v-else class="content pt-10 pb-6">
      <div class="px-4 py-4">
        <div class="bg-white rounded-xl shadow-sm p-4">
          <!-- 标题输入 -->
          <input 
            v-model="currentNote.title" 
            class="note-title-input w-full px-3 py-2 text-lg font-semibold text-gray-800 border-b border-gray-200 focus:outline-none focus:border-primary mb-3"
            placeholder="输入标题..."
            @input="onContentChange"
            :disabled="loading"
          />
          
          <!-- 内容输入 -->
          <textarea 
            v-model="currentNote.content" 
            class="note-content-textarea w-full h-[calc(100vh-220px)] px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none"
            placeholder="输入内容..."
            @input="onContentChange"
            :disabled="loading"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getNoteById, createNote, updateNote, type Note, type CreateNoteRequest, type UpdateNoteRequest } from '@/api/note'
import { showToast, showDialog } from 'vant'

// 路由
const router = useRouter()
const route = useRoute()

// 状态
const isEdit = ref(false) // 是否编辑模式
const noteId = ref('') // 笔记ID
const loading = ref(false) // 页面加载状态
const saving = ref(false) // 保存状态

const currentNote = ref<{ id: string; title: string; content: string }>({
  id: '',
  title: '',
  content: ''
})

// 撤销/重做历史（最大50步）
const history = ref<{ title: string; content: string }[]>([])
const historyIndex = ref(-1)
const MAX_HISTORY = 50

// 原始内容（用于检测是否修改）
const originalContent = ref({ title: '', content: '' })

// 是否有未保存的修改
const hasUnsavedChanges = computed(() => {
  return currentNote.value.title !== originalContent.value.title || 
         currentNote.value.content !== originalContent.value.content
})

// 是否可以撤销
const canUndo = computed(() => historyIndex.value > 0)

// 是否可以重做
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

/**
 * 保存历史记录
 */
const saveHistory = () => {
  // 获取当前状态的字符串表示，用于去重
  const currentState = JSON.stringify({
    title: currentNote.value.title,
    content: currentNote.value.content
  })
  
  // 获取上一条历史记录的状态
  const lastState = historyIndex.value >= 0 
    ? JSON.stringify(history.value[historyIndex.value]) 
    : null
  
  // 如果当前状态与上一条历史相同，则不保存（避免重复记录）
  if (lastState === currentState) {
    return
  }
  
  // 清除当前位置之后的历史（用户在撤销后进行了新的操作）
  history.value = history.value.slice(0, historyIndex.value + 1)
  
  // 添加当前状态到历史
  history.value.push({
    title: currentNote.value.title,
    content: currentNote.value.content
  })
  
  // 限制历史记录数量
  if (history.value.length > MAX_HISTORY) {
    history.value.shift()
  } else {
    historyIndex.value++
  }
}

// 防抖保存历史（避免频繁保存）
let historyTimer: number | null = null
const debouncedSaveHistory = () => {
  if (historyTimer) {
    clearTimeout(historyTimer)
  }
  historyTimer = window.setTimeout(() => {
    saveHistory()
  }, 100)
}

/**
 * 撤销
 */
const undo = () => {
  if (!canUndo.value || loading.value) return
  
  historyIndex.value--
  const prevState = history.value[historyIndex.value]
  currentNote.value.title = prevState.title
  currentNote.value.content = prevState.content
}

/**
 * 重做
 */
const redo = () => {
  if (!canRedo.value || loading.value) return
  
  historyIndex.value++
  const nextState = history.value[historyIndex.value]
  currentNote.value.title = nextState.title
  currentNote.value.content = nextState.content
}

/**
 * 内容变更时保存历史（使用防抖）
 */
const onContentChange = () => {
  debouncedSaveHistory()
}

/**
 * 返回处理
 */
const handleGoBack = async () => {
  // 如果正在保存，不允许返回
  if (saving.value) return
  
  // 如果有未保存的修改，提示用户
  if (hasUnsavedChanges.value) {
    showDialog({
      title: '提示',
      message: '笔记内容已修改，是否保存？',
      showCancelButton: true,
      confirmButtonText: '保存',
      cancelButtonText: '不保存'
    }).then(async () => {
      await saveNote()
      router.back()
    }).catch(() => {
      // 用户取消保存，直接返回
      router.back()
    })
  } else {
    router.back()
  }
}

/**
 * 加载笔记详情
 */
const loadNoteDetail = async () => {
  loading.value = true
  
  try {
    const note = await getNoteById(noteId.value)
    currentNote.value = {
      id: note.id,
      title: note.title,
      content: note.content
    }
    // 初始化历史记录
    history.value = [{ title: note.title, content: note.content }]
    historyIndex.value = 0
    originalContent.value = { title: note.title, content: note.content }
  } catch (error) {
    console.error('加载笔记失败:', error)
    showToast({ message: '加载笔记失败', position: 'top' })
    setTimeout(() => {
      router.back()
    }, 1500)
  } finally {
    loading.value = false
  }
}

/**
 * 初始化新笔记
 */
const initNewNote = () => {
  currentNote.value = {
    id: '',
    title: '',
    content: ''
  }
  // 初始化历史记录
  history.value = [{ title: '', content: '' }]
  historyIndex.value = 0
  originalContent.value = { title: '', content: '' }
}

/**
 * 从路由状态加载笔记数据（避免重复请求）
 */
const loadNoteFromRouteState = () => {
  // Vue Router 4.x 中，state 需要通过 window.history.state 获取
  const noteData = (window.history.state as any)?.noteData as Note | undefined
  if (noteData) {
    currentNote.value = {
      id: noteData.id,
      title: noteData.title,
      content: noteData.content
    }
    // 初始化历史记录
    history.value = [{ title: noteData.title, content: noteData.content }]
    historyIndex.value = 0
    originalContent.value = { title: noteData.title, content: noteData.content }
    return true
  }
  
  // 如果 state 中没有数据，尝试从 sessionStorage 获取（处理页面刷新情况）
  if (isEdit.value && noteId.value) {
    const cachedNote = sessionStorage.getItem(`note_${noteId.value}`)
    if (cachedNote) {
      try {
        const parsedNote = JSON.parse(cachedNote) as Note
        currentNote.value = {
          id: parsedNote.id,
          title: parsedNote.title,
          content: parsedNote.content
        }
        // 初始化历史记录
        history.value = [{ title: parsedNote.title, content: parsedNote.content }]
        historyIndex.value = 0
        originalContent.value = { title: parsedNote.title, content: parsedNote.content }
        return true
      } catch (error) {
        console.error('解析缓存笔记失败:', error)
      }
    }
  }
  
  return false
}

/**
 * 保存笔记
 */
const saveNote = async () => {
  // 如果没有修改，不执行保存操作
  if (!hasUnsavedChanges.value) {
    // showToast({ message: '内容未修改', position: 'top' })
    showToast({ message: '保存成功', position: 'top' })
    return
  }

  // 验证输入
  if (!currentNote.value.title.trim() && !currentNote.value.content.trim()) {
    showToast({ message: '请输入标题或内容', position: 'top' })
    return
  }

  // 设置保存状态
  saving.value = true

  try {
    if (isEdit.value) {
      // 更新笔记
      const params: UpdateNoteRequest = {
        id: currentNote.value.id,
        title: currentNote.value.title.trim(),
        content: currentNote.value.content.trim()
      }
      await updateNote(params)
      showToast({ message: '保存成功', position: 'top' })
    } else {
      // 创建笔记
      const params: CreateNoteRequest = {
        title: currentNote.value.title.trim(),
        content: currentNote.value.content.trim()
      }
      await createNote(params)
      showToast({ message: '创建成功', position: 'top' })
    }
    
    // 保存成功后更新原始内容，避免返回时再次提示
    originalContent.value = { 
      title: currentNote.value.title.trim(), 
      content: currentNote.value.content.trim() 
    }
    
    // 清理 sessionStorage 中的缓存
    if (currentNote.value.id) {
      sessionStorage.removeItem(`note_${currentNote.value.id}`)
    }
    
    // 延迟返回，让用户看到成功提示
    // setTimeout(() => {
    //   router.back()
    // }, 500)
  } catch (error) {
    console.error('保存笔记失败:', error)
    showToast({ message: '保存失败', position: 'top' })
  } finally {
    saving.value = false
  }
}

// 页面加载时初始化
onMounted(() => {
  // 强制滚动到页面顶部，避免从列表页面滚动后进入编辑页面时位置偏移
  window.scrollTo(0, 0)
  
  // 判断是编辑还是创建
  const path = route.path
  if (path.includes('/edit/')) {
    // 编辑模式
    isEdit.value = true
    noteId.value = route.params.id as string
    
    // 优先从路由状态中获取数据（避免重复请求）
    const loadedFromState = loadNoteFromRouteState()
    if (!loadedFromState) {
      // 如果没有路由状态数据，才调用接口获取
      loadNoteDetail()
    }
  } else {
    // 创建模式
    isEdit.value = false
    initNewNote()
  }
})

// 页面卸载时清理定时器
onUnmounted(() => {
  if (historyTimer) {
    clearTimeout(historyTimer)
  }
})
</script>

<style scoped>
/* 顶部固定工具栏（位于首页导航栏下方） */
.editor-toolbar {
  top: 48px; /* 首页导航栏高度 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.toolbar-container {
  padding: 8px 16px;
}

.toolbar-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-btn:active {
  background-color: #f5f5f5;
}

.toolbar-btn.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.toolbar-btn.disabled:active {
  background-color: transparent;
}

.toolbar-btn.save-btn {
  margin-left: auto;
  color: #4CAF50;
}

.btn-icon {
  font-size: 22px;
  line-height: 1;
  color: #333;
}

.toolbar-btn.save-btn .btn-icon {
  color: #4CAF50;
  font-size: 26px;
}

.note-title-input {
  background-color: transparent;
}

.note-content-textarea {
  background-color: transparent;
  line-height: 1.6;
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

/* 保存中状态 */
.saving-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #4CAF50;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

/* 禁用状态输入框样式 */
.note-title-input:disabled,
.note-content-textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
