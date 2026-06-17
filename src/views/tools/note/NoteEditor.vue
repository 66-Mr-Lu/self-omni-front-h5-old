<template>
  <div class="note-editor-page min-h-screen bg-gray-100">
    <!-- 顶部固定工具栏（滚动时位置不变） -->
    <div class="editor-toolbar fixed top-0 left-0 right-0 z-50">
      <div class="toolbar-container bg-white border-b border-gray-200">
        <div class="toolbar-content">
          <!-- 返回按钮 -->
          <button 
            class="toolbar-btn" 
            @click="handleGoBack"
            title="返回"
          >
            <span class="btn-icon">←</span>
          </button>
          
          <!-- 撤销按钮 -->
          <button 
            class="toolbar-btn" 
            :class="{ disabled: !canUndo }"
            :disabled="!canUndo"
            @click="undo"
            title="撤销"
          >
            <span class="btn-icon">↶</span>
          </button>
          
          <!-- 重做按钮 -->
          <button 
            class="toolbar-btn" 
            :class="{ disabled: !canRedo }"
            :disabled="!canRedo"
            @click="redo"
            title="重做"
          >
            <span class="btn-icon">↷</span>
          </button>
          
          <!-- 保存按钮 -->
          <button 
            class="toolbar-btn save-btn" 
            @click="saveNote"
            title="保存"
          >
            <span class="btn-icon">✓</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content pt-10 pb-6">
      <div class="px-4 py-4">
        <div class="bg-white rounded-xl shadow-sm p-4">
          <!-- 标题输入 -->
          <input 
            v-model="currentNote.title" 
            class="note-title-input w-full px-3 py-2 text-lg font-semibold text-gray-800 border-b border-gray-200 focus:outline-none focus:border-primary mb-3"
            placeholder="输入标题..."
            @input="onContentChange"
          />
          
          <!-- 内容输入 -->
          <textarea 
            v-model="currentNote.content" 
            class="note-content-textarea w-full h-[calc(100vh-200px)] px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none"
            placeholder="输入内容..."
            @input="onContentChange"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getNoteById, createNote, updateNote, type Note, type CreateNoteRequest, type UpdateNoteRequest } from '@/api/note'
import { showToast, showDialog } from 'vant'

// 路由
const router = useRouter()
const route = useRoute()

// 状态
const isEdit = ref(false) // 是否编辑模式
const noteId = ref('') // 笔记ID
const currentNote = ref<{ id: string; title: string; content: string }>({
  id: '',
  title: '',
  content: ''
})

// 撤销/重做历史
const history = ref<{ title: string; content: string }[]>([])
const historyIndex = ref(-1)

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
  // 清除当前位置之后的历史
  history.value = history.value.slice(0, historyIndex.value + 1)
  
  // 添加当前状态到历史
  history.value.push({
    title: currentNote.value.title,
    content: currentNote.value.content
  })
  
  // 限制历史记录数量
  if (history.value.length > 50) {
    history.value.shift()
  } else {
    historyIndex.value++
  }
}

/**
 * 撤销
 */
const undo = () => {
  if (!canUndo.value) return
  
  historyIndex.value--
  const prevState = history.value[historyIndex.value]
  currentNote.value.title = prevState.title
  currentNote.value.content = prevState.content
}

/**
 * 重做
 */
const redo = () => {
  if (!canRedo.value) return
  
  historyIndex.value++
  const nextState = history.value[historyIndex.value]
  currentNote.value.title = nextState.title
  currentNote.value.content = nextState.content
}

/**
 * 内容变更时保存历史
 */
const onContentChange = () => {
  saveHistory()
}

/**
 * 返回处理
 */
const handleGoBack = async () => {
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
    router.back()
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
 * 保存笔记
 */
const saveNote = async () => {
  if (!currentNote.value.title.trim() && !currentNote.value.content.trim()) {
    showToast({ message: '请输入标题或内容', position: 'top' })
    return
  }

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
    // 返回列表
    router.back()
  } catch (error) {
    console.error('保存笔记失败:', error)
    showToast({ message: '保存失败', position: 'top' })
  }
}

// 页面加载时初始化
onMounted(() => {
  
  // 判断是编辑还是创建
  const path = route.path
  if (path.includes('/edit/')) {
    // 编辑模式
    isEdit.value = true
    noteId.value = route.params.id as string
    loadNoteDetail()
  } else {
    // 创建模式
    isEdit.value = false
    initNewNote()
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
</style>
