<template>
  <div class="text-editor">
    <!-- CodeMirror 编辑器 -->
    <CodeMirrorEditor
      ref="editorRef"
      v-model="localText"
      :dark-mode="true"
      @change="handleChange"
      @cursorActivity="handleCursorActivity"
    />

    <!-- 统计信息 -->
    <div class="editor-stats">
      <span>字符数: {{ stats.totalChars }}</span>
      <span>行数: {{ stats.lineCount }}</span>
    </div>

    <!-- 操作按钮 -->
    <div class="editor-actions">
      <van-button size="small" @click="handleClear">清空</van-button>
      <van-button size="small" @click="handleLoadExample">加载示例</van-button>
      <van-button size="small" @click="handleCopy">复制</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 文本编辑器组件
 * 基于 CodeMirror 6 的高性能代码编辑器
 */
import { ref, computed, watch } from 'vue'
import { showToast, showSuccessToast } from 'vant'
import CodeMirrorEditor from './CodeMirrorEditor.vue'
import { getTextStatistics } from '@/utils/textProcessor'
import type { TextStatistics } from '@/types/textProcessor'

// Props
interface Props {
  modelValue: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'cursorActivity', selection: any): void
}>()

// 编辑器引用
const editorRef = ref<InstanceType<typeof CodeMirrorEditor> | null>(null)

// 本地文本
const localText = ref(props.modelValue)

// 统计信息
const stats = computed<TextStatistics>(() => {
  return getTextStatistics(localText.value)
})

// 监听外部变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== localText.value) {
      localText.value = newValue
      editorRef.value?.setValue(newValue)
    }
  }
)

// 处理内容变化
const handleChange = (value: string) => {
  emit('update:modelValue', value)
  emit('change', value)
}

// 处理光标位置变化
const handleCursorActivity = (selection: any) => {
  emit('cursorActivity', selection)
}

// 清空文本
const handleClear = () => {
  localText.value = ''
  editorRef.value?.setValue('')
  emit('update:modelValue', '')
  emit('change', '')
  showToast('已清空')
}

// 加载示例
const handleLoadExample = () => {
  const example = `这是一个示例文本。
你可以在这里进行查找、替换、计数等操作。

Hello World! This is a test.
你好，世界！这是一个测试。

12345
67890

测试文本处理功能：
- 查找功能：支持普通文本和正则表达式
- 替换功能：支持单个替换和全部替换
- 计数功能：统计关键字出现次数
- 文本清理：删除空行、多余空格等
- 文本统计：字符数、单词数、行数等`

  localText.value = example
  editorRef.value?.setValue(example)
  emit('update:modelValue', example)
  emit('change', example)
  showSuccessToast('已加载示例')
}

// 复制文本
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(localText.value)
    showSuccessToast('已复制到剪贴板')
  } catch (error) {
    showToast('复制失败')
  }
}

// 获取编辑器实例
const getEditorView = () => {
  return editorRef.value?.getEditorView()
}

// 设置高亮
const setHighlights = (matches: Array<{ from: number; to: number }>) => {
  editorRef.value?.setHighlights(matches)
}

// 清除高亮
const clearHighlights = () => {
  editorRef.value?.clearHighlights()
}

// 暴露方法给父组件
defineExpose({
  getEditorView,
  setHighlights,
  clearHighlights
})
</script>

<style scoped>
.text-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.editor-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #969799;
  padding: 0 4px;
}

.editor-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.editor-actions .van-button {
  flex: 1;
  min-width: 80px;
}
</style>
